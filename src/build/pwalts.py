# Alternatives in step 2 (report_ui.js): a change with alternatives shows a radio list (editor's suggestion + others), the chosen one
# is what gets applied and what «Lo escribo yo» starts from; an alternative that fails a check never shows. A yellow ad warning with
# words from the report becomes a decision with word choices («✓ sin riesgo de anuncios»), the chosen word replaces the term. A report
# saved before alternatives existed (no alts, no words) still loads and shows the old layout. ES + EN, desktop + phone.
# caps.sample is a test-local mock, so no real call is ever made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"pick": "Aplicar y seguir →", "main": "Propuesta del editor", "alt": "Otra opción", "words": "Elige otra palabra", "safe": "✓ sin riesgo de anuncios", "soft": "Aviso amarillo: Puede limitar anuncios", "after": "Después"},
      "en": {"pick": "Apply and continue →", "main": "Editor's suggestion", "alt": "Another option", "words": "Choose another word", "safe": "✓ no ad risk", "soft": "Yellow warning: Can limit ads", "after": "After"}}
# two clean sentences of the demo (unique, away from verses), as in pwreport
PICK = r"""() => { ensureReview();
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start) && !R.riskHits.some((h) => h.start < x.at + x.s.length && h.end > x.at); });
  return [sents[2].s, sents[5].s];
}"""
# words: every flagged term gets ["golpes", "una masacre" (risky: must be dropped), "azotes"]
MOCK = r"""([picks, en]) => { ensureReview();
  window.__calls = 0;
  const tail = en ? ', and that changes everything.' : ', y eso lo cambia todo.';
  const r = (s, t) => s.replace(/[.!?]$/, '') + t;
  const terms = [...new Set(state.result.riskHits.map((x) => x.text.toLowerCase()))];
  const json = { areas: { hook: { rating: 3, why: 'x' }, promise: { rating: 4, why: '' }, retention: { rating: 4, why: '' }, voice: { rating: 4, why: '' }, close: { rating: 4, why: '' }, return: { rating: 4, why: '' } },
    items: [{ area: 'hook', original: picks[0], replacement: r(picks[0], tail), alts: [r(picks[0], en ? ', and that is the point.' : ', y esa es la clave.'), '⟦V1⟧ ' + picks[0], r(picks[0], en ? ', and listen closely.' : ', y escucha bien.')], why: 'w', after: 5 },
            { area: 'close', original: picks[1], replacement: r(picks[1], tail), why: 'w', after: 5 }],
    words: terms.map((t) => ({ term: t, alts: en ? ['blows', 'a massacre', 'lashes'] : ['golpes', 'una masacre', 'azotes'] })) };
  caps.sample = Promise.resolve({ serverRules: true, json: async () => { window.__calls++; return JSON.parse(JSON.stringify(json)); } });
}"""
DEC = r"""() => { const d = document.querySelector('.rp-dec'); if (!d) return null;
  return { title: (d.querySelector('#rpD') || {}).textContent || '', tag: (d.querySelector('.rp-tag') || {}).textContent || '', radios: [...d.querySelectorAll('input[name=rpPick]')].map((x) => ({ v: x.value, c: x.checked, t: x.closest('label').querySelector('.rp-opt-t').textContent, k: x.closest('label').querySelector('.hint').textContent })),
    words: [...d.querySelectorAll('.rp-words')].map((f) => ({ term: f.querySelector('legend').textContent, chips: [...f.querySelectorAll('.rp-chip')].map((c) => ({ t: c.querySelector('b').textContent, safe: c.querySelector('.rp-safe').textContent, c: c.querySelector('input').checked })) })),
    lbl: [...d.querySelectorAll('.fx-lbl')].map((x) => x.textContent), apply: (d.querySelector('[data-rp=apply]') || {}).textContent || '', dt: [...d.querySelectorAll('dt')].map((x) => x.textContent), err: (d.querySelector('.status.err') || {}).textContent || '' }; }"""
