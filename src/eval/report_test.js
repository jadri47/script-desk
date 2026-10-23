// Editor's report: readiness score, prompt, and the vetting of the AI's answer (pure; fixture JSON, no model). Run from src: node eval/report_test.js
const L = require("../build/logic.js");
const ex = JSON.parse(require("fs").readFileSync(__dirname + "/../build/examples.json", "utf8"));
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : extra); } else console.log("ok  ", name); };
const opts = (e, lg) => ({ title: e.title, keyword: e.keyword, thumb: e.thumb, description: e.description, series: e.series, nextEp: e.nextEp, bigIdea: e.bigIdea, translation: e.translation, uiLang: lg, lang: lg });
const rep = (n) => ({ areas: Object.fromEntries(L.REPORT_AREAS.map((k) => [k, { rating: n, why: "x" }])) });

const E = ex.es.best, O = opts(E, "es"), R = L.analyze(E.text, O);
const spans = L.verseSpans(E.text, R), verse = spans.filter((s) => s.kind !== "ref");
const clear = (s) => !verse.some((v) => s.start < v.end && s.start + s.text.length > v.start);
// sentences of the excelente demo that sit away from Scripture and occur once: safe places for fixture changes
const sents = R.sents.filter((s) => s.text.length > 30 && s.text.length < 160 && clear(s) && E.text.split(s.text).length === 2 && !/[⟦⟧\n]/.test(s.text));
ok("fixture: the demo has clean sentences and a verse", sents.length >= 4 && verse.length >= 1, `${sents.length} sentences, ${verse.length} verses`);

// ---- score
{
  const r = L.readinessOf(R, null);
  ok("excelente: rules part 40/40", r.rules === 40 && r.rulesMax === 40, JSON.stringify(r.parts));
  ok("no report: score null, no editor part, rules given", r.score === null && r.editor === null && r.rules === 40);
  ok("excelente, all 4s = 40 + 54 = 94", L.readinessOf(R, rep(4)).score === 94, L.readinessOf(R, rep(4)).score);
  ok("excelente, all 5s = 100", L.readinessOf(R, rep(5)).score === 100);
  ok("a missing rating counts 0 once a report exists", L.readinessOf(R, { areas: { ...rep(5).areas, hook: { rating: null } } }).score === 90);
  ok("rating map 1..5 -> 0,4,7,9,10", [1, 2, 3, 4, 5].map((n) => L.readinessOf(R, { areas: { hook: { rating: n } } }).editor).join() === "0,4,7,9,10");
}
{
  const w = ex.es.worst, Ow = opts(w, "es"), Rw = L.analyze(w.text, Ow), r = L.readinessOf(Rw, rep(5));
  ok("pésimo: red => ads part 0", r.red === true && r.parts.ads === 0, JSON.stringify(r.parts));
  ok("pésimo: red => score <= 69 even with all 5s", r.score <= 69, r.score);
  ok("pésimo, no report: score null, red flagged", L.readinessOf(Rw, null).score === null && L.readinessOf(Rw, null).red);
  const all = new Set(Object.values(Rw.sections).flat().map((x) => x.id));
  ok("dismissed rows count as passed in the rules part (the red cap stays)", L.readinessOf(Rw, rep(5), all).rules > r.rules && L.readinessOf(Rw, rep(5), all).score <= 69);
  const b = ex.es.bad, Rb = L.analyze(b.text, opts(b, "es")), rb = L.readinessOf(Rb, null);
  ok("bueno: line-level checks do not count (rules part from ads/pack/length only)", rb.rules === rb.parts.ads + rb.parts.pack + rb.parts.len && rb.rules < 40, JSON.stringify(rb.parts));
}

