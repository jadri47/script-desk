# Step 2 as a walk (report_ui.js, 2026-10-26, plan "Walk Juan through it" step 3): one card at a time, «Cambio i de n · Área» with
# «+n a la nota» (itemGain of the CHOSEN wording), «Aplicar y seguir →» raises the pill by exactly that +n and shows a chip under the pill,
# «Saltar» / «Anterior» move without touching text or score, the end card says what happened, «Ir a Publicar →» lands on step 3,
# «Revisión detallada» is the one small disclosure at the bottom, and on a phone the primary button stays above the step bar.
# ES + EN, desktop 1280x800 + phone 390x844, light + dark (WALK_UI=es WALK_SZ=d narrows a run while iterating). Needs mock_sb.js (guest demo); caps.sample is a test-local mock.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"chg": "Cambio", "of": "de", "gain": "a la nota", "go": "Aplicar y seguir →", "skip": "Saltar", "prev": "‹ Anterior", "endh": "Terminaste los cambios", "count": "2 aplicados · 1 saltado", "pub": "Ir a Publicar →", "re": "Medir de nuevo con la IA", "detail": "Revisión detallada", "old": "Más detalles", "areas": {"hook": "Gancho", "retention": "Retención", "return": "Que vuelvan"}, "none": "sin aplicar ninguno"},
      "en": {"chg": "Change", "of": "of", "gain": "to your score", "go": "Apply and continue →", "skip": "Skip", "prev": "‹ Previous", "endh": "You finished the changes", "count": "2 applied · 1 skipped", "pub": "Go to Publish →", "re": "Measure again with the AI", "detail": "Detailed review", "old": "More details", "areas": {"hook": "Hook", "retention": "Retention", "return": "Return viewers"}, "none": "applied none"}}
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
CARD = r"""() => { const d = document.querySelector('.rp-dec'); if (!d) return null;
  const go = d.querySelector('[data-rp=apply]') || d.querySelector('[data-rp=publish]');
  return { head: ((d.querySelector('.rp-prog b') || d.querySelector('.rp-prog-t') || {}).textContent || '').trim(), gain: (d.querySelector('.rp-gain') || {}).textContent || '', end: d.classList.contains('rp-end'),
    go: go ? go.textContent.trim() : '', goH: go ? go.getBoundingClientRect().height : 0, radios: d.querySelectorAll('input[name=rpPick]').length, checked: (d.querySelector('input[name=rpPick]:checked') || {}).value,
    skip: (d.querySelector('[data-rp=skip]') || {}).textContent || '', prev: (d.querySelector('[data-rp=prev]') || {}).textContent || '', write: !!d.querySelector('[data-rp=write]') }; }"""
PILL = r"""() => +document.getElementById('scN').textContent"""
SMALL = r"""() => { const root = document.querySelector('.rp'); let min = 99, who = '';
  for (const el of root.querySelectorAll('*')) { if (el.closest('.vh') || el.classList.contains('vh')) continue; const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const f = parseFloat(cs.fontSize); if (f < min) { min = f; who = el.className || el.tagName; } }
  return [min, who]; }"""
CONTRAST = r"""(sels) => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = (c) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(255,255,255)'; };
  const ratio = (el) => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
  return sels.map((s) => { const el = document.querySelector(s); return el ? [s, Math.round(ratio(el) * 100) / 100] : null; }).filter(Boolean); }"""
async def open_page(b, ui, vp):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def go(pg, demo, ui, mock=True):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(900)
    picks = await pg.evaluate(PICK)
    if mock: await pg.evaluate(MOCK, [picks, ui == "en"])
    await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
    return picks
