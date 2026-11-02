/* ===== Marks in the text (7A; Adrian, 2026-11-01: "every item in the text to be marked ... make a mockup", then "apply A") ===== */
// One overlay over the editor (the editor DOM is never changed, like the rail and the section boxes): in the left margin the
// paragraph number and its minute, the ad breaks, re-hook points, chapters, calls to action and on-screen text cues; on the text,
// an outline around each Bible reference and call to action, a bar beside each quote; through the Highlight API (text only) the
// quote background, a double underline on ad-risk words and a wavy one on fillers. A legend in the review panel switches each
// group; the choice is remembered per screen (localStorage `sd-marks`); what shows on entry is the mockup's table (marks_logic.js).
// Desktop only (the margin needs the width; the phone is a nice-to-have, Adrian 2026-11-01); only with the 4-step flow on
// (`secBarOn`), so `sd-secs-off=1` keeps the older suites on the screens they test.
Object.assign(T.es, {
  mkLeg: "Leyenda", mkLegCap: "Toca un grupo para ocultarlo o mostrarlo. La app recuerda tu elección.",
  mkG: { secs: "Secciones principales", para: "Números y minutos", quote: "Citas bíblicas", ref: "Referencias", ad: "Pausas para anuncios", rehook: "Puntos de enganche", chap: "Capítulos", cta: "Llamadas a la acción", cue: "Textos en pantalla", risk: "Riesgo de anuncios", fill: "Muletillas" },
  mkAd: "Anuncio", mkRehook: "Enganche", mkGap: "falta", mkChap: (n) => `Capítulo ${n}`, mkCta: "CTA", mkPara: (n, m) => `Párrafo ${n}, minuto ${m}`,
  mkAdT: (m) => `Pausa para anuncio sugerida hacia ${m}: termina una idea y no cae en un versículo.`,
  mkRehookT: (m, gap) => `Punto de enganche hacia ${m}${gap ? ": aquí no hay nada que tire hacia adelante" : ""}.`,
  mkShown: "visible", mkHidden: "oculto",
});
Object.assign(T.en, {
  mkLeg: "Legend", mkLegCap: "Tap a group to hide or show it. The app remembers your choice.",
  mkG: { secs: "Main sections", para: "Numbers and minutes", quote: "Bible quotes", ref: "References", ad: "Ad breaks", rehook: "Re-hook points", chap: "Chapters", cta: "Calls to action", cue: "On-screen text", risk: "Ad risk", fill: "Fillers" },
  mkAd: "Ad", mkRehook: "Re-hook", mkGap: "missing", mkChap: (n) => `Chapter ${n}`, mkCta: "CTA", mkPara: (n, m) => `Paragraph ${n}, minute ${m}`,
  mkAdT: (m) => `Suggested ad break around ${m}: an idea ends and it isn't inside a verse.`,
  mkRehookT: (m, gap) => `Re-hook point around ${m}${gap ? ": nothing here pulls the viewer forward" : ""}.`,
  mkShown: "shown", mkHidden: "hidden",
});
const MK = { layer: null, raf: 0, key: "", data: null, screen: null };
const MK_HL = ["sd-mk-quote", "sd-mk-risk", "sd-mk-fill"];
function mkChoices() { try { return markChoicesClean(JSON.parse(localStorage.getItem("sd-marks") || "{}")); } catch (e) { /* best effort: unreadable or blocked storage: the table's defaults */ return {}; } }
function mkSave(c) { try { localStorage.setItem("sd-marks", JSON.stringify(c)); } catch (e) { /* best effort: blocked storage: the switch works until reload */ } }
function mkScreen() {
  if (!V.guided || (typeof secBarOn === "function" && !secBarOn())) return null;
  if (V.step === 1) return "write";
  if (V.step === 3) return "pub";
  if (V.step === 2) return typeof secScreenOn === "function" && secScreenOn() ? "secs" : "detail";
  return null;
}
const mkOn = (g) => !!MK.screen && markOn(g, MK.screen, mkChoices());
// the text under review is the text in the box (typing removes the marks until the next review, like the rail)
function mkReady() {
  return !!(SPLIT.on && ED.el && ED.wrap && state.result && state.text === $("script").value && !(typeof RL !== "undefined" && RL.on) && mkScreen() && typeof wkBuild === "function" && wkBuild());
}
function mkLocked() { return MK.screen === "detail" && typeof secLockedRanges === "function" ? secLockedRanges() : []; }
function mkData() {
  const text = state.text, R = state.result, locked = mkLocked();
  const key = text.length + "|" + MK.screen + "|" + JSON.stringify(locked) + "|" + WK.blocks.length;
  if (MK.data && MK.key === key && MK.R === R && MK.text === text) return MK.data;
  let ads = [], chaps = [], rehooks = [];
  try { ads = (typeof editMarks === "function" ? editMarks(R, text) : []).filter((e) => e.kind === "ad"); } catch (e) { /* marks are optional: no ad breaks drawn */ }
  try {
    if (!G.R || G.text !== text) gCompute();
    chaps = (G.secs || []).map((s) => ({ pos: G.U[s.first] ? G.U[s.first].start : null, label: typeof chapterLabel === "function" ? chapterLabel(s) : "" }));
  } catch (e) { /* marks are optional: no chapters drawn */ }
  try { rehooks = typeof rehookPoints === "function" ? rehookPoints(text, R, mainSections(text, R, G.secBounds).list) : []; } catch (e) { /* marks are optional: no re-hooks drawn */ }
  MK.data = marksOutside(marksOf(text, R, { blocks: WK.blocks.map((b) => ({ s: b.s, e: b.e })), ads, chaps, rehooks }), locked);
  MK.key = key; MK.R = R; MK.text = text;
  return MK.data;
}
function mkClear() {
  if (MK.layer) MK.layer.innerHTML = "";
  document.documentElement.classList.remove("mk-on");
  for (const g of MARK_GROUPS) document.documentElement.classList.remove("mk-off-" + g);
  const hl = typeof wkHL === "function" ? wkHL() : null;
  if (hl) MK_HL.forEach((n) => hl.delete(n));
  document.querySelectorAll(".mk-leg").forEach((x) => x.remove());
}
// text-only marks: one Highlight per group over the whole script (cheap; redrawn when the text or a switch changes)
function mkPaint(d) {
  const hl = typeof wkHL === "function" ? wkHL() : null;
  if (!hl) return;
  MK_HL.forEach((n) => hl.delete(n));
  const put = (name, list, pri) => { const rs = []; for (const x of list) { const r = wkRange(x.start, x.end); if (r) rs.push(r); } if (rs.length) { const H = new Highlight(...rs); H.priority = pri; hl.set(name, H); } };
  if (mkOn("quote")) put("sd-mk-quote", d.quote, 0);
  if (mkOn("risk")) put("sd-mk-risk", d.risk, 3);
  if (mkOn("fill")) put("sd-mk-fill", d.fill, 2);
}
const MK_SHAPE = { ad: "◆", rehook: "●", chap: "■" };
function mkLayout() {
  const d = MK.data;
  if (!d || !MK.layer) return;
  const wr = ED.wrap.getBoundingClientRect(), er = ED.el.getBoundingClientRect(), cs = getComputedStyle(ED.el);
  const textL = er.left + parseFloat(cs.paddingLeft), textR = er.right - parseFloat(cs.paddingRight);
  const X = (x) => Math.round(x - wr.left), Y = (y) => Math.round(y - wr.top);
  const vis = (y) => y >= er.top - 4 && y <= er.bottom - 8;
  const out = [], tags = [];
  const rectsOf = (a, b) => { const r = wkRange(a, b); return r ? [...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0) : []; };
  const topOf = (p) => { const rs = rectsOf(p, p + 1); return rs.length ? rs[0].top : null; };
  // in the text: outlines (references, calls to action), bars (quotes), lines (ad breaks, re-hooks, chapters)
  const box = (g, a, b, title) => { for (const r of rectsOf(a, b)) if (vis(r.top)) out.push(`<span class="mk-box mk-${g}" style="left:${X(r.left) - 2}px;top:${Y(r.top) - 1}px;width:${Math.round(r.width) + 4}px;height:${Math.round(r.height) + 2}px" title="${h(title)}"></span>`); };
  if (mkOn("ref")) for (const x of d.ref) box("ref", x.start, x.end, x.label);
  if (mkOn("cta")) for (const x of d.cta) { box("cta", x.start, x.end, t("mkG").cta); const y = topOf(x.start); if (y !== null && vis(y)) tags.push({ y, g: "cta", html: h(t("mkCta")) + ` <small>${h(fmtTime(x.t))}</small>`, title: t("mkG").cta + " · " + x.label }); }
  if (mkOn("quote")) for (const x of d.quote) {
    const rs = rectsOf(x.start, x.end); if (!rs.length) continue;
    const a = Math.max(rs[0].top, er.top), z = Math.min(rs[rs.length - 1].bottom, er.bottom);
    if (z > a) out.push(`<span class="mk-qbar" style="left:${X(textL) - 9}px;top:${Y(a)}px;height:${Math.round(z - a)}px"></span>`);
  }
  if (mkOn("cue")) for (const x of d.cue) { const y = topOf(x.start); if (y !== null && vis(y)) tags.push({ y, g: "cue", html: h(x.label), title: t("mkG").cue }); }
  for (const g of ["chap", "ad", "rehook"]) {
    if (!mkOn(g)) continue;
    for (const x of d[g]) {
      const y = topOf(x.pos); if (y === null || !vis(y)) continue;
      const m = fmtTime(x.t), name = g === "ad" ? t("mkAd") : g === "rehook" ? t("mkRehook") + (x.gap ? " · " + t("mkGap") : "") : t("mkChap")(x.n);
      const title = g === "ad" ? t("mkAdT")(m) : g === "rehook" ? t("mkRehookT")(m, x.gap) : t("mkChap")(x.n) + " · " + x.label;
      out.push(`<span class="mk-line mk-${g}${x.gap ? " gap" : ""}" style="left:${X(textL) - 4}px;top:${Y(y) - 4}px;width:${Math.round(textR - textL) + 8}px" title="${h(title)}"></span>`);
      tags.push({ y, g, html: `<i aria-hidden="true">${MK_SHAPE[g]}</i> ${h(name)} <small>${h(m)}</small>`, title });
    }
  }
  // paragraph numbers first in the margin; the other margin tags stack under them
  if (mkOn("para")) for (const p of d.para) { const b = WK.blocks.find((x) => x.s === p.pos); if (!b) continue; const y = b.el.getBoundingClientRect().top; if (vis(y)) tags.push({ y, g: "para", html: `<b>¶${p.n}</b> ${h(fmtTime(p.t))}`, title: t("mkPara")(p.n, fmtTime(p.t)), first: true }); }
  // the margin is shared with the section labels: a tag never sits on one of them nor on another tag
  const taken = [...ED.wrap.querySelectorAll(".sx-lbl, .sx-lock-l")].map((e) => e.getBoundingClientRect()).filter((r) => r.height > 0).map((r) => [r.top - 2, r.bottom + 2]);
  tags.sort((a, b) => a.y - b.y || (a.first ? -1 : b.first ? 1 : 0));
  let free = -1e9;
  const H = 20;
  for (const tg of tags) {
    let y = Math.max(tg.y, free);
    for (let k = 0; k < 8; k++) { const hit = taken.find(([a, z]) => y < z && y + H > a); if (!hit) break; y = hit[1]; }
    if (y + H > er.bottom) continue;
    free = y + H + 2;
    out.push(`<span class="mk-tag mk-t-${tg.g}" style="left:${X(er.left) + 8}px;top:${Y(y)}px" title="${h(tg.title)}">${tg.html}</span>`);
  }
  MK.layer.innerHTML = out.join("");
}
function mkLegendHTML() {
  const d = MK.data, sec = typeof secNow === "function" ? secNow().list.length : 0;
  const count = (g) => g === "secs" ? sec : (d[g] || []).length;
  const groups = MARK_GROUPS.filter((g) => g !== "secs" || (MK.screen === "secs" || MK.screen === "detail"));
  const chips = groups.map((g) => { const on = mkOn(g); return `<button type="button" class="mk-chip mk-c-${g}${on ? "" : " off"}" data-mk-g="${g}" aria-pressed="${on}"><span class="mk-sw" aria-hidden="true"></span>${h(t("mkG")[g])} <span class="n">${count(g)}</span><span class="vh"> · ${h(on ? t("mkShown") : t("mkHidden"))}</span></button>`; }).join("");
  return `<section class="mk-leg" aria-labelledby="mkLegH"><h3 id="mkLegH">${h(t("mkLeg"))}</h3><p class="hint">${h(t("mkLegCap"))}</p><div class="mk-chips">${chips}</div></section>`;
}
function mkLegend() {
  const g = $("guide");
  document.querySelectorAll(".mk-leg").forEach((x) => x.remove());
  if (!g) return;
  const host = g.querySelector(".g-nav-steps") || null;
  const div = document.createElement("div"); div.innerHTML = mkLegendHTML();
  const el = div.firstElementChild;
  if (host && host.parentNode) host.parentNode.insertBefore(el, host); else g.appendChild(el);
}
function mkUpdate() {
  MK.screen = mkScreen();
  if (!mkReady()) { mkClear(); return; }
  try {
    const d = mkData();
    if (!MK.layer || !MK.layer.isConnected) { MK.layer = document.createElement("div"); MK.layer.className = "mk-layer"; MK.layer.setAttribute("aria-hidden", "true"); ED.wrap.appendChild(MK.layer); }
    document.documentElement.classList.add("mk-on"); // the editor gets the left margin (guide.css), shared with the section labels
    for (const g of MARK_GROUPS) document.documentElement.classList.toggle("mk-off-" + g, !mkOn(g));
    mkPaint(d);
    mkLayout();
    if (!document.querySelector(".mk-leg")) mkLegend();
  } catch (e) { /* (2026-11-01) an overlay: if it cannot be laid out, show none rather than a broken one */ mkClear(); }
}
function mkSched() { if (MK.raf) return; MK.raf = requestAnimationFrame(() => { MK.raf = 0; mkUpdate(); }); }
// after the section boxes (their labels take the margin first): renderGuide → secBoxesSched → this
const _renderGuideMk = renderGuide;
renderGuide = function () { _renderGuideMk.apply(this, arguments); document.querySelectorAll(".mk-leg").forEach((x) => x.remove()); mkSched(); };
document.addEventListener("scroll", () => { if (MK.layer && MK.layer.innerHTML) { if (MK.raf) return; MK.raf = requestAnimationFrame(() => { MK.raf = 0; if (mkReady()) mkLayout(); else mkClear(); }); } }, true);
window.addEventListener("resize", mkSched);
// a keystroke moves every position after it: the marks leave at once and come back with the next review (renderGuide)
if (ED.el) ED.el.addEventListener("input", () => { MK.data = null; mkClear(); });
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-mk-g]");
  if (!b || !MK.screen) return;
  const g = b.dataset.mkG, c = mkChoices();
  (c[MK.screen] = c[MK.screen] || {})[g] = !markOn(g, MK.screen, c);
  mkSave(c);
  document.querySelectorAll(".mk-leg").forEach((x) => x.remove());
  mkUpdate();
  const nb = document.querySelector(`[data-mk-g="${g}"]`); if (nb) nb.focus({ preventScroll: true });
});
