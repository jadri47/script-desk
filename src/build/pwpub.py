# Step 3 «Publicar» as a walk (pub_ui.js, 2026-10-26, plan "Walk Juan through it", step 4): one card at a time in the order
# Título · Miniatura · Descripción · Próximo episodio · Apertura · Todo listo, then «Grabar» after approving.
# «Guardar y seguir» only advances (the fields save as before), «Saltar» changes no data, «‹ Anterior» keeps what was typed,
# «Todo listo» is honest about what is missing and «Cambiar» jumps back, «Aprobar el guion» leads to «Grabar» with the three big buttons
# (the existing prompter / rehearsal / editor sheet), «Ya lo grabamos» keeps step 3, the step bar keeps the index, phone primary is reachable.
# ES + EN, desktop 1280x800 + phone 390x844. PUB_UI=es PUB_SZ=d narrows a run. Needs mock_sb.js (guest demo). A second page with a mocked report checks the number.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"prog": "Paso 3 de 3 · Publicar · {i} de 6", "rec": "Paso 3 de 3 · Grabar", "save": "Guardar y seguir →", "skip": "Saltar", "prev": "‹ Anterior", "all": "Todo listo para grabar", "final": "Nota final", "from": "empezaste en",
              "chg": "Cambiar", "appr": "Aprobar el guion", "ready": "Tu guion está listo para YouTube", "pp": "Abrir el prompter", "reh": "Ensayar con cronómetro", "dl": "Descargar guion para grabar", "rd": "Ya lo grabamos",
              "after": "Después de grabar", "hint": "(Shorts, resultados)", "none": "Sin hacer", "items": ["Título", "Miniatura", "Descripción", "Próximo episodio", "Apertura"], "approved": "Guion aprobado", "est": "estimado"},
      "en": {"prog": "Step 3 of 3 · Publish · {i} of 6", "rec": "Step 3 of 3 · Record", "save": "Save and continue →", "skip": "Skip", "prev": "‹ Previous", "all": "All set to record", "final": "Final score", "from": "you started at",
              "chg": "Change", "appr": "Approve the script", "ready": "Your script is ready for YouTube", "pp": "Open the prompter", "reh": "Rehearse with a stopwatch", "dl": "Download the script to record", "rd": "We recorded it",
              "after": "After recording", "hint": "(Shorts, results)", "none": "Not done yet", "items": ["Title", "Thumbnail", "Description", "Next episode", "Opening"], "approved": "Script approved", "est": "estimated"}}
TITLE, THUMB, DESC, NEXT = "¿Qué dice la Biblia sobre la ansiedad?", "No cargues mañana", "Una enseñanza sobre la ansiedad.\n0:00 Inicio\n3:00 Texto\n9:00 Cierre", "Salmo 23"
VIS = r"""(sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }"""
CARD = r"""() => { const w = document.querySelector('.pub-walk'); if (!w) return null; const c = w.querySelector('.pub-card'), go = w.querySelector('.pub-go');
  return { i: +w.dataset.pubI, prog: (w.querySelector('.pub-prog') || {}).textContent, h: (w.querySelector('#pubH') || {}).textContent, track: w.querySelectorAll('.pub-track span').length, trackOn: w.querySelectorAll('.pub-track .d').length,
    trackHidden: w.querySelector('.pub-track').getAttribute('aria-hidden'), go: go ? go.textContent.trim() : '', goH: go ? go.getBoundingClientRect().height : 0, goW: go ? go.getBoundingClientRect().width : 0,
    skip: (w.querySelector('[data-pub=skip]') || {}).textContent, prev: (w.querySelector('[data-pub=prev]') || {}).textContent, prevDis: w.querySelector('[data-pub=prev]').disabled,
    sections: [...document.querySelectorAll('#guide #gPack,#guide #gTopic,#guide #gCold')].map((e) => e.id), ok: !!w.querySelector('#pubOk') && !w.querySelector('#pubOk').hidden }; }"""
