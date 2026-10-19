# Color families: highlights per family, legend filter, timeline lanes/shapes/hit area, marker -> paragraph. ES/EN, desktop + phone.
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
    hl=await pg.evaluate("[...CSS.highlights.keys()]")
    ok(n+": family highlights use new names",any(h.startswith("sd-w-") for h in hl) and not any(h in("sd-r","sd-a") for h in hl),hl)
    chips=await pg.evaluate("[...document.querySelectorAll('.topfix.walk .cat-chip[data-cat]')].map(b=>b.dataset.cat)")
    ok(n+": 5 legend chips",chips==["hi","mid","cut","fill","pol"],chips)
    fam=next((h[5:] for h in hl if h.startswith("sd-w-")),None)
    if fam:
        await pg.click(f".topfix.walk .cat-chip[data-cat={fam}]")
        S=await pg.evaluate(f"({{h:[...CSS.highlights.keys()],off:document.documentElement.classList.contains('cat-off-{fam}'),p:document.querySelector('.cat-chip[data-cat={fam}]').getAttribute('aria-pressed')}})")
        ok(n+": chip hides family",("sd-w-"+fam) not in S["h"] and S["off"] and S["p"]=="false",S)
        await pg.click(f".topfix.walk .cat-chip[data-cat={fam}]")
        ok(n+": chip shows it again",("sd-w-"+fam) in await pg.evaluate("[...CSS.highlights.keys()]"))
    mk=await pg.evaluate("""(()=>{const m=[...document.querySelectorAll('.rl-mini .mk')];const kinds=new Set(m.map(x=>x.dataset.mk));
      const sm=m.map(x=>{const r=x.getBoundingClientRect();return Math.min(r.width,r.height)});
      return {n:m.length,kinds:[...kinds],lanes:document.querySelectorAll('.rl-mini .rl-lane').length,min:Math.min(...sm,99),paths:new Set(m.map(x=>x.innerHTML.slice(60,110))).size,old:document.querySelectorAll('.timeline').length}})()""")
    ok(n+": minimap with markers, old timeline card gone",mk["lanes"]==1 and mk["n"]>=1 and mk["old"]==0,mk)
    ok(n+": marker hit area >= 22px",mk["min"]>=22,mk)
    ok(n+": distinct shape per kind",mk["paths"]>=len(mk["kinds"]),mk)
    if mk["n"]:
        before=await pg.evaluate("WK.i")
        await pg.evaluate("[...document.querySelectorAll('.rl-mini .mk')].pop().click()"); await pg.wait_for_timeout(700)
        ok(n+": tap marker opens its paragraph",await pg.evaluate("!!document.querySelector('.topfix.walk')") and await pg.evaluate("WK.i")>=0)
    ok(n+": no page errors",not errs,errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for ui in("es","en"):
            for vp in({"width":1280,"height":800},{"width":390,"height":844}):
                for ex in("bad","worst"): await run(b,ui,vp,ex)
        await b.close()
    print("ALL OK" if not fails else "FAILS: "+", ".join(fails))
asyncio.run(main())
