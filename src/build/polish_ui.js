/* ===== Revisión de redacción (Sonnet) y mejora por sección (Opus), con los versículos blindados en código ===== */
Object.assign(T.es, {
  moreRewrite: "Revisar redacción y gramática con IA", rwTitle: "Revisar redacción y gramática",
  rwDesc: "La IA lee todo el guion y propone correcciones de gramática, ortografía, puntuación, muletillas y frases confusas. Tú aceptas o rechazas cada una. No reescribe el guion ni toca versículos, referencias ni términos sensibles.",
  rwBtn: "Revisar texto",
  polSafe: "Protejo todo lo que esté entre comillas « » o “ ” y las referencias bíblicas: la IA ni siquiera ve esos versículos. Si lees un versículo sin comillas, ponlo entre comillas para protegerlo.",
  polNone: "No encontré correcciones que valgan la pena.",
  polCount: (n) => `${n} sugerencia${n === 1 ? "" : "s"}`,
  polAll: (n) => `Aceptar las ${n}`, polOk: "Aceptar", polSkip: "Omitir", polUndo: "Deshacer",
  polDrop: (d) => `Descarté ${d.total} sugerencia${d.total === 1 ? "" : "s"} que no pasaron la verificación${d.bible ? `: ${d.bible} tocaba${d.bible === 1 ? "" : "n"} un versículo o una referencia` : ""}${d.notFound + d.ambiguous ? `${d.bible ? "; " : ": "}${d.notFound + d.ambiguous} no coincid${d.notFound + d.ambiguous === 1 ? "ía" : "ían"} exactamente con tu texto` : ""}.`,
  polKinds: { grammar: "Gramática", spelling: "Ortografía", punctuation: "Puntuación", filler: "Muletilla", clarity: "Claridad", word: "Palabra" },
  polDone: (n) => `${n} aplicada${n === 1 ? "" : "s"}.`,
  secAiBtn: "Mejorar esta sección con IA",
  secAiHint: "Te da dos opciones de esta sección con la IA (más lento, unos centavos). Los versículos entre comillas no se tocan.",
  secAiBusy: "Escribiendo dos opciones…", secAiUse: "Usar esta", secAiDiscard: "Descartar", secAiApplied: "Sección reemplazada.",
  secAiChanged: "El guion cambió mientras se escribía la opción. Pídela de nuevo.",
  secAiBad: (n) => `${n} opción${n === 1 ? "" : "es"} descartada${n === 1 ? "" : "s"}: alteraba${n === 1 ? "" : "n"} un versículo, una referencia o una cita.`,
  secAiFixes: (n) => `Arregla ${n} revisión${n === 1 ? "" : "es"}`, secAiBreaks: (n) => `Rompe ${n}`, secAiOpt: (n) => `Opción ${n}`,
  secAiNone: "La IA no devolvió una opción válida. Prueba de nuevo.",
  secAiEdge: "Un versículo cruza el límite de esta sección, así que no se puede proteger. Ajusta el inicio o el fin de la sección y vuelve a intentar.",
  secAiStale: "Actualiza la vista del guion y vuelve a intentar.",
});
Object.assign(T.en, {
  moreRewrite: "Review wording and grammar with AI", rwTitle: "Review wording and grammar",
  rwDesc: "The AI reads the whole script and suggests fixes for grammar, spelling, punctuation, fillers and confusing sentences. You accept or reject each one. It doesn't rewrite the script or touch verses, references or sensitive terms.",
  rwBtn: "Review text",
  polSafe: "Anything inside quotation marks « » or “ ” and Bible references are protected: the AI never even sees those verses. If you read a verse without quotation marks, put it in quotes to protect it.",
  polNone: "I found no corrections worth making.",
  polCount: (n) => `${n} suggestion${n === 1 ? "" : "s"}`,
  polAll: (n) => `Accept all ${n}`, polOk: "Accept", polSkip: "Skip", polUndo: "Undo",
  polDrop: (d) => `I dropped ${d.total} suggestion${d.total === 1 ? "" : "s"} that failed verification${d.bible ? `: ${d.bible} touched a verse or reference` : ""}${d.notFound + d.ambiguous ? `${d.bible ? "; " : ": "}${d.notFound + d.ambiguous} ${d.notFound + d.ambiguous === 1 ? "doesn't" : "don't"} match your text exactly` : ""}.`,
  polKinds: { grammar: "Grammar", spelling: "Spelling", punctuation: "Punctuation", filler: "Filler", clarity: "Clarity", word: "Word" },
  polDone: (n) => `${n} applied.`,
  secAiBtn: "Improve this section with AI",
  secAiHint: "Gives you two options for this section using the AI (slower, a few cents). Verses inside quotation marks are never touched.",
  secAiBusy: "Writing two options…", secAiUse: "Use this", secAiDiscard: "Discard", secAiApplied: "Section replaced.",
  secAiChanged: "The script changed while the option was being written. Ask again.",
  secAiBad: (n) => `${n} option${n === 1 ? "" : "s"} dropped: ${n === 1 ? "it" : "they"} altered a verse, a reference or a quote.`,
  secAiFixes: (n) => `Fixes ${n} check${n === 1 ? "" : "s"}`, secAiBreaks: (n) => `Breaks ${n}`, secAiOpt: (n) => `Option ${n}`,
  secAiNone: "The AI didn't return a valid option. Try again.",
  secAiEdge: "A verse crosses the edge of this section, so it can't be protected. Adjust where the section starts or ends and try again.",
  secAiStale: "Refresh the script view and try again.",
});

