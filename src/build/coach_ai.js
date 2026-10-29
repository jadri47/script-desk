/* ===== Coach: automatic AI proposals, batched and capped ===== */
// (jadri47, 2026-10-22: "automatic AI, capped"; "one decision at a time" needs a ready answer, not a button to press)
// When the coach shows a review, the next decisions that have no rule-made option (needsAi) get their proposals in ONE call per batch
// of up to 8, with at most one call in flight. Scripture never goes to the model as text: verses become ⟦Vn⟧ tokens
// (coachAiMask / polish_logic) and an option that loses, duplicates or alters one is dropped (vetSection).
// Every option is verified against all the checks when it is shown (verifyProposal), so a result computed before an Apply is
// re-located by its fragment text instead of by position.
Object.assign(T.es, {
  coAiTag: "Sugerencia de IA", coAiPrep: "Preparando una propuesta…",
  coAiPauseMonth: (n) => `Sugerencias automáticas en pausa: se llegó al límite de $${n} del mes`, coAiPauseDay: "Sugerencias automáticas en pausa por hoy",
});
Object.assign(T.en, {
  coAiTag: "AI suggestion", coAiPrep: "Preparing a suggestion…",
  coAiPauseMonth: (n) => `Automatic suggestions paused: this month's $${n} limit was reached`, coAiPauseDay: "Automatic suggestions paused for today",
});

const COACH_AI_MONTH_USD = 5; // (jadri47, 2026-10-21: "$5 per month")
const COACH_AI_BATCH = 8, COACH_AI_ARTIFACT_CALLS = 3;
const COAI = { cache: {}, busy: false, stop: "", calls: 0, noSample: false, epoch: 0 };

// One place that says whether automatic calls may happen. The month cost is only known in the standalone site (sd-ai-cost event /
// sd_month_cost); without it (the Claude artifact) a review gets 3 automatic calls and then the manual button only.
function coachAiBudget() {
  if (COAI.stop) return { ok: false, reason: COAI.stop === "auto_paused" ? "month" : "day" };
  const month = typeof MONTH_COST !== "undefined" ? MONTH_COST : null;
  if (month != null && month >= COACH_AI_MONTH_USD) return { ok: false, reason: "month" };
  if (COAI.noSample) return { ok: false, reason: "nosample" };
  if (month == null && COAI.calls >= COACH_AI_ARTIFACT_CALLS) return { ok: false, reason: "calls" };
  return { ok: true, reason: "" };
}
function coachAiPauseHTML() {
  const b = coachAiBudget();
  if (b.ok || (b.reason !== "month" && b.reason !== "day")) return "";
  return `<p class="hint cc-pause" role="status">${h(b.reason === "month" ? t("coAiPauseMonth")(COACH_AI_MONTH_USD) : t("coAiPauseDay"))}</p>`;
}
const coHash = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return s.length + ":" + x; };

// ---- the request ----
// null when a verse crosses the edge of the fragment: it cannot be protected, so it is not sent (fixItem, coach_logic.js)
function coachAiItem(d, k, spans) { return fixItem(d, "i" + k, state.text, state.opts, spans); }
function coachAiPrompt(items) {
  const blocks = items.map((it) => {
    const c = it.d.card, a = c.ai;
    return `=== ${it.id}
Problema detectado: «${plainLabel(c.id, c.label)}». ${c.info || ""} ${c.fix || ""} ${fxAiExtra(a)}
CONTEXTO (no lo reescribas):
"""
${it.ctx}
"""
FRAGMENTO A REESCRIBIR:
"""
${it.frag}
"""`;
  }).join("\n\n");
  return `Eres editor de guiones para un pódcast cristiano de enseñanza bíblica en YouTube. ${voice()}
Abajo hay ${items.length} fragmento(s) del mismo guion, cada uno con su problema. Para CADA uno escribe hasta 2 opciones distintas que reescriban SOLO ese fragmento para resolver ese problema. Mantén el sentido, la teología y el tono del presentador; no inventes datos, nombres, cifras ni citas; sin frases de plantilla. Las marcas ⟦V1⟧, ⟦V2⟧… son versículos: déjalas tal cual, una vez cada una y en el mismo orden; copia exacto cualquier versículo entre comillas.
Cada fragmento reescrito va en ${scriptLangName()}. ${t("outLang")}
Responde solo con JSON: {"items": [{"id": "i1", "options": [{"text": "...", "why": "una frase"}]}]}

${blocks}`;
}

