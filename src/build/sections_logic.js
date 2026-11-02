
/* ===== Main sections: gancho, promesa, introducción, desarrollo (retención), cierre — pure, no DOM ===== */
// (Adrian, 2026-11-01: "opus 5.5 to take care of the gancho, promesa, introduccion, retention and cierre"; picks 1A 2A 3A)
// 1A: the app detects them (detectLayout / sectionsFrom) and the author may move a start («Ajustar límites», saved as secBounds).
// 2A: retention is the whole body (intro end → close start), with re-hook points every 7–9 minutes.
// 3A: the close holds the calls to action and the next-episode line at the end («que vuelvan»).
const MAIN_SECS = ["hook", "promise", "intro", "body", "close"];
const REHOOK_EVERY = 480; // seconds: the middle of 2A's 7–9 minutes
const REHOOK_WIN = 60; // a point is "covered" when the text around it (± this) already re-hooks

// Start offsets (chars) of each main section, from the detected layout. A section that isn't there is left out.
function detectMainStarts(text, R) {
  const U = buildUnits(R, text);
  if (!U.length) return { U, starts: {} };
  const secs = sectionsFrom(detectLayout(U, R), U, R.runtimeSec);
  const startOf = (s) => U[s.first].start, endOf = (s) => (U[s.last + 1] ? U[s.last + 1].start : text.length);
  const first = (ty) => secs.find((s) => s.type === ty);
  const st = { hook: U[0].start };
  const pr = first("promise"), it = first("intro");
  if (pr && pr.first > 0) st.promise = startOf(pr);
  if (it && startOf(it) > (st.promise ?? st.hook)) st.intro = startOf(it);
  // the close: the last "close" section, pulled back over the calls to action right before it (3A)
  let ci = -1;
  for (let i = secs.length - 1; i >= 0; i--) if (secs[i].type === "close") { ci = i; break; }
  if (ci < 0 && secs.length > 1 && secs[secs.length - 1].type === "cta") ci = secs.length - 1;
  // walk back over calls to action and plain paragraphs in the final stretch (R.closeFrom, the last ~90 s); a teaching point stops it
  const tail = Number.isFinite(R.closeFrom) ? R.closeFrom - 60 : Infinity;
  if (ci > 0) { while (ci - 1 > 0 && (secs[ci - 1].type === "cta" || (secs[ci - 1].type === "body" && secs[ci - 1].t0 >= tail && secs[ci - 1].t1 - secs[ci - 1].t0 <= 45 /* a short line like «En el próximo episodio…», not a teaching passage */))) ci--; st.close = startOf(secs[ci]); }
  // the body starts where the last opening section ends
  const lastOpen = it || pr || secs[0];
  const bodyStart = endOf(lastOpen);
  if (bodyStart < (st.close ?? text.length) && bodyStart > (st.intro ?? st.promise ?? st.hook)) st.body = bodyStart;
  return { U, starts: st };
}

// bounds: optional {k: startChar} the author set («Ajustar límites»). They replace the detected starts only when the result is
// still in order (hook < promise < intro < body < close, all inside the text); otherwise they are ignored and `stale` says so.
function mainSections(text, R, bounds) {
  const { U, starts } = detectMainStarts(text, R);
  if (!U.length) return { list: [], missing: MAIN_SECS.slice(), stale: false };
  let st = { ...starts }, stale = false;
  if (bounds && typeof bounds === "object" && Object.keys(bounds).length) {
    const tryB = { ...starts };
    for (const k of MAIN_SECS) if (Number.isInteger(bounds[k])) tryB[k] = bounds[k];
    const order = MAIN_SECS.filter((k) => tryB[k] != null).map((k) => tryB[k]);
    const okOrder = order.every((v, i) => v >= 0 && v < text.length && (i === 0 || v > order[i - 1]));
    if (okOrder) st = tryB; else stale = true;
  }
  const ks = MAIN_SECS.filter((k) => st[k] != null);
  const tAt = (pos) => { const u = U.find((x) => pos >= x.start && pos < x.end) || U.find((x) => x.start >= pos) || U[U.length - 1]; return u.t0; };
  const list = ks.map((k, i) => {
    const start = st[k], end = i + 1 < ks.length ? st[ks[i + 1]] : text.replace(/\s+$/, "").length;
    return { k, start, end, t0: tAt(start), t1: i + 1 < ks.length ? tAt(end) : U[U.length - 1].t1 };
  });
  return { list, missing: MAIN_SECS.filter((k) => st[k] == null), stale };
}

