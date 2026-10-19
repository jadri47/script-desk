
/* ===== Lo primero que arreglaría: evidence, proposal, proof ===== */
Object.assign(T.es, { fxOpen: "Toca para ver qué cambiaría",
  fxInScript: "En tu guion", fxWould: "Cómo quedaría", fxApply: "Aplicar", fxOther: "Otra opción", fxAi: "Proponer con IA", fxAiAgain: "Otras 3 con IA",
  fxMulti: (n) => `resuelve ${n} revisiones`, fxPartial: (n, m) => `Arregla ${n} de ${m}; el resto, con IA o a mano.`, fxApplied: "Aplicado.", fxUndo: "Deshacer", fxUndone: "Deshecho.",
  fxNoProp: "No hay un arreglo automático seguro para esto: usa la IA o corrígelo a mano.", fxEmpty: "(vacío)", fxClip: (a) => `clip de ${a}`, fxMoved: (a) => `se mueve desde ${a}`,
  fxTrim: (x) => `También se quita «${x}» de esa frase en el guion.`, fxThen: "y sigue tu guion", fxBreaks: (x) => `Ojo: haría fallar ${x}.`, fxUse: "Usar esta", fxMore: (n) => `y ${n} más`,
  fxField: { title: "Título", keyword: "Palabra clave", thumb: "Miniatura", description: "Descripción" }, fxNotFixed: "No resuelve la revisión todavía.",
  fxSkip: "Ahora no", fxAiFrom: "Solo cambia este fragmento. Cada opción pasa otra vez por todas las revisiones.", fxNone: "Nada urgente: todas las revisiones con texto que corregir pasan.",
});
Object.assign(T.en, { fxOpen: "Tap to see what would change",
  fxInScript: "In your script", fxWould: "How it would read", fxApply: "Apply", fxOther: "Other option", fxAi: "Suggest with AI", fxAiAgain: "3 more with AI",
  fxMulti: (n) => `fixes ${n} checks`, fxPartial: (n, m) => `Fixes ${n} of ${m}; the rest with AI or by hand.`, fxApplied: "Applied.", fxUndo: "Undo", fxUndone: "Undone.",
  fxNoProp: "There's no safe automatic fix for this: use the AI or fix it by hand.", fxEmpty: "(empty)", fxClip: (a) => `clip from ${a}`, fxMoved: (a) => `moved from ${a}`,
  fxTrim: (x) => `"${x}" is also removed from that line in the script.`, fxThen: "and your script continues", fxBreaks: (x) => `Careful: it would make ${x} fail.`, fxUse: "Use this", fxMore: (n) => `and ${n} more`,
  fxField: { title: "Title", keyword: "Keyword", thumb: "Thumbnail", description: "Description" }, fxNotFixed: "Doesn't pass the check yet.",
  fxSkip: "Not now", fxAiFrom: "Only this fragment changes. Every option goes through all the checks again.", fxNone: "Nothing urgent: every check with text to fix passes.",
});

state.fixUndo = state.fixUndo || [];
state.fixSel = {};
state.fixAi = {};
state.fixDismissed = new Set();
let fixMsg = "";

