// Script Desk AI proxy: the Anthropic key stays on the server; only team members can call it.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const DAILY_LIMIT = Number(Deno.env.get("SD_DAILY_LIMIT") || "60");
const AUTO_MONTH_USD = Number(Deno.env.get("SD_AUTO_MONTH_USD") || "5");
// Sonnet for every AI feature. Override per tier with secrets (SD_MODEL_COMPLEX / SD_MODEL_DEFAULT) without redeploying.
const MODELS: Record<string, string> = {
  complex: Deno.env.get("SD_MODEL_COMPLEX") || "claude-sonnet-5-5",
  default: Deno.env.get("SD_MODEL_DEFAULT") || "claude-sonnet-5-5",
};
// USD per million tokens [input, output] — platform.claude.com/docs/en/about-claude/pricing (Oct 2026).
const PRICES: Record<string, [number, number]> = {
  "claude-haiku-5-5": [0.10, 0.50],
  "claude-sonnet-5-5": [2, 10],
  "claude-opus-5-5": [4, 20],
  "claude-fable-5-1": [10, 50],
};
const NAMES: Record<string, string> = { "claude-haiku-5-5": "Haiku 5.5", "claude-sonnet-5-5": "Sonnet 5.5", "claude-opus-5-5": "Opus 5.5", "claude-fable-5-1": "Fable 5.1" };
// Prompt caching (platform.claude.com/docs/build-with-claude/prompt-caching, Oct 2026): a 5-minute cache write costs 1.25x the
// input price; a cache read costs 0.1x, except Sonnet 5.5 / Opus 5.5 (0.05x) and Fable 5.1 (0.025x).
const CACHE_READ_MULT: Record<string, number> = { "claude-sonnet-5-5": 0.05, "claude-opus-5-5": 0.05, "claude-fable-5-1": 0.025 };
// Minimum cacheable prefix in tokens. Below it the request still works but nothing is cached (both cache counters stay 0).
const MIN_CACHEABLE: Record<string, number> = { "claude-haiku-5-5": 512, "claude-sonnet-5-5": 512, "claude-opus-5-5": 512, "claude-fable-5-1": 512 };
// inTok = ALL input tokens (uncached + cache writes + cache reads); the two cache numbers are subsets of it.
function costOf(model: string, inTok: number, outTok: number, cacheWrite = 0, cacheRead = 0): number | null {
  let p = PRICES[model];
  if (!p) return null;
  if (model === "claude-haiku-5-5" && inTok > 100000) p = [0.50, 2.50];
  const plain = Math.max(0, inTok - cacheWrite - cacheRead);
  const readMult = CACHE_READ_MULT[model] ?? 0.1;
  return (plain * p[0] + cacheWrite * p[0] * 1.25 + cacheRead * p[0] * readMult + outTok * p[1]) / 1e6;
}
// Bible versions the app offers (same ids as the client's BIBLE table).
const BIBLE_NAMES: Record<string, string> = {
  RVR1960: "Reina-Valera 1960", NVI: "Nueva Versión Internacional", LBLA: "La Biblia de las Américas", NBLA: "Nueva Biblia de las Américas",
  NTV: "Nueva Traducción Viviente", DHH: "Dios Habla Hoy", RVC: "Reina Valera Contemporánea",
  KJV: "King James Version", NKJV: "New King James Version", NASB: "New American Standard Bible", ESV: "English Standard Version",
  NIV: "New International Version", NLT: "New Living Translation",
};
function bibleRule(v: string): string {
  return `VERSIÓN BÍBLICA: si en tu respuesta citas, añades o traduces un versículo, usa el texto de la ${v} (${BIBLE_NAMES[v]}) palabra por palabra, con su referencia. ` +
    "No cambies las citas que el autor ya tiene en el guion salvo que te lo pida. " +
    "Si no estás seguro del texto exacto en esa versión, escribe solo la referencia entre corchetes, por ejemplo [Mateo 6:34], para que el autor copie el versículo.";
}
const MAX_TOKENS: Record<string, number> = { complex: 8000, default: 2500 };
const SYSTEM =
  "Eres el asistente de Script Desk, una herramienta para revisar guiones de un pódcast cristiano de enseñanza bíblica en YouTube. " +
  "Quien escribe es un pastor que predica con regularidad y conoce bien la Biblia: no le enseñes teología ni evalúes su doctrina. " +
  "Tu trabajo es ajustar la forma para que el mensaje funcione en video: conserva su mensaje, sus argumentos, sus ilustraciones y sus citas palabra por palabra, y no añadas enseñanza nueva. " +
  "Responde únicamente con un objeto JSON válido que siga exactamente la forma pedida en el mensaje. " +
  "Sin texto antes ni después, sin bloques de código y sin comentarios.";

