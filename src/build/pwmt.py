SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for (w, h, n, mode) in [(1440, 900, "d", "member"), (390, 844, "m", "member"), (1440, 900, "dg", "guest")]:
            pg = await b.new_page(viewport={"width": w, "height": h}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='{mode}'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','0')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            if n != "dg": await pg.evaluate("startDemo('bad')"); await pg.wait_for_timeout(1500)
            g = await pg.evaluate("(()=>{const r=e=>{const x=document.querySelector(e);if(!x)return null;const b=x.getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom)]};const m=document.querySelector('.masthead').getBoundingClientRect();return {mast:[Math.round(m.top),Math.round(m.bottom)],pill:r('#exPick'),auth:r('#authBar'),demo:r('#demoBar'),steps:r('#stepBar'),sbIn:!!document.getElementById('stepBar').closest('.masthead'),sbPos:getComputedStyle(document.getElementById('stepBar')).position,sbBot:Math.round(innerHeight-document.getElementById('stepBar').getBoundingClientRect().bottom),inMast:['exPick','authBar','demoBar'].map(i=>!!document.getElementById(i)&&!!document.getElementById(i).closest('.masthead'))}})()")
            print(n, g)
            assert g['sbIn'], 'stepBar must be inside masthead'
            if w < 900: assert g['sbPos']=='fixed' and g['sbBot']==0, ('phone stepBar must stay fixed at bottom', g['sbPos'], g['sbBot'])
            else: assert g['sbPos']!='fixed' and g['steps'][1] <= g['mast'][1], ('desktop stepBar must be in header row', g)
            await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT + f"mt_{n}.png", clip={"x":0,"y":0,"width":w,"height":min(h,420)})
            # open the picker: still inside header, full width
            await pg.evaluate("document.querySelector('#exPick summary').click()"); await pg.wait_for_timeout(300)
            print(n, "open picker w:", await pg.evaluate("Math.round(document.getElementById('exPick').getBoundingClientRect().width)"), "no h-scroll:", await pg.evaluate("document.documentElement.scrollWidth===innerWidth"))
            await pg.close()
        print("errors:", errs); await b.close()
asyncio.run(main())