const rowLabel = (R, id) => { for (const rows of Object.values(R.sections)) { const r = rows.find((x) => x.id === id); if (r) return r.label; } return id; };
function markedSlice(text, a, b, marks, cls) {
  const ms = marks.filter((m) => m[0] >= a && m[1] <= b).sort((x, y) => x[0] - y[0]);
  let out = "", p = a;
  for (const [s, e] of ms) { if (s < p) continue; out += h(text.slice(p, s)) + `<mark class="${cls}">${h(text.slice(s, e))}</mark>`; p = e; }
  return out + h(text.slice(p, b));
}
// Before/after for text patches: each changed sentence with removals struck and additions underlined.
function patchPreview(text, patches) {
  const bound = (i, dir) => { if (dir < 0) { while (i > 0 && !/[.!?…\n]/.test(text[i - 1])) i--; return i; } while (i < text.length && !/[.!?…\n]/.test(text[i])) i++; while (i < text.length && /[.!?…»”"]/.test(text[i])) i++; return i; };
  const regs = [];
  for (const p of [...patches].sort((x, y) => x.start - y.start)) {
    const a = bound(p.start, -1), b = Math.max(bound(Math.max(p.start, p.end - 1), 1), p.end);
    const last = regs[regs.length - 1];
    if (last && a <= last.b) { last.b = Math.max(last.b, b); last.ps.push(p); } else regs.push({ a, b, ps: [p] });
  }
  const show = regs.slice(0, 4);
  const html = show.map((r) => {
    let out = "", pos = r.a;
    for (const p of r.ps.sort((x, y) => x.start - y.start)) {
      if (p.start < pos) continue;
      out += h(text.slice(pos, p.start));
      if (p.end > p.start) out += `<del>${h(text.slice(p.start, p.end).replace(/\n+$/, ""))}</del>`;
      if (p.rep) out += `<ins>${h(p.rep.replace(/^\n+/, ""))}</ins>`;
      pos = p.end;
    }
    out += h(text.slice(pos, r.b));
    return `<div class="fx-line">${out.trim() || "—"}</div>`;
  }).join("");
  return html + (regs.length > 4 ? `<div class="hint">${h(t("fxMore")(regs.length - 4))}</div>` : "");
}
function proposalHTML(card, p, R) {
  const text = state.text;
  let body = "";
  if (p.kind === "cold") {
    const lines = [];
    let at = 0;
    if (p.hook) { lines.push(`<div class="fx-line"><span class="fx-t">${fmtTime(at)}</span>«${h(p.hook.text)}» <span class="hint">· ${h(p.hook.mode === "move" ? t("fxMoved")(fmtTime(p.hook.t0)) : t("fxClip")(fmtTime(p.hook.t0)))}</span></div>`); at += p.hook.t1 - p.hook.t0; }
    if (p.promise) { lines.push(`<div class="fx-line"><span class="fx-t">${fmtTime(at)}</span>«${h(p.promise.text)}» <span class="hint">· ${h(p.promise.mode === "move" ? t("fxMoved")(fmtTime(p.promise.t0)) : t("fxClip")(fmtTime(p.promise.t0)))}</span></div>`); at += p.promise.t1 - p.promise.t0; }
    if (p.firstLine) lines.push(`<div class="fx-line fx-dim"><span class="fx-t">${fmtTime(at)}</span>«${h(p.firstLine.length > 90 ? p.firstLine.slice(0, 90) + "…" : p.firstLine)}» <span class="hint">· ${h(t("fxThen"))}</span></div>`);
    body = lines.join("");
    if (p.trimmed && p.patches[0]) { const orig = text.slice(p.patches[0].start, p.patches[0].end), cut = orig.slice(0, orig.length - p.hook.text.length).trim().replace(/[,;:]$/, ""); body += `<p class="hint">${h(t("fxTrim")(cut))}</p>`; }
  } else if (p.kind === "patch") body = patchPreview(text, p.patches);
  else if (p.kind === "field") body = `<div class="fx-line"><span class="fx-t">${h(t("fxField")[p.field])}</span>«${h(p.value)}»${p.field === "title" ? ` <span class="hint">· ${p.value.length} ${h(t("chars"))}</span>` : ""}</div>`;
  const fixed = p.check.fixed.map((id) => `<span class="fx-ok">✓ ${h(rowLabel(R, id))}</span>`).join("");
  const partial = p.of && !p.check.fixed.some((id) => card.ids.includes(id)) ? `<div class="hint">${h(p.scoped ? t("wkPartial")(p.patches.length, p.of - p.patches.length) : t("fxPartial")(p.patches.length, p.of))}</div>` : "";
  const broke = p.check.broke.length ? `<div class="status err">${h(t("fxBreaks")(p.check.broke.map((id) => rowLabel(p.check.R2 || R, id)).join(", ")))}</div>` : "";
  return `<div class="fx-prop">${body}${p.note ? `<p class="hint">${h(p.note)}</p>` : ""}<div class="fx-res">${fixed}</div>${partial}${broke}</div>`;
}
function evidenceHTML(card) {
  const text = state.text;
  if (card.field) {
    const v = card.field.value;
    return `<div class="fx-ev"><span class="fx-t">${h(t("fxField")[card.field.name])}</span><span>${v ? "«" + h(v) + "»" : `<span class="hint">${h(t("fxEmpty"))}</span>`}</span></div>`;
  }
  const cls = card.id === "cta" ? "fx-strike" : "fx-hl fx-" + (typeof catOfCard === "function" ? catOfCard(card) : "pol");
  return card.evidence.map((e) => `<div class="fx-ev" data-es="${e.start}" data-ee="${e.end}"><span class="fx-t">${fmtTime(e.t)}</span><span>${markedSlice(text, e.start, e.end, e.marks, cls)}</span></div>`).join("") + (card.more ? `<div class="hint">${h(t("fxMore")(card.more))}</div>` : "");
}

function fixItemsHTML(cards, R) {
  const meta = Object.fromEntries(sectionMeta().map(([k, n]) => [k, n]));
  const items = cards.map((c, ci) => {
    const sel = Math.min(state.fixSel[ci] || 0, Math.max(0, c.proposals.length - 1));
    const p = c.proposals[sel];
    const ai = state.fixAi[c.id];
    // In the guided (step) view the fixes are the whole step, so every card stays open; in the review page only the first does.
    const open = ci === 0 || (state.fixOpen && state.fixOpen.has(c.id));
    return `<li class="fx${open ? "" : " fx-closed"}" data-cat="${typeof catOfCard === "function" ? catOfCard(c) : "pol"}" data-ci="${ci}" data-fid="${h(c.id)}">
      <div class="fx-top"${open ? "" : ` role="button" tabindex="0" aria-expanded="false" title="${h(t("fxOpen"))}"`}><span class="tf-t">${h(typeof plainLabel === "function" ? plainLabel(c.id, c.label) : c.label)}</span>${(() => { const w = (c.ids || [c.id]).reduce((x, id) => { const r = Object.values(R.sections).flat().find((q) => q.id === id); return x + (r ? weightOf(r) : 0); }, 0); return w ? `<span class="fix-pts" title="${h(t("scPtsTip"))}">+${w}</span>` : ""; })()}<span class="fx-meta">${h(meta[c.sec] || c.sec)}${c.ids.length > 1 ? " · " + h(t("fxMulti")(c.ids.length)) : ""}</span></div>
      ${c.fix ? `<div class="tf-f">${h(c.fix)}</div>` : ""}
      <div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}
      <div class="fx-lbl">${h(t("fxWould"))}${p && c.proposals.length > 1 ? ` <span class="hint">· ${h(p.label)}</span>` : p ? ` <span class="hint">· ${h(p.label)}</span>` : ""}</div>
      ${p ? proposalHTML(c, p, state.result) : `<p class="hint">${h(t("fxNoProp"))}</p>`}
      <div class="actions fx-act">${p ? `<button class="small primary" data-fxapply="${ci}">${h(t("fxApply"))}</button>` : ""}${c.proposals.map((q, k) => (k === sel ? "" : `<button class="small" data-fxsel="${ci}:${k}">${h(t("fxOther"))}: ${h(q.label)}</button>`)).join("")}${c.ai ? `<button class="small" data-fxai="${ci}">${h(ai ? t("fxAiAgain") : t("fxAi"))}</button>` : ""}<button class="small linkish" data-fxskip="${ci}">${h(t("fxSkip"))}</button><a class="tf-go" href="#sec-${c.sec}" data-open="${c.sec}">${h(t("seeIn"))} ${h(meta[c.sec] || c.sec)} →</a></div>
      <div class="fx-ai" id="fxai-${ci}">${ai ? aiOptionsHTML(ci, ai) : ""}</div></li>`;
  }).join("");
  return items;
}
topFixHTML = function (R) {
  const cards = buildFixCards(state.text, R, state.opts, failedRows(R).filter((r) => !state.fixDismissed.has(r.id)), 3);
  state.fixCards = cards;
  const meta = Object.fromEntries(sectionMeta().map(([k, n]) => [k, n]));
  const undo = state.fixUndo.length ? `<button class="small" id="fxUndo">${h(t("fxUndo"))}</button>` : "";
  const head = `<div class="fx-head"><h3>${h(t("topTitle"))}</h3><span class="status" id="fxMsg">${h(fixMsg)}</span>${undo}</div>`;
  fixMsg = "";
  if (!cards.length) return `<div class="topfix">${head}<p class="lead" style="margin:0">${h(t("fxNone"))}</p></div>`;
  const items = fixItemsHTML(cards, R);
  return `<div class="topfix">${head}<ol class="fx-list">${items}</ol></div>`;
};

function aiOptionsHTML(ci, ai) {
  if (ai.error) return `<p class="status err">${h(ai.error)}</p>`;
  if (ai.loading) return `<p class="status">${h(t("thinking"))}</p>`;
  const c = state.fixCards[ci];
  return `<p class="hint">${h(t("fxAiFrom"))}</p>` + ai.options.map((o, k) => `<div class="fx-aiopt">${proposalHTML(c, o, state.result)}${o.why ? `<div class="hint">${h(o.why)}</div>` : ""}<div class="actions"><button class="small${o.check.broke.length ? "" : " primary"}" data-fxaiuse="${ci}:${k}">${h(t("fxUse"))}</button>${!o.check.fixed.some((id) => c.ids.includes(id)) ? `<span class="hint">${h(t("fxNotFixed"))}</span>` : ""}</div></div>`).join("");
}

function snapshotForUndo() {
  return { text: $("script").value, title: $("title").value, keyword: $("keyword").value, thumb: $("thumb").value, description: $("description").value, cold: JSON.parse(JSON.stringify(G.cold)) };
}
function rerunReview(msg) {
  fixMsg = msg || "";
  updateLive();
  state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts);
  renderResults();
  const tf = document.querySelector("#results .topfix") || document.querySelector("#guide .topfix");
  if (tf) tf.scrollIntoView({ block: "start" });
  if (G.prodId) markDirty();
}
function applyProposal(p) {
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
  if (p.patches && p.patches.length) $("script").value = applyPatches(state.text, p.patches);
  if (p.kind === "cold") {
    for (const k of ["hook", "promise"]) { const c = p[k]; G.cold[k] = c ? { i: c.i, anchor: c.text.slice(0, 80), text: c.text, mode: c.mode } : G.cold[k]; }
  }
  if (p.kind === "field") { $(p.field).value = p.value; if (p.field === "keyword" || p.field === "title" || p.field === "description") $("extraFields").open = true; }
  state.fixSel = {}; state.fixAi = {};
  rerunReview(t("fxApplied"));
}
function undoFix() {
  const s = state.fixUndo.pop();
  if (!s) return;
  $("script").value = s.text; $("title").value = s.title; $("keyword").value = s.keyword; $("thumb").value = s.thumb; $("description").value = s.description; G.cold = s.cold;
  state.fixSel = {}; state.fixAi = {};
  rerunReview(t("fxUndone"));
}

async function aiFix(ci) {
  const c = state.fixCards[ci], sample = await caps.sample;
  if (!sample) { state.fixAi[c.id] = { error: t("aiOnlyClaude") }; $("fxai-" + ci).innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); return; }
  state.fixAi[c.id] = { loading: true };
  $("fxai-" + ci).innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]);
  const R = state.result, text = state.text, a = c.ai;
  const fieldMode = !!a.field;
  const frag = fieldMode ? (state.opts[a.field] || "") : text.slice(a.start, a.end);
  const ctx = fieldMode ? text.slice(0, 2500) : text.slice(Math.max(0, a.start - 400), Math.min(text.length, a.end + 400));
  const extra = [
    a.keyword ? `Incluye la palabra clave «${a.keyword}» de forma natural.` : "",
    a.insertQuestion ? "Añade al final una pregunta directa al oyente o un anticipo de lo que viene, para recuperar su atención." : "",
    a.note || "",
    a.keepTerms ? "No cambies los términos sensibles por eufemismos: quita el detalle gráfico, la garantía de resultados o el lenguaje deshumanizante, y conserva el tema." : "",
    a.field === "title" ? "Es el título del video: 60 caracteres o menos, con la palabra clave al inicio, como la pregunta que alguien escribiría en YouTube, prometiendo solo lo que el guion entrega." : "",
    a.field === "thumb" ? "Es el texto de la miniatura: 1 a 4 palabras (24 caracteres como máximo), sin repetir el título." : "",
    a.field === "description" ? "Es la descripción: los primeros 150 caracteres dicen la promesa con la palabra clave." : "",
  ].filter(Boolean).join(" ");
  const prompt = `Eres editor de guiones para un pódcast cristiano de enseñanza bíblica en YouTube. ${voice()}
Problema detectado: «${c.label}». ${c.info || ""} ${c.fix || ""}
Reescribe SOLO el fragmento de abajo para resolver ese problema. Escribe 3 opciones distintas. Mantén el sentido, la teología y el tono del presentador; no inventes datos, nombres, cifras ni citas; copia exacto cualquier versículo entre comillas; sin frases de plantilla. ${extra}
El fragmento reescrito va en ${scriptLangName()}. ${t("outLang")}
Responde solo con JSON: {"options": [{"text": "...", "why": "una frase"}]}

CONTEXTO (no lo reescribas):
"""
${ctx}
"""

FRAGMENTO A REESCRIBIR:
"""
${frag}
"""`;
  try {
    const res = await sample.json(prompt, { modelTier: "default" });
    const opts = (res && Array.isArray(res.options) ? res.options : []).filter((o) => o && typeof o.text === "string" && o.text.trim()).slice(0, 3);
    if (!opts.length) throw { code: "invalid_json" };
    state.fixAi[c.id] = {
      options: opts.map((o) => {
        const val = o.text.trim();
        const p = fieldMode ? { kind: "field", field: a.field, value: val, label: "IA" } : { kind: "patch", patches: [{ start: a.start, end: a.end, rep: val }], label: "IA" };
        return { ...p, why: String(o.why || ""), check: verifyProposal(text, state.opts, R, p) };
      }),
    };
  } catch (e) { state.fixAi[c.id] = { error: errText(e) }; }
  const box = $("fxai-" + ci);
  if (box) { box.innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); wireAiOptions(box); }
}
function wireAiOptions(root) {
  root.querySelectorAll("[data-fxaiuse]").forEach((b) => b.addEventListener("click", () => { const [ci, k] = b.dataset.fxaiuse.split(":").map(Number); const c = state.fixCards[ci]; applyProposal(state.fixAi[c.id].options[k]); }));
}
function wireFixes() {
  const root = document.querySelector("#results .topfix") || document.querySelector("#guide .topfix");
  if (!root) return;
  root.querySelectorAll("li.fx-closed > .fx-top").forEach((top) => { const go = () => { const li = top.closest("li"); state.fixOpen = state.fixOpen || new Set(); state.fixOpen.add(li.dataset.fid); li.classList.remove("fx-closed"); top.removeAttribute("role"); top.removeAttribute("tabindex"); top.removeAttribute("aria-expanded"); }; top.addEventListener("click", go); top.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); });
  root.querySelectorAll("[data-fxapply]").forEach((b) => b.addEventListener("click", () => { const ci = +b.dataset.fxapply, c = state.fixCards[ci]; applyProposal(c.proposals[Math.min(state.fixSel[ci] || 0, c.proposals.length - 1)]); }));
  root.querySelectorAll("[data-fxsel]").forEach((b) => b.addEventListener("click", () => { const [ci, k] = b.dataset.fxsel.split(":").map(Number); state.fixSel[ci] = k; const keep = window.scrollY; renderResults(); window.scrollTo(0, keep); }));
  root.querySelectorAll("[data-fxai]").forEach((b) => b.addEventListener("click", () => { b.disabled = true; aiFix(+b.dataset.fxai); }));
  wireAiOptions(root);
  const u = $("fxUndo"); if (u) u.addEventListener("click", undoFix);
  root.querySelectorAll("[data-fxskip]").forEach((b) => b.addEventListener("click", () => { state.fixCards[+b.dataset.fxskip].ids.forEach((id) => state.fixDismissed.add(id)); const keep = window.scrollY; renderResults(); window.scrollTo(0, keep); }));
  caps.sample.then((s) => { if (!s) root.querySelectorAll("[data-fxai]").forEach((b) => (b.disabled = true)); });
}
const _renderResultsFx = renderResults;
renderResults = function () { _renderResultsFx(); wireFixes(); };
$("runBtn").addEventListener("click", () => { state.fixUndo = []; state.fixSel = {}; state.fixAi = {}; state.fixDismissed = new Set(); }, true);
