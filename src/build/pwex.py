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
            await pg.goto(URL); await pg.wait_for_timeout(800)
            print(n, "collapsed:", await pg.evaluate("!document.querySelector('#exPick details').open"), "cards:", await pg.evaluate("document.querySelectorAll('#exPick [data-ex]').length"))
            el = await pg.query_selector('#exPick'); await el.scroll_into_view_if_needed(); await el.screenshot(path=OUT + f"ex_{n}_closed.png")
            await pg.click("#exPick summary"); await pg.wait_for_timeout(200)
            await el.screenshot(path=OUT + f"ex_{n}_open.png")
            print(n, "names:", await pg.evaluate("[...document.querySelectorAll('#exPick .ex-h')].map(e=>e.textContent.trim())"))
            for k in ["worst", "bad", "mid", "good", "best"]:
                await pg.evaluate(f"startDemo('{k}')"); await pg.wait_for_timeout(1800)
                info = await pg.evaluate("(()=>{const r=state.result; if(!r) return 'no result'; const fails=Object.values(r.sections).flat().filter(x=>!x.passed).map(x=>x.id); const warns=Object.values(r.sections).flat().filter(x=>x.warn).map(x=>x.id); return {score:r.passed+'/'+r.total, min:Math.round(r.runtimeSec/60), fails, warns, banner:(document.getElementById('demoBar')||{}).innerText.slice(0,60)}})()")
                print(n, k, info)
                if n == "d" and k == "best":
                    await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(1200)
                    print(n, "best guion flags:", await pg.evaluate("[...document.querySelectorAll('.gsec-flags .flag')].map(e=>e.textContent)"))
                    print(n, "best ads:", await pg.evaluate("((document.getElementById('pkAds')||{}).innerText||'').split('\\n').filter(l=>/^\\d+:\\d\\d/.test(l))"))
                    print(n, "best chapters:", await pg.evaluate("((document.getElementById('chOut')||{}).value||'').split('\\n').length"))
                    await pg.evaluate("document.querySelector('[data-mode=review]').click()"); await pg.wait_for_timeout(500)
            await pg.click("#exExit"); await pg.wait_for_timeout(800)
            print(n, "after exit collapsed:", await pg.evaluate("!document.querySelector('#exPick details').open"), "script empty:", await pg.evaluate("$('script').value===''"))
            await pg.close()
        print("page errors:", errs); await b.close()
asyncio.run(main())
