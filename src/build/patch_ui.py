import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:90]); s = s.replace(old, new)
css = open("guion.css", encoding="utf-8").read() + open("guide.css", encoding="utf-8").read() + open("theme2026.css", encoding="utf-8").read()
ui = open("guion_ui.js", encoding="utf-8").read() + open("guion_ui2.js", encoding="utf-8").read() + open("fix_ui.js", encoding="utf-8").read() + open("guide_ui.js", encoding="utf-8").read().replace("__SAMPLE__", open("sample.json", encoding="utf-8").read()) + open("series_ui.js", encoding="utf-8").read() + open("more_ui.js", encoding="utf-8").read() + open("theme_ui.js", encoding="utf-8").read() + open("audience_ui.js", encoding="utf-8").read() + open("demo_ui.js", encoding="utf-8").read().replace("__EXAMPLES__", open("examples.json", encoding="utf-8").read()) + open("ask_ui.js", encoding="utf-8").read() + open("message_ui.js", encoding="utf-8").read() + open("bible_ui.js", encoding="utf-8").read() + open("lang_ui.js", encoding="utf-8").read() + open("episodes_ui.js", encoding="utf-8").read() + open("editor_ui.js", encoding="utf-8").read() + open("layout_ui.js", encoding="utf-8").read() + open("phases_ui.js", encoding="utf-8").read() + open("polish_ui.js", encoding="utf-8").read() + open("help_ui.js", encoding="utf-8").read() + open("edmarks_ui.js", encoding="utf-8").read() + open("score_ui.js", encoding="utf-8").read() + open("walk_ui.js", encoding="utf-8").read() + open("adterms_ui.js", encoding="utf-8").read() + open("autosize_ui.js", encoding="utf-8").read() + (open("standalone_ui.js", encoding="utf-8").read() if __import__("os").environ.get("SD_STANDALONE") else "")
rep("""@media (max-width:620px){ main{padding:20px 14px 56px} .manuscript{padding:16px} textarea#script{min-height:220px} }
</style>""", """@media (max-width:620px){ main{padding:20px 14px 56px} .manuscript{padding:16px} textarea#script{min-height:220px} }""" + css + "</style>")
rep("""      <span class="hint" id="runHint"></span>
    </div>
  </section>""", """      <span class="hint" id="runHint"></span>
    </div>
  </section>""")
rep("""    <div class="meta-line"><span id="liveCount">0 palabras</span><span id="liveTime"></span><button type="button" class="linkish clear-link" id="clearBtn" data-i18n="clear">Borrar guion</button></div>
""", """    <div class="meta-line"><span id="liveCount">0 palabras</span><span id="liveTime"></span><button type="button" class="linkish tr-toggle" id="trToggle" aria-expanded="false" aria-controls="trBox" data-i18n="trTitle">Traducir o adaptar el guion</button><button type="button" class="linkish clear-link" id="clearBtn" data-i18n="clear">Borrar guion</button><div id="trBox" class="tr-box" hidden></div></div>
    <div class="field idea-field"><label for="bigIdea" data-i18n="ideaLabel">Idea central, en una frase</label><input id="bigIdea" maxlength="200" data-i18n-ph="ideaPh" placeholder="Por ejemplo: Perdonar no es olvidar; es soltar la deuda porque Dios ya nos perdonó."><div id="ideaSug" class="idea-sug-box"></div></div>
""")
rep("""        <div class="grid3">
          <div class="field"><label for="translation" data-i18n="trLabel">Versión bíblica</label>
            <select id="translation"><option>RVR1960</option><option>NVI</option><option>LBLA</option><option>NBLA</option><option>NTV</option><option>DHH</option><option>RVC</option></select></div>
""", """        <div class="grid2">
""")
rep(""": `El guion está en español neutro para Centroamérica, Latinoamérica y España: "ustedes", nunca "vosotros" ni voseo, salvo dentro de citas bíblicas.`);""", """: audVoice());""")
rep("""family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Figtree:wght@400;500;600;700&display=swap""", """family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&family=Onest:wght@400..700&display=swap""")
rep("""  ["money", t("secMoney"), t("leadMoney")],""", """  ["money", t("secMoney"), t("leadMoney")],
  ["structure", t("secStructure"), t("leadStructure")],
  ["message", t("secMessage"), t("leadMessage")],""")
