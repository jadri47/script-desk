import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = "file:///home/claude/sd/standalone/site/index.html"
async def page(b, mode, w=390, h=844, ctx=None):
    ctx = ctx or await b.new_context(viewport={"width":w,"height":h})
    pg = await ctx.new_page()
    await pg.add_init_script(f"window.__SB_MODE = sessionStorage.getItem('m') || {json.dumps(mode)};")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    async def fn(route):
        body = json.loads(route.request.post_data or "{}")
        if "cancel" in body.get("prompt",""): await route.abort(); return
        data = {"titles":["¿Qué dice la Biblia sobre la ansiedad?"],"thumbs":["Sin miedo"],"description":"x"}
        await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data": data}))
    await pg.route("**/functions/v1/sd-ai", fn)
    return ctx, pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        # 1 signed out
        ctx, pg = await page(b, "out"); pg.on("pageerror", lambda e: errs.append("out:"+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        print("OUT bar:", (await pg.inner_text("#authBar")).replace("\n"," | ")[:140])
        print("OUT strip empty:", await pg.evaluate("!$('epStrip') || !$('epStrip').innerHTML"))
        await pg.click("#authIn"); await pg.wait_for_timeout(200)
        print("OUT oauth call:", await pg.evaluate("JSON.stringify(window.__oauth)"))
        await pg.screenshot(path="sa_out.png")
        await ctx.close()
        # 2 stranger
        ctx, pg = await page(b, "stranger"); pg.on("pageerror", lambda e: errs.append("str:"+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        print("STRANGER bar:", (await pg.inner_text("#authBar")).replace("\n"," | ")[:160], "| db:", await pg.evaluate("caps.db.then(d=>!!d)"))
        await ctx.close()
        # 3 member: full flow, reload reopens, AI works
        ctx, pg = await page(b, "member"); pg.on("pageerror", lambda e: errs.append("mem:"+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        print("MEMBER bar:", (await pg.inner_text("#authBar")).replace("\n"," | "))
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
        print("MEMBER step:", await pg.evaluate("V.step"), "prodId:", await pg.evaluate("G.prodId"), "rows:", await pg.evaluate("Object.keys(window.__rows).length"))
        await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(500)
        await pg.fill("#pkTitleIn", "Título que tecleé justo antes de cerrar"); await pg.wait_for_timeout(100)
        rows_snapshot = await pg.evaluate("JSON.stringify(window.__rows)")
        # simulate leaving: visibility hidden
        await pg.evaluate("Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true}); document.dispatchEvent(new Event('visibilitychange'))"); await pg.wait_for_timeout(400)
        saved_title = await pg.evaluate("(Object.values(window.__rows).find(r=>r.collection==='producciones')||{data:{}}).data.title")
        print("FLUSH on hide saved title:", saved_title)
        rows_now = await pg.evaluate("JSON.stringify(window.__rows)")
        # new page in same context sharing rows via localStorage? rows are per-page memory: carry over
        await pg.evaluate("Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true})")
        ctx2pg = await ctx.new_page()
        await ctx2pg.add_init_script("window.__SB_MODE='member'; window.__rows = " + rows_now + ";")
        await ctx2pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        ctx2pg.on("pageerror", lambda e: errs.append("re:"+str(e)))
        await ctx2pg.goto(URL); await ctx2pg.wait_for_timeout(1200)
        print("RELOAD reopened:", await ctx2pg.evaluate("$('script').value.length > 100"), "| step:", await ctx2pg.evaluate("V.step"), "| title:", await ctx2pg.evaluate("$('title').value"))
        # AI pack suggestions
        await ctx2pg.evaluate("goStep(3)"); await ctx2pg.wait_for_timeout(400)
        print("AI btn enabled:", await ctx2pg.evaluate("!$('pkAi').disabled"))
        await ctx2pg.route("**/functions/v1/sd-ai", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps({"data":{"titles":["¿Qué dice la Biblia sobre la ansiedad?","Ansiedad y fe"],"thumbs":["Sin miedo","Un día a la vez","Paz real"],"description":"¿Qué dice la Biblia sobre la ansiedad? ..."}})))
        await ctx2pg.click("#pkAi"); await ctx2pg.wait_for_timeout(1000)
        print("AI result:", (await ctx2pg.evaluate("($('pkSug')||{}).innerText || ($('pkStatus')||{}).textContent || ''"))[:120].replace("\n"," | "))
        # error code mapping
        await ctx2pg.route("**/functions/v1/sd-ai", lambda r: r.fulfill(status=503, content_type="application/json", body=json.dumps({"code":"no_key"})))
        await ctx2pg.click("#pkAi"); await ctx2pg.wait_for_timeout(800)
        print("AI no_key msg:", await ctx2pg.evaluate("($('pkStatus')||{}).textContent"))
        # download
        await ctx2pg.evaluate("goStep(4)"); await ctx2pg.wait_for_timeout(300)
        async with ctx2pg.expect_download() as dl:
            await ctx2pg.click("#gSheet")
        d = await dl.value; print("DOWNLOAD:", d.suggested_filename)
        # full-mode confirm
        ctx2pg.once("dialog", lambda dlg: asyncio.ensure_future(dlg.dismiss()))
        await ctx2pg.click("#expertToggle"); await ctx2pg.wait_for_timeout(300)
        print("CONFIRM dismissed -> still guided:", await ctx2pg.evaluate("V.guided"), "checkbox:", await ctx2pg.evaluate("$('expertToggle').checked"))
        await ctx2pg.screenshot(path="sa_member.png")
        print("ERR", errs); await b.close()
asyncio.run(main())
