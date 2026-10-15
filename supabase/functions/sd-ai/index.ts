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
// Full rewrite on Opus; titles, cold open, fixes and fact check on Sonnet. Override with secrets without redeploying.
const MODELS: Record<string, string> = {
  complex: Deno.env.get("SD_MODEL_COMPLEX") || "claude-opus-5-5",
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
function costOf(model: string, inTok: number, outTok: number): number | null {
  let p = PRICES[model];
  if (!p) return null;
  if (model === "claude-haiku-5-5" && inTok > 100000) p = [0.50, 2.50];
  return (inTok * p[0] + outTok * p[1]) / 1e6;
}
const MAX_TOKENS: Record<string, number> = { complex: 8000, default: 2500 };
const SYSTEM =
  "Eres el asistente de Script Desk, una herramienta para revisar guiones de un pódcast cristiano de enseñanza bíblica en YouTube. " +
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

  let body: { prompt?: string; tier?: string };
  try { body = await req.json(); } catch { return json({ code: "bad_request" }, 400); }
  const prompt = String(body.prompt || "");
  if (!prompt || prompt.length > 120000) return json({ code: "bad_request" }, 400);
  const tier = body.tier === "complex" ? "complex" : "default";

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("sd_ai_usage").select("id", { count: "exact", head: true }).eq("user_id", userData.user.id).gte("at", since);
  if ((count || 0) >= DAILY_LIMIT) return json({ code: "daily_limit" }, 429);

  const model = MODELS[tier];
  let r: Response;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: MAX_TOKENS[tier], system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
    });
  } catch {
    return json({ code: "upstream" }, 502);
  }
  const out = await r.json().catch(() => null);
  const usage = out?.usage || {};
  const inTok = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
  const outTok = usage.output_tokens || 0;
  const cost = r.ok ? costOf(model, inTok, outTok) : 0;
  await sb.from("sd_ai_usage").insert({ user_id: userData.user.id, tier, model, input_tokens: inTok || null, output_tokens: outTok || null, ok: r.ok, cost_usd: cost });
  const { data: month } = await sb.rpc("sd_month_cost");
  const bill = { model, model_name: NAMES[model] || model, input_tokens: inTok, output_tokens: outTok, cost_usd: cost, month_cost_usd: month == null ? null : Number(month) };
  if (r.status === 429 || r.status === 529) return json({ code: "rate_limited", usage: bill }, 429);
  if (!r.ok) return json({ code: "upstream", detail: out?.error?.message || r.status, usage: bill }, 502);

  const text = (out?.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  const data = parseJson(text);
  if (!data || typeof data !== "object") return json({ code: "invalid_json", usage: bill }, 422);
  return json({ data, usage: bill });
});
