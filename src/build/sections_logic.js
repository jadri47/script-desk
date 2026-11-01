
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
