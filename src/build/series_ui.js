
/* ===== Tema y próximo episodio · Calendario de la serie · Copia de seguridad ===== */
Object.assign(T.es, {
  tpTitle: "Tema y próximo episodio", tpLead: "El tema es la frase que alguien escribiría en YouTube. El próximo episodio se anuncia al final del guion y aparece en el calendario.",
  tpTopic: "¿De qué tema trata?", tpTopicPh: "la ansiedad", tpAuto: (k) => `Si lo dejas vacío, uso «${k}», la frase que más repites.`, tpNext: "¿Qué veremos el próximo episodio?", tpNextPh: "el Salmo 23", tpDate: "Fecha de publicación",
  srTitle: "Calendario de la serie", srLead: "Planea los episodios con su fecha. Toca «Abrir» para trabajar en uno.", srNewTitle: "Título del episodio", srNewPh: "Qué dice la Biblia sobre el perdón", srPlan: "Planear",
  srDel: "Borrar", srDelQ: (x) => `¿Borrar «${x}»? No se puede deshacer.`, srDelYes: "Sí, borrar", srDelNo: "No", srDelAll: (n) => `Borrar los ${n} episodios`, srDelAllQ: (n) => `¿Borrar los ${n} episodios? No se puede deshacer.`,
  srNoDate: "Sin fecha", srToWrite: "Por escribir", srLate: "Atrasado", srNext: "Próximo", srOpen: "Abrir", srPlanNext: (x) => `Planear: ${x}`, srAll: (n) => `Ver los ${n}`, srLess: "Ver menos",
  srEmpty: "Aún no hay episodios. Escribe el título del primero y su fecha.", srNeedDb: "El calendario y los episodios se guardan al abrir esta página en Claude.", srCurrent: "abierto",
  bkTitle: "Copia de seguridad", bkLead: "Descarga un archivo con todos los episodios, versiones, notas y resultados. Guárdalo en tu computadora o en la nube.",
  bkDown: "Descargar copia", bkUp: "Restaurar desde un archivo", bkBad: "Ese archivo no es una copia de Script Desk.", bkConfirm: (n) => `Se escribirán ${n} documentos; los que tengan el mismo nombre se reemplazan.`,
  bkYes: "Sí, restaurar", bkNo: "Cancelar", bkDone: (n) => `Restaurados ${n} documentos.`, bkSaved: "Copia descargada.", bkWorking: "Trabajando…", bkFail: "No se pudo completar.",
});
Object.assign(T.en, {
  tpTitle: "Topic and next episode", tpLead: "The topic is the phrase someone would type on YouTube. The next episode is announced at the end of the script and shows up in the calendar.",
  tpTopic: "What's the topic?", tpTopicPh: "anxiety", tpAuto: (k) => `If you leave it empty, I use "${k}", your most repeated phrase.`, tpNext: "What's next episode about?", tpNextPh: "Psalm 23", tpDate: "Publish date",
  srTitle: "Series calendar", srLead: "Plan episodes with their dates. Tap \"Open\" to work on one.", srNewTitle: "Episode title", srNewPh: "What the Bible says about forgiveness", srPlan: "Plan",
  srDel: "Delete", srDelQ: (x) => `Delete “${x}”? This can't be undone.`, srDelYes: "Yes, delete", srDelNo: "No", srDelAll: (n) => `Delete all ${n} episodes`, srDelAllQ: (n) => `Delete all ${n} episodes? This can't be undone.`,
  srNoDate: "No date", srToWrite: "To write", srLate: "Late", srNext: "Next up", srOpen: "Open", srPlanNext: (x) => `Plan: ${x}`, srAll: (n) => `See all ${n}`, srLess: "See less",
  srEmpty: "No episodes yet. Write the first one's title and date.", srNeedDb: "The calendar and episodes are saved when this page is opened in Claude.", srCurrent: "open",
  bkTitle: "Backup", bkLead: "Download one file with every episode, version, note and result. Keep it on your computer or in the cloud.",
  bkDown: "Download backup", bkUp: "Restore from a file", bkBad: "That file isn't a Script Desk backup.", bkConfirm: (n) => `${n} documents will be written; ones with the same name are replaced.`,
  bkYes: "Yes, restore", bkNo: "Cancel", bkDone: (n) => `Restored ${n} documents.`, bkSaved: "Backup downloaded.", bkWorking: "Working…", bkFail: "Couldn't finish.",
});
Object.assign(G, { pubDate: "", nextEp: "", seriesAll: false });

