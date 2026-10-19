// Timing/content rules v2. Run from /home/claude/sd: node eval/timing_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const row = (R, sec, id) => (R.sections[sec] || []).find((r) => r.id === id);
const state = (r) => (!r ? "absent" : r.warn ? "warn" : r.passed ? "pass" : "fail");
const an = (text, o = {}) => L.analyze(text, { lang: "es", uiLang: "es", ...o });
const filler = (n, seed) => Array.from({ length: n }, (_, i) => `La gracia de Dios sostiene al creyente en el día ${seed + i} de su camino, aun cuando las fuerzas se acaban.`).join(" ");

// ---- Fixture A: cold open, promise by 12 s, verse by 25 s, ~32 min
const verse = "«Jehová es mi pastor; nada me faltará.»";
let A = "¿Alguna vez has sentido que el miedo decide por ti? Hoy vas a descubrir qué dice la Biblia sobre el miedo y cómo vencerlo. En el Salmo 23:1 leemos " + verse + " Ese versículo cambia cómo oras.\n\n";
const qs = ["¿Y tú, qué haces cuando llega el miedo?", "¿Te has preguntado por qué Dios permite la espera?", "Más adelante veremos la clave."];
for (let p = 1; p <= 7; p++) A += `${p === 1 ? "Primero" : p === 7 ? "Por último" : "Ahora bien"}, el punto ${p}. ${qs[p % 3]} ${filler(26, p * 40)} ${qs[(p + 1) % 3]} ${filler(22, p * 90)}\n\n`;
A += "Si este mensaje te ayudó, comenta qué te cuesta soltar. En el próximo episodio veremos el libro de Jonás.";
const RA = an(A, { title: "Cómo vencer el miedo", keyword: "miedo" });
console.log("A runtime", Math.round(RA.runtimeSec / 60), "min");
ok("A: runtime in range", RA.runtimeSec > 25 * 60 && RA.runtimeSec < 40 * 60);
for (const id of ["hook", "promise", "content"]) ok(`A: ${id} passes`, state(row(RA, "structure", id)) === "pass", state(row(RA, "structure", id)) + " " + (row(RA, "structure", id) || {}).info);
ok("A: runtime passes", state(row(RA, "spoken", "runtime")) === "pass");

// ---- Fixture B: greeting, long prayer, explicit promise ~55 s, ~6 min
const prayer = "Oremos juntos. Padre celestial, te damos gracias por este día y por tu palabra. Señor, te pedimos que abras nuestros oídos y nuestro corazón para recibir lo que tú tienes para nosotros hoy. Te pedimos sabiduría para entender y valentía para obedecer lo que nos enseñes. Padre amado, guarda a cada familia que escucha, sana lo que está herido y fortalece lo que está cansado. Todo esto te lo pedimos en el nombre de Jesús. Amén.";
const B = `Hola a todos, bienvenidos de nuevo al canal. ${prayer} Hoy veremos qué dice la Biblia sobre la paciencia.\n\n${filler(20, 1)}\n\nPrimero, Santiago 5:7. ${filler(14, 30)}`;
const RB = an(B, { title: "La paciencia", keyword: "paciencia" });
ok("B: greeting fails", state(row(RB, "structure", "greeting")) === "fail");
const pr = row(RB, "structure", "prayer");
ok("B: prayer warns with seconds", pr && pr.warn && /\d+ s/.test(pr.info), pr && pr.info);
ok("B: promise is a warning (late, not absent)", state(row(RB, "structure", "promise")) === "warn", state(row(RB, "structure", "promise")));
ok("B: runtime fails under 8 min", state(row(RB, "spoken", "runtime")) === "fail" && RB.runtimeSec < 480);
ok("B: warnings never count as fails in the score", RB.passed >= Object.values(RB.sections).flat().filter((r) => r.passed).length);

// ---- Fixture C: series + recap, promise ~40 s
const C = `La semana pasada vimos que Dios cuida de ti incluso en el desierto. ${filler(3, 1)} Hoy veremos qué hacer cuando la espera se alarga.\n\n${filler(12, 9)}`;
const RC = an(C, { title: "Cuando la espera se alarga", keyword: "espera", series: "Serie del desierto" });
const pc = row(RC, "structure", "promise");
ok("C: promise passes in series mode", pc && pc.passed && !pc.warn && /45/.test(pc.info), state(pc) + " " + (pc || {}).info);

