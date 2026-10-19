import asyncio, json
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read()
JS = """() => { const out=[]; const vis=(e)=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
const anc=(e)=>{let p=e; while(p&&!p.id) p=p.parentElement; return p?p.id:'';};
document.querySelectorAll('label,h2,h3,h4,legend,summary,.g-card > h3, .k').forEach(e=>{ if(!vis(e)) return; const tx=(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,70); if(!tx) return; out.push([e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ')[0]:''), anc(e), e.getAttribute('for')||'', tx]); });
document.querySelectorAll('input,select,textarea').forEach(e=>{ if(!vis(e)) return; const has = e.id && document.querySelector('label[for="'+e.id+'"]') || e.closest('label'); if(!has) out.push(['UNLABELED-'+e.tagName.toLowerCase(), anc(e), e.id, e.placeholder||e.getAttribute('aria-label')||e.type]); });
return out; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); res={}
        pg = await b.new_page(viewport={"width":1100,"height":900}); await pg.add_init_script(MOCK)
        await pg.goto("file:///home/claude/sd/build/work.html"); await pg.wait_for_timeout(300)
        res["g1"] = await pg.evaluate(JS)
        await pg.fill("#script", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(900)
        for n in [2,3,4,5]:
            await pg.evaluate(f"goStep({n})"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
            res[f"g{n}"] = await pg.evaluate(JS)
        await pg.click("#expertToggle"); await pg.wait_for_timeout(500)
        await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
        res["full_review"] = await pg.evaluate(JS)
        await pg.evaluate("setMode('guion')"); await pg.wait_for_timeout(600)
        await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
        res["full_guion"] = await pg.evaluate(JS)
        json.dump(res, open("inv.json","w"), ensure_ascii=False, indent=0)
        await b.close()
asyncio.run(main())
