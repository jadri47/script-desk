// Chapters for the description (buildChapters, guion_logic.js). YouTube: first at 0:00, at least 3, ascending, each ≥ 10 s.
// Ours (jadri47, 2026-11-02, "Go with A"): each chapter ≥ 90 s; a shorter one joins the one before, which keeps its title.
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const s = (m, sec) => m * 60 + sec;
// the section starts of Adrian's 32-minute episode «¿Qué dice la Biblia sobre la cuarenta días?» (2026-11-02), 16 chapters before
const ITEMS = [
  ["hook", 0, 0], ["promise", 0, 46], ["intro", 0, 55], ["body", 3, 57], ["body", 6, 5], ["body", 9, 8], ["point", 13, 36], ["point", 14, 14],
  ["point", 14, 46], ["point", 15, 21], ["body", 16, 31], ["body", 17, 43], ["body", 20, 24], ["body", 22, 33], ["body", 25, 23],
  ["point", 27, 36], ["point", 27, 38], ["point", 27, 40], ["point", 27, 43], ["cta", 31, 51], ["close", 31, 59.6],
].map(([type, m, x], i) => ({ type, t: s(m, x), label: "c" + i, at: i * 100 }));
const TOTAL = s(32, 11);
const ch = L.buildChapters(ITEMS, TOTAL, "Intro");
const times = ch.map((c) => Math.round(c.t));
ok("episode: 11 chapters, at the times shown to Adrian", JSON.stringify(times) === JSON.stringify([0, s(3, 57), s(6, 5), s(9, 8), s(13, 36), s(15, 21), s(17, 43), s(20, 24), s(22, 33), s(25, 23), s(27, 36)]), times);
ok("every chapter lasts at least 90 s, the last one too", ch.every((c, i) => (i + 1 < ch.length ? ch[i + 1].t : TOTAL) - c.t >= L.CHAPTER_MIN_SEC) && L.CHAPTER_MIN_SEC === 90);
ok("a short chapter joins the one before, which keeps its title", ch[4].label === "c6" && ch[0].label === "Intro" && ch[5].label === "c9" && ch[ch.length - 1].label === "c18" /* starts < 10 s apart: the later title (unchanged rule) */, ch.map((c) => c.label).join(" "));
ok("each chapter carries the text position of its section (for the marks)", ch.slice(1).every((c) => Number.isInteger(c.at)) && ch[1].at === 300);
const old = L.buildChapters(ITEMS, TOTAL, "Intro", 10);
ok("10 s (YouTube's minimum) still gives the old list of 16", old.length === 16, old.length);
// a short episode: the 90 s rule would leave fewer than 3, so YouTube would show none; the 10 s list is kept
const SHORT = [{ type: "body", t: 40, label: "a" }, { type: "body", t: 80, label: "b" }];
const sh = L.buildChapters(SHORT, 150, "Intro");
ok("short episode: never fewer than 3 when the 10 s rule gives 3", sh.length === 3 && sh[1].t === 40 && sh[2].t === 80, sh);
ok("first chapter at 0:00 and ascending", ch[0].t === 0 && ch.every((c, i) => !i || c.t > ch[i - 1].t));
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exitCode = fails ? 1 : 0;
