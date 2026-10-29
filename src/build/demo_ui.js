/* ===== Ejemplos para practicar: flojo, regular y muy bueno, en un espacio aparte que no guarda nada ===== */
const EXAMPLES = __EXAMPLES__;
Object.assign(T.es, {
  exTitle: "Ejemplos para practicar", exFirst: "¿Primera vez aquí? Tócame",
  exLead: "Cinco guiones ya escritos, en español neutro, del pésimo al excelente. Lo que hagas en un ejemplo no se guarda ni toca tus episodios. En inglés (English, arriba) los ejemplos están en inglés de EE. UU.",
  exD: {
    worst: "Ocho minutos y medio con casi todos los problemas que la app sabe marcar, a propósito: úsalo para ver cada revisión, cada marca roja y amarilla, y cómo se arregla.",
    bad: "Diez minutos de todo lo que no hay que hacer: clickbait, saludos y oración antes del tema, palabras que quitan anuncios, versículos sin referencia ni texto en pantalla, muletillas, jerga y pedidos de dinero.",
    mid: "Once minutos de buena enseñanza con la forma muy descuidada: sin promesa, oración primero, frases de culto, jerga, muletillas, palabras genéricas y un final sin resumen, sin paso concreto y sin próximo episodio.",
    good: "Quince minutos de un episodio de serie casi listo: recapitulación, promesa, lectura larga con texto en pantalla y cierre con oración. Quedan dos o tres detalles.",
    best: "Veintidós minutos listos para grabar, con capítulos en la descripción. Úsalo para recorrer la apertura, el prompter, los Shorts, las pausas para anuncios y los resultados.",
  },
  exDur: "min",
  exBanner: (n) => `Estás practicando con el ejemplo «${n}». Nada de lo que hagas aquí se guarda.`,
  exStart: "Toca «Revisar guion» para empezar.",
  exExit: "Salir del ejemplo",
  exCur: "abierto",
  exRet: "Usar datos de ejemplo",
  exRetNote: "En un episodio real, estos datos vienen de YouTube Studio.",
  exNoBackup: "La copia de seguridad no está disponible mientras practicas con un ejemplo.",
});
Object.assign(T.en, {
  exTitle: "Practice examples", exFirst: "First time here? Tap me",
  exLead: "Five finished scripts, in US English, from terrible to excellent. Nothing you do in an example is saved or touches your episodes. In Español (top) the examples are in neutral Spanish.",
  exD: {
    worst: "Eight and a half minutes with nearly every problem the app can flag, on purpose: use it to see every check, every red and yellow mark, and how each one gets fixed.",
    bad: "Ten minutes of everything not to do: clickbait, greetings and a prayer before the topic, words that pull ads, verses with no reference or on-screen text, fillers, jargon and asking for money.",
    mid: "Eleven minutes of good teaching with very careless form: no promise, prayer first, live-service phrases, jargon, fillers, generic words and an ending with no recap, no concrete step and no next episode.",
    good: "Fifteen minutes of a nearly ready series episode: recap, promise, a long reading with text on screen and a closing prayer. Two or three details left.",
    best: "Twenty-two minutes ready to record, with chapters in the description. Use it to walk through the opening, the prompter, Shorts, ad breaks and results.",
  },
  exDur: "min",
  exBanner: (n) => `You're practicing with the “${n}” example. Nothing you do here is saved.`,
  exStart: "Tap “Review script” to start.",
  exExit: "Leave the example",
  exCur: "open",
  exRet: "Use sample data",
  exRetNote: "In a real episode, this data comes from YouTube Studio.",
  exNoBackup: "Backup isn't available while you practice with an example.",
});
const EX_KEYS = ["worst", "bad", "mid", "good", "best"];
const exName = (k) => { const lg = UI === "en" ? "en" : "es"; const e = EXAMPLES[lg] && EXAMPLES[lg][k]; return e && e.name ? e.name : k; };
const exMin = (k) => { const lg = UI === "en" ? "en" : "es"; const e = EXAMPLES[lg] && EXAMPLES[lg][k]; const m = e && /^(\d+):(\d+)/.exec(e.realDur || ""); return m ? String(Math.round((+m[1] * 60 + +m[2]) / 60)) : ""; };
let DEMO = null, DEMO_LANG = null, DEMO_REAL = null, DEMO_PREV = null;

