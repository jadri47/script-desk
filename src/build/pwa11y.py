# Accessibility guards (B-021, B-033; jadri47, 2026-10-29). Needs mock_sb.js (guest db); no AI is called.
# Source checks (the status texts live on screens that need real data to open) + DOM checks where the screen opens with the mock.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re, glob
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
SRC = {os.path.basename(f): open(f, encoding="utf-8").read() for f in glob.glob(os.path.join(HERE, "*_ui*.js"))}
ALL_SRC = "\n".join(SRC.values())

# ---- B-021 source checks
STATUS_IDS = ["gSaveState", "rehMsg", "chMsg", "rsMsg", "askSt", "trSt", "pkStatus", "coAiStatus", "snapMsg", "npSt"]
for sid in STATUS_IDS:
    tags = re.findall(r"<[a-z]+ [^<>]*id=\"" + sid + r"\"[^<>]*>", ALL_SRC)
    ok(f"B-021: #{sid} is rendered somewhere, and every copy has role=status or role=alert", bool(tags) and all(re.search(r"role=\"(\$\{[^}]*\}|status|alert)\"", x) for x in tags), tags)
ok("B-021: no literal aria-label=\"role\"", 'aria-label="role"' not in ALL_SRC)
bad_smooth = [l.strip()[:90] for l in ALL_SRC.splitlines() if '"smooth"' in l and '"auto"' not in l]
ok("B-021: no smooth scroll that ignores reduced motion", not bad_smooth, bad_smooth)
ok("B-021: the demo language tag goes through t() (no literal \" (English)\" in a template)", not re.search(r"\? \" \(English\)\"", SRC["demo_ui.js"]))
ok("B-021: a per-row date input names its episode (aria-label carries the title)", all("p.title" in m for m in re.findall(r"<input type=\"date\"[^>]*data-srdate[^>]*>", SRC["episodes_ui.js"] + SRC["series_ui.js"])) and len(re.findall(r"<input type=\"date\"[^>]*data-srdate[^>]*>", SRC["episodes_ui.js"] + SRC["series_ui.js"])) == 2)

NAME = r"""(root) => [...root.querySelectorAll('button')].filter((b) => !b.hidden && b.offsetParent !== null || getComputedStyle(b).position === 'fixed')
  .map((b) => ({ k: b.dataset.pp || b.id || b.textContent, name: (b.getAttribute('aria-label') || b.textContent || '').trim() }))
  .filter((x) => !/\p{L}{2,}/u.test(x.name))"""   # a name needs real words: «←», «−5», «A−» and «▶» are glyphs, not names

async def open_page(b, ui):
    pg = await b.new_page(viewport={"width": 1280, "height": 800}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-tips-off','1');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ui in ["es", "en"]:
            n = ui
            pg, errs = await open_page(b, ui)
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(800)
            await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
            # ---- prompter: every button has a name made of words
            await pg.evaluate("goPhase('rec')"); await pg.wait_for_timeout(400)
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(400)
            bad = await pg.evaluate(NAME, await pg.query_selector("#pp"))
            ok(f"{n}: B-021 every prompter button has an accessible name made of words", not bad, bad)
            ok(f"{n}: B-021 the play button has a name", bool(await pg.evaluate("$('ppPlay').getAttribute('aria-label')")))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # ---- dialogs have a name that resolves to their heading
            await pg.evaluate("openEpSheet()"); await pg.wait_for_timeout(400)
            r = await pg.evaluate("(() => { const d = $('epSheet'), id = d.getAttribute('aria-labelledby'), e = id && document.getElementById(id); return { id, txt: e ? e.textContent.trim() : '' }; })()")
            ok(f"{n}: B-021 #epSheet is named by a heading ({r['txt']!r})", bool(r["txt"]), r)
            await pg.evaluate("closeEpSheet()"); await pg.wait_for_timeout(200)
            await pg.evaluate("askClearScript()"); await pg.wait_for_timeout(400)
            r = await pg.evaluate("(() => { const d = $('clrDlg'), id = d.getAttribute('aria-labelledby'), e = id && document.getElementById(id); return { id, txt: e ? e.textContent.trim() : '' }; })()")
            ok(f"{n}: B-021 #clrDlg is named by a heading ({r['txt']!r})", bool(r["txt"]), r)
            await pg.evaluate("$('clrNo').click()"); await pg.wait_for_timeout(200)
            # ---- toolbar and grip names follow the language; the cue button inserts the UI language's token
            other = "en" if ui == "es" else "es"
            await pg.click(f"[data-ui='{other}']"); await pg.wait_for_timeout(500)
            r = await pg.evaluate("({ bar: document.querySelector('.ed-bar').getAttribute('aria-label'), grip: $('edGrip').getAttribute('aria-label'), sl: t('scriptLabel'), gl: t('edGrip') })")
            ok(f"{n}->{other}: B-021 toolbar and grip names are re-set on a language change", r["bar"] == r["sl"] and r["grip"] == r["gl"], r)
            await pg.evaluate("$('script').value = ''; $('script').dispatchEvent(new Event('input'))"); await pg.wait_for_timeout(200)
            await pg.click("#ed"); await pg.click("[data-ed='cue']"); await pg.wait_for_timeout(300)
            txt = await pg.evaluate("ED.el.textContent")
            want = "[TEXT:" if other == "en" else "[TEXTO:"
            ok(f"{n}->{other}: B-021 the cue button inserts {want} in the {other.upper()} UI", want in txt, txt)
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
