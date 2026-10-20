SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
LONG_T = "¿Qué dice la Biblia sobre el perdón cuando la herida viene de alguien de tu propia familia?"
LONG_K = "qué dice la biblia sobre perdonar a un familiar que te hirió profundamente"
CHECK = """ids => ids.map(id => { const e = document.getElementById(id); if (!e) return [id, 'absent'];
  return [id, e.tagName, e.offsetWidth ? (e.scrollHeight <= e.clientHeight + 1 ? 'fits' : 'CLIPPED ' + e.scrollHeight + '>' + e.clientHeight) : 'hidden', e.clientHeight]; })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w, hh, n in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(700)
            await pg.evaluate("document.getElementById('extraFields') && (document.getElementById('extraFields').open=true)"); await pg.wait_for_timeout(200)
            await pg.click("#title"); await pg.keyboard.type(LONG_T); await pg.keyboard.press("Enter")
            await pg.evaluate("v=>{ $('keyword').value = v; }", LONG_K)  # programmatic set
            await pg.click("#thumb"); await pg.keyboard.type("Perdonar duele")
            await pg.click("#series"); await pg.keyboard.type("Serie Familia · Ep. 4 · Perdón y reconciliación en casa")
            await pg.wait_for_timeout(300)
            print(n, "no newline in title:", await pg.evaluate("!/\\n/.test($('title').value)"), "| title value ok:", await pg.evaluate("$('title').value") == LONG_T)
            print(n, await pg.evaluate(CHECK, ["title", "keyword", "thumb", "series", "bigIdea", "description"]))
            el = await pg.query_selector('#extraFields'); await el.screenshot(path=OUT + f"as_{n}_fields.png")
            # analysis still sees the title (listeners intact)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", "¿Alguna vez te costó perdonar? Hoy vas a descubrir qué dice la Biblia sobre el perdón. " * 40)
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(900)
            print(n, "title row:", await pg.evaluate("(()=>{const r=(state.result.sections.seo||[]).find(r=>r.id==='title');return r?r.info.slice(0,120):'none'})()"))
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(900)
            print(n, "guion:", await pg.evaluate(CHECK, ["pkTitleIn", "pkThumbIn", "pkDescIn"]))
            el = await pg.query_selector('#pkTitleIn')
            if el:
                await el.scroll_into_view_if_needed(); box = await pg.query_selector('.pk-top')
                if box: await box.screenshot(path=OUT + f"as_{n}_pk.png")
            await pg.close()
        print("page errors:", errs); await b.close()
asyncio.run(main())
