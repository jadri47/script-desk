/* ===== Coach: step 2 as one decision at a time ===== */
// (jadri47, 2026-10-21: "The app should walk him through the process and just ask him questions") The queue comes from
// coach_logic.js (pure). This file shows the first remaining decision, scrolls the script to its spot, and reuses the walker's
// painting and fix_ui's applyProposal / fxRevert so the decision log, revert and stale-text guard keep working.
// A resolved decision (applied, skipped, answered) leaves the queue, so "Decisión i de n" is derived: i = n - remaining + 1.
Object.assign(T.es, {
  coDec: (i, n) => `Decisión ${i} de ${n}`, coScore: (a, b) => `Nota ${a} → ${b} si aceptas lo propuesto`, coByPara: "Ver por párrafos", coBack: "Volver a una decisión a la vez",
  coPrev: "‹ Anterior", coPrevTip: "Recupera la última decisión que saltaste", coRegion: "Decisión actual", coSkip: "Saltar", coNext: "Siguiente",
  coBatchN: (n) => (n === 1 ? "1 arreglo seguro" : `${n} arreglos seguros`), coSeeEach: "Ver cada uno", coApplyAll: (n) => `Aplicar los ${n}`, coBatchLbl: "Arreglos seguros",
  coBatchDone: (n) => `${n} arreglos aplicados.`, coBatchHint: "Cada uno se puede revertir desde «Cambios hechos».", coItems: "Arreglos seguros uno por uno",
  coFam: { muletillas: (n) => `${n} muletilla${n === 1 ? "" : "s"}`, pulpit: (n) => `${n} frase${n === 1 ? "" : "s"} de culto («¿amén?»…)`, openers: (n) => `${n} «Y»/«Entonces» repetida${n === 1 ? "" : "s"} al inicio`, weak: (n) => `${n} palabra${n === 1 ? "" : "s"} genérica${n === 1 ? "" : "s"}`, regional: (n) => `${n} regionalismo${n === 1 ? "" : "s"}`, onscreen: (n) => `${n} señal${n === 1 ? "" : "es"} [TEXTO]` },
  coWrite: "Lo escribo yo", coWriteLbl: "Escribe cómo debe quedar", coCheck: "Comprobar", coWriteApply: "Aplicar lo escrito", coCancel: "Cancelar", coManual: "A mano",
  coAsk: { bigIdea: "¿Cuál es la idea central del episodio?", keyword: "¿Qué frase buscaría alguien en YouTube para encontrar este episodio?", nextEp: "¿De qué trata el próximo episodio?", title: "¿Qué título le pones?" },
  coAskHint: { bigIdea: "Saldrá al inicio y al cierre." }, coAnsLbl: "Tu respuesta", coEmptyAns: "Escribe una respuesta o salta esta pregunta.", coSaved: "Guardado.",
  coLead: "Toca «Aplicar» para aceptar el cambio o «Saltar» para dejarlo. Todo se puede revertir en «Cambios hechos».", coOwn: "Escribirla yo", coTimes: (n) => `${n} ${n === 1 ? "vez" : "veces"}`, coSrc: { promise: "tu promesa del inicio", recap: "tu cierre", plan: "del plan de la serie" }, coAiTitles: "Más ideas con IA", coAiIdea: "Sugerir con IA", coNone: "Listo: no quedan decisiones", coLog: (n) => `Cambios hechos (${n})`, coRisk: "Aviso rojo",
});
Object.assign(T.en, {
  coDec: (i, n) => `Decision ${i} of ${n}`, coScore: (a, b) => `Score ${a} → ${b} if you accept the suggestions`, coByPara: "See by paragraph", coBack: "Back to one decision at a time",
  coPrev: "‹ Previous", coPrevTip: "Brings back the last decision you skipped", coRegion: "Current decision", coSkip: "Skip", coNext: "Next",
  coBatchN: (n) => (n === 1 ? "1 safe fix" : `${n} safe fixes`), coSeeEach: "See each one", coApplyAll: (n) => `Apply all ${n}`, coBatchLbl: "Safe fixes",
  coBatchDone: (n) => `${n} fixes applied.`, coBatchHint: "You can revert each one from \"Changes made\".", coItems: "Safe fixes one by one",
  coFam: { muletillas: (n) => `${n} filler${n === 1 ? "" : "s"}`, pulpit: (n) => `${n} pulpit phrase${n === 1 ? "" : "s"} ("amen?"…)`, openers: (n) => `${n} repeated "And"/"Then" opener${n === 1 ? "" : "s"}`, weak: (n) => `${n} generic word${n === 1 ? "" : "s"}`, regional: (n) => `${n} regional word${n === 1 ? "" : "s"}`, onscreen: (n) => `${n} [TEXT] cue${n === 1 ? "" : "s"}` },
  coWrite: "I'll write it", coWriteLbl: "Write how it should read", coCheck: "Check", coWriteApply: "Apply what I wrote", coCancel: "Cancel", coManual: "By hand",
  coAsk: { bigIdea: "What is the central idea of the episode?", keyword: "What phrase would someone search on YouTube to find this episode?", nextEp: "What is the next episode about?", title: "What title do you give it?" },
  coAskHint: { bigIdea: "It will be heard at the start and at the close." }, coAnsLbl: "Your answer", coEmptyAns: "Write an answer or skip this question.", coSaved: "Saved.",
  coLead: "Tap “Apply” to accept the change or “Skip” to leave it. Everything can be reverted under “Changes made”.", coOwn: "Write my own", coTimes: (n) => `${n} ${n === 1 ? "time" : "times"}`, coSrc: { promise: "your opening promise", recap: "your close", plan: "from your series plan" }, coAiTitles: "More ideas with AI", coAiIdea: "Suggest with AI", coNone: "Done: no decisions left", coLog: (n) => `Changes made (${n})`, coRisk: "Red warning",
});

