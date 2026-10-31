// ===== Lumina — Trang tài khoản =====
import { getUser, checkSession, logout } from './api-client.js';
import { mountChrome } from './chrome.js';

mountChrome({ active: 'account' });

const avatarEl = document.getElementById('profile-avatar');
const nameEl = document.getElementById('profile-name');
const emailEl = document.getElementById('profile-email');
const roleEl = document.getElementById('profile-role');
const balanceEl = document.getElementById('stat-balance');
const joinedEl = document.getElementById('stat-joined');
const loginsEl = document.getElementById('stat-logins');
const planEl = document.getElementById('stat-plan');

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function paint(user) {
  if (!user) return;
  const name = user.username || 'user';
  avatarEl.textContent = name.charAt(0).toUpperCase();
  nameEl.textContent = name;
  emailEl.textContent = user.email || '—';
  roleEl.textContent = user.role || 'user';
  balanceEl.textContent = Number(user.balance || 0).toLocaleString('vi-VN') + ' ₫';
  joinedEl.textContent = fmtDate(user.created_at);
  loginsEl.textContent = (user.login_count || 0) + ' lần';
  planEl.textContent = user.plan || 'Miễn phí';
}

paint(getUser());
checkSession().then((fresh) => { if (fresh) paint(fresh); });

document.getElementById('btn-logout-page').addEventListener('click', async (e) => {
  e.currentTarget.disabled = true;
  await logout();
  window.location.replace('/src/auth.html');
});
