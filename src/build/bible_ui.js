/* ===== Versión bíblica: una sola elección que usan los enlaces, la traducción y todo texto que escriba la IA ===== */
const BIBLE = {
  RVR1960: { lang: "es", name: "Reina-Valera 1960" }, NVI: { lang: "es", name: "Nueva Versión Internacional" },
  LBLA: { lang: "es", name: "La Biblia de las Américas" }, NBLA: { lang: "es", name: "Nueva Biblia de las Américas" },
  NTV: { lang: "es", name: "Nueva Traducción Viviente" }, DHH: { lang: "es", name: "Dios Habla Hoy" }, RVC: { lang: "es", name: "Reina Valera Contemporánea" },
  KJV: { lang: "en", name: "King James Version" }, NKJV: { lang: "en", name: "New King James Version" },
  NASB: { lang: "en", name: "New American Standard Bible" }, ESV: { lang: "en", name: "English Standard Version" },
  NIV: { lang: "en", name: "New International Version" }, NLT: { lang: "en", name: "New Living Translation" },
};
const bibleLang = (v) => (BIBLE[v] || BIBLE.RVR1960).lang;
const bibleName = (v) => `${v} (${(BIBLE[v] || BIBLE.RVR1960).name})`;
const bibleDefault = (lang) => (lang === "en" ? "KJV" : "RVR1960");
const bibleFor = (lang, cur) => (BIBLE[cur] && bibleLang(cur) === (lang === "en" ? "en" : "es") ? cur : bibleDefault(lang));
const bibleOptions = (lang, sel) => Object.keys(BIBLE).filter((k) => BIBLE[k].lang === (lang === "en" ? "en" : "es"))
  .map((k) => `<option value="${k}"${k === sel ? " selected" : ""}>${h(k + " · " + BIBLE[k].name)}</option>`).join("");

Object.assign(T.es, {
  trLabel: "Versión bíblica",
  trVer: "Citas en",
  bibleOk: (v) => `Los enlaces abren esta versión, y si la IA añade o traduce un versículo, lo escribe en ${v}.`,
  bibleMismatch: (v) => `Tu guion está en ${v === "en" ? "español" : "inglés"} y esta versión es en ${v === "en" ? "inglés" : "español"}. Elige una versión en el idioma del guion.`,
});
Object.assign(T.en, {
  trLabel: "Bible version",
  trVer: "Quotes in",
  bibleOk: (v) => `Links open this version, and if the AI adds or translates a verse, it writes it in ${v}.`,
  bibleMismatch: (v) => `Your script is in ${v === "en" ? "Spanish" : "English"} and this version is in ${v === "en" ? "English" : "Spanish"}. Pick a version in the script's language.`,
});

function scriptLang() {
  if (state.result && state.result.lang) return state.result.lang;
  const l = $("lang").value;
  if (l === "en" || l === "es") return l;
  const txt = $("script").value;
  return txt.trim() && typeof detectLanguage === "function" ? detectLanguage(txt) : (UI === "en" ? "en" : "es");
}
function renderBibleHint() {
  const el = $("bibleHint"), v = $("translation").value;
  if (!el) return;
  const bad = $("script").value.trim() && bibleLang(v) !== (scriptLang() === "en" ? "en" : "es");
  el.className = "hint" + (bad ? " warn-t" : "");
  el.textContent = bad ? t("bibleMismatch")(bibleLang(v)) : t("bibleOk")(v);
  const cur = $("setCur");
  if (cur) { const a = $("audience"), ao = a && a.options[a.selectedIndex]; cur.textContent = `${ao ? ao.textContent : ""} · ${v}`; cur.classList.toggle("warn-t", !!bad); }
}

// Every AI request (Ask Claude, quick fixes, hooks, titles, idea) quotes Scripture in the chosen version.
// The translation panel sets its own rule, so it opts out with { bibleRule: false }.
function bibleRule() {
  const v = $("translation").value || "RVR1960";
  return `VERSIÓN BÍBLICA: si en tu respuesta citas, añades o traduces un versículo, usa el texto de la ${bibleName(v)} palabra por palabra, con su referencia. No cambies las citas que el autor ya tiene en el guion salvo que te lo pida. Si no estás seguro del texto exacto en esa versión, escribe solo la referencia entre corchetes, por ejemplo [Mateo 6:34], para que el autor copie el versículo.`;
}
// With the Script Desk server (s.serverRules) the version travels as a field and goes into the cached system block;
// elsewhere (the Claude artifact) the rule is put in front of the task so the script text stays last.
caps.sample = caps.sample.then((s) => s && { ...s, json: (p, o = {}) => {
  if (s.serverRules) return s.json(p, o.bibleRule === false ? { ...o, noBible: true } : { ...o, bible: $("translation").value || "RVR1960" });
  return s.json(o.bibleRule === false ? p : bibleRule() + "\n\n" + p, o);
} });

(function initBible() {
  const sel = $("translation");
  if (!sel) return;
  if (!BIBLE[sel.value]) sel.value = "RVR1960";
  sel.addEventListener("change", () => { renderBibleHint(); if (typeof TR !== "undefined") { TR.ver = ""; renderTr(); } });
  // Switching the script language by hand moves the version to the same language.
  $("lang").addEventListener("change", () => { const l = $("lang").value; if (l === "en" || l === "es") sel.value = bibleFor(l, sel.value); renderBibleHint(); });
  let tm = null;
  $("script").addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(renderBibleHint, 500); });
  $("runBtn").addEventListener("click", () => setTimeout(renderBibleHint, 60));
  renderBibleHint();
})();
const _gOnLangB = gOnLang;
gOnLang = function () { _gOnLangB.apply(this, arguments); renderBibleHint(); };
const _applyProdB = applyProd;
applyProd = function (id, d) { _applyProdB(id, d); if (!BIBLE[$("translation").value]) $("translation").value = bibleDefault(d.lang); renderBibleHint(); };
