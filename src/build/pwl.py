SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
EN = json.load(open("examples.json"))["en"]["good"]["text"]
URL = SDU+"standalone/site/index.html"
async def toggle_expert(pg):  # «Modo completo» lives in the ⋯ menu (2026-10-26); it asks to confirm
    await pg.evaluate("if ($('moreMenu').hidden) $('moreBtn').click()"); await pg.click("#expertToggle"); await pg.wait_for_timeout(700)
async def full_view(pg, w, hh):
    # The idea box inside a fix card (message_ui.js) lives in the full mode's plain top-fix list. From 900 px the full view is the split view with the paragraph walker (no idea card), so go below that width.
    await pg.set_viewport_size({"width": min(w, 800), "height": hh}); await toggle_expert(pg)
    await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(400)
async def guided_view(pg, w, hh):
    await toggle_expert(pg); await pg.set_viewport_size({"width": w, "height": hh}); await pg.wait_for_timeout(300)
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
            pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("if (!V.s1More) $('s1MoreBtn').click(); $('setDet').open = true"); await pg.wait_for_timeout(200)  # the variant select is in step 1's «Más opciones», inside the closed #setDet
            print(n, "variant options:", await pg.evaluate("[...$('audience').options].map(o=>o.textContent).join(' | ')"))
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
            await full_view(pg, w, hh); await pg.click("li.fx-idea .fx-top"); await pg.wait_for_timeout(200)  # full-mode fix cards start collapsed: open the idea card
            print(n, "idea inline prefilled:", await pg.evaluate("($('ideaInline')||{}).value"), "| buttons:", await pg.evaluate("[...document.querySelectorAll('.idea-inline button')].map(b=>b.textContent).join('/')"))
            await pg.screenshot(path=f"idea_{n}.png")
            await pg.click("#ideaInlineSave"); await pg.wait_for_timeout(800)
            print(n, "confirmed idea:", (await pg.evaluate("$('bigIdea').value"))[:40], "| bigidea card:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).filter(x=>/idea/i.test(x)).join('')"))
            await guided_view(pg, w, hh)
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(400)
            await pg.evaluate("if ($('trToggle').getAttribute('aria-expanded') !== 'true') $('trToggle').click()"); await pg.wait_for_timeout(300)  # the translate box is folded behind #trToggle in step 1
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
            # #bigIdea is inside the closed #setDet in guided step 1: set it directly
            await pg.click("#clearBtn"); await pg.click("#clrYes"); await pg.wait_for_timeout(300)  # «Borrar guion» asks first, in a popup (editor_ui.js)
            await pg.evaluate("$('bigIdea').value = ''"); await pg.evaluate("$('bigIdea').dispatchEvent(new Event('input'))")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG.replace("ansiedad","preocupación")); await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
            await full_view(pg, w, hh); await pg.click("li.fx-idea .fx-top"); await pg.wait_for_timeout(200)
            ign = await pg.query_selector(".idea-inline [data-ideano]")
            if ign: await ign.click(); await pg.wait_for_timeout(600)
            print(n, "after ignore, idea card:", await pg.evaluate("[...document.querySelectorAll('li.fx .tf-t')].map(x=>x.textContent).filter(x=>/idea central/i.test(x)).length"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
