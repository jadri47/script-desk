SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); await pg.add_init_script(MOCK); await pg.add_init_script("localStorage.setItem('sd-intro','1')"); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            print(n, "audience default:", await pg.evaluate("$('audience').value"), "| visible:", await pg.evaluate("!!$('audience').offsetParent"))
            for ui in ["es","en"]:
                if ui=="en": await pg.click("[data-ui=en]"); await pg.wait_for_timeout(400)
                for k in ["bad","mid","good"]:
                    await pg.evaluate(f"startDemo('{k}')"); await pg.wait_for_timeout(700)  # the demo buttons moved into the examples picker; startDemo is what they call
                    await pg.click("#runBtn"); await pg.wait_for_timeout(1000)
                    v = await pg.evaluate("verdictOf(state.result).t")  # the verdict card (.gv) left step 2 (2026-10-26); verdictOf is what fed its lamp
                    info = await pg.evaluate("[state.result.lang, $('audience').value, $('translation').value, $('script').value.slice(0,40)]")
                    print(n, ui, k, "|", v, "|", info)
                    if k=="mid" and ui=="es":
                        await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
                        await pg.evaluate("if (!V.s1More) $('s1MoreBtn').click(); $('setDet').open = true"); await pg.wait_for_timeout(200)  # the audience field is in step 1's «Más opciones», inside the closed #setDet
                        await pg.select_option("#audience","both"); await pg.wait_for_timeout(300)
                        print(n, "  mid with audience=both -> regional fails:", await pg.evaluate("state.result.sections.spoken.find(r=>r.id==='regional').passed===false"))
                        await pg.select_option("#audience","es"); await pg.wait_for_timeout(300)
                    if k=="good":
                        await pg.evaluate("goStep(3); PB.i = 5; renderGuide()"); await pg.wait_for_timeout(400)  # 2026-10-26: approve is on the walk's last card
                        await pg.click("#gApprove"); await pg.wait_for_timeout(500)
                        await pg.click("#gRecorded"); await pg.wait_for_timeout(500)
                        await pg.click("#exRetBtn"); await pg.wait_for_timeout(500)
                        print(n, ui, "  retention rows:", await pg.evaluate("document.querySelectorAll('#gRes table tbody tr').length"))
                        await pg.screenshot(path=f"ex2_{n}_{ui}_s5.png")
                    await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"ex2_{n}_en_pick.png", full_page=True)
            await pg.click("#exExit"); await pg.wait_for_timeout(900)
            print(n, "after exit:", await pg.evaluate("[DEMO, $('audience').value, $('translation').value, $('script').value===arguments[0]]".replace("arguments[0]","$('script').value")), "text restored:", await pg.evaluate("$('script').value.slice(0,30)"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
