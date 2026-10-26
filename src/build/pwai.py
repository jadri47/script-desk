# AI status bubble (aistatus_ui.js): every AI call shows «La IA está pensando…» on the score with a running clock, then «Listo» that
# closes after ~5 s and leaves a check on the pill; a failure shows «La IA no respondió» + Reintentar (report); a cancelled call shows
# nothing; two calls at once say so; a re-wrapped caps.sample (bible_ui style) still counts once; our options never reach the
# connection. ES + EN, desktop + phone. caps.sample is a test-local mock, so no real call is ever made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"think": "La IA está pensando…", "two": "La IA está pensando… (2 tareas)", "wait": "Todavía no hay respuesta. Puede tardar hasta un minuto.", "done": "Listo: la IA ha respondido", "lbl": "Informe del editor", "fail": "La IA no respondió", "retry": "Reintentar", "noans": "Aún no ha respondido.", "vwait": "Esperando el informe del editor"},
      "en": {"think": "The AI is thinking…", "two": "The AI is thinking… (2 tasks)", "wait": "No answer yet. It can take up to a minute.", "done": "Done: the AI has answered", "lbl": "Editor's report", "fail": "The AI did not answer", "retry": "Retry", "noans": "No answer yet.", "vwait": "Waiting for the editor's report"}}
# mode: "ok" answers after `delay` with a minimal valid report; "fail" rejects the first call, answers later ones
MOCK = r"""([delay, mode]) => {
  window.__calls = []; window.__keys = [];
  const json = { areas: { hook: { rating: 4, why: 'x' }, promise: { rating: 4, why: '' }, retention: { rating: 4, why: '' }, voice: { rating: 4, why: '' }, close: { rating: 4, why: '' }, return: { rating: 4, why: '' } }, items: [] };
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => {
    window.__calls.push(opts.modelTier); window.__keys.push(Object.keys(opts).join(','));
    await new Promise((r, j) => { const tm = setTimeout(r, delay); if (opts.signal) opts.signal.addEventListener('abort', () => { clearTimeout(tm); j({ code: 'cancelled' }); }); });
    if (mode === 'fail' && window.__calls.length === 1) throw { code: 'server_error', message: 'boom' };
    return JSON.parse(JSON.stringify(json));
  } });
}"""
BUB = r"""() => { const b = document.getElementById('aiBub'); if (!b) return null; const r = b.getBoundingClientRect(), p = document.getElementById('scorePill');
  return { hidden: b.hidden, cls: b.className, h: (b.querySelector('.ai-h b') || {}).textContent || '', p: [...b.querySelectorAll('p')].map((x) => x.textContent).join('|'), el: (b.querySelector('[data-ai-el]') || {}).textContent || '',
    retry: !!b.querySelector('[data-ai=retry]'), left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, vw: innerWidth, vh: innerHeight,
    pill: p ? (p.querySelector('.sc-ai') || {}).className || '' : null, pillHidden: p ? p.hidden : null,
    tailX: r.right - parseFloat(b.style.getPropertyValue('--ai-tail')) - 7, tailDir: b.dataset.tail, pr: p && !p.hidden ? p.getBoundingClientRect().toJSON() : null }; }"""
