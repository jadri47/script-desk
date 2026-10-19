
/* ===== Panel SEO (calificación, guía, términos repetidos, palabras débiles) + "Más revisiones" en el modo guiado ===== */
Object.assign(T.es, {
  seoLvl: { debil: "Débil", moderado: "Moderado", bueno: "Bueno", fuerte: "Fuerte" }, seoRating: "Calificación de búsqueda",
  seoRatingNote: (a, b) => `${a} de ${b} señales de búsqueda pasan. Mide cómo está escrito el guion para que YouTube lo entienda; no predice tu posición real, porque no hay datos de búsquedas.`,
  seoUp: "Lo que la sube", seoUpNone: "Todas las señales pasan.",
  seoRepeat: "Términos que ya repites", seoRepeatLead: "Toca uno para usarlo como tema (palabra clave).", seoUsing: "en uso",
  seoWeak: "Palabras débiles → mejores", seoWeakNone: "No hay palabras genéricas marcadas.", seoWeakLead: "Cambia las que no digan exactamente lo que quieres; las expresiones bíblicas fijas no se marcan.",
  seoGuide: "Guía rápida de búsqueda",
  seoGuideItems: [
    ["Elige un solo tema", "La frase que alguien escribiría: «qué dice la Biblia sobre la ansiedad», no «ansiedad y fe y paz»."],
    ["Dilo en la primera oración", "Los subtítulos automáticos se leen como texto; lo que se dice al inicio pesa más."],
    ["Repítelo sin amontonarlo", "Al inicio, a la mitad y al cierre, con naturalidad."],
    ["Usa palabras relacionadas", "Si el tema es la ansiedad: preocupación, afán, paz, descanso."],
    ["Título como pregunta", "Muchas búsquedas son preguntas: «¿Qué dice la Biblia sobre…?», «¿Por qué…?»."],
    ["Marca cada punto", "«Primero», «en segundo lugar», «por último» ayudan a YouTube a crear capítulos."],
  ],
  moreTitle: "Más revisiones", moreScripture: "Citas bíblicas y datos", moreAds: "Anuncios de YouTube por categoría", moreMs: "Guion marcado", moreSeo: "Búsqueda en YouTube (SEO)", moreRewrite: "Reescribir todo el guion con IA",
  moreAdsLead: "Las categorías del cuestionario que YouTube pide al subir el video. Verde significa que el guion no toca ese tema o lo trata sin problema.",
});
Object.assign(T.en, {
  seoLvl: { debil: "Weak", moderado: "Moderate", bueno: "Good", fuerte: "Strong" }, seoRating: "Search rating",
  seoRatingNote: (a, b) => `${a} of ${b} search signals pass. It measures how the script is written so YouTube understands it; it doesn't predict your real ranking, because there's no search data.`,
  seoUp: "What raises it", seoUpNone: "Every signal passes.",
  seoRepeat: "Terms you already repeat", seoRepeatLead: "Tap one to use it as the topic (keyword).", seoUsing: "in use",
  seoWeak: "Weak words → better", seoWeakNone: "No generic words marked.", seoWeakLead: "Change the ones that don't say exactly what you mean; fixed biblical expressions aren't marked.",
  seoGuide: "Quick search guide",
  seoGuideItems: [
    ["Pick one topic", "The phrase someone would type: \"what the Bible says about anxiety\", not \"anxiety and faith and peace\"."],
    ["Say it in the first sentence", "Auto-captions are read as text; what's said early weighs more."],
    ["Repeat it without bunching", "At the start, the middle and the close, naturally."],
    ["Use related words", "If the topic is anxiety: worry, fear, peace, rest."],
    ["Title as a question", "Many searches are questions: \"What does the Bible say about…?\", \"Why…?\"."],
    ["Mark each point", "\"First\", \"second\", \"finally\" help YouTube build chapters."],
  ],
  moreTitle: "More checks", moreScripture: "Scripture quotes and facts", moreAds: "YouTube ads by category", moreMs: "Marked-up script", moreSeo: "YouTube search (SEO)", moreRewrite: "Rewrite the whole script with AI",
  moreAdsLead: "The categories of the questionnaire YouTube asks for at upload. Green means the script doesn't touch that topic or handles it without trouble.",
});

