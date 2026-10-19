import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = "file:///home/claude/sd/standalone/site/index.html"
TEXT = """¿Alguna vez has sentido que la tormenta no termina? Hoy vamos a ver qué dice la Biblia sobre la fe.

## Dios cuida
En el Salmo 23:1 leemos «Jehová es mi pastor; nada me faltará.» Eso cambia cómo oramos. En Juan 3:99 leemos «Porque de tal manera amó Dios al mundo.» Y en Romanos 8:28 leemos «Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.» También Juan 3 completo nos enseña mucho.
"""
BIB = {"PSA|23|1|": "Jehová es mi pastor; nada me faltará.", "ROM|8|28|": "Y sabemos que a los que aman á Dios, todas las cosas les ayudan á bien, es á saber, á los que conforme al propósito son llamados."}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []; reqs = []
        for mode in ["ok", "auth"]:
            pg = await b.new_page(viewport={"width": 390, "height": 844}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1'); localStorage.removeItem('sd-phase')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            async def fums(route):
                reqs.append(route.request.url); await route.fulfill(status=200, body="")
            await pg.route("https://fums.api.bible/**", fums)
            async def fn(route):
                body = json.loads(route.request.post_data); reqs.append(("sd-bible", body))
                if mode == "auth": return await route.fulfill(status=502, content_type="application/json", body=json.dumps({"code": "bible_auth"}))
                res = []
                for r in body["refs"]:
                    k = f'{r["code"]}|{r["chapter"]}|{r["verse"]}|{r.get("verseEnd") or ""}'
                    if k in BIB: res.append({**r, "status": "ok", "text": BIB[k], "fums": "tok_" + r["code"]})
                    else: res.append({**r, "status": "missing"})
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"bible": "x", "results": res}))
            await pg.route("**/functions/v1/sd-bible", fn)
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT)
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(900)
            await pg.evaluate("document.querySelector('#sec-scripture').open=true")
            print(mode, "button:", await pg.evaluate("(document.querySelector('[data-vcheck]')||{}).textContent"))
            await pg.click("[data-vcheck]"); await pg.wait_for_timeout(900)
            print(mode, "status:", await pg.evaluate("(document.getElementById('vc-st')||{}).textContent"))
            print(mode, "rows:", await pg.evaluate("[...document.querySelectorAll('#vc-out .row')].map(r=>r.innerText.replace(/\\n+/g,' | ').slice(0,260))"))
            if mode == "ok":
                await pg.evaluate("document.getElementById('setDet').open=true"); await pg.select_option("#translation", "RVR1909"); await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(700)
                await pg.evaluate("document.querySelector('#sec-scripture').open=true")
                await pg.click("[data-vcheck]"); await pg.wait_for_timeout(800)
                print("1909 rows:", await pg.evaluate("[...document.querySelectorAll('#vc-out .row')].map(r=>r.innerText.replace(/\\n+/g,' | ').slice(0,300))"))
                print("ins marks:", await pg.evaluate("[...document.querySelectorAll('#vc-out ins')].map(e=>e.textContent)"))
                el = await pg.query_selector('#vc'); await el.screenshot(path="/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/vc.png")
            await pg.close()
        print("requests:", [r if isinstance(r, str) else (r[0], len(r[1]["refs"]), [x["code"] for x in r[1]["refs"]]) for r in reqs])
        print("page errors:", errs); await b.close()
asyncio.run(main())
