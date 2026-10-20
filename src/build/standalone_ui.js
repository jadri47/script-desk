/* ===== Standalone: sign-in bar, wording without Claude, reopen last episode, save on leave ===== */
Object.assign(T.es, {
  aiOnlyClaude: "La IA funciona al entrar con Google con una cuenta del equipo.",
  aiPickNeed: "La IA funciona al entrar con Google con una cuenta del equipo.",
  aiUnavailable: "entra con Google para usarla",
  downloadNeeds: "No se pudo preparar la descarga.",
  gNoDb: "Entra con Google para guardar las producciones; aquí todo funciona, pero no se guarda.",
  histNeedsClaude: "Entra con Google para guardar versiones y anotar resultados.",
  saveNeedsClaude: "Entra con Google para guardar.",
  snapNeedsDb: "Entra con Google para guardar instantáneas.",
  srNeedDb: "Entra con Google para guardar el calendario y los episodios.",
  authIn: "Entrar con Google",
  authOut: "Salir",
  authLead: "Entra con Google para guardar tus episodios y usar la IA. Sin entrar puedes revisar guiones, pero no se guarda nada.",
  authAs: (e) => `Conectado como ${e}`,
  authNotMember: (e) => `La cuenta ${e} no tiene acceso todavía. Pide a Adrian que te agregue y vuelve a entrar.`,
  authNoLib: "No se pudo conectar con el servidor. Revisa tu conexión y recarga la página; mientras tanto puedes revisar guiones, pero no se guarda nada.",
  costMonth: (m) => `IA este mes: ${m}`,
  costToast: (c, model, i, o, m) => `IA · ${model} · ${c} esta vez (${i} → ${o} tokens)${m ? ` · ${m} este mes` : ""}`,
  costFail: (model, m) => `IA · ${model} · la respuesta falló${m ? ` · ${m} este mes` : ""}`,
  costClose: "Cerrar",
  expertConfirm: "¿Pasar al modo completo? Muestra todas las revisiones y herramientas a la vez. Puedes volver al modo guiado cuando quieras con el mismo interruptor.",
});
Object.assign(T.en, {
  aiOnlyClaude: "AI works after signing in with Google with a team account.",
  aiPickNeed: "AI works after signing in with Google with a team account.",
  aiUnavailable: "sign in with Google to use it",
  downloadNeeds: "The download couldn't be prepared.",
  gNoDb: "Sign in with Google to save productions; everything works here, but nothing is saved.",
  histNeedsClaude: "Sign in with Google to save versions and record results.",
  saveNeedsClaude: "Sign in with Google to save.",
  snapNeedsDb: "Sign in with Google to save snapshots.",
  srNeedDb: "Sign in with Google to save the calendar and episodes.",
  authIn: "Sign in with Google",
  authOut: "Sign out",
  authLead: "Sign in with Google to save your episodes and use AI. Without signing in you can review scripts, but nothing is saved.",
  authAs: (e) => `Signed in as ${e}`,
  authNotMember: (e) => `The account ${e} doesn't have access yet. Ask Adrian to add you, then sign in again.`,
  authNoLib: "Couldn't reach the server. Check your connection and reload; meanwhile you can review scripts, but nothing is saved.",
  costMonth: (m) => `AI this month: ${m}`,
  costToast: (c, model, i, o, m) => `AI · ${model} · ${c} this time (${i} → ${o} tokens)${m ? ` · ${m} this month` : ""}`,
  costFail: (model, m) => `AI · ${model} · the answer failed${m ? ` · ${m} this month` : ""}`,
  costClose: "Close",
  expertConfirm: "Switch to full mode? It shows every check and tool at once. You can go back to guided mode anytime with the same switch.",
});
Object.assign(T.es.err, { not_member: "Tu cuenta no está en el equipo; pide a Adrian que te agregue.", no_key: "La IA no está configurada todavía (falta la clave). Avisa a Adrian.", daily_limit: "Se alcanzó el límite diario de la IA. Prueba mañana.", upstream: "La IA no respondió. Prueba de nuevo en un momento.", network: "Sin conexión. Revisa internet y prueba de nuevo.", bad_request: "La solicitud no es válida; prueba con un guion más corto." });
Object.assign(T.en.err, { not_member: "Your account isn't on the team; ask Adrian to add you.", no_key: "AI isn't set up yet (missing key). Tell Adrian.", daily_limit: "Daily AI limit reached. Try tomorrow.", upstream: "The AI didn't answer. Try again in a moment.", network: "No connection. Check the internet and try again.", bad_request: "The request isn't valid; try a shorter script." });

