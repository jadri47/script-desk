import asyncio
from playwright.async_api import async_playwright
S=open('sample.txt').read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,vw in [("m",{"width":420,"height":900}),("d",{"width":1100,"height":900})]:
            pg=await b.new_page(viewport=vw); errs=[]
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file:///home/claude/sd/script-desk.html")
            if name=="m": await pg.screenshot(path="m0.png")
            await pg.fill("#script", S); await pg.click("#extraFields summary"); await pg.fill("#title","¿Qué dice la Biblia sobre el silencio de Dios?")
            await pg.click("#runBtn"); await pg.wait_for_timeout(500)
            await (await pg.query_selector(".verdict")).scroll_into_view_if_needed()
            await pg.screenshot(path=f"{name}1.png")
            await pg.evaluate("document.querySelector('.mods').scrollIntoView()"); await pg.wait_for_timeout(100)
            await pg.screenshot(path=f"{name}2.png")
            await pg.click("#sec-structure summary"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=f"{name}3.png")
            # click top-fix link opens its module
            await pg.click(".topfix a[data-open]"); await pg.wait_for_timeout(200)
            print(name, "opened:", await pg.evaluate("[...document.querySelectorAll('details.mod[open]')].map(d=>d.id)"), "errors", errs)
            await pg.close()
        await b.close()
asyncio.run(main())
