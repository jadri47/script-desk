# The score bubble is the report (2026-10-26, plan "Walk Juan through it" step 2): the pill's popover holds the number, the areas
# (Original / Ahora / change / what the editor said), the ads row, "as of" and «Medir de nuevo con la IA»; the pill says «a → b posible»
# while changes are pending; applying a change raises the pill by exactly its itemGain and marks the row «según el editor»; Esc closes and
# gives the focus back to the pill; on a phone the popover is a bottom sheet. ES + EN, desktop + phone, light + dark contrast.
# Needs mock_sb.js (guest demo); caps.sample is a test-local mock, so no real call is ever made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, os, re, tempfile
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
OUT = os.path.join(tempfile.gettempdir(), "script-desk-pw") + "/"; os.makedirs(OUT, exist_ok=True)
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)
TX = {"es": {"name": "Preparado para YouTube", "cols": ["Área", "Original", "Ahora", "Cambio", "Qué dijo el editor"], "by": "según el editor", "re": "Medir de nuevo con la IA", "lbl": "Informe del editor", "asof": "según el informe de las", "close": "Cerrar", "areas": ["Gancho", "Promesa", "Retención", "Voz hablada", "Cierre", "Que vuelvan"], "adsw": "✓ sin riesgo", "ads": "Anuncios", "pos": "posible", "before": "antes"},
      "en": {"name": "YouTube-ready", "cols": ["Area", "Original", "Now", "Change", "What the editor said"], "by": "per the editor", "re": "Measure again with the AI", "lbl": "Editor's report", "asof": "as of the", "close": "Close", "areas": ["Hook", "Promise", "Retention", "Spoken voice", "Close", "Return viewers"], "adsw": "✓ no risk", "ads": "Ads", "pos": "possible", "before": "before"}}
PICK = r"""() => {
  const text = $('script').value, R = state.result, spans = verseSpans(text, R).filter((s) => s.kind !== 'ref');
  const sents = [...text.matchAll(/[^.!?\n]{30,220}[.!?]/g)].map((m) => ({ s: m[0].trim(), at: m.index + m[0].indexOf(m[0].trim()) }))
    .filter((x) => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 25 && !/[«»"“”⟦]/.test(x.s) && text.indexOf(x.s) === text.lastIndexOf(x.s) && !spans.some((v) => x.at < v.end && x.at + x.s.length > v.start); });
  const step = Math.max(1, Math.floor(sents.length / 4));
  return [sents[1 * step], sents[2 * step], sents[3 * step]].map((x) => x && x.s);
}"""
# three clean changes in three areas; ratings 3/5/3/4/5/3 so the raises are visible (hook 3->5, retention 3->4, return 3->5)
MOCK = r"""([picks, en]) => {
  window.__calls = [];
  const rep = (s) => s.replace(/[.!?]$/, '') + (en ? ', and that changes everything.' : ', y eso lo cambia todo.');
  const json = { areas: { hook: { rating: 3, why: en ? 'The opening question is for believers.' : 'La pregunta inicial es para creyentes.' }, promise: { rating: 5, why: '' }, retention: { rating: 3, why: en ? 'Nothing keeps people watching in the middle.' : 'En el medio nada hace seguir mirando.' }, voice: { rating: 4, why: en ? 'Two long sentences in a row.' : 'Dos frases largas seguidas.' }, close: { rating: 5, why: '' }, return: { rating: 3, why: en ? 'No reason to come back.' : 'No hay razón para volver.' } },
    items: [
      { area: 'hook', original: picks[0], replacement: rep(picks[0]), why: 'w1', after: 5 },
      { area: 'retention', original: picks[1], replacement: rep(picks[1]), why: 'w2', after: 4 },
      { area: 'return', original: picks[2], replacement: rep(picks[2]), why: 'w3', after: 5 }] };
  caps.sample = Promise.resolve({ serverRules: true, json: async (prompt, opts) => { window.__calls.push(opts.modelTier); await new Promise((r) => setTimeout(r, 300)); return JSON.parse(JSON.stringify(json)); } });
}"""
POP = r"""() => { const p = document.getElementById('scPop'), pill = document.getElementById('scorePill'); if (!p || p.hidden) return null;
  const r = p.getBoundingClientRect(), pr = pill.getBoundingClientRect(), cs = getComputedStyle(p), q = (s) => p.querySelector(s), sc = document.getElementById('scScrim');
  const rows = Object.fromEntries([...p.querySelectorAll('tr[data-area]')].map((tr) => [tr.dataset.area, { est: tr.classList.contains('est'), txt: tr.innerText.replace(/\s+/g, ' ').trim(), dots: [...tr.querySelectorAll('.rp-dots > [aria-hidden]')].map((x) => x.textContent), ch: (tr.querySelector('.sc-ch') || {}).textContent || '', by: (tr.querySelector('.sc-by') || {}).textContent || '', why: (tr.querySelector('.sc-w') || {}).textContent || '' }]));
  return { role: p.getAttribute('role'), label: p.getAttribute('aria-label'), exp: pill.getAttribute('aria-expanded'), big: q('.sc-big') ? q('.sc-big').childNodes[1].textContent : null, name: (q('.sc-name b') || {}).textContent || '', sub: (q('.sc-sub') || {}).textContent || '',
    heads: [...p.querySelectorAll('thead th')].map((x) => x.textContent.trim()).filter(Boolean), rows, asof: (q('.sc-asof') || {}).textContent || '', re: q('#scRe') ? q('#scRe').textContent.trim() : null, reH: q('#scRe') ? q('#scRe').getBoundingClientRect().height : 0, xH: q('#scX').getBoundingClientRect().height, xW: q('#scX').getBoundingClientRect().width, xLbl: q('#scX').getAttribute('aria-label'),
    l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, vw: innerWidth, vh: innerHeight, pillB: pr.bottom, rad: cs.borderTopLeftRadius, sw: p.scrollWidth, cw: p.clientWidth, doc: document.documentElement.scrollWidth,
    scrim: sc && !sc.hidden ? getComputedStyle(sc).backgroundColor : null, active: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '', cost: /\$\s?\d/.test(p.innerText) }; }"""
