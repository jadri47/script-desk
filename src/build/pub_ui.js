
/* ===== Step 3 «Publicar» as a walk (2026-10-26, plan "Walk Juan through it", step 4) =====
   One card at a time: 1 Título · 2 Miniatura · 3 Descripción · 4 Próximo episodio · 5 Apertura · 6 Todo listo (checklist + Aprobar),
   then, once approved, the «Grabar» screen. Every card is the card that already existed (renderPack / renderTopic / renderCold /
   recordCardHTML pieces / setStatus); the walk only decides which one is visible and adds the navigation.
   The index lives in memory (PB); the default is derived from the data: first card whose item is empty, else «Todo listo»;
   approved or recorded episodes open on «Grabar». No browser-history handling: the step bar and «‹ Anterior» are the way back. */
Object.assign(T.es, {
  pubProg: (i, n) => `Paso 3 de 3 · Publicar · ${i} de ${n}`, pubRecStep: "Paso 3 de 3 · Grabar",
  pubH: ["Elige el título", "Texto de la miniatura", "Descripción y capítulos", "Próximo episodio", "Cómo empieza el video", "Todo listo para grabar"],
  pubItems: ["Título", "Miniatura", "Descripción", "Próximo episodio", "Apertura"], pubNone: "Sin hacer",
  pubSave: "Guardar y seguir", pubChange: "Cambiar", pubChangeL: (x) => `Cambiar: ${x}`, pubDone: "Listo", pubPend: "Pendiente",
  pubFinal: "Nota final", pubFrom: (a) => `empezaste en ${a}`, pubChaps: (n) => `con ${n} ${n === 1 ? "capítulo" : "capítulos"}`,
  pubAds: { rojo: "Anuncios: hay algo que puede quitarlos", amarillo: "Anuncios: algo puede limitarlos", verde: "Anuncios: sin riesgos" },
  pubReady: "Tu guion está listo para YouTube", pubNote: (n) => `nota ${n}`,
  pubPP: "Abrir el prompter", pubPPs: "Lee mientras grabas, a tu ritmo", pubReh: "Ensayar con cronómetro", pubEst: (d) => `${d} estimado`,
  pubDl: "Descargar guion para grabar", pubDls: "Con capítulos y pausas para anuncios · hoja para el editor", pubAfterHint: "(Shorts, resultados)",
});
Object.assign(T.en, {
  pubProg: (i, n) => `Step 3 of 3 · Publish · ${i} of ${n}`, pubRecStep: "Step 3 of 3 · Record",
  pubH: ["Choose the title", "Thumbnail text", "Description and chapters", "Next episode", "How the video opens", "All set to record"],
  pubItems: ["Title", "Thumbnail", "Description", "Next episode", "Opening"], pubNone: "Not done yet",
  pubSave: "Save and continue", pubChange: "Change", pubChangeL: (x) => `Change: ${x}`, pubDone: "Done", pubPend: "Pending",
  pubFinal: "Final score", pubFrom: (a) => `you started at ${a}`, pubChaps: (n) => `with ${n} ${n === 1 ? "chapter" : "chapters"}`,
  pubAds: { rojo: "Ads: something could remove them", amarillo: "Ads: something could limit them", verde: "Ads: no risks" },
  pubReady: "Your script is ready for YouTube", pubNote: (n) => `score ${n}`,
  pubPP: "Open the prompter", pubPPs: "Read while you record, at your pace", pubReh: "Rehearse with a stopwatch", pubEst: (d) => `${d} estimated`,
  pubDl: "Download the script to record", pubDls: "With chapters and ad breaks · editor sheet", pubAfterHint: "(Shorts, results)",
});

