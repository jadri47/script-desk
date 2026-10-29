SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = SDU+"standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(390,844,"m"),(1100,900,"d")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-more-open','1'); localStorage.setItem('sd-coach-off','1')")  # the Ask card is built only while step 2's «Más detalles» is open
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            seen = {}
            async def fn(route):
                body = json.loads(route.request.post_data)
                if 'FRAGMENTO:' not in body["prompt"] and '{"idea": "frase"}' not in body["prompt"]:  # the editor's report now runs by itself on the first review (2026-10-22): it is not part of this test, so it fails and the Ask card is still tested
                    await route.fulfill(status=500, content_type="application/json", body="{}"); return
                seen["tier"]=body["tier"]; seen["prompt"]=body["prompt"]
                pr = body["prompt"]
                if '{"idea": "frase"}' in pr:
                    await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":{"idea":"Dios cuida del mañana."},"usage":{"cost_usd":0.002,"month_cost_usd":0.05,"model_name":"Sonnet 5.5","input_tokens":900,"output_tokens":40}})); return
                seen["tier"]=body["tier"]; seen["prompt"]=pr
                frag = pr.split('FRAGMENTO:\n"""\n')[1].split('\n"""')[0]
                if "¿Suena natural" in pr:
                    data = {"reply":"Sí, suena natural; solo acortaría la segunda frase.","replacement":None}
                else:
                    data = {"reply":"Lo hice más cercano, hablando directamente al oyente.","replacement": "Quizá hoy sientes que el mañana te pesa. " + frag}
                usage={"model":"claude-sonnet-5-5","model_name":"Sonnet 5.5","input_tokens":4100,"output_tokens":320,"cost_usd":0.0114,"month_cost_usd":0.05}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":data,"usage":usage}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(500)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
            print(n, "step:", await pg.evaluate("V.step"), "| ask card:", await pg.evaluate("!!$('askClaude')"), "| options:", await pg.evaluate("$('askTarget').options.length"))
            await pg.select_option("#askTarget", "2"); await pg.wait_for_timeout(200)
            await pg.click("[data-askchip] >> nth=0"); await pg.click("#askGo"); await pg.wait_for_timeout(900)
            print(n, "tier:", seen.get("tier"), "| prompt has context:", "CONTEXTO" in seen.get("prompt",""), "| voice:", "español neutro" in seen.get("prompt",""))
            print(n, "reply:", (await pg.inner_text(".ask-ans"))[:160].replace("\n"," | "))
            el = await pg.query_selector("#askClaude"); await el.screenshot(path=f"ask_{n}.png")
            before = await pg.evaluate("$('script').value")
            await pg.click("#askApply"); await pg.wait_for_timeout(700)
            after = await pg.evaluate("$('script').value")
            print(n, "applied:", "Quizá hoy sientes" in after and "Quizá hoy sientes" not in before, "| len diff:", len(after)-len(before), "| applied msg:", await pg.evaluate("(document.querySelector('.ask-ans .status')||{}).textContent"))
            await pg.click("#fxUndo"); await pg.wait_for_timeout(600)
            print(n, "undo restores:", await pg.evaluate("$('script').value") == before)
            # advice only, whole script
            await pg.select_option("#askTarget", "all"); await pg.fill("#askQ", "¿Suena natural dicho en voz alta?"); await pg.click("#askGo"); await pg.wait_for_timeout(900)
            print(n, "advice:", (await pg.inner_text(".ask-ans"))[:140].replace("\n"," | "), "| tier:", seen["tier"])
            # full mode placement
            pg.once("dialog", lambda d: asyncio.ensure_future(d.accept()))
            await pg.click("#moreBtn"); await pg.click("#expertToggle"); await pg.wait_for_timeout(600)
            print(n, "full mode card after topfix:", await pg.evaluate("(()=>{const a=$('askClaude'); return !!a && a.previousElementSibling && a.previousElementSibling.classList.contains('topfix')})()"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
