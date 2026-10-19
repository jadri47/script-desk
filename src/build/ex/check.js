const L = require("../logic.js"); const fs = require("fs");
const E = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const [k, e] of Object.entries(E)) {
  if (process.argv[3] && process.argv[3] !== k) continue;
  const o = { lang: "es", uiLang: "es", title: e.title, keyword: e.keyword, thumb: e.thumb, description: e.description, translation: e.translation || "RVR1960", series: e.series || "", nextEp: e.nextEp || "" };
  const R = L.analyze(e.text, o);
  const failed = []; for (const [s, rows] of Object.entries(R.sections)) rows.forEach((r) => { if (!r.passed) failed.push(s + ":" + r.id + (r.level ? "(" + r.level + ")" : "")); });
  const U = L.buildUnits ? null : null;
  const pk = L.packagingChecks(o, R, "").filter((c) => !c.pass).map((c) => c.id + (c.req ? "!" : ""));
  console.log(`\n## ${k}: wc=${R.wc} runtime=${L.fmtTime(R.runtimeSec)} worst=${R.worst} passed=${R.passed}/${R.total} refs=${R.refs.length}`);
  console.log(" failed:", failed.join(", "));
  console.log(" preflight:", R.preflight.filter((p) => p.level !== "verde").map((p) => p.id + ":" + p.level + " [" + (p.issues || []).join("; ").slice(0, 120) + "]").join(" | "));
  console.log(" packaging fails:", pk.join(", "));
}
