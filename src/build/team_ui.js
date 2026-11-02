/* ===== Equipo: Adrian lee los episodios de Juan (solo lectura) y le deja notas; Juan las ve y las marca como hechas ===== */
// (Adrian, 2026-11-01: "B": "support Juan in the review of his episodes" / "see Juan's texts but not mess with them")
// The server enforces it (sd_docs: every member reads every row, only its owner writes or deletes it; owner set by a trigger).
// Here: «Mis episodios» lists only my rows, «Episodios del equipo» lists the others' with «Ver» (a sheet that never loads the
// episode into the editor, so no autosave can touch it), notes live in their own collection `notas` (one row per note, owned
// by its author), and the reader's «Hecho» goes into the reader's own episode as `teamNotesDone` (ids).
// Standalone site only: without a signed-in user id (Claude artifact, demo) everything is "mine", as before.
Object.assign(T.es, {
  tmTitle: "Episodios del equipo", tmView: "Ver", tmBy: (n) => `de ${n}`,
  tmRO: (n) => `Solo lectura: lo que escribas aquí son notas para ${n}; su guion no cambia.`,
  tmNotes: (n) => `Notas (${n})`, tmNoNotes: "Aún no hay notas.", tmAddFor: (n, p) => `Tu nota para ${n} sobre el párrafo ${p}`, tmAddGen: (n) => `Tu nota general para ${n}`,
  tmGeneral: "Nota general", tmGenShort: "General", tmSave: "Guardar nota", tmCancel: "Cancelar", tmDel: "Borrar", tmDelQ: "¿Borrar esta nota?", tmDelYes: "Sí, borrar",
  tmSaveFail: "No se pudo guardar la nota.", tmDelFail: "No se pudo borrar la nota.", tmLoadFail: "No se pudieron cargar las notas.", tmOpenFail: "No se pudo abrir el episodio.",
  tmCopy: "Abrir una copia", tmCopyOf: (x) => `Copia de ${x}`, tmCopyFail: "No se pudo crear la copia.", tmClose: "Cerrar", tmSaved: (d) => `guardado ${d}`,
  tmChip: (n, k) => `Notas de ${n} · ${k} sin revisar`, tmChipAll: (n) => `Notas de ${n}`, tmGo: "Ir al párrafo", tmDone: "Hecho", tmUndo: "Deshacer", tmIsDone: "Hecho",
  tmPara: (p) => `¶${p}`, tmAddPara: (p) => `Añadir una nota al párrafo ${p}`, tmEditor: "Editor", tmNoText: "Este episodio aún no tiene texto.",
});
Object.assign(T.en, {
  tmTitle: "Team episodes", tmView: "View", tmBy: (n) => `by ${n}`,
  tmRO: (n) => `Read only: what you write here are notes for ${n}; their script doesn't change.`,
  tmNotes: (n) => `Notes (${n})`, tmNoNotes: "No notes yet.", tmAddFor: (n, p) => `Your note for ${n} on paragraph ${p}`, tmAddGen: (n) => `Your general note for ${n}`,
  tmGeneral: "General note", tmGenShort: "General", tmSave: "Save note", tmCancel: "Cancel", tmDel: "Delete", tmDelQ: "Delete this note?", tmDelYes: "Yes, delete",
  tmSaveFail: "Couldn't save the note.", tmDelFail: "Couldn't delete the note.", tmLoadFail: "Couldn't load the notes.", tmOpenFail: "Couldn't open the episode.",
  tmCopy: "Open a copy", tmCopyOf: (x) => `Copy of ${x}`, tmCopyFail: "Couldn't create the copy.", tmClose: "Close", tmSaved: (d) => `saved ${d}`,
  tmChip: (n, k) => `Notes from ${n} · ${k} to review`, tmChipAll: (n) => `Notes from ${n}`, tmGo: "Go to paragraph", tmDone: "Done", tmUndo: "Undo", tmIsDone: "Done",
  tmPara: (p) => `¶${p}`, tmAddPara: (p) => `Add a note to paragraph ${p}`, tmEditor: "Editor", tmNoText: "This episode has no text yet.",
});

