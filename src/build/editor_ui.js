/* ===== Editor del guion: formato como en un procesador de textos, guardado automático ===== */
// The script stays plain text in #script (the review engine, the AI and the prompter all read it).
// Formatting lives beside it as marks [start, end, type] over that text: b = bold, i = italic, u = underline, h = highlight.
// Section titles («## »), bullets («• ») and numbered lines («1. ») are part of the text itself.
Object.assign(T.es, {
  edBold: "Negrita (Ctrl+B)", edItalic: "Cursiva (Ctrl+I)", edUnder: "Subrayado (Ctrl+U)", edHi: "Resaltar",
  edHead: "Título de sección", edUl: "Lista con viñetas", edOl: "Lista numerada", edCue: "Texto en pantalla para el editor",
  edUndo: "Deshacer (Ctrl+Z)", edRedo: "Rehacer (Ctrl+Y)", edFocus: "Escribir a pantalla completa", edFocusOff: "Salir de pantalla completa", edExit: "Listo", edOpen: "Toca para escribir",
  edGrip: "Arrastra para cambiar la altura del guion",
  edPh: "Escribe aquí tu guion, o pégalo desde Word o Google Docs: la negrita, la cursiva, las listas y los títulos se conservan.",
  edCueText: "versículo o frase", edLocal: "Guardado en este dispositivo", edAuto: "Se guarda solo mientras escribes.",
});
Object.assign(T.en, {
  edBold: "Bold (Ctrl+B)", edItalic: "Italic (Ctrl+I)", edUnder: "Underline (Ctrl+U)", edHi: "Highlight",
  edHead: "Section title", edUl: "Bulleted list", edOl: "Numbered list", edCue: "On-screen text for the editor",
  edUndo: "Undo (Ctrl+Z)", edRedo: "Redo (Ctrl+Y)", edFocus: "Write full screen", edFocusOff: "Leave full screen", edExit: "Done", edOpen: "Tap to write",
  edGrip: "Drag to change the script box height",
  edPh: "Write your script here, or paste it from Word or Google Docs: bold, italics, lists and headings are kept.",
  edCueText: "verse or phrase", edLocal: "Saved on this device", edAuto: "It saves itself as you write.",
});

const FMT = { marks: [] };
const ED = { el: null, wrap: null, writing: false, timer: null, creating: false, full: false };
const TA = $("script");
const TA_VALUE = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
const taGet = () => TA_VALUE.get.call(TA);

// ---------- model ⇄ HTML ----------
const MARK_ORDER = ["h", "b", "i", "u"], MARK_TAG = { h: "mark", b: "strong", i: "em", u: "u" };
function inlineHTML(text, marks, s, e, cues) {
  if (s >= e) return "";
  const pts = new Set([s, e]), spans = [];
  for (const [a, b, k] of marks) if (b > s && a < e) { spans.push([Math.max(a, s), Math.min(b, e), k]); pts.add(Math.max(a, s)); pts.add(Math.min(b, e)); }
  if (cues) { const re = /\[[^\]\n]{1,240}\]/g; let m; const seg = text.slice(s, e); while ((m = re.exec(seg))) { const a = s + m.index, b = a + m[0].length; spans.push([a, b, "c"]); pts.add(a); pts.add(b); } }
  const xs = [...pts].sort((x, y) => x - y);
  let out = "";
  for (let j = 0; j < xs.length - 1; j++) {
    const a = xs[j], b = xs[j + 1];
    if (a >= b) continue;
    const on = new Set(spans.filter((p) => p[0] <= a && p[1] >= b).map((p) => p[2]));
    let piece = h(text.slice(a, b));
    for (const k of [...MARK_ORDER].reverse()) if (on.has(k)) piece = `<${MARK_TAG[k]}>${piece}</${MARK_TAG[k]}>`;
    if (on.has("c")) piece = `<span class="ed-cue">${piece}</span>`;
    out += piece;
  }
  return out;
}
const RX_H = /^#{1,6}\s+/, RX_UL = /^\s*[-*•·▪◦]\s+/, RX_OL = /^\s*\d{1,3}[.)]\s+/;
function modelToHTML(text, marks) {
  if (!text.trim()) return "";
  let html = "", para = null, list = null, pos = 0;
  const closePara = () => { if (para) { html += `<p>${para.join("<br>")}</p>`; para = null; } };
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const ln of text.split("\n")) {
    const s = pos, e = pos + ln.length;
    pos = e + 1;
    let m;
    if (!ln.trim()) { closePara(); closeList(); continue; }
    if ((m = RX_H.exec(ln))) { closePara(); closeList(); html += `<h2>${inlineHTML(text, marks, s + m[0].length, e, true)}</h2>`; continue; }
    const isUl = RX_UL.exec(ln), isOl = !isUl && RX_OL.exec(ln);
    if (isUl || isOl) {
      closePara();
      const want = isUl ? "ul" : "ol";
      if (list !== want) { closeList(); html += `<${want}>`; list = want; }
      html += `<li>${inlineHTML(text, marks, s + (isUl || isOl)[0].length, e, true)}</li>`;
      continue;
    }
    closeList();
    (para = para || []).push(inlineHTML(text, marks, s, e, true));
  }
  closePara(); closeList();
  return html;
}

