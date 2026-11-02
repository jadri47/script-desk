// Marks in the text (marks_logic.js; Adrian, 2026-11-01, 7A): the per-screen table, remembered choices, the lists per group and
// what a fixed section keeps in the detailed review.
const L = require("../build/logic.js");
const fs = require("fs");
const path = require("path");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const EX = JSON.parse(fs.readFileSync(path.join(__dirname, "../build/examples.json"), "utf8"));

// the mockup's table «Qué marcas se ven en cada pantalla», row by row
const TABLE = {
  secs: [0, 1, 1, 0], para: [1, 1, 1, 1], quote: [1, 1, 1, 1], ref: [1, 1, 1, 1], ad: [0, 0, 1, 1], chap: [0, 0, 1, 1],
  rehook: [0, 1, 1, 0], cta: [0, 1, 1, 1], cue: [0, 1, 1, 1], risk: [0, 0, 1, 0], fill: [0, 0, 1, 0],
};
const bad = [];
for (const g of L.MARK_GROUPS) L.MARK_SCREENS.forEach((s, i) => { if (L.markOn(g, s, {}) !== !!TABLE[g][i]) bad.push(g + "@" + s); });
ok("defaults: every group on every screen is the mockup's table", !bad.length && Object.keys(TABLE).length === L.MARK_GROUPS.length, bad);
// a choice belongs to its screen
const ch = { detail: { fill: false }, secs: { fill: true } };
ok("choice: fillers off in the detailed review, on in the main sections, the others still the table", L.markOn("fill", "detail", ch) === false && L.markOn("fill", "secs", ch) === true && L.markOn("fill", "pub", ch) === false && L.markOn("para", "detail", ch) === true);
const cl = L.markChoicesClean({ detail: { fill: false, para: "no", bogus: true }, nope: { para: false }, secs: 3 });
ok("stored choices: only known screens and groups with a boolean survive", JSON.stringify(cl) === JSON.stringify({ detail: { fill: false } }), JSON.stringify(cl));
ok("stored choices: junk gives the table", JSON.stringify(L.markChoicesClean("x")) === "{}" && JSON.stringify(L.markChoicesClean([1])) === "{}" && JSON.stringify(L.markChoicesClean(null)) === "{}");

// the lists come from what the analysis found, one entry each
{
  const text = EX.es.mid.text, R = L.analyze(text, { uiLang: "es", lang: "es" });
  const blocks = []; let at = 0; for (const p of text.split("\n")) { blocks.push({ s: at, e: at + p.length }); at += p.length + 1; }
  const m = L.marksOf(text, R, { blocks, ads: [{ pos: 500 }], rehooks: [{ pos: 900, gap: true }], chaps: [{ pos: 0, label: "Uno" }, { pos: 800, label: "Dos" }] });
  const ctas = R.clusters.reduce((n, c) => n + c.items.length, 0);
  ok("mid: one quote mark per quote, one reference per reference, one filler per filler", m.quote.length === R.quoteSpans.length && m.ref.length === R.refs.length && m.fill.length === R.mulHits.length && m.fill.length > 0, [m.quote.length, m.ref.length, m.fill.length]);
  ok("mid: every call to action is marked on its own words", m.cta.length === ctas && m.cta.every((c) => /suscr|comp[aá]rt/i.test(text.slice(c.start, c.end))), m.cta);
  ok("mid: paragraph numbers skip empty lines and count from 1", m.para.length === text.split("\n").filter((x) => /\S/.test(x)).length && m.para[0].n === 1 && m.para[m.para.length - 1].n === m.para.length);
  ok("mid: on-screen cues are the visual ones, not headings", m.cue.length === R.cues.filter((c) => !c.heading && !c.pause && /^(TEXTO|TEXT|CITA|QUOTE|GR[AÁ]FICO|GRAPHIC|IMAGEN|IMAGE|B-?ROLL)/i.test(c.kind)).length && m.cue.every((c) => /^\[/.test(text.slice(c.start, c.end))), m.cue);
  ok("mid: a risk word the rules read as «mencionado» (green) is not marked", m.risk.length === R.riskHits.filter((r) => ((R.preflight.find((p) => p.id === r.cat) || {}).level || "amarillo") !== "verde").length, [R.riskHits.length, m.risk.length]);
  ok("times: each mark carries the minute the analysis gives its position", m.para.every((p) => p.t === R.timeAt(p.pos)) && m.chap[1].t === R.timeAt(800) && m.rehook[0].gap === true && m.chap[1].n === 2);
  const junk = L.marksOf(text, { ...R, refs: [{ start: -1, end: 4 }, { start: 5, end: 5 }, { start: 3, end: 1e9 }] }, {});
  ok("positions outside the text are dropped, never clamped", junk.ref.length === 0);

  // 5A: inside a fixed section the detailed review adds nothing new; numbers, quotes, references and red risks stay
  const lock = [{ k: "hook", start: 0, end: 1000 }];
  const red = { ...m, risk: [{ start: 10, end: 15, level: "rojo" }, { start: 20, end: 25, level: "amarillo" }, { start: 1200, end: 1210, level: "amarillo" }] };
  const o = L.marksOutside(red, lock);
  ok("fixed section: no ad break, re-hook, chapter, call to action, cue or filler inside it", ["ad", "rehook", "chap", "cta", "cue", "fill"].every((g) => o[g].every((x) => (x.pos ?? x.start) >= 1000)) && o.ad.length === 0 && o.rehook.length === 0 && o.chap.length === 0);
  ok("fixed section: numbers, quotes and references stay; a red risk stays, a yellow one inside goes", o.para.length === m.para.length && o.quote.length === m.quote.length && o.ref.length === m.ref.length && JSON.stringify(o.risk.map((r) => r.start)) === "[10,1200]", o.risk);
  ok("no fixed section: nothing changes", L.marksOutside(m, []) === m);
}
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exitCode = fails ? 1 : 0;
