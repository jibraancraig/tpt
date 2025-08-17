// /frontend/js/main.js
import { onRouteChange, navigate } from './router.js';
import { ensureAuth, wireLogout } from './features/auth.js';

window.addEventListener('hashchange', async () => {
  const ok = await ensureAuth();
  if (ok) onRouteChange();
});

window.addEventListener('error', () => {
  const l = document.querySelector('#loader');
  if (l) l.textContent = 'Load failed. Open console.';
});

(async () => {
  wireLogout();
  if (!location.hash) location.hash = '#/login';
  const ok = await ensureAuth();
  if (ok) navigate(location.hash);
})();