// DOM (the editor, or pasted HTML from Word / Google Docs) → { text, marks }
const SKIP_TAG = /^(SCRIPT|STYLE|META|LINK|TITLE|NOSCRIPT|TEMPLATE|svg|IMG|VIDEO|AUDIO|IFRAME|OBJECT)$/i;
const BLOCK_TAG = /^(P|DIV|BLOCKQUOTE|PRE|SECTION|ARTICLE|HEADER|FOOTER|TABLE|TBODY|THEAD|TR|TD|TH|DL|DT|DD|FIGURE|MAIN|ASIDE|NAV)$/;
const NO_BG = /^(transparent|initial|inherit|unset|none|white|#fff|#ffffff|rgba\(0,\s*0,\s*0,\s*0\)|rgb\(255,\s*255,\s*255\))$/i;
function styleOf(n, st) {
  const s = { ...st }, tag = n.tagName, css = n.style || {};
  if (tag === "B" || tag === "STRONG") s.b = true;
  if (tag === "I" || tag === "EM" || tag === "CITE") s.i = true;
  if (tag === "U" || tag === "INS") s.u = true;
  if (tag === "MARK") s.h = true;
  if (css.fontWeight) s.b = css.fontWeight === "bold" || css.fontWeight === "bolder" || +css.fontWeight >= 600;
  if (css.fontStyle) s.i = /italic|oblique/.test(css.fontStyle);
  const td = css.textDecorationLine || css.textDecoration;
  if (td) s.u = /underline/.test(td);
  if (css.backgroundColor) s.h = !NO_BG.test(css.backgroundColor.trim());
  return s;
}
function domToModel(root) {
  const blocks = [];
  let cur = null;
  const open = (type) => { cur = { type, runs: [], fresh: true }; blocks.push(cur); return cur; };
  const push = (t, st) => { if (!cur) { if (!t.trim()) return; open("p"); } cur.runs.push({ t, st }); if (t.trim()) cur.fresh = false; };
  const walk = (n, st, lt) => {
    if (n.nodeType === 3) { push(n.nodeValue.replace(/ /g, " ").replace(/\s*[\r\n]+\s*/g, " "), st); return; }
    if (n.nodeType !== 1 || SKIP_TAG.test(n.tagName)) return;
    const tag = n.tagName.toUpperCase();
    if (tag === "BR") { if (cur) cur.runs.push({ t: "\n", st }); return; }
    const s2 = styleOf(n, st);
    if (tag === "UL" || tag === "OL") { cur = null; n.childNodes.forEach((c) => walk(c, s2, tag === "OL" ? "ol" : "ul")); cur = null; return; }
    if (tag === "LI") { open(lt || "ul"); n.childNodes.forEach((c) => walk(c, s2, lt)); cur = null; return; }
    if (/^H[1-6]$/.test(tag)) { open("h"); n.childNodes.forEach((c) => walk(c, { ...s2, b: false }, lt)); cur = null; return; }
    if (BLOCK_TAG.test(tag)) {
      if (!(cur && cur.fresh)) cur = null;
      n.childNodes.forEach((c) => walk(c, s2, lt));
      cur = null;
      return;
    }
    n.childNodes.forEach((c) => walk(c, s2, lt));
  };
  root.childNodes.forEach((c) => walk(c, { b: false, i: false, u: false, h: false }, null));

  let text = "", olN = 0, prev = null;
  const marks = [];
  for (const b of blocks) {
    let s = b.runs.map((r) => r.t).join("");
    if (!s.trim()) continue;
    // Word sends bullets as «·  texto» paragraphs; Google Docs sometimes as «• texto».
    let lead = s.length - s.replace(/^[ \t\n]+/, "").length;
    if (b.type === "p") {
      const rest = s.slice(lead);
      const mu = /^[-*•·▪◦§]\s+/.exec(rest), mo = !mu && /^\d{1,3}[.)]\s+/.exec(rest), mh = !mu && !mo && /^#{1,6}\s+/.exec(rest);
      if (mu) { b.type = "ul"; lead += mu[0].length; } else if (mo) { b.type = "ol"; lead += mo[0].length; } else if (mh) { b.type = "h"; lead += mh[0].length; }
    }
    const trail = s.length - s.replace(/[ \t\n]+$/, "").length;
    const isList = (x) => x && (x.type === "ul" || x.type === "ol");
    const sep = !text ? "" : prev.type === "h" || (isList(b) && isList(prev) && b.type === prev.type) ? "\n" : "\n\n";
    olN = b.type === "ol" ? (prev && prev.type === "ol" ? olN + 1 : 1) : 0;
    const prefix = b.type === "h" ? "## " : b.type === "ul" ? "• " : b.type === "ol" ? olN + ". " : "";
    text += sep + prefix;
    const base = text.length;
    let off = 0;
    for (const r of b.runs) {
      const a = Math.max(off, lead), z = Math.min(off + r.t.length, s.length - trail);
      if (z > a) {
        let piece = r.t.slice(a - off, z - off);
        if (b.type !== "p" && b.type !== "h") piece = piece.replace(/\n/g, " ");
        const st = base + (a - lead);
        text += piece;
        for (const k of MARK_ORDER) if (r.st[k] && piece.trim()) marks.push([st, st + piece.length, k]);
      }
      off += r.t.length;
    }
    prev = b;
  }
  // Merge touching marks of the same type.
  marks.sort((x, y) => (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : x[0] - y[0]));
  const merged = [];
  for (const m of marks) { const l = merged[merged.length - 1]; if (l && l[2] === m[2] && m[0] <= l[1]) l[1] = Math.max(l[1], m[1]); else merged.push([...m]); }
  return { text, marks: merged };
}