// ---------- data plumbing ----------
const _prodBodyS = prodBody;
prodBody = function (now) { return { ..._prodBodyS(now), pubDate: G.pubDate || "", nextEp: G.nextEp || "" }; };
const _applyProdS = applyProd;
applyProd = function (id, d) { _applyProdS(id, d); G.pubDate = d.pubDate || ""; G.nextEp = d.nextEp || ""; };
const _readOptsS = readOpts;
readOpts = function () { return { ..._readOptsS(), nextEp: G.nextEp || "" }; };
loadProds = async function () {
  const db = await caps.db;
  if (!db) return;
  try {
    const q = await db.collection("producciones").orderBy("updatedAt", "desc").limit(200).get();
    G.prods = q.docs.map((d) => { const x = d.data() || {}; return { id: d.id, title: x.title || "", status: x.status || "borrador", updatedAt: x.updatedAt || 0, pubDate: x.pubDate || "", nextEp: x.nextEp || "", hasText: !!(x.text && x.text.trim()) }; });
    G.loadErr.prods = false; G.srMsg = "";
    if (G.mode === "guion" && !V.guided) renderProdBar();
    renderSeriesAll();
  } catch (e) { G.loadErr.prods = true; renderSeriesAll(); }
};
function renderSeriesAll() {
  if ($("gSeries")) renderSeries("gSeries");
  if ($("gSeriesFull")) renderSeries("gSeriesFull");
  if ($("gBackupFull") && !$("gBackupFull").innerHTML) renderBackup("gBackupFull");
}

// ---------- topic + next episode ----------
function renderTopic() {
  const el = $("gTopic");
  if (!el) return;
  const auto = G.R && G.R.keyword && !$("keyword").value.trim() ? G.R.keyword : "";
  el.innerHTML = `<header class="g-h"><h2>${h(t("tpTitle"))}</h2></header><p class="lead">${h(t("tpLead"))}</p>
    <div class="tp-fields">
      <div class="field"><label for="tpTopic">${h(t("tpTopic"))}</label><textarea id="tpTopic" rows="1" data-one="1" placeholder="${h(auto || t("tpTopicPh"))}">${h($("keyword").value)}</textarea>${auto ? `<span class="hint">${h(t("tpAuto")(auto))}</span>` : ""}</div>
      <div class="field"><label for="tpNext">${h(t("tpNext"))}</label><textarea id="tpNext" rows="1" data-one="1" placeholder="${h(t("tpNextPh"))}">${h(G.nextEp)}</textarea></div>
      <div class="field"><label for="tpDate">${h(t("tpDate"))}</label><input id="tpDate" type="date" value="${h(G.pubDate)}"></div>
    </div>`;
  const after = () => {
    markDirty();
    if (state.result) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); }
    if (V.guided) { gCompute(); renderGuide(); } else if (G.mode === "guion") gRefresh();
  };
  $("tpTopic").addEventListener("change", () => { $("keyword").value = $("tpTopic").value.trim(); after(); });
  $("tpNext").addEventListener("change", () => { G.nextEp = $("tpNext").value.trim(); markDirty(); const p = G.prods.find((x) => x.id === G.prodId); if (p) p.nextEp = G.nextEp; });
  $("tpDate").addEventListener("change", () => { G.pubDate = $("tpDate").value; markDirty(); const p = G.prods.find((x) => x.id === G.prodId); if (p) { p.pubDate = G.pubDate; renderSeriesAll(); } });
}

