# Failures that used to be silent now say so: episode list load, publish-date save, saved-versions load, rehearsal pace save.
# The database is replaced by one that rejects, so nothing real is touched. Needs a member-mode mock (series/snapshots need a db).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
TEXT = open("long_es.txt", encoding="utf-8").read(); MOCK = open("mockclaude.js").read(); SB = open("mock_sb.js").read()
URL = SDU + "standalone/site/index.html"
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# a db whose every read and write rejects (promise-returning, like the real one)
BAD = """(() => { const no = () => Promise.reject(new Error("offline"));
  const ref = { orderBy: () => ref, where: () => ref, limit: () => ref, get: no, set: no, update: no, delete: no, add: no, doc: () => ref, collection: () => ref };
  return { collection: () => ref, doc: () => ref, batch: () => ({ set() {}, update() {}, delete() {}, commit: no }) }; })()"""
async def run(b, ui):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(e.message + " @ " + " | ".join((e.stack or "").split("\n")[1:4])))  # with the stack: a bare message hides where it came from
    await pg.add_init_script(MOCK)
    await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-expert','1'); localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", TEXT); await pg.click("#runBtn"); await pg.wait_for_timeout(700)
    await pg.click("[data-mode=guion]"); await pg.wait_for_selector("#gSeriesFull-a", state="attached", timeout=5000)  # the card sits in the history block, hidden in this view
    await pg.evaluate("window.__realDb = caps.db")
    # 1. episode list fails to load -> message + Retry, old list kept; Retry with a working db clears it
    await pg.evaluate(f"caps.db = Promise.resolve({BAD}); G.prods = [{{id:'e1',title:'Uno',status:'borrador',updatedAt:1,pubDate:'',nextEp:'',hasText:true}}]")
    await pg.evaluate("loadProds()"); await pg.wait_for_timeout(500)
    ok(f"{ui}: failed episode load says so", await pg.evaluate("!!document.querySelector('#gSeriesFull .status.err[role=alert]')"))
    ok(f"{ui}: failed episode load offers Retry", await pg.locator("#gSeriesFull [data-retry=prods]").count() == 1)
    ok(f"{ui}: the episode already listed is still shown", "Uno" in await pg.evaluate("document.getElementById('gSeriesFull').textContent"))
    await pg.evaluate("caps.db = window.__realDb"); await pg.evaluate("(document.querySelector('#gSeriesFull [data-retry=prods]')||{click(){}}).click()"); await pg.wait_for_timeout(600)
    ok(f"{ui}: Retry clears the message once the load works", await pg.locator("#gSeriesFull .status.err").count() == 0)
    # 2. typed publish date fails to save -> message, previous date kept
    await pg.evaluate(f"G.prods = [{{id:'e2',title:'Dos',status:'borrador',updatedAt:1,pubDate:'2026-12-01',nextEp:'',hasText:true}}]; G.prodId = ''; caps.db = Promise.resolve({BAD}); renderSeriesAll()")
    await pg.evaluate("setPubDate('e2', '2026-12-25')"); await pg.wait_for_timeout(500)
    ok(f"{ui}: failed date save says so", await pg.evaluate("!!document.querySelector('#gSeriesFull .status.err[role=alert]')"))
    ok(f"{ui}: failed date save keeps the previous date", await pg.evaluate("G.prods.find(p=>p.id==='e2').pubDate") == "2026-12-01")
    await pg.evaluate("caps.db = window.__realDb")
    # 3. saved versions fail to load -> message + Retry
    await pg.evaluate(f"G.prodId = 'e3'; caps.db = Promise.resolve({BAD}); goPhase('after')"); await pg.wait_for_timeout(400)
    await pg.evaluate("loadSnaps()"); await pg.wait_for_timeout(500)
    ok(f"{ui}: failed versions load says so", await pg.evaluate("!!document.querySelector('#gRev .status.err[role=alert]')"))
    ok(f"{ui}: failed versions load offers Retry", await pg.locator("#snapRetry").count() == 1)
    await pg.evaluate("caps.db = window.__realDb")
    # 4. rehearsal pace fails to save -> says the pace was not saved (and does not claim it was updated)
    await pg.evaluate(f"caps.db = Promise.resolve({BAD}); goPhase('rec')"); await pg.wait_for_timeout(400)
    await pg.click("#gReh"); await pg.wait_for_timeout(300)  # the real rehearsal: start, then step through every section
    await pg.keyboard.press("Space"); await pg.wait_for_timeout(1500)
    for i in range(40):
        if await pg.locator("#rehApply").count(): break
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(700)  # laps under 0.5 s are ignored
    if await pg.locator("#rehApply").count():
        await pg.locator("#rehApply").click(); await pg.wait_for_timeout(500)
        msg = await pg.inner_text("#rehMsg")
        ok(f"{ui}: failed pace save says so", msg == await pg.evaluate("t('rehNotSaved')"), msg)
        # B-020 (c): «Guardar ensayo» with no episode to save into must not say it was saved, and a second click must not add a second rehearsal
        await pg.evaluate("G.prodId = null; G.rehearsals = []")
        await pg.click("#rehSave"); await pg.wait_for_timeout(200)
        r1 = await pg.evaluate("({ msg: $('rehMsg').textContent, n: G.rehearsals.length, dis: $('rehSave').disabled })")
        ok(f"{ui}: «Guardar ensayo» without an episode says it was not saved and disables itself", r1["msg"] == await pg.evaluate("t('rehNoEpisode')") and r1["dis"] is True, r1)
    else:
        ok(f"{ui}: rehearsal Apply button reachable", False)
    await pg.evaluate("caps.db = window.__realDb; if (typeof ppClose === 'function') ppClose();")  # teardown of the rehearsal: an open prompter outlives an episode switch and crashes (B-038, its own test when fixed)
    # 5. the clipboard fallback: execCommand("copy") returns false instead of throwing; «Copiado» must not show then (B-020, 2026-10-29)
    n = await pg.evaluate("(() => { const real = document.execCommand; document.execCommand = () => false; let n = 0; try { fallbackCopy('x', () => n++); } finally { document.execCommand = real; } return n; })()")
    ok(f"{ui}: a failed copy does not say «Copiado»", n == 0, n)
    # 6. opening another episode within the 2 s save debounce must save the one being left first (B-016)
    await pg.evaluate("(t) => { window.__rows['producciones/a'] = { collection: 'producciones', id: 'a', data: { text: t + '\\n\\nTexto A.', title: 'A', status: 'borrador', updatedAt: 1 } }; window.__rows['producciones/b'] = { collection: 'producciones', id: 'b', data: { text: t + '\\n\\nTexto B.', title: 'B', status: 'borrador', updatedAt: 1 } }; }", TEXT)
    await pg.evaluate("openProd('a')"); await pg.wait_for_timeout(300)
    await pg.evaluate("$('script').value = $('script').value + ' Editado.'; markDirty()")
    await pg.evaluate("openProd('b')"); await pg.wait_for_timeout(2600)
    rows = await pg.evaluate("({ a: window.__rows['producciones/a'].data.text.slice(-20), b: window.__rows['producciones/b'].data.text.slice(-20), open: G.prodId })")
    ok(f"{ui}: the edit made just before switching episodes is saved, the other episode untouched", rows["a"].endswith("Texto A. Editado.") and rows["b"].endswith("Texto B.") and rows["open"] == "b", rows)
    # 7. blocked storage (private mode): the editor must not claim the draft is saved on this device (B-020). Last: storage stays blocked.
    await pg.evaluate("(() => { Storage.prototype.setItem = function () { throw new Error('blocked'); }; G.prodId = null; $('script').value = 'Texto sin episodio'; afterChange(); })()")
    await pg.wait_for_timeout(300)
    lbl = await pg.evaluate("($('edSave') || {}).textContent")
    ok(f"{ui}: with storage blocked the editor says the draft was NOT saved on this device", lbl == await pg.evaluate("t('edLocalFail')") and lbl != await pg.evaluate("t('edLocal')"), lbl)
    # 8. every error code the server or the client can throw has its own sentence (B-005, 2026-10-29); none falls to «error desconocido»
    codes = ["network", "upstream", "daily_limit", "auto_paused", "not_member", "no_sample", "bad_request", "no_key", "quota_exceeded", "db_error", "not_granted", "rate_limited", "cancelled", "invalid_json", "truncated"]
    bad = await pg.evaluate("(cs) => cs.filter((c) => { const s = errText({ code: c }); return !s || s === t('errGeneric')(t('unknownErr')); })", codes)
    ok(f"{ui}: every AI/db error code has its own sentence", bad == [], bad)
    ij = await pg.evaluate("errText({ code: 'invalid_json' })")
    ok(f"{ui}: invalid_json no longer tells the person to shorten the script (that was truncation)", "corto" not in ij and "shorter" not in ij, ij)
    ok(f"{ui}: no page errors", not errs, errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b = await getattr(p, __import__("os").environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]: await run(b, ui)
        print("FAILS:", fails); await b.close()
asyncio.run(main())
