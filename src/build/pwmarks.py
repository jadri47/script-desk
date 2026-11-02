# Marks in the text (marks_ui.js; Adrian, 2026-11-01: 7A). Guest demo «Regular» (es.mid: fillers, calls to action, quotes,
# references, a [TEXTO] cue), desktop 1400x900, no AI. Checks: what shows on entry per screen (the mockup's table), the legend's
# counts are the marks drawn, outlines sit on their words, margin tags never cover the text, a section label or each other, a switch
# hides only its group and is remembered per screen, typing removes the marks, fixed sections keep no new marks, nothing wider than
# the editor; off with sd-secs-off=1 (the older suites) and on a phone.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"
import asyncio
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

async def page(b, secs_off="0", w=1400, h=900):
    pg = await b.new_page(viewport={"width": w, "height": h}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    await pg.add_init_script("window.__SB_MODE='guest'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es'); localStorage.setItem('sd-secs-off','" + secs_off + "');")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(800)
    await pg.evaluate("startDemo('mid')"); await pg.wait_for_timeout(900)
    await pg.evaluate("caps.sample = Promise.resolve(null)")  # no AI: the marks never need it
    await pg.click("#runBtn"); await pg.wait_for_timeout(2200)
    return pg, errs

STATE = """(() => { const hl = CSS.highlights, n = (k) => hl.has(k) ? hl.get(k).size : 0;
  const tags = {}; document.querySelectorAll('.mk-tag').forEach(t => { const g = [...t.classList].find(c => c.startsWith('mk-t-')).slice(5); tags[g] = (tags[g] || 0) + 1; });
  const chips = {}; document.querySelectorAll('[data-mk-g]').forEach(c => chips[c.dataset.mkG] = { on: c.getAttribute('aria-pressed') === 'true', n: +c.querySelector('.n').textContent });
  return { screen: MK.screen, on: document.documentElement.classList.contains('mk-on'), tags, chips, hl: { quote: n('sd-mk-quote'), risk: n('sd-mk-risk'), fill: n('sd-mk-fill') },
    boxes: { ref: document.querySelectorAll('.mk-box.mk-ref').length, cta: document.querySelectorAll('.mk-box.mk-cta').length }, lines: { ad: document.querySelectorAll('.mk-line.mk-ad').length, rehook: document.querySelectorAll('.mk-line.mk-rehook').length, chap: document.querySelectorAll('.mk-line.mk-chap').length },
    data: MK.data && Object.fromEntries(Object.entries(MK.data).map(([k, v]) => [k, v.length])) }; })()"""
GEOM = """(() => { const ed = document.getElementById('ed'), er = ed.getBoundingClientRect(), textL = er.left + parseFloat(getComputedStyle(ed).paddingLeft), wr = ed.parentElement.getBoundingClientRect();
  const tags = [...document.querySelectorAll('.mk-tag')].map(t => t.getBoundingClientRect()), lbls = [...document.querySelectorAll('.sx-lbl, .sx-lock-l')].map(l => l.getBoundingClientRect()).filter(r => r.height > 0);
  const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const wide = [...document.querySelectorAll('.mk-layer > *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > er.right + 1 || r.left < er.left - 1; }).length;
  return { n: tags.length, inMargin: tags.every(r => r.right <= textL + 0.5 && r.left >= er.left), overTag: tags.some((a, i) => tags.slice(i + 1).some(b => hit(a, b))), overLabel: tags.some(a => lbls.some(b => hit(a, b))), wide, page: document.documentElement.scrollWidth > innerWidth }; })()"""
# every visible reference / call-to-action outline holds exactly the rectangle of its words
COVER = """(() => { const d = MK.data, out = []; for (const [g, list] of [['ref', d.ref], ['cta', d.cta]]) for (const x of list) { const r = wkRange(x.start, x.end); if (!r) continue;
  const er = document.getElementById('ed').getBoundingClientRect();
  for (const q of r.getClientRects()) { if (q.width === 0 || q.top < er.top - 4 || q.top > er.bottom - 8) continue;
    const box = [...document.querySelectorAll('.mk-box.mk-' + g)].map(b => b.getBoundingClientRect()).find(b => b.left <= q.left + 0.5 && b.right >= q.right - 0.5 && b.top <= q.top + 0.5 && b.bottom >= q.bottom - 0.5 && b.width <= q.width + 8);
    out.push(!!box); } } return out; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg, errs = await page(b)
        s = await pg.evaluate(STATE)
        ok("main sections: marks on with the editor margin", s["screen"] == "secs" and s["on"], s)
        ok("main sections (table): numbers, quotes, references, calls to action, cues and re-hooks on; ads, chapters, risk, fillers off",
           all(s["chips"][g]["on"] for g in ("secs", "para", "quote", "ref", "rehook", "cta", "cue")) and not any(s["chips"][g]["on"] for g in ("ad", "chap", "risk", "fill"))
           and s["tags"].get("para", 0) > 0 and s["boxes"]["cta"] > 0 and s["hl"]["quote"] == s["data"]["quote"] and s["hl"]["fill"] == 0 and s["lines"]["ad"] == 0 and s["lines"]["chap"] == 0, s)
        ok("legend: each count is the marks found for its group", all(s["chips"][g]["n"] == s["data"][g] for g in s["data"]) and s["chips"]["fill"]["n"] > 0, s["chips"])
        cv = await pg.evaluate(COVER)
        ok("outlines sit on their words (references, calls to action on screen)", len(cv) >= 1 and all(cv), cv)
        g = await pg.evaluate(GEOM)
        ok("margin: tags in the margin, none on another or on a section label, nothing wider than the editor", g["n"] >= 3 and g["inMargin"] and not g["overTag"] and not g["overLabel"] and g["wide"] == 0 and not g["page"], g)
        # the detailed review: ads, chapters, risk and fillers join
        await pg.evaluate("SX.detail = true; renderGuide()"); await pg.wait_for_timeout(1200)
        s = await pg.evaluate(STATE)
        ok("detailed review (table): everything on; fillers painted wavy, one per filler", s["screen"] == "detail" and all(c["on"] for c in s["chips"].values()) and s["hl"]["fill"] == s["data"]["fill"] > 0 and s["hl"]["quote"] > 0, s)
        await pg.evaluate("(() => { const ed = document.getElementById('ed'); const x = MK.data.ad[0] || MK.data.chap[1]; const r = wkRange(x.pos, x.pos + 1); ed.scrollTop += r.getBoundingClientRect().top - ed.getBoundingClientRect().top - 200; })()"); await pg.wait_for_timeout(500)
        s = await pg.evaluate(STATE)
        ok("detailed review: ad breaks and chapters drawn as lines with their margin tag", s["lines"]["ad"] + s["lines"]["chap"] >= 1 and s["tags"].get("ad", 0) + s["tags"].get("chap", 0) >= 1, s["lines"])
        # one recipe (jadri47, 2026-11-02): the chapter marks are the description's chapters, same count, same titles
        cc = await pg.evaluate("(() => { const d = chaptersText(); return { marks: MK.data.chap.map((c) => c.label), desc: d.map((c) => c.label), secs: G.secs.length }; })()")
        ok("chapters: the marks are exactly the description's chapter list", cc["marks"] == cc["desc"] and len(cc["desc"]) >= 3, cc)
        g = await pg.evaluate(GEOM)
        ok("detailed review: margin tags still never overlap, nothing wider", g["inMargin"] and not g["overTag"] and not g["overLabel"] and g["wide"] == 0, g)
        # a switch hides only its group, and is remembered for this screen only
        await pg.click("[data-mk-g=fill]"); await pg.wait_for_timeout(400)
        s2 = await pg.evaluate(STATE)
        ok("switch: «Muletillas» off removes the wavy lines and nothing else", s2["hl"]["fill"] == 0 and s2["hl"]["quote"] == s["hl"]["quote"] and not s2["chips"]["fill"]["on"] and s2["chips"]["para"]["on"] and s2["tags"].get("para", 0) == s["tags"].get("para", 0), s2)
        ok("switch: its button says it is off (aria-pressed false, focus kept)", await pg.evaluate("document.activeElement && document.activeElement.dataset.mkG === 'fill' && document.activeElement.getAttribute('aria-pressed') === 'false'"))
        ok("switch: remembered for the detailed review only", await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('sd-marks')))") == '{"detail":{"fill":false}}')
        await pg.click("[data-mk-g=para]"); await pg.wait_for_timeout(400)
        ok("switch: «Números y minutos» off removes the paragraph tags", await pg.evaluate("document.querySelectorAll('.mk-t-para').length") == 0)
        await pg.click("[data-mk-g=para]"); await pg.wait_for_timeout(300)
        # fixed sections: nothing new inside them
        await pg.evaluate("(() => { G.secReport = G.secReport || { at: '', key: 'k', areas: {}, items: [] }; G.secLocks = { hook: true, intro: true, close: true }; MK.data = null; renderGuide(); })()"); await pg.wait_for_timeout(900)
        lk = await pg.evaluate("""(() => { const L = secLockedRanges(), d = MK.data, inL = (a, b) => L.some(r => a < r.end && b > r.start);
          return { L: L.length, cta: d.cta.filter(x => inL(x.start, x.end)).length, fill: d.fill.filter(x => inL(x.start, x.end)).length, para: d.para.length, raw: marksOf(state.text, state.result, { blocks: WK.blocks.map(b => ({ s: b.s, e: b.e })) }).cta.filter(x => inL(x.start, x.end)).length }; })()""")
        ok("fixed sections: no call to action or filler marked inside them; every paragraph still numbered", lk["L"] >= 2 and lk["raw"] >= 1 and lk["cta"] == 0 and lk["fill"] == 0 and lk["para"] == s["data"]["para"], lk)
        # back to step 1 and on to step 3: the table again
        await pg.evaluate("goStep(1)"); await pg.wait_for_timeout(900)
        s = await pg.evaluate(STATE)
        ok("write (table): numbers, quotes and references only", s["screen"] == "write" and s["chips"]["para"]["on"] and s["chips"]["quote"]["on"] and not any(s["chips"][g]["on"] for g in ("cta", "cue", "ad", "rehook", "risk", "fill")) and "secs" not in s["chips"] and s["boxes"]["cta"] == 0, s)
        await pg.evaluate("goStep(3)"); await pg.wait_for_timeout(900)
        s = await pg.evaluate(STATE)
        ok("publish (table): ads, chapters, calls to action and cues on; re-hooks, risk and fillers off", s["screen"] == "pub" and all(s["chips"][g]["on"] for g in ("ad", "chap", "cta", "cue", "para")) and not any(s["chips"][g]["on"] for g in ("rehook", "risk", "fill")), s)
        # typing: the marks leave until the next review
        await pg.evaluate("goStep(2)"); await pg.wait_for_timeout(900)
        await pg.click("#ed"); await pg.keyboard.type(" x"); await pg.wait_for_timeout(600)
        ok("typing removes the marks (the text no longer matches the review)", await pg.evaluate("!document.documentElement.classList.contains('mk-on') && !document.querySelector('.mk-tag') && !CSS.highlights.has('sd-mk-quote')"))
        ok("no page errors", not errs, errs)
        await pg.close()
        # the older suites' setting and the phone: no marks at all
        pg, errs = await page(b, secs_off="1")
        ok("sd-secs-off=1 (older flow): no marks, no legend", await pg.evaluate("!document.documentElement.classList.contains('mk-on') && !document.querySelector('.mk-leg') && !document.querySelector('.mk-tag')"))
        await pg.close()
        pg, errs = await page(b, w=390, h=844)
        ok("phone 390 px: no marks, no legend", await pg.evaluate("!document.documentElement.classList.contains('mk-on') && !document.querySelector('.mk-leg') && !document.querySelector('.mk-tag')"))
        await pg.close()
        await b.close()
    print("FAILS:", fails if fails else "none")
asyncio.run(main())
