/* ===== Tema claro / oscuro: sigue al sistema hasta que el usuario elige ===== */
Object.assign(T.es, { themeToDark: "Cambiar a modo oscuro", themeToLight: "Cambiar a modo claro" });
Object.assign(T.en, { themeToDark: "Switch to dark mode", themeToLight: "Switch to light mode" });
const THEME_MQ = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
function themeNow() {
  const forced = document.documentElement.dataset.theme;
  if (forced === "dark" || forced === "light") return forced;
  return THEME_MQ && THEME_MQ.matches ? "dark" : "light";
}
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
function paintThemeBtn() {
  const b = $("themeBtn"); if (!b) return;
  const dark = themeNow() === "dark";
  b.innerHTML = dark ? ICON_SUN : ICON_MOON; // shows what you'll get
  const lbl = t(dark ? "themeToLight" : "themeToDark");
  b.setAttribute("aria-label", lbl); b.title = lbl;
}
$("themeBtn").addEventListener("click", () => {
  const next = themeNow() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("sd-theme", next); } catch (e) { /* best effort: storage blocked: the theme applies but isn't remembered */ }
  paintThemeBtn();
});
if (THEME_MQ) { const f = () => paintThemeBtn(); if (THEME_MQ.addEventListener) THEME_MQ.addEventListener("change", f); else if (THEME_MQ.addListener) THEME_MQ.addListener(f); }
const _gOnLangTheme = gOnLang;
gOnLang = function () { _gOnLangTheme(); paintThemeBtn(); };
paintThemeBtn();
