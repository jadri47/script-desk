SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
CSV = "Video position (%),Absolute audience retention (%)\n" + "\n".join(f"{i},{max(5, 100*(0.985**i) - (6 if 40<i<55 else 0)):.1f}" for i in range(101))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1200,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh})
            await pg.add_init_script("localStorage.setItem('sd-expert','1')"); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(SDU+"build/work.html")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.evaluate("document.getElementById('keyword').value='ansiedad'")
            await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(300)
            print(n, "aprobado disabled:", await pg.is_disabled("[data-status=aprobado]"), "|", (await pg.inner_text(".g-gate"))[:140])
            await pg.fill("#pkTitleIn", "¿Qué dice la Biblia sobre la ansiedad?")
            await pg.fill("#pkThumbIn", "No cargues mañana"); await pg.wait_for_timeout(600)
            print(n, "aprobado disabled after:", await pg.is_disabled("[data-status=aprobado]"))
            print(n, "chapters:", (await pg.input_value("#chOut")).replace("\n"," | "))
            await pg.click("#gShorts [data-mark] >> nth=0"); await pg.wait_for_timeout(150)
            print(n, "shorts:", await pg.evaluate("G.shorts.length + ' / clips ' + G.clips.length"))
            await pg.fill("#rsDur", "5:20"); await pg.dispatch_event("#rsDur", "change"); await pg.wait_for_timeout(100)
            await pg.fill("#rsData", CSV); await pg.click("#rsImport"); await pg.wait_for_timeout(300)
            print(n, "rs:", (await pg.inner_text("#gRes .rs-stats")).replace("\n"," | "))
            box = await pg.query_selector("#rcHit"); bb = await box.bounding_box()
            await pg.mouse.move(bb["x"]+bb["width"]*0.45, bb["y"]+bb["height"]/2); await pg.wait_for_timeout(100)
            await (await pg.query_selector("#gPack")).scroll_into_view_if_needed()
            await pg.screenshot(path=f"p_{n}_pack.png")
            await (await pg.query_selector("#gShorts")).scroll_into_view_if_needed()
            await pg.screenshot(path=f"p_{n}_shorts.png")
            await (await pg.query_selector("#gRes .rc")).scroll_into_view_if_needed()
            await pg.mouse.move(bb["x"]+bb["width"]*0.45, bb["y"]+bb["height"]/2)
            el = await pg.query_selector("#rcHit"); bb = await el.bounding_box(); await pg.mouse.move(bb["x"]+bb["width"]*0.45, bb["y"]+bb["height"]/2); await pg.wait_for_timeout(100)
            await pg.screenshot(path=f"p_{n}_res.png")
            await pg.emulate_media(color_scheme="dark"); await pg.wait_for_timeout(100); await pg.screenshot(path=f"p_{n}_res_dark.png")
            print(n, "sheet ok:", await pg.evaluate("typeof exportEditSheet"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
