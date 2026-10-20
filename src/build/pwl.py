SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
EN = json.load(open("examples.json"))["en"]["good"]["text"]
URL = SDU+"standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n in [(390,844,"m"),(1100,900,"d")]:
            pg = await b.new_page(viewport={"width":w,"height":hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            seen = []
            async def fn(route):
                pr = json.loads(route.request.post_data)["prompt"]; seen.append(pr)
                u = {"model":"claude-sonnet-5-5","model_name":"Sonnet 5.5","input_tokens":3000,"output_tokens":400,"cost_usd":0.01,"month_cost_usd":0.1}
                if '{"idea": "frase"}' in pr:
                    data = {"idea": "Jesús no condena la ansiedad: nos invita a vivir hoy confiando en el Padre."}
                elif '"script": "guion completo"' in pr:
                    if "inglés de EE. UU." in pr:
                        data = {"script": EN, "title":"What does the Bible say about anxiety?","thumb":"","description":"","keyword":"anxiety","bigIdea":"Jesus invites us to live today trusting the Father.","nextEp":"Psalm 23","verify":["Matthew 6:34","Philippians 4:6-7"],"notes":"Used KJV for quotes."}
                    else:
                        script = route.request and LONG.replace("Hoy veremos","Hoy vais a ver").replace("habla con tu médico","hablad con vuestro médico")
                        data = {"script": script, "title":"","thumb":"","description":"","keyword":"ansiedad","bigIdea":"Jesús no condena la ansiedad.","nextEp":"","verify":[],"notes":"Cambié ustedes por vosotros."}
                else:
                    data = {"reply":"ok","replacement":None}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":data,"usage":u}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(600)
            print(n, "variant options:", await pg.evaluate("[...$('audience').options].map(o=>o.textContent).join(' | ')"))
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
            print(n, "idea inline prefilled:", await pg.evaluate("($('ideaInline')||{}).value"), "| buttons:", await pg.evaluate("[...document.querySelectorAll('.idea-inline button')].map(b=>b.textContent).join('/')"))
            await pg.screenshot(path=f"idea_{n}.png")
            await pg.click("#ideaInlineSave"); await pg.wait_for_timeout(800)
            print(n, "confirmed idea:", (await pg.evaluate("$('bigIdea').value"))[:40], "| bigidea card:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).filter(x=>/idea/i.test(x)).join('')"))
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(400)
            # translate to Spain
            print(n, "tr source label:", await pg.evaluate("document.querySelector('.tr-ctl .hint').textContent"), "| targets:", await pg.evaluate("[...$('trTarget').options].map(o=>o.value).join(',')"))
            await pg.select_option("#trTarget","es"); await pg.click("#trGo"); await pg.wait_for_timeout(900)
            pr = seen[-1]; print(n, "es prompt ok:", "vosotros" in pr and "palabra por palabra" in pr and "español de España" in pr)
            await pg.click("#trUse"); await pg.wait_for_timeout(500)
            print(n, "after use: audience", await pg.evaluate("$('audience').value"), "| text changed:", await pg.evaluate("$('script').value.includes('Hoy vais a ver')"), "| msg:", (await pg.inner_text("#trSt"))[:50])
            await pg.click("#trUndo"); await pg.wait_for_timeout(400)
            print(n, "undo: audience", await pg.evaluate("$('audience').value"), "| text back:", await pg.evaluate("!$('script').value.includes('Hoy vais a ver')"))
            # translate to English
            await pg.select_option("#trTarget","en"); await pg.click("#trGo"); await pg.wait_for_timeout(900)
            pr = seen[-1]; print(n, "en prompt ok:", "KJV" in pr and "verify" in pr)
            print(n, "verify links:", await pg.evaluate("document.querySelectorAll('.tr-out a').length"))
            el = await pg.query_selector("#trBox"); await el.screenshot(path=f"tr_{n}.png")
            await pg.click("#trUse"); await pg.wait_for_timeout(500)
            print(n, "after en: lang", await pg.evaluate("$('lang').value"), "translation", await pg.evaluate("$('translation').value"), "| next source:", await pg.evaluate("document.querySelector('.tr-ctl .hint').textContent"))
            # ignore flow on a fresh text
            await pg.click("#clearBtn"); await pg.fill("#bigIdea",""); await pg.evaluate("$('bigIdea').dispatchEvent(new Event('input'))")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG.replace("ansiedad","preocupación")); await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
            ign = await pg.query_selector(".idea-inline [data-ideano]")
            if ign: await ign.click(); await pg.wait_for_timeout(600)
            print(n, "after ignore, idea card:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).filter(x=>/idea central/i.test(x)).length"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
