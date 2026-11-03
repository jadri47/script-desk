/* ===== Step 2, first screen: «Secciones principales» (Opus 5.5, tier "sections") ===== */
// (Adrian, 2026-11-01: "opus 5.5 to take care of the gancho, promesa, introduccion, retention and cierre"; "two separate sections
// ... in separate screens"; picks 1A 2A 3A 5A.) The five main sections are boxed over the editor (overlay, the editor DOM is not
// touched), one card at a time on the right; a section is fixed («fijada») once reviewed and the detailed review leaves it alone.
// Saved with the episode (optional fields, old episodes load unchanged): secReport (the vetted answer, keyed to the text it read),
// secLocks {k: true} and secBounds {k: startChar} («Ajustar límites»).
// Until step 6 splits the bar, this is the first screen of step 2; «Seguir con la revisión detallada» shows today's report walk, and
// the full report call waits until then (no Sonnet call is paid while the person is still on the main sections).
Object.assign(T.es, {
  secTitle: "Secciones principales", secLead: "Las cinco partes que deciden si alguien se queda. Revísalas primero; después viene la revisión detallada del resto.",
  secName: { hook: "Gancho", promise: "Promesa", intro: "Introducción", body: "Retención", close: "Cierre" },
  secBox: { hook: "Gancho", promise: "Promesa", intro: "Introducción", body: "Desarrollo · retención", close: "Cierre" },
  secReading: "La IA está leyendo las secciones principales como lo haría un editor", secMissing: "No encontrada", secLocked: "Fijada", secReopen: "Volver a abrir",
  secApply: "Aplicar y fijar", secWrite: "Lo escribo yo", secFine: "Está bien así", secAdjust: "Ajustar límites", secCancel: "Cancelar",
  secAdjustHint: (k) => `Toca en el guion el párrafo donde empieza ${k}.`, secAdjustBad: "Ese párrafo no puede ser ese inicio: el orden es gancho, promesa, introducción, desarrollo y cierre.",
  secWriteHint: "Edita esta sección en el guion. Cuando termines, fíjala.", secWriteDone: "Listo, fijar", secNoItem: "La IA no propone cambios en esta sección.",
  secMissingCard: (k) => `No encontré ${k} en el guion. Ajusta los límites si está, o fíjala para seguir sin ella.`, secAllDone: "Secciones principales listas",
  secAllDoneLead: "Las cinco secciones están fijadas. La revisión detallada se ocupa del resto del guion.", secToDetail: "Seguir con la revisión detallada",
  secStale: "Los límites guardados ya no encajan con el guion; uso los detectados.", secProg: (i, n) => `Sección ${i} de ${n}`, secBefore: "Antes", secPick: "Elige", secWhy: "Por qué",
  secRating: "Valoración", secPerOpus: "según el editor", secRetry: "Volver a intentar", secRehooks: (n) => `${n} puntos de enganche`, secRehookGap: "falta uno aquí",
});
Object.assign(T.en, {
  secTitle: "Main sections", secLead: "The five parts that decide whether someone stays. Review them first; the detailed review of the rest comes after.",
  secName: { hook: "Hook", promise: "Promise", intro: "Introduction", body: "Retention", close: "Close" },
  secBox: { hook: "Hook", promise: "Promise", intro: "Introduction", body: "Body · retention", close: "Close" },
  secReading: "The AI is reading the main sections the way an editor would", secMissing: "Not found", secLocked: "Fixed", secReopen: "Reopen",
  secApply: "Apply and fix", secWrite: "I'll write it", secFine: "It's fine as is", secAdjust: "Adjust boundaries", secCancel: "Cancel",
  secAdjustHint: (k) => `Tap the paragraph in the script where the ${k.toLowerCase()} starts.`, secAdjustBad: "That paragraph can't be that start: the order is hook, promise, introduction, body and close.",
  secWriteHint: "Edit this section in the script. When you're done, fix it.", secWriteDone: "Done, fix it", secNoItem: "The AI proposes no changes in this section.",
  secMissingCard: (k) => `I didn't find the ${k.toLowerCase()} in the script. Adjust the boundaries if it's there, or fix it to go on without it.`, secAllDone: "Main sections done",
  secAllDoneLead: "All five sections are fixed. The detailed review takes care of the rest of the script.", secToDetail: "Go on to the detailed review",
  secStale: "The saved boundaries no longer fit the script; using the detected ones.", secProg: (i, n) => `Section ${i} of ${n}`, secBefore: "Before", secPick: "Choose", secWhy: "Why",
  secRating: "Rating", secPerOpus: "per the editor", secRetry: "Try again", secRehooks: (n) => `${n} re-hook points`, secRehookGap: "one missing here",
});

const SX = { busy: false, err: "", epoch: 0, pick: null, writing: null, adjust: null, msg: "", detail: false, skip: new Set(), sel: {} };
Object.assign(G, { secReport: null, secLocks: {}, secBounds: {}, reportOld: null });
const secKeyOf = (text) => coHash(text || "");

