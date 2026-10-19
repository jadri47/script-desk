// Color families: mapping and priority. Run from /home/claude/sd: node eval/cats_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (n, c, x) => { if (!c) { fails++; console.log("FAIL", n, x || ""); } };
const { catOfKind, catOfCard, CATS, CAT_PRI } = L;
ok("risk rojo -> hi", catOfKind("risk", "rojo") === "hi");
ok("risk amarillo -> mid", catOfKind("risk", "amarillo") === "mid");
ok("risk verde -> none", catOfKind("risk", "verde") === null);
ok("muletilla -> fill", catOfKind("muletilla") === "fill");
for (const k of ["weak", "regional", "aitell"]) ok(k + " -> pol", catOfKind(k) === "pol");
for (const k of ["greeting", "cta", "ref", "keyword", "quote"]) ok(k + " keeps own style", catOfKind(k) === null);
ok("card pf rojo -> hi", catOfCard({ id: "pf-hate", level: "rojo" }) === "hi");
ok("card pf amarillo -> mid", catOfCard({ id: "pf-lang", level: "amarillo" }) === "mid");
ok("card muletillas -> fill", catOfCard({ id: "muletillas" }) === "fill");
ok("card other -> pol", catOfCard({ id: "rhythm" }) === "pol");
ok("priority order", ["hi", "mid", "cut", "fill", "pol"].every((id, i, a) => i === 0 || CAT_PRI[a[i - 1]] > CAT_PRI[id]));
ok("5 families", CATS.length === 5);
console.log(fails ? fails + " FAILED" : "ALL PASS");
process.exit(fails ? 1 : 0);
