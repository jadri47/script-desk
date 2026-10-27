/* ===== Ayuda: un «?» junto a cada campo y sección, con una explicación breve ===== */
Object.assign(T.es, { qhBtn: "¿Qué es esto?" });
Object.assign(T.en, { qhBtn: "What is this?" });
const HELP = {
  es: {
    expert: "Apagado: la app te lleva paso a paso y muestra solo lo esencial. Encendido: ves todas las revisiones y herramientas en una sola pantalla.",
    step1: "Primer paso: pega el guion tal como lo vas a leer. La app solo sugiere; nada cambia en tu texto sin que toques «Aplicar».",
    step2: "La app revisa el guion con las reglas de anuncios de YouTube y con buenas prácticas para enseñar en voz alta. Aquí ves solo lo más importante, con el cambio ya escrito.",
    step3: "Elige el título, la miniatura y cómo empieza el video. Cuando las revisiones obligatorias pasan, aprueba el guion. «Abrir prompter» muestra el guion en letra grande y lo hace avanzar solo. «Ensayar con cronómetro» mide cuánto tardas en cada sección. «Hoja para el editor» descarga las secciones, tiempos y clips. En el prompter: ▶ empieza o pausa, − y + cambian la velocidad, A− y A+ el tamaño. Después de grabar: elige clips para Shorts y, a los pocos días, trae la retención de YouTube Studio.",
    examples: "Tres guiones de práctica: uno flojo, uno regular y uno muy bueno. Ábrelos para ver qué marca la app y cómo propone arreglarlo. Mientras practicas nada se guarda; toca «Salir del ejemplo» para volver a tu trabajo.",
    audience: "La variante del español en que hablas al canal. Cambia qué se marca como regionalismo y cómo escribe la IA: con «Español de España» no se marcan «vosotros», «-áis/-éis», «vale» ni «coger»; con «Español latinoamericano» no se marcan «ahorita» ni «platicar». «Español neutro» marca todo lo que no se entiende igual en ambos lados.",
    ask: "Escribe con tus palabras lo que quieres mejorar, por ejemplo «hazlo más cálido» o «dame un ejemplo de la vida diaria». Elige un párrafo o todo el guion. Claude responde y, si propone texto nuevo, ves cómo quedaría antes de tocar «Aplicar». Cada pregunta tiene un pequeño costo, que aparece abajo al terminar.",
    bigIdea: "La idea que quieres que la gente se lleve, en una frase y con tus palabras (la «gran idea» del sermón). La app comprueba que se oiga en el primer minuto y otra vez al cierre; no la juzga ni la cambia.",
    sMessage: "Revisa cómo llega tu mensaje a alguien que te ve solo en YouTube, sin cambiarlo: que la idea central se oiga al principio y al final, que no haya frases de culto en vivo, que los términos técnicos se expliquen, que los pasajes salgan en pantalla y que el cierre resuma.",
    translate: "Pasa el guion completo, con su título, miniatura, descripción e idea central, a otra variante del español (neutro, latinoamericano o de España) o al inglés de EE. UU., y viceversa. El mensaje no cambia. En «Citas en» eliges la versión de la Biblia del resultado (RVR1960, NVI, LBLA, KJV, NKJV, NASB…). Si mantienes la misma versión entre variantes del español, las citas se copian igual; si cambias de versión o de idioma, la IA las reescribe en la versión elegida y te lista cada una para que la compruebes. También sirve para pasar solo las citas a otra versión. Puedes volver al original.",
    script: "Escribe aquí el guion o pégalo desde Word o Google Docs; el formato se conserva. La barra tiene negrita, cursiva, subrayado, resaltado, títulos de sección, listas y [T] para dejar al editor un texto en pantalla. Atajos: Ctrl+B, Ctrl+I, Ctrl+U; escribe «- » para una lista o «## » para un título. Se guarda solo mientras escribes, y el formato también aparece en el teleprompter. Las señales entre corchetes ([B-ROLL: …], [TEXTO: …], [PAUSA]) no cuentan como palabras dichas.",
    series: "Todos tus episodios, ordenados por el día en que salen. Toca uno para abrirlo y seguir trabajando. «Cambiar fecha» mueve su día de publicación, y «+ Planear otro episodio» apunta un tema futuro aunque todavía no tenga guion. Los ya grabados se guardan abajo.",
    epStrip: "El episodio en el que estás trabajando y el día que sale. Toca «Mis episodios» para abrir otro o planear los siguientes.",
    nextPlan: "Justo después de grabar es el mejor momento para apuntar el siguiente tema. Usa el que anuncias al final del guion; puedes cambiar el tema y el día.",
    backup: "Todo se guarda solo dentro de la app. Esta copia es un archivo extra por si algo se pierde: descárgala de vez en cuando. «Restaurar» vuelve a cargar un archivo de copia.",
    topfix: "Los cambios que más mejorarían el episodio, del más importante al menos. Cada tarjeta muestra la frase del guion que causa el aviso y una propuesta: «Aplicar» cambia el guion, «Deshacer» lo regresa y «Ahora no» oculta la tarjeta.",
    more: "La revisión completa, por si quieres más detalle. No hace falta abrir nada de esto para poder grabar.",
    mScripture: "Cada cita bíblica que encontró la app, con enlace para leerla en tu versión. El botón de IA separa los datos comprobables (fechas, nombres, cifras) para que los confirmes.",
    mAds: "La tabla de las categorías que YouTube revisa para decidir si un video lleva anuncios. Si alguna sale en amarillo o rojo, dice qué palabras la causan.",
    mMs: "Tu guion con colores: cada color es un tipo de aviso (ver la leyenda). Toca una palabra marcada para leer la nota.",
    mSeo: "Qué tan fácil es que alguien encuentre el video al buscar en YouTube. Se mide con el tema: si aparece en el título, al inicio y a lo largo del episodio.",
    mRepeat: "Las palabras y frases que más dices. Si una describe mejor el tema que el que pusiste, tócala y la app revisa con esa.",
    mWeak: "Palabras vagas como «cosa», «algo» o «muy», con una opción más precisa. Al oído, lo preciso se entiende y se recuerda mejor.",
    mRewrite: "La IA lee todo el guion y propone correcciones puntuales de gramática, ortografía, puntuación y muletillas. Aceptas o rechazas cada una; tu guion no cambia hasta que aceptes. Los versículos entre comillas y las referencias no se tocan.",
    topic: "Tema = la frase corta que alguien escribiría en YouTube para encontrar este episodio, por ejemplo «qué dice la Biblia sobre el perdón». Toda la revisión de búsqueda se basa en ella.",
    next: "Lo que verán el episodio siguiente. La app lo usa para proponer el cierre («La próxima semana veremos…») y lo anota en el calendario.",
    date: "El día que se publica el video. Así aparece en el calendario de la serie.",
    cold: "Apertura en frío: el video empieza con una frase fuerte del propio episodio, antes del saludo. La app sugiere varias; elige una para el gancho y otra para la promesa, y edítalas si quieres.",
    coChosen: "Lo que verá la gente en los primeros segundos. Se graba una sola vez, en su lugar dentro del guion, y el editor copia ese fragmento al inicio del video. «Duplicar» deja la frase también en su lugar; «Mover» la quita de ahí.",
    hook: "Gancho: una frase corta (unas 18 palabras o menos) que despierta curiosidad o tensión en los primeros 7 segundos, para que nadie se vaya. Una oración de apertura no cuenta como gancho. Es un consejo (·): no baja la nota.",
    promise: "Promesa: dice qué se va a llevar quien vea el episodio completo. Responde «¿por qué me quedo?». Puede ser explícita («hoy veremos») o implícita; en un episodio de serie se permiten 45 segundos.",
    pack: "Empaque es lo que la gente ve antes de hacer clic: el título, el texto de la miniatura y la descripción.",
    title: "El nombre del video. Funciona mejor si tiene 60 letras o menos, incluye el tema y suena a lo que alguien busca, por ejemplo «¿Qué dice la Biblia sobre…?».",
    thumb: "Las 1 a 4 palabras grandes (24 caracteres como máximo) sobre la imagen de la miniatura. No repitas el título: compleméntalo.",
    desc: "El texto debajo del video. La primera línea debe nombrar el tema; abajo van los capítulos.",
    pkReq: "Revisiones que deben pasar para aprobar el guion: que haya título y texto de miniatura, que el título no sea demasiado largo y que ninguno tenga palabras que limiten anuncios.",
    pkRec: "Mejoras que ayudan a que te encuentren, pero no impiden aprobar.",
    chapters: "Copia este texto al final de la descripción en YouTube. Crea los capítulos del video para que la gente salte al punto que busca.",
    shorts: "Los Shorts son videos verticales de hasta 3 minutos que llevan gente al episodio completo. Marca los pasajes que te gusten y saldrán en la hoja del editor con su minuto de inicio y fin.",
    results: "Muestra en qué parte del guion se fue la gente, sección por sección. Sirve para mejorar el próximo episodio, no para calificar este.",
    rsDur: "Cuánto dura el video ya editado, en minutos y segundos (por ejemplo 18:40). Así los tiempos del guion se ajustan al video real.",
    rsData: "Los datos de retención de YouTube Studio: qué porcentaje de gente sigue viendo en cada momento. Pégalos aquí o sube el archivo CSV que descargas de YouTube Studio.",
    extra: "Datos opcionales que hacen la revisión más precisa: título, palabra clave, miniatura, descripción, versión de la Biblia y serie.",
    translation: "La versión de la Biblia que lees en el episodio. Los enlaces de cada cita abren el pasaje en esta versión, y cuando la IA traduce el guion, sugiere un cambio o añade un versículo, lo escribe en esta versión. Si no está segura del texto exacto, deja solo la referencia para que tú copies el versículo.",
    seriesName: "Nombre de la serie o número del episodio, por ejemplo «Ep. 3 · Salmos». Sirve para encontrar las versiones guardadas.",
    lang: "Idioma en que está escrito el guion. «Detectar» lo reconoce solo; cámbialo solo si la app se equivoca.",
    verdictCard: "Resumen de la revisión. El círculo y el número dicen cuántas revisiones pasan de todas las que hace la app: estructura, citas, español hablado, autenticidad, búsqueda y anuncios. La etiqueta de color habla solo de los anuncios: «Probable verde» = el video puede llevar anuncios normales; «Riesgo de anuncios limitados» (amarillo) = algo podría reducirlos; «Riesgo alto» (rojo) = hay palabras, sobre todo en el título o la miniatura, que pueden quitarlos. Por eso puedes tener muchas revisiones aprobadas y aun así estar en rojo.",
    statRuntime: "Cuánto durará el episodio leído a un ritmo de enseñanza, con pausas. Se calcula contando sílabas, no palabras. El punto es tu guion y la franja es la meta: entre 6 y 45 minutos. Menos de 6 minutos suele quedar corto para enseñar un pasaje. Cuando hay tres episodios grabados con su duración real, el cálculo se ajusta al ritmo de Juan.",
    statRead: "Qué tan fácil es seguir el guion al oírlo. En español se mide con la escala INFLESZ (0 a 100): más alto = más fácil. Depende sobre todo de lo largas que sean las frases y las palabras. La franja es la meta: 65 o más («Bastante fácil» o «Muy fácil»). Si el punto está a la izquierda, acorta frases. En inglés se mide con Flesch-Kincaid como nivel escolar, y la meta es 9 o menos.",
    statFill: "Cuántas muletillas hay por cada 100 palabras: «o sea», «bueno,», «¿verdad?», «básicamente», «la verdad es que»… Al oído cansan y restan autoridad. La franja es la meta: 1,5 o menos. Toca «Guion marcado» para ver cada una resaltada.",
    timeline: "Cómo se reparte el tiempo del episodio: apertura, enseñanza, invitaciones y cierre. Las zonas sombreadas son los primeros 7, 20 y 30 segundos, donde más gente se va.",
    sMoney: "Busca palabras que hacen que YouTube limite o quite los anuncios (violencia, drogas, groserías…). Pesan más en el título, la miniatura y los primeros segundos.",
    sStructure: "Revisa el arranque y el orden del episodio: gancho, promesa, cuándo empieza la enseñanza, invitaciones a suscribirse o comentar, y el cierre.",
    sScripture: "Encuentra cada cita bíblica y revisa que se diga completa: libro, capítulo y versículo.",
    sFacts: "La IA separa los datos comprobables (fechas, nombres, cifras) para que los confirmes antes de grabar. No califica la doctrina.",
    sSpoken: "Revisa que el guion suene bien dicho en voz alta: frases que caben en un respiro, sin muletillas, palabras precisas, un español que se entiende en todos los países y una duración razonable.",
    sAuth: "Detecta frases que suenan a plantilla o a texto escrito por IA. YouTube no paga anuncios en contenido repetitivo o «no auténtico».",
    sSeo: "Qué tan fácil es que alguien encuentre el video al buscar en YouTube, según cómo usas el tema en el título y en el guion.",
    sMs: "Tu guion con colores: cada color es un tipo de aviso (ver la leyenda). Toca una palabra marcada para leer la nota.",
    sAi: "Herramientas que piden ayuda a la IA. Cada propuesta se revisa con las mismas reglas antes de mostrarse y nada se aplica sin tu aprobación.",
    aiRewrite: "La IA propone correcciones puntuales de gramática, ortografía y muletillas. Tú aceptas o rechazas cada una. No toca versículos ni el argumento.",
    aiHooks: "La IA propone tres formas distintas de abrir el episodio. Elige una o úsalas como idea.",
    aiTitles: "La IA propone títulos, textos de miniatura y una descripción, ya revisados para que no limiten anuncios.",
    save: "«Guardar esta versión» guarda el guion en el historial. «Teleprompter» descarga el texto limpio para otro programa de prompter. «Revisión» descarga este informe como archivo.",
    history: "Las versiones guardadas de cada guion y cómo le fue a cada episodio. Con tres episodios anotados, la duración estimada se ajusta al ritmo real de Juan.",
    prod: "La etapa del episodio: borrador, en revisión, aprobado y grabado. Para aprobar, el título y la miniatura deben pasar lo obligatorio. Todo se guarda solo; «Mis episodios» abre los demás.",
    esc: "Las secciones del guion (gancho, promesa, puntos, cierre) con su minuto de inicio y su duración. De aquí salen los capítulos de YouTube. Toca una sección para ver su texto, cambiar su tipo, mover dónde empieza o dejar notas para el equipo; en pantallas anchas también te lleva a ella en el guion.",
    target: "Cuánto quieres que dure el episodio, en minutos (por ejemplo 20). La escaleta te avisa si te pasas o te falta.",
    secs: "El guion dividido en secciones, como lo verá el presentador. Toca una frase para empezar ahí una sección, editarla o usarla en la apertura. Cada sección tiene notas para el equipo.",
    rev: "Historial de versiones del guion. Cada cambio de estado guarda una copia; también puedes guardar una con nombre y comparar dos para ver qué cambió.",
  },
  en: {
    expert: "Off: the app walks you step by step and shows only what matters. On: every check and tool on one screen.",
    step1: "First step: paste the script exactly as you'll read it. The app only suggests; nothing in your text changes until you tap “Apply”.",
    step2: "The app checks the script against YouTube's ad rules and good practice for teaching out loud. Here you see only the most important items, with the change already written.",
    step3: "Pick the title, the thumbnail and how the video opens. Once the required checks pass, approve the script. “Open prompter” shows the script in large type and scrolls it for you. “Rehearse with timer” measures each section. “Editor sheet” downloads the sections, timings and clips. In the prompter: ▶ starts or pauses, − and + change the speed, A− and A+ the text size. After recording: pick clips for Shorts and, a few days later, bring in the retention data from YouTube Studio.",
    examples: "Three practice scripts: a weak one, an average one and a very good one. Open them to see what the app flags and how it proposes fixes. Nothing is saved while you practice; tap “Leave the example” to return to your work.",
    audience: "The Spanish variant you speak to the channel in; only matters for Spanish scripts. It changes what counts as regional and how the AI writes: with “Spain Spanish”, vosotros, -áis/-éis, vale and coger aren't flagged; with “Latin American Spanish”, ahorita and platicar aren't. “Neutral Spanish” flags anything not understood the same on both sides.",
    ask: "Type what you want to improve in your own words, e.g. “make it warmer” or “give me an everyday example”. Pick one paragraph or the whole script. Claude answers and, if it proposes new text, you see how it would read before tapping “Apply”. Each question has a small cost, shown at the bottom when it finishes.",
    bigIdea: "The idea you want people to take away, in one sentence and your own words (the sermon's big idea). The app checks it's heard in the first minute and again at the close; it doesn't judge or change it.",
    sMessage: "Checks how your message reaches someone watching alone on YouTube, without changing it: the central idea is heard at the start and end, no live-service phrases, technical terms explained, passages shown on screen, and a closing summary.",
    translate: "Moves the whole script, with its title, thumbnail, description and central idea, to another Spanish variant (neutral, Latin American or Spain) or to US English, and back. The message doesn't change. In “Quotes in” you pick the Bible version of the result (RVR1960, NVI, LBLA, KJV, NKJV, NASB…). Keeping the same version between Spanish variants copies quotes as is; changing version or language makes the AI rewrite them in the chosen version and list each one for you to check. It also works to move only the quotes to another version. You can go back to the original.",
    script: "Write the script here or paste it from Word or Google Docs; formatting is kept. The bar has bold, italics, underline, highlight, section titles, lists and [T] to leave on-screen text for the editor. Shortcuts: Ctrl+B, Ctrl+I, Ctrl+U; type “- ” for a list or “## ” for a title. It saves itself as you write, and the formatting also shows in the teleprompter. Bracket cues ([B-ROLL: …], [TEXTO: …], [PAUSA]) don't count as spoken words.",
    series: "All your episodes, ordered by the day they go out. Tap one to open it and keep working. “Change date” moves its publish day, and “+ Plan another episode” notes a future topic even before it has a script. Recorded ones are kept below.",
    epStrip: "The episode you are working on and the day it goes out. Tap “My episodes” to open another or plan the next ones.",
    nextPlan: "Right after recording is the best moment to note the next topic. It uses the one you announce at the end of the script; you can change the topic and the day.",
    backup: "Everything saves automatically inside the app. This copy is an extra file in case something gets lost: download it now and then. “Restore” loads a backup file back in.",
    topfix: "The changes that would improve the episode most, most important first. Each card shows the script sentence that causes the warning and a proposal: “Apply” changes the script, “Undo” reverts it, “Not now” hides the card.",
    more: "The full review, if you want more detail. You don't need to open any of this to record.",
    mScripture: "Every Bible reference the app found, with a link to read it in your translation. The AI button pulls out checkable facts (dates, names, numbers) for you to confirm.",
    mAds: "The table of categories YouTube checks to decide whether a video gets ads. If one shows yellow or red, it says which words cause it.",
    mMs: "Your script in color: each color is a kind of warning (see the legend). Tap a marked word to read the note.",
    mSeo: "How easily someone finds the video when searching YouTube. It's measured with the topic: whether it appears in the title, early on and throughout the episode.",
    mRepeat: "The words and phrases you say most. If one describes the topic better than the one you set, tap it and the app checks with that one.",
    mWeak: "Vague words like “thing”, “something” or “very”, with a more precise option. By ear, precise words are easier to follow and remember.",
    mRewrite: "The AI reads the whole script and suggests specific fixes for grammar, spelling, punctuation and fillers. You accept or reject each one; your script doesn't change until you accept. Verses in quotation marks and references are never touched.",
    topic: "Topic = the short phrase someone would type into YouTube to find this episode, e.g. “what the Bible says about forgiveness”. The whole search review is based on it.",
    next: "What the following episode covers. The app uses it to propose the closing line (“Next week we'll look at…”) and adds it to the calendar.",
    date: "The day the video goes live. That's how it shows up on the series calendar.",
    cold: "Cold open: the video starts with a strong line from the episode itself, before the greeting. The app suggests several; pick one for the hook and one for the promise, and edit them if you like.",
    coChosen: "What people see in the first seconds. It's recorded once, in its place in the script, and the editor copies that clip to the start of the video. \"Duplicate\" keeps the line in its place too; \"Move\" takes it out of there.",
    hook: "Hook: a short line (about 18 words or fewer) that sparks curiosity or tension in the first 7 seconds so nobody leaves. An opening prayer doesn't count as the hook. It is advice (·): it does not lower the score.",
    promise: "Promise: says what viewers will take away if they watch to the end. It answers “why should I stay?”. It can be explicit (“today we'll see”) or implied; a series episode gets 45 seconds.",
    pack: "Packaging is what people see before they click: the title, the thumbnail text and the description.",
    title: "The video's name. Works best at 60 characters or fewer, includes the topic and sounds like a search, e.g. “What does the Bible say about…?”.",
    thumb: "The 1 to 4 big words (24 characters at most) on the thumbnail image. Don't repeat the title: add to it.",
    desc: "The text under the video. The first line should name the topic; chapters go below.",
    pkReq: "Checks that must pass to approve the script: there's a title and thumbnail text, the title isn't too long, and neither has words that limit ads.",
    pkRec: "Improvements that help people find you, but don't block approval.",
    chapters: "Copy this text to the end of the YouTube description. It creates the video's chapters so people can jump to the point they want.",
    shorts: "Shorts are vertical videos up to 3 minutes long that bring people to the full episode. Mark the passages you like and they'll appear on the editor sheet with start and end times.",
    results: "Shows where in the script people left, section by section. It's for improving the next episode, not grading this one.",
    rsDur: "How long the edited video is, in minutes and seconds (e.g. 18:40). The script timings then match the real video.",
    rsData: "Retention data from YouTube Studio: what share of people are still watching at each moment. Paste it here or upload the CSV you download from YouTube Studio.",
    extra: "Optional details that make the review more accurate: title, keyword, thumbnail, description, Bible translation and series.",
    translation: "The Bible translation read in the episode. Each reference's link opens the passage in this translation, and when the AI translates the script, suggests a change or adds a verse, it writes it in this translation. If it isn't sure of the exact wording, it leaves only the reference for you to copy the verse.",
    seriesName: "Series name or episode number, e.g. “Ep. 3 · Psalms”. Helps you find saved versions.",
    lang: "The language the script is written in. “Detect” figures it out; change it only if the app gets it wrong.",
    verdictCard: "Review summary. The ring and number show how many of the app's checks pass: structure, references, spoken delivery, authenticity, search and ads. The colored label is only about ads: “Likely green” = the video can carry normal ads; “Limited-ads risk” (yellow) = something could reduce them; “High risk” (red) = there are words, mainly in the title or thumbnail, that can remove them. That's why many checks can pass and the label can still be red.",
    statRuntime: "How long the episode will run when read at a teaching pace, with pauses. It's estimated from syllables, not words. The dot is your script and the band is the target: 6 to 45 minutes. Under 6 minutes is usually too short to teach a passage. After three recorded episodes with their real length, the estimate adjusts to Juan's pace.",
    statRead: "How easy the script is to follow by ear. Spanish uses the INFLESZ scale (0 to 100): higher = easier. It depends mostly on sentence and word length. The band is the target: 65 or more (“Fairly easy” or “Very easy”). If the dot sits left, shorten sentences. English uses Flesch-Kincaid as a school grade, with a target of 9 or below.",
    statFill: "How many filler words per 100 words: “um”, “you know”, “I mean”, “kind of”… in Spanish «o sea», «bueno,», «¿verdad?». By ear they tire listeners and cost authority. The band is the target: 1.5 or fewer. Open the marked script to see each one highlighted.",
    timeline: "How the episode's time is split: opening, teaching, calls to action and close. The shaded zones are the first 7, 20 and 30 seconds, where most people leave.",
    sMoney: "Looks for words that make YouTube limit or remove ads (violence, drugs, profanity…). They weigh more in the title, thumbnail and first seconds.",
    sStructure: "Checks the opening and order: hook, promise, when the teaching starts, calls to subscribe or comment, and the close.",
    sScripture: "Finds every Bible reference and checks it's said in full: book, chapter and verse.",
    sFacts: "The AI pulls out checkable facts (dates, names, numbers) for you to confirm before recording. It doesn't grade doctrine.",
    sSpoken: "Checks the script sounds right out loud: sentences that fit in one breath, no filler words, precise wording, Spanish understood in every country, and a reasonable length.",
    sAuth: "Spots lines that sound templated or AI-written. YouTube doesn't pay ads on repetitive or “inauthentic” content.",
    sSeo: "How easily someone finds the video when searching YouTube, based on how you use the topic in the title and script.",
    sMs: "Your script in color: each color is a kind of warning (see the legend). Tap a marked word to read the note.",
    sAi: "Tools that ask the AI for help. Every proposal is checked with the same rules before it's shown, and nothing is applied without your approval.",
    aiRewrite: "The AI suggests specific fixes for grammar, spelling and fillers. You accept or reject each one. It never touches verses or the argument.",
    aiHooks: "The AI proposes three different ways to open the episode. Pick one or use them as ideas.",
    aiTitles: "The AI proposes titles, thumbnail texts and a description, already checked so they don't limit ads.",
    save: "“Save this version” stores the script in the history. “Teleprompter” downloads clean text for another prompter app. “Review” downloads this report as a file.",
    history: "Saved versions of each script and how each episode did. After three logged episodes, the estimated length adjusts to Juan's real pace.",
    prod: "The episode's stage: draft, in review, approved and recorded. To approve, the title and thumbnail must pass the required checks. Everything saves itself; \"My episodes\" opens the others.",
    esc: "The script's sections (hook, promise, points, close) with their start time and length. The YouTube chapters come from here. Tap a section to see its text, change its type, move where it starts or leave notes for the team; on wide screens it also takes you to it in the script.",
    target: "How long you want the episode to be, in minutes (e.g. 20). The run sheet tells you if you're over or under.",
    secs: "The script split into sections, as the presenter will see it. Tap a sentence to start a section there, edit it or use it in the opening. Each section has notes for the team.",
    rev: "Version history of the script. Each status change saves a copy; you can also save one with a name and compare two to see what changed.",
  },
};
// [key, selector of the element that gets the «?», where the explanation goes]
// where: "row" = after the heading's row (header / label / the given closest() selector), "sum" = inside the <summary>, "end:<sel>" = appended to that container
const HELP_ANCHORS = [
  // «Modo completo» moved into the ⋯ menu (guide_ui.js), which carries its own one-line explanation instead of a «?»
  ["step", "#guideTop .g-step-h h2", "row"],
  ["script", 'label[for="script"]', "row"],
  ["ask", "#askClaude .g-h h2", "row"],
  ["audience", 'label[for="audience"]', "row"],
  ["translate", 'label[for="trTarget"]', "row:.tr-box"],
  ["series", "#epList .g-h h2, #gSeriesFull .g-h h2", "row"],
  ["backup", "#epBackup .g-h h2, #gBackupFull .g-h h2", "row"],
  ["epStrip", "#epStrip .ep-s-t small", "row:.ep-strip"],
  ["nextPlan", "#gNextPlan .g-h h2", "row"],
  ["topfix", ".fx-head h3", "row"],
  ["more", ".g-more-sec > h3", "row"],
  ["mScripture", '.g-more-d[data-more="scripture"] > summary', "sum"],
  ["mAds", '.g-more-d[data-more="ads"] > summary', "sum"],
  ["mSeo", '.g-more-d[data-more="seo"] > summary', "sum"],
  ["mRewrite", '.g-more-d[data-more="rewrite"] > summary', "sum"],
  ["mRepeat", ".seo-block:has(.seo-chips) > h4.pk-h", "row"],
  ["mWeak", ".seo-block:not(:has(.seo-chips)) > h4.pk-h", "row"],
  ["topic", 'label[for="tpTopic"]', "row"],
  ["next", 'label[for="tpNext"]', "row"],
  ["date", 'label[for="tpDate"]', "row"],
  ["cold", "#gCold .g-h h2", "row"],
  ["coChosen", "#gCold .co-box > h3", "row"],
  ["pack", "#gPack .g-h h2", "row"],
  ["title", 'label[for="pkTitleIn"], label[for="title"]', "row"],
  ["thumb", 'label[for="pkThumbIn"], label[for="thumb"]', "row"],
  ["desc", 'label[for="pkDescIn"], label[for="description"]', "row"],
  ["pkReq", "#pkChecks .pk-checks > div:first-child > h4.pk-h", "row"],
  ["pkRec", "#pkChecks .pk-checks > div:nth-child(2) > h4.pk-h", "row"],
  ["chapters", "#pkChapters > h3", "row"],
  ["shorts", "#gShorts .g-h h2", "row"],
  ["results", "#gRes .g-h h2", "row"],
  ["rsDur", 'label[for="rsDur"]', "row"],
  ["rsData", 'label[for="rsData"]', "row"],
  ["extra", "#extraFields > summary", "sum"],
  ["topic", 'label[for="keyword"]', "row"],
  ["translation", 'label[for="translation"]', "row"],
  ["seriesName", 'label[for="series"]', "row"],
  ["lang", 'label[for="lang"]', "row"],
  ["verdictCard", "#results .verdict .vhead .big", "row:.vhead"],
  ["statRuntime", "#results .stats > .stat:nth-child(1) > .l", "row"],
  ["statRead", "#results .stats > .stat:nth-child(2) > .l", "row"],
  ["statFill", "#results .stats > .stat:nth-child(3) > .l", "row"],
  ["timeline", "#results .timeline h3", "row"],
  ["sMoney", "#sec-money > summary", "sum"],
  ["sMessage", "#sec-message > summary", "sum"],
  ["bigIdea", 'label[for="bigIdea"]', "row"],
  ["sStructure", "#sec-structure > summary", "sum"],
  ["sScripture", "#sec-scripture > summary", "sum"],
  ["sFacts", "#sec-facts > summary", "sum"],
  ["sSpoken", "#sec-spoken > summary", "sum"],
  ["sAuth", "#sec-auth > summary", "sum"],
  ["sSeo", "#sec-seo > summary", "sum"],
  ["sMs", "#sec-manuscript > summary", "sum"],
  ["sAi", "#sec-ai > header h2", "row"],
  ["aiRewrite", '#sec-ai .helper:has([data-ai="rewrite"]) > h3', "row"],
  ["aiHooks", '#sec-ai .helper:has([data-ai="hooks"]) > h3', "row"],
  ["aiTitles", '#sec-ai .helper:has([data-ai="titles"]) > h3', "row"],
  ["save", "#sec-save > header h2", "row"],
  ["history", "#historyBlock > header h2", "row"],
  ["prod", ".st-strip .st-lbl", "row:.st-strip"],
  ["esc", "#gStruct .g-h h2", "row"],
  ["target", 'label[for="gTarget"]', "row:.g-target"],
  ["rev", "#gRev .g-h h2", "row"],
];
const HELP_OPEN = new Set();
function helpText(key) { return (HELP[UI] && HELP[UI][key]) || HELP.es[key] || ""; }
function helpKey(key) { return key === "step" ? "step" + V.step : key; }
function helpRow(a, where) {
  if (where.startsWith("row:")) return a.closest(where.slice(4)) || a;
  const hd = a.closest("header, .fx-head, .g-step-h");
  if (hd && hd.contains(a) && hd !== document.querySelector(".masthead")) return hd;
  if (a.tagName === "LABEL" && a.parentElement && !a.parentElement.classList.contains("field")) return a.parentElement;
  return a;
}
function injectHelp() {
  for (const [k0, sel, where] of HELP_ANCHORS) {
    let els; try { els = document.querySelectorAll(sel); } catch (e) { continue; }
    els.forEach((a) => {
      if (a.dataset.qh || a.closest(".pp")) return;
      const key = helpKey(k0), txt = helpText(key);
      if (!txt) return;
      a.dataset.qh = key;
      const id = "qh-" + Math.random().toString(36).slice(2, 9);
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "qh-btn"; btn.textContent = "?";
      btn.setAttribute("aria-label", t("qhBtn")); btn.title = t("qhBtn");
      btn.setAttribute("aria-controls", id);
      const box = document.createElement("div");
      box.className = "qh-txt"; box.id = id; box.textContent = txt;
      const open = HELP_OPEN.has(key);
      box.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      // where the «?» sits: in a summary, next to its heading text
      const host = where === "sum" ? (a.querySelector("h2, h3, .mt") || a) : a;
      host.appendChild(btn);
      if (where === "sum") { a.appendChild(box); box.addEventListener("click", (e) => e.preventDefault()); }
      else if (where.startsWith("end:")) { const c = a.closest(where.slice(4)) || a.parentElement; c.appendChild(box); }
      else helpRow(a, where).insertAdjacentElement("afterend", box);
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const now = box.hidden; box.hidden = !now; btn.setAttribute("aria-expanded", String(now));
        if (now) HELP_OPEN.add(key); else HELP_OPEN.delete(key);
      });
    });
  }
}
function resetHelp() {
  document.querySelectorAll(".qh-btn, .qh-txt").forEach((x) => x.remove());
  document.querySelectorAll("[data-qh]").forEach((x) => delete x.dataset.qh);
  injectHelp();
}
let helpQueued = false;
new MutationObserver(() => { if (helpQueued) return; helpQueued = true; requestAnimationFrame(() => { helpQueued = false; injectHelp(); }); })
  .observe(document.body, { childList: true, subtree: true });
const _gOnLangHelp = gOnLang;
gOnLang = function () { _gOnLangHelp(); resetHelp(); };
injectHelp();
