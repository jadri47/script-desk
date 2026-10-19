const L = require("./logic.js"); const fs = require("fs");
const text = fs.readFileSync("long_es.txt", "utf8");
const R = L.analyze(text, { lang: "es", keyword: "ansiedad", uiLang: "es" });
console.log("wc", R.wc, "runtime", L.fmtTime(R.runtimeSec), "cues", R.cues.map(c => c.kind + (c.pause ? "*" : "")).join(","));
const U = L.buildUnits(R, text);
console.log("units", U.length, "sents", R.sents.length);
const lay = L.detectLayout(U, R);
const secs = L.sectionsFrom(lay, U, R.runtimeSec);
const F = L.sectionFlags(secs, U, R, { hook: false, promise: false });
for (const s of secs) console.log(s.k, s.type, s.n || "", s.conf, L.fmtTime(s.t0) + "-" + L.fmtTime(s.t1), "|", U[s.first].text.slice(0, 60), JSON.stringify(F[s.k]));
for (const k of ["hook", "promise"]) { console.log("--", k); for (const c of L.coldCandidates(U, R, k, { keyword: "ansiedad" })) console.log(c.score, L.fmtTime(c.t0), c.dur.toFixed(1) + "s", c.why.join("/"), "|", c.text); }
const hook = L.coldCandidates(U, R, "hook", { keyword: "ansiedad" })[0], prom = L.coldCandidates(U, R, "promise", { keyword: "ansiedad" })[0];
const R2 = L.analyze(text, { lang: "es", keyword: "ansiedad", uiLang: "es", coldOpen: { hook: hook.text, promise: prom.text, mode: "dup" } });
for (const id of ["hook", "promise", "greeting", "content"]) { const r = R2.sections.structure.find(x => x.id === id); console.log(id, r.passed, r.info.slice(0, 110)); }
// diff check
const ops = L.diffOps("Hola mundo. Esto es una prueba.\nOtra línea aquí.", "Hola mundo. Esto fue una prueba larga.\nOtra línea aquí.");
console.log(ops.map(o => o.op === "eq" ? o.text : o.op === "ins" ? "[+" + o.text + "]" : "[-" + o.text + "]").join(""));
const a = "...Hola. ¿Qué? Sí!!\n\nFin"; console.log(JSON.stringify((a.match(/[^.!?…\n]*[.!?…]+[ \t]*|[^.!?…\n]+[ \t]*|\n+/g)||[]).join("") === a));
