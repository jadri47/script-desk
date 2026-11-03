# Publicar, 2026-11-03 (Adrian: A, A): three AI descriptions on request (desc_ui.js + desc_logic.js) and «Cómo empieza el video»
# filled from the fixed main sections (sections_ui.js coldAuto). Guest, SAMPLE_ES, desktop 1280x800, the AI mocked (no paid call).
# Checks: no call until «Proponer 3 con IA» is pressed, then one call on the default tier; a candidate that cites a reference the
# script doesn't have is never shown («Solo 2 de 3»); a radio per candidate; «Usar esta» writes it above the chapter block and
# keeps what was typed after it; «Otras 3» is a new call; a changed script asks for new ones. Cold open: with hook and promise
# fixed and no clip, the card says so and counts as done, G.cold stays empty; picking a clip replaces it; removing it brings it back.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

# three answers built from the sample: two clean (keyword first), one with a reference the script doesn't have
MOCK = r"""() => { window.__calls = [];
  const kw = $('keyword').value.trim() || state.result.keyword || 'la ansiedad';
  const a = `Hoy hablamos de ${kw}: qué dice la Biblia y qué puedes hacer esta misma semana cuando te quita el sueño.\n\nUn episodio corto, práctico y lleno de esperanza.`;
  const b = `¿Te pesa ${kw}? En este episodio vemos paso a paso cómo llevarla a Dios sin fingir que no está.\n\nQuédate hasta el final: hay una tarea sencilla para hoy.`;
  const c = `Sobre ${kw}, Juan 3:16 nos recuerda algo que cambia la forma de vivir cada día, y en este episodio lo aplicamos juntos.`;
  window.__kw = kw; window.__a = a; window.__b = b;
  caps.sample = Promise.resolve({ serverRules: true, json: async (p, o) => { window.__calls.push(o && o.modelTier); await new Promise(r => setTimeout(r, 250)); return { descs: [a, c, b] }; } });
}"""
DS = r"""() => { const b = document.getElementById('dsBox'); return b ? { n: b.querySelectorAll('.ds-opt').length, radios: b.querySelectorAll('input[type=radio][name=dsPick]').length,
  st: (b.querySelector('#dsSt') || {}).textContent || '', btn: (b.querySelector('[data-ds=ai]') || {}).textContent || '', use: !!b.querySelector('[data-ds=use]'),
  texts: [...b.querySelectorAll('.ds-t')].map(e => e.textContent) } : null; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 800}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es');")
        await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
        await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
        await pg.evaluate("caps.sample = Promise.resolve(null)")
        await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", await pg.evaluate("SAMPLE_ES"))
        await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
        await pg.evaluate(MOCK)
        await pg.click("#stepBar [data-step='3']"); await pg.wait_for_timeout(600)
        await pg.evaluate("PB.i = 2; renderGuide()"); await pg.wait_for_timeout(400)
        await pg.evaluate("document.querySelectorAll('details.pk-more').forEach(d => d.open = true)")
        d = await pg.evaluate(DS)
        ok("the description card has «Proponer 3 con IA» and no candidates yet", d and d["btn"] == "Proponer 3 con IA" and d["n"] == 0, d)
        ok("no AI call before the button is pressed", await pg.evaluate("window.__calls.length") == 0)
        await pg.click("#dsBox [data-ds=ai]"); await pg.wait_for_timeout(900)
        d = await pg.evaluate(DS)
        ok("one call, on the default tier", await pg.evaluate("window.__calls") == ["default"], await pg.evaluate("window.__calls"))
        ok("the one citing a reference the script doesn't have is never shown: 2 options, «Solo 2 de 3»", d["n"] == 2 and d["radios"] == 2 and "Juan 3:16" not in "".join(d["texts"]) and d["st"] == "Solo 2 de 3 pasaron las comprobaciones.", d)
        ok("after the answer the button offers «Otras 3 con IA»", d["btn"] == "Otras 3 con IA", d["btn"])
        # something typed after an existing chapter block stays
        await pg.evaluate("$('description').value = 'Viejo.\\n\\n0:00 Inicio\\n2:00 Texto\\n5:00 Cierre\\n\\n#fe'; $('pkDescIn').value = $('description').value")
        await pg.click("#dsBox .ds-opt:nth-of-type(2)"); await pg.wait_for_timeout(150)
        await pg.click("#dsBox [data-ds=use]"); await pg.wait_for_timeout(400)
        st = await pg.evaluate("({ d: $('description').value, box: $('pkDescIn').value, b: window.__b, msg: document.getElementById('dsSt').textContent })")
        ok("«Usar esta» writes the picked one above the chapter block and keeps what follows", st["d"] == st["b"] + "\n\n0:00 Inicio\n2:00 Texto\n5:00 Cierre\n\n#fe" and st["box"] == st["d"], st["d"][:120])
        ok("it says it is set and editable", st["msg"] == "Descripción puesta, con los capítulos debajo. Puedes editarla.", st["msg"])
        await pg.evaluate("$('description').value = ''; $('pkDescIn').value = ''")
        await pg.click("#dsBox [data-ds=use]"); await pg.wait_for_timeout(300)
        ch = await pg.evaluate("chaptersText().length")
        ok("with no chapter block yet, the chapters are added below", (await pg.evaluate("$('description').value")).startswith(await pg.evaluate("window.__b") + "\n\n0:00") or ch < 3, ch)
        await pg.click("#dsBox [data-ds=ai]"); await pg.wait_for_timeout(900)
        ok("«Otras 3» is a new call", await pg.evaluate("window.__calls.length") == 2)
        await pg.evaluate("state.text = state.text + ' Una frase más.'; renderDs()")
        d = await pg.evaluate(DS)
        ok("a changed script hides the old proposals and asks for new ones", d["n"] == 0 and "El guion cambió" in d["st"], d)
        await pg.evaluate("state.text = $('script').value; renderDs()")

        # ---- «Cómo empieza el video» after the main sections
        await pg.evaluate("G.cold = { hook: null, promise: null }; G.secLocks = {}; PB.i = 4; renderGuide()"); await pg.wait_for_timeout(400)
        ok("setup: without fixed sections the card is as before (no «Empieza con tu gancho»)", await pg.locator("#gCold .co-auto").count() == 0 and not await pg.evaluate("pubItems()[4].done"))
        await pg.evaluate("G.secLocks = { hook: true, promise: true }; renderGuide()"); await pg.wait_for_timeout(400)
        auto = await pg.evaluate("(() => { const e = document.querySelector('#gCold .co-auto'); return e ? e.innerText : null; })()")
        ok("hook and promise fixed, no clip: «Empieza con tu gancho y tu promesa» with both texts", bool(auto) and auto.startswith("Empieza con tu gancho y tu promesa") and "Gancho" in auto and "Promesa" in auto, auto)
        ok("that card counts as done; nothing written to the saved cold open", await pg.evaluate("pubItems()[4].done") and await pg.evaluate("JSON.stringify(G.cold)") == '{"hook":null,"promise":null}')
        ok("the video's timings are unchanged (no cold-open clip)", await pg.evaluate("coldClips().length") == 0)
        await pg.click("#gCold [data-use]"); await pg.wait_for_timeout(400)
        ok("picking a clip replaces it", await pg.locator("#gCold .co-auto").count() == 0 and await pg.evaluate("coldClips().length") == 1)
        await pg.click("#gCold [data-rm]"); await pg.wait_for_timeout(400)
        ok("removing that clip brings it back", await pg.locator("#gCold .co-auto").count() == 1)
        ok("no page error", not errs, errs)
        await b.close()
    print("FAILS:", fails or "none")
asyncio.run(main())
