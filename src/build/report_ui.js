/* ===== Editor's report: step 2 shows one AI read of the whole script, then one change at a time ===== */
// (jadri47, 2026-10-22: "improve his messages from a 90 level for a YouTube video to a 95-100") The pure part is report_logic.js
// (prompt, vetting, readiness). This file asks for the report once per script version, keeps it with the episode (G.report), and walks
// the person through the rule-based ad risks first and then the report's changes. Today's coach / walker / rail / legend / «Más
// revisiones» / Ask Claude live behind «Más detalles» and are only built (so only painted) while that is open.
Object.assign(T.es, {
  rpPartial: "La respuesta se cortó: el informe puede estar incompleto",
  rpWhere: "Dónde está", rpFull: "Ver guion completo", rpFocusBack: "Ver solo este párrafo",
  rpTitle: "Informe del editor", rpName: "Preparado para YouTube", rpRulesName: "Anuncios y empaque",
  rpReady: (a) => `Preparado para YouTube: ${a}`, rpReadyTo: (a, b) => `Preparado para YouTube: ${a} → ${b} si aceptas lo propuesto`, rpRulesLbl: (r) => `Anuncios y empaque: ${r}/40`,
  rpRulesPartial: "Anuncios y empaque · informe incompleto", rpRulesPartialLbl: (r) => `Anuncios y empaque: ${r}/40 · informe incompleto, sin nota sobre 100 hasta medir de nuevo`,
  rpAsOf: (tm) => `según el informe de las ${tm}`, rpRe: "Volver a evaluar", rpFixLost: (n) => `No llegaron ${n} arreglos`, rpReading: "La IA está leyendo tu guion como lo haría un editor",
  rpNoAnswer: "Aún no ha respondido.", rpSoFar: "Lleva", rpWaiting: "esperando…",
  rpNoAI: "El informe del editor necesita la IA. Mientras tanto ves los avisos de anuncios y de empaque.",
  rpArea: { hook: "Gancho", promise: "Promesa", retention: "Retención", voice: "Voz hablada", close: "Cierre", return: "Que vuelvan", ads: "Anuncios" },
  rpAdsOk: "✓ sin riesgo", rpOf5: (n) => `${n} de 5`, rpNoRate: "sin valorar", rpChange: (i, n) => `Cambio ${i} de ${n}`, rpWhy: "Por qué",
  rpMore: "Más detalles", rpMoreHint: "(revisión línea por línea, muletillas, colores, por párrafos)", rpAfterRec: "Después de grabar",
  rpGone: "Este fragmento cambió después del informe, así que no se puede aplicar. Sáltalo o vuelve a evaluar.", rpWriteHere: "Escribe cómo debe quedar",
  rpHeadRisk: "Aviso rojo", rpHeadSoft: "Aviso amarillo", rpListLbl: "Áreas del informe", rpDecLbl: "Decisión actual",
  rpPickLbl: "Elige cómo decirlo", rpPickMain: "Propuesta del editor", rpPickAlt: "Otra opción", rpApplyPick: "Aplicar la elegida",
  rpWordsLbl: "Elige otra palabra", rpWordSafe: "✓ sin riesgo de anuncios", rpWordLbl: "Palabras del informe", rpTimes: (n) => `${n} veces`,
  rpWordsRest: "Las demás palabras de este aviso no tienen alternativa: cámbialas con «Lo escribo yo».",
  rpWordsKept: (n) => `No se cambia${n > 1 ? ` en ${n} lugares` : " en 1 lugar"}: la frase dice lo que dice la Biblia.`,
  // the report lives in the score bubble (2026-10-26, plan "Walk Juan through it", step 2)
  rpBy: "según el editor", rpBefore: (a) => `antes ${a}`, rpPossible: (b) => `→ ${b} posible`,
  rpColArea: "Área", rpColOrig: "Original", rpColNow: "Ahora", rpColChange: "Cambio", rpColSaid: "Qué dijo el editor", rpSame: "sin cambio",
  rpRe2: "Medir de nuevo con la IA", rpBubNote: "«Ahora» suma lo que el editor dijo que vale cada cambio aceptado. «Medir de nuevo» lee otra vez el guion.",
  // the walk: one card at a time (2026-10-26, plan "Walk Juan through it", step 3)
  rpGainTo: (n) => `+${n} a la nota`, rpApplyGo: "Aplicar y seguir →", rpDetail: "Revisión detallada",
  rpChipUp: (n, a) => `+${n} · ${a}`, rpChipDone: (a) => `✓ ${a}`, rpChipAria: (n, a, x, y) => `+${n} puntos · ${a}: de ${x == null ? "sin valorar" : x + " de 5"} a ${y == null ? "sin valorar" : y + " de 5"}`,
  rpEndStep: "Paso 2 de 3 · Mejorar", rpEndH: "Terminaste los cambios", rpEndNoneH: "Revisaste los cambios, sin aplicar ninguno", rpEndNow: (a) => `Nota ahora: ${a}`,
  rpEndCount: (a, s) => `${a} ${a === 1 ? "aplicado" : "aplicados"} · ${s} ${s === 1 ? "saltado" : "saltados"}`, rpEndList: "Cambios aplicados", rpEndPub: "Ir a Publicar →",
});
Object.assign(T.en, {
  rpPartial: "The answer was cut: the report may be incomplete",
  rpWhere: "Where it is", rpFull: "Show the full script", rpFocusBack: "Show only this paragraph",
  rpTitle: "Editor's report", rpName: "YouTube-ready", rpRulesName: "Ads and packaging",
  rpReady: (a) => `YouTube-ready: ${a}`, rpReadyTo: (a, b) => `YouTube-ready: ${a} → ${b} if you accept the suggestions`, rpRulesLbl: (r) => `Ads and packaging: ${r}/40`,
  rpRulesPartial: "Ads and packaging · incomplete report", rpRulesPartialLbl: (r) => `Ads and packaging: ${r}/40 · incomplete report, no score out of 100 until you measure again`,
  rpAsOf: (tm) => `as of the ${tm} report`, rpRe: "Re-evaluate", rpFixLost: (n) => `${n} fixes did not arrive`, rpReading: "The AI is reading your script the way an editor would",
  rpNoAnswer: "No answer yet.", rpSoFar: "So far", rpWaiting: "waiting…",
  rpNoAI: "The editor's report needs the AI. Meanwhile you see the ad and packaging warnings.",
  rpArea: { hook: "Hook", promise: "Promise", retention: "Retention", voice: "Spoken voice", close: "Close", return: "Return viewers", ads: "Ads" },
  rpAdsOk: "✓ no risk", rpOf5: (n) => `${n} of 5`, rpNoRate: "not rated", rpChange: (i, n) => `Change ${i} of ${n}`, rpWhy: "Why",
  rpMore: "More details", rpMoreHint: "(line-by-line review, fillers, colours, by paragraph)", rpAfterRec: "After recording",
  rpGone: "This passage changed after the report, so it can't be applied. Skip it or re-evaluate.", rpWriteHere: "Write how it should read",
  rpHeadRisk: "Red warning", rpHeadSoft: "Yellow warning", rpListLbl: "Report areas", rpDecLbl: "Current decision",
  rpPickLbl: "Choose how to say it", rpPickMain: "Editor's suggestion", rpPickAlt: "Another option", rpApplyPick: "Apply the one chosen",
  rpWordsLbl: "Choose another word", rpWordSafe: "✓ no ad risk", rpWordLbl: "Words from the report", rpTimes: (n) => `${n} times`,
  rpWordsRest: "The other words in this warning have no alternative: change them with \"I'll write it\".",
  rpWordsKept: (n) => `Left as written in ${n} ${n > 1 ? "places" : "place"}: the sentence reports what the Bible says.`,
  rpBy: "per the editor", rpBefore: (a) => `before ${a}`, rpPossible: (b) => `→ ${b} possible`,
  rpColArea: "Area", rpColOrig: "Original", rpColNow: "Now", rpColChange: "Change", rpColSaid: "What the editor said", rpSame: "no change",
  rpRe2: "Measure again with the AI", rpBubNote: "\"Now\" adds what the editor said each accepted change is worth. \"Measure again\" reads the script once more.",
  rpGainTo: (n) => `+${n} to your score`, rpApplyGo: "Apply and continue →", rpDetail: "Detailed review",
  rpChipUp: (n, a) => `+${n} · ${a}`, rpChipDone: (a) => `✓ ${a}`, rpChipAria: (n, a, x, y) => `+${n} points · ${a}: from ${x == null ? "not rated" : x + " of 5"} to ${y == null ? "not rated" : y + " of 5"}`,
  rpEndStep: "Step 2 of 3 · Improve", rpEndH: "You finished the changes", rpEndNoneH: "You reviewed the changes and applied none", rpEndNow: (a) => `Score now: ${a}`,
  rpEndCount: (a, s) => `${a} applied · ${s} skipped`, rpEndList: "Changes applied", rpEndPub: "Go to Publish →",
});
if (typeof HELP !== "undefined") { HELP.es.rpReport = RP_INFO.es; HELP.en.rpReport = RP_INFO.en; }

