/* ===== Guion y prompter en tres fases: Preparar · Grabar · Después ===== */
// The full-mode tab used to stack seven cards (about 9,000 px). Now it shows one phase at a time,
// merges the rundown and the section-by-section script into one "Estructura" list, and reuses the
// same cards (apertura, empaque, prompter, Shorts, resultados) that the guided steps 3–5 show.
Object.assign(T.es, {
  phases: { prep: "Preparar", rec: "Grabar", after: "Después" },
  phLead: {
    prep: "Decide cómo empieza el video, revisa el orden y prepara el título. Cuando lo obligatorio pase, aprueba el guion.",
    rec: "Todo listo para grabar. El prompter lleva el guion con las secciones y las frases de la apertura marcadas.",
    after: "Después de grabar: anota el próximo episodio, marca clips para Shorts y, con el video publicado, mira dónde se fue la gente.",
  },
  phNext: { prep: "Siguiente: Grabar", rec: "Siguiente: Después" },
  phDone: "listo", phRecorded: "Grabado", phNotYet: "Esta parte se usa después de grabar. Puedes adelantarla, pero lo normal es volver cuando el video ya esté grabado.",
  phItems: { cold: "Apertura elegida", struct: "Estructura sin avisos", pack: "Título y miniatura", approved: "Guion aprobado", reh: "Ensayo hecho", rec: "Grabado", shorts: "Clips para Shorts", res: "Resultados" },
  stLbl: "Estado", stEpisodes: "Mis episodios",
  strTitle: "Estructura", strLead: "Las secciones del guion con su tiempo. Toca una para ver su texto, cambiar su tipo, moverla o dejar notas.",
  strLeadSplit: "Las secciones del guion con su tiempo. Toca una para ir a ella en el guion de la izquierda y ver sus herramientas.",
  strTools: "Tipo de sección", strText: "Texto de la sección", strTap: "Toca una frase para empezar ahí una sección, editarla o usarla en la apertura.",
  strCold: "Apertura en frío", strVideo: (a) => `en el video ${a}`,
  recLen: "Duración estimada", recSecs: (n, w) => `${n} secciones · ${w} palabras`, recLast: (a, b) => `Último ensayo: ${a} (estimado ${b})`,
  recClips: "Frases de la apertura: dilas mirando a la cámara, con una pausa antes y después.", recKeys: "Atajos del prompter",
  recTip: "Ensaya una vez con cronómetro: los tiempos de la estructura y de los capítulos pasan a ser los reales.",
});
Object.assign(T.en, {
  phases: { prep: "Prepare", rec: "Record", after: "After" },
  phLead: {
    prep: "Decide how the video opens, check the order and get the title ready. Once the required checks pass, approve the script.",
    rec: "Ready to record. The prompter carries the script with the sections and the cold-open lines marked.",
    after: "After recording: note the next episode, mark clips for Shorts and, once the video is up, see where people left.",
  },
  phNext: { prep: "Next: Record", rec: "Next: After" },
  phDone: "done", phRecorded: "Recorded", phNotYet: "This part is for after recording. You can get ahead, but usually you come back once the video is recorded.",
  phItems: { cold: "Cold open picked", struct: "Structure without warnings", pack: "Title and thumbnail", approved: "Script approved", reh: "Rehearsal done", rec: "Recorded", shorts: "Clips for Shorts", res: "Results" },
  stLbl: "Status", stEpisodes: "My episodes",
  strTitle: "Structure", strLead: "The script's sections with their timing. Tap one to see its text, change its type, move it or leave notes.",
  strLeadSplit: "The script's sections with their timing. Tap one to jump to it in the script on the left and see its tools.",
  strTools: "Section type", strText: "Section text", strTap: "Tap a line to start a section there, edit it or use it in the cold open.",
  strCold: "Cold open", strVideo: (a) => `in the video ${a}`,
  recLen: "Estimated length", recSecs: (n, w) => `${n} sections · ${w} words`, recLast: (a, b) => `Last rehearsal: ${a} (estimated ${b})`,
  recClips: "Cold-open lines: say them to the camera, with a pause before and after.", recKeys: "Prompter shortcuts",
  recTip: "Rehearse once with the stopwatch: the structure and chapter times become the real ones.",
});
Object.assign(G, { phase: null, stOpen: null });
const PH_KEYS = ["prep", "rec", "after"];
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function phaseDefault() { return G.status === "grabado" ? "after" : G.status === "aprobado" ? "rec" : "prep"; }
function phaseItems() {
  const flagsN = G.secs.reduce((a, s) => a + ((G.flags[s.k] || []).length), 0);
  const approved = G.status === "aprobado" || G.status === "grabado";
  return {
    prep: [["struct", flagsN === 0], ["cold", !!(G.cold.hook || G.cold.promise)], ["pack", G.R ? packGateMissing().length === 0 : false], ["approved", approved]],
    rec: [["reh", G.rehearsals.length > 0], ["rec", G.status === "grabado"]],
    after: [["shorts", (G.shorts || []).length > 0], ["res", !!G.retention]],
  };
}

