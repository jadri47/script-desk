/* ===== Burbuja de puntuación: un número 0–100 que sigue al usuario y se actualiza al cambiar el guion ===== */
// scoreOf() vive en score_logic.js (banda primero, posición dentro de la banda). El análisis en vivo corre en un
// Web Worker con el mismo motor que la revisión; si no hay worker, corre en la pausa del navegador con "debounce".
Object.assign(T.es, {
  scTitle: "Puntuación Script Desk", scWord: "Puntuación", scBand: { rojo: "Anuncios en riesgo", amarillo: "Sin riesgo grave de anuncios", verde: "Listo para grabar" },
  scLamp: { rojo: "Anuncios en riesgo: hay un término que YouTube no perdona.", amarillo: "Sin riesgo grave de anuncios.", verde: "Limpio: nada pendiente." },
  scLeft: (n, p) => `Te ${n === 1 ? "falta 1 revisión, que vale" : `faltan ${n} revisiones, que valen`} ${p} ${p === 1 ? "punto" : "puntos"}.`,
  scHowT: "Cómo se calcula",
  scHow: ["Anuncios (términos de riesgo): 6–8 puntos cada uno; un término grave pone la nota en rojo (máx. 69).", "Primeros 30 segundos y estructura: 1–5 puntos.", "Que el mensaje se entienda (idea central, cierre, citas): 1–4 puntos.", "Que te encuentren (palabra clave, título, descripción): 1–3 puntos.", "Cómo suena (lecturas, muletillas, regionalismos): 1–2 puntos. Lo que descartas cuesta la mitad."],
  scPtsTip: "Puntos que sube la nota al arreglarlo",
  scNew: "Nueva puntuación: cada revisión pesa según su impacto. Si tu número bajó, el guion no cambió; ahora ves qué arreglar primero.",
  scSince: (a, b) => `Desde que empezaste: ${a} → ${b}`, scTop: "Lo que más sube la nota", scNone: "Nada pendiente.",
  scIgnored: (n, x) => `Ignoraste ${n} ${n === 1 ? "revisión" : "revisiones"} (−${x} ${x === 1 ? "punto" : "puntos"})`, scShowAgain: "Volver a mostrar",
  scNote: "Puntuación de Script Desk: 100 menos lo que pesa cada revisión pendiente. No es la nota de YouTube.",
  scHide: "Ocultar burbuja", scShow: "Mostrar puntuación", scAria: (n) => `Puntuación ${n} de 100`, scChecks: (p, n) => `${p} de ${n} revisiones pasan`, scClose: "Cerrar",
});
Object.assign(T.en, {
  scTitle: "Script Desk score", scWord: "Score", scBand: { rojo: "Ads at risk", amarillo: "No serious ad risk", verde: "Ready to record" },
  scLamp: { rojo: "Ads at risk: a term YouTube doesn't forgive.", amarillo: "No serious ad risk.", verde: "Clean: nothing pending." },
  scLeft: (n, p) => `${n} ${n === 1 ? "check" : "checks"} left, worth ${p} ${p === 1 ? "point" : "points"}.`,
  scHowT: "How it's scored",
  scHow: ["Ads (risk terms): 6–8 points each; one serious term turns the score red (max 69).", "First 30 seconds and structure: 1–5 points.", "That the message lands (central idea, close, quotes): 1–4 points.", "That people find it (keyword, title, description): 1–3 points.", "How it sounds (readings, fillers, regionalisms): 1–2 points. What you dismiss costs half."],
  scPtsTip: "Points this adds to the score when fixed",
  scNew: "New score: each check weighs by its impact. If your number dropped, the script did not change; now you see what to fix first.",
  scSince: (a, b) => `Since you started: ${a} → ${b}`, scTop: "What raises it most", scNone: "Nothing pending.",
  scIgnored: (n, x) => `You dismissed ${n} ${n === 1 ? "check" : "checks"} (−${x} ${x === 1 ? "point" : "points"})`, scShowAgain: "Show again",
  scNote: "Script Desk score: 100 minus the weight of each pending check. It is not YouTube's score.",
  scHide: "Hide bubble", scShow: "Show score", scAria: (n) => `Score ${n} out of 100`, scChecks: (p, n) => `${p} of ${n} checks pass`, scClose: "Close",
});
if (typeof HELP !== "undefined") {
  HELP.es.verdictCard = "Resumen de la revisión. El círculo muestra la puntuación de Script Desk (0 a 100): cada revisión pendiente resta según su impacto, las de anuncios primero. No es la nota de YouTube. La etiqueta de color habla solo de los anuncios.";
  HELP.en.verdictCard = "Review summary. The ring shows the Script Desk score (0 to 100): each pending check subtracts by its impact, ads first. It is not YouTube's score. The colored label is about ads only.";
}

