// Rail items. Run from /home/claude/sd: node eval/rail_test.js
const L = require("../build/logic.js");
let fails = 0;
const ok = (n, c, x) => { if (!c) { fails++; console.log("FAIL", n, x || ""); } };
const R = { timeAt: (p) => p / 10, preflight: [{ id: "a", level: "rojo" }, { id: "b", level: "verde" }, { id: "c", level: "amarillo" }],
  riskHits: [{ start: 100, text: "x", cat: "a" }, { start: 50, text: "y", cat: "b" }, { start: 200, text: "z", cat: "c" }], refs: [{ start: 120, canonical: "Juan 3:16" }] };
const ems = [{ pos: 0, kind: "hook", label: "GANCHO 0:00", tip: "t" }, { pos: 30, kind: "promise", label: "P", tip: "t" }, { pos: 100, kind: "cta", label: "C", tip: "t" },
  { pos: 400, kind: "rehook", label: "R", tip: "t", warn: true }, { pos: 90, kind: "broll", label: "B", tip: "t" }, { pos: 500, kind: "ad", label: "A", tip: "t" }, { pos: 10, kind: "intro", label: "I", tip: "t" }];
const it = L.railItems(R, ems);
ok("verde risk is skipped", !it.some((x) => x.shape === "risk" && x.pos === 50));
ok("2 risks kept", it.filter((x) => x.shape === "risk").length === 2);
ok("ref present with time", it.some((x) => x.shape === "ref" && x.t === 12));
ok("promise and cta are shapes", it.some((x) => x.shape === "promise") && it.some((x) => x.shape === "cta"));
ok("cta also a cue (PEDIDO)", it.some((x) => x.cue === "cta"));
ok("5 non-cta cues", ["hook", "intro", "rehook", "broll", "ad"].every((k) => it.some((x) => x.cue === k)));
ok("rehook warn kept", it.find((x) => x.cue === "rehook").warn === true);
ok("sorted by position", it.every((x, i) => i === 0 || it[i - 1].pos <= x.pos));
ok("shape before cue at same pos", it.findIndex((x) => x.pos === 100 && x.shape) < it.findIndex((x) => x.pos === 100 && x.cue));
ok("letters", L.RAIL_LETTER.hook === "H" && L.RAIL_LETTER.cta === "P" && L.RAIL_LETTER.ad === "A");
const lv = L.railCrowd([0.1, 0.11, 0.12, 0.13, 0.5]);
ok("crowding cycles rows", lv[0] === 0 && lv[1] === 1 && lv[2] === 2 && lv[3] === 0 && lv[4] === 0, lv);
ok("empty ok", L.railItems({}, []).length === 0 && L.railItems(null, null).length === 0);
console.log(fails ? fails + " FAILED" : "ALL PASS");
process.exit(fails ? 1 : 0);
