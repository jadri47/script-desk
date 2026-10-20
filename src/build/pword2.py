SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, hh, n in [(390, 844, "m")]:
            pg = await b.new_page(viewport={"width": w, "height": hh})
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(800)
            await pg.click("#exPick summary"); await pg.click("#exPick [data-ex=good]"); await pg.wait_for_timeout(2000); await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(1500)
            rows = await pg.evaluate("""(()=>{
              const out=[]; const seen=new Set();
              const walk=(root,depth)=>{ for (const el of root.children){ if(!(el instanceof HTMLElement)) continue; const r=el.getBoundingClientRect(); const h=Math.round(el.offsetHeight); if(h<24||el.hidden||getComputedStyle(el).display==='none') continue;
                 const id=el.id?'#'+el.id:''; const cls=(el.className&&typeof el.className==='string')?'.'+el.className.trim().split(/\\s+/).slice(0,2).join('.'):'';
                 const txt=(el.querySelector('h1,h2,h3,summary,.mt,.k,label')||el).textContent.trim().replace(/\\s+/g,' ').slice(0,60);
                 if(depth<=2 && h>=40){ out.push({top:Math.round(r.top+scrollY), h, d:depth, sel:el.tagName.toLowerCase()+id+cls, txt}); }
                 if(depth<2) walk(el,depth+1); } };
              walk(document.querySelector('#phPane'),0);
              return out.sort((a,b)=>a.top-b.top);
            })()""")
            print("==", n, "viewport", w)
            for r in rows: print(f"{r['top']:6} {r['h']:5}  {'  '*r['d']}{r['sel'][:60]:60} | {r['txt']}")
            await pg.screenshot(path=OUT + f"order_guion_{n}.png", full_page=True)
            await pg.close()
        await b.close()
asyncio.run(main())
