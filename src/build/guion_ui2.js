
/* ===== Empaque · Shorts · Resultados ===== */
Object.assign(T.es, {
  navCold: "Apertura", navEsc: "Escaleta", navSecs: "Secciones", navPack: "Empaque", navShorts: "Shorts", navRes: "Resultados", navRev: "Revisiones",
  pkMore: "Más: descripción, capítulos y pausas de anuncios", shMore: (n) => `Ver ${n} más`,
  pkTitle: "Empaque", pkLead: "El título y la miniatura deciden si alguien hace clic; el guion decide si se queda. Escribe y mira cómo se verá.",
  pkReq: "Obligatorio", pkRec: "Recomendado",
  pk: { title: "Hay un título", titleLen: (n) => `Título de 60 caracteres o menos (${n})`, titleRisk: "Título sin términos de riesgo", thumb: "Miniatura de 1 a 5 palabras y 30 caracteres o menos", thumbRisk: "Miniatura sin términos de riesgo", titleKw: (k) => `La palabra clave «${k}» está en el título`, thumbRepeat: "La miniatura dice algo distinto al título", promiseMatch: "El título promete lo mismo que la apertura del guion", descKw: "La descripción nombra la palabra clave en sus primeros 150 caracteres" },
  pkFix: { title: "Escribe el título de trabajo.", titleLen: "Acórtalo: en el celular se corta cerca de 60 caracteres.", titleRisk: "Quita esos términos del título.", thumb: "Escribe de 2 a 4 palabras grandes para la miniatura.", thumbRisk: "Quita esos términos de la miniatura.", titleKw: "Pon la palabra clave al inicio del título.", thumbRepeat: "La miniatura complementa al título: añade la emoción o la tensión, no repitas las palabras.", promiseMatch: "Si el título promete algo que la apertura no menciona, la gente se va en los primeros segundos.", descKw: "Empieza la descripción con la promesa y la palabra clave." },
  pkGate: (x) => `Para aprobar falta: ${x}.`, pkPrevLbl: "Así se verá en YouTube", pkChannel: "Tu canal", pkNow: "ahora", pkThumbPh2: "Texto de la miniatura", pkTitlePh2: "Aquí va el título del video", pkWords: (n) => `${n} ${n === 1 ? "palabra" : "palabras"}`, pkPending: "pendiente", pkGoFix: "Ver Empaque", pkAi: "Sugerir títulos y miniatura con IA", pkUse: "Usar", pkSugTitles: "Títulos sugeridos", pkSugThumbs: "Miniatura sugerida",
  abTitle: "Pausas sugeridas para anuncios", abLead: "Al final de un punto de enseñanza, lejos de versículos, oraciones y llamadas a la acción. La separación (4 min o más, la primera hacia el 40 % del video) es consejo de guías de creadores, no una regla de YouTube. YouTube coloca los anuncios solo, a menos que los pongas a mano en YouTube Studio.", abNone: "Sin pausas sugeridas: el episodio es corto o los puntos no dejan un corte limpio.", abCopy: "Copiar tiempos", abAt: (m, s) => `${m} · tras «${s}»`,
  chTitle: "Capítulos para la descripción", chLead: "Salen de la escaleta. YouTube pide al menos tres, el primero en 0:00, cada uno de 10 segundos o más.", chIntro: "Introducción", chCopy: "Copiar", chToDesc: "Añadir a la descripción", chAdded: "Añadidos a la descripción.", chFew: "Hacen falta al menos tres capítulos: marca más puntos en «Guion por secciones».", chScaled: (a) => `Ajustados a la duración real del video (${a}).`, chEst: "Tiempos estimados: confírmalos en el video editado o escribe la duración real en Resultados.",
  shTitle: "Clips para Shorts", shLead: "Pasajes de 20 segundos a 3 minutos (los Shorts admiten hasta 3 minutos) que se entienden solos: empiezan con una pregunta o una tensión y terminan en una idea cerrada. Los que marques aparecen en la hoja del editor.", shMark: "Marcar para el editor", shMarked: "Marcado", shNone: "No encontré pasajes que funcionen solos. Suelen salir de una pregunta al oyente seguida de su respuesta.", shEnds: "termina en",
  rsTitle: "Resultados del episodio", rsLead: "Después de publicar, exporta la retención de público desde YouTube Studio (modo avanzado → Exportar, CSV) y pégala o súbela aquí. Acepta dos columnas: posición del video (% o mm:ss) y retención (%).",
  rsDur: "Duración real del video", rsPaste: "Datos de retención", rsPh: "Pega el CSV, o dos columnas por línea: 0:30 72", rsFile: "Subir CSV", rsImport: "Importar", rsClear: "Quitar datos",
  rsErr: { empty: "No hay datos para importar.", few: "Hacen falta al menos 3 filas con números.", cols: "No encontré una columna de posición y otra de retención.", duration: "La posición viene en porcentaje: escribe primero la duración real del video (mm:ss)." },
  rsIntro: "Siguen viendo a los 0:30", rsAvg: "Porcentaje medio visto", rsWorstLbl: "Mayor caída", rsScale: "Las secciones se ubican con los tiempos estimados, ajustados a la duración real; un ensayo o la edición pueden moverlas unos segundos.",
  rsTh0: "Al entrar", rsTh1: "Al salir", rsDrop: "Pérdida", rsPerMin: "Por minuto", rsChart: "Retención de público por sección", rsPts: "puntos", rsWorstNote: "Revisa estas secciones primero: es donde más gente se fue por minuto.",
  rsSaved: "Importado.", rsNeedProd: "Guarda la producción para conservar estos datos.",
  shSheet: "Clips para Shorts", chSheet: "Capítulos",
});
Object.assign(T.en, {
  navCold: "Cold open", navEsc: "Rundown", navSecs: "Sections", navPack: "Packaging", navShorts: "Shorts", navRes: "Results", navRev: "Revisions",
  pkMore: "More: description, chapters and ad breaks", shMore: (n) => `Show ${n} more`,
  pkTitle: "Packaging", pkLead: "The title and thumbnail decide whether anyone clicks; the script decides whether they stay. Type and see how it will look.",
  pkReq: "Required", pkRec: "Recommended",
  pk: { title: "There's a title", titleLen: (n) => `Title of 60 characters or less (${n})`, titleRisk: "Title free of risk terms", thumb: "Thumbnail text of 1 to 5 words and 30 characters or less", thumbRisk: "Thumbnail free of risk terms", titleKw: (k) => `The keyword "${k}" is in the title`, thumbRepeat: "The thumbnail says something different from the title", promiseMatch: "The title promises what the script's opening promises", descKw: "The description names the keyword in its first 150 characters" },
  pkFix: { title: "Write the working title.", titleLen: "Shorten it: mobile cuts it near 60 characters.", titleRisk: "Remove those terms from the title.", thumb: "Write 2 to 4 big words for the thumbnail.", thumbRisk: "Remove those terms from the thumbnail.", titleKw: "Put the keyword near the start of the title.", thumbRepeat: "The thumbnail complements the title: add the emotion or tension, don't repeat the words.", promiseMatch: "If the title promises something the opening never mentions, people leave in the first seconds.", descKw: "Start the description with the promise and the keyword." },
  pkGate: (x) => `To approve, still needed: ${x}.`, pkPrevLbl: "How it will look on YouTube", pkChannel: "Your channel", pkNow: "just now", pkThumbPh2: "Thumbnail text", pkTitlePh2: "The video title goes here", pkWords: (n) => `${n} ${n === 1 ? "word" : "words"}`, pkPending: "pending", pkGoFix: "Go to Packaging", pkAi: "Suggest titles and thumbnail with AI", pkUse: "Use", pkSugTitles: "Suggested titles", pkSugThumbs: "Suggested thumbnail",
  abTitle: "Suggested ad-break points", abLead: "At the end of a teaching point, away from verses, prayers and calls to action. The spacing (4 min or more, the first around 40% of the video) is advice from creator guides, not a YouTube rule. YouTube places ads on its own unless you set them by hand in YouTube Studio.", abNone: "No suggested breaks: the episode is short or the points leave no clean cut.", abCopy: "Copy times", abAt: (m, s) => `${m} · after "${s}"`,
  chTitle: "Chapters for the description", chLead: "Built from the rundown. YouTube needs at least three, the first at 0:00, each 10 seconds or longer.", chIntro: "Introduction", chCopy: "Copy", chToDesc: "Add to description", chAdded: "Added to the description.", chFew: "At least three chapters are needed: mark more points in \"Script by section\".", chScaled: (a) => `Adjusted to the video's real length (${a}).`, chEst: "Estimated times: confirm them in the edited video or enter the real length in Results.",
  shTitle: "Clips for Shorts", shLead: "Passages from 20 seconds to 3 minutes (Shorts allow up to 3 minutes) that stand on their own: they open with a question or tension and end on a finished thought. The ones you mark go on the editor sheet.", shMark: "Mark for the editor", shMarked: "Marked", shNone: "No passages stand on their own. They usually come from a question to the viewer followed by its answer.", shEnds: "ends on",
  rsTitle: "Episode results", rsLead: "After publishing, export audience retention from YouTube Studio (advanced mode → Export, CSV) and paste or upload it here. Two columns work: video position (% or mm:ss) and retention (%).",
  rsDur: "Real video length", rsPaste: "Retention data", rsPh: "Paste the CSV, or two columns per line: 0:30 72", rsFile: "Upload CSV", rsImport: "Import", rsClear: "Remove data",
  rsErr: { empty: "No data to import.", few: "At least 3 rows with numbers are needed.", cols: "Couldn't find a position column and a retention column.", duration: "Position is in percent: enter the video's real length (mm:ss) first." },
  rsIntro: "Still watching at 0:30", rsAvg: "Average percentage viewed", rsWorstLbl: "Biggest drop", rsScale: "Sections are placed with the estimated times, scaled to the real length; editing can shift them a few seconds.",
  rsTh0: "Entering", rsTh1: "Leaving", rsDrop: "Lost", rsPerMin: "Per minute", rsChart: "Audience retention by section", rsPts: "points", rsWorstNote: "Look at these sections first: that's where the most people left per minute.",
  rsSaved: "Imported.", rsNeedProd: "Save the production to keep this data.",
  shSheet: "Clips for Shorts", chSheet: "Chapters",
});
Object.assign(G, { retention: null, realDur: "", shorts: [], clips: [], pkSug: null });

