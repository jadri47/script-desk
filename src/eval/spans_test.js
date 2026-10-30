// The span lookups analyze uses for quotes, verses and per-sentence word counts give the same answers as the plain scans they replaced
// (B-040, 2026-10-30: they made every analyze ~45 ms on a 30-minute script). Run from src: node eval/spans_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const naiveInside = (spans, s, e) => spans.some((x) => s >= x.start && e <= x.end);
{ // random (overlapping, unsorted, nested, empty) span lists against random words
  let bad = 0, n = 0;
  for (let round = 0; round < 300; round++) {
    const spans = Array.from({ length: Math.floor(rnd() * 8) }, () => { const a = Math.floor(rnd() * 200), b = a + Math.floor(rnd() * 60); return { start: a, end: b }; });
    const t = L.insideTester(spans);
    for (let q = 0; q < 40; q++) { const s = Math.floor(rnd() * 220), e = s + Math.floor(rnd() * 15); n++; if (t(s, e) !== naiveInside(spans, s, e)) bad++; }
  }
  ok(`insideTester equals insideAny on ${n} random lookups`, bad === 0, bad);
  ok("insideTester of no spans is never inside", L.insideTester([])(0, 1) === false);
}
{ // words in a span: same set as the filter, for sentences that cut words, touch them, or hold none
  let bad = 0, n = 0;
  for (let round = 0; round < 200; round++) {
    const ws = []; let p = Math.floor(rnd() * 5);
    while (p < 300) { const len = 1 + Math.floor(rnd() * 8); ws.push({ start: p, end: p + len }); p += len + 1 + Math.floor(rnd() * 3); }
    for (let q = 0; q < 20; q++) {
      const s = { start: Math.floor(rnd() * 300), end: 0 }; s.end = s.start + Math.floor(rnd() * 80);
      const want = ws.filter((w) => w.start >= s.start && w.end <= s.end), [a, b] = L.wordsWithin(ws, s);
      n++; if (want.length !== b - a || (want.length && (ws[a] !== want[0] || ws[b - 1] !== want[want.length - 1]))) bad++;
    }
  }
  ok(`wordsWithin equals the filter on ${n} random spans`, bad === 0, bad);
}
{ // the memo returns what the count returns, first time and again
  const ws = ["también", "Dios", "creyó", "aleluya", "qué", "hoy", "y", "123", ""];
  ok("syllablesES (memo) equals the plain count, twice", ws.every((w) => L.syllablesES(w) === L.syllablesESCount(w) && L.syllablesES(w) === L.syllablesESCount(w)));
}
{ // analyze on a text with a quote inside a long sentence: the quote's words are not counted toward the 30-word limit
  const quote = "«" + "palabra ".repeat(25).trim() + "»";
  const r = L.analyze(`Hoy dijo Jesús ${quote} y luego explicó con calma lo que quiso decir a todos los que estaban allí presentes.`, { uiLang: "es", lang: "es" });
  const long = Object.values(r.sections).flat().find((c) => c.id === "long");
  ok("a sentence whose length is mostly a quote is not «long»", long && long.passed === true, long && long.info);
  const own = Array.from({ length: 35 }, () => "cosa").join(" ");
  const r2 = L.analyze(`Hoy dijo Jesús ${quote} y ${own}.`, { uiLang: "es", lang: "es" });
  ok("35 own words + a quote is «long»", Object.values(r2.sections).flat().find((c) => c.id === "long").passed === false);
}
console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
process.exit(fails ? 1 : 0);