// When something else rewrites the script (a quick fix, Ask Claude, undo, translation), keep marks on the text that didn't change.
function remapMarks(oldT, newT, marks) {
  if (!marks.length || oldT === newT) return marks;
  if (!newT.trim()) return [];
  let p = 0;
  const max = Math.min(oldT.length, newT.length);
  while (p < max && oldT[p] === newT[p]) p++;
  let s = 0;
  while (s < max - p && oldT[oldT.length - 1 - s] === newT[newT.length - 1 - s]) s++;
  if (p + s < 0.3 * Math.min(oldT.length, newT.length)) return [];
  const oldEnd = oldT.length - s, newEnd = newT.length - s, delta = newT.length - oldT.length;
  const out = [];
  for (const [a, b, k] of marks) {
    const aIn = a > p && a < oldEnd, bIn = b > p && b < oldEnd;
    if (aIn && bIn) continue; // the marked words were rewritten
    const a2 = a <= p ? a : aIn ? newEnd : a + delta;
    const b2 = b <= p ? b : bIn ? p : b + delta;
    if (b2 > a2 && a2 >= 0 && b2 <= newT.length) out.push([a2, b2, k]);
  }
  return out;
}

// ---------- the editor ----------
const ICON = {
  b: '<b class="ed-ic-t">B</b>', i: '<i class="ed-ic-t ed-ic-i">I</i>', u: '<u class="ed-ic-t">U</u>',
  h: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14" stroke-width="3" class="ed-hi-bar"/><path d="M8 15 15.5 4.5l3 2.5L11 17.5H8z" fill="none"/></svg>',
  head: '<span class="ed-ic-t ed-ic-h">T</span>',
  ul: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="7" r="1.6" class="f"/><circle cx="5" cy="12" r="1.6" class="f"/><circle cx="5" cy="17" r="1.6" class="f"/><path d="M10 7h10M10 12h10M10 17h10"/></svg>',
  ol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2v4M4 9h3M4 14.5c0-1 2.5-1 2.5 0S4 16.5 4 18h3M10 7h10M10 12h10M10 17h10"/></svg>',
  cue: '<span class="ed-ic-t ed-ic-cue">[T]</span>',
  undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
  redo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
  full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exitFull: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
};
const TOOLS = [["b", "edBold"], ["i", "edItalic"], ["u", "edUnder"], ["h", "edHi"], "|", ["head", "edHead"], ["ul", "edUl"], ["ol", "edOl"], ["cue", "edCue"], "|", ["undo", "edUndo"], ["redo", "edRedo"], "~", ["full", "edFocus"]];

