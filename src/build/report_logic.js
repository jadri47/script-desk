
// ---------- Editor's report: one AI read of the whole script, vetted in code (pure, no DOM) ----------
// (jadri47, 2026-10-22: "improve his messages from a 90 level for a YouTube video to a 95-100") The rules catch line faults;
// hook, promise, retention, spoken voice, close and the return viewer need an editor's judgement. Scripture is masked as
// ⟦Vn⟧ before the AI sees it (same masker as polish_logic.js) and every answer is checked here; nothing depends on the AI behaving.
const REPORT_MAX_ITEMS = 7;
// (jadri47, 2026-10-25: "Provide synonyms or alternatives to problematic words when suggesting changes"; picked A: the same call
// returns them, each one checked here.) Up to 2 other ways to write each change, up to 3 replacements for each flagged word.
const REPORT_MAX_ALTS = 2, REPORT_MAX_WORD_ALTS = 3;
// (jadri47, 2026-10-25: "read the text once, instead of every time the user taps sugerir con IA"; picked A.) The same call also
// answers the problems the rules flagged but could not fix by themselves (what «Proponer con IA» and the coach ask one at a time).
const REPORT_MAX_FIXES = 12, REPORT_MAX_FIX_OPTS = 2;

function reportPrompt(text, R, opts) {
  opts = opts || {};
  const en = R.lang === "en";
  const spans = verseSpans(text, R), mk = maskVerses(text, spans, 0, text.length);
  const risk = [...new Set((R.riskHits || []).map((x) => x.text))].map((x) => `«${x}»`).join(", ") || "—";
  const mins = Math.round((R.runtimeSec || 0) / 60);
  const kw = (opts.keyword || "").trim() || (typeof R.keyword === "string" && R.keyword) || "—";
  const shape = `{"areas": {"hook": {"rating": 1-5, "why": "..."}, "promise": {...}, "retention": {...}, "voice": {...}, "close": {...}, "return": {...}}, "items": [{"area": "hook", "original": "...", "replacement": "...", "alts": ["...", "..."], "why": "...", "after": 1-5}], "words": [{"term": "...", "alts": ["...", "...", "..."]}]}`;
  const brief = en
    ? `You are an editor for a YouTube Bible-teaching channel. The author is a preacher with a doctorate: his exegesis and doctrine are not touched, nor are his quotations. Rate from 1 to 5 how the script works for someone watching alone on a phone who has never been to church: the hook in the first 30 seconds, the promise, retention (open questions, re-hooks, nothing dead in the middle), spoken voice (not an essay read aloud), the close and a reason to come back. Propose at most ${REPORT_MAX_ITEMS} changes, only the ones that raise those ratings most; each copies the exact original text and replaces it in the author's own voice. If something already works, do not change it. Keep every "why" to one sentence of at most 20 words. The script is in English: write every "why" and "replacement" in English.`
    : `Eres editor de un canal de YouTube de enseñanza bíblica. El autor es un predicador con doctorado: su exégesis y su doctrina no se tocan, ni sus citas. Valora del 1 al 5 cómo funciona el guion para alguien que lo ve solo en su teléfono y nunca ha ido a una iglesia: gancho de los primeros 30 s, promesa, retención (preguntas abiertas, re-enganches, nada muerto en el medio), voz hablada (no un ensayo leído), cierre y razón para volver. Propón como máximo ${REPORT_MAX_ITEMS} cambios, solo los que más suben esa valoración; cada uno copia el texto original exacto y lo reemplaza con la misma voz del autor. Si algo ya funciona, no lo cambies. Cada "why" es una sola frase de 20 palabras como máximo. El guion está en español neutro (ustedes, sin vosotros ni voseo): escribe cada "why" y "replacement" en español.`;
  const facts = en
    ? `FACTS FROM THE RULES (do not contradict them): sensitive terms found (YouTube can limit ads for them; do not add new ones): ${risk}. Do not change them inside "items". In "words" give, for each of them, up to ${REPORT_MAX_WORD_ALTS} alternatives: plain words that state the same fact without the term YouTube flags, in the same grammatical form (gender, number, tense) so they drop into the same sentence, without softening what the text says happened: the same who, to whom and what happened. Estimated runtime: ${mins} min. Target keyword: ${kw}.`
    : `DATOS DE LAS REGLAS (no los contradigas): términos sensibles encontrados (YouTube puede limitar los anuncios por ellos; no añadas otros): ${risk}. No los cambies dentro de "items". En "words" da, para cada uno, hasta ${REPORT_MAX_WORD_ALTS} alternativas: palabras sencillas que dicen el mismo hecho sin el término que YouTube marca, en la misma forma gramatical (género, número, tiempo) para que encajen en la misma frase, sin suavizar lo que el texto dice que pasó: el mismo quién, a quién y qué pasó. Duración estimada: ${mins} min. Palabra clave: ${kw}.`;
  const rules = en
    ? `RULES: "original" is copied EXACTLY from the script (same case, accents, punctuation, spaces), 3 to 40 words, and appears ONLY ONCE in the script. The verses were replaced by marks like ⟦V1⟧: leave every mark unchanged, never put a mark in "replacement", never write or quote a verse, never add Bible references. "after" is the rating (1-5) the area would get with that change. "area" is one of hook, promise, retention, voice, close, return. "alts" are up to ${REPORT_MAX_ALTS} other ways to write "replacement" (same aim, a different tone: one calmer, one more direct), with the same rules.`
    : `REGLAS: "original" se copia EXACTO del guion (mismas mayúsculas, tildes, puntuación y espacios), de 3 a 40 palabras, y aparece UNA sola vez en el guion. Los versículos fueron reemplazados por marcas como ⟦V1⟧: déjalas tal cual, nunca pongas una marca en "replacement", no escribas ni cites ningún versículo y no añadas referencias bíblicas. "after" es la valoración (1-5) que tendría esa área con ese cambio. "area" es una de hook, promise, retention, voice, close, return. "alts" son hasta ${REPORT_MAX_ALTS} formas distintas de escribir "replacement" (el mismo fin, otro tono: una más tranquila, otra más directa), con las mismas reglas.`;
  const fixes = (opts.fixes || []).slice(0, REPORT_MAX_FIXES);
  const fixBlock = fixes.length ? "\n\n" + (en
    ? `FRAGMENTS TO FIX: below are ${fixes.length} fragment(s) of the same script, each with its problem. In "fixes" write, for EACH one, up to ${REPORT_MAX_FIX_OPTS} different options that rewrite ONLY that fragment to solve that problem: keep the meaning, the theology and the presenter's tone; invent no facts, names, figures or quotes; no template phrases. Marks like ⟦V1⟧ are verses: leave them unchanged, once each and in the same order. These are separate from "items".`
    : `FRAGMENTOS A ARREGLAR: abajo hay ${fixes.length} fragmento(s) del mismo guion, cada uno con su problema. En "fixes" escribe, para CADA uno, hasta ${REPORT_MAX_FIX_OPTS} opciones distintas que reescriban SOLO ese fragmento para resolver ese problema: mantén el sentido, la teología y el tono del presentador; no inventes datos, nombres, cifras ni citas; sin frases de plantilla. Las marcas ⟦V1⟧… son versículos: déjalas tal cual, una vez cada una y en el mismo orden. Esto va aparte de "items".`)
    + "\n\n" + fixes.map((f) => `=== ${f.id}\n${en ? "Problem" : "Problema"}: ${f.problem}\n${en ? "CONTEXT (do not rewrite it)" : "CONTEXTO (no lo reescribas)"}:\n"""\n${f.ctx}\n"""\n${en ? "FRAGMENT TO REWRITE" : "FRAGMENTO A REESCRIBIR"}:\n"""\n${f.frag}\n"""`).join("\n\n") : "";
  const shape2 = fixes.length ? shape.replace(/\}$/, `, "fixes": [{"id": "${fixes[0].id}", "options": [{"text": "...", "why": "..."}]}]}`) : shape;
  const json = (en ? "Answer only with JSON: " : "Responde solo con JSON: ") + shape2;
  return `${brief}\n\n${facts}\n\n${rules}${fixBlock}\n\n${json}\n\n${en ? "SCRIPT" : "GUION"}:\n"""\n${mk.masked}\n"""`;
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
  // a replacement (or one of its alternatives) for text[start, end): its check, or null when it breaks any rule
  const vetRep = (o, start, end, c) => {
    if (typeof c !== "string" || !c.trim() || c === o || c.length > 1000) return null;
    if (/⟦|⟧/.test(c)) return null; // a verse mark never goes into a replacement
    if (findReferences(c).length > findReferences(o).length || findQuotes(c).length > findQuotes(o).length) return null;
    const check = verifyProposal(text, opts, R, { kind: "patch", patches: [{ start, end, rep: c }] });
    if (check.broke.some((id) => /^(pf-|pack-)/.test(id))) return null; // no new ad or packaging problem
    if (analyze(check.text, check.opts).riskHits.length > riskBefore) return null; // no new sensitive term, even if that check was already open
    return check;
  };
  for (const it of list) {
    if (items.length >= REPORT_MAX_ITEMS) break;
    if (!it || !REPORT_AREAS.includes(it.area)) continue;
    let o = typeof it.original === "string" ? it.original : "";
    const c = typeof it.replacement === "string" ? it.replacement : "";
    if (!o.trim() || !c.trim() || o === c || o.length > 800 || c.length > 1000) continue;
    for (const t of toks) o = o.split(t.tok).join(t.text); // the AI saw tokens; locate on the real text
    if (/⟦|⟧/.test(o)) continue; // a token that is not one of ours
    const i = text.indexOf(o);
    if (i < 0 || text.indexOf(o, i + 1) >= 0) continue; // not found, or not unique
    const start = i, end = i + o.length;
    if (verse.some((s) => start < s.end && end > s.start)) continue; // never touches Scripture
    if (items.some((x) => start < x.end && x.start < end)) continue; // overlaps a change already kept
    const check = vetRep(o, start, end, c);
    if (!check) continue;
    const alts = [];
    for (const a of Array.isArray(it.alts) ? it.alts : []) {
      if (alts.length >= REPORT_MAX_ALTS) break;
      if (typeof a === "string" && a !== c && !alts.includes(a) && vetRep(o, start, end, a)) alts.push(a);
    }
    items.push({ area: it.area, start, end, original: o, replacement: c, alts, why: String(it.why || "").slice(0, 300), after: reportRating(it.after), check });
  }
  return { areas, items, words: vetWords(text, json, opts, R, verse), dropped: list.length - items.length };
}

