const L = require("../build/logic.js");
const cases = require("./testset.js");
const rows = [];
for (const c of cases) {
  const R = L.analyze(c.text, { lang: c.lang, title: c.title, keyword: c.keyword, uiLang: "en" });
  const red = R.preflight.filter((p) => p.level !== "verde").map((p) => p.id);
  const fails = {}; const soft = {}; for (const [k, rs] of Object.entries(R.sections)) for (const r of rs) { if (!r.passed) fails[r.id] = k; else if (r.warn) soft[r.id] = k; }
  const yellow = Object.keys({ ...fails, ...soft }).filter((id) => ["muletillas", "weak", "regional", "readability", "long", "kw", "kwopen", "kwspread", "support", "search", "title", "chapters"].includes(id));
  const got = { red, yellow, hook: !fails.hook && !soft.hook, promise: !fails.promise && !soft.promise, cta: !fails.cta };
  const missedRed = c.expect.red.filter((x) => !red.includes(x)), falseRed = red.filter((x) => !c.expect.red.includes(x));
  const missedY = c.expect.yellow.filter((x) => !yellow.includes(x)), falseY = yellow.filter((x) => !c.expect.yellow.includes(x));
  const structErr = ["hook", "promise", "cta"].filter((k) => got[k] !== c.expect[k]).map((k) => `${k}: expected ${c.expect[k] ? "pass" : "fail"}, got ${got[k] ? "pass" : "fail"}`);
  const pass = !missedRed.length && !falseRed.length && !missedY.length && !falseY.length && !structErr.length;
  rows.push({ id: c.id, missed: [...missedRed.map((x) => "red:" + x), ...missedY.map((x) => "yellow:" + x)], false: [...falseRed.map((x) => "red:" + x), ...falseY.map((x) => "yellow:" + x)], structErr, pass,
    detail: { red: R.preflight.filter((p)=>p.count).map((p)=>`${p.id}=${p.level}/${p.degree}(${p.count})`), allFails: Object.keys(fails), hookInfo: R.sections.structure.find(r=>r.id==="hook").info.slice(0,90), promiseInfo: R.sections.structure.find(r=>r.id==="promise").info.slice(0,90), ctaInfo: R.sections.structure.find(r=>r.id==="cta").info.slice(0,120), runtime: L.fmtTime(R.runtimeSec), wc: R.wc } });
}
for (const r of rows) { console.log(`\n=== ${r.id} — ${r.pass ? "PASS" : "FAIL"}`); console.log(" missed:", r.missed.join(", ") || "—"); console.log(" false:", r.false.join(", ") || "—"); console.log(" struct:", r.structErr.join("; ") || "—"); console.log(" detail:", JSON.stringify(r.detail)); }
require("fs").writeFileSync("eval/results.json", JSON.stringify(rows, null, 2));
