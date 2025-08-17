// /frontend/js/router.js
const routes = {
  '#/login': ['pages/login.html', () => import('./features/login.js').then(m => m.mountLogin())],
  '#/signup': ['pages/signup.html', () => import('./features/signup.js').then(m => m.mountSignup())],
  '#/verify': ['pages/verify.html', () => import('./features/verify.js').then(m => m.mountVerify())],
  '#/': ['pages/dashboard.html', () => import('./features/dashboard.js').then(m => m.mountDashboard())],
  '#/products': ['pages/products.html', () => import('./features/products.js').then(m => m.mountProducts())],
  '#/rankings': ['pages/rankings.html', () => import('./features/rankings.js').then(m => m.mountRankings())],
  '#/social': ['pages/social.html', () => import('./features/social.js').then(m => m.mountSocial())],
  '#/analytics': ['pages/analytics.html', () => import('./features/analytics.js').then(m => m.mountAnalytics())],
  '#/settings': ['pages/settings.html', () => import('./features/settings.js').then(m => m.mountSettings())],
};

export async function navigate(hash) {
  const [page, mount] = routes[hash] || routes['#/'];
  const html = await fetch('./' + page).then(r => r.text());
  document.querySelector('#view').innerHTML = html;
  await mount();
}
export function onRouteChange() { navigate(location.hash || '#/'); }
