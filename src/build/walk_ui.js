/* ===== Revisión por párrafos: los problemas se pintan en el guion y se recorren de uno en uno ===== */
// After "Revisar guion" the script itself shows what the app found: red words can cost ads, yellow ones are tweaks, struck-through
// text is what the proposed fix would remove. The panel walks the script paragraph by paragraph; tapping a card or a score row
// scrolls the script to that spot with the text before and after it in view.
// Highlights use the CSS Custom Highlight API, which paints over the text without touching the editor's DOM (so typing, undo and
// saving are unaffected). Browsers without it still get the paragraph accent and the scrolling.
Object.assign(T.es, {
  wkTitle: "Revisión por párrafos", wkDoneN: (n) => (n === 1 ? "1 aplicada" : `${n} aplicadas`), wkSkipN: (n) => (n === 1 ? "1 ignorada" : `${n} ignoradas`), wkOf: (i, n) => `Párrafo ${i} de ${n}`, wkHere: (n) => (n === 1 ? "1 revisión" : `${n} revisiones`),
  wkPos: (k, m) => `${k} de ${m} con revisiones`, wkPrev: "Anterior", wkNext: "Siguiente", wkDone: "Listo: pasar a Preparar", wkTickN: (i, n) => (n ? `Párrafo ${i}: ${n} revisiones` : `Párrafo ${i}: sin revisiones`),
  wkClean: "Este párrafo está bien. Sigue con el siguiente.", wkGlobal: "Título, miniatura y descripción", wkGlobalSub: "Estas revisiones no están dentro del guion.",
  wkPartial: (n, m) => `Cambia ${n} en este párrafo; quedan ${m} en otros.`, wkLoc: "Ver en el guion", wkSuffix: " (este párrafo)",
  wkEnd: "Terminaste el recorrido del guion.",
  cat_hi: "Puede quitar anuncios", cat_mid: "Puede limitar anuncios", cat_cut: "Se quitaría", cat_fill: "Muletillas y relleno", cat_pol: "Para pulir",
  cat_hi_t: "Rojo: puede quitar los anuncios del video.", cat_mid_t: "Naranja: puede limitar los anuncios.", cat_cut_t: "Tachado: lo que borraría el arreglo propuesto.", cat_fill_t: "Morado: muletillas y palabras de relleno.", cat_pol_t: "Azul ondulado: palabra genérica, regional o que suena generada.", catShow: "Mostrar", catHide: "Ocultar",
});
Object.assign(T.en, {
  wkTitle: "Paragraph-by-paragraph review", wkDoneN: (n) => `${n} applied`, wkSkipN: (n) => `${n} ignored`, wkOf: (i, n) => `Paragraph ${i} of ${n}`, wkHere: (n) => (n === 1 ? "1 check" : `${n} checks`),
  wkPos: (k, m) => `${k} of ${m} with checks`, wkPrev: "Previous", wkNext: "Next", wkDone: "Done: go to Prepare", wkTickN: (i, n) => (n ? `Paragraph ${i}: ${n} checks` : `Paragraph ${i}: no checks`),
  wkClean: "This paragraph is fine. Move on to the next.", wkGlobal: "Title, thumbnail and description", wkGlobalSub: "These checks aren't inside the script.",
  wkPartial: (n, m) => `Changes ${n} in this paragraph; ${m} remain in others.`, wkLoc: "Show in the script", wkSuffix: " (this paragraph)",
  wkEnd: "You've been through the whole script.",
  cat_hi: "Can remove ads", cat_mid: "Can limit ads", cat_cut: "Would be removed", cat_fill: "Fillers", cat_pol: "To polish",
  cat_hi_t: "Red: can remove ads from the video.", cat_mid_t: "Orange: can limit ads.", cat_cut_t: "Struck through: what the proposed fix would delete.", cat_fill_t: "Purple: filler words.", cat_pol_t: "Blue wavy: generic, regional or generated-sounding word.", catShow: "Show", catHide: "Hide",
});

