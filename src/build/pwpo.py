SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json, re
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
V1 = "«Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.»"
V2 = "«Jehová es mi pastor; nada me faltará.»"
TEXT = f"""¿Alguna vez has sentido que la tormenta no termina? Hoy vamos a ver qué dice la Biblia sobre la fé en medio de la prueba y de como Dios nos sostiene.

## Dios nos ama primero
Muchas veces pensamos que Dios esta lejos cuando sufrimos. Pero la Biblia dice lo contrario. En Juan 3:16 leemos {V1} Eso es lo que la gente no termina de entender. Es muy importante que lo entiendas hoy, porque cambia la manera en que oras y la manera en que descansas cada noche.

## Dios nos cuida
Cabe mencionar que esto nos enseña cosas muy interesantes. En el Salmo 23:1 leemos {V2} Cabe mencionar que Dios no se olvida de ti, ni de tu familia, ni de tus problemas de dinero, ni de tu salud, ni de lo que callas por las noches cuando nadie te escucha.

## Qué hacer esta semana
Así que ya sabes, enfréntate a tus gigantes con confianza. Escríbeme en los comentarios qué gigante estás enfrentando, suscríbete y comparte este video. Y nada, eso es todo por hoy, chao.
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []; seen = {"calls": []}
        for w, hh, n in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1'); localStorage.removeItem('sd-phase')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            async def fn(route):
                body = json.loads(route.request.post_data); pr = body["prompt"]; tier = body["tier"]
                leaked = ("nada me faltará" in pr) or ("no se pierda" in pr)
                seen["calls"].append((tier, leaked, "polish" if "SOLO sugerencias" in pr else "section" if "Reescribe SOLO la sección" in pr else "other"))
                usage = {"model": "claude-opus-5-5" if tier == "rewrite" else "claude-sonnet-5-5", "model_name": "Opus 5.5" if tier == "rewrite" else "Sonnet 5.5", "input_tokens": 3000, "output_tokens": 800, "cost_usd": 0.02, "month_cost_usd": 0.3}
                if "SOLO sugerencias" in pr:
                    data = {"suggestions": [
                        {"original": "la fé en medio de la prueba", "corrected": "la fe en medio de la prueba", "kind": "spelling", "reason": "«fe» no lleva tilde."},
                        {"original": "de como Dios nos sostiene", "corrected": "de cómo Dios nos sostiene", "kind": "grammar", "reason": "«cómo» interrogativo indirecto lleva tilde."},
                        {"original": "Dios esta lejos", "corrected": "Dios está lejos", "kind": "spelling", "reason": "Verbo estar lleva tilde."},
                        {"original": "nada me faltará", "corrected": "nada me faltaría", "kind": "word", "reason": "TRAMPA: dentro de un versículo."},
                        {"original": "Cabe mencionar que", "corrected": "Vale destacar que", "kind": "filler", "reason": "TRAMPA: aparece dos veces."},
                        {"original": "En Juan 3:16 leemos", "corrected": "En Juan 3:17 leemos", "kind": "word", "reason": "TRAMPA: cambia la referencia."},
                    ], "summary": "ok"}
                elif "Reescribe SOLO la sección" in pr:
                    sec = pr.split('SECCIÓN A REESCRIBIR:\n"""\n')[1].rsplit('\n"""', 1)[0]
                    o1 = sec.replace("Es muy importante que lo entiendas hoy", "Quiero que lo entiendas hoy").replace("esta lejos", "está lejos")
                    o2 = sec.replace("⟦V1⟧", "")  # TRAMPA: borra el versículo
                    data = {"options": [{"text": o1, "why": "Cambios mínimos."}, {"text": o2, "why": "TRAMPA: sin versículo."}]}
                else:
                    data = {"reply": "ok", "replacement": None}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data": data, "usage": usage}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT)
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(1000)
            # --- 1) polish ---
            await pg.click('[data-ai=rewrite]'); await pg.wait_for_timeout(1200)
            print(n, "polish call:", seen["calls"][-1])
            shown = await pg.evaluate("[...document.querySelectorAll('.pol-item .pol-diff')].map(e=>e.textContent)")
            print(n, "suggestions shown:", len(shown), shown)
            print(n, "drop note:", (await pg.evaluate("(document.querySelector('.pol-drop')||{}).textContent")))
            el = await pg.query_selector('#sec-ai'); await el.screenshot(path=OUT + f"po_{n}_list.png")
            before = await pg.evaluate("$('script').value")
            await pg.click("[data-pol-ok='0']"); await pg.wait_for_timeout(700)
            after = await pg.evaluate("$('script').value")
            print(n, "accepted one:", "la fe en medio" in after and "la fé en medio" not in after, "| verses intact:", V1 in after and V2 in after, "| list now:", await pg.evaluate("document.querySelectorAll('.pol-item').length"))
            await pg.click("[data-pol-all]"); await pg.wait_for_timeout(700)
            after2 = await pg.evaluate("$('script').value")
            print(n, "accepted all:", "cómo Dios" in after2 and "está lejos" in after2, "| verses intact:", V1 in after2 and V2 in after2, "| 'faltaría' absent:", "faltaría" not in after2, "| Juan 3:16 intact:", "Juan 3:16" in after2 and "3:17" not in after2)
            await pg.click("[data-pol-undo]"); await pg.wait_for_timeout(600)
            print(n, "undo -> text restored to an earlier step:", await pg.evaluate("$('script').value") != after2)
            # --- 2) section rewrite (Guion tab) ---
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT)
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(800)
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(900)
            nsec = await pg.evaluate("G.secs.length"); print(n, "sections:", nsec, [await pg.evaluate(f"G.secs[{i}].type") for i in range(nsec)])
            k = 2
            await pg.click(f"#gStruct [data-st='{k}']"); await pg.wait_for_timeout(600)
            await pg.click(f"#gs-{k} [data-secai]"); await pg.wait_for_timeout(1500)
            print(n, "section call:", seen["calls"][-1])
            print(n, "options shown:", await pg.evaluate(f"document.querySelectorAll('#gs-{k} .secai-opt').length"), "| out:", (await pg.evaluate(f"(document.querySelector('#gs-{k} .st-ai-out')||{{}}).innerText")).replace("\n"," | ")[:400])
            el = await pg.query_selector(f"#gs-{k}"); await el.screenshot(path=OUT + f"po_{n}_sec.png")
            pre = await pg.evaluate("$('script').value")
            await pg.click(f"#gs-{k} [data-secai-use]"); await pg.wait_for_timeout(900)
            post = await pg.evaluate("$('script').value")
            print(n, "section applied:", "Quiero que lo entiendas hoy" in post, "| verses intact:", V1 in post and V2 in post, "| other sections untouched:", post.split("## Dios nos cuida")[1] == pre.split("## Dios nos cuida")[1] and post.split("## Dios nos ama primero")[0] == pre.split("## Dios nos ama primero")[0])
            await pg.click(f"#gs-{k} [data-secai-undo]"); await pg.wait_for_timeout(700)
            print(n, "undo restores exactly:", await pg.evaluate("$('script').value") == pre)
            await pg.close()
        print("tiers/leaks (tier, verse_text_in_prompt, kind):", seen["calls"])
        print("page errors:", errs)
        await b.close()
asyncio.run(main())