// ---------- shared helpers ----------
function promiseText() {
  if (G.cold.promise) return G.cold.promise.text;
  const p = G.U.find((u) => u.t0 <= 90 && hasPhrase(u.text, PROMISES));
  return p ? p.text : G.U.filter((u) => u.t0 < 30).map((u) => u.text).join(" ");
}
function packChecks() { return G.R ? packagingChecks(readOpts(), G.R, promiseText()) : []; }
function packGateMissing() { return packChecks().filter((c) => c.req && !c.pass); }
function videoScale() { const real = parseMMSS(G.realDur) || (G.retention && G.retention.durationSec); const est = totalVideo(); return real && est ? real / est : 1; }
function videoSpans() {
  const sc = videoScale(), cs = coldSec(), spans = [];
  if (cs > 0) spans.push({ k: -1, label: t("coldRow"), type: "cold", a: 0, b: cs * sc });
  G.secs.forEach((s) => spans.push({ k: s.k, label: secLabel(s), type: s.type, a: finalT(s.t0) * sc, b: finalT(s.t1) * sc }));
  return spans;
}
function chapterLabel(s) {
  if (s.title) return s.title;
  if (s.type === "close") return t("st").close;
  const u = G.U[s.first];
  let x = (u ? u.text : "").replace(ORD_RE, "").replace(/^[\s,.:;—-]+/, "").replace(/[.!?¿¡«»"“”]/g, "").trim();
  const ws = x.split(/\s+/);
  x = ws.slice(0, 7).join(" ").replace(/[,:;]+$/, "") + (ws.length > 7 ? "…" : "");
  return x ? x[0].toUpperCase() + x.slice(1) : secLabel(s);
}
function chaptersText() {
  const sc = videoScale(), total = totalVideo() * sc;
  const items = G.secs.map((s) => ({ t: finalT(s.t0) * sc, type: s.type, label: chapterLabel(s) }));
  return buildChapters(items, total, t("chIntro"));
}

// ---------- extra compute ----------
const _gCompute = gCompute;
gCompute = function () {
  _gCompute();
  if (!G.R) { G.clips = []; return; }
  G.clips = clipCandidates(G.U, G.R, G.secs, { keyword: G.R.keyword });
  const find = (anchor, near) => { let best = -1, bd = Infinity; G.U.forEach((u, i) => { if (u.text.slice(0, 80) === anchor) { const d = Math.abs(i - near); if (d < bd) { bd = d; best = i; } } }); return best; };
  G.shorts = G.shorts.map((m) => { const i0 = find(m.a, m.i0), i1 = find(m.b, m.i1); return i0 >= 0 && i1 >= i0 ? { ...m, i0, i1 } : null; }).filter(Boolean);
};

// ---------- packaging card ----------
let pkTimer = null;
function renderPack() {
  const el = $("gPack");
  if (!el) return;
  el.innerHTML = `<header class="g-h"><h2>${h(t("pkTitle"))}</h2><button class="small" id="pkAi">${h(t("pkAi"))}</button></header>
    <p class="lead">${h(t("pkLead"))}</p>
    <div class="pk-top" data-pk-part="title thumb">
      <figure class="yt-mock" id="pkPreview" aria-label="${h(t("pkPrevLbl"))}"></figure>
      <div class="pk-fields">
        <div class="field" data-pk-part="title"><label for="pkTitleIn">${h(t("titleLabel"))}</label><textarea id="pkTitleIn" rows="1" data-one="1" maxlength="100" placeholder="${h(t("titlePh"))}">${h($("title").value)}</textarea><span class="pk-count" id="pkTitleN"></span></div>
        <div class="field" data-pk-part="thumb"><label for="pkThumbIn">${h(t("thumbLabel"))}</label><textarea id="pkThumbIn" rows="1" data-one="1" maxlength="24" placeholder="${h(t("thumbPh"))}">${h($("thumb").value)}</textarea><span class="pk-count" id="pkThumbN"></span></div>
      </div>
    </div>
    <div id="pkSug"></div><p class="status" id="pkStatus"></p>
    <div id="pkChecks"></div>
    <details class="pk-more" data-pk-part="desc"><summary>${h(t("pkMore"))}</summary>
    <div class="field pk-wide"><label for="pkDescIn">${h(t("descLabel"))}</label><textarea id="pkDescIn" rows="4">${h($("description").value)}</textarea></div>
    <div class="ch-box" id="pkChapters"></div><div class="ch-box" id="pkAds"></div></details>`;
  const sync = (from, to) => $(from).addEventListener("input", () => {
    $(to).value = $(from).value;
    renderPkPreview();
    clearTimeout(pkTimer);
    pkTimer = setTimeout(() => { gCompute(); renderPackChecks(); renderProdBar(); markDirty(); }, 350);
  });
  $("pkTitleIn").addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });
  $("pkTitleIn").addEventListener("input", (e) => { const v = e.target.value.replace(/\s*\n\s*/g, " "); if (v !== e.target.value) e.target.value = v; });
  sync("pkTitleIn", "title"); sync("pkThumbIn", "thumb"); sync("pkDescIn", "description");
  $("pkAi").addEventListener("click", (e) => aiPack(e.target));
  renderPkPreview(); renderPackSug(); renderPackChecks();
}
// What a viewer sees in the YouTube feed, updated as you type.
function renderPkPreview() {
  const el = $("pkPreview");
  if (!el) return;
  const title = $("title").value.trim(), thumb = $("thumb").value.trim(), ch = $("series").value.trim() || t("pkChannel");
  const tn = $("pkTitleN"), hn = $("pkThumbN");
  if (tn) { tn.textContent = `${title.length}/60`; tn.classList.toggle("over", title.length > 60); }
  if (hn) { const w = thumb ? thumb.split(/\s+/).length : 0; hn.textContent = t("pkWords")(w); hn.classList.toggle("over", w > 5 || thumb.length > 30); }
  el.innerHTML = `<div class="yt-thumb${thumb ? "" : " empty"}"><span class="yt-tt">${h(thumb || t("pkThumbPh2"))}</span><span class="yt-dur">${fmtTime(G.R ? totalVideo() : 0)}</span></div>
    <figcaption class="yt-info"><span class="yt-av" aria-hidden="true">${h((ch[0] || "·").toUpperCase())}</span><span><span class="yt-title${title ? "" : " empty"}">${h(title || t("pkTitlePh2"))}</span><span class="yt-ch">${h(ch)} · ${h(t("pkNow"))}</span></span></figcaption>`;
}
function renderPackChecks() {
  const box = $("pkChecks");
  if (!box) return;
  const P = t("pk"), F = t("pkFix");
  const label = (c) => (typeof P[c.id] === "function" ? P[c.id](c.v) : P[c.id]);
  const row = (c) => c.pending
    ? `<div class="row pend"><div class="mark pend" aria-label="${h(t("pkPending"))}">·</div><div><div class="t">${h(label(c).replace(/\s*\(\d+\)$/, ""))}</div></div></div>`
    : `<div class="row"><div class="mark ${c.pass ? "pass" : c.req ? "red" : "fail"}">${c.pass ? "✓" : c.req ? "!" : "✕"}</div><div><div class="t">${h(label(c))}</div>${!c.pass && c.v && /Risk/.test(c.id) ? `<div class="i">${h(c.v)}</div>` : ""}${c.id === "promiseMatch" && c.pass && c.v ? `<div class="i">${h(c.v)}</div>` : ""}${!c.pass ? `<div class="f">${h(F[c.id])}</div>` : ""}</div></div>`;
  const cs = packChecks().filter((c) => c.id !== "titleKw" || c.v);
  const req = cs.filter((c) => c.req), rec = cs.filter((c) => !c.req);
  const tally = (list) => { const done = list.filter((c) => !c.pending && c.pass).length; return `<span class="pk-tally">${done}/${list.length}</span>`; };
  box.innerHTML = `<div class="pk-checks"><div><h4 class="pk-h">${h(t("pkReq"))}</h4>${tally(req)}${req.map(row).join("")}</div><div><h4 class="pk-h">${h(t("pkRec"))}</h4>${tally(rec)}${rec.map(row).join("")}</div></div>`;
  renderChapters();
}
function renderChapters() {
  const box = $("pkChapters");
  if (!box) return;
  const ch = chaptersText(), real = parseMMSS(G.realDur) || (G.retention && G.retention.durationSec);
  const txt = ch.map((c) => `${fmtTime(c.t)} ${c.label}`).join("\n");
  box.innerHTML = `<h3>${h(t("chTitle"))}</h3><p class="hint">${h(t("chLead"))} ${h(real ? t("chScaled")(fmtTime(real)) : t("chEst"))}</p>
    ${ch.length < 3 ? `<p class="status err">${h(t("chFew"))}</p>` : ""}<textarea id="chOut" rows="${Math.min(10, ch.length + 1)}" spellcheck="false">${h(txt)}</textarea>
    <div class="actions" style="margin-top:8px"><button class="small" id="chCopy">${h(t("chCopy"))}</button><button class="small" id="chDesc">${h(t("chToDesc"))}</button><span class="status" id="chMsg"></span></div>`;
  $("chCopy").addEventListener("click", (e) => copyText($("chOut").value, e.target));
  renderAds();
  $("chDesc").addEventListener("click", () => {
    const d = $("description").value.replace(/\n*(?:^|\n)0:00[\s\S]*$/, "").trimEnd();
    $("description").value = (d ? d + "\n\n" : "") + $("chOut").value.trim();
    const pd = $("pkDescIn"); if (pd) pd.value = $("description").value;
    markDirty(); gCompute(); renderPackChecks(); $("chMsg").textContent = t("chAdded");
  });
}
function renderAds() {
  const box = $("pkAds");
  if (!box || !G.R) return;
  const sc = videoScale(), cs = coldSec();
  const list = adBreaks(G.secs, G.U, G.text, G.R).map((b) => ({ t: (finalT(b.t)) * sc, sec: G.secs[b.k] }));
  const rows = list.map((b) => t("abAt")(fmtTime(b.t), (chapterLabel(b.sec) || secLabel(b.sec)).slice(0, 48)));
  box.innerHTML = `<h3>${h(t("abTitle"))}</h3><p class="hint">${h(t("abLead"))}</p>${rows.length ? `<ul class="ab-list">${rows.map((r) => `<li>${h(r)}</li>`).join("")}</ul><div class="actions" style="margin-top:8px"><button class="small" id="abCopy">${h(t("abCopy"))}</button></div>` : `<p class="hint">${h(t("abNone"))}</p>`}`;
  const b = $("abCopy"); if (b) b.addEventListener("click", (e) => copyText(list.map((x) => fmtTime(x.t)).join("\n"), e.target));
}
function renderPackSug() {
  const box = $("pkSug");
  if (!box) return;
  const S = G.pkSug;
  if (!S) { box.innerHTML = ""; return; }
  const kw = (G.R && G.R.keyword) || "";
  box.innerHTML = `<div class="pk-sug"><div data-pk-part="title"><h4 class="pk-h">${h(t("pkSugTitles"))}</h4>${S.titles.map((x, i) => { const ok = x.length <= 60 && (!kw || norm(x).slice(0, 60).includes(norm(kw))); return `<div class="pk-opt"><span>${h(x)}</span><span class="hint">${x.length}</span><span class="verdict-tag ${ok ? "v-ok" : "v-mid"}">${h(ok ? t("ok") : t("review"))}</span><button class="small" data-pt="${i}">${h(t("pkUse"))}</button></div>`; }).join("")}
</div><div data-pk-part="thumb"><h4 class="pk-h">${h(t("pkSugThumbs"))}</h4><div class="chips">${S.thumbs.map((x, i) => `<button class="small" data-pth="${i}">${h(x)}</button>`).join("")}</div></div></div>`;
  const apply = (main, mirror, v) => { $(main).value = v; $(mirror).value = v; renderPkPreview(); gCompute(); renderPackChecks(); renderProdBar(); markDirty(); };
  box.querySelectorAll("[data-pt]").forEach((b) => b.addEventListener("click", () => apply("title", "pkTitleIn", S.titles[+b.dataset.pt])));
  box.querySelectorAll("[data-pth]").forEach((b) => b.addEventListener("click", () => apply("thumb", "pkThumbIn", S.thumbs[+b.dataset.pth])));
}
async function aiPack(btn) {
  const sample = await caps.sample, st = $("pkStatus");
  if (!sample) { st.className = "status err"; st.textContent = t("aiPickNeed"); return; }
  btn.disabled = true; st.className = "status"; st.textContent = t("thinking");
  const R = G.R;
  const prompt = `Para un episodio de un pódcast cristiano de enseñanza bíblica en YouTube, en ${R.lang === "en" ? "inglés" : $("audience").value === "es" ? "español de España" : $("audience").value === "latam" ? "español latinoamericano" : "español neutro"} (el idioma del guion), escribe:
1. Cinco títulos de 60 caracteres o menos${R.keyword ? `, con "${R.keyword}" dentro de los primeros 60 caracteres` : ""}. Al menos dos como la pregunta que alguien escribiría en YouTube. Cada título debe prometer exactamente lo que promete la apertura del guion (abajo), ni más ni menos.
2. Tres textos de miniatura de 1 a 4 palabras (24 caracteres o menos) que NO repitan las palabras del título: añaden la emoción o la tensión.
Sin mayúsculas sostenidas, sin groserías, sin términos gráficos, sin prometer sanidad o dinero.
Responde solo con JSON: {"titles": ["..."], "thumbs": ["..."]}

PROMESA DE LA APERTURA: ${promiseText().slice(0, 600)}

GUION (inicio):
"""
${G.text.slice(0, 6000)}
"""`;
  try {
    const res = await sample.json(prompt, { modelTier: "default" });
    const titles = (res && Array.isArray(res.titles) ? res.titles : []).map(String).filter(Boolean).slice(0, 5);
    const thumbs = (res && Array.isArray(res.thumbs) ? res.thumbs : []).map(String).filter(Boolean).slice(0, 3);
    if (!titles.length) throw { code: "invalid_json" };
    G.pkSug = { titles, thumbs };
    st.textContent = "";
    renderPackSug();
  } catch (e) { st.className = "status err"; st.textContent = errText(e); }
  btn.disabled = false;
}

