
// ---------- Editor's report: one AI read of the whole script, vetted in code (pure, no DOM) ----------
// (jadri47, 2026-10-22: "improve his messages from a 90 level for a YouTube video to a 95-100") The rules catch line faults;
// hook, promise, retention, spoken voice, close and the return viewer need an editor's judgement. Scripture is masked as
// ⟦Vn⟧ before the AI sees it (same masker as polish_logic.js) and every answer is checked here; nothing depends on the AI behaving.
const REPORT_MAX_ITEMS = 7;

function reportPrompt(text, R, opts) {
  opts = opts || {};
  const en = R.lang === "en";
  const spans = verseSpans(text, R), mk = maskVerses(text, spans, 0, text.length);
  const risk = [...new Set((R.riskHits || []).map((x) => x.text))].map((x) => `«${x}»`).join(", ") || "—";
  const mins = Math.round((R.runtimeSec || 0) / 60);
  const kw = (opts.keyword || "").trim() || (typeof R.keyword === "string" && R.keyword) || "—";
  const shape = `{"areas": {"hook": {"rating": 1-5, "why": "..."}, "promise": {...}, "retention": {...}, "voice": {...}, "close": {...}, "return": {...}}, "items": [{"area": "hook", "original": "...", "replacement": "...", "why": "...", "after": 1-5}]}`;
  const brief = en
    ? `You are an editor for a YouTube Bible-teaching channel. The author is a preacher with a doctorate: his exegesis and doctrine are not touched, nor are his quotations. Rate from 1 to 5 how the script works for someone watching alone on a phone who has never been to church: the hook in the first 30 seconds, the promise, retention (open questions, re-hooks, nothing dead in the middle), spoken voice (not an essay read aloud), the close and a reason to come back. Propose at most ${REPORT_MAX_ITEMS} changes, only the ones that raise those ratings most; each copies the exact original text and replaces it in the author's own voice. If something already works, do not change it. The script is in English: write every "why" and "replacement" in English.`
    : `Eres editor de un canal de YouTube de enseñanza bíblica. El autor es un predicador con doctorado: su exégesis y su doctrina no se tocan, ni sus citas. Valora del 1 al 5 cómo funciona el guion para alguien que lo ve solo en su teléfono y nunca ha ido a una iglesia: gancho de los primeros 30 s, promesa, retención (preguntas abiertas, re-enganches, nada muerto en el medio), voz hablada (no un ensayo leído), cierre y razón para volver. Propón como máximo ${REPORT_MAX_ITEMS} cambios, solo los que más suben esa valoración; cada uno copia el texto original exacto y lo reemplaza con la misma voz del autor. Si algo ya funciona, no lo cambies. El guion está en español neutro (ustedes, sin vosotros ni voseo): escribe cada "why" y "replacement" en español.`;
  const facts = en
    ? `FACTS FROM THE RULES (do not contradict them): sensitive terms found (do not replace them with euphemisms, do not add new ones): ${risk}. Estimated runtime: ${mins} min. Target keyword: ${kw}.`
    : `DATOS DE LAS REGLAS (no los contradigas): términos sensibles encontrados (no los cambies por eufemismos ni añadas otros): ${risk}. Duración estimada: ${mins} min. Palabra clave: ${kw}.`;
  const rules = en
    ? `RULES: "original" is copied EXACTLY from the script (same case, accents, punctuation, spaces), 3 to 40 words, and appears ONLY ONCE in the script. The verses were replaced by marks like ⟦V1⟧: leave every mark unchanged, never put a mark in "replacement", never write or quote a verse, never add Bible references. "after" is the rating (1-5) the area would get with that change. "area" is one of hook, promise, retention, voice, close, return.`
    : `REGLAS: "original" se copia EXACTO del guion (mismas mayúsculas, tildes, puntuación y espacios), de 3 a 40 palabras, y aparece UNA sola vez en el guion. Los versículos fueron reemplazados por marcas como ⟦V1⟧: déjalas tal cual, nunca pongas una marca en "replacement", no escribas ni cites ningún versículo y no añadas referencias bíblicas. "after" es la valoración (1-5) que tendría esa área con ese cambio. "area" es una de hook, promise, retention, voice, close, return.`;
  const json = (en ? "Answer only with JSON: " : "Responde solo con JSON: ") + shape;
  return `${brief}\n\n${facts}\n\n${rules}\n\n${json}\n\n${en ? "SCRIPT" : "GUION"}:\n"""\n${mk.masked}\n"""`;
}