const WK = { i: -1, key: "", R: null, map: [], blocks: [], per: [], glob: [], list: [], ranges: null, pending: false, flashT: 0, ok: false };
const wkReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wkHL = () => (typeof CSS !== "undefined" && CSS.highlights && typeof Highlight === "function" ? CSS.highlights : null);
const WK_FAMS = ["hi", "mid", "fill", "pol"];
const WK_NAMES = [...WK_FAMS.map((f) => "sd-w-" + f), ...WK_FAMS.map((f) => "sd-u-" + f), "sd-del", "sd-quote", "sd-flash"];
// families the person switched off from the legend (kept on this device only)
const CATOFF = new Set();
try { JSON.parse(localStorage.getItem("sd-cats-off") || "[]").forEach((x) => CATOFF.add(x)); } catch (e) {}
function catApplyOff() {
  CATS.forEach((c) => document.documentElement.classList.toggle("cat-off-" + c.id, CATOFF.has(c.id)));
  try { localStorage.setItem("sd-cats-off", JSON.stringify([...CATOFF])); } catch (e) {}
}
catApplyOff();
function catCounts() {
  const n = { hi: 0, mid: 0, fill: 0, pol: 0, cut: 0 };
  if (!WK.ok) return n;
  for (const g of WK.per) for (const { card, evs } of g) n[catOfCard(card)] += evs.length;
  // "cut" = deletions the fixes shown for this paragraph would make
  (state.fixCards || []).forEach((c, ci) => {
    const p = c.proposals[Math.min(state.fixSel[ci] || 0, Math.max(0, c.proposals.length - 1))];
    if (p && p.kind === "patch") for (const x of p.patches) if (x.end > x.start) n.cut++;
  });
  return n;
}
// legend chips double as filters: tap one to hide or show that family in the script
function catLegendHTML(interactive, counts) {
  const c = interactive ? counts || null : null;
  return `<div class="cat-legend" role="group">` + CATS.map((f) => {
    const off = CATOFF.has(f.id), n = c ? c[f.id] : null;
    const inner = `<i class="cat-sw cat-${f.id}" aria-hidden="true"><b>Aa</b></i><span>${h(t("cat_" + f.id))}</span>${n != null ? `<em>${n}</em>` : ""}`;
    return interactive
      ? `<button type="button" class="cat-chip${off ? " off" : ""}" data-cat="${f.id}" aria-pressed="${off ? "false" : "true"}" title="${h(t("cat_" + f.id + "_t"))}">${inner}</button>`
      : `<span class="cat-chip static" title="${h(t("cat_" + f.id + "_t"))}">${inner}</span>`;
  }).join("") + (interactive && typeof railChipsHTML === "function" ? railChipsHTML() : "") + `</div>`;
}


function wkClearPaint() {
  const hl = wkHL();
  if (hl) WK_NAMES.forEach((n) => hl.delete(n));
  if (ED.el) ED.el.querySelectorAll(".walk-on").forEach((e) => e.classList.remove("walk-on"));
}
function wkInvalidate() { WK.key = ""; WK.R = null; WK.ranges = null; WK.ok = false; wkClearPaint(); if (typeof railClear === "function") railClear(); }

// Where each text node of the editor sits in the script text (the editor drops "## ", list markers and line breaks).
function wkNodes(text) {
  const out = [];
  const tw = document.createTreeWalker(ED.el, NodeFilter.SHOW_TEXT);
  let cur = 0, n;
  while ((n = tw.nextNode())) {
    const d = n.data;
    if (!d) continue;
    const i = text.indexOf(d, cur);
    if (i < 0) continue;
    out.push({ n, s: i, e: i + d.length });
    cur = i + d.length;
  }
  return out;
}
function wkBlocksOf(map) {
  const out = [];
  ED.el.querySelectorAll(":scope > p, :scope > h2, :scope > ul > li, :scope > ol > li").forEach((el) => {
    const ms = map.filter((m) => el.contains(m.n));
    if (ms.length) out.push({ el, s: ms[0].s, e: ms[ms.length - 1].e });
  });
  return out;
}
function wkBlockAt(blocks, pos) {
  for (let i = 0; i < blocks.length; i++) if (pos <= blocks[i].e) return i;
  return blocks.length - 1;
}
function wkRange(a, b) {
  const map = WK.map;
  let sN = null, sO = 0, eN = null, eO = 0;
  for (const m of map) {
    if (sN === null && a < m.e) { sN = m.n; sO = Math.max(0, a - m.s); }
    if (b > m.s) { eN = m.n; eO = Math.min(m.e, b) - m.s; }
  }
  if (!sN || !eN) return null;
  const r = document.createRange();
  try { r.setStart(sN, sO); r.setEnd(eN, eO); } catch (e) { return null; }
  return r.collapsed ? null : r;
}

