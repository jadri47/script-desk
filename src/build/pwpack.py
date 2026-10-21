# The packaging cards say which field has the ad-limiting words (the description card once said "thumbnail").
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
        for ui, ids in [("es", ["pack-Título", "pack-Texto de miniatura", "pack-Descripción"]), ("en", ["pack-Title", "pack-Thumbnail text", "pack-Description"])]:
            pg = await b.new_page(viewport={"width": 1400, "height": 900})
            await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
            got = await pg.evaluate("ids => ids.map((id) => plainLabel(id, id))", ids)
            want = await pg.evaluate("[t('plainPackTitle'), t('plainPackThumb'), t('plainPackDesc')]")
            ok(f"{ui}: guided view: guided mode is on", await pg.evaluate("!!V.guided"))
            for id_, g, w in zip(ids, got, want): ok(f"{ui}: {id_} card names its own field", w is not None and g == w, g)
            ok(f"{ui}: the three labels differ", len(set(got)) == 3, got)
            await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
