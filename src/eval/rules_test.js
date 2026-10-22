// Paragraph review: rule-based suggestions (no AI) and the cases where no rule is offered because it would cut a sentence.
// Run from src: node eval/rules_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const run = (text, over = {}) => {
  const opts = { title: "", keyword: "", thumb: "", description: "", series: "", nextEp: "", bigIdea: "", translation: "", uiLang: "es", lang: "es", ...over };
  const R = L.analyze(text, opts);
  const failed = Object.values(R.sections).flat().filter((r) => !r.passed || r.warn);
  return { R, cards: L.buildFixCards(text, R, opts, failed, 99, Infinity) };
};
const props = (cards, id) => (cards.find((c) => c.id === id) || { proposals: [] }).proposals;
const texts = (cards, id) => props(cards, id).map((p) => p.check.text);
const base = "Hoy vamos a hablar de la fe en medio de la tormenta y de cómo Dios nos sostiene.";

{ // a tag at the end of a sentence goes away; the sentence stays whole
  const { cards } = run(`${base} Nadie puede salvarse solo, ¿amén? Dios nos ama.`);
  ok("pulpit: trailing «¿amén?» is removed", texts(cards, "pulpit").some((x) => x.includes("salvarse solo. Dios nos ama.")), texts(cards, "pulpit"));
}
{ // asking to open Bibles becomes an invitation only when a passage follows
  const { cards } = run(`${base} Abran sus Biblias en Juan 3. Allí leemos algo muy bonito.`);
  ok("pulpit: «Abran sus Biblias en Juan 3» becomes «Busca conmigo en Juan 3»", texts(cards, "pulpit").some((x) => x.includes("Busca conmigo en Juan 3.")), texts(cards, "pulpit"));
  const none = run(`${base} Abran sus Biblias, los que están aquí. Allí leemos algo muy bonito.`);
  ok("pulpit: no passage after it → no rule (the sentence would be cut)", !texts(none.cards, "pulpit").some((x) => /busca conmigo/i.test(x)), texts(none.cards, "pulpit"));
  const mid = run(`${base} Pónganse de pie los que están viendo esto en casa. Dios nos ama.`);
  ok("pulpit: a phrase that starts a sentence is not cut out", !texts(mid.cards, "pulpit").some((x) => !x.includes("los que están viendo")), texts(mid.cards, "pulpit"));
}
{ // splitting a long sentence never leaves a fragment: «porque» is not a split point, «pero» still is (jadri47, 2026-10-21: "no '. Porque no lo sabía.'")
  const L1 = "Muchas personas en nuestra iglesia pasaron años enteros sintiéndose lejos de Dios y de los demás";
  const R1 = "nunca le contaron a nadie lo que realmente sentían en su corazón cada domingo por la mañana";
  const lg = (conn) => run(`${base} ${L1}, ${conn} ${R1}. Dios nos ama.`);
  const split = (conn, re) => texts(lg(conn).cards, "long").some((x) => re.test(x));
  ok("long: «, porque» is not a split point", !split("porque", /\. Porque /), texts(lg("porque").cards, "long"));
  ok("long: «, because» is not a split point (EN)", !texts(run(`${base} ${L1}, because ${R1}. Dios nos ama.`, { lang: "en", uiLang: "en" }).cards, "long").some((x) => /\. Because /.test(x)));
  ok("long: «, pero» still splits into two sentences", split("pero", /Dios y de los demás\. Pero nunca le contaron /), texts(lg("pero").cards, "long"));
}
{ // a technical term gets its everyday-words line; an adjective after it blocks the rule
  const { cards } = run(`${base} La santificación es un proceso que dura toda la vida.`);
  ok("jargon: «santificación» gets «es decir, …»", texts(cards, "jargon").some((x) => x.includes("La santificación, es decir, el proceso de parecernos más a Cristo, es un proceso")), texts(cards, "jargon"));
  const adj = run(`${base} La escatología dispensacionalista ya lo explicaba todo.`);
  ok("jargon: «escatología dispensacionalista» is not cut in two", props(adj.cards, "jargon").length === 0, texts(adj.cards, "jargon"));
}
{ // the repeated connector is dropped from the fourth sentence on
  const body = Array.from({ length: 6 }, (_, i) => `Y entonces Dios habló a su pueblo número ${i + 1} con paciencia.`).join(" ");
  const { cards } = run(`${base} ${body}`);
  const p = props(cards, "openers");
  ok("openers: connector dropped", p.length === 1 && p[0].check.fixed.includes("openers"), p.map((x) => x.label));
}
{ // naming the topic early
  const { cards } = run(`Bienvenidos de nuevo al canal de cada semana. Hoy hay mucho por contar a todos ustedes.`, { keyword: "ansiedad" });
  ok("kwopen: «Hoy hablamos de la ansiedad.» after the first sentence", texts(cards, "kwopen").some((x) => x.includes("canal de cada semana. Hoy hablamos de la ansiedad. Hoy hay mucho")), texts(cards, "kwopen"));
}
{ // no safe rule: removing a profane noun, or a flagged word in a title, would leave broken text
  const lang = run(`${base} Esa vida de iglesia era una mierda y nadie lo decía.`);
  ok("pf-lang: no automatic removal (it would leave «era una y»)", props(lang.cards, "pf-lang").length === 0, texts(lang.cards, "pf-lang"));
  const pack = run(base, { title: "Una mierda de vida" });
  ok("pack-Título: no field rewrite", props(pack.cards, "pack-Título").length === 0, texts(pack.cards, "pack-Título"));
}
{ // description opens with the topic
  const { cards } = run(base, { keyword: "la fe", description: "Suscríbete y comparte." });
  const p = props(cards, "desc");
  ok("desc: opens with the topic", p.length === 1 && p[0].kind === "field" && /^Hoy hablamos de /.test(p[0].value) && p[0].check.fixed.includes("desc"), p.map((x) => x.value));
}
console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
process.exit(fails ? 1 : 0);