function wkReady() { return !!(ED.el && state.result && state.text === $("script").value && (SPLIT.on || (V.guided && V.step === 2))); }

function wkBuild() {
  const key = state.text + "|" + [...state.fixDismissed].sort().join(",");
  if (WK.ok && WK.key === key && WK.R === state.result) return true;
  WK.ok = false; WK.ranges = null;
  if (!wkReady()) return false;
  const text = state.text, R = state.result;
  try {
    WK.map = wkNodes(text);
    WK.blocks = wkBlocksOf(WK.map);
    if (!WK.blocks.length) return false;
    const failed = failedRows(R).filter((r) => !state.fixDismissed.has(r.id));
    const cards = buildFixCards(text, R, state.opts, failed, 1e9, Infinity);
    WK.per = WK.blocks.map(() => []);
    WK.glob = [];
    for (const c of cards) {
      if (!c.evidence.length) { WK.glob.push(c); continue; }
      const by = new Map();
      for (const e of c.evidence) { const bi = wkBlockAt(WK.blocks, e.start); if (!by.has(bi)) by.set(bi, []); by.get(bi).push(e); }
      for (const [bi, evs] of by) WK.per[bi].push({ card: c, evs });
    }
    WK.list = WK.per.map((x, i) => (x.length ? i : -1)).filter((i) => i >= 0);
    if (WK.glob.length) WK.list.push(WK.blocks.length);
    WK.key = key; WK.R = R; WK.ok = true;
  } catch (e) { WK.ok = false; return false; }
  return true;
}

// A card's proposal limited to one paragraph (so "remove the fillers" in paragraph 3 doesn't touch paragraph 7).
function wkScope(p, bi, card) {
  if (p.kind !== "patch" || !p.patches || p.patches.length < 2) return p;
  const ps = p.patches.filter((x) => wkBlockAt(WK.blocks, x.start) === bi);
  if (ps.length === p.patches.length) return p;
  if (!ps.length) return null;
  const sp = { ...p, patches: ps, of: p.of || p.patches.length, scoped: true, label: p.label + t("wkSuffix") };
  sp.check = verifyProposal(state.text, state.opts, state.result, sp);
  return sp.check.broke.length ? null : sp;
}
function wkCardsFor(i) {
  if (i >= WK.blocks.length) return WK.glob;
  return WK.per[i].map(({ card, evs }) => {
    const c = { ...card, evidence: evs, more: 0 };
    c.proposals = (card.proposals || []).map((p) => wkScope(p, i, card)).filter(Boolean);
    if (card.ai && card.ai.start != null && !(card.ai.start >= WK.blocks[i].s && card.ai.start <= WK.blocks[i].e)) c.ai = { ...card.ai, start: evs[0].start, end: evs[0].end };
    return c;
  });
}
function wkLogFor(i) {
  return (state.fixLog || []).filter((x) => x.bi === i && (x.kind === "done" || x.ids.every((id) => state.fixDismissed.has(id))));
}
function wkChgHTML(x) {
  const c = x.chg;
  if (!c) return "";
  const e = (v) => (v ? h(v) : `<i>${h(t("fxEmptyChg"))}</i>`);
  return `<div class="fx-chg"><div><span class="fx-chg-l">${h(t("fxBefore"))}</span> ${h(c.pre)}<del>${e(c.from)}</del>${h(c.post)}</div><div><span class="fx-chg-l">${h(t("fxAfter"))}</span> ${h(c.pre)}<ins>${e(c.to)}</ins>${h(c.post)}</div></div>`;
}
function wkLogHTML(i) {
  return wkLogFor(i).map((x) => x.kind === "done"
    ? `<li class="fx fx-done" data-fid="${h(x.id)}"><div class="fx-top" role="button" tabindex="0" aria-expanded="false" title="${h(t("fxShowChange"))}"><span class="fx-st" aria-hidden="true">✓</span><span class="tf-t">${h(x.label)}</span><span class="fx-badge">${h(t("fxDone"))}</span><span class="fx-chev" aria-hidden="true">▾</span></div><div class="fx-body">${x.what ? `<div class="hint">${h(x.what)}</div>` : ""}${x.where === "script" ? wkChgHTML(x) : `<div class="hint">${h(x.where === "cold" ? t("fxOutCold") : t("fxOut")((t("fxField") || {})[x.where] || x.where))}</div>`}</div></li>`
    : `<li class="fx fx-skipped" data-fid="${h(x.id)}"><div class="fx-top"><span class="fx-st" aria-hidden="true">–</span><span class="tf-t">${h(x.label)}</span><span class="fx-badge">${h(t("fxSkipped"))}</span><button type="button" class="small linkish" data-fxrestore="${h(x.id)}">${h(t("fxRestore"))}</button></div></li>`).join("");
}
const wkSev = (i) => (i >= WK.blocks.length ? "g" : !WK.per[i].length ? (wkLogFor(i).some((x) => x.kind === "done") ? "d" : "ok") : WK.per[i].some((x) => x.card.level === "rojo") ? "r" : "a");