async def open_page(b, ui, vp):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            X = TX[ui]
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
                await pg.evaluate(MOCK, [2500, "ok"])
                await pg.click("#runBtn"); await pg.wait_for_timeout(700)
                s = await pg.evaluate(BUB)
                ok(f"{n}: while the report call runs the bubble says the AI is thinking", s and not s["hidden"] and "busy" in s["cls"] and s["h"] == X["think"] and s["p"] == X["wait"], s)
                ok(f"{n}: the score pill shows the thinking dots", s and s["pill"] == "sc-ai busy", s and s["pill"])
                ok(f"{n}: the bubble fits on screen", s and s["left"] >= 0 and s["right"] <= s["vw"] and s["top"] >= 0 and s["bottom"] <= s["vh"], s)
                pr = s and s["pr"]
                ok(f"{n}: the tail points at the score pill, on the side facing it", pr and pr["left"] <= s["tailX"] <= pr["right"] and ((s["tailDir"] == "up" and s["top"] >= pr["bottom"]) or (s["tailDir"] == "down" and s["bottom"] <= pr["top"])), (s and s["tailX"], s and s["tailDir"], pr))
                if nm == "m": ok(f"{n}: on a phone the bubble spans the width with 16 px gutters", s and abs(s["w"] - (s["vw"] - 32)) < 1 and abs(s["left"] - 16) < 1, s)
                wt = await pg.evaluate("(document.querySelector('.rp-wait') || {}).textContent || ''")
                ok(f"{n}: the report panel says no answer has come yet", X["noans"] in wt, wt)
                # the verdict card left step 2 (2026-10-26): the wait is read from the score bubble, and verdictOf (logic) still says it
                ok(f"{n}: step 2 shows no verdict card", await pg.locator("#guide .gv").count() == 0)
                await pg.evaluate("scOpenPop()"); await pg.wait_for_timeout(250)
                lamp = await pg.evaluate("(document.querySelector('#scPop .sc-wait b') || {}).textContent || ''")
                ok(f"{n}: while the AI reads, the score bubble says it is waiting (not «Listo para grabar»)", lamp == X["vwait"] and await pg.evaluate("verdictOf(state.result).t") == X["vwait"], lamp)
                await pg.evaluate("scClosePop(true)")
                e0 = s["el"] if s else ""
                await pg.wait_for_timeout(1300)
                s = await pg.evaluate(BUB)
                ok(f"{n}: the clock runs", s and s["el"] != e0 and s["el"].startswith("0:0"), (e0, s and s["el"]))
                await pg.screenshot(path=OUT + f"ai-busy-{ui}-{nm}.png")
                await pg.wait_for_timeout(1200)
                s = await pg.evaluate(BUB)
                ok(f"{n}: when the answer comes the bubble says «Listo» and names the report", s and not s["hidden"] and "done" in s["cls"] and s["h"] == X["done"] and s["p"] == X["lbl"], s)
                ok(f"{n}: the pill shows a check", s and s["pill"] == "sc-ai done", s and s["pill"])
                await pg.evaluate("scOpenPop()"); await pg.wait_for_timeout(250)
                lamp = await pg.evaluate("verdictOf(state.result).t")
                ok(f"{n}: with the report in, the verdict no longer waits and the bubble holds the report", lamp and lamp != X["vwait"] and await pg.locator("#scPop .sc-wait").count() == 0 and await pg.locator("#scPop tr[data-area]").count() == 7, lamp)
                await pg.evaluate("scClosePop(true)")
                await pg.screenshot(path=OUT + f"ai-done-{ui}-{nm}.png")
                await pg.wait_for_timeout(5300)
                s = await pg.evaluate(BUB)
                ok(f"{n}: «Listo» closes by itself after about 5 s", s and s["hidden"], s)
                ok(f"{n}: the check stays on the pill after the bubble closes", s and s["pill"] == "sc-ai done", s and s["pill"])
                ok(f"{n}: our options never reach the connection", all("aiLabel" not in k and "aiRetry" not in k for k in await pg.evaluate("window.__keys")), await pg.evaluate("window.__keys"))
                # two at once, then a cancelled one, then a re-wrapped sample (bible_ui does this) counted once
                await pg.evaluate(MOCK, [800, "ok"])
                await pg.evaluate("caps.sample.then((s) => { s.json('a', {}); s.json('b', {}); })"); await pg.wait_for_timeout(200)
                s = await pg.evaluate(BUB)
                ok(f"{n}: two calls at once say so", s and s["h"] == X["two"], s and s["h"])
                await pg.wait_for_timeout(900)
                await pg.evaluate("aiHide()")
                await pg.evaluate("caps.sample.then((s) => { const c = new AbortController(); s.json('c', { signal: c.signal }).catch(() => {}); setTimeout(() => c.abort(), 100); })")
                await pg.wait_for_timeout(400)
                s = await pg.evaluate(BUB)
                ok(f"{n}: a cancelled call leaves no bubble", s and s["hidden"] and await pg.evaluate("AIS.n") == 0, s)
                await pg.evaluate("caps.sample = caps.sample.then((s) => s && { ...s, json: (p, o) => s.json(p, o) })")
                cnt = await pg.evaluate("caps.sample.then((s) => { const n0 = AIS.n; s.json('d', {}); return [n0, AIS.n]; })")
                ok(f"{n}: a re-wrapped sample is counted once", cnt[1] - cnt[0] == 1, cnt)
                await pg.wait_for_timeout(900)
                # failure: the bubble says so and Reintentar runs the report again
                await pg.evaluate("aiHide()")
                await pg.evaluate(MOCK, [300, "fail"])
                await pg.evaluate("rpAct('re')"); await pg.wait_for_timeout(800)
                s = await pg.evaluate(BUB)
                ok(f"{n}: a failed call says the AI did not answer, with Reintentar", s and not s["hidden"] and "fail" in s["cls"] and s["h"] == X["fail"] and s["retry"], s)
                ok(f"{n}: no check on the pill after a failure", s and s["pill"] in ("sc-ai", ""), s and s["pill"])
                await pg.screenshot(path=OUT + f"ai-fail-{ui}-{nm}.png")
                await pg.click("#aiBub [data-ai=retry]"); await pg.wait_for_timeout(800)
                ok(f"{n}: Reintentar makes one new call", len(await pg.evaluate("window.__calls")) == 2, await pg.evaluate("window.__calls"))
                s = await pg.evaluate(BUB)
                ok(f"{n}: after the retry answers, «Listo»", s and "done" in s["cls"], s)
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
