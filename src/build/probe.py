SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, time
from playwright.async_api import async_playwright
MOCK = open("mockclaude.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        pg = await b.new_page(viewport={"width":390,"height":844}); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
        # 1. no-db experience (what Juan sees if runtime missing)
        pg2 = await b.new_page(viewport={"width":390,"height":844}); pg2.on("pageerror", lambda e: errs.append("nodb:"+str(e)))
        await pg2.goto(SDU+"build/work.html"); await pg2.wait_for_timeout(400)
        print("NO-DB step1 calendar text:", (await pg2.inner_text("#gSeries"))[:120].replace("\n"," | "))
        await pg2.fill("#script", LONG); await pg2.click("#runBtn"); await pg2.wait_for_timeout(900)
        print("NO-DB verdict:", await pg2.evaluate("(document.querySelector('.gv .lamp')||{}).textContent"), "| AI btn disabled:", await pg2.evaluate("[...document.querySelectorAll('[data-ai],[data-fxai],#coAi,#pkAi')].map(b=>b.disabled)"))
        await pg2.evaluate("goStep(3)"); await pg2.wait_for_timeout(400)
        await pg2.fill("#pkTitleIn","¿Qué dice la Biblia sobre la ansiedad?"); await pg2.fill("#pkThumbIn","Sin miedo"); await pg2.wait_for_timeout(500)
        print("NO-DB approve disabled:", await pg2.evaluate("$('gApprove').disabled"))
        await pg2.click("#gApprove"); await pg2.wait_for_timeout(500)
        print("NO-DB after approve step:", await pg2.evaluate("V.step"), "status:", await pg2.evaluate("G.status"))
        # 2. paste script with no blank lines / one huge paragraph
        blob = " ".join(LONG.split())
        await pg.fill("#script", blob); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
        await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(400)
        print("BLOB sections:", await pg.evaluate("G.secs ? G.secs.length : (G.layout && G.layout.length)"), "| cold cands:", await pg.evaluate("document.querySelectorAll('#gCold .co-text').length"))
        # 3. very short script
        await pg.evaluate("goStep(1)"); await pg.fill("#script", "Hola. Hoy veremos Juan 3:16. Dios te ama. Nos vemos."); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
        print("SHORT verdict:", await pg.evaluate("(document.querySelector('.gv .lamp')||{}).textContent"), "| cards:", await pg.evaluate("document.querySelectorAll('.fx-card').length"))
        # 4. English script in Spanish UI
        await pg.evaluate("goStep(1)"); await pg.fill("#script", open("ex2/en_mid.txt").read()); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
        print("EN-in-ES lang:", await pg.evaluate("state.result.lang"), "| verdict:", await pg.evaluate("(document.querySelector('.gv .lamp')||{}).textContent"), "| first card:", (await pg.evaluate("(document.querySelector('.fx-card .fx-t, .fx-card h4')||{}).textContent||''"))[:60])
        # 5. unsaved edits + reload
        await pg.evaluate("goStep(1)"); await pg.fill("#script", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
        await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(300); await pg.fill("#pkTitleIn","Título de prueba"); await pg.wait_for_timeout(100)
        await pg.reload(); await pg.wait_for_timeout(600)
        print("RELOAD: script kept:", await pg.evaluate("$('script').value.length>0"), "| step:", await pg.evaluate("V.step"), "| title:", await pg.evaluate("$('title').value"))
        # 6. two tabs same prod (conflict)
        print("ERR", errs); await b.close()
asyncio.run(main())