// The AI's options for the fragments sent in "fixes", keyed by item id: [{ text, why }]. items = what was sent (fixItem results:
// id, orig, toks). Each option goes through vetSection (polish_logic.js): a verse mark lost, duplicated, moved or invented, a new
// reference or quote, or a length far from the original drops it. Unknown ids and garbage are ignored.
function vetFixes(json, items) {
  const out = {}, got = json && Array.isArray(json.fixes) ? json.fixes : [];
  for (const it of items || []) {
    const mine = got.find((g) => g && g.id === it.id);
    const raw = [];
    for (const o of mine && Array.isArray(mine.options) ? mine.options : []) {
      if (raw.length >= REPORT_MAX_FIX_OPTS) break;
      if (!o || typeof o.text !== "string") continue;
      const v = vetSection(it.orig, it.toks || [], o.text, []);
      if (v.ok && v.text.trim() && v.text.trim() !== it.orig.trim() && !raw.some((r) => r.text === v.text.trim())) raw.push({ text: v.text.trim(), why: String(o.why || "").slice(0, 300) });
    }
    if (raw.length) out[it.id] = raw;
  }
  return out;
}

// (jadri47, 2026-10-28: "yes to 6", option B) A word swap must never soften what Scripture says. A flagged term keeps its word
// wherever its sentence quotes or cites Scripture (a verse, an announced verse or a reference) or says it is reporting it
// («dice la Biblia», «como dice», «está escrito»…). Deterministic: no extra AI call, no self-grading. The ad warning stays there.
const SCRIPTURE_SAYS = /(?<![\p{L}])(dice la (biblia|palabra|escritura)|la (biblia|palabra|escritura) dice|dice el texto|el texto dice|dice ahí|como dice|está escrito|escrito está|según (la biblia|la palabra|la escritura|el texto)|the bible says|scripture says|the text says|it is written|as it says)(?![\p{L}])/iu;
function scriptureSentences(text, R) {
  const verse = verseSpans(text, R);
  return sentences(text).filter((s) => SCRIPTURE_SAYS.test(s.text) || verse.some((v) => v.start < s.end && v.end > s.start)).map((s) => ({ start: s.start, end: s.end }));
}
// The flagged words' alternatives, keyed by the lower-case term. An alternative is kept only if it is short plain text (no verse
// mark, reference or quote) and, put in place of the term's first occurrence outside Scripture, leaves fewer sensitive terms and
// none inside the replaced span. A term found only inside a verse gets none: Scripture is never changed.
function vetWords(text, json, opts, R, verse) {
  const out = {}, list = json && Array.isArray(json.words) ? json.words : [];
  const keep = [...verse, ...scriptureSentences(text, R)]; // never swapped: Scripture and sentences that report it
  const hits = (R.riskHits || []).filter((x) => !keep.some((s) => x.start < s.end && x.end > s.start));
  const before = (R.riskHits || []).length;
  for (const w of list) {
    const term = w && typeof w.term === "string" ? w.term.trim().toLowerCase() : "";
    if (!term || out[term]) continue;
    const hit = hits.find((x) => x.text.toLowerCase() === term);
    if (!hit) continue; // not a term the rules flagged here
    const alts = [];
    for (const a of Array.isArray(w.alts) ? w.alts : []) {
      if (alts.length >= REPORT_MAX_WORD_ALTS) break;
      const v = typeof a === "string" ? a.trim() : "";
      if (!v || v.length > 80 || v.split(/\s+/).length > 8 || v.toLowerCase() === term || alts.includes(v)) continue;
      if (/⟦|⟧/.test(v) || findReferences(v).length || findQuotes(v).length) continue;
      const rv = matchCase(hit.text, v), e2 = hit.start + rv.length;
      const r2 = analyze(applyPatches(text, [{ start: hit.start, end: hit.end, rep: rv }]), opts).riskHits;
      if (r2.length >= before || r2.some((x) => x.start < e2 && x.end > hit.start)) continue;
      alts.push(v);
    }
    if (alts.length) out[term] = alts;
  }
  return out;
}

