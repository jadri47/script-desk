# Handoff: Script Desk (moving from claude.ai to Claude Code)

Written 2026-10-19 at the end of a long claude.ai session. Read `CLAUDE.md` first (layout, build, tests, deploy, design rules); this file covers the current state and what's still open.

## Links
- Live site (GitHub Pages): https://jadri47.github.io/script-desk/
- Repo: https://github.com/jadri47/script-desk (branch `main`; pushing to main deploys)
- Claude artifact copy: https://claude.ai/artifact/3btmB6r1H19211fjhNwo2Z (v67). Only claude.ai sessions can republish it.
- Supabase project `vuvwoxjlmoegstpalngx` (edge function `sd-ai` = the only Anthropic call; key in Supabase secrets). Deploy it with the Supabase CLI (`supabase functions deploy sd-ai`) or the Supabase connector, never by pasting keys into the repo.
- claude.ai Project "Podcast Message Review" has the plan docs (`claude/plan-*.md`, `claude/status-built-features.md`).

## Who
- Adrian (owner/producer; industrial engineer, builds apps with AI, bilingual ES/EN). He wants answers first, direct and honest feedback, choices as buttons, complete runnable files, and a notification when a task finishes.
- Juan Sánchez: the host, non-technical, uses it mostly on a phone. The UI must stay simple for him.

## Where things stand (site v67 + phone bar tap fix, 2026-10-19)
Recent work, newest first:
1. v67: accepted fixes show more (what it fixes, option chosen, paragraph + minute, word change, score before → after, before/after text) and each one can be reverted on its own.
2. v66: a vertical bar beside every paragraph in the script box (rail) selects that paragraph; accepted cards start collapsed and expand on tap.
3. v65: on a phone, tapping the script no longer maximizes it; only the maximizer button does.
4. v64: tapping a paragraph moves the paragraph review there; accepted = green card, ignored = grey card with Restaurar; Apply guards (stale text, no change, "applied outside the script" message); the changed text flashes in the script.
5. v61–v63: timeline + "Guion marcado" merged into the script box as a rail + minimap + editor notes; undo/redo icons fixed; service worker bypasses the HTTP cache.

All node tests pass; Playwright `pwdc pwwk pwcl pwrl pwtm pwex pwtoast` pass; `pwsc` flaky but two clean passes; `pwhw` was clean at v64.

## Open items / ideas Adrian was offered
- (done 2026-10-19) Phone: tapping a paragraph bar no longer opens the keyboard. Needs a check on a real phone.
- Phone: the formatting toolbar (B/I/U/heading) only shows in full screen. Offered: show it without maximizing.
- Plan docs in the claude.ai Project still say "plan only" for color code and timeline (both built).
- Juan's guide doc needs updating for the new rail/bars/green cards.
- Not yet tested on a real iPhone/Safari (CSS Custom Highlight API needs Safari 17.2+).
- "Revisar guion" button overlaps the toolbar in phone Chrome "desktop site" mode.
- Prompt caching in `sd-ai` is a no-op (system block under the 512-token minimum).
- (done 2026-10-19) `pw9` selectors and screenshot paths fixed. See `docs/DECISIONS.md` for engine results (Firefox/WebKit), six empty catches left for Adrian, and the prompt-caching decision. Plan: `docs/PLAN-2026-10-desktop.md`.

## Start in Claude Code
```
cd C:\Users\jadri\Claude_Programming\script-desk
git pull
claude
```
First prompt suggestion: "Read CLAUDE.md and HANDOFF.md, build, run the node tests and pwdc, and tell me what you see."
