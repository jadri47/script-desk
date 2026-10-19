(() => {
  const store = {}; window.__store = store; window.__dl = [];
  const col = (name) => (store[name] = store[name] || {});
  let n = 0;
  const snap = (id, d) => ({ id, exists: !!d, data: () => (d ? JSON.parse(JSON.stringify(d)) : undefined) });
  const docRef = (c, id) => ({ id, get: async () => snap(id, col(c)[id]), set: async (d) => { col(c)[id] = JSON.parse(JSON.stringify(d)); }, update: async (d) => { col(c)[id] = { ...(col(c)[id] || {}), ...JSON.parse(JSON.stringify(d)) }; }, delete: async () => { delete col(c)[id]; } });
  const query = (c, filters = [], ord = null, lim = 1000) => ({
    where: (f, op, v) => query(c, [...filters, [f, v]], ord, lim), orderBy: (f, dir) => query(c, filters, [f, dir], lim), limit: (k) => query(c, filters, ord, k),
    get: async () => { let docs = Object.entries(col(c)).filter(([, d]) => filters.every(([f, v]) => d[f] === v)); if (ord) docs.sort((a, b) => (ord[1] === "desc" ? -1 : 1) * ((a[1][ord[0]] || 0) > (b[1][ord[0]] || 0) ? 1 : -1)); docs = docs.slice(0, lim); return { docs: docs.map(([id, d]) => snap(id, d)), size: docs.length, empty: !docs.length }; },
  });
  const db = { collection: (c) => ({ ...query(c), doc: (id) => docRef(c, id || "d" + ++n), add: async (d) => { const id = "d" + ++n; col(c)[id] = JSON.parse(JSON.stringify(d)); return docRef(c, id); } }), doc: (path) => { const [c, id] = path.split("/"); return docRef(c, id); } };
  const downloads = { save: async (x) => { window.__dl.push(x); } };
  window.claude = { use: async (name) => (name === "db" ? db : name === "downloads" ? downloads : null) };
})();
