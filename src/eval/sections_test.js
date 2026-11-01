// Main sections (Adrian, 2026-11-01: picks 1A 2A 3A): gancho, promesa, introducción, desarrollo (retención), cierre.
// Run from src: node eval/sections_test.js
const L = require("../build/logic.js");
const fs = require("fs");
const path = require("path");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const EX = JSON.parse(fs.readFileSync(path.join(__dirname, "../build/examples.json"), "utf8"));
const run = (lang, k, bounds) => { const text = EX[lang][k].text, R = L.analyze(text, { uiLang: lang, lang }); return { text, R, m: L.mainSections(text, R, bounds) }; };

// every example: in order, contiguous, nothing empty, the first starts the text and the last reaches its end
for (const lang of ["es", "en"]) for (const k of ["worst", "bad", "mid", "good", "best"]) {
  const { text, m } = run(lang, k);
  const l = m.list;
  ok(`${lang}.${k}: sections in order, contiguous, none empty`, l.length > 0 && l.every((s, i) => s.end > s.start && (i === 0 || s.start === l[i - 1].end)) && l.every((s, i) => i === 0 || L.MAIN_SECS.indexOf(s.k) > L.MAIN_SECS.indexOf(l[i - 1].k)), JSON.stringify(l.map((s) => [s.k, s.start, s.end])));
  ok(`${lang}.${k}: the hook starts the script and the last section reaches its end`, l[0].k === "hook" && l[0].start === text.search(/\S/) && l[l.length - 1].end === text.replace(/\s+$/, "").length, JSON.stringify([l[0], l[l.length - 1]]));
  ok(`${lang}.${k}: found + missing = the five`, l.length + m.missing.length === 5 && !m.stale);
}
// the polished examples have all five; the worst one has no promise, intro or close
for (const lang of ["es", "en"]) for (const k of ["good", "best"]) ok(`${lang}.${k}: all five sections found`, run(lang, k).m.missing.length === 0, run(lang, k).m.missing);
ok("es.worst: no promise, no intro, no close", JSON.stringify(run("es", "worst").m.missing) === JSON.stringify(["promise", "intro", "close"]), run("es", "worst").m.missing);
// 3A: the close holds the next-episode line
{ const { text, m } = run("es", "good"); const c = m.list.find((s) => s.k === "close"); ok("es.good: the close holds «próximo episodio»", c && /próximo episodio/i.test(text.slice(c.start, c.end))); }

// 1A: a valid boundary from the author replaces the detected one; one out of order is ignored and said (stale)
{
  const { text, R, m } = run("es", "best");
  const body = m.list.find((s) => s.k === "body"), close = m.list.find((s) => s.k === "close");
  const later = text.indexOf("\n", body.start + 200) + 1; // a later paragraph start inside the body
  const m2 = L.mainSections(text, R, { body: later });
  ok("bounds: a later body start is taken", m2.list.find((s) => s.k === "body").start === later && !m2.stale && m2.list.find((s) => s.k === "intro").end === later);
  const m3 = L.mainSections(text, R, { body: close.start + 10 });
  ok("bounds: a body start after the close is ignored and marked stale", m3.stale && m3.list.find((s) => s.k === "body").start === body.start);
  const m4 = L.mainSections(text, R, { close: text.length + 50 });
  ok("bounds: a start past the end of the text is ignored and marked stale", m4.stale);
}

// 2A: re-hook points every 8 minutes of the body, each inside the body and with a yes/no gap
{
  const { text, R, m } = run("es", "best");
  const body = m.list.find((s) => s.k === "body"), pts = L.rehookPoints(text, R, m.list);
  ok("re-hooks: one every 8 minutes from the body's start", pts.length === Math.floor((body.t1 - 30 - body.t0 - 1) / 480) && pts.every((p, i) => Math.abs(p.t - (body.t0 + 480 * (i + 1))) < 0.001), JSON.stringify(pts));
  ok("re-hooks: each sits inside the body and says whether a re-hook is missing", pts.every((p) => p.pos >= body.start && p.pos < body.end && typeof p.gap === "boolean"));
  const { text: t2, R: R2, m: w } = run("es", "worst");
  ok("re-hooks: none when the body is shorter than 8 minutes and a half", L.rehookPoints(t2, R2, w.list).length === 0);
  ok("re-hooks: none without a body", L.rehookPoints(text, R, m.list.filter((s) => s.k !== "body")).length === 0);
}
// empty text
ok("empty text: nothing found, all five missing", (() => { const R = L.analyze("", { uiLang: "es", lang: "es" }); const m = L.mainSections("", R); return m.list.length === 0 && m.missing.length === 5; })());

console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
process.exit(fails ? 1 : 0);