// ---- saved shape (optional; anything malformed is dropped, never coerced into something else) ----
function secClean(r) {
  if (!r || typeof r !== "object" || typeof r.key !== "string") return null;
  const areas = {};
  for (const k of SEC_AREAS) { const a = r.areas && r.areas[k]; const v = a && Number.isInteger(a.rating) && a.rating >= 1 && a.rating <= 5 ? a.rating : null; areas[k] = { rating: v, why: String((a && a.why) || "").slice(0, 300) }; }
  const items = (Array.isArray(r.items) ? r.items : []).filter((x) => x && MAIN_SECS.includes(x.sec) && typeof x.original === "string" && typeof x.replacement === "string").slice(0, 14)
    .map((x) => ({ sec: x.sec, area: String(x.area || ""), original: x.original, replacement: x.replacement, alts: (Array.isArray(x.alts) ? x.alts : []).filter((a) => typeof a === "string").slice(0, 2), why: String(x.why || "").slice(0, 400), after: Number.isInteger(x.after) ? x.after : null }));
  const out = { at: String(r.at || ""), key: r.key, areas, items };
  if (Number.isFinite(r.costUsd) && r.costUsd >= 0) out.costUsd = r.costUsd;
  return out;
}
const secCleanLocks = (o) => { const out = {}; if (o && typeof o === "object") for (const k of MAIN_SECS) if (o[k] === true) out[k] = true; return out; };
const secCleanBounds = (o) => { const out = {}; if (o && typeof o === "object") for (const k of MAIN_SECS) if (Number.isInteger(o[k]) && o[k] >= 0) out[k] = o[k]; return out; };
const _prodBodySx = prodBody;
prodBody = function (now) {
  const b = _prodBodySx(now);
  if (G.secReport) b.secReport = G.secReport;
  if (Object.keys(G.secLocks).length) b.secLocks = { ...G.secLocks };
  if (Object.keys(G.secBounds).length) b.secBounds = { ...G.secBounds };
  if (G.reportOld) b.reportOld = G.reportOld;
  return b;
};
const _applyProdSx = applyProd;
applyProd = function (id, d) {
  _applyProdSx(id, d);
  G.secReport = secClean(d && d.secReport); G.secLocks = secCleanLocks(d && d.secLocks); G.secBounds = secCleanBounds(d && d.secBounds); G.reportOld = rpClean(d && d.reportOld);
  SX.epoch++; SX.busy = false; SX.err = ""; SX.pick = null; SX.writing = null; SX.adjust = null; SX.msg = ""; SX.detail = false; SX.skip = new Set(); SX.sel = {};
};

// ---- the sections of the text now ----
function secNow() {
  const text = state.text || "", R = state.result;
  if (!R || !text.trim()) return { list: [], missing: MAIN_SECS.slice(), stale: false, text };
  const m = mainSections(text, R, G.secBounds);
  return { ...m, text };
}
// B-062 (jadri47, 2026-11-02, pick B): before the review is read, a main section that starts mid-paragraph is moved to its own
// paragraph (secSplitText: one paragraph break, no word changes), so its box never shares a line with the one before. Runs on
// every review of the 4-step flow, ahead of the first report call (rpPrepare → ensureReview), so that call reads the split text.
const _ensureReviewSx = ensureReview;
ensureReview = function () {
  const ok = _ensureReviewSx.apply(this, arguments);
  if (!ok || !V.guided || !secBarOn() || !state.result || !state.text) return ok;
  const sp = secSplitText(state.text, mainSections(state.text, state.result, G.secBounds).list);
  if (!sp) return ok;
  for (const k of Object.keys(G.secBounds || {})) if (Number.isInteger(G.secBounds[k])) G.secBounds[k] = sp.map(G.secBounds[k]);
  $("script").value = sp.text; // the editor follows the textarea (editor_ui.js)
  state.text = sp.text; state.opts = readOpts(); state.result = analyze(state.text, state.opts);
  if (G.prodId) markDirty();
  return ok;
};
// an item is pending while its original is still in the text exactly once and nobody skipped it
function secItems(k) {
  if (!G.secReport) return [];
  const text = state.text || "";
  return G.secReport.items.map((it, i) => ({ ...it, i })).filter((it) => it.sec === k && !SX.skip.has(it.i) && text.indexOf(it.original) >= 0 && text.indexOf(it.original) === text.lastIndexOf(it.original));
}
function secCurrent(sec) {
  if (SX.pick && !G.secLocks[SX.pick]) return SX.pick;
  return MAIN_SECS.find((k) => !G.secLocks[k] && (sec.list.some((s) => s.k === k) || secItems(k).length)) || null;
}

