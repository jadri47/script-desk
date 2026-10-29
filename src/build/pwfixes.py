# One read of the script (2026-10-25: "read the text once, instead of every time the user taps sugerir con IA"): the editor's report call also
# answers the problems with no rule-made fix; «Proponer con IA» and the coach then show those answers with no new call, until the text of
# that fragment changes. A report saved before this (no `fixes`) still works and the button calls as before; an option that alters a verse mark
# never shows. caps.sample is a test-local mock, so no real call is ever made. Needs mock_sb.js (guest demo).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# (Adrian, 2026-10-29: "B: fixes leave the report call") The report call carries no fragments; they go in their own calls after it,
# 6 per call, one at a time, each batch saved as it arrives. A failed batch leaves the others and offers «Reintentar».
# kinds of call: report (no ids), fix (=== f1…, its own marker text, no script), coach (=== i1…), button (aiFix: «3 opciones»). The report answer gives each fragment
# one clean option, one that invents a verse mark (must never show) and areas for the ratings.
MOCK = r"""() => {
  window.__calls = { report: [], fix: [], coach: 0, button: 0 }; window.__fixN = 0; window.__failFix = 0;
  const areas = Object.fromEntries(['hook', 'promise', 'retention', 'voice', 'close', 'return'].map((k) => [k, { rating: 4, why: 'x' }]));
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => {
    await new Promise((r) => setTimeout(r, window.__delay || 200));
    if (/Eres editor de un canal|You are an editor for a YouTube/.test(prompt)) {
      const ids = [...prompt.matchAll(/^=== (f\d+)$/gm)].map((m) => m[1]);
      window.__calls.report.push({ ids, tier: opts.modelTier, auto: !!opts.auto, last: prompt.lastIndexOf('GUION:') > prompt.indexOf('Responde solo con JSON') || prompt.lastIndexOf('SCRIPT:') > prompt.indexOf('Answer only with JSON') });
      return { areas, items: [], words: [] };
    }
    if (/FRAGMENTOS A ARREGLAR|FRAGMENTS TO FIX/.test(prompt)) {
      const ids = [...prompt.matchAll(/^=== ([bf]\d+)$/gm)].map((m) => m[1]);
      if (ids.length && ids[0][0] === 'b') { // «Proponer con IA» with no stored answer asks like a batch (B-002, 2026-10-29): one clean option, one with an invented verse mark
        window.__calls.button++;
        const frag = (prompt.match(/(?:FRAGMENTO A REESCRIBIR|FRAGMENT TO REWRITE):\n"{3}\n([\s\S]*?)\n"{3}/) || [])[1] || 'x';
        return { fixes: [{ id: ids[0], options: [{ text: frag.trim() + ' Del botón.', why: 'botón' }, { text: frag.trim() + ' ⟦V99⟧', why: 'inventa un versículo' }] }] };
      }
      window.__calls.fix.push({ ids, tier: opts.modelTier, auto: !!opts.auto, label: typeof AIS !== 'undefined' ? AIS.label : null, // the wrapper strips aiLabel from opts; the bubble holds it
         script: /GUION:|SCRIPT:/.test(prompt), busy: RP.busy });
      window.__fixN++;
      if (window.__failFix && window.__fixN === window.__failFix) throw { code: 'server_error' };
      const fixes = [...prompt.matchAll(/^=== (f\d+)\n[\s\S]*?(?:FRAGMENTO A REESCRIBIR|FRAGMENT TO REWRITE):\n"{3}\n([\s\S]*?)\n"{3}/gm)].map((m) => ({ id: m[1], options: [{ text: m[2].trim() + ' Piénsalo.', why: 'del informe' }, { text: m[2].trim() + ' ⟦V99⟧', why: 'inventa un versículo' }] }));
      if (window.__truncFix && window.__fixN === window.__truncFix[0]) { // the answer hit the output cap (Adrian, 2026-10-29: "never lose the work")
        const raw = JSON.stringify({ fixes }), o = raw.indexOf('"options":[');
        throw { code: 'truncated', raw: window.__truncFix[1] === 'some' ? raw.slice(0, raw.indexOf('}', o) + 1) : raw.slice(0, o + 20) };
      }
      return { fixes };
    }
    if (/^=== i\d+/m.test(prompt)) { window.__calls.coach++; return { items: [] }; }
    if (!/Reescribe SOLO el fragmento|Rewrite ONLY/.test(prompt)) return { idea: '' }; // the central-idea question and other prompts are not ours
    window.__calls.button++;
    if (window.__failButton) throw { code: 'server_error' }; // B-017: the button call fails
    const frag = (prompt.match(/(?:FRAGMENTO A REESCRIBIR|FRAGMENT TO REWRITE):\n"{3}\n([\s\S]*?)\n"{3}/) || [])[1] || 'x';
    return { options: [{ text: frag.trim() + ' Del botón.', why: 'botón' }, { text: frag.trim() + ' ⟦V99⟧', why: 'inventa un versículo' }] };
  } });
}"""
async def open_page(b, ui, vp, coach_off=True):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-more-open','1');" + (" localStorage.setItem('sd-coach-off','1');" if coach_off else ""))
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def start(pg, demo="mid", fail=0, trunc=None):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
    await pg.evaluate(MOCK)
    if fail: await pg.evaluate(f"window.__failFix = {fail}")
    if trunc: await pg.evaluate(f"window.__truncFix = {trunc!r}")
    await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
    await pg.wait_for_function("RP.fix && !RP.fix.run", timeout=20000)
