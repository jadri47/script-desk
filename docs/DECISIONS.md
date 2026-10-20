# Decisions (newest first)

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
- **Empty catches:** 20 got a "best effort: why" comment (behaviour unchanged). **Six left as they were; each can
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
| pwwk | pass | pass | stuck: `.wk-nav` hint intercepts the click on a `.fx-ev` evidence chip (30 s timeout) |
| pwcl | pass | pass | same ResizeObserver message at 390 px (2 cases) |
| pwrl | pass | pass | page crashed (Playwright WebKit crash; not shown to be the app) |
| pwsc | pass (2 clean runs; one earlier run failed a typing-lag check under load) | cannot run (needs CDP) | cannot run (needs CDP) |
| pwtoast | pass | pass | pass |

Not conclusions: the WebKit items may be test-engine artefacts; real Safari not tried. The ResizeObserver
message is normally harmless but the tests count it as an error. The `.wk-nav` overlap is the one worth a look.
With `CSS.highlights` deleted (older Safari/Firefox) the review still works, no page errors; the in-text
word highlights are not drawn (the panel still shows them).

## 2026-10-19 (earlier, from HANDOFF): moving to Claude Code
- Source of truth is this repo; the claude.ai artifact copy can only be republished from claude.ai.
