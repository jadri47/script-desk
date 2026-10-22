
// ---------- Coach: the review as a queue of decisions, one at a time (pure; the UI words it later) ----------
// (jadri47, 2026-10-21: "the app should walk him through the process and just ask him questions")
// kind: risk (red ad risk) > batch (every safe fix at once) > question (missing info) > choice (by score gain) > note (nothing to apply)
const COACH_FAMILY = { muletillas: "muletillas", pulpit: "pulpit", openers: "openers", weak: "weak", regional: "regional", onscreen: "onscreen" };
const COACH_QUESTION = { bigidea: "bigIdea", kw: "keyword", ending: "nextEp" };
const COACH_NOTE = new Set(["refs", "reading"]);

function coachFailedRows(R, dismissed) {
  const out = [];
  for (const [k, rows] of Object.entries(R.sections)) for (const r of rows) if ((!r.passed || r.warn) && !FIX_SKIP.has(r.id) && !dismissed.has(r.id)) out.push({ ...r, sec: k });
  return out;
}
// Overlap rule of applyPatches: a patch starting before the previous one ended is dropped (touching is fine).
function coachNoOverlap(items) {
  const out = []; let end = -1;
  for (const it of [...items].sort((a, b) => a.start - b.start || a.end - b.end)) { if (it.start < end) continue; out.push(it); end = Math.max(end, it.end); }
  return out;
}
const coachCounts = (items) => items.reduce((m, x) => ((m[x.fam] = (m[x.fam] || 0) + 1), m), {});

function buildDecisions(text, R, opts, dismissed) {
  dismissed = dismissed || new Set();
  const failed = coachFailedRows(R, dismissed);
  const cards = buildFixCards(text, R, opts, failed, 1e9, Infinity);
  const base = scoreOf(R, dismissed).score;
  const rowW = (ids) => ids.reduce((a, id) => { const r = failed.find((x) => x.id === id); return a + (r ? weightOf(r) : 0); }, 0);
  const pos = (c) => (c.evidence[0] ? c.evidence[0].start : Infinity);
  const gainOf = (c) => (c.proposals[0] ? c.proposals[0].check.score - base : rowW(c.ids));

  // 1. the safe batch: first proposal of the fixed-table cards, across the whole script
  let items = [];
  for (const c of cards) {
    const fam = COACH_FAMILY[c.id], p = c.proposals[0];
    if (!fam || !p || p.kind !== "patch") continue;
    for (const q of p.patches) {
      items.push({ fam, start: q.start, end: q.end, rep: q.rep, cardId: c.id });
    }
  }
  items = coachNoOverlap(items);
  const mk = (its) => ({ kind: "patch", label: "batch", patches: its.map((x) => ({ start: x.start, end: x.end, rep: x.rep })) });
  let check = null;
  while (items.length) {
    const p = mk(items); check = verifyProposal(text, opts, R, p);
    if (!check.broke.length) break;
    // drop one family: the one whose removal leaves the fewest broken checks (ties: the smaller family)
    const fams = Object.keys(coachCounts(items));
    let best = null;
    for (const f of fams) {
      const rest = items.filter((x) => x.fam !== f);
      const b = rest.length ? verifyProposal(text, opts, R, mk(rest)).broke.length : 0;
      const n = items.length - rest.length;
      if (!best || b < best.b || (b === best.b && n < best.n)) best = { f, b, n };
    }
    items = items.filter((x) => x.fam !== best.f); check = null;
  }
  const decisions = [];
  const covered = new Set();
  if (items.length && check) {
    const key = (x) => x.start + ":" + x.end + ":" + x.rep, inBatch = new Set(items.map(key));
    for (const c of cards) { const p = c.proposals[0]; if (COACH_FAMILY[c.id] && p && p.kind === "patch" && p.patches.every((q) => inBatch.has(key(q)))) covered.add(c.id); }
    const opt = { ...mk(items), check };
    decisions.push({ kind: "batch", id: "batch", ids: [...covered], card: null, options: [opt], at: { start: items[0].start, end: items[0].end }, gain: check.score - base, fam: coachCounts(items), items });
  }

  // 2. everything else
  const rest = [];
  for (const c of cards) {
    if (covered.has(c.id)) continue;
    const at = c.evidence[0] ? { start: c.evidence[0].start, end: c.evidence[0].end } : null;
    const d = { kind: "choice", id: c.id, ids: c.ids, card: c, options: c.proposals, at, gain: gainOf(c) };
    const emptyTitle = c.ids.some((x) => x === "search" || x === "title") && !(opts.title || "").trim();
    if (c.level === "rojo") d.kind = "risk";
    else if (COACH_NOTE.has(c.id)) d.kind = "note";
    else if ((COACH_QUESTION[c.id] && !(opts[COACH_QUESTION[c.id]] || "").trim()) || emptyTitle) { d.kind = "question"; d.ask = emptyTitle ? "title" : COACH_QUESTION[c.id]; d.options = []; d.gain = rowW(c.ids); } // options: step 3
    if (d.kind !== "note" && !d.options.length && d.kind !== "question") d.needsAi = true;
    rest.push(d);
  }
  const order = (a, b) => b.gain - a.gain || pos(a.card) - pos(b.card);
  const part = (k) => rest.filter((d) => d.kind === k).sort(order);
  // The keyword check passes on the app's own pick (R.keyword), so it never raises a card; but with the field empty and a few real
  // candidates, confirming one is a one-tap question. (jadri47, 2026-10-22: "keyword: candidates by rule, R.keyword first")
  const qs = part("question");
  if (!(opts.keyword || "").trim() && (R.kwCands || []).length >= 2 && !qs.some((d) => d.ask === "keyword") && !dismissed.has("kw-ask"))
    qs.push({ kind: "question", id: "kw-ask", ids: ["kw-ask"], card: null, options: [], at: null, gain: 0, ask: "keyword" });
  return [...part("risk"), ...decisions, ...qs, ...part("choice"), ...part("note")];
}