let AUTH = { session: null, member: false };
function renderAuthBar() {
  const el = $("authBar");
  if (!el) return;
  if (AUTH.offline) { el.hidden = false; el.className = "auth-bar warn"; el.innerHTML = `<p>${h(t("authNoLib"))}</p>`; return; }
  if (!AUTH.session) {
    el.hidden = false; el.className = "auth-bar";
    el.innerHTML = `<p>${h(t("authLead"))}</p><button type="button" class="primary small" id="authIn">${h(t("authIn"))}</button>`;
    $("authIn").addEventListener("click", async (e) => {
      e.target.disabled = true;
      await window.__sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
    });
    return;
  }
  if (!AUTH.member) {
    el.hidden = false; el.className = "auth-bar warn";
    el.innerHTML = `<p>${h(t("authNotMember")(AUTH.email || ""))}</p><button type="button" class="small" id="authOut">${h(t("authOut"))}</button>`;
  } else {
    el.hidden = false; el.className = "auth-bar ok";
    el.innerHTML = `<p>${h(t("authAs")(AUTH.email || ""))}${MONTH_COST != null ? `<span class="auth-cost"> · <span id="costMonth">${h(t("costMonth")(fmtUsd(MONTH_COST)))}</span></span>` : ""}</p><button type="button" class="small linkish" id="authOut">${h(t("authOut"))}</button>`;
  }
  $("authOut").addEventListener("click", async () => { try { await window.__sb.auth.signOut(); } catch (e) { /* best effort: sign-out failing still reloads signed out locally */ } lsSet("sd-last", ""); location.replace(location.origin + location.pathname); });
}
window.__sdAuth.then((a) => { AUTH = a || AUTH; renderAuthBar(); });
const _gOnLangAuth = gOnLang;
gOnLang = function () { _gOnLangAuth(); renderAuthBar(); };

// Remember the open episode so a reload brings it back.
const _applyProdL = applyProd;
applyProd = function (id, d) { _applyProdL(id, d); if (!DEMO) lsSet("sd-last", id || ""); };
const _createProdL = createProd;
createProd = async function () { const ok = await _createProdL(); if (ok && !DEMO && G.prodId) lsSet("sd-last", G.prodId); return ok; };
window.__sdAuth.then(async (a) => {
  if (!a || !a.member) return;
  const last = lsGet("sd-last");
  if (!last || DEMO || G.prodId || $("script").value.trim()) return;
  try {
    const db = await caps.db;
    const s = db && (await db.collection("producciones").doc(last).get());
    if (s && s.exists) await openFromSeries(last);
  } catch (e) { /* best effort: resuming the last episode is a convenience: open a blank script */ }
});

// Save pending edits when the page is hidden or closed (phone lock, tab switch).
function flushSave() { if (G.prodId && !DEMO && G.saveState !== "fail") { clearTimeout(saveTimer); saveProd(false); } }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });
window.addEventListener("pagehide", flushSave);

// Full mode is one tap away: confirm before leaving guided mode.
$("expertToggle").addEventListener("click", (e) => { if (V.guided && !confirm(t("expertConfirm"))) e.preventDefault(); }, true);

// ---------- AI cost per click ----------
let MONTH_COST = null;
function fmtUsd(x) {
  if (x == null || isNaN(x)) return "—";
  const v = Number(x);
  const s = v === 0 ? "0.00" : v < 0.01 ? v.toFixed(4) : v < 1 ? v.toFixed(3) : v.toFixed(2);
  return "$" + s;
}
const fmtTok = (n) => Number(n || 0).toLocaleString(UI === "en" ? "en-US" : "es-ES");
function showCostToast(u) {
  let el = $("costToast");
  if (!el) {
    el = document.createElement("div"); el.id = "costToast"; el.className = "cost-toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  const month = u.month_cost_usd != null ? fmtUsd(u.month_cost_usd) : "";
  const txt = u.cost_usd ? t("costToast")(fmtUsd(u.cost_usd), u.model_name || u.model, fmtTok(u.input_tokens), fmtTok(u.output_tokens), month) : t("costFail")(u.model_name || u.model, month);
  el.innerHTML = `<span>${h(txt)}</span><button type="button" aria-label="${h(t("costClose"))}">×</button>`;
  el.querySelector("button").addEventListener("click", () => el.classList.remove("on"));
  el.classList.add("on");
  clearTimeout(showCostToast.t);
  showCostToast.t = setTimeout(() => el.classList.remove("on"), 9000);
}
window.addEventListener("sd-ai-cost", (e) => {
  const u = e.detail || {};
  if (u.month_cost_usd != null) MONTH_COST = u.month_cost_usd;
  showCostToast(u);
  const m = $("costMonth"); if (m) m.textContent = t("costMonth")(fmtUsd(MONTH_COST)); else renderAuthBar();
});
window.__sdAuth.then(async (a) => {
  if (!a || !a.member || !window.__sb) return;
  try { const r = await window.__sb.rpc("sd_month_cost"); if (r && r.data != null) { MONTH_COST = Number(r.data); renderAuthBar(); } } catch (e) { /* best effort: month cost is display only */ }
});
