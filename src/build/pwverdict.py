# The yellow verdict says "almost ready" only from 70 up; a low score says it needs work (jadri47, 2026-10-22).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            for demo in ["bad", "mid", "good"]:
                pg = await b.new_page(viewport={"width": 1400, "height": 900})
                await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
                await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
                await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
                r = await pg.evaluate("(() => { const S = scoreOf(state.result, state.fixDismissed), v = verdictOf(state.result); return { s: S.score, band: S.band, t: v.t }; })()")
                if r["band"] == "amarillo":
                    almost = r["t"].startswith("Casi listo") or r["t"].startswith("Almost ready")
                    ok(f"{ui}-{demo}: score {r['s']} -> '{r['t']}'", almost == (r["s"] >= 70), r)
                else: print(f"--   {ui}-{demo}: band {r['band']}, not yellow")
                await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