function parseJson(text: string): unknown {
  let t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch { /* fall through */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { /* fall through */ } }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ code: "bad_request" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) return json({ code: "not_granted" }, 401);
  const { data: member } = await sb.rpc("sd_is_member");
  if (member !== true) return json({ code: "not_member" }, 403);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ code: "no_key" }, 503);

  let body: { prompt?: string; tier?: string; bible?: string; noBible?: boolean; auto?: boolean };
  try { body = await req.json(); } catch { return json({ code: "bad_request" }, 400); }
  const prompt = String(body.prompt || "");
  if (!prompt || prompt.length > 120000) return json({ code: "bad_request" }, 400);
  const tier = body.tier === "complex" ? "complex" : "default";

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("sd_ai_usage").select("id", { count: "exact", head: true }).eq("user_id", userData.user.id).gte("at", since);
  if ((count || 0) >= DAILY_LIMIT) return json({ code: "daily_limit" }, 429);
  // Automatic suggestions (the coach) stop at the month's budget, without calling Anthropic; manual requests are unaffected.
  // (jadri47, 2026-10-21: "$5 per month"). If the month's cost can't be read, auto goes ahead: the client caps it per review.
  if (body.auto === true) {
    const { data: spent } = await sb.rpc("sd_month_cost");
    if (spent != null && Number(spent) >= AUTO_MONTH_USD) return json({ code: "auto_paused", usage: { month_cost_usd: Number(spent) } }, 429);
  }

  const model = MODELS[tier];
  // One static system block (house rules + the chosen Bible version), cached. Everything that changes per request — the task
  // instructions and, last, the script text — goes in the user message after the cached prefix.
  const bible = !body.noBible && body.bible && Object.prototype.hasOwnProperty.call(BIBLE_NAMES, body.bible) ? body.bible : "";
  const systemText = bible ? SYSTEM + "\n\n" + bibleRule(bible) : SYSTEM;
  const system = [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }];
  // ~3.4 characters per token for Spanish is a rough floor, not a count; the real check is cache_creation/cache_read in sd_ai_usage.
  const estTokens = Math.round(systemText.length / 3.4);
  const minCache = MIN_CACHEABLE[model] ?? 1024;
  if (estTokens < minCache) console.warn(`sd-ai: cached system block ~${estTokens} tokens is below the ${minCache}-token minimum for ${model}; caching is skipped`);
  let r: Response;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: MAX_TOKENS[tier], system, messages: [{ role: "user", content: prompt }] }),
    });
  } catch {
    return json({ code: "upstream" }, 502);
  }
  const out = await r.json().catch(() => null);
  const usage = out?.usage || {};
  const cacheWrite = usage.cache_creation_input_tokens || 0, cacheRead = usage.cache_read_input_tokens || 0;
  const inTok = (usage.input_tokens || 0) + cacheWrite + cacheRead; // total input; the cache numbers are included in it
  const outTok = usage.output_tokens || 0;
  const cost = r.ok ? costOf(model, inTok, outTok, cacheWrite, cacheRead) : 0;
  await sb.from("sd_ai_usage").insert({ user_id: userData.user.id, tier, model, input_tokens: inTok || null, output_tokens: outTok || null, cache_creation_input_tokens: r.ok ? cacheWrite : null, cache_read_input_tokens: r.ok ? cacheRead : null, ok: r.ok, cost_usd: cost });
  const { data: month } = await sb.rpc("sd_month_cost");
  const bill = { model, model_name: NAMES[model] || model, input_tokens: inTok, output_tokens: outTok, cache_creation_input_tokens: cacheWrite, cache_read_input_tokens: cacheRead, cost_usd: cost, month_cost_usd: month == null ? null : Number(month) };
  if (r.status === 429 || r.status === 529) return json({ code: "rate_limited", usage: bill }, 429);
  if (!r.ok) return json({ code: "upstream", detail: out?.error?.message || r.status, usage: bill }, 502);

  const text = (out?.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  const data = parseJson(text);
  if (!data || typeof data !== "object") return json({ code: "invalid_json", usage: bill }, 422);
  return json({ data, usage: bill });
});