// The rows of an ad-risk card that can take a word from the report: one row per term of that category that has alternatives, with
// every place it occurs outside Scripture (one choice per word, not per occurrence: «pandemia» eight times is one decision).
// pick: { [term in lower case]: index } (default 0). Returns the rows, the one patch that applies them all, and kept = occurrences left as written because their sentence reports Scripture.
function reportWordRows(text, R, cat, words, pick) {
  const verse = verseSpans(text, R).filter((s) => s.kind !== "ref"), says = scriptureSentences(text, R);
  const inV = (x, sp) => sp.some((s) => x.start < s.end && x.end > s.start);
  const mine = (R.riskHits || []).filter((x) => x.cat === cat && !inV(x, verse));
  const kept = mine.filter((x) => inV(x, says)).length; // occurrences left as written: their sentence reports Scripture
  const hits = mine.filter((x) => !inV(x, says))
    .sort((a, b) => a.start - b.start)
    .filter((x, i, a) => !a.some((y, j) => j < i && x.start < y.end)); // overlapping hits: keep the first
  const rows = [];
  for (const x of hits) {
    const key = x.text.toLowerCase(), alts = (words || {})[key] || [];
    if (!alts.length) continue;
    let r = rows.find((y) => y.key === key);
    if (!r) rows.push((r = { key, term: x.text, alts, hits: [] }));
    r.hits.push({ start: x.start, end: x.end, text: x.text });
  }
  const patches = rows.flatMap((r) => { const v = r.alts[Math.min((pick || {})[r.key] || 0, r.alts.length - 1)]; return r.hits.map((x) => ({ start: x.start, end: x.end, rep: matchCase(x.text, v) })); })
    .sort((a, b) => a.start - b.start);
  return { rows, patches, kept };
}
// «Torturados» at the start of a sentence becomes «Azotados con varas», not «azotados con varas»
function matchCase(term, v) { return /^\p{Lu}/u.test(term) && /^\p{Ll}/u.test(v) ? v[0].toUpperCase() + v.slice(1) : v; }

