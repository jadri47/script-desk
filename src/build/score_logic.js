/* ===== Puntuación Script Desk v2 (0–100): puntos que se pierden por cada revisión pendiente, según su impacto =====
   score = 100 − Σ peso(revisión pendiente) − mitad del peso de las descartadas (tope 10).
   Una revisión roja abierta limita la nota a 69. La lámpara (rojo/amarillo/verde) es la señal de política y NO limita el número
   salvo el rojo. Pesos por nivel:
     A anuncios (pf-* rojo 30 con tope 69, pf-* amarillo 8, pack-* 6) · B primeros 30 s y estructura 1–5 · C mensaje y citas 1–4
     D que te encuentren 1–3 · E cómo suena y autenticidad 1–2. Cada id nuevo del motor debe tener su peso aquí (lo exige score_test). */
const SCORE_W = {
  promise: 5, content: 5, greeting: 4, cta: 3, ending: 2, hook: 2, rehook: 1, prayer: 1,
  bigidea: 4, recap: 3, application: 3, onscreen: 2, jargon: 1, pulpit: 1, reading: 1, refs: 3,
  kw: 3, title: 3, desc: 2, search: 2, kwspread: 1, chapters: 1, support: 1, kwopen: 1,
  readability: 2, long: 1, regional: 1, weak: 1, muletillas: 1,
  aitell: 2, openers: 1, rhythm: 1,
  runtime: 0,
};
const SCORE_TIER = { pf: "A", pack: "A", promise: "B", content: "B", greeting: "B", cta: "B", ending: "B", hook: "B", rehook: "B", prayer: "B",
  bigidea: "C", recap: "C", application: "C", onscreen: "C", jargon: "C", pulpit: "C", reading: "C", refs: "C",
  kw: "D", title: "D", desc: "D", search: "D", kwspread: "D", chapters: "D", support: "D", kwopen: "D" };
// Checks that count instances over the whole script give partial credit: each instance over the allowed number costs
// a point, up to the cap, so fixing one paragraph moves the score (jadri47, 2026-10-21: "B: partial credit").
const SCORE_CAP = { long: 4, muletillas: 3, weak: 3, regional: 3, aitell: 3, onscreen: 3, jargon: 3, pulpit: 3, openers: 2, cta: 3 };
function weightOf(r) {
  if (/^pf-/.test(r.id)) return r.level === "rojo" ? 30 : 8;
  if (/^pack-/.test(r.id)) return 6;
  if (r.n != null && Object.prototype.hasOwnProperty.call(SCORE_CAP, r.id)) return Math.min(SCORE_CAP[r.id], Math.max(1, r.n - (r.lim || 0)));
  return Object.prototype.hasOwnProperty.call(SCORE_W, r.id) ? SCORE_W[r.id] : 2;
}
function tierOf(r) { return /^pf-/.test(r.id) ? "A" : /^pack-/.test(r.id) ? "A" : SCORE_TIER[r.id] || "E"; }
function scoreOf(R, dismissed) {
  dismissed = dismissed || new Set();
  const rows = Object.values(R.sections).flat();
  const cand = rows.filter((r) => (!r.passed || r.warn) && !FIX_SKIP.has(r.id));
  const open = cand.filter((r) => !dismissed.has(r.id));
  const ignored = cand.filter((r) => dismissed.has(r.id));
  const pts = new Map(); cand.forEach((r) => pts.set(r.id, weightOf(r)));
  const openPts = open.reduce((a, r) => a + pts.get(r.id), 0);
  const dismissPen = Math.min(10, Math.ceil(ignored.reduce((a, r) => a + pts.get(r.id), 0) / 2));
  const lost = openPts + dismissPen;
  const redOpen = open.some((r) => r.level === "rojo" && (!r.passed || r.warn));
  const redLamp = R.worst === "rojo" || rows.some((r) => (!r.passed || r.warn) && r.level === "rojo");
  let score = Math.max(0, Math.min(100, 100 - lost));
  if (redLamp) score = Math.min(score, 69);
  // verde = nada abierto: el tope de lo descartado (10) garantiza ≥ 90
  const band = redLamp ? "rojo" : open.length ? "amarillo" : "verde";
  if (band === "verde") score = Math.max(90, score);
  if (band === "amarillo") score = Math.min(score, 99);
  return { score, band, open, ignored, pts, lost, openPts, dismissPen, redOpen, total: rows.length, passed: R.passed };
}

/* ===== Preparado para YouTube (readiness, 0–100) =====
   (jadri47, 2026-10-22: "one score, readiness, recalibrated") 40 puntos que calcula la app sola + 60 de la valoración del editor.
   Las revisiones línea por línea (muletillas, frases largas, regionalismos…) ya NO cuentan: viven en «Más detalles» con scoreOf. */
const REPORT_AREAS = ["hook", "promise", "retention", "voice", "close", "return"];
// A 4/5 is still good: 9 of 10 (jadri47, 2026-10-22).
const RATING_PTS = { 1: 0, 2: 4, 3: 7, 4: 9, 5: 10 };
const READY_BUCKET = { ads: 20, pack: 12, len: 8 };
const READY_PACK_IDS = new Set(["title", "desc", "chapters", "kw"]);
const READY_LEN_IDS = new Set(["runtime", "cta", "ending"]);
// scoreOf weighs runtime 0 (it is not a fault in the text), but under 8 min there are no mid-roll ads: here it costs.
const READY_W = { runtime: 4 };
// report: {areas:{hook:{rating}…}} or null. Without a report there is NO editor part and NO 100-scale score: score is null
// (no invented number). dismissed: rows the person ignored count as passed here.
function readinessOf(R, report, dismissed) {
  dismissed = dismissed || new Set();
  const rows = Object.values(R.sections).flat();
  const open = rows.filter((r) => (!r.passed || r.warn) && !dismissed.has(r.id));
  const lose = (pred) => open.filter(pred).reduce((a, r) => a + (READY_W[r.id] ?? weightOf(r)), 0);
  const red = R.worst === "rojo" || rows.some((r) => (!r.passed || r.warn) && r.level === "rojo");
  const ads = red ? 0 : Math.max(0, READY_BUCKET.ads - lose((r) => /^pf-/.test(r.id)));
  const pack = Math.max(0, READY_BUCKET.pack - lose((r) => /^pack-/.test(r.id) || READY_PACK_IDS.has(r.id)));
  const len = Math.max(0, READY_BUCKET.len - lose((r) => READY_LEN_IDS.has(r.id)));
  const rules = ads + pack + len;
  const parts = { ads, pack, len };
  if (!report || !report.areas) return { score: null, rules, rulesMax: 40, editor: null, red, parts };
  // A missing or invalid rating counts 0: the report exists, so a blank area is not a pass.
  const editor = REPORT_AREAS.reduce((a, k) => { const v = report.areas[k] && report.areas[k].rating; return a + (RATING_PTS[v] || 0); }, 0);
  let score = rules + editor;
  if (red) score = Math.min(score, 69);
  return { score, rules, rulesMax: 40, editor, red, parts };
}
