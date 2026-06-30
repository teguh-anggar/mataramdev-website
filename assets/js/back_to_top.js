// ====== back_to_top.js ======
// Shows/hides the fixed ↑ button based on scroll position.
// ======================================================

import { BACK_TO_TOP_THRESHOLD } from './config.js';

export function init_back_to_top() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > BACK_TO_TOP_THRESHOLD) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