function wkStripHTML() {
  const n = WK.blocks.length;
  const ticks = WK.blocks.map((b, i) => `<button type="button" class="wk-tick wk-${wkSev(i)}${i === WK.i ? " on" : ""}" data-wk="${i}" aria-label="${h(t("wkTickN")(i + 1, WK.per[i].length))}"></button>`).join("");
  const glob = WK.glob.length ? `<button type="button" class="wk-tick wk-g${WK.i === n ? " on" : ""}" data-wk="${n}" aria-label="${h(t("wkGlobal"))}"></button>` : "";
  return `<div class="wk-strip" role="group">${ticks}${glob}</div>`;
}
function walkerHTML() {
  const n = WK.blocks.length, i = WK.i;
  const undo = state.fixUndo.length ? `<button class="small" id="fxUndo">${h(t("fxUndo"))}</button>` : "";
  const head = `<div class="fx-head"><h3>${h(t("wkTitle"))}</h3><span class="status" id="fxMsg">${h(fixMsg)}</span>${undo}</div>`;
  fixMsg = "";
  if (!WK.list.length) { state.fixCards = []; return `<div class="topfix walk" data-wk-root>${head}<p class="lead" style="margin:0">${h(t("fxNone"))}</p></div>`; }
  const isG = i >= n, cards = wkCardsFor(i);
  state.fixCards = cards;
  state.fixOpen = state.fixOpen || new Set();
  cards.slice(0, 2).forEach((c) => state.fixOpen.add(c.id));
  const pos = WK.list.indexOf(i), hasNext = WK.list.some((x) => x > i), hasPrev = WK.list.some((x) => x < i);
  const title = isG ? t("wkGlobal") : t("wkOf")(i + 1, n);
  const lg0 = wkLogFor(i), nDone = lg0.filter((x) => x.kind === "done").length, nSkip = lg0.length - nDone;
  const sub = [isG ? t("wkGlobalSub") : cards.length ? t("wkHere")(cards.length) : "", nDone ? t("wkDoneN")(nDone) : "", nSkip ? t("wkSkipN")(nSkip) : ""].filter(Boolean).join(" · ");
  const sevCls = isG ? "g" : wkSev(i);
  const nav = `<div class="wk-nav"><button type="button" class="small" data-wkgo="-1"${hasPrev ? "" : " disabled"}>‹ ${h(t("wkPrev"))}</button>
    <div class="wk-where"><b class="wk-sev-${sevCls}">${h(title)}</b><span class="hint">${h(sub)}${pos >= 0 ? `${sub ? " · " : ""}${h(t("wkPos")(pos + 1, WK.list.length))}` : ""}</span></div>
    ${hasNext ? `<button type="button" class="small primary" data-wkgo="1">${h(t("wkNext"))} ›</button>` : `<button type="button" class="small primary" data-wkend>${h(t("wkDone"))} →</button>`}</div>`;
  const lg = catLegendHTML(true, catCounts());
  const body = cards.length || lg0.length ? `<ol class="fx-list">${fixItemsHTML(cards, state.result)}${wkLogHTML(i)}</ol>` : `<p class="lead wk-clean">${h(hasNext ? t("wkClean") : t("wkEnd"))}</p>`;
  return `<div class="topfix walk" data-wk-root>${head}${wkStripHTML()}${lg}${nav}${body}</div>`;
}