const SEO_IDS = ["kw", "kwopen", "kwspread", "support", "search", "title", "desc", "chapters"];
function seoRatingOf(R) {
  const rows = (R.sections.seo || []).filter((r) => SEO_IDS.includes(r.id));
  const pass = rows.filter((r) => r.passed).length, pct = rows.length ? pass / rows.length : 0;
  const lvl = pct >= 0.9 ? "fuerte" : pct >= 0.7 ? "bueno" : pct >= 0.4 ? "moderado" : "debil";
  return { lvl, pass, total: rows.length, pct, fails: rows.filter((r) => !r.passed || r.warn) };
}
function seoPanelHTML(R) {
  const S = seoRatingOf(R), L = t("seoLvl");
  const steps = ["debil", "moderado", "bueno", "fuerte"];
  const color = { debil: "var(--rojo)", moderado: "var(--amarillo)", bueno: "var(--verde)", fuerte: "var(--verde)" };
  const rating = `<div class="seo-rate"><div class="seo-h"><span class="l">${h(t("seoRating"))}</span><b style="color:${color[S.lvl]}">${h(L[S.lvl])}</b></div>
    <div class="seo-scale" role="img" aria-label="${h(L[S.lvl])}">${steps.map((s, i) => `<span class="${steps.indexOf(S.lvl) >= i ? "on" : ""}" style="--c:${color[S.lvl]}">${h(L[s])}</span>`).join("")}</div>
    <p class="hint">${h(t("seoRatingNote")(S.pass, S.total))}</p>
    <div class="seo-up"><b>${h(t("seoUp"))}</b>${S.fails.length ? `<ul>${S.fails.map((r) => `<li><span>${h(typeof plainLabel === "function" ? plainLabel(r.id, r.label) : r.label)}</span>${r.fix ? ` <span class="hint">— ${h(r.fix)}</span>` : ""}</li>`).join("")}</ul>` : ` <span class="hint">${h(t("seoUpNone"))}</span>`}</div></div>`;
  const kwNow = norm((R.keyword || "").trim());
  const VERBY = new Set(["dice", "dijo", "decir", "hace", "puede", "pueden", "vamos", "tiene", "tienen", "está", "estás", "esta", "cuando", "says", "said", "does", "make", "have"]);
  const grams = [];
  for (const [w, c] of R.topGrams || []) { if (grams.some(([k]) => k.includes(w) || w.includes(k))) continue; grams.push([w, c]); if (grams.length === 5) break; }
  const words = (R.topWords || []).filter(([w]) => !VERBY.has(w) && !grams.some(([k]) => k.split(" ").includes(w))).slice(0, 6);
  const terms = [...grams, ...words];
  const repeat = terms.length ? `<div class="seo-block"><h4 class="pk-h">${h(t("seoRepeat"))}</h4><p class="hint">${h(t("seoRepeatLead"))}</p><div class="chips seo-chips">${terms.map(([w, c]) => `<button type="button" class="small${norm(w) === kwNow ? " on" : ""}" data-kwpick="${h(w)}">${h(w)} <span class="hint">×${c}</span>${norm(w) === kwNow ? ` <span class="hint">· ${h(t("seoUsing"))}</span>` : ""}</button>`).join("")}</div></div>` : "";
  const byWord = {};
  for (const x of R.weakHits || []) { const k = x.text.toLowerCase(); (byWord[k] = byWord[k] || { n: 0, alts: x.alts }).n++; }
  const weak = `<div class="seo-block"><h4 class="pk-h">${h(t("seoWeak"))}</h4>${Object.keys(byWord).length ? `<p class="hint">${h(t("seoWeakLead"))}</p><ul class="seo-weak">${Object.entries(byWord).map(([w, v]) => `<li><span class="sw-w">${h(w)}</span><span class="hint">×${v.n}</span><span class="sw-arrow">→</span><span>${v.alts.map((a) => `<span class="chip">${h(a)}</span>`).join(" ")}</span></li>`).join("")}</ul>` : `<p class="hint">${h(t("seoWeakNone"))}</p>`}</div>`;
  const guide = `<details class="why seo-guide"><summary>${h(t("seoGuide"))}</summary><ol>${t("seoGuideItems").map(([a, b]) => `<li><b>${h(a)}.</b> ${h(b)}</li>`).join("")}</ol></details>`;
  return `<div class="seo-panel">${rating}${repeat}${weak}${guide}</div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-kwpick]");
  if (!b || !state.result) return;
  $("keyword").value = b.dataset.kwpick;
  const keep = window.scrollY;
  state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts);
  if (G.prodId) markDirty();
  renderResults();
  window.scrollTo(0, keep);
});

// ---------- guided step 2: "Más revisiones" ----------
V.moreOpen = V.moreOpen || new Set();
function moreChecksHTML(R) {
  const tr = state.opts.translation;
  const legend = `<div class="legend"><span style="--c:var(--amarillo-bg)">${h(t("lgRisk"))}</span><span style="--c:var(--mul-bg)">${h(t("lgMul"))}</span><span style="--c:var(--weak-bg)">${h(t("lgWeak"))}</span>${R.lang === "es" ? `<span style="--c:var(--reg-bg)">${h(t("lgReg"))}</span>` : ""}<span style="--c:var(--gold-bg)">${h(t("lgQuote"))}</span><span style="--c:var(--kw-bg)">${h(t("lgKw"))}</span></div>${editLegendHTML()}`;
  const block = (id, title, body) => `<details class="g-more-d" data-more="${id}"${V.moreOpen.has(id) ? " open" : ""}><summary>${h(title)}</summary><div class="g-more-b">${body}</div></details>`;
  return `<section class="g-more-sec"><h3>${h(t("moreTitle"))}</h3>
    ${block("scripture", t("moreScripture"), `${scriptureBlock(R)}<div class="g-facts"><p class="lead">${h(t("factsLead"))}</p><div class="actions"><button class="small" data-ai="facts">${h(t("reviewFacts"))}</button></div><div class="out" id="out-facts"></div></div>`)}
    ${block("ads", t("moreAds"), `<p class="lead">${h(t("moreAdsLead"))}</p>${preflightTable(R)}${R.dense.length ? `<p class="lead">${h(t("denseWin"))}${R.dense.slice(0, 3).map((d) => `${fmtTime(d.from)}–${fmtTime(d.to)} (${d.n})`).join(", ")}.</p>` : ""}`)}
    ${block("ms", t("moreMs"), `${legend}<div class="manuscript" id="ms">${manuscriptHTML(R, state.text)}</div><p class="tipbar hidden" id="tipbar" role="status"></p>`)}
    ${block("seo", t("moreSeo"), seoPanelHTML(R))}
    ${block("rewrite", t("moreRewrite"), `<div class="helper"><p class="desc">${h(t("rwDesc"))}</p><div class="actions"><button class="primary small" data-ai="rewrite">${h(t("rwBtn"))}</button><button class="small hidden" data-stop>${h(t("stop"))}</button></div><div class="out" id="out-rewrite"></div></div>`)}
  </section>`;
}
function wireMoreChecks(root) {
  root.querySelectorAll(".g-more-d").forEach((d) => d.addEventListener("toggle", () => { if (d.open) V.moreOpen.add(d.dataset.more); else V.moreOpen.delete(d.dataset.more); }));
  const ms = root.querySelector("#ms"), tb = root.querySelector("#tipbar");
  if (ms && tb) ms.addEventListener("click", (ev) => { const m = ev.target.closest("mark"); if (!m) { tb.classList.add("hidden"); return; } tb.textContent = "«" + m.textContent + "» — " + m.title; tb.classList.remove("hidden"); });
  root.querySelectorAll("[data-ai]").forEach((b) => b.addEventListener("click", () => runAI(b.dataset.ai, b)));
  root.querySelectorAll("[data-stop]").forEach((b) => b.addEventListener("click", () => aiCtl && aiCtl.abort()));
  caps.sample.then((s) => { if (!s) root.querySelectorAll("[data-ai]").forEach((b) => (b.disabled = true)); });
}
const _renderGuideM = renderGuide;
renderGuide = function () {
  _renderGuideM();
  if (!V.guided || V.step !== 2 || !state.result) return;
  const more = $("gExpertGo") && $("gExpertGo").closest(".g-more");
  if (!more) return;
  more.insertAdjacentHTML("beforebegin", moreChecksHTML(state.result));
  wireMoreChecks($("guide"));
};
