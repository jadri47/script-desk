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

# the report mock of pwwalk.py (three real sentences of a demo, one AI answer): read from that file so there is one copy
_WALK = open(os.path.join(HERE, "pwwalk.py"), encoding="utf-8").read()
PICK = re.search(r'PICK = r"""(.*?)"""', _WALK, re.S).group(1)
MOCK = re.search(r'MOCK = r"""(.*?)"""', _WALK, re.S).group(1)
RPHEAD = "((document.querySelector('.rp-dec .rp-prog b') || document.querySelector('.rp-dec .rp-prog-t') || {}).textContent || '').trim()"

SEVQ = """() => ({ bars: [...document.querySelectorAll('.rl-bar')].map((b) => [(b.className.match(/sev-(\w+)/) || [])[1], b.getAttribute('aria-label')]),
  ticks: [...document.querySelectorAll('.wk-tick')].map((b) => [(b.className.match(/wk-(r|a|d|ok|g)(?![\w-])/) || [])[1], b.getAttribute('aria-label')]) })"""
POPQ = """() => { const p = document.querySelector('.rl-pop'), id = p.getAttribute('aria-labelledby'), e = id && document.getElementById(id);
  return { open: !p.classList.contains('hidden'), role: p.getAttribute('role'), name: e ? e.textContent.trim() : '', inside: p.contains(document.activeElement) }; }"""
