
/* ===== Modo guiado: 3 pasos, lenguaje sencillo, modo completo detrás de un interruptor ===== */
Object.assign(T.es, {
  expert: "Modo completo",
  // (jadri47, 2026-10-26: plan "Walk Juan through it", step 5) «Modo completo» lives in a ⋯ menu; step 1 asks only for the script
  moreBtn: "Más opciones", expertHint: "Apagado: la app te lleva paso a paso. Encendido: todas las revisiones y herramientas en una pantalla.", s1More: "Más opciones",
  // (jadri47, 2026-10-22: "merge «Grabar» and «Después» into step 3")
  steps: ["Escribir", "Mejorar", "Publicar"],
  stepQ: ["Escribe o pega el guion del episodio", "Lo que conviene mejorar antes de grabar", "Publicar: empaque, apertura y grabación"],
  s1Lead: "Pega aquí el guion completo del episodio. Te diremos qué conviene arreglar antes de grabar.", s1Continue: "Seguir con un episodio guardado", s1Open: "Abrir",
  stFold: (n, d) => `Ver las ${n} secciones · ${d}`,
  s2Lead: "Toca «Aplicar» para aceptar un cambio. Si no te convence, toca «Ahora no». Siempre puedes deshacer.",
  s3Lead: "Elige cómo empieza el video y cómo se llama, apruébalo y grábalo con el prompter.",
  s4Len: (a) => `El episodio dura unos ${a}.`, s4Clips: "Estas frases se usan al inicio del video: dilas mirando a la cámara, con una pausa antes y después.",
  s4Pp: "Abrir prompter", s4Reh: "Ensayar con cronómetro", s4Sheet: "Hoja para el editor", s4Done: "Ya lo grabamos",
  s4Help: "Con teclado o pedal: Espacio empieza o pausa · flechas ↑ ↓ cambian la velocidad · Esc sale. En el celular o la tableta: toca la pantalla para empezar o pausar.",
  next: "Siguiente", back: "Atrás", approve: "Aprobar el guion", approved: "Guion aprobado", toReview: "Ver todas las revisiones",
  vGreen: "Listo para grabar", vYellow: (n) => `Casi listo: ${n} ${n === 1 ? "cosa" : "cosas"} por mejorar`, vYellowLow: (n) => `Le falta trabajo: ${n} ${n === 1 ? "cosa" : "cosas"} por mejorar`, vRed: "Antes de grabar, revisa esto", vWait: "Esperando el informe del editor", vWaitD: "La IA aún no ha respondido. La nota completa llega con su informe.",
  vGreenD: "No hay nada importante que cambiar.", vYellowD: "Nada impide grabar, pero estos cambios ayudan a que la gente se quede.", vRedD: "Hay algo que puede quitar los anuncios del video. Arréglalo primero.",
  needText: "Primero pega un guion en el paso 1.", statusLbl: "Estado",
  plain: {
    hook: "Engancha en los primeros segundos", promise: "Dice pronto qué van a aprender", content: "La enseñanza empieza rápido", greeting: "No saluda antes de enganchar",
    rehook: "Despierta al que se distrae cada pocos minutos", cta: "Le pide una sola cosa al oyente", ending: "Al final invita al próximo episodio", refs: "Cada versículo dice de dónde es",
    readability: "Se entiende bien al oírlo", long: "Oraciones que se dicen sin quedarse sin aire", runtime: "Duración del episodio", muletillas: "Sin muletillas («o sea», «este», «¿verdad?»)",
    weak: "Palabras precisas", regional: "Español que se entiende en todos los países", rhythm: "Oraciones de distinto largo", openers: "Oraciones que no empiezan igual", aitell: "Suena a persona, no a plantilla",
    kw: "Está claro de qué tema es", kwopen: "Nombra el tema al principio", kwspread: "Repite el tema a lo largo del episodio", support: "Usa palabras relacionadas con el tema",
    search: "El título es como lo buscaría alguien", title: "Título corto y con el tema", desc: "La descripción nombra el tema al inicio", chapters: "Marca bien cada punto",
  },
  plainMoney: (x) => `Puede limitar los anuncios: ${x.toLowerCase()}`, plainPack: "El título o la miniatura tienen palabras que limitan anuncios",
});
Object.assign(T.en, {
  expert: "Full mode",
  moreBtn: "More options", expertHint: "Off: the app walks you step by step. On: every check and tool on one screen.", s1More: "More options",
  steps: ["Write", "Improve", "Publish"],
  stepQ: ["Write or paste the episode script", "What's worth improving before you record", "Publish: packaging, opening and recording"],
  s1Lead: "Paste the whole episode script here. We'll tell you what to fix before recording.", s1Continue: "Continue a saved episode", s1Open: "Open",
  stFold: (n, d) => `Show the ${n} sections · ${d}`,
  s2Lead: "Tap \"Apply\" to accept a change. If you don't like it, tap \"Not now\". You can always undo.",
  s3Lead: "Choose how the video opens and what it's called, approve it, and record it with the prompter.",
  s4Len: (a) => `The episode runs about ${a}.`, s4Clips: "These lines open the video: say them to the camera, with a pause before and after.",
  s4Pp: "Open prompter", s4Reh: "Rehearse with stopwatch", s4Sheet: "Editor sheet", s4Done: "We recorded it",
  s4Help: "With a keyboard or pedal: Space starts or pauses · ↑ ↓ change speed · Esc exits. On a phone or tablet: tap the screen to start or pause.",
  next: "Next", back: "Back", approve: "Approve the script", approved: "Script approved", toReview: "See every check",
  vGreen: "Ready to record", vYellow: (n) => `Almost ready: ${n} ${n === 1 ? "thing" : "things"} to improve`, vYellowLow: (n) => `Needs work: ${n} ${n === 1 ? "thing" : "things"} to improve`, vRed: "Before recording, check this", vWait: "Waiting for the editor's report", vWaitD: "The AI hasn't answered yet. The full score comes with its report.",
  vGreenD: "Nothing important to change.", vYellowD: "Nothing stops you from recording, but these changes help people stay.", vRedD: "Something could remove ads from the video. Fix it first.",
  needText: "First paste a script in step 1.", statusLbl: "Status",
  plain: {
    hook: "Grabs them in the first seconds", promise: "Says early what they'll learn", content: "Teaching starts quickly", greeting: "No greeting before the hook",
    rehook: "Wakes up wandering listeners every few minutes", cta: "Asks the listener for one thing", ending: "Ends by inviting them to the next episode", refs: "Every verse says where it's from",
    readability: "Easy to follow by ear", long: "Sentences you can say in one breath", runtime: "Episode length", muletillas: "No filler words",
    weak: "Precise words", regional: "Spanish everyone understands", rhythm: "Sentences of different lengths", openers: "Sentences don't all start the same", aitell: "Sounds like a person, not a template",
    kw: "Clear what the topic is", kwopen: "Names the topic early", kwspread: "Repeats the topic through the episode", support: "Uses words related to the topic",
    search: "The title is how someone would search", title: "Short title with the topic", desc: "Description names the topic first", chapters: "Each point is clearly marked",
  },
  plainMoney: (x) => `Could limit ads: ${x.toLowerCase()}`, plainPack: "The title or thumbnail has words that limit ads",
});
const SAMPLE_ES = __SAMPLE__;
const V = { guided: lsGet("sd-expert") !== "1", step: 1, s1More: false };

