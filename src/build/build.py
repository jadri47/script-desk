import subprocess, sys
s = open("base.html", encoding="utf-8").read()
open("work.html", "w", encoding="utf-8").write(s)
subprocess.run([sys.executable, "patch_engine.py", "work.html"], check=True)
subprocess.run([sys.executable, "patch_eval.py", "work.html"], check=True)
s = open("work.html", encoding="utf-8").read()
g = open("guion_logic.js", encoding="utf-8").read() + open("fix_logic.js", encoding="utf-8").read() + open("message_logic.js", encoding="utf-8").read() + open("polish_logic.js", encoding="utf-8").read() + open("score_logic.js", encoding="utf-8").read() + open("cats_logic.js", encoding="utf-8").read() + open("rail_logic.js", encoding="utf-8").read() + open("coach_logic.js", encoding="utf-8").read() + open("report_logic.js", encoding="utf-8").read()
old = 'if (typeof module !== "undefined") module.exports = { analyze, syllablesES, ifsz, inflesz, findReferences, findQuotes, wordDiff, detectLanguage, fmtTime, median, bibleGatewayUrl, sentences };'
assert s.count(old) == 1
s = s.replace(old, g.strip() + "\n\n" + 'if (typeof module !== "undefined") module.exports = { analyze, syllablesES, ifsz, inflesz, findReferences, findQuotes, wordDiff, detectLanguage, fmtTime, median, bibleGatewayUrl, sentences, findCues, buildUnits, detectLayout, remapLayout, sectionsFrom, sectionFlags, coldCandidates, diffOps, parseRetention, retAt, retentionBySection, avgViewed, packagingChecks, buildChapters, clipCandidates, buildFixCards, applyPatches, verifyProposal, verseSpans, maskVerses, unmaskCheck, vetSection, vetSuggestions, relocateSuggestion, applySuggestion, refsKey, adBreaks, scoreOf, FIX_SKIP, SCORE_W, weightOf, CATS, CAT_PRI, catOfKind, catOfCard, railItems, railCrowd, RAIL_LETTER, buildDecisions, projectedScore, coachNoOverlap, coachQuestionChoices, coachAiMask, coachAiPick, readinessOf, READY_RED_CAP, readyTotal, REPORT_AREAS, RATING_PTS, reportPrompt, fixesPrompt, REPORT_FIX_BATCH, REPORT_MAX_FIXES, vetReport, projectedReadiness, itemState, itemApplied, effectiveReport, itemGain, withBaseline, cleanBaseline, cleanBefore, cleanCost, scriptureSentences, vetWords, reportWordRows, matchCase, vetFixes, fixItem, repairJson, insideTester, wordsWithin, syllablesESCount, reportItemCap };')
import os
if os.path.exists("patch_ui.py"):
    open("work.html", "w", encoding="utf-8").write(s)
    subprocess.run([sys.executable, "patch_ui.py", "work.html"], check=True)
    subprocess.run([sys.executable, "patch_fields.py", "work.html"], check=True)
    s = open("work.html", encoding="utf-8").read()
open("work.html", "w", encoding="utf-8").write(s)
a = s.index("<script>") + len("<script>"); b = s.index("/* ===== Script Desk — UI (bilingual) ===== */")
eng = s[a:b]
assert "</script" not in eng
# the same engine, embedded as text so the live score can run it in a Web Worker
s = s.replace("<script>", '<script type="text/plain" id="engineSrc">' + eng + "</script>\n<script>", 1)
open("work.html", "w", encoding="utf-8").write(s)
open("logic.js", "w", encoding="utf-8").write(eng)
print("built")
