# Coach panel (step 2, one decision at a time): header and queue, skip/previous, batch apply + per-item revert,
# "Lo escribo yo", a question answer, the walker toggle (persisted), keyboard, no overflow at 390. Needs mock_sb.js (guest demo).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
SHOTS = os.path.join(tempfile.gettempdir(), "script-desk-pw"); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(n, c, x=""):
    if not c:
        print("FAIL " + n, x); fails.append(n)
RANK = {"risk": 0, "batch": 1, "question": 2, "choice": 3, "note": 4}
HEAD = "document.querySelector('.topfix.coach h3').textContent.trim()"
FRESH = "buildDecisions(state.text, state.result, state.opts, state.fixDismissed)"
async def open_page(b, vp, ui, demo, extra=""):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); {extra}")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2000)
    return pg, errs
async def skip_until(pg, kind, need_at=False):
    for _ in range(40):
        c = await pg.evaluate("(()=>{const d=COACH.list[0];return d?[d.kind,!!d.at]:null})()")
        if not c: return False
        if c[0] == kind and (c[1] or not need_at): return True
        await pg.click("[data-co=skip]"); await pg.wait_for_timeout(500)
    return False
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for vpn, vp in [("desktop", {"width": 1400, "height": 900}), ("phone", {"width": 390, "height": 844})]:
            for ui in ["es", "en"]:
                for demo in ["bad", "mid"]:
                    n = f"{vpn}-{ui}-{demo}"
                    pg, errs = await open_page(b, vp, ui, demo)
                    ok(n + ": coach is the step-2 panel", await pg.locator(".topfix.coach").count() == 1 and await pg.locator(".topfix.walk").count() == 0)
                    N = await pg.evaluate(f"{FRESH}.length"); kinds = await pg.evaluate(f"{FRESH}.map(d=>d.kind)")
                    head = (await pg.evaluate(HEAD)); want = (f"Decisión 1 de {N}" if ui == "es" else f"Decision 1 of {N}")
                    ok(n + ": header says decision 1 of N (N = buildDecisions length)", head == want and N > 0, (head, want))
                    ok(n + ": decisions come in kind order", kinds == sorted(kinds, key=lambda k: RANK[k]) and kinds == await pg.evaluate("COACH.list.map(d=>d.kind)"), kinds)
                    pb = await pg.evaluate("(()=>{const e=document.querySelector('.cc-bar');return [e.getAttribute('role'),e.getAttribute('aria-valuenow'),e.getAttribute('aria-valuemax')]})()")
                    ok(n + ": progress bar role and values", pb == ["progressbar", "0", str(N)], pb)
                    ok(n + ": score line", await pg.evaluate("/\\d+ → \\d+/.test(document.querySelector('.cc-score').textContent)"))
                    ok(n + ": region is labelled, buttons have text", await pg.evaluate("(()=>{const r=document.querySelector('.cc-dec');return r.getAttribute('role')==='region'&&!!r.getAttribute('aria-label')&&[...document.querySelectorAll('.topfix.coach button')].every(b=>b.textContent.trim())})()"))
                    id0 = await pg.evaluate("COACH.list[0].id")
                    # skip advances, previous goes back
                    await pg.click("[data-co=skip]"); await pg.wait_for_timeout(600)
                    h2 = await pg.evaluate(HEAD) if N > 1 else ""
                    if N > 1:
                        ok(n + ": skip advances to decision 2", h2 == (f"Decisión 2 de {N}" if ui == "es" else f"Decision 2 of {N}"), h2)
                        ok(n + ": skip adds the ids to fixDismissed and a log entry", await pg.evaluate("state.fixLog.some(x=>x.kind==='skip')"))
                    await pg.click("[data-co=prev]"); await pg.wait_for_timeout(600)
                    ok(n + ": previous brings the skipped decision back", await pg.evaluate("COACH.list[0].id") == id0 and (await pg.evaluate(HEAD)) == want, await pg.evaluate(HEAD))
                    # keyboard: ArrowRight skips, ArrowLeft goes back (focus in the panel, not in a box)
                    await pg.evaluate("document.querySelector('.cc-dec').focus()"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(600)
                    if N > 1: ok(n + ": ArrowRight skips", (await pg.evaluate(HEAD)) == (f"Decisión 2 de {N}" if ui == "es" else f"Decision 2 of {N}"), await pg.evaluate(HEAD))
                    await pg.evaluate("document.querySelector('.cc-dec').focus()"); await pg.keyboard.press("ArrowLeft"); await pg.wait_for_timeout(600)
                    ok(n + ": ArrowLeft goes back", (await pg.evaluate(HEAD)) == want, await pg.evaluate(HEAD))
                    if demo == "bad":
                        await pg.screenshot(path=os.path.join(SHOTS, f"coach-{vpn}-{ui}.png"))
                    if vpn == "phone":
                        await pg.evaluate("(()=>{const r=document.querySelector('[data-co=prev]').getBoundingClientRect();window.scrollBy(0,r.top+r.height/2-(innerHeight-110))})()"); await pg.wait_for_timeout(300)
                        hit = await pg.evaluate("(()=>{const b=document.querySelector('[data-co=prev]'),r=b.getBoundingClientRect();return [.15,.5,.85].every(f=>{const e=document.elementFromPoint(r.left+r.width*f,r.top+r.height/2);return !!e&&(e===b||b.contains(e))})})()")
                        ok(n + ": Anterior is hit-testable (left, centre and right of the label; not under the score pill)", hit)
                        ok(n + ": the lead names the coach buttons", await pg.evaluate("/Saltar|Skip/.test(document.querySelector('.topfix.coach').nextElementSibling.textContent)"))
                        ov = await pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
                        ok(n + ": no horizontal overflow at 390", ov[0] <= ov[1], ov)
                    ok(n + ": no page errors", not errs, errs)
                    await pg.close()
        # ---- behaviour checks (desktop + phone, ES) ----
        for vpn, vp in [("desktop", {"width": 1400, "height": 900}), ("phone", {"width": 390, "height": 844})]:
            n = vpn + "-batch"
            pg, errs = await open_page(b, vp, "es", "bad")
            if await pg.evaluate("COACH.list[0].kind") == "batch":
                nb = await pg.evaluate("COACH.list[0].items.length")
                lab = await pg.inner_text("[data-co=batch]")
                ok(n + ": button says Aplicar los n", lab.strip() == f"Aplicar los {nb}", lab)
                await pg.click(".cc-see summary"); await pg.wait_for_timeout(200)
                ok(n + ": every item is listed as a before/after line", await pg.locator(".cc-items li").count() == nb and await pg.evaluate("[...document.querySelectorAll('.cc-it')].every(e=>e.querySelector('del')&&e.querySelector('ins'))"))
                if vpn == "desktop":
                    await pg.click(".cc-it >> nth=0"); await pg.wait_for_timeout(200)
                    ok(n + ": clicking an item shows it in the script", await pg.evaluate("CSS.highlights.has('sd-flash')"))
                f0 = await pg.evaluate("(()=>{const r=Object.values(state.result.sections).flat().find(x=>x.id==='muletillas');return r?r.n||0:0})()")
                t0 = await pg.evaluate("$('script').value")
                await pg.click("[data-co=batch]"); await pg.wait_for_timeout(1800)
                f1 = await pg.evaluate("(()=>{const r=Object.values(state.result.sections).flat().find(x=>x.id==='muletillas');return r?r.n||0:0})()")
                done = await pg.evaluate("state.fixLog.filter(x=>x.kind==='done').length")
                ok(n + ": batch reduces the filler hits", f1 < f0, (f0, f1))
                ok(n + ": batch adds one done entry per item", done == nb, (done, nb))
                t1 = await pg.evaluate("$('script').value")
                ok(n + ": the script changed once and the review re-ran", t1 != t0 and await pg.evaluate("state.text===$('script').value"))
                # revert exactly one entry from the log
                await pg.evaluate("document.querySelector('.cc-log').open=true")
                e = await pg.evaluate("(()=>{const x=state.fixLog.filter(y=>y.kind==='done')[1];return {uid:x.uid,from:x.chg.rawFrom,to:x.chg.rawTo,pre:x.chg.cPre,post:x.chg.cPost}})()")
                await pg.evaluate(f"document.querySelector('[data-fxrevert=\"{e['uid']}\"]').click()"); await pg.wait_for_timeout(1500)
                t2 = await pg.evaluate("$('script').value")
                ok(n + ": reverting one entry restores exactly that text", len(t2) - len(t1) == len(e["from"]) - len(e["to"]) and (e["pre"] + e["from"] + e["post"]) in t2, (len(t1), len(t2), e))
                ok(n + ": the other entries stay", await pg.evaluate("state.fixLog.filter(x=>x.kind==='done').length") == nb - 1)
                if vpn == "desktop": await pg.screenshot(path=os.path.join(SHOTS, "coach-after-batch-desktop.png"))
            else: ok(n + ": first decision is the batch", False, await pg.evaluate("COACH.list[0].kind"))
            ok(n + ": no page errors", not errs, errs)
            await pg.close()
            # Lo escribo yo
            n = vpn + "-write"
            pg, errs = await open_page(b, vp, "es", "bad")
            if await skip_until(pg, "choice", True):
                await pg.click("[data-co=write]"); await pg.wait_for_timeout(300)
                ta = pg.locator("#coW")
                ok(n + ": the box is prefilled with the text at the spot", await pg.evaluate("$('coW').value===state.text.slice(COACH.list[0].at.start,COACH.list[0].at.end)"))
                orig = await ta.input_value(); await ta.fill(orig + " zzqmark")
                await pg.click("[data-co=wcheck]"); await pg.wait_for_timeout(400)
                ok(n + ": checking shows the preview and an Aplicar lo escrito button", await pg.locator(".cc-write .fx-prop").count() == 1 and await pg.locator("[data-co=wapply]").count() == 1)
                await pg.click("[data-co=wapply]"); await pg.wait_for_timeout(1800)
                ok(n + ": the typed replacement lands in the script", await pg.evaluate("$('script').value.includes('zzqmark')"))
                ok(n + ": and is in the log, revertible", await pg.evaluate("state.fixLog.some(x=>x.kind==='done'&&x.what)"))
            else: ok(n + ": a choice with a spot exists", False)
            ok(n + ": no page errors", not errs, errs)
            await pg.close()
            # question
            n = vpn + "-question"
            pg, errs = await open_page(b, vp, "es", "bad")
            if await skip_until(pg, "question"):
                ask = await pg.evaluate("COACH.list[0].ask")
                qtxt = (await pg.inner_text("#coQ")).strip()
                ok(n + ": the question text matches " + ask, qtxt in ["¿Cuál es la idea central del episodio?", "¿Qué frase buscaría alguien en YouTube para encontrar este episodio?", "¿De qué trata el próximo episodio?", "¿Qué título le pones?"], qtxt)
                await pg.click("[data-co=answer]"); await pg.wait_for_timeout(200)
                ok(n + ": an empty answer is refused, not saved", await pg.locator("#coAnsErr").is_visible())
                await pg.fill("#coAns", "Dios no te deja solo"); await pg.click("[data-co=answer]"); await pg.wait_for_timeout(1500)
                got = await pg.evaluate(f"({{bigIdea:()=>$('bigIdea').value,keyword:()=>$('keyword').value,nextEp:()=>G.nextEp,title:()=>$('title').value}})['{ask}']()")
                ok(n + ": the answer lands in its field", got == "Dios no te deja solo", got)
            else: ok(n + ": a question exists", False)
            ok(n + ": no page errors", not errs, errs)
            await pg.close()
        # ---- score popover jump ----
        for ui in ["es", "en"]:
            pg, errs = await open_page(b, {"width": 1400, "height": 900}, ui, "bad")
            h0 = await pg.evaluate(HEAD)
            await pg.evaluate("scGoRow('jargon')"); await pg.wait_for_timeout(800)
            h1 = await pg.evaluate(HEAD)
            ok(ui + ": scGoRow jumps to that decision", h1 != h0 and await pg.evaluate("COACH.list[0].id") == "jargon", (h0, h1))
            ok(ui + ": no page errors", not errs, errs)
            await pg.close()
        # ---- walker toggle, remembered after reload ----
        pg, errs = await open_page(b, {"width": 1400, "height": 900}, "es", "bad")
        await pg.click("[data-co=walker]"); await pg.wait_for_timeout(1200)
        ok("toggle: Ver por párrafos shows the walker", await pg.locator(".topfix.walk").count() == 1 and await pg.locator(".topfix.coach").count() == 0)
        ok("toggle: the walker has the way back", await pg.locator("#coBack").count() == 1)
        ok("toggle: the choice is stored", await pg.evaluate("localStorage.getItem('sd-coach-off')") == "1")
        await pg.reload(); await pg.wait_for_timeout(600); await pg.evaluate("startDemo('bad')"); await pg.wait_for_timeout(800); await pg.click("#runBtn"); await pg.wait_for_timeout(2000)
        ok("toggle: the walker persists after reload", await pg.locator(".topfix.walk").count() == 1 and await pg.locator(".topfix.coach").count() == 0)
        await pg.click("#coBack"); await pg.wait_for_timeout(1200)
        ok("toggle: back to one decision at a time", await pg.locator(".topfix.coach").count() == 1 and await pg.evaluate("localStorage.getItem('sd-coach-off')") is None)
        ok("toggle: no page errors", not errs, errs)
        # ---- end state ----
        for _ in range(60):
            if not await pg.evaluate("COACH.list.length"): break
            if await pg.evaluate("COACH.list[0].kind") == "question":
                await pg.click("[data-co=skip]")
            else: await pg.click("[data-co=skip]")
            await pg.wait_for_timeout(350)
        ok("done: «Listo: no quedan decisiones» and the way to Preparar", await pg.locator("text=Listo: no quedan decisiones").count() >= 1 and await pg.locator("[data-co=done]").count() == 1)
        ok("done: the progress bar is full", await pg.evaluate("(()=>{const e=document.querySelector('.cc-bar');return e.getAttribute('aria-valuenow')===e.getAttribute('aria-valuemax')})()"))
        await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
