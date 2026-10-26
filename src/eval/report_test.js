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

// ---- alternatives (2026-10-25): other ways to write a change, and words for a flagged term
{
  const j = (items, words) => ({ areas: rep(4).areas, items, words });
  const a1 = sents[0].text + " Quédate conmigo hasta el final.", a2 = sents[0].text + " No te vayas todavía.";
  const v = L.vetReport(E.text, j([{ ...good, alts: ["⟦V1⟧ " + sents[0].text, sents[0].text + " Qué mierda.", good.replacement, a1, 7, a1, a2, sents[0].text + " Y una más."] }]), O, R);
  ok("alts: a verse mark, a profane word, the main replacement, a non-string and a repeat are dropped; at most 2 kept, in order", v.items.length === 1 && JSON.stringify(v.items[0].alts) === JSON.stringify([a1, a2]), JSON.stringify(v.items[0] && v.items[0].alts));
  ok("alts: an item without alts gets an empty list", L.vetReport(E.text, j([good]), O, R).items[0].alts.length === 0);
  ok("alts: a bad alt never drops the item itself", L.vetReport(E.text, j([{ ...good, alts: ["Qué mierda."] }]), O, R).items.length === 1);

  // a flagged word: «tortura» is in the violence list; once in a plain sentence, once inside the first verse
  const s0 = sents[2], at = E.text.indexOf(s0.text) + s0.text.length;
  const T2 = E.text.slice(0, at) + " Tortura fue lo que sufrieron en la cárcel." + E.text.slice(at);
  const R2 = L.analyze(T2, O), hit = R2.riskHits.find((x) => x.text === "Tortura");
  ok("fixture: «Tortura» is flagged as violence", !!hit && hit.cat === "violence", JSON.stringify(R2.riskHits.map((x) => [x.text, x.cat])));
  const w = L.vetReport(T2, j([], [{ term: "tortura", alts: ["golpes", "una masacre", "Tortura", "⟦V1⟧", "Hechos 16:22", "golpes", "azotes", "castigo con varas", "maltrato"] }, { term: "palabra que no está", alts: ["x"] }, { term: 5 }]), O, R2).words;
  ok("words: a risky alternative, the term itself, a verse mark, a reference and a repeat are dropped; at most 3, in order", JSON.stringify(w) === JSON.stringify({ tortura: ["golpes", "azotes", "castigo con varas"] }), JSON.stringify(w));
  ok("words: survives garbage", JSON.stringify(L.vetReport(T2, { areas: {}, items: [], words: "x" }, O, R2).words) === "{}");
  const rw = L.reportWordRows(T2, R2, "violence", w, {});
  ok("rows: one row per flagged term outside Scripture, the patch takes the first alternative with the term's capital", rw.rows.length === 1 && rw.rows[0].hits[0].start === hit.start && rw.patches[0].rep === "Golpes", JSON.stringify(rw));
  ok("rows: the pick (by term) chooses the alternative", L.reportWordRows(T2, R2, "violence", w, { tortura: 2 }).patches[0].rep === "Castigo con varas");
  // the same term twice: one row, both places in the patch, each with its own capital
  const T2b = T2 + "\n\nLa tortura no fue el final.", R2b = L.analyze(T2b, O), rb = L.reportWordRows(T2b, R2b, "violence", w, { tortura: 1 });
  ok("rows: a term found twice is one row and one choice that changes both places", rb.rows.length === 1 && rb.rows[0].hits.length === 2 && rb.patches.map((x) => x.rep).join("|") === "Azotes|azotes", JSON.stringify(rb));
  ok("rows: another category gets none", L.reportWordRows(T2, R2, "drugs", w, {}).rows.length === 0);
  const T3 = T2.slice(0, at) + " La tortura fue lo que sufrieron en la cárcel." + T2.slice(at + " Tortura fue lo que sufrieron en la cárcel.".length);
  const R3 = L.analyze(T3, O), w3 = L.vetReport(T3, j([], [{ term: "tortura", alts: ["golpes"] }]), O, R3).words;
  ok("matchCase: a lower-case term keeps the alternative lower-case", L.reportWordRows(T3, R3, "violence", w3, {}).patches[0].rep === "golpes", JSON.stringify(w3));
  // the same word inside a verse: never a row, and a term found only there gets no alternatives
  const vs = L.verseSpans(T3, R3).filter((s) => s.kind !== "ref")[0], vi = T3.indexOf(" ", vs.start + 5);
  const T4 = T3.slice(0, vi) + " tortura" + T3.slice(vi), R4 = L.analyze(T4, O);
  const inV = R4.riskHits.filter((x) => x.text.toLowerCase() === "tortura");
  ok("fixture: «tortura» found twice, one of them inside a verse", inV.length === 2 && L.verseSpans(T4, R4).some((s) => s.kind !== "ref" && inV.some((x) => x.start >= s.start && x.end <= s.end)), JSON.stringify(inV.map((x) => x.start)));
  const r4 = L.reportWordRows(T4, R4, "violence", { tortura: ["golpes"] }, {});
  ok("rows: the hit inside a verse is never offered", r4.rows.length === 1 && r4.patches.length === 1 && !L.verseSpans(T4, R4).some((s) => s.kind !== "ref" && r4.patches[0].start >= s.start && r4.patches[0].end <= s.end), JSON.stringify(r4));
  const T5 = E.text.slice(0, vi) + " tortura" + E.text.slice(vi), R5 = L.analyze(T5, O);
  ok("words: a term found only inside a verse gets no alternatives", JSON.stringify(L.vetReport(T5, j([], [{ term: "tortura", alts: ["golpes"] }]), O, R5).words) === "{}");
  const p = L.reportPrompt(T2, R2, O);
  ok("prompt asks for alts and for words for the flagged terms", /"alts"/.test(p) && /"words"/.test(p) && p.includes("«Tortura»") && /misma forma gramatical/.test(p));
}

