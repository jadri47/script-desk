SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = __import__("os").path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; __import__("os").makedirs(OUT, exist_ok=True)  # screenshots; folder exists on every OS
JS = """(()=>{const m=document.querySelector('.masthead');const sel=['h1','.xswitch','#stepBar','#exPick','#authBar:not([hidden])','.themebtn','.langswitch'];
const out=[];for(const s of sel){const e=m.querySelector(s);if(!e)continue;const b=e.getBoundingClientRect();if(!b.height)continue;out.push([s,Math.round(b.top+b.height/2),Math.round(b.left),Math.round(b.right)])}
const cy=out.map(o=>o[1]);const mr=m.getBoundingClientRect();return {spread:Math.max(...cy)-Math.min(...cy),over:out.filter(o=>o[3]>mr.right+1).map(o=>o[0]),hs:document.documentElement.scrollWidth>innerWidth,steps:[...m.querySelectorAll('.sb button')].every(b=>b.getBoundingClientRect().width>20)}})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); bad = 0
        for w in [900, 1024, 1180, 1280, 1366, 1440, 1600, 1854, 1920]:
            for mode, demo, ui in [("guest", True, "es"), ("guest", True, "en"), ("guest", False, "es"), ("member", True, "es"), ("member", True, "en"), ("guest", False, "en")]:
                pg = await b.new_page(viewport={"width": w, "height": 900})
                await pg.add_init_script(f"window.__SB_MODE='{mode}'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.goto(URL); await pg.wait_for_timeout(600)
                if demo: await pg.evaluate("startDemo('bad')"); await pg.wait_for_timeout(900)
                r = await pg.evaluate(JS); ok = r["spread"] <= 12 and not r["over"] and not r["hs"] and r["steps"]
                if not ok: bad += 1
                print(w, mode, ui, "OK" if ok else "FAIL", r if not ok else "")
                if w in (1180, 1920) and demo and ui == "es": await pg.screenshot(path=OUT + f"hw_{w}.png", clip={"x":0,"y":0,"width":w,"height":260})
                await pg.close()
        print("BAD:", bad); await b.close()
asyncio.run(main())