function toolbarHTML() {
  return TOOLS.map((x) => (x === "|" ? '<span class="ed-sep"></span>' : x === "~" ? '<span class="ed-gap"></span>'
    : `<button type="button" class="ed-btn" data-ed="${x[0]}" title="${h(t(x[1]))}" aria-label="${h(t(x[1]))}">${x[0] === "full" ? fullBtnHTML(ED.full) : ICON[x[0]]}</button>`)).join("");
}
function renderEd() {
  if (!ED.el) return;
  ED.el.innerHTML = modelToHTML(taGet(), FMT.marks) || "<p><br></p>";
  ED.el.classList.toggle("is-empty", !taGet().trim());
}
function syncFromEditor() {
  clearTimeout(ED.timer); ED.timer = null;
  if (!ED.el) return;
  const { text, marks } = domToModel(ED.el);
  ED.el.classList.toggle("is-empty", !text.trim() && !ED.el.querySelector("li"));
  const changed = text !== taGet() || JSON.stringify(marks) !== JSON.stringify(FMT.marks);
  if (!changed) return;
  ED.writing = true; TA.value = text; ED.writing = false;
  FMT.marks = marks;
  TA.dispatchEvent(new Event("input", { bubbles: true }));
  afterChange();
  if (typeof renderEpStrip === "function" && V.guided) renderEpStrip();
}
const queueSync = () => { clearTimeout(ED.timer); ED.timer = setTimeout(syncFromEditor, 150); };

// Saved without pressing anything: a draft on this device right away, and the episode in the cloud once it has some text.
function afterChange() {
  if (typeof DEMO !== "undefined" && DEMO) return;
  if (!G.prodId) {
    lsSet("sd-draft", JSON.stringify({ text: taGet(), marks: FMT.marks, at: Date.now() }));
    setEdSave(t("edLocal"));
    autoCreate();
  } else markDirty();
}
async function autoCreate() {
  if (G.prodId || ED.creating) return;
  const words = (taGet().match(/\p{L}+/gu) || []).length;
  if (words < 25) return;
  const db = await caps.db;
  if (!db || G.prodId) return;
  ED.creating = true;
  try { if (await createProd()) lsSet("sd-draft", ""); } finally { ED.creating = false; }
}
function setEdSave(txt) { const el = $("edSave"); if (el) { el.textContent = txt || ""; el.classList.toggle("is-busy", G.saveState === "saving" || G.saveState === "unsaved"); } }
const _setSaveE = setSave;
setSave = function (x) { _setSaveE(x); setEdSave(saveText()); };

