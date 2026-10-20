SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, sys, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
fails = []
def ok(name, cond, extra=""):
    print(("ok   " if cond else "FAIL ") + name, extra if not cond else "")
    if not cond: fails.append(name)
async def mk(b, w, h, ui="es", pre=""):
    pg = await b.new_page(viewport={"width": w, "height": h}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); " + pre)
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(700)
    return pg, errs
PILL = "(()=>{const p=document.getElementById('scorePill');if(!p)return null;const r=p.getBoundingClientRect();return {hidden:p.hidden||getComputedStyle(p).display==='none',n:(document.getElementById('scN')||{}).textContent,d:(document.getElementById('scD')||{}).textContent,cls:p.className,r:[r.left,r.top,r.right,r.bottom],parent:p.parentElement.className||p.parentElement.tagName}})()"
FRESH = "(()=>{const R=analyze($('script').value, readOpts());return scoreOf(R, state.fixDismissed).score})()"
async def main():
    async with async_playwright() as p:
        b = await getattr(p, __import__("os").environ.get("SD_BROWSER", "chromium")).launch()  # SD_BROWSER=chromium|firefox|webkit
        for (w, h, n) in [(390, 844, "m"), (1440, 900, "d")]:
            print("=====", n)
            pg, errs = await mk(b, w, h, pre="localStorage.setItem('sd-expert','0')")
            s0 = await pg.evaluate(PILL)
            ok(f"{n}: no pill with empty script", s0 is None or s0["hidden"], s0)
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(1500)
            s1 = await pg.evaluate(PILL)
            ok(f"{n}: pill visible after demo", s1 and not s1["hidden"], s1)
            ok(f"{n}: worker running", await pg.evaluate("!!SC.w"), await pg.evaluate("SC.noWorker"))
            fresh = await pg.evaluate(FRESH)
            ok(f"{n}: pill equals fresh scoreOf", s1 and int(s1["n"]) == fresh, f"{s1 and s1['n']} vs {fresh}")
            ok(f"{n}: placement", (s1["cls"].find("docked") >= 0) == (n == "d"), s1["cls"])
            # step 2: verdict shows the same number
            await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(600)
            if not await pg.query_selector("[data-fxapply]"):
                for k in ["bad", "worst", "good"]:
                    await pg.evaluate(f"startDemo('{k}')"); await pg.wait_for_timeout(1500); await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(600)
                    if await pg.query_selector("[data-fxapply]"): break
            vn = await pg.evaluate("(document.querySelector('.gv-n')||{}).childNodes ? document.querySelector('.gv-n').childNodes[0].textContent : null")
            ok(f"{n}: verdict number equals pill", vn is not None and int(vn) == int((await pg.evaluate(PILL))["n"]), f"{vn}")
            before = int((await pg.evaluate(PILL))["n"])
            # apply first quick fix
            btn = await pg.query_selector("[data-fxapply]")
            if btn:
                await pg.evaluate("document.querySelector('[data-fxapply]').click()"); await pg.wait_for_timeout(1800)
                after = int((await pg.evaluate(PILL))["n"])
                ok(f"{n}: first fix keeps or raises score", after >= before, f"{before} -> {after}")
            else: ok(f"{n}: fix button exists", False)
            # v2 popover: weights, lamp line, how-it's-scored
            await pg.click("#scorePill"); await pg.wait_for_timeout(300)
            v2 = await pg.evaluate("(()=>{const p=document.getElementById('scPop');return {pts:[...p.querySelectorAll('.sc-pts')].map(x=>x.textContent),how:!!p.querySelector('details.sc-how'),lamp:(p.querySelector('.sc-lamp')||{}).textContent||'',left:(p.querySelector('.sc-checks')||{}).textContent||''}})()")
            ok(f"{n}: popover top rows carry +N, sorted desc", v2["pts"] and all(x.startswith("+") for x in v2["pts"]) and [int(x[1:]) for x in v2["pts"]] == sorted([int(x[1:]) for x in v2["pts"]], reverse=True), v2["pts"])
            ok(f"{n}: popover has lamp line and how-it's-scored", v2["how"] and v2["lamp"], v2)
            ok(f"{n}: popover says how many points are left", "puntos" in v2["left"] or "punto" in v2["left"], v2["left"])
            ok(f"{n}: baseline key is v2", await pg.evaluate("scKey().startsWith('sd-score-base-v2:')"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            fxp = await pg.evaluate("[...document.querySelectorAll('.fix-pts')].map(x=>x.textContent)")
            ok(f"{n}: fix cards show +N", all(x.startswith("+") for x in fxp), fxp)
            # dismiss a fix
            b0 = int((await pg.evaluate(PILL))["n"])
            sk = await pg.query_selector("[data-fxskip]")
            if sk:
                await pg.evaluate("document.querySelector('[data-fxskip]').click()"); await pg.wait_for_timeout(400)
                b1 = int((await pg.evaluate(PILL))["n"])
                ok(f"{n}: dismissing never lowers the pill", b1 >= b0, f"{b0} -> {b1}")
                await pg.click("#scorePill"); await pg.wait_for_timeout(300)
                txt = await pg.evaluate("(document.getElementById('scPop')||{}).innerText||''")
                ok(f"{n}: popover lists dismissed + show again", "Ignoraste" in txt and "Volver a mostrar" in txt, txt[:200])
                ok(f"{n}: popover has honesty note", "No es la nota de YouTube" in txt)
                await pg.screenshot(path=OUT + f"sc_{n}_pop.png")
                await pg.evaluate("(async()=>{for(let i=0;i<9&&document.querySelector('[data-scshow]');i++){document.querySelector('[data-scshow]').click();await new Promise(r=>setTimeout(r,60))}})()"); await pg.wait_for_timeout(600)
                ok(f"{n}: show again restores", int((await pg.evaluate(PILL))["n"]) == b0, f"{b0} -> {b1} -> {(await pg.evaluate(PILL))['n']}")
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
                ok(f"{n}: Esc closes popover", await pg.evaluate("document.getElementById('scPop').hidden"))
            # geometry vs step bar / toast (phone)
            if n == "m":
                await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(400)
                g = await pg.evaluate("(()=>{const r=document.getElementById('scorePill').getBoundingClientRect(), s=document.getElementById('stepBar').getBoundingClientRect();return {pill:[r.top,r.bottom,r.left,r.right],bar:[s.top,s.bottom]}})()")
                ok("m: pill above step bar", g["pill"][1] <= g["bar"][0] + 0.5, g)
                await pg.evaluate("(()=>{const t=document.createElement('div');t.className='cost-toast on';t.id='costToast';t.innerHTML='<span>test toast</span><button>x</button>';document.body.appendChild(t)})()"); await pg.wait_for_timeout(400)
                g = await pg.evaluate("(()=>{const r=document.getElementById('scorePill').getBoundingClientRect(), t=document.getElementById('costToast').getBoundingClientRect();return {pill:[r.top,r.bottom],toast:[t.top,t.bottom],lift:document.getElementById('scorePill').classList.contains('lift')}})()")
                ok("m: pill above cost toast", g["pill"][1] <= g["toast"][0] + 0.5 and g["lift"], g)
                await pg.evaluate("document.getElementById('costToast').remove()"); await pg.wait_for_timeout(300)
            # prompter hides pill
            await pg.evaluate("document.documentElement.classList.add('pp-open')")
            ok(f"{n}: hidden while prompter open", (await pg.evaluate(PILL))["hidden"])
            await pg.evaluate("document.documentElement.classList.remove('pp-open')")
            ok(f"{n}: visible after prompter", not (await pg.evaluate(PILL))["hidden"])
            ok(f"{n}: no horizontal scroll", await pg.evaluate("document.documentElement.scrollWidth===innerWidth"))
            await pg.screenshot(path=OUT + f"sc_{n}.png")
            # hide persists across reload
            await pg.evaluate("scSetOff(true)"); await pg.wait_for_timeout(200)
            ok(f"{n}: hidden after off", (await pg.evaluate(PILL))["hidden"])
            print("LS before reload:", await pg.evaluate("Object.keys(localStorage).join(',')"))
            await pg.reload(); await pg.wait_for_timeout(900)
            print("LS after reload:", await pg.evaluate("Object.keys(localStorage).join(',')"))
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(1500)
            ok(f"{n}: off persists after reload", (await pg.evaluate(PILL))["hidden"], await pg.evaluate("({off:SC.off,ls:localStorage.getItem('sd-bubble'),pill:document.getElementById('scorePill').outerHTML.slice(0,200),has:hasScript()})"))
            ok(f"{n}: show button appears", await pg.evaluate("!document.getElementById('scShowBtn').hidden"), await pg.evaluate("({off:SC.off,has:hasScript(),txt:$('script').value.length,btn:document.getElementById('scShowBtn').outerHTML})"))
            await pg.evaluate("document.getElementById('scShowBtn').click()"); await pg.wait_for_timeout(1500)
            ok(f"{n}: show button brings it back", not (await pg.evaluate(PILL))["hidden"])
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
        # English
        print("===== en")
        pg, errs = await mk(b, 390, 844, pre="localStorage.setItem('sd-ui','en')")
        ok("en: UI is English", await pg.evaluate("UI==='en'"))
        await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(1500)
        await pg.click("#scorePill"); await pg.wait_for_timeout(300)
        txt = await pg.evaluate("(document.getElementById('scPop')||{}).innerText||''")
        ok("en: strings", "not YouTube" in txt and "Ignoraste" not in txt and "what raises it most" in txt.lower(), txt[:160])
        print(txt[:220].replace("\n", " | "))
        ok("en: no page errors", not errs, errs)
        await pg.close()
        # ---- typing-lag test: 4x CPU throttle, long tasks while typing, score off / worker / no worker ----
        print("===== typing lag (4x CPU throttle, 22-min example)")
        async def typing(mode):
            pre = "localStorage.setItem('sd-expert','0');" + ("window.__SD_NO_WORKER=1;" if mode == "main" else "")
            pg, errs = await mk(b, 390, 844, pre=pre)
            await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(2500)
            if mode == "off": await pg.evaluate("scSetOff(true)")
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(500)
            cdp = await pg.context.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
            await pg.evaluate("window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({entryTypes:['longtask']})")
            await pg.evaluate("(()=>{const e=document.querySelector('#ed, .ed, [contenteditable=true]');e.focus();const r=document.createRange();r.selectNodeContents(e);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)})()")
            before = await pg.evaluate("(document.getElementById('scN')||{}).textContent")
            await pg.keyboard.type(" Dios te sostiene en cada paso del camino, aun cuando no lo sientas, y por eso podemos seguir confiando hoy mismo.", delay=60)
            tend = await pg.evaluate("performance.now()")
            await pg.wait_for_timeout(2200)
            allt = await pg.evaluate("window.__lt")
            lt = [d for (s, d) in allt if s < tend]          # long tasks that hit while the user was typing
            late = [d for (s, d) in allt if s >= tend]       # after the last key (debounced run)
            print(mode, "after typing:", late)
            ms = await pg.evaluate("SC.ms")
            seqs = await pg.evaluate("SC.seq")
            fresh = await pg.evaluate(FRESH)
            shown = await pg.evaluate("(document.getElementById('scN')||{}).textContent")
            print(mode, "longtasks:", len(lt), "max:", max(lt) if lt else 0, "engine ms:", round(ms), "runs:", seqs, "pill:", shown, "fresh:", fresh, "errs:", errs)
            await pg.close()
            return lt, (shown, fresh), errs
        off, _, e0 = await typing("off")
        wk, (sh1, fr1), e1 = await typing("worker")
        mn, (sh2, fr2), e2 = await typing("main")
        mx = lambda l: max(l) if l else 0
        ok("typing: worker adds no long tasks (vs score off)", len(wk) <= len(off) + 1 and mx(wk) <= mx(off) + 40, f"off {len(off)}/{mx(off)} worker {len(wk)}/{mx(wk)}")
        ok("typing: main-thread fallback adds no long tasks (vs score off)", len(mn) <= len(off) + 1 and mx(mn) <= mx(off) + 40, f"off {len(off)}/{mx(off)} main {len(mn)}/{mx(mn)}")
        ok("typing: pill caught up within 2.2 s (worker)", sh1 is not None and abs(int(sh1) - fr1) <= 0, f"{sh1} vs {fr1}")
        ok("typing: pill caught up within 2.2 s (fallback)", sh2 is not None and abs(int(sh2) - fr2) <= 0, f"{sh2} vs {fr2}")
        ok("typing: no page errors", not (e0 or e1 or e2), [e0, e1, e2])
        await b.close()
    print("\nFAILS:", fails if fails else "none")
asyncio.run(main())
