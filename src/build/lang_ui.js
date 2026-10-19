/* ===== Variantes del español, traducción del guion y sugerencia de idea central ===== */
Object.assign(T.es, {
  audLabel: "Variante del español", audBoth: "Español neutro", audLatam: "Español latinoamericano", audEs: "Español de España",
  trTitle: "Traducir o adaptar el guion",
  trTo: "Pasar a",
  trTargets: { neutral: "Español neutro", latam: "Español latinoamericano", es: "Español de España", en: "English (US)" },
  trGo: "Traducir con IA",
  trSame: "El guion ya está en esa variante y en esa versión bíblica.",
  trNeedText: "Primero pega un guion.",
  trWorking: "Traduciendo… puede tardar hasta un minuto.",
  trResult: (x) => `Así quedaría en ${x}`,
  trVerify: "Comprueba estas citas en la versión elegida antes de grabar:",
  trUse: "Usar esta versión",
  trDiscard: "Descartar",
  trUndo: "Volver al original",
  trApplied: "Listo. El guion, el título, la miniatura, la descripción y la idea central ya están en la nueva versión. Toca «Revisar guion».",
  trUndone: "Recuperado el original.",
  trNotes: "Notas de la adaptación",
  ideaSugTitle: "Idea central sugerida por la IA",
  ideaSugGo: "Sugerir con IA",
  ideaSugWorking: "La IA está leyendo el guion para proponer la idea central…",
  ideaConfirm: "Confirmar",
  ideaIgnore: "Ignorar",
  ideaSugHint: "Sale de tu propio guion; edítala si no la dirías así.",
});
Object.assign(T.en, {
  audLabel: "Spanish variant", audBoth: "Neutral Spanish", audLatam: "Latin American Spanish", audEs: "Spain Spanish",
  trTitle: "Translate or adapt the script",
  trTo: "Change to",
  trTargets: { neutral: "Neutral Spanish", latam: "Latin American Spanish", es: "Spain Spanish", en: "English (US)" },
  trGo: "Translate with AI",
  trSame: "The script is already in that variant and Bible version.",
  trNeedText: "Paste a script first.",
  trWorking: "Translating… this can take up to a minute.",
  trResult: (x) => `How it reads in ${x}`,
  trVerify: "Check these quotes in the chosen Bible version before recording:",
  trUse: "Use this version",
  trDiscard: "Discard",
  trUndo: "Back to the original",
  trApplied: "Done. The script, title, thumbnail, description and central idea are now in the new version. Tap “Review script”.",
  trUndone: "Original restored.",
  trNotes: "Adaptation notes",
  ideaSugTitle: "Central idea suggested by AI",
  ideaSugGo: "Suggest with AI",
  ideaSugWorking: "The AI is reading the script to suggest the central idea…",
  ideaConfirm: "Confirm",
  ideaIgnore: "Ignore",
  ideaSugHint: "It comes from your own script; edit it if you wouldn't say it that way.",
});

const VARIANT_GUIDE = {
  es: "español de España: dirígete a la audiencia con «vosotros» y sus formas verbales (tenéis, sabéis, os), con vocabulario peninsular natural, sin exagerar; «tú» para un oyente está bien",
  latam: "español latinoamericano: «ustedes» y sus formas (nunca «vosotros»), vocabulario común en México, Centroamérica y Sudamérica, sin voseo y sin regionalismos de un solo país",
  neutral: "español neutro que se entienda igual en Latinoamérica y en España: «ustedes» para la audiencia y «tú» para un oyente, sin «vosotros» ni voseo, y sin palabras propias de un solo país",
  en: "natural, conversational American English as spoken in the United States",
};
const AUD_OF = { es: "es", latam: "latam", neutral: "both" };
const TR = { target: "", ver: "", busy: false, res: null, msg: "", err: "", undo: null, open: false };
function trSource() {
  const lang = state.result ? state.result.lang : (typeof detectLanguage === "function" ? detectLanguage($("script").value) : "es");
  if (lang === "en") return "en";
  const a = $("audience").value;
  return a === "es" ? "es" : a === "latam" ? "latam" : "neutral";
}