// ---------- Shorts card ----------
function shortsListHTML(list, marked) {
  const shItem = (c, k) => `<div class="sh-item${marked(c) ? " in-use" : ""}"><div class="sh-time">${fmtTime(c.t0)}–${fmtTime(c.t1)}<span>≈${Math.round(c.dur)} s</span></div>
      <div class="sh-body"><div class="co-text">«${h(c.first)}»</div>${c.i1 > c.i0 ? `<div class="hint">${h(t("shEnds"))} «${h(c.last.length > 110 ? c.last.slice(0, 110) + "…" : c.last)}»</div>` : ""}
      <div class="co-meta">${c.why.map((w) => `<span class="chip">${h(t("why")[w] || w)}</span>`).join("")}</div>
      <div class="co-act">${marked(c) ? `<button class="small" data-unmark="${k}" aria-pressed="true">✓ ${h(t("shMarked"))}</button>` : `<button class="small primary" data-mark="${k}">${h(t("shMark"))}</button>`}<button class="small linkish" data-see="${c.i0}">${h(t("coSee"))}</button></div></div></div>`
  const rank = list.map((c, k) => ({ c, k, s: (marked(c) ? 100 : 0) + (c.why ? c.why.length : 0) })).sort((x, y) => y.s - x.s || x.c.t0 - y.c.t0);
  const top = new Set(rank.slice(0, 3).map((r) => r.k));
  const first = list.map((c, k) => (top.has(k) ? shItem(c, k) : "")).join(""), rest = list.map((c, k) => (top.has(k) ? "" : shItem(c, k))).join("");
  return `<div class="sh-list">${first}</div>${rest ? `<details class="sh-more"><summary>${h(t("shMore")(list.length - top.size))}</summary><div class="sh-list">${rest}</div></details>` : ""}`;
}
function renderShorts() {
  const el = $("gShorts");
  if (!el) return;
  const marked = (c) => G.shorts.some((m) => m.i0 === c.i0 && m.i1 === c.i1);
  const list = [...G.clips];
  for (const m of G.shorts) if (!list.some((c) => c.i0 === m.i0 && c.i1 === m.i1)) { const a = G.U[m.i0], b = G.U[m.i1]; list.push({ i0: m.i0, i1: m.i1, t0: a.t0, t1: b.t1, dur: b.t1 - a.t0, why: [], first: a.text, last: b.text }); }
  list.sort((x, y) => x.t0 - y.t0);
  el.innerHTML = `<header class="g-h"><h2>${h(t("shTitle"))}</h2><span class="count">${G.shorts.length ? h(t("shMarked")) + " " + G.shorts.length : ""}</span></header><p class="lead">${h(t("shLead"))}</p>
    ${list.length ? shortsListHTML(list, marked) : `<p class="hint">${h(t("shNone"))}</p>`}`;
  el.querySelectorAll("[data-mark]").forEach((b) => b.addEventListener("click", () => { const c = list[+b.dataset.mark]; G.shorts.push({ i0: c.i0, i1: c.i1, a: G.U[c.i0].text.slice(0, 80), b: G.U[c.i1].text.slice(0, 80) }); markDirty(); renderShorts(); }));
  el.querySelectorAll("[data-unmark]").forEach((b) => b.addEventListener("click", () => { const c = list[+b.dataset.unmark]; G.shorts = G.shorts.filter((m) => !(m.i0 === c.i0 && m.i1 === c.i1)); markDirty(); renderShorts(); }));
  el.querySelectorAll("[data-see]").forEach((b) => b.addEventListener("click", () => showUnit(+b.dataset.see)));
}

