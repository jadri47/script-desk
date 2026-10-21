
// ---------- "What I'd fix first": evidence + concrete, verified proposals (pure) ----------
const FIX_SKIP = new Set(["runtime"]); // no text change can fix these
const FIX_GROUPS = [["hook", "promise", "greeting", "content"], ["search", "title"], ["bigidea", "recap"]];
const upperFirst = (s) => s.replace(/^(\s*[«"“¿¡(]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());

function applyPatches(text, patches) {
  const ps = [...patches].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = text, floor = Infinity;
  for (const p of ps) {
    if (p.end > floor) continue; // overlapping patch: skip
    out = out.slice(0, p.start) + p.rep + out.slice(p.end);
    floor = p.start;
  }
  return out;
}
function delUnitPatch(text, u) {
  let e = u.end;
  while (e < text.length && (text[e] === " " || text[e] === "\t")) e++;
  if ((u.start === 0 || text[u.start - 1] === "\n") && text[e] === "\n") e++;
  return { start: u.start, end: e, rep: "" };
}
const unitAtPos = (U, pos) => U.find((u) => pos >= u.start && pos < u.end) || null;
const failIds = (R) => new Set(Object.values(R.sections).flat().filter((r) => !r.passed || r.warn).map((r) => r.id));

// Run the whole review on the proposal and report what it fixes and what it breaks.
function verifyProposal(text, opts, R, p) {
  let t2 = text, o2 = { ...opts };
  if (p.patches && p.patches.length) t2 = applyPatches(text, p.patches);
  if (p.kind === "cold") o2.coldOpen = { hook: p.hook ? p.hook.text : "", promise: p.promise ? p.promise.text : "", mode: [p.hook, p.promise].filter(Boolean).every((x) => x.mode === "move") ? "move" : "dup" };
  if (p.kind === "field") o2[p.field] = p.value;
  const R2 = analyze(t2, o2);
  const before = failIds(R), after = failIds(R2);
  // score after the change, with what the person already ignored, so a card's badge shows the real gain (jadri47, 2026-10-21)
  const dis = typeof state !== "undefined" && state.fixDismissed ? state.fixDismissed : undefined;
  return { fixed: [...before].filter((x) => !after.has(x)), broke: [...after].filter((x) => !before.has(x) && x !== "runtime"), text: t2, opts: o2, score: scoreOf(R2, dis).score };
}

// Filler removal keeps the sentence grammatical: commas, closing tag questions and capitals.
function fillerPatch(text, hit) {
  let s = hit.start, e = hit.end;
  const before = text.slice(Math.max(0, s - 3), s), after = text.slice(e, e + 2);
  const atStart = s === 0 || /[.!?…\n]\s*$/.test(text.slice(Math.max(0, s - 3), s)) || /^[¿¡]$/.test(text[s - 1] || "");
  if (/^[,]?\s*¿/.test(hit.text) || /^¿/.test(text.slice(s, e))) {
    // tag question at the end of a sentence: "…así, ¿verdad?" → "…así."
    let s2 = s;
    while (s2 > 0 && /[\s,]/.test(text[s2 - 1])) s2--;
    return { start: s2, end: e, rep: "." };
  }
  if (atStart) {
    let e2 = e;
    while (e2 < text.length && /[\s,…]/.test(text[e2]) && text[e2] !== "\n") e2++;
    const next = text[e2] || "";
    return { start: s, end: Math.min(text.length, e2 + (next ? 1 : 0)), rep: next ? next.toUpperCase() : "" };
  }
  if (/,\s*$/.test(before) && /^[.!?…]/.test(after)) { let s2 = s; while (s2 > 0 && /\s/.test(text[s2 - 1])) s2--; if (text[s2 - 1] === ",") s2--; return { start: s2, end: e, rep: "" }; }
  if (/,\s*$/.test(before) && /^\s*,/.test(after)) { let s2 = s; while (s2 > 0 && /[\s]/.test(text[s2 - 1])) s2--; if (text[s2 - 1] === ",") s2--; let e2 = e; if (text[e2] === ",") e2++; return { start: s2, end: e2, rep: "" }; }
  if (/^,/.test(after)) { let e2 = e + 1; while (text[e2] === " ") e2++; return { start: s, end: e2, rep: "" }; }
  let e2 = e;
  if (text[e2] === " ") e2++; else if (text[s - 1] === " ") s--;
  return { start: s, end: e2, rep: "" };
}

const WEAK_SAFE = { "muy importante": 1, "súper": 1, "interesante": 1, "bonito": 1, "bonita": 1, "cosas": 1, "very important": 1, "nice": 1, "things": 1, "stuff": 1 };
function weakPatch(text, hit) {
  const key = hit.text.toLowerCase();
  if (!WEAK_SAFE[key]) return null;
  let alt = hit.alts[0];
  if (key === "cosas") { const prev = (text.slice(Math.max(0, hit.start - 12), hit.start).match(/(\p{L}+)\s*$/u) || [])[1] || ""; alt = /as$/i.test(prev) ? "verdades" : "aspectos"; if (/as$/i.test(prev) && /^(las|unas|estas|esas|muchas|otras|todas|algunas|tantas)$/i.test(prev)) alt = "verdades"; }
  if (hit.text[0] === hit.text[0].toUpperCase()) alt = alt[0].toUpperCase() + alt.slice(1);
  return { start: hit.start, end: hit.end, rep: alt };
}
const REG_MAP = { vos: "tú", vosotros: "ustedes", vosotras: "ustedes", sabés: "sabes", tenés: "tienes", querés: "quieres", podés: "puedes", sos: "eres", vení: "ven", mirá: "mira", escuchá: "escucha", ahorita: "en un momento", platicar: "conversar", chévere: "excelente", chido: "excelente", bacán: "excelente", padrísimo: "excelente", pana: "hermano", parcero: "hermano", cuate: "hermano", coger: "tomar", vale: "de acuerdo", };
function regionalPatch(text, hit) {
  const k = hit.text.toLowerCase();
  if (/^(güey|wey|guey|che|tío|tía|en plan)$/.test(k)) return fillerPatch(text, hit);
  let rep = REG_MAP[k];
  if (!rep) return null;
  if (hit.text[0] === hit.text[0].toUpperCase()) rep = rep[0].toUpperCase() + rep.slice(1);
  return { start: hit.start, end: hit.end, rep };
}
// Split a long sentence at the connector nearest its middle, never inside a quote.
function splitPatch(text, s, quotes) {
  const re = /(,\s+)(y|pero|porque|así que|entonces|and|but|because|so)\s|(;\s+)/giu;
  const body = text.slice(s.start, s.end), mid = body.length / 2;
  let best = null, m;
  while ((m = re.exec(body))) {
    const pos = s.start + m.index;
    if (insideAny(quotes, pos, pos + 1)) continue;
    const left = wordTokens(body.slice(0, m.index)).length, right = wordTokens(body.slice(m.index)).length;
    if (left < 8 || right < 8) continue;
    if (!best || Math.abs(m.index - mid) < Math.abs(best.idx - mid)) best = { idx: m.index, m };
  }
  if (!best) return null;
  const { m: bm, idx } = best;
  const start = s.start + idx;
  if (bm[3]) { const nextCh = body[idx + bm[0].length] || ""; return { start, end: start + bm[0].length + 1, rep: ". " + nextCh.toUpperCase() }; }
  const conj = bm[2];
  return { start, end: start + bm[1].length + conj.length, rep: ". " + conj[0].toUpperCase() + conj.slice(1) };
}
function aiTellPatch(text, hit) {
  let e = hit.end;
  const rest = text.slice(e, e + 6);
  const mq = rest.match(/^,?\s*que\s+/i) || rest.match(/^[,:]?\s+/);
  if (mq) e += mq[0].length;
  const atStart = hit.start === 0 || /[.!?…\n]\s*$/.test(text.slice(Math.max(0, hit.start - 3), hit.start));
  const next = text[e] || "";
  return atStart && next ? { start: hit.start, end: e + 1, rep: next.toUpperCase() } : { start: hit.start, end: e, rep: "" };
}

// Spanish article guess for a bare keyword ("ansiedad" → "la ansiedad"); names and phrases with an article stay as they are.
const FEM = new Set(["fe", "mente", "muerte", "paz", "cruz", "luz", "ley", "sangre", "carne", "fuente", "gente", "noche", "tarde", "fuerza", "esperanza", "gracia", "iglesia", "oración", "salvación", "biblia", "palabra", "familia", "vida", "verdad", "señal", "duda", "ira", "envidia", "culpa", "vergüenza", "soledad", "tristeza", "fe cristiana"]);
const FEMN = new Set([...FEM].map(norm));
const NOART = new Set(["dios", "jesús", "jesus", "cristo", "david", "pablo", "pedro", "moisés", "abraham", "maría", "juan", "job", "noé"]);
function esArticle(kw) {
  const k = norm(kw).trim(), first = k.split(/\s+/)[0];
  if (/^(el|la|los|las|un|una|lo|mi|tu|su)$/.test(first) || NOART.has(first) || /^[A-ZÁÉÍÓÚÑ]/.test(kw.trim()) && !/^[A-ZÁÉÍÓÚÑ]+$/.test(kw.trim())) return "";
  const plural = /s$/.test(first) && !/(is|us|sis)$/.test(first);
  const sing = plural ? first.replace(/es$/, "").replace(/s$/, "") : first;
  const fem = FEMN.has(k) || FEMN.has(first) || FEMN.has(sing) || (/(a|ion|dad|tad|tud|ez|umbre|sis)$/.test(sing) && !/(ma|pa)$/.test(sing));
  return plural ? (fem ? "las " : "los ") : fem ? "la " : "el ";
}

// Live-service phrases → what a person watching alone would hear. "" = remove. Phrases that state a fact
// ("el domingo pasado", "en el servicio de hoy") have no rule: a rule would have to invent what replaces them.
const PULPIT_FIX = { "abran sus biblias": "busca conmigo", "abran su biblia": "busca conmigo", "abramos nuestras biblias": "busca conmigo", "abramos la biblia": "busca conmigo", "abrid vuestras biblias": "busca conmigo", "abrid la biblia": "busca conmigo",
  "querida congregación": "querido oyente",
  "¿amén?": "", "¿me dicen amén?": "", "¿me decís amén?": "", "digan amén": "", "decid amén": "", "un aplauso": "", "pueden sentarse": "", "podéis sentaros": "", "pónganse de pie": "", "póngase de pie": "", "poneos de pie": "", "levanten la mano": "", "levanten sus manos": "", "levantad la mano": "",
  "open your bibles": "turn with me", "turn in your bibles": "turn with me", "dear congregation": "dear friend", "church family": "friend",
  "can i get an amen": "", "say amen": "", "please stand": "", "you may be seated": "", "raise your hand": "" };
function pulpitPatch(text, hit, U) {
  const k = hit.text.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PULPIT_FIX, k)) return null;
  const to = PULPIT_FIX[k], after = text.slice(hit.end, hit.end + 12);
  if (/^(?:busca|turn with)/.test(to) && !/^\s+(?:en|a|to)\s+(?=\p{Lu}|\d)/u.test(after)) return null; // only when a passage follows: "Abran sus Biblias en Juan 3"
  if (to === "" && !(/\?$/.test(hit.text) || /^\s*(?:[.!?…]|\n|$)/.test(after))) return null; // only when the phrase ends its sentence
  if (to === "" && !/\?$/.test(hit.text) && /^\s*\?/.test(after)) { // "…respeto, can I get an amen?" → "…respeto."
    let s2 = hit.start; while (s2 > 0 && /[\s,]/.test(text[s2 - 1])) s2--;
    return { start: s2, end: hit.end + after.indexOf("?") + 1, rep: "." };
  }
  if (to === "") {
    const u = unitAtPos(U, hit.start), bare = (x) => x.toLowerCase().replace(/[\s¿?¡!.,;:]/g, "");
    return u && bare(u.text) === bare(hit.text) ? delUnitPatch(text, u) : fillerPatch(text, hit);
  }
  let end = hit.end, rep = to;
  const m = /^\s+a\s+(?=\p{Lu}|\d)/u.exec(text.slice(end, end + 6)); // "abran sus Biblias a Juan 3" → "busca conmigo en Juan 3"
  if (m && /^busca/.test(to)) { end += m[0].length; rep = to + " en "; }
  if (hit.text[0] === hit.text[0].toUpperCase() && /\p{L}/u.test(hit.text[0])) rep = rep[0].toUpperCase() + rep.slice(1);
  return { start: hit.start, end, rep };
}
// Plain-words explanations for technical terms, one fixed line each (Adrian reads and approves the wording).
const JARGON_GLOSS = { "justificación": "ser declarado justo ante Dios por la fe", "santificación": "el proceso de parecernos más a Cristo", "propiciación": "el sacrificio que satisface la justicia de Dios", "expiación": "el pago por el pecado", "regeneración": "el nuevo nacimiento", "escatología": "lo que la Biblia enseña sobre el final de los tiempos", "hermenéutica": "cómo interpretar la Biblia", "exégesis": "explicar lo que el texto dice en su contexto", "parusía": "la segunda venida de Cristo", "teofanía": "una aparición visible de Dios",
  "justification": "being declared righteous before God by faith", "sanctification": "the process of becoming more like Christ", "propitiation": "the sacrifice that satisfies God's justice", "expiation": "the payment that removes sin", "regeneration": "the new birth", "eschatology": "what the Bible teaches about the end times", "hermeneutics": "how to interpret the Bible", "exegesis": "explaining what the text says in its context", "parousia": "the second coming of Christ", "theophany": "a visible appearance of God" };
const JARGON_NEXT = /^(?:es|son|está|están|fue|era|se|nos|que|y|o|no|en|para|por|con|según|ya|porque|pero|como|a|al|la|el|les|le|lo|sí|is|are|was|were|that|and|or|not|in|for|by|with|according|already|because|but|as|to|the|it|which|does|will|they|we|you|i|he|she)$/i;
function jargonPatch(text, hit, en) {
  const g = JARGON_GLOSS[hit.text.toLowerCase()];
  if (!g) return null;
  const nx = (text.slice(hit.end, hit.end + 20).match(/^\s*(\p{L}+)/u) || [])[1];
  if (nx && !JARGON_NEXT.test(nx)) return null; // "la escatología dispensacionalista": inserting here would cut the phrase in two
  const closes = /^\s*[.!?;:,)]/.test(text.slice(hit.end, hit.end + 3)) || hit.end >= text.length;
  return { start: hit.end, end: hit.end, rep: (en ? ", that is, " : ", es decir, ") + g + (closes ? "" : ",") };
}
const OPENER_CONNECT = /^(y|entonces|bueno|pues|ahora|así que|and|so|well|now|then)(?=[\s,])/i;