// ---- the AI call ----
async function secRun() {
  if (SX.busy || !hasScript() || !ensureReview()) return;
  const epoch = ++SX.epoch, text = state.text, R = state.result, opts = state.opts, sec = mainSections(text, R, G.secBounds);
  if (!sec.list.length) return;
  SX.busy = true; SX.err = ""; let cost = null;
  const onCost = (e) => { const u = e && e.detail; if (u && u.cost_usd != null) cost = Number(u.cost_usd); };
  window.addEventListener("sd-ai-cost", onCost);
  renderGuide();
  try {
    const sample = await caps.sample;
    if (!sample) throw { code: "no_ai" };
    const res = await sample.json(sectionsPrompt(text, R, sec), { modelTier: "sections", aiLabel: t("secTitle"), aiRetry: () => secRun() });
    if (epoch !== SX.epoch) return;
    const v = vetSections(text, res, opts, R, sec);
    if (!SEC_AREAS.some((k) => v.areas[k].rating != null)) throw { code: "invalid_json" };
    G.secReport = secClean({ at: new Date().toISOString(), key: secKeyOf(text), areas: v.areas, items: v.items, costUsd: cost });
    markDirty();
  } catch (e) {
    if (epoch === SX.epoch) SX.err = typeof errText === "function" ? errText(e) : String((e && e.code) || e);
  } finally {
    window.removeEventListener("sd-ai-cost", onCost);
    if (epoch === SX.epoch) { SX.busy = false; renderGuide(); }
  }
}
function secPrepare() {
  if (!hasScript() || !ensureReview()) return;
  // once per episode, like the report: applying its own changes moves the text, which must not buy a second answer (pwsecs)
  if (G.secReport || SX.busy || SX.err) return;
  secRun();
}
// «Borrar todo» / «+ Nuevo episodio» start a new episode: the old answer, locks and boundaries belong to the one left
const _startNewProdSx = startNewProd;
startNewProd = function () { _startNewProdSx(); G.reportOld = null; G.secReport = null; G.secLocks = {}; G.secBounds = {}; SX.epoch++; SX.busy = false; SX.err = ""; SX.pick = null; SX.writing = null; SX.adjust = null; SX.msg = ""; SX.detail = false; SX.skip = new Set(); SX.sel = {}; };
// today's full report waits while the main sections are on screen (it starts on «Seguir con la revisión detallada»)
const _rpPrepareSx = rpPrepare;
rpPrepare = function () {
  if (secScreenOn()) { secPrepare(); return; }
  if (RP.noAI && !G.report && G.reportOld) { G.report = G.reportOld; G.reportOld = null; } // no AI here (guest, not a member): the old report is better than none
  if (secDetailRedo()) { G.reportOld = G.report; G.report = null; }
  _rpPrepareSx();
};
// B-056 (Adrian, 2026-11-01, 1A): a report made before the two screens (no `detail`) re-raises the main sections on the detailed
// screen. There it counts as missing: one detailed call runs. The old report is kept whole as `reportOld` (never shown, never
// deleted); the applied-changes log (state.fixLog) is not touched. A failed call shows its Reintentar; no AI at all puts it back.
function secDetailRedo() {
  return !!(V.guided && V.step === 2 && SX.detail && secDetailOn() && G.report && G.report.detail !== true && hasScript() && !RP.busy && !RP.failed && !RP.noAI);
}
// sd-secs-off=1 skips this screen (mock_sb.js sets it so the older step-2 suites keep testing the report walk; pwsecs turns it on)
function secScreenOn() { let off = false; try { off = localStorage.getItem("sd-secs-off") === "1"; } catch (e) { /* no storage: the screen stays on */ } return !!(V.guided && V.step === 2 && !SX.detail && !off && hasScript()); }

