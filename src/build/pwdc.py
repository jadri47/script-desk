# Tap-to-select paragraph, green accepted card, grey ignored card + restore, accept lands in script. ES/EN, desktop + phone.
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
    # tap: put the caret in the last paragraph that has any block -> walker follows
    nb=await pg.evaluate("WK.blocks.length")
    target=max(0,nb-2)
    await pg.evaluate(f"WK.blocks[{target}].el.scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(300)
    pt=await pg.evaluate(f"(()=>{{const el=WK.blocks[{target}].el,r=el.getBoundingClientRect();for(let y=Math.max(r.top+8,0);y<Math.min(r.bottom,innerHeight)-4;y+=8){{const e=document.elementFromPoint(r.left+8,y);if(e&&el.contains(e))return [r.left+8,y]}}return [r.left+8,r.top+8]}})()")
    await pg.mouse.click(pt[0],pt[1]); await pg.wait_for_timeout(500)
    S=await pg.evaluate("({i:WK.i,on:[...ED.el.children].findIndex(e=>e.classList.contains('walk-on')||e.querySelector('.walk-on'))})")
    ok(n+": caret in a paragraph selects it in the review",S["i"]==target,S)
    await pg.evaluate("setFull(false)"); await pg.wait_for_timeout(500)
    ok(n+": after Listo the review still shows that paragraph",await pg.evaluate("WK.i")==target)
    # accept on the first paragraph with a patch card
    await pg.evaluate("wkGo(WK.list[0])"); await pg.wait_for_timeout(600)
    if await pg.locator("[data-fxapply]:visible").count():
        i0=await pg.evaluate("WK.i"); fid=await pg.evaluate("document.querySelector('.topfix.walk li.fx[data-fid]').dataset.fid")
        before=await pg.evaluate("$('script').value")
        await pg.locator("[data-fxapply]:visible").first.click(); await pg.wait_for_timeout(1500)
        after=await pg.evaluate("$('script').value")
        edtxt=await pg.evaluate("ED.el.innerText.replace(/\\s+/g,' ').trim()")
        msg=await pg.evaluate("document.getElementById('fxMsg').textContent")
        ok(n+": accepted fix lands in the script, or says where it went",(after!=before and len(edtxt)>50) or bool(msg and ("arranque" in msg or "cold open" in msg or "Preparar" in msg or "Prepare" in msg)),msg)
        D=await pg.evaluate("[...document.querySelectorAll('.topfix.walk li.fx-done')].length")
        ok(n+": green accepted card stays in the review",D>=1,D)
        ok(n+": strip tick/count mention applied",await pg.evaluate("/\\b1\\b/.test(document.querySelector('.wk-where .hint').textContent)"))
    # a text patch really lands in the script and in the editor
    changed=False
    for k in range(await pg.evaluate("WK.list.length")):
        await pg.evaluate(f"wkGo(WK.list[{k}])"); await pg.wait_for_timeout(400)
        ps=await pg.evaluate("state.fixCards.map(c=>c.proposals[0]&&c.proposals[0].kind)")
        if "patch" in ps:
            ci=ps.index("patch"); b4=await pg.evaluate("$('script').value")
            await pg.locator(f"[data-fxapply='{ci}']").first.scroll_into_view_if_needed(); await pg.locator(f"[data-fxapply='{ci}']").first.click(); await pg.wait_for_timeout(1300)
            af=await pg.evaluate("$('script').value"); ed=await pg.evaluate("domToModel(ED.el).text")
            ok(n+": patch changes script and editor text",af!=b4 and ed.strip()==af.strip(),(len(b4),len(af),len(ed)))
            ok(n+": changed text flashes",await pg.evaluate("CSS.highlights.has('sd-flash')"))
            changed=True; break
    ok(n+": found a patch card to apply",changed)
    # ignore
    await pg.evaluate("wkGo(WK.list[0])"); await pg.wait_for_timeout(500)
    if await pg.locator("[data-fxskip]:visible").count():
        await pg.locator("[data-fxskip]:visible").first.click(); await pg.wait_for_timeout(900)
        K=await pg.evaluate("[...document.querySelectorAll('.topfix.walk li.fx-skipped')].length")
        ok(n+": grey ignored card",K>=1,K)
        op=await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('.fx-skipped')).opacity)")
        ok(n+": ignored card is dimmed",op<0.9,op)
        await pg.locator("[data-fxrestore]:visible").first.click(); await pg.wait_for_timeout(900)
        K2=await pg.evaluate("document.querySelectorAll('.topfix.walk li.fx-skipped').length")
        ok(n+": restore brings it back",K2<K,(K,K2))
    # stale guard: edit script then try to apply
    await pg.evaluate("wkGo(WK.list[0])"); await pg.wait_for_timeout(500)
    if await pg.locator("[data-fxapply]:visible").count():
        await pg.evaluate("$('script').value='X '+$('script').value; state.text=state.text"); 
        b2=await pg.evaluate("$('script').value")
        await pg.locator("[data-fxapply]:visible").first.click(); await pg.wait_for_timeout(900)
        a2=await pg.evaluate("$('script').value")
        ok(n+": stale apply does not clobber edits",a2==b2,(b2[:30],a2[:30]))
    ok(n+": no page errors",not errs,errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for ui in ["es","en"]:
            for vp in [{"width":1280,"height":800},{"width":390,"height":780}]:
                await run(b,ui,vp,"bad")
        await b.close()
    print("FAILS:",fails)
asyncio.run(main())
