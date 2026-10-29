# Chrome and first use (plan "Walk Juan through it", step 5, 2026-10-26): (a) step 1 in guided mode asks only for the script, the rest sits behind
# «Más opciones»; (b) «Modo completo» lives in the ⋯ menu (aria-haspopup, Esc returns the focus, items >= 44px); (c) phone step 2: the card first,
# under it only the paragraph being changed, «Ver guion completo» gives the docked script back, the primary stays above the step bar on every walk
# screen (step 2 card + end card, step 3 six cards + Grabar); (d) three first-use tips, once each, in order, dismissal persists, none with
# sd-tips-off, none steal the focus; (e) the step bar shows ✓ on done steps and fills the current one.
# ES + EN, desktop 1280x800 + phone 390x844 (CH_UI=es CH_SZ=m narrows a run). Needs mock_sb.js (guest demo); caps.sample is a test-local mock.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"more": "Más opciones", "s1more": "Más opciones", "full": "Ver guion completo", "back": "Ver solo este párrafo", "okb": "Entendido", "steps": ["Escribir", "Mejorar", "Publicar"],
             "tips": {"sd-tip-bubble": "Esta es tu nota. Cada cambio que aceptes la sube.", "sd-tip-card": "Lee el cambio y elige cómo decirlo. Puedes saltarlo.", "sd-tip-button": "Toca aquí para aplicar y pasar al siguiente."}},
      "en": {"more": "More options", "s1more": "More options", "full": "Show the full script", "back": "Show only this paragraph", "okb": "Got it", "steps": ["Write", "Improve", "Publish"],
             "tips": {"sd-tip-bubble": "This is your score. Every change you accept raises it.", "sd-tip-card": "Read the change and choose how to say it. You can skip it.", "sd-tip-button": "Tap here to apply and move to the next one."}}}
PICK = r"""() => { ensureReview();
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start) && !R.riskHits.some((h) => h.start < x.at + x.s.length && h.end > x.at); });
  const step = Math.max(1, Math.floor(sents.length / 4));
  return [sents[1 * step], sents[2 * step], sents[3 * step]].map((x) => x && x.s);
}"""
# three clean changes (hook / retention / return); the first has two alternatives, so a choice exists
MOCK = r"""([picks, en]) => { ensureReview();
  window.__calls = 0;
  const rep = (s, t) => s.replace(/[.!?]$/, '') + t;
  const json = { areas: { hook: { rating: 3, why: 'x' }, promise: { rating: 5, why: '' }, retention: { rating: 3, why: 'y' }, voice: { rating: 4, why: '' }, close: { rating: 5, why: '' }, return: { rating: 3, why: 'z' } },
    items: [
      { area: 'hook', original: picks[0], replacement: rep(picks[0], en ? ', and that changes everything.' : ', y eso lo cambia todo.'), alts: [rep(picks[0], en ? ', and that is the point.' : ', y esa es la clave.'), rep(picks[0], en ? ', so listen closely.' : ', así que escucha bien.')], why: 'w1', after: 5 },
      { area: 'retention', original: picks[1], replacement: rep(picks[1], en ? ', and that matters.' : ', y eso importa.'), why: 'w2', after: 4 },
      { area: 'return', original: picks[2], replacement: rep(picks[2], en ? ', see you next week.' : ', nos vemos la próxima semana.'), why: 'w3', after: 5 }] };
  json.words = [...new Set(state.result.riskHits.map((x) => x.text.toLowerCase()))].map((t) => ({ term: t, alts: en ? ['blows', 'lashes'] : ['golpes', 'azotes'] }));
  caps.sample = Promise.resolve({ serverRules: true, json: async () => { window.__calls++; await new Promise((r) => setTimeout(r, 200)); return JSON.parse(JSON.stringify(json)); } });
}"""
VIS = r"""(sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }"""
async def open_page(b, ui, vp, tips="1", extra=""):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))  # «Modo completo» asks once before leaving the guided steps
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-tips-off','{tips}');" + extra)
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def go(pg, demo, ui, mock=True):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(900)
    picks = await pg.evaluate(PICK)
    if mock: await pg.evaluate(MOCK, [picks, ui == "en"])
    await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
    return picks
