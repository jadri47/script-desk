
/* ===== Guion · Escaleta · Prompter · Revisión (UI) ===== */
Object.assign(T.es, {
  modeReview: "Revisión", modeGuion: "Guion y prompter",
  gNeed: "Pega un guion en Revisión para armar la escaleta y el prompter.", gGoReview: "Ir a Revisión", gEditText: "Editar el texto completo", gGoGuion: "Escaleta y prompter →",
  gProd: "Producción", gNewProd: "Guardar como producción", gProdNone: "— sin guardar —", gSavedAt: (x) => `Guardado ${x}`, gSaving: "Guardando…", gUnsaved: "Cambios sin guardar",
  gSaveFail: "No se pudo guardar.", gQuota: "Espacio lleno: borra instantáneas antiguas.", gNoDb: "Las producciones se guardan al abrir esta página en Claude; aquí todo funciona, pero no se guarda.",
  gConflict: "Alguien guardó cambios en esta producción después de que la abriste.", gLoadTheirs: "Cargar sus cambios", gOverwrite: "Guardar los míos encima",
  status: { borrador: "Borrador", revision: "En revisión", aprobado: "Aprobado", grabado: "Grabado" }, gStatusLbl: "Estado", gGrabadoLock: "Primero apruébalo.",
  ppBtn: "Abrir prompter", rehBtn: "Ensayar con cronómetro", editSheetBtn: "Hoja para el editor (.md)",
  ppKeys: "Teclado o pedal: Espacio inicia o pausa · ↑ ↓ velocidad · ← → sección · R repite la sección · M espejo · Esc sale.",
  coTitle: "Apertura en frío", coLead: "Elige un gancho y una promesa que ya estén en el guion. Se graban una sola vez, en su lugar, y en la edición se copian al inicio del video: no hay que grabar una apertura aparte.",
  coHooks: "Gancho", coProms: "Promesa", coUseHook: "Usar como gancho", coUseProm: "Usar como promesa", coInUse: "En la apertura", coEdit: "Editar", coSee: "Ver en el guion",
  coSave: "Guardar cambio", coCancel: "Cancelar", coEditNote: "El cambio se aplica también en el guion: esa frase se graba en su lugar y de ahí sale el clip.",
  coFew: (n) => n ? `Solo encontré ${n} frase(s) que funcionan solas. Pide más a la IA o toca una frase en «Guion por secciones».` : "No encontré frases que funcionen solas. Pide sugerencias a la IA o toca una frase en «Guion por secciones».",
  coChosen: "Tu apertura", coEmpty: "Aún no eliges frases. Las sugerencias de abajo salen del propio guion.",
  coClipFrom: (a, b) => `clip de ${a}–${b} de la grabación`, coTotal: (s) => `Apertura de ≈${s} s`, coTargets: "Meta propia: gancho de 7 s o menos; gancho y promesa en 20 s o menos.",
  coModeDup: "Duplicar: la frase también suena en su lugar", coModeMove: "Mover: se quita de su lugar", coRemove: "Quitar", coAi: "Sugerir con IA", coAuto: "Ver sugerencias automáticas",
  coAiFrom: "Elegidas por la IA entre las frases del guion.", coRecNote: "En el prompter estas frases llevan la marca CLIP: dilas mirando a la cámara, con una pausa antes y después, para que el editor las corte limpias.",
  coLostOne: "Una frase de la apertura cambió en el texto; elígela de nuevo.",
  coSlotEmpty: (hook) => hook ? "Elige abajo la frase que engancha" : "Elige abajo la frase que dice qué van a aprender", coTap: "Toca una frase para usarla; tócala otra vez para quitarla.",
  coMoreN: (n) => `Ver ${n} más`, coLess: "Ver menos", coDup: "Duplicar", coMove: "Mover",
  why: { q: "pregunta", you: "habla al oyente", tension: "tensión", kw: "palabra clave", verse: "versículo", late: "anticipa lo que viene", promise: "dice qué se aprende", risk: "término sensible", open: "ya suena al inicio: usa «Mover»", connector: "empieza con conector: edítalo", ai: "IA" },
  escTitle: "Escaleta", escLead: "Tiempos estimados al ritmo del presentador; un ensayo los reemplaza por tiempos reales.",
  thNum: "#", thSec: "Sección", thStart: "Inicio", thEnd: "Fin", thDur: "Dur.", thLeft: "Queda", thLatest: "Empezar antes de", thReh: "Ensayo", thDelta: "Δ", thVideo: "En el video",
  target: "Duración objetivo", targetPh: "mm:ss", totalRec: (a) => `Grabación ≈${a}`, totalVideo: (a) => `video final ≈${a}`, overT: (x) => `${x} sobre el objetivo`, underT: (x) => `${x} bajo el objetivo`, coldRow: "Apertura en frío (clips)",
  flags: { hookLong: (s) => `El gancho dura ≈${s} s (meta propia: 7 s).`, hookGreeting: "El gancho es un saludo: elige una apertura en frío.", promiseLate: (t, d) => `La promesa termina en ${t} (meta propia: ${d || 20} s).`, noPromise: "No hay promesa en la apertura.", gap: (a, b) => `De ${a} a ${b}: un punto de más de 4 min sin pregunta ni anticipo (meta propia).`, extraCta: "Otra llamada a la acción: deja solo una.", noClose: "No hay cierre que anuncie el próximo episodio." },
  st: { hook: "Gancho", promise: "Promesa", intro: "Introducción", point: "Punto", body: "Desarrollo", cta: "Llamada a la acción", close: "Cierre" },
  conf: { alta: "detección segura", media: "detección probable", baja: "corte sugerido", manual: "ajustado a mano" },
  secTitle: "Guion por secciones", secLead: "Toca una frase para empezar una sección ahí, editarla o usarla en la apertura. Escribe «## Título» o [B-ROLL: …], [TEXTO: …], [PAUSA] en el guion para marcar secciones y señales.",
  redetect: "Volver a detectar", upOne: "Subir el inicio una frase", downOne: "Bajar el inicio una frase", mergePrev: "Unir con la anterior", startHere: "Empezar sección aquí", editSel: "Editar frase", closeBar: "Cerrar",
  notes: "Notas", addNote: "Añadir nota", notePh: "Nota para esta sección…", roles: { productor: "Productor", presentador: "Presentador" }, resolved: "Resuelta", openNotes: (n) => `${n} abierta(s)`,
  revTitle: "Revisiones", revLead: "Cada cambio de estado guarda una instantánea. Compara dos para ver qué cambió.", snapPh: "Nombre, p. ej. «Después de las notas»", snapSave: "Guardar instantánea",
  snapCompare: "Comparar las dos marcadas", snapVsCurrent: "Comparar con el texto actual", snapPick2: "Marca dos instantáneas.", snapNone: "Aún no hay instantáneas.", snapAuto: (s) => `Estado: ${s}`, snapNeedsDb: "Las instantáneas se guardan al abrir la página en Claude.",
  diffLegend: "Verde: añadido · tachado: quitado.", diffSame: "No hay diferencias.", diffTitle: (a, b) => `${a} → ${b}`, current: "texto actual", restore: "Usar este texto",
  ppSpeed: "ppm", ppElapsed: "Tiempo", ppSecLeft: "Queda en la sección", ppEnd: "Fin estimado", ppOn: "a tiempo", ppOver: (x) => `+${x} sobre el plan`, ppUnder: (x) => `−${x} bajo el plan`,
  ppMirror: "Espejo", ppCues: "Señales", ppFull: "Pantalla completa", ppExit: "Salir", ppWidth: "Ancho", ppFont: "Letra", ppStart: "Toca o pulsa Espacio para empezar", ppClip: "CLIP", ppPaused: "En pausa", ppDone: "Fin del guion",
  ppLap: "Sección terminada", ppRehHint: "Ensayo: → o Intro marca la sección como terminada. Espacio pausa.", ppLapLbl: "Esta sección",
  rehTitle: "Resultado del ensayo", rehSave: "Guardar ensayo", rehDiscard: "Cerrar sin guardar", rehApply: (k) => `Usar este ritmo (factor ${k})`, rehSaved: "Ensayo guardado.", rehNotSaved: "No se guardó el ritmo; se usará el anterior la próxima vez.", srLoadFail: "No se pudieron cargar tus episodios. Tus episodios siguen guardados.", srDateFail: "No se guardó la fecha. Se mantiene la anterior.", snapLoadFail: "No se pudieron cargar las versiones guardadas.", srRetry: "Reintentar", rehApplied: "Ritmo actualizado: las estimaciones usan el del ensayo.",
  rehTot: (a, b) => `Estimado ${a} · real ${b}`, rehEst: "Estimado", rehReal: "Real",
  sheetTitle: "Hoja de edición", sheetNote: "Tiempos estimados: busca cada frase en la grabación.", cuesTitle: "Señales para edición", clipsTitle: "Clips para la apertura en frío", openNotesTitle: "Notas abiertas", modeLbl: "Modo",
  aiPickNeed: "La IA solo funciona dentro de Claude.",
});
Object.assign(T.en, {
  modeReview: "Review", modeGuion: "Script and prompter",
  gNeed: "Paste a script in Review to build the rundown and the prompter.", gGoReview: "Go to Review", gEditText: "Edit the full text", gGoGuion: "Rundown and prompter →",
  gProd: "Production", gNewProd: "Save as a production", gProdNone: "— not saved —", gSavedAt: (x) => `Saved ${x}`, gSaving: "Saving…", gUnsaved: "Unsaved changes",
  gSaveFail: "Couldn't save.", gQuota: "Storage full: delete old snapshots.", gNoDb: "Productions are saved when this page is opened in Claude; everything works here, but nothing is saved.",
  gConflict: "Someone saved changes to this production after you opened it.", gLoadTheirs: "Load their changes", gOverwrite: "Save mine over it",
  status: { borrador: "Draft", revision: "In review", aprobado: "Approved", grabado: "Recorded" }, gStatusLbl: "Status", gGrabadoLock: "Approve it first.",
  ppBtn: "Open prompter", rehBtn: "Rehearse with stopwatch", editSheetBtn: "Editor sheet (.md)",
  ppKeys: "Keyboard or pedal: Space starts or pauses · ↑ ↓ speed · ← → section · R repeats the section · M mirror · Esc exits.",
  coTitle: "Cold open", coLead: "Pick a hook and a promise that are already in the script. They're recorded once, in place, and the editor copies them to the start of the video: no separate opening to record.",
  coHooks: "Hook", coProms: "Promise", coUseHook: "Use as hook", coUseProm: "Use as promise", coInUse: "In the opening", coEdit: "Edit", coSee: "Show in script",
  coSave: "Save change", coCancel: "Cancel", coEditNote: "The change also applies to the script: that line is recorded in place and the clip comes from there.",
  coFew: (n) => n ? `Only ${n} line(s) work on their own. Ask the AI for more or tap a line in "Script by section".` : `No lines work on their own. Ask the AI or tap a line in "Script by section".`,
  coChosen: "Your opening", coEmpty: "No lines picked yet. The suggestions below come from the script itself.",
  coClipFrom: (a, b) => `clip from ${a}–${b} of the recording`, coTotal: (s) => `Opening of ≈${s} s`, coTargets: "Our target: hook of 7 s or less; hook and promise within 20 s.",
  coModeDup: "Duplicate: the line also plays in place", coModeMove: "Move: it's cut from its place", coRemove: "Remove", coAi: "Suggest with AI", coAuto: "Show automatic suggestions",
  coAiFrom: "Picked by the AI from the script's own lines.", coRecNote: "In the prompter these lines carry a CLIP mark: say them to the lens, with a pause before and after, so the editor can cut them cleanly.",
  coLostOne: "A cold-open line changed in the text; pick it again.",
  coSlotEmpty: (hook) => hook ? "Pick the line that hooks them below" : "Pick the line that says what they'll learn below", coTap: "Tap a line to use it; tap it again to remove it.",
  coMoreN: (n) => `Show ${n} more`, coLess: "Show less", coDup: "Duplicate", coMove: "Move",
  why: { q: "question", you: "speaks to the viewer", tension: "tension", kw: "keyword", verse: "verse", late: "teases what's coming", promise: "says what they'll learn", risk: "sensitive term", open: "already at the start: use Move", connector: "starts with a connector: edit it", ai: "AI" },
  escTitle: "Rundown", escLead: "Times estimated at the host's pace; a rehearsal replaces them with real times.",
  thNum: "#", thSec: "Section", thStart: "Start", thEnd: "End", thDur: "Dur.", thLeft: "Left", thLatest: "Start by", thReh: "Rehearsal", thDelta: "Δ", thVideo: "In the video",
  target: "Target length", targetPh: "mm:ss", totalRec: (a) => `Recording ≈${a}`, totalVideo: (a) => `final video ≈${a}`, overT: (x) => `${x} over target`, underT: (x) => `${x} under target`, coldRow: "Cold open (clips)",
  flags: { hookLong: (s) => `The hook runs ≈${s} s (our target: 7 s).`, hookGreeting: "The hook is a greeting: pick a cold open.", promiseLate: (t, d) => `The promise ends at ${t} (our target: ${d || 20} s).`, noPromise: "No promise in the opening.", gap: (a, b) => `From ${a} to ${b}: a point over 4 min with no question or teaser (our target).`, extraCta: "Another call to action: keep only one.", noClose: "No ending that points to the next episode." },
  st: { hook: "Hook", promise: "Promise", intro: "Intro", point: "Point", body: "Body", cta: "Call to action", close: "Close" },
  conf: { alta: "confident", media: "likely", baja: "suggested split", manual: "set by hand" },
  secTitle: "Script by section", secLead: "Tap a line to start a section there, edit it or use it in the cold open. Write \"## Title\" or [B-ROLL: …], [TEXT: …], [PAUSE] in the script to mark sections and cues.",
  redetect: "Detect again", upOne: "Move start up one line", downOne: "Move start down one line", mergePrev: "Merge with previous", startHere: "Start section here", editSel: "Edit line", closeBar: "Close",
  notes: "Notes", addNote: "Add note", notePh: "Note for this section…", roles: { productor: "Producer", presentador: "Host" }, resolved: "Resolved", openNotes: (n) => `${n} open`,
  revTitle: "Revisions", revLead: "Every status change saves a snapshot. Compare two to see what changed.", snapPh: "Name, e.g. \"After notes\"", snapSave: "Save snapshot",
  snapCompare: "Compare the two checked", snapVsCurrent: "Compare with current text", snapPick2: "Check two snapshots.", snapNone: "No snapshots yet.", snapAuto: (s) => `Status: ${s}`, snapNeedsDb: "Snapshots are saved when this page is opened in Claude.",
  diffLegend: "Green: added · struck through: removed.", diffSame: "No differences.", diffTitle: (a, b) => `${a} → ${b}`, current: "current text", restore: "Use this text",
  ppSpeed: "wpm", ppElapsed: "Time", ppSecLeft: "Left in section", ppEnd: "Estimated end", ppOn: "on time", ppOver: (x) => `+${x} over plan`, ppUnder: (x) => `−${x} under plan`,
  ppMirror: "Mirror", ppCues: "Cues", ppFull: "Full screen", ppExit: "Exit", ppWidth: "Width", ppFont: "Text", ppStart: "Tap or press Space to start", ppClip: "CLIP", ppPaused: "Paused", ppDone: "End of script",
  ppLap: "Section done", ppRehHint: "Rehearsal: → or Enter marks the section done. Space pauses.", ppLapLbl: "This section",
  rehTitle: "Rehearsal result", rehSave: "Save rehearsal", rehDiscard: "Close without saving", rehApply: (k) => `Use this pace (factor ${k})`, rehSaved: "Rehearsal saved.", rehNotSaved: "Pace not saved; the previous one is used next time.", srLoadFail: "Couldn't load your episodes. They are still saved.", srDateFail: "The date wasn't saved. The previous one is kept.", snapLoadFail: "Couldn't load your saved versions.", srRetry: "Retry", rehApplied: "Pace updated: estimates now use the rehearsal's.",
  rehTot: (a, b) => `Estimated ${a} · real ${b}`, rehEst: "Estimated", rehReal: "Real",
  sheetTitle: "Edit sheet", sheetNote: "Estimated times: find each line in the recording.", cuesTitle: "Cues for the edit", clipsTitle: "Clips for the cold open", openNotesTitle: "Open notes", modeLbl: "Mode",
  aiPickNeed: "AI only works inside Claude.",
});