FIELDS = r"""() => ({ title: $('title').value, thumb: $('thumb').value, desc: $('description').value, next: G.nextEp, kw: $('keyword').value, cold: JSON.stringify(G.cold) })"""
SMALL = r"""() => { const root = document.querySelector('#guide .pub'); let min = 99, who = '';
  for (const el of root.querySelectorAll('*')) { if (el.closest('.vh') || el.classList.contains('vh') || el.closest('[hidden]') || el.closest('.qh-btn')) continue; const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const f = parseFloat(cs.fontSize); if (f < min) { min = f; who = el.className || el.tagName; } }
  return [min, who]; }"""
PICK = r"""() => { ensureReview();
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start) && !R.riskHits.some((h) => h.start < x.at + x.s.length && h.end > x.at); });
  const step = Math.max(1, Math.floor(sents.length / 4));
  return [sents[1 * step], sents[2 * step], sents[3 * step]].map((x) => x && x.s);
}"""
MOCK = r"""([picks, en]) => { ensureReview();
  const rep = (s, t) => s.replace(/[.!?]$/, '') + t;
  const json = { areas: { hook: { rating: 3, why: 'x' }, promise: { rating: 5, why: '' }, retention: { rating: 3, why: 'y' }, voice: { rating: 4, why: '' }, close: { rating: 5, why: '' }, return: { rating: 3, why: 'z' } },
    items: [{ area: 'hook', original: picks[0], replacement: rep(picks[0], en ? ', and that changes everything.' : ', y eso lo cambia todo.'), why: 'w1', after: 5 },
      { area: 'retention', original: picks[1], replacement: rep(picks[1], en ? ', and that matters.' : ', y eso importa.'), why: 'w2', after: 4 }], words: [] };
  caps.sample = Promise.resolve({ serverRules: true, json: async () => { await new Promise((r) => setTimeout(r, 200)); return JSON.parse(JSON.stringify(json)); } });
}"""
async def open_page(b, ui, vp):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def sample_to_step3(pg):
    await pg.evaluate("caps.sample = Promise.resolve(null)")
    await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", await pg.evaluate("SAMPLE_ES"))
    await pg.click("#runBtn"); await pg.wait_for_timeout(1200)
    await pg.click("#stepBar [data-step='3']"); await pg.wait_for_timeout(600)
