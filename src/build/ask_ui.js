/* ===== Pregúntale a Claude: petición libre sobre un párrafo o todo el guion, con aplicar / deshacer ===== */
Object.assign(T.es, {
  askTitle: "Pregúntale a Claude",
  askLead: "Pide un cambio con tus propias palabras. Claude responde y, si propone texto nuevo, puedes aplicarlo con un toque y deshacerlo después.",
  askTarget: "¿Sobre qué parte?",
  askAll: "Todo el guion",
  askPara: (n, s) => `Párrafo ${n} · «${s}»`,
  askQ: "¿Qué quieres que haga Claude?",
  askPh: "Por ejemplo: hazlo más cálido y personal, sin perder la cita",
  askChips: ["Hazlo más cálido y cercano", "Hazlo más corto", "Más claro para alguien nuevo en la fe", "Dame un ejemplo de la vida diaria", "¿Suena natural dicho en voz alta?", "Añade una pregunta para el oyente"],
  askGo: "Preguntar a Claude",
  askNeedQ: "Escribe qué quieres que haga Claude.",
  askNeedText: "Primero pega un guion.",
  askReply: "Claude dice",
  askWould: "Cómo quedaría",
  askChecks: (a, b, c, d) => `Revisiones que pasan: ${a} de ${b} → ${c} de ${d}`,
  askWorse: "Ojo: el cambio aumenta el riesgo para los anuncios.",
  askLostQuote: (n) => `Ojo: ${n === 1 ? "una cita entre comillas ya no aparece" : n + " citas entre comillas ya no aparecen"} igual.`,
  askApply: "Aplicar",
  askDiscard: "Descartar",
  askApplied: "Aplicado. Puedes deshacerlo con «Deshacer» arriba.",
  askChanged: "El guion cambió desde la pregunta; pregunta de nuevo.",
  askNoChange: "Claude no propuso cambios de texto.",
  askFollow: "Puedes seguir pidiendo cambios sobre la misma parte; Claude recuerda lo último que le pediste.",
});
Object.assign(T.en, {
  askTitle: "Ask Claude",
  askLead: "Ask for a change in your own words. Claude answers and, if it proposes new text, you can apply it with one tap and undo it later.",
  askTarget: "Which part?",
  askAll: "The whole script",
  askPara: (n, s) => `Paragraph ${n} · “${s}”`,
  askQ: "What should Claude do?",
  askPh: "For example: make it warmer and more personal, keep the quote",
  askChips: ["Make it warmer", "Make it shorter", "Clearer for someone new to faith", "Give me an everyday example", "Does it sound natural out loud?", "Add a question for the listener"],
  askGo: "Ask Claude",
  askNeedQ: "Type what you want Claude to do.",
  askNeedText: "Paste a script first.",
  askReply: "Claude says",
  askWould: "How it would read",
  askChecks: (a, b, c, d) => `Checks passing: ${a} of ${b} → ${c} of ${d}`,
  askWorse: "Careful: this change raises the ad risk.",
  askLostQuote: (n) => `Careful: ${n === 1 ? "a quoted passage no longer appears" : n + " quoted passages no longer appear"} unchanged.`,
  askApply: "Apply",
  askDiscard: "Discard",
  askApplied: "Applied. You can undo it with “Undo” above.",
  askChanged: "The script changed since you asked; ask again.",
  askNoChange: "Claude didn't propose a text change.",
  askFollow: "You can keep asking for changes to the same part; Claude remembers your last request.",
});

const ASK = { target: "all", q: "", busy: false, ans: null, err: "", hist: [] };
const RISK_RANK = { verde: 0, amarillo: 1, rojo: 2 };