const STATUSES = ["borrador", "revision", "aprobado", "grabado"];
const SEC_COLOR = { hook: "var(--accent)", promise: "var(--verde)", intro: "var(--ink-2)", point: "var(--gold)", body: "var(--rule)", cta: "var(--amarillo)", close: "var(--reg)" };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* best effort: storage blocked or full: the setting just isn't remembered */ } };

const G = {
  mode: lsGet("sd-mode") === "guion" ? "guion" : "review",
  prodId: null, status: "borrador", layout: null, manual: false,
  cold: { hook: null, promise: null }, coldLost: false,
  notes: [], rehearsals: [], target: "", loadedAt: 0, saveState: "", conflict: null,
  prods: [], snaps: [], loadErr: { prods: false, snaps: false }, srMsg: "", snapSel: [], diffHTML: "", sel: null, editing: null, aiPick: null,
  R: null, U: [], secs: [], flags: [], cands: null, text: "",
  sid: Math.random().toString(36).slice(2), role: lsGet("sd-role") === "presentador" ? "presentador" : "productor",
};

function coldForEngine() {
  const c = G.cold;
  if (!c.hook && !c.promise) return null;
  const clips = [c.hook, c.promise].filter(Boolean);
  return { hook: c.hook ? c.hook.text : "", promise: c.promise ? c.promise.text : "", mode: clips.every((x) => x.mode === "move") ? "move" : "dup" };
}

// ---------- compute ----------
function remapCold(U) {
  G.coldLost = false;
  for (const k of ["hook", "promise"]) {
    const c = G.cold[k];
    if (!c) continue;
    let best = -1, bd = Infinity;
    U.forEach((u, i) => { if (u.text.slice(0, 80) === c.anchor) { const d = Math.abs(i - c.i); if (d < bd) { bd = d; best = i; } } });
    if (best < 0) { G.cold[k] = null; G.coldLost = true; } else G.cold[k] = { i: best, anchor: U[best].text.slice(0, 80), text: U[best].text, mode: c.mode === "move" ? "move" : "dup" };
  }
}
function gCompute() {
  const text = $("script").value;
  G.text = text;
  if (!text.trim()) { G.R = null; G.U = []; G.secs = []; return; }
  let R = analyze(text, { ...readOpts(), coldOpen: null });
  const U = buildUnits(R, text);
  remapCold(U);
  if (coldForEngine()) R = analyze(text, readOpts());
  G.R = R; G.U = U;
  G.layout = G.manual && G.layout ? remapLayout(G.layout, U) : detectLayout(U, R);
  G.secs = sectionsFrom(G.layout, U, R.runtimeSec);
  G.flags = sectionFlags(G.secs, U, R, { hook: !!G.cold.hook, promise: !!G.cold.promise });
  G.cands = { hook: coldCandidates(U, R, "hook", { keyword: R.keyword }), promise: coldCandidates(U, R, "promise", { keyword: R.keyword }) };
}
function gRefresh() { gCompute(); renderGuion(); }

function coldClips() {
  return ["hook", "promise"].map((k) => { const c = G.cold[k]; const u = c && G.U[c.i]; return u ? { kind: k, i: u.i, t0: u.t0, t1: u.t1, dur: u.t1 - u.t0, text: u.text, mode: c.mode === "move" ? "move" : "dup" } : null; }).filter(Boolean);
}
const coldSec = () => coldClips().reduce((a, c) => a + c.dur, 0);
function finalT(t) {
  const clips = coldClips();
  let off = clips.reduce((a, c) => a + c.dur, 0);
  for (const c of clips) if (c.mode === "move") off -= Math.max(0, Math.min(t, c.t1) - c.t0);
  return t + off;
}
const totalRec = () => (G.secs.length ? G.secs[G.secs.length - 1].t1 : 0);
const totalVideo = () => finalT(totalRec());
const parseMMSS = (s) => { const m = String(s || "").trim().match(/^(\d{1,3}):(\d{2})$/); return m ? +m[1] * 60 + +m[2] : null; };
const secLabel = (s) => (s.type === "point" ? `${t("st").point} ${s.n}` : t("st")[s.type]) + (s.title && s.title.toLowerCase() !== (t("st")[s.type] || "").toLowerCase() ? ` · ${s.title}` : "");
const secAt = (i) => G.secs.find((s) => i >= s.first && i <= s.last);

