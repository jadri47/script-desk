SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read(); LONG = open("long_es.txt", encoding="utf-8").read()
URL = SDU+"standalone/site/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w,h,n in [(390,844,"m"),(1100,900,"d")]:
            pg = await b.new_page(viewport={"width":w,"height":h}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member';")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            calls=[]
            async def fn(route):
                body=json.loads(route.request.post_data); calls.append(body["tier"])
                usage={"model":"claude-sonnet-5-5","model_name":"Sonnet 5.5","input_tokens":3120,"output_tokens":540,"cost_usd":0.01164,"month_cost_usd":0.3239}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"data":{"titles":["¿Qué dice la Biblia sobre la ansiedad?"],"thumbs":["Sin miedo"],"description":"..."},"usage":usage}))
            await pg.route("**/functions/v1/sd-ai", fn)
            await pg.goto(URL); await pg.wait_for_timeout(600)
            print(n, "bar:", (await pg.inner_text("#authBar")).replace("\n"," | "))
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", LONG); await pg.click("#runBtn"); await pg.wait_for_timeout(1000)
            await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(400)
            await pg.click("#pkAi"); await pg.wait_for_timeout(800)
            print(n, "toast:", await pg.inner_text("#costToast"), "| tier:", calls, "| bar:", await pg.inner_text("#costMonth"))
            await pg.screenshot(path=f"cost_{n}.png")
            # failure with usage
            await pg.unroute("**/functions/v1/sd-ai")
            await pg.route("**/functions/v1/sd-ai", lambda r: r.fulfill(status=422, content_type="application/json", body=json.dumps({"code":"invalid_json","usage":{"model":"claude-opus-5-5","model_name":"Opus 5.5","input_tokens":2600,"output_tokens":8000,"cost_usd":0.1704,"month_cost_usd":0.4943}})))
            await pg.click("#pkAi"); await pg.wait_for_timeout(800)
            print(n, "toast2:", await pg.inner_text("#costToast"))
            await pg.close()
        print("ERR", errs); await b.close()
asyncio.run(main())
