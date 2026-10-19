import os, subprocess, sys, shutil, json
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
out = os.path.join(here, "..", "standalone", "site")
env = dict(os.environ, SD_STANDALONE="1")
subprocess.run([sys.executable, "build.py"], check=True, env=env)
s = open("work.html", encoding="utf-8").read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:80]); s = s.replace(old, new)
boot = open("standalone_boot.js", encoding="utf-8").read()
head_extra = """<meta name="theme-color" content="#255F7E">
<meta name="description" content="Revisa el guion de tu episodio antes de grabar: anuncios, estructura, citas, español hablado y búsqueda.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Script Desk">
<style>
.auth-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;padding:10px 14px;border:1px solid var(--rule);background:var(--sheet);border-radius:12px}
.auth-bar[hidden]{display:none}
.auth-bar p{margin:0;flex:1 1 220px;font-size:14px;color:var(--ink)}
.auth-bar.ok{padding:6px 12px;background:transparent;border-color:transparent}
.auth-bar.ok p{color:var(--ink-2);font-size:13px}
.auth-bar.warn{border-color:var(--gold);background:var(--gold-bg)}
.cost-toast{position:fixed;left:50%;width:max-content;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translate(-50%,140%);z-index:60;display:flex;align-items:center;gap:10px;max-width:min(560px,calc(100vw - 24px));padding:10px 10px 10px 14px;border-radius:12px;background:var(--ink);color:var(--paper);font:500 13.5px/1.4 var(--sans);box-shadow:0 6px 24px rgba(0,0,0,.25);transition:transform .25s ease;pointer-events:none}
.cost-toast.on{transform:translate(-50%,0);pointer-events:auto}
.cost-toast button{flex:none;width:28px;height:28px;min-height:0;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;font-size:18px;line-height:1;cursor:pointer}
@media (max-width:620px){ .cost-toast{left:12px;right:12px;width:auto;max-width:none;transform:translateY(160%)} .cost-toast.on{transform:translateY(0)} html.guided .cost-toast{bottom:calc(84px + env(safe-area-inset-bottom,0px))} }
@media (prefers-reduced-motion:reduce){ .cost-toast{transition:none} }
</style>
</head>"""
rep("</head>", head_extra)
rep('<div id="demoBar"', '<div id="authBar" class="auth-bar" hidden></div>\n  <div id="demoBar"')
# Supabase client + boot shim run before the app script so window.claude exists when the app starts.
i = s.index("<script>\n/* ===== Script Desk")
s = s[:i] + '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js"></script>\n<script>\n' + boot + "\n</script>\n" + s[i:]
rep("\n</script>\n</body>", "\nif ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});\n</script>\n</body>")
os.makedirs(out, exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(s)
manifest = {"name": "Script Desk", "short_name": "Script Desk", "description": "Revisa el guion antes de grabar.", "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#F4F6F3", "theme_color": "#255F7E", "lang": "es",
            "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
json.dump(manifest, open(os.path.join(out, "manifest.webmanifest"), "w"), ensure_ascii=False, indent=1)
for f in ["sw.js", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png"]:
    src = os.path.join(here, "site_assets", f)
    if os.path.exists(src): shutil.copy(src, os.path.join(out, f))
open(os.path.join(out, ".nojekyll"), "w").write("")
# rebuild the Claude version so work.html stays the artifact build
subprocess.run([sys.executable, "build.py"], check=True, env={k: v for k, v in os.environ.items() if k != "SD_STANDALONE"})
print("standalone ok", os.path.getsize(os.path.join(out, "index.html")))
