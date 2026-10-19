/* ===== Marcas para el locutor y el editor dentro del guion marcado ===== */
// Chips in the marked script: hook, promise, intro slot, re-hook points (every 4 min), suggested B-roll, ad breaks.
// All timings are our own targets (see the legend note), not YouTube rules. B-roll and re-hooks are suggestions.
Object.assign(T.es, {
  emHook: "GANCHO", emPromise: "PROMESA", emIntro: "INTRO", emRehook: "RE-ENGANCHE", emBroll: "B-ROLL", emAd: "ANUNCIO", emCta: "PEDIDO",
  emHookT: "Primeros 7 segundos: lo que hace que la gente se quede. Cámara a plano cercano, sin saludos.", emPromiseT: "Aquí queda dicho qué van a aprender.",
  emIntroT: (c) => c ? "Después de la apertura en frío: título o animación de 5 segundos como máximo y sigue el guion desde aquí." : "Después del gancho y la promesa: título o animación de 5 segundos como máximo.",
  emRehookT: (m, gap) => `Cada 4 minutos conviene reenganchar a quien se distrae (${m}). ${gap ? "Aquí no hay pregunta ni anticipo: añade uno." : "Ya hay una pregunta o un anticipo cerca."}`,
  emBrollT: (s) => `Sugerido: ${s} segundos hablando a cámara sin cambio visual. Un B-roll, una imagen o un texto en pantalla ayuda. Es una meta propia, no una regla.`,
  emAdT: (m) => `Pausa de anuncio sugerida hacia ${m} del video: termina un punto y no cae en un versículo.`,
  emCtaT: "Aquí hay un pedido al oyente; el editor puede poner un recordatorio en pantalla.",
  emLeg: "Para el locutor y el editor", emLegNote: "Las marcas de tiempo, el B-roll sugerido y los re-enganches son metas propias, no reglas de YouTube.",
});
Object.assign(T.en, {
  emHook: "HOOK", emPromise: "PROMISE", emIntro: "INTRO", emRehook: "RE-HOOK", emBroll: "B-ROLL", emAd: "AD BREAK", emCta: "ASK",
  emHookT: "First 7 seconds: what makes people stay. Close shot, no greetings.", emPromiseT: "Here the viewer is told what they'll learn.",
  emIntroT: (c) => c ? "After the cold open: a title or animation of 5 seconds at most, then the script continues from here." : "After the hook and promise: a title or animation of 5 seconds at most.",
  emRehookT: (m, gap) => `Every 4 minutes it helps to refocus a wandering viewer (${m}). ${gap ? "No question or teaser here: add one." : "There is already a question or teaser nearby."}`,
  emBrollT: (s) => `Suggested: ${s} seconds of talking to camera with no visual change. B-roll, an image or on-screen text helps. Our own target, not a rule.`,
  emAdT: (m) => `Suggested ad break around ${m} of the video: a point ends and it isn't inside a verse.`,
  emCtaT: "A call to the viewer sits here; the editor can add an on-screen reminder.",
  emLeg: "For the speaker and the editor", emLegNote: "Time marks, suggested B-roll and re-hooks are our own targets, not YouTube rules.",
});
const EM_KINDS = ["hook", "promise", "intro", "rehook", "broll", "ad", "cta"];
function editLegendHTML() {
  const L = (k) => `<span class="em-lg em-${k}">${h(t("em" + k[0].toUpperCase() + k.slice(1)))}</span>`;
  return `<div class="legend em-legend"><b>${h(t("emLeg"))}:</b> ${EM_KINDS.map(L).join("")}</div><p class="hint em-note">${h(t("emLegNote"))}</p>`;
}
// Marks for one script, keyed by text position. Cached per text.
let _EM = { text: null, list: [] };
function editMarks(R, text) {
  if (_EM.text === text && _EM.R === R) return _EM.list;
  const out = [];
  try {
    if ($("script").value !== text) return (_EM = { text, R, list: [] }).list;
    if (!G.R || G.text !== text) gCompute();
    const U = G.U, secs = G.secs;
    if (!U.length || !secs.length) return (_EM = { text, R, list: [] }).list;
    const posAt = (tm) => { const u = U.find((x) => tm >= x.t0 && tm < x.t1) || U[U.length - 1]; return u.start; };
    const clips = coldClips(), cold = clips.length > 0;
    const first = U[0];
    out.push({ pos: first.start, kind: "hook", label: t("emHook") + " 0:00", tip: t("emHookT") });
    const pT = R.firstPromiseT;
    let promisePos = null;
    if (pT !== null && pT !== undefined) { promisePos = posAt(pT); out.push({ pos: promisePos, kind: "promise", label: t("emPromise") + " " + fmtTime(pT), tip: t("emPromiseT") }); }
    // Intro slot: with a cold open the video starts with it, then the intro, then the script from its top.
    const introPos = cold ? first.start : (() => { const u = U.find((x) => x.t0 >= (pT || 7) && x.t0 >= 7) || U[Math.min(1, U.length - 1)]; return u.start; })();
    if (!(introPos === first.start && !cold)) out.push({ pos: introPos, kind: "intro", label: t("emIntro") + " ≤5 s", tip: t("emIntroT")(cold) });
    // Re-hook points every 4 minutes
    const total = secs[secs.length - 1].t1;
    for (let tm = 240; tm < total - 30; tm += 240) {
      const gap = R.blocks.some((b) => !b.has && tm >= b.from && tm <= b.to);
      out.push({ pos: posAt(tm), kind: "rehook", label: t("emRehook") + " " + fmtTime(tm) + (gap ? " !" : ""), tip: t("emRehookT")(fmtTime(tm), gap), warn: gap });
    }
    // Suggested B-roll: talking to camera 150 s or more with no [B-ROLL]/[TEXTO]/[CITA] cue and no verse on screen
    const vis = (R.cues || []).filter((c) => !c.heading && !c.pause && /^(B-?ROLL|TEXTO|CITA|IMAGEN|IMAGE|TEXT|QUOTE|GRAPHIC|GR[AÁ]FICO)/i.test(c.kind || "")).map((c) => { const u = U.find((x) => c.start >= x.start && c.start < x.end); return u ? u.t0 : null; }).filter((x) => x !== null).sort((a, b) => a - b);
    let last = 0;
    for (const u of U) {
      const inCue = vis.some((v) => Math.abs(v - u.t0) < 1);
      if (inCue) { last = u.t0; continue; }
      if (u.t0 - last >= 150 && u.t0 > 20) { out.push({ pos: u.start, kind: "broll", label: t("emBroll") + " " + fmtTime(u.t0), tip: t("emBrollT")(Math.round(u.t0 - last)) }); last = u.t0; }
    }
    // Ad breaks (the same ones the packaging card lists)
    const sc = videoScale();
    for (const b of adBreaks(secs, U, text, R)) {
      const nx = U[secs[b.k].last + 1]; if (!nx) continue;
      const vt = finalT(b.t) * sc;
      out.push({ pos: nx.start, kind: "ad", label: t("emAd") + " ≈" + fmtTime(vt), tip: t("emAdT")(fmtTime(vt)) });
    }
    // Calls to the viewer
    for (const c of R.clusters || []) out.push({ pos: posAt(c.t), kind: "cta", label: t("emCta") + " " + fmtTime(c.t), tip: t("emCtaT") });
  } catch (e) { /* marks are optional */ }
  out.sort((a, b) => a.pos - b.pos);
  return (_EM = { text, R, list: out }).list;
}
