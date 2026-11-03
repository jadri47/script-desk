# Search in the script (find_ui.js + find_logic.js; Adrian, 2026-11-03: A "a searchbox in the message field so the user can find
# things quickly"). Guest demo «Excelente», desktop 1400x900, then a 390 px phone. Checks: the 🔍 button on the toolbar; the bar
# opens without moving the editor; count «1 de N» equals findAll on the script; every match and the current one highlighted;
# Enter / Shift+Enter / ↑ step and wrap, the current match is inside the box; no match says so; Esc closes, clears the
# highlights and leaves the caret on the match; Ctrl+F in the editor opens it with the selected word; typing in the script while
# open recounts; the text and the editor DOM are never changed; it fits on a phone.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

# the most repeated word of 5+ letters in the demo (so N is large and the last match is far down the box)
PICK = r"""(() => { const c = {}; for (const w of $('script').value.match(/[A-Za-zÁÉÍÓÚÑáéíóúñü]{5,}/g) || []) { const k = findFold(w); c[k] = (c[k] || 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; })()"""
STATE = r"""(() => { const b = document.querySelector('.ed-find'), n = b && b.querySelector('.fd-n'), H = CSS.highlights;
  const cur = H.get('sd-find-cur'), cr = cur && [...cur][0];
  const er = ED.el.getBoundingClientRect(), rr = cr && cr.getBoundingClientRect();
  return { open: !!b && !b.hidden, n: n ? n.textContent : null, all: H.get('sd-find') ? H.get('sd-find').size : 0, cur: cur ? cur.size : 0,
    curText: cr ? cr.toString() : null, curIn: !!rr && rr.top >= er.top && rr.bottom <= er.bottom, miss: !!b && b.classList.contains('fd-miss'),
    focus: document.activeElement && document.activeElement.className }; })()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
        await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
        w = await pg.evaluate(PICK)
        want = await pg.evaluate(f"findAll($('script').value, {w!r}).length")
        before = await pg.evaluate("({ text: $('script').value, html: ED.el.innerHTML, top: ED.el.getBoundingClientRect().top })")

        btn = pg.locator('.ed-bar [data-ed="find"]')
        ok("the toolbar has a search button with its name", await btn.count() == 1 and await btn.get_attribute("aria-label") == "Buscar en el guion (Ctrl+F)")
        await btn.click(); await pg.wait_for_timeout(200)
        st = await pg.evaluate(STATE)
        ok("the bar opens with the search field focused", st["open"] and "fd-q" in (st["focus"] or ""), st)
        ok("opening the bar never moves the editor", await pg.evaluate("ED.el.getBoundingClientRect().top") == before["top"])
        await pg.keyboard.type(w); await pg.wait_for_timeout(400)
        st = await pg.evaluate(STATE)
        ok(f"setup: «{w}» appears several times", want >= 4, want)
        ok("the count is «1 de N», N = every match in the script", st["n"] == f"1 de {want}", (st["n"], want))
        ok("every match is highlighted, the current one too", st["all"] == want and st["cur"] == 1 and findfold(st["curText"]) == w, st)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        n2 = (await pg.evaluate(STATE))["n"]
        await pg.keyboard.press("Shift+Enter"); await pg.wait_for_timeout(150)
        n1 = (await pg.evaluate(STATE))["n"]
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(300)
        st = await pg.evaluate(STATE)
        ok("Enter next, Shift+Enter back, ↑ from the first wraps to the last", n2 == f"2 de {want}" and n1 == f"1 de {want}" and st["n"] == f"{want} de {want}", (n2, n1, st["n"]))
        ok("the current match is scrolled inside the box", st["curIn"], st)
        await pg.click('.ed-find [data-fd="next"]'); await pg.wait_for_timeout(200)
        ok("the ↓ button steps too (wraps to 1)", (await pg.evaluate(STATE))["n"] == f"1 de {want}")
        await pg.fill(".ed-find .fd-q", "zzqxq"); await pg.wait_for_timeout(400)
        st = await pg.evaluate(STATE)
        ok("no match says «Sin resultados», nothing highlighted", st["n"] == "Sin resultados" and st["miss"] and st["all"] == 0, st)
        await pg.fill(".ed-find .fd-q", w); await pg.wait_for_timeout(400)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        st = await pg.evaluate(STATE)
        sel = await pg.evaluate("({ s: String(getSelection()), inEd: ED.el.contains(getSelection().anchorNode), f: document.activeElement === ED.el })")
        ok("Esc closes the bar and clears the highlights", not st["open"] and st["all"] == 0 and st["cur"] == 0, st)
        ok("Esc leaves the caret on the match it showed", sel["inEd"] and sel["f"] and findfold(sel["s"]) == w, sel)
        after = await pg.evaluate("({ text: $('script').value, html: ED.el.innerHTML })")
        ok("the script text and the editor DOM never changed", after["text"] == before["text"] and after["html"] == before["html"])

        # Ctrl+F inside the editor, with a word selected
        await pg.evaluate("""(() => { const n = [...ED.el.querySelectorAll('p')].map(p => p.firstChild).find(x => x && x.nodeType === 3 && /\\w{6,}/.test(x.data));
          const m = /\\w{6,}/.exec(n.data); const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          ED.el.focus(); getSelection().removeAllRanges(); getSelection().addRange(r); window.__w = m[0]; })()""")
        await pg.keyboard.press("Control+f"); await pg.wait_for_timeout(400)
        q = await pg.evaluate("document.querySelector('.ed-find .fd-q').value")
        ok("Ctrl+F in the editor opens the bar with the selected word", (await pg.evaluate(STATE))["open"] and q == await pg.evaluate("window.__w"), (q, await pg.evaluate("window.__w")))
        await pg.fill(".ed-find .fd-q", w); await pg.wait_for_timeout(400)
        # typing in the script while the bar is open: one more match after the pause
        await pg.evaluate(f"""(() => {{ const p = ED.el.querySelector('p:last-of-type') || ED.el.lastElementChild; const r = document.createRange(); r.selectNodeContents(p); r.collapse(false);
          ED.el.focus(); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand('insertText', false, ' {w}'); }})()""")
        await pg.wait_for_timeout(700)
        ok("typing in the script while open recounts", (await pg.evaluate(STATE))["n"].endswith(f"de {want + 1}"), (await pg.evaluate(STATE))["n"])
        await pg.keyboard.press("Control+z"); await pg.wait_for_timeout(300)
        ok("no page error", not errs, errs)

        # phone: the bar fits the screen
        ph = await b.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True); perrs = []; ph.on("pageerror", lambda e: perrs.append(str(e)[:300]))
        await ph.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es');")
        await ph.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await ph.goto(SDU + "standalone/site/index.html"); await ph.wait_for_timeout(800)
        await ph.evaluate("startDemo('best')"); await ph.wait_for_timeout(900)
        await ph.evaluate("findOpen()"); await ph.fill(".ed-find .fd-q", w); await ph.wait_for_timeout(400)
        r = await ph.evaluate("(() => { const r = document.querySelector('.ed-find').getBoundingClientRect(); return { l: r.left, r: r.right, n: document.querySelector('.ed-find .fd-n').textContent }; })()")
        ok("on a 390 px phone the bar fits the screen and counts", r["l"] >= 0 and r["r"] <= 390 and r["n"].startswith("1 de"), r)
        ok("phone: no page error", not perrs, perrs)
        await b.close()
    print("FAILS:", fails or "none")

def findfold(s):
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if not unicodedata.combining(c)).lower()

asyncio.run(main())
