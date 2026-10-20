SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
CHECK = {"Revisión: veredicto": "#results .verdict", "Lo primero que arreglaría": "#results .topfix", "Línea de tiempo": "#results .timeline",
 "Tabla de monetización": "#sec-money table.pf", "Citas bíblicas + enlaces": "#sec-scripture", "Datos y hechos (IA)": "[data-ai=facts]",
 "Guion marcado": "#sec-manuscript", "Reescribir (IA)": "[data-ai=rewrite]", "Tres aperturas (IA)": "[data-ai=hooks]", "Títulos/descripción (IA)": "[data-ai=titles]",
 "Guardar versión": "#saveBtn", "Teleprompter .txt": "#tpBtn", "Revisión .md": "#mdBtn", "Historial/resultados": "#historyBlock",
 "Calendario (completo)": "#gSeriesFull .sr-new", "Copia (completo)": "#gBackupFull-dl"}
GCHECK = {"Producción/estado": "#gProdBar .g-status", "Apertura en frío": "#gCold .co-cols", "Escaleta": "#gEsc table", "Secciones": "#gSecs .gsec",
 "Tema y próximo": "#gTopic #tpNext", "Empaque": "#gPack #pkTitleIn", "Shorts": "#gShorts", "Resultados": "#gRes #rsImport", "Revisiones": "#gRev", "Prompter": "#gPP", "Ensayo": "#gReh", "Hoja editor": "#gSheet"}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1100,"height":900}); errs=[]
        await pg.add_init_script(MOCK); await pg.add_init_script("localStorage.setItem('sd-expert','1')"); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
        for k,s in CHECK.items(): print(("OK  " if await pg.query_selector(s) else "MISSING ")+k)
        await pg.click("[data-mode=guion]"); await pg.wait_for_timeout(600)
        for k,s in GCHECK.items(): print(("OK  " if await pg.query_selector(s) else "MISSING ")+k)
        print("ERR", errs); await b.close()
asyncio.run(main())