const PB = { key: null, i: null, view: null, focus: false };
const PUB_N = 6;
function pubSync() { const k = G.prodId || "-"; if (PB.key !== k) { PB.key = k; PB.i = null; PB.view = null; } }
function pubReset() { PB.key = G.prodId || "-"; PB.i = null; PB.view = null; }
// What each of the five items holds right now (read from the same fields the cards edit).
// Which gate check (packChecks id) blocks which item. Next episode and opening have no gate check.
// The description has no required check today; "desc" is listed so a future required one lands on its card.
const PUB_GATE = { title: "title", titleLen: "title", titleRisk: "title", thumb: "thumb", thumbRisk: "thumb", desc: "desc" };
const pkReason = (c) => { const P = t("pk"); return typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]; }; // the gate line's own wording (one source)
function pubItems() {
  const title = $("title").value.trim(), thumb = $("thumb").value.trim(), desc = $("description").value.trim(), next = (G.nextEp || "").trim();
  const clips = typeof coldClips === "function" ? coldClips() : [];
  const chaps = (desc.match(/^\s*\d{1,2}:\d{2}/gm) || []).length;
  const dv = desc ? (chaps ? t("pubChaps")(chaps) : desc.length > 60 ? desc.slice(0, 60) + "…" : desc) : "";
  const cv = clips.length ? "«" + clips[0].text.slice(0, 60) + (clips[0].text.length > 60 ? "…" : "") + "»" : "";
  const miss = packGateMissing();
  // filled but blocked by the Aprobar gate = not done, and the row says why (same text as the gate line)
  const item = (key, filled, val) => { const bad = filled ? miss.filter((c) => PUB_GATE[c.id] === key) : []; return { done: filled && !bad.length, val, why: bad.map(pkReason).join("; ") }; };
  return [item("title", !!title, title), item("thumb", !!thumb, thumb), item("desc", !!desc, dv), { done: !!next, val: next }, { done: clips.length > 0, val: cv }];
}
function pubIndex() {
  pubSync();
  if (PB.i == null) { const f = pubItems().findIndex((x) => !x.done); PB.i = f < 0 ? PUB_N - 1 : f; }
  return PB.i;
}
function pubView() { pubSync(); const done = G.status === "aprobado" || G.status === "grabado"; return done && PB.view !== "card" ? "rec" : "card"; }
const pubTrack = (cur) => `<div class="pub-track" aria-hidden="true">${Array.from({ length: PUB_N }, (_, k) => `<span${k <= cur ? ' class="d"' : ""}></span>`).join("")}</div>`;