// ---- the panel ----
function secRowHTML(k, sec, cur) {
  const s = sec.list.find((x) => x.k === k), a = G.secReport && G.secReport.areas[k === "intro" ? "hook" : k === "body" ? "retention" : k];
  const st = G.secLocks[k] ? `<span class="sx-st ok">✓ ${h(t("secLocked"))}</span> <button type="button" class="small linkish" data-sx-reopen="${k}">${h(t("secReopen"))}</button>`
    : !s ? `<span class="sx-st">${h(t("secMissing"))}</span>` : `<span class="sx-st">${a && a.rating != null && k !== "intro" ? `<span aria-label="${a.rating} / 5">${rpDots(a.rating)}</span>` : ""}</span>`;
  return `<li class="sx-row sx-${k}${k === cur ? " cur" : ""}${G.secLocks[k] ? " done" : ""}"><button type="button" class="sx-go" data-sx-pick="${k}"${G.secLocks[k] ? " disabled" : ""}><span class="sx-dot" aria-hidden="true"></span>${h(t("secName")[k])}${s ? `<small> · ${h(fmtTime(s.t0))}</small>` : ""}</button>${st}</li>`;
}
function secCardHTML(k, sec) {
  const s = sec.list.find((x) => x.k === k), name = t("secName")[k];
  const area = k === "intro" ? null : k === "body" ? "retention" : k;
  const a = area && G.secReport ? G.secReport.areas[area] : null;
  const head = `<div class="sx-head"><b>${h(name)}</b>${s ? `<span class="hint"> · ${h(fmtTime(s.t0))}–${h(fmtTime(s.t1))}</span>` : ""}${a && a.rating != null ? `<span class="sx-rate">${h(t("secRating"))} <span aria-label="${a.rating} / 5">${rpDots(a.rating)}</span></span>` : ""}</div>${a && a.why ? `<p class="sx-why">${h(a.why)}</p>` : ""}`;
  const adjust = SX.adjust === k ? `<p class="status" role="status">${h(t("secAdjustHint")(name.toLowerCase()))} <button type="button" class="small" data-sx="adjust-x">${h(t("secCancel"))}</button></p>` : "";
  if (SX.writing === k) return `<div class="sx-card">${head}<p>${h(t("secWriteHint"))}</p><div class="actions"><button type="button" class="primary sx-primary" data-sx="lock">${h(t("secWriteDone"))}</button><button type="button" class="small" data-sx="write-x">${h(t("secCancel"))}</button></div></div>`;
  if (!s && !secItems(k).length) return `<div class="sx-card">${head}<p>${h(t("secMissingCard")(name))}</p>${adjust}<div class="actions"><button type="button" class="primary sx-primary" data-sx="lock">${h(t("secFine"))}</button><button type="button" class="small linkish" data-sx="adjust">${h(t("secAdjust"))}</button></div></div>`;
  const it = secItems(k)[0];
  let body = `<p class="hint">${h(t("secNoItem"))}</p>`;
  if (it) {
    const opts = [it.replacement, ...it.alts], pick = Math.min(SX.sel[it.i] || 0, opts.length - 1);
    body = `<div class="sx-kv"><span class="k">${h(t("secBefore"))}</span><span class="v sx-old">${h(it.original)}</span></div>
      <div class="sx-kv"><span class="k">${h(t("secPick"))}</span><div class="sx-opts" role="radiogroup" aria-label="${h(t("secPick"))}">${opts.map((o, j) => `<label class="sx-opt${j === pick ? " sel" : ""}"><input type="radio" name="sxPick" value="${j}"${j === pick ? " checked" : ""}> <span>${h(o)}</span></label>`).join("")}</div></div>
      <div class="sx-kv"><span class="k">${h(t("secWhy"))}</span><span class="v">${h(it.why)}${it.after ? ` <span class="hint">· ${rpDots(it.after)} ${h(t("secPerOpus"))}</span>` : ""}</span></div>`;
  }
  return `<div class="sx-card">${head}${body}${adjust}<div class="actions">${it ? `<button type="button" class="primary sx-primary" data-sx="apply" data-sx-i="${it.i}">${h(t("secApply"))} →</button>` : ""}<button type="button" class="${it ? "small" : "primary sx-primary"}" data-sx="${it ? "write" : "lock"}">${h(it ? t("secWrite") : t("secFine"))}</button>${it ? `<button type="button" class="small" data-sx="fine">${h(t("secFine"))}</button>` : ""}<button type="button" class="small linkish" data-sx="adjust">${h(t("secAdjust"))}</button></div></div>`;
}
function secPanelHTML() {
  const sec = secNow();
  const head = `<header class="g-h sx-h"><h2>${h(t("secTitle"))}</h2></header><p class="lead">${h(t("secLead"))}</p>`;
  if (SX.busy) return `<section class="sx" data-sx-root>${head}<div class="rp-wait" role="status"><div class="rp-wait-h"><span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>${h(t("secReading"))}</b></div><p>${h(t("rpNoAnswer"))} <span aria-hidden="true">${h(t("rpSoFar"))} <b class="rp-el" data-ai-el>0:00</b></span></p></div></section>`;
  const err = SX.err ? `<p class="status err" role="alert">${h(SX.err)}</p><div class="actions"><button type="button" class="small primary" data-sx="retry">${h(t("secRetry"))}</button></div>` : "";
  const cur = secCurrent(sec);
  const done = MAIN_SECS.filter((k) => G.secLocks[k]).length;
  const prog = `<div class="sx-prog" aria-label="${h(t("secProg")(Math.min(done + 1, 5), 5))}">${MAIN_SECS.map((k) => `<span class="${G.secLocks[k] ? "d" : k === cur ? "c" : ""}"></span>`).join("")}</div>`;
  const rows = `<ul class="sx-rows">${MAIN_SECS.map((k) => secRowHTML(k, sec, cur)).join("")}</ul>`;
  const stale = sec.stale ? `<p class="status warn" role="status">${h(t("secStale"))}</p>` : "";
  const msg = SX.msg ? `<p class="status" role="status">${h(SX.msg)}</p>` : "";
  const card = cur ? secCardHTML(cur, sec) : `<div class="sx-card sx-end"><b>${h(t("secAllDone"))}</b><p>${h(t("secAllDoneLead"))}</p><div class="actions"><button type="button" class="primary sx-primary" data-sx="detail">${h(t("secToDetail"))} →</button></div></div>`;
  return `<section class="sx" data-sx-root>${head}${err}${stale}${msg}${prog}${rows}${card}</section>`;
}
function secAct(act, el) {
  const sec = secNow(), cur = secCurrent(sec);
  SX.msg = "";
  if (act === "retry") { SX.err = ""; secRun(); return; }
  if (act === "detail") { SX.detail = true; secBoxesOff(); renderGuide(); return; }
  if (act === "write") { SX.writing = cur; const s = sec.list.find((x) => x.k === cur); if (s) edScrollToText(state.text.slice(s.start, s.start + 60)); renderGuide(); return; }
  if (act === "write-x") { SX.writing = null; renderGuide(); return; }
  if (act === "adjust") { SX.adjust = cur || "hook"; renderGuide(); return; }
  if (act === "adjust-x") { SX.adjust = null; renderGuide(); return; }
  if (act === "fine" || act === "lock") { if (cur) { G.secLocks[cur] = true; for (const it of secItems(cur)) SX.skip.add(it.i); } SX.writing = null; SX.pick = null; markDirty(); renderGuide(); return; }
  if (act === "apply") {
    const i = Number(el.dataset.sxI), it = G.secReport && G.secReport.items[i];
    if (!it) return;
    const opts = [it.replacement, ...it.alts], rep = opts[Math.min(SX.sel[i] || 0, opts.length - 1)];
    const at = state.text.indexOf(it.original);
    if (at < 0) { renderGuide(); return; }
    const v0 = $("script").value;
    applyProposal({ kind: "patch", label: t("secName")[it.sec], patches: [{ start: at, end: at + it.original.length, rep }] }, { id: "sx-" + i, ids: ["sx-" + i], label: t("secName")[it.sec], fix: it.why });
    if ($("script").value === v0) return; // the stale guard refused and re-ran the review; nothing to lock
    SX.skip.add(i);
    if (!secItems(it.sec).length) G.secLocks[it.sec] = true;
    markDirty();
    renderGuide();
  }
}
function secWire(root) {
  root.querySelectorAll("[data-sx]").forEach((b) => b.addEventListener("click", () => secAct(b.dataset.sx, b)));
  root.querySelectorAll("[data-sx-pick]").forEach((b) => b.addEventListener("click", () => { SX.pick = b.dataset.sxPick; SX.writing = null; SX.adjust = null; renderGuide(); }));
  root.querySelectorAll("[data-sx-reopen]").forEach((b) => b.addEventListener("click", () => { delete G.secLocks[b.dataset.sxReopen]; SX.pick = b.dataset.sxReopen; markDirty(); renderGuide(); }));
  root.querySelectorAll("input[name=sxPick]").forEach((r) => r.addEventListener("change", () => { const b = root.querySelector("[data-sx=apply]"); if (b) { SX.sel[Number(b.dataset.sxI)] = Number(r.value); root.querySelectorAll(".sx-opt").forEach((l) => l.classList.toggle("sel", l.contains(r))); } }));
}

