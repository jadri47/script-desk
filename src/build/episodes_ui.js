/* ===== Tus episodios: lista sencilla en una hoja aparte, y «planea el próximo» en el paso 5 ===== */
// The old calendar sat in step 1, before writing, with raw date boxes. Now: one line on top of every step
// says which episode is open, «Mis episodios» opens the list, and step 5 plans the next one right after recording.
Object.assign(T.es, {
  srTitle: "Tus episodios", srLead: "Toca un episodio para abrirlo.",
  epNow: "Episodio", epNew: "Episodio nuevo", epNoDate: "sin fecha de publicación", epOut: (d) => `sale el ${d}`,
  epBtn: "Mis episodios", epClose: "Cerrar", epOpenNow: "Abierto", epChange: "Cambiar fecha", epSave: "Guardar", epCancel: "Cancelar",
  epNoText: "Falta escribir", epLateM: "fecha pasada", epToday: "hoy", epTomorrow: "mañana", epIn: (n) => `en ${n} días`, epAgo: (n) => `hace ${n} días`,
  epAdd: "+ Planear otro episodio", epAbout: "¿Sobre qué será?", epDay: "¿Qué día sale?", epAddBtn: "Añadir", epPast: (n) => `Ver los ${n} ya grabados`, epPastHide: "Ocultar los grabados",
  epEmpty: "Aún no hay episodios guardados. Cuando revises tu primer guion, aparecerá aquí.", epBackup: "Copia de seguridad",
  npTitle: "Planea el próximo episodio",
  npLeadNext: (x) => `Al final del guion anuncias «${x}». Déjalo apuntado para no empezar de cero la semana que viene.`,
  npLead: "Apunta el tema del siguiente episodio para no empezar de cero la semana que viene.",
  npDone: (x, d) => `Ya está en tus episodios: «${x}», ${d}.`, npOpen: "Abrirlo", npAll: "Ver todos mis episodios", npSaved: "Añadido a tus episodios.",
  npDateHint: (d) => `Se publicaría el ${d}.`, npGo: "Añadir a mis episodios", epPlanned: (x, d) => `Tienes «${x}» planeado${d ? " para el " + d : ""}.`, epWriteIt: "Escribir ese",
});
Object.assign(T.en, {
  srTitle: "Your episodes", srLead: "Tap an episode to open it.",
  epNow: "Episode", epNew: "New episode", epNoDate: "no publish date", epOut: (d) => `goes out ${d}`,
  epBtn: "My episodes", epClose: "Close", epOpenNow: "Open", epChange: "Change date", epSave: "Save", epCancel: "Cancel",
  epNoText: "Not written yet", epLateM: "date passed", epToday: "today", epTomorrow: "tomorrow", epIn: (n) => `in ${n} days`, epAgo: (n) => `${n} days ago`,
  epAdd: "+ Plan another episode", epAbout: "What will it be about?", epDay: "What day does it go out?", epAddBtn: "Add", epPast: (n) => `See the ${n} already recorded`, epPastHide: "Hide recorded ones",
  epEmpty: "No saved episodes yet. Once you review your first script, it shows up here.", epBackup: "Backup",
  npTitle: "Plan the next episode",
  npLeadNext: (x) => `At the end of the script you announce “${x}”. Note it down so you don't start from zero next week.`,
  npLead: "Note the next episode's topic so you don't start from zero next week.",
  npDone: (x, d) => `Already in your episodes: “${x}”, ${d}.`, npOpen: "Open it", npAll: "See all my episodes", npSaved: "Added to your episodes.",
  npDateHint: (d) => `It would go out ${d}.`, npGo: "Add to my episodes", epPlanned: (x, d) => `You have “${x}” planned${d ? " for " + d : ""}.`, epWriteIt: "Write that one",
});
Object.assign(G, { epPast: false, epAdding: false, epEdit: "" });

