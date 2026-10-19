// Each case: expected results written BEFORE running the engine.
// red = monetization categories expected non-green (by preflight id)
// yellow = SEO/spoken rows expected to FAIL (by row id)
// Corrected Oct 2026: titles in T2/T3/T6 are not search-shaped (search flag is right); one generic word in T6 is not a problem.
// hook/promise/cta = expected pass (true) or fail (false)
module.exports = [
{
  id: "T1 clean-es", lang: "es", title: "¿Qué dice la Biblia sobre el perdón?", keyword: "perdón",
  text: `¿Alguna vez has sentido que no puedes perdonar a alguien? Hoy veremos qué dice la Biblia sobre el perdón, y vas a descubrir por qué el perdón te libera a ti primero.
Primero, leamos Mateo 18:21: «Entonces Pedro se le acercó y le dijo: Señor, ¿cuántas veces perdonaré a mi hermano que peque contra mí? ¿Hasta siete?» Jesús responde con setenta veces siete. El perdón no es un número; es un hábito.
Ahora bien, perdonar no significa negar el daño. Significa soltar el derecho a cobrarlo. ¿Y si el perdón fuera más para ti que para el otro? Imagínate cargar esa deuda por años.
Por último, Colosenses 3:13 dice que debemos perdonar como Cristo nos perdonó. El perdón que recibimos es la medida del perdón que damos.
Si este mensaje te ayudó, comenta qué te cuesta perdonar. En el próximo episodio veremos el libro de Jonás.`,
  expect: { red: [], yellow: [], hook: true, promise: true, cta: true },
},
{
  id: "T2 greeting-first-es", lang: "es", title: "La oración que cambia todo", keyword: "oración",
  text: `Hola a todos, bienvenidos de nuevo al canal. Antes de empezar, no olvides suscribirte y activar la campanita. Bueno, hoy vamos a hablar de la oración.
La oración es, o sea, hablar con Dios. Es muy importante. Hay cosas que solo se aprenden orando, ¿verdad? Este, básicamente la oración cambia al que ora.
Lucas 11:1 dice que los discípulos pidieron: «Señor, enséñanos a orar». Ellos vieron algo en la oración de Jesús.
En resumen, la oración no cambia a Dios; te cambia a ti. Suscríbete, comparte y dale like. Nos vemos.`,
  expect: { red: [], yellow: ["muletillas", "weak", "search"], hook: false, promise: false, cta: false, notes: "promise 'hoy vamos a hablar de' is a greeting phrase, not a promise marker; two CTA clusters (start+end); muletillas o sea/bueno/¿verdad?/este/básicamente ≥1.5/100" },
},
{
  id: "T3 healing-promise-es", lang: "es", title: "Sanidad divina hoy", keyword: "sanidad",
  text: `¿Puede Dios sanar hoy? Hoy veremos lo que la Escritura enseña sobre la sanidad, y aprenderás a orar con fe sin caer en promesas falsas.
Primero, Santiago 5:14 dice: «¿Está alguno enfermo entre vosotros? Llame a los ancianos de la iglesia, y oren por él». La oración por los enfermos es bíblica.
Pero hay quienes enseñan que Dios te sanará si dejas la medicina y siembras una ofrenda. Eso no es fe; es manipulación. La Biblia nunca dice que debas dejar tus medicamentos.
Por último, Pablo mismo tenía un aguijón en la carne que Dios no quitó. La sanidad es un regalo, no un contrato.
Comenta tu testimonio abajo. La próxima semana seguimos con el libro de Job.`,
  expect: { red: ["harm"], yellow: ["search"], hook: true, promise: true, cta: true, notes: "'vosotros' inside quote must NOT trigger regional; 'Dios te sanará si' + 'dejas la medicina' are quoted as false teaching but engine can't tell — flag expected, context is for the host" },
},
{
  id: "T4 graphic-violence-es", lang: "es", title: "Caín y Abel: el primer asesinato", keyword: "Caín y Abel",
  text: `¿Por qué Dios aceptó la ofrenda de Abel y no la de Caín? Hoy veremos la historia de Caín y Abel y descubrirás qué revela sobre el corazón humano.
Primero, Génesis 4:8: «Y aconteció que estando ellos en el campo, Caín se levantó contra su hermano Abel, y lo mató». Fue el primer asesinato de la historia.
Imagínate la escena con detalle: Caín golpea a su hermano una y otra vez, la sangre brota a borbotones, Abel se desangra en la tierra mientras Caín lo mira morir. Esa es la violencia del pecado.
Ahora bien, Dios no mató a Caín. Le puso una marca de protección. Hay gracia incluso para el asesino.
Por último, Hebreos 12:24 dice que la sangre de Jesús habla mejor que la de Abel. Comparte este episodio con alguien que cargue culpa. En el próximo episodio: Noé.`,
  expect: { red: ["violence"], yellow: [], hook: true, promise: true, cta: true, notes: "biblical violence is green at mention level; the 'con detalle… a borbotones… desangra' paragraph should push it to graphic/amarillo" },
},
{
  id: "T5 controversial-nongraphic-es", lang: "es", title: "¿Qué dice la Biblia sobre el suicidio?", keyword: "suicidio",
  text: `¿Qué dice la Biblia sobre el suicidio? Es una pregunta que muchos hermanos cargan en silencio. Hoy veremos lo que dice la Escritura y vas a ver que hay esperanza.
Primero, la Biblia registra casos de suicidio sin celebrarlos: Saúl, Ahitofel, Judas. Ninguno es presentado como ejemplo.
Ahora bien, Salmos 34:18 dice: «Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu». Dios no abandona al que sufre.
Si hoy estás pensando en el suicidio, habla con alguien ahora mismo. Busca ayuda profesional; eso también es fe.
Por último, la depresión no es falta de fe. Elías la vivió. Comenta si necesitas oración. La próxima semana: Elías en la cueva.`,
  expect: { red: [], yellow: [], hook: true, promise: true, cta: true, notes: "Jan-2026 rule: non-graphic suicide discussion is green; 4 mentions in ~170 words is dense — engine 'focal' threshold (≥5 or ≥4/1000 with ≥3) will trigger; focal level for controversial is 'verde' so still green. Keyword spread: 'suicidio' x4 across thirds → pass" },
},
{
  id: "T6 regional-voseo-es", lang: "es", title: "Fe en tiempos difíciles", keyword: "fe",
  text: `¿Sabés qué pasa cuando la fe se cansa? Hoy veremos tres cosas que la Biblia dice sobre la fe en tiempos difíciles, y vas a descubrir que la fe cansada sigue siendo fe.
Primero, Hebreos 11:1 define la fe como la certeza de lo que se espera. Vos tenés esa certeza aunque no la sientas, che.
Segundo, en plan, la fe no es sentir; es confiar. Está chévere sentir, pero no es la base.
Tercero, Jesús dijo que con fe como un grano de mostaza mueves montañas. Ahorita no ves la montaña moverse, pero se mueve.
Si esto te sirvió, suscríbete. En el siguiente episodio: la fe de Abraham.`,
  expect: { red: [], yellow: ["regional", "search"], hook: true, promise: true, cta: true, notes: "sabés/tenés/vos/che/en plan/chévere/ahorita → regional fail; 'cosas' → weak" },
},
{
  id: "T7 clean-en", lang: "en", title: "What does the Bible say about anxiety?", keyword: "anxiety",
  text: `Have you ever felt anxiety so heavy you couldn't pray? Today you'll learn what the Bible says about anxiety, and you'll see that God meets you in it.
First, read Philippians 4:6: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God." Paul wrote that from prison.
Next, anxiety is not a sin. Jesus himself was in anguish in Gethsemane. The Bible never shames the anxious; it invites them.
Finally, 1 Peter 5:7 says to cast all your anxiety on him, because he cares for you. The word "cast" means to throw with force. Anxiety is something you throw, not something you carry.
Comment below with one thing you're carrying today. Next week: the Psalms of lament.`,
  expect: { red: [], yellow: [], hook: true, promise: true, cta: true },
},
{
  id: "T8 profanity-hate-en", lang: "en", title: "Why I left that church", keyword: "church",
  text: `Have you ever walked out of a church and never gone back? Today you'll learn why I left, and you'll see what the Bible actually says about leaving a church.
First, let me be honest: that place was a shit show. The pastor was a damn liar and I was pissed. I said some things I regret.
Next, here's what I believe now. Those people were a plague on the gospel. Catholics and their rituals are a cancer on the body of Christ. That's just the truth.
Finally, Hebrews 10:25 says not to forsake the assembling of ourselves together. Leaving a church isn't leaving the Church.
Subscribe if this helped you. Next episode: how to find a healthy church.`,
  expect: { red: ["hate"], yellow: [], hook: true, promise: true, cta: true, notes: "1 moderate profanity ('shit') in 170 words = isolated → lang stays green under July-2025 rule; 'plague' near 'people' and 'cancer' near 'Catholics' → hate rojo; 'damn'/'pissed' not in lists (mild) — correct not to flag" },
},
];
