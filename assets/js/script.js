// ====== THEME TOGGLE ======
(function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const icon = btn.querySelector('img');

  // Load saved theme
  const saved = localStorage.getItem('mataramdev-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (icon) icon.src = './assets/images/light-mode.svg';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (icon) icon.src = './assets/images/dark-mode.svg';
  }

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('mataramdev-theme', 'light');
      if (icon) icon.src = './assets/images/dark-mode.svg';
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('mataramdev-theme', 'dark');
      if (icon) icon.src = './assets/images/light-mode.svg';
    }
  });
})();

// ====== MOBILE NAV TOGGLE ======
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// ====== DATABASE & ENV CONFIGURATION ======
let supabase = null;

async function loadEnv() {
  try {
    const response = await fetch('/.env');
    if (!response.ok) throw new Error('Failed to load .env');
    const text = await response.text();
    const env = {};
    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          env[key] = value;
        }
      }
    });
    return env;
  } catch (e) {
    console.warn('Could not read .env file, utilizing environment defaults:', e.message);
    return {
      SUPABASE_URL: window.SUPABASE_URL || 'https://your-project-id.supabase.co',
      SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'your-anon-public-key'
    };
  }
}

// Initialize Supabase Connection
async function initSupabase() {
  const env = await loadEnv();
  if (typeof supabase !== 'undefined' && window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('Supabase client successfully initialized!');
    
    // Fetch live activities and events if database is active
    fetchLiveActivities();
    fetchLiveEvents();
  } else {
    console.warn('Supabase SDK not loaded. Running in local fallback/mock mode.');
  }
}

// ====== JOIN FORM SUBMISSION ======
const form = document.getElementById('joinForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('mataramdev-lang') || 'en';
    const name = document.getElementById('joinName')?.value || '';
    const email = document.getElementById('joinEmail')?.value || '';
    const interest = document.getElementById('joinInterest')?.value || '';
    const level = document.getElementById('joinLevel')?.value || '';
    const message = document.getElementById('joinMessage')?.value || '';

    if (supabase) {
      // Live Insert to Supabase join_requests table
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          full_name: name,
          email: email,
          interest: interest,
          level: level,
          message: message
        }]);

      if (error) {
        console.error('Database insertion error:', error);
        alert(currentLang === 'id' ? 'Terjadi kesalahan sistem. Silakan coba lagi.' : 'System error. Please try again.');
        return;
      }
    } else {
      console.log('Mock Join Submission:', { name, email, interest, level, message });
    }

    if (currentLang === 'id') {
      alert('Terima kasih! Pendaftaran kamu berhasil dikirim 🙌');
    } else {
      alert('Thank you! Your registration has been submitted successfully 🙌');
    }
    form.reset();
  });
}

// ====== SLIDER ======
(function () {
  const slider = document.getElementById('aboutSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dotsContainer = slider.querySelector('.slider-dots');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');

  let current = 0;
  let timer = null;
  const INTERVAL = 4000;

  // Buat dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides.forEach((s) => s.classList.remove('active'));
    dotsContainer.querySelectorAll('span').forEach((d) => d.classList.remove('active'));

    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Safe checks for buttons
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); startAuto(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); startAuto(); });
  }

  function startAuto() { stopAuto(); timer = setInterval(next, INTERVAL); }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  // Jeda auto-play saat hover
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? prev() : next();
      startAuto();
    }
  }, { passive: true });

  // Mulai auto-play
  startAuto();
})();

// ====== MULTI-LANGUAGE SYSTEM ======
let translations = {};

const placeholders = {
  en: {
    "joinName": "Full Name",
    "joinEmail": "Email",
    "joinInterest": "Interest Area (e.g. Web, Mobile, AI)",
    "joinLevel": "Level (Beginner / Intermediate / Advanced)",
    "joinMessage": "Message or expectations for the community (optional)"
  },
  id: {
    "joinName": "Nama Lengkap",
    "joinEmail": "Email",
    "joinInterest": "Area Minat (misal: Web, Mobile, AI)",
    "joinLevel": "Tingkat (Pemula / Menengah / Lanjutan)",
    "joinMessage": "Pesan atau harapan untuk komunitas (opsional)"
  }
};