// ---------- save state / productions (db) ----------
let saveTimer = null;
function setSave(x) { G.saveState = x; const el = $("gSaveState"); if (el) el.textContent = saveText(); }
function saveText() {
  const x = G.saveState;
  if (x === "saving") return t("gSaving");
  if (x === "unsaved") return t("gUnsaved");
  if (x === "fail") return t("gSaveFail");
  if (x === "quota") return t("gQuota");
  if (x && x.startsWith("saved:")) return t("gSavedAt")(new Date(+x.slice(6)).toLocaleTimeString(UI, { hour: "numeric", minute: "2-digit" }));
  return "";
}
function markDirty() {
  if (!G.prodId) return;
  setSave("unsaved");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveProd(false), 2000);
}
function prodBody(now) {
  const text = $("script").value;
  return {
    title: $("title").value || $("series").value || text.trim().slice(0, 60), series: $("series").value, keyword: $("keyword").value, thumb: $("thumb").value, description: $("description").value, translation: $("translation").value, lang: $("lang").value,
    text, status: G.status, manual: G.manual, layout: G.manual && G.layout ? G.layout.map(({ first, anchor, type, conf, title }) => ({ first, anchor, type, conf, title: title || "" })) : null,
    cold: G.cold, notes: G.notes, rehearsals: G.rehearsals.slice(-10), target: G.target, retention: G.retention || null, realDur: G.realDur || "", shorts: G.shorts || [], updatedAt: now, updatedBy: G.sid,
  };
}
async function createProd() {
  const db = await caps.db;
  if (!db) return false;
  try {
    const now = Date.now();
    const ref = await db.collection("producciones").add(prodBody(now));
    G.prodId = ref.id; G.loadedAt = now; setSave("saved:" + now);
    loadProds();
    return true;
  } catch (e) { setSave(e && e.code === "quota_exceeded" ? "quota" : "fail"); return false; }
}
async function saveProd(force) {
  const db = await caps.db;
  if (!db || !G.prodId) return;
  const ref = db.collection("producciones").doc(G.prodId);
  setSave("saving");
  try {
    if (!force) {
      const snap = await ref.get();
      const d = snap.exists ? snap.data() : null;
      if (d && d.updatedAt > G.loadedAt && d.updatedBy !== G.sid) { G.conflict = d; setSave("unsaved"); renderGuion(); return; }
    }
    const now = Date.now();
    await ref.set(prodBody(now));
    G.loadedAt = now; G.conflict = null; setSave("saved:" + now);
    if (force) renderGuion();
  } catch (e) { setSave(e && e.code === "quota_exceeded" ? "quota" : "fail"); }
}
async function loadProds() {
  const db = await caps.db;
  if (!db) return;
  try {
    const q = await db.collection("producciones").orderBy("updatedAt", "desc").limit(30).get();
    G.prods = q.docs.map((d) => ({ id: d.id, title: (d.data() || {}).title || "", status: (d.data() || {}).status || "borrador", updatedAt: (d.data() || {}).updatedAt || 0 }));
    G.loadErr.prods = false;
    if (G.mode === "guion") renderProdBar();
  } catch (e) { G.loadErr.prods = true; if ($("gSeriesFull") || $("epList")) renderSeriesAll(); }
}
function applyProd(id, d) {
  G.prodId = id;
  $("script").value = d.text || "";
  [["title", "title"], ["series", "series"], ["keyword", "keyword"], ["thumb", "thumb"], ["description", "description"]].forEach(([el, k]) => ($(el).value = d[k] || ""));
  if (d.translation) $("translation").value = d.translation;
  if (d.lang) $("lang").value = d.lang;
  G.status = d.status || "borrador"; G.manual = !!d.manual; G.layout = d.layout || null;
  G.cold = d.cold ? { hook: d.cold.hook || null, promise: d.cold.promise || null } : { hook: null, promise: null }; G.notes = d.notes || []; G.rehearsals = d.rehearsals || []; G.target = d.target || "";
  G.retention = d.retention || null; G.realDur = d.realDur || ""; G.shorts = d.shorts || []; G.pkSug = null;
  G.loadedAt = d.updatedAt || Date.now(); G.conflict = null; G.aiPick = null; G.diffHTML = ""; G.snapSel = []; G.sel = null;
  setSave(d.updatedAt ? "saved:" + d.updatedAt : "");
  updateLive();
}
async function openProd(id) {
  const db = await caps.db;
  if (!db || !id) return;
  try {
    const snap = await db.collection("producciones").doc(id).get();
    if (!snap.exists) return;
    applyProd(id, snap.data());
    await loadSnaps();
    gRefresh();
  } catch (e) { setSave("fail"); }
}
async function loadSnaps() {
  const db = await caps.db;
  G.snaps = [];
  if (!db || !G.prodId) return;
  try {
    const q = await db.collection("instantaneas").where("prodId", "==", G.prodId).limit(60).get();
    G.snaps = q.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.at - a.at);
    G.loadErr.snaps = false;
  } catch (e) { G.loadErr.snaps = true; if ($("gRev")) renderRevisions(); }
}
async function addSnap(name) {
  const db = await caps.db;
  if (!db) return;
  if (!G.prodId && !(await createProd())) return;
  try {
    const text = $("script").value;
    await db.collection("instantaneas").add({ prodId: G.prodId, name: name || new Date().toLocaleString(UI), status: G.status, text, wc: (G.R && G.R.wc) || 0, at: Date.now() });
    await loadSnaps();
    renderRevisions();
  } catch (e) { setSave(e && e.code === "quota_exceeded" ? "quota" : "fail"); }
}
async function setStatus(s) {
  if (s === "grabado" && !["aprobado", "grabado"].includes(G.status)) return;
  if (s === "aprobado" && G.status !== "grabado" && packGateMissing().length) return;
  G.status = s;
  const db = await caps.db;
  if (db) {
    if (!G.prodId) await createProd();
    await addSnap(t("snapAuto")(t("status")[s]));
    await saveProd(false);
  }
  renderGuion();
}