const TEAM = { uid: null, email: "", names: {}, prods: [], notes: [], notesErr: false, view: null };
Object.assign(G, { teamNotesDone: [] });
const tmMine = (owner) => !owner || !TEAM.uid || owner === TEAM.uid;
const tmName = (email) => (email && TEAM.names[email]) || (email ? email.split("@")[0] : "—");
const tmParas = (text) => String(text || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
const tmWhen = (ms) => (ms ? new Date(ms).toLocaleString(UI, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
let PACE_DOC_TEAM = null; // per-person rehearsal pace (two people no longer overwrite one shared «ajustes/ritmo»)

// Who am I, and the team's names (sd_team is readable by members). Best effort: without them the lists use the email.
(async () => {
  if (!window.__sdAuth) return;
  try {
    const a = await window.__sdAuth;
    if (!a || !a.member || !a.uid) return;
    TEAM.uid = a.uid; TEAM.email = (a.email || "").toLowerCase(); PACE_DOC_TEAM = "ajustes/ritmo-" + a.uid;
    if (window.__sb) { const r = await window.__sb.from("sd_team").select("email,name"); for (const x of (r && r.data) || []) TEAM.names[String(x.email).toLowerCase()] = x.name || x.email; }
  } catch (e) { /* best effort: names fall back to the email's first part; ownership still comes from the rows */ }
  if (typeof loadProds === "function") loadProds();
  if (typeof renderAuthBar === "function") renderAuthBar(); // the header shows the team name once it is known
})();

// ---------- the lists: mine vs the team's ----------
const tmRow = (d) => { const x = d.data() || {}; return { id: d.id, title: x.title || "", status: x.status || "borrador", updatedAt: x.updatedAt || 0, pubDate: x.pubDate || "", nextEp: x.nextEp || "", hasText: !!(x.text && x.text.trim()), owner: d.owner || null, ownerEmail: d.ownerEmail || "" }; };
loadProds = async function () {
  const db = await caps.db;
  if (!db) return;
  try {
    const q = await db.collection("producciones").orderBy("updatedAt", "desc").limit(200).get();
    const rows = q.docs.map(tmRow);
    G.prods = rows.filter((p) => tmMine(p.owner));
    TEAM.prods = rows.filter((p) => !tmMine(p.owner));
    G.loadErr.prods = false; G.srMsg = "";
    if (G.mode === "guion" && !V.guided) renderProdBar();
    renderSeriesAll();
  } catch (e) { G.loadErr.prods = true; renderSeriesAll(); }
};
function renderTeamList() {
  const el = $("epTeam");
  if (!el) return;
  if (!TEAM.uid || !TEAM.prods.length) { el.innerHTML = ""; el.hidden = true; return; }
  el.hidden = false;
  const rows = [...TEAM.prods].sort((a, b) => b.updatedAt - a.updatedAt).map((p) => {
    const status = !p.hasText ? t("epNoText") : t("status")[p.status] || p.status;
    return `<li class="ep-row tm-row"><div class="ep-open tm-open"><span class="ep-main"><b>${h(p.title || "—")}</b>
      <span class="ep-meta">${h(t("tmBy")(tmName(p.ownerEmail)))} · <span class="ep-st${!p.hasText ? " todo" : p.status === "grabado" ? " ok" : ""}">${h(status)}</span> · ${h(tmWhen(p.updatedAt))}</span></span>
      <button type="button" class="small" data-tmview="${h(p.id)}">${h(t("tmView"))}</button></div></li>`;
  }).join("");
  el.innerHTML = `<header class="g-h"><h2>${h(t("tmTitle"))}</h2></header><ul class="ep-list">${rows}</ul>`;
  el.querySelectorAll("[data-tmview]").forEach((b) => b.addEventListener("click", () => openTeamView(b.dataset.tmview)));
}
const _openEpSheetTm = openEpSheet;
openEpSheet = function () {
  _openEpSheetTm();
  const list = $("epList");
  if (list && !$("epTeam")) { const s = document.createElement("section"); s.id = "epTeam"; s.className = "tm-list"; list.after(s); }
  renderTeamList();
};
const _renderSeriesAllTm = renderSeriesAll;
renderSeriesAll = function () { _renderSeriesAllTm(); renderTeamList(); };

// ---------- the viewer (someone else's episode, read only) ----------
async function tmLoadNotes(prodId) {
  const db = await caps.db;
  if (!db || !prodId) return [];
  const q = await db.collection("notas").where("prodId", "==", prodId).get();
  return q.docs.map((d) => ({ id: d.id, ...(d.data() || {}), owner: d.owner || null, ownerEmail: d.ownerEmail || "" })).sort((a, b) => (a.para || 0) - (b.para || 0) || (a.at || 0) - (b.at || 0));
}
async function openTeamView(id) {
  const db = await caps.db;
  if (!db) return;
  TEAM.view = { id, d: null, notes: [], err: "", adding: null, msg: "" };
  tmViewSheet();
  try {
    const s = await db.collection("producciones").doc(id).get();
    if (!s.exists) throw new Error("gone");
    TEAM.view.d = s.data(); TEAM.view.owner = s.owner; TEAM.view.ownerEmail = s.ownerEmail || (TEAM.prods.find((p) => p.id === id) || {}).ownerEmail || "";
  } catch (e) { TEAM.view.err = t("tmOpenFail"); renderTeamView(); return; }
  try { TEAM.view.notes = await tmLoadNotes(id); } catch (e) { TEAM.view.msg = t("tmLoadFail"); }
  renderTeamView();
}
function tmViewSheet() {
  let d = $("tmSheet");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "tmSheet"; d.className = "ep-sheet tm-sheet"; d.setAttribute("aria-labelledby", "tmSheetH");
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target === d) tmCloseView(); });
    d.addEventListener("close", () => { TEAM.view = null; });
  }
  d.innerHTML = `<div class="ep-sheet-in"><p class="hint">…</p></div>`;
  if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
}
function tmCloseView() { const d = $("tmSheet"); if (d && d.open) { try { d.close(); } catch (e) { d.removeAttribute("open"); } } TEAM.view = null; }
function tmReportLine(rp) {
  if (!rp || !rp.areas) return "";
  const dots = (n) => "●".repeat(n) + "○".repeat(5 - n);
  const parts = REPORT_AREAS.filter((k) => rp.areas[k] && Number.isInteger(rp.areas[k].rating)).map((k) => `${t("rpArea")[k]} <span aria-label="${rp.areas[k].rating} / 5">${dots(rp.areas[k].rating)}</span>`);
  return parts.length ? `<p class="tm-rep"><b>${h(t("tmEditor"))}:</b> ${parts.join(" · ")}</p>` : "";
}
function tmNoteHTML(n, opts) {
  const mine = tmMine(n.owner), done = (opts.done || []).includes(n.id);
  const where = n.para ? `${h(t("tmPara")(n.para))}${n.quote ? ` «${h(n.quote)}…»` : ""}` : h(t("tmGenShort"));
  const acts = [];
  if (opts.go && n.para) acts.push(`<button type="button" class="small" data-tmgo="${h(n.id)}">${h(t("tmGo"))}</button>`);
  if (opts.tick) acts.push(done ? `<span class="tm-done">✓ ${h(t("tmIsDone"))}</span><button type="button" class="small linkish" data-tmundo="${h(n.id)}">${h(t("tmUndo"))}</button>` : `<button type="button" class="small primary" data-tmdone="${h(n.id)}">${h(t("tmDone"))}</button>`);
  else if (done) acts.push(`<span class="tm-done">✓ ${h(t("tmIsDone"))}</span>`);
  if (opts.del && mine) acts.push(`<button type="button" class="small linkish sr-del" data-tmdel="${h(n.id)}">${h(t("tmDel"))}</button>`);
  return `<li class="tm-note${done ? " is-done" : ""}" data-note="${h(n.id)}"><span class="tm-where">${where}</span><p>${h(n.text || "")}</p>
    <span class="tm-meta">${h(tmName(n.ownerEmail))} · ${h(tmWhen(n.at))}</span><span class="tm-acts">${acts.join("")}</span></li>`;
}
function renderTeamView() {
  const d = $("tmSheet"), v = TEAM.view;
  if (!d || !v) return;
  const who = tmName(v.ownerEmail);
  const x = v.d || {};
  const head = `<button type="button" class="ep-x" id="tmX" aria-label="${h(t("tmClose"))}">×</button>`;
  if (v.err) { d.innerHTML = `<div class="ep-sheet-in">${head}<p class="status err" role="alert">${h(v.err)}</p></div>`; $("tmX").addEventListener("click", tmCloseView); return; }
  const paras = tmParas(x.text);
  const status = t("status")[x.status] || x.status || "";
  const form = (p) => `<div class="tm-add"><label for="tmTxt">${h(p ? t("tmAddFor")(who, p) : t("tmAddGen")(who))}</label><textarea id="tmTxt" rows="3" maxlength="1000"></textarea>
    <div class="actions"><button type="button" class="small primary" id="tmSave">${h(t("tmSave"))}</button><button type="button" class="small" id="tmCancel">${h(t("tmCancel"))}</button></div></div>`;
  const body = paras.length
    ? `<ol class="tm-paras">${paras.map((p, i) => `<li data-p="${i + 1}"><span class="tm-n" aria-hidden="true">${i + 1}</span><p>${h(p)}</p><button type="button" class="small linkish tm-plus" data-tmadd="${i + 1}" aria-label="${h(t("tmAddPara")(i + 1))}" title="${h(t("tmAddPara")(i + 1))}">+</button>${v.adding === i + 1 ? form(i + 1) : ""}</li>`).join("")}</ol>`
    : `<p class="hint">${h(t("tmNoText"))}</p>`;
  const done = Array.isArray(x.teamNotesDone) ? x.teamNotesDone : [];
  const notes = v.notes.length ? `<ul class="tm-notes">${v.notes.map((n) => tmNoteHTML(n, { done, del: true })).join("")}</ul>` : `<p class="hint">${h(t("tmNoNotes"))}</p>`;
  d.innerHTML = `<div class="ep-sheet-in tm-in">${head}
    <h2 id="tmSheetH" class="tm-h">${h(x.title || "—")}</h2>
    <p class="hint">${h(t("tmBy")(who))} · ${h(status)} · ${h(t("tmSaved")(tmWhen(x.updatedAt)))}</p>
    <p class="status tm-ro">${h(t("tmRO")(who))}</p>
    ${tmReportLine(x.report)}
    ${v.msg ? `<p class="status err" role="alert">${h(v.msg)}</p>` : ""}
    <div class="tm-grid"><div class="tm-text">${body}</div>
      <aside class="tm-side" aria-label="${h(t("tmNotes")(v.notes.length))}"><h3>${h(t("tmNotes")(v.notes.length))}</h3>${notes}
        ${v.adding === 0 ? form(0) : `<button type="button" class="small" data-tmadd="0">${h(t("tmGeneral"))}</button>`}</aside></div>
    <div class="actions tm-foot"><button type="button" class="small" id="tmCopy">${h(t("tmCopy"))}</button><button type="button" class="small" id="tmClose2">${h(t("tmClose"))}</button></div></div>`;
  $("tmX").addEventListener("click", tmCloseView); $("tmClose2").addEventListener("click", tmCloseView);
  d.querySelectorAll("[data-tmadd]").forEach((b) => b.addEventListener("click", () => { v.adding = Number(b.dataset.tmadd); v.msg = ""; renderTeamView(); const ta = $("tmTxt"); if (ta) ta.focus(); }));
  if ($("tmCancel")) $("tmCancel").addEventListener("click", () => { v.adding = null; renderTeamView(); });
  if ($("tmSave")) $("tmSave").addEventListener("click", async (e) => {
    const txt = $("tmTxt").value.trim();
    if (!txt) { $("tmTxt").focus(); return; }
    e.target.disabled = true;
    const para = v.adding || 0;
    try {
      const db = await caps.db;
      await db.collection("notas").add({ prodId: v.id, para, quote: para ? (paras[para - 1] || "").slice(0, 60) : "", text: txt, at: Date.now() });
      v.adding = null; v.msg = "";
      v.notes = await tmLoadNotes(v.id);
    } catch (err) { v.msg = t("tmSaveFail"); e.target.disabled = false; renderTeamView(); $("tmTxt") && ($("tmTxt").value = txt); return; }
    renderTeamView();
  });
  d.querySelectorAll("[data-tmdel]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".tm-acts");
    box.innerHTML = `<span class="sr-q">${h(t("tmDelQ"))}</span><button type="button" class="small danger" data-y>${h(t("tmDelYes"))}</button><button type="button" class="small" data-n>${h(t("tmCancel"))}</button>`;
    box.querySelector("[data-n]").addEventListener("click", renderTeamView);
    box.querySelector("[data-y]").addEventListener("click", async (e) => {
      e.target.disabled = true;
      try { const db = await caps.db; await db.collection("notas").doc(b.dataset.tmdel).delete(); v.notes = await tmLoadNotes(v.id); v.msg = ""; } catch (err) { v.msg = t("tmDelFail"); }
      renderTeamView();
    });
  }));
  $("tmCopy").addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      const db = await caps.db, now = Date.now();
      const body = JSON.parse(JSON.stringify(x));
      delete body.teamNotesDone;
      Object.assign(body, { title: t("tmCopyOf")(x.title || "—"), status: "borrador", pubDate: "", updatedAt: now, updatedBy: G.sid });
      const ref = await db.collection("producciones").add(body);
      tmCloseView();
      if (typeof closeEpSheet === "function") closeEpSheet();
      await openFromSeries(ref.id);
      loadProds();
    } catch (err) { v.msg = t("tmCopyFail"); renderTeamView(); }
  });
}