const COACH = { order: [], key: "", R: null, list: [], proj: 0, total: 0, hist: [], sel: { id: "", k: 0 }, write: null, q: { id: "", sel: 0, ai: [], err: "", busy: false }, curId: "", delay: 0, tm: 0 };
const coachOn = () => { try { return localStorage.getItem("sd-coach-off") !== "1"; } catch (e) { return true; /* best effort: storage blocked: the coach stays the default */ } };
function coachSetOn(on) {
  try { if (on) localStorage.removeItem("sd-coach-off"); else localStorage.setItem("sd-coach-off", "1"); } catch (e) { /* best effort: storage blocked: the choice isn't remembered after a reload */ }
  WK.pending = true;
  if (V.guided) renderGuide(); else renderResults();
}
// Computed once per review result (text + ignored set + result identity), not on every render.
function coachBuild() {
  const key = state.text + "|" + [...state.fixDismissed].sort().join(",");
  if (COACH.key === key && COACH.R === state.result) return;
  COACH.list = buildDecisions(state.text, state.result, state.opts, state.fixDismissed);
  COACH.proj = COACH.list.length ? projectedScore(state.text, state.result, state.opts, COACH.list, state.fixDismissed) : scoreOf(state.result, state.fixDismissed).score;
  COACH.key = key; COACH.R = state.result;
  COACH.total = Math.max(COACH.total, COACH.list.length);
  if (!COACH.order.length) COACH.order = COACH.list.map((d) => d.id); // the queue as it was at the start: the header position follows it, also after a jump from the score popover
  const id = COACH.list[0] ? COACH.list[0].id : "";
  if (id !== COACH.curId) { COACH.sel = { id: "", k: 0 }; COACH.write = null; COACH.q = { id, sel: 0, ai: [], err: "", busy: false }; }
}

