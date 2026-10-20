# Plan: desktop hardening (2026-10-19)

Owner: Adrian. Implementer: Sonnet in Claude Code, one step per session or less.
Main use is a **computer browser**; phone items are parked (see the end).

Read first: `CLAUDE.md` (build, tests, design rules), the user rules in `~/.claude/CLAUDE.md`.
Each step: one commit (or the commits it names), app working after it, nothing pushed without "Push".
Before every commit: build (3 scripts), the 6 node tests, `pwdc`, plus the checks the step names.
Report block per step: changed · verified (command, result) · not verified · commit · waiting on you.

Steps marked **ASK** need Adrian's yes before starting (money, download, server, or a choice).

---

## 1. Line endings stop showing fake changes  (sonnet)
**Why:** `core.autocrlf=true` and no `.gitattributes`: after every build `src/build/examples.json`
and `manifest.webmanifest` show as modified with no content change. That noise hides real changes.
**Do:** add `.gitattributes` (`* text=auto eol=lf`, plus `*.png binary`, `*.ico binary`).
Commit it alone. Then `git add --renormalize .` as a second commit, body says "line endings only".
**Done when:** build + copy site to root leaves `git status` clean except real edits;
`git diff HEAD~1 --ignore-all-space --stat` on the renormalize commit is empty.
**Careful:** do not touch untracked files. `index.html` changes must be line-ending only.

## 2. Playwright scripts write screenshots to a temp folder that exists on Windows  (haiku)
**Why:** 23 `src/build/pw*.py` files write to `/tmp/...`, which fails or lands somewhere odd on Windows.
Files: `grep -l "/tmp/" src/build/pw*.py`.
**Do:** replace the hard-coded `/tmp/...` with a folder under `tempfile.gettempdir()`
(same file names). Same edit in every file, nothing else changes.
**Done when:** `grep "/tmp/" src/build/pw*.py` is empty; `pwex`, `pwtm`, `pwsc` still pass.

## 3. `pw9` stale selectors  (sonnet)
**Why:** CLAUDE.md says `pw9` reports "MISSING" for selectors that changed.
**Do:** run it, list each MISSING selector, map it to the current element in `base.html` / `*_ui.js`
and update the selector. If a checked feature no longer exists, **do not delete the check**:
list it in the report for Adrian to decide.
**Done when:** `pw9` passes, or the only failures are the listed "feature gone" ones.

## 4. Test in Firefox and Safari's engine  (sonnet) — ASK (download ~200–300 MB, no cost)
**Why:** every check runs in Chromium only. Desktop users may use Firefox or Safari on a Mac.
The paragraph highlights use the CSS Custom Highlight API (Safari 17.2+; Firefox support: check
caniuse at the time, do not guess).
**Do:**
- `python -m playwright install firefox webkit`.
- In `pwdc pwwk pwcl pwrl pwsc pwtoast`, choose the browser from an env var
  (`SD_BROWSER=chromium|firefox|webkit`, default chromium) instead of `p.chromium`. One helper,
  same behaviour when the variable is unset.
- Run all six in each engine. Write the results table into the report.
**Done when:** the table exists and Chromium results are unchanged. **Fixes are not part of this
step:** each real failure becomes its own numbered step after Adrian sees the table.
**Also answer:** what the user sees when `CSS.highlights` is missing (run with it deleted in an init
script). If the review breaks or throws, say so; the fallback is a design choice for Adrian (show first).

## 5. Empty `catch` blocks  (sonnet)
**Why:** user rule: no empty catch. There are ~26 `catch (e) {}` in
`editor_ui.js guion_ui.js rail_ui.js score_ui.js series_ui.js standalone_ui.js theme_ui.js walk_ui.js`.
**Do:** for each, one of:
- best-effort (localStorage, layout measuring, selection placing): keep it silent and add a short
  comment saying why it's safe to ignore;
- something the person would care about (a save, a file, a network call): **don't change it here**,
  list it in the report with file:line and what the user would miss.
Behaviour unchanged = a refactor commit. Fixes for the listed ones are later steps.
**Done when:** `grep -n "catch (e) {}" src/build/*_ui.js` is empty and all checks pass.

## 6. Prompt caching in `sd-ai`  (session's top model, not sonnet) — ASK (server + small cost change)
**Why:** `supabase/functions/sd-ai/index.ts:96-104` marks the system block as cached, but it is under
the model's minimum cache size, so every call pays full price for it and logs a warning.
**Adrian picks one:**
- **A (recommended):** move the per-task instructions that never change between calls from the user
  prompt into the system block so it passes the minimum. The script text stays **last** in the prompt.
- B: leave caching as is (no change, keeps the warning).
- C: remove `cache_control` and the warning (honest, no saving).
**Do (A):** measure first: cost per call from `sd_ai_usage` for the last 2 weeks. Change, deploy with
the Supabase tool (ask before deploying), run 3 reviews, compare `sd_ai_usage` cache columns and cost.
Report before/after numbers measured in the same session; never say "cheaper" without them.
**Done when:** the cache-read column is non-zero on repeat calls and reviews still return the same shape.

## 7. Docs catch up  (sonnet)
**Do:**
- `CLAUDE.md`: Windows notes (the `src/package.json` reason; `pwd.py` is now `pwdl.py`);
  the new `pwdc` check (bar tap keeps the phone keyboard closed); browser engines from step 4.
- `HANDOFF.md`: update "Where things stand" and the open items (done: keyboard on bar tap).
- New `docs/DECISIONS.md`, newest first: today's decisions (src/package.json, pwdl rename,
  phone bar tap select-only, desktop is the main use) and the letters Adrian picks in this plan.
**Done when:** CLAUDE.md stays under 200 lines / 25 KB.

---

## Not in this plan (need Adrian or claude.ai)
- Republish the Claude artifact (only a claude.ai session can).
- Juan's guide doc and the plan docs in the claude.ai Project ("plan only" for colour code/timeline).
- iPhone/Safari check on a real device.

## Parked: phone only
- "Revisar guion" overlaps the toolbar in phone Chrome "desktop site" mode: not reproduced in
  Playwright (980 px wide, portrait + landscape). Guess: Android font boosting. Needs a screenshot.
- Formatting bar (B/I/U) only shows in full screen on a phone.
