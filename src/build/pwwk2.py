SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio,time
from playwright.async_api import async_playwright
SB=open("mock_sb.js").read()
URL=SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def run(b, ui, vp, ex):
    pg=await b.new_page(viewport=vp); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
    await pg.route("**/supabase.min.js",lambda r:r.fulfill(body=SB,content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate(f"startDemo('{ex}')"); await pg.wait_for_timeout(900)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2500)
    r={}
    r["build_ms"]=await pg.evaluate("(()=>{WK.ok=false;const t=performance.now();wkBuild();return Math.round(performance.now()-t)})()")
    r["list"]=await pg.evaluate("WK.list.length")
    # apply first card on each paragraph, count score change
    s0=await pg.evaluate("scoreOf(state.result,state.fixDismissed).score")
    for k in range(4):
        n=await pg.locator("[data-fxapply]:visible").count()
        if not n: await pg.evaluate("wkStep(1)"); await pg.wait_for_timeout(300); continue
        await pg.locator("[data-fxapply]:visible").first.click(); await pg.wait_for_timeout(1200)
    r["score"]=[s0, await pg.evaluate("scoreOf(state.result,state.fixDismissed).score")]
    r["i"]=await pg.evaluate("WK.i")
    # evidence click
    if await pg.locator(".fx-ev[data-es]").count():
        await pg.locator(".fx-ev[data-es]").first.click(); await pg.wait_for_timeout(500)
        r["flash"]=await pg.evaluate("CSS.highlights.has('sd-flash')")
    # score row jump
    await pg.evaluate("scOpenPop()"); await pg.wait_for_timeout(300)
    rows=await pg.locator("[data-scrow]").count(); r["rows"]=rows
    if rows:
        await pg.locator("[data-scrow]").nth(min(1,rows-1)).click(); await pg.wait_for_timeout(900)
        r["afterjump"]=await pg.evaluate("({i:WK.i, step:V.step, card:(state.fixCards||[]).map(c=>c.id)})")
    r["errs"]=errs
    await pg.screenshot(path=OUT+f"wk2_{ui}_{vp['width']}_{ex}.png")
    await pg.close(); return r
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for ui in ("es","en"):
            for vp in ({"width":1440,"height":900},{"width":390,"height":844}):
                for ex in ("bad","worst"):
                    print(ui,vp["width"],ex,await run(b,ui,vp,ex))
        await b.close()
asyncio.run(main())