// ---- «Ajustar límites»: the next tap in the script sets where the section starts (its paragraph's start) ----
function secTap(e) {
  if (!SX.adjust || !secScreenOn() || !ED.el || !ED.el.contains(e.target)) return;
  if (typeof wkBuild === "function") wkBuild();
  const sel = getSelection(), node = sel && sel.anchorNode, off = sel ? sel.anchorOffset : 0;
  const pos = node && typeof wkOffsetOf === "function" ? wkOffsetOf(node, off) : -1;
  const bi = pos >= 0 && typeof wkBlockAt === "function" && WK.blocks.length ? wkBlockAt(WK.blocks, pos) : -1, blk = bi >= 0 ? WK.blocks[bi] : null;
  if (!blk) return;
  const k = SX.adjust, next = { ...G.secBounds, [k]: blk.s };
  const m = mainSections(state.text, state.result, next);
  if (m.stale) { SX.msg = t("secAdjustBad"); renderGuide(); return; }
  G.secBounds = next; SX.adjust = null; markDirty(); renderGuide();
}
document.addEventListener("pointerup", (e) => setTimeout(() => secTap(e), 0), true);

// ---- overlays that move with the text (jadri47, 2026-11-02: the boxes were "wobbly" while scrolling) ----
// They were re-measured on every scroll frame (~11 ms on a 5,000-word script) while the browser scrolls the text on its own, so they
// trailed it. Now a layer is laid out once in the editor's content coordinates and a scroll only slides its track: with
// scroll-driven animations (Chrome 115+, Safari 26) the slide runs with the scroll itself; elsewhere the scroll handler sets it.
const ED_TL = typeof CSS !== "undefined" && !!CSS.supports && CSS.supports("animation-timeline: --sd-ed");
const ED_LAYERS = new Set();
function edLayer(layer, relayout) {
  const el = ED.el, wr = ED.wrap.getBoundingClientRect(), er = el.getBoundingClientRect(), st = el.scrollTop;
  Object.assign(layer.style, { inset: "auto", left: Math.round(er.left - wr.left) + "px", top: Math.round(er.top - wr.top) + "px", width: Math.round(er.width) + "px", height: Math.round(er.height) + "px" });
  let tr = layer.firstElementChild;
  if (!tr || !tr.classList.contains("ed-track")) { layer.innerHTML = '<div class="ed-track"></div>'; tr = layer.firstElementChild; }
  tr.style.height = el.scrollHeight + "px";
  tr.style.setProperty("--ed-max", String(Math.max(0, el.scrollHeight - el.clientHeight)));
  if (!ED_TL) tr.style.transform = `translateY(${-st}px)`;
  layer._sh = el.scrollHeight; layer._relayout = relayout; ED_LAYERS.add(layer);
  return { tr, X: (x) => Math.round(x - er.left), Y: (y) => Math.round(y - er.top + st), er };
}
document.addEventListener("scroll", (e) => {
  if (!ED.el || e.target !== ED.el) return; // a page scroll moves the editor and its layers together
  for (const ly of ED_LAYERS) {
    if (!ly.isConnected) { ED_LAYERS.delete(ly); continue; }
    const tr = ly.firstElementChild;
    if (!tr) continue;
    if (!ED_TL) tr.style.transform = `translateY(${-ED.el.scrollTop}px)`;
    if (ED.el.scrollHeight !== ly._sh && ly._relayout) ly._relayout(); // the text changed height since the layout
  }
}, true);

