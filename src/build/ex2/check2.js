const L = require("../logic.js"); const fs = require("fs");
const E = JSON.parse(fs.readFileSync("ex.json", "utf8"));
for (const lg of ["es", "en"]) for (const [k, e] of Object.entries(E[lg])) {
  if (process.argv[2] && process.argv[2] !== lg + k) continue;
  const o = { lang: e.lang, uiLang: lg, audience: e.audience, title: e.title, keyword: e.keyword, thumb: e.thumb, description: e.description, translation: e.translation, nextEp: e.nextEp };
  const R = L.analyze(e.text, o);
  const failed = []; for (const [s, rows] of Object.entries(R.sections)) rows.forEach((r) => { if (!r.passed) failed.push(r.id + (r.level ? "(" + r.level + ")" : "")); });
  const pk = L.packagingChecks(o, R, "").filter((c) => !c.pass).map((c) => c.id + (c.req ? "!" : ""));
  console.log(`\n## ${lg}-${k}: lang=${R.lang} wc=${R.wc} runtime=${L.fmtTime(R.runtimeSec)} worst=${R.worst} passed=${R.passed}/${R.total} refs=${R.refs.length}`);
  console.log(" failed:", failed.join(", "), "| pack:", pk.join(", "));
  if (process.argv[2]) for (const [s, rows] of Object.entries(R.sections)) rows.forEach((r) => { if (!r.passed) console.log("   ", r.id, (r.info || "").slice(0, 200), r.samples ? JSON.stringify(r.samples).slice(0, 200) : ""); });
}
