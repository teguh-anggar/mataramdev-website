// ====== explore_init.js ======
// Entry point for explore/ (and future sub-pages).
// Initialises the shared header UI modules — theme, nav, lang.
// No tree visualiser; the explore page is pure HTML/CSS sections.
// ======================================================

import { init_theme } from './theme.js';
import { init_nav }   from './nav.js';
import { init_lang }  from './lang.js';

document.addEventListener('DOMContentLoaded', () => {
  init_theme();
  init_nav();
  init_lang();
});
