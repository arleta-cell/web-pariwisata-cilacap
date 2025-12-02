// js/kontak.js

// =======================
// FORM KONTAK
// =======================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMessage').value.trim();

    const entry = { name, email, msg, ts: new Date().toISOString() };
    const KEY = 'cilacap_contact_entries';
    const arr = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    arr.push(entry);
    sessionStorage.setItem(KEY, JSON.stringify(arr));

    const notice = document.getElementById('contactNotice');
    notice.textContent = 'Terima kasih atas saran Anda!';
    contactForm.reset();
    setTimeout(() => (notice.textContent = ''), 3000);
  });
}
