# Decisions (newest first)

## 2026-10-29: bug review (Adrian: "review the app for bugs and other errors so you can spot 99% of them. Assign models to each step for efficiency")
- Plan `~/.claude/plans/bug-review.md` (11 steps); the single bug list is `docs/BUGS-2026-10.md` (id, severity, grade, repro, fix commit).
  "99 %" is not measurable; the proxy agreed: a second independent pass finds almost nothing new, every suite green, the click tour clean.
- Steps done the same day: 1 automated sweeps (ESLint over the concatenated bundle: 3 `no-undef` hits = one real bug; translation tables
  1,015 = 1,015 keys, no gap; duplicate names: one real; an 81-cell click tour: 2 page errors, both one bug), 2 money/faithfulness paths
  by hand, 3 UI files by Sonnet (two batches, 125 rows graded), 4 the 14 known-red suites repaired (setup only; the two "removed"
  features exist in the full view), 6 server + Supabase advisors + secrets grep, 10 a first fix round: 23 bugs fixed, one commit each,
  every guard seen red first. Models: Sonnet implemented inside known shapes (5 fixes in a worktree, cherry-picked after review), Haiku ran
  the suites, the session model did logic, stored shapes, the server and every review.
- Doctrine holes closed: a report change could alter a Bible reference (B-001); «Proponer con IA» sent verses in clear and skipped the
  vet (B-002); a same-language adaptation could change a quoted verse (B-015: same language + same version → every quote verbatim; a
  swap of version or language changes quotes by design and keeps the «verify» list).
- Money: Revisar during a coach batch stalled every later automatic proposal (B-022); «Medir de nuevo» paid the fix batches twice
  (B-023); starting an example from step 2 fired a report call by itself (B-039).
- Data: typed text could be replaced by an older Ask answer, Undo snapshot, translation or translation undo (B-013: each remembers what
  it expects to find and refuses); an edit in the 2 s before switching episodes was lost (B-016 part); a fix for an empty title was
  dropped on reload (B-006); `hookPassed` was saved as a row object (B-008: writer fixed, readers accept both shapes, nothing rewritten).
- Rejected / retired: the pill's ▲/▼ baseline per example was reported as shared; a check showed it is per example (pin kept).
- New user-facing strings went in provisionally, wording for Adrian: `fxAiVerse`, `fxAiAgain`, `fxUndoStale`, `trStale`, `trVerse`,
  `epRange`, `copyFail`, `edLocalFail`, `rehNoEpisode`, `aiShort`, `roleLbl`, `secAiHint` (reworded).
- Open for Adrian (letters in the bug log): B-003 (the log's «Puntuación» row: readiness, drop, keep), B-004 (a cut report's unrated
  areas: scale, no 100-scale score, keep), B-005 (one sentence per error code), B-037 (history «Abrir»: confirm + reset, or a new
  episode), B-016 rest (what «Borrar todo» means), B-028 (phone: a drag from a button fires it on the next tap, needs the real phone).
- Not done yet: step 5 (`pwpersist` round-trips; the cloud holds no episode yet), step 7 (Firefox/WebKit, performance figures), step 8
  (six paid calls), step 9 (real phone), step 11 (the second pass). Server: B-012 is in the source, not deployed.