function memDb() {
  const store = {}; let n = 0;
  const col = (c) => (store[c] = store[c] || {});
  const clone = (d) => JSON.parse(JSON.stringify(d));
  const snap = (id, d) => ({ id, exists: !!d, data: () => (d ? clone(d) : undefined) });
  const docRef = (c, id) => ({ id, get: async () => snap(id, col(c)[id]), set: async (d) => { col(c)[id] = clone(d); }, update: async (d) => { col(c)[id] = { ...(col(c)[id] || {}), ...clone(d) }; }, delete: async () => { delete col(c)[id]; } });
  const query = (c, f = [], ord = null, lim = 1000) => ({
    where: (k, op, v) => query(c, [...f, [k, v]], ord, lim), orderBy: (k, dir) => query(c, f, [k, dir], lim), limit: (x) => query(c, f, ord, x),
    get: async () => {
      let docs = Object.entries(col(c)).filter(([, d]) => f.every(([k, v]) => d[k] === v));
      if (ord) docs.sort((a, b) => (ord[1] === "desc" ? -1 : 1) * ((a[1][ord[0]] || 0) > (b[1][ord[0]] || 0) ? 1 : -1));
      docs = docs.slice(0, lim);
      return { docs: docs.map(([id, d]) => snap(id, d)), size: docs.length, empty: !docs.length };
    },
  });
  return { collection: (c) => ({ ...query(c), doc: (id) => docRef(c, id || "x" + ++n), add: async (d) => { const id = "x" + ++n; col(c)[id] = clone(d); return docRef(c, id); } }), doc: (p) => { const [c, id] = p.split("/"); return docRef(c, id); } };
}

function resetWorkState() {
  state.fixUndo = []; state.fixSel = {}; state.fixAi = {}; state.fixDismissed = new Set(); state.fixLog = [];
  state.result = null; state.text = ""; state.rewrite = null;
  $("results").classList.add("hidden"); $("results").innerHTML = "";
}
async function startDemo(k) {
  const lg = UI === "en" ? "en" : "es";
  const e = EXAMPLES[lg] && EXAMPLES[lg][k];
  if (!e) return;
  if ($("exPick")) $("exPick").dataset.open = "0"; // the picker folds once an example is chosen
  if (!DEMO) {
    if (G.prodId) { clearTimeout(saveTimer); await saveProd(false); }
    DEMO_PREV = { prodId: G.prodId, text: $("script").value, fields: ["title", "keyword", "thumb", "description", "series", "translation", "lang", "audience", "bigIdea"].map((id) => [id, $(id).value]) };
    DEMO_REAL = caps.db;
  }
  DEMO = k; DEMO_LANG = lg;
  const mem = memDb();
  caps.db = Promise.resolve(mem);
  const now = Date.now();
  const ref = await mem.collection("producciones").add({ title: e.title, series: e.series || "", keyword: e.keyword || "", thumb: e.thumb || "", description: e.description || "", translation: e.translation || "RVR1960", lang: e.lang || lg, audience: e.audience || "both", bigIdea: e.bigIdea || "", text: e.text, status: "borrador", manual: false, layout: null, cold: { hook: null, promise: null }, notes: [], rehearsals: [], target: "", retention: null, realDur: "", shorts: [], pubDate: addDays(isoToday(), 7), nextEp: e.nextEp || "", updatedAt: now, updatedBy: G.sid });
  G.prods = [];
  await loadProds();
  // (B-039, 2026-10-29) step 1 BEFORE the episode opens: openProd re-renders the current step, and step 2 asks the editor's report for
  // whatever text is there (a paid call on the example the person has not reviewed yet, whose answer then landed on a reset state)
  if (V.guided && V.step !== 1) goStep(1);
  await openProd(ref.id);
  resetWorkState();
  renderDemoBar(); renderExPick();
  if (typeof loadHistory === "function") loadHistory();
  if (V.guided) { goStep(1); $("editor").scrollIntoView({ block: "start" }); }
  else { setMode("review"); $("runBtn").click(); }
}
async function exitDemo() {
  if (!DEMO) return;
  DEMO = null; DEMO_LANG = null;
  caps.db = DEMO_REAL;
  const prev = DEMO_PREV; DEMO_PREV = null;
  applyProd(null, {}); G.snaps = []; resetWorkState();
  await loadProds();
  if (typeof loadHistory === "function") loadHistory();
  renderDemoBar(); renderExPick();
  if (prev) prev.fields.forEach(([id, v]) => { if (["translation", "lang", "audience"].includes(id)) $(id).value = v; });
  lsSet("sd-aud", $("audience").value);
  if (prev && prev.prodId) { await openFromSeries(prev.prodId); return; }
  if (prev) { $("script").value = prev.text; prev.fields.forEach(([id, v]) => ($(id).value = v)); updateLive(); }
  if (V.guided) goStep(1); else setMode("review");
}

