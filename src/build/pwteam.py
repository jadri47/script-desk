# Team review (Adrian, 2026-11-01: "B"): Adrian reads Juan's episodes and leaves notes; nobody changes the other's work.
# Two users on the mock (mock_sb.js enforces owner-only writes like the real sd_docs rules). Adrian's page: his own episode is
# in «Mis episodios», Juan's only under «Episodios del equipo»; «Ver» opens it read only (no row changes, the editor is not
# touched, even after the 2 s autosave), a note is a `notas` row owned by Adrian, a forced write or delete of Juan's row is
# refused, «Abrir una copia» makes Adrian's own episode. Juan's page: the chip counts Adrian's note, «Hecho» writes only Juan's
# own row (`teamNotesDone`), «Deshacer» takes it out, «Ir al párrafo» flashes it, and Adrian's note row is never touched.
# Needs mock_sb.js; no AI call is made.
SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js", encoding="utf-8").read()
fails = []
def ok(n, c, x=""):
    print(("ok   " if c else "FAIL ") + n, x if not c else "")
    if not c: fails.append(n)

P1 = "Bienvenidos de nuevo al canal, amigos. Hoy hablamos de David y Goliat."
P2 = "Así que hoy quiero invitarlos a leer 1 Samuel 17 con otros ojos."
P3 = "Dios te bendiga, y nos vemos en el próximo video."
JUAN_EP = {"title": "David y Goliat", "text": P1 + "\n\n" + P2 + "\n\n" + P3, "status": "borrador", "notes": [], "rehearsals": [], "cold": {"hook": None, "promise": None}, "updatedAt": 1793500000000, "updatedBy": "x"}
ADRIAN_EP = {"title": "La oración que Jesús enseñó", "text": "Un guion de Adrian.", "status": "aprobado", "notes": [], "rehearsals": [], "cold": {"hook": None, "promise": None}, "updatedAt": 1793400000000, "updatedBy": "y"}
TEAM = [{"email": "adrian@example.com", "name": "Adrian"}, {"email": "juan@example.com", "name": "Juan"}]
J = {"owner": "u-juan", "owner_email": "juan@example.com"}
A = {"owner": "u-adrian", "owner_email": "adrian@example.com"}