// ---------- the author's side: notes from the others on my open episode ----------
const _prodBodyTm = prodBody;
prodBody = function (now) { const b = _prodBodyTm(now); if (G.teamNotesDone && G.teamNotesDone.length) b.teamNotesDone = [...G.teamNotesDone]; return b; };
const _applyProdTm = applyProd;
applyProd = function (id, d) {
  _applyProdTm(id, d);
  G.teamNotesDone = Array.isArray(d && d.teamNotesDone) ? d.teamNotesDone.filter((x) => typeof x === "string") : [];
  TEAM.notes = []; TEAM.notesErr = false;
  if (id && TEAM.uid) tmLoadMyNotes(id);
  else renderEpStrip();
};
async function tmLoadMyNotes(id) {
  try {
    const all = await tmLoadNotes(id);
    if (G.prodId !== id) return; // another episode was opened meanwhile
    TEAM.notes = all.filter((n) => !tmMine(n.owner)); TEAM.notesErr = false;
  } catch (e) { TEAM.notesErr = true; }
  renderEpStrip();
}
function tmChipHTML() {
  if (!TEAM.uid || !G.prodId || !TEAM.notes.length) return "";
  const from = tmName(TEAM.notes[0].ownerEmail);
  const open = TEAM.notes.filter((n) => !G.teamNotesDone.includes(n.id)).length;
  return `<button type="button" class="small tm-chip${open ? " has-open" : ""}" id="tmChip">${h(open ? t("tmChip")(from, open) : t("tmChipAll")(from))}</button>`;
}
const _renderEpStripTm = renderEpStrip;
renderEpStrip = function () {
  _renderEpStripTm();
  caps.db.then(() => {
    const el = $("epStrip");
    if (!el) return;
    const old = $("tmChip"); if (old) old.remove();
    const html = tmChipHTML();
    if (!html) return;
    const btn = $("epBtn");
    if (btn) btn.insertAdjacentHTML("afterend", html); else el.insertAdjacentHTML("beforeend", html);
    $("tmChip").addEventListener("click", openMyNotes);
  });
};
function openMyNotes() {
  let d = $("tmMine");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "tmMine"; d.className = "ep-sheet tm-sheet"; d.setAttribute("aria-labelledby", "tmMineH");
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target === d) tmCloseMine(); });
  }
  renderMyNotes();
  if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
}
function tmCloseMine() { const d = $("tmMine"); if (d && d.open) { try { d.close(); } catch (e) { d.removeAttribute("open"); } } }
function renderMyNotes() {
  const d = $("tmMine");
  if (!d) return;
  const from = TEAM.notes.length ? tmName(TEAM.notes[0].ownerEmail) : "";
  d.innerHTML = `<div class="ep-sheet-in"><button type="button" class="ep-x" id="tmMX" aria-label="${h(t("tmClose"))}">×</button>
    <h2 id="tmMineH" class="tm-h">${h(t("tmChipAll")(from))}</h2>
    ${TEAM.notesErr ? `<p class="status err" role="alert">${h(t("tmLoadFail"))}</p>` : ""}
    ${TEAM.notes.length ? `<ul class="tm-notes">${TEAM.notes.map((n) => tmNoteHTML(n, { done: G.teamNotesDone, go: true, tick: true })).join("")}</ul>` : `<p class="hint">${h(t("tmNoNotes"))}</p>`}</div>`;
  $("tmMX").addEventListener("click", tmCloseMine);
  const toggle = (id, on) => { G.teamNotesDone = on ? [...new Set([...G.teamNotesDone, id])] : G.teamNotesDone.filter((x) => x !== id); markDirty(); renderMyNotes(); renderEpStrip(); };
  d.querySelectorAll("[data-tmdone]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.tmdone, true)));
  d.querySelectorAll("[data-tmundo]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.tmundo, false)));
  d.querySelectorAll("[data-tmgo]").forEach((b) => b.addEventListener("click", () => {
    const n = TEAM.notes.find((x) => x.id === b.dataset.tmgo);
    tmCloseMine();
    if (n && n.quote) edScrollToText(n.quote);
  }));
}
