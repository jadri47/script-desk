import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1000, "height": 900}); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file:///home/claude/sd/build/work.html")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(400)
        print("open initially:", await pg.evaluate("document.getElementById('sec-manuscript').open"))
        el = await pg.query_selector("#sec-manuscript"); await el.scroll_into_view_if_needed(); await pg.screenshot(path="ms_closed.png")
        await pg.click("#sec-manuscript > summary"); await pg.wait_for_timeout(100)
        print("open after click:", await pg.evaluate("document.getElementById('sec-manuscript').open"))
        await pg.click("[data-ui=en]"); await pg.wait_for_timeout(200)
        print("open after lang switch:", await pg.evaluate("document.getElementById('sec-manuscript').open"))
        print(errs); await b.close()
asyncio.run(main())