function askParas() {
  const text = $("script").value, out = [], re = /[^\n]+(?:\n(?!\s*\n)[^\n]+)*/g;
  let m;
  while ((m = re.exec(text))) {
    const s = m[0].trim();
    if (!s || /^##\s/.test(s) || /^\[[^\]]*\]$/.test(s) || s.split(/\s+/).length < 6) continue;
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }
  return out;
}
function askFragment() {
  const text = $("script").value;
  if (ASK.target === "all") return { all: true, text };
  const p = askParas()[+ASK.target];
  return p ? { all: false, text: p.text } : { all: true, text };
}

function askHTML() {
  const paras = askParas();
  if (ASK.target !== "all" && !paras[+ASK.target]) ASK.target = "all";
  const short = (s) => { const w = s.replace(/\s+/g, " ").trim(); return w.length > 48 ? w.slice(0, 46) + "…" : w; };
  const opts = `<option value="all"${ASK.target === "all" ? " selected" : ""}>${h(t("askAll"))}</option>` + paras.map((p, i) => `<option value="${i}"${String(ASK.target) === String(i) ? " selected" : ""}>${h(t("askPara")(i + 1, short(p.text)))}</option>`).join("");
  return `<header class="g-h"><h2>${h(t("askTitle"))}</h2></header>
    <p class="lead">${h(t("askLead"))}</p>
    <div class="field"><label for="askTarget">${h(t("askTarget"))}</label><select id="askTarget">${opts}</select></div>
    <div class="field"><label for="askQ">${h(t("askQ"))}</label><textarea id="askQ" rows="3" placeholder="${h(t("askPh"))}">${h(ASK.q)}</textarea></div>
    <div class="chips ask-chips">${t("askChips").map((c) => `<button type="button" class="small" data-askchip="${h(c)}">${h(c)}</button>`).join("")}</div>
    <div class="actions"><button type="button" class="primary small" id="askGo"${ASK.busy ? " disabled" : ""}>${h(t("askGo"))}</button><span class="status${ASK.err ? " err" : ""}" id="askSt">${h(ASK.busy ? t("thinking") : ASK.err)}</span></div>
    <div id="askOut">${askAnswerHTML()}</div>`;
}
function askAnswerHTML() {
  const a = ASK.ans;
  if (!a) return "";
  let html = `<div class="ask-ans"><div class="k">${h(t("askReply"))}</div><p>${h(a.reply || "")}</p>`;
  if (a.replacement) {
    const diff = wordDiff(a.original, a.replacement).map((x) => (x.changed ? `<ins>${h(x.text)}</ins>` : h(x.text))).join("");
    const R = state.result, A = a.after;
    const warn = [];
    if (A && R && RISK_RANK[A.worst] > RISK_RANK[R.worst]) warn.push(t("askWorse"));
    if (a.lostQuotes) warn.push(t("askLostQuote")(a.lostQuotes));
    html += `<div class="k">${h(t("askWould"))}</div><div class="diff">${diff}</div>
      ${A && R ? `<p class="hint">${h(t("askChecks")(R.passed, R.total, A.passed, A.total))}</p>` : ""}
      ${warn.map((w) => `<p class="status err">${h(w)}</p>`).join("")}
      ${a.applied ? `<p class="status">${h(t("askApplied"))}</p>` : `<div class="actions"><button type="button" class="primary small" id="askApply">${h(t("askApply"))}</button><button type="button" class="small" id="askDiscard">${h(t("askDiscard"))}</button></div>`}`;
  } else html += `<p class="hint">${h(t("askNoChange"))}</p>`;
  html += `<p class="hint">${h(t("askFollow"))}</p></div>`;
  return html;
}

function askPrompt(frag, q) {
  const en = state.result && state.result.lang === "en";
  const voiceTxt = typeof voice === "function" && state.result ? voice() : "";
  const prev = ASK.hist.filter((x) => x.target === ASK.target).slice(-2).map((x) => `- Pidió: «${x.q}» → respondiste: «${x.reply}»`).join("\n");
  const ctx = frag.all ? "" : `\nCONTEXTO (guion completo, solo para entender; NO lo devuelvas):\n"""\n${$("script").value.slice(0, 7000)}\n"""\n`;
  return `Eres el editor de guiones de un pódcast cristiano de enseñanza bíblica en YouTube. El presentador te pide sobre ${frag.all ? "su guion completo" : "un párrafo de su guion"}: «${q}».
${voiceTxt}
${en ? "Responde y escribe el texto en inglés de EE. UU." : ""}
Reglas:
- Conserva palabra por palabra las citas bíblicas entre comillas y sus referencias (libro, capítulo y versículo).
- No cambies la doctrina ni el argumento. No añadas invitaciones a suscribirse ni a comentar.
- Mantén la voz del presentador: frases que se dicen de un aliento, sin muletillas ni frases de plantilla.
- Conserva las señales entre corchetes ([B-ROLL: …], [TEXTO: …], [CITA: …], [PAUSA]) y los títulos «## …» si aparecen.
- Si la petición es una pregunta o pide consejo, responde en "reply" y deja "replacement" en null.
- Si pide un cambio de texto, pon en "replacement" SOLO el texto nuevo que sustituye al FRAGMENTO completo, listo para pegar.
Devuelve solo este JSON: {"reply": "respuesta breve, máximo 3 frases, en el idioma del guion", "replacement": "texto nuevo" o null}
${prev ? `Conversación previa sobre esta misma parte:\n${prev}\n` : ""}${ctx}
FRAGMENTO:
"""
${frag.text}
"""`;
}

async function askRun() {
  const q = ($("askQ").value || "").trim();
  ASK.q = q; ASK.err = "";
  if (!$("script").value.trim()) { ASK.err = t("askNeedText"); renderAsk(); return; }
  if (!q) { ASK.err = t("askNeedQ"); renderAsk(); $("askQ").focus(); return; }
  const sample = await caps.sample;
  if (!sample) { ASK.err = t("aiOnlyClaude"); renderAsk(); return; }
  if (!state.result || state.text !== $("script").value) { state.text = $("script").value; state.opts = readOpts(); state.result = analyze(state.text, state.opts); }
  const frag = askFragment();
  ASK.busy = true; ASK.ans = null; renderAsk();
  const base = $("script").value; // the text the answer is for: «Aplicar» on the whole script must find it unchanged (B-013, 2026-10-29)
  try {
    const res = await sample.json(askPrompt(frag, q), { modelTier: frag.all ? "complex" : "default" });
    const reply = String((res && res.reply) || "").trim();
    let rep = res && typeof res.replacement === "string" ? res.replacement : null;
    if (rep && rep.trim() === frag.text.trim()) rep = null;
    if (!reply && !rep) throw { code: "invalid_json" };
    const ans = { target: ASK.target, original: frag.text, replacement: rep, reply, applied: false, base };
    if (rep) {
      const full = $("script").value;
      const next = frag.all ? rep : full.replace(frag.text, () => rep);
      ans.after = analyze(next, state.opts);
      ans.lostQuotes = (state.result.quotes || []).filter((x) => frag.text.includes(x.inner.slice(0, 40)) && !rep.includes(x.inner.slice(0, 40))).length;
    }
    ASK.ans = ans;
    ASK.hist.push({ target: ASK.target, q, reply: reply.slice(0, 200) });
    if (ASK.hist.length > 10) ASK.hist.shift();
  } catch (e) { ASK.err = errText(e); }
  ASK.busy = false;
  renderAsk();
}
function askApply() {
  const a = ASK.ans;
  if (!a || !a.replacement) return;
  const full = $("script").value;
  // a whole-script answer fits only the text it was asked about (B-013, 2026-10-29: it used to replace whatever was typed since); a paragraph answer needs its paragraph
  if (a.target === "all" ? String(a.base || "").trimEnd() !== full.trimEnd() : !full.includes(a.original)) { ASK.err = t("askChanged"); ASK.ans = null; renderAsk(); return; }
  state.fixUndo.push(snapshotForUndo());
  if (state.fixUndo.length > 20) state.fixUndo.shift();
  $("script").value = a.target === "all" ? a.replacement : full.replace(a.original, () => a.replacement);
  state.fixUndo[state.fixUndo.length - 1].after = $("script").value; // what Deshacer expects to find (B-013)
  a.applied = true;
  state.fixSel = {}; state.fixAi = {};
  rerunReview(t("fxApplied"));
}

function renderAsk() {
  const el = $("askClaude");
  if (!el) return;
  const qNow = $("askQ"); if (qNow) ASK.q = qNow.value;
  el.innerHTML = askHTML();
  $("askTarget").addEventListener("change", (e) => { ASK.target = e.target.value; ASK.ans = null; ASK.err = ""; renderAsk(); });
  $("askQ").addEventListener("input", (e) => { ASK.q = e.target.value; });
  el.querySelectorAll("[data-askchip]").forEach((b) => b.addEventListener("click", () => { $("askQ").value = b.dataset.askchip; ASK.q = b.dataset.askchip; $("askQ").focus(); }));
  $("askGo").addEventListener("click", askRun);
  const ap = $("askApply"); if (ap) ap.addEventListener("click", askApply);
  const di = $("askDiscard"); if (di) di.addEventListener("click", () => { ASK.ans = null; renderAsk(); });
}
function mountAsk(where, before) {
  if (!where || $("askClaude")) return;
  const sec = document.createElement("section");
  sec.className = "g-card ask-card"; sec.id = "askClaude";
  if (before) where.parentNode.insertBefore(sec, where); else where.appendChild(sec);
  renderAsk();
}
// Guided step 2: under "Lo primero que arreglaría", above "Más revisiones". Full mode: right after the top fixes.
const _renderGuideAsk = renderGuide;
renderGuide = function () {
  _renderGuideAsk();
  if (!V.guided || V.step !== 2) return;
  const more = document.querySelector("#guide .g-more-sec");
  if (more && more.nextSibling) mountAsk(more.nextSibling, true);
};
const _renderResultsAsk = renderResults;
renderResults = function () {
  _renderResultsAsk();
  if (V.guided) return;
  const ai = $("sec-ai");
  if (ai && ai.nextSibling) mountAsk(ai.nextSibling, true);
};
