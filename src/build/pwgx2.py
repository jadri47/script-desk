import asyncio, json
from playwright.async_api import async_playwright
from PIL import Image
SB = open("mock_sb.js").read(); EX = json.load(open("examples.json"))
URL = "file:///home/claude/sd/standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width":1440,"height":900}, device_scale_factor=1)
        pg = await ctx.new_page()
        await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.evaluate("V.guided=false; if(typeof applyView==='function')applyView();")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
        await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
        await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(900)
        H = await pg.evaluate("$('paneR').scrollHeight"); step = 820
        shots=[]
        for i,y in enumerate(range(0, min(H, step*12), step)):
            await pg.evaluate(f"$('paneR').scrollTo(0,{y})"); await pg.wait_for_timeout(150)
            path=OUT+f"gxd_{i}.png"; await pg.screenshot(path=path); shots.append(path)
        print("paneR height", H, "shots", len(shots))
        await b.close()
asyncio.run(main())
