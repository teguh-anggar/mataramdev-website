// ====== modal.js ======
// Event detail modal + RSVP flow.
// Fallback event database used when Supabase is unavailable.
// ======================================================

import { get_client }              from './db.js';
import { get_lang }                from './lang.js';
import { update_event_status_labels } from './events.js';

// ── Fallback event database ──
const FALLBACK_EVENTS = {
  'meetup-1': {
    title:    { en: 'Meetup #1', id: 'Meetup #1' },
    date:     { en: 'April 11, 2026', id: '11 April 2026' },
    time:     '09:00 - 12:00 WITA',
    location: 'APRA College, Mataram',
    desc: {
      en: 'The inaugural gathering of Mataram Dev community members in Lombok. We discussed our learning roadmaps, sharing session schedules, and planned future collaborations.',
      id: 'Pertemuan perdana anggota komunitas Mataram Dev di Lombok. Kami membahas peta jalan pembelajaran, jadwal sesi berbagi, dan merencanakan kolaborasi masa depan.'
    },
    agenda: [
      { time: '09:00 - 09:30', label: { en: 'Registrations & Warmups',          id: 'Registrasi & Pemanasan'             } },
      { time: '09:30 - 10:30', label: { en: 'Community Introduction & Vision',  id: 'Pengenalan Komunitas & Visi'        } },
      { time: '10:30 - 11:30', label: { en: 'Lightning Talks & Sharing Session', id: 'Bicara Singkat & Sesi Berbagi'      } },
      { time: '11:30 - 12:00', label: { en: 'Networking & Photo Session',        id: 'Jejaring & Sesi Foto'               } }
    ],
    speakers: [
      { name: 'Fandi',  role: 'AI/ML Engineer',     initial: 'F' },
      { name: 'Anto',   role: 'Fullstack Developer', initial: 'A' }
    ]
  },
  'tailwind-workshop': {
    title:    { en: 'Intro to Tailwind CSS', id: 'Pengenalan Tailwind CSS' },
    date:     { en: 'June 28, 2026', id: '28 Juni 2026' },
    time:     '15:00 - 17:00 WITA',
    location: 'Online (Zoom / Discord Live)',
    desc: {
      en: 'A hands-on workshop focused on building interactive and responsive web pages rapidly using utility-first classes in Tailwind CSS.',
      id: 'Workshop praktik yang berfokus pada pembangunan halaman web interaktif dan responsif secara cepat menggunakan kelas utility-first di Tailwind CSS.'
    },
    agenda: [
      { time: '15:00 - 15:15', label: { en: 'Overview of CSS Frameworks',              id: 'Tinjauan Framework CSS'               } },
      { time: '15:15 - 16:30', label: { en: 'Live Coding: Crafting Landing Page',      id: 'Live Coding: Membuat Halaman Pendaratan' } },
      { time: '16:30 - 17:00', label: { en: 'Q&A, Review & Repository Showcase',       id: 'Tanya Jawab, Tinjauan & Pameran Repositori' } }
    ],
    speakers: [{ name: 'Anto', role: 'Fullstack Developer', initial: 'A' }]
  },
  'opensource-night': {
    title:    { en: 'Open Source Night', id: 'Malam Sumber Terbuka' },
    date:     { en: 'July 12, 2026', id: '12 Juli 2026' },
    time:     '18:00 - 21:00 WITA',
    location: 'Co-working Space, Mataram',
    desc: {
      en: 'An evening session dedicated to understanding git workflows, issue tracking, and contributing to actual community or open-source repositories.',
      id: 'Sesi malam hari yang didedikasikan untuk memahami alur kerja git, pelacakan masalah, dan berkontribusi ke repositori komunitas atau open-source yang sebenarnya.'
    },
    agenda: [
      { time: '18:00 - 18:30', label: { en: 'Git & GitHub Basics for Contribution',    id: 'Dasar Git & GitHub untuk Kontribusi'   } },
      { time: '18:30 - 20:30', label: { en: 'Hack Session: Squash Bugs & Push PRs',   id: 'Sesi Retas: Perbaiki Bug & Dorong PR'  } },
      { time: '20:30 - 21:00', label: { en: 'Merge celebration & Wrap up',             id: 'Perayaan Penggabungan & Penutupan'     } }
    ],
    speakers: [
      { name: 'Maulana', role: 'DevOps Engineer',    initial: 'M' },
      { name: 'Gilang',  role: 'Security Analyst',   initial: 'G' }
    ]
  },
  'hackathon': {
    title:    { en: 'Mini Hackathon: Build for Lombok', id: 'Mini Hackathon: Membangun untuk Lombok' },
    date:     { en: 'July 26, 2026', id: '26 Juli 2026' },
    time:     '09:00 - 17:00 WITA',
    location: 'TBD Co-working Hall, Mataram',
    desc: {
      en: 'A one-day challenge where designers and developer teams build light apps addressing community, tourism, or logistics issues on Lombok island.',
      id: 'Tantangan satu hari di mana tim desainer dan pengembang membangun aplikasi ringan yang mengatasi masalah komunitas, pariwisata, atau logistik di pulau Lombok.'
    },
    agenda: [
      { time: '09:00 - 09:30', label: { en: 'Briefing & Team Formations',               id: 'Pengarahan & Pembentukan Tim'                    } },
      { time: '09:30 - 15:30', label: { en: 'Hack & Design Sprint (Lunch Included)',    id: 'Sesi Hacking & Design Sprint (Termasuk Makan Siang)' } },
      { time: '15:30 - 16:30', label: { en: 'Pitching & App Demos',                    id: 'Pitching & Demo Aplikasi'                        } },
      { time: '16:30 - 17:00', label: { en: 'Judges scoring & Award ceremony',          id: 'Penilaian Juri & Upacara Penghargaan'            } }
    ],
    speakers: [
      { name: 'Fandi', role: 'AI/ML Engineer',  initial: 'F' },
      { name: 'Dimas', role: 'Cyber Security',  initial: 'D' }
    ]
  }
};

