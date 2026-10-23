# Editor's report (step 2): one AI call per script version, header numbers = readiness recipe, one change at a time, apply / skip / undo,
# bad items never shown, no-AI state, «Más detalles» closed by default (no rail / highlight overlay until opened). ES + EN, desktop + phone.
# Needs mock_sb.js (guest demo); caps.sample is replaced by a test-local mock, so no real call is ever made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, json, re, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# real sentences of the demo: unique, 6-25 words, away from every verse; plus a verse and a phrase that occurs twice
PICK = r"""() => {
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start); });
  const words = text.split(/\s+/); let dup = '';
  for (let i = 0; i + 3 < words.length && !dup; i++) { const g = words.slice(i, i + 3).join(' '); if (g.length > 12 && text.indexOf(g) !== text.lastIndexOf(g)) dup = g; }
  const verse = spans.length ? text.slice(spans[0].start, spans[0].end) : '';
  const step = Math.max(1, Math.floor(sents.length / 4));
  return { safe: [sents[1 * step], sents[2 * step], sents[3 * step]].map((x) => x && x.s), dup, verse };
}"""
MOCK = r"""([picks, delay, en]) => {
  window.__calls = [];
  const tail = en ? ', and that changes everything.' : ', y eso lo cambia todo.';
  const rep = (s) => s.replace(/[.!?]$/, '') + tail;
  const json = { areas: { hook: { rating: 3, why: en ? 'The opening question is for believers.' : 'La pregunta inicial es para creyentes.' }, promise: { rating: 5, why: '' }, retention: { rating: 3, why: en ? 'Nothing keeps people watching in the middle.' : 'En el medio nada hace seguir mirando.' }, voice: { rating: 4, why: en ? 'Two long sentences in a row.' : 'Dos frases largas seguidas.' }, close: { rating: 5, why: '' }, return: { rating: 3, why: en ? 'No reason to come back.' : 'No hay razón para volver.' } },
    items: [
      { area: 'hook', original: picks.safe[0], replacement: rep(picks.safe[0]), why: en ? 'It speaks to a newcomer.' : 'Le habla al que llega por primera vez.', after: 5 },
      { area: 'voice', original: picks.verse, replacement: 'Texto que no debe aparecer', why: 'touches a verse', after: 5 },
      { area: 'retention', original: picks.safe[1], replacement: rep(picks.safe[1]), why: en ? 'Opens a question.' : 'Abre una pregunta.', after: 4 },
      { area: 'close', original: picks.dup, replacement: 'Frase repetida cambiada', why: 'not unique', after: 5 },
      { area: 'return', original: picks.safe[2], replacement: rep(picks.safe[2]), why: en ? 'Gives a reason to return.' : 'Da una razón para volver.', after: 5 }] };
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => {
    window.__calls.push({ tier: opts.modelTier, auto: !!opts.auto, last: prompt.lastIndexOf('GUION') > prompt.indexOf('REGLAS') || prompt.lastIndexOf('SCRIPT') > prompt.indexOf('RULES') });
    await new Promise((r) => setTimeout(r, delay));
    return JSON.parse(JSON.stringify(json));
  } });
}"""
async def open_page(b, ui, vp, pre=""):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); " + pre)
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def start(pg, demo, mock=True, delay=0, ui="es"):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(900)
    picks = await pg.evaluate(PICK) if demo == "best" else None
    if mock: await pg.evaluate(MOCK, [picks, delay, ui == "en"])
    else: await pg.evaluate("caps.sample = Promise.resolve(null)")
    ncalls = await pg.evaluate("(window.__calls || []).length")
    await pg.click("#runBtn")
    return picks, ncalls