// ---------- rendering ----------
function renderGuion() {
  const root = $("guion");
  if (!root) return;
  if (!G.R) {
    root.innerHTML = `<div class="g-empty"><p>${h(t("gNeed"))}</p><button class="primary" data-gomode="review">${h(t("gGoReview"))}</button></div>`;
    wireGoMode(root);
    return;
  }
  root.innerHTML = `<div id="gProdBar"></div>
    <div class="g-actions"><button class="primary" id="gPP">${h(t("ppBtn"))}</button><button id="gReh">${h(t("rehBtn"))}</button><button id="gSheet">${h(t("editSheetBtn"))}</button><button class="linkish" data-gomode="review">${h(t("gEditText"))}</button></div>
    <p class="hint g-keys">${h(t("ppKeys"))}</p>
    <nav class="quick g-nav" aria-label="${h(t("sections"))}">${[["gCold", "navCold"], ["gEsc", "navEsc"], ["gSecs", "navSecs"], ["gPack", "navPack"], ["gShorts", "navShorts"], ["gRes", "navRes"], ["gRev", "navRev"]].map(([id, k]) => `<a href="#${id}" data-jump="${id}">${h(t(k))}</a>`).join("")}</nav>
    <section class="g-card" id="gCold"></section>
    <section class="g-card" id="gEsc"></section>
    <section class="g-card" id="gSecs"></section>
    <section class="g-card" id="gTopic"></section>
    <section class="g-card" id="gPack"></section>
    <section class="g-card" id="gShorts"></section>
    <section class="g-card" id="gRes"></section>
    <section class="g-card" id="gRev"></section>
    <div class="g-selbar" id="gSelBar" hidden></div>`;
  renderProdBar(); renderCold(); renderEsc(); renderSecs(); renderTopic(); renderPack(); renderShorts(); renderResultsCard(); renderRevisions();
  root.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const x = $(a.dataset.jump); if (x) x.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }));
  $("gPP").addEventListener("click", () => openPrompter("prompter"));
  $("gReh").addEventListener("click", () => openPrompter("ensayo"));
  $("gSheet").addEventListener("click", exportEditSheet);
  wireGoMode(root);
}
function wireGoMode(root) { root.querySelectorAll("[data-gomode]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); setMode(b.dataset.gomode); })); }

function renderProdBar() {
  const el = $("gProdBar");
  if (!el) return;
  caps.db.then((db) => {
    const opts = G.prods.map((p) => `<option value="${h(p.id)}"${p.id === G.prodId ? " selected" : ""}>${h(p.title || "—")} · ${h(t("status")[p.status] || p.status)}</option>`).join("");
    const missing = G.R ? packGateMissing() : [];
    const P = t("pk"), mLabel = (c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]).toLowerCase();
    const steps = STATUSES.map((s) => {
      const locked = (s === "grabado" && !["aprobado", "grabado"].includes(G.status)) || (s === "aprobado" && G.status !== "aprobado" && G.status !== "grabado" && missing.length > 0);
      const why = s === "grabado" ? t("gGrabadoLock") : t("pkGate")(missing.map(mLabel).join("; "));
      return `<button class="small" data-status="${s}" aria-pressed="${G.status === s}"${locked ? ` disabled title="${h(why)}"` : ""}>${h(t("status")[s])}</button>`;
    }).join(`<i aria-hidden="true">→</i>`) + (missing.length && !["aprobado", "grabado"].includes(G.status) ? `<span class="g-gate">${h(t("pkGate")(missing.map(mLabel).join("; ")))} <a href="#gPack" data-jump="gPack">${h(t("pkGoFix"))}</a></span>` : "");
    el.innerHTML = `<div class="g-bar">
      <div class="g-prod">${db ? `<label for="gProdSel">${h(t("gProd"))}</label><select id="gProdSel">${G.prodId ? "" : `<option value="">${h(t("gProdNone"))}</option>`}${opts}</select>${G.prodId ? "" : `<button class="small primary" id="gNewProd">${h(t("gNewProd"))}</button>`}<span class="status" id="gSaveState">${h(saveText())}</span>` : `<span class="hint">${h(t("gNoDb"))}</span>`}</div>
      <div class="g-status" role="group" aria-label="${h(t("gStatusLbl"))}">${steps}</div>
      ${G.conflict ? `<div class="g-conflict"><span>${h(t("gConflict"))}</span><button class="small" id="gTheirs">${h(t("gLoadTheirs"))}</button><button class="small" id="gMine">${h(t("gOverwrite"))}</button></div>` : ""}
    </div>`;
    const sel = $("gProdSel");
    if (sel) sel.addEventListener("change", () => { if (sel.value) openProd(sel.value); });
    const np = $("gNewProd");
    if (np) np.addEventListener("click", async () => { np.disabled = true; await createProd(); renderProdBar(); });
    el.querySelectorAll("[data-status]").forEach((b) => b.addEventListener("click", () => setStatus(b.dataset.status)));
    el.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const x = $(a.dataset.jump); if (x) x.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    const th = $("gTheirs"); if (th) th.addEventListener("click", () => { const d = G.conflict; applyProd(G.prodId, d); gRefresh(); });
    const mi = $("gMine"); if (mi) mi.addEventListener("click", () => saveProd(true));
  });
}

const ICO = {
  edit: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M13.6 3.4a2 2 0 0 1 2.8 2.8L7 15.6 3.5 16.5l.9-3.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  see: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M1.8 10S5 4.5 10 4.5 18.2 10 18.2 10 15 15.5 10 15.5 1.8 10 1.8 10z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="10" r="2.4" fill="currentColor"/></svg>`,
  x: `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};
function whyChips(c) { return c.why.map((w) => `<span class="chip">${h(t("why")[w] || w)}</span>`).join(""); }
function candHTML(c, kind) {
  const inUse = G.cold[kind] && G.cold[kind].i === c.i;
  const s = secAt(c.i);
  return `<div class="co-cand${inUse ? " in-use" : ""}" data-i="${c.i}" data-kind="${kind}">
    <button type="button" class="co-pick" data-use="${kind}" data-i="${c.i}" aria-pressed="${inUse}" title="${h(inUse ? t("coRemove") : kind === "hook" ? t("coUseHook") : t("coUseProm"))}"><span class="co-radio" aria-hidden="true"></span>
      <span class="co-body"><span class="co-text">«${h(c.text)}»</span><span class="co-meta"><span>${fmtTime(c.t0)} · ≈${Math.max(1, Math.round(c.dur))} s${s ? " · " + h(secLabel(s)) : ""}</span>${whyChips(c)}</span>${c.note ? `<span class="co-note">${h(c.note)}</span>` : ""}</span></button>
    <span class="co-tools"><button type="button" class="icon" data-edit="${c.i}" title="${h(t("coEdit"))}" aria-label="${h(t("coEdit"))}">${ICO.edit}</button><button type="button" class="icon" data-see="${c.i}" title="${h(t("coSee"))}" aria-label="${h(t("coSee"))}">${ICO.see}</button></span>
    ${G.editing === c.i ? editBoxHTML(c.i) : ""}</div>`;
}
function editBoxHTML(i) {
  const u = G.U[i];
  return `<div class="co-editbox"><label class="hint" for="coEditTa">${h(t("coEditNote"))}</label><textarea id="coEditTa" rows="3">${h(u ? u.text : "")}</textarea>
    <div class="actions" style="margin-top:8px"><button class="small primary" id="coEditSave">${h(t("coSave"))}</button><button class="small" id="coEditCancel">${h(t("coCancel"))}</button></div></div>`;
}
function renderCold() {
  const el = $("gCold");
  if (!el) return;
  G.coMore = G.coMore || {};
  const clips = coldClips(), tot = coldSec();
  const hookC = clips.find((c) => c.kind === "hook");
  const good = (!hookC || hookC.dur <= 7.5) && tot <= 20;
  const slot = (kind) => {
    const c = clips.find((x) => x.kind === kind), lbl = kind === "hook" ? t("coHooks") : t("coProms");
    if (!c) return `<div class="co-slot empty"><span class="co-k">${h(lbl)}</span><span class="co-ph">${h(t("coSlotEmpty")(kind === "hook"))}</span></div>`;
    return `<div class="co-slot"><span class="co-k">${h(lbl)} <span class="hint">${h(t("coClipFrom")(fmtTime(c.t0), fmtTime(c.t1)))} · ≈${Math.max(1, Math.round(c.dur))} s</span></span>
      <span class="co-text">«${h(c.text)}»</span>
      <span class="co-li-act"><span class="seg" role="group" aria-label="${h(t("modeLbl"))}"><button type="button" class="small" data-cmode="${kind}" data-v="dup" aria-pressed="${c.mode !== "move"}" title="${h(t("coModeDup"))}">${h(t("coDup"))}</button><button type="button" class="small" data-cmode="${kind}" data-v="move" aria-pressed="${c.mode === "move"}" title="${h(t("coModeMove"))}">${h(t("coMove"))}</button></span>
      <button type="button" class="icon" data-rm="${kind}" title="${h(t("coRemove"))}" aria-label="${h(t("coRemove"))}">${ICO.x}</button></span></div>`;
  };
  const src = G.aiPick || G.cands;
  const col = (kind) => {
    const list = (src && src[kind]) || [];
    const chosen = G.cold[kind] && list.findIndex((c) => c.i === G.cold[kind].i);
    const n = G.coMore[kind] ? list.length : Math.max(2, chosen >= 2 ? chosen + 1 : 2);
    const more = list.length - n;
    return `<div class="co-col"><h4>${h(kind === "hook" ? t("coHooks") : t("coProms"))}</h4>${list.slice(0, n).map((c) => candHTML(c, kind)).join("")}
      ${more > 0 ? `<button type="button" class="linkish small co-more" data-comore="${kind}">${h(t("coMoreN")(more))}</button>` : G.coMore[kind] && list.length > 2 ? `<button type="button" class="linkish small co-more" data-comore="${kind}">${h(t("coLess"))}</button>` : ""}
      ${list.length < 3 && !G.aiPick ? `<p class="hint">${h(t("coFew")(list.length))}</p>` : ""}</div>`;
  };
  el.innerHTML = `<header class="g-h"><h2>${h(t("coTitle"))}</h2><span class="g-ai"><button class="small" id="coAi">${h(G.aiPick ? t("coAuto") : t("coAi"))}</button></span></header>
    <p class="lead">${h(t("coLead"))}</p>${G.coldLost ? `<p class="status err">${h(t("coLostOne"))}</p>` : ""}
    <div class="co-box${clips.length ? " has" : ""}"><h3>${h(t("coChosen"))}</h3>${clips.length ? `<span class="verdict-tag ${good ? "v-ok" : "v-mid"}">${h(t("coTotal")(Math.round(tot)))}</span>` : ""}
      <div class="co-slots">${slot("hook")}${slot("promise")}</div>
      ${clips.length ? `<p class="hint co-foot">${h(t("coTargets"))} ${h(t("coRecNote"))}</p>` : ""}</div>
    ${G.aiPick ? `<p class="hint">${h(t("coAiFrom"))}</p>` : `<p class="hint co-tap">${h(t("coTap"))}</p>`}<div class="co-cols">${col("hook")}${col("promise")}</div><p class="status" id="coAiStatus"></p>`;
  el.querySelectorAll("[data-use]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.use, i = +b.dataset.i; if (G.cold[k] && G.cold[k].i === i) { G.cold[k] = null; markDirty(); gRefresh(); } else useCold(k, i); }));
  el.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => { G.cold[b.dataset.rm] = null; markDirty(); gRefresh(); }));
  el.querySelectorAll("[data-comore]").forEach((b) => b.addEventListener("click", () => { G.coMore[b.dataset.comore] = !G.coMore[b.dataset.comore]; renderCold(); }));
  el.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => { G.editing = G.editing === +b.dataset.edit ? null : +b.dataset.edit; renderCold(); const ta = $("coEditTa"); if (ta) ta.focus(); }));
  el.querySelectorAll("[data-see]").forEach((b) => b.addEventListener("click", () => showUnit(+b.dataset.see)));
  el.querySelectorAll("[data-cmode]").forEach((r) => r.addEventListener("click", () => { const c = G.cold[r.dataset.cmode]; if (c && c.mode !== r.dataset.v) { c.mode = r.dataset.v; markDirty(); gRefresh(); } }));
  const sv = $("coEditSave"); if (sv) sv.addEventListener("click", () => { const i = G.editing; G.editing = null; applyEdit(i, $("coEditTa").value); });
  const cc = $("coEditCancel"); if (cc) cc.addEventListener("click", () => { G.editing = null; renderCold(); });
  $("coAi").addEventListener("click", (e) => { if (G.aiPick) { G.aiPick = null; renderCold(); } else aiPickCold(e.target); });
}
function useCold(kind, i) {
  const u = G.U[i];
  if (!u) return;
  G.cold[kind] = { i, anchor: u.text.slice(0, 80), text: u.text, mode: u.t0 < 20 ? "move" : "dup" };
  markDirty(); gRefresh();
}
function applyEdit(i, newText) {
  const u = G.U[i];
  newText = String(newText || "").replace(/\s+/g, " ").trim();
  if (!u || !newText || newText === u.text) { renderGuion(); return; }
  const ta = $("script"), text = ta.value;
  const anchor = newText.slice(0, 80);
  for (const k of ["hook", "promise"]) if (G.cold[k] && G.cold[k].i === i) G.cold[k] = { ...G.cold[k], anchor, text: newText };
  if (G.layout) G.layout.forEach((L) => { if (L.first === i) L.anchor = anchor; });
  G.notes.forEach((n) => { if (n.ui === i) n.anchor = anchor; });
  if (G.aiPick) for (const k of ["hook", "promise"]) G.aiPick[k] = G.aiPick[k].map((c) => (c.i === i ? { ...c, text: newText } : c));
  ta.value = text.slice(0, u.start) + newText + text.slice(u.end);
  updateLive(); markDirty(); gRefresh();
}

