
/* ===== Lo primero que arreglaría: evidence, proposal, proof ===== */
Object.assign(T.es, { fxOpen: "Toca para ver qué cambiaría",
  fxInScript: "En tu guion", fxWould: "Cómo quedaría", fxApply: "Aplicar", fxOther: "Otra opción", fxAi: "Proponer con IA", fxAiAgain: "Otras opciones con IA", fxAiVerse: "Este fragmento corta un versículo por la mitad: la IA no lo reescribe. Cámbialo a mano.", fxUndoStale: "El guion cambió después de ese arreglo: Deshacer ya no es seguro. Usa «Revertir este cambio» en la lista de cambios o corrígelo a mano.",
  fxMulti: (n) => `resuelve ${n} revisiones`, fxPartial: (n, m) => `Arregla ${n} de ${m}; el resto, con IA o a mano.`, fxApplied: "Aplicado.", fxUndo: "Deshacer", fxUndone: "Deshecho.",
  fxNoProp: "No hay un arreglo automático seguro para esto: usa la IA o corrígelo a mano.", fxUpTo: "Hasta", fxNoteTag: "Nota", fxNoteHow: "Sin cambio automático: es una decisión tuya (no inventamos la referencia ni acortamos el pasaje).", fxZeroMore: (n) => `La nota sube cuando quedan menos: faltan ${n} en otros párrafos.`, fxZeroFloor: "La nota ya está en 0: empieza a subir cuando arregles varias cosas más.", fxZeroRed: "Un aviso rojo limita la nota a 69 hasta que lo arregles.", fxZeroCap: "Ya cuentas el máximo de puntos por esto; la nota sube al arreglar varios.", fxEmpty: "(vacío)", fxClip: (a) => `clip de ${a}`, fxMoved: (a) => `se mueve desde ${a}`,
  fxTrim: (x) => `También se quita «${x}» de esa frase en el guion.`, fxThen: "y sigue tu guion", fxBreaks: (x) => `Ojo: haría fallar ${x}.`, fxUse: "Usar esta", fxMore: (n) => `y ${n} más`,
  fxField: { title: "Título", keyword: "Palabra clave", thumb: "Miniatura", description: "Descripción" }, fxNotFixed: "No resuelve la revisión todavía.",
  fxSkip: "Ahora no", fxDone: "Aplicado", fxWhy: "Qué corrige", fxOpt: "Opción elegida", fxWhere: "Dónde", fxWords: "Palabras", fxScore: "Puntuación", fxRevert: "Revertir este cambio", fxReverted: "Cambio revertido.", fxCantRevert: "No se puede revertir solo este cambio: el texto ya cambió en ese lugar. Usa Deshacer o corrígelo a mano.", fxParaN: (n, tm) => `Párrafo ${n}${tm ? " · " + tm : ""}`, fxBefore: "Antes", fxAfter: "Después", fxShowChange: "Ver el cambio", fxEmptyChg: "(se quitó)", fxSkipped: "Ignorado", fxRestore: "Restaurar", fxStale: "El guion cambió mientras tanto: la revisión se actualizó. Vuelve a aplicar.", fxNoChange: "Esto no cambió el texto del guion.", fxOut: (f) => `Se aplicó en «${f}» (en Preparar), no dentro del guion.`, fxOutCold: "Se aplicó al arranque (los primeros segundos), no dentro del texto del guion.", fxRestored: "Restaurado.", fxAiFrom: "Solo cambia este fragmento. Cada opción pasa otra vez por todas las revisiones.", fxNone: "Nada urgente: todas las revisiones con texto que corregir pasan.",
});
Object.assign(T.en, { fxOpen: "Tap to see what would change",
  fxInScript: "In your script", fxWould: "How it would read", fxApply: "Apply", fxOther: "Other option", fxAi: "Suggest with AI", fxAiAgain: "More options with AI", fxAiVerse: "This fragment cuts a verse in half: the AI won't rewrite it. Change it by hand.", fxUndoStale: "The script changed after that fix: Undo is no longer safe. Use “Revert this change” in the change list or fix it by hand.",
  fxMulti: (n) => `fixes ${n} checks`, fxPartial: (n, m) => `Fixes ${n} of ${m}; the rest with AI or by hand.`, fxApplied: "Applied.", fxUndo: "Undo", fxUndone: "Undone.",
  fxNoProp: "There's no safe automatic fix for this: use the AI or fix it by hand.", fxUpTo: "Up to", fxNoteTag: "Note", fxNoteHow: "No automatic change: this one is your call (we don't invent the reference or shorten the passage).", fxZeroMore: (n) => `The score moves once fewer remain: ${n} left in other paragraphs.`, fxZeroFloor: "The score is already at 0: it starts rising once you fix several more.", fxZeroRed: "A red warning holds the score at 69 until it's fixed.", fxZeroCap: "This already counts the most points it can; the score rises as you fix several.", fxEmpty: "(empty)", fxClip: (a) => `clip from ${a}`, fxMoved: (a) => `moved from ${a}`,
  fxTrim: (x) => `"${x}" is also removed from that line in the script.`, fxThen: "and your script continues", fxBreaks: (x) => `Careful: it would make ${x} fail.`, fxUse: "Use this", fxMore: (n) => `and ${n} more`,
  fxField: { title: "Title", keyword: "Keyword", thumb: "Thumbnail", description: "Description" }, fxNotFixed: "Doesn't pass the check yet.",
  fxSkip: "Not now", fxDone: "Applied", fxWhy: "What it fixes", fxOpt: "Option chosen", fxWhere: "Where", fxWords: "Words", fxScore: "Score", fxRevert: "Revert this change", fxReverted: "Change reverted.", fxCantRevert: "This change can't be reverted on its own: the text has changed there since. Use Undo or fix it by hand.", fxParaN: (n, tm) => `Paragraph ${n}${tm ? " · " + tm : ""}`, fxBefore: "Before", fxAfter: "After", fxShowChange: "See the change", fxEmptyChg: "(removed)", fxSkipped: "Ignored", fxRestore: "Restore", fxStale: "The script changed meanwhile: the review was refreshed. Apply again.", fxNoChange: "This didn't change the script text.", fxOut: (f) => `Applied to "${f}" (in Prepare), not inside the script.`, fxOutCold: "Applied to the cold open (first seconds), not inside the script text.", fxRestored: "Restored.", fxAiFrom: "Only this fragment changes. Every option goes through all the checks again.", fxNone: "Nothing urgent: every check with text to fix passes.",
});

