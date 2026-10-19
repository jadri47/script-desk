/* ===== Comprobación de versículos: texto de la Reina-Valera 1909 (dominio público) vía el servidor ===== */
Object.assign(T.es, {
  vcTitle: "Comprobar versículos",
  vcLead: "Busca cada cita con capítulo y versículo en la Reina-Valera 1909 (dominio público) y te avisa si no se encuentra. Es una ayuda, no un veredicto: la 1909 no es la 1960, y las diferencias de redacción son normales.",
  vcBtn: (n) => `Comprobar ${n} cita${n === 1 ? "" : "s"} en RVR1909`,
  vcBusy: "Buscando…",
  vcOk: "Encontrado", vcMissing: "No encontrado en RVR1909 · revisa la cita", vcUnk: "No se pudo comprobar",
  vcSrc: "RVR1909 · dominio público · vía API.Bible",
  vcSame: (p) => `Tu cita coincide ${p}% con la RVR1909.`,
  vcDiffNote: "Lo marcado en tu cita no está igual en la RVR1909.",
  vcOther: (v) => `Tu versión es ${v}: el texto de arriba es solo referencia. Las diferencias son normales; compara con tu Biblia.`,
  vcNoQuote: "Sin cita escrita en el guion.",
  vcChapterOnly: (n) => `${n} referencia${n === 1 ? "" : "s"} sin versículo no se comprueba${n === 1 ? "" : "n"}.`,
  vcErr: { no_key: "Falta la clave de la Biblia en el servidor.", bible_auth: "API.Bible rechazó la clave. Revísala en Supabase (API_BIBLE_KEY).", not_member: "Tu cuenta no tiene acceso.", not_granted: "Inicia sesión primero.", network: "Sin conexión.", upstream: "API.Bible no respondió. Intenta de nuevo." },
});
Object.assign(T.en, {
  vcTitle: "Check verses",
  vcLead: "",
  vcBtn: () => "", vcBusy: "", vcOk: "", vcMissing: "", vcUnk: "", vcSrc: "", vcSame: () => "", vcDiffNote: "", vcOther: () => "", vcNoQuote: "", vcChapterOnly: () => "", vcErr: {},
});

const VC = { R: null, busy: false, rows: null, err: "" };
caps.bible = cap("bible");
const vcKey = (r) => [r.code, r.chapter, r.verse, r.verseEnd || ""].join("|");
const vcNorm = (s) => s.replace(/[«»“”"‹›]/g, "").replace(/\s+/g, " ").trim();
function vcRefs(R) {
  const seen = new Map();
  for (const p of R.pairs) if (p.ref.verse != null && !seen.has(vcKey(p.ref))) seen.set(vcKey(p.ref), { code: p.ref.code, chapter: p.ref.chapter, verse: p.ref.verse, verseEnd: p.ref.verseEnd || null });
  return [...seen.values()];
}
function vcBlock(R) {
  if (!R || R.lang === "en" || !vcRefs(R).length) return "";
  const n = vcRefs(R).length, skipped = R.pairs.filter((p) => p.ref.verse == null).length;
  return `<div class="vc" id="vc"><p class="lead">${h(t("vcLead"))}</p>
    <div class="actions" style="margin-top:6px"><button class="small" data-vcheck ${VC.busy ? "disabled" : ""}>${h(VC.busy ? t("vcBusy") : t("vcBtn")(n))}</button><span class="status${VC.err ? " err" : ""}" id="vc-st">${h(VC.err)}</span></div>
    ${skipped ? `<p class="hint">${h(t("vcChapterOnly")(skipped))}</p>` : ""}<div id="vc-out">${vcRows(R)}</div></div>`;
}
function vcRows(R) {
  if (!VC.rows) return "";
  const tr = (state.opts && state.opts.translation) || "RVR1960";
  const out = [];
  const done = new Set();
  for (const p of R.pairs) {
    if (p.ref.verse == null) continue;
    const k = vcKey(p.ref); if (done.has(k)) continue; done.add(k);
    const x = VC.rows[k]; if (!x) continue;
    let body = "";
    const chip = x.status === "ok" ? `<span class="pass-t">✓ ${h(t("vcOk"))}</span>` : x.status === "missing" ? `<span class="warn-t">⚠ ${h(t("vcMissing"))}</span>` : `<span class="hint">${h(t("vcUnk"))}</span>`;
    if (x.status === "ok") {
      const ref = vcNorm(x.text);
      body += `<div class="i">«${h(ref.slice(0, 320))}${ref.length > 320 ? "…" : ""}»</div><div class="hint">${h(t("vcSrc"))}</div>`;
      if (!p.quote) body += `<div class="hint">${h(t("vcNoQuote"))}</div>`;
      else if (tr === "RVR1909") {
        const d = wordDiff(ref, vcNorm(p.quote.inner)), words = d.filter((w) => w.text.trim());
        const same = words.length ? Math.round((100 * words.filter((w) => !w.changed).length) / words.length) : 0;
        body += `<div class="i diff">${d.map((w) => (w.changed ? `<ins>${h(w.text)}</ins>` : h(w.text))).join("")}</div><div class="hint">${h(t("vcSame")(same))}${same < 100 ? " " + h(t("vcDiffNote")) : ""}</div>`;
      } else body += `<div class="hint">${h(t("vcOther")(tr))}</div>`;
    }
    out.push(`<div class="row"><div class="mark pass" style="background:var(--gold-bg);color:var(--gold)">✦</div><div><div class="t">${h(p.ref.canonical)} ${chip}</div>${body}</div></div>`);
  }
  return out.join("");
}
// Usage report required by API.Bible (FUMS). Anonymous ids only; failures never matter to the user.
function vcFums(rows) {
  try {
    const get = (k) => { try { let v = localStorage.getItem(k); if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, v); } return v; } catch (e) { return "anon"; } };
    const dId = get("sd-fums-d"), sId = VC.sid || (VC.sid = Math.random().toString(36).slice(2)), uId = get("sd-fums-u");
    Object.values(rows).forEach((x) => { if (x.fums) new Image().src = `https://fums.api.bible/f3?t=${encodeURIComponent(x.fums)}&dId=${encodeURIComponent(dId)}&sId=${encodeURIComponent(sId)}&uId=${encodeURIComponent(uId)}`; });
  } catch (e) {}
}
async function vcRun() {
  const R = VC.R; if (!R || VC.busy) return;
  const cap_ = await caps.bible;
  if (!cap_) { VC.err = t("vcErr").upstream; vcPaint(); return; }
  VC.busy = true; VC.err = ""; vcPaint();
  try {
    const res = await cap_.lookup(vcRefs(R));
    const rows = {};
    for (const x of res.results || []) rows[vcKey(x)] = x;
    VC.rows = rows; vcFums(rows);
  } catch (e) { VC.err = (t("vcErr")[e && e.code]) || t("vcErr").upstream; }
  VC.busy = false; vcPaint();
}
function vcPaint() { const el = $("vc"); if (!el || !VC.R) return; el.outerHTML = vcBlock(VC.R); wireVC(); }
function wireVC() { const b = document.querySelector("[data-vcheck]"); if (b) b.addEventListener("click", vcRun); }
const _sbVC = scriptureBlock;
scriptureBlock = function (R) { VC.R = R; return _sbVC(R) + vcBlock(R); };
const _rrVC = renderResults;
renderResults = function () { _rrVC(); wireVC(); };
