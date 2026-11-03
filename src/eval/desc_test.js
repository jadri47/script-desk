// Three AI descriptions (desc_logic.js; Adrian, 2026-11-03, A): the prompt and the vetting each candidate passes before it is shown.
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };

const S = "¿Qué gigante enfrentas hoy? Durante cuarenta días Goliat desafió a Israel. Como dice 1 Samuel 17:45, «Tú vienes a mí con espada y lanza; mas yo vengo a ti en el nombre de Jehová». David no esperó a sentirse listo.\n\nHoy vas a ver cinco pasos para enfrentar tus gigantes con fe.";
const R = L.analyze(S, {});
const P = L.descPrompt(S, R, { keyword: "cuarenta días", title: "Cuarenta días frente a Goliat", nextEp: "el Salmo 23" });
ok("prompt: asks for 3, keyword in the first 150 characters, JSON shape", /3 descripciones/.test(P) && /cuarenta días» tal cual/.test(P) && /"descs"/.test(P));
ok("prompt: the verse is masked and the script goes last", !P.includes("con espada y lanza") && /⟦V1⟧/.test(P) && P.trimEnd().endsWith("cinco pasos para enfrentar tus gigantes con fe."));

const good = "Durante cuarenta días Goliat desafió a Israel, y nadie se movió. ¿Qué gigante enfrentas tú hoy?\n\nEn este episodio verás cinco pasos para enfrentar tus gigantes con fe, desde 1 Samuel 17.";
const V = (list, kw = "cuarenta días") => L.vetDescs(list, S, kw, L.descRisk);
ok("a good one passes", V([good]).list.length === 1, V([good]).why);
ok("keyword not in the first 150 characters: dropped", V(["x".repeat(160) + " cuarenta días y más texto para que no sea corta."]).why[0] === "keyword");
ok("keyword match ignores accents and capitals", V([good.replace("cuarenta días", "Cuarenta Dias")]).list.length === 1);
ok("a reference the script doesn't have: dropped", V([good + " Lee también Juan 3:16."]).why[0] === "ref");
ok("the script's own reference: kept", V([good]).list[0].includes("1 Samuel 17"));
ok("a quote the script doesn't have: dropped", V([good + " «Todo lo puedo en Cristo que me fortalece»."]).why[0] === "quote");
ok("a quote that is in the script: kept", V([good + " «Tú vienes a mí con espada y lanza»."]).list.length === 1);
ok("an ad-risk word: dropped", V([good + " Hablamos también de la pornografía."]).why[0] === "risk");
ok("a chapter list: dropped (the app adds its own)", V([good + "\n\n0:00 Inicio\n1:30 Goliat"]).why[0] === "chapters");
ok("a verse token left in: dropped", V([good + " ⟦V1⟧"]).why[0] === "token");
ok("too short / too long / not text: dropped", JSON.stringify(V(["cuarenta días.", "cuarenta días " + "a".repeat(1300), 5]).why) === '["length","length","type"]');
ok("a duplicate: dropped; never more than 3", V([good, good + " ", good.replace("nadie", "ninguno"), good.replace("nadie", "nadie más"), good.replace("hoy?", "ahora?")]).list.length === 3 && V([good, good]).why.includes("dup"));
ok("no keyword set: the keyword rule doesn't apply", V(["Un episodio sobre la fe de David frente al gigante, y cinco pasos para hoy mismo."], "").list.length === 1);

const block = "0:00 Inicio\n1:30 Goliat\n4:00 Cinco pasos";
ok("chosen text above an existing chapter block; the block and what follows stay", L.descWithChapters("Viejo texto.\n\n" + block + "\n\n#fe", "Nuevo.", "9:99 x") === "Nuevo.\n\n" + block + "\n\n#fe");
ok("no block yet: the chapters are appended", L.descWithChapters("", "Nuevo.", block) === "Nuevo.\n\n" + block && L.descWithChapters("", "Nuevo.", "") === "Nuevo.");

console.log(fails ? `\n${fails} FAILED` : "\nall ok");
process.exit(fails ? 1 : 0);