// ── DOM refs ──
const modal_el   = document.getElementById('eventModal');
const overlay_el = document.getElementById('modalOverlay');
const close_btn  = document.getElementById('modalClose');
const modal_body = document.getElementById('modalBody');

// ── Open / Close ──
export function open_modal(html) {
  if (!modal_el || !modal_body) return;
  modal_body.innerHTML = html;
  modal_el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function close_modal() {
  if (!modal_el) return;
  modal_el.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Wire close triggers ──
if (close_btn) close_btn.addEventListener('click', close_modal);
if (overlay_el) overlay_el.addEventListener('click', close_modal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal_el?.classList.contains('open')) close_modal();
});

// ── Render helpers ──
function render_speakers(speakers, lang) {
  if (!speakers?.length) return '';
  const title = lang === 'en' ? 'Speakers' : 'Pembicara';
  return `
    <h3 class="modal-subtitle">${title}</h3>
    <div class="modal-speaker-grid">
      ${speakers.map(s => `
        <div class="modal-speaker-card">
          <div class="modal-speaker-img">${s.initial}</div>
          <div class="modal-speaker-info"><h4>${s.name}</h4><p>${s.role}</p></div>
        </div>
      `).join('')}
    </div>
  `;
}

function render_agenda(agenda, lang) {
  if (!agenda?.length) return '';
  const title = lang === 'en' ? 'Agenda' : 'Agenda Kegiatan';
  return `
    <h3 class="modal-subtitle">${title}</h3>
    <ul class="modal-agenda-list">
      ${agenda.map(a => `
        <li><span>${a.time}</span><span>${a.label[lang]}</span></li>
      `).join('')}
    </ul>
  `;
}

