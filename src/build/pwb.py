import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = "file:///home/claude/sd/standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n,theme in [(390,844,"m","dark"),(1100,900,"d","light")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-theme','{theme}');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            seen = []
            async def fn(route):
                pr = json.loads(route.request.post_data)["prompt"]; seen.append(pr)
                u = {"model":"claude-sonnet-5-5","model_name":"Sonnet 5.5","input_tokens":3000,"output_tokens":400,"cost_usd":0.01,"month_cost_usd":0.1}
                if '{"idea": "frase"}' in pr: data = {"idea": "Jesús nos invita a vivir hoy confiando en el Padre."}
                elif '"script": "guion completo"' in pr: data = {"script": LONG.replace("Hoy veremos","Hoy vamos a ver"), "title":"","thumb":"","description":"","keyword":"","bigIdea":"","nextEp":"","verify":["Mateo 6:34"],"notes":""}
                else: data = {"reply":"ok","replacement":None}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":data,"usage":u}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(600)
            print(n, "versions:", await pg.evaluate("[...$('translation').options].map(o=>o.value).join(',')"))
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.wait_for_timeout(700)
            print(n, "hint es/RVR:", await pg.inner_text("#bibleHint"))
            await pg.select_option("#translation","NASB"); await pg.wait_for_timeout(200)
            print(n, "hint es/NASB:", await pg.inner_text("#bibleHint"), "| cls:", await pg.get_attribute("#bibleHint","class"))
            await pg.select_option("#translation","LBLA")
            await pg.screenshot(path=f"bible_{n}.png", full_page=False)
            el = await pg.query_selector(".vr-row"); await el.screenshot(path=f"vr_{n}.png")
            await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
            idea_pr = [x for x in seen if '{"idea": "frase"}' in x]
            print(n, "idea prompt has rule LBLA:", bool(idea_pr) and "La Biblia de las Américas" in idea_pr[-1])
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            print(n, "trVer opts (en):", await pg.evaluate("[...$('trVer').options].map(o=>o.value).join(',')"), "sel", await pg.evaluate("$('trVer').value"))
            await pg.select_option("#trTarget","es"); await pg.wait_for_timeout(200)
            print(n, "trVer after es target:", await pg.evaluate("$('trVer').value"))
            await pg.select_option("#trVer","NVI"); await pg.click("#trGo"); await pg.wait_for_timeout(900)
            pr = seen[-1]; print(n, "es prompt: NVI swap", "Nueva Versión Internacional" in pr and "Sustituye cada cita" in pr, "| no global rule:", "VERSIÓN BÍBLICA:" not in pr)
            print(n, "verify link:", await pg.evaluate("document.querySelector('.tr-out a').href"))
            el = await pg.query_selector("#trBox"); await el.screenshot(path=f"trv_{n}.png")
            await pg.click("#trUse"); await pg.wait_for_timeout(400)
            print(n, "after use translation:", await pg.evaluate("$('translation').value"), "aud", await pg.evaluate("$('audience').value"))
            # same variant same version -> error
            await pg.select_option("#trTarget","es"); await pg.select_option("#trVer","NVI"); await pg.click("#trGo"); await pg.wait_for_timeout(300)
            print(n, "same msg:", await pg.inner_text("#trSt"))
            # to english NASB
            await pg.select_option("#trTarget","en"); await pg.wait_for_timeout(100)
            print(n, "en default ver:", await pg.evaluate("$('trVer').value"))
            await pg.select_option("#trVer","NASB"); await pg.click("#trGo"); await pg.wait_for_timeout(900)
            print(n, "en prompt NASB:", "New American Standard Bible" in seen[-1])
            await pg.click("#trUse"); await pg.wait_for_timeout(400)
            print(n, "after en:", await pg.evaluate("$('translation').value"), await pg.evaluate("$('lang').value"))
            await pg.evaluate("$('lang').value='es'; $('lang').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(100)
            print(n, "lang->es auto version:", await pg.evaluate("$('translation').value"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