// ---- the score counts accepted changes (jadri47, 2026-10-26: plan step 1) ----
// Text-derived state of one report item: "pending" (its original is found exactly once), "applied" (the original is gone or
// repeated and the replacement, or one of its alternatives, is in the text) or "lost". rpStates (report_ui.js) adds the log and skips.
function itemState(text, it) {
  const a = text.indexOf(it.original);
  if (a >= 0 && text.indexOf(it.original, a + 1) < 0) return "pending";
  if (text.includes(it.replacement) || (it.alts || []).some((x) => x && text.includes(x))) return "applied";
  return "lost";
}
// Applied for the score: the original is NOT in the text and the replacement or an alternative is.
function itemApplied(text, it) {
  if (!it || typeof it.original !== "string" || !it.original || text.includes(it.original)) return false;
  return (typeof it.replacement === "string" && it.replacement !== "" && text.includes(it.replacement)) || (it.alts || []).some((x) => typeof x === "string" && x !== "" && text.includes(x));
}
// A copy of the report whose areas are raised, for each applied item, to min(5, item.after); never lowered. A raised area has est: true.
// A new measurement replaces report.areas, and the applied items' originals are no longer in the text it was made on, so nothing is raised twice.
function effectiveReport(text, report) {
  if (!report) return null;
  const areas = {};
  for (const k of REPORT_AREAS) areas[k] = report.areas && report.areas[k] ? { ...report.areas[k] } : { rating: null };
  for (const it of report.items || []) {
    if (!areas[it.area] || it.after == null || !itemApplied(text, it)) continue;
    const up = Math.min(5, it.after), cur = areas[it.area].rating;
    if (up > (cur || 0)) { areas[it.area].rating = up; areas[it.area].est = true; }
  }
  return { ...report, areas };
}
// Points that change i adds: the readiness of the text with it applied (rep: which wording, default the replacement) minus the
// readiness now. Same recipe as the total (readinessOf with the text), so it equals the real move. 0 when the item is not pending.
function itemGain(text, R, opts, report, i, rep, dismissed) {
  const it = report && report.items && report.items[i];
  if (!it || itemState(text, it) !== "pending") return 0;
  const a = text.indexOf(it.original), t2 = applyPatches(text, [{ start: a, end: a + it.original.length, rep: rep == null ? it.replacement : rep }]);
  const pts = (rd) => (rd.score == null ? rd.rules : rd.score);
  return pts(readinessOf(analyze(t2, opts), report, dismissed, t2)) - pts(readinessOf(R, report, dismissed, text));
}
// Ratings captured once, the first time the script was measured: this report's baseline if it has one, else the previous report's
// baseline, else the previous report's ratings when it is for the same script key, else its own ratings. Returns a copy.
function withBaseline(report, prev) {
  if (!report) return report;
  const ratings = (r) => { const o = {}; for (const k of REPORT_AREAS) { const v = r && r.areas && r.areas[k] && r.areas[k].rating; if (v != null) o[k] = v; } return o; };
  const own = cleanBaseline(report.baseline);
  const base = own || cleanBaseline(prev && prev.baseline) || (prev && prev.areas && prev.key === report.key && Object.keys(ratings(prev)).length ? ratings(prev) : ratings(report));
  return { ...report, baseline: base };
}
// (jadri47, 2026-10-28: "one «antes» everywhere") The readiness the person saw when this report landed: a whole number 0-100, else null.
// It is replaced by each new measurement (unlike baseline), so «antes → ahora» always starts from what the pill showed then.
function cleanBefore(v) { return Number.isInteger(v) && v >= 0 && v <= 100 ? v : null; }
// What the report's call cost in USD, from the server's bill; null when unknown (the artifact, an old report). Never invented.
function cleanCost(v) { return typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 100 ? v : null; }
// Only valid 1-5 whole numbers per known area survive; null when none do.
function cleanBaseline(b) {
  if (!b || typeof b !== "object") return null;
  const o = {};
  for (const k of REPORT_AREAS) if (Number.isInteger(b[k]) && b[k] >= 1 && b[k] <= 5) o[k] = b[k];
  return Object.keys(o).length ? o : null;
}

// The readiness if every kept change were applied: the rules part is re-run on the changed text; the editor part starts from report.areas (pass
// effectiveReport(text, report).areas to include changes already applied, as the panel does) with each item's area raised to the rating the AI says the change earns (never above 5,
// never lowered). Shown as "si aceptas lo propuesto". The points come from readinessOf, the one table.
function projectedReadiness(text, R, opts, report) {
  const items = (report && report.items) || [];
  const t2 = applyPatches(text, items.map((x) => ({ start: x.start, end: x.end, rep: x.replacement })));
  const areas = {};
  for (const k of REPORT_AREAS) areas[k] = { rating: report && report.areas && report.areas[k] ? report.areas[k].rating : null };
  for (const it of items) {
    const cur = areas[it.area].rating, up = it.after == null ? null : Math.min(5, it.after);
    if (up != null && up > (cur || 0)) areas[it.area].rating = up;
  }
  const r2 = readinessOf(analyze(t2, opts), { areas });
  return r2.score;
}
