// =========================================================
// PETITION APP – Gebetsbereich
// =========================================================

const GOAL = 100;

// --- Hilfsfunktionen ---

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Initialisierung ---

document.addEventListener('DOMContentLoaded', () => {
  // Prüfe Supabase-Verbindung
  if (typeof db === 'undefined' || !db) {
    console.error('Supabase Client nicht initialisiert! Prüfe config.js');
    return;
  }
  console.log('Supabase verbunden:', _SUPABASE_URL);

  loadCount();
  loadSignatures();

  document.getElementById('sign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitSignature();
  });
});

// --- Unterschriften-Zähler + Ring ---

async function loadCount() {
  const { count, error } = await db
    .from('signatures')
    .select('*', { count: 'exact', head: true });

  const n = error ? 0 : count;
  const pct = Math.min(100, Math.round((n / GOAL) * 100));

  document.getElementById('hero-count').textContent = n;
  document.getElementById('supporters-count').textContent = n;

  // Animate circle
  const circle = document.getElementById('circle-progress');
  if (circle) {
    circle.setAttribute('stroke-dasharray', `${pct}, 100`);
  }
}

// --- Unterschriften laden ---

async function loadSignatures() {
  const container = document.getElementById('signatures-list');

  const { data, error } = await db
    .from('public_signatures')
    .select('first_name, last_name, fach, comment, signed_at, show_name')
    .order('signed_at', { ascending: false })
    .limit(200);

  if (error) {
    container.innerHTML = '<p class="empty-msg">Fehler beim Laden.</p>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="empty-msg">Noch keine Unterschriften – sei der/die Erste! ✊</p>';
    return;
  }

  const total = data.length;
  container.innerHTML = data.map((s, i) => {
    const name = s.show_name ? `${esc(s.first_name)} ${esc(s.last_name)}` : 'Anonym';
    return `
    <div class="sig-item">
      <div class="sig-top">
        <span class="sig-name">${name}</span>
        <span class="sig-num">#${total - i}</span>
      </div>
      <div class="sig-meta">${esc(s.fach) || ''}${s.fach ? ' · ' : ''}${formatDate(s.signed_at)}</div>
      ${s.comment ? `<div class="sig-comment">„${esc(s.comment)}"</div>` : ''}
    </div>`;
  }).join('');
}

// --- Unterschrift abgeben ---

async function submitSignature() {
  const btn = document.getElementById('sign-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoad = btn.querySelector('.btn-loading');
  const errorEl = document.getElementById('sign-error');
  const successEl = document.getElementById('sign-success');
  errorEl.style.display = 'none';

  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const matrikel = document.getElementById('matrikelnummer').value.trim();
  const fach = document.getElementById('fach').value.trim();
  const semester = document.getElementById('semester').value;
  const comment = document.getElementById('comment').value.trim();
  const showName = document.getElementById('show-name').checked;
  const accepted = document.getElementById('privacy-accept').checked;

  // Validierung
  if (!firstName || !lastName || !email || !fach) {
    showError('Bitte fülle alle Pflichtfelder (*) aus.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('Bitte gib eine gültige E-Mail-Adresse ein.');
    return;
  }

  if (!accepted) {
    showError('Bitte akzeptiere den Datenschutzhinweis.');
    return;
  }

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoad.style.display = 'inline';

  // IP-Hash
  let ipHash = null;
  try {
    const r = await fetch('https://api.ipify.org?format=text');
    ipHash = await sha256(await r.text());
  } catch { /* ok */ }

  const insertData = {
    first_name: firstName,
    last_name: lastName,
    email,
    matrikelnummer: matrikel || null,
    fach,
    semester: semester || null,
    comment: comment || null,
    show_name: showName,
    privacy_accepted: accepted,
    ip_hash: ipHash
  };

  console.log('Sende Unterschrift:', insertData);

  const { data, error } = await db
    .from('signatures')
    .insert([insertData])
    .select();

  console.log('Supabase Antwort:', { data, error });

  btn.disabled = false;
  btnText.style.display = 'inline';
  btnLoad.style.display = 'none';

  if (error) {
    console.error('Supabase Fehler:', error);
    if (error.message.includes('duplicate') || error.message.includes('unique') || error.code === '23505') {
      showError('Du hast bereits unterschrieben. Jede Person kann nur einmal unterschreiben.');
    } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
      showError('Tabelle nicht gefunden! Bitte führe das SQL-Schema in Supabase aus.');
    } else {
      showError('Fehler: ' + error.message);
    }
    return;
  }

  // Erfolg
  successEl.style.display = 'flex';
  document.getElementById('sign-form').style.display = 'none';
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Refresh
  loadCount();
  loadSignatures();
}

function showError(msg) {
  const el = document.getElementById('sign-error');
  el.textContent = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- Teilen ---

function shareWhatsApp() {
  const text = encodeURIComponent('Salam! Bitte unterstütze unsere Petition für einen Gebetsbereich an der FH Dortmund ✍️\n' + window.location.href);
  window.open('https://wa.me/?text=' + text, '_blank');
}

function shareTelegram() {
  const text = encodeURIComponent('Unterstütze unsere Petition für einen Gebetsbereich an der FH Dortmund ✍️');
  const url = encodeURIComponent(window.location.href);
  window.open('https://t.me/share/url?url=' + url + '&text=' + text, '_blank');
}

function shareEmail() {
  const subject = encodeURIComponent('Petition: Gebetsbereich an der FH Dortmund');
  const body = encodeURIComponent('Salam,\n\nbitte unterstütze unsere Petition für einen Gebetsbereich an der FH Dortmund:\n\n' + window.location.href + '\n\nJede Unterschrift zählt!');
  window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
}

function copyPageLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('Link kopiert! ✅');
  });
}
