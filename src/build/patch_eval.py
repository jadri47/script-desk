import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new):
    global s
    n = s.count(old); assert n == 1, (n, old[:80]); s = s.replace(old, new)
rep('  const kwPositions = []; if (kwRe) { let m; while ((m = kwRe.exec(normText))) kwPositions.push(m.index); }',
'''  const kwPositions = []; if (kwRe) { let m; while ((m = kwRe.exec(normText))) kwPositions.push(m.index); }
  // A multi-word keyword ("Caín y Abel") also counts when a sentence names all its main words.
  const kwParts = keyword ? norm(keyword).split(/\\s+/).filter((w) => w.length > 2 && !STOP.has(w)) : [];
  if (kwParts.length > 1) for (const s of sents) { const ns = norm(s.text); if (kwParts.every((w) => new RegExp("(?<![\\\\p{L}])" + esc(w) + "(?![\\\\p{L}])", "u").test(ns)) && !kwPositions.some((p) => p >= s.start && p < s.end)) kwPositions.push(s.start); }
  kwPositions.sort((a, b) => a - b);
  const kwMin = wc < 500 ? 2 : 3; // short scripts can't repeat a phrase three times naturally''')
rep('passed: kwPositions.length >= 3 && thirds.size >= 2, info:', 'passed: kwPositions.length >= kwMin && thirds.size >= 2, info:')
rep('fix: kwPositions.length >= 3 && thirds.size >= 2 ? null', 'fix: kwPositions.length >= kwMin && thirds.size >= 2 ? null')
rep('if (last && t - last.t <= 30) last.items.push(c);', 'if (last && t - last.t <= Math.min(30, runtimeSec / 6)) last.items.push(c);')
rep('passed: weakHits.length <= Math.max(2, Math.ceil(wc / 150)), info:', 'passed: weakHits.length < Math.max(2, Math.ceil(wc / 150)), info:')
rep('fix: weakHits.length > Math.max(2, Math.ceil(wc / 150)) ?', 'fix: weakHits.length >= Math.max(2, Math.ceil(wc / 150)) ?')
rep('  { re: /\\bvosotr[oa]s\\b/gi, fix: "ustedes" },', '  { re: /\\bvosotr[oa]s\\b/gi, fix: "ustedes" },\n  { re: /\\bvos\\b/gi, fix: "tú" },')
rep("firstPromise, nextHits, lang };", "firstPromise, nextHits, lang, promiseDeadline, openPrayer, closeFrom, topWords: top.filter(([w, c]) => c > 1 && !COMMON.has(w)).slice(0, 10), topGrams: Object.entries(grams).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, 8) };")
open(p, "w", encoding="utf-8").write(s)
print("eval ok")
