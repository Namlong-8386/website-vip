// ===== Lumina — Trang chủ chọn cổng game =====
import { api, getUser } from './api-client.js';
import { mountChrome } from './chrome.js';

const grid = document.getElementById('games-grid');
const countEl = document.getElementById('home-count');
const greetingEl = document.getElementById('home-greeting');

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer;
function showToast(msg, type = 'success') {
  toastMsg.textContent = msg;
  toast.classList.toggle('warn', type === 'warn');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ----- Thanh trên + thanh dưới -----
mountChrome({ active: 'home' });

// ----- Lời chào -----
const cached = getUser();
if (cached) greetingEl.textContent = `Chào ${cached.username}! Chọn một cổng game bên dưới để bắt đầu.`;

// ----- Render thẻ game -----
function gameCard(game, index) {
  const a = document.createElement('a');
  a.className = 'game-card';
  a.href = game.url || '#';
  a.target = '_blank';
  a.rel = 'noopener';
  a.style.setProperty('--accent', game.accent || '#FFD600');
  a.style.animationDelay = (index * 55) + 'ms';

  const badge = game.badge ? `<span class="game-badge">${game.badge}</span>` : '';
  const players = Number(game.players || 0).toLocaleString('vi-VN');

  a.innerHTML = `
    ${badge}
    <div class="game-logo">
      <img src="${game.logo}" alt="${game.name}" loading="lazy">
    </div>
    <div class="game-info">
      <h3 class="game-name">${game.name}</h3>
      <p class="game-tagline">${game.tagline || ''}</p>
      <span class="game-players">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        ${players} người chơi
      </span>
    </div>
    <span class="game-arrow" aria-hidden="true">→</span>
  `;
  return a;
}

function renderGames(games) {
  grid.innerHTML = '';
  if (!games.length) {
    grid.innerHTML = '<p class="home-loading">Chưa có cổng game nào.</p>';
    countEl.textContent = '0 game';
    return;
  }
  games.forEach((g, i) => grid.appendChild(gameCard(g, i)));
  countEl.textContent = games.length + ' game';
}

// ----- Tải dữ liệu -----
async function boot() {
  const res = await api('games.php');
  if (res.ok && Array.isArray(res.data.games)) {
    renderGames(res.data.games);
  } else {
    grid.innerHTML = '<p class="home-loading">Không tải được danh sách game. Kiểm tra PHP API.</p>';
    countEl.textContent = '—';
    showToast(res.data?.error || 'Lỗi tải danh sách game', 'warn');
  }
}

boot();
