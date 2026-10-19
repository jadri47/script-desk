import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); EX = json.load(open("examples.json"))
URL = "file:///home/claude/sd/standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1280,"height":800}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.click("[data-ui=en]"); await pg.wait_for_timeout(300)
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["en"]["mid"]["text"] if "en" in EX else EX["es"]["mid"]["text"])
        await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(1000)
        await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(600)
        for ph in ["prep","rec","after"]:
            await pg.click(f"[data-phase={ph}]"); await pg.wait_for_timeout(500)
            if ph=="prep": await pg.click("#gStruct [data-st='2']"); await pg.wait_for_timeout(300)
            txt = await pg.evaluate("$('guion').innerText")
            bad = [w for w in ["undefined","[object","NaN"] if w in txt]
            print(ph, "bad:", bad, "| first:", txt[:160].replace("\n"," / "))
        print("errs", errs)
        await b.close()
asyncio.run(main())
