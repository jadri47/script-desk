/* ===== Editor's report: step 2 shows one AI read of the whole script, then one change at a time ===== */
// (jadri47, 2026-10-22: "improve his messages from a 90 level for a YouTube video to a 95-100") The pure part is report_logic.js
// (prompt, vetting, readiness). This file asks for the report once per script version, keeps it with the episode (G.report), and walks
// the person through the rule-based ad risks first and then the report's changes. Today's coach / walker / rail / legend / «Más
// revisiones» / Ask Claude live behind «Más detalles» and are only built (so only painted) while that is open.
Object.assign(T.es, {
  rpTitle: "Informe del editor", rpName: "Preparado para YouTube", rpRulesName: "Anuncios y empaque",
  rpReady: (a) => `Preparado para YouTube: ${a}`, rpReadyTo: (a, b) => `Preparado para YouTube: ${a} → ${b} si aceptas lo propuesto`, rpRulesLbl: (r) => `Anuncios y empaque: ${r}/40`,
  rpAsOf: (tm) => `según el informe de las ${tm}`, rpRe: "Volver a evaluar", rpReading: "La IA está leyendo tu guion como lo haría un editor",
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
});
Object.assign(T.en, {
  rpTitle: "Editor's report", rpName: "YouTube-ready", rpRulesName: "Ads and packaging",
  rpReady: (a) => `YouTube-ready: ${a}`, rpReadyTo: (a, b) => `YouTube-ready: ${a} → ${b} if you accept the suggestions`, rpRulesLbl: (r) => `Ads and packaging: ${r}/40`,
  rpAsOf: (tm) => `as of the ${tm} report`, rpRe: "Re-evaluate", rpReading: "The AI is reading your script the way an editor would",
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
});
if (typeof HELP !== "undefined") { HELP.es.rpReport = RP_INFO.es; HELP.en.rpReport = RP_INFO.en; }
if (typeof HELP_ANCHORS !== "undefined") HELP_ANCHORS.push(["rpReport", ".rp-title h3", "row"]);

// more: «Más detalles» open. sd-more-open=1 opens it on load (suites that drive the walker / coach set it; Juan never does).
const RP = { busy: false, err: "", noAI: false, failed: false, skip: new Set(), hist: [], write: null, more: lsGet("sd-more-open") === "1", shown: "", delay: 0, applying: null, epoch: 0, tm: 0, calls: 0, risk: [], riskKey: "", riskR: null, pick: {}, wpick: {}, refocus: "" };
const rpKey = () => coHash(($("script").value || "") + "|" + (($("keyword") || {}).value || "") + "|" + (($("title") || {}).value || ""));
const rpMoreOpen = () => RP.more;
function rpReset() { RP.epoch++; RP.busy = false; RP.err = ""; RP.noAI = false; RP.failed = false; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; RP.riskKey = ""; RP.pick = {}; RP.wpick = {}; }