const dayDiff = (iso) => Math.round((new Date(iso + "T12:00:00") - new Date(isoToday() + "T12:00:00")) / 864e5);
function relDay(iso) {
  const n = dayDiff(iso);
  return n === 0 ? t("epToday") : n === 1 ? t("epTomorrow") : n > 1 ? t("epIn")(n) : t("epAgo")(-n);
}
const longDay = (iso) => new Date(iso + "T12:00:00").toLocaleDateString(UI, { weekday: "long", day: "numeric", month: "long" });
const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ---------- the list (sheet, and the full-mode history tab) ----------
renderSeries = function (cid) {
  const el = $(cid);
  if (!el) return;
  caps.db.then((db) => {
    if (!el.isConnected) return;
    const head = `<header class="g-h"><h2>${h(t("srTitle"))}</h2></header>`;
    if (!db) { el.innerHTML = head + `<p class="hint">${h(t("srNeedDb"))}</p>`; return; }
    const today = isoToday();
    const done = (p) => p.status === "grabado";
    const byDate = (a, b) => (a.pubDate && b.pubDate ? a.pubDate.localeCompare(b.pubDate) : a.pubDate ? -1 : b.pubDate ? 1 : b.updatedAt - a.updatedAt);
    const past = G.prods.filter((p) => done(p) && (!p.pubDate || p.pubDate < today) && p.id !== G.prodId).sort(byDate).reverse();
    const active = G.prods.filter((p) => !past.includes(p)).sort(byDate);
    const titles = new Set(G.prods.map((p) => norm(p.title)));
    const row = (p) => {
      const cur = p.id === G.prodId, late = p.pubDate && p.pubDate < today && !done(p);
      const status = !p.hasText ? t("epNoText") : t("status")[p.status] || p.status;
      const when = p.pubDate ? relDay(p.pubDate) : t("srNoDate").toLowerCase();
      const d = p.pubDate ? new Date(p.pubDate + "T12:00:00") : null;
      const tile = d ? `<span class="ep-date"><small>${h(d.toLocaleDateString(UI, { weekday: "short" }).replace(".", ""))}</small><b>${d.getDate()}</b><small>${h(d.toLocaleDateString(UI, { month: "short" }).replace(".", ""))}</small></span>` : `<span class="ep-date ep-nodate"><small>—</small></span>`;
      const nextBtn = p.nextEp && !titles.has(norm(p.nextEp)) ? `<button type="button" class="small linkish" data-srnext="${h(p.id)}">${h(t("srPlanNext")(p.nextEp))}</button>` : "";
      const tools = G.epEdit === p.id
        ? `<span class="ep-edit"><input type="date" value="${h(p.pubDate || nextFreeDate())}" data-srdate="${h(p.id)}" aria-label="${h(t("tpDate"))}"><button type="button" class="small primary" data-srsave="${h(p.id)}">${h(t("epSave"))}</button><button type="button" class="small" data-srcancel>${h(t("epCancel"))}</button></span>`
        : `<button type="button" class="small linkish" data-sredit="${h(p.id)}">${h(t("epChange"))}</button>${nextBtn}`;
      return `<li class="ep-row${cur ? " cur" : ""}${late ? " late" : ""}">
        <button type="button" class="ep-open" data-sropen="${h(p.id)}"${cur ? " disabled" : ""}>${tile}<span class="ep-main"><b>${h(p.title || "—")}</b>
          <span class="ep-meta"><span class="ep-st${!p.hasText ? " todo" : done(p) ? " ok" : ""}">${h(status)}</span> · ${h(when)}${late ? ` · <em>${h(t("epLateM"))}</em>` : ""}</span></span>
          <span class="ep-go">${cur ? h(t("epOpenNow")) : "›"}</span></button>
        <div class="ep-tools">${tools}<button type="button" class="small linkish sr-del" data-srdel="${h(p.id)}">${h(t("srDel"))}</button></div></li>`;
    };
    const addForm = G.epAdding
      ? `<div class="ep-add"><div class="field"><label for="${cid}-t">${h(t("epAbout"))}</label><input id="${cid}-t" placeholder="${h(t("srNewPh"))}" maxlength="100"></div>
          <div class="field"><label for="${cid}-d">${h(t("epDay"))}</label><input id="${cid}-d" type="date" value="${h(nextFreeDate())}"><span class="hint" id="${cid}-dh">${h(longDay(nextFreeDate()))}</span></div>
          <div class="actions"><button type="button" class="small primary" id="${cid}-p">${h(t("epAddBtn"))}</button><button type="button" class="small" id="${cid}-x">${h(t("epCancel"))}</button></div></div>`
      : `<button type="button" class="small ep-addbtn" id="${cid}-a">${h(t("epAdd"))}</button>`;
    el.innerHTML = `${head}<p class="lead">${h(G.prods.length ? t("srLead") : t("epEmpty"))}</p>
      ${active.length ? `<ul class="ep-list">${active.map(row).join("")}</ul>` : ""}
      ${past.length ? `<button type="button" class="small linkish" id="${cid}-past">${h(G.epPast ? t("epPastHide") : t("epPast")(past.length))}</button>${G.epPast ? `<ul class="ep-list ep-pastlist">${past.map(row).join("")}</ul>` : ""}` : ""}
      ${addForm}
      ${G.prods.length ? `<div class="sr-clear"><button type="button" class="small linkish sr-del" id="${cid}-delall">${h(t("srDelAll")(G.prods.length))}</button></div>` : ""}`;
    const q = (s) => el.querySelector(s);
    // Deleting asks first, right where the button was, and only removes episodes (nothing else).
    const askDel = (box, msg, onYes) => { box.innerHTML = `<span class="sr-q">${h(msg)}</span><button type="button" class="small danger" data-y>${h(t("srDelYes"))}</button><button type="button" class="small" data-n>${h(t("srDelNo"))}</button>`; box.querySelector("[data-n]").addEventListener("click", () => renderSeriesAll()); box.querySelector("[data-y]").addEventListener("click", async (e) => { e.target.disabled = true; await onYes(); }); };
    el.querySelectorAll("[data-srdel]").forEach((b) => b.addEventListener("click", () => { const p = G.prods.find((x) => x.id === b.dataset.srdel); askDel(b.closest(".ep-tools"), t("srDelQ")(p ? p.title || "—" : "—"), () => deleteProds([b.dataset.srdel])); }));
    if (q(`#${cid}-delall`)) q(`#${cid}-delall`).addEventListener("click", () => askDel(q(`#${cid}-delall`).closest(".sr-clear"), t("srDelAllQ")(G.prods.length), () => deleteProds(G.prods.map((x) => x.id))));
    if (q(`#${cid}-a`)) q(`#${cid}-a`).addEventListener("click", () => { G.epAdding = true; renderSeriesAll(); const i = $(`${cid}-t`); if (i) i.focus(); });
    if (q(`#${cid}-x`)) q(`#${cid}-x`).addEventListener("click", () => { G.epAdding = false; renderSeriesAll(); });
    if (q(`#${cid}-d`)) q(`#${cid}-d`).addEventListener("change", (e) => { q(`#${cid}-dh`).textContent = e.target.value ? longDay(e.target.value) : ""; });
    if (q(`#${cid}-p`)) q(`#${cid}-p`).addEventListener("click", async (e) => {
      const ti = q(`#${cid}-t`).value.trim();
      if (!ti) { q(`#${cid}-t`).focus(); return; }
      e.target.disabled = true; G.epAdding = false;
      await planEpisode(capFirst(ti), q(`#${cid}-d`).value);
    });
    if (q(`#${cid}-past`)) q(`#${cid}-past`).addEventListener("click", () => { G.epPast = !G.epPast; renderSeriesAll(); });
    el.querySelectorAll("[data-sropen]").forEach((b) => b.addEventListener("click", async () => { b.disabled = true; closeEpSheet(); await openFromSeries(b.dataset.sropen); }));
    el.querySelectorAll("[data-sredit]").forEach((b) => b.addEventListener("click", () => { G.epEdit = b.dataset.sredit; renderSeriesAll(); }));
    el.querySelectorAll("[data-srcancel]").forEach((b) => b.addEventListener("click", () => { G.epEdit = ""; renderSeriesAll(); }));
    el.querySelectorAll("[data-srsave]").forEach((b) => b.addEventListener("click", () => { const i = el.querySelector(`[data-srdate="${b.dataset.srsave}"]`); G.epEdit = ""; setPubDate(b.dataset.srsave, i.value); }));
    el.querySelectorAll("[data-srnext]").forEach((b) => b.addEventListener("click", async () => { const p = G.prods.find((x) => x.id === b.dataset.srnext); b.disabled = true; await planEpisode(capFirst(p.nextEp), p.pubDate ? addDays(p.pubDate, 7) : nextFreeDate()); }));
  });
};
const _renderSeriesAllE = renderSeriesAll;
renderSeriesAll = function () {
  _renderSeriesAllE();
  if ($("epList")) renderSeries("epList");
  renderEpStrip(); renderNextPlan();
};