// ---- vetReport
const good = { area: "hook", original: sents[0].text, replacement: sents[0].text + " Quédate hasta el final.", why: "w", after: 5 };
{
  const j = (items) => ({ areas: rep(4).areas, items });
  const v0 = L.vetReport(E.text, j([good]), O, R);
  ok("vet keeps a clean item with its range and a check", v0.items.length === 1 && v0.dropped === 0 && v0.items[0].start === E.text.indexOf(good.original) && v0.items[0].end === v0.items[0].start + good.original.length && v0.items[0].check && v0.items[0].after === 5 && v0.items[0].area === "hook", JSON.stringify(v0.items.map((x) => [x.start, x.end])));
  const notFound = { ...good, original: "esta frase no existe en el guion de ninguna manera" };
  const twice = (() => { const w = "Padre"; return { ...good, original: w }; })();
  const v = verse[0], overl = { ...good, original: E.text.slice(Math.max(0, v.start - 12), v.start + 20) };
  const tokRep = { ...good, original: sents[1].text, replacement: "⟦V1⟧ " + sents[1].text };
  const bad = { ...good, original: sents[2].text, replacement: sents[2].text + " Qué mierda." };
  const badArea = { ...good, original: sents[3].text, area: "other" };
  const tokOrig = { ...good, original: "antes ⟦V1⟧ después" };
  ok("fixture: «Padre» occurs more than once", E.text.split("Padre").length > 2);
  const cases = [["original not in the text", notFound], ["original occurs twice", twice], ["range overlaps a verse", overl], ["replacement contains ⟦V1⟧", tokRep], ["replacement adds a profane word", bad], ["unknown area", badArea]];
  for (const [name, it] of cases) {
    const r = L.vetReport(E.text, j([it, good]), O, R);
    ok(`vet drops: ${name}`, r.items.length === 1 && r.items[0].original === good.original && r.dropped === 1, `${r.items.length} kept, ${r.dropped} dropped`);
  }
  // an original that carries a ⟦Vn⟧ token is unmasked back to the verse, so it necessarily overlaps the verse: dropped
  const mk = L.maskVerses(E.text, spans, 0, E.text.length);
  const around = (() => { const s = verse[0]; return E.text.slice(Math.max(0, s.start - 15), s.start); })();
  const withTok = { ...good, original: around + mk.toks[0].tok };
  const rt = L.vetReport(E.text, j([withTok]), O, R);
  ok("vet: an original with a ⟦V1⟧ token is unmasked, located, and dropped for touching the verse", rt.items.length === 0 && rt.dropped === 1 && E.text.includes(around + mk.toks[0].text));
  ok("vet: a token that is not ours is dropped", L.vetReport(E.text, j([tokOrig]), O, R).dropped === 1);
  const all = L.vetReport(E.text, j([notFound, twice, overl, tokRep, bad, good]), O, R);
  ok("dropped counts every removed item", all.items.length === 1 && all.dropped === 5, `${all.items.length}/${all.dropped}`);
  // overlap between two kept items, and the 7-item cap
  const dup = L.vetReport(E.text, j([good, { ...good, original: good.original.slice(0, 40) + " " }]), O, R);
  ok("vet drops an item that overlaps one already kept", dup.items.length === 1 && dup.dropped === 1 && dup.items[0].original === good.original, `${dup.items.length} kept, ${dup.dropped} dropped`);
  ok("fixture: 9 clean sentences for the cap", sents.length >= 9, sents.length);
  const many = sents.slice(0, 9).map((s) => ({ ...good, original: s.text, replacement: s.text + " Quédate." }));
  const cap = L.vetReport(E.text, j(many), O, R);
  ok("vet keeps exactly 7 of 9 clean items, the rest counted as dropped", cap.items.length === 7 && cap.dropped === 2, `${cap.items.length} kept, ${cap.dropped} dropped`);
  // areas normalised
  const na = L.vetReport(E.text, { areas: { hook: { rating: 9 }, promise: { rating: "4.4" }, retention: { rating: 0 }, voice: {}, close: { rating: 5, why: "ok" } }, items: [] }, O, R).areas;
  ok("areas: out of range / missing -> null, otherwise clamped integers", na.hook.rating === null && na.promise.rating === 4 && na.retention.rating === null && na.voice.rating === null && na.close.rating === 5 && na.return.rating === null, JSON.stringify(na));
  ok("vet survives garbage", L.vetReport(E.text, null, O, R).items.length === 0 && L.vetReport(E.text, { items: "x" }, O, R).dropped === 0);
}

// ---- projected
{
  const v = L.vetReport(E.text, { areas: rep(3).areas, items: [good, { area: "close", original: sents[1].text, replacement: sents[1].text + " Hasta pronto.", why: "w", after: 4 }] }, O, R);
  const cur = L.readinessOf(R, v).score, P = L.projectedReadiness(E.text, R, O, v);
  ok("projected >= current for a clean fixture", P >= cur && P <= 100 && v.items.length === 2, `${P} vs ${cur}, ${v.items.length} items`);
  ok("projected counts each item's `after` (hook 3->5 = +3, close 3->4 = +2)", P === cur + 5, `${P} vs ${cur}`);
  const none = L.projectedReadiness(E.text, R, O, { areas: rep(3).areas, items: [] });
  ok("projected with no items = current", none === L.readinessOf(R, rep(3)).score);
}

// ---- under 8 minutes costs in readiness (no mid-roll ads), although scoreOf weighs runtime 0
{
  const short = E.text.split(/\s+/).slice(0, 700).join(" "), Rs = L.analyze(short, O);
  const rt = Object.values(Rs.sections).flat().find((r) => r.id === "runtime");
  const other = Object.values(Rs.sections).flat().filter((r) => (r.id === "cta" || r.id === "ending") && (!r.passed || r.warn)).reduce((a, r) => a + L.weightOf(r), 0);
  ok("a short script fails runtime and loses exactly 4 for it in the length part", rt && !rt.passed && L.readinessOf(Rs, null).parts.len === Math.max(0, 8 - 4 - other), rt && [L.readinessOf(Rs, null).parts, other]);
}

// ---- prompt
{
  const p = L.reportPrompt(E.text, R, O), mk = L.maskVerses(E.text, spans, 0, E.text.length);
  ok("prompt ends with the masked script", p.endsWith(`"""\n${mk.masked}\n"""`));
  const q = E.text.slice(verse[0].start, verse[0].end);
  ok("prompt has no raw verse text", q.length > 20 && !p.includes(q) && p.includes("⟦V1⟧"), q.slice(0, 40));
  ok("prompt asks for exact copies and unchanged marks", /EXACTO/.test(p) && /nunca pongas una marca en "replacement"/.test(p) && /"areas"/.test(p));
  const pk = L.reportPrompt(E.text, R, { ...O, keyword: "" });
  ok("an empty keyword field falls back to the app's own pick", pk.includes(`Palabra clave: ${R.keyword}.`) && R.keyword.length > 2, R.keyword);
  const en = ex.en.best, Re = L.analyze(en.text, opts(en, "en")), pe = L.reportPrompt(en.text, Re, opts(en, "en"));
  ok("English script gets the English brief, script still last", /You are an editor/.test(pe) && /never put a mark in "replacement"/.test(pe) && pe.endsWith('\n"""') && !/Eres editor/.test(pe));
}
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
