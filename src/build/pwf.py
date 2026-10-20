SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
SET = "v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n,mob in [(390,844,"m",True),(1280,900,"d",False)]:
            ctx = await b.new_context(viewport={"width":w,"height":hh}, has_touch=mob, is_mobile=mob)
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.evaluate(SET, (LONG.strip()+"\n\n")*3)
            await pg.wait_for_timeout(300)
            eh = await pg.evaluate("$('ed').getBoundingClientRect().height"); sh = await pg.evaluate("$('ed').scrollHeight")
            run = await pg.evaluate("$('runBtn').getBoundingClientRect().top + scrollY")
            print(n, "box h:", round(eh), "content h:", sh, "| run button page y:", round(run), "| page h:", await pg.evaluate("document.documentElement.scrollHeight"))
            await pg.screenshot(path=OUT+f"fx_{n}.png", full_page=True)
            if mob:
                print(n, "visible btns:", await pg.evaluate("[...document.querySelectorAll('.ed-btn')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()||b.dataset.ed).join(',')"))
                await pg.tap("#ed"); await pg.wait_for_timeout(400)
                print(n, "full after tap:", await pg.evaluate("ED.full"), "| hist:", await pg.evaluate("JSON.stringify(history.state)"), "| btns:", await pg.evaluate("[...document.querySelectorAll('.ed-btn')].filter(b=>b.offsetParent).length"))
                await pg.screenshot(path=OUT+f"fx_full_{n}.png")
                await pg.keyboard.type(" EXTRA"); await pg.wait_for_timeout(300)
                await pg.go_back(); await pg.wait_for_timeout(400)
                print(n, "after back: full", await pg.evaluate("ED.full"), "| still on page:", await pg.evaluate("location.protocol"), "| saved text has EXTRA:", await pg.evaluate("$('script').value.includes('EXTRA')"))
                await pg.tap("#ed"); await pg.wait_for_timeout(300)
                await pg.click('[data-ed="full"]'); await pg.wait_for_timeout(300)
                print(n, "after Listo: full", await pg.evaluate("ED.full"), "| hist:", await pg.evaluate("JSON.stringify(history.state)"))
            else:
                await pg.evaluate("$('ed').scrollTop = 99999"); await pg.wait_for_timeout(100)
                print(n, "inner scroll works:", await pg.evaluate("$('ed').scrollTop > 0"), "| page scrollY:", await pg.evaluate("scrollY"))
                await pg.evaluate("$('ed').style.height='520px'"); await pg.wait_for_timeout(700)
                print(n, "saved height:", await pg.evaluate("localStorage.getItem('sd-edh')"))
                await pg.click('[data-ed="full"]'); await pg.wait_for_timeout(300)
                print(n, "desktop full:", await pg.evaluate("ED.full"), "| hist:", await pg.evaluate("JSON.stringify(history.state)"))
                await pg.keyboard.press("Escape")
            await ctx.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