CALLS = "(() => ({ report: window.__calls.report.length, fix: window.__calls.fix.length, coach: window.__calls.coach, button: window.__calls.button }))()"
PUMPED = "RP.fix && !RP.fix.run"
BATCH = 6
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await start(pg)
                c = await pg.evaluate(CALLS)
                rc = (await pg.evaluate("window.__calls.report"))[0] if c["report"] else {}
                ok(f"{n}: one report call, complex, not automatic, with no fragments in it and the script last", c["report"] == 1 and rc.get("tier") == "complex" and not rc.get("auto") and len(rc.get("ids", [])) == 0 and rc.get("last"), rc)
                fc = await pg.evaluate("window.__calls.fix")
                tot = await pg.evaluate("RP.fix.total")
                ok(f"{n}: the fragments go in ceil(n/6) fix calls of at most 6 each, complex, not automatic, no script, report not busy, labelled «Arreglos/Fixes d/n»", tot >= 7 and len(fc) == -(-tot // BATCH) and all(0 < len(x["ids"]) <= BATCH and x["tier"] == "complex" and not x["auto"] and not x["script"] and x["busy"] is False and re.match(r"^(Arreglos|Fixes) \d+/" + str(tot) + "$", x["label"] or "") for x in fc) and sum(len(x["ids"]) for x in fc) == tot, (tot, fc))
                ok(f"{n}: the pump never held the report's busy flag and every batch landed", await pg.evaluate("RP.busy === false && RP.fix.done === RP.fix.total && Object.keys(RP.fix.err).length === 0 && !document.querySelector('.rp-fixlost')"))
                ok(f"{n}: the report keeps the vetted answers for those problems (the invented verse mark is gone)", await pg.evaluate("!!G.report && G.report.fixes.length >= 2 && G.report.fixes.every((f) => f.options.length === 1 && !/⟦/.test(f.options[0].text))"), await pg.evaluate("G.report && JSON.stringify(G.report.fixes).slice(0, 300)"))
                ok(f"{n}: no coach call and no button call so far", c["coach"] == 0 and c["button"] == 0, c)
                # a card with the AI button whose problem the report answered
                idx = await pg.evaluate("state.fixCards.findIndex((c) => c.ai && G.report.fixes.some((f) => f.id === c.id))")
                ok(f"{n}: the walker has a «Proponer con IA» card the report answered", idx >= 0, idx)
                if idx >= 0:
                    # the card may be collapsed in the walker (not visible): click it through the page so the real handler runs
                    ok(f"{n}: the card's button exists", await pg.evaluate(f"!!document.querySelector('[data-fxai=\"{idx}\"]')"))
                    await pg.evaluate(f"document.querySelector('[data-fxai=\"{idx}\"]').click()")
                    await pg.wait_for_timeout(500)
                    c2 = await pg.evaluate(CALLS)
                    opts = await pg.evaluate(f"(state.fixAi[state.fixCards[{idx}].id] || {{}}).options ? state.fixAi[state.fixCards[{idx}].id].options.map((o) => o.patches ? state.text.slice(0, 0) + o.patches[0].rep : o.value) : null")
                    ok(f"{n}: «Proponer con IA» answers at once from the report: no new call of any kind", c2 == c, (c, c2))
                    ok(f"{n}: the options shown are the report's, none with a verse mark", opts and len(opts) == 1 and "Piénsalo." in opts[0] and "⟦" not in opts[0], opts)
                    # the same fragment edited: the stored answer no longer fits, so the button asks again
                    cid = await pg.evaluate(f"state.fixCards[{idx}].id")
                    await pg.evaluate(f"(() => {{ const c = state.fixCards[{idx}], f = G.report.fixes.find((x) => x.id === c.id); const t = $('script').value; $('script').value = t.replace(f.orig, f.orig.replace(/\S+/, 'ZZZ')); }})()")
                    await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(1500)  # hidden in step 2: same handler as the button
                    idx2 = await pg.evaluate(f"state.fixCards.findIndex((c) => c.id === {cid!r})")
                    ok(f"{n}: a card whose fragment changed has no stored answer any more", idx2 >= 0, idx2)
                    await pg.evaluate(f"aiFix({max(idx2, 0)})"); await pg.wait_for_timeout(600)
                    c3 = await pg.evaluate(CALLS)
                    ok(f"{n}: after that fragment changed, the button asks again (one button call) and no new report is made behind its back", c3["button"] == 1 and c3["report"] == 1, c3)
                    # the button's own call is vetted like a batch: an option with an invented verse mark never shows (B-002, 2026-10-29)
                    opts3 = await pg.evaluate(f"(state.fixAi[{cid!r}] || {{}}).options ? state.fixAi[{cid!r}].options.map((o) => o.patches ? o.patches[0].rep : o.value) : null")
                    ok(f"{n}: the button's options are vetted: the clean one shows, the one with a verse mark never does", opts3 is not None and len(opts3) == 1 and "Del botón." in opts3[0] and "⟦" not in opts3[0], opts3)
                # B-017 (a): a failed button call shows the error and gives the button back (it was left disabled)
                await pg.evaluate("window.__failButton = true; state.fixAi = {}")
                idx3 = await pg.evaluate("state.fixCards.findIndex((c) => c.ai && !G.report.fixes.some((f) => f.id === c.id && f.orig && state.text.includes(f.orig)))")
                if idx3 < 0: idx3 = await pg.evaluate("state.fixCards.findIndex((c) => c.ai)")
                await pg.evaluate(f"(() => {{ const c = state.fixCards[{idx3}]; G.report.fixes = G.report.fixes.filter((f) => f.id !== c.id); COAI.cache = {{}}; renderGuide(); }})()")
                await pg.wait_for_timeout(400)
                idx3 = await pg.evaluate("state.fixCards.findIndex((c) => c.ai && !state.fixAi[c.id])")
                await pg.evaluate(f"document.querySelector('[data-fxai=\"{idx3}\"]').click()"); await pg.wait_for_timeout(700)
                fe = await pg.evaluate(f"(() => {{ const b = document.querySelector('[data-fxai=\"{idx3}\"]'); const bx = document.getElementById('fxai-{idx3}'); return {{ err: !!(state.fixAi[state.fixCards[{idx3}].id] || {{}}).error, btn: !!b, dis: b ? b.disabled : null, box: bx ? bx.textContent.length : -1 }}; }})()")
                ok(f"{n}: a failed «Proponer con IA» call shows the error and the button is enabled again", fe["err"] and fe["btn"] and fe["dis"] is False, fe)
                await pg.evaluate("window.__failButton = false")
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
                # ---- a report saved before this: no fixes key
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await start(pg)
                await pg.evaluate("(() => { const o = JSON.parse(JSON.stringify(G.report)); delete o.fixes; COAI.cache = {}; G.report = rpClean(o); rpPrimeFixes(); })()")
                ok(f"{n}: an old saved report loads with no fixes and primes nothing", await pg.evaluate("G.report.fixes.length === 0 && Object.keys(COAI.cache).length === 0"))
                await pg.evaluate("renderGuide()"); await pg.wait_for_timeout(400)
                idx = await pg.evaluate("state.fixCards.findIndex((c) => c.ai)")
                before = await pg.evaluate(CALLS)
                await pg.evaluate(f"aiFix({idx})"); await pg.wait_for_timeout(600)
                after = await pg.evaluate(CALLS)
                ok(f"{n}: with an old report the button calls as before", after["button"] == before["button"] + 1, (before, after))
                # garbage in a stored report is cleaned
                cl = await pg.evaluate("rpClean({ at: 'x', key: 'k', areas: {}, items: [], fixes: [null, { id: 'p', orig: 'o', options: [{ text: ' a ' }, { text: 5 }, null, { text: 'b' }, { text: 'c' }] }, { id: '', orig: 'o', options: [{ text: 'z' }] }, { id: 'q', orig: 'o', options: [] }, 'x'] })")
                ok(f"{n}: stored fixes are cleaned (strings only, at most 2 options, empty ones dropped)", cl and len(cl["fixes"]) == 1 and [o["text"] for o in cl["fixes"][0]["options"]] == ["a", "b"], cl and cl["fixes"])
                # a fix for an EMPTY field (a title not written yet) has orig "" and must survive the reload: it is paid work for the very case the field is empty (B-006, 2026-10-29)
                cl2 = await pg.evaluate("rpClean({ at: 'x', key: 'k', areas: {}, items: [], fixes: [{ id: 'search', orig: '', field: 'title', options: [{ text: '¿Qué dice la Biblia sobre la ansiedad?' }] }, { id: 'hook', orig: '', options: [{ text: 'z' }] }] })")
                ok(f"{n}: a stored fix for an empty field is kept, one for empty script text is not", cl2 and [f["id"] for f in cl2["fixes"]] == ["search"] and cl2["fixes"][0]["field"] == "title" and cl2["fixes"][0]["orig"] == "", cl2 and cl2["fixes"])
                await pg.close()
        # ---- a batch that fails: the others stay, the line says how many did not arrive, Reintentar asks that batch again (one call)
        for ui in ["es", "en"]:
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm} failing batch"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await start(pg, "mid", fail=2)
                tot = await pg.evaluate("RP.fix.total")
                c = await pg.evaluate(CALLS)
                ok(f"{n}: the 2nd fix call threw once and the pump still ran every batch", c["fix"] == 2 and tot > BATCH, c)
                ok(f"{n}: the first batch's options stay in the report and the failed batch is recorded", await pg.evaluate("G.report.fixes.length === 6 && Object.keys(RP.fix.err).join() === '2' && RP.fix.done === 6 && RP.fix.total > 6"), await pg.evaluate("[G.report.fixes.length, JSON.stringify(RP.fix.err)]"))
                ok(f"{n}: the options that did arrive are primed for the buttons", await pg.evaluate("G.report.fixes.every((f) => COAI.cache[f.id] && COAI.cache[f.id].status === 'done')"))
                txt = await pg.evaluate("(document.querySelector('.rp-fixlost') || {}).textContent || ''")
                lost = tot - BATCH
                want = f"No llegaron {lost} arreglos" if ui == "es" else f"{lost} fixes did not arrive"
                ok(f"{n}: the walker shows «{want}» with a Reintentar button", want in txt and await pg.evaluate("!!document.querySelector('[data-rp-fixre=\"2\"]')") and await pg.is_visible("[data-rp-fixre=\"2\"]"), txt)
                await pg.click("[data-rp-fixre=\"2\"]"); await pg.wait_for_function("RP.fix && !RP.fix.run", timeout=15000); await pg.wait_for_timeout(300)
                c = await pg.evaluate(CALLS)
                ok(f"{n}: Reintentar made exactly one more call, with only the failed batch's fragments", c["fix"] == 3 and len((await pg.evaluate("window.__calls.fix"))[2]["ids"]) == lost, c)
                ok(f"{n}: after the retry all of them are in the report, no error and no line", await pg.evaluate(f"G.report.fixes.length === {tot} && RP.fix.done === {tot} && Object.keys(RP.fix.err).length === 0 && !document.querySelector('.rp-fixlost') && RP.busy === false"))
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        # ---- the FIRST batch fails: the pump goes on with the second one, whose options are kept
        pg, errs = await open_page(b, "es", {"width": 1400, "height": 900})
        await start(pg, "mid", fail=1)
        tot = await pg.evaluate("RP.fix.total")
        c = await pg.evaluate(CALLS)
        ok("es/d first batch failing: the pump still asked the 2nd batch and kept its options", c["fix"] == 2 and await pg.evaluate(f"G.report.fixes.length === {tot - BATCH} && Object.keys(RP.fix.err).join() === '1'"), c)
        ok("es/d first batch failing: no page errors", not errs, errs)
        await pg.close()
        # ---- a batch cut at the output cap: the options that arrived complete are kept; a cut with nothing complete is an error
        for ui in ["es", "en"]:
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900})
            await start(pg, "mid", trunc=[2, "some"])
            tot = await pg.evaluate("RP.fix.total")
            c = await pg.evaluate(CALLS)
            ok(f"{ui} cut batch with one complete option: the pump still ran every batch", c["fix"] == -(-tot // BATCH) and tot > BATCH, (c, tot))
            ok(f"{ui} cut batch with one complete option: its first fragment keeps that option, and no error is recorded", await pg.evaluate(f"G.report.fixes.length === {BATCH} + 1 && G.report.fixes[{BATCH}].options.length === 1 && G.report.fixes[{BATCH}].options[0].text.includes('Piénsalo.') && Object.keys(RP.fix.err).length === 0 && !document.querySelector('.rp-fixlost')"), await pg.evaluate("[G.report.fixes.length, Object.keys(RP.fix.err)]"))
            ok(f"{ui} cut batch with one complete option: no page errors", not errs, errs)
            await pg.close()
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900})
            await start(pg, "mid", trunc=[2, "none"])
            tot = await pg.evaluate("RP.fix.total")
            ok(f"{ui} cut batch with nothing complete: that batch is recorded as lost, the others stay", await pg.evaluate(f"Object.keys(RP.fix.err).join() === '2' && G.report.fixes.length === {BATCH}"), await pg.evaluate("[G.report.fixes.length, Object.keys(RP.fix.err)]"))
            ok(f"{ui} cut batch with nothing complete: the walker offers Reintentar", await pg.evaluate("!!document.querySelector('[data-rp-fixre=\"2\"]')"))
            ok(f"{ui} cut batch with nothing complete: no page errors", not errs, errs)
            await pg.close()
        # ---- «Medir de nuevo» while the fix batches run: the old pump stops, no batch is paid twice (B-023, 2026-10-29) ----
        for ui in ["es"]:
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900})
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(800)
            await pg.evaluate(MOCK); await pg.evaluate("window.__delay = 600")
            await pg.click("#runBtn")
            await pg.wait_for_function("RP.fix && RP.fix.run && RP.fix.done === 0", timeout=20000)  # the first batch is in flight (the mock records a call only when its delay ends)
            await pg.evaluate("rpAct('re')")
            await pg.wait_for_timeout(1000)
            await pg.wait_for_function(PUMPED, timeout=30000); await pg.wait_for_timeout(1500)
            tot = await pg.evaluate("RP.fix.total"); c = await pg.evaluate(CALLS); nb = -(-tot // BATCH)
            ok(f"{ui} re-measure during the batches: two reports, {nb} new fix calls plus the one already in flight, every fragment once", tot > BATCH and c["report"] == 2 and c["fix"] == nb + 1 and await pg.evaluate("new Set(G.report.fixes.map((f) => f.id)).size === G.report.fixes.length && RP.fix.done === RP.fix.total"), (c, nb, await pg.evaluate("[RP.fix.done, RP.fix.total, G.report.fixes.map((f) => f.id)]")))
            ok(f"{ui} re-measure during the batches: no page errors", not errs, errs)
            await pg.close()
        # ---- the coach (no walker): its first problem is answered with no automatic call
        for ui in ["es", "en"]:
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900}, coach_off=False)
            await start(pg)
            c = await pg.evaluate(CALLS)
            r = await pg.evaluate("(() => { const d = COACH.list.find((x) => x.needsAi && x.card && x.card.ai); return d ? { opts: coachAiOptions(d).length, calls: COAI.calls } : null; })()")
            ok(f"{ui}: the coach has a ready option for its first AI problem and made no automatic call", r and r["opts"] >= 1 and r["calls"] == 0 and c["coach"] == 0, (r, c))
            ok(f"{ui}: the coach's fragments were answered by fix batches (no coach call even after a render)", c["fix"] >= 1 and c["coach"] == 0, c)
            # B-030: the proposal's short label follows the UI language ("· AI" in English); the AI tag is keyed on a flag, not on the label text
            lbl = await pg.evaluate("(() => { const d = COACH.list.find((x) => x.needsAi && x.card && x.card.ai && coachAiOptions(x).length); if (!d) return null; const o = coachAiOptions(d)[0]; return { ai: o.ai === true, html: coChoiceHTML(d, state.result) }; })()")
            want = "· IA</span>" if ui == "es" else "· AI</span>"
            ok(f"{ui}: the AI proposal reads «{want[:-7]}» and carries the AI flag and tag", bool(lbl) and lbl["ai"] and want in lbl["html"] and (ui == "es" or "· IA</span>" not in lbl["html"]) and "cc-ai" in lbl["html"], lbl and lbl["ai"])
            ok(f"{ui}: no page errors (coach)", not errs, errs)
            await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
