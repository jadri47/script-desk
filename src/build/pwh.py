SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
KEYS = "[...document.querySelectorAll('[data-qh]')].filter(e=>e.offsetParent||e.getClientRects().length).map(e=>e.dataset.qh)"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]; seen=set()
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
            async def shot(tag):
                ks = await pg.evaluate(KEYS); seen.update(ks)
                print(n, tag, len(ks), ks)
                await pg.evaluate("document.querySelectorAll('.qh-btn').forEach(b=>{ if(b.getAttribute('aria-expanded')!=='true') b.click(); })"); await pg.wait_for_timeout(150)
                await pg.screenshot(path=f"qh_{n}_{tag}.png", full_page=True)
            await shot("s1")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
            for s in [2,3]:  # 3 steps now (jadri47, 2026-10-22): old steps 4 and 5 live inside step 3
                await pg.evaluate(f"goStep({s})"); await pg.wait_for_timeout(500)
                if s==2: await pg.evaluate("document.querySelectorAll('.g-more-d').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
                await shot(f"s{s}")
            # typing in pack title keeps help open & focus
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(400)
            await pg.click("#pkTitleIn"); await pg.keyboard.type("Hola"); await pg.wait_for_timeout(200)
            print(n, "focus kept:", await pg.evaluate("document.activeElement.id"), "pkReq open:", await pg.evaluate("!!document.querySelector('[data-qh=pkReq] .qh-btn[aria-expanded=true]')"))
            # summary ? does not toggle details
            await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(400)
            await pg.evaluate("document.querySelectorAll('.g-more-d').forEach(d=>d.open=false)")
            await pg.click('.g-more-d[data-more="ads"] .qh-btn'); await pg.wait_for_timeout(100)
            print(n, "details stays closed:", not await pg.evaluate("document.querySelector('.g-more-d[data-more=ads]').open"), "text visible:", await pg.evaluate("!document.querySelector('.g-more-d[data-more=ads] .qh-txt').hidden"))
            await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
            await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(400)
            await shot("full_review")
            await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(700)
            await shot("full_guion")
            await pg.click("[data-ui=en]"); await pg.wait_for_timeout(500)
            print(n, "EN sample:", (await pg.evaluate("[...document.querySelectorAll('.qh-txt')].map(x=>x.textContent).find(x=>x.startsWith('The run'))") or "")[:60], "| dup btns:", await pg.evaluate("[...document.querySelectorAll('[data-qh]')].filter(e=>e.querySelectorAll(':scope .qh-btn').length>1).length"))
            await pg.close()
        all_keys = await (await b.new_page()).evaluate("()=>0")
        print("ERR", errs)
        print("SEEN", sorted(seen))
        await b.close()
asyncio.run(main())
