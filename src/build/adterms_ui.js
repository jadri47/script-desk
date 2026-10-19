/* ===== Anuncios por categoría: muestra las palabras que causan cada aviso, cuándo salen y por qué cuentan ===== */
Object.assign(T.es, {
  atHint: "Toca una categoría para ver por qué cuenta y qué hacer. Las palabras aparecen debajo de cada nombre.",
  atWhy: "Por qué cuenta", atTerms: "Palabras y cuándo salen", atFix: "Qué hacer", atClear: "Sin palabras de riesgo en:",
  atMore: (n) => `+${n} más`, atTimes: (n) => `${n} ${n === 1 ? "vez" : "veces"}`, atPack: "Título, miniatura y descripción",
  atPackWhy: "Aquí YouTube es más estricto: una sola palabra de riesgo puede limitar los anuncios.",
  atOpen: "apertura", atEarly: "primeros 30 s", atTierStrong: "fuerte", atTierModerate: "moderada", atTierLight: "leve",
  atMentioned: "Solo se menciona, sin detalle gráfico ni énfasis: no limita anuncios.",
});
Object.assign(T.en, {
  atHint: "Tap a category to see why it counts and what to do. The words show under each name.",
  atWhy: "Why it counts", atTerms: "Words and when they come up", atFix: "What to do", atClear: "No risk words in:",
  atMore: (n) => `+${n} more`, atTimes: (n) => `${n} ${n === 1 ? "time" : "times"}`, atPack: "Title, thumbnail and description",
  atPackWhy: "YouTube is stricter here: a single risk word can limit ads.",
  atOpen: "opening", atEarly: "first 30 s", atTierStrong: "strong", atTierModerate: "moderate", atTierLight: "mild",
  atMentioned: "Only mentioned, without graphic detail or emphasis: it does not limit ads.",
});
if (typeof HELP !== "undefined") {
  HELP.es.mAds = "Cada categoría que YouTube revisa para decidir si un video lleva anuncios. Debajo del nombre ves las palabras de tu guion que la causan; toca la categoría para ver cuándo salen, por qué cuenta y qué hacer.";
  HELP.en.mAds = "Each category YouTube checks to decide whether a video gets ads. Under the name you see the words in your script that cause it; tap the category to see when they come up, why it counts and what to do.";
}
function atGroup(p, R) {
  const m = new Map();
  for (const x of p.hits || []) {
    const k = String(x.text).toLowerCase();
    const g = m.get(k) || { word: x.text, n: 0, times: [], tier: x.tier || "", early: false, first: 1e9 };
    g.n++; const s = R.timeAt ? R.timeAt(x.start) : 0; g.times.push(s); if (s < 30) g.early = true; g.first = Math.min(g.first, s);
    if (x.tier === "strong") g.tier = "strong";
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => a.first - b.first);
}
const atTier = (x) => (x === "strong" ? t("atTierStrong") : x === "moderate" ? t("atTierModerate") : x === "light" ? t("atTierLight") : "");
function atZone(s) { return s < 7 ? t("atOpen") : s < 30 ? t("atEarly") : ""; }
function atRow(p, R) {
  const g = atGroup(p, R);
  const chips = g.slice(0, 6).map((x) => `<span class="pf-chip pf-${p.level}">«${h(x.word)}»${x.n > 1 ? ` <small>×${x.n}</small>` : ""}</span>`).join("") + (g.length > 6 ? `<span class="pf-chip pf-more">${h(t("atMore")(g.length - 6))}</span>` : "");
  const terms = g.map((x) => {
    const ts = x.times.slice().sort((a, b) => a - b), shown = ts.slice(0, 6).map((s) => `${fmtTime(s)}${atZone(s) ? ` <em>${h(atZone(s))}</em>` : ""}`).join(" · ");
    const tier = atTier(x.tier);
    return `<li><b>«${h(x.word)}»</b>${tier ? ` <span class="pf-tier">${h(tier)}</span>` : ""} <span class="hint">${h(t("atTimes")(x.n))}</span><div class="pf-t">${shown}${ts.length > 6 ? ` · ${h(t("atMore")(ts.length - 6))}` : ""}</div></li>`;
  }).join("");
  const why = p.level === "verde" && p.count ? t("atMentioned") + (p.note ? " " + p.note : "") : p.note || "";
  return `<details class="pf-d lvl-${p.level}"${p.level === "rojo" ? " open" : ""}><summary><span class="pf-top"><b>${h(p.label)}</b><span class="lamp ${p.level}">${h(t("icon")[p.level])}</span></span><span class="pf-sub">${p.count} · ${h(deg(p.degree))}</span><span class="pf-chips">${chips}</span></summary>
    <div class="pf-body">${why ? `<div class="pf-k">${h(t("atWhy"))}</div><p>${h(why)}</p>` : ""}<div class="pf-k">${h(t("atTerms"))}</div><ul class="pf-terms">${terms}</ul>${p.fix && p.level !== "verde" ? `<div class="pf-k">${h(t("atFix"))}</div><p>${h(p.fix)}</p>` : ""}</div></details>`;
}
preflightTable = function (R) {
  const hit = R.preflight.filter((p) => p.count > 0), clear = R.preflight.filter((p) => !(p.count > 0));
  const pack = (R.packaging || []).filter((p) => p.level !== "verde" && (p.issues || []).length);
  const packHTML = pack.length ? `<details class="pf-d lvl-${pack.some((p) => p.level === "rojo") ? "rojo" : "amarillo"}" open><summary><span class="pf-top"><b>${h(t("atPack"))}</b><span class="lamp ${pack.some((p) => p.level === "rojo") ? "rojo" : "amarillo"}">${h(t("icon")[pack.some((p) => p.level === "rojo") ? "rojo" : "amarillo"])}</span></span><span class="pf-sub">${h(t("atPackWhy"))}</span></summary>
    <div class="pf-body"><ul class="pf-terms">${pack.map((p) => `<li><b>${h(p.label)}</b> <span class="lamp ${p.level}">${h(t("icon")[p.level])}</span><div class="pf-t">${p.issues.map((x) => h(x)).join("<br>")}</div></li>`).join("")}</ul></div></details>` : "";
  return `<div class="pf-list"><p class="hint">${h(t("atHint"))}</p>${packHTML}${hit.map((p) => atRow(p, R)).join("")}${clear.length ? `<p class="pf-clear"><span class="lamp verde">${h(t("icon").verde)}</span> ${h(t("atClear"))} ${clear.map((p) => h(p.label)).join(", ")}.</p>` : ""}</div>`;
};
