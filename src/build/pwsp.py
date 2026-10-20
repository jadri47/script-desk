SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
EX = json.load(open("examples.json"))
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
SET = "v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for theme in ["light","dark"]:
            ctx = await b.new_context(viewport={"width":1440,"height":900})
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-theme','{theme}');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            print(theme, "split:", await pg.evaluate("SPLIT.on"), "| page scrolls:", await pg.evaluate("document.documentElement.scrollHeight > innerHeight + 2"))
            await pg.screenshot(path=OUT+f"sp1_{theme}.png")
            await pg.evaluate(SET, EX["es"]["mid"]["text"]); await pg.wait_for_timeout(300)
            print(theme, "ed box:", await pg.evaluate("JSON.stringify((r=>({t:Math.round(r.top),h:Math.round(r.height),b:Math.round(r.bottom)}))($('ed').getBoundingClientRect()))"), "| run btn visible:", await pg.evaluate("(r=>r.top>0&&r.bottom<innerHeight)($('runBtn').getBoundingClientRect())"))
            await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            print(theme, "step:", await pg.evaluate("V.step"), "| editor visible step2:", await pg.is_visible("#ed"), "| right pane scrollable:", await pg.evaluate("$('paneR').scrollHeight > $('paneR').clientHeight"))
            await pg.screenshot(path=OUT+f"sp2_{theme}.png")
            # apply first fix -> editor updates live
            before = await pg.evaluate("$('ed').innerText.length")
            btn = await pg.query_selector("#guide li.fx:not(.fx-closed) [data-fxapply]")
            if btn:
                await btn.click(); await pg.wait_for_timeout(700)
                print(theme, "editor changed after fix:", await pg.evaluate("$('ed').innerText.length") != before)
            # edit on the left -> stale bar
            await pg.click("#ed"); await pg.keyboard.press("Control+End"); await pg.keyboard.type(" Amén."); await pg.wait_for_timeout(900)
            print(theme, "stale bar:", await pg.is_visible("#staleBar"))
            await pg.click("#staleGo"); await pg.wait_for_timeout(500)
            print(theme, "stale gone:", not await pg.evaluate("!!$('staleBar')"))
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=OUT+f"sp3_{theme}.png")
            # narrow -> single column order
            await pg.set_viewport_size({"width":800,"height":900}); await pg.wait_for_timeout(300)
            print(theme, "narrow split:", await pg.evaluate("SPLIT.on"), "| order ok:", await pg.evaluate("(()=>{const e=$('editor');return e.firstElementChild.classList.contains('script-field') && !!e.querySelector('.meta-line') && $('guideTop').nextElementSibling===e})()"), "| page scrolls:", await pg.evaluate("document.documentElement.scrollHeight > innerHeight + 2"))
            await pg.set_viewport_size({"width":1440,"height":900}); await pg.wait_for_timeout(300)
            print(theme, "back to split:", await pg.evaluate("SPLIT.on"))
            await ctx.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
