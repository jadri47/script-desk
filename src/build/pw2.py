SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
        await pg.goto(SDU+"build/work.html")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(300)
        await pg.click("#gPP"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("Space"); await pg.wait_for_timeout(4500)
        print("tau", await pg.evaluate("PP.tau.toFixed(2)+' playing='+PP.playing+' started='+PP.started"))
        await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(600)
        print("after arrows", await pg.evaluate("document.querySelectorAll('#pp').length + ' ' + document.activeElement.tagName + ' ' + document.activeElement.id"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        print("pp count", await pg.evaluate("document.querySelectorAll('#pp').length"), await pg.evaluate("PP.on"))
        await pg.click("#gReh"); await pg.wait_for_timeout(200)
        print("after reh click", await pg.evaluate("document.querySelectorAll('#pp').length"))
        print(errs)
        await b.close()
asyncio.run(main())