const reportRating = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null; };

// json: whatever the model sent (untrusted). Returns the normalised areas and only the items that survive every check.
function vetReport(text, json, opts, R) {
  const areas = {};
  for (const k of REPORT_AREAS) {
    const a = json && json.areas && json.areas[k];
    areas[k] = { rating: reportRating(a && a.rating), why: String((a && a.why) || "").slice(0, 300) };
  }
  const list = json && Array.isArray(json.items) ? json.items : [];
  const spans = verseSpans(text, R), verse = spans.filter((s) => s.kind !== "ref");
  const mk = maskVerses(text, spans, 0, text.length); // same numbering the prompt used
  const toks = mk.toks || [];
  const items = [];
  const riskBefore = (R.riskHits || []).length;
  for (const it of list) {
    if (items.length >= REPORT_MAX_ITEMS) break;
    if (!it || !REPORT_AREAS.includes(it.area)) continue;
    let o = typeof it.original === "string" ? it.original : "";
    const c = typeof it.replacement === "string" ? it.replacement : "";
    if (!o.trim() || !c.trim() || o === c || o.length > 800 || c.length > 1000) continue;
    if (/⟦|⟧/.test(c)) continue; // a verse mark never goes into a replacement
    for (const t of toks) o = o.split(t.tok).join(t.text); // the AI saw tokens; locate on the real text
    if (/⟦|⟧/.test(o)) continue; // a token that is not one of ours
    const i = text.indexOf(o);
    if (i < 0 || text.indexOf(o, i + 1) >= 0) continue; // not found, or not unique
    const start = i, end = i + o.length;
    if (verse.some((s) => start < s.end && end > s.start)) continue; // never touches Scripture
    if (findReferences(c).length > findReferences(o).length || findQuotes(c).length > findQuotes(o).length) continue;
    if (items.some((x) => start < x.end && x.start < end)) continue; // overlaps a change already kept
    const check = verifyProposal(text, opts, R, { kind: "patch", patches: [{ start, end, rep: c }] });
    if (check.broke.some((id) => /^(pf-|pack-)/.test(id))) continue; // no new ad or packaging problem
    if (analyze(check.text, check.opts).riskHits.length > riskBefore) continue; // no new sensitive term, even if that check was already open
    items.push({ area: it.area, start, end, original: o, replacement: c, why: String(it.why || "").slice(0, 300), after: reportRating(it.after), check });
  }
  return { areas, items, dropped: list.length - items.length };
}

// The readiness if every kept change were applied: the rules part is re-run on the changed text; the editor part raises each
// item's area to the rating the AI says the change earns (never above 5, never lowered). Shown as "si aceptas lo propuesto".
function projectedReadiness(text, R, opts, report) {
  const items = (report && report.items) || [];
  const t2 = applyPatches(text, items.map((x) => ({ start: x.start, end: x.end, rep: x.replacement })));
  const r2 = readinessOf(analyze(t2, opts), null);
  const areas = {};
  for (const k of REPORT_AREAS) areas[k] = { rating: report && report.areas && report.areas[k] ? report.areas[k].rating : null };
  for (const it of items) {
    const cur = areas[it.area].rating, up = it.after == null ? null : Math.min(5, it.after);
    if (up != null && up > (cur || 0)) areas[it.area].rating = up;
  }
  const editor = REPORT_AREAS.reduce((a, k) => a + (RATING_PTS[areas[k].rating] || 0), 0);
  return Math.min(r2.rules + editor, r2.red ? 69 : 100);
}
