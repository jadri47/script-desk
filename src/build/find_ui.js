/* ===== Search in the script (Adrian, 2026-11-03: A "a searchbox in the message field so the user can find things quickly") ===== */
// A small bar over the top-right of the editor (🔍 on the toolbar, or Ctrl+F while in the editor): every match highlighted, the
// current one stronger, «3 de 12», Enter / ↓ next, Shift+Enter / ↑ previous, Esc closes and leaves the caret on the match.
// It floats (position:absolute) so opening it never moves the editor: the overlays laid out by edLayer stay where they are.
// Highlights go through the Highlight API, so the editor DOM and the text are never changed. Matching: findAll (find_logic.js).
Object.assign(T.es, {
  fdLbl: "Buscar en el guion", fdN: (i, n) => `${i} de ${n}`, fdNone: "Sin resultados", fdPrev: "Anterior (Mayús+Enter)", fdNext: "Siguiente (Enter)", fdClose: "Cerrar la búsqueda (Esc)",
});
Object.assign(T.en, {
  fdLbl: "Search the script", fdN: (i, n) => `${i} of ${n}`, fdNone: "No results", fdPrev: "Previous (Shift+Enter)", fdNext: "Next (Enter)", fdClose: "Close search (Esc)",
});
const FD = { open: false, q: "", list: [], cur: -1, map: [], timer: null };
const fdHL = () => (typeof CSS !== "undefined" && CSS.highlights && typeof Highlight === "function" ? CSS.highlights : null);