// ---------- the sheet ----------
function openEpSheet() {
  let d = $("epSheet");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "epSheet"; d.className = "ep-sheet";
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target === d) closeEpSheet(); });
    d.addEventListener("close", () => { G.epAdding = false; G.epEdit = ""; });
  }
  d.innerHTML = `<div class="ep-sheet-in"><button type="button" class="ep-x" id="epX" aria-label="${h(t("epClose"))}">×</button><section id="epList"></section>
    <details class="ep-bk"><summary>${h(t("epBackup"))}</summary><div id="epBackup"></div></details></div>`;
  $("epX").addEventListener("click", closeEpSheet);
  renderSeries("epList"); renderBackup("epBackup");
  if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
  loadProds();
}
function closeEpSheet() { const d = $("epSheet"); if (d && d.open) { try { d.close(); } catch (e) { d.removeAttribute("open"); } } }

// ---------- one line on top of every step: which episode is open ----------
function renderEpStrip() {
  const el = $("epStrip");
  if (!el) return;
  caps.db.then((db) => {
    if (!db || !el.isConnected) { el.innerHTML = ""; return; }
    const p = G.prods.find((x) => x.id === G.prodId);
    const title = $("title").value.trim() || (typeof autoTitle === "function" && autoTitle($("script").value)) || (p && p.title) || t("epNew");
    // Starting fresh while a planned episode waits: offer it, so Juan doesn't make a duplicate.
    const today = isoToday();
    const waiting = !G.prodId && !$("script").value.trim() && G.prods.filter((x) => !x.hasText && x.status !== "grabado" && (!x.pubDate || x.pubDate >= today)).sort((a, b) => (a.pubDate || "9").localeCompare(b.pubDate || "9"))[0];
    el.hidden = !!(typeof DEMO !== "undefined" && DEMO);
    el.innerHTML = `<span class="ep-s-t"><b>${h(title)}</b><span class="hint"> · ${h(G.pubDate ? t("epOut")(fmtDay(G.pubDate)) : t("epNoDate"))}</span></span><button type="button" class="small linkish" id="epBtn">${h(t("epBtn"))}</button>
      ${waiting ? `<p class="ep-wait">${h(t("epPlanned")(waiting.title, waiting.pubDate ? fmtDay(waiting.pubDate) : ""))} <button type="button" class="small primary" id="epWrite">${h(t("epWriteIt"))}</button></p>` : ""}`;
    $("epBtn").addEventListener("click", openEpSheet);
    if ($("epWrite")) $("epWrite").addEventListener("click", (e) => { e.target.disabled = true; openFromSeries(waiting.id); });
  });
}
const _renderGuideE = renderGuide;
renderGuide = function () {
  _renderGuideE();
  if (!V.guided) return;
  const top = $("guideTop");
  if (top && !$("epStrip")) { const s = document.createElement("div"); s.id = "epStrip"; s.className = "ep-strip"; top.prepend(s); }
  renderEpStrip();
  if (V.step === 5) renderNextPlan();
};

