import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("window.__SB_MODE='member'; if(!sessionStorage.getItem('seen0')){localStorage.setItem('sd-intro','1');sessionStorage.setItem('seen0','1')}")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto("file:///home/claude/sd/standalone/site/index.html"); await pg.wait_for_timeout(700)
        await pg.evaluate("document.getElementById('script').value='Hola a todos. Hoy hablamos de la ansiedad y qué dice la Biblia.'; updateLive()"); await pg.wait_for_timeout(2500)
        on = await pg.evaluate("!!document.querySelector('#scToast.on')"); print("toast first time:", on)
        await pg.reload(); await pg.wait_for_timeout(700)
        await pg.evaluate("document.getElementById('script').value='Hola a todos. Hoy hablamos de la ansiedad.'; updateLive()"); await pg.wait_for_timeout(2500)
        on2 = await pg.evaluate("!!document.querySelector('#scToast.on')"); print("toast second time:", on2, "errs", errs)
        print("OK" if on and not on2 and not errs else "FAIL"); await b.close()
asyncio.run(main())
