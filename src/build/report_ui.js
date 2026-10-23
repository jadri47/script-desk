/* ===== Editor's report: step 2 shows one AI read of the whole script, then one change at a time ===== */
// (jadri47, 2026-10-22: "improve his messages from a 90 level for a YouTube video to a 95-100") The pure part is report_logic.js
// (prompt, vetting, readiness). This file asks for the report once per script version, keeps it with the episode (G.report), and walks
// the person through the rule-based ad risks first and then the report's changes. Today's coach / walker / rail / legend / «Más
// revisiones» / Ask Claude live behind «Más detalles» and are only built (so only painted) while that is open.
Object.assign(T.es, {
  rpTitle: "Informe del editor", rpName: "Preparado para YouTube", rpRulesName: "Anuncios y empaque",
  rpReady: (a) => `Preparado para YouTube: ${a}`, rpReadyTo: (a, b) => `Preparado para YouTube: ${a} → ${b} si aceptas lo propuesto`, rpRulesLbl: (r) => `Anuncios y empaque: ${r}/40`,
  rpAsOf: (tm) => `según el informe de las ${tm}`, rpRe: "Volver a evaluar", rpReading: "Leyendo tu guion como lo haría un editor…",
  rpNoAI: "El informe del editor necesita la IA. Mientras tanto ves los avisos de anuncios y de empaque.",
  rpArea: { hook: "Gancho", promise: "Promesa", retention: "Retención", voice: "Voz hablada", close: "Cierre", return: "Que vuelvan", ads: "Anuncios" },
  rpAdsOk: "✓ sin riesgo", rpOf5: (n) => `${n} de 5`, rpNoRate: "sin valorar", rpChange: (i, n) => `Cambio ${i} de ${n}`, rpWhy: "Por qué",
  rpMore: "Más detalles", rpMoreHint: "(revisión línea por línea, muletillas, colores, por párrafos)", rpAfterRec: "Después de grabar",
  rpGone: "Este fragmento cambió después del informe, así que no se puede aplicar. Sáltalo o vuelve a evaluar.", rpWriteHere: "Escribe cómo debe quedar",
  rpHeadRisk: "Aviso rojo", rpListLbl: "Áreas del informe", rpDecLbl: "Decisión actual",
});
Object.assign(T.en, {
  rpTitle: "Editor's report", rpName: "YouTube-ready", rpRulesName: "Ads and packaging",
  rpReady: (a) => `YouTube-ready: ${a}`, rpReadyTo: (a, b) => `YouTube-ready: ${a} → ${b} if you accept the suggestions`, rpRulesLbl: (r) => `Ads and packaging: ${r}/40`,
  rpAsOf: (tm) => `as of the ${tm} report`, rpRe: "Re-evaluate", rpReading: "Reading your script the way an editor would…",
  rpNoAI: "The editor's report needs the AI. Meanwhile you see the ad and packaging warnings.",
  rpArea: { hook: "Hook", promise: "Promise", retention: "Retention", voice: "Spoken voice", close: "Close", return: "Return viewers", ads: "Ads" },
  rpAdsOk: "✓ no risk", rpOf5: (n) => `${n} of 5`, rpNoRate: "not rated", rpChange: (i, n) => `Change ${i} of ${n}`, rpWhy: "Why",
  rpMore: "More details", rpMoreHint: "(line-by-line review, fillers, colours, by paragraph)", rpAfterRec: "After recording",
  rpGone: "This passage changed after the report, so it can't be applied. Skip it or re-evaluate.", rpWriteHere: "Write how it should read",
  rpHeadRisk: "Red warning", rpListLbl: "Report areas", rpDecLbl: "Current decision",
});
if (typeof HELP !== "undefined") { HELP.es.rpReport = RP_INFO.es; HELP.en.rpReport = RP_INFO.en; }
if (typeof HELP_ANCHORS !== "undefined") HELP_ANCHORS.push(["rpReport", ".rp-title h3", "row"]);

// more: «Más detalles» open. sd-more-open=1 opens it on load (suites that drive the walker / coach set it; Juan never does).
const RP = { busy: false, err: "", noAI: false, failed: false, skip: new Set(), hist: [], write: null, more: lsGet("sd-more-open") === "1", shown: "", delay: 0, applying: null, epoch: 0, tm: 0, calls: 0, risk: [], riskKey: "", riskR: null };
const rpKey = () => coHash(($("script").value || "") + "|" + (($("keyword") || {}).value || "") + "|" + (($("title") || {}).value || ""));
const rpMoreOpen = () => RP.more;
function rpReset() { RP.epoch++; RP.busy = false; RP.err = ""; RP.noAI = false; RP.failed = false; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; RP.riskKey = ""; }