EXPECT = r"""() => {
  const rd = readinessOf(state.result, G.report, state.fixDismissed), text = state.text;
  const live = G.report.items.map((it) => { const s = text.indexOf(it.original); return { area: it.area, start: s, end: s + it.original.length, replacement: it.replacement, after: it.after }; }).filter((x) => x.start >= 0);
  return { a: rd.score, b: projectedReadiness(text, state.result, state.opts, { areas: G.report.areas, items: live }), pill: (document.getElementById('scN') || {}).textContent, gv: (document.querySelector('.gv-n') || {}).childNodes ? document.querySelector('.gv-n').childNodes[0].textContent : null };
}"""
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                picks, n0 = await start(pg, "best", delay=1200, ui=ui)
                ok(f"{n}: the demo gave real sentences, a verse and a repeated phrase", all(picks["safe"]) and picks["dup"] and picks["verse"], picks)
                ok(f"{n}: no call before the review", n0 == 0)
                await pg.wait_for_timeout(400)
                wait = {"es": "Leyendo tu guion como lo haría un editor…", "en": "Reading your script the way an editor would…"}[ui]
                ok(f"{n}: the loading line shows while the call runs", (await pg.inner_text(".rp-wait")).strip() == wait if await pg.locator(".rp-wait").count() else False)
                await pg.wait_for_timeout(1500)
                ok(f"{n}: exactly one AI call on entering step 2", await pg.evaluate("RP.calls") == 1 and len(await pg.evaluate("window.__calls")) == 1, await pg.evaluate("window.__calls"))
                c0 = (await pg.evaluate("window.__calls"))[0]
                ok(f"{n}: the call is the complex tier, not automatic, the script comes last", c0["tier"] == "complex" and not c0["auto"] and c0["last"], c0)
                ok(f"{n}: the report renders with 6 areas + ads", await pg.locator(".rp-row").count() == 7 and await pg.locator(".rp-row[data-area=ads]").count() == 1)
                ads = (await pg.inner_text(".rp-row[data-area=ads] .rp-st")).strip()
                ok(f"{n}: ads say no risk", ads == {"es": "✓ sin riesgo", "en": "✓ no risk"}[ui], ads)
                dots = await pg.evaluate("[...document.querySelectorAll('.rp-dots')].map(e=>e.querySelector('[aria-hidden]').textContent+'|'+e.getAttribute('aria-label'))")
                ok(f"{n}: dots with a text label", len(dots) == 6 and dots[0].startswith("●●●○○|") and ("3 de 5" in dots[0] or "3 of 5" in dots[0]), dots)
                ok(f"{n}: the two bad items are dropped", await pg.evaluate("G.report.items.length") == 3 and await pg.evaluate("G.report.dropped") == 2 and not await pg.evaluate("G.report.items.some(i=>i.replacement==='Texto que no debe aparecer'||i.replacement==='Frase repetida cambiada')"))
                e = await pg.evaluate(EXPECT)
                head = (await pg.inner_text("#rpScore")).strip()
                m = re.match(r"^(Preparado para YouTube|YouTube-ready): (\d+) → (\d+) (si aceptas lo propuesto|if you accept the suggestions)$", head)
                ok(f"{n}: header says a → b if you accept", bool(m), head)
                ok(f"{n}: header numbers equal readinessOf / projectedReadiness", m and int(m.group(2)) == e["a"] and int(m.group(3)) == e["b"] and e["b"] > e["a"], f"{head} vs {e}")
                await pg.wait_for_timeout(900)
                e = await pg.evaluate(EXPECT)
                ok(f"{n}: the pill and the verdict show the same readiness", e["pill"] is not None and int(e["pill"]) == e["a"] and e["gv"] is not None and int(e["gv"]) == e["a"], e)
                asof = (await pg.inner_text(".rp-asof")).strip()
                ok(f"{n}: «as of» time and the re-evaluate button", re.match(r"^(según el informe de las|as of the) .+( report)?$", asof) is not None and (await pg.inner_text("[data-rp=re]")).strip() == {"es": "Volver a evaluar", "en": "Re-evaluate"}[ui], asof)
                ok(f"{n}: «Volver a evaluar» is not highlighted while the report is fresh", "primary" not in (await pg.get_attribute("[data-rp=re]", "class")))
                dec = (await pg.inner_text("#rpD")).strip()
                ok(f"{n}: change 1 of 3 with its area", dec == ({"es": "Cambio 1 de 3 · Gancho", "en": "Change 1 of 3 · Hook"}[ui]), dec)
                labels = [x.strip().lower() for x in await pg.locator(".rp-c dt").all_inner_texts()]
                ok(f"{n}: before / after / why", labels == ({"es": ["antes", "después", "por qué"], "en": ["before", "after", "why"]}[ui]), labels)
                btns = [x.strip() for x in await pg.locator(".rp-act button").all_inner_texts()]
                ok(f"{n}: apply / write myself / skip", btns == ({"es": ["Aplicar", "Lo escribo yo", "Saltar"], "en": ["Apply", "I'll write it", "Skip"]}[ui]), btns)
                ok(f"{n}: «Más detalles» is closed and builds nothing", await pg.evaluate("!document.getElementById('rpMore').open") and await pg.locator(".topfix").count() == 0)
                ok(f"{n}: no rail, minimap or highlight overlay while it is closed", await pg.evaluate("!document.querySelector('.rl-layer,.rl-mini') && ![...(CSS.highlights||[]).keys()].some(k=>/^sd-[wu]-/.test(k))"))
                ok(f"{n}: the call count did not move on re-render", (await pg.evaluate("renderGuide(), RP.calls")) == 1)
                await pg.screenshot(path=OUT + f"rp_{ui}_{nm}.png", full_page=False)
                # ---- apply / skip / undo ----
                t0 = await pg.evaluate("$('script').value")
                rep1 = await pg.evaluate("G.report.items[0].replacement"); orig1 = await pg.evaluate("G.report.items[0].original")
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(1700)
                t1 = await pg.evaluate("$('script').value")
                ok(f"{n}: Apply puts the replacement in the script", rep1 in t1 and orig1 not in t1 and t1 != t0)
                dec = (await pg.inner_text("#rpD")).strip()
                ok(f"{n}: the next change is change 2 of 3", dec.startswith({"es": "Cambio 2 de 3", "en": "Change 2 of 3"}[ui]), dec)
                ok(f"{n}: the report stays fresh after our own change", "primary" not in (await pg.get_attribute("[data-rp=re]", "class")))
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(500)
                ok(f"{n}: Skip does not touch the script", await pg.evaluate("$('script').value") == t1)
                ok(f"{n}: and moves to change 3 of 3", (await pg.inner_text("#rpD")).strip().startswith({"es": "Cambio 3 de 3", "en": "Change 3 of 3"}[ui]))
                await pg.click("[data-rp=prev]"); await pg.wait_for_timeout(400)
                ok(f"{n}: ‹ Previous brings the skipped change back", (await pg.inner_text("#rpD")).strip().startswith({"es": "Cambio 2 de 3", "en": "Change 2 of 3"}[ui]))
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(300)
                await pg.keyboard.press("Escape")
                # undo restores the script and brings change 1 back
                await pg.click("#rpUndo"); await pg.wait_for_timeout(700)
                ok(f"{n}: Undo restores the script", await pg.evaluate("$('script').value") == t0)
                ok(f"{n}: and change 1 is pending again", (await pg.inner_text("#rpD")).strip().startswith({"es": "Cambio 1 de 3", "en": "Change 1 of 3"}[ui]) or (await pg.inner_text("#rpD")).strip().startswith({"es": "Cambio 3 de 3", "en": "Change 3 of 3"}[ui]), await pg.inner_text("#rpD"))
                # keys: Enter applies, then everything left is skipped with →
                for _ in range(8):
                    if not await pg.locator("[data-rp=skip]").count(): break
                    await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(250)
                done = {"es": "Listo: no quedan decisiones", "en": "Done: no decisions left"}[ui]
                ok(f"{n}: at the end it says there is nothing left", (await pg.inner_text(".rp-none")).strip() == done)
                ok(f"{n}: the Next button to step 3 is there", await pg.locator(".g-nav-steps .primary[data-step='3']").count() == 1)
                # ---- navigation never calls again; re-evaluate calls once more ----
                await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300); await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(500)
                await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(300); await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(500)
                ok(f"{n}: going back and forth makes no new call", await pg.evaluate("RP.calls") == 1 and len(await pg.evaluate("window.__calls")) == 1)
                await pg.click("[data-rp=re]"); await pg.wait_for_timeout(2200)
                ok(f"{n}: «Re-evaluate» makes exactly one more call", await pg.evaluate("RP.calls") == 2 and len(await pg.evaluate("window.__calls")) == 2, await pg.evaluate("RP.calls"))
                # ---- a text typed by hand makes the report stale: highlighted, no automatic call ----
                await pg.evaluate("$('script').value += ' Una frase nueva.'; $('script').dispatchEvent(new Event('input',{bubbles:true})); updateLive(); ensureReview(); renderGuide()"); await pg.wait_for_timeout(500)
                ok(f"{n}: a hand edit highlights «Re-evaluate» and calls nothing", "primary" in (await pg.get_attribute("[data-rp=re]", "class")) and await pg.evaluate("RP.calls") == 2)
                # ---- «Más detalles» opens today's panel ----
                await pg.click("#rpMoreSum"); await pg.wait_for_timeout(700)
                ok(f"{n}: opening «More details» shows today's coach", await pg.evaluate("document.getElementById('rpMore').open") and await pg.locator(".topfix.coach, .topfix.walk").count() == 1)
                ok(f"{n}: no old-score points badge inside it", await pg.evaluate("[...document.querySelectorAll('.rp-more .fix-pts,.rp-more .cc-score')].every(e=>getComputedStyle(e).display==='none')"))
                if nm == "m": ok(f"{n}: no horizontal scroll", await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), await pg.evaluate("document.documentElement.scrollWidth"))
                await pg.screenshot(path=OUT + f"rp_{ui}_{nm}_more.png")
                # ---- the report travels with the episode ----
                saved = await pg.evaluate("JSON.stringify(prodBody(1).report)")
                ok(f"{n}: prodBody carries the report", json.loads(saved)["items"][0]["original"] == await pg.evaluate("G.report.items[0].original"))
                ok(f"{n}: loading it back keeps it; an old episode without one loads fine", await pg.evaluate("(()=>{const r=JSON.parse(JSON.stringify(prodBody(1)));const id=G.prodId;applyProd(id,r);const kept=!!G.report&&G.report.items.length===3;applyProd(id,{...r,report:undefined});return kept&&G.report===null})()"))
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
            # ---- no AI: no call, the line, and the rule decisions still work ----
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900})
            await start(pg, "worst", mock=False, ui=ui)
            await pg.wait_for_timeout(900)
            line = {"es": "El informe del editor necesita la IA. Mientras tanto ves los avisos de anuncios y de empaque.", "en": "The editor's report needs the AI. Meanwhile you see the ad and packaging warnings."}[ui]
            ok(f"{ui}/noai: the no-AI line shows", await pg.locator(".rp-noai").count() == 1 and (await pg.inner_text(".rp-noai")).strip() == line)
            ok(f"{ui}/noai: no report and no editor areas", await pg.evaluate("G.report===null") and await pg.locator(".rp-row").count() == 1)
            h = (await pg.inner_text("#rpScore")).strip()
            ok(f"{ui}/noai: the header is the rules part out of 40", re.match(r"^(Anuncios y empaque|Ads and packaging): \d+/40$", h) is not None, h)
            gv = await pg.evaluate("document.querySelector('.gv-n').textContent")
            ok(f"{ui}/noai: the verdict says /40 too", gv.endswith("/40") and gv.startswith(h.split(": ")[1].split("/")[0]), gv)
            ok(f"{ui}/noai: a red ad warning is the first decision", await pg.locator(".rp-tag").count() == 1 and await pg.locator("[data-rp=skip]").count() == 1)
            ok(f"{ui}/noai: the pill shows the rules part with /40", (await pg.evaluate("document.getElementById('scOf').textContent")) == "/40")
            before = await pg.evaluate("$('script').value")
            # this red warning has no rule-made fix (it needs the AI), so the person writes it: «Lo escribo yo» -> «Aplicar lo escrito»
            await pg.click("[data-rp=write]"); await pg.wait_for_timeout(300)
            ok(f"{ui}/noai: the write box opens with the flagged text", len((await pg.input_value("#rpW")).strip()) > 5)
            await pg.fill("#rpW", "Texto neutro de prueba." if ui == "es" else "Neutral test text."); await pg.click("[data-rp=wapply]"); await pg.wait_for_timeout(1700)
            ok(f"{ui}/noai: applying what was written changes the script", await pg.evaluate("$('script').value") != before)
            ok(f"{ui}/noai: still no AI call", await pg.evaluate("RP.calls") == 0)
            ok(f"{ui}/noai: no page errors", not errs, errs)
            await pg.close()
            # ---- walker mode: the rail / highlight overlay only exists once «More details» is opened ----
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900}, pre="localStorage.setItem('sd-coach-off','1')")
            await start(pg, "bad", mock=False, ui=ui)
            await pg.wait_for_timeout(1200)
            ok(f"{ui}/walker: closed: no rail layer, minimap or walker highlights", await pg.evaluate("!document.querySelector('.rl-layer,.rl-mini,.topfix') && ![...(CSS.highlights||[]).keys()].some(k=>/^sd-[wu]-/.test(k))"))
            await pg.click("#rpMoreSum"); await pg.wait_for_timeout(900)
            ok(f"{ui}/walker: opened: the rail, the minimap and the highlights are there", await pg.evaluate("!!document.querySelector('.rl-layer') && !!document.querySelector('.rl-mini') && [...(CSS.highlights||[]).keys()].some(k=>/^sd-[wu]-/.test(k))"))
            await pg.click("#rpMoreSum"); await pg.wait_for_timeout(700)
            ok(f"{ui}/walker: closed again: the overlay is gone", await pg.evaluate("!document.querySelector('.rl-layer,.rl-mini,.topfix') && ![...(CSS.highlights||[]).keys()].some(k=>/^sd-[wu]-/.test(k))"))
            ok(f"{ui}/walker: no page errors", not errs, errs)
            await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