// ---------- Results card ----------
function renderResultsCard() {
  const el = $("gRes");
  if (!el) return;
  const Rt = G.retention;
  let body = "";
  if (Rt && Rt.points && Rt.points.length > 2) {
    const dur = Rt.durationSec, spans = videoSpans(), rows = retentionBySection(Rt.points, spans.map((s) => ({ k: s.k, label: s.label, type: s.type, a: Math.min(s.a, dur), b: Math.min(s.b, dur) })).filter((s) => s.b > s.a));
    const r30 = retAt(Rt.points, 30), avg = avgViewed(Rt.points, dur), worst = rows.filter((r) => r.worst);
    body = `<div class="rs-stats"><div class="stat"><span class="l">${h(t("rsIntro"))}</span><span class="v">${r30 != null ? r30.toFixed(0) + "%" : "—"}</span></div><div class="stat"><span class="l">${h(t("rsAvg"))}</span><span class="v">${avg != null ? avg.toFixed(0) + "%" : "—"}</span></div><div class="stat"><span class="l">${h(t("rsWorstLbl"))}</span><span class="v">${worst.length ? h(worst[0].label) + ` <em>−${worst[0].perMin.toFixed(1)} ${h(t("rsPts"))}/min</em>` : "—"}</span></div></div>
      ${retChartHTML(Rt.points, dur, rows)}
      <p class="hint">${h(t("rsScale"))}</p>
      ${worst.length ? `<p class="lead">${h(t("rsWorstNote"))}</p>` : ""}
      <div class="tablewrap"><table class="pf esc"><thead><tr><th>${h(t("thSec"))}</th><th>${h(t("thVideo"))}</th><th>${h(t("rsTh0"))}</th><th>${h(t("rsTh1"))}</th><th>${h(t("rsDrop"))}</th><th>${h(t("rsPerMin"))}</th></tr></thead><tbody>
      ${rows.map((r) => `<tr${r.worst ? ' class="flagged"' : ""}><td><span class="tdot" style="--c:${r.type === "cold" ? "var(--mul)" : SEC_COLOR[r.type]}"></span>${h(r.label)}${r.worst ? `<div class="flag">${h(t("rsWorstLbl"))}</div>` : ""}</td><td>${fmtTime(r.a)}</td><td>${r.r0.toFixed(0)}%</td><td>${r.r1.toFixed(0)}%</td><td>${r.drop.toFixed(1)}</td><td>${r.perMin.toFixed(1)}</td></tr>`).join("")}</tbody></table></div>
      <div class="actions"><button class="small" id="rsClear">${h(t("rsClear"))}</button></div>`;
  }
  el.innerHTML = `<header class="g-h"><h2>${h(t("rsTitle"))}</h2></header><p class="lead">${h(t("rsLead"))}</p>
    <div class="rs-in"><div class="field"><label for="rsDur">${h(t("rsDur"))}</label><input id="rsDur" inputmode="numeric" placeholder="${h(t("targetPh"))}" value="${h(G.realDur)}"></div>
    <div class="field rs-wide"><label for="rsData">${h(t("rsPaste"))}</label><textarea id="rsData" rows="3" placeholder="${h(t("rsPh"))}" spellcheck="false"></textarea></div></div>
    <div class="actions"><button class="small primary" id="rsImport">${h(t("rsImport"))}</button><label class="small filebtn"><input type="file" id="rsFile" accept=".csv,.tsv,.txt,text/csv,text/plain"> ${h(t("rsFile"))}</label><span class="status" id="rsMsg"></span></div>${body}`;
  $("rsDur").addEventListener("change", () => { G.realDur = $("rsDur").value.trim(); markDirty(); renderChapters(); renderResultsCard(); });
  const doImport = (raw) => {
    G.realDur = $("rsDur").value.trim();
    const r = parseRetention(raw, parseMMSS(G.realDur));
    const msg = $("rsMsg");
    if (r.error) { msg.className = "status err"; msg.textContent = t("rsErr")[r.error]; return; }
    G.retention = { points: r.points.map(([a, b]) => [Math.round(a * 10) / 10, Math.round(b * 10) / 10]), durationSec: r.durationSec, at: Date.now() };
    if (!G.realDur) G.realDur = fmtTime(r.durationSec);
    markDirty(); renderResultsCard(); renderChapters();
    const m2 = $("rsMsg"); m2.className = "status"; m2.textContent = G.prodId ? t("rsSaved") : t("rsNeedProd");
  };
  $("rsImport").addEventListener("click", () => doImport($("rsData").value));
  $("rsFile").addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => doImport(String(rd.result || "")); rd.readAsText(f); });
  const cl = $("rsClear"); if (cl) cl.addEventListener("click", () => { G.retention = null; markDirty(); renderResultsCard(); });
  wireRetChart();
}
function retChartHTML(points, dur, rows) {
  const W = 720, H = 260, ml = 40, mr = 12, mt = 22, mb = 28, iw = W - ml - mr, ih = H - mt - mb;
  const x = (s) => ml + (Math.min(dur, Math.max(0, s)) / dur) * iw, y = (p) => mt + (1 - Math.max(0, Math.min(110, p)) / 110) * ih;
  const bands = rows.map((r, i) => { const x0 = x(r.a) + (i ? 1 : 0), x1 = x(r.b) - 1, wpx = x1 - x0; return `<rect x="${x0.toFixed(1)}" y="${mt}" width="${Math.max(0, wpx).toFixed(1)}" height="${ih}" fill="${r.type === "cold" ? "var(--mul)" : SEC_COLOR[r.type]}" opacity="${r.worst ? 0.26 : 0.1}"></rect>${wpx > 16 ? `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${mt - 7}" text-anchor="middle" class="rc-band">${r.k < 0 ? "0" : r.k + 1}</text>` : ""}`; }).join("");
  const grid = [0, 25, 50, 75, 100].map((p) => `<line x1="${ml}" x2="${W - mr}" y1="${y(p)}" y2="${y(p)}" class="rc-grid"></line><text x="${ml - 6}" y="${y(p) + 4}" text-anchor="end" class="rc-ax">${p}%</text>`).join("");
  const step = dur > 1800 ? 300 : dur > 600 ? 120 : 60, ticks = [];
  for (let s = 0; s <= dur; s += step) ticks.push(`<text x="${x(s)}" y="${H - 8}" text-anchor="middle" class="rc-ax">${fmtTime(s)}</text>`);
  const path = points.filter((p) => p[0] <= dur + 0.5).map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join("");
  const last = points.filter((p) => p[0] <= dur + 0.5).slice(-1)[0];
  return `<figure class="rc"><figcaption class="hint">${h(t("rsChart"))}</figcaption><div class="rc-wrap"><div class="rc-in" id="rcWrap" data-dur="${dur}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(t("rsChart"))}" preserveAspectRatio="none">${bands}${grid}${dur > 30 ? `<line x1="${x(30)}" x2="${x(30)}" y1="${mt}" y2="${mt + ih}" class="rc-30"></line>` : ""}${ticks.join("")}
    <path d="${path}" class="rc-line"></path>${last ? `<circle cx="${x(last[0])}" cy="${y(last[1])}" r="4" class="rc-end"></circle>` : ""}
    <line id="rcCross" x1="0" x2="0" y1="${mt}" y2="${mt + ih}" class="rc-cross" visibility="hidden"></line><circle id="rcDot" r="5" class="rc-dot" visibility="hidden"></circle>
    <rect x="${ml}" y="${mt}" width="${iw}" height="${ih}" fill="transparent" id="rcHit"></rect></svg><div class="rc-tip" id="rcTip" hidden></div></div></div></figure>`;
}
function wireRetChart() {
  const wrap = $("rcWrap"), hit = $("rcHit");
  if (!wrap || !hit || !G.retention) return;
  const dur = +wrap.dataset.dur, W = 720, H = 260, ml = 40, mr = 12, mt = 22, mb = 28, iw = W - ml - mr, ih = H - mt - mb;
  const spans = videoSpans();
  const move = (e) => {
    const r = wrap.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W;
    const s = Math.max(0, Math.min(dur, ((px - ml) / iw) * dur)), p = retAt(G.retention.points, s);
    const cx = ml + (s / dur) * iw, cy = mt + (1 - p / 110) * ih;
    const cross = $("rcCross"), dot = $("rcDot"), tip = $("rcTip");
    cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); cross.setAttribute("visibility", "visible");
    dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.setAttribute("visibility", "visible");
    const sp = spans.find((x) => s >= x.a && s < x.b) || spans[spans.length - 1];
    tip.innerHTML = `<b>${fmtTime(s)}</b> · ${p.toFixed(0)}%<br><span>${h(sp ? sp.label : "")}</span>`;
    tip.hidden = false;
    const left = (cx / W) * r.width;
    tip.style.left = Math.min(r.width - 150, Math.max(0, left + 10)) + "px";
    tip.style.top = Math.max(0, (cy / H) * r.height - 50) + "px";
  };
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerdown", move);
  hit.addEventListener("pointerleave", () => { $("rcCross").setAttribute("visibility", "hidden"); $("rcDot").setAttribute("visibility", "hidden"); $("rcTip").hidden = true; });
}
