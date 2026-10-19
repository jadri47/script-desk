# One-line text fields become one-row textareas that wrap and grow (see autosize_ui.js).
import re, sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
for fid in ["title", "keyword", "thumb", "series", "bigIdea"]:
    pat = re.compile(r'<input id="%s"([^>]*)>' % fid)
    n = len(pat.findall(s))
    assert n == 1, (fid, n)
    s = pat.sub(lambda m: '<textarea id="%s" rows="1" data-one="1"%s></textarea>' % (fid, m.group(1)), s)
open(p, "w", encoding="utf-8").write(s)
