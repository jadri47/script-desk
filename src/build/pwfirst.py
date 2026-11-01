# First-use findings of the 2026-11-01 desktop walkthrough (B-046..B-051), desktop 1400x900 on the mock.
# B-046 «Borrar guion» says «No se puede deshacer» only when nothing is saved · B-047 one episode = «Borrar el episodio» ·
# B-048 «+ Nuevo episodio» saves the open one and starts empty; «Planear otro episodio» focuses its title · B-049 the cost toast
# never covers the review panel · B-050 the gain chip sits below the masthead · B-051 the end card is the only primary.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
PICK = r"""() => { ensureReview();
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start) && !R.riskHits.some((h) => h.start < x.at + x.s.length && h.end > x.at); });
  const step = Math.max(1, Math.floor(sents.length / 4));
  return [sents[1 * step], sents[2 * step], sents[3 * step]].map((x) => x && x.s);
}"""
# three clean changes (hook / retention / return); the first has two alternatives, so a choice exists
MOCK = r"""([picks, en]) => { ensureReview();
  window.__calls = 0;
  const rep = (s, t) => s.replace(/[.!?]$/, '') + t;
  const json = { areas: { hook: { rating: 3, why: 'x' }, promise: { rating: 5, why: '' }, retention: { rating: 3, why: 'y' }, voice: { rating: 4, why: '' }, close: { rating: 5, why: '' }, return: { rating: 3, why: 'z' } },
    items: [
      { area: 'hook', original: picks[0], replacement: rep(picks[0], en ? ', and that changes everything.' : ', y eso lo cambia todo.'), alts: [rep(picks[0], en ? ', and that is the point.' : ', y esa es la clave.'), rep(picks[0], en ? ', so listen closely.' : ', así que escucha bien.')], why: 'w1', after: 5 },
      { area: 'retention', original: picks[1], replacement: rep(picks[1], en ? ', and that matters.' : ', y eso importa.'), why: 'w2', after: 4 },
      { area: 'return', original: picks[2], replacement: rep(picks[2], en ? ', see you next week.' : ', nos vemos la próxima semana.'), why: 'w3', after: 5 }] };
  json.words = [...new Set(state.result.riskHits.map((x) => x.text.toLowerCase()))].map((t) => ({ term: t, alts: en ? ['blows', 'lashes'] : ['golpes', 'azotes'] }));
  caps.sample = Promise.resolve({ serverRules: true, json: async () => { window.__calls++; await new Promise((r) => setTimeout(r, 200)); return JSON.parse(JSON.stringify(json)); } });
}"""

INTER = r"""([a, b]) => { const A = document.querySelector(a), B = document.querySelector(b); if (!A || !B) return null; const r = A.getBoundingClientRect(), s = B.getBoundingClientRect();
  return !(r.right <= s.left || r.left >= s.right || r.bottom <= s.top || r.top >= s.bottom); }"""
