# Script Desk — Plan: timing and content checks, v2

Status: approved for implementation. Executor: a Claude Sonnet session in this same container.
Owner: Adrian. Live site: https://jadri47.github.io/script-desk/ (repo /home/claude/script-desk).

## Why

The structure checks were built as hard pass/fail rules with self-invented numbers (7 s hook, 20 s promise, 4-min re-hook, 6–45 min runtime). The tests behind them are looser than their labels (a "?" or the word "te" passes the hook). Quoted Scripture is counted against readability and sentence length. The 6-minute floor contradicts the monetization goal (mid-roll ads reportedly need 8+ minutes; verify in YouTube Studio, not in code). Evidence for the exact numbers is thin: the one sizeable dataset (AIR Media-Tech, 21,755 long-form videos, 2025) gives medians by length, not opening-second rules. So: keep the checks, soften the arbitrary ones, fix the weak tests, exclude Scripture, and let the channel's own retention data override defaults once there are enough episodes.

Nothing here touches doctrine, verses, or the Bible guard in `polish_logic.js`. Do not weaken `verseSpans`, `maskVerses`, `vetSection`, `vetSuggestions`.

## Ground rules for the executor

- Sources are in `/home/claude/sd/build`. `full.js` and `logic.js` are derived dumps, never edit them.
- Build: `cd /home/claude/sd/build && python3 build.py && python3 build_standalone.py`.
- Tests, all must stay green: `cd /home/claude/sd && node eval/run.js` (8/8 PASS) and `node eval/polish_test.js` (ALL PASS); browser smoke: `cd build && python3 pwpo.py` and `python3 pwvc.py` (page errors: []).
- Row API: `add(section, { id, label, passed, info, fix, level? })` inside `analyze()` in `base.html`. `rowHTML` (base.html ~1083) renders pass ✓ / fail ✕ / `level:"rojo"` as "!". There is no "soft" state yet — step 0 adds one.
- Every label that is a self-set target must say so in `info` ("meta propia" / "our target") and the disclaimer `disc2` (base.html ~885/955) must list the current numbers.
- Strings are bilingual: `L(es, en)` inside analyze; `T.es`/`T.en` elsewhere. `help_ui.js` holds the help texts: update the matching entries when a rule changes.
- Keep rows' `id`s stable where they exist (`hook`, `promise`, `content`, `greeting`, `rehook`, `cta`, `ending`, `readability`, `long`, `runtime`, `muletillas`, `application`, `bigidea`, `recap`): `fix_logic.js`, `message_ui.js`, `phases_ui.js`, and the eval testset key on them.
- After each step: build, run the four test commands, commit in `/home/claude/script-desk` after copying `standalone/site/index.html` → `index.html` and `build/work.html` → `/mnt/user-data/outputs/script-desk.html`. Commit trailers:
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: <this session's link>`. Push. Then publish the artifact with `url: https://claude.ai/artifact/3btmB6r1H19211fjhNwo2Z`.
- Do not change Supabase, edge functions, or secrets for this plan.

## Step 0 — a "soft" row state (prerequisite)

Goal: arbitrary targets show as advice, not failure.

- In `analyze()` rows, support `soft: true`. A soft row that misses its target gets `passed: true` for scoring (so it never lowers the score) plus `warn: true`.
- `rowHTML`: when `r.warn`, render mark class `warn`, symbol "·", and still show `fix`. Add CSS `.mark.warn` in `theme2026.css` using `var(--amarillo)` background, dark text.
- Section header dot (base.html ~1207 `worst`): a section with only warns shows the amber dot but the count `p of n` counts warns as passed.
- Eval: `eval/testset.js` expectations reference `allFails`; soft rows must not appear in `allFails`. Add one test fixture where a soft row warns and assert it is absent from `allFails`.

## Step 1 — Hook (id `hook`), soft, 7 s target kept

Current test (base.html ~705): regex for `?`/`¿` or any 2nd-person word in the first sentence. Replace with a score over the first sentence (`sents[0]`):

- +2 question (`?`/`¿`), +2 tension word (reuse `TENSION_RE` from `guion_logic.js` ~380 — move it to base.html so both can use it, or duplicate the list), +2 addresses the listener (`YOU_RE`, same source), +1 contains the keyword or a title content word (`contentSet(opts.title)` exists in guion_logic.js; replicate the ≥4-letter non-stopword intersection).
- −3 if the first sentence is a greeting (`GREETINGS`) or a CTA (`CTAS`).
- −2 if the first sentence is longer than 18 words (does not fit in ~7 s at the Spanish rate: 7.82 syl/s × 0.65 × 7 s ≈ 36 syllables ≈ 18 words).
- Pass: score ≥ 3. Soft.
- `info` must list what was found ("pregunta, dirigida al oyente, 21 palabras: demasiado larga para 7 s") and keep "7 s es meta propia".
- `fix` unchanged in spirit; the AI "Tres aperturas" prompt (base.html ~1363) already caps at 18 words — keep consistent.

