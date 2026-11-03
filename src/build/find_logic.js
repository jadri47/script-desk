// ===== Search in the script (find_ui.js; Adrian, 2026-11-03: A "a searchbox ... so the user can find things quickly") =====
// Accents and capitals are ignored («dios» finds «Dios», «senor» finds «Señor»). Folding is one character for one character, so a
// match's start/end are positions in the original text. Text is never changed here.
function findFold(s) {
  let out = "";
  for (const ch of String(s)) {
    const f = ch.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    // one char in, one char out («İ» lowercases to two): positions must stay the original's. An emoji (two UTF-16 units) as is.
    out += ch.length === 1 && f.length ? f[0] : ch;
  }
  return out;
}
// All matches of q in text, left to right, not overlapping: [{start, end}]. An empty or blank query finds nothing.
// Spaces in the query match any run of spaces/line breaks in the text (a phrase split over two lines is still found).
function findAll(text, q, max = 2000) {
  const needle = String(q || "").trim();
  if (!needle || !text) return [];
  const hay = findFold(text);
  const parts = findFold(needle).split(/\s+/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(parts.join("\\s+"), "g");
  const out = [];
  let m;
  while ((m = re.exec(hay)) && out.length < max) {
    if (!m[0].length) { re.lastIndex++; continue; }
    out.push({ start: m.index, end: m.index + m[0].length });
  }
  return out;
}
// Which match to show first: the first one at or after the caret, else the first one (wraps).
function findNearest(list, pos) {
  if (!list.length) return -1;
  const i = list.findIndex((m) => m.start >= (pos || 0));
  return i < 0 ? 0 : i;
}