// A stored report is untrusted (old versions, other devices): keep only what has the right shape.
function rpClean(r) {
  if (!r || typeof r !== "object" || !r.areas || typeof r.areas !== "object" || !Array.isArray(r.items)) return null;
  const areas = {};
  for (const k of REPORT_AREAS) { const a = r.areas[k]; areas[k] = { rating: reportRating(a && a.rating), why: String((a && a.why) || "").slice(0, 300) }; }
  const items = r.items.filter((x) => x && REPORT_AREAS.includes(x.area) && typeof x.original === "string" && x.original && typeof x.replacement === "string" && x.replacement)
    .slice(0, REPORT_MAX_ITEMS).map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, alts: rpStrs(x.alts, REPORT_MAX_ALTS), why: String(x.why || "").slice(0, 300), after: reportRating(x.after) }));
  const words = {};
  if (r.words && typeof r.words === "object" && !Array.isArray(r.words)) for (const [k, v] of Object.entries(r.words)) { const a = rpStrs(v, REPORT_MAX_WORD_ALTS); if (k && a.length) words[k.toLowerCase()] = a; }
  const fixes = (Array.isArray(r.fixes) ? r.fixes : []).filter((f) => f && typeof f.id === "string" && f.id && typeof f.orig === "string" && f.orig && Array.isArray(f.options)).slice(0, REPORT_MAX_FIXES)
    .map((f) => ({ id: f.id, orig: f.orig, lead: typeof f.lead === "string" ? f.lead : "", trail: typeof f.trail === "string" ? f.trail : "", field: typeof f.field === "string" && f.field ? f.field : null,
      options: f.options.filter((o) => o && typeof o.text === "string" && o.text.trim()).slice(0, REPORT_MAX_FIX_OPTS).map((o) => ({ text: o.text.trim(), why: String(o.why || "").slice(0, 300) })) }))
    .filter((f) => f.options.length);
  return { at: typeof r.at === "string" ? r.at : "", key: String(r.key || ""), areas, items, words, fixes, dropped: Number(r.dropped) || 0 };
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
  RP.busy = true; RP.err = ""; if (force) RP.failed = false;
  let out = null;
  try {
    const sample = await caps.sample;
    if (!sample) { RP.noAI = true; return; }
    const text = state.text, R = state.result, opts = state.opts, key = rpKey();
    RP.calls++;
    // The problems «Proponer con IA» and the coach would ask one at a time ride in this call: every decision whose card has the button,
    // those with no rule-made fix first, in the coach's order, at most REPORT_MAX_FIXES. Questions and notes have their own prompts.
    const spans = verseSpans(text, R), sent = [];
    const cand = buildDecisions(text, R, opts, state.fixDismissed).filter((d) => d.card && d.card.ai && d.kind !== "question" && d.kind !== "note");
    cand.sort((a, b) => (b.needsAi ? 1 : 0) - (a.needsAi ? 1 : 0));
    for (const d of cand) {
      if (sent.length >= REPORT_MAX_FIXES) break;
      const it = fixItem(d, "f" + (sent.length + 1), text, opts, spans);
      if (it) sent.push(it);
    }
    const fixes = sent.map((it) => { const c = it.d.card; return { id: it.id, problem: `«${plainLabel(c.id, c.label)}». ${c.info || ""} ${c.fix || ""} ${fxAiExtra(c.ai)}`.replace(/\s+/g, " ").trim(), frag: it.frag, ctx: it.ctx }; });
    const res = await sample.json(reportPrompt(text, R, { keyword: $("keyword").value, fixes }), { modelTier: "complex", aiLabel: t("aiLblReport"), aiRetry: () => rpAct("re") }); // not auto: the $5 automatic pause must not block the core feature
    const v = vetReport(text, res, opts, R);
    if (!REPORT_AREAS.some((k) => v.areas[k].rating != null)) throw { code: "invalid_json" }; // an answer without a single rating is not a report
    out = { at: new Date().toISOString(), key, areas: v.areas, items: v.items.map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, alts: x.alts, why: x.why, after: x.after })), words: v.words, dropped: v.dropped };
    const fx = vetFixes(res, sent);
    out.fixes = sent.filter((it) => fx[it.id]).map((it) => ({ id: it.d.card.id, orig: it.orig, lead: it.lead || "", trail: it.trail || "", field: it.field || null, options: fx[it.id] }));
  } catch (e) {
    if (e && (e.code === "daily_limit" || e.code === "not_member")) RP.noAI = true;
    else { RP.err = errText(e); RP.failed = true; }
  } finally {
    if (epoch === RP.epoch) {
      RP.busy = false;
      if (out) { G.report = out; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; RP.pick = {}; RP.wpick = {}; if (typeof COAI !== "undefined") for (const f of out.fixes) if (COAI.cache[f.id] && COAI.cache[f.id].status !== "loading") delete COAI.cache[f.id]; rpPrimeFixes(); if (G.prodId) markDirty(); }
      if (out && typeof scApply === "function" && SC.R) scApply(); // the pill and the verdict switch to the full readiness
      if (V.guided && V.step === 2) renderGuide();
    }
  }
}
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
    const a = text.indexOf(it.original);
    if (a >= 0 && text.indexOf(it.original, a + 1) < 0) return { i, st: "pending", start: a, end: a + it.original.length };
    if (text.includes(it.replacement)) return { i, st: "applied" }; // applied earlier, the log was reset since
    return { i, st: "lost" };
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
  return { ...w, rest: Math.max(0, all - w.patches.length) };
}
const rpCardOf = (cur) => cur.type === "risk" ? cur.d.card : { id: "rp-" + cur.i, ids: ["rp-" + cur.i], label: t("rpArea")[cur.it.area], fix: cur.it.why };