// Save the scroll position of the pane that scrolls, run a change, put it back.
function keepScroll(fn) {
  const sc = SPLIT.on && $("paneR") ? $("paneR") : document.scrollingElement;
  const y = sc ? sc.scrollTop : 0;
  fn();
  if (sc) sc.scrollTop = y;
}
function pushUndo() {
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
}
function reviewAfterEdit(msg) {
  fixMsg = msg || "";
  updateLive();
  state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts);
  renderResults();
  if (G.prodId) markDirty();
}

// ---------- 1) Whole-script grammar and wording review (Sonnet) ----------
const POL = { items: [], drop: null, asked: null, applied: 0 };
function polishPrompt(masked, R) {
  const P = protectedList(R);
  return `Eres corrector y editor de estilo de guiones para un pódcast cristiano de enseñanza bíblica en YouTube. El autor es el presentador: su voz, su argumento y su teología no se tocan. ${voice()}
${t("outLang")} El guion está en ${scriptLangName()}.

Lee el guion completo y devuelve SOLO sugerencias puntuales de corrección. No reescribas el guion.

QUÉ SÍ: errores de gramática y concordancia, ortografía, puntuación, palabras repetidas, muletillas que estorban, frases confusas o demasiado largas para decirlas en voz alta, y palabras genéricas cuando hay una alternativa mejor que encaja.
QUÉ NO: no cambies el sentido, el orden, los argumentos, las ilustraciones ni la doctrina; no añadas contenido, datos, nombres, cifras ni citas; no cambies el tono del presentador. Si algo está bien, déjalo.
VERSÍCULOS: los versículos del guion fueron reemplazados por marcas como ⟦V1⟧. No las toques ni las incluyas en ninguna sugerencia. No escribas ni cites ningún versículo, y no añadas referencias bíblicas. Las referencias que sí ves (por ejemplo «Juan 3:16») no se cambian.
TÉRMINOS SENSIBLES (no los cambies por eufemismos): ${P.risk}

Reglas de cada sugerencia:
- "original": texto copiado EXACTO del guion (mismas mayúsculas, tildes, puntuación y espacios), de 3 a 25 palabras, y que aparezca UNA sola vez en el guion; incluye las palabras vecinas necesarias para que sea único.
- "corrected": el mismo fragmento ya corregido, con el cambio mínimo.
- "kind": uno de grammar, spelling, punctuation, filler, clarity, word.
- "reason": una frase corta en ${UI === "en" ? "inglés" : "español"} que diga qué estaba mal.
Máximo 40 sugerencias, las más valiosas primero. Si no hay nada que corregir, devuelve una lista vacía.

Responde solo con JSON: {"suggestions": [{"original": "...", "corrected": "...", "kind": "grammar", "reason": "..."}], "summary": "una frase"}

GUION:
"""
${masked}
"""`;
}
async function doPolish(sample, out) {
  const text = $("script").value, opts = readOpts(), R = analyze(text, opts);
  const spans = verseSpans(text, R), mk = maskVerses(text, spans, 0, text.length);
  const res = await sample.json(polishPrompt(mk.masked, R), { signal: aiCtl.signal, modelTier: "complex" });
  const list = Array.isArray(res && res.suggestions) ? res.suggestions.slice(0, 60) : null;
  if (!list) throw { code: "invalid_json" };
  const v = vetSuggestions(text, spans, list);
  POL.items = v.items.map((x, i) => ({ ...x, id: i, st: "open" }));
  POL.drop = { ...v.drop, total: v.drop.notFound + v.drop.ambiguous + v.drop.bible + v.drop.invalid };
  POL.asked = list.length; POL.applied = 0;
  renderPolish();
}
doRewrite = async function (sample, out) { return doPolish(sample, out); };