rep("""  ["structure", t("secStructure"), t("leadStructure")],
  ["scripture", t("secScripture"), null],
  ["facts", t("secFacts"), null],
  ["spoken", state.result && state.result.lang === "en" ? t("secSpokenEn") : t("secSpoken"), null],
  ["auth", t("secAuth"), t("leadAuth")],
  ["seo", t("secSeo"), t("leadSeo")],
];""", """  ["scripture", t("secScripture"), null],
  ["spoken", state.result && state.result.lang === "en" ? t("secSpokenEn") : t("secSpoken"), null],
  ["seo", t("secSeo"), t("leadSeo")],
  ["auth", t("secAuth"), t("leadAuth")],
  ["facts", t("secFacts"), null],
];""")
rep("""const voice = () => (state.result.lang === "en" ? "El guion está en inglés: mantén el inglés en todo el texto del guion." :""", """const voice = () => (state.result.lang === "en" ? "El guion está en inglés: mantén el inglés en todo el texto del guion. " + PASTOR_NOTE :""")
rep("""</head>""", """<script id="sdTheme">try{var sdT=localStorage.getItem("sd-theme");if(sdT==="dark"||sdT==="light")document.documentElement.dataset.theme=sdT}catch(e){}</script>
</head>""")
rep("""  </header>

  <section id="editor" aria-label="Guion">""", """    <div id="stepBar" aria-label="Pasos"></div>
    <div class="mast-tools">
      <div id="exPick" class="ex-pick"></div>
      <div id="demoBar" class="demo-bar" role="status" hidden></div>
    </div>
  </header>
  <nav class="modes" role="tablist" aria-label="Modo / Mode">
    <button type="button" role="tab" data-mode="review" aria-selected="true" data-i18n="modeReview">Revisión</button><button type="button" role="tab" data-mode="guion" aria-selected="false" data-i18n="modeGuion">Guion y prompter</button>
  </nav>
  <div id="guideTop"></div>

  <section id="editor" aria-label="Guion">""")
rep("""  <section id="results" class="hidden" aria-live="polite"></section>
""", """  <div id="guide" aria-live="polite"></div>
  <section id="results" class="hidden" aria-live="polite"></section>
  <section id="guion" aria-label="Guion y prompter"></section>
""")
rep("""lang: $("lang").value, k: state.k, kCalibrated: state.kCalibrated, uiLang: UI };""", """lang: $("lang").value, k: state.k, kCalibrated: state.kCalibrated, kReh: !state.kCalibrated && !!state.kReh, uiLang: UI, coldOpen: coldForEngine() };""")
rep("""const state = { result: null, text: "", opts: null, k: 0.65, kCalibrated: false, kN: 0,""", """const state = { result: null, text: "", opts: null, k: 0.65, kCalibrated: false, kN: 0, kReh: null, kRehN: 0,""")
rep("""  if (ks.length >= 3) { state.k = median(ks); state.kCalibrated = true; } else { state.k = 0.65; state.kCalibrated = false; }""", """  if (ks.length >= 3) { state.k = median(ks); state.kCalibrated = true; } else { state.k = state.kReh || 0.65; state.kCalibrated = false; }""")
rep("""    state.historyError = null; state.historyReady = true;""", """    state.historyError = null; state.historyReady = true;
    try { const a = await db.doc("ajustes/ritmo").get(); if (a.exists) { const d = a.data() || {}; if (d.k > 0.3 && d.k < 1.2) { state.kReh = d.k; state.kRehN = d.n || 1; } } } catch (e2) {}""")
rep("""  if (state.result) { state.opts.uiLang = UI; state.result = analyze(state.text, state.opts); renderResults(); }
  renderHistory();
}""", """  if (state.result) { state.opts.uiLang = UI; state.result = analyze(state.text, state.opts); renderResults(); }
  renderHistory();
  gOnLang();
}""")
rep("""  const quick = `<nav class="quick" aria-label="${h(t("sections"))}">${h(t("quick"))}<a href="#sec-manuscript">${h(t("secMs"))}</a><a href="#sec-ai">${h(t("secAi"))}</a><a href="#sec-save">${h(t("secSave"))}</a></nav>`;""",
"""  const quick = `<nav class="quick" aria-label="${h(t("sections"))}">${h(t("quick"))}<a href="#sec-manuscript">${h(t("secMs"))}</a><a href="#sec-ai">${h(t("secAi"))}</a><a href="#sec-save">${h(t("secSave"))}</a><a href="#guion" data-gomode="guion">${h(t("gGoGuion"))}</a></nav>`;""")
rep("""applyLang();
loadHistory();
""", ui + """
applyLang();
loadHistory();
if (G.mode === "guion" && !V.guided) { gRefresh(); loadProds(); }
applyView();
loadProds().then(() => { if (V.guided && V.step === 1) renderGuide(); });
""")
rep("""  const manuscript = `<section class="block" id="sec-manuscript"><header><h2>${h(t("secMs"))}</h2><span class="count">${h(t("tapNote"))}</span></header>${legend}<div class="manuscript" id="ms">${manuscriptHTML(R, text)}</div><p class="tipbar hidden" id="tipbar" role="status"></p></section>`;""",
"""  const msOpen = (() => { try { return localStorage.getItem("sd-ms-open") === "1"; } catch (e) { return false; } })();
  const manuscript = `<details class="block ms-block" id="sec-manuscript"${msOpen ? " open" : ""}><summary><h2>${h(t("secMs"))}</h2><span class="count">${h(t("tapNote"))}</span></summary>${legend}<div class="manuscript" id="ms">${manuscriptHTML(R, text)}</div><p class="tipbar hidden" id="tipbar" role="status"></p></details>`;""")