function wrapSelection(before, after, inner) {
  ED.el.focus();
  const sel = window.getSelection();
  const txt = sel && sel.rangeCount ? sel.toString() : "";
  document.execCommand("insertText", false, before + (txt || inner) + after);
}
function blockOfSelection() {
  const sel = window.getSelection();
  let n = sel && sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
  while (n && n !== ED.el) { if (n.nodeType === 1 && /^(P|DIV|H[1-6]|LI)$/.test(n.tagName) && n.parentNode && (n.parentNode === ED.el || /^(UL|OL)$/.test(n.parentNode.tagName))) return n; n = n.parentNode; }
  return null;
}
function edCmd(k) {
  ED.el.focus();
  if (k === "b") document.execCommand("bold");
  else if (k === "i") document.execCommand("italic");
  else if (k === "u") document.execCommand("underline");
  else if (k === "h") {
    const on = hiActive();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("hiliteColor", false, on ? "transparent" : "#FFE58A");
    document.execCommand("styleWithCSS", false, false);
  } else if (k === "head") {
    const b = blockOfSelection();
    document.execCommand("formatBlock", false, b && /^H/.test(b.tagName) ? "p" : "h2");
  } else if (k === "ul") document.execCommand("insertUnorderedList");
  else if (k === "ol") document.execCommand("insertOrderedList");
  else if (k === "cue") wrapSelection("[TEXTO: ", "]", t("edCueText"));
  else if (k === "undo") document.execCommand("undo");
  else if (k === "redo") document.execCommand("redo");
  else if (k === "full") { setFull(!ED.full); return; }
  queueSync(); updateTools();
}
function hiActive() {
  const sel = window.getSelection();
  let n = sel && sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
  while (n && n !== ED.el) { if (n.nodeType === 1 && (n.tagName === "MARK" || (n.style && n.style.backgroundColor && !NO_BG.test(n.style.backgroundColor)))) return true; n = n.parentNode; }
  return false;
}
function updateTools() {
  if (!ED.wrap) return;
  const sel = window.getSelection();
  const inside = sel && sel.rangeCount && ED.el.contains(sel.anchorNode);
  const b = inside ? blockOfSelection() : null;
  const st = {
    b: inside && document.queryCommandState("bold"), i: inside && document.queryCommandState("italic"), u: inside && document.queryCommandState("underline"),
    h: inside && hiActive(), head: !!(b && /^H/.test(b.tagName)), ul: !!(b && b.tagName === "LI" && b.parentNode.tagName === "UL"), ol: !!(b && b.tagName === "LI" && b.parentNode.tagName === "OL"),
  };
  ED.wrap.querySelectorAll("[data-ed]").forEach((x) => { if (x.dataset.ed in st) x.setAttribute("aria-pressed", st[x.dataset.ed] ? "true" : "false"); });
}
const isPhone = () => window.matchMedia("(max-width: 640px)").matches;
function fullBtnHTML(on) {
  if (on) return ICON.exitFull + `<span class="ed-exit-l">${h(t("edExit"))}</span>`;
  return ICON.full + `<span class="ed-open-l">${h(t("edOpen"))}</span>`;
}
// Keep the caret in view after the box changes size.
function caretIntoView() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !ED.el.contains(sel.anchorNode)) return;
  let r = sel.getRangeAt(0).getBoundingClientRect();
  if (!r || (!r.top && !r.bottom)) { const n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement; if (n) r = n.getBoundingClientRect(); }
  const box = ED.el.getBoundingClientRect();
  if (r.top < box.top + 40 || r.bottom > box.bottom - 40) ED.el.scrollTop += r.top - box.top - box.height / 3;
}
function setFull(on, fromHistory) {
  if (ED.full === on) return;
  ED.full = on;
  ED.wrap.classList.toggle("ed-full", on);
  document.documentElement.classList.toggle("ed-lock", on);
  const btn = ED.wrap.querySelector('[data-ed="full"]');
  btn.innerHTML = fullBtnHTML(on);
  btn.title = btn.ariaLabel = t(on ? "edFocusOff" : "edFocus");
  // On a phone the back button closes the writing view instead of leaving the app.
  if (isPhone() && !fromHistory) { if (on) { try { history.pushState({ sdEd: 1 }, ""); } catch (e) {} } else if (history.state && history.state.sdEd) { try { history.back(); } catch (e) {} } }
  if (on) { ED.el.focus(); requestAnimationFrame(() => requestAnimationFrame(caretIntoView)); }
  else { syncFromEditor(); ED.el.blur(); ED.el.scrollTop = 0; ED.wrap.scrollIntoView({ block: "nearest" }); }
}

