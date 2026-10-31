// ===== Lumina — Support Page =====
document.addEventListener('DOMContentLoaded', () => {
  initStatus();
  initFAQ();
  initCopyButtons();
  initFeedbackForm();
  initSmoothScroll();
});

// ----- Trạng thái trực tuyến (GMT+7, T2-T5 8h-18h) -----
function initStatus() {
  const dot = document.getElementById('sup-status-dot');
  const text = document.getElementById('sup-status-text');
  if (!dot || !text) return;

  const update = () => {
    // Giờ hiện tại theo múi giờ GMT+7 (Việt Nam)
    const vnNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const day = vnNow.getDay();   // 0 = CN, 6 = T7
    const hour = vnNow.getHours();
    const isWorkday = day >= 1 && day <= 5;
    const inHours = hour >= 8 && hour < 18;
    const online = isWorkday && inHours;

    dot.classList.toggle('online', online);
    dot.classList.toggle('offline', !online);
    text.textContent = online
      ? 'Đang trực tuyến — phản hồi ngay'
      : 'Ngoài giờ — sẽ phản hồi sớm nhất có thể';
  };

  update();
  setInterval(update, 60_000); // cập nhật mỗi phút
}

// ----- FAQ accordion (chỉ mở 1 mục) -----
function initFAQ() {
  const items = document.querySelectorAll('.sup-faq-item');
  items.forEach((item) => {
    const btn = item.querySelector('.sup-faq-q');
    const answer = item.querySelector('.sup-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Đóng tất cả
      items.forEach((it) => {
        it.classList.remove('open');
        const b = it.querySelector('.sup-faq-q');
        const a = it.querySelector('.sup-faq-a');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = null;
      });

      // Mở mục vừa bấm (nếu trước đó đang đóng)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ----- Nút sao chép -----
function initCopyButtons() {
  document.querySelectorAll('.sup-copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('Đã sao chép: ' + text);
        flashButton(btn, 'Đã sao chép ✓');
      } catch {
        showToast('Không thể sao chép, vui lòng thử lại', 'error');
      }
    });
  });
}

function flashButton(btn, label) {
  const labelEl = btn.querySelector('.sup-copy-label');
  if (!labelEl) return;
  const original = labelEl.textContent;
  labelEl.textContent = label;
  btn.classList.add('copied');
  setTimeout(() => {
    labelEl.textContent = original;
    btn.classList.remove('copied');
  }, 1600);
}

// ----- Form phản hồi -----
function initFeedbackForm() {
  const form = document.getElementById('sup-form');
  if (!form) return;

  const name = form.querySelector('#sup-name');
  const email = form.querySelector('#sup-email');
  const message = form.querySelector('#sup-message');
  const submitBtn = document.getElementById('sup-submit');

  // Xóa lỗi khi người dùng nhập lại
  [name, email, message].forEach((field) => {
    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    if (!name.value.trim()) { setError(name, 'Vui lòng nhập họ tên'); valid = false; }
    if (!emailOk(email.value)) { setError(email, 'Email không hợp lệ'); valid = false; }
    if (message.value.trim().length < 10) { setError(message, 'Nội dung tối thiểu 10 ký tự'); valid = false; }
    if (!valid) return;

    // Giả lập gửi
    submitBtn.classList.add('loading');
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      form.reset();
      showToast('Gửi thành công! Chúng tôi sẽ phản hồi sớm nhất');
    }, 1200);
  });
}

function emailOk(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function setError(field, msg) {
  const err = document.querySelector(`[data-error-for="${field.id}"]`);
  if (err) err.textContent = msg;
  field.classList.add('invalid');
}

function clearError(field) {
  const err = document.querySelector(`[data-error-for="${field.id}"]`);
  if (err) err.textContent = '';
  field.classList.remove('invalid');
}

// ----- Smooth scroll cho anchor nội bộ -----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ----- Toast -----
function showToast(msg, type = 'success') {
  let container = document.getElementById('sup-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sup-toasts';
    container.className = 'sup-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'sup-toast sup-toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}