const eventMetaTranslations = {
  "meetup-1": {
    en: "📍 APRA College, Mataram • 09:00 WITA • 3 hours",
    id: "📍 APRA College, Mataram • 09:00 WITA • 3 jam"
  },
  "tailwind-workshop": {
    en: "📍 Online • 15:00 WITA • 2 hours",
    id: "📍 Online • 15:00 WITA • 2 jam"
  },
  "opensource-night": {
    en: "📍 Co-working Space, Mataram • 18:00 WITA",
    id: "📍 Co-working Space, Mataram • 18:00 WITA"
  },
  "hackathon": {
    en: "📍 TBD • 09:00 — 17:00 WITA",
    id: "📍 TBD • 09:00 — 17:00 WITA"
  }
};

async function applyLanguage(lang) {
  localStorage.setItem('mataramdev-lang', lang);
  const langToggleBtn = document.getElementById('langToggle');
  if (langToggleBtn) langToggleBtn.textContent = lang === 'en' ? 'ID' : 'EN';

  // Load from external JSON translations
  try {
    const res = await fetch(`./assets/lang/${lang}.json`);
    if (!res.ok) throw new Error('Translations JSON failed to fetch');
    translations = await res.json();
  } catch (err) {
    console.error('Translation loading error:', err);
    return;
  }

  // Translate marked elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      if (key === 'hero-title' || key === 'about-mission-text') {
        el.innerHTML = translations[key];
      } else {
        el.textContent = translations[key];
      }
    }
  });

  // Translate placeholders
  if (placeholders[lang]) {
    Object.keys(placeholders[lang]).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('placeholder', placeholders[lang][id]);
    });
  }

  // Translate event metadata strings
  document.querySelectorAll('[data-event-meta]').forEach((el) => {
    const eventId = el.getAttribute('data-event-meta');
    if (eventMetaTranslations[eventId] && eventMetaTranslations[eventId][lang]) {
      el.textContent = eventMetaTranslations[eventId][lang];
    }
  });
}

(function () {
  const langToggleBtn = document.getElementById('langToggle');
  if (!langToggleBtn) return;

  let currentLang = localStorage.getItem('mataramdev-lang') || 'en';

  langToggleBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'id' : 'en';
    currentLang = nextLang;
    applyLanguage(nextLang);
  });

  // Init language
  applyLanguage(currentLang);
})();

