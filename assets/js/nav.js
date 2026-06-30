// ====== nav.js ======
// Mobile hamburger menu toggle.
// Adds/removes .open on the <nav> element.
// ======================================================

export function init_nav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}
