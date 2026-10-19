# Assembles examples/<lang>/*.md into examples.json (embedded by patch_ui.py as __EXAMPLES__).
# Each .md has a YAML-ish front matter (key: value, multi-line values indented) and the script body.
# Retention curves are generated from each example's intro/mid/end retention figures so Results has sample data.
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ["worst", "bad", "mid", "good", "best"]
# Sample retention per quality: percentage still watching at 30 s, at the midpoint and at the end.
CURVES = {"worst": (18, 6, 2), "bad": (31, 12, 4), "mid": (58, 36, 18), "good": (71, 52, 33), "best": (78, 61, 44)}

def parse(path):
    s = open(path, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n(.*)\Z", s, re.S)
    head, body = m.group(1), m.group(2)
    meta, key = {}, None
    for line in head.split("\n"):
        if line.startswith("  ") or line == "":
            if key is not None: meta[key] += "\n" + line.strip()
            continue
        key, _, val = line.partition(":")
        meta[key.strip()] = val.strip()
    meta["text"] = body.strip() + "\n"
    return meta

def runtime(text, lang):
    r = subprocess.run(["node", "-e", 'const L=require("./logic.js");const t=require("fs").readFileSync(0,"utf8");const R=L.analyze(t,{lang:process.argv[1],uiLang:process.argv[1]});console.log(JSON.stringify({sec:R.runtimeSec,passed:R.passed,total:R.total}))', lang], input=text, capture_output=True, text=True, cwd=HERE)
    return json.loads(r.stdout)

def curve(total, a, b, c):
    pts, step = [], 10 if total < 900 else 30
    t = 0
    while t <= total:
        x = t / total
        if t == 0: v = 100.0
        elif t <= 30: v = 100 - (100 - a) * (t / 30) ** 0.7
        elif x <= 0.5: v = a - (a - b) * ((t - 30) / (total * 0.5 - 30)) ** 0.9
        else: v = b - (b - c) * ((x - 0.5) / 0.5) ** 1.1
        pts.append(f"{t // 60}:{t % 60:02d}\t{v:.1f}")
        t += step
    return "\n".join(pts)

def fmt(sec):
    sec = int(round(sec)); return f"{sec // 60}:{sec % 60:02d}"

out = {}
for lang in ["es", "en"]:
    d = os.path.join(HERE, "examples", lang)
    if not os.path.isdir(d): continue
    items = {}
    for f in sorted(os.listdir(d)):
        if not f.endswith(".md"): continue
        m = parse(os.path.join(d, f))
        k = m.pop("key"); name = m.pop("name")
        rt = runtime(m["text"], lang)
        a, b, c = CURVES[k]
        e = {"name": name, "title": m.get("title", ""), "keyword": m.get("keyword", ""), "thumb": m.get("thumb", ""), "description": m.get("description", ""),
             "nextEp": m.get("nextEp", ""), "series": m.get("series", ""), "lang": lang, "audience": m.get("audience", "both"), "translation": m.get("translation", "RVR1960" if lang == "es" else "NIV"),
             "bigIdea": m.get("bigIdea", ""), "realDur": fmt(rt["sec"]), "retention": curve(int(rt["sec"]), a, b, c), "text": m["text"]}
        items[k] = e
        print(f"{lang} {k:5} {fmt(rt['sec']):>6}  score {rt['passed']}/{rt['total']}  words {len(m['text'].split())}")
    out[lang] = {k: items[k] for k in ORDER if k in items}
json.dump(out, open(os.path.join(HERE, "examples.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote examples.json", os.path.getsize(os.path.join(HERE, "examples.json")), "bytes")
