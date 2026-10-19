// ---------- Color families for the text (pure) ----------
// One table decides how a finding looks everywhere: the paragraph review, the fix cards and the marked script.
// Color is never the only cue: each family also has its own line style (see guide.css).
//   hi   can remove ads      red fill, thick solid underline
//   mid  can limit ads       orange fill, solid underline
//   cut  would be removed    struck through (what the fix on screen deletes)
//   fill filler words        purple fill, dotted underline
//   pol  words to polish     blue wavy underline (generic word, regional form, sounds generated)
const CATS = [{ id: "hi", pri: 5 }, { id: "mid", pri: 4 }, { id: "cut", pri: 3 }, { id: "fill", pri: 2 }, { id: "pol", pri: 1 }];
const CAT_PRI = Object.fromEntries(CATS.map((c) => [c.id, c.pri]));
// engine mark (R.marks) -> family; null = keeps its own styling (greeting, call to action, reference, keyword, quote)
function catOfKind(kind, level) {
  if (kind === "risk") return level === "rojo" ? "hi" : level === "amarillo" ? "mid" : null;
  if (kind === "muletilla") return "fill";
  if (kind === "weak" || kind === "regional" || kind === "aitell") return "pol";
  return null;
}
// fix card -> family of its evidence (cards about structure default to "pol": a sentence to polish)
function catOfCard(card) {
  const id = card && card.id || "";
  if (/^pf-/.test(id)) return card.level === "rojo" ? "hi" : "mid";
  if (id === "muletillas") return "fill";
  return "pol";
}
