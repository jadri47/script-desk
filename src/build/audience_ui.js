/* ===== Público del canal: Latinoamérica y España (neutro), Latinoamérica o España ===== */
// (jadri47, 2026-10-29: B-011) the audLabel/audBoth/audLatam/audEs texts live in lang_ui.js (it loads later and used to overwrite the copies that were here)
const AUD_OK = new Set(["both", "latam", "es"]);
(function initAudience() {
  const sel = $("audience");
  const saved = lsGet("sd-aud");
  if (AUD_OK.has(saved)) sel.value = saved;
  sel.addEventListener("change", () => {
    lsSet("sd-aud", sel.value);
    markDirty();
    if (state.result && state.text) {
      state.opts = readOpts(); state.result = analyze(state.text, state.opts);
      if (V.guided) renderGuide(); else renderResults();
    }
  });
})();
const _readOptsA = readOpts;
readOpts = function () { return { ..._readOptsA(), audience: $("audience").value }; };
const _prodBodyA = prodBody;
prodBody = function (now) { return { ..._prodBodyA(now), audience: $("audience").value }; };
const _applyProdA = applyProd;
applyProd = function (id, d) { _applyProdA(id, d); if (AUD_OK.has(d.audience)) $("audience").value = d.audience; };
const PASTOR_NOTE = "El autor es un pastor que predica con regularidad y conoce bien la Biblia. Ajusta solo la forma para YouTube; nunca cambies su mensaje, su doctrina, sus argumentos, sus ilustraciones ni sus citas, y no añadas enseñanza nueva.";
function audVoice() {
  const a = $("audience").value;
  return a === "es" ? `El guion está en español de España: se dirige a la audiencia con "vosotros" y usa vocabulario peninsular; no uses voseo ni expresiones solo latinoamericanas. ${PASTOR_NOTE}`
    : a === "latam" ? `El guion está en español latinoamericano: "ustedes", nunca "vosotros" ni voseo, salvo dentro de citas bíblicas. ${PASTOR_NOTE}`
    : `El guion está en español neutro para Centroamérica, Latinoamérica y España: "ustedes", nunca "vosotros" ni voseo, salvo dentro de citas bíblicas. ${PASTOR_NOTE}`;
}
