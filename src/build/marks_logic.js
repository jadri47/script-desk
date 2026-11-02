// ---------- Marks in the text (pure; Adrian, 2026-11-01: "every item in the text to be marked", then "apply A" = 7A) ----------
// One list per group, keyed by text position, from what the analysis already found. The UI (marks_ui.js) draws them over the
// editor without touching its DOM. Which groups show on entry depends on the screen (the table in the mockup); the author's own
// choice per screen wins and is remembered.
const MARK_GROUPS = ["secs", "para", "quote", "ref", "ad", "rehook", "chap", "cta", "cue", "risk", "fill"];
const MARK_SCREENS = ["write", "secs", "detail", "pub"];
// «Qué marcas se ven en cada pantalla» (mockup https://claude.ai/artifact/Ehhx4VaH8uszXgNTud7ysa)
const MARK_DEFAULT = {
  secs: ["secs", "detail"], para: MARK_SCREENS, quote: MARK_SCREENS, ref: MARK_SCREENS,
  ad: ["detail", "pub"], chap: ["detail", "pub"], rehook: ["secs", "detail"],
  cta: ["secs", "detail", "pub"], cue: ["secs", "detail", "pub"], risk: ["detail"], fill: ["detail"],
};
const MARK_VISUAL_CUE = /^(TEXTO|TEXT|CITA|QUOTE|GR[AÁ]FICO|GRAPHIC|IMAGEN|IMAGE|B-?ROLL)/i;
// choices = { [screen]: { [group]: true|false } }, only what the author switched; anything else falls back to the table
function markOn(g, screen, choices) {
  const c = choices && choices[screen];
  if (c && typeof c[g] === "boolean") return c[g];
  return !!(MARK_DEFAULT[g] && MARK_DEFAULT[g].includes(screen));
}
// A stored choice is untrusted (old builds, hand edits): keep only known screens and groups with a boolean.
function markChoicesClean(o) {
  const out = {};
  if (!o || typeof o !== "object" || Array.isArray(o)) return out;
  for (const s of MARK_SCREENS) {
    const c = o[s];
    if (!c || typeof c !== "object") continue;
    for (const g of MARK_GROUPS) if (typeof c[g] === "boolean") (out[s] = out[s] || {})[g] = c[g];
  }
  return out;
}
// R: analyze() result. x: what the UI computes with the page's state: blocks [{s, e}] (paragraphs), ads [{pos}] (adBreaks via
// editMarks), rehooks [{pos, gap}] (rehookPoints), chaps [{pos, label}] (the chapters of the description).
function marksOf(text, R, x) {
  x = x || {};
  const T = (p) => (R && R.timeAt ? R.timeAt(p) : 0);
  const n = (text || "").length, inText = (a, b) => Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b <= n && b > a;
  const lvl = (cat) => ((R && R.preflight) || []).find((p) => p.id === cat) || {};
  const out = {};
  let k = 0;
  out.para = (x.blocks || []).filter((b) => /\S/.test(text.slice(b.s, b.e))).map((b) => ({ n: ++k, pos: b.s, t: T(b.s) }));
  out.quote = ((R && R.quoteSpans) || []).filter((q) => inText(q.start, q.end)).map((q) => ({ start: q.start, end: q.end }));
  out.ref = ((R && R.refs) || []).filter((r) => inText(r.start, r.end)).map((r) => ({ start: r.start, end: r.end, label: r.canonical || r.text }));
  out.ad = (x.ads || []).filter((a) => Number.isInteger(a.pos)).map((a) => ({ pos: a.pos, t: T(a.pos) }));
  out.rehook = (x.rehooks || []).filter((a) => Number.isInteger(a.pos)).map((a) => ({ pos: a.pos, t: T(a.pos), gap: !!a.gap }));
  out.chap = (x.chaps || []).filter((a) => Number.isInteger(a.pos)).map((a, i) => ({ pos: a.pos, t: T(a.pos), n: i + 1, label: String(a.label || "") }));
  out.cta = [];
  for (const c of (R && R.clusters) || []) for (const it of c.items || []) if (inText(it.start, it.end)) out.cta.push({ start: it.start, end: it.end, t: T(it.start), label: it.text });
  out.cue = ((R && R.cues) || []).filter((c) => !c.heading && !c.pause && MARK_VISUAL_CUE.test(c.kind || "") && inText(c.start, c.end))
    .map((c) => ({ start: c.start, end: c.end, t: T(c.start), label: String(c.kind).toUpperCase() }));
  // a word the rules mark green («mencionado») is not a risk: same reading as the rail
  out.risk = ((R && R.riskHits) || []).filter((r) => inText(r.start, r.end) && (lvl(r.cat).level || "amarillo") !== "verde")
    .map((r) => ({ start: r.start, end: r.end, level: lvl(r.cat).level || "amarillo", label: r.text }));
  out.fill = ((R && R.mulHits) || []).filter((r) => inText(r.start, r.end)).map((r) => ({ start: r.start, end: r.end, label: r.text }));
  for (const g of ["ad", "rehook", "chap", "cta", "cue", "risk", "fill"]) out[g].sort((a, b) => (a.pos ?? a.start) - (b.pos ?? b.start));
  return out;
}
// 5A: a section fixed in «Secciones principales» gets no new marks in the detailed review. Kept inside it: paragraph numbers,
// quotes and references (they describe the text, they ask nothing) and red ad risks (a script that loses its ads can't wait).
function marksOutside(m, locked) {
  if (!locked || !locked.length) return m;
  const inL = (a, b) => locked.some((r) => a < r.end && b > r.start);
  const out = { ...m };
  for (const g of ["ad", "rehook", "chap", "cta", "cue", "fill"]) out[g] = m[g].filter((x) => !inL(x.pos ?? x.start, (x.end ?? x.pos) + (x.end ? 0 : 1)));
  out.risk = m.risk.filter((x) => x.level === "rojo" || !inL(x.start, x.end));
  return out;
}
