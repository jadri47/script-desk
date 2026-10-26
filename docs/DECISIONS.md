# Decisions (newest first)

## 2026-10-25: alternatives for problematic words, and an AI status bubble on the score (Adrian: "Provide synonyms or alternatives to problematic words when suggesting changes ... clearly specify when Claude is thinking ... some bubble attached to the script ranking"; mockup shown first)

Picks (2026-10-25, "Do the three AS"): **A alternatives from the same report call** (no extra call; a few hundred more output tokens per report, a guess) · **A the bubble covers every AI wait** · **A «Listo» closes after ~5 s and leaves a check on the score**.
- Rejected: B a fixed synonym table (free, offline, but only the words in it, and doctrine-adjacent wording Adrian would approve line by line); C table + AI.
- Wait text says «Puede tardar hasta un minuto», not the mockup's "20–40 s": nobody measured the latency.
- The check stays on the pill for 60 s (a judgement call: "leaves a check" with no end looked meaningless).
- Found while building: in the demos only hate speech raises a red ad warning; violence/events words raise yellow at most, and an isolated word in a long script raises nothing (density thresholds). Word choices for red cards only would almost never show, so a yellow ad warning joins step 2 when the report has words for its terms (judgement call, named in the report).
- One choice per word, applied to every occurrence outside Scripture («pandemia» ×5 is one decision, not five).
- While the report runs the verdict no longer says «Listo para grabar» from the rules alone.
- Open: real-model wording of alternatives (tests use a mock); real phone.

## 2026-10-22: refocus — 3 steps, an editor's report, a readiness score (Adrian: "the app has become too complex and has lost its initial scope… directed to a PhD person… from a 90 level to a 95-100")

