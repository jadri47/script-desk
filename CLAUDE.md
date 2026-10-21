# Script Desk: notes for Claude

Web app that reviews scripts for a weekly **Spanish Christian Bible-teaching YouTube podcast** (host Juan Sánchez, non-technical, mostly on a phone; Adrian produces). It adjusts delivery for YouTube. It never rewrites doctrine or Bible verses. Spanish and English UI.

## Layout
- `index.html`, `sw.js`, icons, manifest: the **built** site served by GitHub Pages (https://jadri47.github.io/script-desk/). Never hand-edit `index.html`.
- `src/`: all source. `src/build/` has the UI files (`*_ui.js`, `*.css`, `base.html`, `*_logic.js`), the build scripts (`build.py`, `build_examples.py`, `build_standalone.py`, `patch_*.py`) and Playwright checks (`pw*.py`). `src/eval/` has the node tests.
- `supabase/functions/sd-ai/index.ts`: the only Anthropic call site (server-side, key stays in Supabase secrets). Project `vuvwoxjlmoegstpalngx`; tables `sd_ai_usage`, `sd_docs`, `sd_team`; RPCs `sd_is_member`, `sd_month_cost`. Deploy with the Supabase tool, not from here.

## Build (from `src/build`, in this order)
```
python3 build.py && python3 build_examples.py && python3 build_standalone.py
```
Output: `src/standalone/site/index.html` (the site) and `src/build/work.html` (the Claude-artifact version). Derived files (`work.html`, `full.js`, `logic.js`, `all.js`, `standalone/site/`) are gitignored: **never edit them**. New UI files must be added to the concatenation list in `patch_ui.py`.

## Tests (from `src/`)
```
node eval/run.js; node eval/timing_test.js; node eval/polish_test.js; node eval/score_test.js; node eval/cats_test.js; node eval/rail_test.js; node eval/rules_test.js
```
Playwright checks: `cd src/build; python3 pwXX.py`. They open `src/standalone/site/index.html` relative to the script (the `SDU` line at the top of each file), so they work wherever the repo is cloned. Main ones: `pwdc` (tap/bar selects a paragraph; on a phone the bar does not open the keyboard, green accepted cards collapse/expand + revert, grey ignored cards + restore, stale-apply guard), `pwwk` (paragraph review), `pwcl` (color families, legend filter, minimap markers), `pwrl` (rail + minimap in the script box), `pwsc` (score pill; flaky on "off persists after reload" and "show button appears": rerun, two clean passes = OK), `pwfx` (paragraph review: every points badge equals the real score change, a +0 says why, refs/reading are notes), `pwerr`, `pwpack`, `pwex`, `pwmt`, `pwtm`, `pwat`, `pwhw` (header never wraps 900–1920 px; ~8 min), `pwtoast`, `pw10`. `pw9` follows the cards by phase (27 checks, needs `mock_sb.js`). They use `mock_sb.js` instead of Supabase. Screenshots go to the OS temp folder (`script-desk-pw/`).

### Running on Windows (Adrian's PC)
- Python 3 + `pip install playwright` + `python -m playwright install chromium`; Node 18+.
- Set `PYTHONUTF8=1` (PowerShell: `$env:PYTHONUTF8=1`) before building: the build scripts open UTF-8 files without an explicit encoding.
- Use `python` instead of `python3` if that is what the PC has.
- `src/package.json` (`type: commonjs`) must stay: a stray `Claude_Programming/package.json` with `type: module` otherwise breaks the node tests and `build_examples.py`. Keep a test file out of `build/` if it is named like a Python stdlib module (`pwd.py` once broke every `pw*.py`; now `pwdl.py`).
- `SD_BROWSER=firefox|webkit python pwXX.py` runs the six main checks (`pwdc pwwk pwcl pwrl pwsc pwtoast`) in another engine (`python -m playwright install firefox webkit`). `pwsc` is chromium-only (CDP). Known engine results: `docs/DECISIONS.md`.

## Deploy
1. Build, run tests.
2. Copy `src/standalone/site/*` over the repo root (at least `index.html`), commit, push (GitHub Pages updates; it caches ~10 min and the service worker bypasses the HTTP cache, so phones may need two reloads).
3. Only when working from claude.ai (it has the Artifact tool): publish `src/build/work.html` to https://claude.ai/artifact/3btmB6r1H19211fjhNwo2Z (same file path keeps the URL). From Claude Code, skip this and tell Adrian the artifact is behind.
4. Tell Adrian it is live (in claude.ai: push notification).

## Design rules that matter
- Score v2 (`score_logic.js`): score = 100 − weights of open checks − small penalty for dismissed ones; any red ⇒ ≤ 69. Counted checks (long, fillers, weak, regional, aitell, onscreen, jargon, pulpit, openers, cta) give partial credit: 1 point per instance over the limit, capped by `SCORE_CAP`. Weights live in one table (`SCORE_W`); ladders are pinned in `eval/score_test.js`.
- Desktop (≥900 px wide and ≥560 px tall) is a split view: script left, review right. Phone: single column, stepBar fixed at the bottom; in step 2 the script docks at the top.
- Paragraph review (`walk_ui.js`): highlights use the CSS Custom Highlight API over the editor text (the editor DOM is not changed); positions come from `buildFixCards(..., cap = Infinity)`.
- Choosing the paragraph: a real tap/click/arrow key inside a paragraph (`pointerup`/`keyup`, not `selectionchange`, so re-rendering after Apply never moves the review) or the vertical bar per paragraph in the rail (`.rl-bar`, `railSelect`) calls `wkGo(i, false)`. The phone editor only goes full screen from the maximizer button, never on tap.
- Decision log `state.fixLog` (fix_ui.js): every Apply adds a `done` entry (uid, paragraph, time, why, option, word delta, score before→after, before/after text with context, previous field/cold-open values); every "Ahora no" adds `skip` entries. The walker shows them under the open cards: green collapsed cards that expand to the details + "Revertir este cambio" (`fxRevert`: finds the changed text by its context and puts the old text back; refuses if that text was edited since), grey struck cards with "Restaurar". Reset on Revisar/demo/series/language change.
- `applyProposal` guards: refuses on stale text (script changed since the review; trailing whitespace ignored), says so when a patch changes nothing, flashes + scrolls to the changed text, and for cold-open / title / keyword / thumbnail / description fixes says where the change went (that was the "accept does nothing" bug).
- Keep the script text **last** in every AI prompt. The server puts the house rules and Bible-version rule in one cached system block; it is below the 512-token cache minimum, so caching is currently a no-op (see `sd_ai_usage` cache columns).
- Ad warnings are our reading of YouTube's rules, never a promise. Timing limits we invented are labelled as ours.

## Color code (text + timeline)
- `cats_logic.js` is the single table: families hi (can remove ads), mid (can limit ads), cut (would be removed), fill (fillers), pol (to polish), with priority hi > mid > cut > fill > pol. Colors live as `--c-*` / `--m-*` tokens in `theme2026.css` (light + dark). Color is never the only cue: each family also has its own line style, and timeline markers have their own shape.
- Legend chips (`catLegendHTML`) double as filters (state in localStorage `sd-cats-off`, `html.cat-off-<id>` classes). The 3-lane `timelineHTML` (`base.html`) and `manuscriptHTML` are expert-mode only now.
- Guided step 2: `rail_ui.js` lays a rail (minute per paragraph, timeline shapes, editor notes) over the script box's left padding and a minimap above the text (window follows scroll; tap or drag to jump; tap a marker to open its paragraph). It is an overlay positioned from paragraph rects, the editor DOM is untouched; typing removes it until the next review. Pure data in `rail_logic.js` (`railItems`, `railCrowd`). Editor notes default on for desktop, off on phone (`sd-rail-cues`); verses toggle `sd-rail-refs`.
