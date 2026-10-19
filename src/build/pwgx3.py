import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); EX = json.load(open("examples.json"))
URL = "file:///home/claude/sd/standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width":1440,"height":900})
        pg = await ctx.new_page()
        await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        print("guided at load:", await pg.evaluate("V.guided"))
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
        await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
        await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(900)
        print(await pg.evaluate("JSON.stringify([...document.querySelectorAll('[id=gRes]')].map(e=>[e.parentElement.id||e.parentElement.className, e.closest('#guide')?'in-guide':'', getComputedStyle(e).display, e.getBoundingClientRect().height]))"))
        print(await pg.evaluate("JSON.stringify([...document.querySelectorAll('#guion h2')].map(e=>e.textContent))"))
        await b.close()
asyncio.run(main())
