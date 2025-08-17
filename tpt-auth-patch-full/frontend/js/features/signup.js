// /frontend/js/features/signup.js
import { api } from '../api.js';
export function mountSignup() {
  const form = document.querySelector('#signup-form');
  const note = document.querySelector('#signup-note');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    await api.post('/api/auth/signup', { email, password });
    note.textContent = 'Check your e-mail for a confirmation link.';
  });
}
