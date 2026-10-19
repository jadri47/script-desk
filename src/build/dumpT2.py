import asyncio, json
from playwright.async_api import async_playwright
MOCK = open("mockclaude.js").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); await pg.add_init_script(MOCK)
        await pg.goto("file:///home/claude/sd/build/work.html"); await pg.wait_for_timeout(300)
        keys = "s4Pp s4Reh s4Sheet s4Done fxApply fxUndo fxSkip fxAi fxNotNow coAi pkAi rwTitle rewriteBtn seoRepeatLead seoWeakLead moreAdsLead scriptureLead factsLead leadMoney leadStructure leadAuth leadSeo historyLead approve statusLbl snapSave".split()
        print(json.dumps(await pg.evaluate("(ks)=>Object.fromEntries(ks.map(k=>[k,T.es[k]]))", keys), ensure_ascii=False, indent=1))
        print(await pg.evaluate("Object.keys(T.es).filter(k=>/^fx|^rw|rewrite/i.test(k)).join(' ')"))
        await b.close()
asyncio.run(main())
