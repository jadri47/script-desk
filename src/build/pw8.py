SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read()
MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(1100,900,"d"),(390,844,"m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); await pg.add_init_script(MOCK); pg.on("pageerror", lambda e: errs.append(str(e.stack)[:400]))
            await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(400)
            # plan two episodes
            await pg.fill("#gSeries-t", "Qué dice la Biblia sobre la ansiedad"); await pg.fill("#gSeries-d", "2026-10-20"); await pg.click("#gSeries-p"); await pg.wait_for_timeout(300)
            await pg.fill("#gSeries-t", "El perdón"); await pg.click("#gSeries-p"); await pg.wait_for_timeout(300)
            print(n, "series:", (await pg.inner_text("#gSeries .sr-list")).replace("\n"," | ")[:200])
            await pg.screenshot(path=f"sr_{n}_1.png", full_page=True)
            await pg.click("#gSeries [data-sropen] >> nth=0"); await pg.wait_for_timeout(400)
            print(n, "opened step:", await pg.evaluate("V.step+' prod='+G.prodId+' text='+$('script').value.length"))
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(600)
            await pg.click(".g-nav-steps [data-step='3']"); await pg.wait_for_timeout(500)
            await pg.fill("#tpNext", "el Salmo 23"); await pg.dispatch_event("#tpNext", "change")
            await pg.fill("#tpTopic", "ansiedad"); await pg.dispatch_event("#tpTopic", "change"); await pg.wait_for_timeout(500)
            await (await pg.query_selector("#gTopic")).screenshot(path=f"sr_{n}_topic.png")
            print(n, "kw:", await pg.evaluate("state.result.keyword"), "nextEp:", await pg.evaluate("G.nextEp"))
            await pg.wait_for_timeout(2600)
            print(n, "saved nextEp in db:", await pg.evaluate("Object.values(__store.producciones).map(d=>d.title+':'+(d.nextEp||'-')+':'+d.pubDate).join(' | ')"))
            # ending fix proposal uses nextEp: craft text w/o closing
            await pg.click("#stepBar [data-step='1']"); await pg.wait_for_timeout(300)
            print(n, "plan-next button:", await pg.evaluate("[...document.querySelectorAll('[data-srnext]')].map(b=>b.textContent).join(',')"))
            await pg.click("#gBackup-dl"); await pg.wait_for_timeout(300)
            dl = await pg.evaluate("__dl.length ? JSON.parse(__dl[0].data) : null")
            print(n, "backup:", dl and {k: len(v) for k, v in dl["collections"].items()})
            await pg.evaluate("for (const k in __store) delete __store[k]")
            await pg.set_input_files("#gBackup-up", files=[{"name":"b.json","mimeType":"application/json","buffer": json.dumps(dl).encode()}]); await pg.wait_for_timeout(200)
            print(n, "confirm:", await pg.inner_text("#gBackup-confirm"))
            await pg.click("#gBackup-yes"); await pg.wait_for_timeout(500)
            print(n, "restore:", await pg.inner_text("#gBackup-msg"), await pg.evaluate("Object.keys(__store.producciones||{}).length"))
            await pg.click("#expertToggle"); await pg.wait_for_timeout(400)
            print(n, "full-mode series rows:", await pg.evaluate("document.querySelectorAll('#gSeriesFull .sr-list li').length"), "backup card:", await pg.is_visible("#gBackupFull-dl"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