function renderDemoBar() {
  const el = $("demoBar");
  if (!el) return;
  if (!DEMO) { el.hidden = true; el.innerHTML = ""; return; }
  el.hidden = false;
  el.innerHTML = `<span class="ex-dot ex-${DEMO}" aria-hidden="true"></span><p><b>${h(t("exBanner")(exName(DEMO) + (DEMO_LANG !== (UI === "en" ? "en" : "es") ? (DEMO_LANG === "en" ? " (English)" : " (español)") : "")))}</b>${V.guided && V.step === 1 && !state.result ? " " + h(t("exStart")) : ""}</p><button type="button" class="small" id="exExit">${h(t("exExit"))}</button>`;
  $("exExit").addEventListener("click", (ev) => { ev.target.disabled = true; exitDemo(); });
}
function renderExPick() {
  const el = $("exPick");
  if (!el) return;
  const D = t("exD");
  // Collapsed by default so it takes one line; it stays open while an example is in use or once the user opened it.
  const open = el.dataset.open === "1";
  el.classList.toggle("demo-on", !!DEMO);
  el.innerHTML = `<details class="ex-det"${open ? " open" : ""}><summary><h3>${h(DEMO ? t("exTitle") : t("exFirst"))}</h3>${DEMO ? `<span class="hint">· ${h(exName(DEMO))}</span>` : ""}</summary>
    <p class="hint">${h(t("exLead"))}</p>
    <div class="ex-grid">${EX_KEYS.map((k) => `<button type="button" class="ex-card${DEMO === k ? " on" : ""}" data-ex="${k}"${DEMO === k ? ' aria-current="true"' : ""}>
      <span class="ex-h"><span class="ex-dot ex-${k}" aria-hidden="true"></span>${h(exName(k))}${exMin(k) ? ` <span class="ex-min">${h(exMin(k))} ${h(t("exDur"))}</span>` : ""}${DEMO === k ? ` <span class="hint">· ${h(t("exCur"))}</span>` : ""}</span>
      <span class="ex-d">${h(D[k] || "")}</span></button>`).join("")}</div></details>`;
  // One tap opens everything, the next tap closes it (explicit, so no other tap target inside the pill can interfere).
  const det = el.querySelector("details");
  det.querySelector("summary").addEventListener("click", (e) => {
    e.preventDefault();
    det.open = !det.open;
    el.dataset.open = det.open ? "1" : "0";
    if (det.open) requestAnimationFrame(() => det.scrollIntoView({ block: "start", behavior: "smooth" }));
  });
  el.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { el.querySelectorAll("[data-ex]").forEach((x) => (x.disabled = true)); startDemo(b.dataset.ex); }));
}

// Step 3 «Después de grabar» / Results: let a practice run load sample retention data.
const _renderResultsCardD = renderResultsCard;
renderResultsCard = function () {
  _renderResultsCardD();
  if (!DEMO || G.retention) return;
  const act = document.querySelector("#gRes .actions");
  if (!act) return;
  const b = document.createElement("button");
  b.type = "button"; b.className = "small"; b.id = "exRetBtn"; b.textContent = t("exRet");
  act.insertBefore(b, act.firstChild.nextSibling);
  const note = document.createElement("p"); note.className = "hint"; note.textContent = t("exRetNote");
  act.insertAdjacentElement("afterend", note);
  b.addEventListener("click", () => { const e = EXAMPLES[DEMO_LANG][DEMO]; $("rsDur").value = e.realDur; $("rsData").value = e.retention; $("rsImport").click(); });
};
// Backup would export the practice space: block it while practicing.
const _renderBackupD = renderBackup;
renderBackup = function (cid) {
  if (!DEMO) return _renderBackupD(cid);
  const el = $(cid); if (!el) return;
  el.innerHTML = `<header class="g-h"><h2>${h(t("bkTitle"))}</h2></header><p class="hint">${h(t("exNoBackup"))}</p>`;
};
// The old single sample link is replaced by the three examples.
const _renderGuideD = renderGuide;
renderGuide = function () { _renderGuideD(); renderDemoBar(); }; // (2026-10-29) the old step-1 sample button is gone from guide_ui: the picker is the sample
const _gOnLangD = gOnLang;
gOnLang = function () { _gOnLangD(); renderDemoBar(); renderExPick(); };
renderExPick();
