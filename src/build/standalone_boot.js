/* ===== Script Desk standalone: Supabase stands in for the Claude runtime (db, AI, downloads) ===== */
(function () {
  const SB_URL = "https://vuvwoxjlmoegstpalngx.supabase.co";
  const SB_KEY = "sb_publishable_3Ia-J605M0-PSHm71pXDHQ_j3dwhQ4_";
  const hasLib = !!(window.supabase && window.supabase.createClient);
  const sb = hasLib ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } }) : null;
  window.__sb = sb;

  // Who is signed in, and are they on the team list?
  window.__sdAuth = (async () => {
    if (!sb) return { offline: true, session: null, member: false };
    try {
      const { data } = await sb.auth.getSession();
      const session = data && data.session;
      if (!session) return { session: null, member: false };
      const r = await sb.rpc("sd_is_member");
      return { session, email: session.user && session.user.email, member: r.data === true, error: r.error || null };
    } catch (e) { return { session: null, member: false, error: e }; }
  })();

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 20) : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  const dbErr = (e) => { const x = new Error((e && e.message) || "db"); x.code = e && /quota|exceed|limit/i.test(e.message || "") ? "quota_exceeded" : "db_error"; return x; };
  const snap = (id, d) => ({ id, exists: !!d, data: () => (d ? clone(d) : undefined) });

  function makeDb() {
    const T = () => sb.from("sd_docs");
    const docRef = (c, id) => ({
      id,
      get: async () => { const { data, error } = await T().select("data").eq("collection", c).eq("id", id).maybeSingle(); if (error) throw dbErr(error); return snap(id, data && data.data); },
      set: async (d) => { const { error } = await T().upsert({ collection: c, id, data: clone(d), updated_at: new Date().toISOString() }); if (error) throw dbErr(error); },
      update: async (d) => { const { error } = await sb.rpc("sd_merge", { p_collection: c, p_id: id, p_patch: clone(d) }); if (error) throw dbErr(error); },
      delete: async () => { const { error } = await T().delete().eq("collection", c).eq("id", id); if (error) throw dbErr(error); },
    });
    const query = (c, f = [], ord = null, lim = 1000) => ({
      where: (k, op, v) => query(c, [...f, [k, v]], ord, lim),
      orderBy: (k, dir) => query(c, f, [k, dir], lim),
      limit: (n) => query(c, f, ord, n),
      get: async () => {
        let q = T().select("id,data").eq("collection", c);
        for (const [k, v] of f) q = q.eq("data->>" + k, String(v));
        const { data, error } = await q.limit(1000);
        if (error) throw dbErr(error);
        let docs = (data || []).map((r) => [r.id, r.data]);
        if (ord) docs.sort((a, b) => (ord[1] === "desc" ? -1 : 1) * ((a[1][ord[0]] || 0) > (b[1][ord[0]] || 0) ? 1 : -1));
        docs = docs.slice(0, lim);
        return { docs: docs.map(([id, d]) => snap(id, d)), size: docs.length, empty: !docs.length };
      },
    });
    return {
      collection: (c) => ({ ...query(c), doc: (id) => docRef(c, id || uid()), add: async (d) => { const id = uid(); await docRef(c, id).set(d); return docRef(c, id); } }),
      doc: (p) => { const [c, id] = p.split("/"); return docRef(c, id); },
    };
  }

  const sample = {
    serverRules: true,
    json: async (prompt, opts = {}) => {
      const { data } = await sb.auth.getSession();
      const session = data && data.session;
      if (!session) throw { code: "not_granted" };
      let r;
      try {
        r = await fetch(SB_URL + "/functions/v1/sd-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token, apikey: SB_KEY },
          body: JSON.stringify({ prompt, tier: opts.modelTier === "rewrite" ? "rewrite" : opts.modelTier === "complex" ? "complex" : "default", bible: opts.bible, noBible: !!opts.noBible }),
          signal: opts.signal,
        });
      } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "network" }; }
      const j = await r.json().catch(() => null);
      if (j && j.usage) { try { window.dispatchEvent(new CustomEvent("sd-ai-cost", { detail: j.usage })); } catch (e) {} }
      if (!r.ok || !j || !j.data) throw { code: (j && j.code) || "upstream" };
      return j.data;
    },
  };

  const downloads = {
    save: async ({ filename, data, mimeType }) => {
      const type = mimeType || (/\.json$/i.test(filename) ? "application/json" : /\.md$/i.test(filename) ? "text/markdown" : /\.csv$/i.test(filename) ? "text/csv" : "text/plain");
      const blob = data instanceof Blob ? data : new Blob([data], { type: type + ";charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename; a.rel = "noopener";
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    },
  };

  window.claude = {
    use: async (name) => {
      if (name === "downloads") return downloads;
      const a = await window.__sdAuth;
      if (!a.member) return null;
      if (name === "db") return makeDb();
      if (name === "sample") return sample;
      return null;
    },
  };
})();