// more: «Más detalles» open. sd-more-open=1 opens it on load (suites that drive the walker / coach set it; Juan never does).
const RP = { busy: false, err: "", noAI: false, failed: false, skip: new Set(), hist: [], write: null, more: lsGet("sd-more-open") === "1", shown: "", delay: 0, applying: null, epoch: 0, tm: 0, calls: 0, risk: [], riskKey: "", riskR: null, pick: {}, wpick: {}, refocus: "", seen: new Map(), chipTm: 0, full: false, fix: null };
const rpKey = () => coHash(($("script").value || "") + "|" + (($("keyword") || {}).value || "") + "|" + (($("title") || {}).value || ""));
const rpMoreOpen = () => RP.more;
function rpReset() { RP.epoch++; RP.busy = false; RP.err = ""; RP.noAI = false; RP.failed = false; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; RP.riskKey = ""; RP.pick = {}; RP.wpick = {}; RP.seen = new Map(); RP.fix = null; }

// A stored report is untrusted (old versions, other devices): keep only what has the right shape.
function rpClean(r) {
  if (!r || typeof r !== "object" || !r.areas || typeof r.areas !== "object" || !Array.isArray(r.items)) return null;
  const areas = {};
  for (const k of REPORT_AREAS) { const a = r.areas[k]; areas[k] = { rating: reportRating(a && a.rating), why: String((a && a.why) || "").slice(0, 300) }; }
  const items = r.items.filter((x) => x && REPORT_AREAS.includes(x.area) && typeof x.original === "string" && x.original && typeof x.replacement === "string" && x.replacement)
    .slice(0, REPORT_MAX_ITEMS).map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, alts: rpStrs(x.alts, REPORT_MAX_ALTS), why: String(x.why || "").slice(0, 300), after: reportRating(x.after) }));
  const words = {};
  if (r.words && typeof r.words === "object" && !Array.isArray(r.words)) for (const [k, v] of Object.entries(r.words)) { const a = rpStrs(v, REPORT_MAX_WORD_ALTS); if (k && a.length) words[k.toLowerCase()] = a; }
  // a field fix keeps an EMPTY orig: a title not written yet is the very case it answers (B-006, 2026-10-29); script-text fixes need their text
  const fixes = (Array.isArray(r.fixes) ? r.fixes : []).filter((f) => f && typeof f.id === "string" && f.id && typeof f.orig === "string" && (f.orig || (typeof f.field === "string" && f.field)) && Array.isArray(f.options)).slice(0, REPORT_MAX_FIXES)
    .map((f) => ({ id: f.id, orig: f.orig, lead: typeof f.lead === "string" ? f.lead : "", trail: typeof f.trail === "string" ? f.trail : "", field: typeof f.field === "string" && f.field ? f.field : null,
      options: f.options.filter((o) => o && typeof o.text === "string" && o.text.trim()).slice(0, REPORT_MAX_FIX_OPTS).map((o) => ({ text: o.text.trim(), why: String(o.why || "").slice(0, 300) })) }))
    .filter((f) => f.options.length);
  const baseline = cleanBaseline(r.baseline); // ratings of the first measurement; old reports have none
  const before = cleanBefore(r.before), costUsd = cleanCost(r.costUsd); // old reports have neither
  return { at: typeof r.at === "string" ? r.at : "", key: String(r.key || ""), areas, items, words, fixes, dropped: Number(r.dropped) || 0, ...(baseline ? { baseline } : {}), ...(before != null ? { before } : {}), ...(costUsd != null ? { costUsd } : {}), ...(r.partial === true ? { partial: true } : {}) };
}
// The report's answers for the problems with no rule-made fix wait in the coach's cache (COAI), where «Proponer con IA» and the coach
// already look first: no second read of the script. coachAiOptions re-locates each one by its fragment text, so an answer for text
// that has changed since is ignored there, and a field (title, thumbnail…) is only primed while it still holds what was rated.
function rpPrimeFixes() {
  if (typeof COAI === "undefined" || !G.report || !G.report.fixes) return;
  for (const f of G.report.fixes) {
    if (COAI.cache[f.id] && COAI.cache[f.id].status === "done") continue;
    if (f.field && (state.opts ? state.opts[f.field] || "" : ($(f.field) || {}).value || "") !== f.orig) continue;
    COAI.cache[f.id] = { status: "done", orig: f.orig, lead: f.lead, trail: f.trail, field: f.field || undefined, raw: f.options.map((o) => ({ text: o.text, why: o.why })), mat: null, fromReport: true };
  }
}
function rpStrs(a, max) { return Array.isArray(a) ? a.filter((x) => typeof x === "string" && x.trim()).slice(0, max) : []; }
const _applyProdR = applyProd;
applyProd = function (id, d) { _applyProdR(id, d); G.report = rpClean(d && d.report); rpReset(); rpPrimeFixes(); };
const _prodBodyR = prodBody;
prodBody = function (now) { return { ..._prodBodyR(now), report: G.report || null }; };
const _doClearScriptR = doClearScript;
doClearScript = function () { _doClearScriptR(); G.report = null; rpReset(); };
// Changes made from this panel keep the report "fresh": the text moved because of the report, not behind its back.
const _updateLiveR = updateLive;
updateLive = function () { _updateLiveR(); if (RP.applying && G.report && G.report.key === RP.applying) G.report.key = rpKey(); };