const SC = { w: null, seq: 0, pending: 0, guard: null, timer: null, delay: 700, ms: 0, R: null, S: null, base: null, baseKey: null, shown: null, off: lsGet("sd-bubble") === "off", where: "", pop: false, noWorker: false, liveAt: 0 };
window.SC = SC;
// v3: the score recipe changed on 2026-10-21 (partial credit); "since last time" must not compare scores from two recipes
const scKey = () => "sd-score-base-v3:" + (G.prodId || "draft");
const scDemo = () => typeof DEMO !== "undefined" && !!DEMO;
const scReduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- engine in a worker (embedded as <script type="text/plain" id="engineSrc">) ----
function scStartWorker() {
  if (SC.w || SC.noWorker || window.__SD_NO_WORKER || typeof Worker === "undefined") return;
  try {
    const el = document.getElementById("engineSrc");
    if (!el || !el.textContent.trim()) { SC.noWorker = true; return; }
    // the slim rows keep n/lim: partial credit (weightOf) needs them, or the pill and the verdict disagree (53 vs 48)
    const code = el.textContent.replace(/<\\\/script/g, "</script") + `
;(function(){function slim(s){var o={};for(var k in s)o[k]=s[k].map(function(r){return{id:r.id,label:r.label,passed:r.passed,warn:r.warn,level:r.level,n:r.n,lim:r.lim}});return o}
onmessage=function(e){var d=e.data;try{var t0=Date.now();var R=analyze(d.text,d.opts);postMessage({seq:d.seq,ms:Date.now()-t0,R:{worst:R.worst,passed:R.passed,total:R.total,sections:slim(R.sections)}})}catch(err){postMessage({seq:d.seq,error:String(err&&err.message||err)})}}})();`;
    const w = new Worker(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
    w.onmessage = (e) => {
      const d = e.data || {};
      if (d.seq !== SC.seq) return; // a newer change already superseded this run
      SC.pending = 0; clearTimeout(SC.guard);
      if (d.error || !d.R) { scKillWorker(); scRun(); return; }
      SC.ms = d.ms; scAdapt(); SC.R = d.R; scApply();
    };
    w.onerror = () => { scKillWorker(); if (SC.pending) scRun(); };
    SC.w = w;
  } catch (e) { SC.noWorker = true; SC.w = null; }
}
function scKillWorker() { try { if (SC.w) SC.w.terminate(); } catch (e) { /* best effort: worker already gone */ } SC.w = null; SC.noWorker = true; clearTimeout(SC.guard); }
function scAdapt() { SC.delay = SC.ms > 250 ? Math.min(2000, SC.delay * 2) : SC.ms < 120 ? Math.max(700, Math.round(SC.delay / 2)) : SC.delay; }
const scIdle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 0));
function scSlim(R) {
  const sections = {};
  for (const k of Object.keys(R.sections)) sections[k] = R.sections[k].map((r) => ({ id: r.id, label: r.label, passed: r.passed, warn: r.warn, level: r.level }));
  return { worst: R.worst, passed: R.passed, total: R.total, sections };
}

// ---- scheduling ----
function scQueue(now) {
  if (SC.off) return;
  clearTimeout(SC.timer);
  const long = ($("script").value || "").length > 60000;
  SC.timer = setTimeout(scRun, now ? 0 : long ? Math.max(SC.delay, 2000) : SC.delay);
}
function scRun() {
  if (SC.off) return;
  const text = $("script").value;
  if (!text.trim()) { SC.R = null; SC.S = null; SC.base = null; SC.baseKey = null; SC.shown = null; try { localStorage.removeItem(scKey()); } catch (e) { /* best effort: storage blocked: nothing to forget */ } scPaint(); return; }
  let opts; try { opts = JSON.parse(JSON.stringify(readOpts())); } catch (e) { return; }
  const seq = ++SC.seq;
  scStartWorker();
  if (!SC.w) SC.delay = Math.max(SC.delay, 1200); // no worker: wait longer so the run lands after the user stops typing
  if (SC.w) {
    SC.pending = seq; clearTimeout(SC.guard);
    SC.guard = setTimeout(() => { if (SC.pending === seq) { scKillWorker(); scRun(); } }, 4000);
    try { SC.w.postMessage({ seq, text, opts }); } catch (e) { scKillWorker(); scRun(); }
    return;
  }
  scIdle(() => {
    if (seq !== SC.seq) return;
    const t0 = performance.now(); let R;
    try { R = analyze(text, opts); } catch (e) { return; }
    SC.ms = performance.now() - t0;
    if (seq !== SC.seq) return;
    scAdapt(); SC.R = scSlim(R); scApply();
  });
}

