SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(300)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
            print(n, "more blocks:", await pg.evaluate("[...document.querySelectorAll('.g-more-d')].map(d=>d.dataset.more).join(',')"))
            for k in ["scripture","ads","seo"]:
                await pg.click(f".g-more-d[data-more={k}] > summary", position={"x":12,"y":12}); await pg.wait_for_timeout(100)
            print(n, "ads rows:", await pg.evaluate("document.querySelectorAll('.g-more-d[data-more=ads] table.pf tbody tr').length"), "refs:", await pg.evaluate("document.querySelectorAll('.g-more-d[data-more=scripture] .row').length"), "marks:", await pg.evaluate("document.querySelectorAll('#ms mark').length"))
            print(n, "seo:", (await pg.inner_text(".g-more-d[data-more=seo] .seo-h")).replace("\n"," "), "| chips:", await pg.evaluate("[...document.querySelectorAll('[data-kwpick]')].slice(0,4).map(b=>b.dataset.kwpick).join(', ')"))
            el = await pg.query_selector(".g-more-sec"); await el.screenshot(path=f"more_{n}.png")
            await pg.click("[data-kwpick] >> nth=0"); await pg.wait_for_timeout(500)
            print(n, "kw now:", await pg.evaluate("state.result.keyword"), "| seo still open:", await pg.evaluate("document.querySelector('.g-more-d[data-more=seo]').open"))
            await pg.click("#expertToggle"); await pg.wait_for_timeout(400)
            print(n, "full-mode seo panel:", await pg.evaluate("!!document.querySelector('#sec-seo .seo-panel')"), "money table:", await pg.evaluate("!!document.querySelector('#sec-money table.pf')"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
