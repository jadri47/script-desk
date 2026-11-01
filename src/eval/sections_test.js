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
// the Opus call: what goes out and what comes back
{
  const { text, R, m } = run("es", "best");
  const p = L.sectionsPrompt(text, R, m);
  ok("prompt: the five section headings, script last", ["GANCHO", "PROMESA", "INTRODUCCIÓN", "DESARROLLO", "CIERRE"].every((h) => p.includes("### " + h)) && p.trim().endsWith('"""'));
  ok("prompt: much shorter than the script (body as excerpts)", p.length < text.length / 2, [p.length, text.length]);
  ok("prompt: no verse text goes out, only marks", L.verseSpans(text, R).filter((s) => s.kind !== "ref").every((s) => s.end - s.start < 25 || !p.includes(text.slice(s.start, s.end))));
  const U = L.buildUnits(R, text), inSec = (k) => { const s = m.list.find((x) => x.k === k); return U.find((u) => u.start >= s.start && u.end <= s.end && u.text.split(/\s+/).length >= 4 && u.text.split(/\s+/).length <= 30 && !/[«»"“”]/.test(u.text) && text.indexOf(u.text) === text.lastIndexOf(u.text)); };
  const h = inSec("hook"), b = inSec("body"), c = inSec("close");
  const json = { areas: { hook: { rating: 4, why: "a" }, promise: { rating: 5 }, retention: { rating: 3 }, voice: { rating: 2 }, close: { rating: 4 }, return: { rating: 3 } },
    items: [
      { sec: "hook", area: "hook", original: h.text, replacement: h.text.replace(/[.?!]$/, "") + ", y hoy lo cambiamos.", why: "x", after: 5 },
      { sec: "hook", area: "hook", original: b.text, replacement: b.text.replace(/[.?!]$/, "") + ", sin duda.", why: "lies: it is in the body", after: 5 },
      { sec: "close", area: "return", original: c.text, replacement: c.text.replace(/[.?!]$/, "") + ", y nos vemos la próxima semana.", why: "y", after: 4 },
      { sec: "intro", area: "promise", original: b.text, replacement: b.text + " Más.", why: "wrong area for an intro", after: 4 }] };
  const v = L.vetSections(text, json, { uiLang: "es", lang: "es" }, R, m);
  ok("vet: a change inside its own section is kept, with its section", v.items.some((x) => x.sec === "hook" && x.original === h.text) && v.items.some((x) => x.sec === "close"), JSON.stringify(v.items.map((x) => [x.sec, x.original.slice(0, 30)])));
  ok("vet: a change that names the hook but sits in the body is dropped", !v.items.some((x) => x.original === b.text), JSON.stringify(v.items.map((x) => x.sec)));
  ok("vet: an area that does not belong to the section is dropped", v.items.length === 2 && v.dropped === 2, [v.items.length, v.dropped]);
  ok("vet: the five areas of 6A, spoken voice left for the detailed call", JSON.stringify(Object.keys(v.areas)) === JSON.stringify(["hook", "promise", "retention", "close", "return"]) && v.areas.hook.rating === 4);
}
{
  // a missing promise is proposed as an insert after the hook
  const { text, R, m } = run("es", "mid");
  const U = L.buildUnits(R, text), hook = m.list.find((x) => x.k === "hook"), last = U.filter((u) => u.end <= hook.end).pop();
  const json = { areas: {}, items: [{ sec: "promise", area: "promise", original: last.text, replacement: last.text + " Hoy vas a descubrir por qué esto importa.", why: "falta la promesa", after: 4 }] };
  const v = L.vetSections(text, json, { uiLang: "es", lang: "es" }, R, m);
  ok("vet: a missing promise comes back as an insert and is kept", m.missing.includes("promise") && v.items.length === 1 && v.items[0].sec === "promise", JSON.stringify([m.missing, v.items.length, last && last.text]));
}

// empty text
ok("empty text: nothing found, all five missing", (() => { const R = L.analyze("", { uiLang: "es", lang: "es" }); const m = L.mainSections("", R); return m.list.length === 0 && m.missing.length === 5; })());

console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
process.exit(fails ? 1 : 0);
