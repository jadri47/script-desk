
// ---------- Guion: sentence units, sections, cold-open candidates (pure) ----------
const SEC_TYPES = ["hook", "promise", "intro", "point", "body", "cta", "close"];
// Spanish "ordenadores" (Martín Zorraquino & Portolés 1999) and English equivalents open a new point.
// "Primero Dios" is a set phrase, not an ordinal.
const ORD_RE = /^[\s«"“¿¡(—-]*(primero(?!\s+dios)|primer punto|en primer lugar|segundo|en segundo lugar|tercero|en tercer lugar|cuarto|en cuarto lugar|por último|en último lugar|finalmente|para terminar|para cerrar|(?:el|mi) (?:primer|segundo|tercer|cuarto|quinto|último) punto|la (?:primera|segunda|tercera|cuarta|última) (?:verdad|lección|clave|razón|enseñanza)|first(?:ly)?|second(?:ly)?|third(?:ly)?|next|finally|lastly|the (?:first|second|third|fourth|last) (?:point|thing|truth|lesson|reason))(?![\p{L}])/iu;
const TENSION_RE = /(?<![\p{L}])(nadie|nunca|jamás|error|mentira|la verdad|secreto|por qué|qué pasa si|en realidad|casi nadie|sorprend\p{L}*|miedo|dolor|perder|perdió|perdido|imposible|peligro|no es lo que|cambió todo|cambia todo|lo que nadie|nobody|never|truth|mistake|secret|why|what if|actually|afraid|fear|lose|lost|impossible|changed everything)(?![\p{L}])/iu;
const SOFT_T_RE = /(?<![\p{L}])(pero|sin embargo|but|however)(?![\p{L}])/iu;
const YOU_RE = /(?<![\p{L}])(tú|te|ti|tu|tus|usted|ustedes|has|vas|puedes|sabes|sientes|crees|piensas|imagina|imagínate|you|your|you're|you've)(?![\p{L}])/iu;
const ANA_STRONG = /^[\s«"“¿¡(—-]*(y|e|o|u|esto|eso|esta|este|ese|esa|estos|esos|estas|esas|aquí|ahí|allí|él|ella|ellos|ellas|también|además|entonces|por eso|así que|luego|después|lo|le|les|and|this|that|these|those|it|he|she|they|also|so|then|there|which)(?![\p{L}])/iu;
const ANA_SOFT = /^[\s«"“¿¡]*(pero|porque|but|because)(?![\p{L}])/iu;
const PROM_RE = /(?<![\p{L}])(aprender\p{L}*|descubr\p{L}*|entender\p{L}*|verás|verán|te mostraré|les mostraré|al final de|en este episodio|la respuesta|la clave|you'll learn|you'll see|we'll see|learn|discover|by the end|the answer|the key)(?![\p{L}])/iu;
const FUT_RE = /(?<![\p{L}])(vas a|van a|vamos a|you'll|you will|we'll|we will)(?![\p{L}])/iu;
const CONNECT_RE = /^[\s«"“¿¡]*(ahora bien|por otro lado|sin embargo|en cambio|por eso|así que|además|en resumen|en conclusión|por lo tanto|now|anyway|however|so|in summary|in short)(?![\p{L}])/iu;

const hasPhrase = (s, list) => findPhrases(s, list, "x").length > 0;

function headingType(title) {
  const x = norm(title);
  if (/gancho|hook|apertura|cold open/.test(x)) return "hook";
  if (/promesa|promise/.test(x)) return "promise";
  if (/intro/.test(x)) return "intro";
  if (/cta|llamada|suscrib|call to action|subscribe/.test(x)) return "cta";
  if (/cierre|final|conclusi|close|outro|despedida|ending/.test(x)) return "close";
  return "point";
}

// One unit per spoken sentence, with estimated start/end time in the recording.
function buildUnits(R, text) {
  const W = R.words, U = [];
  const blank = /\n[ \t]*\n/.test(text);
  const breaks = [];
  const bre = blank ? /\n[ \t]*\n/g : /\n/g;
  let m;
  while ((m = bre.exec(text))) breaks.push(m.index);
  let wi = 0, bi = 0;
  for (const s of R.sents) {
    while (wi < W.length && W[wi].end <= s.start) wi++;
    const w0 = wi;
    let w1 = wi;
    while (w1 < W.length && W[w1].start < s.end) w1++;
    if (w1 === w0) continue;
    while (bi < breaks.length && breaks[bi] < s.start) bi++;
    let syl = 0;
    for (let k = w0; k < w1; k++) syl += W[k].syl;
    U.push({ i: U.length, start: s.start, end: s.end, text: s.text, t0: W[w0].t0, t1: W[w1 - 1].t, para: bi, w0, w1, wc: w1 - w0, syl });
    wi = w1;
  }
  return U;
}

function bagOf(U, a, b) {
  const bag = {};
  for (let i = a; i < b; i++) for (const w of wordTokens(U[i].text)) {
    const x = w.w.toLowerCase();
    if (x.length > 3 && !STOP.has(x) && !STOP.has(norm(x))) bag[x] = (bag[x] || 0) + 1;
  }
  return bag;
}
function cosine(A, B) {
  let dot = 0, a = 0, b = 0;
  for (const k in A) { a += A[k] * A[k]; if (B[k]) dot += A[k] * B[k]; }
  for (const k in B) b += B[k] * B[k];
  return a && b ? dot / Math.sqrt(a * b) : 0;
}

// Auto-detect sections. Each entry: { first (unit index), anchor, type, conf: "alta"|"media"|"baja", title }.
function detectLayout(U, R) {
  if (!U.length) return [];
  const rank = { baja: 0, media: 1, alta: 2 };
  const PRI = { hook: 6, close: 5, cta: 4, promise: 3, point: 2, intro: 1, body: 0 };
  const starts = new Map();
  const put = (i, type, conf, title) => {
    if (i < 0 || i >= U.length) return;
    const cur = starts.get(i);
    if (!cur || rank[conf] > rank[cur.conf] || (rank[conf] === rank[cur.conf] && PRI[type] > PRI[cur.type])) starts.set(i, { type, conf, title: title || "" });
  };
  const unitAt = (pos) => { let lo = 0, hi = U.length - 1, ans = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (U[mid].start >= pos) { ans = mid; hi = mid - 1; } else lo = mid + 1; } return ans; };

  // 1. Headings written by the author win.
  for (const c of (R.cues || []).filter((c) => c.heading)) {
    const i = unitAt(c.end);
    if (i >= 0) { const title = c.text.replace(/^#+\s*/, "").trim(); put(i, headingType(title), "alta", title); }
  }
  // 2. Opening by position: hook from 0, promise sentence within 90 s, then intro.
  put(0, "hook", "alta");
  const pIdx = U.findIndex((u) => u.t0 <= 90 && hasPhrase(u.text, PROMISES));
  let after;
  if (pIdx > 0) { put(pIdx, "promise", "alta"); after = pIdx + 1; }
  else if (pIdx === 0) after = 1;
  else { after = U.findIndex((u) => u.t0 >= 7); if (after < 1) after = 1; }
  put(after, "intro", "media");
  // 3. Ordinal discourse markers open points.
  U.forEach((u, i) => { if (i > 0 && ORD_RE.test(u.text)) put(i, "point", "alta"); });
  // 4. Calls to action, grouped when they sit within two sentences of each other.
  const groups = [];
  for (const u of U) if (hasPhrase(u.text, CTAS)) { const g = groups[groups.length - 1]; if (g && u.i - g[g.length - 1] <= 2) g.push(u.i); else groups.push([u.i]); }
  for (const g of groups) { if (g[0] === 0) continue; put(g[0], "cta", "alta"); const nx = g[g.length - 1] + 1; if (nx < U.length) put(nx, "body", "media"); }
  // 5. Close: the paragraph that announces the next episode, near the end.
  const total = U[U.length - 1].t1;
  let nIdx = -1;
  // Same window as the Results "ending" check: last 90 s, or up to 45 s before a closing prayer or blessing.
  const closeFrom = Number.isFinite(R.closeFrom) ? Math.min(R.closeFrom, total - 60) : total - 90;
  for (let i = U.length - 1; i >= 0; i--) if (U[i].t0 >= closeFrom && hasPhrase(U[i].text, NEXT_EP)) { nIdx = i; break; }
  if (nIdx > 0) {
    let c = nIdx;
    while (c - 1 > 0 && U[c - 1].para === U[nIdx].para && nIdx - (c - 1) <= 3 && U[c - 1].t0 >= closeFrom - 30 && !(starts.get(c - 1) && starts.get(c - 1).type === "cta")) c--;
    if (starts.get(c) && starts.get(c).type === "cta" && c < nIdx) c++;
    put(c, "close", "alta");
  }
  // 6. Split long undifferentiated stretches at the weakest lexical link (TextTiling-style, Hearst 1997).
  for (let guard = 0; guard < 40; guard++) {
    const list = [...starts.keys()].sort((a, b) => a - b);
    let split = null;
    for (let k = 0; k < list.length && split === null; k++) {
      const a = list[k], b = (k + 1 < list.length ? list[k + 1] : U.length) - 1;
      if (!["intro", "point", "body"].includes(starts.get(a).type)) continue;
      if (U[b].t1 - U[a].t0 <= 300) continue;
      let best = null;
      for (let i = a + 1; i <= b; i++) {
        if (U[i].t0 - U[a].t0 < 60 || U[b].t1 - U[i].t0 < 60) continue;
        const sim = cosine(bagOf(U, Math.max(a, i - 4), i), bagOf(U, i, Math.min(b + 1, i + 4))) - (U[i].para !== U[i - 1].para ? 0.15 : 0);
        if (!best || sim < best.sim) best = { i, sim };
      }
      if (best) split = best.i;
    }
    if (split === null) break;
    starts.set(split, { type: "body", conf: "baja", title: "" });
  }
  // 7. Drop guessed "body" sections shorter than 12 s (e.g. one sentence between a call to action and the close).
  const keys = [...starts.keys()].sort((a, b) => a - b);
  keys.forEach((a, k) => {
    const v = starts.get(a);
    if (a === 0 || v.type !== "body" || v.conf === "alta") return;
    const b = k + 1 < keys.length ? keys[k + 1] : U.length;
    if (U[b - 1].t1 - U[a].t0 < 12) starts.delete(a);
  });
  return [...starts.entries()].sort((a, b) => a[0] - b[0]).map(([first, v]) => ({ first, anchor: U[first].text.slice(0, 80), ...v }));
}

// Keep a hand-edited layout attached to the same sentences after the text changes.
function remapLayout(layout, U) {
  if (!U.length) return [];
  const used = new Set(), out = [];
  for (const L of layout) {
    let best = -1, bd = Infinity;
    U.forEach((u, i) => { if (!used.has(i) && u.text.slice(0, 80) === L.anchor) { const d = Math.abs(i - L.first); if (d < bd) { bd = d; best = i; } } });
    if (best < 0) { const i = Math.min(L.first, U.length - 1); if (!used.has(i)) best = i; }
    if (best >= 0) { used.add(best); out.push({ ...L, first: best, anchor: U[best].text.slice(0, 80) }); }
  }
  out.sort((a, b) => a.first - b.first);
  if (!out.length || out[0].first !== 0) out.unshift({ first: 0, anchor: U[0].text.slice(0, 80), type: "hook", conf: "alta", title: "" });
  return out;
}

function sectionsFrom(layout, U, runtimeSec) {
  let pointN = 0, prevEnd = 0;
  return layout.map((L, k) => {
    const last = (k + 1 < layout.length ? layout[k + 1].first : U.length) - 1;
    let wc = 0, syl = 0;
    for (let i = L.first; i <= last; i++) { wc += U[i].wc; syl += U[i].syl; }
    if (L.type === "point") pointN++;
    const t0 = k === 0 ? 0 : prevEnd;
    const t1 = k + 1 === layout.length ? Math.max(U[last].t1, runtimeSec || 0) : U[last].t1;
    prevEnd = t1;
    return { ...L, k, last, t0, t1, dur: t1 - t0, wc, syl, n: L.type === "point" ? pointN : 0 };
  });
}

// Rule checks per section; cold = { hook: bool, promise: bool }.
function sectionFlags(secs, U, R, cold) {
  const F = secs.map(() => []);
  if (!secs.length) return F;
  const hook = secs.find((s) => s.type === "hook");
  // Same rules as the Results tab: an opening prayer inside the hook section doesn't count against the hook,
  // and the promise target is 20 s, or 45 s in a series episode.
  const op = R.openPrayer;
  const prayIn = hook && op ? Math.max(0, Math.min(op.to, hook.t1) - Math.max(op.from, hook.t0)) : 0;
  const hookDur = hook ? hook.dur - prayIn : 0;
  if (!cold.hook && hook && hookDur > 7.5) F[hook.k].push({ id: "hookLong", v: Math.round(hookDur) });
  if (!cold.hook && hook && U.slice(hook.first, hook.last + 1).some((u) => hasPhrase(u.text, GREETINGS))) F[hook.k].push({ id: "hookGreeting" });
  if (!cold.promise) {
    const prom = secs.find((s) => s.type === "promise");
    if (!prom) { if (!(hook && U.slice(hook.first, hook.last + 1).some((u) => hasPhrase(u.text, PROMISES)))) F[0].push({ id: "noPromise" }); }
    else if (prom.t1 > (R.promiseDeadline || 20) + 0.5) F[prom.k].push({ id: "promiseLate", v: prom.t1, d: R.promiseDeadline || 20 });
  }
  const total = secs[secs.length - 1].t1;
  // Re-hook gaps: the same teaching points the Results "rehook" row found without a question or teaser.
  const gapSpans = Array.isArray(R.blocks) ? R.blocks.filter((b) => !b.has).map((b) => [b.from, b.to]) : (() => {
    const ev = [0, ...(R.qPositions || []).map((p) => R.timeAt(p)), ...(R.loopHits || []).map((x) => R.timeAt(x.start)), total].sort((a, b) => a - b);
    const out = []; for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > 270) out.push([ev[i - 1], ev[i]]); return out;
  })();
  for (const [a, b] of gapSpans) {
    const mid = (a + b) / 2;
    const s = secs.find((x) => mid >= x.t0 && mid < x.t1) || secs[secs.length - 1];
    F[s.k].push({ id: "gap", a, b });
  }
  const ctas = secs.filter((s) => s.type === "cta");
  ctas.slice(0, -1).forEach((s) => F[s.k].push({ id: "extraCta" }));
  if (total > 120 && !secs.some((s) => s.type === "close")) F[secs.length - 1].push({ id: "noClose" });
  return F;
}

// Three sentences from the script that can stand alone at the start of the video.
function coldCandidates(U, R, kind, o = {}) {
  const kw = o.keyword ? norm(o.keyword) : "";
  const total = U.length ? U[U.length - 1].t1 : 0;
  const lvl = (cat) => ((R.preflight || []).find((p) => p.id === cat) || {}).level || "amarillo";
  const out = [];
  for (const u of U) {
    if (u.wc < 4) continue;
    if (hasPhrase(u.text, CTAS) || hasPhrase(u.text, GREETINGS)) continue;
    const dur = u.t1 - u.t0, why = [];
    let s = 0;
    if (kind === "hook") {
      if (u.t0 < 7) continue; // already at the start
      if (/[?¿]/.test(u.text)) { s += 3; why.push("q"); }
      if (YOU_RE.test(u.text)) { s += 2; why.push("you"); }
      if (TENSION_RE.test(u.text)) { s += 2; why.push("tension"); } else if (SOFT_T_RE.test(u.text)) s += 1;
      if (dur <= 7) s += 2; else if (dur > 9) s -= Math.ceil((dur - 9) / 3) * 2;
      if (u.t0 > total * 0.15) { s += 1; why.push("late"); }
      if (/\d/.test(u.text)) s += 1;
    } else {
      if (hasPhrase(u.text, PROMISES)) { s += 4; why.push("promise"); } else if (PROM_RE.test(u.text)) { s += 3; why.push("promise"); } else if (FUT_RE.test(u.text)) s += 1;
      if (u.wc > 35) s -= 3; else if (u.wc >= 6) s += 1;
      if (dur > 12) s -= 2;
      if (u.t0 < 7) why.push("open");
    }
    if (kw && norm(u.text).includes(kw)) { s += 2; why.push("kw"); }
    if (ANA_STRONG.test(u.text)) s -= 3; else if (CONNECT_RE.test(u.text)) { s -= 2; why.push("connector"); } else if (ANA_SOFT.test(u.text)) s -= 1;
    if (ORD_RE.test(u.text)) s -= 2; // "Primero, …" depends on what came before
    if ((R.quotes || []).some((q) => q.start <= u.start + 2 && u.end <= q.end + 2)) { if (kind === "hook") s += 1; why.push("verse"); }
    const risk = (R.riskHits || []).filter((x) => x.start >= u.start && x.end <= u.end);
    if (risk.length) { s -= risk.some((x) => lvl(x.cat) !== "verde") ? 6 : 2; why.push("risk"); }
    out.push({ i: u.i, score: s, why, dur, t0: u.t0, t1: u.t1, text: u.text });
  }
  const min = 4;
  out.sort((a, b) => b.score - a.score || a.dur - b.dur);
  const pick = [];
  for (const c of out) {
    if (c.score < min) break;
    if (pick.some((p) => Math.abs(p.t0 - c.t0) < 20)) continue;
    pick.push(c);
    if (pick.length === 3) break;
  }
  return pick;
}

// Sentence-level LCS, then word-level inside changed runs: keeps long scripts fast.
function lcsOps(A, B) {
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) { ops.push({ op: "eq", text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push({ op: "del", text: A[i++] });
    else ops.push({ op: "ins", text: B[j++] });
  }
  while (i < m) ops.push({ op: "del", text: A[i++] });
  while (j < n) ops.push({ op: "ins", text: B[j++] });
  return ops;
}
function diffOps(a, b) {
  const split = (s) => s.match(/[^.!?…\n]*[.!?…]+[ \t]*|[^.!?…\n]+[ \t]*|\n+/g) || [];
  const A = split(a), B = split(b);
  if (A.length * B.length > 4e6) return [{ op: "del", text: a }, { op: "ins", text: b }];
  const top = lcsOps(A, B), out = [];
  for (let k = 0; k < top.length;) {
    if (top[k].op === "eq") { out.push(top[k++]); continue; }
    let d = "", ins = "";
    while (k < top.length && top[k].op !== "eq") { if (top[k].op === "del") d += top[k].text; else ins += top[k].text; k++; }
    const wa = d.split(/(\s+)/).filter((x) => x !== ""), wb = ins.split(/(\s+)/).filter((x) => x !== "");
    if (d && ins && wa.length * wb.length <= 4e6) out.push(...lcsOps(wa, wb));
    else { if (d) out.push({ op: "del", text: d }); if (ins) out.push({ op: "ins", text: ins }); }
  }
  return out;
}

// ---------- Results: audience-retention import (YouTube Studio CSV or pasted columns) ----------
const toSec = (s) => { const m = String(s).trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.\d+)?$/); return m ? (+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3] : null; };
const toNum = (s) => { const x = String(s).trim().replace(/%$/, "").replace(/^"|"$/g, ""); if (!/^-?\d+(?:[.,]\d+)?$/.test(x)) return null; return parseFloat(x.replace(",", ".")); };
function parseRetention(raw, durationSec) {
  const lines = String(raw || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { error: "empty" };
  const splitRow = (l) => (l.includes("\t") ? l.split("\t") : l.includes(";") ? l.split(";") : l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)).map((c) => c.trim().replace(/^"|"$/g, ""));
  let header = null;
  const rows = [];
  for (const l of lines) {
    const cells = splitRow(l);
    const nums = cells.map((c) => (toSec(c) !== null ? { t: toSec(c) } : toNum(c) !== null ? { n: toNum(c) } : null));
    if (nums.filter(Boolean).length >= 2) rows.push({ cells, nums });
    else if (!rows.length) header = cells.map((c) => norm(c));
  }
  if (rows.length < 3) return { error: "few" };
  const width = Math.max(...rows.map((r) => r.nums.length));
  // Position column: first column with numbers; retention column: header match, else the next numeric column.
  let posCol = 0;
  while (posCol < width && !rows.every((r) => r.nums[posCol])) posCol++;
  let retCol = -1;
  if (header) {
    const pick = (re) => header.findIndex((hd, k) => k !== posCol && re.test(hd) && rows.every((r) => r.nums[k] && r.nums[k].n !== undefined));
    retCol = pick(/absolut/);
    if (retCol < 0) retCol = pick(/retenc|retention|audienc|audience/);
  }
  if (retCol < 0) for (let k = posCol + 1; k < width; k++) if (rows.every((r) => r.nums[k] && r.nums[k].n !== undefined)) { retCol = k; break; }
  if (posCol >= width || retCol < 0) return { error: "cols" };
  const isTime = rows.every((r) => r.nums[posCol].t !== undefined);
  const pos = rows.map((r) => (isTime ? r.nums[posCol].t : r.nums[posCol].n));
  let ret = rows.map((r) => r.nums[retCol].n);
  if (Math.max(...ret) <= 1.5) ret = ret.map((x) => x * 100);
  const hdrPct = header && /%|percent|porcentaje|posici|position/.test(header[posCol] || "");
  const pctPos = !isTime && (hdrPct || (Math.max(...pos) <= 100 && (!durationSec || durationSec > 110)));
  if (pctPos && !durationSec) return { error: "duration" };
  const pts = pos.map((p, k) => [pctPos ? (p / (Math.max(...pos) <= 1.01 ? 1 : 100)) * durationSec : p, ret[k]]).filter((x) => isFinite(x[0]) && isFinite(x[1])).sort((a, b) => a[0] - b[0]);
  return { points: pts, durationSec: durationSec || pts[pts.length - 1][0], pctPos };
}
function retAt(points, t) {
  if (!points.length) return null;
  if (t <= points[0][0]) return points[0][1];
  for (let k = 1; k < points.length; k++) if (t <= points[k][0]) { const [a, ra] = points[k - 1], [b, rb] = points[k]; return ra + (rb - ra) * ((t - a) / Math.max(1e-6, b - a)); }
  return points[points.length - 1][1];
}
// Per-section retention: spans are [{k, a, b}] in real-video seconds.
function retentionBySection(points, spans) {
  const rows = spans.map((s) => { const r0 = retAt(points, s.a), r1 = retAt(points, s.b), min = Math.max(0.1, (s.b - s.a) / 60); return { ...s, r0, r1, drop: r0 - r1, perMin: (r0 - r1) / min }; });
  const ranked = rows.filter((r) => r.b - r.a >= 20).sort((x, y) => y.perMin - x.perMin);
  ranked.slice(0, 2).forEach((r) => { if (r.perMin > 0) r.worst = true; });
  return rows;
}
function avgViewed(points, dur) {
  if (points.length < 2) return null;
  let area = 0;
  for (let k = 1; k < points.length; k++) { const [a, ra] = points[k - 1], [b, rb] = points[k]; if (a >= dur) break; area += ((ra + rb) / 2) * (Math.min(b, dur) - a); }
  return area / dur;
}

// ---------- Packaging gate ----------
const contentSet = (s) => new Set(wordTokens(s || "").map((w) => norm(w.w)).filter((w) => w.length > 3 && !STOP.has(w)));
function packagingChecks(o, R, promiseText) {
  const title = (o.title || "").trim(), thumb = (o.thumb || "").trim(), desc = (o.description || "").trim(), kw = (o.keyword || R.keyword || "").trim();
  const pk = (label) => (R.packaging || []).find((p) => p.key === label);
  const tw = contentSet(title), th = contentSet(thumb), pr = contentSet(promiseText);
  const overlap = th.size ? [...th].filter((w) => tw.has(w)).length / th.size : 0;
  const shared = [...tw].filter((w) => pr.has(w) || (kw && norm(kw).includes(w)));
  const thumbWords = wordTokens(thumb).length;
  // pending: the field the check reads is still empty, so it neither passes nor fails yet.
  return [
    { id: "title", req: true, pass: !!title },
    { id: "titleLen", req: true, pass: !title || title.length <= 60, v: title.length, pending: !title },
    { id: "titleRisk", req: true, pass: !title || !pk("title") || pk("title").level === "verde", v: pk("title") ? pk("title").issues.join("; ") : "", pending: !title },
    { id: "thumb", req: true, pass: thumbWords >= 1 && thumbWords <= 4 && thumb.length <= 24, v: thumbWords },
    { id: "thumbRisk", req: true, pass: !thumb || !pk("thumb") || pk("thumb").level === "verde", v: pk("thumb") ? pk("thumb").issues.join("; ") : "", pending: !thumb },
    { id: "titleKw", req: false, pass: !kw || norm(title).slice(0, 60).includes(norm(kw)), v: kw, pending: !title },
    { id: "thumbRepeat", req: false, pass: !thumb || overlap < 0.75, pending: !thumb || !title },
    { id: "promiseMatch", req: false, pass: !title || !promiseText || shared.length > 0, v: shared.slice(0, 3).join(", "), pending: !title },
    { id: "descKw", req: false, pass: !desc || !kw || norm(desc.slice(0, 150)).includes(norm(kw)), pending: !desc },
  ];
}

// ---------- YouTube chapters from the rundown ----------
// sections: [{t (video seconds), type, label}] → at least 3 chapters, first at 0:00, each ≥ 10 s.
function buildChapters(items, total, introLabel) {
  const ch = [{ t: 0, label: introLabel }];
  for (const s of items) {
    if (!["point", "body", "close", "intro"].includes(s.type) || s.t < 1) continue;
    const last = ch[ch.length - 1];
    if (s.t - last.t < 10) { if (last.t > 0) last.label = s.label; continue; }
    ch.push({ t: s.t, label: s.label });
  }
  while (ch.length > 1 && total - ch[ch.length - 1].t < 10) ch.pop();
  return ch;
}

// ---------- Shorts: self-contained 20–180 s passages ----------
function clipCandidates(U, R, secs, o = {}) {
  const kw = o.keyword ? norm(o.keyword) : "";
  const lvl = (cat) => ((R.preflight || []).find((p) => p.id === cat) || {}).level || "amarillo";
  const inQuote = (u) => (R.quotes || []).some((q) => q.start <= u.start + 2 && u.end <= q.end + 2);
  const out = [];
  for (let a = 0; a < U.length; a++) {
    const u = U[a];
    if (u.t0 < 7 || u.wc < 4) continue;
    if (ANA_STRONG.test(u.text) || CONNECT_RE.test(u.text) || ORD_RE.test(u.text) || ANA_SOFT.test(u.text)) continue;
    const sec = secs.find((s) => a >= s.first && a <= s.last);
    if (!sec || ["cta", "close", "hook"].includes(sec.type)) continue;
    const why = [];
    let s0 = 0;
    if (/[?¿]/.test(u.text)) { s0 += 3; why.push("q"); }
    if (YOU_RE.test(u.text)) { s0 += 2; why.push("you"); }
    if (TENSION_RE.test(u.text)) { s0 += 2; why.push("tension"); }
    if (kw && norm(u.text).includes(kw)) { s0 += 1; why.push("kw"); }
    if (s0 < 3) continue;
    let best = null;
    for (let b = a; b <= sec.last; b++) {
      if (hasPhrase(U[b].text, CTAS) || hasPhrase(U[b].text, GREETINGS)) break;
      if (b > a && (ORD_RE.test(U[b].text) || CONNECT_RE.test(U[b].text))) break; // a new thought starts
      const dur = U[b].t1 - u.t0;
      if (dur > 180) break;
      if (dur < 20) continue;
      let e = 0;
      if (U[b].wc <= 12) e += 1;
      if (!U[b + 1] || U[b + 1].para !== U[b].para) e += 2; // ends where a paragraph ends
      if (/[.!»”]\s*$/.test(U[b].text) && !/[?]\s*$/.test(U[b].text)) e += 1;
      if (dur >= 30 && dur <= 50) e += 1;
      if (dur > 50 && dur <= 90) e += 1;
      if (!best || e > best.e || (e === best.e && Math.abs(dur - 45) < Math.abs(best.dur - 45))) best = { b, e, dur };
    }
    if (!best) continue;
    const range = U.slice(a, best.b + 1);
    const risk = (R.riskHits || []).filter((x) => x.start >= u.start && x.end <= U[best.b].end);
    if (risk.some((x) => lvl(x.cat) !== "verde")) continue;
    let score = s0 + best.e - (risk.length ? 1 : 0);
    if (range.some(inQuote)) { score += 1; why.push("verse"); }
    out.push({ i0: a, i1: best.b, t0: u.t0, t1: U[best.b].t1, dur: best.dur, score, why, first: u.text, last: U[best.b].text, sec: sec.k });
  }
  out.sort((x, y) => y.score - x.score || x.t0 - y.t0);
  const pick = [];
  for (const c of out) { if (pick.some((p) => !(c.i1 < p.i0 || c.i0 > p.i1))) continue; pick.push(c); if (pick.length === 5) break; }
  return pick.sort((x, y) => x.t0 - y.t0);
}


// ---------- Suggested ad-break points ----------
// A break goes where a teaching point ends: never inside a verse, never next to a prayer or a call to action.
// Spacing (at least 4 min apart, none in the last 3 min, the first at 40% of the video or later) is advice from creator guides, not a YouTube rule.
function adBreaks(secs, U, text, R) {
  if (!secs.length || !U.length) return [];
  const total = secs[secs.length - 1].t1;
  const spans = verseSpans(text, R).filter((s) => s.kind !== "ref");
  const near = [...findPhrases(text, PRAYER_OPEN, "p"), ...findPhrases(text, CTAS, "c")].map((h) => { const u = U.find((x) => h.start >= x.start && h.start < x.end); return u ? u.t0 : null; }).filter((x) => x !== null);
  const out = [];
  let prev = 0;
  for (const s of secs) {
    if (!["point", "body", "intro"].includes(s.type)) continue;
    const a = U[s.last], b = U[s.last + 1];
    if (!a || !b) continue;
    const t = s.t1;
    if (t < 240 || t - prev < 240 || total - t < 180) continue;
    if (!out.length && t < total * 0.4) continue;
    if (spans.some((v) => (a.start < v.end && a.end > v.start) || (b.start < v.end && b.end > v.start))) continue;
    if (near.some((x) => Math.abs(x - t) <= 10)) continue;
    out.push({ t, k: s.k });
    prev = t;
  }
  return out;
}
