SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); await pg.add_init_script(MOCK)
        await pg.goto(SDU+"build/work.html"); await pg.wait_for_timeout(300)
        keys = "s1Lead s2Lead s3Lead s4Lead s4Help s5Lead tpLead srLead bkLead coLead pkLead shLead rsLead escLead secLead revLead chLead aiLead moreTitle extraSum".split()
        print(json.dumps(await pg.evaluate("(ks)=>Object.fromEntries(ks.map(k=>[k,T.es[k]]))", keys), ensure_ascii=False, indent=1))
        print(await pg.evaluate("Object.keys(T.es).filter(k=>/lead|Lead|help|Help|info|Info/.test(k)).join(' ')"))
        await b.close()
asyncio.run(main())
