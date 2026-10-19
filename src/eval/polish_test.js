// Bible-safety tests for the AI edit guard. Run from /home/claude/sd: node eval/polish_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };

const V1 = "«Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.»";
const V2 = "«Jehová es mi pastor; nada me faltará.»";
const text = `Hoy vamos a hablar de la fé en medio de la tormenta, y de como Dios nos sostiene.

Juan 3:16 dice: ${V1.slice(1, -1)} Eso es lo que la gente no entiende. Es muy importante que lo entiendas.

En el Salmo 23:1 leemos ${V2} Cabe mencionar que esto nos enseña cosas muy interesantes. Cabe mencionar que Dios cuida.

Así que ya sabes, enfréntate a tus gigantes.`;
const R = L.analyze(text, { lang: "es", uiLang: "es", translation: "RVR1960" });
const spans = L.verseSpans(text, R);

// 1) which spans are protected
const covers = (needle) => { const i = text.indexOf(needle); return i >= 0 && spans.some((s) => i >= s.start && i + needle.length <= s.end); };
ok("quoted verse is protected", covers(V2));
ok("unquoted verse after 'Juan 3:16 dice:' is protected", covers("Porque de tal manera amó Dios al mundo"));
ok("reference is protected", covers("Salmo 23:1"));
ok("ordinary sentence is NOT protected", !covers("Es muy importante que lo entiendas"));

// 2) masking hides the verses from the model
const mk = L.maskVerses(text, spans, 0, text.length);
ok("mask: no verse text left", !mk.masked.includes("nada me faltará") && !mk.masked.includes("no se pierda"), mk.masked);
ok("mask: references stay visible", mk.masked.includes("Juan 3:16") && mk.masked.includes("Salmo 23:1"));
ok("mask: tokens present", mk.toks.length === 2 && mk.masked.includes("⟦V1⟧") && mk.masked.includes("⟦V2⟧"));

// 3) round trip: tokens come back as the exact original bytes
const back = L.unmaskCheck(mk.masked, mk.toks);
ok("unmask: round trip is byte-identical", back.ok && back.text === text);

// 4) section rewrite vetting: good answer passes, bad answers are rejected
const good = mk.masked.replace("Es muy importante que lo entiendas.", "Quiero que lo entiendas.");
const vg = L.vetSection(text, mk.toks, good, []);
ok("vetSection: good rewrite accepted", vg.ok && vg.text.includes(V2) && vg.text.includes("Quiero que lo entiendas"), JSON.stringify(vg));
ok("vetSection: verse text preserved verbatim", vg.ok && vg.text.includes("nada me faltará") && vg.text.includes("no se pierda, mas tenga vida eterna"));
ok("vetSection: dropped token rejected", !L.vetSection(text, mk.toks, mk.masked.replace("⟦V2⟧", ""), []).ok);
ok("vetSection: duplicated token rejected", !L.vetSection(text, mk.toks, mk.masked.replace("⟦V2⟧", "⟦V2⟧ ⟦V2⟧"), []).ok);
ok("vetSection: swapped order rejected", !L.vetSection(text, mk.toks, mk.masked.replace("⟦V1⟧", "@@").replace("⟦V2⟧", "⟦V1⟧").replace("@@", "⟦V2⟧"), []).ok);
ok("vetSection: invented token rejected", !L.vetSection(text, mk.toks, mk.masked + " ⟦V9⟧", []).ok);
ok("vetSection: AI writing its own verse in guillemets rejected", !L.vetSection(text, mk.toks, good + " «Todo lo puedo en Cristo que me fortalece, dice la palabra.»", []).ok);
ok("vetSection: AI adding a new reference rejected", !L.vetSection(text, mk.toks, good + " Como dice Filipenses 4:13.", []).ok);
ok("vetSection: AI changing a reference rejected", !L.vetSection(text, mk.toks, good.replace("Salmo 23:1", "Salmo 23:2"), []).ok);
ok("vetSection: empty answer rejected", !L.vetSection(text, mk.toks, "   ", []).ok);
ok("vetSection: gutted answer rejected", !L.vetSection(text, mk.toks, "Hoy hablamos de fe. ⟦V1⟧ ⟦V2⟧", []).ok);

// 5) section boundary: a verse cut by the range cannot be protected
const cut = text.indexOf(V2) + 10;
ok("maskVerses: refuses a range that cuts a verse", L.maskVerses(text, spans, 0, cut).error === "boundary");

// 6) suggestion vetting
const sug = (original, corrected) => ({ original, corrected, kind: "grammar", reason: "x" });
const v = L.vetSuggestions(text, spans, [
  sug("la fé en medio", "la fe en medio"),                                  // ok
  sug("de como Dios", "de cómo Dios"),                                      // ok
  sug("nada me faltará", "nada me faltaría"),                               // inside a verse -> bible
  sug("Salmo 23:1 leemos", "Salmo 23:2 leemos"),                            // reference -> bible
  sug("amó Dios al mundo", "amó el Señor al mundo"),                        // unquoted verse -> bible
  sug("Cabe mencionar que", "Vale destacar que"),                           // appears twice -> ambiguous
  sug("texto que no existe", "otra cosa"),                                  // not found
  sug("Es muy importante que lo entiendas", "Entiéndelo bien, ⟦V1⟧"),      // token
  sug("Así que ya sabes", "Así que ya sabes, como dice Romanos 8:28"),      // adds a reference -> bible
  sug("enfréntate a tus gigantes", "enfréntate a tus gigantes «Fíate de Jehová de todo tu corazón»"), // adds a quote -> bible
  sug("Hoy vamos a hablar", "Hoy vamos a hablar"),                          // no change -> invalid
]);
ok("vetSuggestions: keeps exactly the 2 valid ones", v.items.length === 2 && v.items[0].corrected === "la fe en medio" && v.items[1].corrected === "de cómo Dios", JSON.stringify(v.items.map((x) => x.corrected)));
ok("vetSuggestions: counts the rest", v.drop.bible === 5 && v.drop.ambiguous === 1 && v.drop.notFound === 1 && v.drop.invalid === 2, JSON.stringify(v.drop));

// 7) applying: exact, relocated, never into a verse, verses never change
let cur = text;
for (const s of v.items) { const next = L.applySuggestion(cur, s); ok("apply " + s.corrected, next != null); if (next) cur = next; }
ok("after applying, both verses are byte-identical", cur.includes(V2) && cur.includes(V1.slice(1, -1)));
ok("after applying, edits are in", cur.includes("la fe en medio") && cur.includes("de cómo Dios"));
ok("apply refuses when the text moved into a verse", L.applySuggestion("Hoy.\n" + V2, sug("nada me faltará", "x")) === null);
ok("apply refuses when the fragment appears twice now", L.applySuggestion("la fé en medio. la fé en medio.", sug("la fé en medio", "la fe en medio")) === null);

console.log(fails ? `\n${fails} FAILED` : "\nALL PASS");
process.exit(fails ? 1 : 0);
