import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); await pg.add_init_script("localStorage.setItem('sd-expert','1')"); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file:///home/claude/sd/build/work.html")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.evaluate("document.getElementById('keyword').value='ansiedad'")
            await pg.click("#runBtn"); await pg.wait_for_timeout(500)
            tf = await pg.query_selector("#results .topfix"); await tf.scroll_into_view_if_needed()
            await tf.screenshot(path=f"fx_{n}_1.png")
            print(n, "cards:", await pg.evaluate("state.fixCards.map(c=>c.ids.join('+')+'['+c.proposals.length+']').join(' ')"), "pass", await pg.evaluate("state.result.passed+'/'+state.result.total"))
            await pg.click("[data-fxapply='0']"); await pg.wait_for_timeout(400)
            print(n, "after apply 1:", await pg.evaluate("state.fixCards.map(c=>c.ids.join('+')).join(' ')"), "pass", await pg.evaluate("state.result.passed+'/'+state.result.total"), "| cold:", await pg.evaluate("JSON.stringify(G.cold.hook&&G.cold.hook.text)"))
            print(n, "msg:", await pg.inner_text("#fxMsg"))
            await pg.click("[data-fxapply='0']"); await pg.wait_for_timeout(400)
            print(n, "after apply 2:", await pg.evaluate("state.fixCards.map(c=>c.ids.join('+')).join(' ')"), "pass", await pg.evaluate("state.result.passed+'/'+state.result.total"))
            tf = await pg.query_selector("#results .topfix"); await tf.screenshot(path=f"fx_{n}_2.png")
            await pg.click("#fxUndo"); await pg.wait_for_timeout(300); await pg.click("#fxUndo"); await pg.wait_for_timeout(300)
            same = await pg.evaluate("document.getElementById('script').value") == TEXT
            print(n, "undo restored:", same, await pg.evaluate("JSON.stringify(G.cold)"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
