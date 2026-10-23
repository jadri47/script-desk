SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
EX = json.load(open("examples.json"))
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name,w,hh,theme in [("d",1440,900,"light"),("k",1440,900,"dark"),("m",390,844,"light")]:
            ctx = await b.new_context(viewport={"width":w,"height":hh})
            pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1'); localStorage.setItem('sd-theme','{theme}'); localStorage.removeItem('sd-phase')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(1200)
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(800)
            print(name, "phase:", await pg.evaluate("G.phase"), "| tab height:", await pg.evaluate("$('guion').scrollHeight"))
            # pick a hook, open section 5, type a title
            await pg.click("#gCold [data-use=hook]"); await pg.wait_for_timeout(500)
            print(name, "hook chosen:", await pg.evaluate("!!G.cold.hook"), "| slot filled:", await pg.evaluate("document.querySelectorAll('#gCold .co-slot:not(.empty)').length"))
            await pg.click("#gStruct [data-st='4']"); await pg.wait_for_timeout(700)
            print(name, "open sec:", await pg.evaluate("G.stOpen"), "| editor scrolled:", await pg.evaluate("ED.el.scrollTop"), "| flash:", await pg.evaluate("!!document.querySelector('.ed .ed-flash')"))
            await pg.fill("#pkTitleIn", "¿Por qué nos cuesta orar? Lo que enseñó Jesús"); await pg.fill("#pkThumbIn", "Ora sin miedo"); await pg.wait_for_timeout(700)
            print(name, "approve enabled:", await pg.evaluate("!$('gApprove').disabled"), "| phase bar:", await pg.evaluate("$('phBar').innerText.replace(/\\n/g,' ')"))
            if name=="m":
                await pg.screenshot(path=OUT+f"ph_{name}_prep.png", full_page=True)
            else:
                await pg.evaluate("$('paneR').scrollTo(0,0)")
                H = await pg.evaluate("$('paneR').scrollHeight"); await pg.set_viewport_size({"width":w,"height":min(H+300,8000)}); await pg.wait_for_timeout(400)
                await pg.screenshot(path=OUT+f"ph_{name}_prep.png")
                await pg.set_viewport_size({"width":w,"height":hh}); await pg.wait_for_timeout(300)
            await pg.click("#gApprove"); await pg.wait_for_timeout(900)
            print(name, "after approve phase:", await pg.evaluate("G.phase"), "status:", await pg.evaluate("G.status"))
            await pg.screenshot(path=OUT+f"ph_{name}_rec.png", full_page=(name=="m"))
            await pg.click("[data-phase=after]"); await pg.wait_for_timeout(700)
            await pg.screenshot(path=OUT+f"ph_{name}_after.png", full_page=(name=="m"))
            # guided step 4 uses the same record card
            await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(600)
            print(name, "guided rec card:", await pg.evaluate("!!document.querySelector('#guide #gRecCard')"), "errs:", errs)
            await pg.screenshot(path=OUT+f"ph_{name}_g4.png", full_page=(name=="m"))
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=OUT+f"ph_{name}_g3.png", full_page=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
