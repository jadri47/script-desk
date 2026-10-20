SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read(); SB = open("mock_sb.js").read()
CHECK = {"Revisión: veredicto": "#results .verdict", "Lo primero que arreglaría": "#results .topfix", "Línea de tiempo": "#results .timeline",
 "Tabla de monetización (ahora lista de términos)": "#sec-money .pf-list", "Citas bíblicas + enlaces": "#sec-scripture", "Datos y hechos (IA)": "[data-ai=facts]",
 "Guion marcado": "#sec-manuscript", "Reescribir (IA)": "[data-ai=rewrite]", "Tres aperturas (IA)": "[data-ai=hooks]", "Títulos/descripción (IA)": "[data-ai=titles]",
 "Guardar versión": "#saveBtn", "Teleprompter .txt": "#tpBtn", "Revisión .md": "#mdBtn", "Historial/resultados": "#historyBlock",
 "Calendario (completo; botón + Planear otro episodio)": "#gSeriesFull-a", "Copia (completo)": "#gBackupFull-dl"}
# The Guion tab shows one phase at a time (phases_ui.js), so each card is checked in the phase that holds it.
# Escaleta + Secciones are now one "Estructura" card (#gStruct); the old production box is the status strip (#gProdBar .st-strip).
GCHECK = {"prep": {"Estado (franja)": "#gProdBar .st-strip", "Estructura (escaleta + secciones)": "#gStruct li, #gStruct table, #gStruct .st-panel", "Apertura en frío": "#gCold .co-cols",
          "Tema y próximo": "#gTopic #tpNext", "Empaque": "#gPack #pkTitleIn"},
          "rec": {"Prompter": "#gPP", "Ensayo": "#gReh", "Hoja editor": "#gSheet"},
          "after": {"Shorts": "#gShorts", "Resultados": "#gRes #rsImport", "Revisiones": "#gRev"}}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1100,"height":900}); errs=[]
        await pg.add_init_script(MOCK); await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-expert','1'); localStorage.setItem('sd-intro','1')")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))  # series/calendar need a database; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
        for k,s in CHECK.items(): print(("OK  " if await pg.query_selector(s) else "MISSING ")+k)
        await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(600)
        try: await pg.wait_for_selector("#gSeriesFull .sr-new, #gSeriesFull .hint", timeout=4000)  # series render after the db promise resolves
        except Exception: pass
        for ph,cards in GCHECK.items():
            await pg.evaluate(f"goPhase('{ph}')"); await pg.wait_for_timeout(500)
            for k,s in cards.items(): print(("OK  " if await pg.query_selector(s) else "MISSING ")+ph+": "+k)
        print("ERR", errs); await b.close()
asyncio.run(main())
