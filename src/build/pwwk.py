# Paragraph walk: highlights painted, stepper, scroll-to-context, scoped fixes, score-row jump. ES/EN, desktop + phone.
import asyncio
from playwright.async_api import async_playwright
SB=open("mock_sb.js").read()
URL="file:///home/claude/sd/standalone/site/index.html"
fails=[]
def ok(n,c,x=""):
    print(("ok   " if c else "FAIL ")+n,x if not c else "")
    if not c: fails.append(n)
async def run(b,ui,vp,ex):
    n=f"{ui}/{vp['width']}/{ex}"
    pg=await b.new_page(viewport=vp); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
    await pg.route("**/supabase.min.js",lambda r:r.fulfill(body=SB,content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate(f"startDemo('{ex}')"); await pg.wait_for_timeout(900)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2500)
    S=await pg.evaluate("({walk:!!document.querySelector('.topfix.walk'),ok:WK.ok,i:WK.i,list:WK.list.length,hl:[...CSS.highlights.keys()],on:document.querySelectorAll('.ed .walk-on').length,ticks:document.querySelectorAll('.wk-tick').length,blocks:WK.blocks.length})")
    ok(n+": walker + highlights after Revisar",S["walk"] and S["ok"] and len([h for h in S["hl"] if h.startswith("sd-w-") or h.startswith("sd-u-")])>=1 and S["on"]==1,S)
    ok(n+": one tick per paragraph",S["ticks"]>=S["blocks"],S)
    # next -> script scrolled so the paragraph sits in view with text around it
    await pg.evaluate("wkStep(1)"); await pg.wait_for_timeout(1100)
    G=await pg.evaluate("(()=>{const e=ED.el.getBoundingClientRect(),p=document.querySelector('.ed .walk-on').getBoundingClientRect();return {top:p.top-e.top,h:e.height,ph:p.height,st:ED.el.scrollTop}})()")
    ok(n+": paragraph in view after Next",G["top"]>=-5 and G["top"]<G["h"]*0.6 or G["ph"]>G["h"]*0.6,G)
    ok(n+": text before it is visible",G["st"]==0 or G["top"]>20,G)
    # scoped fix touches only this paragraph
    before=await pg.evaluate("$('script').value")
    cnt=await pg.locator("[data-fxapply]:visible").count()
    if cnt:
        await pg.locator("[data-fxapply]:visible").first.click(); await pg.wait_for_timeout(1300)
        after=await pg.evaluate("$('script').value")
        ok(n+": apply changes the script",after!=before)
    # evidence click flashes
    if await pg.locator(".fx-ev[data-es]:visible").count():
        await pg.locator(".fx-ev[data-es]:visible").first.click(); await pg.wait_for_timeout(300)
        ok(n+": evidence tap flashes",await pg.evaluate("CSS.highlights.has('sd-flash')"))
    # score row jumps to its paragraph
    await pg.evaluate("scOpenPop()"); await pg.wait_for_timeout(300)
    if await pg.locator("[data-scrow]").count():
        await pg.locator("[data-scrow]").first.click(); await pg.wait_for_timeout(900)
        J=await pg.evaluate("({step:V.step,i:WK.i,on:document.querySelectorAll('.ed .walk-on').length})")
        ok(n+": score row opens its paragraph",J["step"]==2 and J["on"]==1,J)
    # typing clears paint
    await pg.evaluate("ED.el.dispatchEvent(new Event('input'))")
    ok(n+": editing clears highlights",await pg.evaluate("![...CSS.highlights.keys()].some(k=>k.startsWith('sd-'))"))
    ok(n+": no page errors",not errs,errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for ui in ("es","en"):
            for vp in ({"width":1440,"height":900},{"width":390,"height":844}):
                for ex in ("bad","worst"): await run(b,ui,vp,ex)
        await b.close()
    print("FAILS:",fails) if fails else print("ALL OK")
asyncio.run(main())
