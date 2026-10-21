# Paragraph review: every card's points badge equals what applying its suggestion really does to the score, and a +0 says why.
# Runs the 8 demo scripts (ES+EN) through every paragraph of the walker. Needs mock_sb.js (guest demo).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    if not c:
        print("FAIL " + n, x); fails.append(n)
# for each paragraph: render the walker, then compare each card's badge with an independent re-analysis
JS = r"""(() => {
  const bad = [], stat = { cards: 0, withProp: 0, upTo: 0, zero: 0, zeroWhy: 0, up: 0 };
  for (let i = 0; i <= WK.blocks.length; i++) {
    if (i === WK.blocks.length && !WK.glob.length) break;
    wkGo(i, false);
    const cards = state.fixCards, cur = scoreOf(state.result, state.fixDismissed).score;
    const lis = [...document.querySelectorAll(".topfix.walk li.fx[data-ci]")];
    cards.forEach((c, ci) => {
      const li = lis.find((x) => +x.dataset.ci === ci); if (!li) return;
      const p = c.proposals[Math.min(state.fixSel[ci] || 0, Math.max(0, c.proposals.length - 1))];
      if (li.classList.contains("fx-note")) { if (li.querySelector("[data-fxapply]") || li.querySelector(".fix-pts") || !li.querySelector("[data-fxskip]") || !["refs", "reading"].includes(c.id)) bad.push(`p${i} ${c.id}: note has Apply/badge or lost Ahora no`); stat.notes = (stat.notes || 0) + 1; return; }
      const badge = li.querySelector(".fix-pts"), txt = badge ? badge.textContent.trim() : "", why = !!li.querySelector(".fx-why");
      stat.cards++;
      if (!p) { stat.upTo += /^(Hasta|Up to) \+\d+$/.test(txt) || txt === "" ? 1 : 0; if (txt && !/^(Hasta|Up to) \+\d+$/.test(txt)) bad.push(`p${i} ${c.id}: no suggestion but badge "${txt}"`); return; }
      stat.withProp++;
      const real = scoreOf(analyze(p.check.text, p.check.opts), state.fixDismissed).score - cur;
      if (real > 0) { stat.up++; if (txt !== "+" + real) bad.push(`p${i} ${c.id}: real +${real}, badge "${txt}"`); }
      else { stat.zero++; if (txt !== "+0") bad.push(`p${i} ${c.id}: real ${real}, badge "${txt}"`); if (why) stat.zeroWhy++; }
    });
  }
  return { bad, stat };
})()"""
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            for demo in ["worst", "bad", "mid", "good"]:
                pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
                await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
                await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
                await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
                await pg.click("#runBtn"); await pg.wait_for_timeout(2000)
                if not await pg.evaluate("WK.ok"): ok(f"{ui}-{demo}: walker built", False); await pg.close(); continue
                r = await pg.evaluate(JS); s = r["stat"]
                ok(f"{ui}-{demo}: badges match the real score change", not r["bad"], r["bad"][:5])
                ok(f"{ui}-{demo}: a +0 badge always says why", s["zero"] == s["zeroWhy"] or s["zero"] == 0, s)
                ok(f"{ui}-{demo}: no page errors", not errs, errs)
                print(f"{ui}-{demo}: {s}")
                await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
