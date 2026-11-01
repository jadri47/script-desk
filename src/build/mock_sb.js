// Fake supabase-js UMD for tests: window.__SB_MODE = "out" | "member" | "stranger"
// Team review (Adrian, 2026-11-01: "B"): like the real sd_docs rules, every member reads every row and only the row's owner
// writes or deletes it. Who is signed in: window.__SB_UID / window.__SB_EMAIL (default one user, "u-juan" / juan@example.com).
// A row stored without an owner (old fixtures written straight into __rows) counts as the signed-in user's.
(function () {
  // first-use tips (tips_ui.js) would sit over the controls the suites click: off unless a suite sets sd-tips-off itself (pwchrome sets "0")
  try { if (localStorage.getItem("sd-tips-off") === null) localStorage.setItem("sd-tips-off", "1"); } catch (e) { /* best effort: no storage, no tips state to keep */ }
  const rows = (window.__rows = window.__rows || {});
  const key = (c, id) => c + "/" + id;
  const me = () => window.__SB_UID || "u-juan";
  const myEmail = () => window.__SB_EMAIL || "juan@example.com";
  const ownerOf = (r) => (r && r.owner) || me();
  const RLS = { message: "new row violates row-level security policy for table \"sd_docs\"" };
  function builder(table) {
    const st = { filters: [], lim: 1000, single: false, op: "select", payload: null };
    const b = {
      select() { return b; }, eq(k, v) { st.filters.push([k, v]); return b; }, limit(n) { st.lim = n; return b; },
      maybeSingle() { st.single = true; return b; },
      upsert(p) { st.op = "upsert"; st.payload = p; return b; }, delete() { st.op = "delete"; return b; },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    function match(r) { return st.filters.every(([k, v]) => { if (k.startsWith("data->>")) return String(r.data[k.slice(7)]) === v; return r[k] === v; }); }
    const out = (r) => ({ id: r.id, data: r.data, owner: ownerOf(r), owner_email: r.owner_email || (r.owner ? null : myEmail()) });
    function run() {
      if (window.__SB_MODE !== "member") return { data: null, error: { message: "permission denied" } };
      if (table === "sd_team") return { data: (window.__SB_TEAM || [{ email: myEmail(), name: "Juan" }]).slice(), error: null };
      if (st.op === "upsert") {
        const k = key(st.payload.collection, st.payload.id), old = rows[k];
        if (old && ownerOf(old) !== me()) return { data: null, error: RLS };
        rows[k] = Object.assign(JSON.parse(JSON.stringify(st.payload)), { owner: old ? ownerOf(old) : me(), owner_email: old ? old.owner_email || myEmail() : myEmail() });
        return { data: null, error: null };
      }
      const all = Object.values(rows).filter(match);
      // RLS on delete: another user's rows are simply not deleted (0 rows), no error, as in Postgres.
      if (st.op === "delete") { all.filter((r) => ownerOf(r) === me()).forEach((r) => delete rows[key(r.collection, r.id)]); return { data: null, error: null }; }
      if (st.single) return { data: all[0] ? out(all[0]) : null, error: null };
      return { data: all.slice(0, st.lim).map(out), error: null };
    }
    return b;
  }
  window.supabase = {
    createClient() {
      const mode = () => window.__SB_MODE || "out";
      const session = () => (mode() === "out" ? null : { access_token: "tok", user: { id: mode() === "member" ? me() : "u-other", email: mode() === "member" ? myEmail() : "otro@example.com" } });
      return {
        auth: { getSession: async () => ({ data: { session: session() } }), signInWithOAuth: async (o) => { window.__oauth = o; }, signOut: async () => { window.__SB_MODE = "out"; } },
        rpc: async (fn, args) => {
          if (fn === "sd_is_member") return { data: mode() === "member", error: null };
          if (fn === "sd_month_cost") return { data: mode() === "member" ? 0.3123 : null, error: null };
          if (fn === "sd_merge") {
            const k = key(args.p_collection, args.p_id);
            if (rows[k] && ownerOf(rows[k]) !== me()) return { data: null, error: RLS };
            rows[k] = rows[k] || { collection: args.p_collection, id: args.p_id, data: {}, owner: me(), owner_email: myEmail() };
            Object.assign(rows[k].data, args.p_patch); return { data: null, error: null };
          }
        },
        from(table) { return builder(table); },
      };
    },
  };
})();
