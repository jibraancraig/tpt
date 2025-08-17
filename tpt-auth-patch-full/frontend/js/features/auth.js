// /frontend/js/features/auth.js
import { api } from '../api.js';
const PUBLIC = ['#/login', '#/signup', '#/verify'];

export async function ensureAuth() {
  const hash = location.hash || '#/';
  if (PUBLIC.some(p => hash.startsWith(p))) return true;
  try { await api.get('/api/auth/me'); return true; }
  catch { location.hash = '#/login'; return false; }
}

export function wireLogout() {
  const btn = document.querySelector('#logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    location.hash = '#/login';
  });
}
