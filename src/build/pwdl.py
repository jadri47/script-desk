SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
            realCount = await pg.evaluate("Object.keys(window.__store.producciones||{}).length")
            snapsBefore = await pg.evaluate("Object.keys(window.__store.instantaneas||{}).length")
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"ex_{n}_pick.png", full_page=True)
            verdict = lambda: pg.evaluate("(document.querySelector('.gv .lamp')||{}).textContent")
            for k in ["bad","mid","good"]:
                await pg.click(f'[data-ex="{k}"]'); await pg.wait_for_timeout(700)
                print(n,k,"banner:", (await pg.inner_text("#demoBar"))[:70].replace("\n"," "), "| step:", await pg.evaluate("V.step"), "| words:", await pg.evaluate("$('script').value.split(/\\s+/).length"))
                await pg.click("#runBtn"); await pg.wait_for_timeout(900)
                print(n,k,"verdict:", await verdict(), "| cards:", await pg.evaluate("document.querySelectorAll('.fx-card, .topfix li').length"), "| status:", await pg.evaluate("G.status"))
                if k=="bad": await pg.screenshot(path=f"ex_{n}_bad2.png")
                await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(500)
                dis = await pg.evaluate("($('gApprove')||{}).disabled")
                print(n,k,"approve disabled:", dis, "| gate:", (await pg.evaluate("(document.querySelector('.g-gate')||{}).textContent||''"))[:90])
                if k=="mid":
                    await pg.fill("#pkThumbIn","Cómo orar cada día"); await pg.wait_for_timeout(300)
                    print(n,k,"after thumb, approve disabled:", await pg.evaluate("$('gApprove').disabled"))
                if k=="good":
                    await pg.click("#gApprove"); await pg.wait_for_timeout(600)
                    print(n,k,"step after approve:", await pg.evaluate("V.step"), "status:", await pg.evaluate("G.status"))
                    await pg.click("#gRecorded"); await pg.wait_for_timeout(600)
                    print(n,k,"step:", await pg.evaluate("V.step"), "| demo ret btn:", await pg.evaluate("!!$('exRetBtn')"), "| shorts:", await pg.evaluate("document.querySelectorAll('#gShorts .co-text, #gShorts li').length"))
                    await pg.click("#exRetBtn"); await pg.wait_for_timeout(500)
                    print(n,k,"retention rows:", await pg.evaluate("document.querySelectorAll('#gRes table tbody tr').length"), "| chart:", await pg.evaluate("!!document.querySelector('#gRes svg')"))
                    el = await pg.query_selector("#gRes"); await el.screenshot(path=f"ex_{n}_ret.png")
                    print(n,"backup card:", (await pg.evaluate("goStep(1)") or "") , (await pg.inner_text("#gBackup"))[-60:].replace("\n"," "))
                await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            print(n,"real store untouched:", await pg.evaluate("Object.keys(window.__store.producciones||{}).length")==realCount, await pg.evaluate("Object.keys(window.__store.instantaneas||{}).length")==snapsBefore, await pg.evaluate("!window.__store.ajustes"))
            await pg.click("#exExit"); await pg.wait_for_timeout(900)
            print(n,"after exit: demo", await pg.evaluate("DEMO"), "| text restored:", await pg.evaluate("$('script').value")==TEXT, "| step", await pg.evaluate("V.step"), "| banner hidden:", await pg.evaluate("$('demoBar').hidden"))
            # full mode
            await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
            await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(300)
            await pg.click('[data-ex="bad"]'); await pg.wait_for_timeout(1200)
            print(n,"full mode demo results shown:", await pg.evaluate("!$('results').classList.contains('hidden') && $('results').children.length>0"), "| worst:", await pg.evaluate("state.result && state.result.worst"))
            await pg.click("#exExit"); await pg.wait_for_timeout(900)
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