SCQ = """() => { const b = document.querySelector('#scPop [data-scrow]'); if (!b) return null; b.focus(); const k = b.dataset.scrow; scRenderPop();
  const a = document.activeElement; return { k, same: !!a && !!a.dataset && a.dataset.scrow === k }; }"""
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
            # smallest prompter letter size (20 px): the cue tags and the end line stay at 12 px or more (they are em-based)
            small = await pg.evaluate("(() => { PP.font = 20; ppApplyLook(); const col = $('ppCol'), box = document.createElement('div'); box.innerHTML = '<span class=\"pp-cue\">TEXTO</span><span class=\"pp-cliptag\">CLIP</span><div class=\"pp-end\">FIN</div>'; col.appendChild(box); const r = [...box.children].map((x) => [x.className, parseFloat(getComputedStyle(x).fontSize)]); box.remove(); return r; })()")
            ok(f"{n}: B-035 prompter cue tags and end line are at least 12 px at the smallest letter size", all(px >= 12 for _, px in small), small)
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
            await pg.evaluate("V.guided = false; lsSet('sd-expert','1'); applyView(); setMode('guion')"); await pg.wait_for_timeout(700)
            r = await pg.evaluate("({ tabs: document.querySelectorAll('#phBar [role=tab], #phBar[role=tablist]').length, cur: document.querySelectorAll('#phBar [aria-current=true]').length, btns: document.querySelectorAll('#phBar button').length })")
            ok(f"{n}: B-033 the section bar has no tab roles (no tabpanel behind them) and marks exactly one current button", r["tabs"] == 0 and r["cur"] == 1 and r["btns"] > 1, r)
            r = await pg.evaluate("({ tabs: document.querySelectorAll('.modes [role=tab], .modes[role=tablist]').length, cur: [...document.querySelectorAll('.modes [aria-current=true]')].map((x) => x.dataset.mode), sel: document.querySelectorAll('.modes [aria-selected]').length })")
            ok(f"{n}: B-033 the mode switch has no tab roles and marks the current mode", r["tabs"] == 0 and r["sel"] == 0 and r["cur"] == ["guion"], r)
            await pg.evaluate("setMode('review')"); await pg.wait_for_timeout(200)
            ok(f"{n}: and follows the switch", await pg.evaluate("[...document.querySelectorAll('.modes [aria-current=true]')].map((x) => x.dataset.mode).join() === 'review'"))
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
        # ---- B-033: severity in words, the rail popover, the score popover, arrow keys
        for ui in ["es", "en"]:
            n = ui
            pg, errs = await open_page(b, ui)
            await pg.evaluate("lsSet('sd-more-open','1'); lsSet('sd-coach-off','1'); lsSet('sd-rail-cues','1')")
            await pg.reload(); await pg.wait_for_timeout(600)
            await pg.evaluate("startDemo('bad')"); await pg.wait_for_timeout(900)
            await pg.click("#runBtn"); await pg.wait_for_timeout(2500)
            sev = {"es": ["riesgo alto", "mejoras sugeridas"], "en": ["high risk", "suggested improvements"]}[ui]
            r = await pg.evaluate(SEVQ)
            for kind, rows in (("rail bar", r["bars"]), ("paragraph tick", r["ticks"])):
                red = [x for x in rows if x[0] == "r"]; amb = [x for x in rows if x[0] == "a"]
                ok(f"{n}: B-033 {kind}s have a name; the red ones say {sev[0]!r}, the amber ones {sev[1]!r}", bool(rows) and all(x[1] for x in rows) and all(sev[0] in x[1] for x in red) and all(sev[1] in x[1] for x in amb) and bool(red or amb), rows[:6])
            opener = "document.querySelector('.rl-row .g, .rl-row .rl-cue')"
            has = await pg.evaluate(f"!!{opener}")
            ok(f"{n}: B-033 the demo has a rail marker to open", has)
            if has:
                await pg.evaluate(f"{opener}.focus()"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
                r = await pg.evaluate(POPQ)
                ok(f"{n}: B-033 the rail popover is a named dialog and takes focus when it opens", r["open"] and r["role"] == "dialog" and bool(r["name"]) and r["inside"], r)
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
                r = await pg.evaluate("({ hidden: document.querySelector('.rl-pop').classList.contains('hidden'), onMarker: !!(document.activeElement && document.activeElement.closest('.rl-row')) })")
                ok(f"{n}: B-033 Escape closes it and focus goes back to the marker", r["hidden"] and r["onMarker"], r)
            await pg.click("#scorePill"); await pg.wait_for_timeout(500)
            r = await pg.evaluate(SCQ)
            ok(f"{n}: B-033 a score-popover row keeps focus after the popover redraws", r is not None and r["same"], r)
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
        # arrow keys: the coach and the report card
        pg, errs = await open_page(b, "es")
        await pg.evaluate("lsSet('sd-more-open','1')"); await pg.reload(); await pg.wait_for_timeout(600)
        await pg.evaluate("startDemo('bad')"); await pg.wait_for_timeout(900)
        await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
        COH = "(document.querySelector('.topfix.coach h3') || {}).textContent"
        h0 = await pg.evaluate(COH)
        has = await pg.evaluate("!!document.querySelector('[data-co=walker]')")
        if has:
            await pg.evaluate("document.querySelector('[data-co=walker]').focus()"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(500)
            ok("coach: B-033 ArrowRight on a focused button does not skip the decision", (await pg.evaluate("!!document.querySelector('.topfix.coach')")) and await pg.evaluate(COH) == h0, (h0, await pg.evaluate(COH)))
        else:
            ok("coach: B-033 the coach has a button to focus", False)
        await pg.close()
        pg, errs = await open_page(b, "es")
        await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
        picks = await pg.evaluate(PICK); await pg.evaluate(MOCK, [picks, False])
        await pg.click("#runBtn"); await pg.wait_for_timeout(2400)
        h0 = await pg.evaluate(RPHEAD)
        ok("report: B-033 the first change card is on screen", bool(h0), h0)
        await pg.focus("input[name=rpPick]"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(500)
        ok("report: B-033 ArrowRight on a focused radio does not advance the card", await pg.evaluate(RPHEAD) == h0, (h0, await pg.evaluate(RPHEAD)))
        # a visible button of the card that is not skip / previous / apply (on the desktop the full-script link is hidden)
        BTN = "[...document.querySelectorAll('.rp-dec button')].find((x) => x.offsetParent !== null && !x.disabled && !/^(skip|prev|apply)$/.test(x.dataset.rp || ''))"
        got = await pg.evaluate(f"(() => {{ const x = {BTN}; if (!x) return ''; x.focus(); return document.activeElement === x ? x.textContent.trim() : ''; }})()")
        ok("report: B-033 the card has another button to focus", bool(got), got)
        await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(500)
        ok("report: B-033 ArrowRight on a focused button does not advance the card", await pg.evaluate(RPHEAD) == h0, (got, h0, await pg.evaluate(RPHEAD)))
        ok("report: B-033 the full-script link keeps its flipping label and has no aria-pressed", await pg.evaluate("document.querySelector('[data-rp-full]').getAttribute('aria-pressed')") is None)
        await pg.evaluate("document.querySelector('.rp-dec').focus()"); await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(500)
        ok("report: B-033 ArrowRight with focus on the card itself still skips (the shortcut works)", await pg.evaluate(RPHEAD) != h0, await pg.evaluate(RPHEAD))
        await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