CONTRAST = r"""(sels) => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = (c) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(255,255,255)'; };
  const ratio = (el) => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
  return sels.map((s) => { const el = document.querySelector(s); return el ? [s, Math.round(ratio(el) * 100) / 100] : null; }).filter(Boolean); }"""
FIELDS = ["#bigIdea", "#setDet", "#title", "#keyword", "#thumb", "#description", "#series", "#lang", "#translation", "#audience"]
BAR = r"""() => [...document.querySelectorAll('#stepBar .sb button')].map((b) => { const n = b.querySelector('.sb-n'), cs = getComputedStyle(b), ns = getComputedStyle(n);
  return { n: n.textContent.trim(), l: b.querySelector('.sb-l').textContent.trim(), cur: b.getAttribute('aria-current'), on: b.classList.contains('on'), done: b.classList.contains('done'), bg: cs.backgroundColor, nbg: ns.backgroundColor }; })"""
STICKY = r"""(sel) => { const b = document.querySelector(sel).getBoundingClientRect(), s = document.getElementById('stepBar').getBoundingClientRect();
  return { top: b.top, bottom: b.bottom, bar: s.top, vh: innerHeight, sx: document.documentElement.scrollWidth, iw: innerWidth }; }"""
FOCUS = r"""(txt) => { const ed = ED.el, eb = ed.getBoundingClientRect(), main = document.querySelector('main');
  const w = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT); let nd; while ((nd = w.nextNode())) if (nd.textContent.includes(txt)) break;
  if (!nd) return { found: false };
  const r = document.createRange(); r.setStart(nd, nd.textContent.indexOf(txt)); r.setEnd(nd, nd.textContent.indexOf(txt) + txt.length); const rb = r.getBoundingClientRect();
  let n = nd; while (n && n.parentNode !== ed) n = n.parentNode;
  const pv = n.previousElementSibling, nx = n.nextElementSibling, nb = n.getBoundingClientRect(), cap = Math.round(innerHeight * 0.4);
  return { found: true, cls: main.className, edTop: eb.top, edH: eb.height, cap, inView: rb.top >= eb.top - 1 && rb.bottom <= eb.bottom + 1, prevGone: !pv || pv.getBoundingClientRect().bottom <= eb.top + 1,
    nextGone: !nx || nx.getBoundingClientRect().top >= eb.bottom - 1, fits: nb.height <= cap - 30, pos: getComputedStyle(document.getElementById('editor')).position, blocks: ed.children.length }; }"""
TIPQ = r"""() => { const t = document.querySelectorAll('.sd-tip'); const e = t[0]; if (!e) return { n: 0 }; const r = e.getBoundingClientRect(), b = e.querySelector('button').getBoundingClientRect(), cs = getComputedStyle(e);
  return { n: t.length, key: e.dataset.tip, role: e.getAttribute('role'), txt: e.querySelector('.sd-tip-t').textContent, btn: e.querySelector('button').textContent, bh: b.height, fs: parseFloat(cs.fontSize), h: r.height, w: r.width, vw: innerWidth,
    dlg: !!e.closest('[role=dialog]') || !!e.querySelector('[role=dialog]') || e.getAttribute('aria-modal') === 'true', foc: e.contains(document.activeElement), act: document.activeElement.getAttribute('data-rp') || document.activeElement.id, disp: cs.display, sx: document.documentElement.scrollWidth > innerWidth }; }"""
async def sticky_ok(pg, n, label, sel, scrolls=(0, 200, 400, 100000)):
    for sy in scrolls:
        await pg.evaluate(f"window.scrollTo(0, {sy})"); await pg.wait_for_timeout(200)
        r = await pg.evaluate(STICKY, sel)
        ok(f"{n}: {label}: scrolled to {min(sy, 9999)} the primary is on screen above the step bar", r["top"] >= -0.5 and r["bottom"] <= r["bar"] + 0.5 and r["bottom"] <= r["vh"] + 0.5 and r["sx"] <= r["iw"], r)
    await pg.evaluate("window.scrollTo(0, 0)"); await pg.wait_for_timeout(150)
