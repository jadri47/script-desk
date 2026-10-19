/* ===== Text fields grow to show all their text (no inner scrolling) ===== */
// Single-line fields (title, topic, thumbnail text, series, central idea…) are rendered as one-row textareas marked data-one:
// they wrap and grow like a paragraph, but Enter never adds a line break and pasted line breaks become spaces.
// Every other textarea except the script editor and raw data boxes also grows to fit its content.
const AUTOSIZE_SKIP = new Set(["script", "rsData"]);
const autoOk = (el) => el && el.tagName === "TEXTAREA" && !AUTOSIZE_SKIP.has(el.id) && !el.closest(".ed-wrap");
function autoFit(el) {
  if (!autoOk(el) || !el.isConnected) return;
  const cs = getComputedStyle(el);
  if (cs.display === "none" || !el.offsetWidth) return; // hidden: refit when it becomes visible
  const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const prev = el.style.height;
  el.style.height = "0px"; // measure the content alone, not a stale height or a min-height
  const want = cs.boxSizing === "border-box" ? el.scrollHeight + border : el.scrollHeight - pad;
  // Multi-line boxes keep their "rows" as the minimum, so an empty description still looks like a paragraph box.
  let min = 0;
  if (!el.dataset.one && el.rows > 1) {
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    min = el.rows * lh + (cs.boxSizing === "border-box" ? pad + border : 0);
  }
  el.style.height = Math.ceil(Math.max(want, min)) + "px";
  if (prev !== el.style.height) el.style.overflowY = "hidden";
}
function autoFitAll(root) { (root || document).querySelectorAll("textarea").forEach(autoFit); }
// Values set by code (loading a saved episode, accepting an AI title…) don't fire "input", so wrap the setter.
(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  if (!d || !d.set) return;
  Object.defineProperty(HTMLTextAreaElement.prototype, "value", {
    configurable: true, enumerable: d.enumerable, get() { return d.get.call(this); },
    set(v) { d.set.call(this, v); if (autoOk(this)) requestAnimationFrame(() => autoFit(this)); },
  });
})();
document.addEventListener("input", (e) => {
  const el = e.target;
  if (!autoOk(el)) return;
  if (el.dataset.one && /[\r\n]/.test(el.value)) {
    const pos = el.selectionStart;
    el.value = el.value.replace(/\s*[\r\n]+\s*/g, " ");
    try { el.setSelectionRange(pos, pos); } catch (_) { /* ignore */ }
  }
  autoFit(el);
}, true);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.isComposing && e.target && e.target.dataset && e.target.dataset.one) e.preventDefault();
}, true);
// Width changes (rotation, panels opening) and fields that appear later (tabs, collapsed sections, re-rendered cards).
const autoRO = typeof ResizeObserver === "function" ? new ResizeObserver((entries) => {
  for (const en of entries) { const el = en.target, w = Math.round(en.contentRect.width); if (el._autoW !== w) { el._autoW = w; autoFit(el); } }
}) : null;
const autoWatch = (el) => { if (autoOk(el) && !el._autoWatched) { el._autoWatched = true; if (autoRO) autoRO.observe(el); autoFit(el); } };
new MutationObserver((muts) => {
  for (const m of muts) for (const n of m.addedNodes) {
    if (n.nodeType !== 1) continue;
    if (n.tagName === "TEXTAREA") autoWatch(n); else n.querySelectorAll && n.querySelectorAll("textarea").forEach(autoWatch);
  }
}).observe(document.body, { childList: true, subtree: true });
document.addEventListener("toggle", (e) => { if (e.target.open) requestAnimationFrame(() => autoFitAll(e.target)); }, true);
window.addEventListener("load", () => autoFitAll());
document.querySelectorAll("textarea").forEach(autoWatch);