function renderEsc() {
  const el = $("gEsc");
  if (!el) return;
  const clips = coldClips(), cs = coldSec(), tgt = parseMMSS(G.target), rec = totalRec(), vid = totalVideo();
  const reh = G.rehearsals[G.rehearsals.length - 1];
  const lapFor = (s) => { if (!reh) return null; const l = reh.laps.find((x) => x.anchor === s.anchor) || reh.laps.find((x) => x.first === s.first); return l ? l.sec : null; };
  const showVideo = clips.length > 0;
  const head = `<tr><th>${h(t("thNum"))}</th><th>${h(t("thSec"))}</th><th>${h(t("thStart"))}</th><th>${h(t("thEnd"))}</th><th>${h(t("thDur"))}</th>${showVideo ? `<th>${h(t("thVideo"))}</th>` : ""}<th>${h(tgt ? t("thLatest") : t("thLeft"))}</th><th>${h(t("thReh"))}</th><th>${h(t("thDelta"))}</th></tr>`;
  const fl = t("flags");
  const flagTxt = (f) => (f.id === "hookLong" ? fl.hookLong(f.v) : f.id === "promiseLate" ? fl.promiseLate(fmtTime(f.v), f.d) : f.id === "gap" ? fl.gap(fmtTime(f.a), fmtTime(f.b)) : fl[f.id]);
  const coldRow = showVideo ? `<tr class="cold"><td>0</td><td><span class="tdot" style="--c:var(--mul)"></span>${h(t("coldRow"))}<div class="hint">${clips.map((c) => `${fmtTime(c.t0)}–${fmtTime(c.t1)}`).join(" + ")}</div></td><td>—</td><td>—</td><td>${fmtTime(cs)}</td><td>0:00</td><td></td><td></td><td></td></tr>` : "";
  const rows = G.secs.map((s) => {
    const lap = lapFor(s), d = lap != null ? lap - s.dur : null;
    const left = tgt ? fmtTime(Math.max(0, tgt - (vid - finalT(s.t0)))) : fmtTime(Math.max(0, rec - s.t1));
    const fs = G.flags[s.k] || [];
    const first = G.U[s.first] ? G.U[s.first].text : "";
    return `<tr${fs.length ? ' class="flagged"' : ""}><td>${s.k + 1}</td><td><span class="tdot" style="--c:${SEC_COLOR[s.type]}"></span><a href="#gs-${s.k}" class="g-seclink">${h(secLabel(s))}</a><div class="hint">«${h(first.split(/\s+/).slice(0, 8).join(" "))}${first.split(/\s+/).length > 8 ? "…" : ""}»</div>${fs.map((f) => `<div class="flag">${h(flagTxt(f))}</div>`).join("")}</td>
      <td>${fmtTime(s.t0)}</td><td>${fmtTime(s.t1)}</td><td>${fmtTime(s.dur)}</td>${showVideo ? `<td>${fmtTime(finalT(s.t0))}</td>` : ""}<td>${left}</td><td>${lap != null ? fmtTime(lap) : "—"}</td><td>${d != null ? `<span class="${Math.abs(d) < 5 ? "" : d > 0 ? "over" : "under"}">${d >= 0 ? "+" : "−"}${fmtTime(Math.abs(d))}</span>` : ""}</td></tr>`;
  }).join("");
  const diff = tgt ? vid - tgt : null;
  el.innerHTML = `<header class="g-h"><h2>${h(t("escTitle"))}</h2><span class="count">${h(t("totalRec")(fmtTime(rec)))}${showVideo ? " · " + h(t("totalVideo")(fmtTime(vid))) : ""}</span></header>
    <p class="lead">${h(t("escLead"))}</p>
    <div class="g-target"><label for="gTarget">${h(t("target"))}</label><input id="gTarget" inputmode="numeric" placeholder="${h(t("targetPh"))}" value="${h(G.target)}">${diff != null ? `<span class="verdict-tag ${Math.abs(diff) <= 60 ? "v-ok" : "v-mid"}">${h(diff >= 0 ? t("overT")(fmtTime(diff)) : t("underT")(fmtTime(-diff)))}</span>` : ""}</div>
    <div class="tablewrap"><table class="pf esc"><thead>${head}</thead><tbody>${coldRow}${rows}</tbody></table></div>`;
  const ti = $("gTarget");
  ti.addEventListener("change", () => { G.target = ti.value.trim(); markDirty(); renderEsc(); });
  el.querySelectorAll(".g-seclink").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const x = $(a.getAttribute("href").slice(1)); if (x) x.scrollIntoView({ behavior: "smooth", block: "start" }); }));
}

// Text slice with sentence spans and cue chips (shared by sections view and prompter).
function richSlice(text, from, to, units, cues, unitWrap, cueWrap) {
  const items = [...units.map((u) => ({ s: u.start, e: u.end, u })), ...cues.filter((c) => c.start >= from && c.end <= to).map((c) => ({ s: c.start, e: c.end, c }))].sort((a, b) => a.s - b.s);
  let html = "", pos = from;
  for (const it of items) {
    if (it.s < pos) continue;
    html += h(text.slice(pos, it.s));
    if (it.u) {
      let inner = "", p = it.u.start;
      for (const c of cues) if (c.start >= it.u.start && c.end <= it.u.end) { inner += h(text.slice(p, c.start)) + cueWrap(c); p = c.end; }
      inner += h(text.slice(p, it.u.end));
      html += unitWrap(it.u, inner);
    } else html += cueWrap(it.c);
    pos = it.e;
  }
  return html + h(text.slice(pos, to));
}
// A section starts at its first sentence, or at the "## Title" line written just before it.
function secCut(i) {
  const u = G.U[i], prev = G.U[i - 1], lo = prev ? prev.end : 0;
  const hd = ((G.R && G.R.cues) || []).find((c) => c.heading && c.start >= lo && c.end <= u.start);
  return hd ? hd.start : u.start;
}
const sliceRange = (k) => { const s = G.secs[k], n = G.secs[k + 1]; return [k === 0 ? 0 : secCut(s.first), n ? secCut(n.first) : G.text.length]; };

function renderSecs() {
  const el = $("gSecs");
  if (!el) return;
  const clipIdx = new Set(coldClips().map((c) => c.i));
  const notesFor = (s) => G.notes.filter((n) => { const i = noteUnit(n); return i >= s.first && i <= s.last; });
  const body = G.secs.map((s) => {
    const [a, b] = sliceRange(s.k);
    const units = G.U.slice(s.first, s.last + 1);
    const html = richSlice(G.text, a, b, units, G.R.cues,
      (u, inner) => `<span class="u${clipIdx.has(u.i) ? " clip" : ""}${G.sel === u.i ? " sel" : ""}" data-u="${u.i}" tabindex="0" role="button">${clipIdx.has(u.i) ? `<b class="cliptag">${h(t("ppClip"))}</b>` : ""}${inner}</span>`,
      (c) => `<span class="cue${c.pause ? " pause" : ""}">${h(c.text)}</span>`);
    const ns = notesFor(s), open = ns.filter((n) => !n.done).length;
    const fs = G.flags[s.k] || [];
    const typeSel = `<select data-type="${s.k}" aria-label="${h(t("thSec"))}">${SEC_TYPES.map((x) => `<option value="${x}"${x === s.type ? " selected" : ""}>${h(t("st")[x])}</option>`).join("")}</select>`;
    return `<div class="gsec" id="gs-${s.k}" style="--c:${SEC_COLOR[s.type]}">
      <div class="gsec-h">${typeSel}<span class="gsec-n">${h(secLabel(s))}</span><span class="gsec-time">${fmtTime(s.t0)}–${fmtTime(s.t1)} · ${fmtTime(s.dur)}</span><span class="gsec-conf">${h(t("conf")[s.conf] || s.conf)}</span>
        ${s.k > 0 ? `<span class="gsec-tools"><button class="icon" data-up="${s.k}" title="${h(t("upOne"))}" aria-label="${h(t("upOne"))}">↑</button><button class="icon" data-down="${s.k}" title="${h(t("downOne"))}" aria-label="${h(t("downOne"))}">↓</button><button class="icon" data-merge="${s.k}" title="${h(t("mergePrev"))}" aria-label="${h(t("mergePrev"))}">×</button></span>` : ""}</div>
      ${fs.length ? `<div class="gsec-flags">${fs.map((f) => `<span class="flag">${h(f.id === "hookLong" ? t("flags").hookLong(f.v) : f.id === "promiseLate" ? t("flags").promiseLate(fmtTime(f.v), f.d) : f.id === "gap" ? t("flags").gap(fmtTime(f.a), fmtTime(f.b)) : t("flags")[f.id])}</span>`).join("")}</div>` : ""}
      <div class="gsec-body">${html.replace(/^\s+|\s+$/g, "")}</div>
      <details class="gnotes"${ns.length ? "" : ""}><summary>${h(t("notes"))}${ns.length ? ` · ${h(t("openNotes")(open))}` : ""}</summary>
        <ul>${ns.map((n) => `<li class="${n.done ? "done" : ""}"><span class="chip">${h(t("roles")[n.role] || n.role)}</span> ${h(n.text)} <label class="hint"><input type="checkbox" data-done="${h(n.id)}"${n.done ? " checked" : ""}> ${h(t("resolved"))}</label></li>`).join("")}</ul>
        <div class="gnote-form"><select data-role="${s.k}" aria-label="role">${Object.entries(t("roles")).map(([v, l]) => `<option value="${v}"${v === G.role ? " selected" : ""}>${h(l)}</option>`).join("")}</select><textarea rows="2" data-notetext="${s.k}" placeholder="${h(t("notePh"))}"></textarea><button class="small" data-addnote="${s.k}">${h(t("addNote"))}</button></div>
      </details></div>`;
  }).join("");
  el.innerHTML = `<header class="g-h"><h2>${h(t("secTitle"))}</h2>${G.manual ? `<button class="small" id="gRedetect">${h(t("redetect"))}</button>` : ""}</header><p class="lead">${h(t("secLead"))}</p><div class="gsecs" id="gSecsBody">${body}</div>`;
  const rd = $("gRedetect"); if (rd) rd.addEventListener("click", () => { G.manual = false; G.layout = null; markDirty(); gRefresh(); });
  el.querySelectorAll("[data-type]").forEach((s) => s.addEventListener("change", () => { manualOp((L) => { L[+s.dataset.type].type = s.value; L[+s.dataset.type].conf = "manual"; }); }));
  el.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => moveStart(+b.dataset.up, -1)));
  el.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => moveStart(+b.dataset.down, +1)));
  el.querySelectorAll("[data-merge]").forEach((b) => b.addEventListener("click", () => manualOp((L) => L.splice(+b.dataset.merge, 1))));
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
    markDirty(); renderSecs(); const d = $("gs-" + k); if (d) d.querySelector("details").open = true;
  }));
  el.querySelectorAll("[data-done]").forEach((c) => c.addEventListener("change", () => { const n = G.notes.find((x) => x.id === c.dataset.done); if (n) { n.done = c.checked; markDirty(); renderSecs(); } }));
}
function noteUnit(n) {
  let best = -1, bd = Infinity;
  G.U.forEach((u, i) => { if (u.text.slice(0, 80) === n.anchor) { const d = Math.abs(i - n.ui); if (d < bd) { bd = d; best = i; } } });
  return best >= 0 ? best : Math.min(n.ui, G.U.length - 1);
}
function manualOp(fn) {
  if (!G.manual) { G.manual = true; G.layout = G.layout.map((L) => ({ ...L })); }
  fn(G.layout);
  G.layout.sort((a, b) => a.first - b.first);
  G.layout.forEach((L) => (L.anchor = G.U[L.first].text.slice(0, 80)));
  markDirty(); gRefresh();
}
function moveStart(k, dir) {
  manualOp((L) => {
    const lo = L[k - 1].first + 1, hi = (L[k + 1] ? L[k + 1].first : G.U.length) - 1, nf = L[k].first + dir;
    if (nf >= lo && nf <= hi) { L[k].first = nf; L[k].conf = "manual"; }
  });
}
function selectUnit(i) {
  G.sel = i;
  document.querySelectorAll("#gSecsBody .u.sel").forEach((x) => x.classList.remove("sel"));
  const sp = document.querySelector(`#gSecsBody .u[data-u="${i}"]`);
  if (sp) sp.classList.add("sel");
  const bar = $("gSelBar"), u = G.U[i];
  if (!bar || !u) return;
  const isStart = G.layout.some((L) => L.first === i);
  bar.innerHTML = `<div class="sb-text">«${h(u.text.length > 120 ? u.text.slice(0, 120) + "…" : u.text)}» <span class="hint">${fmtTime(u.t0)}</span></div>
    <div class="sb-act">${isStart ? "" : `<button class="small" id="sbStart">${h(t("startHere"))}</button>`}<button class="small" id="sbHook">${h(t("coUseHook"))}</button><button class="small" id="sbProm">${h(t("coUseProm"))}</button><button class="small" id="sbEdit">${h(t("editSel"))}</button><button class="small linkish" id="sbClose">${h(t("closeBar"))}</button></div>
    <div id="sbEditBox"></div>`;
  bar.hidden = false;
  const st = $("sbStart");
  if (st) st.addEventListener("click", () => { const prev = G.secs.find((s) => i > s.first && i <= s.last); manualOp((L) => L.push({ first: i, anchor: "", type: prev && prev.type === "point" ? "point" : "body", conf: "manual", title: "" })); closeSel(); });
  $("sbHook").addEventListener("click", () => { closeSel(); useCold("hook", i); });
  $("sbProm").addEventListener("click", () => { closeSel(); useCold("promise", i); });
  $("sbClose").addEventListener("click", closeSel);
  $("sbEdit").addEventListener("click", () => {
    $("sbEditBox").innerHTML = editBoxHTML(i);
    $("coEditTa").focus();
    $("coEditSave").addEventListener("click", () => { const v = $("coEditTa").value; closeSel(); applyEdit(i, v); });
    $("coEditCancel").addEventListener("click", () => ($("sbEditBox").innerHTML = ""));
  });
}
function closeSel() { G.sel = null; const bar = $("gSelBar"); if (bar) bar.hidden = true; document.querySelectorAll("#gSecsBody .u.sel").forEach((x) => x.classList.remove("sel")); }
function showUnit(i) {
  const sp = document.querySelector(`#gSecsBody .u[data-u="${i}"]`);
  if (!sp) return;
  sp.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  selectUnit(i);
}

