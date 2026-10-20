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
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            print(n, "audience default:", await pg.evaluate("$('audience').value"), "| visible:", await pg.evaluate("!!$('audience').offsetParent"))
            for ui in ["es","en"]:
                if ui=="en": await pg.click("[data-ui=en]"); await pg.wait_for_timeout(400)
                for k in ["bad","mid","good"]:
                    await pg.click(f'[data-ex="{k}"]'); await pg.wait_for_timeout(700)
                    await pg.click("#runBtn"); await pg.wait_for_timeout(1000)
                    v = await pg.evaluate("(document.querySelector('.gv .lamp')||{}).textContent")
                    info = await pg.evaluate("[state.result.lang, $('audience').value, $('translation').value, $('script').value.slice(0,40)]")
                    print(n, ui, k, "|", v, "|", info)
                    if k=="mid" and ui=="es":
                        await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
                        await pg.select_option("#audience","both"); await pg.wait_for_timeout(300)
                        print(n, "  mid with audience=both -> regional fails:", await pg.evaluate("state.result.sections.spoken.find(r=>r.id==='regional').passed===false"))
                        await pg.select_option("#audience","es"); await pg.wait_for_timeout(300)
                    if k=="good":
                        await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(400)
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