const coFlat = (x) => x.replace(/\s+/g, " ");
function coItemsHTML(d) {
  const text = state.text;
  return `<ul class="cc-items" aria-label="${h(t("coItems"))}">` + d.items.map((it, k) => {
    const pre = coFlat(text.slice(Math.max(0, it.start - 28), it.start)), from = coFlat(text.slice(it.start, it.end)), post = coFlat(text.slice(it.end, it.end + 28));
    return `<li><button type="button" class="linkish cc-it" data-co-it="${k}" title="${h(t("wkLoc"))}">…${h(pre)}<del>${h(from)}</del><ins>${h(coFlat(it.rep))}</ins>${h(post)}…</button></li>`;
  }).join("") + `</ul>`;
}
function coBatchHTML(d) {
  const fams = Object.entries(d.fam).map(([f, n]) => (t("coFam")[f] ? t("coFam")[f](n) : `${n} ${f}`)).join(", ");
  const n = d.items.length;
  return `<div class="cc-top"><b class="cc-t">${h(t("coBatchN")(n))}</b>${d.gain > 0 ? `<span class="fix-pts" title="${h(t("scPtsTip"))}">+${d.gain}</span>` : ""}</div>
    <p class="cc-sub">${h(fams)}</p><p class="hint">${h(t("coBatchHint"))}</p>
    <details class="cc-see"><summary>${h(t("coSeeEach"))}</summary>${coItemsHTML(d)}</details>
    <div class="actions cc-act"><button type="button" class="small primary" data-co="batch" data-co-primary>${h(t("coApplyAll")(n))}</button><button type="button" class="small linkish" data-co="skip">${h(t("coSkip"))}</button></div>`;
}
// Rule options first, then the automatic AI ones (coach_ai.js, already verified).
const coOptions = (d) => d.options.concat(typeof coachAiOptions === "function" ? coachAiOptions(d) : []);
const coAiBusy = (d) => typeof coachAiLoading === "function" && coachAiLoading(d);
function coChoiceHTML(d, R) {
  const c = d.card, w = COACH.write && COACH.write.id === d.id ? COACH.write : null;
  const opts = coOptions(d), k = COACH.sel.id === d.id && opts.length ? COACH.sel.k % opts.length : 0, p = opts[k];
  const pts = fxPtsHTML(c, p, R), ai = state.fixAi[c.id];
  const canWrite = !!(d.at || c.field);
  const writeBox = w ? `<div class="cc-write"><label for="coW">${h(t("coWriteLbl"))}</label><textarea id="coW" rows="3">${h(w.value)}</textarea>
      <div class="actions"><button type="button" class="small" data-co="wcheck">${h(t("coCheck"))}</button><button type="button" class="small linkish" data-co="wcancel">${h(t("coCancel"))}</button></div>
      ${w.p ? proposalHTML(c, w.p, R) + `<div class="actions"><button type="button" class="small primary" data-co="wapply" data-co-primary>${h(t("coWriteApply"))}</button></div>` : ""}</div>` : "";
  return `<div class="cc-top"><b class="cc-t">${h(plainLabel(c.id, c.label))}</b>${d.kind === "risk" ? `<span class="cc-tag">${h(t("coRisk"))}: ${h(t("cat_hi"))}</span>` : ""}${pts.html}</div>
    ${c.fix ? `<div class="tf-f">${h(c.fix)}</div>` : ""}${pts.why ? `<div class="hint fx-why">${h(pts.why)}</div>` : ""}
    <div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}
    ${p ? `<div class="fx-lbl">${h(t("fxWould"))} <span class="hint">· ${h(p.label)}</span>${p.label === "IA" ? ` <span class="cc-tag cc-ai">${h(t("coAiTag"))}</span>` : ""}</div>${proposalHTML(c, p, R)}${p.why ? `<div class="hint">${h(p.why)}</div>` : ""}` : coAiBusy(d) ? `<p class="hint cc-prep" role="status">${h(t("coAiPrep"))}</p>` : `<p class="hint">${h(t("fxNoProp"))}</p>`}
    ${writeBox}
    <div class="actions cc-act">${p ? `<button type="button" class="small primary" data-co="apply"${w && w.p ? "" : " data-co-primary"}>${h(t("fxApply"))}</button>` : ""}${opts.length > 1 ? `<button type="button" class="small" data-co="other">${h(t("fxOther"))}</button>` : ""}${canWrite && !w ? `<button type="button" class="small" data-co="write">${h(t("coWrite"))}</button>` : ""}${d.needsAi && c.ai ? `<button type="button" class="small" data-fxai="0">${h(ai ? t("fxAiAgain") : t("fxAi"))}</button>` : ""}<button type="button" class="small linkish" data-co="skip">${h(t("coSkip"))}</button></div>
    <div class="fx-ai" id="fxai-0">${ai ? aiOptionsHTML(0, ai) : ""}</div>`;
}
// Ready answers (coachQuestionChoices: from the script or the rules) as radios, the first one chosen, plus «Escribirla yo».
// Without any candidate only the box shows, as before. (jadri47, 2026-10-22: "radios in a radiogroup, first choice preselected")
function coChoices(d) {
  const extra = { prods: G.prods || [], curId: G.prodId, pubDate: G.pubDate || "" };
  const base = coachQuestionChoices(d.ask, state.result, state.opts, d.card, extra);
  for (const x of COACH.q.ai) if (!base.some((c) => norm(c.text) === norm(x))) base.push({ text: x, src: "ai" });
  return base;
}
function coQuestionHTML(d) {
  const a = d.ask, hint = (t("coAskHint") || {})[a], ch = coChoices(d), q = COACH.q;
  const sel = ch.length ? (q.sel >= 0 && q.sel < ch.length ? q.sel : q.sel === -1 ? -1 : 0) : -1, own = sel === -1;
  const ml = a === "title" ? ' maxlength="100"' : "";
  const radios = ch.length ? `<div class="cc-radios" role="radiogroup" aria-labelledby="coQ">${ch.map((c, i) => `<label class="cc-radio"><input type="radio" name="coChoice" value="${i}"${sel === i ? " checked" : ""}><span>${h(c.text)}${c.n ? ` <span class="hint">· ${h(t("coTimes")(c.n))}</span>` : ""}${c.src && t("coSrc")[c.src] ? ` <span class="hint">· ${h(t("coSrc")[c.src])}</span>` : ""}</span></label>`).join("")}<label class="cc-radio"><input type="radio" name="coChoice" value="own"${own ? " checked" : ""}><span>${h(t("coOwn"))}</span></label></div>` : "";
  const aiBtn = a === "title" || a === "bigIdea" ? `<button type="button" class="small" data-co="${a === "title" ? "ai-title" : "ai-idea"}"${q.busy ? " disabled" : ""}>${h(q.busy ? t("thinking") : a === "title" ? t("coAiTitles") : t("coAiIdea"))}</button>` : "";
  return `<div class="cc-top"><b class="cc-t" id="coQ">${h(t("coAsk")[a])}</b></div>${hint ? `<p class="hint">${h(hint)}</p>` : ""}${radios}
    <div id="coOwnBox"${ch.length && !own ? " hidden" : ""}><label class="cc-lbl" for="coAns">${h(t("coAnsLbl"))}</label><textarea id="coAns" rows="2"${ml}></textarea></div><p class="status err" id="coAnsErr" hidden>${h(t("coEmptyAns"))}</p>${q.err ? `<p class="status err">${h(q.err)}</p>` : ""}
    <div class="actions cc-act"><button type="button" class="small primary" data-co="answer" data-co-primary>${h(t("fxUse"))}</button>${aiBtn}<button type="button" class="small linkish" data-co="skip">${h(t("coSkip"))}</button></div>`;
}
function coNoteHTML(d) {
  const c = d.card;
  return `<div class="cc-top"><b class="cc-t">${h(plainLabel(c.id, c.label))}</b><span class="fx-meta">${h(t("fxNoteTag"))}</span></div>
    ${c.fix ? `<div class="tf-f">${h(c.fix)}</div>` : ""}<div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}<p class="hint">${h(t("fxNoteHow"))}</p>
    <div class="actions cc-act"><button type="button" class="small primary" data-co="skip" data-co-primary>${h(t("coNext"))}</button></div>`;
}
function coachHTML(R) {
  coachBuild();
  const L = COACH.list, d = L[0], n = Math.max(COACH.total, L.length), done = n - L.length, oi = d ? COACH.order.indexOf(d.id) : -1, i = d ? (oi >= 0 ? oi + 1 : done + 1) : n;
  COACH.curId = d ? d.id : "";
  state.fixCards = !d ? [] : d.kind === "batch" ? [{ id: "batch", ids: [], label: "", proposals: d.options, evidence: [] }] : d.card ? [d.card] : [];
  state.fixSel = d && COACH.sel.id === d.id ? { 0: COACH.sel.k } : {};
  const msg = fixMsg; fixMsg = "";
  const pend = COACH.hist.some((e) => e.ids.some((id) => state.fixDismissed.has(id)));
  const title = d ? t("coDec")(i, n) : t("coNone");
  const head = `<div class="cc-head"><h3 id="coH">${h(d ? title : t("coNone"))}</h3><span class="status" id="fxMsg" role="status">${h(msg)}</span><button type="button" class="small linkish" data-co="walker">${h(t("coByPara"))}</button></div>`;
  const bar = n ? `<div class="cc-bar" role="progressbar" aria-labelledby="coH" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}" aria-valuetext="${h(title)}"><i style="width:${Math.round((done / n) * 100)}%"></i></div>` : "";
  const a = scoreOf(R, state.fixDismissed).score;
  const sc = d ? `<p class="cc-score">${h(t("coScore")(a, COACH.proj))}</p>` : "";
  let body;
  if (!d) body = `<p class="lead cc-none">${h(t("coNone"))}</p><div class="actions cc-act"><button type="button" class="primary" data-co="done" data-co-primary>${h(t("wkDone"))} →</button></div>`;
  else body = d.kind === "batch" ? coBatchHTML(d) : d.kind === "question" ? coQuestionHTML(d) : d.kind === "note" ? coNoteHTML(d) : coChoiceHTML(d, R);
  const nav = d ? `<div class="cc-nav"><button type="button" class="small linkish" data-co="prev"${pend ? "" : " disabled"} title="${h(t("coPrevTip"))}">${h(t("coPrev"))}</button></div>` : "";
  const log = state.fixLog.length ? `<details class="cc-log"${COACH.logOpen ? " open" : ""}><summary>${h(t("coLog")(state.fixLog.length))}</summary><ol class="fx-list">${wkLogItemsHTML(state.fixLog)}</ol></details>` : "";
  const pause = typeof coachAiPauseHTML === "function" ? coachAiPauseHTML() : "";
  return `<div class="topfix coach" data-coach>${head}${bar}${sc}${pause}<section class="cc-dec" role="region" aria-label="${h(t("coRegion") + (d ? ": " + title : ""))}" tabindex="-1">${body}</section>${nav}${log}</div>`;
}