// ---- the same call answers the problems with no rule-made fix (2026-10-25: "read the text once")
{
  const B = ex.es.mid, OB = opts(B, "es"), RB = L.analyze(B.text, OB), spB = L.verseSpans(B.text, RB);
  const need = L.buildDecisions(B.text, RB, OB, new Set()).filter((d) => d.needsAi && d.card && d.card.ai);
  ok("fixture: «regular» has decisions that need the AI", need.length >= 2, need.length);
  const items = need.map((d, k) => L.fixItem(d, "f" + (k + 1), B.text, OB, spB)).filter(Boolean);
  ok("fixItem: masked fragment + context, what is needed to put the answer back", items.length === need.length && items.every((i) => i.frag && i.ctx && i.orig === B.text.slice(B.text.indexOf(i.orig), B.text.indexOf(i.orig) + i.orig.length)), items.length);
  const sent = items.map((i) => ({ id: i.id, problem: "p " + i.id, frag: i.frag, ctx: i.ctx }));
  const p = L.reportPrompt(B.text, RB, { ...OB, fixes: sent }), p0 = L.reportPrompt(B.text, RB, OB), mk = L.maskVerses(B.text, spB, 0, B.text.length);
  ok("prompt with fixes: block before the JSON shape, every id and problem present, the script still last", p.includes("FRAGMENTOS A ARREGLAR") && sent.every((s) => p.includes("=== " + s.id) && p.includes("p " + s.id)) && p.indexOf("FRAGMENTOS A ARREGLAR") < p.indexOf("Responde solo con JSON") && p.endsWith(`"""\n${mk.masked}\n"""`) && /"fixes": \[\{"id": "f1"/.test(p));
  ok("prompt without fixes is the one from before (no block, no \"fixes\" key)", !/FRAGMENTOS|"fixes"/.test(p0));
  ok("prompt with fixes: no raw verse text anywhere", spB.filter((s) => s.kind !== "ref").every((s) => B.text.slice(s.start, s.end).length < 20 || !p.includes(B.text.slice(s.start, s.end))));
  ok("prompt asks for at most 12 fixes", L.reportPrompt(B.text, RB, { ...OB, fixes: Array.from({ length: 20 }, (_, i) => ({ id: "f" + (i + 1), problem: "x", frag: "a", ctx: "b" })) }).split("=== f").length - 1 === 12);

  const V = { id: "f1", orig: "Dice Juan 3:16 hoy", toks: [{ tok: "⟦V1⟧", text: "Juan 3:16" }] }, P = { id: "f2", orig: "Una frase sencilla de ejemplo", toks: [] };
  const fx = (o1, o2) => L.vetFixes({ fixes: [{ id: "f1", options: o1 }, { id: "f2", options: o2 }, { id: "zzz", options: [{ text: "x" }] }] }, [V, P]);
  const r = fx([{ text: "Hoy ⟦V1⟧ lo dice", why: "w" }, { text: "Hoy lo dice", why: "lost the verse" }, { text: "⟦V1⟧ ⟦V2⟧", why: "invented" }, { text: "⟦V1⟧ ⟦V1⟧", why: "twice" }, { text: "Hoy Juan 3:16 lo dice", why: "typed the verse itself" }], [{ text: "Otra frase de ejemplo", why: "a" }, { text: "Una frase sencilla de ejemplo", why: "same" }, { text: "Una tercera frase de ejemplo", why: "b" }, { text: "Una cuarta frase de ejemplo", why: "c" }]);
  ok("vetFixes: keeps a clean option and puts the verse back", r.f1 && r.f1[0].text === "Hoy Juan 3:16 lo dice" && r.f1[0].why === "w", JSON.stringify(r.f1));
  ok("vetFixes: drops an option that loses, invents or repeats a verse mark", r.f1.length === 1 && r.f1[0].why === "w", JSON.stringify(r.f1));
  ok("vetFixes: the verse is never lost (every kept option still contains it, once)", r.f1.every((o) => o.text.split("Juan 3:16").length === 2), JSON.stringify(r.f1));
  ok("vetFixes: drops a copy of the original, keeps at most 2, ignores unknown ids", r.f2.length === 2 && r.f2[0].text === "Otra frase de ejemplo" && !("zzz" in r) && !r.f2.some((o) => o.text === P.orig), JSON.stringify(r));
  ok("vetFixes: survives garbage", JSON.stringify(L.vetFixes(null, [V])) === "{}" && JSON.stringify(L.vetFixes({ fixes: "x" }, [V])) === "{}" && JSON.stringify(L.vetFixes({ fixes: [null, { id: "f1", options: [null, 5, { text: 7 }, {}] }] }, [V])) === "{}" && JSON.stringify(L.vetFixes({ fixes: [] }, null)) === "{}");
  ok("vetFixes: an answer with no fixes key gives none (the old report shape still works)", JSON.stringify(L.vetFixes({ areas: {}, items: [] }, [V, P])) === "{}");
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
