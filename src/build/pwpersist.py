# Stored data (plan step 5): a record saved by each earlier build loads on this one with nothing dropped, saves back with every old value
# intact, and saving again changes nothing. The fixtures in fixtures/ were written by the earlier builds' own prodBody (git worktrees of
# f1df132 first report, 21db4e7 alternatives, eeccdb4 baseline, 00ed68a fixes in the report, 51124c3 before/costUsd/partial) — not built here.
# Also: the unsent draft in localStorage (an old one without formatting marks), and a save that is refused is said, never silent.
# Needs mock_sb.js; no AI call is made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, json, glob, pathlib
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
FIX = sorted(glob.glob(str(pathlib.Path(__file__).parent / "fixtures" / "persist-*.json")))
# every value the old record holds is still there, equal (the new build may add keys with their defaults, never drop or change one)
SUBSET = r"""([a, b]) => {
  const miss = [];
  const walk = (x, y, p) => {
    if (x === null || typeof x !== 'object') { if (x !== y) miss.push(p + ': ' + JSON.stringify(x) + ' -> ' + JSON.stringify(y)); return; }
    if (y === null || typeof y !== 'object') { miss.push(p + ': object -> ' + JSON.stringify(y)); return; }
    if (Array.isArray(x)) { if (!Array.isArray(y) || x.length !== y.length) { miss.push(p + ': array length ' + x.length + ' -> ' + (y && y.length)); return; } x.forEach((v, i) => walk(v, y[i], p + '[' + i + ']')); return; }
    for (const k of Object.keys(x)) walk(x[k], y[k], p + '.' + k);
  };
  walk(a, b, '$'); return miss;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ok("fixtures from five builds are present", len(FIX) == 5, FIX)
        for fx in FIX:
            name = pathlib.Path(fx).stem.replace("persist-", "")
            data = json.load(open(fx, encoding="utf-8"))
            pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(1500)
            await pg.evaluate("([d]) => { window.__rows['producciones/p1'] = { collection: 'producciones', id: 'p1', data: d }; }", [data])
            await pg.evaluate("openProd('p1')"); await pg.wait_for_timeout(700)
            got = await pg.evaluate("""() => ({ text: $('script').value, title: $('title').value, series: $('series').value, keyword: $('keyword').value, thumb: $('thumb').value, description: $('description').value,
              status: G.status, cold: G.cold, notes: G.notes.length, rehearsals: G.rehearsals.length, target: G.target, realDur: G.realDur, retention: G.retention, id: G.prodId,
              items: G.report && G.report.items.length, fixes: G.report && G.report.fixes.length, words: G.report && Object.keys(G.report.words).length, state: G.saveState })""")
            textok = got["text"] == data["text"]; got["text"] = "same" if textok else "DIFFERENT"
            ok(f"{name}: the fields load", got["id"] == "p1" and textok and got["title"] == data["title"] and got["series"] == data["series"] and got["keyword"] == data["keyword"] and got["thumb"] == data["thumb"] and got["description"] == data["description"] and got["status"] == data["status"], got)
            ok(f"{name}: cold open, notes, rehearsals, target, real length, retention load", got["cold"] == data["cold"] and got["notes"] == len(data["notes"]) and got["rehearsals"] == len(data["rehearsals"]) and got["target"] == data["target"] and got["realDur"] == data["realDur"] and got["retention"] == data["retention"], got)
            rep = data.get("report") or {}
            ok(f"{name}: the report's items, fixes and words are all there", got["items"] == len(rep.get("items", [])) and got["fixes"] == len(rep.get("fixes", [])) and got["words"] == len(rep.get("words", {})), got)
            # save back through the app's own writer and compare with what was stored
            await pg.evaluate("saveProd(true)"); await pg.wait_for_timeout(500)
            saved = await pg.evaluate("window.__rows['producciones/p1'].data")
            miss = await pg.evaluate(SUBSET, [{k: v for k, v in data.items() if k not in ("updatedAt", "updatedBy")}, saved])
            ok(f"{name}: saving it again keeps every stored value", not miss, miss)
            ok(f"{name}: save state says saved", await pg.evaluate("String(G.saveState).startsWith('saved:')"), await pg.evaluate("G.saveState"))
            await pg.evaluate("openProd('p1')"); await pg.wait_for_timeout(500)
            await pg.evaluate("saveProd(true)"); await pg.wait_for_timeout(500)
            saved2 = await pg.evaluate("window.__rows['producciones/p1'].data")
            strip = lambda d: {k: v for k, v in d.items() if k not in ("updatedAt", "updatedBy")}
            ok(f"{name}: a second load and save changes nothing", strip(saved) == strip(saved2), [k for k in saved if strip(saved).get(k) != strip(saved2).get(k)])
            # the cloud refuses: said on screen, nothing pretends it landed
            await pg.evaluate("window.__SB_MODE = 'stranger'")
            await pg.evaluate("$('title').value = 'Cambiado'; markDirty(); saveProd(true)"); await pg.wait_for_timeout(700)
            st = await pg.evaluate("[G.saveState, $('gSaveState') ? $('gSaveState').textContent : null, saveText()]")
            ok(f"{name}: a refused save is shown", st[0] == "fail" and st[2] == await pg.evaluate("t('gSaveFail')"), st)
            ok(f"{name}: and the stored copy is untouched", (await pg.evaluate("window.__rows['producciones/p1'].data.title")) == data["title"])
            ok(f"{name}: no page error", not errs, errs)
            await pg.close()
        # the unsent draft: an old one has no formatting marks; a broken one is ignored
        for label, raw, want in [("old draft without marks", json.dumps({"text": "Un borrador viejo sin marcas.", "at": 1760000000000}), "Un borrador viejo sin marcas."),
                                 ("draft with marks", json.dumps({"text": "Con marcas.", "marks": [], "at": 1760000000000}), "Con marcas."),
                                 ("broken draft", "{no es json", "")]:
            pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-draft', " + json.dumps(raw) + ")")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(2600)
            v = await pg.evaluate("$('script').value")
            ok(f"draft: {label}", v == want and not errs, [v, errs])
            await pg.close()
        # the last-episode pointer from an episode that no longer exists opens a blank script, not an error
        pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-last','gone')")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(2000)
        ok("sd-last pointing at a deleted episode: blank script, no error", (await pg.evaluate("$('script').value")) == "" and not errs, errs)
        await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