Picks (2026-10-22): **A refocus** · calibrate on «excelente» as Juan's level (no real scripts yet) · **one score, readiness, recalibrated** · **merge «Grabar» and «Después» into step 3**.
- Measured before: «excelente» scored 100 with 0 decisions, «bueno» 91 with 4. The 60+ rules catch an untrained speaker's faults and say nothing about hook, retention, spoken voice, close or the return viewer.
- Step 2 «Mejorar» = the editor's report: one AI call (complex tier, ~$0.03 per script, a guess on token counts), 6 rated areas + ads, at most 7 changes, each vetted in code (exact unique original, no verse touched, no new ad risk). Not sent as `auto`: the $5 automatic pause would otherwise block the core feature; the daily limit still applies.
- Readiness = rules 40 (ads 20, packaging 12, length/close 8) + editor 60. Line-level checks no longer count. Without a report only «r/40» shows. Runtime under 8 min costs 4 (no mid-roll ads), though `scoreOf` weighs it 0.
- Step 3 «Publicar»: packaging, next episode, cold open, approve, record card, then «Después de grabar» (closed). Structure card → «Más detalles».
- Nothing deleted: coach, walker, rail, colour families, more checks and Ask Claude are behind step 2's «Más detalles»; full mode unchanged.
- Server guard (`auto_paused` at $5/month) deployed as sd-ai v10 the same day.
- Open: real-model ratings on «excelente» (needs one paid call, Adrian's yes); real phone; pw7, pwh, pwd2, pwdl, pw8 have stale locators (fail on the commit before too).

## 2026-10-22: step 2 becomes a coach (Adrian: "walk him through the process and just ask him questions like you do here")

Picks (2026-10-21/22): **A auto AI, capped** · **A one decision at a time** · **safe fixes: preview, one tap** · **$5 per month** · verdict **A by score**.
- Correction said once: there was no monthly cap before (server: 60 calls/day only). The client now stops automatic AI at a known month cost of $5; the server guard (`auto: true` → `auto_paused`) is step 4b and is **not deployed** (waits for Adrian's go).
- Step 2 shows «Decisión i de n», «Nota a → b si aceptas lo propuesto», the spot in the script, Aplicar / Otra opción / Lo escribo yo / Saltar. Safe fixes are one batch with a per-family count and one log entry per fix (each revertible; Deshacer undoes the batch). Questions offer choices taken from the script (keyword candidates with counts, the promise sentence as central idea, the next planned episode, rule titles); AI ideas on click. «Ver por párrafos» keeps the walker.
- A keyword question (`kw-ask`) is asked when the keyword field is empty and there are 2+ candidates (the keyword check passes on the app's own pick, so nothing asked before).
- Verdict: «Casi listo» only from 70 up; below, «Le falta trabajo: n cosas por mejorar».
- Fixed on the way: «súper importante» became «muy importante» (another weak phrase); the live pill ignored partial credit (53 vs 48); no split before «porque/because»; the +0 reason shows once per check.
- Open: AI answer quality with the real model (tests use a mock); real phone; timeline-marker jump has no automated test.

## 2026-10-21: paragraph review: points that are real, suggestions that are specific (Adrian: "most recommendations either don't increase the rating or don't suggest anything specific")

Audit of the walker over the 8 demos: ~250 cards offered only "Proponer con IA" and ~200 showed "+1..+16" while applying the suggestion moved the score 0.
- **Score: B partial credit** (Adrian). Counted checks cost 1 point per instance over the limit, capped (`SCORE_CAP`: long 4; muletillas, weak, regional, aitell, onscreen, jargon, pulpit, cta 3; openers 2). Demo ladder re-pinned: ES 0,17,53,91,100 -> 0,6,48,91,100; EN 0,16,55,96,100 -> 0,6,53,96,100. Alternatives offered: caps of 2 (ES 0,13,52,91,100) or today's weights (ES 0,19,56,91,100).
- **Badge = the real change** of the selected suggestion ("Up to +N" with no suggestion); a +0 says why (fewer remain / red warning holds at 69 / score already 0).
- **Suggestions: B rules only, no AI spending** (Adrian). Added: trailing "¿amén?"-type tags, "Abran sus Biblias en Juan 3" -> "Busca conmigo en Juan 3", a fixed everyday-words line for 10 technical terms (ES+EN), dropping a repeated connector opener, "Hoy hablamos de {tema}." after the first sentence, splitting the hardest/longest sentence, a description that opens with the topic.
- **Tried and left out because the output cut sentences** (read on the demos): removing a profane noun ("era una."), removing flagged words from a title, replacing "los que estamos aquí" with "tú y yo", explaining a term that is followed by an adjective ("escatología dispensacionalista"). Those cards keep the AI button. About 60 ad-risk cards (violence, events, firearms, adult, harm, drugs, shocking, controversial, hate) stay AI-only on purpose: they need judgement about graphic detail.
- **Notes, not cards** (Adrian): verse without a reference and long readings are dashed notes (no Apply, no badge). "Ahora no" kept so they can still be set aside (a deviation from the plan, which dropped it).
- **Open:** the ES/EN jargon glossary wording was approved with the plan, but it is doctrine-adjacent: Adrian should read the 10 lines in `fix_logic.js` (`JARGON_GLOSS`). Still AI-only: promise (when no line fits), application, rehook, kwspread, readability without a natural connector, content-word openers.

## 2026-10-20: silent failures now say so (Adrian: "Fix both", "Fix all three"; wording approved as shown)

- The six empty catches left on 2026-10-19 now show a message: episode list load (`guion_ui.js`, `series_ui.js`, with
  **Retry**), typed publish date not saved (previous date kept), saved-versions load (**Retry**), rehearsal pace not
  saved (the old text said "Ritmo actualizado" even when the write failed). Plain `status err` lines, no pop-up.
- Pinned by `pwerr.py` (20 checks, ES+EN, a db that rejects). Seen red on the old build first, green after.
- Known and unchanged: `pw8` fails on the previous commit too (it waits for the old `#gSeries-t` input, now behind the
  "+ Planear otro episodio" button). Stale selector, not caused by this change, not fixed here.
- Plan step 6, prompt caching: Adrian chose **B, leave it**.

## 2026-10-19: desktop hardening (docs/PLAN-2026-10-desktop.md)

**Main use is a computer browser (Adrian, 2026-10-19).** Phone items are parked.

- **`src/package.json` = commonjs.** A parent `Claude_Programming/package.json` (an unrelated app) sets
  `type: module`, which broke `node eval/*.js` and `build_examples.py`. Kept that file untouched.
- **`pwd.py` renamed `pwdl.py`**: it shadowed Python's `pwd` module and crashed every `pw*.py`.
- **Phone: a paragraph-bar tap only selects** (Adrian: "select without opening the keyboard"). Desktop still
  puts the caret there. Pinned in `pwdc`. Not checked on a real phone.
- **`.gitattributes` (LF)** stops line-ending-only "changes" after builds. No renormalize commit was needed.
- **Plan step 6, prompt caching: no change (recommend B, leave it).** Measured 2026-10-19 from `sd_ai_usage`,
  last 14 days, 6 successful calls, $0.233 total (opus complex $0.146 for 1 call; opus default $0.025 avg;
  sonnet default $0.012 avg), cache write/read 0. At this volume even a working cache saves cents a month;
  moving instructions into the system block is a server change + deploy for no visible gain. Revisit if
  usage grows. Options were: A move rules into the cached block, B leave, C remove the cache marker and warning.
- **Empty catches:** 20 got a "best effort: why" comment (behaviour unchanged). **Six left as they were (fixed 2026-10-20, see above); each can
  hide a failure the person would care about** (Adrian decides, one step each):
  - `guion_ui.js:212` `loadProds` fails: the episode list stays empty, which looks like lost episodes.
  - `series_ui.js:42` and `:112` same, for the calendar/episode list.
  - `guion_ui.js:245` `loadSnaps` fails: saved versions list stays empty.
  - `guion_ui.js:912` rehearsal pace write not saved: next rehearsal uses the old pace.
  - `series_ui.js:91` a date the person typed is not saved and the screen does not say so (hand-typed data).
- **`pw9`** now checks the moved cards (27 checks, none removed): Guion cards by phase, status strip,
  ad-terms list (`#sec-money .pf-list`), planner button (`#gSeriesFull-a`). It loads `mock_sb.js` (series need a db).

### Browser engines (Playwright 1.64, 2026-10-19; `SD_BROWSER=...`)
| check | chromium | firefox | webkit (Playwright build, Windows) |
|---|---|---|---|
| pwdc | pass | pass | 1 "page error": `ResizeObserver loop completed with undelivered notifications` at 390 px |
| pwwk | pass | pass | stuck at phone width: the sticky `.wk-nav` covers an evidence chip after Playwright's scroll (see 2026-10-20 probe) |
| pwcl | pass | pass | same ResizeObserver message at 390 px (2 cases) |
| pwrl | pass | pass | page crashed (Playwright WebKit crash; not shown to be the app) |
| pwsc | pass (2 clean runs; one earlier run failed a typing-lag check under load) | cannot run (needs CDP) | cannot run (needs CDP) |
| pwtoast | pass | pass | pass |

Not conclusions: the WebKit items may be test-engine artefacts; real Safari not tried. The ResizeObserver
message is normally harmless but the tests count it as an error.

**2026-10-20 probe of the `.wk-nav` overlap (Adrian: "Investigate first"):** not a Safari problem and not a desktop problem.
At 1280 px the nav is `position: static` and the chip is clickable at every scroll position in both engines. At 390 px
the nav is sticky (`guide.css:411`) and covers the chip when it is scrolled to the middle of the screen, identically in
Chromium and WebKit; a person just scrolls a bit more. WebKit fails the test only because Playwright's retry scrolls
differently. No app change made. If it should be fixed anyway (e.g. `scroll-margin-top` on `.fx-ev` for the phone
dock), that is a phone-layout step for Adrian to ask for.
With `CSS.highlights` deleted (older Safari/Firefox) the review still works, no page errors; the in-text
word highlights are not drawn (the panel still shows them).

## 2026-10-19 (earlier, from HANDOFF): moving to Claude Code
- Source of truth is this repo; the claude.ai artifact copy can only be republished from claude.ai.
