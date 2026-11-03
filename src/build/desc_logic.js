// ===== Three descriptions from the AI («Descripción y capítulos»; Adrian, 2026-11-03: A, on request) =====
// One call returns DESC_N candidates; each is vetted here before it is shown (the AI's words never reach the box unchecked):
// the keyword in its first 150 characters, no ad-risk words (the same packaging scan the title gets), no Bible reference the
// script doesn't have, no quoted text the script doesn't have, no chapter list (the app adds its own below), a sane length.
const DESC_N = 3, DESC_MIN = 80, DESC_MAX = 1200;

function descPrompt(text, R, o) {
  o = o || {};
  const en = R.lang === "en";
  const mk = maskVerses(text, verseSpans(text, R), 0, text.length);
  const kw = (o.keyword || "").trim() || (typeof R.keyword === "string" && R.keyword) || "";
  const meta = [o.title && (en ? `Title: ${o.title}` : `Título: ${o.title}`), kw && (en ? `Keyword: ${kw}` : `Palabra clave: ${kw}`), o.nextEp && (en ? `Next episode: ${o.nextEp}` : `Próximo episodio: ${o.nextEp}`)].filter(Boolean).join("\n");
  const ask = en
    ? `Write ${DESC_N} different YouTube descriptions for this Bible-teaching episode. Each: 2 or 3 short paragraphs, ${DESC_MIN}-${DESC_MAX - 300} characters, in the host's voice; ${kw ? `the keyword «${kw}» word for word in the first sentence (within the first 150 characters); ` : ""}what the viewer will understand or take away, said plainly; no chapter list or timestamps (the app adds them); no hashtags; no Bible reference or quotation that is not in the script; no facts, names or numbers that are not in the script; no words YouTube restricts for ads (violence, drugs, sex, profanity). Make the three really different: one leads with the question, one with the promise, one with the story.`
    : `Escribe ${DESC_N} descripciones de YouTube distintas para este episodio de enseñanza bíblica. Cada una: 2 o 3 párrafos cortos, de ${DESC_MIN} a ${DESC_MAX - 300} caracteres, con la voz del presentador; ${kw ? `la palabra clave «${kw}» tal cual en la primera frase (dentro de los primeros 150 caracteres); ` : ""}qué va a entender o llevarse quien lo vea, dicho llano; sin lista de capítulos ni minutos (la app los añade); sin hashtags; sin ninguna referencia ni cita bíblica que no esté en el guion; sin datos, nombres ni cifras que no estén en el guion; sin palabras que YouTube limita para anuncios (violencia, drogas, sexo, groserías). Que las tres sean de verdad distintas: una abre con la pregunta, otra con la promesa, otra con la historia.`;
  const shape = `{"descs": ["...", "...", "..."]}`;
  const tail = en ? `Answer only with JSON: ${shape}\nThe ⟦V1⟧, ⟦V2⟧… marks are verses: never copy them.` : `Responde solo con JSON: ${shape}\nLas marcas ⟦V1⟧, ⟦V2⟧… son versículos: nunca las copies.`;
  return `${ask}\n${tail}\n\n${meta ? meta + "\n\n" : ""}${en ? "SCRIPT" : "GUION"}:\n${mk.masked || text}`; // the script last (house rule)
}

// risk(desc) → the list of risky words found (the packaging scan); injected so this stays pure and testable.
function vetDescs(list, text, kw, risk) {
  const fold = (s) => findFold(s).replace(/\s+/g, " ");
  // a chapter the script cites («1 Samuel 17» for its «1 Samuel 17:45») is allowed; a verse only if the script has that verse
  const sr = findReferences(text);
  const known = (r) => sr.some((x) => x.code === r.code && x.chapter === r.chapter && (r.verse == null || (x.verse === r.verse && (r.verseEnd == null || x.verseEnd === r.verseEnd))));
  const T = fold(text), K = fold((kw || "").trim());
  const out = [], why = [];
  for (const raw of Array.isArray(list) ? list : []) {
    if (typeof raw !== "string") { why.push("type"); continue; }
    const d = raw.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (d.length < DESC_MIN || d.length > DESC_MAX) { why.push("length"); continue; }
    if (/[⟦⟧]/.test(d)) { why.push("token"); continue; }
    if (/^\s*\d{1,2}:\d{2}/m.test(d)) { why.push("chapters"); continue; }
    if (K && !fold(d.slice(0, 150)).includes(K)) { why.push("keyword"); continue; }
    if (findReferences(d).some((r) => !known(r))) { why.push("ref"); continue; }
    const quoted = (d.match(/«[^»]{12,}»|"[^"]{12,}"|“[^”]{12,}”/g) || []).map((q) => fold(q.slice(1, -1)));
    if (quoted.some((q) => !T.includes(q))) { why.push("quote"); continue; }
    if (risk && risk(d).length) { why.push("risk"); continue; }
    if (out.some((x) => fold(x) === fold(d))) { why.push("dup"); continue; }
    out.push(d);
  }
  return { list: out.slice(0, DESC_N), why };
}

// Put a chosen description above the chapter block, keeping the block and anything typed after it (hashtags, links): the same
// block the «Añadir a la descripción» button writes (B-014). No block yet: the chapters given are appended.
function descWithChapters(current, chosen, chapters) {
  const cur = String(current || ""), m = /^0:00[ \t].*(?:\n\d{1,2}(?::\d{2}){1,2}[ \t].*)*/m.exec(cur);
  if (m) return chosen.trim() + "\n\n" + cur.slice(m.index).trim();
  const ch = String(chapters || "").trim();
  return chosen.trim() + (ch ? "\n\n" + ch : "");
}
// The packaging scan the title and thumbnail get (analyze's scanPack), run on the description alone.
function descRisk(d) {
  const p = (analyze("x", { description: d }).packaging || []).find((x) => x.key === "desc");
  return p && p.level !== "verde" ? p.issues : [];
}
