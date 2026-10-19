/* ===== Mensaje en YouTube: idea central, prioridades (mensaje antes que anuncios amarillos), bienvenida ===== */
// For pastors: the app never touches what is preached, only how it reaches someone watching alone on YouTube.
Object.assign(T.es, {
  secMessage: "Mensaje en YouTube",
  leadMessage: "Tu mensaje no se toca. Esto revisa que llegue igual de claro a alguien que te ve solo, en su teléfono, sin haber estado en tu iglesia.",
  ideaLabel: "Idea central, en una frase",
  ideaPh: "Por ejemplo: Perdonar no es olvidar; es soltar la deuda porque Dios ya nos perdonó.",
  ideaInline: "Escríbela aquí con tus palabras",
  ideaSave: "Guardar idea",
  ideaSaved: "Idea guardada.",
  s1Lead: "Escríbelo aquí o pégalo tal como lo vas a predicar; se guarda solo. La app no cambia tu mensaje: te dice cómo hacerlo llegar mejor en YouTube.",
  vGreenD: "El mensaje llega claro y no hay riesgo para los anuncios.",
  vYellowD: "Nada impide grabar. Estos ajustes ayudan a que el mensaje llegue y a que la gente vuelva.",
  vRedD: "Algo puede quitar los anuncios del video. Arréglalo primero; lo demás puede esperar.",
  moneyNote: "Los avisos de anuncios son nuestra lectura de las reglas de YouTube; la decisión final es de YouTube.",
  lvl: { verde: "Anuncios: sin riesgo", amarillo: "Anuncios: podrían limitarse", rojo: "Anuncios: riesgo alto" },
  plainPackTitle: "El título tiene palabras que limitan anuncios",
  plainPackThumb: "El texto de la miniatura tiene palabras que limitan anuncios",
  introTitle: "Bienvenido a Script Desk",
  introBody: "Pegas tu guion y la app te dice qué ajustar para que funcione en YouTube como pódcast: que enganche, que se entienda fuera de la iglesia y que no pierda anuncios. Tu mensaje y tu doctrina no se tocan; cada cambio lo decides tú.",
  introTry: "Probar con un ejemplo",
  introStart: "Empezar con mi guion",
  askChips: ["¿Lo entendería alguien que nunca ha ido a la iglesia?", "Pásalo del púlpito al formato pódcast", "Hazlo más cálido y cercano", "Hazlo más corto", "Dame un ejemplo de la vida diaria", "¿Suena natural dicho en voz alta?"],
});
Object.assign(T.en, {
  secMessage: "Message on YouTube",
  leadMessage: "Your message isn't touched. This checks it reaches someone watching alone on their phone, who has never been to your church, just as clearly.",
  ideaLabel: "Central idea, in one sentence",
  ideaPh: "For example: Forgiving isn't forgetting; it's releasing the debt because God already forgave us.",
  ideaInline: "Write it here in your own words",
  ideaSave: "Save idea",
  ideaSaved: "Idea saved.",
  s1Lead: "Write it here or paste it as you'll preach it; it saves itself. The app doesn't change your message: it shows how to make it land better on YouTube.",
  vGreenD: "The message comes through clearly and there's no ad risk.",
  vYellowD: "Nothing stops you from recording. These tweaks help the message land and bring people back.",
  vRedD: "Something could remove ads from the video. Fix it first; the rest can wait.",
  moneyNote: "Ad warnings are our reading of YouTube's rules; YouTube makes the final call.",
  lvl: { verde: "Ads: no risk", amarillo: "Ads: could be limited", rojo: "Ads: high risk" },
  plainPackTitle: "The title has words that limit ads",
  plainPackThumb: "The thumbnail text has words that limit ads",
  introTitle: "Welcome to Script Desk",
  introBody: "Paste your script and the app shows what to adjust so it works on YouTube as a podcast: it hooks, it's understood outside church, and it keeps its ads. Your message and doctrine aren't touched; you decide every change.",
  introTry: "Try an example",
  introStart: "Start with my script",
  askChips: ["Would someone who's never been to church follow this?", "Turn this from pulpit to podcast", "Make it warmer", "Make it shorter", "Give me an everyday example", "Does it sound natural out loud?"],
});
Object.assign(T.es.plain, {
  bigidea: "Tu idea central se oye al principio y al final", pulpit: "Habla a quien te ve, no a una congregación", jargon: "Los términos técnicos se explican",
  onscreen: "Cada pasaje que lees aparece en pantalla", reading: "Lecturas largas con pausas", recap: "El cierre resume lo que se llevan", application: "El cierre da un paso concreto",
});
Object.assign(T.en.plain, {
  bigidea: "Your central idea is heard at the start and the end", pulpit: "Speak to the viewer, not a congregation", jargon: "Technical terms are explained",
  onscreen: "Every passage you read appears on screen", reading: "Long readings with pauses", recap: "The close sums up what they take away", application: "The close gives one concrete step",
});

