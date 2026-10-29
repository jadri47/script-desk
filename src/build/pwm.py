SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
async def toggle_expert(pg):  # «Modo completo» lives in the ⋯ menu (2026-10-26)
    await pg.evaluate("if ($('moreMenu').hidden) $('moreBtn').click()"); await pg.click("#expertToggle"); await pg.wait_for_timeout(700)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(390,844,"m"),(1100,900,"d")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-more-open','1'); localStorage.setItem('sd-coach-off','1')")  # no sd-intro: this suite tests the first-use intro. «Más detalles» open: the fix cards (li.fx) live there
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            print(n, "intro:", await pg.evaluate("!!$('introCard')"))
            await pg.screenshot(path=f"intro_{n}.png")
            await pg.click("#introTry"); await pg.wait_for_timeout(800)
            print(n, "demo:", await pg.evaluate("DEMO"), "intro gone:", not await pg.evaluate("!!$('introCard')"))
            await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            # the verdict card (.gv) left step 2 (2026-10-26): the verdict is read from verdictOf, the function that fed it
            print(n, "verdict:", await pg.evaluate("(()=>{const v=verdictOf(state.result);return v.t+' | '+v.d})()"))
            print(n, "cards:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).join(' || ')"))
            # since 2026-10-22 the guided walk asks the central idea as a coach question (pwcoach); the idea box inside a fix card (message_ui.js) lives in the full mode's top fixes, so this part runs there
            pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
            await pg.set_viewport_size({"width": min(w, 800), "height": hh})  # from 900 px the full view is the split view: its paragraph walker has no idea card; below it the plain top-fix list (with the idea box) shows
            await toggle_expert(pg)
            await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(300)
            print(n, "cards (full mode):", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).join(' || ')"))
            print(n, "inline idea:", await pg.evaluate("!!$('ideaInline')"))
            await pg.click("li.fx-idea .fx-top"); await pg.wait_for_timeout(200)  # full-mode fix cards start collapsed: open the idea card
            await pg.fill("#ideaInline", "Dios usa a los pequeños para vencer a los gigantes cuando confían en Él"); await pg.click("#ideaInlineSave"); await pg.wait_for_timeout(900)
            print(n, "after idea, bigIdea:", await pg.evaluate("$('bigIdea').value.slice(0,30)"), "| cards:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).join(' || ')"))
            await pg.screenshot(path=f"msg_{n}.png", full_page=False)
            await toggle_expert(pg)  # back to the guided flow for the demos below
            await pg.set_viewport_size({"width": w, "height": hh}); await pg.wait_for_timeout(300)
            # good example: green
            await pg.evaluate("startDemo('good')"); await pg.wait_for_timeout(800); await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            print(n, "good verdict:", await pg.evaluate("verdictOf(state.result).t"), "| idea:", await pg.evaluate("$('bigIdea').value.slice(0,25)"))
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(800); await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            print(n, "mid verdict:", await pg.evaluate("verdictOf(state.result).t"), "| cards:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).join(' || ')"))
            # apply idea card in mid
            btn = await pg.query_selector("li.fx [data-fxapply]")
            first = await pg.evaluate("document.querySelector('li.fx .tf-t').textContent")
            if btn: await btn.click(); await pg.wait_for_timeout(900)
            print(n, "applied first card (", first, ") -> cards now:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).join(' || ')"))
            # full mode
            await toggle_expert(pg)
            print(n, "full: message card:", await pg.evaluate("!!$('sec-message')"), "| lamp:", await pg.evaluate("document.querySelector('#results .verdict .lamp').textContent"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