// ====== BACK TO TOP ======
(function () {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

// ====== EVENT STATUS LABEL & CALCULATIONS ======
function updateEventStatusLabels() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  document.querySelectorAll('.event-item').forEach((item) => {
    const dateStr = item.getAttribute('data-date');
    if (!dateStr) return;

    const eventDate = new Date(dateStr + 'T23:59:59');
    const label = item.querySelector('.event-label');
    if (!label) return;

    if (eventDate < today) {
      label.textContent = 'End';
      label.classList.add('ended');
      item.classList.add('ended');
      // Disable RSVP button if event ended
      const rsvpBtn = item.querySelector('.event-rsvp-btn');
      if (rsvpBtn) {
        rsvpBtn.classList.add('disabled');
        rsvpBtn.setAttribute('disabled', 'true');
      }
    } else {
      label.textContent = 'Upcoming';
      label.classList.add('upcoming');
    }
  });
}

updateEventStatusLabels();

// ====== DYNAMIC CONTENT LOADER (SUPABASE -> FRONTEND) ======
async function fetchLiveActivities() {
  if (!supabase) return;
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load live activities:', error.message);
    return;
  }

  // Update domestic DOM container for Activities dynamically
  const container = document.querySelector('#activities .cards-grid');
  if (!container || !activities.length) return;

  container.innerHTML = '';
  activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-icon">${act.icon || '💻'}</div>
      <h3>${act.title}</h3>
      <p>${act.description}</p>
    `;
    container.appendChild(card);
  });
}

async function fetchLiveEvents() {
  if (!supabase) return;
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('start_at', { ascending: true });

  if (error) {
    console.error('Failed to load live events:', error.message);
    return;
  }

  // Update domestic DOM container for Events dynamically
  const listContainer = document.querySelector('#events .event-list');
  if (!listContainer || !events.length) return;

  listContainer.innerHTML = '';
  events.forEach(evt => {
    const dateObj = new Date(evt.start_at);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    const dateAttr = dateObj.toISOString().split('T')[0];

    const article = document.createElement('article');
    article.className = 'event-item';
    article.setAttribute('data-date', dateAttr);
    article.innerHTML = `
      <div class="event-date">
        <span class="event-day">${day}</span>
        <span class="event-month">${month}</span>
      </div>
      <div class="event-info">
        <div class="event-info-header">
          <h3>${evt.title}</h3>
          <span class="event-label"></span>
        </div>
        <p class="event-meta" data-event-meta="${evt.id}">📍 ${evt.location} • ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} WITA</p>
        <p class="event-desc">${evt.description}</p>
      </div>
      <div class="event-actions">
        <button class="btn btn-small btn-secondary event-details-btn" data-event-id="${evt.id}">Details</button>
        <button class="btn btn-small btn-primary event-rsvp-btn" data-event-id="${evt.id}">RSVP</button>
      </div>
    `;
    listContainer.appendChild(article);
  });

  updateEventStatusLabels();
  bindDynamicEventButtons();
}

// ====== MODAL DETAILS & RSVP EVENT SYSTEM ======
const fallbackEventDatabase = {
  "meetup-1": {
    title: { en: "Meetup #1", id: "Meetup #1" },
    date: { en: "April 11, 2026", id: "11 April 2026" },
    time: "09:00 - 12:00 WITA",
    location: "APRA College, Mataram",
    desc: {
      en: "The inaugural gathering of Mataram Dev community members in Lombok. We discussed our learning roadmaps, sharing session schedules, and planned future collaborations.",
      id: "Pertemuan perdana anggota komunitas Mataram Dev di Lombok. Kami membahas peta jalan pembelajaran, jadwal sesi berbagi, dan merencanakan kolaborasi masa depan."
    },
    agenda: [
      { time: "09:00 - 09:30", label: { en: "Registrations & Warmups", id: "Registrasi & Pemanasan" } },
      { time: "09:30 - 10:30", label: { en: "Community Introduction & Vision", id: "Pengenalan Komunitas & Visi" } },
      { time: "10:30 - 11:30", label: { en: "Lightning Talks & Sharing Session", id: "Bicara Singkat & Sesi Berbagi" } },
      { time: "11:30 - 12:00", label: { en: "Networking & Photo Session", id: "Jejaring & Sesi Foto" } }
    ],
    speakers: [
      { name: "Fandi", role: "AI/ML Engineer", initial: "F" },
      { name: "Anto", role: "Fullstack Developer", initial: "A" }
    ]
  },
  "tailwind-workshop": {
    title: { en: "Intro to Tailwind CSS", id: "Pengenalan Tailwind CSS" },
    date: { en: "June 28, 2026", id: "28 Juni 2026" },
    time: "15:00 - 17:00 WITA",
    location: "Online (Zoom / Discord Live)",
    desc: {
      en: "A hands-on workshop focused on building interactive and responsive web pages rapidly using utility-first classes in Tailwind CSS.",
      id: "Workshop praktik yang berfokus pada pembangunan halaman web interaktif dan responsif secara cepat menggunakan kelas utility-first di Tailwind CSS."
    },
    agenda: [
      { time: "15:00 - 15:15", label: { en: "Overview of CSS Frameworks", id: "Tinjauan Framework CSS" } },
      { time: "15:15 - 16:30", label: { en: "Live Coding: Crafting Landing Page", id: "Live Coding: Membuat Halaman Pendaratan" } },
      { time: "16:30 - 17:00", label: { en: "Q&A, Review & Repository Showcase", id: "Tanya Jawab, Tinjauan & Pameran Repositori" } }
    ],
    speakers: [
      { name: "Anto", role: "Fullstack Developer", initial: "A" }
    ]
  },
  "opensource-night": {
    title: { en: "Open Source Night", id: "Malam Sumber Terbuka" },
    date: { en: "July 12, 2026", id: "12 Juli 2026" },
    time: "18:00 - 21:00 WITA",
    location: "Co-working Space, Mataram",
    desc: {
      en: "An evening session dedicated to understanding git workflows, issue tracking, and contributing to actual community or open-source repositories.",
      id: "Sesi malam hari yang didedikasikan untuk memahami alur kerja git, pelacakan masalah, dan berkontribusi ke repositori komunitas atau open-source yang sebenarnya."
    },
    agenda: [
      { time: "18:00 - 18:30", label: { en: "Git & GitHub Basics for Contribution", id: "Dasar Git & GitHub untuk Kontribusi" } },
      { time: "18:30 - 20:30", label: { en: "Hack Session: Squash Bugs & Push PRs", id: "Sesi Retas: Perbaiki Bug & Dorong PR" } },
      { time: "20:30 - 21:00", label: { en: "Merge celebration & Wrap up", id: "Perayaan Penggabungan & Penutupan" } }
    ],
    speakers: [
      { name: "Maulana", role: "DevOps Engineer", initial: "M" },
      { name: "Gilang", role: "Security Analyst", initial: "G" }
    ]
  },
  "hackathon": {
    title: { en: "Mini Hackathon: Build for Lombok", id: "Mini Hackathon: Membangun untuk Lombok" },
    date: { en: "July 26, 2026", id: "26 Juli 2026" },
    time: "09:00 - 17:00 WITA",
    location: "TBD Co-working Hall, Mataram",
    desc: {
      en: "A one-day challenge where designers and developer teams build light apps addressing community, tourism, or logistics issues on Lombok island.",
      id: "Tantangan satu hari di mana tim desainer dan pengembang membangun aplikasi ringan yang mengatasi masalah komunitas, pariwisata, atau logistik di pulau Lombok."
    },
    agenda: [
      { time: "09:00 - 09:30", label: { en: "Briefing & Team Formations", id: "Pengarahan & Pembentukan Tim" } },
      { time: "09:30 - 15:30", label: { en: "Hack & Design Sprint (Lunch Included)", id: "Sesi Hacking & Design Sprint (Termasuk Makan Siang)" } },
      { time: "15:30 - 16:30", label: { en: "Pitching & App Demos", id: "Pitching & Demo Aplikasi" } },
      { time: "16:30 - 17:00", label: { en: "Judges scoring & Award ceremony", id: "Penilaian Juri & Upacara Penghargaan" } }
    ],
    speakers: [
      { name: "Fandi", role: "AI/ML Engineer", initial: "F" },
      { name: "Dimas", role: "Cyber Security", initial: "D" }
    ]
  }
};

const modal = document.getElementById('eventModal');
const overlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

function openModal(contentHtml) {
  if (!modal || !modalBody) return;
  modalBody.innerHTML = contentHtml;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', closeModal);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
    closeModal();
  }
});

function bindDynamicEventButtons() {
  // Details button handler
  document.querySelectorAll('.event-details-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const eventId = btn.getAttribute('data-event-id');
      const lang = localStorage.getItem('mataramdev-lang') || 'en';
      
      let event = null;
      
      // If connected to live supabase, query details
      if (supabase) {
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (!error && data) {
          event = {
            title: { en: data.title, id: data.title },
            date: { en: new Date(data.start_at).toLocaleDateString('en-US'), id: new Date(data.start_at).toLocaleDateString('id-ID') },
            time: `${new Date(data.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} WITA`,
            location: data.location,
            desc: { en: data.description, id: data.description },
            agenda: [], // Database can be extended later
            speakers: []
          };
        }
      }
      
      // Fallback
      if (!event) event = fallbackEventDatabase[eventId];
      if (!event) return;

      const agendaTitle = lang === 'en' ? 'Agenda' : 'Agenda Kegiatan';
      const speakersTitle = lang === 'en' ? 'Speakers' : 'Pembicara';
      const rsvpBtnText = lang === 'en' ? 'RSVP Now' : 'Daftar RSVP';

      const itemEl = btn.closest('.event-item');
      const isEnded = itemEl ? itemEl.classList.contains('ended') : false;

      let speakersHtml = '';
      if (event.speakers && event.speakers.length > 0) {
        speakersHtml = `
          <h3 class="modal-subtitle">${speakersTitle}</h3>
          <div class="modal-speaker-grid">
            ${event.speakers.map(s => `
              <div class="modal-speaker-card">
                <div class="modal-speaker-img">${s.initial}</div>
                <div class="modal-speaker-info">
                  <h4>${s.name}</h4>
                  <p>${s.role}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      let agendaHtml = '';
      if (event.agenda && event.agenda.length > 0) {
        agendaHtml = `
          <h3 class="modal-subtitle">${agendaTitle}</h3>
          <ul class="modal-agenda-list">
            ${event.agenda.map(a => `
              <li>
                <span>${a.time}</span>
                <span>${a.label[lang]}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }

      let actionHtml = '';
      if (!isEnded) {
        actionHtml = `
          <button class="btn btn-primary modal-action-rsvp" data-event-id="${eventId}" style="width: 100%; margin-top: 1rem;">
            ${rsvpBtnText}
          </button>
        `;
      }

      const content = `
        <h2 class="modal-title">${event.title[lang]}</h2>
        <div class="modal-meta-item">📅 ${event.date[lang]} • 🕒 ${event.time}</div>
        <div class="modal-meta-item">📍 ${event.location}</div>
        <p class="modal-desc">${event.desc[lang]}</p>
        ${agendaHtml}
        ${speakersHtml}
        ${actionHtml}
      `;

      openModal(content);

      const innerRsvp = modal.querySelector('.modal-action-rsvp');
      if (innerRsvp) {
        innerRsvp.addEventListener('click', () => {
          showRsvpForm(eventId, event);
        });
      }
    });
  });

  // RSVP button handler
  document.querySelectorAll('.event-rsvp-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      const eventId = btn.getAttribute('data-event-id');
      const event = fallbackEventDatabase[eventId] || { title: { en: "Event Registration", id: "Pendaftaran Acara" } };
      showRsvpForm(eventId, event);
    });
  });
}

function showRsvpForm(eventId, event) {
  const lang = localStorage.getItem('mataramdev-lang') || 'en';
  const formTitle = lang === 'en' ? 'Register for Event' : 'Daftar Acara';
  const nameLabel = lang === 'en' ? 'Full Name' : 'Nama Lengkap';
  const emailLabel = lang === 'en' ? 'Email Address' : 'Alamat Email';
  const phoneLabel = lang === 'en' ? 'WhatsApp / Phone' : 'No. WhatsApp / HP';
  const occupationLabel = lang === 'en' ? 'Occupation / Institution' : 'Pekerjaan / Institusi';
  const submitBtnText = lang === 'en' ? 'Confirm Registration' : 'Konfirmasi Pendaftaran';

  const formHtml = `
    <h2 class="modal-title">${formTitle}</h2>
    <div class="modal-meta-item" style="margin-bottom: 1.25rem;"><strong>${event.title[lang]}</strong></div>
    <form class="modal-rsvp-form" id="modalRsvpForm">
      <label for="rsvpName">${nameLabel}</label>
      <input type="text" id="rsvpName" required />

      <label for="rsvpEmail">${emailLabel}</label>
      <input type="email" id="rsvpEmail" required />

      <label for="rsvpPhone">${phoneLabel}</label>
      <input type="tel" id="rsvpPhone" required />

      <label for="rsvpOcc">${occupationLabel}</label>
      <input type="text" id="rsvpOcc" />

      <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">${submitBtnText}</button>
    </form>
  `;

  openModal(formHtml);

  const rsvpForm = document.getElementById('modalRsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rsvpData = {
        name: document.getElementById('rsvpName').value,
        email: document.getElementById('rsvpEmail').value,
        phone: document.getElementById('rsvpPhone').value,
        occupation: document.getElementById('rsvpOcc').value,
      };

      if (supabase) {
        // If user is authenticated, insert to rsvps table matching profiles(id)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('rsvps').insert([{
            event_id: eventId,
            profile_id: user.id,
            status: 'going'
          }]);
        } else {
          console.log('Anonymous RSVP submitted to console:', { eventId, ...rsvpData });
        }
      } else {
        console.log('Mock RSVP Registered:', { eventId, ...rsvpData });
      }

      const successTitle = lang === 'en' ? 'Registration Successful!' : 'Pendaftaran Berhasil!';
      const successDesc = lang === 'en' 
        ? `Thank you, ${rsvpData.name}! We've saved your RSVP. See you there!`
        : `Terima kasih, ${rsvpData.name}! Pendaftaran RSVP kamu berhasil disimpan. Sampai jumpa!`;

      const successHtml = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h2 class="modal-title" style="border: none; margin-bottom: 0.5rem; text-align: center;">${successTitle}</h2>
          <p class="modal-desc" style="text-align: center;">${successDesc}</p>
          <button class="btn btn-secondary" id="successClose" style="margin-top: 1rem; width: 100%;">OK</button>
        </div>
      `;
      modalBody.innerHTML = successHtml;

      const successClose = document.getElementById('successClose');
      if (successClose) {
        successClose.addEventListener('click', closeModal);
      }
    });
  }
}

// Bind static page buttons on load
bindDynamicEventButtons();

// Initialize Database connection on page load
window.addEventListener('DOMContentLoaded', initSupabase);