// ---------- series calendar ----------
const isoToday = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmtDay = (iso) => new Date(iso + "T12:00:00").toLocaleDateString(UI, { weekday: "short", day: "numeric", month: "short" });
function nextFreeDate() {
  const dates = G.prods.map((p) => p.pubDate).filter(Boolean).sort();
  const last = dates[dates.length - 1];
  return last && last >= isoToday() ? addDays(last, 7) : addDays(isoToday(), 7);
}
async function planEpisode(title, date) {
  const db = await caps.db;
  if (!db || !title) return;
  const now = Date.now();
  await db.collection("producciones").add({ title, series: "", keyword: "", thumb: "", description: "", translation: "RVR1960", lang: "auto", text: "", status: "borrador", manual: false, layout: null, cold: { hook: null, promise: null }, notes: [], rehearsals: [], target: "", retention: null, realDur: "", shorts: [], pubDate: date || "", nextEp: "", updatedAt: now, updatedBy: G.sid });
  await loadProds();
}
async function setPubDate(id, date) {
  if (id === G.prodId) { G.pubDate = date; markDirty(); const p = G.prods.find((x) => x.id === id); if (p) p.pubDate = date; renderSeriesAll(); return; }
  const db = await caps.db;
  if (!db) return;
  try { await db.collection("producciones").doc(id).update({ pubDate: date }); const p = G.prods.find((x) => x.id === id); if (p) p.pubDate = date; G.srMsg = ""; renderSeriesAll(); } catch (e) { G.srMsg = t("srDateFail"); renderSeriesAll(); }
}
async function openFromSeries(id) {
  await openProd(id);
  state.fixUndo = []; state.fixSel = {}; state.fixAi = {}; state.fixDismissed = new Set(); state.fixLog = [];
  if (V.guided) {
    state.text = "";
    if (hasScript()) { ensureReview(); goStep(stepForStatus(G.status)); } else goStep(1);
    if (!hasScript()) $("script").focus();
  } else {
    if (hasScript()) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); }
    setMode("guion");
  }
}
async function deleteProds(ids) {
  const db = await caps.db;
  if (!db) return;
  const wasOpen = ids.includes(G.prodId);
  for (const id of ids) { try { await db.collection("producciones").doc(id).delete(); } catch (e) { /* keep going; the list reloads below */ } }
  G.prods = G.prods.filter((p) => !ids.includes(p.id));
  if (wasOpen) { clearTimeout(saveTimer); applyProd(null, {}); G.snaps = []; resetWorkState(); state.result = null; updateLive(); if (V.guided) goStep(1); else setMode("review"); }
  await loadProds(); // reports its own failure (G.loadErr.prods) and shows it in the list
  renderSeriesAll(); if (typeof renderEpStrip === "function") renderEpStrip();
}
function renderSeries(cid) {
  const el = $(cid);
  if (!el) return;
  caps.db.then((db) => {
    if (!el.isConnected) return;
    const head = `<header class="g-h"><h2>${h(t("srTitle"))}</h2></header>`;
    if (!db) { el.innerHTML = head + `<p class="hint">${h(t("srNeedDb"))}</p>`; return; }
    const today = isoToday();
    const list = [...G.prods].sort((a, b) => (a.pubDate && b.pubDate ? a.pubDate.localeCompare(b.pubDate) : a.pubDate ? -1 : b.pubDate ? 1 : b.updatedAt - a.updatedAt));
    const upcoming = list.find((p) => p.pubDate && p.pubDate >= today && p.status !== "grabado");
    let shown = list;
    if (!G.seriesAll) { const firstFuture = list.findIndex((p) => !p.pubDate || p.pubDate >= today); const from = Math.max(0, (firstFuture < 0 ? list.length : firstFuture) - 2); shown = list.slice(from, from + 6); }
    const titles = new Set(G.prods.map((p) => norm(p.title)));
    const row = (p) => {
      const late = p.pubDate && p.pubDate < today && p.status !== "grabado";
      const chip = !p.hasText ? t("srToWrite") : t("status")[p.status] || p.status;
      const nextBtn = p.nextEp && !titles.has(norm(p.nextEp)) ? `<button type="button" class="small linkish" data-srnext="${h(p.id)}">${h(t("srPlanNext")(p.nextEp))}</button>` : "";
      return `<li class="${late ? "late" : ""}${p.id === G.prodId ? " cur" : ""}">
        <input type="date" value="${h(p.pubDate)}" data-srdate="${h(p.id)}" aria-label="${h(t("tpDate"))}">
        <div class="sr-main"><b>${h(p.title || "—")}</b><span class="sr-tags"><span class="chip">${h(chip)}</span>${late ? `<span class="chip sr-late">${h(t("srLate"))}</span>` : ""}${upcoming && upcoming.id === p.id ? `<span class="chip sr-next">${h(t("srNext"))}</span>` : ""}${p.id === G.prodId ? `<span class="hint">· ${h(t("srCurrent"))}</span>` : ""}</span>${nextBtn}</div>
        <span class="sr-acts"><button type="button" class="small" data-sropen="${h(p.id)}">${h(t("srOpen"))}</button><button type="button" class="small linkish sr-del" data-srdel="${h(p.id)}">${h(t("srDel"))}</button></span></li>`;
    };
    el.innerHTML = `${head}<p class="lead">${h(t("srLead"))}</p>
      <div class="sr-new"><input id="${cid}-t" placeholder="${h(t("srNewPh"))}" aria-label="${h(t("srNewTitle"))}" maxlength="100"><input id="${cid}-d" type="date" value="${h(nextFreeDate())}" aria-label="${h(t("tpDate"))}"><button type="button" class="small primary" id="${cid}-p">${h(t("srPlan"))}</button></div>
      ${list.length ? `<ul class="sr-list">${shown.map(row).join("")}</ul>${list.length > 6 ? `<button type="button" class="small linkish" id="${cid}-all">${h(G.seriesAll ? t("srLess") : t("srAll")(list.length))}</button>` : ""}<div class="sr-clear"><button type="button" class="small linkish sr-del" id="${cid}-delall">${h(t("srDelAll")(list.length))}</button></div>` : `<p class="hint">${h(t("srEmpty"))}</p>`}`;
    // Deleting asks first, right in the row, and never touches anything else.
    const askDel = (box, q, onYes) => { const keep = box.innerHTML; box.innerHTML = `<span class="sr-q">${h(q)}</span><button type="button" class="small danger" data-y>${h(t("srDelYes"))}</button><button type="button" class="small" data-n>${h(t("srDelNo"))}</button>`; box.querySelector("[data-n]").addEventListener("click", () => renderSeriesAll()); box.querySelector("[data-y]").addEventListener("click", async (e) => { e.target.disabled = true; await onYes(); }); };
    el.querySelectorAll("[data-srdel]").forEach((b) => b.addEventListener("click", () => { const p = G.prods.find((x) => x.id === b.dataset.srdel); askDel(b.closest(".sr-acts"), t("srDelQ")(p ? p.title || "—" : "—"), () => deleteProds([b.dataset.srdel])); }));
    const da = el.querySelector(`#${cid}-delall`); if (da) da.addEventListener("click", () => askDel(da.closest(".sr-clear"), t("srDelAllQ")(list.length), () => deleteProds(list.map((x) => x.id))));
    el.querySelector(`#${cid}-p`).addEventListener("click", async (e) => { const ti = el.querySelector(`#${cid}-t`).value.trim(); if (!ti) { el.querySelector(`#${cid}-t`).focus(); return; } e.target.disabled = true; await planEpisode(ti, el.querySelector(`#${cid}-d`).value); });
    const all = el.querySelector(`#${cid}-all`); if (all) all.addEventListener("click", () => { G.seriesAll = !G.seriesAll; renderSeriesAll(); });
    el.querySelectorAll("[data-sropen]").forEach((b) => b.addEventListener("click", () => { b.disabled = true; openFromSeries(b.dataset.sropen); }));
    el.querySelectorAll("[data-srdate]").forEach((i) => i.addEventListener("change", () => setPubDate(i.dataset.srdate, i.value)));
    el.querySelectorAll("[data-srnext]").forEach((b) => b.addEventListener("click", async () => { const p = G.prods.find((x) => x.id === b.dataset.srnext); b.disabled = true; await planEpisode(p.nextEp[0].toUpperCase() + p.nextEp.slice(1), p.pubDate ? addDays(p.pubDate, 7) : nextFreeDate()); }));
  });
}

