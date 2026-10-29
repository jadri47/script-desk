# Logged episodes: hookPassed is a boolean when written and the Results readers accept the old row-object shape too (B-008, 2026-10-29).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU + "standalone/site/index.html"
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
# eight episodes with intros, hookPassed in the shape the writer saved before 2026-10-29: the hook ROW of the review (an object), never a boolean
OLD = "(() => { const row = (p) => ({ id: 'hook', passed: p, warn: false, label: 'x' }); return [60, 62, 65, 70, 40, 42, 45, 50].map((intro, i) => ({ intro, avgViewed: 50, hookPassed: row(i < 4), flags: [], icon: 'verde' })); })()"
NEW = "(() => [60, 62, 65, 70, 40, 42, 45, 50].map((intro, i) => ({ intro, avgViewed: 50, hookPassed: i < 4, flags: [], icon: 'verde' })))()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ui in ["es", "en"]:
            pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-expert','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            # the readers: the same eight episodes, saved by the old writer (row objects) and by the new one (booleans), must read the same
            got = await pg.evaluate(f"(() => {{ state.historyReady = true; state.episodes = {NEW}; const b = channelNote(); state.episodes = {OLD}; const a = channelNote(); return {{ same: a === b, hookLine: b.length > 0 && b !== channelNote.call(null) ? false : true, a, b }}; }})()")
            ok(f"{ui}: Results read hookPassed saved as a row object the same as a boolean", got["same"], (got["a"][-160:], got["b"][-160:]))
            ok(f"{ui}: with 4 passed and 4 failed hooks the channel note carries the hook sentence", "intro" in got["b"].lower() and got["b"].count("%") >= 3, got["b"][-200:])
            # the writer: the value saved with an episode is a boolean (or null when the script cannot be analysed), never the row
            w = await pg.evaluate("(() => { try { const v = hookPassedOf(EXAMPLES.es.mid.text, 'es'); return [typeof v, v]; } catch (e) { return ['error', String(e)]; } })()")
            ok(f"{ui}: the writer's hookPassed is a boolean", w[0] == "boolean", w)
            # the form validates at the boundary (B-019, 2026-10-29): seconds 00-59, Intro and percentage viewed 0-100, and a keypad that can type the colon
            # one saved version in the mock db (loadHistory re-reads it on every save, so seeding state.saved alone would vanish)
            await pg.evaluate("(() => { window.__rows['guiones/s1'] = { collection: 'guiones', id: 's1', data: { title: 'Guion', text: EXAMPLES.es.mid.text, lang: 'es', syllables: 100, runtimeSec: 600, flags: [], passed: 1, total: 1, createdAt: Date.now() } }; return loadHistory(); })()"); await pg.wait_for_timeout(400)
            ok(f"{ui}: the episode form is on screen", await pg.locator("#epDur").count() == 1)
            ok(f"{ui}: the mm:ss fields do not force a numeric keypad (no colon on iOS)", await pg.evaluate("$('epDur').getAttribute('inputmode') !== 'numeric'"), await pg.evaluate("$('epDur').getAttribute('inputmode')"))
            await pg.fill("#epDur", "24:75"); await pg.fill("#epIntro", "60"); await pg.evaluate("saveEpisode()"); await pg.wait_for_timeout(400)
            ok(f"{ui}: 24:75 is refused as a length", await pg.evaluate("$('epStatus').textContent === t('durFormat') && !Object.keys(window.__rows || {}).some((k) => k.startsWith('episodios/'))"), await pg.evaluate("[$('epStatus').textContent, Object.keys(window.__rows || {})]"))
            await pg.fill("#epDur", "24:30"); await pg.fill("#epIntro", "150"); await pg.evaluate("saveEpisode()"); await pg.wait_for_timeout(400)
            ok(f"{ui}: an intro of 150 % is refused", await pg.evaluate("$('epStatus').textContent === t('epRange') && !Object.keys(window.__rows || {}).some((k) => k.startsWith('episodios/'))"), await pg.evaluate("[$('epStatus').textContent, Object.keys(window.__rows || {})]"))
            await pg.fill("#epIntro", "68"); await pg.fill("#epAvg", "35"); await pg.evaluate("saveEpisode()"); await pg.wait_for_timeout(600)
            ok(f"{ui}: a valid episode is saved with a boolean hookPassed", await pg.evaluate("(() => { const k = Object.keys(window.__rows || {}).find((x) => x.startsWith('episodios/')); return !!k && typeof window.__rows[k].data.hookPassed === 'boolean' && window.__rows[k].data.realSec === 1470; })()"), await pg.evaluate("Object.values(window.__rows || {}).map((r) => r.data)"))
            # B-037 (2026-10-29, pick A): «Abrir» with other text in the editor asks first; opening clears the old result and starts a new episode
            await pg.evaluate("$('script').value = 'Texto mío que no quiero perder'; G.prodId = 'p1'; state.result = { sections: {} }")
            await pg.evaluate("document.querySelector('#historyBody [data-open]').click()"); await pg.wait_for_timeout(300)
            ok(f"{ui}: history «Abrir» asks first and leaves the typed text", await pg.evaluate("!!($('clrDlg') && $('clrDlg').open) && $('script').value === 'Texto mío que no quiero perder'"), await pg.evaluate("$('script').value.slice(0, 40)"))
            await pg.evaluate("$('clrNo').click()"); await pg.wait_for_timeout(200)
            ok(f"{ui}: Cancelar keeps everything", await pg.evaluate("$('script').value === 'Texto mío que no quiero perder' && G.prodId === 'p1'"))
            await pg.evaluate("document.querySelector('#historyBody [data-open]').click()"); await pg.wait_for_timeout(300)
            await pg.evaluate("$('clrYes').click()"); await pg.wait_for_timeout(700)
            op = await pg.evaluate("({ same: $('script').value === EXAMPLES.es.mid.text, id: G.prodId, res: state.result })")
            ok(f"{ui}: after Abrir the saved version is in the editor, as a new episode, with the old result gone", op["same"] and op["id"] is None and op["res"] is None, op)
            # B-019 leftover: a target length that cannot be read is said, not stored and ignored
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(400)
            await pg.evaluate("G.target = '10:00'; goPhase('prep')"); await pg.wait_for_timeout(400)
            has = await pg.evaluate("!!$('gTarget')")
            if has:
                await pg.fill("#gTarget", "12 min"); await pg.evaluate("$('gTarget').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(200)
                tg = await pg.evaluate("({ msg: ($('gTargetErr') || {}).textContent, target: G.target, inv: $('gTarget').getAttribute('aria-invalid') })")
                ok(f"{ui}: «12 min» as a target is refused with a message and not stored", tg["msg"] == await pg.evaluate("t('targetBad')") and tg["target"] == "10:00" and tg["inv"] == "true", tg)
            else:
                ok(f"{ui}: the target field is on screen", False)
            ok(f"{ui}: no page errors", not errs, errs)
            await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
