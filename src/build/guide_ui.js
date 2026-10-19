
/* ===== Modo guiado: 5 pasos, lenguaje sencillo, modo completo detrás de un interruptor ===== */
Object.assign(T.es, {
  expert: "Modo completo",
  steps: ["Escribir", "Arreglar", "Preparar", "Grabar", "Después"],
  stepQ: ["Escribe o pega el guion del episodio", "Lo que conviene arreglar antes de grabar", "Cómo empieza el video y cómo se llama", "Grabar con el prompter", "Después de grabar"],
  s1Lead: "Pega aquí el guion completo del episodio. Te diremos qué conviene arreglar antes de grabar.", s1Sample: "Probar con un guion de ejemplo", s1Continue: "Seguir con un episodio guardado", s1Open: "Abrir",
  stFold: (n, d) => `Ver las ${n} secciones · ${d}`,
  s2Lead: "Toca «Aplicar» para aceptar un cambio. Si no te convence, toca «Ahora no». Siempre puedes deshacer.",
  s3Lead: "La apertura usa frases que ya están en tu guion: no hay que grabar nada aparte. Después escribe el título y el texto de la miniatura.",
  s4Lead: "Abre el prompter y lee. El texto avanza solo, a tu ritmo.", s4Len: (a) => `El episodio dura unos ${a}.`, s4Clips: "Estas frases se usan al inicio del video: dilas mirando a la cámara, con una pausa antes y después.",
  s4Pp: "Abrir prompter", s4Reh: "Ensayar con cronómetro", s4Sheet: "Hoja para el editor", s4Done: "Ya lo grabamos",
  s4Help: "Con teclado o pedal: Espacio empieza o pausa · flechas ↑ ↓ cambian la velocidad · Esc sale. En el celular o la tableta: toca la pantalla para empezar o pausar.",
  s5Lead: "Apunta el próximo episodio, elige clips cortos para Shorts y, cuando el video lleve unos días publicado, mira dónde se fue la gente.",
  next: "Siguiente", back: "Atrás", approve: "Aprobar el guion", approved: "Guion aprobado", toReview: "Ver todas las revisiones",
  vGreen: "Listo para grabar", vYellow: (n) => `Casi listo: ${n} ${n === 1 ? "cosa" : "cosas"} por mejorar`, vRed: "Antes de grabar, revisa esto",
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
  steps: ["Write", "Fix", "Prepare", "Record", "After"],
  stepQ: ["Write or paste the episode script", "What to fix before recording", "How the video opens and what it's called", "Record with the prompter", "After recording"],
  s1Lead: "Paste the whole episode script here. We'll tell you what to fix before recording.", s1Sample: "Try a sample script", s1Continue: "Continue a saved episode", s1Open: "Open",
  stFold: (n, d) => `Show the ${n} sections · ${d}`,
  s2Lead: "Tap \"Apply\" to accept a change. If you don't like it, tap \"Not now\". You can always undo.",
  s3Lead: "The opening uses lines already in your script: nothing extra to record. Then write the title and the thumbnail text.",
  s4Lead: "Open the prompter and read. The text moves on its own, at your pace.", s4Len: (a) => `The episode runs about ${a}.`, s4Clips: "These lines open the video: say them to the camera, with a pause before and after.",
  s4Pp: "Open prompter", s4Reh: "Rehearse with stopwatch", s4Sheet: "Editor sheet", s4Done: "We recorded it",
  s4Help: "With a keyboard or pedal: Space starts or pauses · ↑ ↓ change speed · Esc exits. On a phone or tablet: tap the screen to start or pause.",
  s5Lead: "Note the next episode, pick short clips for Shorts and, once the video has been up a few days, see where people left.",
  next: "Next", back: "Back", approve: "Approve the script", approved: "Script approved", toReview: "See every check",
  vGreen: "Ready to record", vYellow: (n) => `Almost ready: ${n} ${n === 1 ? "thing" : "things"} to improve`, vRed: "Before recording, check this",
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
const V = { guided: lsGet("sd-expert") !== "1", step: 1 };

function plainLabel(id, fallback) {
  if (!V.guided) return fallback;
  const P = t("plain");
  if (P[id]) return P[id];
  if (/^pf-/.test(id)) return t("plainMoney")(fallback);
  if (/^pack-/.test(id)) return t("plainPack");
  return fallback;
}
function verdictOf(R) {
  const S = scoreOf(R, state.fixDismissed), n = S.open.length;
  return S.band === "rojo" ? { k: "rojo", t: t("vRed"), d: t("vRedD") } : n ? { k: "amarillo", t: t("vYellow")(n), d: t("vYellowD") } : { k: "verde", t: t("vGreen"), d: t("vGreenD") };
}
const hasScript = () => !!$("script").value.trim();
function ensureReview() {
  if (!hasScript()) return false;
  if (!state.result || state.text !== $("script").value) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); }
  return true;
}
function stepForStatus(s) { return s === "grabado" ? 5 : s === "aprobado" ? 4 : 2; }