// ---- the boxes over the editor ----
const SXB = { layer: null, raf: 0 };
function secBoxesOff() { if (SXB.layer) SXB.layer.innerHTML = ""; document.documentElement.classList.remove("sx-on"); }
function secBoxes() {
  if (!secScreenOn() || !ED.el || !ED.wrap) { secBoxesOff(); return; }
  if (typeof wkBuild === "function") wkBuild();
  if (typeof wkRange !== "function") return;
  document.documentElement.classList.add("sx-on"); // the editor gets a left margin for the labels (guide.css): they never cover a word
  if (!SXB.layer || !SXB.layer.isConnected) { SXB.layer = document.createElement("div"); SXB.layer.className = "sx-layer"; SXB.layer.setAttribute("aria-hidden", "true"); ED.wrap.appendChild(SXB.layer); }
  const sec = secNow(), cur = secCurrent(sec), L = edLayer(SXB.layer, secBoxesSched), er = L.er;
  const out = [];
  // the whole script is laid out (content coordinates); the layer clips to the editor and slides with its scroll
  for (const s of sec.list) {
    let r;
    try { r = wkRange(s.start, Math.max(s.start + 1, s.end)); } catch (e) { r = null; }
    const rs = r ? [...r.getClientRects()].filter((x) => x.height > 0) : [];
    if (!rs.length) continue;
    const top = L.Y(rs[0].top) - 6, bot = L.Y(rs[rs.length - 1].bottom) + 6;
    out.push(`<div class="sx-box sx-${s.k}${s.k === cur ? " cur" : ""}${G.secLocks[s.k] ? " done" : ""}" style="top:${top}px;height:${bot - top}px;left:6px;width:${Math.round(er.width - 12)}px"><span class="sx-lbl">${h(t("secBox")[s.k])}${G.secLocks[s.k] ? " ✓" : ""}</span></div>`);
  }
  for (const p of rehookPoints(state.text, state.result, sec.list)) {
    let r;
    try { r = wkRange(p.pos, p.pos + 1); } catch (e) { r = null; }
    const rr = r && r.getClientRects()[0];
    if (!rr) continue;
    out.push(`<div class="sx-rh${p.gap ? " gap" : ""}" style="top:${L.Y(rr.top) - 2}px;left:6px;width:${Math.round(er.width - 12)}px"><span>${h(fmtTime(p.t))}${p.gap ? " · " + h(t("secRehookGap")) : ""}</span></div>`);
  }
  L.tr.innerHTML = out.join("");
}
function secBoxesSched() { if (SXB.raf) return; SXB.raf = requestAnimationFrame(() => { SXB.raf = 0; secBoxes(); }); }
window.addEventListener("resize", secBoxesSched);

// ===== Step 5: the detailed review leaves the main sections alone (5A) and the score reads both answers (6A) =====
// Active once the main sections have an answer (G.secReport): before that (old episodes, the artifact, sd-secs-off) everything is
// as it was. Red ad risks stay even inside a fixed section: a script that loses its ads can't wait for «Volver a abrir».
const SEC_CARD_IDS = new Set(["hook", "promise", "greeting", "content", "kwopen", "cta", "ending", "recap", "application", "bigidea", "rehook"]);
const secDetailOn = () => !!G.secReport && Object.keys(G.secLocks).length > 0;
function secLockedRanges() {
  if (!secDetailOn() || !state.result || !state.text) return [];
  return detailLocked(mainSections(state.text, state.result, G.secBounds), G.secLocks);
}
const secHitsLocked = (a, b, L) => L.some((r) => a < r.end && b > r.start);
const _buildFixCardsSx = buildFixCards;
buildFixCards = function () {
  const cards = _buildFixCardsSx.apply(this, arguments);
  if (!secDetailOn()) return cards;
  const L = secLockedRanges();
  const out = [];
  for (const c of cards) {
    if (SEC_CARD_IDS.has(c.id)) continue;
    const ev = Array.isArray(c.evidence) ? c.evidence.filter((e) => !secHitsLocked(e.start, e.end, L)) : c.evidence;
    if (Array.isArray(c.evidence) && c.evidence.length && !ev.length) continue;
    const props = Array.isArray(c.proposals) ? c.proposals.filter((p) => !(p.patches || []).some((x) => secHitsLocked(x.start, x.end, L))) : c.proposals;
    // B-064 (jadri47, 2026-11-03: "the suggestion is a different text"): the AI rewrites c.ai, set to the first hit before the
    // fixed sections were dropped; move it to the first sentence still shown, or none when nothing is left to point at
    const a = c.ai && c.ai.start != null && secHitsLocked(c.ai.start, c.ai.end, L) ? (ev && ev[0] ? { ...c.ai, start: ev[0].start, end: ev[0].end } : null) : c.ai;
    out.push({ ...c, evidence: ev, proposals: props, ai: a });
  }
  return out;
};
// 6A: the editor part of the score reads Opus's five ratings and Sonnet's voice (only when both answers exist)
const _readinessOfSx = readinessOf;
readinessOf = function (R, report) { const a = [...arguments]; if (report && report === G.report) a[1] = mergeReports(report, G.secReport); return _readinessOfSx.apply(this, a); };
// the report call in detailed mode: voice only, outside the fixed sections
function secReportOpts(base) {
  const L = secLockedRanges();
  return L.length ? { ...base, detail: L.map((r) => ({ name: t("secName")[r.k], start: r.start, end: r.end })) } : base;
}
function secDetailFilter(v) { const L = secLockedRanges(); return L.length ? detailOnly(v, L) : v; }