async def page(b, mode):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='{mode}'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(1200)
    return pg, errs
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- episodes (signed-in member on the mock) ---- (FIRST_PART=walk skips this part)
        if os.environ.get("FIRST_PART") != "walk":
            pg, errs = await page(b, "member")
            await pg.evaluate("$('script').value = 'Hola amigos. Hoy hablamos de la paciencia. ' + 'Una frase más para tener texto. '.repeat(30); $('script').dispatchEvent(new Event('input', {bubbles: true})); markDirty()"); await pg.evaluate("createProd()"); await pg.wait_for_timeout(900)
            pid = await pg.evaluate("G.prodId")
            ok("setup: one saved episode", bool(pid), pid)
            await pg.evaluate("askClearScript()"); await pg.wait_for_timeout(300)
            note = await pg.evaluate("(document.querySelector('dialog[open]') || {}).innerText || ''")
            ok("B-046: with a saved episode the dialog does not say «No se puede deshacer»", "No se puede deshacer" not in note and "se conserva" in note, note)
            await pg.click("#clrNo"); await pg.wait_for_timeout(200)
            await pg.evaluate("openEpSheet()"); await pg.wait_for_timeout(700)
            txt = await pg.evaluate("$('epList').innerText")
            ok("B-047: one episode → «Borrar el episodio»", "Borrar el episodio" in txt and "los 1" not in txt, txt[-200:])
            await pg.click("#epList-a"); await pg.wait_for_timeout(500)
            ok("B-048: «Planear otro episodio» puts the cursor in its title", await pg.evaluate("document.activeElement && document.activeElement.id") == "epList-t", await pg.evaluate("document.activeElement && document.activeElement.id"))
            await pg.click("#epList-x"); await pg.wait_for_timeout(300)
            await pg.evaluate("$('script').value += ' Última línea sin guardar.'; $('script').dispatchEvent(new Event('input', {bubbles: true})); markDirty()")
            await pg.click("#epList-new"); await pg.wait_for_timeout(1200)
            st = await pg.evaluate(f"({{ id: G.prodId, text: $('script').value, old: (window.__rows['producciones/{pid}'] || {{data: {{}}}}).data.text || '', open: !!($('epSheet') && $('epSheet').open) }})")
            ok("B-048: «+ Nuevo episodio» starts an empty episode and closes the list", st["id"] is None and st["text"] == "" and not st["open"], st)
            ok("B-048: the episode left keeps the last line typed", "Última línea sin guardar." in st["old"], st["old"][-60:])
            await pg.evaluate("askClearScript()"); await pg.wait_for_timeout(300)
            note2 = await pg.evaluate("(document.querySelector('dialog[open]') || {}).innerText || ''")
            ok("B-046: with nothing saved it still says «No se puede deshacer»", "No se puede deshacer" in note2, note2)
            await pg.click("#clrNo")
            ok("episodes: no page error", not errs, errs)
            await pg.close()
        # ---- report walk (guest demo + mocked AI) ----
        pg, errs = await page(b, "guest")
        await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
        picks = await pg.evaluate(PICK)
        await pg.evaluate(MOCK, [picks, False])
        await pg.click("#runBtn"); await pg.wait_for_timeout(2400)
        await pg.evaluate("window.dispatchEvent(new CustomEvent('sd-ai-cost', { detail: { cost_usd: 0.021, month_cost_usd: 0.2, model_name: 'Sonnet 5.5', input_tokens: 7673, output_tokens: 586 } }))"); await pg.wait_for_timeout(700)
        toast = await pg.evaluate("[...document.querySelectorAll('.cost-toast.on')].map(e => '#' + e.id)")
        cov = [await pg.evaluate(INTER, [t, "#guide"]) for t in toast]
        ok("B-049: a cost toast showed", bool(toast), toast)
        ok("B-049: it does not cover the review panel", toast and not any(cov), list(zip(toast, cov)))
        # signed in on desktop the score pill was hidden, so the chip fell back to top: 12 px, on the header (the live screenshot)
        await pg.evaluate("(() => { const p = $('scorePill'); if (p) Object.defineProperty(p, 'hidden', { get: () => true, set() {}, configurable: true }); })()")
        await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(600)
        chip = await pg.evaluate("(() => { const c = document.getElementById('rpChip'), m = document.querySelector('.masthead'); return c && m ? [c.getBoundingClientRect().top, m.getBoundingClientRect().bottom] : null; })()")
        ok("B-050: the gain chip sits below the masthead", chip and chip[0] >= chip[1], chip)
        for _ in range(4):
            if await pg.locator("[data-rp=publish]").count(): break
            await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(400)
        nxt = await pg.evaluate("[...document.querySelectorAll('#guide [data-step=\"3\"].primary')].filter(e => e.offsetParent).length")
        ok("B-051: on the end card «Ir a Publicar» is the only way forward", await pg.locator("[data-rp=publish]").count() == 1 and nxt == 0, nxt)
        ok("walk: no page error", not errs, errs)
        await b.close()
    print("FAILS:", fails or "none")
asyncio.run(main())