// The score if every decision's first option were applied. A decision goes in whole or not at all (its patches must
// not overlap what is already in), so two cards that edit the same words never half-apply.
function projectedScore(text, R, opts, decisions, dismissed) {
  const taken = []; let o2 = { ...opts };
  for (const d of decisions) {
    const p = d.options && d.options[0];
    if (!p || d.kind === "question" || d.kind === "note") continue;
    const ps = p.patches || [];
    if (ps.some((q) => taken.some((t) => q.start < t.end && t.start < q.end))) continue;
    taken.push(...ps);
    if (p.kind === "field") o2[p.field] = p.value;
    if (p.kind === "cold") o2.coldOpen = { hook: p.hook ? p.hook.text : "", promise: p.promise ? p.promise.text : "", mode: [p.hook, p.promise].filter(Boolean).every((x) => x.mode === "move") ? "move" : "dup" };
  }
  return scoreOf(analyze(applyPatches(text, taken), o2), dismissed).score;
}

// Ready answers for a question, only from the script or the rules (never invented text). Each: {text, n?, src}.
// (jadri47, 2026-10-22: "Choices must be real text from the script or the rules")
function coachOneSentence(x, max) {
  const s = (x || "").replace(/\s+/g, " ").trim().replace(/^[«"“]|[»"”]$/g, "");
  if (!s) return "";
  if (s.split(" ").length < 6) return ""; // "vamos a ver" is not an idea
  if (s.length <= max) return s;
  const cut = s.slice(0, max), c = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(";"));
  return c > 40 ? cut.slice(0, c) : ""; // a clause that ends on its own, or nothing: no half sentence
}
function coachQuestionChoices(ask, R, opts, card, extra) {
  const en = R.lang === "en", out = [], add = (c) => { if (c.text && !out.some((x) => norm(x.text) === norm(c.text))) out.push(c); };
  extra = extra || {};
  if (ask === "keyword") for (const k of R.kwCands || []) add({ text: k.phrase, n: k.n, src: "kw" });
  else if (ask === "title") {
    for (const p of (card && card.proposals) || []) if (p.kind === "field" && p.field === "title") add({ text: p.value, src: "rule" });
    for (const k of (R.kwCands || []).filter((x) => x.n >= 3).slice(0, 3)) { // only phrases said often: a weak phrase makes a silly title
      const t = en ? `What does the Bible say about ${k.phrase}?` : `¿Qué dice la Biblia sobre ${esArticle(k.phrase)}${k.phrase}?`;
      if (t.length <= 60) add({ text: t, src: "rule" });
    }
  } else if (ask === "nextEp") {
    const cur = extra.pubDate || "";
    const nx = (extra.prods || []).filter((p) => p.id !== extra.curId && (p.title || "").trim() && p.pubDate && cur && p.pubDate > cur).sort((a, b) => a.pubDate.localeCompare(b.pubDate))[0];
    if (nx) add({ text: nx.title.trim(), src: "plan" });
  } else if (ask === "bigIdea") {
    // promiseSent is the matched phrase ("vas a descubrir"); the choice is the whole sentence it sits in
    const ps = R.promiseSent && (R.sents || []).find((x) => x.start <= R.promiseSent.start && R.promiseSent.start < x.start + x.text.length);
    const p = ps && coachOneSentence(ps.text, 140);
    if (p) add({ text: p, src: "promise" });
    const late = (R.msg && R.msg.lateStart) || 0;
    const rc = [...(R.sents || [])].reverse().find((x) => x.start >= late && hasPhrase(x.text, RECAP));
    const r = rc && coachOneSentence(rc.text, 140);
    if (r) add({ text: r, src: "recap" });
  }
  return out;
}

// Masks the Bible text inside [from,to) with ⟦Vn⟧ tokens (numbered over the whole script, so a token means one verse in the
// fragment and its context alike). null when a verse crosses the edge of the fragment: that range cannot be protected, so it
// is never sent. The context range grows to whole verses. (jadri47, 2026-10-22: "Scripture must never be rewritten")
function coachAiMask(text, spans, a, b, pad) {
  const verse = spans.filter((s) => s.kind !== "ref").sort((x, y) => x.start - y.start);
  for (const s of verse) if (s.start < b && s.end > a && (s.start < a || s.end > b)) return null;
  let c0 = Math.max(0, a - pad), c1 = Math.min(text.length, b + pad);
  for (let k = 0; k < 4; k++) for (const s of verse) { if (s.start < c0 && s.end > c0) c0 = s.start; if (s.start < c1 && s.end > c1) c1 = s.end; }
  const mask = (from, to) => {
    let out = "", pos = from; const toks = [];
    verse.forEach((s, i) => { if (s.start >= from && s.end <= to) { const tok = `⟦V${i + 1}⟧`; out += text.slice(pos, s.start) + tok; toks.push({ tok, text: text.slice(s.start, s.end) }); pos = s.end; } });
    return { masked: out + text.slice(pos, to), toks };
  };
  return { frag: mask(a, b), ctx: mask(c0, c1) };
}
// Up to `max` decisions that need an AI proposal and have none yet, in queue order.
function coachAiPick(list, have, max) {
  return list.filter((d) => d.needsAi && d.card && d.card.ai && !have(d.card.id)).slice(0, max);
}
