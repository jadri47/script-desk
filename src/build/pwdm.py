SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
EX = json.load(open("examples.json"))
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name,w,h in [("phone-desktop-mode",980,2100),("laptop",1024,700),("tablet",768,1024)]:
            ctx = await b.new_context(viewport={"width":w,"height":h})
            pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
            await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            print(name, "split:", await pg.evaluate("SPLIT.on"), "| L/R:", await pg.evaluate("JSON.stringify(['paneL','paneR'].map(i=>$(i)?Math.round($(i).getBoundingClientRect().width):0))"), "| errs:", errs)
            await pg.screenshot(path=OUT+f"dm_{name}.png")
        await b.close()
asyncio.run(main())
