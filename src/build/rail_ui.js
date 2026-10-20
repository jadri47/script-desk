/* ===== Riel de tiempo + minimapa dentro del guion (reemplaza la tarjeta de línea de tiempo y el "Guion marcado") ===== */
// After "Revisar guion" the script box carries everything that used to live in two other places:
//  - a rail on the left with the minute of each paragraph, the timeline shapes (risk, promise, call to action, verse) on the line where
//    they happen and small notes for the speaker/editor (hook, intro, ask, re-hook, B-roll, ad break);
//  - a minimap above the text: the whole episode in one row, a window that follows the scroll, tap or drag to jump.
// The editor's DOM is not touched: the rail is an overlay laid over the box's left padding and positioned from the paragraphs' rectangles.
Object.assign(T.es, {
  rlCues: "Para el editor", rlRefs: "Citas", rlBar: (n) => `Seleccionar el párrafo ${n} para editarlo`, rlMini: "Mapa del episodio: toca o arrastra para ir a ese punto", rlGoPara: "Revisar este párrafo",
  rlClose: "Cerrar", rlRisk: "Palabra de riesgo", rlPromise: "Promesa", rlCta: "Pedido al oyente", rlRef: "Cita bíblica", rlMore: (n) => `+${n} más`,
});
Object.assign(T.en, {
  rlCues: "For the editor", rlRefs: "Verses", rlBar: (n) => `Select paragraph ${n} to edit it`, rlMini: "Episode map: tap or drag to jump to that point", rlGoPara: "Review this paragraph",
  rlClose: "Close", rlRisk: "Risky word", rlPromise: "Promise", rlCta: "Call to action", rlRef: "Bible reference", rlMore: (n) => `+${n} more`,
});
const MK_SVG = {
    risk: (c) => `<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 3 L20 19 H2 Z" fill="${c}" stroke="var(--sheet)" stroke-width="2" stroke-linejoin="round"/><rect x="10" y="9" width="2" height="5" rx="1" fill="#fff"/><circle cx="11" cy="16.2" r="1.1" fill="#fff"/></svg>`,
    promise: (c) => `<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M6 3 V20" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="M6 4 H18 L14.5 8.5 L18 13 H6 Z" fill="${c}" stroke="var(--sheet)" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    cta: (c) => `<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="3.5" y="3.5" width="15" height="15" rx="3" fill="${c}" stroke="var(--sheet)" stroke-width="2"/><path d="M8 11 H14 M11.5 8 L14.5 11 L11.5 14" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ref: (c) => `<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 2.5 L19.5 11 L11 19.5 L2.5 11 Z" fill="${c}" stroke="var(--sheet)" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };

const RL = { on: false, items: [], byBlock: [], rows: [], layer: null, mini: null, pop: null, raf: 0, bt: [], T: 1, popB: -1 };
const rlPhone = () => !SPLIT.on;
function rlPref(key, def) { try { const v = localStorage.getItem(key); return v === null ? def : v === "1"; } catch (e) { return def; } }
function rlSet(key, v) { try { localStorage.setItem(key, v ? "1" : "0"); } catch (e) {} }
const rlCuesOn = () => rlPref("sd-rail-cues", !rlPhone());
const rlRefsOn = () => rlPref("sd-rail-refs", true);

function railOk() {
  return !!(V.guided && V.step === 2 && ED.el && WK.ok && state.result && WK.R === state.result && document.querySelector(".topfix.walk"));
}
function railClear() {
  RL.on = false; RL.popB = -1; RL.bars = null;
  if (RL.layer) { RL.layer.remove(); RL.layer = null; }
  if (RL.mini) { RL.mini.remove(); RL.mini = null; }
  if (RL.pop) { RL.pop.remove(); RL.pop = null; }
  if (ED.wrap) { ED.wrap.classList.remove("rail-on", "rail-phone"); ED.wrap.style.removeProperty("--gw"); }
}
const rlCueLabel = (it) => t("em" + it.cue[0].toUpperCase() + it.cue.slice(1)) + (it.warn ? " !" : "");
const rlShapeTitle = (it) => it.shape === "risk" ? t("rlRisk") + ": «" + it.text + "»" : it.shape === "ref" ? it.text : it.shape === "promise" ? t("rlPromise") : t("rlCta");

function railBuild() {
  const R = state.result, text = state.text;
  const ems = typeof editMarks === "function" ? editMarks(R, text) : [];
  RL.items = railItems(R, ems);
  RL.T = Math.max(1, R.runtimeSec);
  RL.byBlock = WK.blocks.map(() => []);
  for (const it of RL.items) RL.byBlock[wkBlockAt(WK.blocks, it.pos)].push(it);
  RL.bt = WK.blocks.map((b) => R.timeAt(b.s));
}
function railMiniHTML() {
  const phone = rlPhone(), refs = rlRefsOn();
  const sh = RL.items.filter((x) => x.shape && (refs || x.shape !== "ref"));
  const xs = sh.map((x) => x.t / RL.T), lv = railCrowd(xs);
  const mk = sh.map((x, i) => `<button type="button" class="mk mk-${x.shape}" style="left:${(Math.min(1, xs[i]) * 100).toFixed(2)}%;top:calc(50% + ${[0, -6, 6][lv[i]]}px)" data-mk="${x.shape}" data-pos="${x.pos}" title="${h(rlShapeTitle(x) + " · " + fmtTime(x.t))}" aria-label="${h(rlShapeTitle(x) + " · " + fmtTime(x.t))}">${MK_SVG[x.shape](`var(--m-${x.shape})`)}</button>`).join("");
  const ticks = []; for (let x = 240; x < RL.T; x += 240) ticks.push(x);
  const tk = ticks.map((x) => `<i class="rl-tick" style="left:${((x / RL.T) * 100).toFixed(2)}%"></i>`).join("");
  const ax = phone ? "" : `<div class="rl-ax"><span>0:00</span>${ticks.length ? `<span style="left:${((ticks[Math.floor(ticks.length / 2)] / RL.T) * 100).toFixed(1)}%">${fmtTime(ticks[Math.floor(ticks.length / 2)])}</span>` : ""}<span class="end">${fmtTime(RL.T)}</span></div>`;
  return `<div class="rl-lane" role="slider" aria-label="${h(t("rlMini"))}" aria-valuemin="0" aria-valuemax="${Math.round(RL.T)}" aria-valuenow="0" tabindex="0">${tk}${mk}<span class="rl-win"></span></div>${ax}`;
}
function railMake() {
  railClear();
  const wrap = ED.wrap;
  RL.mini = document.createElement("div");
  RL.mini.className = "rl-mini"; RL.mini.title = t("rlMini");
  RL.mini.innerHTML = railMiniHTML();
  ED.el.insertAdjacentElement("beforebegin", RL.mini);
  RL.layer = document.createElement("div");
  RL.layer.className = "rl-layer";
  wrap.appendChild(RL.layer);
  RL.pop = document.createElement("div");
  RL.pop.className = "rl-pop hidden"; RL.pop.setAttribute("role", "dialog");
  wrap.appendChild(RL.pop);
  wrap.classList.add("rail-on"); wrap.classList.toggle("rail-phone", rlPhone());
  wrap.style.setProperty("--gw", (rlPhone() ? 46 : 104) + "px");
  // one row per paragraph
  const cues = rlCuesOn(), phone = rlPhone(), refs = rlRefsOn();
  RL.rows = WK.blocks.map((b, i) => {
    const its = RL.byBlock[i], row = document.createElement("div");
    row.className = "rl-row"; row.dataset.b = i;
    const sh = its.filter((x) => x.shape && (refs || x.shape !== "ref")), cu = cues ? its.filter((x) => x.cue) : [];
    if (!sh.length && !cu.length && phone) { row.classList.add("empty"); }
    const shown = sh.slice(0, 3), more = sh.length - shown.length;
    row.innerHTML = `<span class="rl-tm">${fmtTime(RL.bt[i])}</span>` +
      (shown.length || more > 0 ? `<span class="rl-sh">${shown.map((x) => `<button type="button" class="g" data-b="${i}" title="${h(rlShapeTitle(x))}" aria-label="${h(rlShapeTitle(x))}">${MK_SVG[x.shape](`var(--m-${x.shape})`)}</button>`).join("")}${more > 0 ? `<button type="button" class="rl-more" data-b="${i}">${h(t("rlMore")(more))}</button>` : ""}</span>` : "") +
      cu.map((x) => `<button type="button" class="rl-cue c-${x.cue}${x.warn ? " warn" : ""}" data-b="${i}" title="${h(x.label)}" aria-label="${h(x.label)}">${phone ? RAIL_LETTER[x.cue] : h(rlCueLabel(x))}</button>`).join("");
    RL.layer.appendChild(row);
    return row;
  });
  // a vertical bar beside every paragraph: one tap selects it for editing
  RL.bars = WK.blocks.map((b, i) => {
    const bar = document.createElement("button");
    bar.type = "button"; bar.className = "rl-bar"; bar.dataset.b = i;
    bar.title = bar.ariaLabel = t("rlBar")(i + 1);
    bar.addEventListener("click", (e) => { e.preventDefault(); railSelect(i); });
    RL.layer.appendChild(bar);
    return bar;
  });
  railMarkActive();
  RL.on = true;
}
function railMarkActive() {
  if (!RL.bars) return;
  RL.bars.forEach((b, i) => { b.classList.toggle("on", i === WK.i); b.className = b.className.replace(/ sev-\w+/, "") + " sev-" + (typeof wkSev === "function" ? wkSev(i) : "ok"); });
}
// tap on a bar: that paragraph becomes the one under review and the caret goes to its start
function railSelect(i) {
  const b = WK.blocks[i];
  if (!b) return;
  wkGo(i, false);
  try {
    const m = WK.map.find((x) => b.el.contains(x.n));
    if (m) { const r = document.createRange(); r.setStart(m.n, 0); r.collapse(true); ED.el.focus({ preventScroll: true }); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  } catch (e) {}
}
function railLayout() {
  if (!RL.on || !RL.layer || !ED.el) return;
  const ed = ED.el, er = ed.getBoundingClientRect(), wr = ED.wrap.getBoundingClientRect();
  Object.assign(RL.layer.style, { top: er.top - wr.top + "px", height: ed.clientHeight + "px" });
  const H = ed.clientHeight;
  WK.blocks.forEach((b, i) => {
    const row = RL.rows[i];
    if (!row) return;
    const br = b.el.getBoundingClientRect(), y = br.top - er.top, bh = br.height;
    // a paragraph taller than the screen keeps its row pinned to the top until the paragraph ends
    const vis = br.bottom - er.top > 4 && y < H;
    row.style.display = vis ? "" : "none";
    const bar = RL.bars && RL.bars[i];
    if (bar) { bar.style.display = vis ? "" : "none"; bar.style.transform = `translateY(${Math.round(y)}px)`; bar.style.height = Math.max(8, Math.round(bh) - 2) + "px"; }
    if (vis) {
      const rh = row.offsetHeight || 24;
      const ty = y + 2 >= 0 ? y + 2 : Math.min(0, y + bh - rh);
      row.style.transform = `translateY(${Math.round(ty)}px)`;
    }
  });
  // the window of the minimap = what is on screen now
  const lane = RL.mini && RL.mini.querySelector(".rl-lane"), win = lane && lane.querySelector(".rl-win");
  if (win) {
    let a = -1, z = -1;
    WK.blocks.forEach((b, i) => { const r = b.el.getBoundingClientRect(); if (r.bottom > er.top + 4 && r.top < er.bottom - 4) { if (a < 0) a = i; z = i; } });
    if (a >= 0) {
      const t0 = RL.bt[a], t1 = z + 1 < RL.bt.length ? RL.bt[z + 1] : RL.T;
      win.style.left = ((t0 / RL.T) * 100).toFixed(2) + "%";
      win.style.width = Math.max(1.5, ((t1 - t0) / RL.T) * 100).toFixed(2) + "%";
      lane.setAttribute("aria-valuenow", Math.round(t0));
    }
  }
  if (RL.popB >= 0) railPopPlace();
}
function railSched() { if (RL.raf) return; RL.raf = requestAnimationFrame(() => { RL.raf = 0; railLayout(); }); }
function railUpdate() {
  if (!railOk()) { railClear(); return; }
  try { railBuild(); railMake(); railLayout(); } catch (e) { railClear(); }
}

// popover with the notes of one paragraph
function railPopPlace() {
  const row = RL.rows[RL.popB], pop = RL.pop;
  if (!row || row.style.display === "none") { railPopClose(); return; }
  const wr = ED.wrap.getBoundingClientRect(), er = ED.el.getBoundingClientRect(), rr = row.getBoundingClientRect();
  const w = Math.min(320, wr.width - 16);
  pop.style.width = w + "px";
  pop.style.left = Math.max(8, Math.min(wr.width - w - 8, rr.left - wr.left + 8)) + "px";
  const below = rr.bottom - wr.top + 6, ph = pop.offsetHeight;
  pop.style.top = (below + ph > wr.height - 4 ? Math.max(er.top - wr.top + 4, rr.top - wr.top - ph - 6) : below) + "px";
}
function railPopOpen(bi) {
  const its = RL.byBlock[bi].filter((x) => (x.shape ? rlRefsOn() || x.shape !== "ref" : rlCuesOn()));
  if (!its.length) return;
  RL.popB = bi;
  const line = (x) => x.shape
    ? `<div class="rl-pl"><span class="g">${MK_SVG[x.shape](`var(--m-${x.shape})`)}</span><div><b>${h(rlShapeTitle(x))}</b> <span class="hint">${h(fmtTime(x.t))}</span>${x.tip ? `<div class="hint">${h(x.tip)}</div>` : ""}</div></div>`
    : `<div class="rl-pl"><span class="rl-cue c-${x.cue}${x.warn ? " warn" : ""}">${h(rlCueLabel(x))}</span><div><span class="hint">${h(fmtTime(x.t))}</span><div class="hint">${h(x.tip || "")}</div></div></div>`;
  const hasCards = WK.list.includes(bi);
  RL.pop.innerHTML = `<button type="button" class="rl-x" aria-label="${h(t("rlClose"))}">×</button>${its.map(line).join("")}${hasCards ? `<button type="button" class="small primary" data-rlgo="${bi}">${h(t("rlGoPara"))}</button>` : ""}`;
  RL.pop.classList.remove("hidden");
  railPopPlace();
}
function railPopClose() { RL.popB = -1; if (RL.pop) RL.pop.classList.add("hidden"); }

// seek: a fraction of the episode -> scroll the box to the paragraph at that minute
function railSeek(frac) {
  if (!RL.on) return;
  const tt = Math.max(0, Math.min(1, frac)) * RL.T;
  let bi = 0;
  RL.bt.forEach((x, i) => { if (x <= tt) bi = i; });
  const b = WK.blocks[bi];
  if (!b) return;
  const top = ED.el.scrollTop + b.el.getBoundingClientRect().top - ED.el.getBoundingClientRect().top - 10;
  ED.el.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}
document.addEventListener("pointerdown", (e) => {
  const lane = e.target.closest && e.target.closest(".rl-lane");
  if (!lane || e.target.closest(".mk")) return;
  const at = (ev) => { const r = lane.getBoundingClientRect(); railSeek((ev.clientX - r.left) / r.width); };
  at(e);
  const mv = (ev) => at(ev), up = () => { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); };
  document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  e.preventDefault();
});
document.addEventListener("keydown", (e) => {
  const lane = e.target.closest && e.target.closest(".rl-lane");
  if (!lane || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  railSeek((+lane.getAttribute("aria-valuenow") + (e.key === "ArrowRight" ? 1 : -1) * 60) / RL.T);
});
document.addEventListener("click", (e) => {
  const tg = e.target.closest && e.target.closest(".rl-row .g, .rl-row .rl-cue, .rl-row .rl-more");
  if (tg) { const bi = +tg.dataset.b; if (RL.popB === bi) railPopClose(); else railPopOpen(bi); return; }
  const go = e.target.closest && e.target.closest("[data-rlgo]");
  if (go) { const bi = +go.dataset.rlgo; railPopClose(); wkGo(bi); return; }
  if (e.target.closest && e.target.closest(".rl-x")) { railPopClose(); return; }
  if (RL.popB >= 0 && !(e.target.closest && e.target.closest(".rl-pop"))) railPopClose();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") railPopClose(); });

// legend chips: verses and editor notes
function railChipsHTML() {
  const refs = rlRefsOn(), cues = rlCuesOn();
  return `<button type="button" class="cat-chip${refs ? "" : " off"}" data-rail="refs" aria-pressed="${refs}"><i class="cat-sw cat-ref" aria-hidden="true">${MK_SVG.ref("var(--m-ref)")}</i><span>${h(t("rlRefs"))}</span></button>` +
    `<button type="button" class="cat-chip${cues ? "" : " off"}" data-rail="cues" aria-pressed="${cues}"><i class="cat-sw cat-cue" aria-hidden="true"><b>H</b></i><span>${h(t("rlCues"))}</span></button>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".cat-chip[data-rail]");
  if (!b) return;
  const k = b.dataset.rail;
  if (k === "refs") rlSet("sd-rail-refs", !rlRefsOn()); else rlSet("sd-rail-cues", !rlCuesOn());
  document.querySelectorAll(`.cat-chip[data-rail="${k}"]`).forEach((c) => { const on = k === "refs" ? rlRefsOn() : rlCuesOn(); c.classList.toggle("off", !on); c.setAttribute("aria-pressed", on); });
  railUpdate();
  if (typeof wkPaint === "function" && document.querySelector(".topfix.walk")) wkPaint(false);
});
// verses: soft gold background on the quoted words (word-level highlight, same API as the colors)
function railPaintQuotes(hl) {
  if (!hl || !rlRefsOn() || !state.result) return;
  const rs = [];
  for (const q of state.result.quoteSpans || []) { const r = wkRange(q.start, q.end); if (r) rs.push(r); }
  if (rs.length) { const x = new Highlight(...rs); x.priority = 0; hl.set("sd-quote", x); }
}

if (ED.el) ED.el.addEventListener("scroll", railSched, { passive: true });
window.addEventListener("resize", () => { if (RL.on) { if (rlPhone() !== ED.wrap.classList.contains("rail-phone")) railUpdate(); else railSched(); } });
if (typeof ResizeObserver === "function" && ED.el) new ResizeObserver(railSched).observe(ED.el);