PILLS = r"""() => ({ n: +document.getElementById('scN').textContent, pos: document.getElementById('scPos').textContent, lbl: document.getElementById('scorePill').getAttribute('aria-label'), w: document.getElementById('scorePill').getBoundingClientRect().width })"""
# contrast of the texts the bubble adds, against the bubble's own background (WCAG ratio)
CONTRAST = r"""() => { const p = document.getElementById('scPop');
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = (c) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(255,255,255)'; };
  const ratio = (el) => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
  return [['.sc-by'], ['.sc-sub'], ['.sc-asof'], ['.sc-re'], ['.sc-ch.up'], ['.sc-w'], ['.rp-dots'], ['.rp-st']].map(([s]) => { const el = p.querySelector(s); return el ? [s, Math.round(ratio(el) * 100) / 100] : null; }).filter(Boolean); }"""
async def open_page(b, ui, vp):
    pg = await b.new_page(viewport=vp); errs = []; pg.on("pageerror", lambda e: errs.append(e.message + " @ " + " | ".join((e.stack or "").split("\n")[1:4])))  # with the stack: a bare message hides where it came from
    await pg.add_init_script(f"window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','{ui}');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(500)
    return pg, errs
async def pop_open(pg):
    if not await pg.evaluate("SC.pop"): await pg.click("#scorePill"); await pg.wait_for_timeout(350)
async def pop_close(pg):
    if await pg.evaluate("SC.pop"): await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get("SD_BROWSER", "chromium")).launch()
        for ui in ["es", "en"]:
            X = TX[ui]
            for (w, hh, nm) in [(1400, 900, "d"), (390, 844, "m")]:
                n = f"{ui}/{nm}"
                pg, errs = await open_page(b, ui, {"width": w, "height": hh})
                await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
                picks = await pg.evaluate(PICK)
                ok(f"{n}: the demo gave three real sentences", all(picks), picks)
                await pg.evaluate(MOCK, [picks, ui == "en"])
                await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
                ok(f"{n}: one AI call for the report", await pg.evaluate("window.__calls.length") == 1)
                # ---- the pill: «a → b posible» while changes are pending ----
                s0 = await pg.evaluate(PILLS)
                e = await pg.evaluate("(() => { const rd = readinessOf(state.result, G.report, state.fixDismissed, state.text); return { a: rd.score, b: rpProjected(rd) }; })()")
                ok(f"{n}: the pill number is the readiness and its text says «→ b {X['pos']}»", s0["n"] == e["a"] and e["b"] and e["b"] > e["a"] and s0["pos"] == f"→ {e['b']} {X['pos']}", (s0, e))
                ok(f"{n}: step 2 has no verdict card, no report header, no second number", await pg.locator("#guide .gv, #rpScore, .rp-head, .rp-score").count() == 0)
                # «→ b posible» follows the packaging too: a title that fails the gate changes the projected total even though text and report are the same (B-027, 2026-10-29)
                p2 = await pg.evaluate("(() => { const t0 = $('title').value; $('title').value = 'x'.repeat(104); state.opts = readOpts(); state.result = analyze(state.text, state.opts); const rd = readinessOf(state.result, G.report, state.fixDismissed, state.text); const live = rpStates().filter((s) => s.st === 'pending'); const fresh = projectedReadiness(state.text, state.result, state.opts, { areas: effectiveReport(state.text, G.report).areas, items: live.map((s) => ({ area: G.report.items[s.i].area, start: s.start, end: s.end, replacement: G.report.items[s.i].replacement, after: G.report.items[s.i].after })) }); const shown = rpProjected(rd); $('title').value = t0; state.opts = readOpts(); state.result = analyze(state.text, state.opts); return { fresh, shown, score: rd.score }; })()")
                ok(f"{n}: after a title change the projected figure is recomputed, not served from the cache", p2["shown"] == (p2["fresh"] if p2["fresh"] != p2["score"] else None), p2)
                # ---- the popover is the report ----
                await pg.focus("#scorePill"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(350)
                q = await pg.evaluate(POP)
                ok(f"{n}: Enter on the pill opens a dialog (aria-expanded, label) and focus moves inside it", q and q["role"] == "dialog" and q["label"] == X["lbl"] and q["exp"] == "true" and q["active"] == "scX", q and (q["role"], q["label"], q["exp"], q["active"]))
                ok(f"{n}: close button is labelled", q and q["xLbl"] == X["close"] and q["xH"] >= 44 and q["xW"] >= 44, q and (q["xLbl"], q["xH"], q["xW"]))
                ok(f"{n}: big number = pill number, with the name", q and int(q["big"]) == s0["n"] and q["name"] == X["name"], q and (q["big"], q["name"]))
                ok(f"{n}: column headings Área / Original / Ahora / what the editor said", q and q["heads"] == X["cols"], q and q["heads"])
                ok(f"{n}: six areas + the ads row", q and len(q["rows"]) == 7 and "ads" in q["rows"], q and list(q["rows"]))
                rep = await pg.evaluate("G.report.areas")
                ok(f"{n}: each row carries the editor's reason", q and q["rows"]["hook"]["why"] == rep["hook"]["why"] and q["rows"]["return"]["why"] == rep["return"]["why"] and q["rows"]["voice"]["why"] == rep["voice"]["why"], q and {k: v["why"] for k, v in q["rows"].items()})
                ok(f"{n}: Original equals Ahora before any change and nothing says «según el editor»", q and q["rows"]["hook"]["dots"] == ["●●●○○ 3", "●●●○○ 3"] and not any(r["est"] or r["by"] for r in q["rows"].values()) and q["sub"] not in (X["by"],) and X["before"] not in q["sub"], q and q["rows"]["hook"])
                ok(f"{n}: the ads row says no risk", q and X["adsw"] in q["rows"]["ads"]["txt"] and X["ads"] in q["rows"]["ads"]["txt"], q and q["rows"]["ads"]["txt"])
                ok(f"{n}: «as of» time and the measure-again button; no invented cost", q and q["asof"].startswith(X["asof"]) and q["re"] == X["re"] and not q["cost"] and q["reH"] >= 44, q and (q["asof"], q["re"], q["reH"], q["cost"]))
                ok(f"{n}: nothing overflows sideways", q and q["doc"] <= q["vw"] and q["sw"] <= q["cw"] + 1, q and (q["doc"], q["vw"], q["sw"], q["cw"]))
                if nm == "m":
                    ok(f"{n}: phone: a bottom sheet, full width, rounded top, dimmed page", q and q["l"] == 0 and abs(q["r"] - q["vw"]) < 1 and abs(q["b"] - q["vh"]) < 1 and q["rad"] != "0px" and q["scrim"] and not q["scrim"].endswith("0)"), q and (q["l"], q["r"], q["b"], q["rad"], q["scrim"]))
                else:
                    ok(f"{n}: desktop: anchored under the pill, 560 px at most, inside the window", q and q["w"] <= 560.5 and q["t"] >= q["pillB"] - 1 and q["l"] >= 0 and q["r"] <= q["vw"] and q["b"] <= q["vh"], q and (q["w"], q["t"], q["pillB"], q["l"], q["r"], q["b"]))
                await pg.screenshot(path=OUT + f"bub_{ui}_{nm}_open.png")
                # Esc closes and the focus goes back to the pill
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
                q = await pg.evaluate("({ hidden: document.getElementById('scPop').hidden, exp: document.getElementById('scorePill').getAttribute('aria-expanded'), active: document.activeElement.id })")
                ok(f"{n}: Esc closes the dialog and the focus returns to the pill", q["hidden"] and q["exp"] == "false" and q["active"] == "scorePill", q)
                # ---- apply change 1: the pill rises by exactly its itemGain, the row is «según el editor» ----
                gain = await pg.evaluate("itemGain(state.text, state.result, state.opts, G.report, 0, null, state.fixDismissed)")
                ok(f"{n}: the first change is worth points", gain > 0, gain)
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(2200)
                s1 = await pg.evaluate(PILLS)
                ok(f"{n}: the pill rose by exactly the change's gain ({s0['n']} + {gain})", s1["n"] == s0["n"] + gain, (s0["n"], gain, s1["n"]))
                ok(f"{n}: «→ b posible» is still there while two changes are pending", s1["pos"].endswith(X["pos"]) and int(re.search(r"\d+", s1["pos"]).group()) > s1["n"], s1)
                await pg.click("#scorePill"); await pg.wait_for_timeout(350)
                q = await pg.evaluate(POP)
                hk = q["rows"]["hook"]
                ok(f"{n}: the hook row shows the raised «Ahora» 5, change +2, with est styling AND the words «{X['by']}»", hk["est"] and hk["dots"] == ["●●●○○ 3", "●●●●● 5"] and hk["ch"] == "+2" and hk["by"] == X["by"], hk)
                ok(f"{n}: other rows are not marked", not q["rows"]["voice"]["est"] and not q["rows"]["retention"]["est"] and q["rows"]["voice"]["by"] == "", {k: v["est"] for k, v in q["rows"].items()})
                ok(f"{n}: the bubble number follows the pill, and the head says «{X['by']} · {X['before']} {s0['n']}»", int(q["big"]) == s1["n"] and q["sub"] == f"{X['by']} · {X['before']} {s0['n']}", q["sub"])
                ct = await pg.evaluate(CONTRAST)
                ok(f"{n}: light theme: every text added by the bubble is >= 4.5:1", all(r >= 4.5 for _, r in ct), ct)
                await pg.screenshot(path=OUT + f"bub_{ui}_{nm}_applied.png")
                await pg.emulate_media(color_scheme="dark"); await pg.wait_for_timeout(300)
                ct = await pg.evaluate(CONTRAST)
                ok(f"{n}: dark theme: every text added by the bubble is >= 4.5:1", all(r >= 4.5 for _, r in ct), ct)
                await pg.screenshot(path=OUT + f"bub_{ui}_{nm}_dark.png")
                await pg.emulate_media(color_scheme="light")
                # an old report with no baseline: no Original column, the current ratings only
                await pg.evaluate("(() => { window.__bl = G.report.baseline; delete G.report.baseline; scRenderPop(); })()"); await pg.wait_for_timeout(200)
                q = await pg.evaluate(POP)
                ok(f"{n}: without a baseline there is no Original column", q["heads"] == [X["cols"][0], X["cols"][2], X["cols"][3], X["cols"][4]] and len(q["rows"]["hook"]["dots"]) == 1 and q["rows"]["hook"]["ch"] == "+2", q["heads"])
                await pg.evaluate("(() => { G.report.baseline = window.__bl; scRenderPop(); })()")
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
                # ---- skip the pending changes: «→ b posible» goes away; Previous brings it back ----
                await pg.click("[data-rp=skip]"); await pg.wait_for_timeout(350)
                ok(f"{n}: one change still pending: the pill still says «posible»", (await pg.evaluate(PILLS))["pos"].endswith(X["pos"]))
                gain2 = await pg.evaluate("itemGain(state.text, state.result, state.opts, G.report, 2, null, state.fixDismissed)")
                await pg.click("[data-rp=apply]"); await pg.wait_for_timeout(2200)
                s2 = await pg.evaluate(PILLS)
                ok(f"{n}: the last change raised the pill by exactly its gain ({s1['n']} + {gain2}) and nothing is pending", s2["n"] == s1["n"] + gain2, (s1["n"], gain2, s2["n"]))
                ok(f"{n}: with nothing pending the pill is just the number", s2["pos"] == "" and "→" not in s2["lbl"], s2)
                # ---- Medir de nuevo: one more call, the sheet closes, the focus goes to the pill ----
                c0 = await pg.evaluate("window.__calls.length")
                await pg.click("#scorePill"); await pg.wait_for_timeout(350)
                await pg.click("#scRe"); await pg.wait_for_timeout(2400)
                q = await pg.evaluate("({ hidden: document.getElementById('scPop').hidden, active: document.activeElement.id, calls: window.__calls.length, tiers: window.__calls })")
                ok(f"{n}: «{X['re']}» makes exactly one more AI call and closes the bubble", q["calls"] == c0 + 1 and q["hidden"], q)
                ok(f"{n}: the focus returns to the pill after it", q["active"] == "scorePill", q["active"])
                ok(f"{n}: the new measurement keeps the first one as «Original»", await pg.evaluate("!!G.report.baseline && G.report.baseline.hook === 3"))
                ok(f"{n}: no page errors", not errs, errs)
                await pg.close()
        # ---- the ▲/▼ baseline of the pill is per example: every demo's first doc id is the same, so the second example once compared with the first (B-027, 2026-10-29) ----
        pg, errs = await open_page(b, "es", {"width": 1400, "height": 900})
        safe = lambda ps: [p or "una frase que no está en el guion" for p in ps]  # the mock needs a string per pick; a short demo may give fewer
        await pg.evaluate("startDemo('best')"); await pg.wait_for_timeout(900)
        await pg.evaluate(MOCK, [safe(await pg.evaluate(PICK)), False]); await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
        b1 = await pg.evaluate("({ base: SC.base, cur: SC.cur })")
        # starting another example while in step 2 must not fire a report call by itself (B-039, 2026-10-29): the person has not pressed Revisar
        c0 = await pg.evaluate("window.__calls.length")
        await pg.evaluate("startDemo('worst')"); await pg.wait_for_timeout(900)
        ok("demos: starting an example makes no AI call on its own", await pg.evaluate("window.__calls.length") == c0, (c0, await pg.evaluate("window.__calls.length")))
        await pg.evaluate(MOCK, [safe(await pg.evaluate(PICK)), False]); await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
        b2 = await pg.evaluate("({ base: SC.base, cur: SC.cur })")
        ok("demos: the second example starts from its own baseline, not the first example's", b2["base"] == b2["cur"] and b2["base"] != b1["base"], (b1, b2))
        ok("demos: no page errors", not errs, [e[:400] for e in errs])
        await pg.close()
        print("FAILS:", fails if fails else "none"); await b.close()
asyncio.run(main())
