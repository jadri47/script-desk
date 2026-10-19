import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
EX = json.load(open("examples.json"))
URL = "file:///home/claude/sd/standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name,w,h in [("desk",1440,900),("phone",390,844)]:
            ctx = await b.new_context(viewport={"width":w,"height":h}, device_scale_factor=1)
            pg = await ctx.new_page()
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate("()=>{const x=$('expert')||document.querySelector('[data-expert]'); if(x && !x.checked){x.click()}}")
            await pg.wait_for_timeout(300)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", EX["es"]["mid"]["text"])
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(1500)
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(800)
            if name=="desk":
                await pg.evaluate("$('paneR') && $('paneR').scrollTo(0,0)")
                # capture right pane full content by enlarging height
                hgt = await pg.evaluate("$('paneR')?$('paneR').scrollHeight:document.body.scrollHeight")
                print("paneR height", hgt)
                await pg.set_viewport_size({"width":1440,"height":min(hgt+260,9000)}); await pg.wait_for_timeout(500)
                await pg.screenshot(path=OUT+"gv_desk.png")
            else:
                await pg.screenshot(path=OUT+"gv_phone.png", full_page=True)
            txt = await pg.evaluate("$('guion').innerText")
            open(OUT+f"gv_{name}.txt","w").write(txt)
        await b.close()
asyncio.run(main())
