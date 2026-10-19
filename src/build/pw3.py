import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1000, "height": 800})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file:///home/claude/sd/build/work.html")
        await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(200)
        print("EMPTY:", (await pg.inner_text("#guion"))[:120].replace("\n"," | "))
        await pg.click("#guion [data-gomode=review]")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("[data-ui=en]"); await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(300)
        txt = await pg.inner_text("#guion")
        print("EN:", txt[:500].replace("\n"," | "))
        # cue + heading test
        await pg.click("[data-mode=review]")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", "## Gancho\n¿Por qué Dios guarda silencio?\n\n## Punto 1\n" + TEXT)
        await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(300)
        print("SECS:", await pg.evaluate("G.secs.map(s=>s.type+(s.title?'('+s.title+')':'')).join(', ')"))
        print("ERR:", errs)
        await b.close()
asyncio.run(main())