// Typing «- », «1. » or «## » at the start of a line turns it into a list or a section title, like in Docs.
function markdownShortcut(e) {
  if (e.inputType !== "insertText" || e.data !== " ") return;
  const b = blockOfSelection();
  if (!b || b.tagName !== "P" && b.tagName !== "DIV") return;
  const txt = b.textContent;
  const kind = /^[-*•]\s$/.test(txt) ? "ul" : /^1[.)]\s$/.test(txt) ? "ol" : /^#{1,3}\s$/.test(txt) ? "head" : "";
  if (!kind) return;
  b.textContent = "";
  b.appendChild(document.createElement("br"));
  const r = document.createRange(); r.setStart(b, 0); r.collapse(true);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  if (kind === "head") document.execCommand("formatBlock", false, "h2");
  else document.execCommand(kind === "ul" ? "insertUnorderedList" : "insertOrderedList");
}

function onPaste(e) {
  const cd = e.clipboardData;
  if (!cd) return;
  e.preventDefault();
  const html = cd.getData("text/html"), plain = cd.getData("text/plain");
  let model;
  if (html && /<[a-z]/i.test(html)) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    model = domToModel(doc.body);
    if (!model.text.trim() && plain) model = { text: plain.replace(/\r\n?/g, "\n"), marks: [] };
  } else model = { text: (plain || "").replace(/\r\n?/g, "\n"), marks: [] };
  if (!model.text) return;
  const out = modelToHTML(model.text, model.marks);
  // A single pasted paragraph goes inline; several become their own blocks.
  const single = !/\n/.test(model.text.trim()) && !RX_H.test(model.text) && !RX_UL.test(model.text) && !RX_OL.test(model.text);
  document.execCommand("insertHTML", false, single ? inlineHTML(model.text, model.marks, 0, model.text.length, true) : out);
  syncFromEditor();
  TA.dispatchEvent(new Event("paste"));
}

