# Plan: review the message alone, build the 30 s intro afterwards (Script Desk)

Status: APPROVED 2026-10-20, not built yet. To be built in Claude Code on Adrian's PC.

## Decision (Adrian, 2026-10-20)
Video = **Intro (≈30 s) → title graphic (channel + episode title, 4 s) → message**. The message is reviewed on its own, starting at its own 0:00. The intro is built after the review, from the key idea of the message. The 7 / 20 / 30 s rules leave the message review and timeline and apply only to the intro.

## Today (what changes)
The engine (`src/build/base.html`, Structure section) times these rows from the first words of the script (shifted by the cold-open length `coSec`):
| Row | Rule now | Weight (`score_logic.js`) |
|---|---|---|
| `hook` | hook in the first 7 s | 2 |
| `promise` | clear promise by 20 s (45 s for series) | 5 |
| `content` | teaching starts within 30 s | 5 |
| `greeting` | no greetings/asks before the content | 4 |
| `prayer` | opening prayer after the promise | 1 |
| `kwopen` (SEO) | keyword in the first 20 s | soft |
| `bigidea` (`message_logic.js`) | idea heard in the first minute and at the close | — |

Also: ad-term timestamps get "opening / early" labels (`atZone` in `adterms_ui.js`, <7 s / <30 s); timeline zone legend "0–7 s gancho · 20 s promesa · 30 s intro" (`tlZones`); editor marks / rail cues `hook`, `promise`, `intro` (`edmarks_ui.js`, `rail_logic.js`); fix group `["hook","promise","greeting","content"]` in `fix_logic.js` builds the cold open from script lines (`coldCandidates` in `guion_logic.js`). Preparar already has a cold-open builder (`renderCold` in `guion_ui.js`, `G.cold`: hook clip + promise clip, ≤ 20 s).

## A. Message review (Arreglar)
1. Remove `hook`, `promise`, `content`, `greeting`, `prayer`, `kwopen` from the message review and from the score (17 points of weight leave the message score; scores rise for most scripts — expected).
2. Message times start at 0:00 of the message (drop the `coSec` shift in Arreglar). Recording/After views show video time = intro + 4 s graphic + message.
3. No opening zones in the message timeline, no `atZone` labels, no hook/promise/intro marks or rail cues on the message.
4. `bigidea` stays and matters more (the intro is built from it): (a) written in "Idea central" — required; (b) heard somewhere in the message and again at the close. "Heard in the first minute" becomes a soft tip, not a fail.
5. New yellow note `slowstart` (weight 0, never red, labelled as **our** rule): the message takes more than ~45 s from its own start to reach the teaching (greetings, announcements, long prayer). Viewers who stayed through the intro and the graphic can still leave here. Shows the time and what fills it; fix = "tighten the opening or move announcements to the end". The prayer itself is never judged, only the total wait.

## B. Intro builder (Preparar) — replaces the cold-open box
Target shape (our suggestion, labelled as ours): 0–7 s hook · by 20 s promise / what you'll get · ≤ 30 s total · then title graphic 4 s.
Sources: the key idea (required), the episode title/keyword, and the best hook/promise lines found in the message (existing `coldCandidates`).
Two ways to make it:
- **Recorded intro (default)**: 3 drafted options (~65–75 words each, Juan's pace) written from the key idea + best lines, via `sd-ai`. Juan records it separately. Rules: never rewrite or paraphrase Bible verses (quote exactly or not at all), no greetings or subscribe asks inside the intro. Guests/demo (no AI): a fill-in template from key idea + title.
- **Clips**: lines Juan already says in the message, cut by the editor (today's mechanism, extended to 30 s and three slots: hook, promise, key idea).

Intro checks (shown in Preparar, own checklist, not in the message score): hook lands ≤ 7 s; promise ≤ 20 s (45 s series rule moves here); total ≤ 30 s; no greeting/ask; keyword or title words in the first 20 s; ad-risk terms with the opening-zone weight (×2, our reading of YouTube's rules).
Recording/After timeline: lanes show Intro | Graphic (4 s) | Message.

## C. Safety switch
"Video with intro" — on by default. Off = old behavior (opening checks on the message start) for live streams, raw uploads or clips. Keep the existing code path behind the switch instead of deleting it.

## D. Data / compatibility
Saved docs with `G.cold` load as an intro in Clips mode. `fixLog`, score popover and fix cards drop the removed ids. One-time note in the score popover: "the score no longer judges the first 30 s of the message; the intro has its own checklist".

## Decisions (Adrian, 2026-10-20)
1. Default intro mode: **Recorded intro** (Clips stays available).
2. Title graphic: **fixed 4 s**.
3. AI drafts: **yes, 3 options** per episode via `sd-ai` (one call; same Bible guard as other AI edits; script/key idea text last in the prompt).
4. Build in Claude Code on the PC.

## Suggested build order (deploy after each step if tests pass)
1. Switch (C) + remove/gate the six rows and the `coSec` shift (A1–A3); update node tests and score ladders.
2. `bigidea` rework + `slowstart` note (A4–A5).
3. Intro builder UI in Preparar: Recorded mode with template fallback, intro checklist (B).
4. `sd-ai` intro-drafting action (returns 3 options as JSON) + Clips mode carry-over (D). Deploy the edge function with the Supabase CLI or connector.
5. Timeline lanes Intro | Graphic | Message in Grabar/Después; Playwright `pwin`; full regression; deploy.

## Tests to update / add
`eval/run.js` (structure rows), `eval/timing_test.js` (timing rules v2 — biggest change), `eval/score_test.js` (ladders), `eval/rail_test.js` (no hook/intro cues). Playwright: `pwdc` uses the `promise` cold-open card as its "applied outside the script" case — switch to a field fix; `pwtm`, `pwrl`, `pwcl` (zones/markers); new `pwin` for the intro builder (both modes, checks, timeline lanes, phone + desktop, ES/EN).

## Risks
- Score jump may look like the app "got easier" → the one-time note in D.
- If the intro is skipped in practice, the message start is unjudged → switch C.
- AI-drafted intros must stay faithful to the message → same checks + the Bible guard (`polish_test`).
