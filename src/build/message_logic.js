// ---------- Mensaje en YouTube: from the pulpit to someone watching alone (no theology is judged) ----------
const PULPIT = [
  "abran sus biblias", "abran su biblia", "abramos nuestras biblias", "abramos la biblia", "abrid vuestras biblias", "abrid la biblia",
  "pónganse de pie", "póngase de pie", "poneos de pie", "levanten la mano", "levanten sus manos", "levantad la mano",
  "díganle a su vecino", "dígale a su hermano", "decidle a vuestro hermano", "¿amén?", "¿me dicen amén?", "¿me decís amén?", "digan amén", "decid amén",
  "un aplauso", "pueden sentarse", "podéis sentaros", "los que estamos aquí", "estamos reunidos", "nos hemos reunido", "querida congregación",
  "el domingo pasado", "este domingo en la iglesia", "en el servicio de hoy",
  "open your bibles", "turn in your bibles", "please stand", "you may be seated", "raise your hand", "turn to your neighbor", "tell your neighbor",
  "can i get an amen", "say amen", "church family", "dear congregation", "last sunday", "in this service",
];
const JARGON = [
  "propiciación", "expiación", "justificación", "santificación", "glorificación", "regeneración", "imputación", "soteriología", "escatología",
  "pneumatología", "cristología", "dispensación", "dispensacionalismo", "hermenéutica", "exégesis", "kénosis", "kenosis", "perícopa", "teofanía",
  "hipóstasis", "parusía", "milenarismo", "premilenial", "amilenial", "postmilenial", "transubstanciación", "monergismo", "sinergismo",
  "propitiation", "expiation", "justification", "sanctification", "glorification", "regeneration", "imputation", "soteriology", "eschatology",
  "pneumatology", "christology", "dispensation", "dispensationalism", "hermeneutics", "exegesis", "pericope", "theophany", "hypostatic",
  "parousia", "premillennial", "amillennial", "postmillennial", "transubstantiation", "monergism", "synergism",
];
const EXPLAIN_RE = /(es decir|significa|quiere decir|o sea|en otras palabras|dicho de otro modo|that is|which means|means|in other words|\(|:|—|–)/i;
const RECAP = ["hoy vimos", "hoy hemos visto", "en resumen", "para resumir", "recuerda", "recuerden", "recordad", "lo que nos llevamos", "si te quedas con", "si os quedáis con", "en pocas palabras", "la idea de hoy",
  "today we saw", "to sum up", "in summary", "remember", "if you remember one thing", "the big idea", "here's what we learned"];
// A concrete step for the viewer, said near the end ("esta semana…", "te invito a…", "start by…").
const APPLY = [
  "esta semana", "esta noche", "hoy mismo", "a partir de hoy", "desde hoy", "mañana mismo", "te invito a", "te animo a", "te reto", "te desafío", "te propongo", "te pido que",
  "tu tarea", "tu reto", "primer paso", "da el primer paso", "empieza por", "empieza hoy", "comienza hoy", "decide hoy", "ponlo en práctica", "pon en práctica", "aplica", "practica",
  "ora por", "ora hoy", "escribe una", "escribe el nombre", "apunta", "anota", "haz esto", "llama a", "perdona a", "habla con", "dedica unos minutos", "cuando te levantes",
  "this week", "tonight", "today, ", "starting today", "i invite you", "i challenge you", "i encourage you", "your homework", "first step", "take one step", "start by", "put it into practice",
  "pray for", "pray today", "write down", "write a", "try this", "call someone", "forgive", "set aside a few minutes", "when you wake up",
];
const IDEA_STOP = new Set("para porque cuando donde sobre entre desde hasta como pero aunque también solo sólo esta este estos estas tiene tienen nuestro nuestra vuestro vuestra todos todas cada mismo misma puede pueden sino nunca siempre that this with from your about there their when what which have will into they them than then just only also because already today hoy".split(" "));

function ideaWords(s) {
  return [...new Set(norm(s || "").split(/[^\p{L}]+/u).filter((w) => w.length >= 5 && !IDEA_STOP.has(w)))];
}
function shareOf(words, slice) {
  if (!words.length) return 0;
  const n = norm(slice);
  return words.filter((w) => n.includes(w.slice(0, Math.max(5, w.length - 3)))).length / words.length;
}

// Called from inside analyze(): returns hits for the fix cards and adds the "message" rows.
function messageChecks(text, opts, ctx) {
  const { add, L, refs, quotes, pairs, cues, runtimeSec, posAtTime } = ctx;
  const out = { pulpit: [], jargon: [], offscreen: [], longReads: [], earlyEnd: 0, lateStart: text.length };
  const early = Math.min(90, Math.max(30, runtimeSec * 0.25)), late = Math.min(90, Math.max(30, runtimeSec * 0.2));
  out.earlyEnd = posAtTime(early);
  out.lateStart = posAtTime(Math.max(0, runtimeSec - late));
  const insideQuote = (p) => quotes.some((q) => p >= q.start && p < q.end);

  // 1. The central idea, in the speaker's own sentence: heard early and again at the close.
  const idea = (opts.bigIdea || "").trim(), iw = ideaWords(idea);
  if (!idea) {
    add("message", { id: "bigidea", label: L("Idea central escrita", "Central idea written down"), passed: false,
      info: L("Escribe arriba, en «Idea central», tu idea en una frase. La app comprobará que se oiga al principio y al final.", "Write your one-sentence idea in “Central idea” above. The app will check it's heard at the start and at the end."),
      fix: L("Escribe tu idea central en una frase.", "Write your central idea in one sentence.") });
  } else {
    const e = shareOf(iw, text.slice(0, out.earlyEnd)), l = shareOf(iw, text.slice(out.lateStart));
    out.ideaEarly = e >= 0.5; out.ideaLate = l >= 0.5;
    const ok = out.ideaEarly && out.ideaLate;
    add("message", { id: "bigidea", label: L("La idea central se oye al principio y al final", "The central idea is heard at the start and the end"), passed: ok,
      info: ok ? L("Quien llega se entera pronto de qué va el episodio, y quien se queda se lo lleva al final.", "Newcomers learn early what it's about, and those who stay leave with it.")
        : L(`Tu idea central ${!out.ideaEarly && !out.ideaLate ? "no se oye ni en el primer minuto ni al cierre" : !out.ideaEarly ? "no se oye en el primer minuto" : "no se repite al cierre"}. ${!out.ideaEarly ? "En YouTube mucha gente decide en el primer minuto si se queda." : "Repetirla al final ayuda a recordarla."}`,
            `Your central idea ${!out.ideaEarly && !out.ideaLate ? "isn't heard in the first minute or at the close" : !out.ideaEarly ? "isn't heard in the first minute" : "isn't repeated at the close"}. ${!out.ideaEarly ? "On YouTube many people decide in the first minute whether to stay." : "Repeating it at the end helps people remember it."}`),
      fix: ok ? null : L("Dila con tus palabras en el primer minuto y repítela al cerrar.", "Say it in your own words in the first minute and repeat it at the close.") });
  }

  // 2. Pulpit phrases: on video each person watches alone.
  out.pulpit = findPhrases(text, PULPIT, "pulpit").filter((x) => !insideQuote(x.start));
  add("message", { id: "pulpit", n: out.pulpit.length, lim: 0, label: L("Habla a quien te ve, no a una congregación", "Speak to the viewer, not to a congregation"), passed: !out.pulpit.length,
    info: out.pulpit.length ? L(`Frases de culto en vivo: ${[...new Set(out.pulpit.map((x) => "«" + x.text + "»"))].slice(0, 4).join(", ")}. En video cada persona escucha sola, en su teléfono.`, `Live-service phrases: ${[...new Set(out.pulpit.map((x) => "“" + x.text + "”"))].slice(0, 4).join(", ")}. On video each person listens alone, on their phone.`)
      : L("Le hablas a una persona, como en una conversación.", "You speak to one person, like a conversation."),
    fix: out.pulpit.length ? L("Habla a «tú» y muestra el versículo en pantalla con [TEXTO: …] en vez de pedir que abran la Biblia.", "Speak to “you” and show the verse on screen with [TEXTO: …] instead of asking people to open their Bibles.") : null });

  // 3. Technical theology words without a plain explanation nearby.
  const jhits = findPhrases(text, JARGON, "jargon").filter((x) => !insideQuote(x.start));
  out.jargon = jhits.filter((x) => !EXPLAIN_RE.test(text.slice(x.end, x.end + 160)) && !EXPLAIN_RE.test(text.slice(Math.max(0, x.start - 40), x.start)));
  add("message", { id: "jargon", n: out.jargon.length, lim: 0, label: L("Los términos técnicos se explican", "Technical terms are explained"), passed: !out.jargon.length,
    info: out.jargon.length ? L(`Sin explicar: ${[...new Set(out.jargon.map((x) => x.text.toLowerCase()))].slice(0, 5).join(", ")}. Tú los conoces bien; quien llega por YouTube quizá no.`, `Not explained: ${[...new Set(out.jargon.map((x) => x.text.toLowerCase()))].slice(0, 5).join(", ")}. You know them well; someone arriving from YouTube may not.`)
      : L("Ningún término técnico queda sin explicar.", "No technical term is left unexplained."),
    fix: out.jargon.length ? L("Añade una frase corta que lo explique con palabras de todos los días; no hace falta quitarlo.", "Add a short everyday-words explanation; no need to remove the term.") : null });

  // 4. Every passage read aloud should also appear on screen.
  const paraStart = (p) => { const i = text.lastIndexOf("\n\n", p); return i < 0 ? 0 : i + 2; };
  const paraEnd = (p) => { const i = text.indexOf("\n\n", p); return i < 0 ? text.length : i; };
  for (const pr of pairs || []) {
    if (!pr.quote || pr.quote.inner.split(/\s+/).length < 6) continue;
    const a = paraStart(Math.min(pr.ref.start, pr.quote.start)), b = paraEnd(Math.max(pr.ref.end, pr.quote.end));
    const prev = text.slice(Math.max(0, a - 120), a);
    const shown = (cues || []).some((c) => (c.start >= a && c.start <= b) || (c.start >= a - 120 && c.start < a && /\[(TEXTO|CITA)/i.test(prev)));
    if (!shown && /\[(TEXTO|CITA)\s*:/i.test(text.slice(a, b))) continue;
    if (!shown) out.offscreen.push({ ref: pr.ref, quote: pr.quote, paraStart: a });
  }
  add("message", { id: "onscreen", n: out.offscreen.length, lim: 0, label: L("Cada pasaje que lees aparece en pantalla", "Every passage you read appears on screen"), passed: !out.offscreen.length,
    info: out.offscreen.length ? L(`${out.offscreen.length} pasaje(s) sin [TEXTO: …]: ${out.offscreen.slice(0, 3).map((x) => x.ref.canonical).join(", ")}. Quien escucha sin Biblia a mano lo sigue mejor si lo ve.`, `${out.offscreen.length} passage(s) without [TEXTO: …]: ${out.offscreen.slice(0, 3).map((x) => x.ref.canonical).join(", ")}. Viewers without a Bible at hand follow better when they see it.`)
      : L("Los pasajes que lees tienen su señal para el editor.", "The passages you read have their cue for the editor."),
    fix: out.offscreen.length ? L("Añade [TEXTO: libro capítulo:versículo] antes del párrafo para que el editor lo ponga en pantalla.", "Add [TEXTO: book chapter:verse] before the paragraph so the editor shows it.") : null });

  // 5. Very long readings without a pause for comment. Reading a whole passage is normal in expository teaching,
  // so this is advice (·), and only past ~150 words (about 8–10 verses). The 150 is our own target.
  out.longReads = (quotes || []).filter((q) => q.inner.split(/\s+/).length > 150);
  add("message", { id: "reading", soft: true, label: L("Lecturas largas con pausas", "Long readings with pauses"), passed: !out.longReads.length,
    info: out.longReads.length ? L(`${out.longReads.length} lectura(s) de más de 150 palabras seguidas. Leer el pasaje completo está bien; en video ayuda una pausa o el texto en pantalla. Los 150 son meta propia.`, `${out.longReads.length} reading(s) over 150 words in a row. Reading the full passage is fine; on video a pause or on-screen text helps. The 150 is our target.`)
      : L("Ninguna lectura pasa de 150 palabras seguidas.", "No reading runs over 150 words in a row."),
    fix: out.longReads.length ? L("No acortes el pasaje: muéstralo en pantalla mientras lees, o haz una pausa breve a la mitad para comentar.", "Don't shorten the passage: show it on screen while reading, or pause briefly halfway to comment.") : null });

  // 6. The close leaves them with the point, not only with the next episode.
  const tail = text.slice(out.lateStart);
  const recap = hasPhrase(tail, RECAP) || (iw.length && shareOf(iw, tail) >= 0.5);
  add("message", { id: "recap", label: L("El cierre resume lo que se llevan", "The close sums up what they take away"), passed: !!recap,
    info: recap ? L("El final recoge la idea antes de despedirse.", "The ending gathers the idea before saying goodbye.") : L("El final no repite la idea principal. Una frase de resumen ayuda a recordarla y a volver.", "The ending doesn't restate the main idea. One summary sentence helps people remember and come back."),
    fix: recap ? null : L("Antes de despedirte, di en una frase lo que se llevan hoy.", "Before saying goodbye, say in one sentence what they take away today.") });

  // 7. Teaching that ends in one concrete step for this week, not only in good information.
  const noQuotes = text.replace(/«[^»]{8,}»|“[^”]{8,}”|"[^"]{8,}"/g, " ");
  const lastPart = noQuotes.slice(Math.floor(noQuotes.length * 0.5));
  const applyOk = hasPhrase(lastPart, APPLY);
  out.noApply = !applyOk;
  add("message", { id: "application", label: L("El cierre da un paso concreto", "The close gives one concrete step"), passed: applyOk,
    info: applyOk ? L("En la última parte le pides al oyente algo concreto que hacer.", "In the last part you ask the viewer to do something concrete.")
      : L("En la última parte no se oye una acción concreta («esta semana…», «te invito a…»). Una enseñanza que termina en información se olvida; la que termina en un paso se recuerda.", "The last part has no concrete action (“this week…”, “I invite you to…”). Teaching that ends in information is forgotten; teaching that ends in a step is remembered."),
    fix: applyOk ? null : L("Antes del cierre, di una sola acción que puedan hacer esta semana, con tus palabras.", "Before the close, name one action they can take this week, in your own words.") });
  return out;
}
