# Guided flow = 3 steps (Escribir · Mejorar · Publicar): the step bar, step 3 content and order, approve / «Ya lo grabamos» stay on step 3,
# a saved episode with status aprobado / grabado reopens on step 3. ES + EN, desktop 1400 and phone 390.
# (jadri47, 2026-10-22: "merge «Grabar» and «Después» into step 3"). Needs mock_sb.js (guest db); no AI is called.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
LABELS = {"es": ["Escribir", "Mejorar", "Publicar"], "en": ["Write", "Improve", "Publish"]}
AFTER = {"es": "Después de grabar", "en": "After recording"}
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                pg = await b.new_page(viewport={"width": w, "height": hh}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
                await pg.evaluate("caps.sample = Promise.resolve(null)")
                await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", await pg.evaluate("SAMPLE_ES"))
                await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
                # the bar: exactly 3 buttons with the new labels
                labs = await pg.evaluate("[...document.querySelectorAll('#stepBar .sb button .sb-l')].map(x=>x.textContent.trim())")
                ok(f"{n}: step bar has exactly 3 buttons {LABELS[ui]}", labs == LABELS[ui], labs)
                await pg.screenshot(path=OUT + f"steps_bar_{n.replace('/', '_')}.png")
                # step 3 content and order
                await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(600)
                order = await pg.evaluate("[...document.querySelectorAll('#guide > *')].map(x=>x.id||(x.classList.contains('g-recorded')?'g-recorded':x.className.split(' ')[0]))")
                want = ["gPack", "gTopic", "gCold", "g-approve", "gRecCard", "g-recorded", "gAfter", "gMore3"]
                idx = [order.index(w_) if w_ in order else -1 for w_ in want]
                ok(f"{n}: step 3 shows pack, topic, cold, approve, record card, After recording, More details in that order", all(i >= 0 for i in idx) and idx == sorted(idx), order)
                ok(f"{n}: «{AFTER[ui]}» exists and is closed", await pg.evaluate("(()=>{const d=$('gAfter');return !!d && !d.open && d.querySelector('summary').textContent.trim()==='%s'})()" % AFTER[ui]))
                ok(f"{n}: «Más detalles» closed, holds the structure", await pg.evaluate("(()=>{const d=$('gMore3');return !!d && !d.open && !!d.querySelector('#gStruct')})()"))
                ok(f"{n}: no step 4 / 5 anywhere", await pg.evaluate("!document.querySelector('[data-step=\"4\"],[data-step=\"5\"]')"))
                ok(f"{n}: approve disabled until the packaging is filled", await pg.is_disabled("#gApprove"))
                await pg.fill("#pkTitleIn", "¿Qué dice la Biblia sobre la ansiedad?"); await pg.fill("#pkThumbIn", "No cargues mañana"); await pg.wait_for_timeout(800)
                if await pg.is_disabled("#gApprove"):
                    print("   gate still says:", await pg.evaluate("(document.querySelector('.g-gate')||{}).textContent"))
                await pg.screenshot(path=OUT + f"steps_s3_{n.replace('/', '_')}.png", full_page=True)
                hov = await pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
                ok(f"{n}: no horizontal overflow on step 3", not hov)
                if nm == "m":
                    ok(f"{n}: phone bottom bar fixed with 3 buttons", await pg.evaluate("(()=>{const s=$('stepBar');return getComputedStyle(s).position==='fixed' && s.querySelectorAll('button').length===3})()"))
                # approve: stays on 3, status aprobado
                await pg.click("#gApprove"); await pg.wait_for_timeout(900)
                st = await pg.evaluate("V.step+' '+G.status")
                ok(f"{n}: approve keeps step 3 and sets aprobado", st == "3 aprobado", st)
                ok(f"{n}: «Ya lo grabamos» is enabled after approve", await pg.evaluate("!!$('gRecorded') && !$('gRecorded').disabled"))
                # reopen the saved episode: aprobado lands on step 3
                pid = await pg.evaluate("G.prodId")
                await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
                await pg.evaluate("id=>openFromSeries(id)", pid); await pg.wait_for_timeout(900)
                st = await pg.evaluate("V.step+' '+G.status")
                ok(f"{n}: reopening an aprobado episode lands on step 3", st == "3 aprobado", st)
                # recorded: stays on 3, opens «Después de grabar»
                await pg.click("#gRecorded"); await pg.wait_for_timeout(900)
                st = await pg.evaluate("V.step+' '+G.status+' '+$('gAfter').open")
                ok(f"{n}: «Ya lo grabamos» keeps step 3, sets grabado, opens «Después de grabar»", st == "3 grabado true", st)
                await pg.screenshot(path=OUT + f"steps_after_{n.replace('/', '_')}.png", full_page=True)
                await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
                await pg.evaluate("id=>openFromSeries(id)", pid); await pg.wait_for_timeout(900)
                st = await pg.evaluate("V.step+' '+G.status+' '+$('gAfter').open")
                ok(f"{n}: reopening a grabado episode lands on step 3 with «Después de grabar» closed", st == "3 grabado false", st)
                ok(f"{n}: stepForStatus", await pg.evaluate("[stepForStatus('borrador'),stepForStatus('revision'),stepForStatus('aprobado'),stepForStatus('grabado')].join()") == "2,2,3,3")
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        await b.close()
    print("FAILS:", fails) if fails else print("all ok")
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
