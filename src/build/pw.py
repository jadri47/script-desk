SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium") if False else await p.chromium.launch()
        errs = []
        for w, hgt, name in [(1200, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": hgt})
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            await pg.add_init_script("localStorage.setItem('sd-expert','1');localStorage.setItem('sd-intro','1')"); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT)
            await pg.evaluate("document.getElementById('keyword').value='ansiedad'")
            await pg.click("#runBtn"); await pg.wait_for_timeout(700)  # the Guion tab needs a review first (G.R)
            await pg.click("[data-mode=guion]")
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"g_{name}1.png", full_page=False)
            # use first hook + promise
            await pg.click("#gCold [data-use=hook]")
            await pg.wait_for_timeout(200)
            await pg.click("#gCold [data-use=promise]")
            await pg.wait_for_timeout(200)
            await pg.screenshot(path=f"g_{name}_full.png", full_page=True)
            # edit a candidate
            await pg.click("#gCold .co-cand [data-edit]")
            await pg.fill("#coEditTa", "¿Qué pasa si ya estás tomando medicamentos para la ansiedad?")
            await pg.click("#coEditSave")
            await pg.wait_for_timeout(200)
            chosen = await pg.inner_text("#gCold .co-box")
            print(name, "CHOSEN:", chosen.replace("\n", " | ")[:400])
            esc = await pg.inner_text("#gStruct")
            print(name, "ESC:", esc.replace("\n", " | ")[:700])
            # review sync
            await pg.click("[data-mode=review]"); await pg.click("#runBtn"); await pg.wait_for_timeout(300)
            hook = await pg.evaluate("state.result.sections.structure.map(r=>r.id+':'+r.passed).join(' ')")
            print(name, "REVIEW:", hook)
            await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(200)
            # prompter (record phase)
            await pg.evaluate("goPhase('rec')"); await pg.wait_for_timeout(300)
            await pg.click("#gPP"); await pg.wait_for_timeout(300)
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(4800)
            await pg.screenshot(path=f"g_{name}_pp.png")
            await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f"g_{name}_pp2.png")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            # rehearsal
            await pg.click("#gReh"); await pg.wait_for_timeout(200)
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(3600)
            for i in range(12):
                await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"g_{name}_reh.png")
            await pg.click("#rehSave"); await pg.click("#rehClose"); await pg.wait_for_timeout(300)
            await pg.evaluate("goPhase('prep')"); await pg.wait_for_timeout(300)
            reh = await pg.inner_text("#gStruct")
            print(name, "AFTER REH:", reh.replace("\n", " | ")[:300])
            # select a sentence & start section
            # sentences now live inside the open section of the Estructura card: open one, pick its 2nd sentence
            await pg.click("#gStruct [data-st='3']"); await pg.wait_for_timeout(200)
            await pg.click("#gSecsBody .u >> nth=1"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=f"g_{name}_sel.png")
            await pg.click("#sbStart"); await pg.wait_for_timeout(200)
            n = await pg.evaluate("G.secs.length + ' manual=' + G.manual")
            print(name, "SECS after start-here:", n)
            # dark mode
            await pg.emulate_media(color_scheme="dark"); await pg.wait_for_timeout(100)
            await pg.screenshot(path=f"g_{name}_dark.png")
            await pg.close()
        print("ERRORS:", errs)
        await b.close()
asyncio.run(main())