async function coachAiRun(items, epoch) {
  const ids = items.map((it) => it.d.card.id);
  ids.forEach((id, i) => { COAI.cache[id] = { status: "loading", orig: items[i].orig, lead: items[i].lead || "", trail: items[i].trail || "", field: items[i].field, raw: [], mat: null }; });
  const stop0 = COAI.stop;
  try {
    const sample = await caps.sample;
    if (!sample) { COAI.noSample = true; throw { code: "no_sample" }; }
    const res = await sample.json(coachAiPrompt(items), { modelTier: "default", auto: true });
    const got = res && Array.isArray(res.items) ? res.items : [];
    items.forEach((it) => {
      const e = COAI.cache[it.d.card.id];
      if (!e) return; // Revisar emptied the cache while this batch was in flight (B-022, 2026-10-29): the answer is for text that was re-read; busy is still released below
      const mine = got.find((g) => g && g.id === it.id);
      const raw = [];
      for (const o of ((mine && Array.isArray(mine.options)) ? mine.options : []).slice(0, 2)) {
        if (!o || typeof o.text !== "string") continue;
        const v = vetSection(it.orig, it.toks, o.text, []);
        if (v.ok) raw.push({ text: v.text.trim(), why: String(o.why || "") });
      }
      e.raw = raw; e.status = raw.length ? "done" : "none";
    });
  } catch (err) {
    const code = err && err.code;
    if (code === "daily_limit" || code === "rate_limited" || code === "auto_paused") COAI.stop = code; // for the rest of the session
    items.forEach((it) => { const e = COAI.cache[it.d.card.id]; if (e) e.status = "error"; }); // never retried by itself; absent after a Revisar (B-022)
  }
  COAI.busy = false;
  if (epoch !== COAI.epoch) { coachAiPump(); return; }
  const d0 = COACH.list[0];
  if (document.querySelector(".topfix.coach") && d0 && d0.kind !== "question" && !COACH.write && (ids.includes(d0.card && d0.card.id) || COAI.stop !== stop0)) coachRefresh();
  coachAiPump();
}

// Called after every coach render. A batch goes out when the current decision has no proposal yet, or when 2 or fewer of the
// decisions ahead still have one.
function coachAiPump() {
  if (COAI.busy || !state.result || !COACH.list.length || !document.querySelector(".topfix.coach")) return;
  if (typeof RP !== "undefined" && (RP.busy || (RP.fix && RP.fix.run))) return; // the editor's report is reading the script and answers these problems too; renderGuide pumps again when it lands
  if (!coachAiBudget().ok) return;
  const L = COACH.list, ahead = L.filter((d) => d.needsAi && d.card && d.card.ai);
  const todo = coachAiPick(L, (id) => !!COAI.cache[id], COACH_AI_BATCH);
  if (!todo.length) return;
  const cachedAhead = ahead.filter((d) => COAI.cache[d.card.id]).length;
  if (COAI.cache[ahead[0].card.id] && cachedAhead > 2) return;
  const spans = verseSpans(state.text, state.result);
  const items = [];
  todo.forEach((d) => { const it = coachAiItem(d, items.length + 1, spans); if (it) items.push(it); else COAI.cache[d.card.id] = { status: "none", raw: [], mat: null }; });
  if (!items.length) { coachAiPump(); return; }
  COAI.busy = true; COAI.calls++;
  const epoch = COAI.epoch;
  coachAiRun(items, epoch);
  if (document.querySelector(".topfix.coach") && L[0].card && items.some((it) => it.d === L[0])) coachRefresh(); // shows «Preparando una propuesta…»
}

// The verified options of a decision, for the coach to show. Shape = what applyProposal takes.
function coachAiOptions(d) {
  const e = d.card && COAI.cache[d.card.id];
  if (!e || e.status !== "done") return [];
  const key = coHash(state.text) + "|" + (e.field ? state.opts[e.field] || "" : "");
  if (e.mat && e.mat.key === key) return e.mat.options;
  const out = [];
  let at = -1;
  if (!e.field) { at = locateUnique(state.text, e.orig); if (at < 0) { e.mat = { key, options: [] }; return []; } } // text changed there: stale result ignored
  for (const o of e.raw) {
    const p = e.field ? { kind: "field", field: e.field, value: o.text, label: "IA", why: o.why } : { kind: "patch", patches: [{ start: at, end: at + e.orig.length, rep: e.lead + o.text + e.trail }], label: "IA", why: o.why };
    if (p.kind === "patch" && state.text.slice(at, at + e.orig.length) + "" === p.patches[0].rep) continue;
    p.check = verifyProposal(state.text, state.opts, state.result, p);
    if (p.check.broke.length) continue; // an option that breaks another check is not offered
    out.push(p);
  }
  e.mat = { key, options: out };
  return out;
}
const coachAiLoading = (d) => !!(d.card && COAI.cache[d.card.id] && COAI.cache[d.card.id].status === "loading");

const _coachAfterRenderA = coachAfterRender;
coachAfterRender = function () { _coachAfterRenderA(); coachAiPump(); };
// a new review starts over (the pause for the session stays)
$("runBtn").addEventListener("click", () => { COAI.cache = {}; COAI.calls = 0; COAI.epoch++; }, true);