// The number «Nota final»: the same readiness the bubble and the step-2 end card show (readinessOf / rpBeforeOf), never a new recipe.
function pubScore(R) {
  const rd = readinessOf(R, G.report, state.fixDismissed, state.text), full = rd.score != null, now = full ? rd.score : rd.rules;
  const before = full ? rpBeforeOf(rd) : now;
  return { rd, full, now, from: full && rd.editorEst > 0 && before !== now ? before : null };
}
function pubCardHTML(R) {
  const i = pubIndex(), its = pubItems(), prog = `<p class="pub-prog">${h(t("pubProg")(i + 1, PUB_N))}</p>${pubTrack(i)}`;
  const prev = `<button type="button" class="small linkish" data-pub="prev"${i === 0 ? " disabled" : ""}>${h(t("coPrev"))}</button>`;
  if (i < PUB_N - 1) {
    const slot = i < 3 ? `<section class="g-card" id="gPack" data-pub-part="${["title", "thumb", "desc"][i]}"></section>` : i === 3 ? `<section class="g-card" id="gTopic"></section>` : `<section class="g-card" id="gCold"></section>`;
    return `<div class="pub pub-walk" data-pub-i="${i}"><section class="pub-card" role="region" aria-labelledby="pubH" tabindex="-1" id="pubCard">${prog}<h3 id="pubH">${h(t("pubH")[i])}</h3>
      <p class="pub-ok" id="pubOk"${its[i].done ? "" : " hidden"}><span aria-hidden="true">✓</span> <span class="vh">${h(t("pubDone"))}: </span><span id="pubOkV">${h(its[i].val)}</span></p>${slot}
      <div class="actions pub-act"><button type="button" class="primary pub-go" data-pub="next">${h(t("pubSave"))} →</button><button type="button" class="small linkish" data-pub="skip">${h(t("coSkip"))}</button></div>
      <div class="pub-nav">${prev}</div></section></div>`;
  }
  // card 6: the five items with their state, the final number, the ads reading and the approve button (gate unchanged: packGateMissing)
  const sc = pubScore(R), band = rpAdsBand(R, sc.rd), missing = packGateMissing();
  const approved = G.status === "aprobado", recorded = G.status === "grabado", done = approved || recorded;
  const names = t("pubItems");
  const num = sc.full ? `<span class="pub-lbl">${h(t("pubFinal"))}</span><b class="pub-n">${sc.now}</b>${sc.from != null ? `<span class="hint">${h(t("pubFrom")(sc.from))}</span>` : ""}` : `<span class="pub-lbl">${h(t("rpRulesName"))}</span><b class="pub-n">${sc.now}<small>/${sc.rd.rulesMax}</small></b>`;
  const rows = its.map((x, k) => `<li class="${x.done ? "ok" : "pend"}"><span class="pub-mk" aria-hidden="true">${x.done ? "✓" : "○"}</span><span class="pub-iv"><b>${h(names[k])}</b><span class="pub-v">${h(x.done ? x.val : x.why || t("pubNone"))}</span></span><button type="button" class="small linkish" data-pub-go="${k}" aria-label="${h(t("pubChangeL")(names[k]))}">${h(t("pubChange"))}</button></li>`).join("");
  const gate = missing.length ? `<span class="g-gate">${h(t("pkGate")(missing.map((c) => pkReason(c).toLowerCase()).join("; ")))}</span>` : "";
  return `<div class="pub pub-walk pub-all" data-pub-i="${i}"><section class="pub-card" role="region" aria-labelledby="pubH" tabindex="-1" id="pubCard">${prog}<h3 id="pubH">${h(t("pubH")[i])}</h3>
    <div class="g-card"><p class="pub-final">${num}</p><ul class="pub-chk" aria-label="${h(t("pubH")[i])}">${rows}</ul>
    <p class="pub-ads ${band}"><span class="lamp ${band}">${h(t("pubAds")[band])}</span></p></div>
    <div class="actions pub-act" data-pub-gate>${done ? `<span class="lamp verde">${h(t("approved"))}</span><button type="button" class="primary pub-go" data-pub="rec">${h(t("next"))} →</button>` : `<button type="button" class="primary pub-go" id="gApprove"${missing.length ? " disabled" : ""}>${h(t("approve"))}</button>${gate}`}</div>
    <div class="pub-nav">${prev}</div></section></div>`;
}
function pubRecHTML(R) {
  const sc = pubScore(R), recorded = G.status === "grabado", reh = G.rehearsals[G.rehearsals.length - 1];
  const rehTot = reh && reh.laps ? reh.laps.reduce((a, l) => a + (l.sec || 0), 0) : 0;
  const ic = (d) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${d}</svg>`;
  const big = (id, cls, icon, label, sub) => `<button type="button" class="pub-big ${cls}" id="${id}">${ic(icon)}<span><span class="pub-bt">${h(label)}</span><small>${h(sub)}</small></span></button>`;
  return `<div class="pub pub-recw"><section class="g-card rec-card pub-rec" id="gRecCard" role="region" aria-labelledby="pubH" tabindex="-1"><p class="pub-prog">${h(t("pubRecStep"))}</p>
    <span class="lamp verde">✓ ${h(t("approved"))} · ${h(t("pubNote")(sc.now))}</span>${recorded ? ` <span class="lamp verde">${h(t("status").grabado)}</span>` : ""}
    <h3 id="pubH">${h(t("pubReady"))}</h3>
    ${big("gPP", "primary", '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/>', t("pubPP"), t("pubPPs"))}
    ${big("gReh", "", '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>', t("pubReh"), t("pubEst")(fmtTime(totalVideo())))}
    ${big("gSheet", "", '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', t("pubDl"), t("pubDls"))}
    <p class="hint rec-tip">${rehTot ? h(t("recLast")(fmtTime(rehTot), fmtTime(totalRec()))) : h(t("recTip"))}</p>
    ${recClipsHTML()}${recKeysHTML()}
    ${recorded ? "" : `<button type="button" class="linkish pub-rd" id="gRecorded">${h(t("s4Done"))}</button>`}
    <div class="pub-nav"><button type="button" class="small linkish" data-pub="prev">${h(t("coPrev"))}</button></div></section>
    <details class="rp-more g-after" id="gAfter"${V.s3After ? " open" : ""}><summary><span class="rp-more-t">${h(t("rpAfterRec"))}</span> <span class="hint">${h(t("pubAfterHint"))}</span></summary><div class="rp-more-body"><section class="g-card" id="gNextPlan"></section><section class="g-card" id="gShorts"></section><section class="g-card" id="gRes"></section></div></details>
    <details class="rp-more g-more3" id="gMore3"${V.s3More ? " open" : ""}><summary><span class="rp-more-t">${h(t("rpMore"))}</span></summary><div class="rp-more-body"><section class="g-card" id="gStruct"></section></div></details></div>`;
}
function pubStep3HTML(R) { return pubView() === "rec" ? pubRecHTML(R) : pubCardHTML(R); }

// After the HTML is in the page: fill the one visible card with its existing renderer, then wire the walk.
function pubAfterHTML(body) {
  const rec = pubView() === "rec";
  if (rec) { renderStructure(); foldStruct(); wireRecordCard(); renderShorts(); renderResultsCard(); }
  else { renderCold(); renderTopic(); renderPack(); const d = body.querySelector("details.pk-more"); if (d) d.open = true; }
  const keep = (id, k) => { const d = $(id); if (d) d.addEventListener("toggle", () => { V[k] = d.open; }); };
  keep("gAfter", "s3After"); keep("gMore3", "s3More");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = (fn) => () => { fn(); PB.focus = true; renderGuide(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); };
  body.querySelectorAll("[data-pub=next],[data-pub=skip]").forEach((b) => b.addEventListener("click", go(() => { PB.i = Math.min(PUB_N - 1, pubIndex() + 1); })));
  body.querySelectorAll("[data-pub=prev]").forEach((b) => b.addEventListener("click", go(() => { if (pubView() === "rec") { PB.view = "card"; PB.i = PUB_N - 1; } else PB.i = Math.max(0, pubIndex() - 1); })));
  body.querySelectorAll("[data-pub=rec]").forEach((b) => b.addEventListener("click", go(() => { PB.view = "rec"; })));
  body.querySelectorAll("[data-pub-go]").forEach((b) => b.addEventListener("click", go(() => { PB.i = +b.dataset.pubGo; })));
  const ap = $("gApprove");
  if (ap) ap.addEventListener("click", async () => {
    ap.disabled = true; await setStatus("aprobado");
    if (G.status === "aprobado" || G.status === "grabado") { PB.view = "rec"; PB.focus = true; renderGuide(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
    else ap.disabled = false;
  });
  const rd = $("gRecorded");
  if (rd) rd.addEventListener("click", async () => { rd.disabled = true; V.s3After = true; await setStatus("grabado"); const d = $("gAfter"); if (d) d.scrollIntoView({ block: "start" }); });
  // the ✓ line under the heading follows what is typed (the fields keep saving exactly as before)
  const upd = () => { const i = pubIndex(), it = pubItems()[i], ok = $("pubOk"); if (!ok || !it) return; ok.hidden = !it.done; $("pubOkV").textContent = it.val; };
  body.addEventListener("input", () => { if (pubView() === "card" && PB.i < PUB_N - 1) upd(); });
  const sb = $("stepBar"); if (sb) document.documentElement.style.setProperty("--sb-h", Math.ceil(sb.getBoundingClientRect().height) + "px"); // sticky action row sits above the phone's step bar
  if (typeof autoFitAll === "function") autoFitAll(body);
  if (PB.focus) { PB.focus = false; const c = $("pubCard") || $("gRecCard"); if (c) c.focus({ preventScroll: true }); }
}
// A field that is still focused saves/re-renders on blur («change», e.g. the keyword redraws the card). Do that on pointer-down, and if
// it replaced the button being pressed (or moved it), repeat the press on the new button after release: otherwise the click is lost.
let pubPress = null;
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest && e.target.closest("[data-pub],[data-pub-go],#gApprove");
  const a = document.activeElement;
  if (!b || !a || !/^(TEXTAREA|INPUT)$/.test(a.tagName) || !a.closest("#guide")) return;
  const key = b.id === "gApprove" ? "#gApprove" : b.dataset.pub ? `[data-pub="${b.dataset.pub}"]` : `[data-pub-go="${b.dataset.pubGo}"]`;
  pubPress = key;
  a.blur();
  document.addEventListener("pointerup", () => setTimeout(() => { const k = pubPress; pubPress = null; const nb = k && document.querySelector("#guide " + k); if (nb && !nb.disabled) nb.click(); }, 0), { once: true, capture: true });
}, true);
document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("#guide [data-pub],#guide [data-pub-go],#gApprove")) pubPress = null; }, true);