// ---- state → pill ----
function scApply() {
  if (!SC.R) { scPaint(); return; }
  const S = scoreOf(SC.R, state.fixDismissed);
  const key = scKey();
  if (SC.baseKey !== key || SC.base == null) {
    SC.baseKey = key;
    let b = null;
    if (!scDemo()) { try { const o = JSON.parse(lsGet(key) || "null"); if (o && typeof o.score === "number") b = o.score; } catch (e) { /* best effort: unreadable saved baseline: show no change arrow */ } }
    if (b == null) { b = S.score; if (!scDemo()) lsSet(key, JSON.stringify({ score: b, at: Date.now() })); }
    SC.base = b;
  }
  SC.S = S; scPaint(); scNewToast();
}
function scNewToast() {
  if (scDemo() || SC.off || !hasScript() || lsGet("sd-score-v2-seen") === "1") return;
  lsSet("sd-score-v2-seen", "1");
  let el = $("scToast");
  if (!el) { el = document.createElement("div"); el.id = "scToast"; el.className = "cost-toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  el.innerHTML = `<span>${h(t("scNew"))}</span><button type="button" aria-label="${h(t("scClose"))}">×</button>`;
  el.querySelector("button").addEventListener("click", () => el.classList.remove("on"));
  el.classList.add("on"); setTimeout(() => el.classList.remove("on"), 12000);
}
function scEnsure() {
  let p = $("scorePill");
  if (p) return p;
  p = document.createElement("button"); p.type = "button"; p.id = "scorePill"; p.className = "score-pill float"; p.hidden = true;
  p.setAttribute("aria-haspopup", "dialog"); p.setAttribute("aria-expanded", "false");
  p.innerHTML = `<span class="sc-dot" aria-hidden="true"></span><span class="sc-n" id="scN"></span><span class="sc-d" id="scD"></span>`;
  p.addEventListener("click", (e) => { e.stopPropagation(); SC.pop ? scClosePop() : scOpenPop(); });
  document.body.appendChild(p);
  const live = document.createElement("div"); live.id = "scLive"; live.className = "vh"; live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite"); document.body.appendChild(live);
  return p;
}
function scPlace() {
  const pill = scEnsure(), meta = document.querySelector(".meta-line");
  const dock = typeof SPLIT !== "undefined" && SPLIT.on && !!meta;
  if (dock) { const tg = $("trToggle"); if (pill.parentNode !== meta) meta.insertBefore(pill, tg || null); }
  else if (pill.parentNode !== document.body) document.body.appendChild(pill);
  pill.classList.toggle("docked", dock); pill.classList.toggle("float", !dock);
  SC.where = dock ? "dock" : "float";
}
function scTween(el, from, to) {
  if (from == null || from === to || scReduced()) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 400;
  const step = (now) => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(from + (to - from) * k); if (k < 1 && SC.shown === to) requestAnimationFrame(step); else el.textContent = to; };
  requestAnimationFrame(step);
}
function scPaint() {
  const pill = scEnsure();
  scPlace();
  const on = !SC.off && SC.S && hasScript();
  pill.hidden = !on;
  scShowBtn();
  if (!on) { scClosePop(); return; }
  const S = SC.S, d = S.score - SC.base;
  pill.className = `score-pill band-${S.band} ${SC.where === "dock" ? "docked" : "float"}${SC.lift ? " lift" : ""}`;
  const from = SC.shown; SC.shown = S.score;
  scTween($("scN"), from, S.score);
  const dEl = $("scD"); dEl.textContent = d ? (d > 0 ? "▲" : "▼") + Math.abs(d) : ""; dEl.className = "sc-d" + (d > 0 ? " up" : d < 0 ? " down" : "");
  const lbl = `${t("scAria")(S.score)} · ${t("scBand")[S.band]}`;
  pill.setAttribute("aria-label", lbl); pill.title = t("scNote");
  const now = Date.now();
  if (now - SC.liveAt > 5000) { SC.liveAt = now; $("scLive").textContent = lbl; }
  if (SC.pop) scRenderPop();
}