function polLive() {
  const text = $("script").value;
  return POL.items.filter((x) => x.st === "open" && relocateSuggestion(text, x) != null);
}
function renderPolish() {
  const outs = document.querySelectorAll('[id="out-rewrite"]');
  if (!outs.length) return;
  let html = `<p class="hint pol-safe">${h(t("polSafe"))}</p>`;
  if (POL.asked != null) {
    const live = polLive(), k = t("polKinds");
    const undo = state.fixUndo.length ? `<button class="small" data-pol-undo>${h(t("polUndo"))}</button>` : "";
    if (!live.length && !POL.items.length) html += `<p class="status">${h(t("polNone"))}</p>`;
    else html += `<div class="pol-head"><b>${h(t("polCount")(live.length))}</b>${POL.applied ? `<span class="hint">${h(t("polDone")(POL.applied))}</span>` : ""}
        ${live.length > 1 ? `<button class="small primary" data-pol-all>${h(t("polAll")(live.length))}</button>` : ""}${undo}</div>
      <ul class="pol-list">${live.map((x) => `<li class="pol-item"><span class="chip">${h(k[x.kind] || x.kind)}</span>
        <p class="pol-diff"><s>${h(x.original)}</s> → <ins>${h(x.corrected)}</ins></p>${x.reason ? `<p class="hint">${h(x.reason)}</p>` : ""}
        <div class="actions"><button class="small primary" data-pol-ok="${x.id}">${h(t("polOk"))}</button><button class="small" data-pol-skip="${x.id}">${h(t("polSkip"))}</button></div></li>`).join("")}</ul>`;
    if (POL.drop && POL.drop.total) html += `<p class="hint pol-drop">${h(t("polDrop")(POL.drop))}</p>`;
  }
  outs.forEach((out) => {
    out.innerHTML = html;
    out.querySelectorAll("[data-pol-ok]").forEach((b) => b.addEventListener("click", () => polAccept([+b.dataset.polOk])));
    out.querySelectorAll("[data-pol-skip]").forEach((b) => b.addEventListener("click", () => { const x = POL.items.find((i) => i.id === +b.dataset.polSkip); if (x) x.st = "skip"; keepScroll(renderPolish); }));
    out.querySelectorAll("[data-pol-all]").forEach((b) => b.addEventListener("click", () => polAccept(polLive().map((x) => x.id))));
    out.querySelectorAll("[data-pol-undo]").forEach((b) => b.addEventListener("click", () => { keepScroll(() => { undoFix(); POL.items.forEach((x) => { if (x.st === "done") x.st = "open"; }); POL.applied = 0; renderPolish(); }); }));
  });
}
// Each suggestion is re-found in the current text right before it is applied; a change that no longer fits is skipped, never forced.
function polAccept(ids) {
  keepScroll(() => {
    let text = $("script").value, n = 0;
    const before = text;
    for (const id of ids) {
      const x = POL.items.find((i) => i.id === id);
      if (!x || x.st !== "open") continue;
      const next = applySuggestion(text, x);
      if (next == null) { x.st = "stale"; continue; }
      text = next; x.st = "done"; n++;
    }
    if (!n) { renderPolish(); return; }
    pushUndo();
    $("script").value = text;
    POL.applied += n;
    reviewAfterEdit(t("fxApplied"));
    if (G.mode === "guion") gRefresh();
  });
}
// The results area is rebuilt after every review; put the list back.
const _renderResultsPol = renderResults;
renderResults = function () { _renderResultsPol(); renderPolish(); };