## Step 2 — Promise (id `promise`), soft, 20 s target kept, implied promise allowed

Current test: first `PROMISES` phrase at ≤ 20 s. Keep that as "explicit". Add "implied":

- Implied promise = within the first 20 s, a sentence that (a) contains the keyword or ≥ 2 content words shared with the title, and (b) contains a verb of change/benefit from a new list `PROMISE_VERBS_ES` (`cambia`, `cambiar`, `entender`, `descubrir`, `aprender`, `saber`, `vivir`, `vencer`, `salir`, `sanar`, `recibir`, `encontrar`, `conocer`) and EN equivalents. Treat implied as pass with `info` "promesa implícita".
- Series mode: if `$("series").value` is non-empty OR the first 60 s contain a recap phrase (`RECAP` list in `message_logic.js`), move the deadline to 45 s and say so in `info` ("episodio de serie: 45 s"). This 45 s is a judgment, label it "meta propia".
- Hard-fail only when no promise (explicit or implied) exists anywhere in the first 90 s. That case keeps `passed: false`, not soft.

## Step 3 — Teaching starts by 30 s (id `content`), keep hard, fix the test

- Current `contentStarts` uses first reference, first transition, first promise. A verse at 0:05 passes even if the next 50 s are greetings. Change: pass only if (a) a content start ≤ 30 s AND (b) no `GREETINGS`/`CTAS` hit between that start and 30 s. Otherwise fail with the greeting/CTA quoted.
- `info` keeps the sentence that this is the only number YouTube reports (Intro metric = share still watching at 30 s).

## Step 4 — Opening prayer allowance (new list `PRAYER_OPEN`)

- Add `PRAYER_OPEN` (es: `oremos`, `vamos a orar`, `padre celestial`, `señor te damos gracias`, `en el nombre de jesús`, `amén`; en: `let's pray`, `heavenly father`, `in jesus' name`, `amen`). Do NOT add these to `GREETINGS`.
- If a prayer appears before the promise: do not fail `greeting`; instead add a soft row `prayer` ("Oración de apertura: X s") in `structure` with the seconds it consumes and the note that for a cold viewer from search this counts against the 30 s. `fix`: "Mueve la oración después de la promesa, o acórtala a una frase."
- Steps 1–3 must treat a prayer sentence as neutral (no hook penalty, not a greeting).

## Step 5 — Re-hooks (id `rehook`), soft, tied to teaching sections

- Replace the fixed 4-minute blocks with the section boundaries from `guion_logic.js` (`G.secs` is UI-side; inside `analyze` use paragraph boundaries ≥ 90 s apart, or reuse the `splitSections` logic if it is pure). Rule: each section longer than 4 minutes should contain at least one `OPEN_LOOPS` phrase or a question that is NOT in the first sentence of the section.
- Rhetorical-question noise: a "?" counts only if the sentence is ≤ 20 words and addresses the listener (`YOU_RE`).
- Soft. `info`: "sección X (a–b) sin pregunta ni anticipo; cada 4 min es meta propia".

## Step 6 — Runtime (id `runtime`), floor 8 min, no hard ceiling

- Pass: `runtimeSec >= 480`. Below 480: hard fail, `info` "Menos de 8 min: según guías de creadores, YouTube no permite anuncios intermedios por debajo de 8 min; confírmalo en YouTube Studio → Monetización." Don't assert it as YouTube's rule in code comments either; it was not verified on an official page.
- Above 45 min: soft warn, not fail. `info`: "Más de 45 min. Datos de 21.755 videos largos (AIR Media-Tech, 2025): la retención mediana baja de 26 % (15–60 min) a 17 % (más de 1 h), pero los minutos vistos suben. Decide por tu propia retención (pestaña Resultados)."
- Update `targetRange` strings ("8–45 min"), `disc2`, help texts.

## Step 7 — Ad-break points (new, Guion tab)

