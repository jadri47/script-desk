SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
# The verdict card (#guide .gv) is gone from step 2 by decision (the number lives in the score pill; pwbub pins "no verdict card"), so the verdict text is read from verdictOf, the function that fed it.
VERDICT = "(()=>{const v=verdictOf(state.result);return v.t+' | '+v.d})()"
# The verdict card (#guide .gv) is gone from step 2 by decision (the number lives in the score pill; pwbub pins "no verdict card"), so the verdict text is read from verdictOf, the function that fed it.
VERDICT = "(()=>{const v=verdictOf(state.result);return v.t+' | '+v.d})()"
SB = open("mock_sb.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-more-open','1'); localStorage.setItem('sd-coach-off','1')")  # skip the intro; open «Más detalles» (verdict + fix cards live there since 2026-10-22) and use the paragraph walker
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))  # approve / recorded save the episode: they need the guest db
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"gd_{n}_1.png")
            await pg.evaluate("$('script').value = SAMPLE_ES; updateLive()")  # what the old #gSample link did; demo_ui.js removed the link (examples replaced it)
            await pg.click("#runBtn"); await pg.wait_for_timeout(600)
            print(n, "step:", await pg.evaluate("V.step"), "|", (await pg.evaluate(VERDICT)))
            await pg.screenshot(path=f"gd_{n}_2.png")
            await pg.click("[data-fxapply='0']"); await pg.wait_for_timeout(500)
            print(n, "after apply:", (await pg.evaluate(VERDICT))[:80])
            await pg.click("[data-fxskip='0']"); await pg.wait_for_timeout(400)
            print(n, "after skip:", (await pg.evaluate(VERDICT))[:80])
            await pg.click(".g-nav-steps [data-step='3']"); await pg.wait_for_timeout(500)
            for k in range(5): await pg.click("[data-pub=skip]"); await pg.wait_for_timeout(350)  # step 3 is a walk now (2026-10-26): title, thumbnail, description, topic, cold open -> approve card
            print(n, "step3 approve disabled:", await pg.is_disabled("#gApprove"))
            await pg.click("[data-pub-go='0']"); await pg.wait_for_timeout(350)
            await pg.fill("#pkTitleIn", "¿Qué dice la Biblia sobre la ansiedad?"); await pg.click("[data-pub=next]"); await pg.wait_for_timeout(350)
            await pg.fill("#pkThumbIn", "No cargues mañana"); await pg.wait_for_timeout(700)
            await pg.evaluate("PB.i = 5; renderGuide()"); await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(300)
            print(n, "approve disabled after:", await pg.is_disabled("#gApprove"))
            await pg.screenshot(path=f"gd_{n}_3.png")
            await pg.click("#gApprove"); await pg.wait_for_timeout(500)
            print(n, "step:", await pg.evaluate("V.step+' '+G.status"))
            await pg.screenshot(path=f"gd_{n}_4.png")
            await pg.click("#gPP"); await pg.wait_for_timeout(300); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            print(n, "after pp step:", await pg.evaluate("V.step"), await pg.evaluate("document.querySelectorAll('#pp').length"))
            await pg.click("#gRecorded"); await pg.wait_for_timeout(500)
            print(n, "step:", await pg.evaluate("V.step+' '+G.status"))
            await pg.screenshot(path=f"gd_{n}_5.png")
            await pg.evaluate("if ($('moreMenu').hidden) $('moreBtn').click()"); await pg.click("#expertToggle"); await pg.wait_for_timeout(400)
            print(n, "expert view:", await pg.evaluate("document.querySelector('main').dataset.view"), "results visible:", await pg.is_visible("#results"), "modes:", await pg.is_visible(".modes"))
            await pg.evaluate("if ($('moreMenu').hidden) $('moreBtn').click()"); await pg.click("#expertToggle"); await pg.wait_for_timeout(300)
            print(n, "back to guide step:", await pg.evaluate("V.step"))
            await pg.click("[data-ui=en]"); await pg.wait_for_timeout(300)
            print(n, "EN:", (await pg.inner_text("#guideTop")).replace("\n"," | ")[:80])
            await pg.evaluate("localStorage.clear()")
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