function renderRevisions() {
  const el = $("gRev");
  if (!el) return;
  caps.db.then((db) => {
    const fmtD = (x) => new Date(x).toLocaleString(UI, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    const list = G.snaps.length ? `<ul class="snaps">${G.snaps.map((s) => `<li><label><input type="checkbox" data-snap="${h(s.id)}"${G.snapSel.includes(s.id) ? " checked" : ""}> <b>${h(s.name)}</b></label><span class="hint">${fmtD(s.at)} · ${h(t("status")[s.status] || s.status)} · ${s.wc} ${h(t("words"))}</span><button class="small linkish" data-vs="${h(s.id)}">${h(t("snapVsCurrent"))}</button></li>`).join("")}</ul>` : `<p class="hint">${h(t("snapNone"))}</p>`;
    el.innerHTML = `<header class="g-h"><h2>${h(t("revTitle"))}</h2></header><p class="lead">${h(t("revLead"))}</p>
      ${G.loadErr.snaps ? `<p class="status err" role="alert">${h(t("snapLoadFail"))} <button type="button" class="small" id="snapRetry">${h(t("srRetry"))}</button></p>` : ""}
      ${db ? `<div class="snap-form"><input id="snapName" placeholder="${h(t("snapPh"))}" maxlength="80"><button class="small primary" id="snapSave">${h(t("snapSave"))}</button></div>${list}${G.snaps.length > 1 ? `<div class="actions"><button class="small" id="snapCmp">${h(t("snapCompare"))}</button><span class="status" id="snapMsg"></span></div>` : ""}` : `<p class="hint">${h(t("snapNeedsDb"))}</p>`}
      <div id="snapDiff">${G.diffHTML}</div>`;
    if ($("snapRetry")) $("snapRetry").addEventListener("click", async () => { await loadSnaps(); renderRevisions(); });
    if (!db) return;
    $("snapSave").addEventListener("click", async (e) => { e.target.disabled = true; await addSnap($("snapName").value.trim()); });
    el.querySelectorAll("[data-snap]").forEach((c) => c.addEventListener("change", () => {
      G.snapSel = G.snapSel.filter((x) => x !== c.dataset.snap);
      if (c.checked) G.snapSel.push(c.dataset.snap);
      if (G.snapSel.length > 2) G.snapSel.shift();
      renderRevisions();
    }));
    el.querySelectorAll("[data-vs]").forEach((b) => b.addEventListener("click", () => { const s = G.snaps.find((x) => x.id === b.dataset.vs); if (s) showDiff(s.name, t("current"), s.text, $("script").value); }));
    const cmp = $("snapCmp");
    if (cmp) cmp.addEventListener("click", () => {
      if (G.snapSel.length !== 2) { $("snapMsg").textContent = t("snapPick2"); return; }
      const [a, b] = G.snapSel.map((id) => G.snaps.find((x) => x.id === id)).sort((x, y) => x.at - y.at);
      showDiff(a.name, b.name, a.text, b.text);
    });
  });
}
function showDiff(na, nb, a, b) {
  const ops = diffOps(a, b);
  const changed = ops.some((o) => o.op !== "eq");
  G.diffHTML = `<div class="helper"><h3>${h(t("diffTitle")(na, nb))}</h3><p class="desc">${h(changed ? t("diffLegend") : t("diffSame"))}</p>${changed ? `<div class="diff">${ops.map((o) => (o.op === "eq" ? h(o.text) : o.op === "ins" ? `<ins>${h(o.text)}</ins>` : `<del>${h(o.text)}</del>`)).join("")}</div>` : ""}</div>`;
  const d = $("snapDiff"); if (d) { d.innerHTML = G.diffHTML; d.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
}

// ---------- AI pick (indices only, so every line comes from the script) ----------
async function aiPickCold(btn) {
  const sample = await caps.sample, st = $("coAiStatus");
  if (!sample) { st.textContent = t("aiPickNeed"); st.className = "status err"; return; }
  btn.disabled = true; st.className = "status"; st.textContent = t("thinking");
  const pool = G.U.filter((u) => u.wc >= 4 && u.wc <= 40);
  const list = pool.slice(0, 450).map((u) => `${u.i} [${fmtTime(u.t0)}] ${u.text}`).join("\n");
  const prompt = `Este es un guion de un pódcast cristiano de enseñanza bíblica en YouTube, dividido en oraciones numeradas. Hay que armar una apertura en frío con frases que YA están en el guion: se graban en su lugar y el editor las copia al inicio del video. No escribas frases nuevas: elige números de la lista. ${t("outLang")}
Elige 3 oraciones para GANCHO: se entiende sola, sin contexto previo; dura unos 7 segundos o menos (18 palabras o menos); es una pregunta al oyente, una tensión o una afirmación que contradice una idea común; no es saludo ni petición de suscribirse; evita términos de violencia, sexo, drogas o promesas de sanidad garantizada.
Elige 3 oraciones para PROMESA: dice qué va a entender o recibir el oyente en este episodio; se entiende sola.
No repitas una oración en las dos listas. Para cada una da "why" (una frase corta).
Responde solo con JSON: {"hooks": [{"i": 0, "why": "..."}], "promises": [{"i": 0, "why": "..."}]}

ORACIONES:
${list}`;
  try {
    const res = await sample.json(prompt, { modelTier: "default" });
    const ok = new Set(pool.map((u) => u.i));
    const mk = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x && ok.has(+x.i)).slice(0, 3).map((x) => { const u = G.U[+x.i]; return { i: u.i, text: u.text, t0: u.t0, t1: u.t1, dur: u.t1 - u.t0, why: ["ai"], note: String(x.why || "") }; });
    const hooks = mk(res && res.hooks), proms = mk(res && res.promises);
    if (!hooks.length && !proms.length) throw { code: "invalid_json" };
    G.aiPick = { hook: hooks, promise: proms };
    renderCold();
  } catch (e) { st.className = "status err"; st.textContent = errText(e); btn.disabled = false; }
}

// ---------- editor sheet ----------
function exportEditSheet() {
  const o = readOpts(), clips = coldClips();
  const tt = (x) => fmtTime(x);
  let md = `# ${t("sheetTitle")}${o.title ? ": " + o.title : ""}\n\n${t("status")[G.status]} · ${t("totalRec")(tt(totalRec()))}${clips.length ? " · " + t("totalVideo")(tt(totalVideo())) : ""}\n\n_${t("sheetNote")}_\n\n`;
  if (clips.length) md += `## ${t("clipsTitle")}\n\n` + clips.map((c, k) => `${k + 1}. ${c.kind === "hook" ? t("coHooks") : t("coProms")} — ${tt(c.t0)}–${tt(c.t1)} (≈${Math.round(c.dur)} s), ${c.mode === "move" ? t("coModeMove") : t("coModeDup")}: «${c.text}»`).join("\n") + "\n\n";
  md += `## ${t("escTitle")}\n\n| # | ${t("thSec")} | ${t("thStart")} | ${t("thEnd")} | ${t("thDur")} |${clips.length ? ` ${t("thVideo")} |` : ""}\n|---|---|---|---|---|${clips.length ? "---|" : ""}\n`;
  md += G.secs.map((s) => `| ${s.k + 1} | ${secLabel(s)} | ${tt(s.t0)} | ${tt(s.t1)} | ${tt(s.dur)} |${clips.length ? ` ${tt(finalT(s.t0))} |` : ""}`).join("\n") + "\n\n";
  const ch = chaptersText();
  if (ch.length) md += `## ${t("chSheet")}\n\n` + ch.map((c) => `${tt(c.t)} ${c.label}`).join("\n") + "\n\n";
  if (G.shorts.length) md += `## ${t("shSheet")}\n\n` + G.shorts.map((m, k) => { const a = G.U[m.i0], b = G.U[m.i1]; return `${k + 1}. ${tt(a.t0)}–${tt(b.t1)} (≈${Math.round(b.t1 - a.t0)} s): «${a.text}» … «${b.text}»`; }).join("\n") + "\n\n";
  const cues = G.R.cues.filter((c) => !c.heading);
  if (cues.length) md += `## ${t("cuesTitle")}\n\n` + cues.map((c) => `- ${tt(G.R.timeAt(c.start))} ${c.text}`).join("\n") + "\n\n";
  const open = G.notes.filter((n) => !n.done);
  if (open.length) md += `## ${t("openNotesTitle")}\n\n` + open.map((n) => { const s = secAt(noteUnit(n)); return `- [${t("roles")[n.role] || n.role}] ${s ? secLabel(s) + ": " : ""}${n.text}`; }).join("\n") + "\n";
  offerFileG(slug(o.title || o.series) + (UI === "en" ? "-edit-sheet.md" : "-hoja-edicion.md"), md);
}
async function offerFileG(filename, data) {
  const d = await caps.downloads;
  const st = $("gSaveState") || $("saveStatus");
  if (!d) { if (st) st.textContent = t("downloadNeeds"); return; }
  try { await d.save({ filename, data }); if (st) st.textContent = t("downloaded"); } catch (e) { if (st && !(e && e.code === "declined")) st.textContent = t("downloadFail"); }
}

// ---------- prompter & rehearsal ----------
const PP = { on: false };
function ppPrefs() {
  let p = {};
  try { p = JSON.parse(lsGet("sd-pp") || "{}") || {}; } catch (e) { /* best effort: unreadable prompter settings: use the defaults */ }
  const w = window.innerWidth;
  return { font: p.font || (w < 600 ? 34 : w < 1100 ? 52 : 64), width: p.width || 30, mirrorH: !!p.mirrorH, mirrorV: !!p.mirrorV, cues: p.cues !== false };
}
function ppSavePrefs() { lsSet("sd-pp", JSON.stringify({ font: PP.font, width: PP.width, mirrorH: PP.mirrorH, mirrorV: PP.mirrorV, cues: PP.cues })); }

function openPrompter(mode) {
  gCompute();
  if (!G.R || !G.U.length) return;
  const R = G.R, prefs = ppPrefs();
  Object.assign(PP, prefs, { on: true, mode, playing: false, started: false, tau: 0, elapsed: 0, last: performance.now(), total: totalRec(), base: Math.max(60, R.wc / (Math.max(1, R.runtimeSec) / 60)), laps: [], lapK: 0, lapStart: 0, pts: [], hudAt: 0, done: false, flashUntil: 0, lock: null });
  PP.wpm = Math.round(PP.base);
  const clipIdx = new Set(coldClips().map((c) => c.i));
  const content = G.secs.map((s) => {
    const [a, b] = sliceRange(s.k);
    const units = G.U.slice(s.first, s.last + 1);
    const html = richSlice(G.text, a, b, units, R.cues,
      (u, inner) => `<span class="pp-u${clipIdx.has(u.i) ? " pp-clip" : ""}" data-u="${u.i}">${clipIdx.has(u.i) ? `<b class="pp-cliptag">${h(t("ppClip"))}</b> ` : ""}${inner}</span>`,
      (c) => (c.heading ? "" : `<span class="pp-cue${c.pause ? " pp-pause" : ""}">${h(c.pause ? "‖ " + c.text.replace(/^\[|\]$/g, "") : c.text)}</span>`));
    return `<div class="pp-sec" data-k="${s.k}"><div class="pp-label">${h(secLabel(s))} · ${fmtTime(s.t0)}</div><div class="pp-text">${html.replace(/^\s+|\s+$/g, "")}</div></div>`;
  }).join("");
  const el = document.createElement("div");
  el.id = "pp"; el.className = "pp"; el.tabIndex = -1; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", mode === "ensayo" ? t("rehBtn") : t("ppBtn"));
  el.innerHTML = `<div class="pp-stage" id="ppStage"><div class="pp-col" id="ppCol">${content}<div class="pp-end">${h(t("ppDone"))}</div></div></div>
    <div class="pp-line" aria-hidden="true"></div>
    <div class="pp-hint" id="ppHint">${h(t("ppStart"))}${mode === "ensayo" ? `<small>${h(t("ppRehHint"))}</small>` : ""}</div>
    <div class="pp-count" id="ppCount" hidden></div>
    <div class="pp-flash" id="ppFlash" hidden></div>
    <div class="pp-hud" id="ppHud"></div>
    <div class="pp-ctrl" id="ppCtrl">
      <button data-pp="prev" aria-label="←">←</button><button data-pp="play" id="ppPlay" class="pp-main">▶</button><button data-pp="next" aria-label="→">→</button>
      <span class="pp-grp"><button data-pp="slower" aria-label="−5">−</button><span id="ppWpm"></span><button data-pp="faster" aria-label="+5">+</button></span>
      <span class="pp-grp"><button data-pp="fontdn" aria-label="A−">A−</button><button data-pp="fontup" aria-label="A+">A+</button></span>
      <span class="pp-grp"><button data-pp="narrow" aria-label="${h(t("ppWidth"))} −">⇥⇤</button><button data-pp="wide" aria-label="${h(t("ppWidth"))} +">⇤⇥</button></span>
      <button data-pp="mirror" id="ppMirror">${h(t("ppMirror"))}</button><button data-pp="cues" id="ppCues">${h(t("ppCues"))}</button><button data-pp="full">${h(t("ppFull"))}</button><button data-pp="exit">${h(t("ppExit"))}</button>
    </div>
    <div class="pp-result" id="ppResult" hidden></div>`;
  document.body.appendChild(el);
  document.documentElement.classList.add("pp-open");
  document.querySelector("main").inert = true;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  PP.el = el;
  ppApplyLook();
  el.querySelectorAll("[data-pp]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); ppCmd(b.dataset.pp); }));
  ppWireTouch($("ppStage"));
  document.addEventListener("keydown", ppKey, true);
  window.addEventListener("resize", ppMeasureSoon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ppMeasure);
  ppMeasure();
  PP.raf = requestAnimationFrame(ppFrame);
  el.focus({ preventScroll: true });
}
function ppApplyLook() {
  const col = $("ppCol"), stage = $("ppStage");
  col.style.fontSize = PP.font + "px";
  col.style.width = `min(${PP.width}ch, calc(100vw - 32px))`;
  stage.style.transform = `scale(${PP.mirrorH ? -1 : 1}, ${PP.mirrorV ? -1 : 1})`;
  PP.el.classList.toggle("no-cues", !PP.cues);
  $("ppMirror").setAttribute("aria-pressed", String(PP.mirrorH));
  $("ppCues").setAttribute("aria-pressed", String(PP.cues));
}
let ppMeasureT = null;
function ppMeasureSoon() { clearTimeout(ppMeasureT); ppMeasureT = setTimeout(ppMeasure, 120); }
function ppMeasure() {
  if (!PP.on) return;
  const col = $("ppCol"), stage = $("ppStage");
  const prevT = col.style.transform, prevS = stage.style.transform;
  col.style.transform = "none"; stage.style.transform = "none";
  const top = col.getBoundingClientRect().top;
  PP.lh = parseFloat(getComputedStyle(col).lineHeight) || PP.font * 1.4;
  PP.pts = [...col.querySelectorAll(".pp-u")].map((sp) => {
    const u = G.U[+sp.dataset.u], r = sp.getClientRects();
    if (!r.length) return null;
    const y0 = r[0].top - top, y1 = r[r.length - 1].top - top;
    return { t0: u.t0, t1: u.t1, y0, y1 };
  }).filter(Boolean).sort((a, b) => a.t0 - b.t0);
  PP.endY = col.scrollHeight;
  col.style.transform = prevT; stage.style.transform = prevS;
  PP.lineY = stage.clientHeight * 0.28;
  ppRender(true);
}
function ppYAt(tau) {
  const P = PP.pts;
  if (!P.length) return 0;
  if (tau <= P[0].t0) return P[0].y0;
  let lo = 0, hi = P.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (P[mid].t0 <= tau) lo = mid; else hi = mid - 1; }
  const p = P[lo];
  if (tau <= p.t1) return p.y0 + (p.y1 - p.y0) * ((tau - p.t0) / Math.max(0.001, p.t1 - p.t0));
  const n = P[lo + 1];
  if (!n) return p.y1 + Math.min(PP.lh * 2, (tau - p.t1) * 20);
  return p.y1 + (n.y0 - p.y1) * ((tau - p.t1) / Math.max(0.001, n.t0 - p.t1));
}
function ppTauAtY(y) {
  const P = PP.pts;
  if (!P.length) return 0;
  if (y <= P[0].y0) return 0;
  for (let k = 0; k < P.length; k++) {
    const p = P[k], n = P[k + 1];
    if (y <= p.y1) return p.t0 + (p.t1 - p.t0) * ((y - p.y0) / Math.max(1, p.y1 - p.y0));
    if (n && y < n.y0) return p.t1 + (n.t0 - p.t1) * ((y - p.y1) / Math.max(1, n.y0 - p.y1));
  }
  return PP.total;
}
const ppSecIdx = (tau) => { let k = 0; for (const s of G.secs) if (s.t0 <= tau + 0.01) k = s.k; return k; };
function ppFrame(now) {
  if (!PP.on) return;
  const dt = Math.min(0.1, (now - PP.last) / 1000);
  PP.last = now;
  if (PP.playing) {
    PP.elapsed += dt;
    let cap = PP.total;
    if (PP.mode === "ensayo") cap = Math.min(PP.total, G.secs[PP.lapK].t1);
    PP.tau = Math.min(cap, PP.tau + dt * (PP.wpm / PP.base));
    if (PP.mode === "prompter" && PP.tau >= PP.total) { PP.playing = false; PP.done = true; ppWake(false); }
  }
  ppRender(false, now);
  PP.raf = requestAnimationFrame(ppFrame);
}
function ppRender(force, now) {
  const col = $("ppCol");
  if (!col) return;
  col.style.transform = `translate3d(0, ${(PP.lineY - ppYAt(PP.tau) - PP.lh * 0.5).toFixed(1)}px, 0)`;
  now = now || performance.now();
  if (!force && now - PP.hudAt < 200) return;
  PP.hudAt = now;
  const k = PP.mode === "ensayo" ? PP.lapK : ppSecIdx(PP.tau), s = G.secs[k];
  const ratio = PP.wpm / PP.base;
  const remain = (PP.total - PP.tau) / ratio, endAt = PP.elapsed + remain, plan = parseMMSS(G.target) ? parseMMSS(G.target) - (totalVideo() - totalRec()) : PP.total;
  const dlt = endAt - plan;
  let cells = `<span><small>${h(t("ppElapsed"))}</small>${fmtTime(PP.elapsed)}</span>`;
  if (PP.mode === "ensayo") {
    const lap = PP.elapsed - PP.lapStart;
    cells += `<span><small>${h(t("ppLapLbl"))} · ${h(secLabel(s))}</small>${fmtTime(lap)} <em>/ ${fmtTime(s.dur)}</em></span>`;
  } else {
    cells += `<span><small>${h(t("ppSecLeft"))} · ${h(secLabel(s))}</small>${fmtTime(Math.max(0, (s.t1 - PP.tau) / ratio))}</span>`;
    cells += `<span><small>${h(t("ppEnd"))}</small>${fmtTime(endAt)} <em class="${Math.abs(dlt) < 5 ? "" : dlt > 0 ? "over" : "under"}">${h(Math.abs(dlt) < 5 ? t("ppOn") : dlt > 0 ? t("ppOver")(fmtTime(dlt)) : t("ppUnder")(fmtTime(-dlt)))}</em></span>`;
  }
  $("ppHud").innerHTML = cells + (PP.started && !PP.playing && !PP.done ? `<span class="pp-paused">${h(t("ppPaused"))}</span>` : "");
  $("ppWpm").textContent = `${PP.wpm} ${t("ppSpeed")}`;
  $("ppPlay").textContent = PP.playing ? "❚❚" : "▶";
  PP.el.classList.toggle("playing", PP.playing);
  const fl = $("ppFlash"); if (fl) fl.hidden = now > PP.flashUntil;
}
function ppFlash(msg) { const f = $("ppFlash"); if (!f) return; f.textContent = msg; f.hidden = false; PP.flashUntil = performance.now() + 1200; }
function ppToggle() {
  if (PP.counting) return;
  if (PP.done && PP.mode === "prompter") { PP.tau = 0; PP.elapsed = 0; PP.done = false; }
  if (!PP.started) { ppCountdown(); return; }
  PP.playing = !PP.playing;
  ppWake(PP.playing);
}
function ppCountdown() {
  const c = $("ppCount"), hint = $("ppHint");
  if (hint) hint.hidden = true;
  let n = 3;
  c.hidden = false; c.textContent = n;
  PP.counting = true;
  const tick = () => {
    if (!PP.on) return;
    n--;
    if (n > 0) { c.textContent = n; setTimeout(tick, 1000); return; }
    c.hidden = true; PP.counting = false; PP.started = true; PP.playing = true; PP.last = performance.now(); PP.lapStart = PP.elapsed;
    ppWake(true);
  };
  setTimeout(tick, 1000);
}
function ppJump(dir) {
  const k = Math.max(0, Math.min(G.secs.length - 1, ppSecIdx(PP.tau) + dir));
  PP.tau = dir < 0 && PP.tau - G.secs[ppSecIdx(PP.tau)].t0 > 2 ? G.secs[ppSecIdx(PP.tau)].t0 : G.secs[k].t0;
  ppRender(true);
}
function ppLap() {
  if (!PP.started || PP.done) return;
  PP.laps.push({ k: PP.lapK, sec: PP.elapsed - PP.lapStart });
  PP.lapStart = PP.elapsed;
  PP.lapK++;
  if (PP.lapK >= G.secs.length) { PP.lapK = G.secs.length - 1; ppFinishRehearsal(); return; }
  PP.tau = G.secs[PP.lapK].t0;
  ppFlash(t("ppLap"));
  ppRender(true);
}
function ppCmd(c) {
  if (c === "play") ppToggle();
  else if (c === "prev") ppJump(-1);
  else if (c === "next") PP.mode === "ensayo" ? ppLap() : ppJump(1);
  else if (c === "slower" || c === "faster") { PP.wpm = Math.max(60, Math.min(260, PP.wpm + (c === "faster" ? 5 : -5))); ppRender(true); }
  else if (c === "fontup" || c === "fontdn") { PP.font = Math.max(20, Math.min(120, PP.font + (c === "fontup" ? 4 : -4))); ppSavePrefs(); ppApplyLook(); ppMeasure(); }
  else if (c === "wide" || c === "narrow") { PP.width = Math.max(16, Math.min(70, PP.width + (c === "wide" ? 4 : -4))); ppSavePrefs(); ppApplyLook(); ppMeasure(); }
  else if (c === "mirror") { PP.mirrorH = !PP.mirrorH; ppSavePrefs(); ppApplyLook(); }
  else if (c === "mirrorV") { PP.mirrorV = !PP.mirrorV; ppSavePrefs(); ppApplyLook(); }
  else if (c === "cues") { PP.cues = !PP.cues; ppSavePrefs(); ppApplyLook(); ppMeasure(); }
  else if (c === "full") { const el = PP.el; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); }
  else if (c === "restart") { PP.tau = G.secs[PP.mode === "ensayo" ? PP.lapK : ppSecIdx(PP.tau)].t0; if (PP.mode === "ensayo") PP.lapStart = PP.elapsed; ppRender(true); }
  else if (c === "exit") ppClose();
}
function ppKey(e) {
  if (!PP.on) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const k = e.key;
  const map = { " ": "play", Spacebar: "play", ArrowUp: "faster", ArrowDown: "slower", ArrowLeft: "prev", PageUp: "prev", ArrowRight: "next", PageDown: "next", Enter: "next", r: "restart", R: "restart", m: "mirror", M: "mirror", v: "mirrorV", V: "mirrorV", c: "cues", C: "cues", f: "full", F: "full", "+": "fontup", "=": "fontup", "-": "fontdn", Escape: "exit" };
  const cmd = map[k];
  if (!cmd) return;
  if (k === "Escape" && document.fullscreenElement) return;
  if (!$("ppResult").hidden && cmd !== "exit") return;
  e.preventDefault(); e.stopPropagation();
  if (cmd === "next" && !PP.started && PP.mode === "ensayo") return;
  ppCmd(cmd);
}
function ppWireTouch(stage) {
  let y0 = null, tau0 = 0, moved = false;
  stage.addEventListener("pointerdown", (e) => { y0 = e.clientY; tau0 = PP.tau; moved = false; stage.setPointerCapture && stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", (e) => {
    if (y0 === null) return;
    const dy = (e.clientY - y0) * (PP.mirrorV ? -1 : 1);
    if (Math.abs(dy) > 8) moved = true;
    if (moved) { PP.tau = Math.max(0, Math.min(PP.total, ppTauAtY(ppYAt(tau0) - dy))); ppRender(true); }
  });
  const end = () => { if (y0 !== null && !moved && $("ppResult").hidden && !PP.counting) ppToggle(); y0 = null; };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", () => (y0 = null));
  stage.addEventListener("wheel", (e) => { e.preventDefault(); PP.tau = Math.max(0, Math.min(PP.total, ppTauAtY(ppYAt(PP.tau) + e.deltaY * (PP.mirrorV ? -1 : 1)))); ppRender(true); }, { passive: false });
}
async function ppWake(on) {
  try {
    if (on && !PP.lock && navigator.wakeLock) { PP.lock = await navigator.wakeLock.request("screen"); PP.lock.addEventListener && PP.lock.addEventListener("release", () => (PP.lock = null)); }
    if (!on && PP.lock) { const l = PP.lock; PP.lock = null; await l.release(); }
  } catch (e) { PP.lock = null; }
}
document.addEventListener("visibilitychange", () => { if (PP.on && PP.playing && document.visibilityState === "visible") ppWake(true); });
function ppClose() {
  PP.on = false; PP.playing = false;
  cancelAnimationFrame(PP.raf);
  ppWake(false);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  document.removeEventListener("keydown", ppKey, true);
  window.removeEventListener("resize", ppMeasureSoon);
  if (PP.el) PP.el.remove();
  document.documentElement.classList.remove("pp-open");
  document.querySelector("main").inert = false;
  if (G.mode === "guion") renderGuion();
}
function ppFinishRehearsal() {
  PP.playing = false; PP.done = true; ppWake(false);
  const laps = PP.laps.filter((l) => l.sec > 0.5);
  const est = laps.reduce((a, l) => a + G.secs[l.k].dur, 0), real = laps.reduce((a, l) => a + l.sec, 0);
  const kNew = real > 0 ? Math.max(0.3, Math.min(1.2, state.k * (est / real))) : state.k;
  PP.result = { laps, est, real, kNew };
  const box = $("ppResult");
  box.innerHTML = `<div class="pp-res-card"><h3>${h(t("rehTitle"))}</h3><p>${h(t("rehTot")(fmtTime(est), fmtTime(real)))}</p>
    <div class="tablewrap"><table class="pf"><thead><tr><th>${h(t("thSec"))}</th><th>${h(t("rehEst"))}</th><th>${h(t("rehReal"))}</th><th>${h(t("thDelta"))}</th></tr></thead><tbody>
    ${laps.map((l) => { const s = G.secs[l.k], d = l.sec - s.dur; return `<tr><td>${h(secLabel(s))}</td><td>${fmtTime(s.dur)}</td><td>${fmtTime(l.sec)}</td><td>${d >= 0 ? "+" : "−"}${fmtTime(Math.abs(d))}</td></tr>`; }).join("")}</tbody></table></div>
    <div class="actions"><button class="primary small" id="rehSave">${h(t("rehSave"))}</button>${est >= 120 ? `<button class="small" id="rehApply">${h(t("rehApply")(kNew.toFixed(2)))}</button>` : ""}<button class="small" id="rehClose">${h(t("rehDiscard"))}</button><span class="status" id="rehMsg"></span></div></div>`;
  box.hidden = false;
  $("rehSave").addEventListener("click", () => {
    G.rehearsals.push({ at: Date.now(), kEst: state.k, kNew, laps: laps.map((l) => ({ first: G.secs[l.k].first, anchor: G.secs[l.k].anchor, est: Math.round(G.secs[l.k].dur * 10) / 10, sec: Math.round(l.sec * 10) / 10 })) });
    markDirty();
    $("rehMsg").textContent = t("rehSaved");
    $("rehClose").textContent = t("ppExit");
  });
  if ($("rehApply")) $("rehApply").addEventListener("click", async () => {
    const prev = state.kReh;
    state.kReh = prev ? 0.7 * prev + 0.3 * kNew : kNew;
    if (!state.kCalibrated) state.k = state.kReh;
    const db = await caps.db;
    let paceFail = false;
    if (db) { try { await db.doc("ajustes/ritmo").set({ k: state.kReh, n: (state.kRehN || 0) + 1, updatedAt: Date.now() }); state.kRehN = (state.kRehN || 0) + 1; } catch (e) { paceFail = true; } }
    updateLive();
    $("rehMsg").textContent = paceFail ? t("rehNotSaved") : t("rehApplied");
  });
  $("rehClose").addEventListener("click", ppClose);
}

// ---------- mode switch ----------
function setMode(m) {
  G.mode = m === "guion" ? "guion" : "review";
  lsSet("sd-mode", G.mode);
  document.querySelector("main").dataset.mode = G.mode;
  document.querySelectorAll(".modes [data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === G.mode)));
  if (G.mode === "guion") { gRefresh(); loadProds(); }
  else if (state.result) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); renderResults(); }
  window.scrollTo({ top: 0 });
}
document.querySelectorAll(".modes [data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
$("script").addEventListener("input", () => { if (G.prodId) markDirty(); });
["title", "series", "keyword", "thumb", "description", "translation", "lang"].forEach((id) => $(id).addEventListener("change", () => { if (G.prodId) markDirty(); }));
document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("#results [data-gomode]"); if (a) { e.preventDefault(); setMode(a.dataset.gomode); } });
function gOnLang() { if (G.mode === "guion") renderGuion(); }
document.querySelector("main").dataset.mode = G.mode;
document.querySelectorAll(".modes [data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === G.mode)));