function trPrompt(src, dst, ver) {
  const toEn = dst === "en", fromEn = src === "en", crossLang = toEn || fromEn;
  const version = bibleName(ver), swap = crossLang || ver !== $("translation").value;
  const task = crossLang
    ? `Traduce este guion ${fromEn ? "del inglés" : "del español"} al ${toEn ? "inglés de EE. UU." : VARIANT_GUIDE[dst]}. Destino: ${VARIANT_GUIDE[dst]}.`
    : `Adapta este guion de ${VARIANT_GUIDE[src].split(":")[0]} a ${VARIANT_GUIDE[dst]}. Cambia solo lo necesario para que suene natural en esa variante.`;
  const quoteRule = swap
    ? `Sustituye cada cita bíblica entre comillas por el texto de la ${version} palabra por palabra, con la misma referencia${crossLang ? " (traduce también los nombres de los libros)" : ""}. Si no estás seguro del texto exacto en esa versión, deja la referencia y escribe [verificar] en lugar del texto. Pon en "verify" la referencia de cada cita que hayas sustituido.`
    : "Copia las citas bíblicas entre comillas exactamente igual, palabra por palabra: el texto bíblico no se adapta. Deja \"verify\" vacío.";
  return `Eres traductor y editor de guiones para un pódcast cristiano de enseñanza bíblica en YouTube. ${typeof PASTOR_NOTE === "string" ? PASTOR_NOTE : ""}
${task}
Reglas:
- Conserva el mensaje, el orden, los párrafos, las ilustraciones y el tono del autor. No añadas ni quites contenido.
- Conserva las señales entre corchetes ([B-ROLL: …], [TEXTO: …], [CITA: …], [PAUSA]) y los títulos «## …»; traduce su texto y los nombres de los libros bíblicos al idioma de destino.
- Adapta modismos y ejemplos para que suenen naturales en el destino; no traduzcas palabra por palabra.
- ${quoteRule}
- Escribe "notes" en ${toEn ? "inglés" : "español"}: una o dos frases sobre las decisiones de adaptación más importantes.
Devuelve solo este JSON: {"script": "guion completo", "title": "", "thumb": "", "description": "", "keyword": "", "bigIdea": "", "nextEp": "", "verify": ["referencias"], "notes": ""}
Deja vacío ("") cualquier campo que venga vacío.

TÍTULO: ${$("title").value}
MINIATURA: ${$("thumb").value}
DESCRIPCIÓN: ${$("description").value}
PALABRA CLAVE: ${$("keyword").value}
IDEA CENTRAL: ${($("bigIdea") || {}).value || ""}
PRÓXIMO EPISODIO: ${G.nextEp || ""}
GUION:
"""
${$("script").value}
"""`;
}

