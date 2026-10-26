# One read of the script (2026-10-25: "read the text once, instead of every time the user taps sugerir con IA"): the editor's report call also
# answers the problems with no rule-made fix; «Proponer con IA» and the coach then show those answers with no new call, until the text of
# that fragment changes. A report saved before this (no `fixes`) still works and the button calls as before; an option that alters a verse mark
# never shows. caps.sample is a test-local mock, so no real call is ever made. Needs mock_sb.js (guest demo).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# kinds of call: report (carries the fixes block), coach (=== i1…), button (aiFix: «3 opciones»). The report answer gives each fragment
# one clean option, one that invents a verse mark (must never show) and areas for the ratings.
MOCK = r"""() => {
  window.__calls = { report: [], coach: 0, button: 0 };
  const areas = Object.fromEntries(['hook', 'promise', 'retention', 'voice', 'close', 'return'].map((k) => [k, { rating: 4, why: 'x' }]));
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => {
    await new Promise((r) => setTimeout(r, 200));
    if (/FRAGMENTOS A ARREGLAR|FRAGMENTS TO FIX/.test(prompt) || /Eres editor de un canal|You are an editor for a YouTube/.test(prompt)) {
      const ids = [...prompt.matchAll(/^=== (f\d+)$/gm)].map((m) => m[1]);
      window.__calls.report.push({ ids, tier: opts.modelTier, auto: !!opts.auto, last: prompt.lastIndexOf('GUION:') > prompt.indexOf('FRAGMENTOS A ARREGLAR') || prompt.lastIndexOf('SCRIPT:') > prompt.indexOf('FRAGMENTS TO FIX') || ids.length === 0 });
      const fixes = [...prompt.matchAll(/^=== (f\d+)\n[\s\S]*?(?:FRAGMENTO A REESCRIBIR|FRAGMENT TO REWRITE):\n"{3}\n([\s\S]*?)\n"{3}/gm)].map((m) => ({ id: m[1], options: [{ text: m[2].trim() + ' Piénsalo.', why: 'del informe' }, { text: m[2].trim() + ' ⟦V99⟧', why: 'inventa un versículo' }] }));
      return { areas, items: [], words: [], fixes };
    }
    if (/^=== i\d+/m.test(prompt)) { window.__calls.coach++; return { items: [] }; }
    if (!/Reescribe SOLO el fragmento|Rewrite ONLY/.test(prompt)) return { idea: '' }; // the central-idea question and other prompts are not ours
    window.__calls.button++;
    const frag = (prompt.match(/(?:FRAGMENTO A REESCRIBIR|FRAGMENT TO REWRITE):\n"{3}\n([\s\S]*?)\n"{3}/) || [])[1] || 'x';
    return { options: [{ text: frag.trim() + ' Del botón.', why: 'botón' }] };
  } });
}"""
async def open_page(b, ui, vp, coach_off=True):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-more-open','1');" + (" localStorage.setItem('sd-coach-off','1');" if coach_off else ""))
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def start(pg, demo="mid"):
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
    await pg.evaluate(MOCK)
    await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
CALLS = "(() => ({ report: window.__calls.report.length, coach: window.__calls.coach, button: window.__calls.button }))()"
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
                ok(f"{n}: one report call, complex, not automatic, with the problems in it and the script last", c["report"] == 1 and rc.get("tier") == "complex" and not rc.get("auto") and len(rc.get("ids", [])) >= 2 and rc.get("last"), rc)
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
                await pg.close()
        # ---- the coach (no walker): its first problem is answered with no automatic call
        for ui in ["es", "en"]:
            pg, errs = await open_page(b, ui, {"width": 1400, "height": 900}, coach_off=False)
            await start(pg)
            c = await pg.evaluate(CALLS)
            r = await pg.evaluate("(() => { const d = COACH.list.find((x) => x.needsAi && x.card && x.card.ai); return d ? { opts: coachAiOptions(d).length, calls: COAI.calls } : null; })()")
            ok(f"{ui}: the coach has a ready option for its first AI problem and made no automatic call", r and r["opts"] >= 1 and r["calls"] == 0 and c["coach"] == 0, (r, c))
            ok(f"{ui}: no page errors (coach)", not errs, errs)
            await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
