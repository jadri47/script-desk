import asyncio
from playwright.async_api import async_playwright
S=open('sample.txt').read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":420,"height":800}); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file:///home/claude/sd/script-desk.html"); await pg.screenshot(path="empty.png")
        await pg.click(".langswitch button[data-ui=en]"); await pg.fill("#script", S); await pg.click("#runBtn"); await pg.wait_for_timeout(400)
        await (await pg.query_selector(".verdict")).scroll_into_view_if_needed(); await pg.screenshot(path="en1.png")
        print(await pg.inner_text(".topfix")); print("errors",errs); await b.close()
asyncio.run(main())
