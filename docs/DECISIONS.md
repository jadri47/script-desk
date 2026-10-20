# Decisions (newest first)

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