// ---- the one AI call ----
async function rpRun(force) {
  if (RP.busy) return;
  const epoch = RP.epoch;
  RP.busy = true; RP.err = ""; RP.cost = null; if (force) RP.failed = false;
  let out = null, sent = [], text, R, opts, key;
  // one recipe for a whole answer and for the repaired part of a cut one; null when there is not a single rating (not a report)
  const build = (res, partial) => {
    if (!res || typeof res !== "object") { if (partial) return null; throw { code: "invalid_json" }; }
    const v = vetReport(text, res, opts, R);
    if (!REPORT_AREAS.some((k) => v.areas[k].rating != null)) { if (partial) return null; throw { code: "invalid_json" }; } // an answer without a single rating is not a report
    return { at: new Date().toISOString(), key, areas: v.areas, items: v.items.map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, alts: x.alts, why: x.why, after: x.after })), words: v.words, dropped: v.dropped, fixes: [], ...(partial ? { partial: true } : {}) }; // fixes: filled batch by batch by rpFixPump
  };
  try {
    const sample = await caps.sample;
    if (!sample) { RP.noAI = true; return; }
    text = state.text; R = state.result; opts = state.opts; key = rpKey();
    RP.calls++;
    // The problems «Proponer con IA» and the coach would ask one at a time: every decision whose card has the button, those with no
    // rule-made fix first, in the coach's order, at most REPORT_MAX_FIXES. They are NOT in this call: rpFixPump asks for them in small
    // batches once the report has landed. (Adrian, 2026-10-29: "B: fixes leave the report call"; the one answer overran the output cap.)
    const spans = verseSpans(text, R);
    const cand = buildDecisions(text, R, opts, state.fixDismissed).filter((d) => d.card && d.card.ai && d.kind !== "question" && d.kind !== "note");
    cand.sort((a, b) => (b.needsAi ? 1 : 0) - (a.needsAi ? 1 : 0));
    for (const d of cand) {
      if (sent.length >= REPORT_MAX_FIXES) break;
      const it = fixItem(d, "f" + (sent.length + 1), text, opts, spans);
      if (it) sent.push(it);
    }
    const res = await sample.json(reportPrompt(text, R, { keyword: $("keyword").value }), { modelTier: "complex", aiLabel: t("aiLblReport"), aiRetry: () => rpAct("re") }); // not auto: the $5 automatic pause must not block the core feature
    out = build(res);
  } catch (e) {
    if (e && (e.code === "daily_limit" || e.code === "not_member")) RP.noAI = true;
    else if (e && e.code === "truncated" && typeof e.raw === "string" && (out = build(repairJson(e.raw), true))) { /* cut answer: kept what arrived (Adrian, 2026-10-29: "never lose the work") */ }
    else { RP.err = errText(e); RP.failed = true; }
  } finally {
    if (epoch === RP.epoch) {
      RP.busy = false;
      if (out && !state.result) out = null; // the review was reset while the answer was in flight (a demo start, «Borrar todo»): nothing to attach it to (B-039)
      if (out) {
        // what the pill shows the moment the report lands is the «antes» of every «antes → ahora» (bubble, end card, Todo listo)
        const b = cleanBefore(readinessOf(state.result, out, state.fixDismissed, state.text).score), c = cleanCost(RP.cost);
        if (b != null) out.before = b;
        if (c != null) out.costUsd = c;
        G.report = withBaseline(out, G.report); RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; RP.pick = {}; RP.wpick = {}; RP.seen = new Map(); rpPrimeFixes(); if (G.prodId) markDirty(); if (sent.length) rpFixPump(sent, epoch); }
      if (out && typeof scApply === "function" && SC.R) scApply(); // the pill and the verdict switch to the full readiness
      if (V.guided && V.step === 2) renderGuide();
    }
  }
}
// ---- the problems «Proponer con IA» and the coach would ask one at a time, in small calls after the report ----
// (Adrian, 2026-10-29: "B: fixes leave the report call") REPORT_FIX_BATCH fragments per call, one call in flight, each batch kept (and
// saved with the episode) as it arrives. A batch that fails is recorded in RP.fix.err and the next one still goes; rpFixRetry re-asks it.
// RP.busy stays false the whole time: the verdict waits only for the report itself. A result for an older report (epoch) is dropped.
const rpFixReq = (it) => { const c = it.d.card; return { id: it.id, problem: `«${plainLabel(c.id, c.label)}». ${c.info || ""} ${c.fix || ""} ${fxAiExtra(c.ai)}`.replace(/\s+/g, " ").trim(), frag: it.frag, ctx: it.ctx }; };
async function rpFixPump(sent, epoch) {
  const F = RP.fix = { total: sent.length, done: 0, err: {}, items: sent, run: true };
  for (let n = 0; n * REPORT_FIX_BATCH < sent.length; n++) {
    if (epoch !== RP.epoch) return;
    await rpFixBatch(n, epoch);
  }
  if (epoch === RP.epoch) { F.run = false; rpFixShow(); }
}
async function rpFixBatch(n, epoch) {
  const F = RP.fix, items = F.items.slice(n * REPORT_FIX_BATCH, (n + 1) * REPORT_FIX_BATCH);
  try {
    const sample = await caps.sample;
    if (!sample) throw { code: "no_sample" };
    let res;
    try { res = await sample.json(fixesPrompt(items.map(rpFixReq), { en: state.result && state.result.lang === "en" }), { modelTier: "complex", aiLabel: t("aiLblFixes")(F.done, F.total) }); } // not auto: the $5 automatic pause must not block it
    catch (e) {
      // A half batch is still paid work (Adrian, 2026-10-29: "never lose the work"): keep the options that arrived complete; only a batch with nothing is an error.
      if (!(e && e.code === "truncated" && typeof e.raw === "string")) throw e;
      res = repairJson(e.raw, 4);
      if (!res || !Object.keys(vetFixes(res, items)).length) throw e;
    }
    if (epoch !== RP.epoch || !G.report) return;
    const fx = vetFixes(res, items);
    for (const it of items) {
      if (!fx[it.id]) continue;
      const id = it.d.card.id;
      if (typeof COAI !== "undefined" && COAI.cache[id] && COAI.cache[id].status !== "loading") delete COAI.cache[id];
      G.report.fixes.push({ id, orig: it.orig, lead: it.lead || "", trail: it.trail || "", field: it.field || null, options: fx[it.id] });
    }
    F.done += items.length; delete F.err[n + 1];
    rpPrimeFixes(); if (G.prodId) markDirty();
  } catch (e) {
    if (epoch !== RP.epoch) return;
    F.err[n + 1] = errText(e);
  }
  rpFixShow();
}
async function rpFixRetry(no) {
  const F = RP.fix, epoch = RP.epoch;
  if (!F || F.run || !F.err[no]) return;
  F.run = true; rpFixShow();
  await rpFixBatch(no - 1, epoch);
  if (epoch === RP.epoch) { F.run = false; rpFixShow(); }
}
// the cards and the coach read the new answers; nothing else is redrawn while a card is open
function rpFixShow() { if (V.guided && V.step === 2 && !RP.write) renderGuide(); }
// The server's bill for the call in flight (standalone site only; standalone_boot.js sends it before the answer returns).
// The coach waits while the report runs (coachAiPump), so a bill that arrives while RP.busy is the report's.
window.addEventListener("sd-ai-cost", (e) => { const u = e && e.detail; if (RP.busy && u && u.cost_usd != null) RP.cost = Number(u.cost_usd); });
// Called before step 2 is drawn: starts the single call for this script version when there is no report yet.
function rpPrepare() {
  if (!hasScript() || !ensureReview()) return;
  if (G.report || RP.busy || RP.failed || RP.noAI) return;
  rpRun(false);
}