// ---- painting ----
function wkRangesFor(i) {
  const out = { w: { hi: [], mid: [], fill: [], pol: [] }, u: { hi: [], mid: [], fill: [], pol: [] } };
  for (const { card, evs } of WK.per[i] || []) {
    const f = catOfCard(card);
    for (const e of evs) {
      if (e.marks && e.marks.length) for (const [a, b] of e.marks) { const r = wkRange(a, b); if (r) out.w[f].push(r); }
      else { const r = wkRange(e.start, e.end); if (r) out.u[f].push(r); }
    }
  }
  return out;
}
function wkPaint(scroll) {
  if (typeof railMarkActive === "function") railMarkActive();
  const hl = wkHL();
  wkClearPaint();
  if (!WK.ok || !wkReady()) return;
  if (!WK.ranges) WK.ranges = WK.blocks.map((b, i) => wkRangesFor(i));
  if (hl) {
    // words everywhere; whole-sentence underlines only in the paragraph being reviewed
    for (const f of WK_FAMS) {
      if (CATOFF.has(f)) continue;
      const w = [], u = [];
      WK.ranges.forEach((g, i) => { w.push(...g.w[f]); if (i === WK.i) u.push(...g.u[f]); });
      if (w.length) { const x = new Highlight(...w); x.priority = CAT_PRI[f]; hl.set("sd-w-" + f, x); }
      if (u.length) { const x = new Highlight(...u); x.priority = CAT_PRI[f]; hl.set("sd-u-" + f, x); }
    }
  }
  if (hl && typeof railPaintQuotes === "function") railPaintQuotes(hl);
  const b = WK.blocks[WK.i];
  if (!b) return;
  b.el.classList.add("walk-on");
  // what the first proposal of each card in this paragraph would remove
  if (hl && !CATOFF.has("cut")) {
    const dels = [];
    (state.fixCards || []).forEach((c, ci) => {
      const p = c.proposals[Math.min(state.fixSel[ci] || 0, Math.max(0, c.proposals.length - 1))];
      if (p && p.kind === "patch") for (const x of p.patches) if (x.end > x.start) { const r = wkRange(x.start, x.end); if (r) dels.push(r); }
    });
    if (dels.length) { const x = new Highlight(...dels); x.priority = CAT_PRI.cut; hl.set("sd-del", x); }
  }
  if (scroll) {
    const g = WK.ranges[WK.i], all = [];
    for (const k of ["w", "u"]) for (const f of WK_FAMS) all.push(...g[k][f]);
    const first = all.sort((x, y) => x.compareBoundaryPoints(Range.START_TO_START, y))[0];
    wkScrollTo(first || b.el);
    if (first) wkFlash([first]);
  }
}
function wkScrollTo(target) {
  const box = ED.el;
  if (!box) return;
  const rr = (target.getBoundingClientRect ? target : target).getBoundingClientRect(), bb = box.getBoundingClientRect();
  // leave about a third of the box above the spot so the sentences before it stay in view
  const dy = rr.top - (bb.top + bb.height * 0.32);
  box.scrollTo({ top: Math.max(0, box.scrollTop + dy), behavior: wkReduced() ? "auto" : "smooth" });
}
function wkFlash(ranges) {
  const hl = wkHL();
  if (!hl || !ranges.length) return;
  hl.set("sd-flash", new Highlight(...ranges));
  clearTimeout(WK.flashT);
  WK.flashT = setTimeout(() => hl.delete("sd-flash"), 1500);
}