state.fixUndo = state.fixUndo || [];
state.fixSel = {};
state.fixAi = {};
state.fixDismissed = new Set();
state.fixLog = [];
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

// The badge shows what applying the selected proposal really does to the score. With no proposal it shows the most the
// check could be worth ("Up to"). A 0 says why (jadri47, 2026-10-21: "most recommendations don't increase the rating").
function fxPtsHTML(c, p, R) {
  const rows = (c.ids || [c.id]).map((id) => Object.values(R.sections).flat().find((q) => q.id === id)).filter(Boolean);
  const w = rows.reduce((x, r) => x + weightOf(r), 0);
  if (!p || p.check.score == null) return { html: w ? `<span class="fix-pts" title="${h(t("scPtsTip"))}">${h(t("fxUpTo"))} +${w}</span>` : "", why: "" };
  const cur = scoreOf(R, state.fixDismissed), gain = p.check.score - cur.score;
  if (gain > 0) return { html: `<span class="fix-pts" title="${h(t("scPtsTip"))}">+${gain}</span>`, why: "" };
  const row = rows.find((r) => r.n != null);
  const left = row ? Math.max(0, row.n - (p.patches ? p.patches.length : 0)) : 0;
  const why = cur.score === 0 ? t("fxZeroFloor") : cur.band === "rojo" && cur.score >= 69 ? t("fxZeroRed") : row && left > (row.lim || 0) ? t("fxZeroMore")(left) : row ? t("fxZeroCap") : "";
  return { html: `<span class="fix-pts fix-pts0" title="${h(why || t("scPtsTip"))}">+0</span>`, why };
}
// Advice the rules forbid turning into a text change: shown as a note (no Apply, no points badge, no "Ahora no"). It still counts in the score.
// (jadri47, 2026-10-21: "Notes, not cards")
const FX_NOTES = new Set(["refs", "reading"]);
function fixItemsHTML(cards, R) {
  const meta = Object.fromEntries(sectionMeta().map(([k, n]) => [k, n]));
  const whySeen = new Set(); // the "+0 reason" line shows once per check id in one list; later cards keep it in the badge title (jadri47, 2026-10-21: "it repeated on every card")
  const items = cards.map((c, ci) => {
    if (FX_NOTES.has(c.id)) return `<li class="fx fx-note" data-cat="${typeof catOfCard === "function" ? catOfCard(c) : "pol"}" data-ci="${ci}" data-fid="${h(c.id)}">
      <div class="fx-top"><span class="tf-t">${h(typeof plainLabel === "function" ? plainLabel(c.id, c.label) : c.label)}</span><span class="fx-meta">${h(t("fxNoteTag"))}</span></div>
      ${c.fix ? `<div class="tf-f">${h(c.fix)}</div>` : ""}<div class="fx-lbl">${h(t("fxInScript"))}</div>${evidenceHTML(c)}
      <p class="hint">${h(t("fxNoteHow"))}</p><div class="actions fx-act"><button class="small linkish" data-fxskip="${ci}">${h(t("fxSkip"))}</button><a class="tf-go" href="#sec-${c.sec}" data-open="${c.sec}">${h(t("seeIn"))} ${h(meta[c.sec] || c.sec)} →</a></div></li>`; // "Ahora no" stays: the person may decide it does not apply
    const sel = Math.min(state.fixSel[ci] || 0, Math.max(0, c.proposals.length - 1));
    const p = c.proposals[sel];
    const ai = state.fixAi[c.id];
    const pts = fxPtsHTML(c, p, R);
    if (pts.why) { if (whySeen.has(c.id)) pts.why = ""; else whySeen.add(c.id); }
    // In the guided (step) view the fixes are the whole step, so every card stays open; in the review page only the first does.
    const open = ci === 0 || (state.fixOpen && state.fixOpen.has(c.id));
    return `<li class="fx${open ? "" : " fx-closed"}" data-cat="${typeof catOfCard === "function" ? catOfCard(c) : "pol"}" data-ci="${ci}" data-fid="${h(c.id)}">
      <div class="fx-top"${open ? "" : ` role="button" tabindex="0" aria-expanded="false" title="${h(t("fxOpen"))}"`}><span class="tf-t">${h(typeof plainLabel === "function" ? plainLabel(c.id, c.label) : c.label)}</span>${pts.html}<span class="fx-meta">${h(meta[c.sec] || c.sec)}${c.ids.length > 1 ? " · " + h(t("fxMulti")(c.ids.length)) : ""}</span></div>
      ${c.fix ? `<div class="tf-f">${h(c.fix)}</div>` : ""}${pts.why ? `<div class="hint fx-why">${h(pts.why)}</div>` : ""}
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
let fxUid = 0;
// undo one accepted change without touching the others
function fxRevert(uid) {
  const e = state.fixLog.find((x) => x.uid === uid);
  if (!e) return;
  if (state.text.trimEnd() !== $("script").value.trimEnd()) { rerunReview(t("fxStale")); return; }
  const cur = state.text;
  let next = null, at = -1;
  if (e.where === "script" && e.chg) {
    const c = e.chg, tryAt = (needle, off) => { const i = cur.indexOf(needle); return i >= 0 && cur.indexOf(needle, i + 1) < 0 ? i + off : -1; };
    at = tryAt(c.cPre + c.rawTo + c.cPost, c.cPre.length);
    if (at < 0 && c.rawTo.length > 12) at = tryAt(c.rawTo, 0);
    if (at < 0) { rerunReview(t("fxCantRevert")); return; }
    next = cur.slice(0, at) + c.rawFrom + cur.slice(at + c.rawTo.length);
  }
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
  if (next != null) $("script").value = next;
  state.fixUndo[state.fixUndo.length - 1].after = $("script").value; // (B-013)
  if (e.pk === "cold" && e.prev) G.cold = e.prev.cold;
  if (e.field && e.prev && e.prev.field != null) $(e.field).value = e.prev.field;
  state.fixLog = state.fixLog.filter((x) => x.uid !== uid);
  state.fixSel = {}; state.fixAi = {};
  rerunReview(t("fxReverted"));
  if (next != null && typeof WK !== "undefined" && WK.ok && typeof wkRange === "function") {
    const end = at + e.chg.rawFrom.length;
    let r = end > at ? wkRange(at, end) : null;
    if (!r) { const b = WK.blocks[wkBlockAt(WK.blocks, at)]; if (b) r = wkRange(b.s, b.e); }
    if (r) { wkScrollTo(r); wkFlash([r]); }
  }
}
function fxBlocksOf(c) {
  if (typeof WK === "undefined" || !WK.ok) return [];
  const out = [];
  WK.per.forEach((g, i) => { if (g.some((x) => x.card.id === c.id)) out.push(i); });
  if (WK.glob.some((x) => x.id === c.id)) out.push(WK.blocks.length);
  return out;
}
// The before/after record of one change: [pre, aEnd) of `before` became [pre2, post) of `after`, shown with a little context.
// cPre/cPost come from `after` (what revert looks for); the batch passes its own positions per item.
function fxChgOf(before, after, pre, aEnd, pre2, post) {
  const clip = (x) => (x.length > 260 ? x.slice(0, 120) + " … " + x.slice(-120) : x);
  const c0 = Math.max(0, pre - 40), c1 = Math.min(before.length, aEnd + 40), d1 = Math.min(after.length, post + 40);
  return { rawFrom: before.slice(pre, aEnd), rawTo: after.slice(pre2, post), cPre: after.slice(Math.max(0, pre2 - 30), pre2), cPost: after.slice(post, post + 30), pre: (c0 > 0 ? "…" : "") + before.slice(c0, pre), from: clip(before.slice(pre, aEnd)), to: clip(after.slice(pre2, post)), post: after.slice(post, d1) + (c1 < before.length ? "…" : "") };
}
function applyProposal(p, c) {
  // the walker stays clickable after the person types: never apply a fix computed on older text
  if (state.text.trimEnd() !== $("script").value.trimEnd()) { rerunReview(t("fxStale")); return; }
  const before = state.text;
  const after = p.patches && p.patches.length ? applyPatches(state.text, p.patches) : before;
  const textChanged = after !== before;
  if (p.kind === "patch" && !textChanged) { rerunReview(t("fxNoChange")); return; }
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
  let pre = 0, post = 0, aEnd = 0, chg = null;
  const prev = { cold: JSON.parse(JSON.stringify(G.cold)), field: p.kind === "field" ? $(p.field).value : null };
  const sc0 = typeof scoreOf === "function" && state.result ? scoreOf(state.result, state.fixDismissed).score : null;
  const words = (x) => (x.match(/\S+/g) || []).length, dw = words(after) - words(before);
  if (textChanged) {
    while (pre < before.length && pre < after.length && before[pre] === after[pre]) pre++;
    let a = before.length, b = after.length;
    while (a > pre && b > pre && before[a - 1] === after[b - 1]) { a--; b--; }
    post = b; aEnd = a;
    chg = fxChgOf(before, after, pre, aEnd, pre, post);
    $("script").value = after;
  }
  state.fixUndo[state.fixUndo.length - 1].after = $("script").value; // what Deshacer expects to find; typing since makes undo refuse (B-013, 2026-10-29)
  if (p.kind === "cold") {
    for (const k of ["hook", "promise"]) { const x = p[k]; G.cold[k] = x ? { i: x.i, anchor: x.text.slice(0, 80), text: x.text, mode: x.mode } : G.cold[k]; }
  }
  if (p.kind === "field") { $(p.field).value = p.value; if (p.field === "keyword" || p.field === "title" || p.field === "description") $("extraFields").open = true; }
  let entry = null;
  if (c) {
    const bi = typeof WK !== "undefined" && WK.ok ? WK.i : -1;
    const where = p.kind === "field" ? p.field : p.kind === "cold" && !textChanged ? "cold" : "script";
    const tm = bi >= 0 && typeof RL !== "undefined" && RL.bt && RL.bt[bi] != null && typeof fmtTime === "function" ? fmtTime(RL.bt[bi]) : "";
    entry = { uid: ++fxUid, pk: p.kind, why: c.fix || "", para: bi >= 0 && bi < WK.blocks.length ? bi + 1 : 0, tm, dw, prev, field: p.field || null, sc: [sc0, null], id: c.id, ids: c.ids || [c.id], label: typeof plainLabel === "function" ? plainLabel(c.id, c.label) : c.label, kind: "done", bi, what: p.label || "", where, chg };
    state.fixLog.push(entry);
  }
  state.fixSel = {}; state.fixAi = {};
  rerunReview(textChanged ? t("fxApplied") : p.kind === "field" ? t("fxOut")((t("fxField") || {})[p.field] || p.field) : t("fxOutCold"));
  if (entry && sc0 != null && state.result) entry.sc[1] = scoreOf(state.result, state.fixDismissed).score;
  if (textChanged && typeof WK !== "undefined" && WK.ok && typeof wkRange === "function") {
    let r = pre < post ? wkRange(pre, post) : null;
    if (!r) { const b = WK.blocks[wkBlockAt(WK.blocks, pre)]; if (b) r = wkRange(b.s, b.e); }
    if (r) { wkScrollTo(r); wkFlash([r]); }
  }
}
function fxRestore(id) {
  state.fixLog = state.fixLog.filter((x) => !(x.kind === "skip" && x.ids.includes(id)));
  state.fixDismissed.delete(id);
  const keep = window.scrollY; renderResults(); window.scrollTo(0, keep);
}
function undoFix() {
  const s = state.fixUndo[state.fixUndo.length - 1];
  if (!s) return;
  // (B-013, 2026-10-29) Undo puts back the text from before the last change; anything typed since would go with it, so it refuses
  // and points to «Revertir este cambio». Snapshots without `after` (older paths) behave as before.
  if (typeof s.after === "string" && s.after.trimEnd() !== $("script").value.trimEnd()) { rerunReview(t("fxUndoStale")); return; }
  state.fixUndo.pop();
  { const k = state.fixLog.map((x) => x.kind).lastIndexOf("done"); if (k >= 0) { const g = state.fixLog[k].grp; if (g) state.fixLog = state.fixLog.filter((x) => x.grp !== g); else state.fixLog.splice(k, 1); } } // grp: the entries of one coach batch go together
  $("script").value = s.text; $("title").value = s.title; $("keyword").value = s.keyword; $("thumb").value = s.thumb; $("description").value = s.description; G.cold = s.cold;
  state.fixSel = {}; state.fixAi = {};
  rerunReview(t("fxUndone"));
}

// The per-card instructions of an AI rewrite (keyword, question, note, sensitive terms, field rules); the coach prefetch reuses them.
function fxAiExtra(a) {
  return [
    a.keyword ? `Incluye la palabra clave «${a.keyword}» de forma natural.` : "",
    a.insertQuestion ? "Añade al final una pregunta directa al oyente o un anticipo de lo que viene, para recuperar su atención." : "",
    a.note || "",
    a.keepTerms ? "No cambies los términos sensibles por eufemismos: quita el detalle gráfico, la garantía de resultados o el lenguaje deshumanizante, y conserva el tema." : "",
    a.field === "title" ? "Es el título del video: 60 caracteres o menos, con la palabra clave al inicio, como la pregunta que alguien escribiría en YouTube, prometiendo solo lo que el guion entrega." : "",
    a.field === "thumb" ? "Es el texto de la miniatura: 1 a 4 palabras (24 caracteres como máximo), sin repetir el título." : "",
    a.field === "description" ? "Es la descripción: los primeros 150 caracteres dicen la promesa con la palabra clave." : "",
  ].filter(Boolean).join(" ");
}
async function aiFix(ci) {
  const c = state.fixCards[ci];
  // already answered by the editor's report (or the coach) for this very fragment: show it, no new read of the script
  const ready = typeof coachAiOptions === "function" ? coachAiOptions({ card: c }) : [];
  if (ready.length) { state.fixAi[c.id] = { options: ready }; const bx = $("fxai-" + ci); if (bx) { bx.innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); wireAiOptions(bx); } return; }
  const sample = await caps.sample;
  if (!sample) { state.fixAi[c.id] = { error: t("aiOnlyClaude") }; $("fxai-" + ci).innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); return; }
  state.fixAi[c.id] = { loading: true };
  $("fxai-" + ci).innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]);
  // (B-002, bug review 2026-10-29) The button asks exactly like the report's batches: the fragment travels with its verses masked
  // (fixItem) and every option goes through vetFixes → vetSection, so a verse lost, altered or invented never shows. The old
  // direct prompt sent the verses in clear and checked the answer against the rules only.
  const R = state.result, text = state.text, a = c.ai, ev = c.evidence[0];
  const from = a.start != null ? a.start : ev ? ev.start : null, to = a.end != null ? a.end : ev ? ev.end : null;
  const it = fixItem({ card: c, at: from != null ? { start: from, end: to } : null }, "b1", text, state.opts, verseSpans(text, R));
  if (!it) { state.fixAi[c.id] = { error: t("fxAiVerse") }; $("fxai-" + ci).innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); return; } // a verse crosses the fragment's edge: it cannot be protected, so it is not sent
  try {
    const res = await sample.json(fixesPrompt([rpFixReq(it)], { en: R.lang === "en" }), { modelTier: "default" });
    const got = vetFixes(res, [it])[it.id] || [];
    if (!got.length) throw { code: "invalid_json" };
    state.fixAi[c.id] = {
      options: got.map((o) => {
        const p = it.field ? { kind: "field", field: it.field, value: o.text, label: "IA" } : { kind: "patch", patches: [{ start: from, end: to, rep: it.lead + o.text + it.trail }], label: "IA" };
        return { ...p, why: o.why, check: verifyProposal(text, state.opts, R, p) };
      }),
    };
  } catch (e) {
    state.fixAi[c.id] = { error: errText(e) };
    // (jadri47, 2026-10-29: B-017) the click disabled the button; after a failure it must be usable again to retry
    const rb = document.querySelector(`[data-fxai="${ci}"]`); if (rb) rb.disabled = false;
  }
  const box = $("fxai-" + ci);
  if (box) { box.innerHTML = aiOptionsHTML(ci, state.fixAi[c.id]); wireAiOptions(box); }
}
function wireAiOptions(root) {
  root.querySelectorAll("[data-fxaiuse]").forEach((b) => b.addEventListener("click", () => { const [ci, k] = b.dataset.fxaiuse.split(":").map(Number); const c = state.fixCards[ci]; applyProposal(state.fixAi[c.id].options[k], c); }));
}
function wireFixes() {
  const root = document.querySelector("#results .topfix") || document.querySelector("#guide .topfix");
  if (!root) return;
  root.querySelectorAll("li.fx-closed > .fx-top").forEach((top) => { const go = () => { const li = top.closest("li"); state.fixOpen = state.fixOpen || new Set(); state.fixOpen.add(li.dataset.fid); li.classList.remove("fx-closed"); top.removeAttribute("role"); top.removeAttribute("tabindex"); top.removeAttribute("aria-expanded"); }; top.addEventListener("click", go); top.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); });
  root.querySelectorAll("[data-fxapply]").forEach((b) => b.addEventListener("click", () => { const ci = +b.dataset.fxapply, c = state.fixCards[ci]; applyProposal(c.proposals[Math.min(state.fixSel[ci] || 0, c.proposals.length - 1)], c); }));
  root.querySelectorAll("[data-fxsel]").forEach((b) => b.addEventListener("click", () => { const [ci, k] = b.dataset.fxsel.split(":").map(Number); state.fixSel[ci] = k; const keep = window.scrollY; renderResults(); window.scrollTo(0, keep); }));
  root.querySelectorAll("[data-fxai]").forEach((b) => b.addEventListener("click", () => { b.disabled = true; aiFix(+b.dataset.fxai); }));
  wireAiOptions(root);
  const u = $("fxUndo"); if (u) u.addEventListener("click", undoFix);
  root.querySelectorAll("[data-fxrevert]").forEach((b) => b.addEventListener("click", () => fxRevert(+b.dataset.fxrevert)));
  root.querySelectorAll("[data-fxrestore]").forEach((b) => b.addEventListener("click", () => fxRestore(b.dataset.fxrestore)));
  root.querySelectorAll("[data-fxskip]").forEach((b) => b.addEventListener("click", () => { { const c = state.fixCards[+b.dataset.fxskip]; const bis = fxBlocksOf(c); const ids = c.ids || [c.id]; ids.forEach((id) => state.fixDismissed.add(id)); (bis.length ? bis : [-1]).forEach((bi) => state.fixLog.push({ id: c.id, ids, label: typeof plainLabel === "function" ? plainLabel(c.id, c.label) : c.label, kind: "skip", bi })); } const keep = window.scrollY; renderResults(); window.scrollTo(0, keep); }));
  caps.sample.then((s) => { if (!s) root.querySelectorAll("[data-fxai]").forEach((b) => (b.disabled = true)); });
}
const _renderResultsFx = renderResults;
renderResults = function () { _renderResultsFx(); wireFixes(); };
$("runBtn").addEventListener("click", () => { state.fixUndo = []; state.fixSel = {}; state.fixAi = {}; state.fixDismissed = new Set(); state.fixLog = []; }, true);
