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
  // a swap never softens what Scripture says (jadri47, 2026-10-28, option B): a sentence that reports Scripture keeps its word
  {
    const says = " Como dice la Biblia, habrá una tortura con sangre hasta los frenos de los caballos.";
    const T4 = T2.slice(0, at) + says + T2.slice(at), R4 = L.analyze(T4, O), sAt = T4.indexOf(says) + 1;
    ok("scripture: a sentence that says «como dice la Biblia» is a Scripture sentence; the plain one next to it is not", L.scriptureSentences(T4, R4).some((s) => s.start <= sAt && s.end > sAt + 20) && !L.scriptureSentences(T4, R4).some((s) => s.start <= T4.indexOf("Tortura fue") && s.end > T4.indexOf("Tortura fue")));
    const r4 = L.reportWordRows(T4, R4, "violence", w, {});
    ok("scripture: the row changes only the plain sentence; the Scripture sentence keeps «tortura» and is counted as kept", r4.rows.length === 1 && r4.rows[0].hits.length === 1 && r4.rows[0].hits[0].text === "Tortura" && r4.kept === 1 && L.applyPatches(T4, r4.patches).includes("habrá una tortura con sangre"), JSON.stringify({ hits: r4.rows.map((x) => x.hits), kept: r4.kept }));
    const T5 = T4.replace(" Tortura fue lo que sufrieron en la cárcel.", ""), R5 = L.analyze(T5, O);
    const w5 = L.vetReport(T5, j([], [{ term: "tortura", alts: ["golpes", "azotes"] }]), O, R5).words;
    ok("scripture: a term found only in a sentence that reports Scripture gets no alternative at all", JSON.stringify(w5) === "{}" && L.reportWordRows(T5, R5, "violence", { tortura: ["golpes"] }, {}).rows.length === 0, JSON.stringify(w5));
    ok("scripture: English markers count too", L.scriptureSentences("Intro here. As it says, the river turned to blood. The end.", { refs: [], quotes: [] }).length === 1);
  }
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
  // (Adrian, 2026-10-29: "B: fixes leave the report call") the fragments have their own prompt; the report prompt never carries them
  const p0 = L.reportPrompt(B.text, RB, OB), pw = L.reportPrompt(B.text, RB, { ...OB, fixes: sent }), mk = L.maskVerses(B.text, spB, 0, B.text.length);
  ok("report prompt: no fragments block and no \"fixes\" key, even when opts.fixes is passed", !/FRAGMENTOS A ARREGLAR|FRAGMENTS TO FIX|"fixes"|=== f1/.test(pw) && pw === p0);
  ok("report prompt: the script is still last", p0.endsWith(`"""
${mk.masked}
"""`));
  const p = L.fixesPrompt(sent, OB), pe = L.fixesPrompt(sent, { en: true });
  ok("fixesPrompt: every id and problem present, the JSON shape last, ES and EN", sent.every((s) => p.includes("=== " + s.id) && p.includes("p " + s.id)) && p.includes("FRAGMENTOS A ARREGLAR") && /"fixes": \[\{"id": "f1"/.test(p) && p.trimEnd().endsWith("}]}") && pe.includes("FRAGMENTS TO FIX") && pe.includes("Problem: p f1"));
  ok("fixesPrompt: no raw verse text anywhere", spB.filter((s) => s.kind !== "ref").every((s) => B.text.slice(s.start, s.end).length < 20 || !p.includes(B.text.slice(s.start, s.end))));
  ok("fixesPrompt: 20 items give at most REPORT_FIX_BATCH (6) fragments", L.REPORT_FIX_BATCH === 6 && L.REPORT_MAX_FIXES === 12 && L.fixesPrompt(Array.from({ length: 20 }, (_, i) => ({ id: "f" + (i + 1), problem: "x", frag: "a", ctx: "b" })), OB).split("=== f").length - 1 === 6);
  ok("fixesPrompt: carries no script block and none of the script text", !/GUION:|SCRIPT:/.test(L.fixesPrompt(Array.from({ length: 20 }, (_, i) => ({ id: "f" + (i + 1), problem: "x", frag: "a", ctx: "b" })), OB)) && !/GUION:|SCRIPT:/.test(L.fixesPrompt(Array.from({ length: 20 }, (_, i) => ({ id: "f" + (i + 1), problem: "x", frag: "a", ctx: "b" })), { en: true })) && !L.fixesPrompt(sent, OB).includes(B.text.slice(0, 200)));
  const vf = [{ id: "f1", problem: "p", frag: "Dice Juan 3:16 hoy".replace("Juan 3:16", "⟦V1⟧") + " fin", ctx: "antes ⟦V1⟧ después" }];
  ok("fixesPrompt: a verse mark in a fragment survives in the prompt", L.fixesPrompt(vf, OB).includes("Dice ⟦V1⟧ hoy fin") && L.fixesPrompt(vf, OB).includes("antes ⟦V1⟧ después"));

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
// ---- the score counts accepted changes (2026-10-26)
{
  const it1 = { area: "hook", original: sents[0].text, replacement: "¿Y si lo que crees saber de esto está a punto de cambiar? Quédate hasta el final.", alts: ["Antes de seguir, una pregunta que casi nadie se hace. Quédate conmigo."], why: "w", after: 5 };
  const it2 = { area: "close", original: sents[1].text, replacement: "Gracias por acompañarnos hoy; nos vemos pronto con el próximo mensaje.", alts: [], why: "w", after: 4 };
  const rp = { key: "k1", areas: rep(3).areas, items: [it1, it2] };
  const tot = (t, r, d) => L.readinessOf(L.analyze(t, O), r, d, t);
  const ap = (t, it, s) => t.replace(it.original, s == null ? it.replacement : s);
  const base = tot(E.text, rp);
  ok("itemState: pending / applied (replacement) / applied (alt) / lost", L.itemState(E.text, it1) === "pending" && L.itemState(ap(E.text, it1), it1) === "applied" && L.itemState(ap(E.text, it1, it1.alts[0]), it1) === "applied" && L.itemState(E.text.replace(it1.original, "otra cosa"), it1) === "lost");
  ok("itemApplied: replacement and alt count, original present or lost does not", L.itemApplied(ap(E.text, it1), it1) && L.itemApplied(ap(E.text, it1, it1.alts[0]), it1) && !L.itemApplied(E.text, it1) && !L.itemApplied(E.text.replace(it1.original, "otra cosa"), it1));
  ok("no text: readinessOf has no est fields and the same score", L.readinessOf(R, rp).editorEst === undefined && L.readinessOf(R, rp).score === L.readinessOf(R, rp, null, undefined).score);
  ok("with text and nothing applied: editorEst 0, editorBase = editor", base.editorEst === 0 && base.editorBase === base.editor && base.editor === 42);
  const eff = L.effectiveReport(ap(E.text, it1), rp);
  ok("effectiveReport raises the applied item's area to after, flags est, leaves the original untouched", eff.areas.hook.rating === 5 && eff.areas.hook.est === true && eff.areas.close.rating === 3 && !eff.areas.close.est && rp.areas.hook.rating === 3 && eff !== rp && eff.areas !== rp.areas);
  ok("effectiveReport: null stays null; nothing applied = same ratings", L.effectiveReport("x", null) === null && L.effectiveReport(E.text, rp).areas.hook.rating === 3);
  // per-change gain equals the move of the total
  for (const [name, it, s] of [["replacement", it1, null], ["alt", it1, it1.alts[0]], ["close 3 to 4", it2, null]]) {
    const i = rp.items.indexOf(it), t2 = ap(E.text, it, s), real = tot(t2, rp).score - base.score;
    const g = L.itemGain(E.text, R, O, rp, i, s);
    ok(`itemGain (${name}) equals the real move of the total`, g === real && tot(t2, rp).editorEst === 1, `${g} vs ${real}`);
  }
  ok("hook 3 to 5 moves the editor part by +3 on the total", tot(ap(E.text, it1), rp).editor - base.editor === 3 && tot(ap(E.text, it1), rp).editorBase === base.editor);
  // the area is already at/above `after`: the gain is the rules part only
  const hi = { ...rp, areas: rep(5).areas }, g5 = L.itemGain(E.text, R, O, hi, 0), real5 = tot(ap(E.text, it1), hi).score - tot(E.text, hi).score;
  ok("area already at 5: the editor part does not move, gain = rules only", g5 === real5 && tot(ap(E.text, it1), hi).editor === 60 && tot(ap(E.text, it1), hi).editorEst === 0, `${g5}`);
  ok("an area above `after` is not lowered", L.effectiveReport(ap(E.text, it2), { ...rp, areas: { ...rp.areas, close: { rating: 5 } } }).areas.close.rating === 5);
  // cap at 5 and ignore after == null
  const big = { ...it1, after: 9 }, nul = { ...it2, after: null };
  ok("rating capped at 5; after == null ignored", L.effectiveReport(ap(ap(E.text, big), nul), { ...rp, items: [big, nul] }).areas.hook.rating === 5 && L.effectiveReport(ap(E.text, nul), { ...rp, items: [nul] }).areas.close.rating === 3);
  // not applied / lost items do not count
  const lostT = E.text.replace(it1.original, "otra cosa bien distinta");
  ok("a pending or lost item counts nothing; a lost one has no gain", base.editorEst === 0 && tot(lostT, rp).editorEst === 0 && L.itemGain(lostT, L.analyze(lostT, O), O, rp, 0) === 0);
  ok("an applied item has no gain left; no report = 0", L.itemGain(ap(E.text, it1), L.analyze(ap(E.text, it1), O), O, rp, 0) === 0 && L.itemGain(E.text, R, O, null, 0) === 0);
  // a re-measured report does not double count
  const t1 = ap(E.text, it1), R1 = L.analyze(t1, O);
  const re = { key: "k2", areas: rep(4).areas, items: [{ ...it2, after: 5 }] };
  ok("re-measured report (its items no longer match the text) is its own measurement: nothing raised twice", L.readinessOf(R1, re, null, t1).editorEst === 0 && L.readinessOf(R1, re, null, t1).score === L.readinessOf(R1, re).score);
  // red cap
  const w = ex.es.worst, Ow = opts(w, "es"), Rw = L.analyze(w.text, Ow), sw = Rw.sents.find((s) => w.text.split(s.text).length === 2 && !/[⟦⟧]/.test(s.text));
  const iw = { area: "hook", original: sw.text, replacement: "Una frase distinta y breve para empezar.", alts: [], why: "w", after: 5 }, rw = { key: "kw", areas: rep(2).areas, items: [iw] };
  const tw2 = w.text.replace(iw.original, iw.replacement);
  ok("red keeps <= 69 with changes applied", L.readinessOf(Rw, rw, null, w.text).red && L.readinessOf(L.analyze(tw2, Ow), { ...rw, areas: rep(5).areas }, null, tw2).score <= 69);
  const gw = L.itemGain(w.text, Rw, Ow, rw, 0), realw = L.readinessOf(L.analyze(tw2, Ow), rw, null, tw2).score - L.readinessOf(Rw, rw, null, w.text).score;
  ok("red-cap case: gain equals the real move of the total (and the editor raise shows)", gw === realw && L.readinessOf(L.analyze(tw2, Ow), rw, null, tw2).editorEst === 1, `${gw} vs ${realw}`);
  // projected = the total after applying everything
  const v = L.vetReport(E.text, { areas: rep(3).areas, items: [it1, it2] }, O, R), Pj = L.projectedReadiness(E.text, R, O, v);
  const tAll = L.applyPatches(E.text, v.items.map((x) => ({ start: x.start, end: x.end, rep: x.replacement })));
  ok("projectedReadiness equals the total after applying all", v.items.length === 2 && Pj === L.readinessOf(L.analyze(tAll, O), v, null, tAll).score, `${Pj}`);
  const half = ap(E.text, it1);
  const live = { ...rp, areas: L.effectiveReport(half, rp).areas, items: [{ ...it2, start: half.indexOf(it2.original), end: half.indexOf(it2.original) + it2.original.length }] };
  ok("projected also counts a change already applied (it never falls below the current total)", L.projectedReadiness(half, L.analyze(half, O), O, live) >= tot(half, rp).score && L.projectedReadiness(half, L.analyze(half, O), O, live) === tot(L.applyPatches(half, [{ start: live.items[0].start, end: live.items[0].end, rep: it2.replacement }]), rp).score);
  // the full report, with the applied change still in it (its span now holds the replacement): its item raises the area itself
  const i1 = half.indexOf(it1.replacement), full = { ...rp, items: [{ ...it1, start: i1, end: i1 + it1.replacement.length }, live.items[0]] };
  ok("projected from the full report with the applied change still among the items matches the effective-areas call", L.projectedReadiness(half, L.analyze(half, O), O, full) === L.projectedReadiness(half, L.analyze(half, O), O, live));
  // original still in the text next to the replacement: not applied
  ok("itemApplied is false while the original is still in the text, even if the replacement is there too", !L.itemApplied(E.text + " " + it1.replacement, it1) && L.effectiveReport(E.text + " " + it1.replacement, rp).areas.hook.rating === 3);
  // baseline
  const m1 = { key: "a", areas: rep(2).areas, items: [] }, m2 = { key: "a", areas: rep(4).areas, items: [] }, m3 = { key: "b", areas: rep(4).areas, items: [] };
  const b1 = L.withBaseline(m1, null), b2 = L.withBaseline(m2, b1), b3 = L.withBaseline(m3, null), b4 = L.withBaseline(m2, m1), b5 = L.withBaseline(m3, m1);
  ok("baseline: first measurement = its own ratings", b1.baseline.hook === 2 && b1.baseline.return === 2 && m1.baseline === undefined);
  ok("baseline survives a re-measure and is never overwritten", b2.baseline.hook === 2 && b2.areas.hook.rating === 4 && L.withBaseline(b2, b2).baseline.hook === 2);
  ok("baseline: previous report without one and same key -> its ratings; other key -> own", b4.baseline.hook === 2 && b5.baseline.hook === 4 && b3.baseline.hook === 4);
  ok("cleanBaseline keeps only valid 1-5 integers per known area", JSON.stringify(L.cleanBaseline({ hook: 3, promise: 7, retention: 2.5, voice: "4", close: 1, zzz: 2 })) === '{"hook":3,"close":1}' && L.cleanBaseline({ hook: 0 }) === null && L.cleanBaseline(null) === null && L.cleanBaseline([3]) === null);
}

// ---- one «antes» everywhere: report.before and report.costUsd (jadri47, 2026-10-28) ----
{
  ok("cleanBefore keeps a whole number 0-100", L.cleanBefore(0) === 0 && L.cleanBefore(55) === 55 && L.cleanBefore(100) === 100);
  ok("cleanBefore drops anything else (old report, garbage, out of range)", [undefined, null, -1, 101, 55.5, "55", NaN, {}].every((v) => L.cleanBefore(v) === null));
  ok("cleanCost keeps a finite non-negative dollar figure", L.cleanCost(0) === 0 && L.cleanCost(0.0612) === 0.0612);
  ok("cleanCost drops unknown or absurd values (never invented)", [undefined, null, -0.01, Infinity, NaN, "0.06", 1e6].every((v) => L.cleanCost(v) === null));
}

// ---- repair: a cut answer keeps every complete element and invents nothing (Adrian, 2026-10-29: "never lose the work") ----
{
  const areas = Object.fromEntries(L.REPORT_AREAS.map((k, i) => [k, { rating: (i % 5) + 1, why: "Porque " + k + " tiene una razón \"larga\" con comillas y llaves {x} [y], de unas cuantas palabras." }]));
  const items = [0, 1, 2].map((i) => ({ area: L.REPORT_AREAS[i], original: "Frase original número " + i + " del guion, con coma, y más texto para llenar.", replacement: "Frase nueva número " + i + " del guion, más clara y más corta para hablar.", alts: ["Opción uno " + i + " distinta, con más palabras", "Opción dos " + i + " también distinta, aún más larga"], why: "Mejora el gancho " + i + " porque promete algo concreto.", after: 4 + (i % 2) }));
  const words = { "gratis": ["sin costo", "de regalo", "incluido"], "garantizado": ["muy probable", "seguro de verdad"] };
  const orig = { areas, items, words, dropped: 0 }, json = JSON.stringify(orig);
  ok("repair: fixture is long enough", json.length >= 1200, json.length);
  const aEnd = json.indexOf('"items"');
  let bad = 0, nulls = 0, seen = 0, firstErr = "";
  for (let off = 200; off < json.length; off += 50) {
    const r = L.repairJson(json.slice(0, off));
    const err = (m) => { bad++; if (!firstErr) firstErr = off + ": " + m; };
    if (r === null) { nulls++; continue; }
    if (typeof r !== "object") { err("not an object"); continue; }
    seen++;
    for (const it of r.items || []) if (!items.some((o) => ["original", "replacement", "why", "after", "alts", "area"].every((k) => JSON.stringify(o[k]) === JSON.stringify(it[k])) && Object.keys(it).length === Object.keys(o).length)) err("item not in original " + JSON.stringify(it));
    for (const [k, a] of Object.entries(r.areas || {})) if (JSON.stringify(a) !== JSON.stringify(areas[k])) err("area " + k);
    for (const [k, w] of Object.entries(r.words || {})) if (JSON.stringify(w) !== JSON.stringify(words[k])) err("word " + k);
    if (off > aEnd && L.REPORT_AREAS.some((k) => !r.areas || !r.areas[k] || r.areas[k].rating !== areas[k].rating)) err("ratings missing past the areas block");
  }
  ok("repair: every cut gives null or only complete, unchanged elements", bad === 0 && seen > 10, firstErr || `${seen} repaired, ${nulls} null`);
  ok("repair: the full string returns the full object", JSON.stringify(L.repairJson(json)) === json);
  ok("repair: a ```json fence parses", JSON.stringify(L.repairJson("```json\n" + json + "\n```")) === json);
  ok("repair: a fence cut short still repairs", (L.repairJson("```json\n" + json.slice(0, 700)) || {}).areas !== undefined);
  ok("repair: garbage returns null", L.repairJson("hola, esto no es json") === null && L.repairJson("") === null && L.repairJson(undefined) === null);
  const cut = json.slice(0, json.indexOf('"replacement":"Frase nueva número 1') + '"replacement":"Frase'.length), rc = L.repairJson(cut);
  ok("repair: a cut inside \"replacement\" drops that whole item (no half string)", rc && rc.items.length === 1 && rc.items[0].original === items[0].original && !JSON.stringify(rc).includes("Frase nueva número 1"), JSON.stringify(rc && rc.items.length));
  const r2 = L.repairJson('{"areas":{"hook":{"rating":3,"why":"a"},"promise":{"rating":4,"why":"abc');
  ok("repair: a cut inside an area keeps the earlier areas only", r2 && Object.keys(r2.areas).join() === "hook" && r2.areas.hook.rating === 3);
}

// ---- a change never alters a Bible reference (B-001, bug review 2026-10-29): same count, different verse must be dropped ----
{
  const sent = "Pablo lo resume en Romanos 8:28 con una frase que todos recuerdan.";
  const t2 = E.text + "\n\n" + sent, R2 = L.analyze(t2, O);
  const item = (rep, alts) => ({ areas: { hook: { rating: 3, why: "x" } }, items: [{ area: "hook", original: sent, replacement: rep, alts, why: "w", after: 5 }] });
  const same = "Pablo lo resume en Romanos 8:28 con una frase que todos recordamos.";
  const v1 = L.vetReport(t2, item("Pablo lo resume en Romanos 8:29 con una frase que todos recuerdan."), O, R2);
  ok("refs: a replacement that changes the verse number is dropped", v1.items.length === 0, v1.items.map((x) => x.replacement));
  const v2 = L.vetReport(t2, item("Pablo lo resume en Juan 3:16 con una frase que todos recuerdan."), O, R2);
  ok("refs: a replacement that swaps the book is dropped", v2.items.length === 0);
  const v3 = L.vetReport(t2, item(same, ["Pablo lo resume en Romanos 8:29 con una frase que todos recordamos.", "Pablo lo resume en Romanos 8:28 con una frase que nadie olvida."]), O, R2);
  ok("refs: the same reference keeps the item", v3.items.length === 1 && v3.items[0].replacement === same);
  ok("refs: an alternative that changes the reference is dropped, the other kept", v3.items.length === 1 && v3.items[0].alts.length === 1 && /8:28/.test(v3.items[0].alts[0]), v3.items[0] && v3.items[0].alts);
  const v4 = L.vetReport(t2, item("Pablo lo resume con una frase que todos recuerdan."), O, R2);
  ok("refs: a replacement that removes the reference is dropped", v4.items.length === 0);
}

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
