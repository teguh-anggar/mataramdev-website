// ====== join.js ======
// Join Us form submission handler.
// Inserts into Supabase 'join_requests' table, or logs mock in dev mode.
// ======================================================

import { get_client } from './db.js';
import { get_lang }   from './lang.js';

export function init_join_form() {
  const form = document.getElementById('joinForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const client = get_client();
    const lang   = get_lang();

    const payload = {
      full_name: document.getElementById('joinName')?.value    || '',
      email:     document.getElementById('joinEmail')?.value   || '',
      interest:  document.getElementById('joinInterest')?.value|| '',
      level:     document.getElementById('joinLevel')?.value   || '',
      message:   document.getElementById('joinMessage')?.value || ''
    };

    if (client) {
      const { error } = await client.from('join_requests').insert([payload]);
      if (error) {
        console.error('DB insert error:', error);
        alert(lang === 'id' ? 'Terjadi kesalahan sistem. Silakan coba lagi.' : 'System error. Please try again.');
        return;
      }
    } else {
      console.log('Mock Join Submission:', payload);
    }

    alert(lang === 'id'
      ? 'Terima kasih! Pendaftaran kamu berhasil dikirim 🙌'
      : 'Thank you! Your registration has been submitted successfully 🙌'
    );
    form.reset();
  });
}