// ---- painting the spot ----
function coachPaint() {
  if (!wkReady() || !WK.ok) return;
  const d = COACH.list[0];
  if (d && d.at) WK.i = Math.max(0, wkBlockAt(WK.blocks, d.at.start));
  else if (WK.i < 0 || WK.i >= WK.blocks.length) WK.i = 0;
  wkPaint(false);
}
function coachShow() {
  const d = COACH.list[0];
  if (!d || !d.at || !wkReady() || !WK.ok || d.id !== COACH.curId) return;
  const r = wkRange(d.at.start, Math.max(d.at.end, d.at.start + 1));
  if (r) { wkScrollTo(r); wkFlash([r]); }
}
function coachAfterRender() {
  const root = document.querySelector(".topfix.coach");
  if (!root) return;
  const go = WK.pending; WK.pending = false;
  wkDock(go);
  // the lead under the panel names the buttons of this panel («Saltar», not «Ahora no»)
  const lead = root.nextElementSibling;
  if (lead && lead.matches("p.lead")) lead.textContent = t("coLead");
  coachPaint();
  clearTimeout(COACH.tm);
  // right after an Apply the changed text is flashed first; the next decision's spot follows a moment later
  if (COACH.delay) { COACH.tm = setTimeout(coachShow, COACH.delay); COACH.delay = 0; } else coachShow();
}
function coachRefresh() {
  const old = document.querySelector(".topfix.coach");
  if (!old) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = coachHTML(state.result);
  old.replaceWith(tmp.firstElementChild);
  wireFixes();
  coachPaint();
}