- In `guion_logic.js`, add `adBreaks(secs, U, R)`: candidate = end of each teaching section (`type` body/point) with video time ≥ 240 s and ≥ 240 s from the previous candidate and ≥ 180 s before the end. Exclude any point inside a verse span (`verseSpans`) or within 10 s after a `PRAYER_OPEN` hit or inside a CTA cluster.
- First candidate must be ≥ 40 % of total runtime (one creator guide's advice, label it as such).
- UI (`guion_ui2.js`, next to chapters): list "Pausas sugeridas para anuncios" as mm:ss with the section name, a copy button, and the note "YouTube coloca los anuncios automáticamente salvo que los pongas a mano en Studio".
- Scale with `videoScale()` like chapters do.

## Step 8 — Exclude Scripture from readability and sentence length

- In `analyze()`, `readability` and `longSents` currently use all `sents` and `totalSyl`. Compute `textNoQuotes` = text with every `findQuotes` span and every unquoted verse span (`verseSpans(text, {quotes, refs})`, from `polish_logic.js`, which is concatenated before base logic? — check `build.py` order; if `verseSpans` is not yet defined at that point, move the quote-stripping to use `quotes` only and note the limit) replaced by a single space.
- Readability (IFSZ / FK) and `longSents` run on `textNoQuotes`. Keep `wc`, `runtimeSec`, `timeAt` on the full text (timing must include verses).
- `info` adds "(sin contar citas bíblicas)". Add a `message_logic`/eval fixture: a script whose only 35-word sentence is a quoted verse must pass `long` and not drop IFSZ.

## Step 9 — Fillers (id `muletillas`), relabel

- Keep the 1.5/100 threshold but make it soft and change `info` to say it counts written fillers only; spoken fillers are judged in the Ensayo (rehearsal) mode. No new logic.

## Step 10 — Clip finder and thumbnail text

- `guion_logic.js` ~389–396: allow clips up to 180 s (`dur > 180` break), keep the 20 s minimum, keep the 30–50 s bonus and add a +1 bonus for 50–90 s; ideal-length tiebreak becomes nearest to 45 s. Update `rsTh*`/clip strings that mention 60 s.
- Thumbnail rule mismatch: `packagingChecks` (guion_logic.js ~342) allows 1–5 words / 30 chars; the field placeholder and AI prompt say 2–4 words / 20 chars. Unify on **1–4 words, ≤ 24 characters** in the check, the placeholder (`thumbPh`), `maxlength` (base.html line ~241, currently 40 → 24), and the AI prompt (base.html ~1384).

## Step 11 — Calibrate from the channel's own episodes

- Data already stored in `db.collection("episodios")`: `intro` (share still watching at 30 s), `avgViewed`, `realSec`, `hookPassed`.
- When ≥ 8 episodes exist: compute medians of `intro` and `avgViewed`, and show in the structure section lead: "Tu canal: Intro mediana X %, visto Y %. YouTube llama 'por encima de lo típico' a ≥ 50 % a los 30 s." Compare hook-passed vs hook-failed episodes' median `intro`; if the difference is < 3 points, add a line "El gancho no explica tu retención inicial; mira el cuerpo del episodio."
- Fewer than 8: show "Anota N episodios más para calibrar." Nothing changes in the checks themselves; this is information only.

## Step 12 — Copy, help, disclaimer

- `disc2`, `leadStructure`, `tlZones`, `targetRange`, `help_ui.js` entries for hook/promise/content/rehook/runtime/readability/long/muletillas: update numbers and add the "soft" explanation ("· = consejo, no cuenta en la nota").
- Juan's guide (Claude Doc 7aJH1chZ9KvcrgmKNTqnBE) is out of scope for the executor; leave a note in the final message that it needs updating.

## Acceptance

- All four test commands green; no page errors on desktop and 390-px mobile.
- Fixture A (cold open, question + keyword, 14 words, promise at 12 s, verse at 25 s, 32 min): hook ✓, promise ✓, content ✓, runtime ✓, no warns.
- Fixture B (opens "Hola a todos, bienvenidos", prayer 40 s, explicit promise at 55 s, 6 min): `greeting` fails, `prayer` warns with ~40 s, `promise` fails only if no implied promise before 90 s (series empty), `runtime` fails (< 8 min).
- Fixture C (series set, recap in first 30 s, promise at 40 s): `promise` passes with "45 s" note.
- Fixture D (one 38-word quoted verse, rest short sentences): `long` passes, IFSZ computed without the verse.
- Clip finder returns at least one clip > 60 s when a 70-s paragraph qualifies.
- Ad-break list: none inside quotes, first ≥ 40 % of runtime, spacing ≥ 4 min.

## Out of scope

Verse lookup (done, `sd-bible`), AI prompts other than the small hook/thumbnail consistency edits, Supabase, teleprompter.
