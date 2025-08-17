// /frontend/js/features/login.js
import { api } from '../api.js';
export function mountLogin() {
  const form = document.querySelector('#login-form');
  const err = document.querySelector('#login-error');
  const resend = document.querySelector('#resend-confirm');
  const verified = new URLSearchParams(location.hash.split('?')[1]||'').get('verified');
  if (verified) {
    const note = document.querySelector('#login-note');
    if (note) note.textContent = 'E-mail confirmed. You can log in now.';
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); err.textContent=''; resend.hidden=true;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    try {
      await api.post('/api/auth/login', { email, password });
      location.hash = '#/';
    } catch (ex) {
      const msg = String(ex.message||ex);
      if (msg.includes('E-mail not confirmed')) {
        err.textContent = 'E-mail not confirmed.';
        resend.hidden = false;
        resend.onclick = async () => {
          await api.post('/api/auth/resend', { email });
          alert('Confirmation e-mail sent.');
        };
      } else err.textContent = 'Invalid credentials.';
    }
  });
}
