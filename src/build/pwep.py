# Logged episodes: hookPassed is a boolean when written and the Results readers accept the old row-object shape too (B-008, 2026-10-29).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU + "standalone/site/index.html"
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# eight episodes with intros, hookPassed in the shape the writer saved before 2026-10-29: the hook ROW of the review (an object), never a boolean
OLD = "(() => { const row = (p) => ({ id: 'hook', passed: p, warn: false, label: 'x' }); return [60, 62, 65, 70, 40, 42, 45, 50].map((intro, i) => ({ intro, avgViewed: 50, hookPassed: row(i < 4), flags: [], icon: 'verde' })); })()"
NEW = "(() => [60, 62, 65, 70, 40, 42, 45, 50].map((intro, i) => ({ intro, avgViewed: 50, hookPassed: i < 4, flags: [], icon: 'verde' })))()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ui in ["es", "en"]:
            pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-expert','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            # the readers: the same eight episodes, saved by the old writer (row objects) and by the new one (booleans), must read the same
            got = await pg.evaluate(f"(() => {{ state.historyReady = true; state.episodes = {NEW}; const b = channelNote(); state.episodes = {OLD}; const a = channelNote(); return {{ same: a === b, hookLine: b.length > 0 && b !== channelNote.call(null) ? false : true, a, b }}; }})()")
            ok(f"{ui}: Results read hookPassed saved as a row object the same as a boolean", got["same"], (got["a"][-160:], got["b"][-160:]))
            ok(f"{ui}: with 4 passed and 4 failed hooks the channel note carries the hook sentence", "intro" in got["b"].lower() and got["b"].count("%") >= 3, got["b"][-200:])
            # the writer: the value saved with an episode is a boolean (or null when the script cannot be analysed), never the row
            w = await pg.evaluate("(() => { try { const v = hookPassedOf(EXAMPLES.es.mid.text, 'es'); return [typeof v, v]; } catch (e) { return ['error', String(e)]; } })()")
            ok(f"{ui}: the writer's hookPassed is a boolean", w[0] == "boolean", w)
            ok(f"{ui}: no page errors", not errs, errs)
            await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
