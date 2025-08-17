// /frontend/js/features/verify.js
export async function mountVerify() {
  const el = document.querySelector('#verify-status');
  const token = new URLSearchParams(location.hash.split('?')[1] || '').get('token');
  if (!token) { el.textContent = 'Missing token.'; return; }
  try {
    const url = new URL('/api/auth/verify', location.origin);
    url.searchParams.set('token', token);
    const r = await fetch(url, { credentials:'include' });
    if (!r.ok) throw new Error(await r.text());
    el.textContent = 'E-mail confirmed. You can log in now.';
    setTimeout(() => location.hash = '#/login?verified=1', 800);
  } catch (e) { el.textContent = 'Invalid or expired link.'; }
}
