// Coach decision queue (pure). Run from src: node eval/coach_test.js
const L = require("../build/logic.js");
const ex = JSON.parse(require("fs").readFileSync(__dirname + "/../build/examples.json", "utf8"));
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : extra); } };
const opts = (e, lg, over = {}) => ({ title: e.title, keyword: e.keyword, thumb: e.thumb, description: e.description, series: e.series, nextEp: e.nextEp, bigIdea: e.bigIdea, translation: e.translation, uiLang: lg, lang: lg, ...over });
const RANK = { risk: 0, batch: 1, question: 2, choice: 3, note: 4 };
const HITS = { muletillas: "mulHits", weak: "weakHits", regional: "regHits" };
const stats = [];
for (const lg of ["es", "en"]) for (const k of ["worst", "bad", "mid", "good", "best"]) {
  const e = ex[lg][k], o = opts(e, lg), R = L.analyze(e.text, o), tag = `${lg}/${k}`;
  const D = L.buildDecisions(e.text, R, o, new Set()), cur = L.scoreOf(R).score;
  // order: risk, batch, question, choice, note
  ok(`${tag}: order risk>batch>question>choice>note`, D.every((d, i) => !i || RANK[D[i - 1].kind] <= RANK[d.kind]), D.map((d) => d.kind).join());
  const ch = D.filter((d) => d.kind === "choice");
  ok(`${tag}: choices by gain desc`, ch.every((d, i) => !i || ch[i - 1].gain >= d.gain), ch.map((d) => d.gain).join());
  ok(`${tag}: one batch at most`, D.filter((d) => d.kind === "batch").length <= 1);
  ok(`${tag}: ids unique`, new Set(D.map((d) => d.id)).size === D.length);
  // every decision can be acted on
  for (const d of D) ok(`${tag}: ${d.id} has options, is a question/note or needsAi`, d.options.length > 0 || d.kind === "question" || d.kind === "note" || d.needsAi === true);
  for (const d of D.filter((x) => x.kind === "question")) ok(`${tag}: question ${d.id} has ask`, ["bigIdea", "keyword", "nextEp", "title"].includes(d.ask));
  for (const d of D.filter((x) => x.kind === "risk")) ok(`${tag}: risk ${d.id} is red`, d.card.level === "rojo");
  // batch
  const B = D.find((d) => d.kind === "batch");
  let after = null;
  if (B) {
    const it = B.items, sorted = [...it].sort((a, b) => a.start - b.start || a.end - b.end);
    ok(`${tag}: batch items non-overlapping`, sorted.every((x, i) => !i || x.start >= sorted[i - 1].end), JSON.stringify(sorted.find((x, i) => i && x.start < sorted[i - 1].end)));
    const sum = Object.values(B.fam).reduce((a, b) => a + b, 0);
    ok(`${tag}: fam counts sum to items`, sum === it.length, `${sum} vs ${it.length}`);
    ok(`${tag}: batch option breaks nothing`, B.options[0].check.broke.length === 0, B.options[0].check.broke.join());
    ok(`${tag}: batch is a single patch option with every item`, B.options.length === 1 && B.options[0].patches.length === it.length);
    ok(`${tag}: batch gain = score after - score now`, B.gain === B.options[0].check.score - cur);
    // counts reconcile: re-analysing the batch text removes those hits (each applied patch removes its hit)
    const R2 = L.analyze(B.options[0].check.text, B.options[0].check.opts);
    after = L.scoreOf(R2).score;
    for (const [f, key] of Object.entries(HITS)) {
      const n = B.fam[f] || 0, b = (R[key] || []).length, a = (R2[key] || []).length;
      ok(`${tag}: ${f} hits drop by at least the ${n} fixed`, b - a >= n, `${b} -> ${a}`);
    }
    if (B.fam.pulpit) ok(`${tag}: pulpit hits drop`, ((R.msg || {}).pulpit || []).length - ((R2.msg || {}).pulpit || []).length >= B.fam.pulpit);
    ok(`${tag}: score after the batch >= now`, after >= cur, `${after} < ${cur}`);
    // a card the batch covers is not offered again
    for (const id of B.ids) ok(`${tag}: covered card ${id} not repeated`, !D.some((d) => d.id === id));
  }
  const P = L.projectedScore(e.text, R, o, D, new Set());
  ok(`${tag}: projected >= current`, P >= cur, `${P} < ${cur}`);
  if (after !== null) ok(`${tag}: projected >= batch alone`, P >= after, `${P} < ${after}`);
  stats.push(`${tag}: ${["risk", "batch", "question", "choice", "note"].map((x) => x + " " + D.filter((d) => d.kind === x).length).join(", ")}; batch ${B ? B.items.length + " " + JSON.stringify(B.fam) : "-"}; ${cur} -> ${P}`);
}
// overlap rule (synthetic: no demo has two safe fixes on the same words)
{
  const kept = L.coachNoOverlap([{ start: 10, end: 20, fam: "a" }, { start: 5, end: 12, fam: "b" }, { start: 20, end: 20, fam: "c" }, { start: 14, end: 16, fam: "d" }, { start: 30, end: 30, fam: "e" }]);
  ok("overlap: the later of two overlapping items is dropped, touching kept", kept.map((x) => x.fam).join() === "b,d,c,e", kept.map((x) => x.fam).join());
}
// dismissed rows never come back
{
  const e = ex.es.bad, o = opts(e, "es"), R = L.analyze(e.text, o);
  const all = L.buildDecisions(e.text, R, o, new Set()), gone = all.find((d) => d.kind === "choice");
  if (gone) { const D2 = L.buildDecisions(e.text, R, o, new Set(gone.ids)); ok("dismissed card is not queued", !D2.some((d) => d.id === gone.id)); }
}
// questions: no big idea / keyword / next episode / title
for (const lg of ["es", "en"]) {
  const e = ex[lg].worst, o = opts(e, lg, { bigIdea: "", keyword: "", nextEp: "", title: "" }), R = L.analyze(e.text, o);
  const asks = L.buildDecisions(e.text, R, o, new Set()).filter((d) => d.kind === "question").map((d) => d.ask);
  ok(`${lg}: bare options raise questions`, asks.length > 0, asks.join());
  ok(`${lg}: no question asked twice`, new Set(asks).size === asks.length, asks.join());
}
// question choices: real text from the script or the rules, R.keyword first (jadri47, 2026-10-22)
for (const lg of ["es", "en"]) for (const k of ["worst", "bad", "mid", "good"]) {
  const e = ex[lg][k], o = opts(e, lg, { bigIdea: "", keyword: "", nextEp: "", title: "" }), R = L.analyze(e.text, o), tag = `${lg}/${k}`;
  const flat = (x) => x.replace(/\s+/g, " ").toLowerCase(), body = flat(e.text), kc = R.kwCands || [];
  ok(`${tag}: R.keyword equals the first candidate`, !R.keyword || (kc[0] && kc[0].phrase === R.keyword), JSON.stringify(kc[0]) + " / " + R.keyword);
  ok(`${tag}: at most 4 distinct candidates`, kc.length <= 4 && new Set(kc.map((x) => x.phrase)).size === kc.length);
  ok(`${tag}: every keyword candidate is in the script and counted`, kc.every((x) => x.n >= 1 && body.includes(x.phrase)), JSON.stringify(kc));
  const D = L.buildDecisions(e.text, R, o, new Set());
  for (const d of D.filter((x) => x.kind === "question")) {
    const ch = L.coachQuestionChoices(d.ask, R, o, d.card, {});
    if (d.ask === "keyword") ok(`${tag}: keyword choices start with R.keyword`, !R.keyword || (ch[0] && ch[0].text === R.keyword), JSON.stringify(ch));
    if (d.ask === "bigIdea") ok(`${tag}: bigIdea choices are script sentences of at most 140 chars`, ch.every((c) => c.text.length <= 140 && body.includes(flat(c.text))), JSON.stringify(ch));
    if (d.ask === "title") ok(`${tag}: title choices fit 60 chars`, ch.every((c) => c.text.length <= 60), JSON.stringify(ch));
  }
}
{
  const R = { lang: "es", kwCands: [] };
  const prods = [{ id: "a", title: "Hoy", pubDate: "2026-10-01" }, { id: "b", title: "Más adelante", pubDate: "2026-10-15" }, { id: "c", title: "Después", pubDate: "2026-10-22" }, { id: "d", title: "", pubDate: "2026-10-10" }];
  const ch = L.coachQuestionChoices("nextEp", R, {}, null, { prods, curId: "a", pubDate: "2026-10-01" });
  ok("nextEp: the next planned episode by date, untitled ones skipped", ch.length === 1 && ch[0].text === "Más adelante", JSON.stringify(ch));
  ok("nextEp: no plan, no choice", L.coachQuestionChoices("nextEp", R, {}, null, { prods: [], curId: "a", pubDate: "2026-10-01" }).length === 0);
}
// automatic AI: Scripture is masked before sending and an option that touches a token is dropped (jadri47, 2026-10-22)
{
  const text = "Hoy empezamos, o sea, con calma. En Juan 3:16 dice: «Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna». Eso es todo lo que hace falta, ya sabes, para entender el evangelio.";
  const R = L.analyze(text, { title: "", keyword: "", thumb: "", description: "", translation: "RVR1960", lang: "es" }), spans = L.verseSpans(text, R);
  const v = spans.find((x) => x.kind !== "ref");
  ok("ai mask: the verse is a span", !!v);
  const outside = L.coachAiMask(text, spans, 0, v.start - 10, 400);
  ok("ai mask: a fragment before the verse has no tokens and its context holds the verse as one token", outside && outside.frag.toks.length === 0 && outside.ctx.toks.length === 1 && !outside.ctx.masked.includes("Porque de tal manera"), JSON.stringify(outside && outside.ctx.masked));
  ok("ai mask: a fragment cutting a verse is refused", L.coachAiMask(text, spans, v.start + 5, v.end + 10, 400) === null);
  const whole = L.coachAiMask(text, spans, 20, text.length, 400), orig = text.slice(20);
  ok("ai mask: the fragment masks the verse", whole.frag.toks.length === 1 && whole.frag.masked.includes(whole.frag.toks[0].tok) && !whole.frag.masked.includes("Porque de tal manera"));
  const tok = whole.frag.toks[0].tok;
  const good = whole.frag.masked.replace("Eso es todo lo que hace falta, ya sabes, para", "Eso es todo lo que hace falta para");
  ok("ai vet: the same tokens come back untouched", L.vetSection(orig, whole.frag.toks, good, []).ok);
  ok("ai vet: an altered token is dropped", !L.vetSection(orig, whole.frag.toks, good.replace(tok, "⟦V9⟧"), []).ok);
  ok("ai vet: a missing token is dropped", !L.vetSection(orig, whole.frag.toks, good.replace(tok, ""), []).ok);
  ok("ai vet: a duplicated token is dropped", !L.vetSection(orig, whole.frag.toks, good + " " + tok, []).ok);
  ok("ai vet: rewritten Bible text is dropped", !L.vetSection(orig, whole.frag.toks, good.replace(tok, "«Porque Dios amó tanto al mundo»"), []).ok);
  const d = (id, ai, needs) => ({ id, needsAi: needs, card: { id, ai } });
  const list = [d("a", {}, true), d("b", {}, false), d("c", {}, true), d("e", null, true), d("f", {}, true)];
  ok("ai pick: only needsAi with a range, not yet requested, in order, capped", L.coachAiPick(list, (x) => x === "a", 8).map((x) => x.id).join() === "c,f" && L.coachAiPick(list, () => false, 1).length === 1);
}
if (process.argv.includes("-v")) console.log(stats.join("\n"));
console.log(fails ? `${fails} FAIL` : "ALL PASS");
process.exit(fails ? 1 : 0);