function applyView() {
  const main = document.querySelector("main");
  main.dataset.view = V.guided ? "guide" : "expert";
  main.dataset.step = String(V.step);
  document.documentElement.classList.toggle("guided", V.guided);
  $("expertToggle").checked = !V.guided;
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
  const v = verdictOf(R), S = typeof scoreOf === "function" ? scoreOf(R, state.fixDismissed) : null;
  return `<div class="gv gv-${v.k}">${S ? `<div class="gv-top"><span class="gv-n">${S.score}<small>/100</small></span><span class="gv-l">${h(t("scTitle"))}</span></div>` : ""}<span class="lamp ${v.k}">${h(v.t)}</span><p>${h(v.d)}</p></div>`;
}

function renderGuide() {
  if (!V.guided) return;
  const top = $("guideTop"), body = $("guide");
  $("stepBar").innerHTML = stepBarHTML();
  $("stepBar").querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => goStep(+b.dataset.step)));
  const head = (n) => `<header class="g-step-h"><span class="g-step-n">${n}</span><h2>${h(t("stepQ")[n - 1])}</h2></header>`;
  top.innerHTML = ""; body.innerHTML = "";
  if (V.step === 1) {
    top.innerHTML = `${head(1)}<p class="lead">${h(t("s1Lead"))}</p>`;
    body.innerHTML = `<div class="g-s1-extra"><button type="button" class="linkish" id="gSample">${h(t("s1Sample"))}</button></div>`;
    $("gSample").addEventListener("click", () => { $("script").value = SAMPLE_ES; updateLive(); $("script").focus(); });
    return;
  }
  if (!ensureReview()) { body.innerHTML = `<p class="lead">${h(t("needText"))}</p>${navHTML(1)}`; wireGuideNav(body); return; }
  const R = state.result;
  if (V.step === 2) {
    top.innerHTML = head(2);
    body.innerHTML = `${verdictHTML(R)}${topFixHTML(R)}${timelineHTML(R)}<p class="lead">${h(t("s2Lead"))}</p>
      <p class="g-more"><button type="button" class="linkish" id="gExpertGo">${h(t("toReview"))}</button></p>${navHTML(1, t("next"), 'data-step="3"')}`;
    wireFixes();
    $("gExpertGo").addEventListener("click", () => { V.guided = false; lsSet("sd-expert", "1"); applyView(); document.getElementById("results").scrollIntoView(); });
  } else if (V.step === 3) {
    top.innerHTML = head(3);
    const missing = packGateMissing();
    const done = G.status === "aprobado" || G.status === "grabado";
    body.innerHTML = `${verdictHTML(R)}<p class="lead">${h(t("s3Lead"))}</p><section class="g-card" id="gStruct"></section><section class="g-card" id="gCold"></section><section class="g-card" id="gTopic"></section><section class="g-card" id="gPack"></section>
      <div class="g-approve">${done ? `<span class="lamp verde">${h(t("approved"))}</span>` : `<button type="button" class="primary" id="gApprove"${missing.length ? " disabled" : ""}>${h(t("approve"))}</button>${missing.length ? `<span class="g-gate">${h(t("pkGate")(missing.map((c) => { const P = t("pk"); return (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase(); }).join("; ")))}</span>` : ""}`}</div>
      ${navHTML(2, done ? t("next") : "", 'data-step="4"')}`;
    renderStructure(); foldStruct(); renderCold(); renderTopic(); renderPack();
    const ap = $("gApprove");
    if (ap) ap.addEventListener("click", async () => { ap.disabled = true; await setStatus("aprobado"); goStep(4); });
  } else if (V.step === 4) {
    top.innerHTML = head(4);
    body.innerHTML = `${verdictHTML(R)}<p class="lead">${h(t("s4Lead"))}</p>${recordCardHTML()}
      ${navHTML(3, t("s4Done"), 'id="gRecorded"')}`;
    wireRecordCard();
    $("gRecorded").addEventListener("click", async (e) => { e.target.disabled = true; if (G.status !== "grabado") await setStatus(G.status === "aprobado" ? "grabado" : G.status); goStep(5); });
  } else {
    top.innerHTML = head(5);
    body.innerHTML = `<p class="lead">${h(t("s5Lead"))}</p><section class="g-card" id="gNextPlan"></section><section class="g-card" id="gShorts"></section><section class="g-card" id="gRes"></section>${navHTML(4)}`;
    renderShorts(); renderResultsCard();
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
  goStep(2);
  if (db && G.status === "borrador") setStatus("revision");
});
$("expertToggle").addEventListener("change", () => { V.guided = !$("expertToggle").checked; lsSet("sd-expert", V.guided ? "0" : "1"); applyView(); });
const _gOnLangG = gOnLang;
gOnLang = function () { if (V.guided) renderGuide(); else _gOnLangG(); };
// Keep the Approve button in step with the packaging fields as Juan types.
const _renderPackChecksG = renderPackChecks;
renderPackChecks = function () {
  _renderPackChecksG();
  if (!V.guided || V.step !== 3) return;
  const box = document.querySelector(".g-approve"), ap = $("gApprove");
  if (!box || !ap) return;
  const missing = packGateMissing(), P = t("pk");
  ap.disabled = missing.length > 0;
  let gate = box.querySelector(".g-gate");
  if (missing.length) {
    if (!gate) { gate = document.createElement("span"); gate.className = "g-gate"; box.appendChild(gate); }
    gate.textContent = t("pkGate")(missing.map((c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase()).join("; "));
  } else if (gate) gate.remove();
};