function plainLabel(id, fallback) {
  if (!V.guided) return fallback;
  const P = t("plain");
  if (P[id]) return P[id];
  if (/^pf-/.test(id)) return t("plainMoney")(fallback);
  if (/^pack-/.test(id)) return t("plainPack");
  return fallback;
}
// Same recipe as the number beside it (readinessOf): n = open rules rows that cost readiness + report changes not yet decided.
// "Almost ready" only from 70 up (jadri47, 2026-10-22: "A: by score"); without a report the rules part counts /40 → 28.
function verdictOf(R) {
  const rd = readinessOf(R, G.report, state.fixDismissed, state.text);
  const items = typeof rpStates === "function" && R === state.result ? rpStates().filter((x) => x.st === "pending").length : 0;
  const n = rd.openIds.length + items, high = rd.score != null ? rd.score >= 70 : rd.rules >= 28;
  // the report is on its way: no «Listo para grabar» from the rules alone while the AI is still reading (jadri47, 2026-10-25)
  const waiting = !G.report && R === state.result && typeof RP !== "undefined" && RP.busy;
  return rd.red ? { k: "rojo", t: t("vRed"), d: t("vRedD") } : waiting ? { k: "espera", t: t("vWait"), d: t("vWaitD") } : n ? { k: "amarillo", t: (high ? t("vYellow") : t("vYellowLow"))(n), d: t("vYellowD") } : { k: "verde", t: t("vGreen"), d: t("vGreenD") };
}
const hasScript = () => !!$("script").value.trim();
function ensureReview() {
  if (!hasScript()) return false;
  if (!state.result || state.text !== $("script").value) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); }
  return true;
}
function stepForStatus(s) { return s === "grabado" || s === "aprobado" ? 3 : 2; }

