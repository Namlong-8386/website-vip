// ===== Lumina — Thanh điều hướng dùng chung (topbar + bottom nav) =====
import { getUser, checkSession, logout } from './api-client.js';

/* ---------- SVG icons tự vẽ (neo-brutalism) ---------- */
const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z"/>
    <path d="M9.5 21.5v-7h5v7"/>
  </svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 8.5V6.5A2.5 2.5 0 0 0 17.5 4H5a2.5 2.5 0 0 0 0 5h15a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H5a2.5 2.5 0 0 1-2.5-2.5v-11"/>
    <circle cx="17" cy="13.5" r="1.6" fill="currentColor" stroke="none"/>
  </svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2.5 21 7v10l-9 4.5L3 17V7z"/>
    <path d="M3 7l9 4.5L21 7"/>
    <path d="M12 11.5V21.5"/>
  </svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21v-1.5A5.5 5.5 0 0 1 9.5 14h5A5.5 5.5 0 0 1 20 19.5V21"/>
  </svg>`,
  support: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 13a8 8 0 0 1 16 0"/>
    <rect x="2.5" y="13" width="4" height="7" rx="2"/>
    <rect x="17.5" y="13" width="4" height="7" rx="2"/>
    <path d="M20 20a3 3 0 0 1-3 2.5h-3"/>
  </svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/>
    <path d="M17 8l4 4-4 4"/>
    <path d="M21 12H9"/>
  </svg>`,
};

/* ---------- Topbar ---------- */
function buildTopbar(el, opts) {
  const { active = '', showSupport = true } = opts;
  el.innerHTML = `
    <a href="/src/home.html" class="tb-logo">
      <span class="tb-logo-icon"><img src="/src/assets/logo.png" alt="Lumina AI"></span>
      <span class="tb-logo-text">LUMINA<span class="tb-logo-ai">AI</span></span>
    </a>
    <div class="tb-actions">
      ${showSupport ? `<a href="/src/support.html" class="tb-btn tb-btn-support${active === 'support' ? ' is-active' : ''}">
        <span class="tb-ico">${ICONS.support}</span><span class="tb-btn-label">Hỗ trợ</span>
      </a>` : ''}
      <div class="tb-user" id="tb-user" hidden>
        <span class="tb-avatar" id="tb-avatar">U</span>
        <span class="tb-username" id="tb-username">user</span>
        <button type="button" class="tb-logout" id="tb-logout" title="Đăng xuất" aria-label="Đăng xuất">
          <span class="tb-ico">${ICONS.logout}</span>
        </button>
      </div>
    </div>
  `;
}

/* ---------- Bottom nav ---------- */
const BOTTOM_ITEMS = [
  { key: 'home',    label: 'Trang chủ', href: '/src/home.html',    icon: ICONS.home },
  { key: 'deposit', label: 'Nạp tiền',  href: '/src/deposit.html', icon: ICONS.wallet },
  { key: 'plans',   label: 'Mua gói',   href: '/src/plans.html',   icon: ICONS.package },
  { key: 'account', label: 'Tài khoản', href: '/src/account.html', icon: ICONS.user },
];

function buildBottomNav(el, active) {
  el.innerHTML = BOTTOM_ITEMS.map((it) => `
    <a href="${it.href}" class="bn-item${active === it.key ? ' is-active' : ''}" data-key="${it.key}">
      <span class="bn-ico">${it.icon}</span>
      <span class="bn-label">${it.label}</span>
    </a>
  `).join('');
}

/* ---------- Render user vào topbar ---------- */
function paintUser(user) {
  const box = document.getElementById('tb-user');
  const avatar = document.getElementById('tb-avatar');
  const nameEl = document.getElementById('tb-username');
  if (!box || !user) return;
  const name = user.username || 'user';
  box.hidden = false;
  avatar.textContent = name.charAt(0).toUpperCase();
  nameEl.textContent = name;
}

/* ---------- Modal xác nhận đăng xuất ---------- */
function showLogoutConfirm(onConfirm) {
  let overlay = document.getElementById('logout-modal');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'logout-modal';
  overlay.className = 'lg-modal-overlay';
  overlay.innerHTML = `
    <div class="lg-modal" role="dialog" aria-modal="true" aria-labelledby="lg-modal-title">
      <div class="lg-modal-icon">${ICONS.logout}</div>
      <h3 class="lg-modal-title" id="lg-modal-title">Đăng xuất</h3>
      <p class="lg-modal-text">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
      <div class="lg-modal-actions">
        <button type="button" class="lg-modal-btn lg-modal-cancel">Hủy</button>
        <button type="button" class="lg-modal-btn lg-modal-confirm">Đăng xuất</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 180);
  };

  overlay.querySelector('.lg-modal-cancel').addEventListener('click', close);
  overlay.querySelector('.lg-modal-confirm').addEventListener('click', async () => {
    overlay.querySelectorAll('button').forEach((b) => (b.disabled = true));
    await onConfirm();
    close();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  const onEsc = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onEsc);
    }
  };
  document.addEventListener('keydown', onEsc);
}

/* ---------- API công khai ---------- */
export function mountChrome(opts = {}) {
  const topbar = document.getElementById('topbar');
  if (topbar) buildTopbar(topbar, opts);

  const bottom = document.getElementById('bottom-nav');
  if (bottom) buildBottomNav(bottom, opts.active || '');

  const user = getUser();
  if (user) paintUser(user);
  checkSession().then((fresh) => {
    if (fresh) paintUser(fresh);
    else if (!user) {
      // chưa đăng nhập -> về trang auth
      window.location.replace('/src/auth.html');
    }
  });

  const logoutBtn = document.getElementById('tb-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showLogoutConfirm(async () => {
        await logout();
        window.location.replace('/src/auth.html');
      });
    });
  }
}