// ---------- 2) "Mejorar esta sección": two options on Opus, Scripture locked ----------
const SECAI = {};
const secAiKey = (k) => String(k);
function secAiHTML(k) {
  const st = SECAI[secAiKey(k)];
  const btn = `<button type="button" class="small" data-secai="${k}"${st && st.busy ? " disabled" : ""}>✦ ${h(t("secAiBtn"))}</button>`;
  let body = "";
  if (st) {
    if (st.busy) body = `<p class="status">${h(t("secAiBusy"))}</p>`;
    else if (st.err) body = `<p class="status err">${h(st.err)}</p>`;
    else if (st.applied) body = `<p class="status ok">${h(t("secAiApplied"))} <button type="button" class="small" data-secai-undo="${k}">${h(t("polUndo"))}</button></p>`;
    else if (st.options) {
      const stale = G.text !== st.textAt;
      body = stale ? `<p class="status err">${h(t("secAiChanged"))}</p>` : st.options.map((o, j) => {
        const diff = wordDiff(st.orig, o.text).map((x) => (x.changed ? `<ins>${h(x.text)}</ins>` : h(x.text))).join("");
        return `<div class="secai-opt"><div class="secai-h"><b>${h(t("secAiOpt")(j + 1))}</b>
          ${o.fixed.length ? `<span class="chip ok">${h(t("secAiFixes")(o.fixed.length))}</span>` : ""}${o.broke.length ? `<span class="chip warn">${h(t("secAiBreaks")(o.broke.length))}: ${h(o.broke.join(", "))}</span>` : ""}</div>
          ${o.why ? `<p class="hint">${h(o.why)}</p>` : ""}<div class="diff">${diff}</div>
          <div class="actions"><button type="button" class="small primary" data-secai-use="${k}:${j}">${h(t("secAiUse"))}</button><button type="button" class="small" data-secai-no="${k}:${j}">${h(t("secAiDiscard"))}</button></div></div>`;
      }).join("") + (st.bad ? `<p class="hint">${h(t("secAiBad")(st.bad))}</p>` : "");
    }
  }
  return `<div class="st-ai"><div class="st-ai-bar">${btn}<span class="hint">${h(t("secAiHint"))}</span></div><div class="st-ai-out">${body}</div></div>`;
}
function secAiPrompt(s, k, masked, R) {
  const hookU = G.U[0], prev = G.U[s.first - 1], next = G.U[s.last + 1];
  const risk = [...new Set(R.riskHits.map((x) => x.text))].map((x) => `«${x}»`).join(", ") || "—";
  return `Eres editor de guiones para un pódcast cristiano de enseñanza bíblica en YouTube. El autor es el presentador: su voz, su argumento y su teología no se tocan. ${voice()}
${t("outLang")} El texto queda en ${scriptLangName()}.

Reescribe SOLO la sección de abajo ("${secLabel(s)}") para que funcione mejor dicha en video: frases más cortas y habladas, sin muletillas, con ritmo, claridad y gramática correcta. Conserva el mensaje, el orden de las ideas, los argumentos, las ilustraciones y el tono del presentador.
Escribe DOS opciones distintas:
- Opción 1: cambios mínimos; casi todo queda igual.
- Opción 2: más ágil y hablada, con más cambios, sin perder nada de lo que dice.
No añadas enseñanza, datos, nombres, cifras, citas ni referencias nuevas. No uses frases de plantilla como "sin más preámbulos" o "profundicemos". Mantén la longitud (±15 %).
VERSÍCULOS: los versículos de esta sección fueron reemplazados por marcas como ⟦V1⟧. Copia cada marca EXACTA, una sola vez, en el mismo orden y en el mismo lugar lógico. No escribas, cites ni parafrasees ningún versículo. Las referencias bíblicas visibles (por ejemplo «Juan 3:16») se quedan exactas.
Mantén tal cual cualquier línea entre corchetes [así] o que empiece con #.
TÉRMINOS SENSIBLES de este guion (no los cambies por eufemismos): ${risk}

CONTEXTO (no lo reescribas):
Título del episodio: ${$("title").value || "—"}
Apertura del guion: «${hookU ? hookU.text : "—"}»
Oración anterior a la sección: «${prev ? prev.text : "—"}»
Oración siguiente a la sección: «${next ? next.text : "—"}»

Responde solo con JSON: {"options": [{"text": "la sección completa reescrita", "why": "una frase"}, {"text": "...", "why": "..."}]}

SECCIÓN A REESCRIBIR:
"""
${masked}
"""`;
}
async function doSectionAI(k) {
  const key = secAiKey(k), s = G.secs[k];
  if (!s) return;
  const sample = await caps.sample;
  const paint = () => { const box = document.querySelector(`#gs-${k} .st-ai`); if (box) { box.outerHTML = secAiHTML(k); wireSecAI(document.querySelector(`#gs-${k}`)); } };
  if (!sample) { SECAI[key] = { err: t("aiOnlyClaude") }; paint(); return; }
  const text = $("script").value;
  if (G.text !== text) { SECAI[key] = { err: t("secAiStale") }; paint(); gRefresh(); return; }
  const [a, b] = sliceRange(k), orig = text.slice(a, b);
  const opts = readOpts(), R = analyze(text, opts), spans = verseSpans(text, R), mk = maskVerses(text, spans, a, b);
  if (mk.error) { SECAI[key] = { err: t("secAiEdge") }; paint(); return; }
  const cues = (G.R && G.R.cues || []).filter((c) => c.start >= a && c.end <= b);
  SECAI[key] = { busy: true }; paint();
  aiCtl = new AbortController();
  try {
    const res = await sample.json(secAiPrompt(s, k, mk.masked, R), { signal: aiCtl.signal, modelTier: "rewrite" });
    const raw = (res && Array.isArray(res.options) ? res.options : []).filter((o) => o && typeof o.text === "string").slice(0, 3);
    const lead = orig.match(/^\s*/)[0], trail = orig.match(/\s*$/)[0];
    const labels = {};
    Object.values(R.sections).flat().forEach((r) => (labels[r.id] = r.label));
    const options = [];
    let bad = 0;
    for (const o of raw) {
      const v = vetSection(orig, mk.toks, o.text, cues);
      if (!v.ok) { bad++; continue; }
      if (v.text.trim() === orig.trim()) continue;
      const full = lead + v.text.trim() + trail;
      const chk = verifyProposal(text, opts, R, { kind: "patch", patches: [{ start: a, end: b, rep: full }] });
      options.push({ text: full, why: String(o.why || ""), fixed: chk.fixed.map((id) => labels[id] || id), broke: chk.broke.map((id) => labels[id] || id) });
    }
    if (!options.length) { SECAI[key] = { err: bad ? t("secAiBad")(bad) : t("secAiNone") }; paint(); return; }
    SECAI[key] = { options, bad, a, b, orig, textAt: text };
  } catch (e) { SECAI[key] = { err: e && e.code === "cancelled" ? "" : errText(e) }; }
  paint();
}
function secAiApply(k, j) {
  const key = secAiKey(k), st = SECAI[key];
  if (!st || !st.options || $("script").value !== st.textAt) { SECAI[key] = { err: t("secAiChanged") }; renderStructure(); return; }
  keepScroll(() => {
    pushUndo();
    $("script").value = st.textAt.slice(0, st.a) + st.options[j].text + st.textAt.slice(st.b);
    Object.keys(SECAI).forEach((x) => delete SECAI[x]);
    SECAI[key] = { applied: true };
    reviewAfterEdit(t("fxApplied"));
    gRefresh();
  });
}
function wireSecAI(root) {
  if (!root) return;
  root.querySelectorAll("[data-secai]").forEach((b) => b.addEventListener("click", () => { b.disabled = true; doSectionAI(+b.dataset.secai); }));
  root.querySelectorAll("[data-secai-use]").forEach((b) => b.addEventListener("click", () => { const [k, j] = b.dataset.secaiUse.split(":").map(Number); secAiApply(k, j); }));
  root.querySelectorAll("[data-secai-no]").forEach((b) => b.addEventListener("click", () => { const [k, j] = b.dataset.secaiNo.split(":").map(Number); const st = SECAI[secAiKey(k)]; if (st && st.options) { st.options.splice(j, 1); if (!st.options.length) delete SECAI[secAiKey(k)]; } const box = root.querySelector(".st-ai"); if (box) { box.outerHTML = secAiHTML(k); wireSecAI(root); } }));
  root.querySelectorAll("[data-secai-undo]").forEach((b) => b.addEventListener("click", () => { keepScroll(() => { undoFix(); Object.keys(SECAI).forEach((x) => delete SECAI[x]); gRefresh(); }); }));
  caps.sample.then((s) => { if (!s) root.querySelectorAll("[data-secai]").forEach((b) => (b.disabled = true)); });
}