GAIN = "(a) => itemGain(state.text, state.result, state.opts, G.report, a[0], a[1], state.fixDismissed)"
def num(s): return int(re.search(r"\d+", s).group()) if s and re.search(r"\d+", s) else None
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in os.environ.get("WALK_UI", "es,en").split(","):
            X = TX[ui]
            for (w, hh, nm) in [z for z in [(1280, 800, "d"), (390, 844, "m")] if z[2] in os.environ.get("WALK_SZ", "d,m").split(",")]:
                n = f"{ui}/{nm}"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                picks = await go(pg, "best", ui)
                ok(f"{n}: the demo gave three real sentences", all(picks), picks)
                st = await pg.evaluate("({ calls: window.__calls, busy: RP.busy, n: G.report && G.report.items.length })")
                ok(f"{n}: one AI call and a report with three changes", st["calls"] == 1 and st["n"] == 3, st)
                # ---- (a) card 1: progress, area, +n = itemGain of the chosen wording
                c = await pg.evaluate(CARD)
                ok(f"{n}: (a) the card says «{X['chg']} 1 {X['of']} 3 · {X['areas']['hook']}»", c and c["head"] == f"{X['chg']} 1 {X['of']} 3 · {X['areas']['hook']}", c)
                g0 = await pg.evaluate(GAIN, [0, None])
                ok(f"{n}: (a) «+n {X['gain']}» equals itemGain of the editor's wording ({g0})", g0 > 0 and c["gain"] == f"+{g0} {X['gain']}", (c["gain"], g0))
                ok(f"{n}: the primary button says «{X['go']}», {X['skip']} exists, Anterior is disabled on the first card", c["go"] == X["go"] and c["skip"] == X["skip"] and c["prev"] == X["prev"] and await pg.evaluate("document.querySelector('[data-rp=prev]').disabled"), c)
                ok(f"{n}: the radio list of alternatives is still there (3 options)", c["radios"] == 3 and c["checked"] == "0", c)
                ok(f"{n}: the primary button is at least {48 if nm == 'm' else 44}px tall", c["goH"] >= (48 if nm == "m" else 44), c["goH"])
                mn = await pg.evaluate(SMALL)
                ok(f"{n}: nothing on the walk is below 14px", mn[0] >= 14, mn)
                # ---- (g) the one small disclosure at the bottom
                ok(f"{n}: (g) one disclosure «{X['detail']}», no «{X['old']}» in step 2", await pg.evaluate("[...document.querySelectorAll('#guide details.rp-more')].map((d) => d.querySelector('summary .rp-more-t').textContent)") == [X["detail"]])
                await pg.evaluate("document.getElementById('rpMoreSum').scrollIntoView()")
                sh = await pg.evaluate("(() => { const s = document.getElementById('rpMoreSum').getBoundingClientRect(); const nav = document.querySelector('.g-nav-steps').getBoundingClientRect(); return [s.height, s.top < nav.top]; })()")
                ok(f"{n}: (g) it sits above the step navigation and is at least 44px tall", sh[0] >= 44 and sh[1], sh)
                await pg.click("#rpMoreSum"); await pg.wait_for_timeout(500)
                ok(f"{n}: (g) opening it shows the old details (line by line, «Ver por párrafos»…)", await pg.evaluate("document.getElementById('rpMore').open && !!document.getElementById('gExpertGo')"))
                await pg.click("#rpMoreSum"); await pg.wait_for_timeout(500)
                ok(f"{n}: (g) closing it again hides them", not await pg.evaluate("document.getElementById('rpMore').open"))
                await pg.evaluate("window.scrollTo(0, 0)")
                # ---- (f) choose an alternative: +n becomes that wording's; applying it puts exactly that text in
                alt = await pg.evaluate("G.report.items[0].alts[1]")
                await pg.click('input[name=rpPick][value="2"]'); await pg.wait_for_timeout(400)
                c = await pg.evaluate(CARD)
                g2 = await pg.evaluate(GAIN, [0, alt])
                ok(f"{n}: (f) with the 2nd alternative chosen, +n is that wording's ({g2}) and the radio stays chosen", c["gain"] == (f"+{g2} {X['gain']}" if g2 > 0 else "") and c["checked"] == "2", (c["gain"], g2, c["checked"]))
                # the +n must follow the CHOSEN wording even when two wordings are worth different amounts: stub itemGain by wording
                await pg.evaluate("(a) => { window.__ig = itemGain; itemGain = (t, R, o, rep, i, w, d) => (w === a ? 5 : w == null ? 2 : 1); RPG.m = new Map(); }", alt)
                await pg.click('input[name=rpPick][value="0"]'); await pg.wait_for_timeout(300)
                g_main = (await pg.evaluate(CARD))["gain"]
                await pg.click('input[name=rpPick][value="2"]'); await pg.wait_for_timeout(300)
                g_alt = (await pg.evaluate(CARD))["gain"]
                await pg.evaluate("() => { itemGain = window.__ig; RPG.m = new Map(); }")
                ok(f"{n}: (f) the +n changes with the wording chosen (editor's {g_main!r}, 2nd alternative {g_alt!r})", num(g_main) == 1 and num(g_alt) == 5, (g_main, g_alt))
                await pg.click('input[name=rpPick][value="2"]'); await pg.wait_for_timeout(300)
                # ---- (b) Enter on the focused radio = primary; pill rises by EXACTLY +n, text changed, next card, chip
                p0 = await pg.evaluate(PILL); t0 = await pg.evaluate("$('script').value")
                await pg.focus('input[name=rpPick][value="2"]'); await pg.keyboard.press("Enter")
                await pg.wait_for_timeout(500)
                chip = await pg.evaluate("(() => { const e = document.getElementById('rpChip'); return e ? { on: e.classList.contains('on'), txt: e.textContent.replace(/\\s+/g, ' ').trim(), live: e.getAttribute('aria-live'), role: e.getAttribute('role'), op: getComputedStyle(e).opacity, r: e.getBoundingClientRect().right, w: innerWidth } : null; })()")
                await pg.wait_for_timeout(1500)
                p1 = await pg.evaluate(PILL); t1 = await pg.evaluate("$('script').value")
                ok(f"{n}: (b) Enter on the chosen radio applies: the text now holds the chosen wording, not the original", alt in t1 and picks[0] not in t1 and t1 != t0)
                ok(f"{n}: (b) the pill rose by EXACTLY the shown +n ({p0} + {g2})", p1 == p0 + g2 and g2 > 0, (p0, p1, g2))
                a_to = await pg.evaluate("effectiveReport($('script').value, G.report).areas.hook.rating")
                ok(f"{n}: (b) the chip is on the bubble, polite live region, «+{g2} · {X['areas']['hook']} ●●●○○ → ●●●●●»", chip and chip["on"] and chip["live"] == "polite" and chip["role"] == "status" and f"+{g2} · {X['areas']['hook']}" in chip["txt"] and "●●●○○ → ●●●●●" in chip["txt"] and chip["r"] <= chip["w"], chip)
                await pg.screenshot(path=OUT + f"walk_{ui}_{nm}_chip.png")
                c = await pg.evaluate(CARD)
                ok(f"{n}: (b) the next card is «{X['chg']} 2 {X['of']} 3 · {X['areas']['retention']}»", c and c["head"] == f"{X['chg']} 2 {X['of']} 3 · {X['areas']['retention']}", c)
                ok(f"{n}: (b) the card's +n is the next change's itemGain", c["gain"] == f"+{await pg.evaluate(GAIN, [1, None])} {X['gain']}", c["gain"])
                if nm == "m":
                    ok(f"{n}: the chip stays inside the phone", chip["r"] <= 390 + 0.5, chip)
                # ---- Enter in a text box never applies
                await pg.click("[data-rp=write]"); await pg.wait_for_timeout(300)
                await pg.focus("#rpW"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
                c = await pg.evaluate(CARD)
                ok(f"{n}: Enter inside «Lo escribo yo» only adds a line: still card 2, text unchanged", c["head"].startswith(f"{X['chg']} 2 ") and await pg.evaluate("$('script').value") == t1, c)
                await pg.click("[data-rp=wcancel]"); await pg.wait_for_timeout(300)
                await pg.wait_for_timeout(1800)
                ok(f"{n}: the chip is gone after about 3 seconds", not await pg.evaluate("document.getElementById('rpChip').classList.contains('on')"))
                # ---- (c) Saltar: pill and text unchanged, moves on
                p2 = await pg.evaluate(PILL)
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(1500)
                c = await pg.evaluate(CARD)
                ok(f"{n}: (c) {X['skip']} leaves pill ({p2}) and text unchanged and shows card 3 {X['chg']} 3 {X['of']} 3", c["head"] == f"{X['chg']} 3 {X['of']} 3 · {X['areas']['return']}" and await pg.evaluate(PILL) == p2 and await pg.evaluate("$('script').value") == t1, c)
                # ---- (d) Anterior goes back to card 2, text not undone
                await pg.click("[data-rp=prev]"); await pg.wait_for_timeout(800)
                c = await pg.evaluate(CARD)
                ok(f"{n}: (d) Anterior goes back to card 2 without touching the text", c["head"] == f"{X['chg']} 2 {X['of']} 3 · {X['areas']['retention']}" and await pg.evaluate("$('script').value") == t1, c)
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(1200)
                # ---- (h) phone: the primary button is reachable above the step bar, no sideways scroll
                if nm == "m":
                    for sy in [200, 400, 100000]:
                        await pg.evaluate(f"window.scrollTo(0, {sy})"); await pg.wait_for_timeout(250)
                        r = await pg.evaluate("(() => { const b = document.querySelector('[data-rp=apply]').getBoundingClientRect(), s = document.getElementById('stepBar').getBoundingClientRect(); return { top: b.top, bottom: b.bottom, bar: s.top, vh: innerHeight, w: b.width, secw: document.querySelector('.rp-dec').getBoundingClientRect().width, sx: document.documentElement.scrollWidth, iw: innerWidth }; })()")
                        ok(f"{n}: (h) scrolled to {min(sy, 9999)}: the primary button is in the viewport and above the step bar", r["top"] >= 0 and r["bottom"] <= r["bar"] + 0.5 and r["bottom"] <= r["vh"], r)
                    ok(f"{n}: (h) full-width primary, no horizontal scroll", r["w"] >= r["secw"] - 30 and r["sx"] <= r["iw"], r)
                    await pg.evaluate("window.scrollTo(0, 0)")
                else:
                    ok(f"{n}: no horizontal scroll", await pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
                await pg.screenshot(path=OUT + f"walk_{ui}_{nm}_card3.png")
                ct = await pg.evaluate(CONTRAST, [".rp-gain", ".rp-prog b", ".rp-detail summary", ".rp-detail summary .hint"])
                ok(f"{n}: light: gain, progress and disclosure texts >= 4.5:1", all(v >= 4.5 for _, v in ct), ct)
                await pg.emulate_media(color_scheme="dark"); await pg.wait_for_timeout(300)
                ct = await pg.evaluate(CONTRAST, [".rp-gain", ".rp-prog b", ".rp-detail summary", ".rp-detail summary .hint"])
                ok(f"{n}: dark: gain, progress and disclosure texts >= 4.5:1", all(v >= 4.5 for _, v in ct), ct)
                await pg.emulate_media(color_scheme="light"); await pg.wait_for_timeout(200)
                # ---- apply the last one by click; the end card
                g3 = await pg.evaluate(GAIN, [2, None]); p3 = await pg.evaluate(PILL)
                await pg.evaluate("window.scrollTo(0, 0)")
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(2200)
                p4 = await pg.evaluate(PILL)
                ok(f"{n}: (b) by click the last change also raises the pill by exactly its +n ({p3} + {g3})", g3 > 0 and p4 == p3 + g3, (p3, g3, p4))
                c = await pg.evaluate(CARD)
                ok(f"{n}: (e) the end card shows «{X['endh']}»", c and c["end"] and await pg.evaluate("document.querySelector('.rp-end h3').textContent") == X["endh"], c)
                e = await pg.evaluate("(() => { const d = document.querySelector('.rp-end'); const rd = readinessOf(state.result, G.report, state.fixDismissed, state.text); return { cnt: d.querySelector('.rp-end-c').textContent, list: [...d.querySelectorAll('.rp-end-l li')].map((x) => x.textContent.replace(/\\s+/g, ' ').trim()), nums: [...d.querySelectorAll('.rp-end-n [aria-hidden]')].map((x) => x.textContent.trim()), before: rpBeforeOf(rd), now: rd.score, pill: +document.getElementById('scN').textContent, re: (d.querySelector('[data-rp=re]') || {}).textContent, pub: d.querySelector('[data-rp=publish]').textContent.trim() }; })()")
                ok(f"{n}: (e) «{X['count']}»", e["cnt"] == X["count"], e["cnt"])
                ok(f"{n}: (e) the applied changes are listed with ✓ and their area", e["list"] == [f"✓ {X['areas']['hook']}", f"✓ {X['areas']['return']}"], e["list"])
                # «antes» derived on its own: the report's ratings without the applied changes (readinessOf without the text), not through rpBeforeOf
                e["indep"] = await pg.evaluate("readinessOf(state.result, G.report, state.fixDismissed).score")
                ok(f"{n}: (e) the numbers are «antes → ahora» ({e['indep']} → {e['now']}) and the pill", e["nums"] == [f"{e['indep']} →", str(e["now"])] and e["before"] == e["indep"] and e["now"] == e["pill"] == p4 and e["indep"] < e["now"], e)
                ok(f"{n}: (e) «{X['re']}» link and «{X['pub']}» primary", e["re"] == X["re"] and e["pub"] == X["pub"], e)
                await pg.screenshot(path=OUT + f"walk_{ui}_{nm}_end.png")
                mn = await pg.evaluate(SMALL)
                ok(f"{n}: nothing on the end card is below 14px", mn[0] >= 14, mn)
                # the pill and the popover agree with the end card
                await pg.click("#scorePill"); await pg.wait_for_timeout(350)
                big = await pg.evaluate("document.querySelector('#scPop .sc-big').childNodes[1].textContent")
                sub = await pg.evaluate("(document.querySelector('#scPop .sc-sub') || {}).textContent || ''")
                ok(f"{n}: the bubble's big number is the same, and its «antes» is the end card's ({e['indep']})", int(big) == p4 and str(e["indep"]) in sub, (big, sub))
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
                await pg.click("[data-rp=publish]"); await pg.wait_for_timeout(900)
                ok(f"{n}: (e) «{X['pub']}» lands on step 3", await pg.evaluate("V.step") == 3)
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
            # ---- skipped-only run says so honestly (once per language, desktop)
            n = f"{ui}/skip"
            pg, errs = await open_page(b, ui, {"width": 1280, "height": 800})
            await go(pg, "best", ui)
            p0 = await pg.evaluate(PILL); t0 = await pg.evaluate("$('script').value")
            for _ in range(3):
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(500)
            e = await pg.evaluate("(() => { const d = document.querySelector('.rp-end'); return d ? { h: d.querySelector('h3').textContent, cnt: d.querySelector('.rp-end-c').textContent, list: d.querySelectorAll('.rp-end-l li').length, nums: [...d.querySelectorAll('.rp-end-n [aria-hidden]')].map((x) => x.textContent.trim()) } : null; })()")
            ok(f"{n}: all skipped: the end card says none applied, 0 applied · 3 skipped, no arrow, no list", e and X["none"] in e["h"] and e["cnt"] == ("0 aplicados · 3 saltados" if ui == "es" else "0 applied · 3 skipped") and e["list"] == 0 and e["nums"] == [str(p0)] and await pg.evaluate("$('script').value") == t0, e)
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
            # ---- (i) a risk card: «+n» only when the pill really rises by it
            for (w, hh, nm) in [z for z in [(1280, 800, "d"), (390, 844, "m")] if z[2] in os.environ.get("WALK_SZ", "d,m").split(",")]:
                n = f"{ui}/{nm}/risk"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await go(pg, "bad", ui)
                info = await pg.evaluate("({ cur: rpCurrent() && rpCurrent().type, n: rpWalk(rpCurrent()).n, i: rpWalk(rpCurrent()).i })")
                ok(f"{n}: (i) the first card is an ad warning counted in the walk (1 of {info['n']})", info["cur"] == "risk" and info["i"] == 1 and info["n"] >= 2, info)
                c = await pg.evaluate(CARD)
                ok(f"{n}: (i) the ad-warning card has the same progress line and the big primary", c["head"].startswith(f"{X['chg']} 1 {X['of']} ") and c["go"] == X["go"], c)
                p0 = await pg.evaluate(PILL); shown = num(c["gain"]) or 0
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(2200)
                p1 = await pg.evaluate(PILL)
                ok(f"{n}: (i) the pill moved by exactly what the card showed ({p0} → {p1}, shown +{shown}; nothing is shown when it would not rise)", p1 - p0 == shown, (p0, p1, c["gain"]))
                c = await pg.evaluate(CARD)
                ok(f"{n}: (i) the walk goes on and the count is stable (card 2 of the same total)", c and c["head"].startswith(f"{X['chg']} 2 {X['of']} {info['n']}"), (c and c["head"], info["n"]))
                # one «antes» everywhere (2026-10-28): after fixing ad warnings AND editor changes, the end card starts from the pill the
                # person saw when the report landed (it said «75 → 83» after a start at 55: the ad fixes were counted in «antes»)
                for _ in range(12):
                    if not await pg.query_selector("[data-rp=apply]"): break
                    await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(1300)
                e = await pg.evaluate("(() => { const d = document.querySelector('.rp-end'); return d ? [...d.querySelectorAll('.rp-end-n [aria-hidden]')].map((x) => x.textContent.trim()) : null; })()")
                stored = await pg.evaluate("G.report && G.report.before")
                ok(f"{n}: the end card's «antes» is the pill seen when the report landed ({p0}), stored as report.before", e and num(e[0]) == p0 and stored == p0 and e[-1] == str(await pg.evaluate(PILL)), (e, stored, p0))
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        print("FAILS:", fails if fails else "none"); await b.close()
asyncio.run(main())