(function initEditor() {
  if (!TA) return;
  // Every programmatic write to #script (fixes, AI, translation, examples, opening an episode) redraws the editor.
  Object.defineProperty(TA, "value", {
    configurable: true,
    get() { return taGet(); },
    set(v) {
      const old = taGet();
      TA_VALUE.set.call(TA, v);
      if (ED.writing) return;
      FMT.marks = remapMarks(old, String(v), FMT.marks);
      renderEd();
      if (!G.prodId && !(typeof DEMO !== "undefined" && DEMO)) lsSet("sd-draft", JSON.stringify({ text: String(v), marks: FMT.marks, at: Date.now() }));
    },
  });
  TA.focus = () => { if (!ED.el) return; if (isPhone()) ED.wrap.scrollIntoView({ block: "nearest", behavior: "smooth" }); else ED.el.focus(); };
  try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}

  const wrap = document.createElement("div");
  wrap.className = "ed-wrap";
  wrap.innerHTML = `<div class="ed-bar" role="toolbar" aria-label="${h(t("scriptLabel"))}">${toolbarHTML()}</div>
    <div class="ed" id="ed" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="edLbl" spellcheck="true" data-ph="${h(t("edPh"))}"></div>
    <div class="ed-grip" id="edGrip" role="separator" aria-orientation="horizontal" aria-label="${h(t("edGrip"))}" tabindex="0"><span></span></div>`;
  TA.insertAdjacentElement("beforebegin", wrap);
  TA.style.display = "none";
  const lbl = document.querySelector('label[for="script"]');
  if (lbl) { lbl.id = "edLbl"; lbl.addEventListener("click", () => ED.el.focus()); }
  ED.wrap = wrap; ED.el = wrap.querySelector("#ed");
  ED.el.lang = UI;

  // Phone: drag the grip under the box to make it taller or shorter (the height is remembered).
  (() => {
    const grip = wrap.querySelector("#edGrip"), MIN = 120, maxH = () => Math.round(innerHeight * 0.85);
    const cur = () => ED.el.getBoundingClientRect().height;
    const setH = (px) => { const v = Math.max(MIN, Math.min(maxH(), Math.round(px))); wrap.style.setProperty("--edh", v + "px"); return v; };
    try { const s = +lsGet("sd-edh"); if (s >= MIN) setH(s); } catch (e) {}
    let y0 = 0, h0 = 0, drag = false;
    grip.addEventListener("pointerdown", (e) => { drag = true; y0 = e.clientY; h0 = cur(); grip.setPointerCapture(e.pointerId); grip.classList.add("on"); e.preventDefault(); });
    grip.addEventListener("pointermove", (e) => { if (drag) setH(h0 + (e.clientY - y0)); });
    const end = () => { if (!drag) return; drag = false; grip.classList.remove("on"); try { lsSet("sd-edh", String(Math.round(cur()))); } catch (e) {} };
    grip.addEventListener("pointerup", end); grip.addEventListener("pointercancel", end);
    grip.addEventListener("keydown", (e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const v = setH(cur() + (e.key === "ArrowDown" ? 40 : -40)); lsSet("sd-edh", String(v)); } });
    grip.addEventListener("dblclick", () => { wrap.style.removeProperty("--edh"); lsSet("sd-edh", ""); });
  })();
  wrap.querySelector(".ed-bar").addEventListener("mousedown", (e) => { if (e.target.closest("[data-ed]")) e.preventDefault(); });
  wrap.querySelectorAll("[data-ed]").forEach((b) => b.addEventListener("click", () => edCmd(b.dataset.ed)));
  ED.el.addEventListener("input", (e) => { markdownShortcut(e); queueSync(); });
  ED.el.addEventListener("blur", syncFromEditor);
  // Typing straight into the box root would leave text outside any paragraph; keep one there.
  ED.el.addEventListener("focus", () => { if (!ED.el.firstElementChild) { ED.el.innerHTML = "<p><br></p>"; const r = document.createRange(); r.setStart(ED.el.firstChild, 0); r.collapse(true); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } });
  ED.el.addEventListener("paste", onPaste);
  window.addEventListener("popstate", () => { if (ED.full && isPhone()) setFull(false, true); });
  // Desktop: the box keeps the height Juan drags it to.
  const hSaved = +lsGet("sd-edh");
  if (hSaved >= 240 && !isPhone()) ED.el.style.height = hSaved + "px";
  if (window.ResizeObserver) { let rt = null; new ResizeObserver(() => { if (ED.full || isPhone() || !ED.el.style.height) return; clearTimeout(rt); rt = setTimeout(() => lsSet("sd-edh", String(Math.round(ED.el.getBoundingClientRect().height))), 400); }).observe(ED.el); }
  ED.el.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ED.full) { e.preventDefault(); setFull(false); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "h" || e.key === "H")) { e.preventDefault(); edCmd("h"); }
  });
  document.addEventListener("selectionchange", () => { if (document.activeElement === ED.el) updateTools(); });
  window.addEventListener("beforeunload", syncFromEditor);
  document.addEventListener("visibilitychange", () => { if (document.hidden) syncFromEditor(); });

  const meta = document.querySelector(".meta-line");
  if (meta && !$("edSave")) { const s = document.createElement("span"); s.id = "edSave"; s.className = "ed-save"; meta.appendChild(s); }
  renderEd();

  // Back from a closed tab without an episode yet: bring the draft back.
  setTimeout(() => {
    if (G.prodId || taGet().trim()) return;
    let d = null;
    try { d = JSON.parse(lsGet("sd-draft") || "null"); } catch (e) {}
    if (!d || !d.text || !d.text.trim()) return;
    TA.value = d.text; FMT.marks = Array.isArray(d.marks) ? d.marks : []; renderEd();
    updateLive(); setEdSave(t("edLocal"));
  }, 1500);
})();

