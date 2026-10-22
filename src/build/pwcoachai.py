# Coach automatic AI (step 4a): one batched call, verified options, budget guard, daily limit, no calls on load. Needs mock_sb.js (guest demo);
# sample.json is replaced by a test-local mock (the guest has no AI), so no real call is ever made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    if not c:
        print("FAIL " + n, x); fails.append(n)
MOCK = r"""([delay, mode]) => {
  window.__calls = []; window.__mode = mode;
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => {
    if ((prompt.match(/^=== i\d+/gm) || []).length === 0) return (window.__other = (window.__other || 0) + 1, { idea: '' });
    window.__calls.push({ n: (prompt.match(/^=== i\d+/gm) || []).length, auto: !!opts.auto, tier: opts.modelTier, last: prompt.lastIndexOf('FRAGMENTO A REESCRIBIR') > prompt.indexOf('CONTEXTO') });
    await new Promise((r) => setTimeout(r, delay));
    if (window.__mode === 'daily') throw { code: 'daily_limit' };
    const items = [...prompt.matchAll(/^=== (i\d+)\n[\s\S]*?FRAGMENTO A REESCRIBIR:\n\"\"\"\n([\s\S]*?)\n\"\"\"/gm)].map((m) => ({ id: m[1], options: [
      { text: m[2].trim() + ' Piénsalo.', why: 'ok' },
      { text: m[2].trim() + ' ' + 'palabra '.repeat(400) + '.', why: 'bad' }] }));
    return { items };
  } });
}"""
async def open_page(b, ui, demo, delay=300, mode="ok", month=None, vp=None):
    pg = await b.new_page(viewport=vp or {"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}')")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    await pg.evaluate(MOCK, [delay, mode])
    if month is not None: await pg.evaluate("(m) => window.dispatchEvent(new CustomEvent('sd-ai-cost', { detail: { month_cost_usd: m } }))", month)
    ncalls = await pg.evaluate("window.__calls.length")
    await pg.evaluate(f"startDemo('{demo}')"); await pg.wait_for_timeout(800)
    ok(f"{ui}: no call before the review (page load, demo start)", await pg.evaluate("window.__calls.length") == ncalls == 0)
    await pg.click("#runBtn")
    return pg, errs
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            # ---- normal: one batched call, loading line, verified options ----
            pg, errs = await open_page(b, ui, "bad", delay=3000)
            await pg.wait_for_timeout(700)
            nAi = await pg.evaluate("COACH.list.filter(d=>d.needsAi&&d.card&&d.card.ai).length")
            ok(f"{ui}: the bad demo has decisions that need AI", nAi >= 2, nAi)
            prep = await pg.evaluate("(()=>{const e=document.querySelector('.cc-prep');return e?e.textContent.trim():''})()")
            await pg.evaluate("(()=>{const k=COACH.list.findIndex(d=>d.needsAi&&d.card&&d.card.ai); if(k>0) coachJump(k);})()")
            await pg.wait_for_timeout(300)
            ok(f"{ui}: the decision shows «Preparando una propuesta…» while loading", await pg.evaluate("(()=>{const e=document.querySelector('.cc-prep');return e?e.textContent.trim():''})()") == ("Preparando una propuesta…" if ui == "es" else "Preparing a suggestion…"), prep)
            ok(f"{ui}: the manual AI button stays available while loading", await pg.locator("[data-fxai]").count() == 1)
            await pg.wait_for_timeout(5000)
            calls = await pg.evaluate("window.__calls")
            ok(f"{ui}: exactly one call for up to 8 items", len(calls) == 1 and 1 <= calls[0]["n"] <= 8 and calls[0]["n"] <= min(8, nAi), calls)
            ok(f"{ui}: the call is auto and the script text comes last", calls and calls[0]["auto"] and calls[0]["tier"] == "default" and calls[0]["last"], calls)
            ok(f"{ui}: the decision shows its AI option without clicking", await pg.locator(".cc-ai").count() == 1 and await pg.locator("[data-co=apply]").count() == 1)
            ok(f"{ui}: the loading line is gone", await pg.locator(".cc-prep").count() == 0)
            raw = await pg.evaluate("Object.values(COAI.cache).flatMap(e=>e.raw.map(r=>r.text))")
            shown = await pg.evaluate("COACH.list.filter(d=>d.needsAi).flatMap(d=>coachAiOptions(d).filter(p=>p.patches).map(p=>p.patches[0].rep))")
            ok(f"{ui}: the mock's risky option reached the cache", any("palabra palabra" in r for r in raw), len(raw))
            ok(f"{ui}: an option that breaks a check is dropped", shown and not any("palabra palabra" in x for x in shown) and any("Piénsalo" in x for x in shown), shown[:2])
            ok(f"{ui}: every shown option is verified", await pg.evaluate("COACH.list.filter(d=>d.needsAi).every(d=>coachAiOptions(d).every(p=>p.check&&!p.check.broke.length))"))
            # apply it: the change lands, and the next decisions keep their options (re-located, no new call)
            await pg.click("[data-co=apply]"); await pg.wait_for_timeout(2500)
            ok(f"{ui}: applying the AI option changes the script", await pg.evaluate("$('script').value.includes('Piénsalo')"))
            # walk the whole queue: the cap of 3 calls without cost info holds and nothing loops
            for _ in range(80):
                if not await pg.evaluate("COACH.list.length"): break
                await pg.evaluate("(()=>{const b=document.querySelector('[data-co=skip]'); if(b) b.click()})()"); await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(1500)
            ok(f"{ui}: at most 3 automatic calls per review without cost info", await pg.evaluate("window.__calls.length") <= 3, await pg.evaluate("window.__calls.length"))
            ok(f"{ui}: no page errors", not errs, errs)
            await pg.close()
            # ---- budget: month cost 5.01 -> no call, pause line ----
            pg, errs = await open_page(b, ui, "bad", month=5.01)
            await pg.wait_for_timeout(2500)
            want = "Sugerencias automáticas en pausa: se llegó al límite de $5 del mes" if ui == "es" else "Automatic suggestions paused: this month's $5 limit was reached"
            ok(f"{ui}: month cost 5.01 makes zero automatic calls", await pg.evaluate("window.__calls.length") == 0)
            ok(f"{ui}: and shows the pause line", await pg.locator(".cc-pause").count() == 1 and (await pg.inner_text(".cc-pause")).strip() == want, await pg.locator(".cc-pause").count())
            ok(f"{ui}: the manual button still works (enabled)", await pg.evaluate("(()=>{const k=COACH.list.findIndex(d=>d.needsAi&&d.card&&d.card.ai); if(k>0) coachJump(k); const b=document.querySelector('[data-fxai]');return !!b&&!b.disabled})()"))
            ok(f"{ui}: no page errors (budget)", not errs, errs)
            await pg.close()
            # ---- month cost known and low: no 3-call cap, still one in flight ----
            pg, errs = await open_page(b, ui, "bad", month=1.2)
            await pg.wait_for_timeout(2500)
            ok(f"{ui}: a low month cost allows the automatic call", await pg.evaluate("window.__calls.length") == 1 and await pg.locator(".cc-pause").count() == 0)
            await pg.close()
            # ---- daily limit: the first call fails, nothing more is sent ----
            pg, errs = await open_page(b, ui, "bad", mode="daily")
            await pg.wait_for_timeout(2500)
            for _ in range(30):
                if not await pg.evaluate("COACH.list.length"): break
                await pg.evaluate("(()=>{const b=document.querySelector('[data-co=skip]'); if(b) b.click()})()"); await pg.wait_for_timeout(200)
            await pg.wait_for_timeout(1000)
            ok(f"{ui}: a daily_limit error stops the automatic calls for the session", await pg.evaluate("window.__calls.length") == 1, await pg.evaluate("window.__calls.length"))
            pg2txt = await pg.evaluate("(()=>{const e=document.querySelector('.cc-pause');return e?e.textContent.trim():''})()")
            await pg.evaluate("rerunReview('')"); await pg.wait_for_timeout(600)
            want = "Sugerencias automáticas en pausa por hoy" if ui == "es" else "Automatic suggestions paused for today"
            ok(f"{ui}: the daily pause line shows", (await pg.evaluate("(()=>{const e=document.querySelector('.cc-pause');return e?e.textContent.trim():''})()")) == want or pg2txt == want, pg2txt)
            ok(f"{ui}: no page errors (daily)", not errs, errs)
            await pg.close()
        print("FAILS:", fails); await b.close()
asyncio.run(main())