// ---- Fixture D: a 38-word verse is not the speaker's sentence
const V38 = "«" + Array.from({ length: 38 }, (_, i) => ["bendito", "el", "varón", "que", "confía", "en", "Jehová", "y", "cuya", "confianza", "es", "Jehová"][i % 12]).join(" ") + ".»";
const D = `¿Alguna vez has dudado? Hoy veremos qué dice la Biblia sobre la duda. Dios te oye. Dios te ve. Dios te cuida.\n\nEn Jeremías 17:7 leemos ${V38} Dios te oye. Dios te ve. Confía en él hoy. Dios te cuida. ${filler(1, 1).split(",")[0]}.`;
const RD = an(D, { title: "La duda", keyword: "duda" });
ok("D: verse does not trigger long-sentence", state(row(RD, "spoken", "long")) === "pass", state(row(RD, "spoken", "long")));
ok("D: readability notes Scripture is excluded", /citas b/.test(row(RD, "spoken", "readability").info), row(RD, "spoken", "readability").info);

// ---- soft rows never land in the fail list and never lower the score
const soft = Object.values(RB.sections).flat().filter((r) => r.warn);
ok("soft rows are marked passed+warn", soft.length > 0 && soft.every((r) => r.passed === true));

// ---- ad breaks: none inside a verse, first at >= 40%, 4 min apart, none in last 3 min
const textA = A, UA = L.buildUnits(RA, textA);
const layoutA = L.detectLayout(UA, RA), secsA = L.sectionsFrom(layoutA, UA, RA.runtimeSec);
const br = L.adBreaks(secsA, UA, textA, RA);
console.log("A ad breaks (s):", br.map((b) => Math.round(b.t)));
ok("ads: at least one break in a 32-min episode", br.length >= 1);
ok("ads: first at 40% or later", !br.length || br[0].t >= RA.runtimeSec * 0.4);
ok("ads: 4 min apart", br.every((b, i) => i === 0 || b.t - br[i - 1].t >= 240));
ok("ads: none in last 3 min", br.every((b) => RA.runtimeSec - b.t >= 180));
const spansA = L.verseSpans(textA, RA).filter((s) => s.kind !== "ref");
ok("ads: never inside a verse", br.every((b) => { const u = UA.find((x) => Math.abs(x.t1 - b.t) < 0.6 && x.i === secsA.find((s) => s.k === b.k).last); return !spansA.some((v) => u && u.start < v.end && u.end > v.start); }));

// ---- clips can be longer than 60 s
const para = "¿Por qué Dios guarda silencio cuando más lo necesitas? " + Array.from({ length: 11 }, (_, i) => `El silencio de Dios no es ausencia, es espera número ${i + 1} para tu bien y tu crecimiento.`).join(" ");
const E = `¿Alguna vez has sentido que nadie escucha? Hoy veremos el silencio de Dios.\n\n${para}\n\nPor último, confía.`;
const RE = an(E, { title: "El silencio de Dios", keyword: "silencio" }), UE = L.buildUnits(RE, E), secsE = L.sectionsFrom(L.detectLayout(UE, RE), UE, RE.runtimeSec);
const clips = L.clipCandidates(UE, RE, secsE, { keyword: "silencio" });
console.log("clip durations:", clips.map((c) => Math.round(c.dur)));
ok("clips: allows a passage longer than 60 s", clips.some((c) => c.dur > 60), JSON.stringify(clips.map((c) => c.dur)));
ok("clips: none over 3 min", clips.every((c) => c.dur <= 180));

// ---- thumbnail rule
const pk = (thumb) => L.packagingChecks({ title: "Un título", thumb, keyword: "", desc: "" }, RA, "").find((c) => c.id === "thumb").pass;
ok("thumb: 4 short words pass", pk("Dios no calla hoy"));
ok("thumb: 5 words fail", !pk("Dios no calla nunca hoy"));
ok("thumb: over 24 chars fails", !pk("Esperanzadoramente grande"));


