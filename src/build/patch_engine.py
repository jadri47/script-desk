import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:80])
    s = s.replace(old, new)

# 1. cue helpers after insideAny
rep("""function insideAny(spans, start, end) { return spans.some((s) => start >= s.start && end <= s.end); }
""", """function insideAny(spans, start, end) { return spans.some((s) => start >= s.start && end <= s.end); }
// Same answer as insideAny for many lookups against one list: a span contains [start,end] when the largest end among the spans that
// begin at or before start reaches end. Sorted once, then a binary search per lookup (a 30-minute script asked it ~6,000 times per
// analyze over ~400 sentences; the plain scan made every analyze 45 ms of which half was these loops).
function insideTester(spans) {
  const sp = spans.slice().sort((a, b) => a.start - b.start), reach = []; let m = -Infinity;
  for (const x of sp) { m = Math.max(m, x.end); reach.push(m); }
  return (start, end) => { let lo = 0, hi = sp.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (sp[mid].start <= start) lo = mid + 1; else hi = mid; } return lo > 0 && reach[lo - 1] >= end; };
}
// The words that lie inside a span, from a list in text order (words never overlap, so their ends rise with their starts).
function wordsWithin(ws, s) {
  let lo = 0, hi = ws.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (ws[mid].start >= s.start) hi = mid; else lo = mid + 1; }
  let e = lo; while (e < ws.length && ws[e].end <= s.end) e++;
  return [lo, e];
}

// Production cues: [B-ROLL: …], [TEXTO: …], [CITA: …], [PAUSA] and "## Heading" lines are not spoken.
const CUE_RE = /\\[[^\\]\\n]{1,200}\\]|^[ \\t]*#{1,3}[^\\n]*$/gm;
const PAUSE_SEC = 1.0; // assumed length of a written [PAUSA]; rehearsal timing replaces the estimate
function findCues(text) {
  const out = [];
  CUE_RE.lastIndex = 0;
  let m;
  while ((m = CUE_RE.exec(text))) {
    if (!m[0].length) { CUE_RE.lastIndex++; continue; }
    const raw = m[0], lead = raw.length - raw.trimStart().length, body = raw.trim();
    const heading = body.startsWith("#");
    const kind = heading ? "HEADING" : ((body.match(/^\\[\\s*([^:\\]]+)/) || [])[1] || "").trim().toUpperCase();
    out.push({ start: m.index + lead, end: m.index + raw.trimEnd().length, text: body, heading, pause: !heading && /^(PAUSA|PAUSE)\\b/.test(kind), kind });
  }
  return out;
}
""")

# 2. words/sentences/timing in analyze
rep("""  const words = wordTokens(text);
  const sents = sentences(text);
  let cum = 0;
  for (const w of words) { w.syl = syl(w.w); cum += w.syl; w.t = cum / rate; }
  const totalSyl = cum;
  const wc = words.length;
  const sc = Math.max(1, sents.length);
  const runtimeSec = totalSyl / rate;""", """  const cues = findCues(text);
  const words = wordTokens(text).filter((w) => !insideAny(cues, w.start, w.end));
  let wp = 0;
  const sents = sentences(text).filter((s) => { while (wp < words.length && words[wp].end <= s.start) wp++; return wp < words.length && words[wp].start < s.end; });
  const pauseAt = cues.filter((c) => c.pause).map((c) => c.start);
  let cum = 0, tsec = 0, pi = 0;
  for (const w of words) {
    while (pi < pauseAt.length && pauseAt[pi] < w.start) { tsec += PAUSE_SEC; pi++; }
    w.syl = syl(w.w); cum += w.syl; w.t0 = tsec; tsec += w.syl / rate; w.t = tsec;
  }
  const totalSyl = cum;
  const wc = words.length;
  const sc = Math.max(1, sents.length);
  const runtimeSec = tsec + (pauseAt.length - pi) * PAUSE_SEC;
  // Cold open: clips lifted from the recording and placed before the script in the edit.
  const co = opts.coldOpen && (opts.coldOpen.hook || opts.coldOpen.promise) ? opts.coldOpen : null;
  const clipSec = (s) => (s ? wordTokens(s).reduce((a, w) => a + syl(w.w), 0) / rate : 0);
  const coHookSec = co ? clipSec(co.hook) : 0, coSec = co ? coHookSec + clipSec(co.promise) : 0;
  const coHook = co && co.hook ? co.hook : "", coProm = co && co.promise ? co.promise : "";""")

# 5. content start shifts by cold-open length; greeting passes when a cold open opens the video
rep("""  const contentT = contentStarts.length ? timeAt(Math.min(...contentStarts)) : null;""",
"""  const contentT = co && co.promise ? coSec : contentStarts.length ? timeAt(Math.min(...contentStarts)) + coSec : null;""")
rep("""  add("structure", { id: "greeting", label: L("Sin saludos ni pedidos antes del contenido", "No greetings or asks before content"), passed: !earlyFluff.length, info: earlyFluff.length ?""",
"""  if (coHook) earlyFluff.length = 0;
  add("structure", { id: "greeting", label: L("Sin saludos ni pedidos antes del contenido", "No greetings or asks before content"), passed: !earlyFluff.length, info: coHook ? L("La apertura en frío va antes de cualquier saludo.", "The cold open plays before any greeting.") : earlyFluff.length ?""")