// ---------- backup ----------
const BK_COLS = ["producciones", "instantaneas", "episodios", "guiones"];
async function exportAll(msg) {
  const db = await caps.db, dl = await caps.downloads;
  if (!db || !dl) { msg.textContent = t("downloadNeeds"); return; }
  msg.textContent = t("bkWorking");
  try {
    const out = { app: "Script Desk", version: 1, exportedAt: new Date().toISOString(), collections: {}, docs: {} };
    for (const c of BK_COLS) { const q = await db.collection(c).limit(1000).get(); out.collections[c] = q.docs.map((d) => ({ id: d.id, data: d.data() })); }
    const r = await db.doc("ajustes/ritmo").get();
    if (r.exists) out.docs["ajustes/ritmo"] = r.data();
    await dl.save({ filename: `script-desk-${UI === "en" ? "backup" : "respaldo"}-${isoToday()}.json`, data: JSON.stringify(out, null, 1) });
    msg.textContent = t("bkSaved");
  } catch (e) { msg.textContent = e && e.code === "declined" ? "" : t("bkFail"); }
}
async function restoreAll(data, msg, box) {
  const db = await caps.db;
  if (!db) return;
  let n = 0;
  msg.textContent = t("bkWorking");
  try {
    for (const c of BK_COLS) for (const d of (data.collections && data.collections[c]) || []) { if (d && d.id && d.data) { await db.collection(c).doc(String(d.id)).set(d.data); n++; } }
    for (const [path, body] of Object.entries(data.docs || {})) if (path === "ajustes/ritmo" && body) { await db.doc(path).set(body); n++; }
    msg.textContent = t("bkDone")(n);
    box.innerHTML = "";
    await loadProds(); loadHistory();
  } catch (e) { msg.textContent = t("bkFail") + (n ? " " + t("bkDone")(n) : ""); }
}
function renderBackup(cid) {
  const el = $(cid);
  if (!el) return;
  caps.db.then((db) => {
    if (!el.isConnected) return;
    if (!db) { el.innerHTML = ""; return; }
    el.innerHTML = `<header class="g-h"><h2>${h(t("bkTitle"))}</h2></header><p class="lead">${h(t("bkLead"))}</p>
      <div class="actions"><button type="button" class="small" id="${cid}-dl">${h(t("bkDown"))}</button><label class="small filebtn"><input type="file" id="${cid}-up" accept=".json,application/json"> ${h(t("bkUp"))}</label><span class="status" id="${cid}-msg"></span></div><div id="${cid}-confirm"></div>`;
    const msg = el.querySelector(`#${cid}-msg`), box = el.querySelector(`#${cid}-confirm`);
    el.querySelector(`#${cid}-dl`).addEventListener("click", () => exportAll(msg));
    el.querySelector(`#${cid}-up`).addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        let data = null;
        try { data = JSON.parse(String(rd.result || "")); } catch (x) {}
        if (!data || data.app !== "Script Desk" || !data.collections) { msg.textContent = t("bkBad"); return; }
        const n = BK_COLS.reduce((a, c) => a + ((data.collections[c] || []).length), 0) + Object.keys(data.docs || {}).length;
        msg.textContent = "";
        box.innerHTML = `<div class="bk-confirm"><p>${h(t("bkConfirm")(n))}</p><div class="actions"><button type="button" class="small primary" id="${cid}-yes">${h(t("bkYes"))}</button><button type="button" class="small" id="${cid}-no">${h(t("bkNo"))}</button></div></div>`;
        el.querySelector(`#${cid}-yes`).addEventListener("click", (ev) => { ev.target.disabled = true; restoreAll(data, msg, box); });
        el.querySelector(`#${cid}-no`).addEventListener("click", () => (box.innerHTML = ""));
      };
      rd.readAsText(f);
      e.target.value = "";
    });
  });
}
const _gOnLangS = gOnLang;
gOnLang = function () { _gOnLangS(); if ($("gSeriesFull")) { renderSeries("gSeriesFull"); renderBackup("gBackupFull"); } };
// Keep the calendar's status chip in step with status changes made in this session.
const _setStatusS = setStatus;
setStatus = async function (s) {
  await _setStatusS(s);
  const p = G.prods.find((x) => x.id === G.prodId);
  if (p) { p.status = G.status; p.hasText = !!$("script").value.trim(); renderSeriesAll(); } else await loadProds();
};
// The calendar needs a name even before there's a title; don't let that placeholder land in the "Título" field.
const _prodBodyT = prodBody;
prodBody = function (now) { return { ..._prodBodyT(now), titleAuto: !$("title").value.trim() }; };
const _applyProdT = applyProd;
applyProd = function (id, d) {
  _applyProdT(id, d);
  const auto = d.titleAuto === true || (d.titleAuto === undefined && d.title && d.title === (d.text || "").trim().slice(0, 60));
  if (auto) { $("title").value = ""; const pk = $("pkTitleIn"); if (pk) pk.value = ""; }
};
