// ---------- Bible-safe AI edits (pure, no DOM) ----------
// Rule: the AI never gets to write or change Scripture. Verses are swapped for tokens before the AI sees the text,
// and every answer is checked in code before it can be shown. Nothing here depends on the AI behaving.

function mergeSpans(spans) {
  const s = spans.filter((x) => x.end > x.start).sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  for (const x of s) {
    const last = out[out.length - 1];
    if (last && x.start < last.end) { last.end = Math.max(last.end, x.end); if (last.kind !== x.kind) last.kind = last.kind === "ref" ? x.kind : last.kind; }
    else out.push({ ...x });
  }
  return out;
}

// Verse text that is not between quotation marks but is announced by a reference: "Juan 3:16 dice: Porque de tal manera…".
const VERSE_LEAD = /^\s*(?:[:\-–—]|dice\b|dijo\b|says\b|said\b|declara\b|escribe\b|afirma\b|ense[ñn]a\b|reads\b|writes\b)/i;
function verseSpans(text, R) {
  const quotes = R && R.quotes ? R.quotes : findQuotes(text);
  const refs = R && R.refs ? R.refs : findReferences(text);
  const spans = [];
  for (const q of quotes) spans.push({ start: q.start, end: q.end, kind: "quote" });
  for (const r of refs) spans.push({ start: r.start, end: r.end, kind: "ref" });
  for (const r of refs) {
    if (quotes.some((q) => r.start >= q.start && r.end <= q.end)) continue;
    if (!VERSE_LEAD.test(text.slice(r.end, r.end + 24))) continue;
    const tail = text.slice(r.end, r.end + 300);
    // Best effort: to the end of the first sentence that is at least 40 characters long, or the paragraph end if that comes first.
    let stop = -1;
    const m = /[.!?…](?=\s|$)/g; let x;
    while ((x = m.exec(tail))) if (x.index >= 40) { stop = x.index + 1; break; }
    const nl = tail.indexOf("\n");
    if (nl >= 0 && (stop < 0 || nl < stop)) stop = nl;
    if (stop < 0) stop = tail.length;
    spans.push({ start: r.end, end: r.end + stop, kind: "unquoted" });
  }
  return mergeSpans(spans);
}

const VTOK = /⟦V\d+⟧/g;
// Replace every verse (quoted or announced) inside [from, to) by a token. References stay visible but are checked afterwards.
// A verse that crosses the edge of the range cannot be protected, so the caller must refuse that range.
function maskVerses(text, spans, from, to) {
  from = from == null ? 0 : from; to = to == null ? text.length : to;
  const verse = spans.filter((s) => s.kind !== "ref");
  for (const s of verse) if (s.start < to && s.end > from && (s.start < from || s.end > to)) return { error: "boundary", span: s };
  const inside = verse.filter((s) => s.start >= from && s.end <= to).sort((a, b) => a.start - b.start);
  let out = "", pos = from;
  const toks = [];
  inside.forEach((s, i) => {
    const tok = `⟦V${i + 1}⟧`;
    out += text.slice(pos, s.start) + tok;
    toks.push({ tok, text: text.slice(s.start, s.end) });
    pos = s.end;
  });
  out += text.slice(pos, to);
  return { masked: out, toks };
}

// Put the verses back. Every token must be present exactly once and in the original order; nothing else of that shape may appear.
function unmaskCheck(output, toks) {
  const strays = (output.match(VTOK) || []).filter((x) => !toks.some((t) => t.tok === x));
  if (strays.length) return { ok: false, reason: "stray" };
  let last = -1;
  for (const t of toks) {
    const first = output.indexOf(t.tok);
    if (first < 0) return { ok: false, reason: "missing" };
    if (output.indexOf(t.tok, first + 1) >= 0) return { ok: false, reason: "duplicated" };
    if (first < last) return { ok: false, reason: "order" };
    last = first;
  }
  let text = output;
  for (const t of toks) text = text.replace(t.tok, () => t.text);
  return { ok: true, text };
}

const refsKey = (text) => findReferences(text).map((r) => r.canonical).sort().join("|");

// A section rewrite is accepted only when Scripture is provably untouched and nothing new that looks like Scripture was added.
function vetSection(origSlice, toks, aiText, cues) {
  if (typeof aiText !== "string" || !aiText.trim()) return { ok: false, reason: "empty" };
  const u = unmaskCheck(aiText.trim(), toks);
  if (!u.ok) return { ok: false, reason: "verse" };
  const text = u.text;
  if (refsKey(text) !== refsKey(origSlice)) return { ok: false, reason: "ref" };
  if (findQuotes(text).length !== findQuotes(origSlice).length) return { ok: false, reason: "quote" };
  for (const t of toks) if (text.split(t.text).length - 1 !== 1) return { ok: false, reason: "verse" };
  for (const c of cues || []) if (c.text && origSlice.includes(c.text) && !text.includes(c.text)) return { ok: false, reason: "cue" };
  const wa = (origSlice.match(/[\p{L}\p{N}]+/gu) || []).length, wb = (text.match(/[\p{L}\p{N}]+/gu) || []).length;
  if (wa >= 20 && (wb < wa * 0.55 || wb > wa * 1.6)) return { ok: false, reason: "length" };
  return { ok: true, text };
}

// ---- Grammar and wording suggestions ----
function locateUnique(text, needle) {
  if (!needle) return -1;
  const i = text.indexOf(needle);
  if (i < 0) return -1;
  return text.indexOf(needle, i + 1) < 0 ? i : -2;
}
const POL_KINDS = ["grammar", "spelling", "punctuation", "filler", "clarity", "word"];
function vetSuggestions(text, spans, items) {
  const ok = [], drop = { notFound: 0, ambiguous: 0, bible: 0, invalid: 0 };
  for (const it of items || []) {
    const o = it && typeof it.original === "string" ? it.original : "", c = it && typeof it.corrected === "string" ? it.corrected : "";
    if (!o.trim() || o === c || /[⟦⟧]/.test(o + c) || o.length > 600 || c.length > 700) { drop.invalid++; continue; }
    const i = locateUnique(text, o);
    if (i === -1) { drop.notFound++; continue; }
    if (i === -2) { drop.ambiguous++; continue; }
    if (spans.some((s) => i < s.end && i + o.length > s.start)) { drop.bible++; continue; }
    if (findReferences(c).length > findReferences(o).length || findQuotes(c).length > findQuotes(o).length) { drop.bible++; continue; }
    ok.push({ start: i, end: i + o.length, original: o, corrected: c, reason: String(it.reason || "").slice(0, 220), kind: POL_KINDS.includes(it.kind) ? it.kind : "clarity" });
  }
  ok.sort((a, b) => a.start - b.start);
  const out = [];
  let floor = -1;
  for (const x of ok) { if (x.start < floor) { drop.invalid++; continue; } out.push(x); floor = x.end; }
  return { items: out, drop };
}
// Apply one suggestion to the CURRENT text: it must still be found exactly once and must still be away from Scripture.
function relocateSuggestion(text, s) {
  const i = locateUnique(text, s.original);
  if (i < 0) return null;
  if (verseSpans(text).some((v) => i < v.end && i + s.original.length > v.start)) return null;
  return i;
}
function applySuggestion(text, s) {
  const i = relocateSuggestion(text, s);
  return i == null ? null : text.slice(0, i) + s.corrected + text.slice(i + s.original.length);
}
