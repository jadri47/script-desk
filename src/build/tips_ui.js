/* ===== First-use tips (plan "Walk Juan through it", step 5, 2026-10-26) ===== */
// Three small notes, each shown once per device in step 2 and in this order: the score («Esta es tu nota…»), the first change card,
// the primary button. A tip is a non-modal callout (role="note": no overlay, never takes the focus), points at its element and has one
// «Entendido» button; that stores `sd-tip-<name>` in localStorage and the next tip may appear. `localStorage['sd-tips-off']==='1'`
// turns all of them off (tests set it in mock_sb.js). Every storage access is in try/catch; without storage a dismissed tip stays
// dismissed for the session. None shows over the prompter, in step 3 or when printing.
Object.assign(T.es, {
  tipOk: "Entendido",
  tipBubble: "Esta es tu nota. Cada cambio que aceptes la sube.",
  tipCard: "Lee el cambio y elige cómo decirlo. Puedes saltarlo.",
  tipButton: "Toca aquí para aplicar y pasar al siguiente.",
});
Object.assign(T.en, {
  tipOk: "Got it",
  tipBubble: "This is your score. Every change you accept raises it.",
  tipCard: "Read the change and choose how to say it. You can skip it.",
  tipButton: "Tap here to apply and move to the next one.",
});

const TIP_DONE = new Set(); // dismissed in this session (also when storage is unavailable)
function tipGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; /* storage blocked: tips just follow the session */ } }
function tipSet(k) { TIP_DONE.add(k); try { localStorage.setItem(k, "1"); } catch (e) { /* best effort: storage blocked: dismissed for this session only */ } }
const tipsOff = () => tipGet("sd-tips-off") === "1";
const tipSeen = (k) => TIP_DONE.has(k) || tipGet(k) === "1";
const TIPS = [
  { key: "sd-tip-bubble", txt: "tipBubble", float: true,
    at: () => { const p = $("scorePill"), b = $("aiBub"); return p && !p.hidden && p.getClientRects().length && !(b && !b.hidden) ? p : null; } },
  { key: "sd-tip-card", txt: "tipCard", tail: "up",
    at: () => { const d = document.querySelector(".rp-dec:not(.rp-end)"); return d && d.querySelector(".rp-prog, .rp-dec-h") ? d : null; } },
  { key: "sd-tip-button", txt: "tipButton", tail: "down",
    at: () => { const d = document.querySelector(".rp-dec:not(.rp-end)"); return d ? d.querySelector("[data-rp=apply]") : null; } },
];
function tipsScreen() { return V.guided && V.step === 2 && !document.querySelector(".pp") && !tipsOff(); }
function tipPlace(el) {
  const p = $("scorePill");
  if (!el || !el.classList.contains("sd-tip-float") || !p) return;
  const r = p.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, phone = vw < 600;
  const W = phone ? vw - 32 : Math.min(320, vw - 32), right = phone ? 16 : Math.max(16, vw - r.right), below = r.top < vh / 2;
  el.style.width = W + "px"; el.style.right = right + "px"; el.style.left = "auto";
  if (below) { el.style.top = Math.round(r.bottom + 12) + "px"; el.style.bottom = "auto"; } else { el.style.bottom = Math.round(vh - r.top + 12) + "px"; el.style.top = "auto"; }
  el.dataset.tail = below ? "up" : "down";
  el.style.setProperty("--tip-tail", Math.round(Math.min(W - 28, Math.max(14, vw - right - (r.left + r.width / 2) - 7))) + "px");
}
function tipsClear() { document.querySelectorAll(".sd-tip").forEach((e) => e.remove()); }
function tipsUpdate() {
  const cur = document.querySelector(".sd-tip");
  if (!tipsScreen()) { if (cur) tipsClear(); return; }
  let want = null, anchor = null;
  for (const tp of TIPS) { if (tipSeen(tp.key)) continue; const a = tp.at(); if (a) { want = tp; anchor = a; break; } }
  if (!want) { if (cur) tipsClear(); return; }
  if (cur && cur.dataset.tip === want.key && document.body.contains(cur) && (want.float || anchor.contains(cur) || anchor.parentNode.contains(cur))) { tipPlace(cur); return; }
  tipsClear();
  const el = document.createElement("div");
  el.className = "sd-tip" + (want.float ? " sd-tip-float" : ""); el.dataset.tip = want.key; el.setAttribute("role", "note");
  if (want.tail) el.dataset.tail = want.tail;
  el.innerHTML = `<span class="sd-tip-t">${h(t(want.txt))}</span><button type="button" class="sd-tip-ok">${h(t("tipOk"))}</button>`;
  el.querySelector("button").addEventListener("click", (e) => {
    const had = e.currentTarget === document.activeElement;
    tipSet(want.key); el.remove(); tipsUpdate();
    if (had) { const f = want.key === "sd-tip-bubble" ? $("scorePill") : document.querySelector("[data-rp-primary]"); if (f) f.focus(); } // the focus must not fall to the page
  });
  if (want.float) document.body.appendChild(el);
  else if (want.key === "sd-tip-card") anchor.querySelector(".rp-prog, .rp-dec-h").after(el);
  else anchor.closest(".rp-act").prepend(el);
  tipPlace(el);
}
const _renderGuideT = renderGuide;
renderGuide = function () { _renderGuideT(); tipsUpdate(); };
window.addEventListener("resize", () => tipPlace(document.querySelector(".sd-tip")));
window.addEventListener("scroll", () => tipPlace(document.querySelector(".sd-tip")), { passive: true, capture: true });
// the score pill and the AI bubble change without a new render: look again now and then, until every tip has been seen
setInterval(() => { if (!tipsOff() && TIPS.some((x) => !tipSeen(x.key))) tipsUpdate(); }, 700);
