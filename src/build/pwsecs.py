# Step 2's first screen «Secciones principales» (sections_ui.js; Adrian, 2026-11-01: Opus 5.5 for the main sections, two screens).
# Guest demo «Excelente», desktop 1400x900, the AI mocked (no paid call). Checks: only the "sections" tier runs on entering step 2;
# five rows and one card; boxes over the editor whose labels never cover the text; «Aplicar y fijar» applies the chosen option and
# fixes the section; «Está bien así» fixes without changing the text; «Volver a abrir»; all fixed → «Seguir con la revisión
# detallada» shows the report walk and only then the report call runs; «Ajustar límites» moves a start, refuses one out of order;
# the saved fields round-trip and an old episode without them loads clean. sd-secs-off=0 turns the screen on (mock_sb.js sets 1).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

# a canned answer built from the demo's own sentences: one change for the hook (with an alternative), one for the close
MOCK = r"""() => { ensureReview(); window.__tiers = [];
  const text = state.text, R = state.result, m = mainSections(text, R), U = buildUnits(R, text);
  const first = (k) => { const s = m.list.find(x => x.k === k); return s && U.find(u => u.start >= s.start && u.end <= s.end && u.text.split(/\s+/).length >= 4 && u.text.split(/\s+/).length <= 30 && !/[«»"“”]/.test(u.text) && text.indexOf(u.text) === text.lastIndexOf(u.text)); };
  const h = first('hook'), c = first('close');
  const json = { areas: { hook: { rating: 3, why: 'Abre fuerte pero tarda.' }, promise: { rating: 4, why: 'Clara.' }, retention: { rating: 3, why: 'Falta un enganche.' }, close: { rating: 4, why: 'Bien.' }, return: { rating: 3, why: 'Sin próximo.' } },
    items: [h && { sec: 'hook', area: 'hook', original: h.text, replacement: h.text.replace(/[.?!]$/, '') + ', y hoy lo vamos a ver.', alts: [h.text.replace(/[.?!]$/, '') + ', y eso cambia todo.'], why: 'Más directo.', after: 4 },
            c && { sec: 'close', area: 'return', original: c.text, replacement: c.text.replace(/[.?!]$/, '') + ', y nos vemos la próxima semana.', alts: [], why: 'Razón para volver.', after: 4 }].filter(Boolean) };
  const rep = { areas: { hook: { rating: 4 }, promise: { rating: 4 }, retention: { rating: 4 }, voice: { rating: 4 }, close: { rating: 4 }, return: { rating: 4 } }, items: [], words: [] };
  caps.sample = Promise.resolve({ serverRules: true, json: async (p, o) => { window.__tiers.push(o && o.modelTier); (window.__prompts = window.__prompts || []).push(p); await new Promise(r => setTimeout(r, 300)); return JSON.parse(JSON.stringify(o && o.modelTier === 'sections' ? json : rep)); } });
}"""
async def page(b):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-secs-off','0');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
    await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
    await pg.evaluate(MOCK)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
    return pg, errs