// Your order: the message first, then retention, then ads. A red ad risk still leads because it can sink the video.
const MSG_PRIO = { message: 1, structure: 2, scripture: 3, money: 4, spoken: 5, auth: 6, seo: 7 };
const _failedRowsM = failedRows;
failedRows = function (R) {
  const rows = _failedRowsM(R);
  const packRed = (r) => /^pack-/.test(r.id) && (R.packaging || []).some((p) => p.level === "rojo" && r.id === "pack-" + p.label);
  const red = (r) => r.level === "rojo" || packRed(r);
  return rows.sort((a, b) => (red(b) ? 1 : 0) - (red(a) ? 1 : 0) || (MSG_PRIO[a.sec] || 9) - (MSG_PRIO[b.sec] || 9) || weightOf(b) - weightOf(a));
};

const _plainLabelM = plainLabel;
plainLabel = function (id, fallback) {
  if (V.guided && /^pack-/.test(id)) return /Título|Title/.test(id) ? t("plainPackTitle") : t("plainPackThumb");
  return _plainLabelM(id, fallback);
};
const _verdictHTMLM = verdictHTML;
verdictHTML = function (R) {
  const base = _verdictHTMLM(R);
  const moneyFail = failedRows(R).some((r) => r.sec === "money");
  return moneyFail ? base.replace(/<\/div>$/, `<p class="hint gv-note">${h(t("moneyNote"))}</p></div>`) : base;
};

// Central idea: saved with the episode, part of every review.
(function initIdea() {
  const el = $("bigIdea");
  if (!el) return;
  let tm = null;
  el.addEventListener("input", () => {
    markDirty();
    clearTimeout(tm);
    tm = setTimeout(() => { if (state.result && state.text) { state.opts = readOpts(); state.result = analyze(state.text, state.opts); if (V.guided) renderGuide(); else renderResults(); } }, 600);
  });
})();
const _readOptsM = readOpts;
readOpts = function () { return { ..._readOptsM(), bigIdea: ($("bigIdea") || {}).value || "" }; };
const _prodBodyM = prodBody;
prodBody = function (now) { return { ..._prodBodyM(now), bigIdea: ($("bigIdea") || {}).value || "" }; };
const _applyProdM = applyProd;
applyProd = function (id, d) { _applyProdM(id, d); if ($("bigIdea")) $("bigIdea").value = d.bigIdea || ""; };

// A missing idea is typed straight into its fix card, so Juan doesn't have to go back to step 1.
const _wireFixesM = wireFixes;
wireFixes = function () {
  _wireFixesM();
  const root = document.querySelector("#results .topfix") || document.querySelector("#guide .topfix");
  if (!root || (($("bigIdea") || {}).value || "").trim()) return;
  root.querySelectorAll("li.fx").forEach((li) => {
    const c = state.fixCards[+li.dataset.ci];
    if (!c || c.id !== "bigidea") return;
    li.classList.add("fx-idea");
    const box = document.createElement("div");
    box.className = "idea-inline";
    box.innerHTML = `<label for="ideaInline">${h(t("ideaInline"))}</label><textarea id="ideaInline" rows="1" data-one="1" maxlength="200" placeholder="${h(t("ideaPh"))}"></textarea><button type="button" class="small primary" id="ideaInlineSave">${h(t("ideaSave"))}</button>`;
    const f = li.querySelector(".tf-f");
    (f || li.querySelector(".fx-top")).insertAdjacentElement("afterend", box);
    const save = () => { const v = $("ideaInline").value.trim(); if (!v) { $("ideaInline").focus(); return; } $("bigIdea").value = v; state.fixSel = {}; state.fixAi = {}; rerunReview(t("ideaSaved")); };
    $("ideaInlineSave").addEventListener("click", save);
    $("ideaInline").addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
  });
};

// First visit: one welcome card in step 1.
const _renderGuideMsg = renderGuide;
renderGuide = function () {
  _renderGuideMsg();
  if (!V.guided || V.step !== 1 || lsGet("sd-intro") === "1" || DEMO) return;
  const top = $("guideTop");
  if (!top || $("introCard")) return;
  const card = document.createElement("section");
  card.id = "introCard"; card.className = "intro-card";
  card.innerHTML = `<h3>${h(t("introTitle"))}</h3><p>${h(t("introBody"))}</p><div class="actions"><button type="button" class="primary" id="introTry">${h(t("introTry"))}</button><button type="button" id="introStart">${h(t("introStart"))}</button></div>`;
  top.appendChild(card);
  $("introTry").addEventListener("click", () => { lsSet("sd-intro", "1"); startDemo("worst"); });
  $("introStart").addEventListener("click", () => { lsSet("sd-intro", "1"); card.remove(); $("script").focus(); });
};
