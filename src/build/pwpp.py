# Prompter keyboard/countdown guards (B-017 b, c; jadri47, 2026-10-29). Needs mock_sb.js (guest demo).
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ui in ["es", "en"]:
            n = ui
            pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}'); localStorage.setItem('sd-more-open','1'); localStorage.setItem('sd-coach-off','1')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(800)
            await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
            await pg.evaluate("goPhase('rec')"); await pg.wait_for_timeout(500)
            # (b) close during the 3-2-1 countdown, reopen: Space must start it
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(300)
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(300)
            ok(f"{n}: (b) the countdown runs", await pg.evaluate("PP.counting === true"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            ok(f"{n}: (b) closed during the countdown", await pg.evaluate("!$('pp') && !PP.on"))
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(300)
            ok(f"{n}: (b) a reopened prompter is not counting", await pg.evaluate("PP.counting === false"))
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(3600)
            ok(f"{n}: (b) after reopening, Space starts and plays", await pg.evaluate("PP.started === true && PP.playing === true"), await pg.evaluate("({s:PP.started,p:PP.playing,c:PP.counting})"))
            await pg.evaluate("ppClose()"); await pg.wait_for_timeout(200)
            # (c) Enter on the focused «Salir» button exits instead of advancing
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.querySelector('[data-pp=exit]').focus()")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
            ok(f"{n}: (c) Enter on the focused exit button closes the prompter", await pg.evaluate("!$('pp') && !PP.on"))
            # B-030 (b): the section note form's role select reads to a screen reader in the UI language, not the literal "role"
            lab = await pg.evaluate("(() => { gCompute(); const m = structPanel(G.secs[0], new Set()).match(/<select data-role=\"\\d+\" aria-label=\"([^\"]*)\"/); return m && m[1]; })()")
            ok(f"{n}: (B-030) the note role select has a translated aria-label", lab == ("Rol" if ui == "es" else "Role"), lab)
            ok(f"{n}: (B-030) the section-rewrite hint names no model (the server picks it)", not await pg.evaluate("/Opus|Sonnet|Haiku/.test(t('secAiHint'))"))
            # B-038: opening another episode while the prompter is open replaced G.secs under its frame loop (a crash per frame); the prompter must close
            await pg.evaluate("openPrompter('prompter')"); await pg.wait_for_timeout(300)
            await pg.evaluate("(async () => { const db = await caps.db; await db.collection('producciones').doc('x2').set({ text: 'Hola. Este es otro guion corto para la prueba. Nos vemos.', title: 'B', status: 'borrador', updatedAt: 1 }); await openProd('x2'); })()")
            await pg.wait_for_timeout(600)
            ok(f"{n}: (B-038) opening another episode closes the prompter instead of crashing it", await pg.evaluate("!PP.on && !$('pp') && G.prodId === 'x2'"), await pg.evaluate("({on: PP.on, id: G.prodId})"))
            ok(f"{n}: no page errors", not errs, [e[:200] for e in errs])
            await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