// Build cards in priority order until `max` cards exist.
// cap = how many places each check lists as evidence (4 for the short list; Infinity when every place is needed, as in the paragraph walk).
function buildFixCards(text, R, opts, failed, max = 3, cap = 4) {
  const cap3 = cap === 4 ? 3 : cap, cap2 = cap === 4 ? 2 : cap;
  const U = buildUnits(R, text), en = R.lang === "en";
  const L = (es, x) => (en ? x : es);
  const cards = [], used = new Set();
  const ev = (u, marks) => ({ start: u.start, end: u.end, t: u.t0, marks: marks || [] });
  for (const row of failed) {
    if (cards.length >= max) break;
    if (used.has(row.id) || FIX_SKIP.has(row.id)) continue;
    const group = FIX_GROUPS.find((g) => g.includes(row.id));
    const ids = group ? group.filter((id) => failed.some((r) => r.id === id)) : [row.id];
    ids.forEach((id) => used.add(id));
    const card = { id: row.id, ids, sec: row.sec, label: row.label, info: row.info, fix: row.fix, level: row.level, evidence: [], proposals: [], ai: null, field: null };
    const promU = R.firstPromise ? unitAtPos(U, R.firstPromise.start) : null;

    if (group && group[0] === "hook") {
      const open = U.filter((u, i) => i < 2 || u.t0 < 8);
      card.evidence = open.map((u) => ev(u, (R.greetHits || []).filter((g) => g.start >= u.start && g.end <= u.end).map((g) => [g.start, g.end])));
      const hooks = coldCandidates(U, R, "hook", { keyword: R.keyword }), proms = coldCandidates(U, R, "promise", { keyword: R.keyword });
      const needProm = ids.includes("promise") || ids.includes("greeting") || ids.includes("content");
      if (hooks[0]) {
        const hk = hooks[0], pr = needProm ? (proms.find((c) => c.i !== hk.i) || null) : null;
        // A clip can't start with "Ahora bien," or "En resumen,": trim the connector in the script too.
        const hu = U[hk.i], cm = hk.text.match(CONNECT_RE);
        let hookText = hk.text, patches = [];
        if (cm) { hookText = upperFirst(hk.text.slice(cm[0].length).replace(/^[\s,;:]+/, "")); patches = [{ start: hu.start, end: hu.end, rep: hookText }]; }
        card.proposals.push({ kind: "cold", label: L("Apertura en frío con frases del guion", "Cold open from script lines"), patches, trimmed: !!cm, hook: { i: hk.i, text: hookText, mode: hk.t0 < 20 ? "move" : "dup", t0: hk.t0, t1: hk.t1 }, promise: pr ? { i: pr.i, text: pr.text, mode: pr.t0 < 20 ? "move" : "dup", t0: pr.t0, t1: pr.t1 } : null, firstLine: open[0] ? open[0].text : "" });
      }
      const greetU = promU ? U.filter((u) => u.i < promU.i && hasPhrase(u.text, GREETINGS)) : [];
      if (greetU.length) {
        const patches = greetU.map((u) => delUnitPatch(text, u));
        patches.push({ start: promU.end, end: promU.end, rep: " " + greetU.map((u) => u.text).join(" ") });
        card.proposals.push({ kind: "patch", label: L("Pasar el saludo después de la promesa", "Move the greeting after the promise"), patches });
      }
      card.ai = open[0] ? { start: open[0].start, end: open[0].end } : null;
    } else if (group && group[0] === "search") {
      card.field = { name: "title", value: (opts.title || "").trim() };
      const kw = (opts.keyword || R.keyword || "").trim();
      if (kw) {
        const t = en ? `What does the Bible say about ${kw}?` : `¿Qué dice la Biblia sobre ${esArticle(kw)}${kw}?`;
        if (t.length <= 60) card.proposals.push({ kind: "field", field: "title", value: t, label: L("Título como la pregunta que la gente busca", "Title as the question people search") });
      }
      card.ai = { field: "title" };
    } else if (row.id === "cta") {
      const cl = R.clusters || [];
      if (cl.length > 1) {
        const keep = cl[cl.length - 1];
        const drop = cl.slice(0, -1).flatMap((c) => c.items.map((x) => unitAtPos(U, x.start))).filter(Boolean);
        const dropU = [...new Map(drop.map((u) => [u.i, u])).values()];
        const keepU = [...new Map(keep.items.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
        card.evidence = [...dropU.map((u) => ev(u, [[u.start, u.end]])), ...keepU.map((u) => ev(u, []))];
        card.keepIdx = keepU.map((u) => u.i);
        card.proposals.push({ kind: "patch", label: L("Quitar las anteriores y dejar la última", "Remove the earlier ones, keep the last"), patches: dropU.map((u) => delUnitPatch(text, u)) });
        if (dropU.some((u) => /suscr|subscrib/i.test(u.text)) && !keepU.some((u) => /suscr|subscrib/i.test(u.text)) && keepU.length) {
          const last = keepU[keepU.length - 1];
          card.proposals.push({ kind: "patch", label: L("Quitarlas y pasar «suscríbete» al final", "Remove them and move \"subscribe\" to the end"), patches: [...dropU.map((u) => delUnitPatch(text, u)), { start: last.end, end: last.end, rep: " " + L("Suscríbete para no perderte el próximo episodio.", "Subscribe so you don't miss the next episode.") }] });
        }
      } else if (!cl.length && U.length) {
        const nx = U.find((u) => u.t0 >= U[U.length - 1].t1 - 60 && hasPhrase(u.text, NEXT_EP)) || U[U.length - 1];
        card.evidence = [ev(nx, [])];
        card.proposals.push({ kind: "patch", label: L("Una petición clara antes del cierre", "One clear ask before the close"), patches: [{ start: nx.start, end: nx.start, rep: L("Si este episodio te ayudó, compártelo con alguien que lo necesite. ", "If this episode helped you, share it with someone who needs it. ") }] });
      }
    } else if (row.id === "ending") {
      const tail = U.slice(-2);
      card.evidence = tail.map((u) => ev(u, []));
      const last = U[U.length - 1];
      const nx = (opts.nextEp || "").trim().replace(/[.!?]+$/, "");
      const line = nx ? L(`La próxima semana veremos ${nx}. Te espero en el siguiente episodio.`, `Next week we'll look at ${nx}. See you in the next episode.`) : L("La próxima semana seguimos con el siguiente episodio de la serie. Te espero.", "Next week we continue with the next episode of the series. See you then.");
      // With a closing prayer or blessing, the line goes just before it, so the prayer stays the last word.
      const totalT = last ? last.t1 : 0;
      const pray = U.find((u) => u.t0 >= totalT - 240 && (isPrayerText(u.text) || hasPhrase(u.text, BLESSINGS)));
      const patch = pray ? { start: pray.start, end: pray.start, rep: line + " " } : last ? { start: last.end, end: last.end, rep: "\n\n" + line } : null;
      if (pray) card.evidence = [ev(pray, [])];
      if (patch) card.proposals.push({ kind: "patch", label: pray ? L("Añadir una línea al próximo episodio antes de la oración final", "Add a line to the next episode before the closing prayer") : L("Añadir una línea al próximo episodio", "Add a line to the next episode"), note: nx ? "" : L("Escribe el tema del próximo episodio en «Tema y próximo episodio» y la frase lo nombrará.", "Enter the next episode's topic under \"Topic and next episode\" and the line will name it."), patches: [patch] });
      card.ai = last ? { start: last.start, end: last.end } : null;
    } else if (row.id === "muletillas") {
      const hits = (R.mulHits || []).slice().sort((a, b) => a.start - b.start);
      const us = [...new Map(hits.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.more = Math.max(0, us.length - cap);
      // fillers side by side ("Este, básicamente…") are removed as one piece
      const merged = [];
      for (const x of hits) { const p = merged[merged.length - 1]; if (p && !/\?$/.test(p.text) && !/^¿/.test(x.text) && /^[\s,]*$/.test(text.slice(p.end, x.start))) { p.end = x.end; p.text = text.slice(p.start, p.end); } else merged.push({ ...x }); }
      card.proposals.push({ kind: "patch", label: L("Quitar las muletillas", "Remove the fillers"), patches: merged.map((x) => fillerPatch(text, x)) });
      card.ai = us[0] ? { start: us[0].start, end: us[0].end } : null;
    } else if (row.id === "weak") {
      const hits = (R.weakHits || []).slice().sort((a, b) => a.start - b.start);
      const us = [...new Map(hits.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.more = Math.max(0, us.length - cap);
      const ps = hits.map((x) => weakPatch(text, x)).filter(Boolean);
      if (ps.length) card.proposals.push({ kind: "patch", label: L("Cambiar por palabras precisas", "Swap in precise words"), patches: ps, of: hits.length });
      card.ai = us[0] ? { start: us[0].start, end: us[0].end } : null;
    } else if (row.id === "regional") {
      const hits = (R.regHits || []).slice().sort((a, b) => a.start - b.start);
      const us = [...new Map(hits.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.more = Math.max(0, us.length - cap);
      const ps = hits.map((x) => regionalPatch(text, x)).filter(Boolean);
      if (ps.length) card.proposals.push({ kind: "patch", label: L("Pasar a español neutro", "Switch to neutral Spanish"), patches: ps, of: hits.length });
      card.ai = us[0] ? { start: us[0].start, end: us[0].end } : null;
    } else if (row.id === "long") {
      const ls = R.longSents || [];
      card.evidence = ls.slice(0, cap3).map((s) => ({ start: s.start, end: s.end, t: R.timeAt(s.start), marks: [] }));
      card.more = Math.max(0, ls.length - cap3);
      const ps = ls.map((s) => splitPatch(text, s, R.quotes || [])).filter(Boolean);
      if (ps.length) card.proposals.push({ kind: "patch", label: L("Partir en el conector más natural", "Split at the most natural connector"), patches: ps, of: ls.length });
      card.ai = ls[0] ? { start: ls[0].start, end: ls[0].end } : null;
    } else if (row.id === "aitell") {
      const hits = (R.aiHits || []).slice().sort((a, b) => a.start - b.start);
      const us = [...new Map(hits.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.proposals.push({ kind: "patch", label: L("Quitar las frases de plantilla", "Remove the template phrases"), patches: hits.map((x) => aiTellPatch(text, x)) });
      card.ai = us[0] ? { start: us[0].start, end: us[0].end } : null;
    } else if (row.id === "kw") {
      card.field = { name: "keyword", value: (opts.keyword || "").trim() };
      if (R.keyword) card.proposals.push({ kind: "field", field: "keyword", value: R.keyword, label: L(`Usar «${R.keyword}», la frase que más repites`, `Use "${R.keyword}", your most repeated phrase`) });
    } else if (row.id === "readability") {
      const hard = U.filter((u) => u.wc >= 8).map((u) => ({ u, d: (u.syl / u.wc) * 10 + u.wc })).sort((a, b) => b.d - a.d).slice(0, 3).map((x) => x.u).sort((a, b) => a.i - b.i);
      card.evidence = hard.map((u) => ev(u, []));
      const rs = hard.map((u) => splitPatch(text, u, R.quotes || [])).filter(Boolean);
      if (rs.length) card.proposals.push({ kind: "patch", label: L("Partir la oración más difícil en el conector más natural", "Split the hardest sentence at its most natural connector"), patches: rs });
      card.ai = hard[0] ? { start: hard[0].start, end: hard[0].end } : null;
    } else if (row.id === "rehook" && R.blocks) {
      const miss = R.blocks.filter((b) => !b.has);
      card.evidence = miss.slice(0, cap3).map((b) => { const u = U.find((x) => x.t0 >= b.from + (b.to - b.from) / 2) || U[U.length - 1]; return ev(u, []); });
      card.ai = card.evidence[0] ? { start: card.evidence[0].start, end: card.evidence[0].end, insertQuestion: true } : null;
    } else if (/^pf-/.test(row.id)) {
      const cat = row.id.slice(3);
      const hits = (R.riskHits || []).filter((x) => x.cat === cat).sort((a, b) => a.start - b.start);
      const us = [...new Map(hits.map((x) => unitAtPos(U, x.start)).filter(Boolean).map((u) => [u.i, u])).values()];
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.more = Math.max(0, us.length - cap);
      card.ai = us[0] ? { start: us[0].start, end: us[0].end, keepTerms: true } : null;
    } else if (row.id === "rhythm") {
      let best = null;
      for (let i = 0; i + 4 <= U.length; i++) { const w = U.slice(i, i + 4).map((u) => u.wc), m = w.reduce((a, b) => a + b, 0) / 4, v = w.reduce((a, b) => a + (b - m) ** 2, 0); if (!best || v < best.v) best = { i, v }; }
      if (best) { const us = U.slice(best.i, best.i + 4); card.evidence = us.map((u) => ev(u, [])); const lg = [...us].sort((a, b) => b.wc - a.wc)[0], sp = splitPatch(text, lg, R.quotes || []); if (sp) card.proposals.push({ kind: "patch", label: L("Partir la oración más larga para variar el ritmo", "Split the longest sentence to vary the rhythm"), patches: [sp] }); card.ai = { start: us[0].start, end: us[3].end }; }
    } else if (row.id === "openers" && R.inauth) {
      const op = (R.inauth.repeatedOpeners[0] || [])[0];
      const us = op ? U.filter((u) => norm(u.text).startsWith(norm(op))) : [];
      card.evidence = us.slice(0, cap).map((u) => ev(u, [[u.start, u.start + op.length]]));
      card.more = Math.max(0, us.length - cap);
      const cm = op ? OPENER_CONNECT.exec(op) : null;
      if (cm) { // keep the first three, drop the connector from the rest: "Y Dios dijo…" → "Dios dijo…"
        const ps = us.slice(3).map((u) => { const m = /^[\s,]*/.exec(text.slice(u.start + cm[0].length)); const e = u.start + cm[0].length + m[0].length; return { start: u.start, end: e + 1, rep: (text[e] || "").toUpperCase() }; }).filter((x) => x.rep.trim());
        if (ps.length) card.proposals.push({ kind: "patch", label: L(`Quitar «${cm[0]}» al inicio de las oraciones repetidas`, `Drop "${cm[0]}" from the repeated openings`), patches: ps });
      }
      card.ai = us[1] ? { start: us[1].start, end: us[1].end } : null;
    } else if (row.id === "kwspread" && R.keyword) {
      const tot = Math.max(1, R.runtimeSec), kw = norm(R.keyword);
      const has = [0, 1, 2].map((k) => U.some((u) => Math.min(2, Math.floor((u.t0 / tot) * 3)) === k && norm(u.text).includes(kw)));
      const pick = [0, 1, 2].filter((k) => !has[k]).map((k) => U.find((u) => Math.min(2, Math.floor((u.t0 / tot) * 3)) === k && u.wc >= 6)).filter(Boolean);
      card.evidence = pick.map((u) => ev(u, []));
      card.ai = pick[0] ? { start: pick[0].start, end: pick[0].end, keyword: R.keyword } : null;
    } else if (row.id === "chapters") {
      const secs = sectionsFrom(detectLayout(U, R), U, R.runtimeSec).filter((x) => x.k > 0 && ["point", "body", "intro"].includes(x.type) && !ORD_RE.test(U[x.first].text));
      const ords = en ? ["First, ", "Second, ", "Third, ", "Finally, "] : ["Primero, ", "En segundo lugar, ", "En tercer lugar, ", "Por último, "];
      const use = secs.slice(0, 4), lowerOk = (w) => new RegExp("(?<![\\p{L}])" + esc(w.toLowerCase()) + "(?![\\p{L}])", "u").test(text);
      card.evidence = use.map((x) => ev(U[x.first], []));
      const ps = use.map((x, k) => { const u = U[x.first], w = (u.text.match(/^\p{L}+/u) || [""])[0]; const body = w && lowerOk(w) ? u.text[0].toLowerCase() + u.text.slice(1) : u.text; return { start: u.start, end: u.end, rep: (k === use.length - 1 && use.length > 2 ? ords[3] : ords[Math.min(k, 2)]) + body }; });
      if (ps.length >= 2) card.proposals.push({ kind: "patch", label: L("Marcar cada punto con una transición", "Mark each point with a transition"), patches: ps });
    } else if (row.id === "refs") {
      card.evidence = (R.orphanQuotes || []).slice(0, cap3).map((q) => ({ start: q.start, end: q.end, t: R.timeAt(q.start), marks: [[q.start, q.end]] }));
    } else if (row.id === "bigidea" || row.id === "recap" || row.id === "application") {
      const M = R.msg || {}, idea = (opts.bigIdea || "").trim().replace(/[.\s]+$/, "");
      // close the teaching right before the first goodbye/CTA of the ending, not after it
      const isOut = (u) => hasPhrase(u.text, NEXT_EP) || hasPhrase(u.text, CTAS);
      const tailStart = Math.min(M.lateStart || 0, (U[Math.max(0, U.length - 6)] || { start: 0 }).start);
      const firstOut = U.findIndex((u) => u.start >= tailStart && isOut(u));
      const lastU = (firstOut > 0 && U[firstOut - 1].wc >= 4 && !isOut(U[firstOut - 1]) ? U[firstOut - 1] : null) || [...U].reverse().find((u) => u.start >= (M.lateStart || 0) && u.wc >= 4 && !isOut(u)) || null;
      const firstU = promU || U.find((u) => u.wc >= 6) || U[0];
      const closeLine = (en ? "If you take one thing from today, let it be this: " : "Si hoy te llevas una sola idea, que sea esta: ") + idea + ".";
      if (row.id === "bigidea" && !idea) card.field = { name: "bigIdea", value: "" };
      else if (row.id === "bigidea") {
        const ps = [];
        if (!M.ideaEarly && firstU) ps.push({ start: firstU.end, end: firstU.end, rep: " " + (en ? "Here's today's idea: " : "La idea de hoy es esta: ") + idea + "." });
        if (!M.ideaLate && lastU) ps.push({ start: lastU.end, end: lastU.end, rep: " " + closeLine });
        card.evidence = [!M.ideaEarly ? firstU : null, !M.ideaLate ? lastU : null].filter(Boolean).map((u) => ev(u, []));
        if (ps.length) card.proposals.push({ kind: "patch", label: L("Decir tu idea con tus propias palabras", "Say your idea in your own words"), patches: ps });
      } else {
        if (lastU) card.evidence = [ev(lastU, [])];
        if (row.id === "recap" && idea && lastU) card.proposals.push({ kind: "patch", label: L("Cerrar con tu idea central", "Close with your central idea"), patches: [{ start: lastU.end, end: lastU.end, rep: " " + closeLine }] });
        card.ai = lastU ? { start: lastU.start, end: lastU.end, note: row.id === "application" ? L("Añade al final de este fragmento una sola frase que invite al oyente a una acción concreta que pueda hacer esta semana, usando solo lo que el autor ya enseñó. No inventes doctrina ni datos.", "Add one closing sentence that invites the viewer to one concrete action they can take this week, using only what the author already taught. Do not invent doctrine or facts.") : L("Añade al final una sola frase que resuma la idea principal del episodio, con el mismo contenido que ya dijo el autor.", "Add one closing sentence that sums up the episode's main idea, using only what the author already said.") } : null;
      }
    } else if ((row.id === "pulpit" || row.id === "jargon") && R.msg) {
      const hits = R.msg[row.id] || [];
      const us = U.filter((u) => hits.some((x) => x.start >= u.start && x.end <= u.end));
      card.evidence = us.slice(0, cap).map((u) => ev(u, hits.filter((x) => x.start >= u.start && x.end <= u.end).map((x) => [x.start, x.end])));
      card.more = Math.max(0, us.length - cap);
      const term = hits[0] ? hits[0].text : "";
      const ps = row.id === "pulpit" ? hits.map((x) => pulpitPatch(text, x, U)).filter(Boolean) : hits.map((x) => jargonPatch(text, x, en)).filter(Boolean);
      if (ps.length) card.proposals.push({ kind: "patch", label: row.id === "pulpit" ? L("Decirlo a quien te ve", "Say it to the person watching") : L("Explicar el término con palabras de todos los días", "Explain the term in everyday words"), patches: ps, of: hits.length });
      card.ai = us[0] ? { start: us[0].start, end: us[0].end, note: row.id === "pulpit"
        ? L("Convierte esta frase de culto en vivo en una frase para alguien que mira el video solo en su teléfono. Conserva exactamente el mismo contenido.", "Turn this live-service sentence into one for someone watching alone on their phone. Keep exactly the same content.")
        : L(`Conserva el término «${term}» y añade justo después una explicación breve con palabras de todos los días. No cambies la doctrina.`, `Keep the term “${term}” and add right after it a short everyday-words explanation. Don't change the doctrine.`) } : null;
    } else if (row.id === "onscreen" && R.msg) {
      const off = R.msg.offscreen.slice(0, cap);
      card.evidence = off.map((x) => ({ start: x.ref.start, end: Math.min(x.quote.end, x.ref.end + 160), t: R.timeAt(x.ref.start), marks: [[x.ref.start, x.ref.end]] }));
      const seen = new Set(), ps = [];
      for (const x of off) { if (seen.has(x.paraStart)) continue; seen.add(x.paraStart); ps.push({ start: x.paraStart, end: x.paraStart, rep: `[TEXTO: ${x.ref.canonical}]\n` }); }
      if (ps.length) card.proposals.push({ kind: "patch", label: L("Añadir la señal para el editor", "Add the cue for the editor"), patches: ps });
    } else if (row.id === "reading" && R.msg) {
      card.evidence = R.msg.longReads.slice(0, cap2).map((q) => ({ start: q.start, end: Math.min(q.end, q.start + 220), t: R.timeAt(q.start), marks: [] }));
    } else if (/^pack-/.test(row.id) || row.id === "desc") {
      const f = /Title|Título/.test(row.id) ? "title" : /iniatura|humbnail/.test(row.id) ? "thumb" : "description";
      card.field = { name: f, value: (opts[f] || "").trim() };
      const kw = (opts.keyword || R.keyword || "").trim();
      if (row.id === "desc" && kw) card.proposals.push({ kind: "field", field: "description", value: (en ? `Today we're talking about ${kw}. ` : `Hoy hablamos de ${esArticle(kw)}${kw}. `) + card.field.value, label: L("Empezar con el tema y la palabra clave", "Open with the topic and keyword") });
      card.ai = { field: f };
    } else {
      const u = row.id === "kwopen" ? U[0] : null;
      if (u) {
        card.evidence = [ev(u, [])]; card.ai = { start: u.start, end: u.end, keyword: R.keyword };
        const kw = (opts.keyword || R.keyword || "").trim();
        if (kw) card.proposals.push({ kind: "patch", label: L("Nombrar el tema justo después de la primera oración", "Name the topic right after the first sentence"), patches: [{ start: u.end, end: u.end, rep: " " + (en ? `Today we're talking about ${kw}.` : `Hoy hablamos de ${esArticle(kw)}${kw}.`) }] });
      }
    }
    // keep only proposals that fix at least one of the card's checks and break nothing
    card.proposals = card.proposals.map((p) => ({ ...p, check: verifyProposal(text, opts, R, p) })).filter((p) => !p.check.broke.length && (p.check.fixed.some((id) => ids.includes(id)) || (p.of && p.patches.length < p.of)));
    if (!card.evidence.length && !card.proposals.length && !card.ai && !card.field) continue; // nothing to act on
    cards.push(card);
  }
  return cards;
}