# 6. runtime note on calibration source + cold open
rep("""${opts.kCalibrated ? " calibrado con sus episodios" : " (supuesto; se calibra con episodios reales)"}.`""",
"""${opts.kCalibrated ? " calibrado con sus episodios" : opts.kReh ? " ajustado con ensayos" : " (supuesto; se calibra con episodios reales)"}.${co ? ` La apertura en frío suma ≈${Math.round(coSec)} s al video${co.mode === "move" ? " si se duplica; al moverla no cambia el total" : ""}.` : ""}`""")
rep("""${opts.kCalibrated ? " calibrated from your episodes" : " (assumed; calibrates from real episodes)"}.`""",
"""${opts.kCalibrated ? " calibrated from your episodes" : opts.kReh ? " adjusted from rehearsals" : " (assumed; calibrates from real episodes)"}.${co ? ` The cold open adds ≈${Math.round(coSec)} s to the video${co.mode === "move" ? " if duplicated; moved, the total doesn't change" : ""}.` : ""}`""")

# 7. return extra fields
rep("""tickPos, words, sents, blocks, clusters, firstPromiseT: promiseT, contentT, kwFirstT, timeAt, transHits, chapterPts, riskHits, mulHits };""",
"""tickPos, words, sents, blocks, clusters, firstPromiseT: promiseT, contentT, kwFirstT, timeAt, transHits, chapterPts, riskHits, mulHits, cues, rate, coSec, loopHits, qPositions };""")
rep("""  const re = /[^.!?…\\n]+(?:[.!?…]+(?=\\s|$)|\\n|$)/g;""", """  const re = /[^.!?…\\n]+(?:[.!?…]+[»”"’)]*(?=\\s|$)|\\n|$)/g;""")
rep("""    packaging.push({ label, level, issues });""", """    packaging.push({ key: strict || "desc", label, level, issues });""")
rep("""  const longSents = sents.filter((s) => wordTokens(s.text).length > 30);""", """  // Scripture inside quotation marks can't be split, so only the presenter's own words count.
  const inQuote = insideTester(quotes);
  const spokenOutsideQuotes = (s) => { const [a, b] = wordsWithin(words, s); let n = 0; for (let i = a; i < b; i++) if (!inQuote(words[i].start, words[i].end)) n++; return n; };
  const longSents = sents.filter((s) => spokenOutsideQuotes(s) > 30);""")
rep("""cues, rate, coSec, loopHits, qPositions };""", """cues, rate, coSec, loopHits, qPositions, weakHits, regHits, aiHits, greetHits, ctaHits, longSents, firstPromise, nextHits, lang };""")
rep("""const CTAS = ["suscríbete", "suscríbanse", "suscribirte", "comenta", "comenten", "comparte", "compartan",""", """const CTAS = ["suscríbete", "suscríbanse", "suscribirte", "comenta", "comenten", "comparte", "compartan", "compártelo", "compártela", "compártanlo", "compártanla", "share it",""")
# Metadata is the strictest layer: graphic detail or strong profanity in the title/thumbnail is red, not yellow.
rep("""    const level = issues.length ? "amarillo" : "verde";
    packaging.push({ key: strict || "desc", label, level, issues });""", """    const graphicHits = strict ? GRAPHIC.filter((g) => new RegExp("(?<![\\\\p{L}])" + esc(g), "iu").test(s)) : [];
    if (graphicHits.length && !hits.length) issues.push(L(`detalle gráfico («${graphicHits.join("», «")}»)`, `graphic detail ("${graphicHits.join('", "')}")`));
    const severe = strict && (graphicHits.length || findPhrases(s, PROF_STRONG, "x").length);
    const level = severe ? "rojo" : issues.length ? "amarillo" : "verde";
    packaging.push({ key: strict || "desc", label, level, issues });""")
