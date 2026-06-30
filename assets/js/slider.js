// ====== slider.js ======
// Auto-advancing cross-fade image slider (About section).
// Features: dot indicators, prev/next buttons, touch/swipe, hover pause.
// ======================================================

import { INTERVAL_SLIDER_MS } from './config.js';

export function init_slider() {
  const slider = document.getElementById('aboutSlider');
  if (!slider) return;

  const slides         = slider.querySelectorAll('.slide');
  const dots_container = slider.querySelector('.slider-dots');
  const prev_btn       = slider.querySelector('.slider-prev');
  const next_btn       = slider.querySelector('.slider-next');

  let current = 0;
  let timer   = null;

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => go_to(i));
    dots_container.appendChild(dot);
  });

  function go_to(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots_container.querySelectorAll('span').forEach(d => d.classList.remove('active'));

    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots_container.children[current].classList.add('active');
  }

  function next() { go_to(current + 1); }
  function prev() { go_to(current - 1); }

  if (prev_btn && next_btn) {
    prev_btn.addEventListener('click', e => { e.stopPropagation(); prev(); start_auto(); });
    next_btn.addEventListener('click', e => { e.stopPropagation(); next(); start_auto(); });
  }

  function start_auto() {
    stop_auto();
    timer = setInterval(next, INTERVAL_SLIDER_MS);
  }
  function stop_auto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  slider.addEventListener('mouseenter', stop_auto);
  slider.addEventListener('mouseleave', start_auto);

  // Touch / swipe
  let touch_start_x = 0;
  slider.addEventListener('touchstart', e => {
    touch_start_x = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].screenX - touch_start_x;
    if (Math.abs(diff) > 50) { diff > 0 ? prev() : next(); start_auto(); }
  }, { passive: true });

  start_auto();
}