// A stored report is untrusted (old versions, other devices): keep only what has the right shape.
function rpClean(r) {
  if (!r || typeof r !== "object" || !r.areas || typeof r.areas !== "object" || !Array.isArray(r.items)) return null;
  const areas = {};
  for (const k of REPORT_AREAS) { const a = r.areas[k]; areas[k] = { rating: reportRating(a && a.rating), why: String((a && a.why) || "").slice(0, 300) }; }
  const items = r.items.filter((x) => x && REPORT_AREAS.includes(x.area) && typeof x.original === "string" && x.original && typeof x.replacement === "string" && x.replacement)
    .slice(0, REPORT_MAX_ITEMS).map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, why: String(x.why || "").slice(0, 300), after: reportRating(x.after) }));
  return { at: typeof r.at === "string" ? r.at : "", key: String(r.key || ""), areas, items, dropped: Number(r.dropped) || 0 };
}
const _applyProdR = applyProd;
applyProd = function (id, d) { _applyProdR(id, d); G.report = rpClean(d && d.report); rpReset(); };
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
    const res = await sample.json(reportPrompt(text, R, { keyword: $("keyword").value }), { modelTier: "complex" }); // not auto: the $5 automatic pause must not block the core feature
    const v = vetReport(text, res, opts, R);
    if (!REPORT_AREAS.some((k) => v.areas[k].rating != null)) throw { code: "invalid_json" }; // an answer without a single rating is not a report
    out = { at: new Date().toISOString(), key, areas: v.areas, items: v.items.map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, why: x.why, after: x.after })), dropped: v.dropped };
  } catch (e) {
    if (e && (e.code === "daily_limit" || e.code === "not_member")) RP.noAI = true;
    else { RP.err = errText(e); RP.failed = true; }
  } finally {
    if (epoch === RP.epoch) {
      RP.busy = false;
      if (out) { G.report = out; RP.skip = new Set(); RP.hist = []; RP.write = null; RP.shown = ""; if (G.prodId) markDirty(); }
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
  if (RP.riskKey !== key || RP.riskR !== state.result) {
    RP.risk = buildDecisions(state.text, state.result, state.opts, state.fixDismissed).filter((d) => d.kind === "risk");
    RP.riskKey = key; RP.riskR = state.result;
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
  }) : [];
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
    const lost = cur.st === "lost";
    let broke = "";
    if (!lost) {
      const ck = verifyProposal(state.text, state.opts, R, { kind: "patch", patches: [{ start: cur.start, end: cur.end, rep: it.replacement }] });
      if (ck.broke.length) broke = `<p class="status err">${h(t("fxBreaks")(ck.broke.map((id) => rowLabel(ck.R2 || R, id)).join(", ")))}</p>`;
    }
    return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-dec-h"><b id="rpD">${h(title)}</b></div>
      <dl class="rp-cmp"><div class="rp-c"><dt>${h(t("fxBefore"))}</dt><dd class="rp-orig"${lost ? "" : ` data-es="${cur.start}" data-ee="${cur.end}"`}><del>${h(it.original)}</del></dd></div>
      <div class="rp-c"><dt>${h(t("fxAfter"))}</dt><dd><ins>${h(it.replacement)}</ins></dd></div>
      <div class="rp-c"><dt>${h(t("rpWhy"))}</dt><dd>${h(it.why)}</dd></div></dl>
      ${lost ? `<p class="status err" role="status">${h(t("rpGone"))}</p>` : broke}${rpWriteHTML(cur)}
      <div class="actions rp-act">${lost ? "" : `<button type="button" class="small primary" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t("fxApply"))}</button>`}${lost || w ? "" : `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>`}<button type="button" class="small linkish" data-rp="skip"${lost ? " data-rp-primary" : ""}>${h(t("coSkip"))}</button></div>${nav}</section>`;
  }
  const d = cur.d, c = d.card, opts = d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(d) : []), p = opts[0];
  const canWrite = !!(d.at || c.field);
  return `<section class="rp-dec" role="region" aria-labelledby="rpD" tabindex="-1"><div class="rp-dec-h"><b id="rpD">${h(plainLabel(c.id, c.label))}</b><span class="rp-tag">${h(t("rpHeadRisk"))}: ${h(t("cat_hi"))}</span></div>
    ${c.fix ? `<div class="rp-fix">${h(c.fix)}</div>` : ""}<div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}
    ${p ? `<div class="fx-lbl">${h(t("fxWould"))} <span class="hint">· ${h(p.label)}</span></div>${proposalHTML(c, p, R)}${p.why ? `<div class="hint">${h(p.why)}</div>` : ""}` : `<p class="hint">${h(t("fxNoProp"))}</p>`}
    ${rpWriteHTML(cur)}
    <div class="actions rp-act">${p ? `<button type="button" class="small primary" data-rp="apply"${w ? "" : " data-rp-primary"}>${h(t("fxApply"))}</button>` : ""}${canWrite && !w ? `<button type="button" class="small" data-rp="write">${h(t("coWrite"))}</button>` : ""}<button type="button" class="small linkish" data-rp="skip">${h(t("coSkip"))}</button></div>${nav}</section>`;
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
  if (RP.busy) body = `<p class="rp-wait" role="status">${h(t("rpReading"))}</p>`;
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
    if (cur.type === "item") return rpApplyP(cur, { kind: "patch", label: t("rpTitle"), patches: [{ start: cur.start, end: cur.end, rep: cur.it.replacement }] });
    const opts = cur.d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(cur.d) : []);
    return opts[0] && rpApplyP(cur, opts[0]);
  }
  if (act === "write") {
    const c = rpCardOf(cur);
    RP.write = { id: cur.id, err: "", value: cur.type === "item" ? cur.it.replacement : c.field ? c.field.value : state.text.slice(cur.start, cur.end) };
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