// ---- actions ----
function coachSkip(d) {
  const ids = d.ids && d.ids.length ? d.ids : [d.id];
  const bis = d.card ? fxBlocksOf(d.card) : [];
  ids.forEach((id) => state.fixDismissed.add(id));
  const label = d.kind === "batch" ? t("coBatchLbl") : d.card ? plainLabel(d.card.id, d.card.label) : t("coAsk")[d.ask];
  (bis.length ? bis : [-1]).forEach((bi) => state.fixLog.push({ id: ids[0], ids, label, kind: "skip", bi }));
  COACH.hist.push({ ids });
  COACH.delay = 0;
  renderResults();
}
// Brings back the last skipped decision. Applied changes are taken back from "Cambios hechos" (Revertir), never silently.
function coachPrev() {
  let e;
  while ((e = COACH.hist.pop())) if (e.ids.some((id) => state.fixDismissed.has(id))) break; else e = null;
  if (!e) return;
  e.ids.forEach((id) => state.fixDismissed.delete(id));
  state.fixLog = state.fixLog.filter((x) => !(x.kind === "skip" && x.ids.some((id) => e.ids.includes(id))));
  COACH.delay = 0;
  renderResults();
}
// One combined patch (one review run), one "done" entry per item so each can be reverted on its own from the log.
function coachApplyBatch(d) {
  if (state.text.trimEnd() !== $("script").value.trimEnd()) { rerunReview(t("fxStale")); return; }
  const before = state.text, items = [...d.items].sort((a, b) => a.start - b.start);
  const after = applyPatches(before, items.map((x) => ({ start: x.start, end: x.end, rep: x.rep })));
  if (after === before) { rerunReview(t("fxNoChange")); return; }
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
  const sc0 = scoreOf(state.result, state.fixDismissed).score, grp = ++fxUid, words = (x) => (x.match(/\S+/g) || []).length;
  const prev = { cold: JSON.parse(JSON.stringify(G.cold)), field: null };
  let delta = 0;
  const entries = items.map((it) => {
    const at = it.start + delta, bi = WK.ok ? wkBlockAt(WK.blocks, it.start) : -1;
    const chg = fxChgOf(before, after, it.start, it.end, at, at + it.rep.length);
    delta += it.rep.length - (it.end - it.start);
    const tm = bi >= 0 && typeof RL !== "undefined" && RL.bt && RL.bt[bi] != null ? fmtTime(RL.bt[bi]) : "";
    return { uid: ++fxUid, grp, pk: "patch", why: "", para: bi >= 0 && bi < WK.blocks.length ? bi + 1 : 0, tm, dw: words(it.rep) - words(before.slice(it.start, it.end)), prev, field: null, sc: [sc0, null], id: it.cardId, ids: [it.cardId], label: plainLabel(it.cardId, rowLabel(state.result, it.cardId)), kind: "done", bi, what: t("coBatchLbl"), where: "script", chg };
  });
  $("script").value = after;
  state.fixLog.push(...entries);
  state.fixSel = {}; state.fixAi = {};
  COACH.delay = 1100;
  rerunReview(t("coBatchDone")(entries.length));
  const sc1 = scoreOf(state.result, state.fixDismissed).score;
  entries.forEach((e) => { e.sc[1] = sc1; });
  if (WK.ok) { const r = wkRange(items[0].start, items[0].start + Math.max(1, items[0].rep.length)); if (r) { wkScrollTo(r); wkFlash([r]); } }
}
function coachAnswer(d) {
  const box = $("coAns"), rd = document.querySelector('input[name="coChoice"]:checked'), ch = coChoices(d);
  const v = rd && rd.value !== "own" && ch[+rd.value] ? ch[+rd.value].text.trim() : box ? box.value.trim() : "";
  if (!v) { const e = $("coAnsErr"); if (e) e.hidden = false; if (box) box.focus(); return; }
  const a = d.ask;
  if (a === "nextEp") G.nextEp = v;
  else {
    const el = $(a);
    if (!el) return;
    el.value = v; el.dispatchEvent(new Event("input", { bubbles: true }));
    if (a === "keyword" || a === "title") { const ex = $("extraFields"); if (ex) ex.open = true; }
  }
  markDirty();
  COACH.delay = 0;
  rerunReview(t("coSaved"));
}
function coachManual(d) {
  const w = COACH.write, box = $("coW");
  if (!w || !box) return;
  w.value = box.value;
  const c = d.card;
  const p = c.field ? { kind: "field", field: c.field.name, value: w.value.trim(), label: t("coManual") } : { kind: "patch", label: t("coManual"), patches: [{ start: d.at.start, end: d.at.end, rep: w.value }] };
  p.check = verifyProposal(state.text, state.opts, state.result, p);
  w.p = p;
  coachRefresh();
}
// Manual clicks only (step 4 adds the automatic ones). Each result becomes one more choice; titles keep the 60-character limit.
// Was coachAiRun: coach_ai.js declares coachAiRun(items, epoch) for the automatic batch and, coming later in the bundle, won the
// name, so the title/idea buttons called the batch with a function and threw «items.map is not a function» (B-009, 2026-10-29).
async function coachAiAsk(fn) {
  const id = COACH.q.id;
  COACH.q.busy = true; COACH.q.err = ""; coachRefresh();
  try { const r = await fn(); if (COACH.q.id === id) { const before = coChoices(COACH.list[0]).length; COACH.q.ai.push(...r); if (r.length) COACH.q.sel = before; } }
  catch (e) { if (COACH.q.id === id) COACH.q.err = e && e.code === "no_sample" ? t("aiPickNeed") : errText(e); }
  if (COACH.q.id === id) { COACH.q.busy = false; coachRefresh(); }
}
function coachAiTitles() {
  coachAiAsk(async () => {
    const sample = await caps.sample; if (!sample) throw { code: "no_sample" };
    const R = state.result, kw = (state.opts.keyword || R.keyword || ""), prom = R.promiseSent ? R.promiseSent.text : state.text.slice(0, 600);
    const prompt = `Para un episodio de un pódcast cristiano de enseñanza bíblica en YouTube, en ${R.lang === "en" ? "inglés" : "español"}, escribe cinco títulos de 60 caracteres o menos${kw ? `, con "${kw}" dentro de los primeros 60 caracteres` : ""}. Al menos dos como la pregunta que alguien escribiría en YouTube. Cada título debe prometer exactamente lo que promete la apertura del guion. Sin mayúsculas sostenidas, sin groserías, sin términos gráficos, sin prometer sanidad o dinero.
Responde solo con JSON: {"titles": ["..."]}

PROMESA DE LA APERTURA: ${prom.slice(0, 600)}

GUION (inicio):
"""
${state.text.slice(0, 6000)}
"""`;
    const res = await sample.json(prompt, { modelTier: "default" });
    const ts = (res && Array.isArray(res.titles) ? res.titles : []).map((x) => String(x).trim()).filter((x) => x && x.length <= 60).slice(0, 5);
    if (!ts.length) throw { code: "invalid_json" };
    return ts;
  });
}
function coachAiIdea() {
  coachAiAsk(async () => {
    const sample = await caps.sample; if (!sample) throw { code: "no_sample" };
    IDEA.busy = false;
    await ideaSuggest(true);
    const v = IDEA.sug; IDEA.sug = ""; if (typeof renderIdeaSug === "function") renderIdeaSug(); // the suggestion lives here as a choice, not in the Publish step
    if (!v) throw { code: "invalid_json" };
    return [v];
  });
}
function coachAct(act) {
  const d = COACH.list[0];
  if (act === "walker") return coachSetOn(false);
  if (act === "done") return goStep(3);
  if (!d) return;
  const opts = coOptions(d), k = COACH.sel.id === d.id && opts.length ? COACH.sel.k % opts.length : 0;
  if (act === "skip") coachSkip(d);
  else if (act === "prev") coachPrev();
  else if (act === "batch") coachApplyBatch(d);
  else if (act === "answer") coachAnswer(d);
  else if (act === "apply") { COACH.delay = 1100; applyProposal(opts[k], d.card); }
  else if (act === "other") { COACH.sel = { id: d.id, k: (k + 1) % opts.length }; coachRefresh(); }
  else if (act === "write") { COACH.write = { id: d.id, value: d.card.field ? d.card.field.value : state.text.slice(d.at.start, d.at.end), p: null }; coachRefresh(); const b = $("coW"); if (b) b.focus(); }
  else if (act === "ai-title") coachAiTitles();
  else if (act === "ai-idea") coachAiIdea();
  else if (act === "wcancel") { COACH.write = null; coachRefresh(); }
  else if (act === "wcheck") coachManual(d);
  else if (act === "wapply" && COACH.write && COACH.write.p) { COACH.delay = 1100; const p = COACH.write.p; COACH.write = null; applyProposal(p, d.card); }
}