// ---- what is left to decide ----
function rpRiskList() {
  const key = state.text + "|" + [...state.fixDismissed].sort().join(",");
  if (RP.riskKey !== key || RP.riskR !== state.result || RP.riskRep !== G.report) {
    const all = buildDecisions(state.text, state.result, state.opts, state.fixDismissed);
    // A yellow ad warning («puede limitar anuncios») joins the red ones only when the report has other words for its terms: the
    // decision is then one tap, not homework. (jadri47, 2026-10-25: "alternatives to problematic words"; in the demos only hate
    // speech is red, so word choices would otherwise never show.)
    const soft = G.report ? all.filter((d) => d.kind !== "risk" && d.card && /^pf-/.test(d.card.id) && d.card.level === "amarillo"
      && reportWordRows(state.text, state.result, d.card.id.slice(3), G.report.words, {}).rows.length).map((d) => ({ ...d, kind: "risk", soft: true })) : [];
    RP.risk = all.filter((d) => d.kind === "risk").concat(soft);
    RP.riskKey = key; RP.riskR = state.result; RP.riskRep = G.report;
  }
  return RP.risk;
}
// One entry per report item: applied (in the decision log), skipped, pending (its original text is found exactly once), or lost.
function rpStates() {
  const rep = G.report;
  if (!rep) return [];
  const text = state.text, done = new Set((state.fixLog || []).filter((x) => x.kind === "done").map((x) => x.id));
  return rep.items.map((it, i) => {
    if (done.has("rp-" + i)) return { i, st: "applied" };
    if (RP.skip.has(i)) return { i, st: "skipped" };
    const st = itemState(text, it); // text-derived part lives in report_logic.js (replacement or an alternative counts as applied)
    if (st === "pending") { const a = text.indexOf(it.original); return { i, st, start: a, end: a + it.original.length }; }
    return { i, st }; // "applied" here also covers an earlier apply whose log was reset since
  });
}
function rpCurrent() {
  if (RP.busy) return null;
  const d = rpRiskList()[0];
  if (d) return { type: "risk", id: "risk:" + d.id, d, start: d.at ? d.at.start : null, end: d.at ? d.at.end : null };
  const s = rpStates().find((x) => x.st === "pending" || x.st === "lost");
  if (!s) return null;
  const it = G.report.items[s.i];
  return { type: "item", id: "item:" + s.i, i: s.i, it, st: s.st, start: s.start, end: s.end };
}
// the text an item would put in: the editor's suggestion (0) or one of its alternatives
const rpChosen = (cur) => { const all = [cur.it.replacement, ...(cur.it.alts || [])]; return all[Math.min(RP.pick[cur.id] || 0, all.length - 1)]; };
// an ad-risk card (red, or yellow with words) whose terms the report can replace: { rows, patches, rest } (rest = hits of that kind left without a word)
function rpWords(cur) {
  const c = cur.d.card;
  if (!G.report || !c || !/^pf-/.test(c.id)) return null;
  const cat = c.id.slice(3), w = reportWordRows(state.text, state.result, cat, G.report.words, RP.wpick);
  if (!w.rows.length) return null;
  const verse = verseSpans(state.text, state.result).filter((s) => s.kind !== "ref");
  const all = (state.result.riskHits || []).filter((x) => x.cat === cat && !verse.some((s) => x.start < s.end && x.end > s.start)).length;
  return { ...w, rest: Math.max(0, all - w.patches.length - (w.kept || 0)) };
}
const rpCardOf = (cur) => cur.type === "risk" ? cur.d.card : { id: "rp-" + cur.i, ids: ["rp-" + cur.i], label: t("rpArea")[cur.it.area], fix: cur.it.why };

