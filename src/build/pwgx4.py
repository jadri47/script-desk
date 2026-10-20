SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); EX = json.load(open("examples.json"))
URL = SDU+"standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width":1440,"height":900})
        pg = await ctx.new_page()
        await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
        await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
        tog = await pg.query_selector("#expertToggle, input[type=checkbox][role=switch], .mode-switch input")
        print("toggle found:", bool(tog))
        await pg.evaluate("$(\"expertToggle\").click()"); await pg.wait_for_timeout(600)
        print("guided:", await pg.evaluate("V.guided"))
        await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(900)
        print(await pg.evaluate("JSON.stringify([...document.querySelectorAll('[id=gRes]')].map(e=>[e.parentElement.id, getComputedStyle(e).display, Math.round(e.getBoundingClientRect().height)]))"))
        await b.close()
asyncio.run(main())