function coachWire() {
  const walk = document.querySelector(".topfix.walk .fx-head");
  if (walk && !walk.querySelector("#coBack")) {
    const b = document.createElement("button");
    b.type = "button"; b.id = "coBack"; b.className = "small linkish"; b.textContent = t("coBack");
    b.addEventListener("click", () => coachSetOn(true));
    walk.appendChild(b);
  }
  const root = document.querySelector(".topfix.coach");
  if (!root) return;
  root.querySelectorAll("[data-co]").forEach((b) => b.addEventListener("click", () => coachAct(b.dataset.co)));
  const show = (a, b) => { const r = wkRange(a, b); if (r) { wkScrollTo(r); wkFlash([r]); } };
  root.querySelectorAll("[data-co-it]").forEach((b) => b.addEventListener("click", () => { const it = COACH.list[0].items[+b.dataset.coIt]; if (it) show(it.start, Math.max(it.end, it.start + 1)); }));
  root.querySelectorAll(".fx-ev[data-es]").forEach((el) => {
    el.setAttribute("role", "button"); el.tabIndex = 0; el.title = t("wkLoc");
    const go = () => show(+el.dataset.es, +el.dataset.ee);
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  root.querySelectorAll("li.fx-done > .fx-top").forEach((top) => {
    const tg = () => { const li = top.closest("li"), on = !li.classList.contains("open"); li.classList.toggle("open", on); top.setAttribute("aria-expanded", on ? "true" : "false"); };
    top.addEventListener("click", tg);
    top.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(); } });
  });
  const lg = root.querySelector("details.cc-log");
  if (lg) lg.addEventListener("toggle", () => { COACH.logOpen = lg.open; });
  root.querySelectorAll('input[name="coChoice"]').forEach((r) => r.addEventListener("change", () => {
    COACH.q.sel = r.value === "own" ? -1 : +r.value;
    const b = $("coOwnBox"); if (b) { b.hidden = r.value !== "own"; if (r.value === "own") $("coAns").focus(); }
  }));
  const w = $("coW");
  if (w) w.addEventListener("input", () => { if (COACH.write) COACH.write.value = w.value; });
  // Enter = the main button, → = skip, ← = previous; never while typing in a box, and Enter on a button/link keeps its own meaning
  root.addEventListener("keydown", (e) => {
    const tg = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || /^(TEXTAREA|INPUT|SELECT)$/.test(tg.tagName)) return;
    const click = (sel) => { const b = root.querySelector(sel); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (e.key === "ArrowRight") click('[data-co="skip"]');
    else if (e.key === "ArrowLeft") click('[data-co="prev"]');
    else if (e.key === "Enter" && !/^(BUTTON|A|SUMMARY)$/.test(tg.tagName) && !tg.closest("[role=button]")) click("[data-co-primary]");
  });
}