// ---- the walk: position, points, chip ----
// Position among ALL cards of this walk. Risk cards leave the list once applied or skipped, so the ones seen are remembered (RP.seen);
// the items are always all there (applied / skipped / pending / lost). After a reload the seen ones are gone, so the count restarts
// from what is still open (RP.skip is not stored either: skipped items come back as pending).
function rpWalk(cur) {
  const risk = rpRiskList();
  for (const d of risk) if (!RP.seen.has(d.id)) RP.seen.set(d.id, { ids: [d.id, ...(d.ids || []), d.card && d.card.id].filter(Boolean), label: d.card ? plainLabel(d.card.id, d.card.label) : d.id });
  const open = new Set(risk.map((d) => d.id)), gone = [...RP.seen.keys()].filter((k) => !open.has(k)).length;
  const items = G.report ? G.report.items.length : 0, done = rpStates().filter((s) => s.st === "applied" || s.st === "skipped").length;
  return { i: gone + (cur.type === "risk" ? 1 : cur.i + 1), n: gone + risk.length + items }; // an item's place is its place in the report, so Undo / Previous never renumber it
}
const rpPts = (rd) => (rd.score == null ? rd.rules : rd.score);
// The number the pill shows right now (readinessOf with the text), or null without a whole report: the decision log stores this one
// before and after each applied change, so the log and the pill never disagree (jadri47, 2026-10-29, B-003 pick A).
function rpNowScore() { return state.result && typeof state.text === "string" ? readinessOf(state.result, G.report, state.fixDismissed, state.text).score : null; }
// The points one card's patch moves the pill by (same recipe as the pill: readinessOf with the text), plus the area's rating before/after.
// Items go through itemGain (report_logic.js); a risk card compares the readiness of the changed text with now. 0 = show nothing.
const RPG = { text: null, rep: null, sig: "", m: new Map() };
// The figures also depend on the packaging fields and on what the person ignored (B-027, 2026-10-29): a title change or a restored
// risk card must refresh the caches, not only a text or report change.
const rpSig = () => { const o = state.opts || {}; return JSON.stringify([o.title, o.keyword, o.thumb, o.description, o.nextEp, o.bigIdea, o.coldOpen, o.series, [...(state.fixDismissed || [])].sort()]); };
function rpInfo(cur, p) {
  const out = { gain: 0 };
  if (!cur || !p || p.kind !== "patch" || !p.patches || !p.patches.length || !state.result) return out;
  const text = state.text, rep = G.report, sig = rpSig();
  if (RPG.text !== text || RPG.rep !== rep || RPG.sig !== sig) { RPG.text = text; RPG.rep = rep; RPG.sig = sig; RPG.m = new Map(); }
  const key = cur.id + "|" + JSON.stringify(p.patches);
  if (RPG.m.has(key)) return RPG.m.get(key);
  let t2;
  try { t2 = applyPatches(text, p.patches); } catch (e) { return out; } // a patch that no longer fits: no figure, apply itself refuses
  if (cur.type === "item") {
    if (cur.st !== "lost" && rep) {
      out.gain = itemGain(text, state.result, state.opts, rep, cur.i, p.patches[0].rep, state.fixDismissed);
      out.area = cur.it.area; out.from = effectiveReport(text, rep).areas[cur.it.area].rating; out.to = effectiveReport(t2, rep).areas[cur.it.area].rating;
    }
  } else {
    out.gain = rpPts(readinessOf(analyze(t2, state.opts), rep, state.fixDismissed, t2)) - rpPts(readinessOf(state.result, rep, state.fixDismissed, text));
    out.label = plainLabel(cur.d.card.id, cur.d.card.label);
  }
  RPG.m.set(key, out);
  return out;
}
// The little chip under the pill after Apply: «+3 · Gancho ●●●○○ → ●●●●●» for ~3 s; the pill itself tweens through scApply / scTween.
function rpChip(info, cur) {
  let el = $("rpChip");
  const fresh = !el;
  if (!el) { el = document.createElement("div"); el.id = "rpChip"; el.className = "rp-toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  const A = t("rpArea"), name = cur.type === "item" ? A[cur.it.area] : info.label, up = info.gain > 0;
  const dots = cur.type === "item" && up ? ` <span aria-hidden="true" class="rp-dots">${rpDots(info.from)} → ${rpDots(info.to)}</span>` : "";
  const html = up ? `<b>${h(t("rpChipUp")(info.gain, name))}</b>${dots}<span class="vh">${h(cur.type === "item" ? t("rpChipAria")(info.gain, name, info.from, info.to) : "")}</span>` : h(t("rpChipDone")(name));
  const pill = $("scorePill"), pr = pill && !pill.hidden ? pill.getBoundingClientRect() : null;
  el.style.top = Math.max(8, pr ? pr.bottom + 8 : 12) + "px";
  const put = () => { el.innerHTML = html; el.classList.add("on"); };
  if (fresh) setTimeout(put, 30); else put(); // a live region must exist before its text changes
  clearTimeout(RP.chipTm); RP.chipTm = setTimeout(() => el.classList.remove("on"), 3200);
}
// «antes» (the bubble, the end card and Todo listo all use this one): the readiness shown when the report landed (report.before). An old report without it falls back to the rules now plus
// the measured editor part, which counts fixes made since in «antes» (that was the «75 → 83» after a start at 55).
const rpBeforeOf = (rd) => (G.report && cleanBefore(G.report.before) != null ? G.report.before : readyTotal(rd.red, rd.rules, rd.editorBase));

// ---- html ----
const rpDots = (n) => (n == null ? "○○○○○" : "●".repeat(n) + "○".repeat(5 - n));
function rpTime(at) {
  const d = new Date(at);
  return isNaN(d) ? "" : d.toLocaleTimeString(UI, { hour: "numeric", minute: "2-digit" });
}
// ad band from the rules: the same reading the pill uses (red from readinessOf, yellow while a non-dismissed pf- row is open)
function rpAdsBand(R, rd) {
  return rd.red ? "rojo" : Object.values(R.sections).flat().some((r) => /^pf-/.test(r.id) && (!r.passed || r.warn) && !state.fixDismissed.has(r.id)) ? "amarillo" : "verde";
}
// The one helper for «a → b posible»: the readiness if every pending change were accepted, or null when there is none to show.
// (the pill and the screen-reader label both use it; projectedReadiness stays the only recipe). Cached per text/report/pending set.
const RPP = { text: null, rep: null, live: "", sig: "", v: null };
function rpProjected(rd) {
  if (!rd || rd.score == null || !G.report || !state.result || typeof state.text !== "string") return null;
  const rep = G.report, text = state.text, live = rpStates().filter((s) => s.st === "pending");
  if (!live.length) return null;
  const lk = live.map((s) => s.i).join(","), sig = rpSig();
  if (RPP.text !== text || RPP.rep !== rep || RPP.live !== lk || RPP.sig !== sig) {
    RPP.text = text; RPP.rep = rep; RPP.live = lk; RPP.sig = sig;
    RPP.v = projectedReadiness(text, state.result, state.opts, { areas: effectiveReport(text, rep).areas, items: live.map((s) => ({ area: rep.items[s.i].area, start: s.start, end: s.end, replacement: rep.items[s.i].replacement, after: rep.items[s.i].after })) });
  }
  return RPP.v !== rd.score ? RPP.v : null;
}
// The label beside «r/40»: without a report, or with a cut one that has no 100-scale number (B-004). A function: other files render before this one runs.
function rpRulesLbl(rd) { return t(rd && rd.partial ? "rpRulesPartial" : "rpRulesName"); }
// The report inside the score bubble: { sub, table, foot } for scRenderPop (score_ui.js), or null without a report.
function rpPopHTML(R, rd) {
  const rep = G.report;
  if (!rep || (rd.score == null && !rd.partial)) return null; // a cut report has no number but its rated areas and «Medir de nuevo» still show (B-004)
  const A = t("rpArea"), eff = effectiveReport(state.text, rep).areas, base = rep.baseline || null;
  // «before» = what the same report was worth without the applied changes
  const before = rd.score != null ? rpBeforeOf(rd) : null, showBefore = rd.score != null && rd.editorEst > 0 && before !== rd.score;
  const dots = (n, k) => `<span class="rp-dots" role="img" aria-label="${h(A[k] + ": " + (n == null ? t("rpNoRate") : t("rpOf5")(n)))}"><span aria-hidden="true">${rpDots(n)}${n == null ? "" : " " + n}</span></span>`;
  const rows = REPORT_AREAS.map((k) => {
    const a = eff[k], now = a.rating, est = !!a.est, o = base ? (base[k] != null ? base[k] : null) : undefined;
    const from = o !== undefined ? o : est ? (rep.areas[k] || {}).rating : null;
    const d = from != null && now != null ? now - from : 0;
    const ch = d ? `<b class="sc-ch ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${Math.abs(d)}</b>` : `<span class="sc-ch"><span class="vh">${h(t("rpSame"))}</span><span aria-hidden="true">=</span></span>`;
    return `<tr class="sc-r${est ? " est" : ""}" data-area="${k}"><th scope="row">${h(A[k])}</th>${base ? `<td class="sc-o">${o != null ? dots(o, k) : "–"}</td>` : ""}<td class="sc-n2${base ? " arrow" : ""}">${dots(now, k)}${est ? `<span class="sc-by">${h(t("rpBy"))}</span>` : ""}</td><td class="sc-c">${ch}</td><td class="sc-w">${h(rep.areas[k].why || "")}</td></tr>`;
  });
  const band = rpAdsBand(R, rd), word = band === "verde" ? t("rpAdsOk") : t("scBand")[band];
  rows.push(`<tr class="sc-r sc-ads" data-area="ads"><th scope="row">${h(A.ads)}</th><td colspan="${base ? 3 : 2}"><span class="rp-st rp-st-${band}">${h(word)}</span></td><td class="sc-w"></td></tr>`);
  const stale = rep.key !== rpKey();
  return {
    sub: showBefore ? `${t("rpBy")} · ${t("rpBefore")(before)}` : "",
    table: `<div class="sc-tw"><table class="sc-t"><caption class="vh">${h(t("rpTitle"))}</caption><thead><tr><th scope="col">${h(t("rpColArea"))}</th>${base ? `<th scope="col">${h(t("rpColOrig"))}</th>` : ""}<th scope="col">${h(t("rpColNow"))}</th><th scope="col"><span class="vh">${h(t("rpColChange"))}</span></th><th scope="col">${h(t("rpColSaid"))}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`,
    foot: `${rep.partial === true ? `<p class="hint rp-partial" role="status">${h(t("rpPartial"))}</p>` : ""}<div class="sc-foot"><span class="sc-asof">${h(t("rpAsOf")(rpTime(rep.at)))}</span><button type="button" id="scRe" class="sc-re${stale ? " primary" : ""}"${RP.busy ? " disabled" : ""}>${h(t("rpRe2"))}</button></div><p class="hint sc-bnote">${h(t("rpBubNote"))}</p>`,
  };
}
function rpWriteHTML(cur) {
  const w = RP.write && RP.write.id === cur.id ? RP.write : null;
  if (!w) return "";
  return `<div class="rp-write"><label for="rpW">${h(t("rpWriteHere"))}</label><textarea id="rpW" rows="3">${h(w.value)}</textarea>${w.err ? `<p class="status err" role="alert">${h(w.err)}</p>` : ""}
    <div class="actions"><button type="button" class="small primary" data-rp="wapply" data-rp-primary>${h(t("coWriteApply"))}</button><button type="button" class="small linkish" data-rp="wcancel">${h(t("coCancel"))}</button></div></div>`;
}
function rpDecisionHTML(R, cur, states) {
  const w = RP.write && RP.write.id === cur.id;
  const prevOk = RP.hist.some((e) => (e.t === "item" ? RP.skip.has(e.i) : e.ids.some((id) => state.fixDismissed.has(id))));
  const nav = `<div class="rp-nav"><button type="button" class="small linkish" data-rp="prev"${prevOk ? "" : " disabled"} title="${h(t("coPrevTip"))}">${h(t("coPrev"))}</button>${state.fixUndo.length ? `<button type="button" class="small" id="rpUndo" data-rp="undo">${h(t("fxUndo"))}</button>` : ""}</div>`;
  if (cur.type === "item") {
    const it = cur.it, A = t("rpArea")[it.area], wk = rpWalk(cur), title = `${t("rpChange")(wk.i, wk.n)} · ${A}`;
    const lost = cur.st === "lost", chosen = rpChosen(cur), many = (it.alts || []).length > 0;
    const gain = lost ? 0 : rpInfo(cur, { kind: "patch", patches: [{ start: cur.start, end: cur.end, rep: chosen }] }).gain;
    let broke = "";
    if (!lost) {
      const ck = verifyProposal(state.text, state.opts, R, { kind: "patch", patches: [{ start: cur.start, end: cur.end, rep: chosen }] });
      if (ck.broke.length) broke = `<p class="status err">${h(t("fxBreaks")(ck.broke.map((id) => rowLabel(ck.R2 || R, id)).join(", ")))}</p>`;
    }
    return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-dec-h rp-prog"><b id="rpD">${h(title)}</b>${gain > 0 ? `<span class="rp-gain">${h(t("rpGainTo")(gain))}</span>` : ""}</div>
      <dl class="rp-cmp"><div class="rp-c"><dt>${h(t("fxBefore"))}</dt><dd class="rp-orig"${lost ? "" : ` data-es="${cur.start}" data-ee="${cur.end}"`}><del>${h(it.original)}</del></dd></div>
      ${many ? `<div class="rp-c"><dt>${h(t("rpPickLbl"))}</dt><dd><fieldset class="rp-pick"><legend class="vh">${h(t("rpPickLbl"))}</legend>${[it.replacement, ...it.alts].map((x, k) => `<label class="rp-opt"><input type="radio" name="rpPick" value="${k}" data-rp-pick="${h(cur.id)}"${x === chosen ? " checked" : ""}><span class="rp-opt-b"><span class="rp-opt-t">${h(x)}</span><span class="hint">${h(k ? t("rpPickAlt") : t("rpPickMain"))}</span></span></label>`).join("")}</fieldset></dd></div>` : `<div class="rp-c"><dt>${h(t("fxAfter"))}</dt><dd><ins>${h(it.replacement)}</ins></dd></div>`}
      <div class="rp-c"><dt>${h(t("rpWhy"))}</dt><dd>${h(it.why)}</dd></div></dl>
      ${lost ? `<p class="status err" role="status">${h(t("rpGone"))}</p>` : broke}${rpWriteHTML(cur)}
      <div class="actions rp-act">${lost ? "" : `<button type="button" class="small primary rp-go" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t("rpApplyGo"))}</button>`}${lost || w ? "" : `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>`}<button type="button" class="small linkish" data-rp="skip"${lost ? " data-rp-primary" : ""}>${h(t("coSkip"))}</button></div>${nav}</section>`;
  }
  const d = cur.d, c = d.card, wr = rpWords(cur);
  const opts = wr ? [rpWordProp(wr, R)] : d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(d) : []), p = opts[0];
  const canWrite = !!(d.at || c.field);
  const wk = rpWalk(cur), gain = p ? rpInfo(cur, p).gain : 0;
  const prog = `<div class="rp-prog"><span class="rp-prog-t">${h(t("rpChange")(wk.i, wk.n))}</span>${gain > 0 ? `<span class="rp-gain">${h(t("rpGainTo")(gain))}</span>` : ""}</div>`;
  const words = wr ? `<div class="fx-lbl">${h(t("rpWordsLbl"))}</div>${wr.rows.map((r, ri) => `<fieldset class="rp-words"><legend>«${h(r.term)}» <span class="hint">· ${h(r.hits.length > 1 ? t("rpTimes")(r.hits.length) : fmtTime(state.result.timeAt(r.hits[0].start)))}</span></legend>${r.alts.map((a, k) => `<label class="rp-chip"><input type="radio" name="rpW${ri}" value="${k}" data-rp-wpick="${h(r.key)}"${k === Math.min(RP.wpick[r.key] || 0, r.alts.length - 1) ? " checked" : ""}><span class="rp-chip-b"><b>${h(matchCase(r.term, a))}</b><span class="rp-safe">${h(t("rpWordSafe"))}</span></span></label>`).join("")}</fieldset>`).join("")}${wr.rest ? `<p class="hint">${h(t("rpWordsRest"))}</p>` : ""}${wr.kept ? `<p class="hint rp-kept">${h(t("rpWordsKept")(wr.kept))}</p>` : ""}` : "";
  return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1">${prog}<div class="rp-dec-h"><b id="rpD">${h(plainLabel(c.id, c.label))}</b><span class="rp-tag${d.soft ? " soft" : ""}">${h(d.soft ? t("rpHeadSoft") : t("rpHeadRisk"))}: ${h(t(d.soft ? "cat_mid" : "cat_hi"))}</span></div>
    ${c.fix ? `<div class="rp-fix">${h(c.fix)}</div>` : ""}<div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}${words}
    ${p ? `<div class="fx-lbl">${h(t("fxWould"))} <span class="hint">· ${h(p.label)}</span></div>${proposalHTML(c, p, R)}${p.why ? `<div class="hint">${h(p.why)}</div>` : ""}` : `<p class="hint">${h(t("fxNoProp"))}</p>`}
    ${rpWriteHTML(cur)}
    <div class="actions rp-act">${p ? `<button type="button" class="small primary rp-go" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t("rpApplyGo"))}</button>` : ""}${canWrite && !w ? `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>` : ""}<button type="button" class="small linkish" data-rp="skip">${h(t("coSkip"))}</button></div>${nav}</section>`;
}
function rpWordProp(wr, R) {
  const p = { kind: "patch", label: t("rpWordLbl"), patches: wr.patches };
  p.check = verifyProposal(state.text, state.opts, R, p);
  return p;
}
// Step 2's panel: only what drives the flow (the wait, an error with its retry, the current change). The number, the areas and
// «Medir de nuevo» live in the score bubble (rpPopHTML), the one place for them.
function reportHTML(R) {
  const rep = G.report;
  const states = rpStates();
  const msg = typeof fixMsg === "string" ? fixMsg : "";
  if (!RP.more && msg) fixMsg = ""; // with «Más detalles» open the panel there shows it
  const cur = rpCurrent();
  let body = "";
  // the wait says plainly that no answer has come yet; the seconds tick from aistatus_ui.js ([data-ai-el])
  if (RP.busy) body = `<div class="rp-wait" role="status"><div class="rp-wait-h"><span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>${h(t("rpReading"))}</b></div><p>${h(t("rpNoAnswer"))} <span aria-hidden="true">${h(t("rpSoFar"))} <b class="ai-el" data-ai-el>${typeof AIS !== "undefined" && AIS.n ? aiClock(Date.now() - AIS.t0) : "0:00"}</b></span></p></div>`;
  else {
    const fe = RP.fix ? Object.keys(RP.fix.err) : [];
    if (fe.length) body += `<p class="status err rp-fixlost" role="alert">${h(t("rpFixLost")(fe.reduce((a, k) => a + Math.min(REPORT_FIX_BATCH, RP.fix.items.length - (k - 1) * REPORT_FIX_BATCH), 0)))} ${fe.map((k) => `<button type="button" class="small" data-rp-fixre="${k}">${h(t("aiRetry"))}</button>`).join(" ")}</p>`;
    if (RP.err) body += `<p class="status err" role="alert">${h(RP.err)}</p><div class="rp-nav"><button type="button" class="small primary" data-rp="re">${h(t("rpRe"))}</button></div>`;
    if (!rep && RP.noAI) body += `<p class="hint rp-noai" role="status">${h(t("rpNoAI"))}</p>`;
    const ended = !cur && rep && states.some((s) => s.st === "applied" || s.st === "skipped");
    body += cur ? rpDecisionHTML(R, cur, states) : ended ? rpEndHTML(R, states) : `<p class="lead rp-none" role="status">${h(t("coNone"))}</p>${state.fixUndo.length ? `<div class="rp-nav"><button type="button" class="small" id="rpUndo" data-rp="undo">${h(t("fxUndo"))}</button></div>` : ""}`;
  }
  // phone: under the card only the paragraph being changed shows; this label and link belong to it (CSS shows them only then)
  const where = cur ? `<p class="rp-wh">${h(t("rpWhere"))}</p><p class="rp-wf"><button type="button" class="linkish" data-rp-full aria-pressed="${RP.full ? "true" : "false"}">${h(t(RP.full ? "rpFocusBack" : "rpFull"))}</button></p>` : "";
  return `<section class="rp" data-rp-root aria-label="${h(t("rpDecLbl"))}"><span class="status" id="rpMsg" role="status">${h(msg)}</span>${body}</section>${where}`;
}
// End of the walk: no pending or lost card left. Counts: items from rpStates, risk cards from the ones seen in this walk and their log entries.
function rpEndHTML(R, states) {
  const rd = readinessOf(R, G.report, state.fixDismissed, state.text), A = t("rpArea");
  const log = (state.fixLog || []);
  const riskDone = [], riskSkip = [];
  for (const [, m] of RP.seen) {
    if (log.some((x) => x.kind === "done" && m.ids.includes(x.id))) riskDone.push(m.label);
    else if (log.some((x) => x.kind === "skip" && m.ids.includes(x.id))) riskSkip.push(m.label);
  }
  const ap = states.filter((s) => s.st === "applied"), a = ap.length + riskDone.length, sk = states.filter((s) => s.st === "skipped").length + riskSkip.length;
  const now = rd.score != null ? rd.score : rd.rules, before = rd.score != null ? rpBeforeOf(rd) : now;
  const of40 = rd.score != null ? "" : `<small>/${rd.rulesMax}</small>`; // no 100-scale number: say the scale (no report, or a cut one, B-004)
  const nums = rd.score != null && a > 0 && rd.editorEst > 0 && before !== now ? `<span class="rp-end-n"><span class="vh">${h(t("rpBefore")(before))} </span><span aria-hidden="true">${before} → </span><span class="vh">${h(t("rpEndNow")(now))}</span><span aria-hidden="true">${now}</span></span>` : `<span class="rp-end-n"><span class="vh">${h(rd.score != null ? t("rpEndNow")(now) : t("rpRulesLbl")(now))}</span><span aria-hidden="true">${now}${of40}</span></span>`;
  const list = [...ap.map((s) => A[G.report.items[s.i].area]), ...riskDone].map((x) => `<li><span aria-hidden="true">✓</span> ${h(x)}</li>`).join("");
  return `<section class="rp-dec rp-end" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-prog"><span class="rp-prog-t">${h(t("rpEndStep"))}</span></div>
    <h3 id="rpD">${h(t(a ? "rpEndH" : "rpEndNoneH"))}</h3>
    <p class="rp-end-row">${nums}<span class="hint">${h(t("rpBy"))}</span></p>
    <p class="rp-end-c">${h(t("rpEndCount")(a, sk))}</p>
    ${G.report.partial === true ? `<p class="hint rp-partial" role="status">${h(t("rpPartial"))}</p>` : ""}
    ${list ? `<ul class="rp-end-l" aria-label="${h(t("rpEndList"))}">${list}</ul>` : ""}
    <div class="actions rp-act"><button type="button" class="small primary rp-go" data-rp="publish" data-rp-primary>${h(t("rpEndPub"))}</button><button type="button" class="small linkish" data-rp="re">${h(t("rpRe2"))}</button></div>
    ${state.fixUndo.length ? `<div class="rp-nav"><button type="button" class="small" id="rpUndo" data-rp="undo">${h(t("fxUndo"))}</button></div>` : ""}</section>`;
}
function rpWrapMore(inner, open) {
  return `<details class="rp-more rp-detail" id="rpMore"${open ? " open" : ""}><summary id="rpMoreSum"><span class="rp-more-t">${h(t("rpDetail"))}</span> <span class="hint">${h(t("rpMoreHint"))}</span></summary><div class="rp-more-body">${inner}</div></details>`;
}

