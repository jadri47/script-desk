// Search in the script (find_logic.js; Adrian, 2026-11-03, A): accents and capitals ignored, positions in the original text.
const L = require("../build/logic.js");
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log("FAIL", name, extra || ""); } else console.log("ok  ", name); };
const at = (t, ms) => ms.map((m) => t.slice(m.start, m.end));

const T = "Dios es fiel. El Señor no cambia; dios no miente.\n\nCuando llegue tu Goliat, recuerda: GOLIAT cayó.";
ok("capitals ignored: «dios» finds «Dios» and «dios»", JSON.stringify(at(T, L.findAll(T, "dios"))) === '["Dios","dios"]', at(T, L.findAll(T, "dios")));
ok("accents ignored both ways: «senor» and «señór» find «Señor»", at(T, L.findAll(T, "senor"))[0] === "Señor" && at(T, L.findAll(T, "señór"))[0] === "Señor");
ok("positions are the original's after an accented letter", at(T, L.findAll(T, "goliat")).join("|") === "Goliat|GOLIAT" && at(T, L.findAll(T, "cayo"))[0] === "cayó");
ok("a blank or empty query finds nothing", L.findAll(T, "").length === 0 && L.findAll(T, "   ").length === 0 && L.findAll("", "x").length === 0);
ok("regex characters are plain text", L.findAll("a.b axb (c) [d]", "a.b").length === 1 && L.findAll("a.b axb (c) [d]", "(c)").length === 1 && L.findAll("a.b", ".*").length === 0);
ok("a phrase is found across a line break", at(T, L.findAll(T, "miente. cuando"))[0] === "miente.\n\nCuando" &&at("tu\n\nGoliat", L.findAll("tu\n\nGoliat", "tu goliat"))[0] === "tu\n\nGoliat");
ok("matches don't overlap", L.findAll("aaaa", "aa").length === 2);
const E = "Hola 🙏 amigo, ámigo";
ok("an emoji before a match keeps the positions", at(E, L.findAll(E, "amigo")).join("|") === "amigo|ámigo", at(E, L.findAll(E, "amigo")));
const ms = L.findAll(T, "dios");
ok("nearest: the first match at or after the caret, wrapping to the first", L.findNearest(ms, 0) === 0 && L.findNearest(ms, 5) === 1 && L.findNearest(ms, 999) === 0 && L.findNearest([], 3) === -1);

console.log(fails ? `\n${fails} FAILED` : "\nall ok");
process.exit(fails ? 1 : 0);
