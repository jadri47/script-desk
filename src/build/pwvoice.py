# «Revisión detallada» with a good spoken voice (Adrian, 2026-11-03: A, wording A). Guest demo «Excelente», desktop 1400x900, the
# AI mocked (no paid call). Checks: voice rated 4 with two pending voice changes → the card «Tu guion ya suena hablado» with the
# rating and the count, «Ir a Publicar →» as the main button, no change card yet; «Ver las 2 sugerencias» walks them as before;
# «Ir a Publicar →» from the card goes to step 4 with the text unchanged; voice rated 3 → the change cards come straight away; the
# detailed prompt carries the rule that keeps contrasts and qualifiers. sd-secs-off=0 turns the 4-step flow on (mock_sb.js sets 1).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

# sections: no items (every section is just fixed); detailed: two voice changes on body sentences, the voice rating from the run
MOCK = r"""(voice) => { ensureReview(); window.__tiers = []; window.__prompts = [];
  const text = state.text, R = state.result, m = mainSections(text, R), U = buildUnits(R, text), body = m.list.find(x => x.k === 'body');
  const pick = U.filter(u => body && u.start >= body.start && u.end <= body.end && u.text.split(/\s+/).length >= 6 && u.text.split(/\s+/).length <= 30 && !/[«»"“”⟦]/.test(u.text) && text.indexOf(u.text) === text.lastIndexOf(u.text)).slice(0, 2);
  const sec = { areas: { hook: { rating: 4, why: 'Bien.' }, promise: { rating: 4, why: 'Clara.' }, retention: { rating: 4, why: 'Bien.' }, close: { rating: 4, why: 'Bien.' }, return: { rating: 4, why: 'Bien.' } }, items: [] };
  const rep = { areas: { voice: { rating: voice, why: 'Suena hablado.' } }, items: pick.map(u => ({ area: 'voice', original: u.text, replacement: u.text.replace(/[.?!]$/, '') + ', ¿verdad?', alts: [], why: 'Más hablado.', after: 5 })), words: [] };
  window.__n = rep.items.length;
  caps.sample = Promise.resolve({ serverRules: true, json: async (p, o) => { window.__tiers.push(o && o.modelTier); window.__prompts.push(p); await new Promise(r => setTimeout(r, 200)); return JSON.parse(JSON.stringify(o && o.modelTier === 'sections' ? sec : rep)); } });
}"""
CARD = """(() => { const r = document.querySelector('[data-rp-root]'); if (!r) return null; const g = r.querySelector('.rp-gate');
  return { gate: !!g, text: g ? g.innerText : '', primary: (r.querySelector('[data-rp-primary]') || {}).textContent || '', see: (r.querySelector('[data-rp=voice]') || {}).textContent || '',
    change: !!r.querySelector('.rp-dec-h.rp-prog'), title: ((r.querySelector('#rpD') || {}).textContent || '') }; })()"""

async def detail(b, voice):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-secs-off','0');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
    await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
    await pg.evaluate(MOCK, voice)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2000)
    for _ in range(10):
        if await pg.locator("[data-sx=detail]").count(): break
        await pg.click(".sx-card [data-sx=lock], .sx-card [data-sx=fine]"); await pg.wait_for_timeout(350)
    await pg.click("[data-sx=detail]"); await pg.wait_for_timeout(1500)
    return pg, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg, errs = await detail(b, 4)
        n = await pg.evaluate("window.__n")
        ok("setup: the detailed report has two voice changes, still pending", n == 2 and await pg.evaluate("G.report.detail === true && G.report.items.length === 2"), n)
        c = await pg.evaluate(CARD)
        ok("voice 4: the card «Tu guion ya suena hablado» instead of a change card", c and c["gate"] and not c["change"] and c["title"] == "Tu guion ya suena hablado", c)
        ok("it says the rating and that the 2 suggestions are optional", c and "El editor le da 4 de 5 a la voz hablada." in c["text"] and "Quedan 2 sugerencias de frases sueltas; son opcionales." in c["text"], c and c["text"])
        ok("«Ir a Publicar →» is the main button; «Ver las 2 sugerencias» is there", c and c["primary"] == "Ir a Publicar →" and c["see"] == "Ver las 2 sugerencias", c)
        t0 = await pg.evaluate("$('script').value")
        await pg.click("[data-rp=voice]"); await pg.wait_for_timeout(500)
        c = await pg.evaluate(CARD)
        ok("«Ver las 2 sugerencias» shows the first change card", c and not c["gate"] and c["change"] and "Voz hablada" in c["title"], c)
        await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(400)
        c = await pg.evaluate(CARD)
        ok("skipping one leaves the walk open (no gate again for this report)", c and not c["gate"] and c["change"], c)
        ok("the text is unchanged so far", await pg.evaluate("$('script').value") == t0)
        pr = await pg.evaluate("window.__prompts[window.__prompts.length - 1]")
        ok("the detailed prompt keeps contrasts and qualifiers", "Nunca quites un contraste o un matiz" in pr and "desde un punto de vista humano" in pr, pr[:200])
        ok("no page error (voice 4)", not errs, errs)
        await pg.close()

        pg, errs = await detail(b, 4)
        t0 = await pg.evaluate("$('script').value")
        await pg.click("[data-rp-root] [data-rp=publish]"); await pg.wait_for_timeout(700)
        ok("«Ir a Publicar →» from the card opens Publicar, text unchanged", await pg.evaluate("V.step") == 3 and await pg.evaluate("$('script').value") == t0, await pg.evaluate("V.step"))
        await pg.close()

        pg, errs = await detail(b, 3)
        c = await pg.evaluate(CARD)
        ok("voice 3: the change cards come straight away", c and not c["gate"] and c["change"], c)
        ok("no page error (voice 3)", not errs, errs)
        await b.close()
    print("FAILS:", fails or "none")
asyncio.run(main())