rep("""  $("results").querySelectorAll(".topfix a[data-open]").forEach((a) => a.addEventListener("click", () => { const d = $("sec-" + a.dataset.open); if (d) d.open = true; }));""",
"""  $("results").querySelectorAll(".topfix a[data-open]").forEach((a) => a.addEventListener("click", () => { const d = $("sec-" + a.dataset.open); if (d) d.open = true; }));
  const msd = $("sec-manuscript");
  msd.addEventListener("toggle", () => { try { localStorage.setItem("sd-ms-open", msd.open ? "1" : "0"); } catch (e) {} });
  $("results").querySelectorAll('.quick a[href="#sec-manuscript"]').forEach((a) => a.addEventListener("click", () => { msd.open = true; }));""")
rep("""    <div class="langswitch" role="group" aria-label="Idioma / Language">""", """    <label class="xswitch" title="Modo completo / Full mode"><input type="checkbox" id="expertToggle" role="switch"><span data-i18n="expert">Modo completo</span></label>
    <button type="button" class="themebtn" id="themeBtn" aria-label="Cambiar a modo oscuro"></button>
    <div class="langswitch" role="group" aria-label="Idioma / Language">""")
rep("""    <div id="historyBody"></div>""", """    <section class="g-card" id="gSeriesFull"></section>
    <div id="historyBody"></div>
    <section class="g-card" id="gBackupFull"></section>""")
rep("""    const rows = sec[k]; if (!rows) continue;
    const [p, n] = counts[k];""", """    const rows = sec[k] || (k === "money" ? [] : null); if (!rows) continue; // the ad-safety table shows even when every category is clean
    const [p, n] = counts[k] || [0, 0];""")
rep("""    if (k === "scripture") extra = scriptureBlock(R);""", """    if (k === "scripture") extra = scriptureBlock(R);
    if (k === "seo") extra = seoPanelHTML(R);""")
rep("""    <div class="actions">
      <button class="primary" id="runBtn" data-i18n="run">Revisar guion</button>""", """    <details class="set-det" id="setDet"><summary><span data-i18n="setTitle">Variante y versión bíblica</span><span class="set-cur" id="setCur"></span></summary>
    <div class="vr-row">
    <div class="field aud-field"><label for="audience" data-i18n="audLabel">Público del canal</label>
      <select id="audience"><option value="both" data-i18n="audBoth">Latinoamérica y España (neutro)</option><option value="latam" data-i18n="audLatam">Latinoamérica</option><option value="es" data-i18n="audEs">España</option></select></div>
    <div class="field bible-field"><label for="translation" data-i18n="trLabel">Versión bíblica</label>
      <select id="translation"><optgroup label="Español"><option value="RVR1960">RVR1960 · Reina-Valera 1960</option><option value="NVI">NVI · Nueva Versión Internacional</option><option value="LBLA">LBLA · La Biblia de las Américas</option><option value="NBLA">NBLA · Nueva Biblia de las Américas</option><option value="NTV">NTV · Nueva Traducción Viviente</option><option value="DHH">DHH · Dios Habla Hoy</option><option value="RVC">RVC · Reina Valera Contemporánea</option></optgroup><optgroup label="English"><option value="KJV">KJV · King James Version</option><option value="NKJV">NKJV · New King James Version</option><option value="NASB">NASB · New American Standard Bible</option><option value="ESV">ESV · English Standard Version</option><option value="NIV">NIV · New International Version</option><option value="NLT">NLT · New Living Translation</option></optgroup></select>
      <p class="hint" id="bibleHint"></p></div>
    </div>
    </details>
    <div class="actions">
      <button class="primary" id="runBtn" data-i18n="run">Revisar guion</button>""")
rep('  const pct = R.total ? Math.round((R.passed / R.total) * 100) : 0;\n  const ringc = R.worst === "rojo" ? "var(--rojo)" : R.worst === "amarillo" ? "var(--amarillo)" : "var(--verde)";', '  const SCR = scoreOf(R, state.fixDismissed);\n  const pct = SCR.score;\n  const ringc = SCR.band === "rojo" ? "var(--rojo)" : SCR.band === "amarillo" ? "var(--amarillo)" : "var(--verde)";')
rep('<div class="ring" style="--p:${pct};--ringc:${ringc}"><span>${R.passed}<small>/ ${R.total}</small></span></div>\n    <div class="vhead"><div class="big">${h(t("checksPass")(R.passed, R.total))}</div>', '<div class="ring" style="--p:${pct};--ringc:${ringc}"><span>${SCR.score}<small>/ 100</small></span></div>\n    <div class="vhead"><div class="big">${h(t("scTitle"))}: ${SCR.score}</div><div class="hint">${h(t("checksPass")(R.passed, R.total))}${SCR.open.length ? " · " + h(t("scLeft")(SCR.open.length, SCR.openPts)) : ""}</div>')
open(p, "w", encoding="utf-8").write(s)
print("ui ok")
