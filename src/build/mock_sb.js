// Fake supabase-js UMD for tests: window.__SB_MODE = "out" | "member" | "stranger"
(function () {
  const rows = (window.__rows = window.__rows || {});
  const key = (c, id) => c + "/" + id;
  function builder() {
    const st = { filters: [], lim: 1000, single: false, op: "select", payload: null };
    const b = {
      select() { return b; }, eq(k, v) { st.filters.push([k, v]); return b; }, limit(n) { st.lim = n; return b; },
      maybeSingle() { st.single = true; return b; },
      upsert(p) { st.op = "upsert"; st.payload = p; return b; }, delete() { st.op = "delete"; return b; },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    function match(r) { return st.filters.every(([k, v]) => { if (k.startsWith("data->>")) return String(r.data[k.slice(7)]) === v; return r[k] === v; }); }
    function run() {
      if (window.__SB_MODE !== "member") return { data: null, error: { message: "permission denied" } };
      if (st.op === "upsert") { rows[key(st.payload.collection, st.payload.id)] = JSON.parse(JSON.stringify(st.payload)); return { data: null, error: null }; }
      const all = Object.values(rows).filter(match);
      if (st.op === "delete") { all.forEach((r) => delete rows[key(r.collection, r.id)]); return { data: null, error: null }; }
      if (st.single) return { data: all[0] ? { data: all[0].data } : null, error: null };
      return { data: all.slice(0, st.lim).map((r) => ({ id: r.id, data: r.data })), error: null };
    }
    return b;
  }
  window.supabase = {
    createClient() {
      const mode = () => window.__SB_MODE || "out";
      const session = () => (mode() === "out" ? null : { access_token: "tok", user: { email: mode() === "member" ? "juan@example.com" : "otro@example.com" } });
      return {
        auth: { getSession: async () => ({ data: { session: session() } }), signInWithOAuth: async (o) => { window.__oauth = o; }, signOut: async () => { window.__SB_MODE = "out"; } },
        rpc: async (fn, args) => {
          if (fn === "sd_is_member") return { data: mode() === "member", error: null };
          if (fn === "sd_month_cost") return { data: mode() === "member" ? 0.3123 : null, error: null };
          if (fn === "sd_merge") { const k = key(args.p_collection, args.p_id); rows[k] = rows[k] || { collection: args.p_collection, id: args.p_id, data: {} }; Object.assign(rows[k].data, args.p_patch); return { data: null, error: null }; }
        },
        from() { return builder(); },
      };
    },
  };
})();