// the fixed sections drawn closed in the detailed review, with «Volver a abrir» (the screen goes back to them)
function secLockBoxes() {
  if (!(V.guided && V.step === 2 && SX.detail && secDetailOn()) || !ED.el || !ED.wrap) return false;
  if (typeof wkBuild === "function") wkBuild();
  if (!SXB.layer || !SXB.layer.isConnected) { SXB.layer = document.createElement("div"); SXB.layer.className = "sx-layer"; ED.wrap.appendChild(SXB.layer); }
  SXB.layer.removeAttribute("aria-hidden");
  document.documentElement.classList.add("sx-on"); // B-057: labels in the left margin, the text inside stays readable
  const L = edLayer(SXB.layer, secBoxesSched), er = L.er, out = [];
  let free = -1e9; // a short section's label must not sit on the next one's: each label starts below the previous
  for (const r of secLockedRanges()) {
    let rg; try { rg = wkRange(r.start, Math.max(r.start + 1, r.end)); } catch (e) { rg = null; }
    const rs = rg ? [...rg.getClientRects()].filter((x) => x.height > 0) : [];
    if (!rs.length) continue;
    const top = L.Y(rs[0].top) - 4, bot = L.Y(rs[rs.length - 1].bottom) + 4;
    const lt = Math.max(0, free - top); free = top + lt + 52;
    out.push(`<div class="sx-lock sx-${r.k}" style="top:${top}px;height:${bot - top}px;left:6px;width:${Math.round(er.width - 12)}px"><span class="sx-lock-l" style="top:${Math.round(4 + lt)}px" title="${h(t("secLockedIn"))}"><span class="sx-lock-n"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.6" fill="none"/></svg><b>${h(t("secName")[r.k])}</b></span><span class="vh"> · ${h(t("secLockedIn"))} · </span><button type="button" class="linkish" data-sx-unlock="${r.k}">${h(t("secReopen"))}</button></span></div>`);
  }
  L.tr.innerHTML = out.join("");
  SXB.layer.querySelectorAll("[data-sx-unlock]").forEach((b) => b.addEventListener("click", () => { delete G.secLocks[b.dataset.sxUnlock]; SX.pick = b.dataset.sxUnlock; SX.detail = false; markDirty(); renderGuide(); }));
  return true;
}
const _secBoxesBase = secBoxes;
secBoxes = function () { if (secLockBoxes()) return; _secBoxesBase(); };
Object.assign(T.es, { secLockedIn: "fijada en Secciones principales" });
Object.assign(T.en, { secLockedIn: "fixed in Main sections" });
const _renderGuideSx = renderGuide;
renderGuide = function () { _renderGuideSx.apply(this, arguments); secBoxesSched(); }; // boxes or locks follow every redraw, and leave with step 2

