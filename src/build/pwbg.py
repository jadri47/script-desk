SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, sys
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
CSS = open(sys.argv[1]).read() if len(sys.argv) > 1 else ""
tag = sys.argv[2] if len(sys.argv) > 2 else "before"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for (w, h, n) in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": h})
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','0')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(1500)
            if CSS: await pg.add_style_tag(content=CSS); await pg.wait_for_timeout(400)
            await pg.evaluate("window.scrollTo(0,0)")
            m = await pg.evaluate("(()=>{const e=document.querySelector('.ed-wrap .ed')||document.querySelector('textarea#script');const b=e.getBoundingClientRect();return {ed:[Math.round(b.top),Math.round(b.height)],doc:document.documentElement.scrollHeight,vh:innerHeight}})()")
            print(n, tag, m)
            await pg.screenshot(path=OUT + f"bg_{tag}_{n}.png")
            await pg.close()
        await b.close()
asyncio.run(main())