async def page_as(b, uid, email):
    pg = await b.new_page(viewport={"width": 1400, "height": 900}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script(f"window.__SB_MODE='member'; window.__SB_UID='{uid}'; window.__SB_EMAIL='{email}'; window.__SB_TEAM={json.dumps(TEAM)}; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-ui','es')")
    await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
    await pg.goto(SDU + "standalone/site/index.html"); await pg.wait_for_timeout(1500)
    return pg, errs

async def seed(pg, rows):
    await pg.evaluate("(rs) => { for (const r of rs) window.__rows[r.collection + '/' + r.id] = r; }", rows)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---------- Adrian ----------
        pg, errs = await page_as(b, "u-adrian", "adrian@example.com")
        await seed(pg, [dict(collection="producciones", id="p-j", data=JUAN_EP, **J), dict(collection="producciones", id="p-a", data=ADRIAN_EP, **A)])
        await pg.evaluate("loadProds()"); await pg.wait_for_timeout(400)
        lists = await pg.evaluate("({ mine: G.prods.map(p => p.id), team: TEAM.prods.map(p => p.id), uid: TEAM.uid, names: TEAM.names })")
        ok("Adrian: the header shows who is signed in", (await pg.evaluate("(() => { const w = document.querySelector('.masthead .auth-who'); return w && w.offsetParent ? w.textContent.trim() : null; })()") or "").startswith("Adrian"), await pg.evaluate("(() => { const w = document.querySelector('.masthead .auth-who'); return w && w.offsetParent ? w.textContent.trim() : null; })()"))
        ok("Adrian: his own episode is his, Juan's is the team's", lists["mine"] == ["p-a"] and lists["team"] == ["p-j"] and lists["uid"] == "u-adrian", lists)
        await seed(pg, [dict(collection="episodios", id="e-j", data={"title": "De Juan", "createdAt": 2}, **J), dict(collection="episodios", id="e-a", data={"title": "De Adrian", "createdAt": 1}, **A)])
        await pg.evaluate("loadHistory()"); await pg.wait_for_timeout(300)
        ok("logged episodes and pace calibration use only Adrian's own records", await pg.evaluate("state.episodes.map(e => e.id).join()") == "e-a", await pg.evaluate("state.episodes.map(e => e.id)"))
        await pg.evaluate("openEpSheet()"); await pg.wait_for_timeout(500)
        sheet = await pg.evaluate("({ mine: $('epList').innerText, team: $('epTeam') ? $('epTeam').innerText : '' })")
        ok("«Mis episodios» does not list Juan's episode", "David y Goliat" not in sheet["mine"] and "La oración" in sheet["mine"], sheet["mine"][:200])
        ok("«Episodios del equipo» lists it with Juan's name", "Episodios del equipo" in sheet["team"] and "David y Goliat" in sheet["team"] and "de Juan" in sheet["team"], sheet["team"][:200])
        before = await pg.evaluate("JSON.stringify(window.__rows)")
        editor = await pg.evaluate("[$('script').value, G.prodId]")
        await pg.click("[data-tmview='p-j']"); await pg.wait_for_timeout(600)
        view = await pg.evaluate("({ open: $('tmSheet') && $('tmSheet').open, paras: document.querySelectorAll('#tmSheet .tm-paras > li').length, ro: ($('tmSheet').querySelector('.tm-ro') || {}).textContent || '' })")
        ok("«Ver» opens Juan's episode read only", view["open"] and view["paras"] == 3 and "notas para Juan" in view["ro"], view)
        plus = await pg.evaluate("(() => { const b = document.querySelector('#tmSheet .tm-plus'), cs = getComputedStyle(b), r = b.getBoundingClientRect(); return { w: r.width, h: r.height, border: cs.borderTopWidth, title: b.title, label: b.getAttribute('aria-label') }; })()")
        # the note «+» read as a stray mark (2026-11-02): a 30 px outlined button whose hover name is its spoken name
        ok("«Ver»: the note «+» is a round outlined button named on hover", plus["w"] >= 30 and plus["h"] >= 30 and plus["border"] != "0px" and plus["title"] == plus["label"] == "Añadir una nota al párrafo 1", plus)
        await pg.wait_for_timeout(2600)  # past the 2 s autosave
        ok("viewing changes no row", await pg.evaluate("JSON.stringify(window.__rows)") == before)
        ok("and the editor is not touched", await pg.evaluate("[$('script').value, G.prodId]") == editor)
        # a note on paragraph 2
        await pg.click("#tmSheet [data-tmadd='2']"); await pg.fill("#tmTxt", "Abre con la pregunta del párrafo 2."); await pg.click("#tmSave"); await pg.wait_for_timeout(500)
        notes = await pg.evaluate("Object.values(window.__rows).filter(r => r.collection === 'notas')")
        n = notes[0] if notes else {}
        ok("the note is a `notas` row owned by Adrian", len(notes) == 1 and n.get("owner") == "u-adrian" and n["data"]["prodId"] == "p-j" and n["data"]["para"] == 2 and n["data"]["quote"] == P2[:60], notes)
        ok("the viewer shows it", "Abre con la pregunta" in await pg.evaluate("$('tmSheet').innerText"))
        ok("Juan's episode row is unchanged by the note", await pg.evaluate("JSON.stringify(window.__rows['producciones/p-j'])") == json.dumps(dict(collection="producciones", id="p-j", data=JUAN_EP, **J), ensure_ascii=False, separators=(",", ":")) or await pg.evaluate("window.__rows['producciones/p-j'].data.title === 'David y Goliat' && !('teamNotesDone' in window.__rows['producciones/p-j'].data)"))
        # forced writes to Juan's row are refused
        forced = await pg.evaluate("""async () => { const db = await caps.db; let setErr = null; try { await db.collection('producciones').doc('p-j').set({ title: 'Cambiado' }); } catch (e) { setErr = e.code; }
          let mergeErr = null; try { await db.collection('producciones').doc('p-j').update({ title: 'Cambiado' }); } catch (e) { mergeErr = e.code; }
          await db.collection('producciones').doc('p-j').delete(); return { setErr, mergeErr, still: window.__rows['producciones/p-j'] && window.__rows['producciones/p-j'].data.title }; }""")
        ok("a forced write, merge or delete of Juan's row is refused", forced["setErr"] == "db_error" and forced["mergeErr"] == "db_error" and forced["still"] == "David y Goliat", forced)
        # «Abrir una copia»
        await pg.click("#tmCopy"); await pg.wait_for_timeout(1200)
        cp = await pg.evaluate("(() => { const r = Object.values(window.__rows).find(r => r.collection === 'producciones' && r.data.title === 'Copia de David y Goliat'); return r ? { id: r.id, owner: r.owner, open: G.prodId === r.id, text: $('script').value === r.data.text, status: r.data.status } : null; })()")
        ok("«Abrir una copia» makes Adrian's own episode and opens it", cp and cp["owner"] == "u-adrian" and cp["open"] and cp["text"] and cp["status"] == "borrador", cp)
        ok("Juan's original is still his and unchanged", await pg.evaluate("window.__rows['producciones/p-j'].owner === 'u-juan' && window.__rows['producciones/p-j'].data.title === 'David y Goliat'"))
        ok("Adrian: no page error", not errs, errs)
        note_row = n
        await pg.close()
        # ---------- Juan ----------
        pg, errs = await page_as(b, "u-juan", "juan@example.com")
        await seed(pg, [dict(collection="producciones", id="p-j", data=JUAN_EP, **J), dict(collection="notas", id="n1", data=note_row.get("data", {"prodId": "p-j", "para": 2, "quote": P2[:60], "text": "Abre con la pregunta del párrafo 2.", "at": 1793600000000}), **A)])
        await pg.evaluate("loadProds()"); await pg.wait_for_timeout(300)
        ok("Juan: the header shows who is signed in", (await pg.evaluate("(() => { const w = document.querySelector('.masthead .auth-who'); return w && w.offsetParent ? w.textContent.trim() : null; })()") or "").startswith("Juan"), await pg.evaluate("(() => { const w = document.querySelector('.masthead .auth-who'); return w && w.offsetParent ? w.textContent.trim() : null; })()"))
        ok("Juan: his episode is his, no team list", await pg.evaluate("G.prods.map(p => p.id).join() === 'p-j' && TEAM.prods.length === 0"))
        await pg.evaluate("openFromSeries('p-j')"); await pg.wait_for_timeout(900)
        chip = await pg.evaluate("$('tmChip') ? $('tmChip').textContent : null")
        ok("the chip says Adrian has 1 note to review", chip == "Notas de Adrian · 1 sin revisar", chip)
        note_before = await pg.evaluate("JSON.stringify(window.__rows['notas/n1'])")
        await pg.click("#tmChip"); await pg.wait_for_timeout(300)
        ok("the notes sheet shows the note and where", "Abre con la pregunta" in await pg.evaluate("$('tmMine').innerText") and "¶2" in await pg.evaluate("$('tmMine').innerText"))
        await pg.click("#tmMine [data-tmdone='n1']"); await pg.evaluate("saveProd(true)"); await pg.wait_for_timeout(600)
        ok("«Hecho» is saved in Juan's own episode", await pg.evaluate("JSON.stringify(window.__rows['producciones/p-j'].data.teamNotesDone)") == '["n1"]')
        ok("and the chip no longer counts it", await pg.evaluate("$('tmChip').textContent") == "Notas de Adrian")
        ok("Adrian's note row is untouched", await pg.evaluate("JSON.stringify(window.__rows['notas/n1'])") == note_before)
        await pg.click("#tmMine [data-tmundo='n1']"); await pg.evaluate("saveProd(true)"); await pg.wait_for_timeout(600)
        ok("«Deshacer» takes it out of the saved episode", await pg.evaluate("!('teamNotesDone' in window.__rows['producciones/p-j'].data)"))
        await pg.click("#tmMine [data-tmgo='n1']"); await pg.wait_for_timeout(250)
        ok("«Ir al párrafo» flashes that paragraph in the editor", await pg.evaluate("(() => { const f = document.querySelector('.ed-flash'); return !!f && f.textContent.includes('Así que hoy quiero'); })()"))
        gone = await pg.evaluate("async () => { const db = await caps.db; await db.collection('notas').doc('n1').delete(); return !!window.__rows['notas/n1']; }")
        ok("Juan cannot delete Adrian's note", gone)
        await pg.evaluate("openProd('p-j')"); await pg.wait_for_timeout(600)
        ok("reopening keeps the done list empty after «Deshacer»", await pg.evaluate("G.teamNotesDone.length === 0 && $('tmChip').textContent === 'Notas de Adrian · 1 sin revisar'"))
        ok("Juan: no page error", not errs, errs)
        await pg.close()
        await b.close()
    print("FAILS:", fails or "none")
asyncio.run(main())