## 2026-10-29: long answers — never lose a paid answer (Adrian: "How can you make it so if the API hits its top limit, it doesn't lose the work, and resume later from there so it's the most efficient use of the user money?"; "Make a plan for the most efficient models to implement A + B"; "Go")
- Cause (2026-10-28, live site): the report answer hit the 8,000-token output cap on a 1,700-word script (two calls, 14,286 in → 8,000 out, $0.109 each, JSON cut mid-object → `invalid_json` → «La IA no respondió»). The script's length was not the limit; the answer's was: 12 fragments × 2 options rode in the same call.
- "Resume from where it stopped" is not available: assistant prefill returns a 400 on Sonnet 5.5 and every current model (checked in the API reference, 2026-10-29). Resume = keep what arrived, ask only for the rest.
- Picks: **A salvage a cut answer** (server returns the partial text as `raw` with code `truncated`; `repairJson` keeps every complete item, never a half string; the report is accepted with `partial: true` and says «La respuesta se cortó: el informe puede estar incompleto») + **B fixes in their own calls** (`fixesPrompt`: no script, 6 fragments per call, `complex` tier, not `auto`; `rpFixPump` saves each batch as it lands, a failed batch has its own Reintentar, the coach waits for the pump). Rejected for now: C streaming (most code; only if A+B still lose work). Order B→A: B removes the cause, so A needs no follow-up call.
- Also rejected as the fix on its own: a bigger cap (D). Kept as the safety net: `MAX_TOKENS.complex` 16,000 (worst case ≈ $0.19 per call instead of $0.11).
- Cost options shown (2026-10-29): A structure only ≈ $0.09 per 30-min session · B + Haiku for fix calls ≈ $0.06 · C Haiku for the report too ≈ $0.02 (quality risk) · D cap only $0.11–0.19 · E the claude.ai artifact (no API bill; Juan's plan limits unknown). Haiku for fix batches waits for the measured run.
- Estimates, not measured (one paid run pending): report ≈ 8k in / 3k out ≈ $0.05 on a 30-min script; a fix batch ≈ 4k in / 1.5k out ≈ $0.02.
- Open: the sd-ai deploy (v11: cap 16k, `truncated` + `raw`) is **not deployed**, the tool refused it as a production change; «Proponer con IA» pressed while its batch is still in flight makes its own call (one duplicate, ≈ $0.01); the Supabase function timeout on a long answer not read yet.

## 2026-10-28: desktop review — gaps closed before moving on (Adrian: "Consider the phone version lower priority. I need the app to be useful in a computer setting… clearly tell me the gaps we need to close"; plan with a model per step; "Go, yes to 6 and 7")
- One «antes» everywhere: `report.before` = the readiness shown when the report landed (the end card said «75 → 83» after a start at 55); `report.costUsd` from the call's bill when known, never invented.
- Scripture rule, pick **B code only** (recommended; A self-grading in the call and C a paid vet per swap rejected): `scriptureSentences` = sentences carrying a verse span or a «dice la Biblia / the Bible says» marker; a flagged term inside one keeps its word and the card says «No se cambia en n lugares: la frase dice lo que dice la Biblia». The prompt asks alternatives to keep who, to whom and what happened.
- «Todo listo» uses the Aprobar checks (`PUB_GATE`, `pkReason`): a 104-character title showed ✓ above the gate that rejected it; the walk opens on the first item not ready.
- A cut-off AI answer has its own message (code `truncated`) instead of «llegó incompleta»; every «why» is asked to stay under 20 words. Fixes stayed at 12 that day: 6 broke `pwfixes` (the report answered other problems than the walker's cards); moved out of the call on 2026-10-29 instead.
- The text highlight after «Dónde está» stays (Adrian: "I don't understand why the highlight disappears after a second… I would like it to stay"): the 1.5 s timer in `wkFlash` is gone; it clears on the next flash, paragraph or edit.
- Still open from the plan: «según el editor» suffix + Medir button with cost (2), honest error / no-report states (4), ads band wording + bubble cleanup (5), month cost line (8), «Revisar mi guion →» + 20–60 s hint (9), 14 px step-bar labels + the 62→84 flash (10), one real paid report on «Excelente» (7).

## 2026-10-26: walk Juan through it — the report inside the score bubble, every accepted change raises the score, one thing at a time (Adrian: "Information in informe del editor should be inside the rating bubble… when making an improvement the ranking should increase. Each change would take to the next. The app must walk the user through… a more straightforward and easy way to use the app"; plan + 9-screen mockup shown first; "Go with the plan")
- Score: the editor part counts applied changes (`effectiveReport`: an applied item's area rises to its `after`, cap 5, never lowered, labelled «según el editor»); `itemGain` is the one recipe for a change's «+n a la nota»; `report.baseline` keeps the first measurement for the «Original» column. «Medir de nuevo» replaces the estimate with a measurement (one paid call). The rise is the editor's estimate, said so in the bubble.
- Bubble: the pill popover is the report (Original / Ahora / why, ads, as-of, measure again; a bottom sheet on a phone); the pill reads «a → b posible». No verdict card or report header in step 2.
- Step 2 is a walk (`report_ui.js`): «Cambio i de n · Área», «+n», «Aplicar y seguir», Saltar / Anterior, end card «Terminaste los cambios», «Revisión detallada» as one link. Step 3 is a walk (`pub_ui.js`): Título, Miniatura, Descripción, Próximo episodio, Apertura, Todo listo + Aprobar, then Grabar. Phone: card first, then only the paragraph being changed («Ver guion completo»); primary button fixed above the step bar.
- Chrome: «Modo completo» lives in a ⋯ menu; step 1 shows the script and «Más opciones»; three one-time tips (`sd-tip-bubble`, `sd-tip-card`, `sd-tip-button`; `sd-tips-off=1` disables them, `mock_sb.js` sets it for tests, `pwchrome` turns them on).
- Open: step 1 button still says «Revisar guion» (mockup: «Revisar mi guion →»); phone step-bar labels are 11 px (old); not checked on a real phone.

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