// ===== Step 6: the 4-step bar (4A) =====
// Escribir · Secciones principales · Revisión detallada · Publicar. Inside, the app keeps its three steps (step 2 holds both review
// screens, SX.detail says which): every «step 3 = Publicar» in the code stays true. Off only with the test switch sd-secs-off=1.
function secBarOn() { try { return localStorage.getItem("sd-secs-off") !== "1"; } catch (e) { return true; } }
const SX_STEPS = { es: ["Escribir", "Secciones principales", "Revisión detallada", "Publicar"], en: ["Write", "Main sections", "Detailed review", "Publish"] };
for (const [lang, four] of Object.entries(SX_STEPS)) {
  const T0 = T[lang], three = T0.steps, end3 = T0.rpEndStep, prog3 = T0.pubProg, rec3 = T0.pubRecStep;
  const en = lang === "en";
  Object.defineProperty(T0, "steps", { configurable: true, get: () => (secBarOn() ? four : three) });
  Object.defineProperty(T0, "rpEndStep", { configurable: true, get: () => (secBarOn() ? (en ? "Step 3 of 4 · Detailed review" : "Paso 3 de 4 · Revisión detallada") : end3) });
  Object.defineProperty(T0, "pubProg", { configurable: true, get: () => (secBarOn() ? (i, n) => (en ? `Step 4 of 4 · Publish · ${i} of ${n}` : `Paso 4 de 4 · Publicar · ${i} de ${n}`) : prog3) });
  Object.defineProperty(T0, "pubRecStep", { configurable: true, get: () => (secBarOn() ? (en ? "Step 4 of 4 · Record" : "Paso 4 de 4 · Grabar") : rec3) });
}
const _stepBarHTMLSx = stepBarHTML;
stepBarHTML = function () {
  if (!secBarOn()) return _stepBarHTMLSx();
  const names = t("steps"), have = hasScript();
  const cur = V.step === 1 ? 1 : V.step === 2 ? (SX.detail ? 3 : 2) : 4;
  const target = (n) => (n === 1 ? 1 : n === 4 ? 3 : 2);
  const items = names.map((nm, i) => {
    const n = i + 1, on = n === cur, done = n < cur, dis = n > 1 && !have;
    const sx = n === 2 ? ' data-sx-detail="0"' : n === 3 ? ' data-sx-detail="1"' : "";
    return `<li><button type="button" data-step="${target(n)}"${sx} class="${on ? "on" : done ? "done" : ""}"${on ? ' aria-current="step"' : ""}${dis ? " disabled" : ""}><span class="sb-n">${done ? "✓" : n}</span><span class="sb-l">${h(nm)}</span></button></li>`;
  }).join("");
  return `<ol class="sb sb4">${items}</ol>${G.prodId ? `<span class="sb-status">${h(t("statusLbl"))}: <b>${h(t("status")[G.status])}</b></span>` : ""}`;
};
// items 2 and 3 both open internal step 2: say which screen before goStep runs (capture comes first)
document.addEventListener("click", (e) => {
  // «← Atrás» in the detailed review goes back to the main sections, the step before it on the bar
  const back = e.target.closest && e.target.closest("#guide .g-nav-steps [data-step='1']");
  if (back && secBarOn() && V.step === 2 && SX.detail) { SX.detail = false; e.stopPropagation(); renderGuide(); return; }
  const b = e.target.closest && e.target.closest("#stepBar [data-sx-detail]");
  if (!b) return;
  SX.detail = b.dataset.sxDetail === "1";
  if (V.step === 2) { e.stopPropagation(); renderGuide(); }
}, true);

// ===== «Cómo empieza el video» after the main sections (Adrian, 2026-11-03: A "prefill from fixed sections") =====
// With the hook and the promise fixed and no clip picked, the video simply starts as written: that card counts as done and says
// so. Nothing is written to G.cold (no cold-open clip, the timings and the editor sheet stay as they are); picking a clip below
// overrides it, removing that clip comes back to this.
Object.assign(T.es, { coAutoH: "Empieza con tu gancho y tu promesa", coAutoL: "Tal como quedaron fijados en «Secciones principales». Si quieres abrir con otra frase del guion, elígela abajo." });
Object.assign(T.en, { coAutoH: "It starts with your hook and your promise", coAutoL: "As you fixed them in «Main sections». To open with another line from the script, pick it below." });
function coldAuto() {
  if (!G.secLocks || !G.secLocks.hook || !G.secLocks.promise || (G.cold && (G.cold.hook || G.cold.promise))) return null;
  if (!state.result || !state.text) return null;
  const L = mainSections(state.text, state.result, G.secBounds).list, s = (k) => L.find((x) => x.k === k);
  const hk = s("hook"), pr = s("promise");
  if (!hk || !pr) return null;
  const cut = (x) => { const v = state.text.slice(x.start, x.end).replace(/\s+/g, " ").trim(); return v.length > 140 ? v.slice(0, 140) + "…" : v; };
  return { hook: cut(hk), promise: cut(pr) };
}
const _pubItemsSx = pubItems;
pubItems = function () {
  const its = _pubItemsSx.apply(this, arguments), a = coldAuto();
  if (a && its[4] && !its[4].done) its[4] = { done: true, val: "«" + (a.hook.length > 60 ? a.hook.slice(0, 60) + "…" : a.hook) + "»" };
  return its;
};
const _renderColdSx = renderCold;
renderCold = function () {
  const r = _renderColdSx.apply(this, arguments), a = coldAuto(), el = $("gCold");
  if (a && el) {
    const hd = el.querySelector(".g-h");
    const box = `<div class="co-auto" role="note"><h3>${h(t("coAutoH"))}</h3><p class="co-auto-t"><span class="co-k">${h(t("coHooks"))}</span> «${h(a.hook)}»</p><p class="co-auto-t"><span class="co-k">${h(t("coProms"))}</span> «${h(a.promise)}»</p><p class="hint">${h(t("coAutoL"))}</p></div>`;
    if (hd) hd.insertAdjacentHTML("afterend", box); else el.insertAdjacentHTML("afterbegin", box);
  }
  return r;
};
