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
node eval/run.js; node eval/timing_test.js; node eval/polish_test.js; node eval/score_test.js; node eval/cats_test.js; node eval/rail_test.js
```
Playwright checks (`cd src/build; python3 pwXX.py`) open `file:///home/claude/sd/standalone/site/index.html`, so link the repo first: `ln -s <repo>/src /home/claude/sd`. Main ones: `pwwk` (paragraph review), `pwcl` (color families, legend filter, minimap markers), `pwrl` (rail + minimap in the script box), `pwsc` (score pill; flaky on "off persists after reload" and "show button appears": rerun, two clean passes = OK), `pwex`, `pwmt`, `pwtm`, `pwat`, `pwhw` (header never wraps 900–1920 px), `pwtoast`. They use `mock_sb.js` instead of Supabase.

## Deploy
1. Build, run tests.
2. Copy `src/standalone/site/*` over the repo root (at least `index.html`), commit, push (GitHub Pages updates).
3. Publish `src/build/work.html` with the Artifact tool to https://claude.ai/artifact/3btmB6r1H19211fjhNwo2Z (same file path keeps the URL).
4. Send a push notification.

## Design rules that matter
- Score v2 (`score_logic.js`): score = 100 − weights of open checks − small penalty for dismissed ones; any red ⇒ ≤ 69. Weights live in one table (`SCORE_W`); ladders are pinned in `eval/score_test.js`.
- Desktop (≥900 px wide and ≥560 px tall) is a split view: script left, review right. Phone: single column, stepBar fixed at the bottom; in step 2 the script docks at the top.
- Paragraph review (`walk_ui.js`): highlights use the CSS Custom Highlight API over the editor text (the editor DOM is not changed); positions come from `buildFixCards(..., cap = Infinity)`.
- Keep the script text **last** in every AI prompt. The server puts the house rules and Bible-version rule in one cached system block; it is below the 512-token cache minimum, so caching is currently a no-op (see `sd_ai_usage` cache columns).
- Ad warnings are our reading of YouTube's rules, never a promise. Timing limits we invented are labelled as ours.

## Color code (text + timeline)
- `cats_logic.js` is the single table: families hi (can remove ads), mid (can limit ads), cut (would be removed), fill (fillers), pol (to polish), with priority hi > mid > cut > fill > pol. Colors live as `--c-*` / `--m-*` tokens in `theme2026.css` (light + dark). Color is never the only cue: each family also has its own line style, and timeline markers have their own shape.
- Legend chips (`catLegendHTML`) double as filters (state in localStorage `sd-cats-off`, `html.cat-off-<id>` classes). The 3-lane `timelineHTML` (`base.html`) and `manuscriptHTML` are expert-mode only now.
- Guided step 2: `rail_ui.js` lays a rail (minute per paragraph, timeline shapes, editor notes) over the script box's left padding and a minimap above the text (window follows scroll; tap or drag to jump; tap a marker to open its paragraph). It is an overlay positioned from paragraph rects, the editor DOM is untouched; typing removes it until the next review. Pure data in `rail_logic.js` (`railItems`, `railCrowd`). Editor notes default on for desktop, off on phone (`sd-rail-cues`); verses toggle `sd-rail-refs`.
