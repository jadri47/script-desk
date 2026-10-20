# Rail + minimap inside the script box. ES/EN, desktop + phone, light + dark.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB=open("mock_sb.js").read()
URL=SDU+"standalone/site/index.html"
fails=[]
def ok(n,c,x=""):
    print(("ok   " if c else "FAIL ")+n,x if not c else "")
    if not c: fails.append(n)
async def run(b,ui,vp,ex,scheme):
    n=f"{ui}/{vp['width']}/{ex}/{scheme}"; phone=vp["width"]<900
    pg=await b.new_page(viewport=vp,color_scheme=scheme); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
    await pg.route("**/supabase.min.js",lambda r:r.fulfill(body=SB,content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate(f"startDemo('{ex}')"); await pg.wait_for_timeout(900)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2500)
    S=await pg.evaluate("""(()=>{const w=ED.wrap;return {on:w.classList.contains('rail-on'),rows:document.querySelectorAll('.rl-row').length,mini:!!document.querySelector('.rl-mini'),
      pl:parseFloat(getComputedStyle(ED.el).paddingLeft),gw:parseFloat(getComputedStyle(w).getPropertyValue('--gw')),blocks:WK.blocks.length,
      old:!!document.querySelector('.timeline')||!!document.querySelector('#ms'),shapes:document.querySelectorAll('.rl-row .g').length}})()""")
    ok(n+": rail + minimap present, old surfaces gone",S["on"] and S["mini"] and S["rows"]==S["blocks"] and not S["old"],S)
    ok(n+": text starts right of the rail",S["pl"]>=S["gw"],S)
    ok(n+": shapes in the rail",S["shapes"]>=1,S)
    # visible rows sit at their paragraph
    al=await pg.evaluate("""(()=>{let worst=0,seen=0;const er=ED.el.getBoundingClientRect();RL.rows.forEach((r,i)=>{if(r.style.display==='none')return;seen++;
      const y=WK.blocks[i].el.getBoundingClientRect().top;if(y<er.top)return;const ry=r.getBoundingClientRect().top;worst=Math.max(worst,Math.abs((ry-2)-y));});return {worst,seen}})()""")
    ok(n+": rows aligned with paragraphs (<=4px)",al["seen"]>=1 and al["worst"]<=4,al)
    # scroll keeps alignment and moves the minimap window
    w0=await pg.evaluate("document.querySelector('.rl-win').style.left")
    await pg.evaluate("ED.el.scrollTop=ED.el.scrollHeight*0.6"); await pg.wait_for_timeout(300)
    al2=await pg.evaluate("""(()=>{const ER=ED.el.getBoundingClientRect();let worst=0,seen=0;RL.rows.forEach((r,i)=>{if(r.style.display==='none')return;seen++;
      const y=WK.blocks[i].el.getBoundingClientRect().top;if(y<ER.top)return;worst=Math.max(worst,Math.abs((r.getBoundingClientRect().top-2)-y));});return {worst,seen}})()""")
    w1=await pg.evaluate("document.querySelector('.rl-win').style.left")
    ok(n+": aligned after scroll",al2["seen"]>=1 and al2["worst"]<=4,al2)
    ok(n+": minimap window follows scroll",w0!=w1,[w0,w1])
    # minimap seek
    await pg.evaluate("ED.el.scrollTop=0"); await pg.wait_for_timeout(200)
    box=await (await pg.query_selector(".rl-lane")).bounding_box()
    await pg.mouse.click(box["x"]+box["width"]*0.8,box["y"]+3); await pg.wait_for_timeout(300)
    ok(n+": tap on the minimap scrolls the script",await pg.evaluate("ED.el.scrollTop")>50)
    # popover
    await pg.evaluate("ED.el.scrollTop=0"); await pg.wait_for_timeout(250)
    btn=await pg.query_selector(".rl-row:not([style*='none']) .g, .rl-row:not([style*='none']) .rl-cue")
    if btn:
        await btn.click(); await pg.wait_for_timeout(200)
        ok(n+": popover opens",await pg.evaluate("!document.querySelector('.rl-pop').classList.contains('hidden')"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100)
        ok(n+": popover closes",await pg.evaluate("document.querySelector('.rl-pop').classList.contains('hidden')"))
    # editor-notes chip
    c0=await pg.evaluate("document.querySelectorAll('.rl-cue').length")
    await pg.click(".topfix.walk .cat-chip[data-rail=cues]"); await pg.wait_for_timeout(250)
    c1=await pg.evaluate("document.querySelectorAll('.rl-cue').length")
    ok(n+": 'for the editor' chip toggles the notes",(c0>0)!=(c1>0) or (c0==0 and c1>0),[c0,c1])
    ok(n+": default: notes "+("off" if phone else "on")+" on this screen",(c0==0) if phone else (c0>0),c0)
    # letters on phone
    if phone and c1>0:
        ok(n+": phone notes are one letter",await pg.evaluate("[...document.querySelectorAll('.rl-cue')].every(x=>x.textContent.trim().length===1)"))
    # typing hides the rail
    await pg.evaluate("ED.el.focus()"); await pg.keyboard.type("x"); await pg.wait_for_timeout(300)
    ok(n+": typing removes the rail",not await pg.evaluate("!!document.querySelector('.rl-layer')"))
    ok(n+": no page errors",not errs,errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for ui,vp,ex,sc in(("es",{"width":1280,"height":800},"bad","light"),("en",{"width":1280,"height":800},"worst","dark"),("es",{"width":390,"height":844},"bad","light"),("en",{"width":390,"height":844},"worst","dark")):
            await run(b,ui,vp,ex,sc)
        await b.close()
    print("ALL OK" if not fails else "FAILS: "+", ".join(fails))
asyncio.run(main())
