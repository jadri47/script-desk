// Score v2 properties. Run from /home/claude/sd: node eval/score_test.js
const L = require("../build/logic.js");
const ex = JSON.parse(require("fs").readFileSync(__dirname + "/../build/examples.json", "utf8"));
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } };
const opts = (e, lg, over = {}) => ({ title: e.title, keyword: e.keyword, thumb: e.thumb, description: e.description, series: e.series, nextEp: e.nextEp, bigIdea: e.bigIdea, translation: e.translation, uiLang: lg, lang: lg, ...over });
// mirror of verdictOf's lamp (guide_ui.js)
const lamp = (R, dismissed) => {
  const rows = Object.values(R.sections).flat().filter((r) => !r.passed || r.warn);
  const red = R.worst === "rojo" || rows.some((r) => r.level === "rojo");
  const n = rows.filter((r) => !L.FIX_SKIP.has(r.id) && !dismissed.has(r.id)).length;
  return red ? "rojo" : n ? "amarillo" : "verde";
};
let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const clone = (R) => JSON.parse(JSON.stringify(R));
const fixRows = (R, ids) => { const R2 = clone(R); for (const r of Object.values(R2.sections).flat()) if (ids.has(r.id)) { r.passed = true; r.warn = false; } return R2; };
const PIN = { es: [0, 17, 53, 91, 100], en: [0, 16, 55, 96, 100] };
const ladder = {};
for (const lg of ["es", "en"]) {
  ladder[lg] = [];
  for (const k of ["worst", "bad", "mid", "good", "best"]) {
    const e = ex[lg][k], R = L.analyze(e.text, opts(e, lg)), S = L.scoreOf(R);
    ladder[lg].push(S.score);
    const rows = Object.values(R.sections).flat();
    // every engine row has an explicit weight (pf-/pack- are weighed by rule)
    for (const r of rows) if (!/^(pf|pack)-/.test(r.id)) ok(`${lg}/${k}: row ${r.id} has an explicit weight`, Object.prototype.hasOwnProperty.call(L.SCORE_W, r.id));
    ok(`${lg}/${k}: lamp equals verdict`, S.band === lamp(R, new Set()), S.band);
    ok(`${lg}/${k}: rojo => <= 69`, S.band !== "rojo" || S.score <= 69, S.score);
    ok(`${lg}/${k}: verde => >= 90`, S.band !== "verde" || S.score >= 90, S.score);
    ok(`${lg}/${k}: yellow never 100`, S.band !== "amarillo" || S.score <= 99, S.score);
    // fixing any single open row raises the score by >= its weight (unless the rojo gate or 100 binds)
    for (const row of S.open) {
      const F = L.scoreOf(fixRows(R, new Set([row.id])));
      const w = L.weightOf(row);
      ok(`${lg}/${k}: fixing ${row.id} never lowers`, F.score >= S.score, F.score + " < " + S.score);
      if (S.band !== "rojo" && S.score + w <= 99) ok(`${lg}/${k}: fixing ${row.id} gains >= ${w}`, F.score - S.score >= w, `${F.score - S.score}`);
      ok(`${lg}/${k}: weight ${row.id} >= 1`, w >= 1);
    }
    // dismissal: 200 random subsets
    const cand = S.open;
    for (let i = 0; i < 200 && cand.length; i++) {
      const sub = new Set(cand.filter(() => rnd() < 0.5).map((r) => r.id));
      const D = L.scoreOf(R, sub), F = L.scoreOf(fixRows(R, sub));
      ok(`${lg}/${k}: dismissed lamp equals verdict`, D.band === lamp(R, sub), D.band + " vs " + lamp(R, sub));
      ok(`${lg}/${k}: dismissing <= fixing`, D.score <= F.score, `${D.score} > ${F.score}`);
      ok(`${lg}/${k}: dismissing >= leaving open`, D.score >= S.score, `${D.score} < ${S.score}`);
      if (D.band === "verde") ok(`${lg}/${k}: verde dismissed capped`, D.score <= 100 - Math.min(1, D.ignored.length) && D.score >= 90, D.score);
    }
    const all = new Set(cand.map((r) => r.id)); const A = L.scoreOf(R, all);
    if (A.band === "verde" && cand.length) ok(`${lg}/${k}: dismiss-all stays 90..99`, A.score >= 90 && A.score <= 99, A.score);
    // packaging fields: a field moves the score only by its own rows' weights
    if (k !== "worst") {
      const full = L.scoreOf(R), bare = L.scoreOf(L.analyze(e.text, opts(e, lg, { title: "", description: "", thumb: "" })));
      const own = ["title", "desc", "pack-Título", "pack-Texto de miniatura", "pack-Descripción", "pack-Title", "pack-Thumbnail text", "pack-Description"].reduce((a, id) => a + (full.pts.get(id) || 0) + (bare.pts.get(id) || 0), 0);
      if (full.band === bare.band) ok(`${lg}/${k}: fields move score <= their own rows`, Math.abs(full.score - bare.score) <= own + 1, `${full.score} vs ${bare.score} (own ${own})`);
    }
  }
  ok(`${lg}: ladder strictly increasing`, ladder[lg].every((v, i) => i === 0 || v > ladder[lg][i - 1]), ladder[lg].join(" < "));
  ok(`${lg}: ladder pinned`, JSON.stringify(ladder[lg]) === JSON.stringify(PIN[lg]), ladder[lg].join(","));
  console.log(lg, "ladder", ladder[lg].join(" → "));
}
console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
process.exit(fails ? 1 : 0);