function applyView() {
  const main = document.querySelector("main");
  main.dataset.view = V.guided ? "guide" : "expert";
  main.dataset.step = String(V.step);
  document.documentElement.classList.toggle("guided", V.guided);
  $("expertToggle").checked = !V.guided;
  moreLabels();
  if (V.guided) { main.dataset.mode = "review"; renderGuide(); }
  else {
    $("guide").innerHTML = ""; $("guideTop").innerHTML = ""; $("stepBar").innerHTML = "";
    if (G.mode === "guion") setMode("guion");
    else if (state.result) { renderResults(); $("results").classList.remove("hidden"); }
  }
}
function goStep(n) {
  if (n > 1 && !ensureReview()) n = 1;
  V.step = n;
  if (n < 3) { V.s3After = false; V.s3More = false; } // «Después de grabar» / «Más detalles» start closed on each visit
  document.querySelector("main").dataset.step = String(n);
  if (n >= 3) gCompute();
  renderGuide();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function stepBarHTML() {
  const names = t("steps"), have = hasScript();
  return `<ol class="sb">${names.map((nm, i) => { const n = i + 1, on = n === V.step, done = n < V.step, dis = n > 1 && !have;
    return `<li><button type="button" data-step="${n}" class="${on ? "on" : done ? "done" : ""}"${on ? ' aria-current="step"' : ""}${dis ? " disabled" : ""}><span class="sb-n">${done ? "✓" : n}</span><span class="sb-l">${h(nm)}</span></button></li>`; }).join("")}</ol>
    ${G.prodId ? `<span class="sb-status">${h(t("statusLbl"))}: <b>${h(t("status")[G.status])}</b></span>` : ""}`;
}
function navHTML(prev, nextLabel, nextAttr) {
  return `<div class="g-nav-steps">${prev ? `<button type="button" data-step="${prev}">← ${h(t("back"))}</button>` : "<span></span>"}${nextLabel ? `<button type="button" class="primary" ${nextAttr}>${h(nextLabel)} →</button>` : ""}</div>`;
}
function verdictHTML(R) {
  // The number is readiness (score_logic.js readinessOf): with the editor's report /100, without it only the rules part /40.
  const v = verdictOf(R), rd = typeof readinessOf === "function" ? readinessOf(R, G.report, state.fixDismissed, state.text) : null;
  const n = rd ? (rd.score != null ? rd.score : rd.rules) : 0, full = !!(rd && rd.score != null);
  return `<div class="gv gv-${v.k}">${rd ? `<div class="gv-top"><span class="gv-n">${n}<small>/${full ? 100 : rd.rulesMax}</small></span><span class="gv-l">${h(full ? t("rpName") : rpRulesLbl(rd))}</span></div>` : ""}<span class="lamp ${v.k}">${h(v.t)}</span><p>${h(v.d)}</p></div>`;
}

function renderGuide() {
  if (!V.guided) return;
  const top = $("guideTop"), body = $("guide");
  $("stepBar").innerHTML = stepBarHTML();
  $("stepBar").querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => goStep(+b.dataset.step)));
  const head = (n) => `<header class="g-step-h"><span class="g-step-n">${n}</span><h2>${h(t("stepQ")[n - 1])}</h2></header>`;
  top.innerHTML = ""; body.innerHTML = "";
  s1MoreSync();
  if (V.step === 1) {
    top.innerHTML = `${head(1)}<p class="lead">${h(t("s1Lead"))}</p>`;
    return;
  }
  if (!ensureReview()) { body.innerHTML = `<p class="lead">${h(t("needText"))}</p>${navHTML(1)}`; wireGuideNav(body); return; }
  const R = state.result;
  if (V.step === 2) {
    top.innerHTML = head(2);
    // The editor's report (report_ui.js) comes first; today's coach / walker / rail / legend / more checks / Ask Claude sit behind
    // «Más detalles» and are only built while it is open, so nothing paints over the script until then.
    const rep = typeof reportHTML === "function", more = rep ? rpMoreOpen() : true;
    const inner = more ? `${topFixHTML(R)}<p class="lead">${h(t("s2Lead"))}</p>
      <p class="g-more"><button type="button" class="linkish" id="gExpertGo">${h(t("toReview"))}</button></p>` : "";
    body.innerHTML = `${rep ? reportHTML(R) : ""}${rep ? rpWrapMore(inner, more) : inner}${navHTML(1, t("next"), 'data-step="3"')}`;
    if (more) {
      wireFixes();
      $("gExpertGo").addEventListener("click", () => { V.guided = false; lsSet("sd-expert", "1"); applyView(); document.getElementById("results").scrollIntoView(); });
    }
  } else {
    // Step 3 «Publicar» is a walk (pub_ui.js): title → thumbnail → description → next episode → opening → «Todo listo» + approve,
    // then «Grabar». Each card is the existing one; approve and «Ya lo grabamos» only change the status and stay in step 3
    // (jadri47, 2026-10-22: "merge «Grabar» and «Después» into step 3"; 2026-10-26: plan "Walk Juan through it", step 4).
    top.innerHTML = head(3);
    body.innerHTML = `${pubStep3HTML(R)}${navHTML(2)}`;
    pubAfterHTML(body);
  }
  wireGuideNav(body);
  body.querySelectorAll("[data-see]").forEach((b) => b.remove());
}
// Phone: the section list folds to one line (sections + length); tap to open. Stays open on wide screens.
V.stFold = false;
function foldStruct() {
  const el = $("gStruct"), list = el && el.querySelector(".st-list");
  if (!list || !matchMedia("(max-width:899px)").matches || list.closest(".st-fold")) return;
  const n = G.secs.length, d = document.createElement("details");
  d.className = "st-fold"; d.open = V.stFold || G.stOpen != null;
  d.innerHTML = `<summary>${h(t("stFold")(n, fmtTime(totalRec())))}</summary>`;
  list.parentNode.insertBefore(d, list); d.appendChild(list);
  d.addEventListener("toggle", () => { V.stFold = d.open; });
}
const _renderStructureG = renderStructure;
renderStructure = function () { _renderStructureG(); if (V.guided) foldStruct(); };
function wireGuideNav(root) { root.querySelectorAll(".g-nav-steps [data-step]").forEach((b) => b.addEventListener("click", () => goStep(+b.dataset.step))); }

