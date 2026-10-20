SDU = __import__("pathlib").Path(__file__).resolve().parents[1].as_uri() + "/"  # the src folder, wherever the repo lives
import asyncio, json
from playwright.async_api import async_playwright
SB = open("mock_sb.js").read()
URL = SDU+"standalone/site/index.html"
OUT = "/tmp/claude-0/-home-claude/8105d05d-2e83-5f0e-bc3d-a5db415f0e12/scratchpad/"
def filler(n, s): return " ".join(f"La gracia de Dios sostiene al creyente en el día {s+i} de su camino, aun cuando las fuerzas se acaban." for i in range(n))
V = "«Jehová es mi pastor; nada me faltará.»"
T = "Hola a todos, bienvenidos. Oremos juntos. Padre celestial, te damos gracias por este día y por tu palabra, señor te pedimos que abras nuestro corazón. Amén. Hoy veremos qué dice la Biblia sobre el miedo.\n\n"
for p in range(1, 8):
    T += f"{'Primero' if p==1 else 'Ahora bien'}, el punto {p}. {filler(40, p*50)} En el Salmo 23:1 leemos {V} {filler(30, p*90)}\n\n"
T += "En el próximo episodio veremos el libro de Jonás."

T2 = "¿Alguna vez el miedo decidió por ti? Hoy vas a descubrir qué dice la Biblia sobre el miedo. Oremos. Padre celestial, te damos gracias por tu palabra y por cada persona que nos escucha. Señor, abre nuestro corazón y danos fe para confiar en ti. En el nombre de Jesús, amén.\n\n"
for p in range(1, 8):
    T2 += f"{'Primero' if p==1 else 'Ahora bien'}, el punto {p}. ¿Y tú, qué haces cuando llega el miedo? {filler(40, p*50)} En el Salmo 23:1 leemos {V} {filler(30, p*90)}\n\n"
T2 += "En el próximo episodio veremos el libro de Jonás. Oremos. Padre, gracias por tu palabra. " + filler(4, 900) + " En el nombre de Jesús, amén. Dios les bendiga."
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w, hh, n, T in [(1440, 900, "d", T2), (390, 844, "m", T2)]:
            pg = await b.new_page(viewport={"width": w, "height": hh}); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("window.__SB_MODE='member'; localStorage.setItem('sd-intro','1'); localStorage.setItem('sd-expert','1'); localStorage.removeItem('sd-phase')")
            await pg.route("**/supabase.min.js", lambda r: r.fulfill(body=SB, content_type="application/javascript"))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("v=>{$('script').value=v;$('script').dispatchEvent(new Event('input'))}", T)
            await pg.evaluate("$('runBtn').click()"); await pg.wait_for_timeout(900)
            await pg.evaluate("document.querySelector('#sec-structure').open=true")
            print(n, "warn marks:", await pg.evaluate("[...document.querySelectorAll('#sec-structure .mark.warn')].map(e=>e.closest('.row').querySelector('.t').textContent)"))
            print(n, "fail marks:", await pg.evaluate("[...document.querySelectorAll('#sec-structure .mark.fail')].map(e=>e.closest('.row').querySelector('.t').textContent)"))
            print(n, "prayer/ending:", await pg.evaluate("[...document.querySelectorAll('#sec-structure .row')].filter(r=>/[Oo]raci|[Cc]ierre/.test(r.textContent)).map(r=>r.innerText.replace(/\\s+/g,' ').slice(0,260))"))
            print(n, "channel note:", await pg.evaluate("(document.querySelector('#sec-structure .mbody > .hint')||{}).textContent"))
            el = await pg.query_selector('#sec-structure'); await el.screenshot(path=OUT + f"tm_{n}_struct.png")
            await pg.evaluate("document.querySelector('[data-mode=guion]').click()"); await pg.wait_for_timeout(900)
            print(n, "guion flags:", await pg.evaluate("[...document.querySelectorAll('.gsec-flags .flag')].map(e=>e.textContent)"))
            print(n, "pkAds:", await pg.evaluate("(document.getElementById('pkAds')||{}).innerText"))
            await pg.close()
        print("page errors:", errs); await b.close()
asyncio.run(main())
