// ---------- Rail items (pure): what the time rail and the minimap show for one script ----------
// shapes (timeline markers): risk, promise, cta, ref. cues (notes for the speaker/editor): hook, intro, cta (PEDIDO), rehook, broll, ad.
// `ems` is the list from editMarks(); R is the analysis result. Everything is keyed by text position.
const RAIL_SHAPES = ["risk", "promise", "cta", "ref"];
const RAIL_CUES = ["hook", "intro", "cta", "rehook", "broll", "ad"];
const RAIL_LETTER = { hook: "H", intro: "I", cta: "P", rehook: "R", broll: "B", ad: "A" };
function railItems(R, ems) {
  const out = [];
  const T = (p) => (R && R.timeAt ? R.timeAt(p) : 0);
  for (const x of (R && R.riskHits) || []) {
    const lvl = ((R.preflight || []).find((p) => p.id === x.cat) || {}).level || "amarillo";
    if (lvl !== "verde") out.push({ pos: x.start, t: T(x.start), shape: "risk", text: x.text, level: lvl });
  }
  for (const r of (R && R.refs) || []) out.push({ pos: r.start, t: T(r.start), shape: "ref", text: r.canonical });
  for (const e of ems || []) {
    if (e.kind === "promise") out.push({ pos: e.pos, t: T(e.pos), shape: "promise", label: e.label, tip: e.tip });
    if (e.kind === "cta") out.push({ pos: e.pos, t: T(e.pos), shape: "cta", label: e.label, tip: e.tip });
    if (RAIL_CUES.includes(e.kind)) out.push({ pos: e.pos, t: T(e.pos), cue: e.kind, label: e.label, tip: e.tip, warn: !!e.warn });
  }
  out.sort((a, b) => a.pos - b.pos || (a.shape ? 0 : 1) - (b.shape ? 0 : 1));
  return out;
}
// Minimap positions: markers closer than `gap` (fraction of the width) step to another row so none hides another.
function railCrowd(xs, gap = 0.024) {
  const idx = xs.map((x, i) => i).sort((a, b) => xs[a] - xs[b]);
  const lvl = new Array(xs.length).fill(0);
  let last = -1, l = 0;
  for (const i of idx) { l = last >= 0 && xs[i] - last < gap ? (l + 1) % 3 : 0; last = xs[i]; lvl[i] = l; }
  return lvl;
}
