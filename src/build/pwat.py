SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for (w, h, n) in [(390, 844, "m"), (1440, 900, "d")]:
            pg = await b.new_page(viewport={"width": w, "height": h}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','0'); localStorage.setItem('sd-more-open','1')")  # the ads list is in step 2's «Más detalles» (open it: 2026-10-22)
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(700)
            for k in ["worst", "mid", "best"]:
                await pg.evaluate(f"startDemo('{k}')"); await pg.wait_for_timeout(1500)
                await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(600)
                await pg.evaluate("(()=>{const d=document.querySelector('.g-more-d[data-more=\"ads\"]'); if(d) d.open=true})()"); await pg.wait_for_timeout(300)
                info = await pg.evaluate("(()=>{const l=document.querySelector('.pf-list'); if(!l) return null; return {rows:l.querySelectorAll('.pf-d').length, chips:[...l.querySelectorAll('.pf-chips')].map(c=>c.innerText.replace(/\\s+/g,' ')).slice(0,4), clear:(l.querySelector('.pf-clear')||{}).innerText||''}})()")
                print(n, k, info)
                if k == "worst":
                    el = await pg.query_selector(".pf-list"); await el.scroll_into_view_if_needed()
                    await pg.evaluate("document.querySelectorAll('.pf-d')[1].open=true"); await pg.wait_for_timeout(200)
                    await el.screenshot(path=OUT + f"at_{n}.png")
            print(n, "no h-scroll:", await pg.evaluate("document.documentElement.scrollWidth===innerWidth"))
            await pg.close()
        print("errors:", errs); await b.close()
asyncio.run(main())
