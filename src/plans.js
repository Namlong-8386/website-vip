// ===== Lumina — Trang mua gói =====
import { mountChrome } from './chrome.js';

mountChrome({ active: 'plans' });

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 49000,
    period: '/tháng',
    accent: 'var(--cyan)',
    tag: '',
    features: ['1 tài khoản', 'Truy cập 2 cổng game', 'Hỗ trợ qua Zalo'],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 149000,
    period: '/tháng',
    accent: 'var(--yellow)',
    tag: 'PHỔ BIẾN',
    features: ['3 tài khoản', 'Truy cập tất cả cổng game', 'Hỗ trợ ưu tiên 24/7', 'Không giới hạn phiên'],
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 399000,
    period: '/tháng',
    accent: 'var(--pink)',
    tag: 'VIP',
    features: ['10 tài khoản', 'Toàn bộ tính năng Pro', 'Quản lý riêng 1-1', 'API truy cập riêng'],
  },
];

const grid = document.getElementById('plan-grid');
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

const fmt = (n) => Number(n).toLocaleString('vi-VN') + ' ₫';

grid.innerHTML = PLANS.map((p) => `
  <article class="plan-card${p.tag === 'PHỔ BIẾN' ? ' is-featured' : ''}" style="--plan-accent:${p.accent}">
    ${p.tag ? `<span class="plan-tag">${p.tag}</span>` : ''}
    <h3 class="plan-name">${p.name}</h3>
    <p class="plan-price">${fmt(p.price)}<span class="plan-period">${p.period}</span></p>
    <ul class="plan-features">
      ${p.features.map((f) => `<li>${f}</li>`).join('')}
    </ul>
    <button type="button" class="lp-btn lp-btn-yellow plan-btn" data-plan="${p.id}">Chọn gói này →</button>
  </article>
`).join('');

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.plan-btn');
  if (!btn) return;
  const plan = PLANS.find((p) => p.id === btn.dataset.plan);
  showToast(`Đã chọn gói ${plan.name} (${fmt(plan.price)}). Chuyển sang trang nạp tiền để thanh toán.`);
  setTimeout(() => { window.location.href = '/src/deposit.html'; }, 1200);
});