// The editor's text as the search sees it: its text nodes in order, a line break between blocks (so a phrase never runs from one
// paragraph into the next without the break the person sees). FD.map ties each piece back to its node.
function fdText() {
  const map = [];
  let s = "", lastBlock = null;
  const blockOf = (n) => { let e = n.parentNode; while (e && e !== ED.el && !/^(P|DIV|H\d|LI|BLOCKQUOTE)$/.test(e.tagName)) e = e.parentNode; return e; };
  const w = document.createTreeWalker(ED.el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const b = blockOf(n);
    if (lastBlock && b !== lastBlock) s += "\n";
    lastBlock = b;
    map.push({ n, s: s.length, e: s.length + n.data.length });
    s += n.data;
  }
  FD.map = map;
  return s;
}
function fdRange(a, b) {
  let sN = null, sO = 0, eN = null, eO = 0;
  for (const m of FD.map) {
    if (sN === null && a < m.e && a >= m.s) { sN = m.n; sO = a - m.s; }
    if (b > m.s && b <= m.e) { eN = m.n; eO = b - m.s; }
  }
  if (!sN || !eN) return null;
  const r = document.createRange();
  try { r.setStart(sN, sO); r.setEnd(eN, eO); } catch (e) { return null; }
  return r.collapsed ? null : r;
}
function fdPaint() {
  const hl = fdHL();
  if (!hl) return;
  hl.delete("sd-find"); hl.delete("sd-find-cur");
  if (!FD.open || !FD.list.length) return;
  const all = FD.list.map((m) => fdRange(m.start, m.end)).filter(Boolean);
  if (all.length) { const x = new Highlight(...all); x.priority = 20; hl.set("sd-find", x); }
  const c = FD.list[FD.cur] && fdRange(FD.list[FD.cur].start, FD.list[FD.cur].end);
  if (c) { const x = new Highlight(c); x.priority = 21; hl.set("sd-find-cur", x); }
}
function fdCount() {
  const n = FD.wrap && FD.wrap.querySelector(".fd-n");
  if (!n) return;
  n.textContent = !FD.q.trim() ? "" : FD.list.length ? t("fdN")(FD.cur + 1, FD.list.length) : t("fdNone");
  FD.wrap.classList.toggle("fd-miss", !!FD.q.trim() && !FD.list.length);
  FD.wrap.querySelectorAll("[data-fd=prev],[data-fd=next]").forEach((b) => (b.disabled = FD.list.length < 2));
}
// Bring the current match into view a third of the way down, clear of the bar.
function fdShow() {
  const m = FD.list[FD.cur], r = m && fdRange(m.start, m.end);
  if (!r) return;
  const er = ED.el.getBoundingClientRect(), rr = r.getBoundingClientRect();
  if (rr.top < er.top + 56 || rr.bottom > er.bottom - 16) ED.el.scrollTop += rr.top - er.top - Math.round(ED.el.clientHeight / 3);
  if (ED.el.scrollHeight <= ED.el.clientHeight + 2) r.startContainer.parentElement.scrollIntoView({ block: "center", behavior: "auto" }); // the page scrolls, not the box
}
function fdRun(keepCur) {
  const text = fdText(), was = FD.list[FD.cur];
  FD.list = findAll(text, FD.q);
  if (keepCur && was) { const i = FD.list.findIndex((m) => m.start >= was.start); FD.cur = FD.list.length ? (i < 0 ? 0 : i) : -1; }
  else {
    const sel = window.getSelection();
    let pos = 0;
    if (sel && sel.rangeCount && ED.el.contains(sel.anchorNode)) { const k = FD.map.find((m) => m.n === sel.anchorNode); if (k) pos = k.s + sel.anchorOffset; }
    FD.cur = findNearest(FD.list, pos);
  }
  fdPaint(); fdCount();
  if (!keepCur) fdShow();
}
function fdStep(d) {
  if (!FD.list.length) return;
  FD.cur = (FD.cur + d + FD.list.length) % FD.list.length;
  fdPaint(); fdCount(); fdShow();
}
function findOpen() {
  if (!ED.wrap) return;
  if (!FD.wrap) {
    const w = document.createElement("div");
    w.className = "ed-find"; w.setAttribute("role", "search");
    ED.wrap.appendChild(w);
    FD.wrap = w;
    w.addEventListener("input", (e) => { if (!e.target.matches(".fd-q")) return; FD.q = e.target.value; clearTimeout(FD.timer); FD.timer = setTimeout(() => { FD.timer = null; fdRun(false); }, 120); });
    w.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); findClose(true); }
      else if (e.target.matches(".fd-q") && (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        // typed and pressed Enter before the pause ran: show the first match instead of skipping past it
        if (FD.timer) { clearTimeout(FD.timer); FD.timer = null; fdRun(false); return; }
        fdStep(e.key === "ArrowUp" || (e.key === "Enter" && e.shiftKey) ? -1 : 1);
      }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) { e.preventDefault(); w.querySelector(".fd-q").select(); }
    });
    w.addEventListener("click", (e) => { const b = e.target.closest("[data-fd]"); if (!b) return; const k = b.dataset.fd; if (k === "close") findClose(true); else fdStep(k === "prev" ? -1 : 1); });
  }
  FD.wrap.innerHTML = `<span class="fd-ic" aria-hidden="true">${ICON.find}</span><input type="search" class="fd-q" aria-label="${h(t("fdLbl"))}" placeholder="${h(t("fdLbl"))}" autocomplete="off" spellcheck="false">
    <span class="fd-n" role="status" aria-live="polite"></span>
    <button type="button" class="ed-btn fd-b" data-fd="prev" title="${h(t("fdPrev"))}" aria-label="${h(t("fdPrev"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" fill="none"/></svg></button>
    <button type="button" class="ed-btn fd-b" data-fd="next" title="${h(t("fdNext"))}" aria-label="${h(t("fdNext"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none"/></svg></button>
    <button type="button" class="ed-btn fd-b" data-fd="close" title="${h(t("fdClose"))}" aria-label="${h(t("fdClose"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
  FD.open = true; FD.wrap.hidden = false;
  const q = FD.wrap.querySelector(".fd-q");
  // a word selected in the script becomes the search, like in any editor
  const sel = window.getSelection(), picked = sel && sel.rangeCount && ED.el.contains(sel.anchorNode) ? String(sel).trim() : "";
  if (picked && picked.length <= 80 && !/\n/.test(picked)) FD.q = picked;
  q.value = FD.q;
  q.focus(); q.select();
  if (FD.q.trim()) fdRun(false); else fdCount();
  const b = ED.wrap.querySelector('[data-ed="find"]'); if (b) b.setAttribute("aria-pressed", "true");
}
// toEditor: the caret goes to the match Juan was looking at, so he can start typing there
function findClose(toEditor) {
  if (!FD.open) return;
  const m = FD.list[FD.cur], r = toEditor && m ? fdRange(m.start, m.end) : null;
  FD.open = false; FD.list = []; FD.cur = -1;
  fdPaint();
  if (FD.wrap) FD.wrap.hidden = true;
  const b = ED.wrap && ED.wrap.querySelector('[data-ed="find"]'); if (b) b.setAttribute("aria-pressed", "false");
  if (toEditor && ED.el) {
    ED.el.focus({ preventScroll: true });
    if (r) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  }
}
// Ctrl+F inside the editor opens our bar (elsewhere the browser's own search still works). Typing in the script while the bar is
// open recounts after a pause: the keystroke itself never waits for it.
if (ED.el) {
  ED.el.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "f" || e.key === "F")) { e.preventDefault(); findOpen(); } });
  ED.el.addEventListener("input", () => { if (!FD.open || !FD.q.trim()) return; clearTimeout(FD.timer); FD.timer = setTimeout(() => { FD.timer = null; fdRun(true); }, 300); });
}
// The whole text can be replaced without a keystroke (an example, an applied change, another episode): recount then too.
const _renderEdFd = renderEd;
renderEd = function () { const r = _renderEdFd.apply(this, arguments); if (FD.open && FD.q.trim()) fdRun(true); return r; };
const _gOnLangFd = gOnLang;
gOnLang = function () { _gOnLangFd.apply(this, arguments); if (FD.open) { const q = FD.q; findOpen(); FD.q = q; } };
