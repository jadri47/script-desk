import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for scheme in ["light","dark"]:
          for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            ctx = await b.new_context(viewport={"width":w,"height":hh}, color_scheme=scheme)
            pg = await ctx.new_page(); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file:///home/claude/sd/build/work.html"); await pg.wait_for_timeout(300)
            st = lambda: pg.evaluate("[document.documentElement.dataset.theme||'-', getComputedStyle(document.body).backgroundColor, document.getElementById('themeBtn').getAttribute('aria-label')].join(' | ')")
            print(scheme, n, "start:", await st())
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
            await pg.click("#themeBtn"); await pg.wait_for_timeout(150)
            print(scheme, n, "after click:", await st())
            await pg.screenshot(path=f"th_{scheme}_{n}.png")
            await pg.reload(); await pg.wait_for_timeout(300)
            print(scheme, n, "after reload:", await st())
            await pg.click("[data-ui=en]"); await pg.wait_for_timeout(200)
            print(scheme, n, "EN label:", await pg.evaluate("document.getElementById('themeBtn').title"))
            await ctx.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