// ---- hooks (this file loads after walk_ui.js and rail_ui.js so it can wrap them) ----
const _topFixHTMLC = topFixHTML;
topFixHTML = function (R) { return coachOn() && wkBuild() ? coachHTML(R) : _topFixHTMLC(R); };
const _wireFixesC = wireFixes;
wireFixes = function () { _wireFixesC(); coachWire(); };
const _renderGuideC = renderGuide;
renderGuide = function () { _renderGuideC(); coachAfterRender(); };
const _renderResultsC = renderResults;
renderResults = function () { _renderResultsC(); if (!V.guided) coachAfterRender(); };
$("runBtn").addEventListener("click", () => { Object.assign(COACH, { order: [], key: "", R: null, total: 0, hist: [], sel: { id: "", k: 0 }, write: null, curId: "", delay: 0 }); }, true);

// Score popover rows and timeline / minimap markers: in coach mode they jump to the decision that holds that check or paragraph.
// No such decision (already resolved, or not in the queue): the walker behaviour as before.
function coachJump(k) {
  const d = COACH.list[k];
  COACH.list.splice(k, 1); COACH.list.unshift(d);
  COACH.sel = { id: "", k: 0 }; COACH.write = null; COACH.curId = "";
  COACH.delay = 0;
  if (V.guided) renderGuide(); else renderResults();
}
const _scGoRowC = scGoRow;
scGoRow = function (id) {
  if (!V.guided || !coachOn()) return _scGoRowC(id);
  scClosePop();
  if (!ensureReview()) return;
  if (V.step !== 2) goStep(2);
  if (!wkBuild()) return _scGoRowC(id);
  coachBuild();
  const k = COACH.list.findIndex((d) => d.id === id || (d.ids && d.ids.includes(id)));
  if (k < 0) return _scGoRowC(id);
  coachJump(k);
};
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".timeline .mk, .rl-mini .mk");
  if (!b || !coachOn() || !V.guided || V.step !== 2 || !wkBuild()) return;
  const pos = wkMarkerPos(b);
  if (pos < 0) return;
  coachBuild();
  const bi = wkBlockAt(WK.blocks, pos), k = COACH.list.findIndex((d) => d.at && wkBlockAt(WK.blocks, d.at.start) === bi);
  if (k < 0) return;
  e.stopImmediatePropagation(); // walk_ui's handler would open the walker paragraph
  coachJump(k);
}, true);
