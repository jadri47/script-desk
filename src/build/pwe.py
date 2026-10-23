SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n,theme in [(390,844,"m","light"),(1100,900,"d","dark")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-theme','{theme}');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            async def fn(route):
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":{"idea":"Dios cuida del mañana."},"usage":{"cost_usd":0.002,"month_cost_usd":0.05,"model_name":"Sonnet 5.5","input_tokens":900,"output_tokens":40}}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(700)
            for t,d in [("Qué dice la Biblia sobre la ansiedad","2026-10-10"),("El Salmo 23","2026-10-24"),("El perdón","")]:
                await pg.evaluate(f"planEpisode({json.dumps(t)}, {json.dumps(d)})")
            await pg.wait_for_timeout(300)
            print(n, "step1 has old calendar:", await pg.evaluate("!!$('gSeries')"), "| strip:", (await pg.inner_text("#epStrip")).replace("\n"," / "))
            await pg.screenshot(path=OUT+f"s1_{n}.png")
            await pg.click("#epBtn"); await pg.wait_for_timeout(400)
            print(n, "sheet rows:", await pg.evaluate("document.querySelectorAll('#epList .ep-row').length"), "| metas:", await pg.evaluate("[...document.querySelectorAll('#epList .ep-meta')].map(x=>x.textContent.trim()).join(' | ')"))
            print(n, "help in sheet:", await pg.evaluate("!!document.querySelector('#epList .g-h [data-qh], #epList .g-h + * , #epList .qh')"))
            await pg.screenshot(path=OUT+f"sheet_{n}.png")
            # change date of El perdón
            await pg.click("#epList .ep-row:last-child [data-sredit]"); await pg.wait_for_timeout(200)
            await pg.fill("#epList [data-srdate]", "2026-11-07"); await pg.click("#epList [data-srsave]"); await pg.wait_for_timeout(400)
            print(n, "after date change:", await pg.evaluate("[...document.querySelectorAll('#epList .ep-main b')].map(x=>x.textContent).join(' | ')"))
            # add
            await pg.click("#epList-a"); await pg.wait_for_timeout(200)
            await pg.fill("#epList-t", "la oración"); await pg.click("#epList-p"); await pg.wait_for_timeout(500)
            print(n, "after add rows:", await pg.evaluate("[...document.querySelectorAll('#epList .ep-main b')].map(x=>x.textContent).join(' | ')"))
            # open Salmo 23
            await pg.click("#epList .ep-row:has-text('El Salmo 23') .ep-open"); await pg.wait_for_timeout(700)
            print(n, "sheet closed:", not await pg.evaluate("$('epSheet').open"), "| strip:", (await pg.inner_text("#epStrip")).replace("\n"," / "))
            # write, review, go to step 3 «Después de grabar» (was step 5)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            await pg.evaluate("G.nextEp='el Salmo 91'; setStatus('grabado')"); await pg.wait_for_timeout(300)
            await pg.evaluate("goStep(3)"); await pg.evaluate("document.getElementById('gAfter').open=true"); await pg.wait_for_timeout(500)  # old step 5 = «Después de grabar» in step 3
            print(n, "step5 plan:", (await pg.inner_text("#gNextPlan"))[:160].replace("\n"," / "))
            el = await pg.query_selector("#gNextPlan"); await el.screenshot(path=OUT+f"np_{n}.png")
            await pg.click("#npGo"); await pg.wait_for_timeout(600)
            print(n, "after plan:", (await pg.inner_text("#gNextPlan")).replace("\n"," / ")[:160])
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