// 2A: re-hook points in the body every REHOOK_EVERY seconds; `gap` = no re-hook in R.blocks around that time (the same reading
// editMarks uses). Each point carries the char offset of the sentence it falls in.
function rehookPoints(text, R, sections) {
  const body = (sections || []).find((s) => s.k === "body");
  if (!body) return [];
  const U = buildUnits(R, text).filter((u) => u.start >= body.start && u.start < body.end);
  if (!U.length) return [];
  const out = [];
  for (let tm = body.t0 + REHOOK_EVERY; tm < body.t1 - 30; tm += REHOOK_EVERY) {
    const u = U.find((x) => tm >= x.t0 && tm < x.t1) || U.find((x) => x.t0 >= tm) || U[U.length - 1];
    const gap = (R.blocks || []).some((b) => !b.has && tm + REHOOK_WIN >= b.from && tm - REHOOK_WIN <= b.to);
    out.push({ t: tm, pos: u.start, gap });
  }
  return out;
}

// ---------- The main-sections call (Opus 5.5, tier "sections") ----------
// The five sections go out whole, labelled, with the re-hook points marked in the body (pick A, 2026-11-01: excerpts made Opus
// mark retention down for what it could not see). Verses are masked with the whole-script numbering (the same one
// vetReport restores), so every excerpt is cut from the one masked text. Script text last, as in every prompt.
const SEC_AREAS = ["hook", "promise", "retention", "close", "return"]; // 6A: Opus rates these; spoken voice comes from the detailed call
const SEC_ITEM_AREA = { hook: ["hook"], promise: ["promise"], intro: ["hook", "retention"], body: ["retention"], close: ["close", "return"] };
const SECTIONS_MAX_ITEMS = 7;

function sectionsMasked(text, R) {
  const spans = verseSpans(text, R), verse = spans.filter((s) => s.kind !== "ref");
  const snap = (p) => { const v = verse.find((s) => p > s.start && p < s.end); return v ? v.end : p; };
  const mpos = (p) => maskVerses(text, spans, 0, snap(p)).masked.length;
  return { masked: maskVerses(text, spans, 0, text.length).masked, mpos };
}