async def nxt(pg): await pg.click(".pub-go"); await pg.wait_for_timeout(450)
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in os.environ.get("PUB_UI", "es,en").split(","):
            X = TX[ui]
            for (w, hh, nm) in [z for z in [(1280, 800, "d"), (390, 844, "m")] if z[2] in os.environ.get("PUB_SZ", "d,m").split(",")]:
                n = f"{ui}/{nm}"; phone = nm == "m"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await sample_to_step3(pg)
                # ---- (a) card 1 «Título»: derived start, progress line, track, one card visible, buttons
                c = await pg.evaluate(CARD)
                ok(f"{n}: (a) opens on card 1 with «{X['prog'].format(i=1)}»", c and c["i"] == 0 and c["prog"] == X["prog"].format(i=1), c)
                ok(f"{n}: (a) six-segment track, aria-hidden, first segment filled", c["track"] == 6 and c["trackOn"] == 1 and c["trackHidden"] == "true", c)
                ok(f"{n}: (a) only the packaging card is on screen, with the title field and neither thumbnail nor description", c["sections"] == ["gPack"] and await pg.evaluate(VIS, "#pkTitleIn") and not await pg.evaluate(VIS, "#pkThumbIn") and not await pg.evaluate(VIS, "#pkDescIn"), c["sections"])
                ok(f"{n}: (a) «{X['save']}», «{X['skip']}» and «{X['prev']}» (disabled on the first card)", c["go"] == X["save"] and c["skip"] == X["skip"] and c["prev"] == X["prev"] and c["prevDis"], c)
                ok(f"{n}: (a) primary button at least {52 if phone else 44}px tall" + (", full width" if phone else ""), c["goH"] >= (52 if phone else 44) and (not phone or c["goW"] >= w - 60), (c["goH"], c["goW"]))
                ok(f"{n}: (a) no «Aprobar», no record card while walking", await pg.evaluate("!$('gApprove') && !$('gRecCard')"))
                mn = await pg.evaluate(SMALL)
                ok(f"{n}: (a) nothing on the walk below 14px", mn[0] >= 14, mn)
                ok(f"{n}: (a) no horizontal scroll", not await pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
                await pg.screenshot(path=OUT + f"pub_1_{ui}_{nm}.png", full_page=True)
                # ---- (b) walk order; Guardar y seguir only advances
                await pg.fill("#pkTitleIn", TITLE); await pg.wait_for_timeout(500)
                ok(f"{n}: (b) the ✓ line follows the typed title", await pg.evaluate("(()=>{const e=$('pubOk');return !e.hidden && e.textContent.includes(%r)})()" % TITLE))
                before = await pg.evaluate(FIELDS)
                await nxt(pg); c = await pg.evaluate(CARD)
                ok(f"{n}: (b) card 2 «Miniatura»: «{X['prog'].format(i=2)}», thumbnail field only", c["i"] == 1 and c["prog"] == X["prog"].format(i=2) and c["trackOn"] == 2 and await pg.evaluate(VIS, "#pkThumbIn") and not await pg.evaluate(VIS, "#pkTitleIn"), c)
                ok(f"{n}: (b) «Guardar y seguir» did not change any data (the title was already saved by typing)", await pg.evaluate(FIELDS) == before)
                ok(f"{n}: (b) the YouTube preview is on the title and thumbnail cards", await pg.evaluate(VIS, "#pkPreview"))
                await pg.fill("#pkThumbIn", THUMB); await pg.wait_for_timeout(500)
                await nxt(pg); c = await pg.evaluate(CARD)
                ok(f"{n}: (b) card 3 «Descripción»: description box and chapters, no title / thumbnail field, no preview", c["i"] == 2 and await pg.evaluate(VIS, "#pkDescIn") and await pg.evaluate(VIS, "#pkChapters") and not await pg.evaluate(VIS, "#pkTitleIn") and not await pg.evaluate(VIS, "#pkPreview"), c)
                ok(f"{n}: (b) the description details are open without a summary to click", await pg.evaluate("(()=>{const d=document.querySelector('details.pk-more');return d.open && getComputedStyle(d.querySelector('summary')).display==='none'})()"))
                # ---- (c) Saltar: advances, data unchanged; Anterior: back with the values kept
                before = await pg.evaluate(FIELDS)
                await pg.click("[data-pub=skip]"); await pg.wait_for_timeout(450); c = await pg.evaluate(CARD)
                ok(f"{n}: (c) «{X['skip']}» on the description (empty) goes to card 4 and changes no data", c["i"] == 3 and c["sections"] == ["gTopic"] and await pg.evaluate(FIELDS) == before, c)
                await pg.click("[data-pub=prev]"); await pg.wait_for_timeout(450); c = await pg.evaluate(CARD)
                ok(f"{n}: (c) «{X['prev']}» returns to card 3 with the typed values kept", c["i"] == 2 and await pg.evaluate(FIELDS) == before and await pg.input_value("#pkDescIn") == "", c)
                await pg.fill("#pkDescIn", DESC); await pg.wait_for_timeout(500)
                await nxt(pg)
                for _ in range(3): await pg.click("[data-pub=prev]"); await pg.wait_for_timeout(450)
                ok(f"{n}: (c) three «Anterior» back to the title: the typed title is still there and the ✓ shows", await pg.input_value("#pkTitleIn") == TITLE and (await pg.evaluate(CARD))["ok"])
                await pg.click("[data-pub=next]"); await pg.wait_for_timeout(450); await pg.click("[data-pub=next]"); await pg.wait_for_timeout(450)
                ok(f"{n}: (c) description kept when coming back", await pg.input_value("#pkDescIn") == DESC)
                await nxt(pg); c = await pg.evaluate(CARD)
                ok(f"{n}: (d) card 4 «Próximo episodio» shows only the topic card", c["i"] == 3 and c["sections"] == ["gTopic"] and c["prog"] == X["prog"].format(i=4), c)
                # a real click on the button right after typing in a field that re-renders the page on change (the keyword)
                await pg.fill("#tpNext", NEXT); await pg.fill("#tpTopic", "ansiedad")
                await pg.click(".pub-go"); await pg.wait_for_timeout(700); c = await pg.evaluate(CARD)
                ok(f"{n}: (d) one click on «{X['save'][:-2]}» right after typing the keyword advances (the re-render does not swallow it)", c["i"] == 4, c)
                ok(f"{n}: (d) the next episode and the keyword were saved", (await pg.evaluate(FIELDS))["next"] == NEXT and (await pg.evaluate(FIELDS))["kw"] == "ansiedad")
                ok(f"{n}: (d) card 5 «Apertura» shows only the cold-open card", c["sections"] == ["gCold"] and await pg.evaluate(VIS, "#coAi"), c)
                await pg.screenshot(path=OUT + f"pub_5_{ui}_{nm}.png", full_page=True)
                # ---- (e) step bar keeps the index
                await pg.click("#stepBar [data-step='2']"); await pg.wait_for_timeout(500)
                await pg.click("#stepBar [data-step='3']"); await pg.wait_for_timeout(500)
                ok(f"{n}: (e) step bar to «Mejorar» and back lands on the same card (5 of 6)", (await pg.evaluate(CARD))["i"] == 4)
                # ---- (f) Todo listo: honest list, Cambiar, gate
                await nxt(pg); c = await pg.evaluate(CARD)
                ok(f"{n}: (f) card 6 «{X['all']}», track full", c["i"] == 5 and c["h"] == X["all"] and c["trackOn"] == 6 and c["prog"] == X["prog"].format(i=6), c)
                rows = await pg.evaluate("[...document.querySelectorAll('.pub-chk li')].map((l) => ({ n: l.querySelector('b').textContent, ok: l.classList.contains('ok'), v: l.querySelector('.pub-v').textContent, b: l.querySelector('button').textContent.trim() }))")
                ok(f"{n}: (f) the five items in order with «{X['chg']}» on each", [r["n"] for r in rows] == X["items"] and all(r["b"] == X["chg"] for r in rows), rows)
                ok(f"{n}: (f) title, thumbnail, description and next episode are ✓ with their value; the opening is pending and says «{X['none']}»",
                   [r["ok"] for r in rows] == [True, True, True, True, False] and rows[0]["v"] == TITLE and rows[1]["v"] == THUMB and "3" in rows[2]["v"] and rows[3]["v"] == NEXT and rows[4]["v"] == X["none"], rows)
                ok(f"{n}: (f) the ads reading is there and the final number is the bubble's number", await pg.evaluate("(()=>{const r=readinessOf(state.result,G.report,state.fixDismissed,state.text);return !!document.querySelector('.pub-ads .lamp') && +document.querySelector('.pub-n').childNodes[0].textContent===(r.score!=null?r.score:r.rules)})()"))
                ok(f"{n}: (f) approve enabled, only «{X['appr']}» as primary", not await pg.is_disabled("#gApprove") and (await pg.evaluate(CARD))["go"] == X["appr"])
                await pg.click("[data-pub-go='2']"); await pg.wait_for_timeout(450); c = await pg.evaluate(CARD)
                ok(f"{n}: (f) «{X['chg']}» on the description jumps to card 3", c["i"] == 2 and await pg.evaluate(VIS, "#pkDescIn"), c)
                await pg.fill("#pkDescIn", ""); await pg.wait_for_timeout(500)
                await pg.click("[data-pub=next]"); await pg.wait_for_timeout(300); await pg.click("[data-pub=next]"); await pg.wait_for_timeout(300); await pg.click("[data-pub=next]"); await pg.wait_for_timeout(450)
                rows = await pg.evaluate("[...document.querySelectorAll('.pub-chk li')].map((l) => l.classList.contains('ok'))")
                ok(f"{n}: (f) emptying the description turns its row pending (not a stale ✓)", rows == [True, True, False, True, False], rows)
                # the derived default after a reload: first empty item (description), the memory index is dropped
                await pg.evaluate("pubReset(); renderGuide()"); await pg.wait_for_timeout(400)
                ok(f"{n}: (g) without a kept index the walk opens on the first empty item (the description)", (await pg.evaluate(CARD))["i"] == 2)
                await pg.fill("#pkDescIn", DESC); await pg.wait_for_timeout(500)
                await pg.evaluate("pubReset(); renderGuide()"); await pg.wait_for_timeout(400)
                ok(f"{n}: (g) next empty item is the opening (card 5)", (await pg.evaluate(CARD))["i"] == 4)
                await pg.screenshot(path=OUT + f"pub_5b_{ui}_{nm}.png", full_page=True)
                # ---- (h) phone: primary reachable on every card
                if phone:
                    for k in range(5):
                        await pg.evaluate("window.scrollTo(0, 0)")
                        await pg.evaluate("PB.i = %d; renderGuide()" % k); await pg.wait_for_timeout(300)
                        r = await pg.evaluate("(() => { const g = document.querySelector('.pub-go').getBoundingClientRect(), s = $('stepBar').getBoundingClientRect(); return [g.top >= 0, g.bottom <= s.top + 1, g.bottom, s.top, getComputedStyle(document.querySelector('.pub-act')).position]; })()")
                        ok(f"{n}: (h) card {k + 1}: the primary button is on screen above the step bar without scrolling (sticky)", r[0] and r[1] and r[4] == "sticky", r)
                # ---- (i) approve → Grabar
                await pg.evaluate("pubReset(); PB.i = 5; renderGuide()"); await pg.wait_for_timeout(300)
                await pg.fill("#pkTitleIn", TITLE) if await pg.evaluate(VIS, "#pkTitleIn") else None
                await pg.evaluate("PB.view = 'rec'; renderGuide()"); await pg.wait_for_timeout(300)
                ok(f"{n}: (i) «Grabar» is never shown before the script is approved, even if the memory says so", await pg.evaluate("!document.querySelector('.pub-recw') && !!$('gApprove')"))
                await pg.evaluate("PB.view = null"); await pg.click("#gApprove"); await pg.wait_for_timeout(1000)
                st = await pg.evaluate("V.step + ' ' + G.status + ' ' + (document.querySelector('.pub-recw') ? 'rec' : 'card')")
                ok(f"{n}: (i) «{X['appr']}» leads to the «Grabar» screen, still step 3, status aprobado", st == "3 aprobado rec", st)
                rec = await pg.evaluate("""() => ({ prog: document.querySelector('.pub-prog').textContent, lamp: document.querySelector('#gRecCard .lamp').textContent.trim(), h: document.querySelector('#pubH').textContent,
                  pp: $('gPP').querySelector('.pub-bt').textContent, reh: $('gReh').querySelector('.pub-bt').textContent, rehS: $('gReh').querySelector('small').textContent, dl: $('gSheet').querySelector('.pub-bt').textContent,
                  rd: ($('gRecorded') || {}).textContent, after: $('gAfter').querySelector('summary').textContent.trim(), afterOpen: $('gAfter').open, hs: [$('gPP'), $('gReh'), $('gSheet')].map((e) => e.getBoundingClientRect().height),
                  score: +document.getElementById('scN').textContent, est: fmtTime(totalVideo()) })""")
                ok(f"{n}: (i) «{X['rec']}», lamp «{X['approved']} · …», «{X['ready']}»", rec["prog"] == X["rec"] and rec["lamp"].startswith("✓ " + X["approved"]) and rec["h"] == X["ready"], rec)
                ok(f"{n}: (i) big buttons «{X['pp']}», «{X['reh']}» ({X['est']} duration), «{X['dl']}», each at least 64px tall", rec["pp"] == X["pp"] and rec["reh"] == X["reh"] and rec["dl"] == X["dl"] and rec["est"] in rec["rehS"] and X["est"] in rec["rehS"] and min(rec["hs"]) >= 64, rec)
                ok(f"{n}: (i) the lamp carries the same number as the bubble", rec["lamp"].endswith(str(rec["score"])) or str(rec["score"]) in rec["lamp"], rec)
                ok(f"{n}: (i) «{X['rd']}» link and «{X['after']} {X['hint']}» folded", rec["rd"].strip() == X["rd"] and rec["after"].startswith(X["after"]) and X["hint"] in rec["after"] and not rec["afterOpen"], rec)
                ok(f"{n}: (i) no horizontal scroll on «Grabar»", not await pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
                await pg.screenshot(path=OUT + f"pub_rec_{ui}_{nm}.png", full_page=True)
                # the three big buttons call the existing functions
                await pg.click("#gPP"); await pg.wait_for_timeout(500)
                ok(f"{n}: (j) «{X['pp']}» opens the prompter", await pg.evaluate("!!$('pp') && PP.on && PP.mode === 'prompter'"))
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
                ok(f"{n}: (j) Escape closes it", await pg.evaluate("!$('pp')"))
                await pg.click("#gReh"); await pg.wait_for_timeout(500)
                ok(f"{n}: (j) «{X['reh']}» opens the rehearsal", await pg.evaluate("!!$('pp') && PP.mode === 'ensayo'"))
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
                await pg.evaluate("window.__dl = null; caps.downloads = Promise.resolve({ save: async (o) => { window.__dl = o; } })")
                await pg.click("#gSheet"); await pg.wait_for_timeout(500)
                dl = await pg.evaluate("window.__dl && { f: window.__dl.filename, d: String(window.__dl.data) }")
                ok(f"{n}: (j) «{X['dl']}» downloads the editor sheet with the chapters", dl and dl["f"].endswith(".md") and ("Capítulos" in dl["d"] or "Chapters" in dl["d"]), dl and dl["f"])
                # back from Grabar, then the recorded flow
                await pg.click("[data-pub=prev]"); await pg.wait_for_timeout(450); c = await pg.evaluate(CARD)
                ok(f"{n}: (k) «{X['prev']}» on «Grabar» returns to «Todo listo» (approved: no approve button, still step 3)", c["i"] == 5 and await pg.evaluate("!$('gApprove') && V.step === 3 && G.status === 'aprobado'"), c)
                await pg.click("[data-pub=rec]"); await pg.wait_for_timeout(450)
                await pg.click("#gRecorded"); await pg.wait_for_timeout(900)
                st = await pg.evaluate("V.step + ' ' + G.status + ' ' + $('gAfter').open")
                ok(f"{n}: (k) «{X['rd']}» keeps step 3, sets grabado and opens «{X['after']}»", st == "3 grabado true", st)
                # reopening an approved episode lands on Grabar
                pid = await pg.evaluate("G.prodId"); await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(300)
                await pg.evaluate("id=>openFromSeries(id)", pid); await pg.wait_for_timeout(900)
                ok(f"{n}: (k) reopening a recorded episode lands on step 3, «Grabar»", await pg.evaluate("V.step === 3 && !!document.querySelector('.pub-recw')"))
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
            # ---- (l) with the editor's report: «Nota final {n} · empezaste en {a}» = the bubble / step-2 helpers
            if not os.environ.get("PUB_SZ") or "d" in os.environ.get("PUB_SZ"):
                n = f"{ui}/report"
                pg, errs = await open_page(b, ui, {"width": 1280, "height": 800})
                await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
                picks = await pg.evaluate(PICK); await pg.evaluate(MOCK, [picks, ui == "en"])
                await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(500)
                await pg.click("#stepBar [data-step='3']"); await pg.wait_for_timeout(600)
                await pg.evaluate("PB.i = 5; renderGuide()"); await pg.wait_for_timeout(300)
                fin = await pg.evaluate("""() => { const r = readinessOf(state.result, G.report, state.fixDismissed, state.text);
                  return { lbl: document.querySelector('.pub-lbl').textContent, n: +document.querySelector('.pub-n').textContent, from: (document.querySelector('.pub-final .hint') || {}).textContent, now: r.score, before: rpBeforeOf(r), pill: +document.getElementById('scN').textContent }; }""")
                ok(f"{n}: (l) «{X['final']} {fin['now']}» equals readinessOf and the bubble", fin["lbl"] == X["final"] and fin["n"] == fin["now"] == fin["pill"], fin)
                ok(f"{n}: (l) «{X['from']} {fin['before']}» comes from rpBeforeOf", fin["from"] == f"{X['from']} {fin['before']}" and fin["before"] != fin["now"], fin)
                await pg.screenshot(path=OUT + f"pub_all_{ui}.png", full_page=True)
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
            # ---- (n) «Todo listo» and the starting card agree with the Aprobar gate (2026-10-28): a filled but blocked title is ○ with the gate's reason
            n = f"{ui}/gate"
            pg, errs = await open_page(b, ui, {"width": 1280, "height": 800})
            await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(900)
            await pg.click("#stepBar [data-step='3']"); await pg.wait_for_timeout(600)
            tl = await pg.evaluate("$('title').value.trim().length")
            ok(f"{n}: (n) the «Regular» demo has a title over 60 characters", tl > 60, tl)
            c = await pg.evaluate(CARD)
            ok(f"{n}: (n) it opens on card 1 «{X['items'][0]}» (not on the thumbnail)", c and c["i"] == 0 and c["prog"] == X["prog"].format(i=1) and not c["ok"], c)
            await pg.evaluate("PB.i = 5; renderGuide()"); await pg.wait_for_timeout(300)
            rows = await pg.evaluate("[...document.querySelectorAll('.pub-chk li')].map((l) => ({ ok: l.classList.contains('ok'), mk: l.querySelector('.pub-mk').textContent, v: l.querySelector('.pub-v').textContent }))")
            gate = await pg.evaluate("(document.querySelector('[data-pub-gate] .g-gate') || {}).textContent || ''")
            ok(f"{n}: (n) «Todo listo» shows ○ {X['items'][0]} with the gate's reason (contains 60 and the length)", not rows[0]["ok"] and rows[0]["mk"] == "○" and "60" in rows[0]["v"] and str(tl) in rows[0]["v"], rows[0])
            ok(f"{n}: (n) that reason is the same text the gate line lists", rows[0]["v"].lower() in gate.lower() and "60" in gate, (rows[0]["v"], gate))
            await pg.evaluate("pubReset(); renderGuide()"); await pg.wait_for_timeout(300)
            await pg.fill("#pkTitleIn", TITLE); await pg.wait_for_timeout(500)
            ok(f"{n}: (n) a title of 60 or less turns the card's ✓ line on", (await pg.evaluate(CARD))["ok"])
            await pg.evaluate("PB.i = 5; renderGuide()"); await pg.wait_for_timeout(300)
            rows = await pg.evaluate("[...document.querySelectorAll('.pub-chk li')].map((l) => ({ ok: l.classList.contains('ok'), mk: l.querySelector('.pub-mk').textContent, v: l.querySelector('.pub-v').textContent }))")
            gate = await pg.evaluate("(document.querySelector('[data-pub-gate] .g-gate') || {}).textContent || ''")
            ok(f"{n}: (n) «Todo listo» now shows ✓ {X['items'][0]} with the title, and the gate no longer lists it", rows[0]["ok"] and rows[0]["mk"] == "✓" and rows[0]["v"] == TITLE and "60" not in gate, (rows[0], gate))
            ok(f"{n}: no page errors", not errs, errs)
            await pg.close()
            # ---- (m) full mode keeps the whole packaging card
            pg, errs = await open_page(b, ui, {"width": 1280, "height": 800})
            await sample_to_step3(pg)
            await pg.evaluate("V.guided = false; lsSet('sd-expert','1'); applyView(); setMode('guion')"); await pg.wait_for_timeout(700)
            ok(f"{ui}/full: (m) full mode still shows the title, thumbnail and description fields together", await pg.evaluate(VIS, "#pkTitleIn") and await pg.evaluate(VIS, "#pkThumbIn") and await pg.evaluate("(()=>{const d=document.querySelector('details.pk-more');return !!d && getComputedStyle(d.querySelector('summary')).display!=='none'})()"))
            await pg.close()
        await b.close()
    print("FAILS:", fails) if fails else print("all ok")
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