// A readable working title from the first line, without «## », bullets or [cues].
function autoTitle(text) {
  const line = (text || "").split("\n").map((l) => l.replace(/^\s*(#{1,6}|[-*•·]|\d{1,3}[.)])\s+/, "").replace(/\[[^\]]*\]/g, "").trim()).find(Boolean) || "";
  if (line.length <= 60) return line;
  const cut = line.slice(0, 60);
  return cut.slice(0, Math.max(30, cut.lastIndexOf(" "))) + "…";
}
// Formatting travels with the episode.
const _prodBodyE = prodBody;
prodBody = function (now) {
  const b = { ..._prodBodyE(now), fmt: FMT.marks };
  if (!$("title").value.trim() && !$("series").value.trim()) b.title = autoTitle(b.text);
  const p = G.prods && G.prods.find((x) => x.id === G.prodId);
  if (p) { p.title = b.title; p.hasText = !!b.text.trim(); }
  return b;
};
const _applyProdE = applyProd;
applyProd = function (id, d) { _applyProdE(id, d); FMT.marks = Array.isArray(d.fmt) ? d.fmt.filter((m) => Array.isArray(m) && m.length === 3) : []; renderEd(); };
const _gOnLangEd = gOnLang;
gOnLang = function () {
  _gOnLangEd.apply(this, arguments);
  if (!ED.wrap) return;
  ED.wrap.querySelector(".ed-bar").innerHTML = toolbarHTML();
  ED.wrap.querySelectorAll("[data-ed]").forEach((b) => b.addEventListener("click", () => edCmd(b.dataset.ed)));
  ED.el.dataset.ph = t("edPh"); ED.el.lang = UI;
  if (ED.full) { const b = ED.wrap.querySelector('[data-ed="full"]'); b.innerHTML = fullBtnHTML(true); }
};

// The prompter shows the same bold, italics, underline and highlight Juan wrote.
richSlice = function (text, from, to, units, cues, unitWrap, cueWrap) {
  const esc = (a, b) => (text === taGet() && FMT.marks.length ? inlineHTML(text, FMT.marks, a, b, false) : h(text.slice(a, b)));
  const items = [...units.map((u) => ({ s: u.start, e: u.end, u })), ...cues.filter((c) => c.start >= from && c.end <= to).map((c) => ({ s: c.start, e: c.end, c }))].sort((a, b) => a.s - b.s);
  let html = "", pos = from;
  for (const it of items) {
    if (it.s < pos) continue;
    html += esc(pos, it.s);
    if (it.u) {
      let inner = "", p = it.u.start;
      for (const c of cues) if (c.start >= it.u.start && c.end <= it.u.end) { inner += esc(p, c.start) + cueWrap(c); p = c.end; }
      inner += esc(p, it.u.end);
      html += unitWrap(it.u, inner);
    } else html += cueWrap(it.c);
    pos = it.e;
  }
  return html + esc(pos, to);
};

// ---------- «Borrar guion» asks first, in a popup ----------
Object.assign(T.es, { clrTitle: "¿Borrar todo el guion?", clrBody: "Se borra el texto del guion y también el título, la miniatura y la descripción que escribiste en esta pantalla.", clrSaved: "Este episodio está guardado: también quedará vacío.", clrNo: "No, conservar", clrYes: "Sí, borrar todo", clrUndo: "No se puede deshacer." });
Object.assign(T.en, { clrTitle: "Delete the whole script?", clrBody: "This clears the script text and also the title, thumbnail and description you typed on this screen.", clrSaved: "This episode is saved: it will be left empty too.", clrNo: "No, keep it", clrYes: "Yes, delete everything", clrUndo: "This can't be undone." });
function askClearScript() {
  let d = $("clrDlg");
  if (!d) { d = document.createElement("dialog"); d.id = "clrDlg"; d.className = "ep-sheet clr-dlg"; document.body.appendChild(d); d.addEventListener("click", (e) => { if (e.target === d) d.close(); }); }
  const saved = !!G.prodId && !(typeof DEMO !== "undefined" && DEMO);
  d.innerHTML = `<div class="ep-sheet-in"><h2>${h(t("clrTitle"))}</h2><p>${h(t("clrBody"))}</p>${saved ? `<p><b>${h(t("clrSaved"))}</b></p>` : ""}<p class="hint">${h(t("clrUndo"))}</p>
    <div class="clr-act"><button type="button" class="primary" id="clrNo">${h(t("clrNo"))}</button><button type="button" class="danger" id="clrYes">${h(t("clrYes"))}</button></div></div>`;
  $("clrNo").addEventListener("click", () => d.close());
  $("clrYes").addEventListener("click", () => { d.close(); doClearScript(); });
  try { d.showModal(); } catch (e) { d.setAttribute("open", ""); }
  $("clrNo").focus();
}