// ---- navigation ----
function wkGo(i, scroll = true) {
  WK.i = i;
  state.fixSel = {}; state.fixAi = {}; state.fixOpen = new Set();
  WK.pending = scroll;
  const old = document.querySelector(".topfix.walk");
  if (!old || !WK.ok) { if (V.guided) renderGuide(); else renderResults(); return; }
  const tmp = document.createElement("div");
  tmp.innerHTML = walkerHTML();
  old.replaceWith(tmp.firstElementChild);
  wireFixes();
  wkPaint(WK.pending); WK.pending = false;
}
// tapping or clicking anywhere in a paragraph (also its left margin) makes it the paragraph under review
function wkOffsetOf(node, off) {
  for (const m of WK.map) if (m.n === node) return m.s + Math.min(off, m.e - m.s);
  // caret on an element (empty line, between nodes): use the next text node after it
  const r = document.createRange();
  try { r.setStart(node, off); } catch (e) { return -1; }
  for (const m of WK.map) if (r.comparePoint(m.n, 0) >= 0) return m.s;
  return WK.map.length ? WK.map[WK.map.length - 1].e : -1;
}
// only real taps / clicks / arrow keys count: re-rendering the editor after Apply must not move the review
function wkFromCaret() {
  const sel = getSelection();
  if (!ED.el || !sel || !sel.anchorNode || !ED.el.contains(sel.anchorNode)) return;
  if (!WK.ok || !wkReady() || !document.querySelector(".topfix.walk")) return;
  const off = wkOffsetOf(sel.anchorNode, sel.anchorOffset);
  if (off < 0) return;
  const bi = wkBlockAt(WK.blocks, off);
  if (bi !== WK.i && bi >= 0 && bi < WK.blocks.length) wkGo(bi, false);
}
const wkInEd = (e) => ED.el && e.target && ED.el.contains(e.target.nodeType === 1 ? e.target : e.target.parentNode);
document.addEventListener("pointerup", (e) => { if (wkInEd(e) || (ED.el && e.target === ED.el)) setTimeout(wkFromCaret, 30); });
document.addEventListener("keyup", (e) => { if (/^(Arrow|Page|Home|End)/.test(e.key) && wkInEd(e)) setTimeout(wkFromCaret, 30); });
function wkStep(dir) {
  const cand = dir > 0 ? WK.list.filter((x) => x > WK.i) : WK.list.filter((x) => x < WK.i).reverse();
  if (cand.length) wkGo(cand[0]);
}
function wkWire() {
  const root = document.querySelector(".topfix.walk");
  if (!root) return;
  root.querySelectorAll("[data-wk]").forEach((b) => b.addEventListener("click", () => wkGo(+b.dataset.wk)));
  root.querySelectorAll("[data-wkgo]").forEach((b) => b.addEventListener("click", () => wkStep(+b.dataset.wkgo)));
  root.querySelectorAll(".cat-chip[data-cat]").forEach((b) => b.addEventListener("click", () => catToggle(b.dataset.cat)));
  root.querySelectorAll("li.fx-done > .fx-top").forEach((top) => {
    const tg = () => { const li = top.closest("li"), on = !li.classList.contains("open"); li.classList.toggle("open", on); top.setAttribute("aria-expanded", on ? "true" : "false"); };
    top.addEventListener("click", tg);
    top.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(); } });
  });
  const end = root.querySelector("[data-wkend]");
  if (end) end.addEventListener("click", () => goStep(3));
  // tapping the quoted text of a card shows it in the script
  root.querySelectorAll(".fx-ev[data-es]").forEach((el) => {
    el.setAttribute("role", "button"); el.tabIndex = 0; el.title = t("wkLoc");
    const go = () => { const r = wkRange(+el.dataset.es, +el.dataset.ee); if (r) { wkScrollTo(r); wkFlash([r]); } };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
}

// ---- hooks into the existing flow ----
const _topFixHTMLW = topFixHTML;
topFixHTML = function (R) {
  if (!wkBuild()) return _topFixHTMLW(R);
  if (WK.i < 0) WK.i = WK.list.length ? WK.list[0] : 0;
  WK.i = Math.min(WK.i, WK.glob.length ? WK.blocks.length : WK.blocks.length - 1);
  return walkerHTML();
};
const _wireFixesW = wireFixes;
wireFixes = function () { _wireFixesW(); wkWire(); };

function wkDock(scroll) {
  const root = document.documentElement, ed = $("editor");
  if (SPLIT.on || !V.guided || V.step !== 2 || !ed) { root.style.removeProperty("--dock-h"); return; }
  root.style.setProperty("--dock-h", ed.offsetHeight + "px");
  // phone: bring the docked script to the top of the screen so the script and the walker are both in view
  // goStep scrolls to the top right after rendering, so this waits a beat
  if (scroll) setTimeout(() => window.scrollTo({ top: Math.max(0, $("guideTop").getBoundingClientRect().bottom + window.scrollY - 2), behavior: "auto" }), 80);
}
function wkAfterRender() {
  const go = WK.pending;
  if (wkReady() && WK.ok && document.querySelector(".topfix.walk")) { if (typeof railUpdate === "function") railUpdate(); wkDock(go); wkPaint(go); WK.pending = false; }
  else { wkClearPaint(); if (typeof railClear === "function") railClear(); wkDock(false); }
}
const _renderGuideW = renderGuide;
renderGuide = function () { _renderGuideW(); wkAfterRender(); };
const _renderResultsW = renderResults;
renderResults = function () { _renderResultsW(); if (!V.guided) wkAfterRender(); };

// new review: start at the first paragraph that has something
$("runBtn").addEventListener("click", () => { WK.i = -1; WK.pending = true; wkInvalidate(); }, true);
window.addEventListener("resize", () => wkDock(false));
const _goStepW = goStep;
goStep = function (n) { if (n === 2) WK.pending = true; if (n !== 2) { wkClearPaint(); if (typeof railClear === "function") railClear(); } _goStepW(n); };
// after applying or undoing a fix, stay on the same paragraph and keep it in view
const _rerunReviewW = rerunReview;
rerunReview = function (msg) { WK.pending = true; _rerunReviewW(msg); };
// typing in the script makes the painted spots stale
if (ED.el) ED.el.addEventListener("input", wkInvalidate);

// score rows: jump to the first paragraph where that check shows up
const _scGoRowW = scGoRow;
scGoRow = function (id) {
  if (!V.guided) return _scGoRowW(id);
  scClosePop();
  if (!ensureReview()) return;
  if (V.step !== 2) { WK.pending = true; goStep(2); }
  if (!wkBuild()) return _scGoRowW(id);
  let at = WK.per.findIndex((x) => x.some((y) => y.card.id === id || (y.card.ids && y.card.ids.includes(id))));
  if (at < 0 && WK.glob.some((c) => c.id === id || (c.ids && c.ids.includes(id)))) at = WK.blocks.length;
  if (at >= 0) wkGo(at);
};

// legend chip: hide / show one family (the walker and the marked script both follow)
function catToggle(id) {
  if (CATOFF.has(id)) CATOFF.delete(id); else CATOFF.add(id);
  catApplyOff();
  document.querySelectorAll(".cat-chip[data-cat]").forEach((b) => {
    const off = CATOFF.has(b.dataset.cat);
    b.classList.toggle("off", off); b.setAttribute("aria-pressed", off ? "false" : "true");
  });
  if (document.querySelector(".topfix.walk")) wkPaint(false);
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".cat-chip[data-cat]");
  if (b && !b.closest(".topfix.walk")) catToggle(b.dataset.cat);
});

// timeline: tapping a marker goes to that paragraph of the script
function wkMarkerPos(b) {
  if (b.dataset.pos !== undefined) return +b.dataset.pos;
  const tms = +b.dataset.tms; // call-to-action clusters only know the time: find the script position at that time
  const R = state.result;
  if (!R || !R.timeAt) return -1;
  let best = -1, bd = Infinity;
  const L = state.text.length, step = Math.max(1, Math.floor(L / 400));
  for (let x = 0; x <= L; x += step) { const d = Math.abs(R.timeAt(x) - tms); if (d < bd) { bd = d; best = x; } }
  return best;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".timeline .mk, .rl-mini .mk");
  if (!b) return;
  const pos = wkMarkerPos(b);
  if (pos < 0) return;
  if (V.guided && V.step !== 2) { WK.pending = true; goStep(2); }
  if (!wkBuild()) return;
  wkGo(wkBlockAt(WK.blocks, pos));
});