// ---------- step 5: plan the next one right after recording ----------
function renderNextPlan() {
  const el = $("gNextPlan");
  if (!el) return;
  caps.db.then((db) => {
    if (!el.isConnected) return;
    if (!db) { el.innerHTML = ""; el.hidden = true; return; }
    const next = (G.nextEp || "").trim();
    const planned = next && G.prods.find((p) => p.id !== G.prodId && norm(p.title) === norm(next));
    const head = `<header class="g-h"><h2>${h(t("npTitle"))}</h2></header>`;
    if (planned) {
      el.innerHTML = `${head}<p class="status ok">${h(t("npDone")(planned.title, planned.pubDate ? fmtDay(planned.pubDate) : t("srNoDate")))}</p>
        <div class="actions"><button type="button" class="small primary" id="npOpen">${h(t("npOpen"))}</button><button type="button" class="small" id="npAll">${h(t("npAll"))}</button></div>`;
      $("npOpen").addEventListener("click", () => openFromSeries(planned.id));
      $("npAll").addEventListener("click", openEpSheet);
      return;
    }
    const date = G.pubDate ? addDays(G.pubDate, 7) : nextFreeDate();
    el.innerHTML = `${head}<p class="lead">${h(next ? t("npLeadNext")(next) : t("npLead"))}</p>
      <div class="np-fields"><div class="field"><label for="npT">${h(t("epAbout"))}</label><textarea id="npT" rows="1" data-one="1" maxlength="100" placeholder="${h(t("srNewPh"))}">${h(capFirst(next))}</textarea></div>
      <div class="field"><label for="npD">${h(t("epDay"))}</label><input id="npD" type="date" value="${h(date)}"><span class="hint" id="npDh">${h(t("npDateHint")(longDay(date)))}</span></div></div>
      <div class="actions"><button type="button" class="primary small" id="npGo">${h(t("npGo"))}</button><button type="button" class="small linkish" id="npAll">${h(t("npAll"))}</button><span class="status" id="npSt"></span></div>`;
    $("npD").addEventListener("change", (e) => { $("npDh").textContent = e.target.value ? t("npDateHint")(longDay(e.target.value)) : ""; });
    $("npAll").addEventListener("click", openEpSheet);
    $("npGo").addEventListener("click", async (e) => {
      const ti = $("npT").value.trim();
      if (!ti) { $("npT").focus(); return; }
      e.target.disabled = true;
      if (!next || norm(ti) !== norm(next)) { G.nextEp = ti; markDirty(); }
      await planEpisode(capFirst(ti), $("npD").value);
    });
  });
}
const _gOnLangE = gOnLang;
gOnLang = function () { _gOnLangE.apply(this, arguments); if ($("epSheet") && $("epSheet").open) openEpSheet(); };
(function () { let tm = null; $("script").addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { if ($("epWrite") && $("script").value.trim()) renderEpStrip(); }, 400); }); })();