function sectionsPrompt(text, R, sec) {
  const en = R.lang === "en";
  const list = sec.list, missing = sec.missing || [];
  const { masked, mpos } = sectionsMasked(text, R);
  const cut = (a, b) => masked.slice(mpos(a), mpos(b)).trim();
  const U = buildUnits(R, text);
  const rhs = rehookPoints(text, R, list);
  const NAME = en ? { hook: "HOOK", promise: "PROMISE", intro: "INTRODUCTION", body: "BODY", close: "CLOSE" } : { hook: "GANCHO", promise: "PROMESA", intro: "INTRODUCCIÓN", body: "DESARROLLO", close: "CIERRE" };
  const parts = [];
  for (const s of list) {
    let body = cut(s.start, s.end);
    if (s.k === "body") {
      // (Adrian, 2026-11-01: "go", pick A) the whole body, with the re-hook points marked where they fall: judged on excerpts,
      // Opus marked retention down for what it was not shown ("en los extractos no hay re-enganches"); input is the cheap part (~+$0.02)
      const cuts = rhs.map((p) => p.pos).filter((x) => x > s.start && x < s.end).sort((a, b) => a - b);
      let from = s.start; const out = [];
      cuts.forEach((c, j) => { out.push(cut(from, c)); const p = rhs.find((q) => q.pos === c); out.push(`[${en ? "RE-HOOK POINT" : "PUNTO DE RE-ENGANCHE"} ${fmtTime(p.t)}]`); from = c; });
      out.push(cut(from, s.end));
      body = out.filter(Boolean).join("\n");
    }
    parts.push(`### ${NAME[s.k]} (${fmtTime(s.t0)}–${fmtTime(s.t1)})\n${body}`);
  }
  const rh = rhs.map((p) => `${fmtTime(p.t)}${p.gap ? (en ? " (no re-hook here)" : " (aquí no hay re-enganche)") : ""}`).join(", ") || "—";
  const miss = missing.length ? missing.map((k) => NAME[k].split(" ")[0]).join(", ") : "—";
  const shape = `{"areas": {"hook": {"rating": 1-5, "why": "..."}, "promise": {...}, "retention": {...}, "close": {...}, "return": {...}}, "items": [{"sec": "hook|promise|intro|body|close", "area": "hook|promise|retention|close|return", "original": "...", "replacement": "...", "alts": ["...", "..."], "why": "...", "after": 1-5}]}`;
  const brief = en
    ? `You are the editor of a YouTube Bible-teaching channel. The author is a preacher with a doctorate: his exegesis, doctrine and quotations are not touched. Judge only the main sections below for someone watching alone on a phone who has never been to church: the hook (first 30 s), the promise, the introduction, retention through the body (re-hook points every 7–9 minutes) and the close with a reason to come back. Rate 1 to 5 and propose at most ${SECTIONS_MAX_ITEMS} changes, the ones that raise those ratings most.`
    : `Eres el editor de un canal de YouTube de enseñanza bíblica. El autor es un predicador con doctorado: su exégesis, su doctrina y sus citas no se tocan. Juzga solo las secciones principales de abajo para alguien que lo ve solo en su teléfono y nunca ha ido a una iglesia: el gancho (primeros 30 s), la promesa, la introducción, la retención a lo largo del desarrollo (re-enganches cada 7–9 minutos) y el cierre con una razón para volver. Valora del 1 al 5 y propón como máximo ${SECTIONS_MAX_ITEMS} cambios, los que más suben esa valoración.`;
  const facts = en
    ? `FACTS FROM THE APP: runtime ${Math.round((R.runtimeSec || 0) / 60)} min. Re-hook points in the body: ${rh}. Sections not found: ${miss}.`
    : `DATOS DE LA APP: duración ${Math.round((R.runtimeSec || 0) / 60)} min. Puntos de re-enganche en el desarrollo: ${rh}. Secciones que no se encontraron: ${miss}.`;
  const rules = en
    ? `RULES: "sec" names the section the change belongs to and "original" is copied EXACTLY from that section (same case, accents, punctuation), 3 to 40 words, and appears only once. To add something that is missing (a promise, a re-hook), "original" is the last sentence before where it goes and "replacement" is that same sentence followed by the new text; "sec" is the missing section's name. Verses were replaced by marks like ⟦V1⟧: leave every mark unchanged, never put one in "replacement", never write a verse or add a Bible reference. Lines like [RE-HOOK POINT 8:00] are marks from the app, not part of the script: never copy them into "original". "after" is the rating the area would get with the change. If a replacement adds a sentence, the next sentence must still read naturally (no pronoun left pointing elsewhere).`
    : `REGLAS: "sec" nombra la sección a la que pertenece el cambio y "original" se copia EXACTO de esa sección (mismas mayúsculas, tildes y puntuación), de 3 a 40 palabras, y aparece una sola vez. Para añadir algo que falta (una promesa, un re-enganche), "original" es la última frase antes de donde va y "replacement" es esa misma frase seguida del texto nuevo; "sec" es el nombre de la sección que falta. Los versículos se reemplazaron por marcas como ⟦V1⟧: déjalas tal cual, nunca pongas una en "replacement", no escribas versículos ni añadas referencias bíblicas. Las líneas como [PUNTO DE RE-ENGANCHE 8:00] son marcas de la app, no del guion: nunca las copies en "original". "after" es la valoración que tendría el área con el cambio. Si un reemplazo añade una frase, la siguiente tiene que seguir leyéndose bien (ningún pronombre apuntando a otra cosa).`;
  const json = (en ? "Answer only with JSON: " : "Responde solo con JSON: ") + shape;
  return `${brief}\n\n${facts}\n\n${rules}\n\n${json}\n\n${en ? "MAIN SECTIONS" : "SECCIONES PRINCIPALES"}:\n"""\n${parts.join("\n\n")}\n"""`;
}

