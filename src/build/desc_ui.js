/* ===== Three AI descriptions under «Descripción» (Adrian, 2026-11-03: A "AI should be able to propose three descriptions to choose
   from in descripcion y capitulos"; on request, one paid call per press) ===== */
// The candidates are vetted by vetDescs (desc_logic.js) before they are shown; they live for the session only (nothing new is
// saved with the episode: the chosen one is just the description text). «Usar esta» writes it above the chapter block.
Object.assign(T.es, {
  dsAi: "Proponer 3 con IA", dsAgain: "Otras 3 con IA", dsUse: "Usar esta", dsLbl: "Elige una descripción", dsOpt: (n) => `Opción ${n}`,
  dsUsed: "Descripción puesta, con los capítulos debajo. Puedes editarla.", dsNone: "Ninguna propuesta pasó las comprobaciones (palabra clave al inicio, referencias del guion, términos de riesgo). Prueba otra vez.",
  dsSome: (n) => `Solo ${n} de 3 pasaron las comprobaciones.`, dsAiLbl: "Descripciones", dsStale: "El guion cambió después de estas propuestas: pide otras.",
});
Object.assign(T.en, {
  dsAi: "Suggest 3 with AI", dsAgain: "3 more with AI", dsUse: "Use this one", dsLbl: "Pick a description", dsOpt: (n) => `Option ${n}`,
  dsUsed: "Description set, with the chapters below. You can edit it.", dsNone: "No suggestion passed the checks (keyword first, the script's references, risk terms). Try again.",
  dsSome: (n) => `Only ${n} of 3 passed the checks.`, dsAiLbl: "Descriptions", dsStale: "The script changed after these suggestions: ask for new ones.",
});
const DS = { list: [], sel: 0, key: "", busy: false, msg: "", err: false };

function dsHTML() {
  const stale = DS.list.length && DS.key !== state.text;
  const opts = DS.list.length && !stale ? `<fieldset class="ds-list"><legend class="vh">${h(t("dsLbl"))}</legend>${DS.list.map((d, k) => `<label class="ds-opt${k === DS.sel ? " on" : ""}"><input type="radio" name="dsPick" value="${k}"${k === DS.sel ? " checked" : ""}><span class="ds-n">${h(t("dsOpt")(k + 1))}</span><span class="ds-t">${h(d)}</span></label>`).join("")}</fieldset>
    <div class="actions"><button type="button" class="small primary" data-ds="use">${h(t("dsUse"))}</button></div>` : "";
  const msg = stale ? t("dsStale") : DS.msg;
  return `<div class="actions"><button type="button" class="small" data-ds="ai"${DS.busy ? " disabled" : ""}>${h(DS.list.length ? t("dsAgain") : t("dsAi"))}</button></div>
    <p class="status${DS.err ? " err" : ""}" id="dsSt" role="status">${h(msg)}</p>${opts}`;
}
function renderDs() {
  const box = $("dsBox");
  if (box) box.innerHTML = dsHTML();
}
async function dsAsk() {
  const sample = await caps.sample;
  if (!sample) { DS.msg = t("aiPickNeed"); DS.err = true; renderDs(); return; }
  const text = state.text || $("script").value, R = state.result && state.text === text ? state.result : analyze(text, readOpts());
  const kw = $("keyword").value.trim() || (typeof R.keyword === "string" ? R.keyword : "");
  DS.busy = true; DS.msg = t("thinking"); DS.err = false; renderDs();
  try {
    const res = await sample.json(descPrompt(text, R, { keyword: kw, title: $("title").value.trim(), nextEp: (G.nextEp || "").trim() }), { modelTier: "default", aiLabel: t("dsAiLbl"), aiRetry: dsAsk });
    if (!res || !Array.isArray(res.descs)) throw { code: "invalid_json" };
    const v = vetDescs(res.descs, text, kw, descRisk);
    DS.list = v.list; DS.sel = 0; DS.key = text;
    DS.msg = !v.list.length ? t("dsNone") : v.list.length < DESC_N ? t("dsSome")(v.list.length) : ""; DS.err = !v.list.length;
  } catch (e) { DS.msg = errText(e); DS.err = true; }
  DS.busy = false; renderDs();
}
function dsUse() {
  const d = DS.list[DS.sel];
  if (!d || DS.key !== state.text) { renderDs(); return; }
  const ch = chaptersText().map((c) => `${fmtTime(c.t)} ${c.label}`).join("\n");
  $("description").value = descWithChapters($("description").value, d, chaptersText().length >= 3 ? ch : "");
  const pd = $("pkDescIn"); if (pd) pd.value = $("description").value;
  DS.msg = t("dsUsed"); DS.err = false;
  markDirty(); gCompute(); renderPackChecks();
  renderDs();
}
const _renderPackDs = renderPack;
renderPack = function () {
  const r = _renderPackDs.apply(this, arguments);
  const f = $("pkDescIn") && $("pkDescIn").closest(".field");
  if (f && !$("dsBox")) {
    f.insertAdjacentHTML("afterend", '<div class="ds-box" id="dsBox"></div>');
    const box = $("dsBox");
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-ds]"); if (!b) return; if (b.dataset.ds === "ai") dsAsk(); else dsUse(); });
    // no re-render on change: arrow keys through the radios keep their focus
    box.addEventListener("change", (e) => { if (e.target.name !== "dsPick") return; DS.sel = +e.target.value; box.querySelectorAll(".ds-opt").forEach((l, k) => l.classList.toggle("on", k === DS.sel)); });
    renderDs();
  }
  return r;
};
