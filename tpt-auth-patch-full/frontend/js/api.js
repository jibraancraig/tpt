// /frontend/js/api.js
export const API_BASE = (window.API_BASE_URL) || '';

async function parseTextOrJSON(r) {
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return { message: txt || r.statusText }; }
}

export const api = {
  async get(path, params) {
    const url = new URL(path, API_BASE || location.origin);
    if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    const r = await fetch(url, { credentials:'include' });
    if (!r.ok) { const e = await parseTextOrJSON(r); throw new Error(e.message); }
    return await r.json();
  },
  async post(path, body) {
    const r = await fetch(new URL(path, API_BASE || location.origin), {
      method:'POST', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) { const e = await parseTextOrJSON(r); throw new Error(e.message); }
    return await r.json();
  }
};