// Rendering hooks: in guided mode, results and the Guion tab draw into the current step instead.
const _renderResultsG = renderResults;
renderResults = function () { if (V.guided) { $("results").innerHTML = ""; renderGuide(); return; } _renderResultsG(); };
const _renderGuionG = renderGuion;
renderGuion = function () { if (V.guided) { $("guion").innerHTML = ""; renderGuide(); return; } _renderGuionG(); };

$("runBtn").addEventListener("click", async () => {
  if (!V.guided || !hasScript()) return;
  if ($("exPick") && $("exPick").dataset.open === "1") { $("exPick").dataset.open = "0"; if (typeof renderExPick === "function") renderExPick(); }
  const db = await caps.db;
  if (db && !G.prodId) await createProd();
  pubReset();
  goStep(2);
  if (db && G.status === "borrador") setStatus("revision");
});
$("expertToggle").addEventListener("change", () => { V.guided = !$("expertToggle").checked; lsSet("sd-expert", V.guided ? "0" : "1"); moreClose(false); applyView(); });

// ⋯ menu in the header: «Modo completo» (and later any rarely used control) lives here. Esc closes it and gives the focus back to ⋯;
// arrows move between items; a tap or Tab outside closes it. Items are >= 44 px (guide.css).
function moreLabels() { const b = $("moreBtn"); if (b) { b.setAttribute("aria-label", t("moreBtn")); b.title = t("moreBtn"); $("moreMenu").setAttribute("aria-label", t("moreBtn")); } }
const moreOpen = () => !$("moreMenu").hidden;
function moreClose(back) { const m = $("moreMenu"), b = $("moreBtn"); m.hidden = true; b.setAttribute("aria-expanded", "false"); if (back) b.focus(); }
function moreShow() { const m = $("moreMenu"); m.hidden = false; $("moreBtn").setAttribute("aria-expanded", "true"); const f = m.querySelector('[role^="menuitem"]'); if (f) f.focus(); }
$("moreBtn").addEventListener("click", () => { if (moreOpen()) moreClose(true); else moreShow(); });
document.addEventListener("keydown", (e) => {
  if (!moreOpen()) return;
  if (e.key === "Escape") { e.preventDefault(); moreClose(true); return; }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const items = [...$("moreMenu").querySelectorAll('[role^="menuitem"]')]; if (!items.length) return;
    e.preventDefault(); const at = items.indexOf(document.activeElement);
    items[(Math.max(at, 0) + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
  }
});
document.addEventListener("pointerdown", (e) => { if (moreOpen() && !e.target.closest("#moreWrap")) moreClose(false); });
$("moreWrap").addEventListener("focusout", (e) => { if (moreOpen() && e.relatedTarget && !e.relatedTarget.closest("#moreWrap")) moreClose(false); });

// Step 1 in guided mode asks only for the script. The central idea, variant/Bible version and the optional title, keyword, thumbnail,
// description, series and language fields stay in the page (nothing is deleted) behind one small «Más opciones» (the same fields are also
// in Modo completo).
function s1MoreSync() {
  const main = document.querySelector("main"), b = $("s1MoreBtn");
  main.classList.toggle("s1-more", !!V.s1More);
  if (b) b.setAttribute("aria-expanded", V.s1More ? "true" : "false");
}
$("s1MoreBtn").addEventListener("click", () => { V.s1More = !V.s1More; s1MoreSync(); });
const _gOnLangG = gOnLang;
gOnLang = function () { if (V.guided) renderGuide(); else _gOnLangG(); };
const _gOnLangMore = gOnLang;
gOnLang = function () { _gOnLangMore.apply(this, arguments); moreLabels(); s1MoreSync(); };

// Keep the Approve button in step with the packaging fields as Juan types.
const _renderPackChecksG = renderPackChecks;
renderPackChecks = function () {
  _renderPackChecksG();
  if (!V.guided || V.step !== 3) return;
  const box = document.querySelector("[data-pub-gate]"), ap = $("gApprove");
  if (!box || !ap) return;
  const missing = packGateMissing(), P = t("pk");
  ap.disabled = missing.length > 0;
  let gate = box.querySelector(".g-gate");
  if (missing.length) {
    if (!gate) { gate = document.createElement("span"); gate.className = "g-gate"; box.appendChild(gate); }
    gate.textContent = t("pkGate")(missing.map((c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase()).join("; "));
  } else if (gate) gate.remove();
};
