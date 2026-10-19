import asyncio, json, sys
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); FONTS = open("/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/fonts.css").read()
URL = "file:///home/claude/sd/standalone/" + (sys.argv[1] if len(sys.argv)>1 else "preview2026.html")
OUT = "/home/claude/sd/shots2026/"; import os; os.makedirs(OUT, exist_ok=True)
PFX = sys.argv[2] if len(sys.argv)>2 else ""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for scheme in ["light","dark"]:
            for w,h,n in [(390,844,"phone"),(1280,900,"desktop")]:
                ctx = await b.new_context(viewport={"width":w,"height":h}, color_scheme=scheme, device_scale_factor=2)
                pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.add_init_script("window.__SB_MODE='member';")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body=FONTS, content_type="text/css"))
                await pg.goto(URL); await pg.wait_for_timeout(900)
                await pg.evaluate("document.fonts.ready")
                await pg.screenshot(path=f"{OUT}{PFX}{scheme}-{n}-1-escribir.png")
                await pg.click('[data-ex="bad"]'); await pg.wait_for_timeout(800)
                await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
                await pg.screenshot(path=f"{OUT}{PFX}{scheme}-{n}-2-arreglar.png")
                await pg.evaluate("startDemo('good')"); await pg.wait_for_timeout(900)
                await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
                await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(700)
                await pg.screenshot(path=f"{OUT}{PFX}{scheme}-{n}-3-preparar.png")
                await pg.evaluate("goStep(4)"); await pg.wait_for_timeout(600)
                await pg.screenshot(path=f"{OUT}{PFX}{scheme}-{n}-4-grabar.png")
                await ctx.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
