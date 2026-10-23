SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
GDOCS = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><h2 dir="ltr"><span style="font-size:16pt;font-weight:400">Apertura</span></h2><p dir="ltr"><span style="font-weight:400">¿Te has sentido </span><span style="font-weight:700">tan cansado</span><span style="font-weight:400"> que ni orar puedes? Hoy veremos </span><span style="font-style:italic;font-weight:400">qué dice la Biblia</span><span style="font-weight:400"> sobre el </span><span style="text-decoration:underline;font-weight:400">descanso</span><span style="font-weight:400">.</span></p><ul><li dir="ltr"><p dir="ltr"><span style="font-weight:400">Primero, Jesús invita.</span></p></li><li dir="ltr"><p dir="ltr"><span style="background-color:#ffff00;font-weight:400">Segundo, Jesús carga.</span></p></li></ul><br><p dir="ltr"><span style="font-weight:400">[TEXTO: Mateo 11:28] «Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.»</span></p></b>'
WORD = '<html><body><p class=MsoNormal><b>Introducción</b></p><p class=MsoListParagraph style="mso-list:l0 level1 lfo1"><span style="font-family:Symbol">·<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>Uno <i>dos</i></p><p class=MsoListParagraph style="mso-list:l0 level1 lfo1"><span style="font-family:Symbol">·<span>&nbsp;&nbsp;&nbsp;&nbsp;</span></span>Tres</p></body></html>'
PASTE = "([html, plain]) => { const dt = new DataTransfer(); dt.setData('text/html', html); dt.setData('text/plain', plain); $('ed').focus(); $('ed').dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true})); }"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,hh,n,theme in [(390,844,"m","dark"),(1100,900,"d","light")]:
            ctx = await b.new_context(viewport={"width":w,"height":hh})
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-theme','{theme}');")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            async def fn(route):
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":{"idea":"Jesús da descanso."},"usage":{"cost_usd":0.002,"month_cost_usd":0.05,"model_name":"Sonnet 5.5","input_tokens":900,"output_tokens":40}}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.screenshot(path=OUT+f"ed_empty_{n}.png")
            # typing with shortcuts
            await pg.click("#ed")
            await pg.keyboard.type("## Apertura"); await pg.keyboard.press("Enter")
            await pg.keyboard.type("Hoy hablamos de ")
            await pg.keyboard.press("Control+b"); await pg.keyboard.type("la paz"); await pg.keyboard.press("Control+b")
            await pg.keyboard.type(" de Dios."); await pg.keyboard.press("Enter")
            await pg.keyboard.type("- Primera idea"); await pg.keyboard.press("Enter"); await pg.keyboard.type("Segunda idea")
            await pg.keyboard.press("Enter"); await pg.keyboard.press("Enter"); await pg.keyboard.type("Cierre.")
            await pg.wait_for_timeout(400)
            print(n, "typed text:", json.dumps(await pg.evaluate("$('script').value"), ensure_ascii=False))
            print(n, "marks:", await pg.evaluate("JSON.stringify(FMT.marks)"), "| h2:", await pg.evaluate("document.querySelectorAll('#ed h2').length"), "ul li:", await pg.evaluate("document.querySelectorAll('#ed ul li').length"))
            # clear and paste Google Docs
            await pg.evaluate("$('script').value=''"); await pg.wait_for_timeout(100)
            await pg.evaluate(PASTE, [GDOCS, "plain"]); await pg.wait_for_timeout(300)
            print(n, "gdocs text:", json.dumps(await pg.evaluate("$('script').value"), ensure_ascii=False))
            print(n, "gdocs marks:", await pg.evaluate("JSON.stringify(FMT.marks.map(([a,b,k])=>[k,$('script').value.slice(a,b)]))"))
            await pg.evaluate("$('script').value=''")
            await pg.evaluate(PASTE, [WORD, "plain"]); await pg.wait_for_timeout(300)
            print(n, "word text:", json.dumps(await pg.evaluate("$('script').value"), ensure_ascii=False), await pg.evaluate("JSON.stringify(FMT.marks)"))
            # long script with formatting, autosave
            await pg.evaluate("$('script').value=''")
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG.strip())
            print(n, "round trip identical:", await pg.evaluate("domToModel($('ed')).text === $('script').value"))
            # bold "ansiedad" first occurrence via selection
            await pg.evaluate("""()=>{const w=document.createTreeWalker($('ed'),NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const i=n.nodeValue.indexOf('ansiedad');if(i>=0){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+8);const s=getSelection();s.removeAllRanges();s.addRange(r);break;}}}""")
            if w<600: await pg.evaluate("setFull(true)"); await pg.wait_for_timeout(300)
            await pg.click('[data-ed="b"]'); await pg.click('[data-ed="h"]'); await pg.wait_for_timeout(2600)
            v = await pg.evaluate("$('script').value"); L2 = LONG.strip()
            if v != L2:
                i = next((k for k in range(min(len(v),len(L2))) if v[k]!=L2[k]), min(len(v),len(L2))); print(n, "DIFF at", i, repr(v[i-30:i+30]), "||", repr(L2[i-30:i+30]))
            print(n, "same as LONG:", v == L2, "| marks:", await pg.evaluate("JSON.stringify(FMT.marks.map(([a,b,k])=>[k,$('script').value.slice(a,b)]))"))
            print(n, "autosaved prod:", await pg.evaluate("!!G.prodId"), "| status:", await pg.inner_text("#edSave"))
            await pg.wait_for_timeout(2500)
            print(n, "status after save:", await pg.inner_text("#edSave"))
            await pg.screenshot(path=OUT+f"ed_full_{n}.png")
            # remap: programmatic insert at start
            await pg.evaluate("$('script').value = 'Una frase nueva al principio. ' + $('script').value")
            print(n, "after insert marks:", await pg.evaluate("JSON.stringify(FMT.marks.map(([a,b,k])=>[k,$('script').value.slice(a,b)]))"), "| rendered strong:", await pg.evaluate("document.querySelector('#ed strong')?.textContent"))
            # reload keeps formatting
            rows = await pg.evaluate("JSON.stringify(window.__rows)")
            await pg.add_init_script("window.__rows = " + rows + ";")
            await pg.reload(); await pg.wait_for_timeout(3500)
            print(n, "after reload strong:", await pg.evaluate("document.querySelector('#ed strong')?.textContent"), "| prod:", await pg.evaluate("!!G.prodId"))
            # prompter shows formatting
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(800)
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(500)
            print(n, "prompter strong:", await pg.evaluate("document.querySelector('#pp strong')?.textContent"), "mark:", await pg.evaluate("document.querySelector('#pp mark')?.textContent"))
            await pg.keyboard.press("Escape"); await pg.evaluate("document.getElementById('pp') && document.querySelector('[data-pp=exit]').click()")
            await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
            await pg.click('[data-ed="full"]'); await pg.wait_for_timeout(300)
            print(n, "fullscreen:", await pg.evaluate("document.querySelector('.ed-wrap').classList.contains('ed-full')"))
            await pg.screenshot(path=OUT+f"ed_focus_{n}.png")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            print(n, "after esc:", await pg.evaluate("document.querySelector('.ed-wrap').classList.contains('ed-full')"))
            await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=OUT+f"ed_s1_{n}.png")
            await ctx.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