// ---- v3: prayer judged by position, not length
const longPrayer = "Oremos. Padre celestial, te damos gracias por tu palabra, por tu fidelidad y por cada persona que escucha hoy. Señor, te pedimos sabiduría, humildad y un corazón dispuesto para recibir lo que tú quieres enseñarnos, y que tu Espíritu nos guíe en cada palabra. En el nombre de Jesús, amén.";
const body = (n) => `\n\nPrimero, Santiago 1:2. ${filler(n, 300)}\n\n`;
const Ep = `¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba. ${longPrayer}${body(60)}`;
const REp = an(Ep, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
const pE = row(REp, "structure", "prayer");
ok("E: long prayer after the promise passes", state(pE) === "pass", state(pE) + " " + (pE || {}).info);
ok("E: prayer length is not judged", pE && /no se mide/.test(pE.info));
const Fp = `Señor, abre nuestro entendimiento. Amén. ¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba.${body(60)}`;
const RFp = an(Fp, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
const pF = row(RFp, "structure", "prayer");
ok("F: short prayer first, promise still in time, passes", state(pF) === "pass" && /a tiempo/.test(pF.info), state(pF) + " " + (pF || {}).info);
ok("F: hook skips the prayer", /Alguna vez/.test(row(RFp, "structure", "hook").info));
ok("B: long prayer that delays the promise still warns", state(row(RB, "structure", "prayer")) === "warn");
const Gp = `¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba. Dios es fiel, ¿amén? ${body(60)}`;
ok("G: rhetorical ¿amén? is not a prayer", !row(an(Gp, { title: "Por qué Dios usa la prueba", keyword: "prueba" }), "structure", "prayer"));

// ---- v3: ending window includes the closing prayer or blessing
const closing = "Oremos. Padre, gracias por tu palabra. " + filler(6, 900) + " Que tu paz nos guarde. En el nombre de Jesús, amén. Dios les bendiga.";
const H1 = `¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba.${body(60)}En el próximo episodio veremos la fe de Abraham. ${closing}`;
const RH1 = an(H1, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
const eH1 = row(RH1, "structure", "ending");
ok("H: next-episode line before a long closing prayer passes", state(eH1) === "pass", state(eH1) + " " + (eH1 || {}).info);
const H2 = `¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba.${body(60)}${closing}`;
const RH2 = an(H2, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
const eH2 = row(RH2, "structure", "ending");
ok("H: no next-episode line fails", state(eH2) === "fail", state(eH2));
const cards = L.buildFixCards(H2, RH2, { lang: "es", uiLang: "es", title: "Por qué Dios usa la prueba", keyword: "prueba", nextEp: "la fe de Abraham" }, [eH2], 3);
const pc2 = cards.flatMap((c) => c.proposals || []).find((p) => p.kind === "patch" && /Abraham/.test(p.patches[0].rep));
const insertAt = pc2 ? pc2.patches[0].start : -1;
ok("H: fix inserts the line before the closing prayer", insertAt > 0 && insertAt <= H2.lastIndexOf("Oremos."), insertAt + " vs " + H2.lastIndexOf("Oremos."));
const after = pc2 ? L.applyPatches(H2, pc2.patches) : H2;
ok("H: after the fix the ending passes", state(row(an(after, { title: "Por qué Dios usa la prueba", keyword: "prueba" }), "structure", "ending")) === "pass");

// ---- v3: long readings are advice, only past 150 words
const words = (n) => "«" + Array.from({ length: n }, (_, i) => ["bienaventurado", "el", "varón", "que", "no", "anduvo", "en", "consejo", "de", "malos"][i % 10]).join(" ") + ".»";
const reading = (n) => `¿Alguna vez has sentido que la prueba no termina? Hoy vas a descubrir por qué Dios usa la prueba.\n\nEn Salmos 1:1 leemos ${words(n)}${body(60)}`;
const r120 = row(an(reading(120), { title: "Por qué Dios usa la prueba", keyword: "prueba" }), "message", "reading");
const r170 = row(an(reading(170), { title: "Por qué Dios usa la prueba", keyword: "prueba" }), "message", "reading");
ok("I: a 120-word reading passes", state(r120) === "pass", state(r120));
ok("I: a 170-word reading is advice, not a fail", state(r170) === "warn", state(r170));

// ---- v3: keyword timing is advice
const Jt = `¿Alguna vez has sentido que nadie te escucha? Hoy vas a descubrir algo. ${filler(8, 50)} Hablemos de la prueba.${body(60)}`;
const kwJ = row(an(Jt, { title: "Por qué Dios usa la prueba", keyword: "prueba" }), "seo", "kwopen");
ok("J: late keyword is a warning", state(kwJ) === "warn", state(kwJ));

// ---- v3: Guion tab uses the same rules as Results
const guionFlags = (txt, o) => { const R = an(txt, o), U = L.buildUnits(R, txt), secs = L.sectionsFrom(L.detectLayout(U, R), U, R.runtimeSec); return { R, secs, F: L.sectionFlags(secs, U, R, { hook: false, promise: false }).flat() }; };
const gF = guionFlags(Fp, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
ok("K: Guion promise target follows series mode", (() => { const g = guionFlags(C, { title: "Cuando la espera se alarga", keyword: "espera", series: "Serie del desierto" }); const f = g.F.find((x) => x.id === "promiseLate"); return !f || f.d === 45; })());
const gH = guionFlags(H1, { title: "Por qué Dios usa la prueba", keyword: "prueba" });
ok("K: Guion finds the close before a closing prayer", gH.secs.some((s) => s.type === "close") && !gH.F.some((f) => f.id === "noClose"), JSON.stringify(gH.secs.map((s) => s.type)));
ok("K: Guion re-hook gaps match Results", gH.F.filter((f) => f.id === "gap").length === (gH.R.blocks || []).filter((b) => !b.has).length);

console.log(fails ? `\n${fails} FAILED` : "\nALL PASS");
process.exit(fails ? 1 : 0);