// ── Bind all event buttons ──
export function bind_event_buttons() {
  // Details buttons
  document.querySelectorAll('.event-details-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const event_id = btn.getAttribute('data-event-id');
      const lang     = get_lang();
      const client   = get_client();
      let event      = null;

      if (client) {
        const { data, error } = await client.from('events').select('*').eq('id', event_id).single();
        if (!error && data) {
          event = {
            title:    { en: data.title,       id: data.title       },
            date:     { en: new Date(data.start_at).toLocaleDateString('en-US'), id: new Date(data.start_at).toLocaleDateString('id-ID') },
            time:     `${new Date(data.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WITA`,
            location: data.location,
            desc:     { en: data.description, id: data.description },
            agenda: [], speakers: []
          };
        }
      }

      if (!event) event = FALLBACK_EVENTS[event_id];
      if (!event) return;

      const is_ended  = btn.closest('.event-item')?.classList.contains('ended');
      const rsvp_html = is_ended ? '' : `
        <button class="btn btn-primary modal-action-rsvp" data-event-id="${event_id}" style="width:100%;margin-top:1rem;">
          ${lang === 'en' ? 'RSVP Now' : 'Daftar RSVP'}
        </button>
      `;

      open_modal(`
        <h2 class="modal-title">${event.title[lang]}</h2>
        <div class="modal-meta-item">📅 ${event.date[lang]} • 🕒 ${event.time}</div>
        <div class="modal-meta-item">📍 ${event.location}</div>
        <p class="modal-desc">${event.desc[lang]}</p>
        ${render_agenda(event.agenda, lang)}
        ${render_speakers(event.speakers, lang)}
        ${rsvp_html}
      `);

      const inner_rsvp = modal_el.querySelector('.modal-action-rsvp');
      if (inner_rsvp) inner_rsvp.addEventListener('click', () => show_rsvp_form(event_id, event));
    });
  });

  // RSVP buttons
  document.querySelectorAll('.event-rsvp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      const event_id = btn.getAttribute('data-event-id');
      const event    = FALLBACK_EVENTS[event_id] || { title: { en: 'Event Registration', id: 'Pendaftaran Acara' } };
      show_rsvp_form(event_id, event);
    });
  });
}

// ── RSVP form ──
function show_rsvp_form(event_id, event) {
  const lang    = get_lang();
  const client  = get_client();
  const is_en   = lang === 'en';

  open_modal(`
    <h2 class="modal-title">${is_en ? 'Register for Event' : 'Daftar Acara'}</h2>
    <div class="modal-meta-item" style="margin-bottom:1.25rem;"><strong>${event.title[lang]}</strong></div>
    <form class="modal-rsvp-form" id="modalRsvpForm">
      <label for="rsvpName">${is_en ? 'Full Name' : 'Nama Lengkap'}</label>
      <input type="text"  id="rsvpName"  required />
      <label for="rsvpEmail">${is_en ? 'Email Address' : 'Alamat Email'}</label>
      <input type="email" id="rsvpEmail" required />
      <label for="rsvpPhone">${is_en ? 'WhatsApp / Phone' : 'No. WhatsApp / HP'}</label>
      <input type="tel"   id="rsvpPhone" required />
      <label for="rsvpOcc">${is_en ? 'Occupation / Institution' : 'Pekerjaan / Institusi'}</label>
      <input type="text"  id="rsvpOcc" />
      <button type="submit" class="btn btn-primary" style="margin-top:1rem;">
        ${is_en ? 'Confirm Registration' : 'Konfirmasi Pendaftaran'}
      </button>
    </form>
  `);

  const form = document.getElementById('modalRsvpForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const rsvp_data = {
      name:       document.getElementById('rsvpName').value,
      email:      document.getElementById('rsvpEmail').value,
      phone:      document.getElementById('rsvpPhone').value,
      occupation: document.getElementById('rsvpOcc').value
    };

    if (client) {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        await client.from('rsvps').insert([{ event_id, profile_id: user.id, status: 'going' }]);
      } else {
        console.log('Anonymous RSVP (console only):', { event_id, ...rsvp_data });
      }
    } else {
      console.log('Mock RSVP:', { event_id, ...rsvp_data });
    }

    const success_title = is_en ? 'Registration Successful!' : 'Pendaftaran Berhasil!';
    const success_desc  = is_en
      ? `Thank you, ${rsvp_data.name}! We've saved your RSVP. See you there!`
      : `Terima kasih, ${rsvp_data.name}! Pendaftaran RSVP kamu berhasil disimpan. Sampai jumpa!`;

    modal_body.innerHTML = `
      <div style="text-align:center;padding:1.5rem 0;">
        <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
        <h2 class="modal-title" style="border:none;margin-bottom:0.5rem;text-align:center;">${success_title}</h2>
        <p class="modal-desc" style="text-align:center;">${success_desc}</p>
        <button class="btn btn-secondary" id="successClose" style="margin-top:1rem;width:100%;">OK</button>
      </div>
    `;
    document.getElementById('successClose')?.addEventListener('click', close_modal);
  });
}