rep(""""ejecución", "ejecutado", "decapitado",""", """"ejecución", "ejecutado", "decapitado", "decapitó", "decapitación", "decapitar", "decapita",""")
# ---- Audience (Latin America / Spain / both) + Spain forms in the phrase lists + English Bible book names ----
rep("""const BOOK_ALTS = BOOKS.flatMap(([alts, code, name]) => alts.split("|").map((a) => ({ a, code, name }))).sort((x, y) => y.a.length - x.a.length);""",
"""const BOOKS_EN = { GEN: "Genesis|Gen", EXO: "Exodus", LEV: "Leviticus|Lev", NUM: "Numbers", DEU: "Deuteronomy|Deut", JOS: "Joshua", JDG: "Judges", RUT: "Ruth", "1SA": "1\\\\s?Sam", "2SA": "2\\\\s?Sam", "1KI": "1\\\\s?Kings", "2KI": "2\\\\s?Kings", "1CH": "1\\\\s?Chronicles", "2CH": "2\\\\s?Chronicles", EZR: "Ezra", NEH: "Nehemiah", EST: "Esther", PSA: "Psalms|Psalm|Ps", PRO: "Proverbs|Prov", ECC: "Ecclesiastes|Eccl", SNG: "Song of Solomon|Song of Songs", ISA: "Isaiah|Isa", JER: "Jeremiah|Jer", LAM: "Lamentations", EZK: "Ezekiel|Ezek", HOS: "Hosea", OBA: "Obadiah", JON: "Jonah", MIC: "Micah", NAM: "Nahum", HAB: "Habakkuk", ZEP: "Zephaniah", HAG: "Haggai", ZEC: "Zechariah", MAL: "Malachi", MAT: "Matthew|Matt", MRK: "Mark", LUK: "Luke", JHN: "John", ACT: "Acts", ROM: "Romans|Rom", "1CO": "1\\\\s?Corinthians|1\\\\s?Cor", "2CO": "2\\\\s?Corinthians|2\\\\s?Cor", GAL: "Galatians", EPH: "Ephesians|Eph", PHP: "Philippians|Phil", COL: "Colossians|Col", "1TH": "1\\\\s?Thessalonians", "2TH": "2\\\\s?Thessalonians", "1TI": "1\\\\s?Timothy|1\\\\s?Tim", "2TI": "2\\\\s?Timothy|2\\\\s?Tim", TIT: "Titus", PHM: "Philemon", HEB: "Hebrews|Heb", JAS: "James", "1PE": "1\\\\s?Peter", "2PE": "2\\\\s?Peter", "1JN": "1\\\\s?John", "2JN": "2\\\\s?John", "3JN": "3\\\\s?John", JUD: "Jude", REV: "Revelation|Rev" };
const enName = (a) => a.split("|")[0].replace(/\\\\s\\?/g, " ");
const BOOK_ALTS = [...BOOKS.flatMap(([alts, code, name]) => alts.split("|").map((a) => ({ a, code, name }))), ...Object.entries(BOOKS_EN).flatMap(([code, alts]) => alts.split("|").map((a) => ({ a, code, name: enName(alts) })))]
  .filter((x, i, arr) => arr.findIndex((y) => y.a.toLowerCase() === x.a.toLowerCase()) === i).sort((x, y) => y.a.length - x.a.length);""")
rep("""  if (lang === "es") for (const r of REGIONAL) {""", """  if (lang === "es") for (const r of REGIONAL.filter((r) => regFlags(r, opts.audience))) {""")
rep("""// F.11 AI-tell phrases""", """// Which audiences flag each regional form. "both" (default) flags everything; "latam" accepts Mexican/Central American
// everyday words; "es" (Spain) accepts vosotros, -áis/-éis, vale, tío and coger.
const REG_SPAIN = /vosotr|áis\\|éis|\\\\bvale|tío|en plan|coger/;
const REG_LATAM_OK = /ahorita|platicar/;
function regFlags(r, aud) {
  const src = r.re.source;
  if (aud === "es") return !REG_SPAIN.test(src);
  if (aud === "latam") return !REG_LATAM_OK.test(src);
  return true;
}
// F.11 AI-tell phrases""")
rep(""""compártelo", "compártela", "compártanlo", "compártanla", "share it",""", """"compártelo", "compártela", "compártanlo", "compártanla", "share it", "suscribíos", "suscribirse", "comentad", "compartid", "compartidlo", "compartidla", "escribidnos", "dadle a me gusta", "suscribiros", "activad la campanita", "hit the bell", "like and subscribe", "leave a comment",""")
rep("""const PROMISES = ["vas a ver",""", """const PROMISES = ["today we'll look at", "we're going to look at", "you'll discover", "vais a ver", "veréis", "descubriréis", "aprenderéis", "os mostraré", "os enseñaré", "vas a ver",""")
rep("""const OPEN_LOOPS = ["más adelante",""", """const OPEN_LOOPS = ["imaginad", "dejadme contaros", "os voy a contar", "here's what almost nobody notices", "más adelante",""")
rep("""const GRAPHIC = ["a borbotones",""", """const GRAPHIC = ["behead", "gushing", "dismember", "mutilat", "disembowel", "gory", "a borbotones",""")
# ---- Mensaje en YouTube checks (message_logic.js) ----
rep("""  // count summary
  const allRows = Object.values(sections).flat();""", """  const msg = messageChecks(text, opts, { add, L, refs, quotes, pairs, cues, runtimeSec, posAtTime });
  // count summary
  const allRows = Object.values(sections).flat();""")
rep("""cues, rate, coSec,""", """cues, msg, rate, coSec,""")
open(p, "w", encoding="utf-8").write(s)
print("ok")
