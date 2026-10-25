/* ===== AI status: a bubble on the score while any AI call runs, then «Listo» ===== */
// (jadri47, 2026-10-25: "clearly specify when Claude is thinking and hasn't provided an answer yet ... some bubble attached to the
// script ranking so the user can see when the AI is thinking and when it's done"; picked A: every AI wait, the «Listo» bubble closes
// after ~5 s and leaves a small check on the score.) Every feature reaches the AI through caps.sample, so the count lives in one
// wrapper here instead of in each feature. caps.sample becomes a getter/setter: whatever is assigned later (bible_ui's version rule,
// a test mock) is wrapped too, and a wrapped object is marked so a re-assignment built from it is not counted twice.
Object.assign(T.es, {
  aiThinking: "La IA está pensando…", aiThinkingN: (n) => `La IA está pensando… (${n} tareas)`,
  aiWait: "Todavía no hay respuesta. Puede tardar hasta un minuto.",
  aiDone: "Listo: la IA ha respondido", aiFail: "La IA no respondió", aiFailSub: "El aviso en pantalla dice por qué.",
  aiRetry: "Reintentar", aiClose: "Cerrar", aiPillBusy: "La IA está pensando", aiPillDone: "La IA ha respondido",
  aiLblReport: "Informe del editor",
});
Object.assign(T.en, {
  aiThinking: "The AI is thinking…", aiThinkingN: (n) => `The AI is thinking… (${n} tasks)`,
  aiWait: "No answer yet. It can take up to a minute.",
  aiDone: "Done: the AI has answered", aiFail: "The AI did not answer", aiFailSub: "The message on screen says why.",
  aiRetry: "Retry", aiClose: "Close", aiPillBusy: "The AI is thinking", aiPillDone: "The AI has answered",
  aiLblReport: "Editor's report",
});

const AIS = { n: 0, t0: 0, label: "", retry: null, ok: false, fail: false, st: "", tick: 0, hideTm: 0, checkTm: 0, check: false, end: 0 };
const AI_DONE_MS = 5000, AI_FAIL_MS = 12000, AI_CHECK_MS = 60000;
const AI_MARK = Symbol.for("sd-ai-tracked");
const aiCancelled = (e) => !!e && (e.code === "cancelled" || e.name === "AbortError");
const aiClock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

function aiTrack(s) {
  if (!s || typeof s.json !== "function" || s[AI_MARK]) return s;
  const json = s.json;
  const out = { ...s, json: (p, o = {}) => {
    const { aiLabel, aiRetry, ...rest } = o; // ours only: the connection never sees them
    aiStart(aiLabel, aiRetry);
    let r;
    try { r = Promise.resolve(json.call(s, p, rest)); } catch (e) { r = Promise.reject(e); }
    r.then(() => aiEnd(true, null, aiRetry), (e) => aiEnd(false, e, aiRetry));
    return r;
  } };
  Object.defineProperty(out, AI_MARK, { value: true, enumerable: true }); // enumerable: {...s} copies keep the mark
  return out;
}
(function aiWrapCaps() {
  let cur = Promise.resolve(caps.sample).then(aiTrack);
  Object.defineProperty(caps, "sample", { configurable: true, enumerable: true, get: () => cur, set: (v) => { cur = Promise.resolve(v).then(aiTrack); } });
})();

function aiStart(label, retry) {
  if (AIS.n === 0) { AIS.t0 = Date.now(); AIS.label = ""; AIS.retry = null; AIS.ok = false; AIS.fail = false; }
  if (label) AIS.label = label;
  if (retry) AIS.retry = retry;
  AIS.n++;
  aiShow("busy");
}
function aiEnd(ok, e, retry) {
  AIS.n = Math.max(0, AIS.n - 1);
  if (ok) AIS.ok = true;
  else if (!aiCancelled(e)) { AIS.fail = true; if (retry) AIS.retry = retry; }
  if (AIS.n > 0) { aiShow("busy"); return; }
  AIS.end = Date.now();
  aiShow(AIS.fail ? "fail" : AIS.ok ? "done" : "none"); // all cancelled: the person stopped it, nothing to say
}