// ---- actions ----
function rpSkip(cur) {
  if (cur.type === "item") { RP.skip.add(cur.i); RP.hist.push({ t: "item", i: cur.i }); }
  else {
    const d = cur.d, ids = d.ids && d.ids.length ? d.ids : [d.id], bis = d.card ? fxBlocksOf(d.card) : [];
    ids.forEach((id) => state.fixDismissed.add(id));
    (bis.length ? bis : [-1]).forEach((bi) => state.fixLog.push({ id: ids[0], ids, label: plainLabel(d.card.id, d.card.label), kind: "skip", bi }));
    RP.hist.push({ t: "risk", ids });
  }
  RP.write = null; RP.delay = 0;
  renderGuide();
}
function rpPrev() {
  let e;
  while ((e = RP.hist.pop())) if (e.t === "item" ? RP.skip.has(e.i) : e.ids.some((id) => state.fixDismissed.has(id))) break; else e = null;
  if (!e) return;
  if (e.t === "item") RP.skip.delete(e.i);
  else {
    e.ids.forEach((id) => state.fixDismissed.delete(id));
    state.fixLog = state.fixLog.filter((x) => !(x.kind === "skip" && x.ids.some((id) => e.ids.includes(id))));
  }
  RP.write = null; RP.delay = 0;
  renderGuide();
}
function rpApplyP(cur, p) {
  if (cur.type === "item" && cur.st === "lost") { rerunReview(t("fxStale")); return; }
  const info = rpInfo(cur, p), v0 = $("script").value, n0 = state.fixLog.length; // figures read before the text moves
  RP.applying = rpKey(); RP.delay = 1100; RP.write = null;
  try { applyProposal(p, rpCardOf(cur)); } finally { RP.applying = null; }
  if ($("script").value !== v0 || state.fixLog.length > n0) rpChip(info, cur); // only when it really applied (the stale guard refuses)
}
function rpAct(act) {
  const cur = rpCurrent();
  // (B-023, 2026-10-29) A new epoch stops a fix pump still running for the old report: its next batch would otherwise ask the NEW
  // report's fragments a second time (paid twice, pushed twice). Not while the report itself is busy: rpRun would return and the
  // in-flight answer would be orphaned.
  if (act === "re") { if (!RP.busy) RP.epoch++; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; rpRun(true); renderGuide(); return; }
  if (act === "publish") return goStep(3);
  if (act === "undo") { RP.applying = rpKey(); RP.delay = 0; try { undoFix(); } finally { RP.applying = null; } return; }
  if (!cur) return;
  if (act === "skip") return rpSkip(cur);
  if (act === "prev") return rpPrev();
  if (act === "apply") {
    if (cur.type === "item") return rpApplyP(cur, { kind: "patch", label: t("rpTitle"), patches: [{ start: cur.start, end: cur.end, rep: rpChosen(cur) }] });
    const wr = rpWords(cur);
    if (wr) return rpApplyP(cur, rpWordProp(wr, state.result));
    const opts = cur.d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(cur.d) : []);
    return opts[0] && rpApplyP(cur, opts[0]);
  }
  if (act === "write") {
    const c = rpCardOf(cur);
    RP.write = { id: cur.id, err: "", value: cur.type === "item" ? rpChosen(cur) : c.field ? c.field.value : state.text.slice(cur.start, cur.end) };
    renderGuide(); const b = $("rpW"); if (b) b.focus(); return;
  }
  if (act === "wcancel") { RP.write = null; renderGuide(); return; }
  if (act === "wapply" && RP.write) {
    const box = $("rpW"), v = box ? box.value : RP.write.value, c = rpCardOf(cur);
    RP.write.value = v;
    const p = c.field ? { kind: "field", field: c.field.name, value: v.trim(), label: t("coManual") } : { kind: "patch", label: t("coManual"), patches: [{ start: cur.start, end: cur.end, rep: v }] };
    p.check = verifyProposal(state.text, state.opts, state.result, p);
    if (p.check.broke.length) { RP.write.err = t("fxBreaks")(p.check.broke.map((id) => rowLabel(p.check.R2 || state.result, id)).join(", ")); renderGuide(); return; }
    rpApplyP(cur, p);
  }
}
function rpShow() {
  const cur = rpCurrent();
  if (cur && cur.start == null) document.querySelector("main").classList.toggle("rp-nospot", document.querySelector("main").classList.contains("rp-focus")); // no place in the script to show
  if (!cur || cur.start == null || !wkBuild()) return;
  const r = wkRange(cur.start, Math.max(cur.end, cur.start + 1));
  if (r) { if (!rpFocusFit(r)) wkScrollTo(r); wkFlash([r]); }
}
// Phone, step 2 (plan "Walk Juan through it", step 5, 2026-10-26): the card comes first and under it only the paragraph being changed, so the
// card is on screen at scroll 0. Pure layout: CSS (guide.css, main.rp-focus) reorders the page and the script box is given the height of that
// paragraph through --rp-ph; the editor's own DOM is never touched. «Ver guion completo» (RP.full) gives back the docked full script, and
// «Más detalles» open does too (the old walker needs it). Desktop (split view) is unchanged.
function rpFocusSync() {
  const main = document.querySelector("main");
  const on = V.guided && V.step === 2 && !(typeof SPLIT !== "undefined" && SPLIT.on) && !RP.more && !!document.querySelector(".rp-dec");
  main.classList.toggle("rp-focus", on && !RP.full);
  main.classList.toggle("rp-full", on && RP.full);
  if (!on) main.classList.remove("rp-nospot");
}
function rpFocusFit(r) {
  const main = document.querySelector("main"), ed = ED.el;
  if (!ed || !main.classList.contains("rp-focus")) return false;
  let n = r.startContainer;
  while (n && n.parentNode !== ed) n = n.parentNode;
  if (!n || n.nodeType !== 1) { main.classList.remove("rp-nospot"); return false; }
  main.classList.remove("rp-nospot");
  // the box is exactly as tall as the paragraph plus the gap to its neighbours, so no line of the paragraph before or after peeks in
  const cs = getComputedStyle(ed), pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
  const cap = Math.round(window.innerHeight * 0.4), nb = n.getBoundingClientRect(), pv = n.previousElementSibling, nx = n.nextElementSibling;
  const offT = pv ? Math.min(pt, Math.max(0, nb.top - pv.getBoundingClientRect().bottom)) : pt;
  const offB = nx ? Math.max(0, Math.min(pb, nx.getBoundingClientRect().top - nb.bottom) - 2) : pb; // 2 px of rounding room: scrollTop is a whole number
  document.documentElement.style.setProperty("--rp-ph", Math.min(Math.max(Math.ceil(nb.height) + offT + offB, 72), cap) + "px");
  void ed.offsetHeight; // apply the new height before measuring where the paragraph is inside the box
  const eb = ed.getBoundingClientRect(), nb2 = n.getBoundingClientRect(), rb = r.getBoundingClientRect();
  const top = nb2.height + offT + offB > cap ? rb.top : nb2.top; // a paragraph taller than the box: start at the changed sentence
  ed.scrollTop = Math.max(0, ed.scrollTop + (top - eb.top) - offT);
  return true;
}
window.addEventListener("resize", () => { if (V.guided && V.step === 2) rpFocusSync(); });
function rpWire() {
  const root = document.querySelector("[data-rp-root]");
  if (!root) return;
  root.querySelectorAll("[data-rp-fixre]").forEach((b) => b.addEventListener("click", () => rpFixRetry(+b.dataset.rpFixre)));
  root.querySelectorAll("[data-rp]").forEach((b) => b.addEventListener("click", () => rpAct(b.dataset.rp)));
  root.querySelectorAll(".rp-orig[data-es], .fx-ev[data-es]").forEach((el) => {
    el.setAttribute("role", "button"); el.tabIndex = 0; el.title = t("wkLoc");
    const go = () => { if (wkBuild()) { const r = wkRange(+el.dataset.es, +el.dataset.ee); if (r) { wkScrollTo(r); wkFlash([r]); } } };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  const pickRedraw = (sel) => { RP.refocus = sel; const y = window.scrollY; renderGuide(); window.scrollTo(0, y); };
  root.querySelectorAll("input[data-rp-pick]").forEach((x) => x.addEventListener("change", () => { RP.pick[x.dataset.rpPick] = +x.value; pickRedraw(`input[name="rpPick"][value="${x.value}"]`); }));
  root.querySelectorAll("input[data-rp-wpick]").forEach((x) => x.addEventListener("change", () => { RP.wpick[x.dataset.rpWpick] = +x.value; pickRedraw(`input[name="${x.name}"][value="${x.value}"]`); }));
  if (RP.refocus) { const f = root.querySelector(RP.refocus); RP.refocus = ""; if (f) f.focus(); }
  const fb = document.querySelector("[data-rp-full]");
  if (fb) fb.addEventListener("click", () => { RP.full = !RP.full; RP.shown = ""; const y = window.scrollY; renderGuide(); window.scrollTo(0, y); const nb = document.querySelector("[data-rp-full]"); if (nb) nb.focus(); });
  const w = $("rpW");
  if (w) w.addEventListener("input", () => { if (RP.write) RP.write.value = w.value; });
  // Enter = the main button, → = skip, ← = previous; never while typing in a box, and Enter on a button keeps its own meaning
  root.addEventListener("keydown", (e) => {
    const tg = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const click = (sel) => { const b = root.querySelector(sel); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (e.key === "Enter" && tg.tagName === "INPUT" && /^(radio|checkbox)$/.test(tg.type)) return click("[data-rp-primary]"); // a choice is not a text field
    if (/^(TEXTAREA|INPUT|SELECT)$/.test(tg.tagName)) return;
    if (e.key === "ArrowRight") click('[data-rp="skip"]');
    else if (e.key === "ArrowLeft") click('[data-rp="prev"]');
    else if (e.key === "Enter" && !/^(BUTTON|A|SUMMARY)$/.test(tg.tagName) && !tg.closest("[role=button]")) click("[data-rp-primary]");
  });
  const sb = $("stepBar"); if (sb) document.documentElement.style.setProperty("--sb-h", Math.ceil(sb.getBoundingClientRect().height) + "px"); // the sticky action row sits above the phone's step bar
  const md = $("rpMore");
  if (md) md.addEventListener("toggle", () => {
    if (md.open === RP.more) return; // the toggle event of a render is not a choice
    RP.more = md.open;
    const y = window.scrollY;
    renderGuide(); window.scrollTo(0, y);
    const s = $("rpMoreSum"); if (s) s.focus();
  });
}
function rpAfterRender() {
  rpFocusSync();
  if (!V.guided || V.step !== 2) { RP.shown = ""; return; }
  rpWire();
  if (!hasScript()) return;
  try { wkBuild(); } catch (e) { /* best effort: without the editor map the spot just isn't shown */ }
  const cur = rpCurrent(), id = cur ? cur.id : "";
  if (id === RP.shown) { RP.delay = 0; return; }
  RP.shown = id;
  clearTimeout(RP.tm);
  if (!cur) return;
  const d = RP.delay; RP.delay = 0;
  if (d) RP.tm = setTimeout(rpShow, d); else rpShow();
}

// a new review starts the coach cache over (coach_ai.js, capture phase); the report's answers go back in after it
$("runBtn").addEventListener("click", () => { rpPrimeFixes(); });

// ---- hooks (this file loads after coach_ai.js) ----
const _renderGuideR = renderGuide;
renderGuide = function () {
  if (V.guided && V.step === 2) rpPrepare();
  _renderGuideR();
  rpAfterRender();
  if (typeof scPaint === "function" && typeof SC !== "undefined" && SC.S) scPaint(); // «a → b posible» follows the pending changes (skip, previous, apply)
};
// Score rows and map markers belong to «Más detalles»: opening it is what makes them land somewhere.
const _scGoRowR = scGoRow;
scGoRow = function (id) { if (V.guided) RP.more = true; return _scGoRowR(id); };
