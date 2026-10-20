SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); EX = json.load(open("examples.json"))
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name,w,h in [("desk",1440,900),("phone",390,844)]:
            ctx = await b.new_context(viewport={"width":w,"height":h}, device_scale_factor=1)
            pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate("V.guided=false; if(typeof applyView==='function')applyView();")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
            await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(900)
            print(name, "guided:", await pg.evaluate("V.guided"), "mode:", await pg.evaluate("G.mode"), "errs:", errs)
            await pg.screenshot(path=OUT+f"gx_{name}.png", full_page=True)
            # section heights
            print(await pg.evaluate("JSON.stringify([...document.querySelectorAll('#guion > *')].map(e=>[e.id||e.className, Math.round(e.getBoundingClientRect().height)]))"))
        await b.close()
asyncio.run(main())