function aiBubble() {
  let b = $("aiBub");
  if (b) return b;
  b = document.createElement("div"); b.id = "aiBub"; b.className = "ai-bub"; b.hidden = true;
  b.setAttribute("role", "status"); b.setAttribute("aria-live", "polite");
  b.addEventListener("click", (e) => {
    const x = e.target.closest("[data-ai]");
    if (!x) return;
    if (x.dataset.ai === "close") aiHide();
    if (x.dataset.ai === "retry") { const f = AIS.retry; aiHide(); if (f) f(); }
  });
  document.body.appendChild(b);
  return b;
}
function aiPillMark() {
  const p = $("scorePill");
  if (!p) return;
  let m = p.querySelector(".sc-ai");
  if (!m) { m = document.createElement("span"); m.className = "sc-ai"; p.appendChild(m); }
  const busy = AIS.st === "busy";
  m.className = "sc-ai" + (busy ? " busy" : AIS.check ? " done" : "");
  m.innerHTML = busy ? `<i></i><i></i><i></i><span class="vh">${h(t("aiPillBusy"))}</span>`
    : AIS.check ? `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg><span class="vh">${h(t("aiPillDone"))}</span>` : "";
}
function aiShow(st) {
  const b = aiBubble();
  clearTimeout(AIS.hideTm); clearInterval(AIS.tick);
  if (st !== "done") { clearTimeout(AIS.checkTm); AIS.check = false; }
  AIS.st = st;
  if (st === "none") { b.hidden = true; aiPillMark(); return; }
  b.className = "ai-bub " + st;
  const el = `<span class="ai-el" aria-hidden="true" data-ai-el>${aiClock((st === "busy" ? Date.now() : AIS.end) - AIS.t0)}</span>`;
  const x = `<button type="button" class="ai-x" data-ai="close" aria-label="${h(t("aiClose"))}">×</button>`;
  if (st === "busy") {
    b.innerHTML = `<div class="ai-h"><span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>${h(AIS.n > 1 ? t("aiThinkingN")(AIS.n) : t("aiThinking"))}</b>${el}</div><p>${h(t("aiWait"))}</p>`;
    AIS.tick = setInterval(aiTick, 1000);
  } else if (st === "done") {
    b.innerHTML = `<div class="ai-h"><svg class="ai-ok" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg><b>${h(t("aiDone"))}</b>${el}${x}</div>${AIS.label ? `<p>${h(AIS.label)}</p>` : ""}`;
    AIS.check = true;
    AIS.hideTm = setTimeout(aiHide, AI_DONE_MS);
    AIS.checkTm = setTimeout(() => { AIS.check = false; aiPillMark(); }, AI_CHECK_MS);
  } else {
    b.innerHTML = `<div class="ai-h"><b>${h(t("aiFail"))}</b>${el}${x}</div><p>${h(t("aiFailSub"))}</p>${AIS.retry ? `<div class="actions"><button type="button" class="small primary" data-ai="retry">${h(t("aiRetry"))}</button></div>` : ""}`;
    AIS.hideTm = setTimeout(aiHide, AI_FAIL_MS);
  }
  b.hidden = false;
  aiPillMark(); aiPlace();
}
function aiHide() {
  clearTimeout(AIS.hideTm); clearInterval(AIS.tick);
  const b = $("aiBub");
  if (b) b.hidden = true;
  if (AIS.st !== "busy") AIS.st = "";
  aiPillMark();
}
function aiTick() {
  const s = aiClock(Date.now() - AIS.t0);
  document.querySelectorAll("[data-ai-el]").forEach((e) => { e.textContent = s; }); // the bubble and the report panel's own line
  aiPlace();
}
// Next to the score pill: below it when the pill is in the top half (docked on desktop), above it when it floats at the bottom
// (phone, full mode). The tail points at the pill's centre. With no pill on screen the bubble sits where the floating pill would.
function aiPlace() {
  const b = $("aiBub");
  if (!b || b.hidden) return;
  const p = $("scorePill"), vw = window.innerWidth, vh = window.innerHeight, phone = vw < 600;
  const r = p && !p.hidden && p.getClientRects().length ? p.getBoundingClientRect() : null; // not offsetParent: it is null for the fixed (floating) pill
  const W = phone ? vw - 32 : Math.min(320, vw - 32);
  const right = phone ? 16 : r ? Math.max(16, vw - r.right) : 12;
  const below = !!r && r.top < vh / 2;
  b.style.width = W + "px"; b.style.right = right + "px"; b.style.left = "auto";
  if (below) { b.style.top = Math.round(r.bottom + 12) + "px"; b.style.bottom = "auto"; }
  else { b.style.bottom = Math.round(r ? vh - r.top + 12 : 140) + "px"; b.style.top = "auto"; }
  b.dataset.tail = below ? "up" : "down";
  const tail = r ? Math.min(W - 28, Math.max(14, vw - right - (r.left + r.width / 2) - 7)) : 40; // px from the bubble's right edge
  b.style.setProperty("--ai-tail", Math.round(tail) + "px");
}
window.addEventListener("resize", aiPlace);
window.addEventListener("scroll", aiPlace, { passive: true, capture: true });