async def open_page(b, ui, vp):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def go(pg, demo, ui):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(900)
    picks = await pg.evaluate(PICK)
    await pg.evaluate(MOCK, [picks, ui == "en"])
    await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
    return picks
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            X = TX[ui]
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                # ---- «excelente»: no flagged words, so the first decision is change 1 (with alternatives)
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                picks = await go(pg, "best", ui)
                d = await pg.evaluate(DEC)
                ok(f"{n}: a change with alternatives shows the editor's suggestion and the clean others (the one with a verse mark is gone)", d and len(d["radios"]) == 3 and d["radios"][0]["c"] and d["radios"][0]["k"] == X["main"] and all(r["k"] == X["alt"] for r in d["radios"][1:]) and not any("⟦" in r["t"] for r in d["radios"]), d and d["radios"])
                ok(f"{n}: the button says «{X['pick']}»", d and d["apply"] == X["pick"], d and d["apply"])
                alt2 = d["radios"][2]["t"] if d and len(d["radios"]) > 2 else ""
                await pg.click('input[name=rpPick][value="2"]'); await pg.wait_for_timeout(300)
                st = await pg.evaluate("({ v: (document.querySelector('input[name=rpPick]:checked') || {}).value, f: document.activeElement && document.activeElement.name === 'rpPick' && document.activeElement.value, pick: RP.pick })")
                ok(f"{n}: picking an alternative keeps it chosen and keeps the focus on it", st["v"] == "2" and st["f"] == "2", st)
                await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(300)
                st = await pg.evaluate("({ v: (document.querySelector('input[name=rpPick]:checked') || {}).value, cur: rpCurrent() && rpCurrent().id })")
                ok(f"{n}: the arrow keys move between the options and never skip the decision", st["v"] == "1" and st["cur"] == "item:0", st)
                await pg.click('input[name=rpPick][value="2"]'); await pg.wait_for_timeout(300)
                await pg.click("[data-rp=write]"); await pg.wait_for_timeout(200)
                wv = await pg.evaluate("($('rpW') || {}).value")
                ok(f"{n}: «Lo escribo yo» starts from the chosen option", wv == alt2, wv)
                await pg.click("[data-rp=wcancel]"); await pg.wait_for_timeout(200)
                await pg.screenshot(path=OUT + f"alts-item-{ui}-{nm}.png")
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(1500)
                txt = await pg.evaluate("$('script').value")
                ok(f"{n}: applying puts in the chosen option, not the editor's suggestion", alt2 and alt2 in txt and picks[0] not in txt, alt2)
                d = await pg.evaluate(DEC)
                ok(f"{n}: a change without alternatives keeps the plain «{X['after']}» line and the same «Aplicar y seguir» button", d and not d["radios"] and X["after"] in d["dt"] and d["apply"] == X["pick"], d)
                ok(f"{n}: no page errors (excelente)", not errs, errs)
                await pg.close()
                # ---- «muy flojo» (bad): yellow violence warning; the report has words for its terms
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await go(pg, "bad", ui)
                info = await pg.evaluate("({ cur: rpCurrent() && rpCurrent().id, soft: rpCurrent() && !!rpCurrent().d && !!rpCurrent().d.soft, words: G.report && G.report.words })")
                d = await pg.evaluate(DEC)
                ok(f"{n}: a yellow ad warning with words from the report becomes a decision", info["soft"] and d and d["tag"] == X["soft"], (info, d and d["tag"]))
                ok(f"{n}: the risky alternative («una masacre») is never offered", info["words"] and all(("masacre" not in a and "massacre" not in a) for v in info["words"].values() for a in v), info["words"])
                ok(f"{n}: each flagged word gets its own choices, each marked safe", d and d["words"] and X["words"] in d["lbl"] and all(len(r["chips"]) == 2 and r["chips"][0]["c"] and all(c["safe"] == X["safe"] for c in r["chips"]) for r in d["words"]), d and d["words"])
                await pg.screenshot(path=OUT + f"alts-words-{ui}-{nm}.png")
                first = await pg.evaluate("(() => { const d = rpCurrent().d, w = reportWordRows(state.text, state.result, d.card.id.slice(3), G.report.words, {}); return w.rows[0]; })()")
                ok(f"{n}: one row per word, not per occurrence", d and len(d["words"]) == len(set(r["term"].split(" ·")[0] for r in d["words"])), d and [r["term"] for r in d["words"]])
                await pg.click('input[name="rpW0"][value="1"]'); await pg.wait_for_timeout(300)
                hits0 = await pg.evaluate("state.result.riskHits.length")
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(1500)
                want = first["alts"][1]
                txt = await pg.evaluate("$('script').value")
                left = await pg.evaluate("(k) => state.result.riskHits.filter((x) => x.text.toLowerCase() === k).length", first["key"])
                # (2026-10-28, option B) a sentence that reports Scripture keeps its word, so «everywhere» = outside Scripture and outside those
                keptK = await pg.evaluate("(k) => { const ss = scriptureSentences(state.text, state.result); return state.result.riskHits.filter((x) => x.text.toLowerCase() === k && ss.some((s) => x.start < s.end && x.end > s.start)).length; }", first["key"])
                ok(f"{n}: the chosen word replaces the term everywhere outside Scripture and the sentences that report it", left == keptK and txt.lower().count(want.lower()) >= len(first["hits"]), (first["key"], left, keptK, len(first["hits"])))
                ok(f"{n}: fewer flagged words after applying", await pg.evaluate("state.result.riskHits.length") < hits0)
                # the violence card: «masacre», «tortura», «ejecución» sit in a sentence that says «como dice la Biblia»: kept, and the card says so
                for _ in range(3):
                    cur = await pg.evaluate("(() => { const c = rpCurrent(); if (!c || c.type !== 'risk') return null; const w = rpWords(c); return { id: c.d.card.id, kept: w ? w.kept : 0 }; })()")
                    if cur and cur["kept"]: break
                    if not await pg.query_selector("[data-rp=skip]"): break
                    await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(500)
                kt = await pg.evaluate("(document.querySelector('.rp-dec .rp-kept') || {}).textContent || ''")
                ok(f"{n}: a card with words kept for Scripture says so in one line", cur and cur["kept"] > 0 and (("la Biblia" in kt) if ui == "es" else ("Bible" in kt)), (cur, kt))
                ok(f"{n}: no page errors (muy flojo)", not errs, errs)
                # ---- a report saved before alternatives existed (shape written by 5eb53f5's rpRun): loads, old layout
                old = {"at": "2026-10-22T10:42:00.000Z", "key": "", "areas": {k: {"rating": 4, "why": "x"} for k in ["hook", "promise", "retention", "voice", "close", "return"]},
                       "items": [{"area": "hook", "original": "X", "replacement": "Y", "why": "w", "after": 5}], "dropped": 0}
                cl = await pg.evaluate("(o) => rpClean(o)", old)
                ok(f"{n}: an old saved report loads with empty alternatives and no words", cl and cl["items"][0]["alts"] == [] and cl["words"] == {} and cl["items"][0]["replacement"] == "Y", cl)
                ok(f"{n}: garbage alternatives in a saved report are cleaned", (await pg.evaluate("(o) => rpClean(o)", {**old, "items": [{**old["items"][0], "alts": ["ok", 5, "", None, "b", "c"]}], "words": {"Tortura": ["golpes", 3], "x": "no"}})) == {**cl, "items": [{**cl["items"][0], "alts": ["ok", "b"]}], "words": {"tortura": ["golpes"]}})
                await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