async def wait_tip(pg, key, to=16000):
    try:
        await pg.wait_for_selector(f".sd-tip[data-tip={key}]", timeout=to); return True
    except Exception:
        return False
async def ls(pg, k): return await pg.evaluate(f"localStorage.getItem('{k}')")
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in os.environ.get("CH_UI", "es,en").split(","):
            X = TX[ui]
            for (w, hh, nm) in [z for z in [(1280, 800, "d"), (390, 844, "m")] if z[2] in os.environ.get("CH_SZ", "d,m").split(",")]:
                n = f"{ui}/{nm}"; phone = nm == "m"; vp = {"width": w, "height": hh}
                # ---------------- (a) step 1 asks only for the script
                pg, errs = await open_page(b, ui, vp)
                ok(f"{n}: (a) step 1: the script box and the one primary button are on screen", await pg.evaluate(VIS, ".ed-wrap .ed") and await pg.evaluate(VIS, "#runBtn") and await pg.evaluate("$('runBtn').classList.contains('primary')"))
                shown = [f for f in FIELDS if await pg.evaluate(VIS, f)]
                ok(f"{n}: (a) central idea, variant/Bible version, title, keyword, thumbnail, description, series and language are not shown", not shown, shown)
                ok(f"{n}: (a) none of those fields was deleted from the page", await pg.evaluate("(l) => l.every((s) => document.querySelectorAll(s).length === 1)", FIELDS))
                mb = await pg.evaluate("(() => { const e = $('s1MoreBtn'); const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: e.getAttribute('aria-expanded'), h: r.height, v: r.width > 0 }; })()")
                ok(f"{n}: (a) one small «{X['s1more']}» disclosure, collapsed, at least 44px tall", mb["t"] == X["s1more"] and mb["x"] == "false" and mb["h"] >= 44 and mb["v"], mb)
                await pg.evaluate("$('bigIdea').value = 'Idea de prueba'; $('series').value = 'Ep. 9'")
                await pg.click("#s1MoreBtn"); await pg.wait_for_timeout(150)
                ok(f"{n}: (a) «{X['s1more']}» opens the central idea, the variant and Bible version, and the optional fields", await pg.evaluate("$('s1MoreBtn').getAttribute('aria-expanded')") == "true" and all([await pg.evaluate(VIS, s) for s in ["#bigIdea", "#setDet", "#extraFields"]]))
                await pg.evaluate("$('extraFields').open = true"); await pg.wait_for_timeout(100)
                ok(f"{n}: (a) the values typed there are still there (title, keyword, series, language reachable)", await pg.evaluate("$('bigIdea').value") == "Idea de prueba" and all([await pg.evaluate(VIS, s) for s in ["#title", "#keyword", "#series", "#lang"]]))
                await pg.click("#s1MoreBtn"); await pg.wait_for_timeout(150)
                ok(f"{n}: (a) closing it hides them again and keeps the values", not await pg.evaluate(VIS, "#bigIdea") and await pg.evaluate("$('bigIdea').value + '|' + $('series').value") == "Idea de prueba|Ep. 9")
                await pg.evaluate("$('bigIdea').value = ''; $('series').value = ''; $('extraFields').open = false")
                bar = await pg.evaluate(BAR)
                ok(f"{n}: (e) step 1: the current step is marked (aria-current, filled), the others show their number and name", bar[0]["cur"] == "step" and bar[0]["on"] and bar[1]["cur"] is None and bar[1]["n"] == "2" and [x["l"] for x in bar] == X["steps"], bar)
                # ---------------- (b) the ⋯ menu
                mbtn = await pg.evaluate("(() => { const b = $('moreBtn'), r = b.getBoundingClientRect(); return { l: b.getAttribute('aria-label'), hp: b.getAttribute('aria-haspopup'), ex: b.getAttribute('aria-expanded'), w: r.width, h: r.height, txt: b.textContent.trim() }; })()")
                ok(f"{n}: (b) ⋯ button «{X['more']}», aria-haspopup=menu, collapsed, at least 44x44", mbtn["l"] == X["more"] and mbtn["hp"] == "menu" and mbtn["ex"] == "false" and mbtn["w"] >= 44 and mbtn["h"] >= 44 and mbtn["txt"] == "⋯", mbtn)
                ok(f"{n}: (b) «Modo completo» is not in the header row any more (menu closed)", not await pg.evaluate("[...document.querySelectorAll('.masthead .xswitch')].some((e) => !e.closest('#moreMenu') && e.getClientRects().length)") and not await pg.evaluate(VIS, "#expertToggle") and await pg.evaluate("$('moreMenu').hidden"))
                await pg.click("#moreBtn"); await pg.wait_for_timeout(150)
                st = await pg.evaluate("({ ex: $('moreBtn').getAttribute('aria-expanded'), vis: !$('moreMenu').hidden, foc: document.activeElement.id, h: document.querySelector('.more-item').getBoundingClientRect().height, role: $('moreMenu').getAttribute('role'), txt: document.querySelector('.more-item').textContent.trim() })")
                ok(f"{n}: (b) tap opens the menu: expanded, role=menu, focus on the first item, item at least 44px", st["ex"] == "true" and st["vis"] and st["foc"] == "expertToggle" and st["h"] >= 44 and st["role"] == "menu", st)
                ok(f"{n}: (b) the item is «Modo completo» / «Full mode»", st["txt"] == ("Modo completo" if ui == "es" else "Full mode"), st["txt"])
                if phone:
                    ok(f"{n}: (b) the menu stays inside the phone", await pg.evaluate("(() => { const r = $('moreMenu').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()"))
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100)
                st = await pg.evaluate("({ ex: $('moreBtn').getAttribute('aria-expanded'), hid: $('moreMenu').hidden, foc: document.activeElement.id })")
                ok(f"{n}: (b) Esc closes the menu and returns the focus to ⋯", st["ex"] == "false" and st["hid"] and st["foc"] == "moreBtn", st)
                await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
                ok(f"{n}: (b) Enter on ⋯ opens it (keyboard)", await pg.evaluate("!$('moreMenu').hidden && document.activeElement.id === 'expertToggle'"))
                await pg.keyboard.press("Escape")
                await pg.click("#moreBtn"); await pg.mouse.click(3, hh - 120); await pg.wait_for_timeout(100)
                ok(f"{n}: (b) a tap outside closes it", await pg.evaluate("$('moreMenu').hidden && $('moreBtn').getAttribute('aria-expanded') === 'false'"))
                await pg.click("#moreBtn"); await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
                st = await pg.evaluate("({ g: V.guided, ls: lsGet('sd-expert'), view: document.querySelector('main').dataset.view, hid: $('moreMenu').hidden, ck: $('expertToggle').checked })")
                ok(f"{n}: (b) «Modo completo» turns full mode on exactly as before (state, storage, view) and closes the menu", st == {"g": False, "ls": "1", "view": "expert", "hid": True, "ck": True}, st)
                await pg.click("#moreBtn"); await pg.wait_for_timeout(100)
                ok(f"{n}: (b) reopened, the switch shows it is on", await pg.evaluate("$('expertToggle').checked"))
                await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
                st = await pg.evaluate("({ g: V.guided, ls: lsGet('sd-expert'), view: document.querySelector('main').dataset.view, ck: $('expertToggle').checked })")
                ok(f"{n}: (b) and back to the guided steps", st == {"g": True, "ls": "0", "view": "guide", "ck": False}, st)
                other = "en" if ui == "es" else "es"
                await pg.click(f"[data-ui={other}]"); await pg.wait_for_timeout(400)
                ok(f"{n}: (b) the ⋯ label follows the language", await pg.evaluate("$('moreBtn').getAttribute('aria-label')") == TX[other]["more"])
                await pg.click(f"[data-ui={ui}]"); await pg.wait_for_timeout(300)
                hd = await pg.evaluate("""() => { const c = (s) => { const e = document.querySelector(s), r = e.getBoundingClientRect(); return [r.top + r.height / 2, r.right]; }; const y = [c('.masthead h1'), c('.themebtn'), c('.langswitch'), c('#moreBtn')];
                  return { spread: Math.max(...y.map((v) => v[0])) - Math.min(...y.map((v) => v[0])), hs: document.documentElement.scrollWidth > innerWidth, bottom: document.getElementById('moreBtn').getBoundingClientRect().bottom, right: y[3][1] }; }""")
                ok(f"{n}: (b) the header row is one line (title, theme, language, ⋯) and nothing scrolls sideways", hd["spread"] <= 14 and not hd["hs"] and hd["right"] <= w, hd)
                await pg.screenshot(path=OUT + f"chrome_s1_{ui}_{nm}.png")
                await pg.click("#moreBtn"); await pg.screenshot(path=OUT + f"chrome_menu_{ui}_{nm}.png"); await pg.keyboard.press("Escape")
                ok(f"{n}: no page errors (step 1, menu)", not errs, errs)
                await pg.close()
                # ---------------- (c) step 2 on the phone, step 3, and (e) the step bar
                pg, errs = await open_page(b, ui, vp)
                picks = await go(pg, "best", ui)
                bar = await pg.evaluate(BAR)
                okc = bar[0]["done"] and bar[0]["n"] == "✓" and bar[0]["l"] == X["steps"][0] and bar[1]["on"] and bar[1]["cur"] == "step" and bar[1]["n"] == "2" and bar[2]["n"] == "3" and not bar[2]["done"] and not bar[2]["on"]
                ok(f"{n}: (e) step 2: step 1 shows ✓ and its name, the current step is filled and named, step 3 is plain", okc, bar)
                filled = (bar[1]["nbg"] if phone else bar[1]["bg"]) not in ("rgba(0, 0, 0, 0)", "transparent")
                ok(f"{n}: (e) the current step has a filled marker (not colour on text only)", filled, bar[1])
                if not phone:
                    ok(f"{n}: (c) desktop keeps the split view: no one-paragraph layout, no «{X['full']}» link", await pg.evaluate("document.documentElement.classList.contains('sd-split') && !document.querySelector('main').classList.contains('rp-focus') && !document.querySelector('main').classList.contains('rp-full')") and not await pg.evaluate(VIS, ".rp-wf") and not await pg.evaluate(VIS, ".rp-wh"))
                else:
                    await pg.evaluate("window.scrollTo(0, 0)"); await pg.wait_for_timeout(300)
                    r = await pg.evaluate("""() => { const d = document.querySelector('.rp-dec').getBoundingClientRect(), a = document.querySelector('[data-rp=apply]').getBoundingClientRect(), s = document.getElementById('stepBar').getBoundingClientRect();
                      return { decTop: d.top, aTop: a.top, aBottom: a.bottom, bar: s.top, vh: innerHeight, sx: document.documentElement.scrollWidth, iw: innerWidth, y: scrollY }; }""")
                    ok(f"{n}: (c) at scroll 0 the card starts on screen and the primary button is in view above the step bar", r["y"] == 0 and 0 <= r["decTop"] < r["bar"] - 150 and r["aTop"] >= 0 and r["aBottom"] <= r["bar"] + 0.5, r)
                    f = await pg.evaluate(FOCUS, picks[0][:40])
                    ok(f"{n}: (c) only the paragraph being changed shows under the card (the changed sentence is in view, the paragraphs before and after are out)", f["found"] and "rp-focus" in f["cls"] and f["inView"] and f["prevGone"] and (f["nextGone"] or not f["fits"]) and f["pos"] == "static" and f["edH"] <= f["cap"] + 1, f)
                    ok(f"{n}: (c) the paragraph box is below the card, and «Dónde está»/«{X['full']}» come with it", await pg.evaluate("(() => { const c = document.querySelector('.rp-dec').getBoundingClientRect().bottom, e = $('editor').getBoundingClientRect().top, l = document.querySelector('[data-rp-full]'); return e >= c - 1 && l.textContent.trim() === %r && l.getBoundingClientRect().height >= 44 && l.getAttribute('aria-pressed') === null; })()" % X["full"]))
                    await pg.screenshot(path=OUT + f"chrome_s2_focus_{ui}.png", full_page=True)
                    # the action row is a bar fixed above the step bar here (the paragraph and «Siguiente» follow the card), so it holds at every scroll
                    await sticky_ok(pg, n, "(c) step 2 change card", "[data-rp=apply]")
                    await pg.click("[data-rp-full]"); await pg.wait_for_timeout(500)
                    f = await pg.evaluate(FOCUS, picks[0][:40])
                    ok(f"{n}: (c) «{X['full']}» gives back the full docked script (sticky at the top, link now «{X['back']}», no aria-pressed: the label already says the state)", f["found"] and "rp-full" in f["cls"] and f["pos"] == "sticky" and not await pg.evaluate(VIS, ".rp-wh") and await pg.evaluate("document.querySelector('[data-rp-full]').textContent.trim()") == X["back"] and await pg.evaluate("document.querySelector('[data-rp-full]').getAttribute('aria-pressed')") is None, f)
                    await pg.screenshot(path=OUT + f"chrome_s2_full_{ui}.png")
                    await pg.click("[data-rp-full]"); await pg.wait_for_timeout(500)
                    f = await pg.evaluate(FOCUS, picks[0][:40])
                    ok(f"{n}: (c) «{X['back']}» returns to the one-paragraph view", f["found"] and "rp-focus" in f["cls"] and f["inView"] and f["prevGone"], f)
                    await pg.click("#rpMoreSum"); await pg.wait_for_timeout(700)
                    cls = await pg.evaluate("document.querySelector('main').className")
                    ok(f"{n}: (c) with «Más detalles» open the old docked layout is back (the walker needs it)", "rp-focus" not in cls and "rp-full" not in cls, cls)
                    await pg.click("#rpMoreSum"); await pg.wait_for_timeout(700)
                    ok(f"{n}: (c) closed again, the one-paragraph view returns", "rp-focus" in await pg.evaluate("document.querySelector('main').className"))
                    for k in range(3):
                        await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(900)
                    ok(f"{n}: (c) three applies reach the end card", await pg.evaluate("!!document.querySelector('.rp-end')"))
                    await sticky_ok(pg, n, "(c) step 2 end card", "[data-rp=publish]")
                    await pg.evaluate("window.scrollTo(0, 100000)"); await pg.wait_for_timeout(200)
                    ok(f"{n}: (c) at the bottom of the end card page «Siguiente» is reachable above the step bar", await pg.evaluate("(() => { const b = document.querySelector('.g-nav-steps .primary').getBoundingClientRect(); const a = document.querySelector('.rp-act').getBoundingClientRect(); return b.bottom <= a.top + 1 && b.top >= 0; })()"))
                    await pg.evaluate("window.scrollTo(0, 0)")
                    await pg.screenshot(path=OUT + f"chrome_s2_end_{ui}.png")
                    await pg.click("[data-rp=publish]"); await pg.wait_for_timeout(900)
                    ok(f"{n}: (c) «Ir a Publicar» lands on step 3", await pg.evaluate("V.step") == 3)
                    for k in range(6):
                        await pg.evaluate("window.scrollTo(0, 0)")
                        await pg.evaluate("pubReset(); PB.i = %d; renderGuide()" % k); await pg.wait_for_timeout(300)
                        sel = "#gApprove" if k == 5 else ".pub-go"
                        r = await pg.evaluate(STICKY, sel)
                        ok(f"{n}: (c) step 3 card {k + 1}: the primary is on screen above the step bar at scroll 0", r["top"] >= 0 and r["bottom"] <= r["bar"] + 1 and r["sx"] <= r["iw"], r)
                        if k == 5:
                            await sticky_ok(pg, n, "(c) step 3 card 6", sel, scrolls=(200, 100000))
                    await pg.evaluate("pubReset(); PB.i = 5; renderGuide()"); await pg.wait_for_timeout(300)
                    await pg.evaluate("$('title').value = '¿Qué dice la Biblia sobre la ansiedad?'; $('thumb').value = 'No cargues mañana'; $('description').value = 'Una enseñanza.\\n0:00 Inicio\\n3:00 Texto\\n9:00 Cierre'; G.nextEp = 'Salmo 23'; renderGuide()"); await pg.wait_for_timeout(300)
                    if await pg.evaluate("!$('gApprove').disabled"):
                        await pg.click("#gApprove"); await pg.wait_for_timeout(1000)
                    await pg.evaluate("window.scrollTo(0, 0)"); await pg.wait_for_timeout(200)
                    r = await pg.evaluate(STICKY, "#gPP")
                    ok(f"{n}: (c) «Grabar»: the first big button (prompter) is on screen above the step bar at scroll 0", await pg.evaluate("!!document.querySelector('.pub-recw')") and r["top"] >= 0 and r["bottom"] <= r["bar"] + 1 and r["sx"] <= r["iw"], r)
                    await pg.screenshot(path=OUT + f"chrome_rec_{ui}.png")
                    bar = await pg.evaluate(BAR)
                    ok(f"{n}: (e) step 3: steps 1 and 2 show ✓ with their names, step 3 is the current one", bar[0]["n"] == "✓" and bar[1]["n"] == "✓" and bar[2]["on"] and bar[2]["cur"] == "step" and bar[2]["n"] == "3", bar)
                ok(f"{n}: no page errors (steps 2-3)", not errs, errs)
                await pg.close()
        # ---------------- (d) first-use tips (ES phone, EN desktop)
        KEYS = ["sd-tip-bubble", "sd-tip-card", "sd-tip-button"]
        for (ui, w, hh, nm) in [("es", 390, 844, "m"), ("en", 1280, 800, "d")]:
            if ui not in os.environ.get("CH_UI", "es,en").split(",") or nm not in os.environ.get("CH_SZ", "d,m").split(","):
                continue
            X = TX[ui]; n = f"{ui}/{nm}"; vp = {"width": w, "height": hh}; mh = 48 if w < 600 else 44
            pg, errs = await open_page(b, ui, vp, tips="0")
            await go(pg, "best", ui)
            await pg.evaluate("document.querySelector('[data-rp=skip]').focus()")
            ok(f"{n}: (d) the score tip shows first, after the AI bubble has closed", await wait_tip(pg, "sd-tip-bubble"))
            q = await pg.evaluate(TIPQ)
            ok(f"{n}: (d) tip 1: one tip only, role=note (not a dialog), exact text, «{X['okb']}» at least {mh}px, text at least 16px, no sideways scroll", q["n"] == 1 and q["role"] == "note" and not q["dlg"] and q["txt"] == X["tips"]["sd-tip-bubble"] and q["btn"] == X["okb"] and q["bh"] >= mh and q["fs"] >= 16 and not q["sx"], q)
            ok(f"{n}: (d) it is small (not an overlay) and did not take the focus", q["h"] < 220 and q["w"] <= q["vw"] and not q["foc"] and q["act"] == "skip", q)
            await pg.screenshot(path=OUT + f"chrome_tip1_{ui}_{nm}.png")
            CON = await pg.evaluate(CONTRAST, [".sd-tip-t", ".sd-tip-ok"]); await pg.emulate_media(color_scheme="dark"); await pg.wait_for_timeout(200)
            CD = await pg.evaluate(CONTRAST, [".sd-tip-t", ".sd-tip-ok"]); await pg.emulate_media(color_scheme="light")
            ok(f"{n}: (d) tip text and button >= 4.5:1 in light and dark", all(v >= 4.5 for _, v in CON + CD), (CON, CD))
            await pg.emulate_media(media="print"); await pg.wait_for_timeout(150)
            ok(f"{n}: (d) when printing no tip is drawn", await pg.evaluate("getComputedStyle(document.querySelector('.sd-tip')).display") == "none")
            await pg.emulate_media(media="screen")
            await pg.click(".sd-tip .sd-tip-ok"); await pg.wait_for_timeout(200)
            ok(f"{n}: (d) «{X['okb']}» stores sd-tip-bubble and the next tip is the card tip, inside the card", await ls(pg, "sd-tip-bubble") == "1" and await wait_tip(pg, "sd-tip-card", 4000) and await pg.evaluate("!!document.querySelector('.rp-dec .sd-tip')"))
            q = await pg.evaluate(TIPQ)
            ok(f"{n}: (d) tip 2: one tip, exact text", q["n"] == 1 and q["txt"] == X["tips"]["sd-tip-card"] and q["role"] == "note" and q["bh"] >= mh, q)
            await pg.screenshot(path=OUT + f"chrome_tip2_{ui}_{nm}.png")
            await pg.click(".sd-tip .sd-tip-ok"); await pg.wait_for_timeout(250)
            ok(f"{n}: (d) then the button tip, attached to the action row", await ls(pg, "sd-tip-card") == "1" and await wait_tip(pg, "sd-tip-button", 4000) and await pg.evaluate("!!document.querySelector('.rp-act .sd-tip')"))
            q = await pg.evaluate(TIPQ)
            ok(f"{n}: (d) tip 3: one tip, exact text", q["n"] == 1 and q["txt"] == X["tips"]["sd-tip-button"] and q["bh"] >= mh, q)
            if w < 600:
                await sticky_ok(pg, n, "(d) with the button tip showing", "[data-rp=apply]")
            await pg.screenshot(path=OUT + f"chrome_tip3_{ui}_{nm}.png")
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(900)
            ok(f"{n}: (d) in step 3 (and over the prompter) no tip is drawn", await pg.evaluate("document.querySelectorAll('.sd-tip').length") == 0)
            await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(1500)
            ok(f"{n}: (d) back in step 2 the button tip is still waiting (not dismissed)", await pg.evaluate("document.querySelectorAll('.sd-tip').length") == 1)
            await pg.click(".sd-tip .sd-tip-ok"); await pg.wait_for_timeout(300)
            ok(f"{n}: (d) all three dismissed: stored, none left, and the focus is not lost to the page", [await ls(pg, k) for k in KEYS] == ["1", "1", "1"] and await pg.evaluate("document.querySelectorAll('.sd-tip').length") == 0 and await pg.evaluate("document.activeElement !== document.body"))
            await pg.reload(); await pg.wait_for_timeout(600); await go(pg, "best", ui); await pg.wait_for_timeout(9000)
            ok(f"{n}: (d) after a reload no tip comes back", await pg.evaluate("document.querySelectorAll('.sd-tip').length") == 0 and [await ls(pg, k) for k in KEYS] == ["1", "1", "1"])
            ok(f"{n}: no page errors (tips)", not errs, errs)
            await pg.close()
            pg, errs = await open_page(b, ui, vp, tips="0", extra="if (!localStorage.getItem('sd-tip-bubble')) localStorage.setItem('sd-tip-bubble', '1');")
            await go(pg, "best", ui)
            ok(f"{n}: (d) with the score tip already dismissed a new visit starts with the card tip", await wait_tip(pg, "sd-tip-card") and await pg.evaluate("document.querySelectorAll('.sd-tip[data-tip=sd-tip-bubble]').length") == 0)
            await pg.close()
            pg, errs = await open_page(b, ui, vp, tips="1")
            await go(pg, "best", ui); await pg.wait_for_timeout(9000)
            ok(f"{n}: (d) with sd-tips-off=1 no tip ever shows (the default of every other suite through mock_sb.js)", await pg.evaluate("document.querySelectorAll('.sd-tip').length") == 0 and [await ls(pg, k) for k in KEYS] == [None, None, None])
            await pg.close()
            blocked = "const _g = Storage.prototype.getItem, _s = Storage.prototype.setItem; Storage.prototype.getItem = function (k) { if (/^sd-tip-/.test(k)) throw new Error('blocked'); return _g.call(this, k); }; Storage.prototype.setItem = function (k, v) { if (/^sd-tip-/.test(k)) throw new Error('blocked'); return _s.call(this, k, v); };"
            pg, errs = await open_page(b, ui, vp, tips="0", extra=blocked)
            await go(pg, "best", ui)
            ok(f"{n}: (d) storage that throws: the tip still shows", await wait_tip(pg, "sd-tip-bubble"))
            await pg.click(".sd-tip .sd-tip-ok"); await pg.wait_for_timeout(300)
            ok(f"{n}: (d) …dismissing it does not break the page and it does not come back in the same session", await pg.evaluate("document.querySelectorAll('.sd-tip[data-tip=sd-tip-bubble]').length") == 0 and not errs, errs)
            await pg.close()
        print("FAILS:", fails if fails else "none"); await b.close()
asyncio.run(main())
