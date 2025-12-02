// js/main.js

// =======================
// INISIALISASI ELEMENT DOM
// =======================
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const sidebarLinks = document.querySelectorAll('.slink');
const sidebar = document.getElementById('sidebar');
const cardsContainer = document.getElementById('cardsContainer');
const categoriesEl = document.getElementById('categories');
const searchInput = document.getElementById('searchInput');
const notFound = document.getElementById('notFound');
const favoritesListEl = document.getElementById('favoritesList');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

// =======================
// NAVIGASI ANTAR PAGE
// =======================
function showPage(pageId) {
  pages.forEach(p => p.classList.toggle('page-active', p.id === pageId));
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === pageId));
  closeSidebar();
  if (pageId === 'wisata') setTimeout(() => searchInput.focus(), 150);
}
showPage('home');

// NAVBAR & SIDEBAR EVENTS
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});
document.getElementById('btn-open-sidebar').addEventListener('click', () => {
  sidebar.classList.add('open');
});
document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); }

// =======================
// KATEGORI & PENCARIAN
// =======================
const categories = ["Semua", "Pantai", "Gunung", "Budaya", "Sejarah"];
let activeCategory = "Semua";

function renderCategories() {
  categoriesEl.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => { activeCategory = cat; renderCategories(); filterAndRender(); };
    categoriesEl.appendChild(btn);
  });
}
renderCategories();

// =======================
// FAVORITE LOCALSTORAGE
// =======================
const LS_KEY = 'cilacap_favorites_v1';
function getFavorites() { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
function saveFavorites(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function isLoggedIn() { return sessionStorage.getItem('cilacap_logged') === '1'; }

// =======================
// RENDER FAVORITE
// =======================
function renderFavorites() {
  const fav = getFavorites();
  favoritesListEl.innerHTML = '';
  if (fav.length === 0) {
    favoritesListEl.innerHTML = '<div style="color:#666">Belum ada favorite. (Login terlebih dahulu untuk menambah.)</div>';
    return;
  }
  fav.forEach(id => {
    const w = WISATA.find(x => x.id === id);
    if (!w) return;
    const el = document.createElement('div');
    el.className = 'fav-item';
    el.innerHTML = `
      <img src="${w.image}" alt="${w.name}">
      <div class="fav-info"><strong>${w.name}</strong><div class="muted">${w.location}</div></div>
      <button class="btn small remove-fav" data-id="${w.id}">Hapus</button>`;
    favoritesListEl.appendChild(el);
  });
  document.querySelectorAll('.remove-fav').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      saveFavorites(getFavorites().filter(x => x !== id));
      renderFavorites();
    };
  });
}

// =======================
// RENDER KARTU WISATA
// =======================
function createCard(w) {
  const c = document.createElement('div');
  c.className = 'card';
  c.innerHTML = `
    <img src="${w.image}" alt="${w.name}">
    <div class="card-body">
      <h3>${w.name}</h3>
      <div class="meta">${w.location} • ${w.category}</div>
      <div class="card-actions">
        <div>
          <button class="btn detail-btn" data-id="${w.id}">Detail</button>
          <button class="btn outline fav-btn" data-id="${w.id}">Tambah ke Favorite</button>
        </div>
        <div class="id">ID:${w.id}</div>
      </div>
    </div>`;
  return c;
}

// FILTER & RENDER
function filterAndRender() {
  const q = searchInput.value.trim().toLowerCase();
  let filtered = WISATA.filter(w => activeCategory === 'Semua' || w.category === activeCategory);
  if (q) filtered = filtered.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
  cardsContainer.innerHTML = '';
  if (filtered.length === 0) notFound.style.display = 'block';
  else {
    notFound.style.display = 'none';
    filtered.forEach(w => cardsContainer.appendChild(createCard(w)));
  }
  attachCardListeners();
}
searchInput.addEventListener('input', filterAndRender);
document.getElementById('clearSearch').onclick = () => { searchInput.value = ''; filterAndRender(); };

// =======================
// DETAIL & FAVORITE
// =======================
function attachCardListeners() {
  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.onclick = () => {
  const w = WISATA.find(x => x.id == btn.dataset.id);

  document.getElementById("detailPanel").style.display = "block";

  document.getElementById("dNama").textContent = w.name;
  document.getElementById("dLokasi").textContent = w.location;
  document.getElementById("dKategori").textContent = w.category;

  document.getElementById("dBudaya").textContent = w.budaya || "-";
  document.getElementById("dSejarah").textContent = w.sejarah || "-";

  showPage("wisata");
};
  document.getElementById("closeDetail").onclick = () => {
  document.getElementById("detailPanel").style.display = "none";
};

  });
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      if (!isLoggedIn()) return alert('Anda harus login terlebih dahulu untuk menambah favorite.');
      const fav = getFavorites();
      if (fav.includes(id)) return alert('Sudah ada di favorite.');
      saveFavorites([...fav, id]);
      renderFavorites();
      alert('Berhasil ditambahkan ke Favorite!');
    };
  });
}

// =======================
// LOGIN LOGIC
// =======================
const loginModal = document.getElementById('loginModal');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
btnLogin.onclick = openLoginModal;
document.getElementById('loginClose').onclick = closeLoginModal;
document.getElementById('loginCancel').onclick = closeLoginModal;

function openLoginModal() { loginModal.classList.add('open'); }
function closeLoginModal() { loginModal.classList.remove('open'); }

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  if (!user) return alert('Isi username!');
  sessionStorage.setItem('cilacap_logged', '1');
  sessionStorage.setItem('cilacap_user', user);
  updateAuthUI();
  closeLoginModal();
  alert('Login berhasil. Selamat datang, ' + user + '!');
});
btnLogout.onclick = () => {
  sessionStorage.removeItem('cilacap_logged');
  sessionStorage.removeItem('cilacap_user');
  updateAuthUI();
  alert('Anda telah logout.');
};
function updateAuthUI() {
  if (isLoggedIn()) { btnLogin.style.display = 'none'; btnLogout.style.display = 'inline-block'; }
  else { btnLogin.style.display = 'inline-block'; btnLogout.style.display = 'none'; }
}

// =======================
// INISIALISASI
// =======================
updateAuthUI();
renderCategories();
filterAndRender();
renderFavorites();