// ---- popover ----
function scTopRows(S) {
  const sp = typeof SEC_PRIORITY !== "undefined" ? SEC_PRIORITY : {};
  return S.open.map((r, i) => ({ r, i, w: S.pts.get(r.id) || 0 })).sort((a, b) => b.w - a.w || a.i - b.i).slice(0, 3).map((x) => x.r);
}
const scLabel = (r) => (typeof plainLabel === "function" ? plainLabel(r.id, r.label) : r.label);
function scRenderPop() {
  const pop = $("scPop"); if (!pop || !SC.S) return;
  const S = SC.S, d = S.score - SC.base;
  const top = scTopRows(S);
  pop.innerHTML = `<div class="sc-head"><span class="sc-big band-${S.band}"><i class="sc-dot"></i>${S.score}<small>/100</small></span><span class="sc-band">${h(t("scBand")[S.band])}</span><button type="button" class="sc-x" id="scX" aria-label="${h(t("scClose"))}">×</button></div>
    <p class="sc-lamp">${h(t("scLamp")[S.band])}</p>
    <p class="hint sc-checks">${S.open.length ? h(t("scLeft")(S.open.length, S.openPts)) + " " : ""}${h(t("scChecks")(S.passed, S.total))}</p>
    ${d ? `<p class="sc-since">${h(t("scSince")(SC.base, S.score))}</p>` : ""}
    <div class="sc-k">${h(t("scTop"))}</div>
    ${top.length ? `<ul class="sc-rows">${top.map((r) => `<li><button type="button" data-scrow="${h(r.id)}"><span>${h(scLabel(r))}</span><b class="sc-pts">+${S.pts.get(r.id)}</b></button></li>`).join("")}</ul>` : `<p class="hint">${h(t("scNone"))}</p>`}
    ${S.ignored.length ? `<div class="sc-ign"><b>${h(t("scIgnored")(S.ignored.length, S.dismissPen))}</b><ul>${S.ignored.map((r) => `<li><span>${h(scLabel(r))}</span><button type="button" class="small" data-scshow="${h(r.id)}">${h(t("scShowAgain"))}</button></li>`).join("")}</ul></div>` : ""}
    <details class="sc-how"><summary>${h(t("scHowT"))}</summary><ul>${t("scHow").map((x) => `<li>${h(x)}</li>`).join("")}</ul></details>
    <p class="hint sc-note">${h(t("scNote"))}</p>
    <button type="button" class="linkish sc-hide" id="scHide">${h(t("scHide"))}</button>`;
  $("scX").addEventListener("click", scClosePop);
  $("scHide").addEventListener("click", () => scSetOff(true));
  pop.querySelectorAll("[data-scrow]").forEach((b) => b.addEventListener("click", () => scGoRow(b.dataset.scrow)));
  pop.querySelectorAll("[data-scshow]").forEach((b) => b.addEventListener("click", () => { state.fixDismissed.delete(b.dataset.scshow); scApply(); scRefreshView(); }));
}
function scRefreshView() { try { if (state.result) { if (V.guided) renderGuide(); else renderResults(); } } catch (e) { /* best effort: view refresh is cosmetic: the next render redraws */ } }
function scOpenPop() {
  if (!SC.S) return;
  let scrim = $("scScrim");
  if (!scrim) { scrim = document.createElement("div"); scrim.id = "scScrim"; scrim.className = "sc-scrim"; scrim.addEventListener("click", scClosePop); document.body.appendChild(scrim); }
  let pop = $("scPop");
  if (!pop) { pop = document.createElement("div"); pop.id = "scPop"; pop.className = "sc-pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", t("scTitle")); document.body.appendChild(pop); }
  SC.pop = true; scrim.hidden = false; pop.hidden = false; $("scorePill").setAttribute("aria-expanded", "true");
  scRenderPop();
  if (window.innerWidth >= 900) {
    const r = $("scorePill").getBoundingClientRect(), w = Math.min(360, window.innerWidth - 24);
    pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12)) + "px";
    const below = r.bottom + 8, room = window.innerHeight - below - 12;
    pop.style.top = (room > 300 ? below : Math.max(12, r.top - 8 - Math.min(pop.offsetHeight, window.innerHeight - 24))) + "px"; pop.style.bottom = "auto"; pop.style.right = "auto"; pop.style.width = w + "px";
  } else { pop.style.left = pop.style.top = pop.style.right = pop.style.bottom = pop.style.width = ""; }
}
function scClosePop() {
  SC.pop = false;
  const pop = $("scPop"), scrim = $("scScrim"), pill = $("scorePill");
  if (pop) pop.hidden = true; if (scrim) scrim.hidden = true; if (pill) pill.setAttribute("aria-expanded", "false");
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && SC.pop) { scClosePop(); const p = $("scorePill"); if (p) p.focus(); } });
function scGoRow(id) {
  scClosePop();
  if (!ensureReview()) return;
  if (V.guided) {
    goStep(2);
    const card = (state.fixCards || []).find((c) => c.id === id || (c.ids && c.ids.includes(id)));
    if (card) { state.fixOpen = state.fixOpen || new Set(); state.fixOpen.add(card.id); renderGuide(); }
    requestAnimationFrame(() => { const li = card && document.querySelector(`[data-fid="${card.id}"]`); (li || $("guide")).scrollIntoView({ block: "start", behavior: scReduced() ? "auto" : "smooth" }); });
  } else {
    if (!state.result || $("results").classList.contains("hidden")) $("runBtn").click();
    $("results").scrollIntoView({ block: "start", behavior: scReduced() ? "auto" : "smooth" });
  }
}