// json: the model's answer (untrusted). Every item goes through vetReport's checks, then must lie inside the section it names
// (or, for a section that was missing, be an insert: the replacement starts with the original). Areas: the five of 6A.
function vetSections(text, json, opts, R, sec) {
  const raw = json && Array.isArray(json.items) ? json.items.slice(0, SECTIONS_MAX_ITEMS * 2) : [];
  const v = vetReport(text, { areas: json && json.areas, items: raw, words: [] }, opts, R);
  const where = (start) => (sec.list.find((s) => start >= s.start && start < s.end) || {}).k;
  const items = [];
  for (const it of v.items) {
    const src = raw.find((x) => x && x.replacement === it.replacement && x.area === it.area);
    const k = src && typeof src.sec === "string" ? src.sec : "";
    if (!MAIN_SECS.includes(k) || !(SEC_ITEM_AREA[k] || []).includes(it.area)) continue;
    const own = sec.list.find((s) => s.k === k);
    const inside = !!own && where(it.start) === k && it.end <= own.end;
    const insert = sec.missing.includes(k) && it.replacement.startsWith(it.original) && it.replacement.length > it.original.length;
    if (!inside && !insert) continue;
    items.push({ ...it, sec: k });
    if (items.length >= SECTIONS_MAX_ITEMS) break;
  }
  const areas = {};
  for (const k of SEC_AREAS) areas[k] = v.areas[k];
  return { areas, items, dropped: raw.length - items.length };
}

// ---------- The detailed review (Sonnet) after the main sections (5A, 6A) ----------
// The fixed main sections the detailed review must leave alone. The body is a main section for retention (Opus judged its re-hook
// points) but its lines are what the detailed review is for, so it never counts here.
function detailLocked(sec, locks) {
  return (sec && sec.list ? sec.list : []).filter((s) => s.k !== "body" && locks && locks[s.k] === true).map((s) => ({ k: s.k, start: s.start, end: s.end }));
}
// vetted report → only spoken-voice changes outside the fixed sections, and only the voice rating (the other five are Opus's).
function detailOnly(v, locked) {
  const out = (v.items || []).filter((it) => it.area === "voice" && !locked.some((r) => it.start < r.end && it.end > r.start));
  return { ...v, areas: { voice: v.areas && v.areas.voice ? v.areas.voice : { rating: null, why: "" } }, items: out, dropped: (v.dropped || 0) + ((v.items || []).length - out.length) };
}
// 6A: the score's editor part reads Opus's five ratings and Sonnet's spoken voice. Only when both answers exist; with one of them
// alone the caller keeps today's behaviour (no invented rating for the missing part). Applied changes of both count (effectiveReport).
function mergeReports(rep, secRep) {
  if (!rep || !secRep) return rep;
  const areas = { ...rep.areas };
  for (const k of SEC_AREAS) if (secRep.areas && secRep.areas[k] && secRep.areas[k].rating != null) areas[k] = secRep.areas[k];
  const extra = (secRep.items || []).map((x) => ({ area: x.area, original: x.original, replacement: x.replacement, alts: x.alts || [], why: x.why, after: x.after }));
  return { ...rep, areas, items: [...(rep.items || []), ...extra] };
}