async function trRun() {
  TR.err = ""; TR.msg = ""; TR.res = null; TR.open = true;
  const text = $("script").value.trim();
  if (!text) { TR.err = t("trNeedText"); renderTr(); return; }
  const src = trSource(), dst = TR.target || (src === "en" ? "neutral" : "en"), ver = TR.ver || bibleFor(dst, $("translation").value);
  if (src === dst && ver === $("translation").value) { TR.err = t("trSame"); renderTr(); return; }
  const sample = await caps.sample;
  if (!sample) { TR.err = t("aiOnlyClaude"); renderTr(); return; }
  TR.busy = true; renderTr();
  try {
    const res = await sample.json(trPrompt(src, dst, ver), { modelTier: "complex", bibleRule: false });
    if (!res || typeof res.script !== "string" || res.script.trim().length < text.length * 0.4) throw { code: "invalid_json" };
    TR.res = { ...res, src, dst, ver, verify: Array.isArray(res.verify) ? res.verify.slice(0, 20) : [] };
  } catch (e) { TR.err = errText(e); }
  TR.busy = false; renderTr();
}
function trApply() {
  const r = TR.res;
  if (!r) return;
  TR.undo = { text: $("script").value, title: $("title").value, thumb: $("thumb").value, description: $("description").value, keyword: $("keyword").value,
    bigIdea: ($("bigIdea") || {}).value || "", nextEp: G.nextEp || "", lang: $("lang").value, audience: $("audience").value, translation: $("translation").value, cold: JSON.parse(JSON.stringify(G.cold)) };
  $("script").value = r.script;
  for (const f of ["title", "thumb", "description", "keyword"]) if (typeof r[f] === "string" && (r[f] || !$(f).value)) $(f).value = r[f];
  if ($("bigIdea") && typeof r.bigIdea === "string" && r.bigIdea) $("bigIdea").value = r.bigIdea;
  if (typeof r.nextEp === "string" && r.nextEp) G.nextEp = r.nextEp;
  if (r.dst === "en") $("lang").value = "en";
  else { $("lang").value = "es"; $("audience").value = AUD_OF[r.dst]; lsSet("sd-aud", AUD_OF[r.dst]); }
  $("translation").value = r.ver; TR.ver = "";
  G.cold = { hook: null, promise: null }; G.layout = null; G.manual = false;
  state.result = null; state.text = ""; state.fixUndo = []; state.fixDismissed = new Set(); state.fixLog = []; IDEA.ignored = "";
  TR.res = null; TR.msg = t("trApplied");
  $("results").classList.add("hidden"); $("results").innerHTML = "";
  updateLive(); markDirty(); renderTr(); renderIdeaSug(); renderBibleHint();
}
function trUndo() {
  const u = TR.undo;
  if (!u) return;
  $("script").value = u.text; for (const f of ["title", "thumb", "description", "keyword", "lang", "audience", "translation"]) $(f).value = u[f];
  if ($("bigIdea")) $("bigIdea").value = u.bigIdea;
  G.nextEp = u.nextEp; G.cold = u.cold; lsSet("sd-aud", u.audience);
  state.result = null; state.text = "";
  TR.undo = null; TR.msg = t("trUndone");
  updateLive(); markDirty(); renderTr(); renderBibleHint();
}
function renderTr() {
  const el = $("trBox");
  if (!el) return;
  const src = trSource(), T2 = t("trTargets");
  if (!TR.target) TR.target = src === "en" ? "neutral" : "en";
  if (!TR.ver || bibleLang(TR.ver) !== (TR.target === "en" ? "en" : "es")) TR.ver = bibleFor(TR.target, $("translation").value);
  const opts = ["neutral", "latam", "es", "en"].map((k) => `<option value="${k}"${TR.target === k ? " selected" : ""}>${h(T2[k])}</option>`).join("");
  const r = TR.res;
  let out = "";
  if (r) {
    const preview = r.script.length > 1400 ? r.script.slice(0, 1400) + "…" : r.script;
    out = `<div class="tr-out"><div class="k">${h(t("trResult")(T2[r.dst]))}</div><div class="tr-prev">${h(preview)}</div>
      ${r.title ? `<p class="hint"><b>${h(t("titleLabel"))}:</b> ${h(r.title)}</p>` : ""}${r.bigIdea ? `<p class="hint"><b>${h(t("ideaLabel"))}:</b> ${h(r.bigIdea)}</p>` : ""}
      ${r.notes ? `<p class="hint"><b>${h(t("trNotes"))}:</b> ${h(r.notes)}</p>` : ""}
      ${r.verify.length ? `<p class="status err">${h(t("trVerify"))} ${r.verify.map((v) => `<a href="${h(bibleGatewayUrl(String(v), r.ver))}" target="_blank" rel="noopener">${h(String(v))}</a>`).join(", ")}</p>` : ""}
      <div class="actions"><button type="button" class="primary small" id="trUse">${h(t("trUse"))}</button><button type="button" class="small" id="trDiscard">${h(t("trDiscard"))}</button></div></div>`;
  }
  // Collapsed until tapped; stays open while it is working or has a result to review.
  const open = !!TR.open;
  const tg = $("trToggle"); if (tg) { tg.setAttribute("aria-expanded", open ? "true" : "false"); tg.classList.toggle("on", open); tg.classList.toggle("has-res", !!TR.res && !open); }
  el.hidden = !open;
  if (!open) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="tr-row"><label for="trTarget" class="vh">${h(t("trTitle"))}</label>
      <div class="tr-ctl"><span class="hint">${h(T2[src])} →</span><select id="trTarget">${opts}</select><span class="tr-ver"><label for="trVer" class="hint">${h(t("trVer"))}</label><select id="trVer">${bibleOptions(TR.target, TR.ver)}</select></span><button type="button" class="small" id="trGo"${TR.busy ? " disabled" : ""}>${h(t("trGo"))}</button></div></div>
    <p class="status${TR.err ? " err" : ""}" id="trSt">${h(TR.busy ? t("trWorking") : TR.err || TR.msg)}${TR.undo && !TR.busy ? ` <button type="button" class="small linkish" id="trUndo">${h(t("trUndo"))}</button>` : ""}</p>${out}`;
  $("trTarget").addEventListener("change", (e) => { TR.target = e.target.value; TR.ver = ""; renderTr(); });
  $("trVer").addEventListener("change", (e) => { TR.ver = e.target.value; });
  $("trGo").addEventListener("click", trRun);
  const u = $("trUse"); if (u) u.addEventListener("click", trApply);
  const d = $("trDiscard"); if (d) d.addEventListener("click", () => { TR.res = null; renderTr(); });
  const un = $("trUndo"); if (un) un.addEventListener("click", trUndo);
}
$("audience").addEventListener("change", () => { renderTr(); if (typeof renderBibleHint === "function") renderBibleHint(); });
$("lang").addEventListener("change", renderTr);

// ---------- AI-suggested central idea: confirm or ignore ----------
const IDEA = { busy: false, sug: "", forText: "", ignored: "" };
const textKey = (s) => s.length + ":" + s.slice(0, 60) + s.slice(-60);
function ideaPrompt(text) {
  return `Lee el guion de este pastor y escribe su idea central en UNA sola frase (máximo 25 palabras), con sus propias palabras y énfasis, en el mismo idioma del guion. No añadas enseñanza ni la mejores teológicamente: resume lo que él ya predica. ${typeof voice === "function" && state.result ? voice() : ""}
Devuelve solo este JSON: {"idea": "frase"}
GUION:
"""
${text.slice(0, 16000)}
"""`;
}
async function ideaSuggest(force) {
  const text = $("script").value.trim();
  if (!text || (($("bigIdea") || {}).value || "").trim()) return;
  const key = textKey(text);
  if (!force && (IDEA.forText === key || IDEA.ignored === key)) return;
  if (text.split(/\s+/).length < 120 && !force) return;
  const sample = await caps.sample;
  if (!sample || IDEA.busy) return;
  IDEA.busy = true; IDEA.forText = key; IDEA.sug = ""; renderIdeaSug();
  try {
    const res = await sample.json(ideaPrompt(text), { modelTier: "default" });
    IDEA.sug = String((res && res.idea) || "").trim().replace(/^[«"“]|[»"”]$/g, "");
  } catch (e) { IDEA.sug = ""; IDEA.forText = ""; }
  IDEA.busy = false; renderIdeaSug();
}
function ideaConfirm(v) {
  const val = (v || IDEA.sug || "").trim();
  if (!val) return;
  $("bigIdea").value = val; IDEA.sug = "";
  markDirty(); renderIdeaSug();
  if (state.result && state.text) { state.fixSel = {}; state.fixAi = {}; rerunReview(t("ideaSaved")); }
}
function ideaIgnore() {
  IDEA.ignored = IDEA.forText; IDEA.sug = "";
  state.fixDismissed.add("bigidea");
  renderIdeaSug();
  if (state.result) { if (V.guided) renderGuide(); else renderResults(); }
}
function renderIdeaSug() {
  const has = !!(($("bigIdea") || {}).value || "").trim();
  // under the field in step 1 / full mode
  const el = $("ideaSug");
  if (el) {
    if (has || !$("script").value.trim()) el.innerHTML = "";
    else if (IDEA.busy) el.innerHTML = `<p class="status">${h(t("ideaSugWorking"))}</p>`;
    else if (IDEA.sug) {
      el.innerHTML = `<div class="idea-sug"><div class="k">${h(t("ideaSugTitle"))}</div><p class="idea-q">«${h(IDEA.sug)}»</p><p class="hint">${h(t("ideaSugHint"))}</p>
        <div class="actions"><button type="button" class="primary small" data-ideaok>${h(t("ideaConfirm"))}</button><button type="button" class="small" data-ideano>${h(t("ideaIgnore"))}</button></div></div>`;
    } else el.innerHTML = `<button type="button" class="small linkish" data-ideago>${h(t("ideaSugGo"))}</button>`;
    el.querySelectorAll("[data-ideaok]").forEach((b) => b.addEventListener("click", () => ideaConfirm()));
    el.querySelectorAll("[data-ideano]").forEach((b) => b.addEventListener("click", ideaIgnore));
    el.querySelectorAll("[data-ideago]").forEach((b) => b.addEventListener("click", () => ideaSuggest(true)));
  }
  // inside the "idea central" fix card
  const inl = $("ideaInline");
  if (inl) {
    const box = inl.closest(".idea-inline");
    let note = box.querySelector(".idea-ai");
    if (!note) { note = document.createElement("p"); note.className = "hint idea-ai"; box.appendChild(note); }
    if (IDEA.busy) note.textContent = t("ideaSugWorking");
    else if (IDEA.sug) {
      if (!inl.value.trim()) inl.value = IDEA.sug;
      note.textContent = t("ideaSugHint");
      const save = $("ideaInlineSave"); if (save) save.textContent = t("ideaConfirm");
      if (!box.querySelector("[data-ideano]")) { const b = document.createElement("button"); b.type = "button"; b.className = "small"; b.dataset.ideano = "1"; b.textContent = t("ideaIgnore"); b.addEventListener("click", ideaIgnore); save.insertAdjacentElement("afterend", b); }
    } else note.textContent = "";
  }
}
const _wireFixesL = wireFixes;
wireFixes = function () { _wireFixesL(); renderIdeaSug(); };
$("runBtn").addEventListener("click", () => setTimeout(() => ideaSuggest(false), 50));
$("script").addEventListener("paste", () => setTimeout(() => ideaSuggest(false), 1200));
$("bigIdea").addEventListener("input", renderIdeaSug);
const _gOnLangL = gOnLang;
gOnLang = function () { _gOnLangL(); renderTr(); renderIdeaSug(); };
renderTr(); renderIdeaSug();
{ const tg = $("trToggle"); if (tg) tg.addEventListener("click", () => { TR.open = !TR.open; renderTr(); }); }