CUR = "(() => { const r = document.querySelector('.sx-row.cur .sx-go'); return r ? r.textContent.trim().split(' ')[0] : null; })()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg, errs = await page(b)
        ok("entering step 2 calls only the sections tier", await pg.evaluate("window.__tiers") == ["sections"], await pg.evaluate("window.__tiers"))
        ok("five rows, the hook is the current card", await pg.locator(".sx-row").count() == 5 and await pg.evaluate(CUR) == "Gancho", await pg.evaluate(CUR))
        boxes = await pg.evaluate("[...document.querySelectorAll('.sx-box')].map(b => b.classList[1])")
        ok("boxes over the editor for the sections on screen", {"sx-hook", "sx-promise", "sx-intro", "sx-body"} <= set(boxes), boxes)
        cover = await pg.evaluate("""(() => { const ed = document.getElementById('ed'), cs = getComputedStyle(ed), textLeft = ed.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
          return [...document.querySelectorAll('.sx-lbl')].map(l => l.getBoundingClientRect().right <= textLeft + 0.5); })()""")
        ok("no label covers the text", bool(cover) and all(cover), cover)
        await pg.click(".sx-opt:nth-child(2) input"); await pg.wait_for_timeout(100)
        alt = await pg.evaluate("document.querySelectorAll('.sx-opt span')[1].textContent")
        await pg.click("[data-sx=apply]"); await pg.wait_for_timeout(700)
        st = await pg.evaluate("({ text: $('script').value, lock: G.secLocks.hook === true })")
        ok("«Aplicar y fijar» puts the chosen option in the script and fixes the hook", alt in st["text"] and st["lock"], (alt[:40], st["lock"]))
        ok("the next section becomes the card", await pg.evaluate(CUR) == "Promesa", await pg.evaluate(CUR))
        t0 = await pg.evaluate("$('script').value")
        await pg.click(".sx-card [data-sx=lock], .sx-card [data-sx=fine]"); await pg.wait_for_timeout(500)
        ok("«Está bien así» fixes the promise without touching the text", await pg.evaluate("G.secLocks.promise === true") and await pg.evaluate("$('script').value") == t0)
        await pg.click("[data-sx-reopen=hook]"); await pg.wait_for_timeout(400)
        ok("«Volver a abrir» opens the hook again", await pg.evaluate("!G.secLocks.hook") and await pg.evaluate(CUR) == "Gancho")
        ok("the applied change is not proposed again", "no propone cambios" in await pg.evaluate("document.querySelector('.sx-card').innerText"))
        for _ in range(8):
            if await pg.locator("[data-sx=detail]").count(): break
            await pg.click(".sx-card [data-sx=lock], .sx-card [data-sx=fine]"); await pg.wait_for_timeout(350)
        ok("all five fixed: «Secciones principales listas»", await pg.locator("[data-sx=detail]").count() == 1)
        await pg.click("[data-sx=detail]"); await pg.wait_for_timeout(1500)
        ok("«Seguir con la revisión detallada» shows the report walk", await pg.evaluate("!document.querySelector('[data-sx-root]') && !!document.querySelector('[data-rp-root]')"))
        ok("and only then the report call runs", await pg.evaluate("window.__tiers") == ["sections", "complex"], await pg.evaluate("window.__tiers"))
        ok("the boxes leave with the screen", await pg.locator(".sx-box").count() == 0)
        # step 6: the 4-step bar
        bar = await pg.evaluate("[...document.querySelectorAll('#stepBar .sb button')].map(b => [b.querySelector('.sb-l').textContent, b.classList.contains('on')])")
        ok("step 6: four steps, «Revisión detallada» is the current one", [x[0] for x in bar] == ["Escribir", "Secciones principales", "Revisión detallada", "Publicar"] and [x[1] for x in bar] == [False, False, True, False], bar)
        ok("step 6: the step lines say «Paso 3 de 4» / «Paso 4 de 4»", await pg.evaluate("t('rpEndStep') === 'Paso 3 de 4 · Revisión detallada' && t('pubProg')(1, 6).startsWith('Paso 4 de 4') && t('pubRecStep') === 'Paso 4 de 4 · Grabar'"), await pg.evaluate("[t('rpEndStep'), t('pubProg')(1, 6), t('pubRecStep')]"))
        # step 5: the detailed review after the main sections
        pr = await pg.evaluate("window.__prompts[window.__prompts.length - 1]")
        ok("step 5: the detailed call asks only spoken voice, outside the reviewed sections", "Valora solo la voz hablada" in pr and "ya se revisaron" in pr, pr[:160])
        ok("step 5: the stored report carries Opus's ratings for the five (voice from the detailed call)", await pg.evaluate("G.report.areas.hook.rating === G.secReport.areas.hook.rating && G.report.areas.retention.rating === G.secReport.areas.retention.rating && G.report.areas.voice.rating === 4"), await pg.evaluate("JSON.stringify(G.report.areas)"))
        # on «Regular» (es.mid), which has hook / CTA / ending / keyword cards and evidence in its opening and close («Excelente» has none)
        cards = await pg.evaluate("""(() => { const keep = [state.text, state.result, JSON.stringify(G.secLocks)]; const tx = EXAMPLES.es.mid.text;
          state.text = tx; state.result = analyze(tx, state.opts); G.secLocks = { hook: true, promise: true, intro: true, body: true, close: true };
          const R = state.result, failed = Object.values(R.sections).flat().filter((r) => !r.passed || r.warn);
          const L = secLockedRanges(), c = buildFixCards(tx, R, state.opts, failed, 99, Infinity), raw = _buildFixCardsSx(tx, R, state.opts, failed, 99, Infinity);
          const out = { ids: c.map((x) => x.id), rawIds: raw.map((x) => x.id), inLocked: c.some((x) => (x.evidence || []).some((e) => L.some((r) => e.start < r.end && e.end > r.start))), rawInLocked: raw.some((x) => (x.evidence || []).some((e) => L.some((r) => e.start < r.end && e.end > r.start))), locked: L.map((r) => r.k), aiInLocked: c.filter((x) => x.ai && x.ai.start != null && L.some((r) => x.ai.start < r.end && x.ai.end > r.start)).map((x) => x.id), rawAiInLocked: raw.filter((x) => x.ai && x.ai.start != null && L.some((r) => x.ai.start < r.end && x.ai.end > r.start)).map((x) => x.id), aiOffEv: c.filter((x) => x.ai && x.ai.start != null && !(x.evidence || []).some((e) => x.ai.start < e.end && x.ai.end > e.start)).map((x) => x.id) };
          state.text = keep[0]; state.result = keep[1]; G.secLocks = JSON.parse(keep[2]); return out; })()""")
        main_ids = {"hook", "cta", "ending", "kwopen", "bigidea", "rehook", "application"}
        ok("step 5 (setup): «Regular» has main-section cards and evidence in its fixed sections", bool(set(cards["rawIds"]) & main_ids) and cards["rawInLocked"], cards)
        ok("step 5: no card for the main sections, no evidence inside a fixed section", not (set(cards["ids"]) & main_ids) and not cards["inLocked"] and len(cards["locked"]) >= 2, cards)
        # B-064 (Adrian, 2026-11-03: "several paragraphs suggested here for change, but the suggestion is a different text"): the AI
        # rewrite of a card works on one of the sentences the card shows, never on one inside a fixed section
        ok("B-064 (setup): «Regular» has a card whose AI fragment lies in a fixed section", bool(cards["rawAiInLocked"]), cards["rawAiInLocked"])
        ok("B-064: the AI fragment of every card is one of its shown sentences, none inside a fixed section", not cards["aiInLocked"] and not cards["aiOffEv"], (cards["aiInLocked"], cards["aiOffEv"]))
        await pg.evaluate("window.scrollTo(0, 0); document.getElementById('ed').scrollTop = 0"); await pg.wait_for_timeout(400)
        locks = await pg.evaluate("[...document.querySelectorAll('.sx-lock')].map(x => x.innerText.replace(/\s+/g, ' ').trim())")
        ok("step 5: fixed sections show closed with a lock and «Volver a abrir»", len(locks) >= 1 and all("Volver a abrir" in x for x in locks), locks)
        lk = await pg.evaluate("""(() => { const ed = document.getElementById('ed'), er = ed.getBoundingClientRect(), textLeft = er.left + parseFloat(getComputedStyle(ed).paddingLeft);
          const boxes = [...document.querySelectorAll('.sx-lock')], ls = [...document.querySelectorAll('.sx-lock-l')].map(l => l.getBoundingClientRect());
          const b0 = boxes[0] && boxes[0].getBoundingClientRect(), y = b0 ? Math.min(b0.bottom, er.bottom) - 12 : 0, hit = b0 ? document.elementFromPoint(textLeft + 60, y) : null;
          return { clear: boxes.every(b => getComputedStyle(b).backgroundColor === 'rgba(0, 0, 0, 0)'), margin: ls.every(r => r.right <= textLeft + 0.5),
            // the name with its lock fits its label (INTRODUCCIÓN ran into the text, 2026-11-02): content, not just the box
            fits: [...document.querySelectorAll('.sx-lock-l')].every(l => l.scrollWidth <= l.clientWidth + 0.5),
            overlap: ls.some((a, i) => ls.slice(i + 1).some(b => a.bottom > b.top + 0.5 && b.bottom > a.top + 0.5)), textOnTop: !!(hit && ed.contains(hit)), n: ls.length }; })()""")
        ok("B-057: a fixed section is an outline: its text shows and takes the click, labels in the margin, none on another", lk["n"] >= 1 and lk["clear"] and lk["margin"] and lk["fits"] and not lk["overlap"] and lk["textOnTop"], lk)
        await pg.click(".sx-lock [data-sx-unlock]"); await pg.wait_for_timeout(600)
        ok("step 5: «Volver a abrir» goes back to the main sections with it open", await pg.evaluate("!!document.querySelector('[data-sx-root]') && !G.secLocks.hook && Object.keys(G.secLocks).length === 4"), await pg.evaluate("JSON.stringify(G.secLocks)"))
        ok("step 6: back in the main sections the bar shows step 2", await pg.evaluate("document.querySelector('#stepBar .sb button.on .sb-l').textContent") == "Secciones principales")
        await pg.click("#stepBar [data-sx-detail='1']"); await pg.wait_for_timeout(600)
        ok("step 6: «Revisión detallada» on the bar opens the detailed review", await pg.evaluate("!document.querySelector('[data-sx-root]') && !!document.querySelector('[data-rp-root]')"))
        await pg.click("#guide .g-nav-steps [data-step='1']"); await pg.wait_for_timeout(600)
        ok("step 6: «← Atrás» in the detailed review goes back to the main sections", await pg.evaluate("V.step === 2 && !!document.querySelector('[data-sx-root]')"))
        ok("B-056 (setup): the detailed call's report is marked detail", await pg.evaluate("G.report && G.report.detail === true"))
        # a report saved by the old one-screen flow (no `detail`, a hook item): the detailed screen runs its own call once, keeps the old
        await pg.evaluate("(() => { const r = JSON.parse(JSON.stringify(G.report)); delete r.detail; r.items = [{ area: 'hook', original: 'x', replacement: 'y', alts: [], why: 'viejo', after: 4 }]; G.report = rpClean(r); G.reportOld = null; window.__n0 = window.__tiers.length; })()")
        await pg.click("#stepBar [data-sx-detail='1']"); await pg.wait_for_timeout(1500)
        st = await pg.evaluate("""(() => { const b = JSON.parse(JSON.stringify(prodBody(Date.now()))), o = rpClean(b.reportOld);
          return { calls: window.__tiers.slice(window.__n0), detail: !!G.report && G.report.detail === true, hookItems: (G.report && G.report.items || []).filter(i => i.area === 'hook').length,
            old: o && o.items[0] && o.items[0].why, card: (document.querySelector('[data-rp-root]') || {}).innerText || '' }; })()""")
        ok("B-056: an old one-screen report on the detailed screen gets one detailed call; the old one is saved as reportOld", st["calls"] == ["complex"] and st["detail"] and st["hookItems"] == 0 and st["old"] == "viejo", {k: st[k] for k in ("calls", "detail", "hookItems", "old")})
        await pg.click("#guide .g-nav-steps [data-step='1']"); await pg.wait_for_timeout(600)
        await pg.click("#stepBar [data-sx-detail='1']"); await pg.wait_for_timeout(1200)
        ok("B-056: coming back to the detailed screen asks nothing more", await pg.evaluate("window.__tiers.slice(window.__n0)") == ["complex"], await pg.evaluate("window.__tiers.slice(window.__n0)"))
        await pg.click("#guide .g-nav-steps [data-step='1']"); await pg.wait_for_timeout(600)
        wraps = []
        for w in (900, 1100, 1280, 1440, 1920):
            await pg.set_viewport_size({"width": w, "height": 900}); await pg.wait_for_timeout(300)
            r = await pg.evaluate("(() => { const bs = [...document.querySelectorAll('#stepBar .sb button')].map(b => b.getBoundingClientRect()); return { rows: new Set(bs.map(b => Math.round(b.top))).size, over: document.documentElement.scrollWidth > innerWidth }; })()")
            if r["rows"] != 1 or r["over"]: wraps.append((w, r))
        ok("step 6: the 4-step bar stays on one row with nothing wider than the window, 900-1920 px", not wraps, wraps)
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.wait_for_timeout(500)
        ph = await pg.evaluate("(() => { const vw = innerWidth; return { over: [...document.querySelectorAll('#stepBar *')].filter(e => e.getBoundingClientRect().right > vw + 1).length, n: document.querySelectorAll('#stepBar .sb button').length }; })()")
        ok("step 6: on a 390 px phone the four steps fit", ph["over"] == 0 and ph["n"] == 4, ph)
        await pg.set_viewport_size({"width": 1400, "height": 900}); await pg.wait_for_timeout(300)
        rt = await pg.evaluate("""(() => { const b = JSON.parse(JSON.stringify(prodBody(Date.now()))); const want = { locks: JSON.stringify(Object.keys(G.secLocks).sort()), n: G.secReport.items.length, key: G.secReport.key };
          applyProd('x1', b); const got = { locks: JSON.stringify(Object.keys(G.secLocks).sort()), n: G.secReport && G.secReport.items.length, key: G.secReport && G.secReport.key };
          applyProd('x2', { text: 'Un guion viejo.', title: 'Viejo' }); const old = [G.secReport, JSON.stringify(G.secLocks), JSON.stringify(G.secBounds)];
          applyProd('x3', { text: 'x', secReport: { key: 5 }, secLocks: { hook: 'yes', close: true }, secBounds: { body: -3, intro: 12 } }); const bad = [G.secReport, JSON.stringify(G.secLocks), JSON.stringify(G.secBounds)];
          return { want, got, old, bad }; })()""")
        ok("saved: report, locks and key survive save and load", rt["want"] == rt["got"], rt)
        ok("an old episode without the new fields loads clean", rt["old"] == [None, "{}", "{}"], rt["old"])
        ok("malformed saved values are dropped, never coerced", rt["bad"] == [None, '{"close":true}', '{"intro":12}'], rt["bad"])
        ok("no page error", not errs, errs)
        await pg.close()
        pg, errs = await page(b)
        await pg.click("[data-sx-pick=body]"); await pg.wait_for_timeout(300)
        await pg.click(".sx-card [data-sx=adjust]"); await pg.wait_for_timeout(300)
        ok("«Ajustar límites» asks for a tap", "Toca en el guion" in await pg.evaluate("document.querySelector('.sx-card').innerText"))
        body0 = await pg.evaluate("mainSections(state.text, state.result, G.secBounds).list.find(s => s.k === 'body').start")
        target = await pg.evaluate("""(b0) => { wkBuild(); const b = WK.blocks.find(x => x.s > b0 + 400 && x.el.textContent.trim().length > 40); if (!b) return null; b.el.scrollIntoView({ block: 'center' }); const r = b.el.getBoundingClientRect(); return { x: r.left + 140, y: r.top + 8, s: b.s }; }""", body0)
        if target:
            await pg.mouse.click(target["x"], target["y"]); await pg.wait_for_timeout(500)
            got = await pg.evaluate("({ b: G.secBounds.body, start: mainSections(state.text, state.result, G.secBounds).list.find(s => s.k === 'body').start })")
            ok("tapping a later paragraph moves where the body starts", got["b"] == target["s"] and got["start"] == target["s"], (target, got))
        else:
            ok("tapping a later paragraph moves where the body starts", False, "no paragraph on screen to tap")
        await pg.click("[data-sx-pick=close]"); await pg.wait_for_timeout(300)
        await pg.click(".sx-card [data-sx=adjust]"); await pg.wait_for_timeout(300)
        first = await pg.evaluate("(() => { wkBuild(); WK.blocks[0].el.scrollIntoView({ block: 'center' }); const r = WK.blocks[0].el.getBoundingClientRect(); return { x: r.left + 140, y: r.top + 8 }; })()")
        await pg.mouse.click(first["x"], first["y"]); await pg.wait_for_timeout(500)
        ok("a close start before everything else is refused and said", "no puede ser ese inicio" in await pg.evaluate("document.querySelector('[data-sx-root]').innerText") and await pg.evaluate("G.secBounds.close === undefined"))
        ok("adjust: no page error", not errs, errs)
        await pg.close()
        # B-062 (jadri47, 2026-11-02, pick B): the opening of Adrian's episode (the same text as eval/sections_test.js «B-059»), where
        # «Y quiero empezar…» (introduction) started mid-paragraph and its box overlapped the promise's: the review splits it off
        import re as _re, json as _json
        paras = _json.loads("[" + _re.search(r"// B-059.*?const text = \[(.*?)\]\.join", open("../eval/sections_test.js", encoding="utf-8").read(), _re.S).group(1).strip().rstrip(",") + "]")
        pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-secs-off','0');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
        await pg.evaluate("(t) => { caps.sample = Promise.resolve(null); $('script').value = t; }", "\n\n".join(paras)); await pg.wait_for_timeout(200)
        await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
        sp = await pg.evaluate("""(() => { const v = $('script').value, m = mainSections(state.text, state.result, G.secBounds).list, b = (k) => { const e = document.querySelector('.sx-box.sx-' + k); return e ? e.getBoundingClientRect() : null; };
          const p = b('promise'), i = b('intro');
          return { split: v.includes('para esta semana.\\n\\nY quiero empezar'), editor: ED.el.innerText.includes('para esta semana.\\n\\nY quiero empezar') || [...ED.el.children].some(c => c.textContent.startsWith('Y quiero empezar')),
            same: state.text === v, mid: m.filter(s => s.start > 0 && v[s.start - 1] !== '\\n').map(s => s.k),
            boxes: !!(p && i), overlap: p && i ? Math.round(p.bottom - i.top) : null }; })()""")
        ok("B-062: a main section starting mid-paragraph gets its own paragraph, in the editor too", sp["split"] and sp["editor"] and sp["same"] and sp["mid"] == [], sp)
        ok("B-062: the promise and introduction boxes no longer overlap", sp["boxes"] and sp["overlap"] is not None and sp["overlap"] <= 12, sp)
        same_words = await pg.evaluate("(t) => $('script').value.replace(/\\s+/g, ' ') === t.replace(/\\s+/g, ' ')", "\n\n".join(paras))
        ok("B-062: not a word of the script changes", same_words)
        ok("B-062: no page error", not errs, errs)
        await b.close()
    print("FAILS:", fails or "none")
asyncio.run(main())
