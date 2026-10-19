/* ===== Escritorio: guion fijo a la izquierda, todo lo demás a la derecha con su propio scroll ===== */
// Wide screens get a split view: the script never scrolls away, and the review, fixes, packaging and the
// rest live in the right pane. Narrow screens keep the original single-column order.
Object.assign(T.es, { stale: "Cambiaste el guion. Lo que ves aquí es de la versión anterior.", staleGo: "Actualizar la revisión" });
Object.assign(T.en, { stale: "You changed the script. What you see here is from the previous version.", staleGo: "Update the review" });

const SPLIT = { on: false, mq: window.matchMedia("(min-width: 900px) and (min-height: 560px)") };
(function initSplit() {
  const main = document.querySelector("main"), editor = $("editor");
  const scriptField = TA.closest(".field"), meta = editor.querySelector(".meta-line"), acts = $("runBtn").closest(".actions");
  if (!main || !editor || !scriptField || !meta) return;
  scriptField.classList.add("script-field");
  const split = document.createElement("div"); split.className = "split";
  const L = document.createElement("div"); L.id = "paneL"; L.className = "pane-l";
  const R = document.createElement("div"); R.id = "paneR"; R.className = "pane-r";
  split.append(L, R);
  const rightIds = ["guideTop", "editor", "guide", "results", "guion", "historyBlock"];
  const footer = main.querySelector("footer.disclaimer");

  function arrange() {
    const want = SPLIT.mq.matches;
    if (want === SPLIT.on) return;
    const hadFocus = document.activeElement === ED.el;
    if (want) {
      main.insertBefore(split, $("guideTop"));
      L.append(scriptField, meta, acts);
      rightIds.forEach((id) => { const el = $(id); if (el) R.appendChild(el); });
      if (footer) R.appendChild(footer);
    } else {
      rightIds.forEach((id) => { const el = $(id); if (el) main.insertBefore(el, split); });
      if (footer) main.insertBefore(footer, split);
      editor.prepend(scriptField, meta);
      editor.appendChild(acts);
      split.remove();
    }
    SPLIT.on = want;
    document.documentElement.classList.toggle("sd-split", want);
    if (hadFocus) ED.el.focus();
  }
  arrange();
  if (SPLIT.mq.addEventListener) SPLIT.mq.addEventListener("change", arrange); else SPLIT.mq.addListener(arrange);
})();

// New step: scroll the right pane to the top instead of the window.
const _goStepS = goStep;
goStep = function (n) { _goStepS(n); if (SPLIT.on) $("paneR").scrollTo({ top: 0, behavior: "auto" }); };

// Editing on the left while the right shows an older review: one clear button to refresh it.
function renderStale() {
  const top = $("guideTop");
  if (!top) return;
  let bar = $("staleBar");
  const stale = V.guided && V.step >= 2 && state.result && state.text !== $("script").value && hasScript();
  if (!stale) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("div"); bar.id = "staleBar"; bar.className = "stale-bar"; bar.setAttribute("role", "status");
    const strip = $("epStrip");
    if (strip) strip.insertAdjacentElement("afterend", bar); else top.prepend(bar);
  }
  bar.innerHTML = `<span>${h(t("stale"))}</span><button type="button" class="small primary" id="staleGo">${h(t("staleGo"))}</button>`;
  $("staleGo").addEventListener("click", () => {
    state.fixSel = {}; state.fixAi = {};
    ensureReview(); if (V.step >= 3) gCompute();
    renderGuide();
  });
}
(function () { let tm = null; TA.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(renderStale, 500); }); })();
const _renderGuideS = renderGuide;
renderGuide = function () { _renderGuideS(); renderStale(); };
