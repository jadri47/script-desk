# Dark theme (OS default, no manual toggle): the wording-suggestion cards and chips must use the theme's tokens (B-029; jadri47, 2026-10-29).
# The markup is the one polish_ui.js writes (pol-item, st-ai, secai-opt, chip ok/warn), put in the page by hand: this is a CSS check, so no AI call is needed.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
PROBE = r"""() => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = (c) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const num = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const bgOf = (el) => { // composite the translucent backgrounds from the element up over the first opaque one
    const layers = []; let base = [255, 255, 255];
    for (let e = el; e; e = e.parentElement) { const [r, g, b, a = 1] = num(getComputedStyle(e).backgroundColor); if (a === 0) continue; layers.push([r, g, b, a]); if (a === 1) break; }
    let out = layers.length && layers[layers.length - 1][3] === 1 ? layers.pop().slice(0, 3) : base;
    while (layers.length) { const [r, g, b, a] = layers.pop(); out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)]; }
    return `rgb(${out.join(',')})`; };
  const ratio = (el) => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return Math.round((Math.max(a, b) + .05) / (Math.min(a, b) + .05) * 100) / 100; };
  const host = document.createElement('div'); host.id = 'darkProbe';
  host.innerHTML = '<ul class="pol-list"><li class="pol-item"><span class="chip ok">ok</span> <span class="chip warn">warn</span><div class="pol-diff">texto <ins>nuevo</ins></div></li></ul><div id="chipBox" style="background:var(--sheet)"><span class="chip ok">ok</span> <span class="chip warn">warn</span></div><div class="st-ai">x</div><div class="secai-opt"><b>opt</b><p>texto</p></div>';
  document.querySelector('main').appendChild(host);
  const q = (s) => host.querySelector(s), cs = (s, p) => getComputedStyle(q(s))[p];
  return { theme: document.documentElement.dataset.theme || '', polBg: cs('.pol-item', 'backgroundColor'), polBorder: cs('.pol-item', 'borderTopColor'), polRatio: ratio(q('.pol-item')),
    secBg: cs('.secai-opt', 'backgroundColor'), secRatio: ratio(q('.secai-opt')), stBorder: cs('.st-ai', 'borderTopColor'), insBg: cs('ins', 'backgroundColor'), insRatio: ratio(q('ins')),
    okRatio: ratio(q('#chipBox .chip.ok')), warnRatio: ratio(q('#chipBox .chip.warn')) };
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ui in ["es", "en"]:
            for scheme in ["dark", "light"]:
                n = f"{ui}/{scheme}"
                pg = await b.new_page(viewport={"width": 1400, "height": 900}, color_scheme=scheme); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
                r = await pg.evaluate(PROBE)
                if scheme == "dark":
                    ok(f"{n}: OS dark with no manual toggle (data-theme unset)", r["theme"] == "", r)
                    ok(f"{n}: a suggestion card is not white and its text is readable (>= 4.5)", r["polBg"] != "rgb(255, 255, 255)" and r["polRatio"] >= 4.5, r)
                    ok(f"{n}: a rewrite option card is not white and its text is readable (>= 4.5)", r["secBg"] != "rgb(255, 255, 255)" and r["secRatio"] >= 4.5, r)
                    ok(f"{n}: card borders and the dashed AI box use the theme's rule colour", r["polBorder"] == r["stBorder"] or r["stBorder"] != "rgb(201, 205, 226)", r)
                    ok(f"{n}: the inserted-text highlight is readable (>= 4.5)", r["insRatio"] >= 4.5, r)
                    ok(f"{n}: chips ok / warn are readable on the theme's card colour (>= 4.5) without the manual toggle", r["okRatio"] >= 4.5 and r["warnRatio"] >= 4.5, r)
                else:
                    ok(f"{n}: light unchanged: white card, readable", r["polBg"] == "rgb(255, 255, 255)" and r["polRatio"] >= 4.5 and r["okRatio"] >= 4.5 and r["warnRatio"] >= 4.5, r)
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
