const L = require("./logic.js"); const fs = require("fs");
const SEC = { money: 0, structure: 1, scripture: 2, spoken: 3, auth: 4, seo: 5 };
function failed(R) { const out = []; for (const [k, rows] of Object.entries(R.sections)) rows.forEach((r) => { if (!r.passed) out.push({ ...r, sec: k }); }); return out.sort((a, b) => (a.level === "rojo" ? -1 : 0) - (b.level === "rojo" ? -1 : 0) || SEC[a.sec] - SEC[b.sec]); }
function run(name, text, opts) {
  const R = L.analyze(text, opts);
  const cards = L.buildFixCards(text, R, opts, failed(R), 6);
  console.log("\n#####", name);
  for (const c of cards) {
    console.log("==", c.ids.join("+"), "|", c.label, "| ev:", c.evidence.length, "| ai:", !!c.ai);
    for (const p of c.proposals) {
      console.log("   ->", p.label, "fixed:", p.check.fixed.join(","), "broke:", p.check.broke.join(","));
      if (p.kind === "patch") for (const q of p.patches.slice(0, 4)) console.log("      [" + JSON.stringify(text.slice(q.start, q.end)) + " => " + JSON.stringify(q.rep) + "]");
      if (p.kind === "cold") console.log("      hook:", p.hook.text, "| promise:", p.promise && p.promise.text);
      if (p.kind === "field") console.log("      ", p.field, "=", p.value);
    }
  }
}
run("long", fs.readFileSync("long_es.txt", "utf8"), { lang: "es", keyword: "ansiedad", uiLang: "es" });
const T = require("../eval/testset.js");
for (const c of T.filter((x) => /T2|T6|T3/.test(x.id))) run(c.id, c.text, { lang: c.lang, title: c.title, keyword: c.keyword, uiLang: "es" });
