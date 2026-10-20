SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w, hh, n in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(700)
            st = lambda: pg.evaluate("({hidden:document.getElementById('trBox').hidden, exp:document.getElementById('trToggle').getAttribute('aria-expanded'), sel:!!document.getElementById('trTarget')&&document.getElementById('trTarget').offsetParent!==null, inMeta:!!document.getElementById('trBox').closest('.meta-line')})")
            print(n, "initial:", await st())
            ml = await pg.query_selector('.meta-line'); await ml.scroll_into_view_if_needed()
            await ml.screenshot(path=OUT + f"tr_{n}_closed.png")
            await pg.click("#trToggle"); await pg.wait_for_timeout(250)
            print(n, "after tap:", await st())
            await pg.select_option("#trTarget", "latam"); await pg.wait_for_timeout(200)
            print(n, "after change (stays open):", await st())
            await ml.screenshot(path=OUT + f"tr_{n}_open.png")
            await pg.click("#trToggle"); await pg.wait_for_timeout(250)
            print(n, "after 2nd tap:", await st())
            if n == "m":
                print("m meta-line overflow:", await pg.evaluate("(()=>{const m=document.querySelector('.meta-line');return [m.scrollWidth,m.clientWidth]})()"))
            await pg.close()
        print("page errors:", errs); await b.close()
asyncio.run(main())
