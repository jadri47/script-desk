# Text the person typed is never replaced by an older answer or snapshot (B-013, 2026-10-29): Ask «todo el guion», Deshacer, «Usar esta versión» and «Volver al original» refuse when the script changed since.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU + "standalone/site/index.html"
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
MOCK = r"""() => { caps.sample = Promise.resolve({ serverRules: true, json: async (prompt) => {
  await new Promise((r) => setTimeout(r, 150));
  if (/Traduce este guion|Adapta este guion/.test(prompt)) {
    let v = $('script').value;
    if (window.__trAlter) { const q = findQuotes(v)[0]; if (q) v = v.slice(0, q.start + 1) + 'palabras que no son las del versículo citado aquí' + v.slice(q.end - 1); return { script: v, verify: [] }; } // a quoted verse comes back changed (B-015)
    return { script: 'TRADUCIDO ' + v, verify: [] };
  }
  if (/Eres editor de un canal|You are an editor|FRAGMENTOS A ARREGLAR|FRAGMENTS TO FIX|^=== i\d+/m.test(prompt)) return { areas: {}, items: [], words: [], fixes: [], items2: [] };
  return { reply: 'ok', replacement: 'RESPUESTA ENTERA.' }; // Ask Claude
} }); }"""
NEW = "\n\nTEXTO NUEVO que escribí después."
async def open_page(b, demo=True):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-more-open','1'); localStorage.setItem('sd-coach-off','1')")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    if demo: await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(800)
    await pg.evaluate(MOCK)
    return pg, errs
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- Ask Claude about the whole script, then type: «Aplicar» must refuse ----
        pg, errs = await open_page(b)
        await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
        await pg.fill("#askQ", "¿Qué mejorarías?"); await pg.click("#askGo"); await pg.wait_for_timeout(800)
        ok("ask: an answer for the whole script arrived", await pg.evaluate("!!(ASK.ans && ASK.ans.replacement && ASK.ans.target === 'all')"), await pg.evaluate("ASK.ans"))
        await pg.evaluate(f"$('script').value = $('script').value + {NEW!r}"); await pg.wait_for_timeout(300)
        await pg.click("#askApply"); await pg.wait_for_timeout(400)
        v = await pg.evaluate("$('script').value")
        ok("ask: after typing, «Aplicar» keeps what was typed and does not paste the old answer", "TEXTO NUEVO" in v and "RESPUESTA ENTERA" not in v, v[-120:])
        ok("ask: it says the script changed", await pg.evaluate("ASK.err === t('askChanged')"), await pg.evaluate("ASK.err"))
        ok("no page errors (ask)", not errs, errs)
        await pg.close()
        # ---- a fix applied, then typing: «Deshacer» must refuse instead of dropping the typing ----
        pg, errs = await open_page(b)
        await pg.click("#runBtn"); await pg.wait_for_timeout(1500)
        cnt = await pg.locator("[data-fxapply]:visible").count()
        ok("undo: the walker has a fix to apply", cnt > 0, cnt)
        if cnt:
            await pg.locator("[data-fxapply]:visible").first.click(); await pg.wait_for_timeout(1200)
            ok("undo: the fix applied (one undo snapshot)", await pg.evaluate("state.fixUndo.length === 1"), await pg.evaluate("state.fixUndo.length"))
            await pg.evaluate(f"$('script').value = $('script').value + {NEW!r}"); await pg.wait_for_timeout(300)
            await pg.evaluate("undoFix()"); await pg.wait_for_timeout(600)
            v = await pg.evaluate("$('script').value")
            ok("undo: after typing, Deshacer keeps what was typed", "TEXTO NUEVO" in v, v[-120:])
            ok("undo: the snapshot is still there (nothing was undone)", await pg.evaluate("state.fixUndo.length === 1"), await pg.evaluate("state.fixUndo.length"))
        ok("no page errors (undo)", not errs, errs)
        await pg.close()
        # ---- a translation that arrives after the script changed: «Usar esta versión» must refuse; «Volver al original» too ----
        pg, errs = await open_page(b)
        await pg.evaluate("if ($('trToggle').getAttribute('aria-expanded') !== 'true') $('trToggle').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("trRun()"); await pg.wait_for_timeout(700)
        ok("translate: a translation arrived", await pg.evaluate("!!(TR.res && TR.res.script)"), await pg.evaluate("TR.err"))
        await pg.evaluate(f"$('script').value = $('script').value + {NEW!r}"); await pg.wait_for_timeout(300)
        await pg.evaluate("trApply()"); await pg.wait_for_timeout(400)
        v = await pg.evaluate("$('script').value")
        ok("translate: after typing, «Usar esta versión» keeps the typed text and does not paste the translation", "TEXTO NUEVO" in v and not v.startswith("TRADUCIDO"), v[:60])
        ok("translate: it says the script changed", await pg.evaluate("!!TR.err"), await pg.evaluate("TR.err"))
        # apply for real, type, then «Volver al original» must refuse
        await pg.evaluate("trRun()"); await pg.wait_for_timeout(700)
        await pg.evaluate("trApply()"); await pg.wait_for_timeout(400)
        ok("translate: applied when nothing changed", await pg.evaluate("$('script').value.startsWith('TRADUCIDO') && !!TR.undo"))
        await pg.evaluate(f"$('script').value = $('script').value + {NEW!r}"); await pg.wait_for_timeout(300)
        await pg.evaluate("trUndo()"); await pg.wait_for_timeout(400)
        v = await pg.evaluate("$('script').value")
        ok("translate: after typing, «Volver al original» keeps the typed text", "TEXTO NUEVO" in v and v.startswith("TRADUCIDO"), v[:60])
        ok("no page errors (translate)", not errs, errs)
        await pg.close()
        # ---- same language, same Bible version: a quoted verse must come back word for word, else the answer is refused (B-015, 2026-10-29) ----
        pg, errs = await open_page(b)
        nq = await pg.evaluate("findQuotes($('script').value).length")
        ok("adapt: the demo has a quoted verse to protect", nq > 0, nq)
        await pg.evaluate("window.__trAlter = true; TR.target = trSource() === 'latam' ? 'neutral' : 'latam'; TR.ver = $('translation').value")
        await pg.evaluate("trRun()"); await pg.wait_for_timeout(700)
        ok("adapt: an answer that changed a quoted verse is refused, with a message", await pg.evaluate("!TR.res && !!TR.err"), await pg.evaluate("[!!TR.res, TR.err]"))
        ok("no page errors (adapt)", not errs, errs)
        await pg.close()
        # ---- an example never loses typed text: the picker keeps it and «Salir del ejemplo» brings it back (design; the old step-1 sample button is gone, B-016) ----
        pg, errs = await open_page(b, demo=False)
        await pg.evaluate("goStep(1); $('script').value = 'Mi propio texto'; updateLive()"); await pg.wait_for_timeout(300)
        await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
        ok("example: the picker loads the example", await pg.evaluate("$('script').value === EXAMPLES.es.best.text"))
        await pg.evaluate("exitDemo()"); await pg.wait_for_timeout(700)
        ok("example: leaving the example brings the typed text back", await pg.evaluate("$('script').value === 'Mi propio texto'"), await pg.evaluate("$('script').value.slice(0, 40)"))
        ok("no page errors (example)", not errs, errs)
        await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