// ---- hide / show ----
function scSetOff(off) {
  SC.off = off; lsSet("sd-bubble", off ? "off" : "on");
  if (off) { clearTimeout(SC.timer); clearTimeout(SC.guard); scClosePop(); scPaint(); }
  else { scQueue(true); scShowBtn(); }
}
function scShowBtn() {
  let b = $("scShowBtn");
  if (!b) {
    const sw = document.querySelector(".xswitch"); if (!sw) return;
    b = document.createElement("button"); b.type = "button"; b.id = "scShowBtn"; b.className = "linkish sc-showbtn"; b.hidden = true;
    b.addEventListener("click", () => scSetOff(false)); sw.insertAdjacentElement("afterend", b);
  }
  b.textContent = t("scShow"); b.hidden = !(SC.off && hasScript());
}

// ---- keyboard / toast awareness (phones) ----
(function scViewport() {
  const vv = window.visualViewport;
  const upd = () => { const kb = vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0; document.documentElement.style.setProperty("--sc-kb", kb > 80 ? kb + "px" : "0px"); };
  if (vv) { vv.addEventListener("resize", upd); vv.addEventListener("scroll", upd); }
  let raf = 0;
  const lift = () => { raf = 0; const on = !!document.querySelector(".cost-toast.on"); if (on !== !!SC.lift) { SC.lift = on; const p = $("scorePill"); if (p) p.classList.toggle("lift", on); } };
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(lift); }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
})();

// ---- triggers ----
["script", "title", "keyword", "thumb", "description", "bigIdea", "series", "nextEp"].forEach((id) => { const el = $(id); if (el) el.addEventListener("input", () => scQueue(false)); });
["audience", "translation", "lang"].forEach((id) => { const el = $(id); if (el) el.addEventListener("change", () => scQueue(false)); });
const _ulSC = updateLive;
updateLive = function () {
  _ulSC();
  if (SC.baseKey && SC.baseKey !== scKey()) { SC.R = null; SC.S = null; SC.base = null; SC.baseKey = null; SC.shown = null; scPaint(); }
  scQueue(false);
};
const _rrSC = renderResults;
renderResults = function () { _rrSC(); if (SC.R) scApply(); };
const _rgSC = renderGuide;
renderGuide = function () { _rgSC(); scPlace(); scShowBtn(); };
const _alSC = applyLang;
applyLang = function () { _alSC(); scPaint(); };
const _gsSC = goStep;
goStep = function (n) { scClosePop(); _gsSC(n); };
const _dcSC = doClearScript;
doClearScript = function () { _dcSC(); SC.R = null; SC.S = null; SC.base = null; SC.baseKey = null; SC.shown = null; try { localStorage.removeItem(scKey()); } catch (e) { /* best effort: storage blocked: nothing to forget */ } scPaint(); };
if (typeof SPLIT !== "undefined" && SPLIT.mq) SPLIT.mq.addEventListener("change", () => setTimeout(scPlace, 0));
const _opSC = typeof openPrompter === "function" ? openPrompter : null;
if (_opSC) openPrompter = function (m) { scClosePop(); return _opSC(m); };
scEnsure(); scPlace(); scShowBtn();
if (hasScript()) scQueue(true);
