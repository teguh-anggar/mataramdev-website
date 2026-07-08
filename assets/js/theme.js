// ====== theme.js ======
// Light / dark theme toggle.
// Reads/writes 'mataramdev-theme' in localStorage.
// Swaps the toggle button icon via data-theme attribute on <html>.
// ======================================================

export function init_theme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const icon   = btn.querySelector('img');
  const saved  = localStorage.getItem('mataramdev-theme');
  const root   = document.body.getAttribute('data-root-path') || './';
  const logo   = document.querySelector('.logo img');
  const LOGO_LIGHT = `${root}assets/images/logo-header.svg`;
  const LOGO_DARK  = `${root}assets/images/logo-header-dark.svg`;

  function apply_theme(is_dark) {
    if (is_dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (icon) icon.src = `${root}assets/images/light-mode.svg`;
      if (logo && !logo.src.includes('logo-header-dark')) logo.src = LOGO_DARK;
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (icon) icon.src = `${root}assets/images/dark-mode.svg`;
      if (logo && logo.src.includes('logo-header-dark')) logo.src = LOGO_LIGHT;
    }
  }

  apply_theme(saved === 'dark');

  btn.addEventListener('click', () => {
    const html    = document.documentElement;
    const is_dark = html.getAttribute('data-theme') === 'dark';
    apply_theme(!is_dark);
  });
}
