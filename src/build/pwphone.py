# Phone layout at 390 px (B-034) and the smallest text on screen (B-035, B-036). (jadri47, 2026-10-29)
# B-034: step 1 «Más opciones» and the variant / Bible version row must not make the page scroll sideways; the fixed step bar fits the viewport.
# B-035 / B-036: every visible text node is at least 12 px (guided step 1, 2 and 3 on desktop and phone; the expert view).
# Needs mock_sb.js (guest db); no AI is called.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(__import__("tempfile").gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

OVER = r"""(W) => {
  const bad = [];
  for (const el of document.querySelectorAll('select, #stepBar, ol.sb, ol.sb button')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > W + 0.5) bad.push((el.id || el.tagName + '.' + el.className) + ' right=' + Math.round(r.right));
  }
  const d = document.documentElement;
  return { sw: d.scrollWidth, cw: d.clientWidth, bad };
}"""

# smallest visible text: walk text nodes, take the computed font-size of the parent, skip hidden / zero-size / aria-hidden-less decorative nodes
FONTS = r"""() => {
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const txt = n.nodeValue.trim(); if (!txt) continue;
    const el = n.parentElement; if (!el || el.closest('script,style,noscript,template,svg,[hidden],option')) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    let hid = false; for (let e = el; e; e = e.parentElement) { if (getComputedStyle(e).display === 'none' || e.hidden) { hid = true; break; } } if (hid) continue;
    const fs = parseFloat(cs.fontSize);
    if (fs < 12) out.push(fs.toFixed(2) + ' ' + (el.id ? '#' + el.id : el.tagName.toLowerCase()) + '.' + String(el.className).split(' ').join('.') + ' "' + txt.slice(0, 24) + '"');
  }
  return [...new Set(out)];
}"""

async def open_page(b, ui, vp, expert=False):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-tips-off','1'); localStorage.setItem('sd-rail-cues','1');" + ("localStorage.setItem('sd-expert','1');" if expert else ""))
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(600)
    return pg, errs

async def review(pg):
    await pg.evaluate("caps.sample = Promise.resolve(null)")
    await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", await pg.evaluate("SAMPLE_ES"))
    await pg.click("#runBtn"); await pg.wait_for_timeout(1500)

async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        # ---- B-034: no sideways scroll at 390 px on step 1 with the extras open
        for ui in ["es", "en"]:
            pg, errs = await open_page(b, ui, {"width": 390, "height": 844})
            ok(f"{ui}/390: step 1 closed: no sideways scroll", (lambda r: r["sw"] <= 390 and not r["bad"])(await pg.evaluate(OVER, 390)), await pg.evaluate(OVER, 390))
            await pg.click("#s1MoreBtn"); await pg.wait_for_timeout(400)
            r = await pg.evaluate(OVER, 390)
            await pg.screenshot(path=OUT + f"phone_s1_more_{ui}.png", full_page=True)
            ok(f"{ui}/390: «Más opciones» open: the page does not scroll sideways (scrollWidth <= 390)", r["sw"] <= 390, r)
            ok(f"{ui}/390: «Más opciones» open: no select, step bar or step button reaches past 390 px", not r["bad"], r)
            await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
