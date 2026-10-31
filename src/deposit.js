// ===== Lumina — Trang nạp tiền =====
import { mountChrome } from './chrome.js';

mountChrome({ active: 'deposit' });

const AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];
const grid = document.getElementById('amount-grid');
const submitBtn = document.getElementById('btn-deposit');
const balanceEl = document.getElementById('balance-value');

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

// ----- Chọn mệnh giá -----
let selected = AMOUNTS[1];
grid.innerHTML = AMOUNTS.map((v) => `
  <button type="button" class="amount-chip${v === selected ? ' is-active' : ''}" data-amount="${v}">
    ${fmt(v)}
  </button>
`).join('');

grid.addEventListener('click', (e) => {
  const chip = e.target.closest('.amount-chip');
  if (!chip) return;
  selected = Number(chip.dataset.amount);
  grid.querySelectorAll('.amount-chip').forEach((c) => c.classList.toggle('is-active', c === chip));
});

// ----- Chọn phương thức -----
document.querySelectorAll('.pay-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.pay-card').forEach((c) => c.classList.toggle('is-active', c === card));
  });
});

// ----- Nạp tiền (demo, chưa nối cổng thanh toán) -----
submitBtn.addEventListener('click', () => {
  const method = document.querySelector('.pay-card.is-active')?.dataset.pay || 'bank';
  const names = { bank: 'Chuyển khoản', momo: 'MoMo', card: 'Thẻ cào' };
  showToast(`Đã tạo yêu cầu nạp ${fmt(selected)} qua ${names[method]}. Liên hệ hỗ trợ để hoàn tất.`);
  balanceEl.textContent = fmt(selected);
});