// ---------- status strip (replaces the old "Producción" box) ----------
renderProdBar = function () {
  const el = $("gProdBar");
  if (!el) return;
  caps.db.then((db) => {
    if (!el.isConnected) return;
    const missing = G.R ? packGateMissing() : [];
    const P = t("pk"), mLabel = (c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase();
    const cur = STATUSES.indexOf(G.status);
    const steps = STATUSES.map((s, i) => {
      const locked = (s === "grabado" && !["aprobado", "grabado"].includes(G.status)) || (s === "aprobado" && G.status !== "aprobado" && G.status !== "grabado" && missing.length > 0);
      const why = s === "grabado" ? t("gGrabadoLock") : t("pkGate")(missing.map(mLabel).join("; "));
      return `<button type="button" class="st-step${i < cur ? " past" : ""}" data-status="${s}" aria-pressed="${G.status === s}"${locked ? ` disabled title="${h(why)}"` : ""}><span class="st-dot" aria-hidden="true">${i < cur ? "✓" : i + 1}</span>${h(t("status")[s])}</button>`;
    }).join("");
    const gate = missing.length && !["aprobado", "grabado"].includes(G.status) && !(G.mode === "guion" && !V.guided && G.phase === "prep") ? `<p class="g-gate st-gate">${h(t("pkGate")(missing.map(mLabel).join("; ")))} <a href="#gPack" data-gopack>${h(t("pkGoFix"))}</a></p>` : "";
    el.innerHTML = `<div class="g-bar st-strip">
      <div class="st-row"><span class="st-lbl">${h(t("stLbl"))}</span><div class="st-steps" role="group" aria-label="${h(t("gStatusLbl"))}">${steps}</div>
        <span class="st-end">${db ? `<span class="status" id="gSaveState">${h(saveText())}</span><button type="button" class="small" id="stEps">${h(t("stEpisodes"))}</button>` : ""}</span></div>
      ${db ? "" : `<p class="hint">${h(t("gNoDb"))}</p>`}${gate}
      ${G.conflict ? `<div class="g-conflict"><span>${h(t("gConflict"))}</span><button class="small" id="gTheirs">${h(t("gLoadTheirs"))}</button><button class="small" id="gMine">${h(t("gOverwrite"))}</button></div>` : ""}
    </div>`;
    el.querySelectorAll("[data-status]").forEach((b) => b.addEventListener("click", () => setStatus(b.dataset.status)));
    const eb = $("stEps"); if (eb) eb.addEventListener("click", openEpSheet);
    el.querySelectorAll("[data-gopack]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goPhase("prep", "gPack"); }));
    const th = $("gTheirs"); if (th) th.addEventListener("click", () => { applyProd(G.prodId, G.conflict); gRefresh(); });
    const mi = $("gMine"); if (mi) mi.addEventListener("click", () => saveProd(true));
    if (G.mode === "guion" && !V.guided) renderPhaseBar();
  });
};

// ---------- phase bar ----------
function renderPhaseBar() {
  const el = $("phBar");
  if (!el) return;
  const items = phaseItems(), names = t("phases");
  el.innerHTML = PH_KEYS.map((k, i) => {
    const list = items[k], done = list.filter((x) => x[1]).length, all = done === list.length;
    const tip = list.map(([id, ok]) => `${ok ? "✓" : "○"} ${t("phItems")[id]}`).join("\n");
    return `<button type="button" role="tab" class="ph-tab ph-${k}${all ? " all" : ""}" data-phase="${k}" aria-selected="${G.phase === k}" title="${h(tip)}">
      <span class="ph-n" aria-hidden="true">${all ? "✓" : i + 1}</span><span class="ph-t"><b>${h(names[k])}</b><span class="ph-p"><i style="--p:${Math.round((done / list.length) * 100)}%"></i><small>${done}/${list.length}</small></span></span></button>`;
  }).join("");
  el.querySelectorAll("[data-phase]").forEach((b) => b.addEventListener("click", () => goPhase(b.dataset.phase)));
}
function phaseScroller() { return SPLIT.on ? $("paneR") : null; }
function goPhase(k, anchor) {
  G.phase = k; lsSet("sd-phase", k);
  renderGuion();
  const target = anchor && $(anchor);
  if (target) target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
}

// ---------- the tab ----------
const _renderGuionPh = renderGuion;
renderGuion = function () {
  if (V.guided) { _renderGuionPh(); return; }
  const root = $("guion");
  if (!root) return;
  if (!G.R) { _renderGuionPh(); return; }
  if (!PH_KEYS.includes(G.phase)) { const saved = lsGet("sd-phase"); G.phase = PH_KEYS.includes(saved) ? saved : phaseDefault(); }
  const k = G.phase, nextK = PH_KEYS[PH_KEYS.indexOf(k) + 1];
  let body = "";
  if (k === "prep") {
    const missing = packGateMissing(), done = G.status === "aprobado" || G.status === "grabado";
    body = `<section class="g-card" id="gStruct"></section><section class="g-card" id="gCold"></section><section class="g-card" id="gTopic"></section><section class="g-card" id="gPack"></section>
      <div class="g-approve" id="phApprove">${approveInner(missing, done)}</div>`;
  } else if (k === "rec") body = recordCardHTML();
  else body = `${G.status !== "grabado" ? `<p class="ph-note">${h(t("phNotYet"))}</p>` : ""}<section class="g-card" id="gNextPlan"></section><section class="g-card" id="gShorts"></section><section class="g-card" id="gRes"></section><section class="g-card" id="gRev"></section>`;
  root.innerHTML = `<div id="gProdBar"></div>
    <nav class="ph-bar" id="phBar" role="tablist" aria-label="${h(t("sections"))}"></nav>
    <div class="ph-pane ph-${k}" id="phPane"><p class="ph-lead">${h(t("phLead")[k])}</p>${body}
      ${nextK ? `<div class="ph-next"><button type="button" class="primary" data-phase-next="${nextK}">${h(t("phNext")[k])} →</button></div>` : ""}</div>
    <div class="g-selbar" id="gSelBar" hidden></div>`;
  renderProdBar(); renderPhaseBar();
  // A new phase starts at its top, not wherever the previous phase was scrolled to.
  if (G.lastPhase !== k) {
    G.lastPhase = k;
    const sc = phaseScroller(), top = root.getBoundingClientRect().top;
    if (sc) { const d = top - sc.getBoundingClientRect().top - 4; if (d < 0) sc.scrollTop += d; }
    else if (top < 0) window.scrollBy(0, top - 8);
  }
  if (k === "prep") { renderCold(); renderStructure(); renderTopic(); renderPack(); wireApprove(); }
  else if (k === "rec") wireRecordCard();
  else { renderNextPlan(); renderShorts(); renderResultsCard(); renderRevisions(); }
  root.querySelectorAll("[data-phase-next]").forEach((b) => b.addEventListener("click", () => goPhase(b.dataset.phaseNext)));
  wireGoMode(root);
};
function approveInner(missing, done) {
  const P = t("pk");
  return done ? `<span class="lamp verde">${h(t("approved"))}</span>`
    : `<button type="button" class="primary" id="gApprove"${missing.length ? " disabled" : ""}>${h(t("approve"))}</button>${missing.length ? `<span class="g-gate">${h(t("pkGate")(missing.map((c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase()).join("; ")))}</span>` : ""}`;
}
function wireApprove() {
  const ap = $("gApprove");
  if (ap) ap.addEventListener("click", async () => { ap.disabled = true; await setStatus("aprobado"); });
}
// Keep the approve button in step with the packaging fields while typing (full mode).
const _renderPackChecksPh = renderPackChecks;
renderPackChecks = function () {
  _renderPackChecksPh();
  if (V.guided || G.mode !== "guion") return;
  const box = $("phApprove");
  if (box && !(G.status === "aprobado" || G.status === "grabado")) { box.innerHTML = approveInner(packGateMissing(), false); wireApprove(); }
  renderPhaseBar();
};
// Status changes move the tab to the phase that comes next.
const _setStatusPh = setStatus;
setStatus = async function (s) {
  const before = G.status;
  if (!V.guided && s !== before) { if (s === "aprobado" && before !== "grabado") G.phase = "rec"; else if (s === "grabado") G.phase = "after"; if (G.phase) lsSet("sd-phase", G.phase); }
  return _setStatusPh(s);
};
const _applyProdPh = applyProd;
applyProd = function (id, d) { _applyProdPh(id, d); G.phase = phaseDefault(); G.stOpen = null; };

// ---------- Estructura: rundown + sections in one list ----------
function flagText(f) {
  const fl = t("flags");
  return f.id === "hookLong" ? fl.hookLong(f.v) : f.id === "promiseLate" ? fl.promiseLate(fmtTime(f.v)) : f.id === "gap" ? fl.gap(fmtTime(f.a), fmtTime(f.b)) : fl[f.id];
}
function renderStructure() {
  const el = $("gStruct");
  if (!el) return;
  const clips = coldClips(), cs = coldSec(), tgt = parseMMSS(G.target), rec = totalRec(), vid = totalVideo();
  const reh = G.rehearsals[G.rehearsals.length - 1];
  const lapFor = (s) => { if (!reh) return null; const l = reh.laps.find((x) => x.anchor === s.anchor) || reh.laps.find((x) => x.first === s.first); return l ? l.sec : null; };
  const diff = tgt ? vid - tgt : null;
  const clipIdx = new Set(clips.map((c) => c.i));
  if (G.stOpen != null && !G.secs[G.stOpen]) G.stOpen = null;
  const coldRow = clips.length ? `<li class="st-item st-cold" style="--c:var(--mul)"><div class="st-main static"><span class="st-n">0</span><span class="st-name"><b>${h(t("strCold"))}</b><span class="st-first">${clips.map((c) => `${fmtTime(c.t0)}–${fmtTime(c.t1)}`).join(" + ")}</span></span><span class="st-time">0:00</span><span class="st-dur">${fmtTime(cs)}</span></div></li>` : "";
  const rows = G.secs.map((s) => {
    const fs = G.flags[s.k] || [], open = G.stOpen === s.k, lap = lapFor(s), d = lap != null ? lap - s.dur : null;
    const first = G.U[s.first] ? G.U[s.first].text : "", ws = first.split(/\s+/);
    const conf = s.conf === "manual" || s.conf === "baja" ? `<span class="st-conf">${h(t("conf")[s.conf])}</span>` : "";
    const delta = d != null ? `<span class="st-delta ${Math.abs(d) < 5 ? "" : d > 0 ? "over" : "under"}">${d >= 0 ? "+" : "−"}${fmtTime(Math.abs(d))}</span>` : "";
    return `<li class="st-item${fs.length ? " flagged" : ""}${open ? " open" : ""}" id="gs-${s.k}" style="--c:${SEC_COLOR[s.type]}">
      <button type="button" class="st-main" data-st="${s.k}" aria-expanded="${open}">
        <span class="st-n">${s.k + 1}</span>
        <span class="st-name"><b>${h(secLabel(s))}</b>${conf}<span class="st-first">«${h(ws.slice(0, 9).join(" "))}${ws.length > 9 ? "…" : ""}»</span>${fs.map((f) => `<span class="flag">${h(flagText(f))}</span>`).join("")}</span>
        <span class="st-time">${fmtTime(s.t0)}${clips.length ? `<small>${h(t("strVideo")(fmtTime(finalT(s.t0))))}</small>` : ""}</span><span class="st-dur">${fmtTime(s.dur)}${delta}</span>
        <span class="st-chev" aria-hidden="true"></span>
      </button>
      ${open ? structPanel(s, clipIdx) : ""}</li>`;
  }).join("");
  el.innerHTML = `<header class="g-h"><h2>${h(t("strTitle"))}</h2><span class="count">${h(t("totalRec")(fmtTime(rec)))}${clips.length ? " · " + h(t("totalVideo")(fmtTime(vid))) : ""}</span></header>
    <p class="lead">${h(SPLIT.on ? t("strLeadSplit") : t("strLead"))}</p>
    <div class="g-target"><label for="gTarget">${h(t("target"))}</label><input id="gTarget" inputmode="numeric" placeholder="${h(t("targetPh"))}" value="${h(G.target)}">${diff != null ? `<span class="verdict-tag ${Math.abs(diff) <= 60 ? "v-ok" : "v-mid"}">${h(diff >= 0 ? t("overT")(fmtTime(diff)) : t("underT")(fmtTime(-diff)))}</span>` : ""}
      ${G.manual ? `<button class="small" id="gRedetect">${h(t("redetect"))}</button>` : ""}</div>
    <ol class="st-list">${coldRow}${rows}</ol>`;
  const ti = $("gTarget");
  ti.addEventListener("change", () => { G.target = ti.value.trim(); markDirty(); renderStructure(); });
  const rd = $("gRedetect"); if (rd) rd.addEventListener("click", () => { G.manual = false; G.layout = null; G.stOpen = null; markDirty(); gRefresh(); });
  el.querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.st, s = G.secs[k];
    G.stOpen = G.stOpen === k ? null : k;
    renderStructure();
    if (G.stOpen != null && s && G.U[s.first]) edScrollToText(G.U[s.first].text);
  }));
  wireStructPanel(el);
}
function structPanel(s, clipIdx) {
  const [a, b] = sliceRange(s.k);
  const units = G.U.slice(s.first, s.last + 1);
  const html = richSlice(G.text, a, b, units, G.R.cues,
    (u, inner) => `<span class="u${clipIdx.has(u.i) ? " clip" : ""}${G.sel === u.i ? " sel" : ""}" data-u="${u.i}" tabindex="0" role="button">${clipIdx.has(u.i) ? `<b class="cliptag">${h(t("ppClip"))}</b>` : ""}${inner}</span>`,
    (c) => `<span class="cue${c.pause ? " pause" : ""}">${h(c.text)}</span>`);
  const ns = G.notes.filter((n) => { const i = noteUnit(n); return i >= s.first && i <= s.last; }), open = ns.filter((n) => !n.done).length;
  const typeSel = `<select data-type="${s.k}" aria-label="${h(t("strTools"))}">${SEC_TYPES.map((x) => `<option value="${x}"${x === s.type ? " selected" : ""}>${h(t("st")[x])}</option>`).join("")}</select>`;
  return `<div class="st-panel">
    <div class="st-tools"><label class="hint">${h(t("strTools"))}</label>${typeSel}
      ${s.k > 0 ? `<span class="gsec-tools"><button type="button" class="icon" data-up="${s.k}" title="${h(t("upOne"))}" aria-label="${h(t("upOne"))}">↑</button><button type="button" class="icon" data-down="${s.k}" title="${h(t("downOne"))}" aria-label="${h(t("downOne"))}">↓</button><button type="button" class="small" data-merge="${s.k}">${h(t("mergePrev"))}</button></span>` : ""}</div>
    <p class="hint st-tap">${h(t("strTap"))}</p>
    ${secAiHTML(s.k)}
    <div class="gsec-body" id="gSecsBody">${html.replace(/^\s+|\s+$/g, "")}</div>
    <details class="gnotes"${open ? " open" : ""}><summary>${h(t("notes"))}${ns.length ? ` · ${h(t("openNotes")(open))}` : ""}</summary>
      <ul>${ns.map((n) => `<li class="${n.done ? "done" : ""}"><span class="chip">${h(t("roles")[n.role] || n.role)}</span> ${h(n.text)} <label class="hint"><input type="checkbox" data-done="${h(n.id)}"${n.done ? " checked" : ""}> ${h(t("resolved"))}</label></li>`).join("")}</ul>
      <div class="gnote-form"><select data-role="${s.k}" aria-label="role">${Object.entries(t("roles")).map(([v, l]) => `<option value="${v}"${v === G.role ? " selected" : ""}>${h(l)}</option>`).join("")}</select><textarea rows="2" data-notetext="${s.k}" placeholder="${h(t("notePh"))}"></textarea><button class="small" data-addnote="${s.k}">${h(t("addNote"))}</button></div>
    </details></div>`;
}
function wireStructPanel(el) {
  wireSecAI(el);
  el.querySelectorAll("[data-type]").forEach((s) => s.addEventListener("change", () => { manualOp((L) => { L[+s.dataset.type].type = s.value; L[+s.dataset.type].conf = "manual"; }); }));
  el.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => moveStart(+b.dataset.up, -1)));
  el.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => moveStart(+b.dataset.down, +1)));
  el.querySelectorAll("[data-merge]").forEach((b) => b.addEventListener("click", () => { G.stOpen = null; manualOp((L) => L.splice(+b.dataset.merge, 1)); }));
  el.querySelectorAll(".u").forEach((sp) => {
    const pick = () => selectUnit(+sp.dataset.u);
    sp.addEventListener("click", pick);
    sp.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  el.querySelectorAll("[data-addnote]").forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.addnote, ta = el.querySelector(`[data-notetext="${k}"]`), role = el.querySelector(`[data-role="${k}"]`).value;
    const txt = ta.value.trim(); if (!txt) return;
    const s = G.secs[k], u = G.U[s.first];
    G.role = role; lsSet("sd-role", role);
    G.notes.push({ id: Math.random().toString(36).slice(2, 10), ui: s.first, anchor: u.text.slice(0, 80), role, text: txt, done: false, at: Date.now() });
    markDirty(); renderStructure(); const d = document.querySelector(`#gs-${k} details.gnotes`); if (d) d.open = true;
  }));
  el.querySelectorAll("[data-done]").forEach((c) => c.addEventListener("change", () => { const n = G.notes.find((x) => x.id === c.dataset.done); if (n) { n.done = c.checked; markDirty(); renderStructure(); } }));
}
// "Ver en el guion": open the sentence's section and, on wide screens, scroll the editor to it.
showUnit = function (i) {
  const s = secAt(i);
  if (!s) return;
  if ($("gStruct")) { G.stOpen = s.k; renderStructure(); }
  edScrollToText(G.U[i] ? G.U[i].text : "");
  const sp = document.querySelector(`#gSecsBody .u[data-u="${i}"]`);
  if (sp) { sp.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" }); selectUnit(i); }
};
// Scroll the left editor (split view only) to a sentence and flash its paragraph.
function edScrollToText(text) {
  if (!SPLIT.on || !ED.el || !text) return;
  const nodes = [], walker = document.createTreeWalker(ED.el, NodeFilter.SHOW_TEXT);
  let acc = "";
  while (walker.nextNode()) { nodes.push([walker.currentNode, acc.length]); acc += walker.currentNode.data; }
  let idx = -1;
  for (const n of [40, 24, 12]) { idx = acc.indexOf(text.slice(0, n)); if (idx >= 0) break; }
  if (idx < 0) return;
  let node = null;
  for (const [nd, off] of nodes) { if (off <= idx) node = nd; else break; }
  const block = node && node.parentElement && node.parentElement.closest("p, h2, li");
  if (!block) return;
  const sc = ED.el, top = block.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - sc.clientHeight / 3;
  sc.scrollTo({ top: Math.max(0, top), behavior: reduceMotion() ? "auto" : "smooth" });
  block.classList.remove("ed-flash"); void block.offsetWidth; block.classList.add("ed-flash");
  setTimeout(() => block.classList.remove("ed-flash"), 1800);
}

// ---------- Grabar: one card shared with guided step 4 ----------
function recordCardHTML() {
  const clips = coldClips(), reh = G.rehearsals[G.rehearsals.length - 1];
  const rehTot = reh && reh.laps ? reh.laps.reduce((a, l) => a + (l.sec || 0), 0) : 0;
  return `<section class="g-card rec-card" id="gRecCard">
    <div class="rec-hero">
      <div class="rec-len"><small>${h(t("recLen"))}</small><b>${fmtTime(totalVideo())}</b><span class="hint">${h(t("recSecs")(G.secs.length, (G.R && G.R.wc) || 0))}</span></div>
      <div class="rec-go"><button type="button" class="primary g-xl" id="gPP">${h(t("ppBtn"))}</button>
        <div class="rec-sub"><button type="button" id="gReh">${h(t("rehBtn"))}</button><button type="button" id="gSheet">${h(t("editSheetBtn"))}</button></div></div>
    </div>
    <p class="hint rec-tip">${rehTot ? h(t("recLast")(fmtTime(rehTot), fmtTime(totalRec()))) : h(t("recTip"))}</p>
    ${clips.length ? `<div class="rec-clips"><p>${h(t("recClips"))}</p><ol>${clips.map((c) => `<li><span class="rec-k">${h(c.kind === "hook" ? t("coHooks") : t("coProms"))} · ${fmtTime(c.t0)}</span>«${h(c.text)}»</li>`).join("")}</ol></div>` : ""}
    <details class="rec-keys"><summary>${h(t("recKeys"))}</summary><p class="hint">${h(t("s4Help"))}</p></details>
  </section>`;
}
function wireRecordCard() {
  const pp = $("gPP"); if (pp) pp.addEventListener("click", () => openPrompter("prompter"));
  const rh = $("gReh"); if (rh) rh.addEventListener("click", () => openPrompter("ensayo"));
  const sh = $("gSheet"); if (sh) sh.addEventListener("click", exportEditSheet);
}