// ---- html ----
const rpDots = (n) => (n == null ? "○○○○○" : "●".repeat(n) + "○".repeat(5 - n));
function rpTime(at) {
  const d = new Date(at);
  return isNaN(d) ? "" : d.toLocaleTimeString(UI, { hour: "numeric", minute: "2-digit" });
}
function rpRowsHTML(R, rd) {
  const rep = G.report, A = t("rpArea");
  const rows = rep ? REPORT_AREAS.map((k) => {
    const a = rep.areas[k], n = a.rating;
    return `<li class="rp-row" data-area="${k}"><span class="rp-a">${h(A[k])}</span><span class="rp-dots" role="img" aria-label="${h(A[k] + ": " + (n == null ? t("rpNoRate") : t("rpOf5")(n)))}"><span aria-hidden="true">${rpDots(n)}</span></span><span class="rp-w">${h(a.why)}</span></li>`;
  }) : RP.busy ? REPORT_AREAS.map((k) => `<li class="rp-row rp-row-wait" data-area="${k}"><span class="rp-a">${h(A[k])}</span><span class="rp-w">${h(t("rpWaiting"))}</span></li>`) : [];
  const band = rd.red ? "rojo" : Object.values(R.sections).flat().some((r) => /^pf-/.test(r.id) && (!r.passed || r.warn) && !state.fixDismissed.has(r.id)) ? "amarillo" : "verde";
  const word = band === "verde" ? t("rpAdsOk") : t("scBand")[band];
  rows.push(`<li class="rp-row rp-ads" data-area="ads"><span class="rp-a">${h(A.ads)}</span><span class="rp-st rp-st-${band}">${h(word)}</span></li>`);
  return `<ul class="rp-rows" aria-label="${h(t("rpListLbl"))}">${rows.join("")}</ul>`;
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
    const it = cur.it, n = G.report.items.length, A = t("rpArea")[it.area], title = `${t("rpChange")(cur.i + 1, n)} · ${A}`;
    const lost = cur.st === "lost", chosen = rpChosen(cur), many = (it.alts || []).length > 0;
    let broke = "";
    if (!lost) {
      const ck = verifyProposal(state.text, state.opts, R, { kind: "patch", patches: [{ start: cur.start, end: cur.end, rep: chosen }] });
      if (ck.broke.length) broke = `<p class="status err">${h(t("fxBreaks")(ck.broke.map((id) => rowLabel(ck.R2 || R, id)).join(", ")))}</p>`;
    }
    return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-dec-h"><b id="rpD">${h(title)}</b></div>
      <dl class="rp-cmp"><div class="rp-c"><dt>${h(t("fxBefore"))}</dt><dd class="rp-orig"${lost ? "" : ` data-es="${cur.start}" data-ee="${cur.end}"`}><del>${h(it.original)}</del></dd></div>
      ${many ? `<div class="rp-c"><dt>${h(t("rpPickLbl"))}</dt><dd><fieldset class="rp-pick"><legend class="vh">${h(t("rpPickLbl"))}</legend>${[it.replacement, ...it.alts].map((x, k) => `<label class="rp-opt"><input type="radio" name="rpPick" value="${k}" data-rp-pick="${h(cur.id)}"${x === chosen ? " checked" : ""}><span class="rp-opt-b"><span class="rp-opt-t">${h(x)}</span><span class="hint">${h(k ? t("rpPickAlt") : t("rpPickMain"))}</span></span></label>`).join("")}</fieldset></dd></div>` : `<div class="rp-c"><dt>${h(t("fxAfter"))}</dt><dd><ins>${h(it.replacement)}</ins></dd></div>`}
      <div class="rp-c"><dt>${h(t("rpWhy"))}</dt><dd>${h(it.why)}</dd></div></dl>
      ${lost ? `<p class="status err" role="status">${h(t("rpGone"))}</p>` : broke}${rpWriteHTML(cur)}
      <div class="actions rp-act">${lost ? "" : `<button type="button" class="small primary" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t(many ? "rpApplyPick" : "fxApply"))}</button>`}${lost || w ? "" : `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>`}<button type="button" class="small linkish" data-rp="skip"${lost ? " data-rp-primary" : ""}>${h(t("coSkip"))}</button></div>${nav}</section>`;
  }
  const d = cur.d, c = d.card, wr = rpWords(cur);
  const opts = wr ? [rpWordProp(wr, R)] : d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(d) : []), p = opts[0];
  const canWrite = !!(d.at || c.field);
  const words = wr ? `<div class="fx-lbl">${h(t("rpWordsLbl"))}</div>${wr.rows.map((r, ri) => `<fieldset class="rp-words"><legend>«${h(r.term)}» <span class="hint">· ${h(r.hits.length > 1 ? t("rpTimes")(r.hits.length) : fmtTime(state.result.timeAt(r.hits[0].start)))}</span></legend>${r.alts.map((a, k) => `<label class="rp-chip"><input type="radio" name="rpW${ri}" value="${k}" data-rp-wpick="${h(r.key)}"${k === Math.min(RP.wpick[r.key] || 0, r.alts.length - 1) ? " checked" : ""}><span class="rp-chip-b"><b>${h(matchCase(r.term, a))}</b><span class="rp-safe">${h(t("rpWordSafe"))}</span></span></label>`).join("")}</fieldset>`).join("")}${wr.rest ? `<p class="hint">${h(t("rpWordsRest"))}</p>` : ""}` : "";
  return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-dec-h"><b id="rpD">${h(plainLabel(c.id, c.label))}</b><span class="rp-tag${d.soft ? " soft" : ""}">${h(d.soft ? t("rpHeadSoft") : t("rpHeadRisk"))}: ${h(t(d.soft ? "cat_mid" : "cat_hi"))}</span></div>
    ${c.fix ? `<div class="rp-fix">${h(c.fix)}</div>` : ""}<div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}${words}
    ${p ? `<div class="fx-lbl">${h(t("fxWould"))} <span class="hint">· ${h(p.label)}</span></div>${proposalHTML(c, p, R)}${p.why ? `<div class="hint">${h(p.why)}</div>` : ""}` : `<p class="hint">${h(t("fxNoProp"))}</p>`}
    ${rpWriteHTML(cur)}
    <div class="actions rp-act">${p ? `<button type="button" class="small primary" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t("fxApply"))}</button>` : ""}${canWrite && !w ? `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>` : ""}<button type="button" class="small linkish" data-rp="skip">${h(t("coSkip"))}</button></div>${nav}</section>`;
}
function rpWordProp(wr, R) {
  const p = { kind: "patch", label: t("rpWordLbl"), patches: wr.patches };
  p.check = verifyProposal(state.text, state.opts, R, p);
  return p;
}
function reportHTML(R) {
  const rep = G.report, rd = readinessOf(R, rep, state.fixDismissed);
  const stale = !!rep && rep.key !== rpKey();
  const states = rpStates(), live = states.filter((s) => s.st === "pending");
  let score;
  if (rd.score == null) score = t("rpRulesLbl")(rd.rules);
  else {
    const b = live.length ? projectedReadiness(state.text, R, state.opts, { areas: rep.areas, items: live.map((s) => ({ area: rep.items[s.i].area, start: s.start, end: s.end, replacement: rep.items[s.i].replacement, after: rep.items[s.i].after })) }) : rd.score;
    score = b !== rd.score ? t("rpReadyTo")(rd.score, b) : t("rpReady")(rd.score);
  }
  const msg = typeof fixMsg === "string" ? fixMsg : "";
  if (!RP.more && msg) fixMsg = ""; // with «Más detalles» open the panel there shows it
  const meta = rep ? `<span class="rp-asof">${h(t("rpAsOf")(rpTime(rep.at)))}</span><button type="button" class="small${stale ? " primary" : ""}" data-rp="re"${RP.busy ? " disabled" : ""}>${h(t("rpRe"))}</button>` : RP.err ? `<button type="button" class="small primary" data-rp="re"${RP.busy ? " disabled" : ""}>${h(t("rpRe"))}</button>` : "";
  const cur = rpCurrent();
  let body = "";
  // the wait says plainly that no answer has come yet; the seconds tick from aistatus_ui.js ([data-ai-el])
  if (RP.busy) body = `<div class="rp-wait" role="status"><div class="rp-wait-h"><span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>${h(t("rpReading"))}</b></div><p>${h(t("rpNoAnswer"))} <span aria-hidden="true">${h(t("rpSoFar"))} <b class="ai-el" data-ai-el>${typeof AIS !== "undefined" && AIS.n ? aiClock(Date.now() - AIS.t0) : "0:00"}</b></span></p></div>`;
  else {
    if (RP.err) body += `<p class="status err" role="alert">${h(RP.err)}</p>`;
    if (!rep && RP.noAI) body += `<p class="hint rp-noai" role="status">${h(t("rpNoAI"))}</p>`;
    body += cur ? rpDecisionHTML(R, cur, states) : `<p class="lead rp-none" role="status">${h(t("coNone"))}</p>${state.fixUndo.length ? `<div class="rp-nav"><button type="button" class="small" id="rpUndo" data-rp="undo">${h(t("fxUndo"))}</button></div>` : ""}`;
  }
  return `<section class="rp" data-rp-root aria-labelledby="rpH"><div class="rp-head"><div class="rp-title"><h3 id="rpH">${h(t("rpTitle"))}</h3></div><div class="rp-score" id="rpScore">${h(score)}</div>${meta ? `<div class="rp-meta">${meta}</div>` : ""}<span class="status" id="rpMsg" role="status">${h(msg)}</span></div>
    ${rpRowsHTML(R, rd)}${body}</section>`;
}
function rpWrapMore(inner, open) {
  return `<details class="rp-more" id="rpMore"${open ? " open" : ""}><summary id="rpMoreSum"><span class="rp-more-t">${h(t("rpMore"))}</span> <span class="hint">${h(t("rpMoreHint"))}</span></summary><div class="rp-more-body">${inner}</div></details>`;
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
  RP.applying = rpKey(); RP.delay = 1100; RP.write = null;
  try { applyProposal(p, rpCardOf(cur)); } finally { RP.applying = null; }
}
function rpAct(act) {
  const cur = rpCurrent();
  if (act === "re") { RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; rpRun(true); renderGuide(); return; }
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
  if (!cur || cur.start == null || !wkBuild()) return;
  const r = wkRange(cur.start, Math.max(cur.end, cur.start + 1));
  if (r) { wkScrollTo(r); wkFlash([r]); }
}
function rpWire() {
  const root = document.querySelector("[data-rp-root]");
  if (!root) return;
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
  const w = $("rpW");
  if (w) w.addEventListener("input", () => { if (RP.write) RP.write.value = w.value; });
  // Enter = the main button, → = skip, ← = previous; never while typing in a box, and Enter on a button keeps its own meaning
  root.addEventListener("keydown", (e) => {
    const tg = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || /^(TEXTAREA|INPUT|SELECT)$/.test(tg.tagName)) return;
    const click = (sel) => { const b = root.querySelector(sel); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (e.key === "ArrowRight") click('[data-rp="skip"]');
    else if (e.key === "ArrowLeft") click('[data-rp="prev"]');
    else if (e.key === "Enter" && !/^(BUTTON|A|SUMMARY)$/.test(tg.tagName) && !tg.closest("[role=button]")) click("[data-rp-primary]");
  });
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
};
// Score rows and map markers belong to «Más detalles»: opening it is what makes them land somewhere.
const _scGoRowR = scGoRow;
scGoRow = function (id) { if (V.guided) RP.more = true; return _scGoRowR(id); };
