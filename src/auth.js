// ===== Lumina — Auth (Neo-Brutalism) =====
import { api, saveSession, checkSession } from './api-client.js';

const REDIRECT_TO = '/src/home.html';

const tabs = document.querySelectorAll('.tab');
const panels = {
  login: document.getElementById('panel-login'),
  register: document.getElementById('panel-register'),
};
const greeting = document.getElementById('greeting');
const greetings = {
  login: 'Chào mừng trở lại 👋',
  register: 'Tạo tài khoản mới ✨',
};

// ----- Đổi tab -----
function switchTab(name) {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  panels.login.classList.toggle('active', name === 'login');
  panels.register.classList.toggle('active', name === 'register');
  greeting.textContent = greetings[name];
}
tabs.forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

// ----- Khởi tạo tab từ URL (?tab=login|register) -----
(function initTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && panels[tab]) {
    switchTab(tab);
  }
})();

// ----- Toast -----
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer;
function showToast(msg, type = 'success') {
  toastMsg.textContent = msg;
  toast.classList.toggle('warn', type === 'warn');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ----- Hiện/ẩn mật khẩu -----
document.querySelectorAll('.eye').forEach((btn) => {
  btn.addEventListener('click', () => {
    // Tìm input trong cùng cấp hoặc parent
    const input = btn.parentElement?.querySelector('input') ||
                  btn.previousElementSibling;
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.classList.toggle('visible', show);
    // Đặt cursorfocus lại nếu cần
    if (show) input.select();
  });
});

// ----- Strength meter -----
const strength = document.getElementById('strength');
const strengthText = document.getElementById('strength-text');
const levels = ['', 'Rất yếu', 'Yếu', 'Khá tốt', 'Mạnh 💪'];

function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(1, s);
}

function updateStrength(pw) {
  const score = scorePassword(pw);
  strength.dataset.level = String(score);
  strengthText.textContent = pw ? 'Mật khẩu: ' + levels[score] : '';
}

document.getElementById('register-password').addEventListener('input', (e) => {
  updateStrength(e.target.value);
});

// ----- Validation -----
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function setFieldError(input, msg) {
  const field = input.closest('.field');
  field.classList.add('invalid');
  field.querySelector('.error').textContent = msg;
}

function clearFieldError(input) {
  const field = input.closest('.field');
  field.classList.remove('invalid');
}

document.querySelectorAll('.field input').forEach((input) => {
  input.addEventListener('input', () => clearFieldError(input));
});

// ----- Gửi form: gọi PHP API thật -----
async function submitForm(form, path, payload, successMsg) {
  const btn = form.querySelector('.btn-primary');
  btn.classList.add('loading');
  const res = await api(path, payload);
  btn.classList.remove('loading');

  if (!res.ok) {
    const err = res.data || {};
    if (err.field) {
      const input = form.querySelector('[id$="-' + err.field + '"], #' + form.id.split('-')[0] + '-' + err.field);
      if (input) setFieldError(input, err.error || 'Dữ liệu không hợp lệ');
    }
    showToast(err.error || 'Có lỗi xảy ra, thử lại sau', 'warn');
    return;
  }

  saveSession(res.data.token, res.data.user);
  showToast(successMsg);
  form.reset();
  if (form.id === 'register-form') updateStrength('');

  // Hiện overlay chuyển trang
  const pt = document.getElementById('page-transition');
  if (pt) pt.classList.add('pt-active');

  setTimeout(() => {
    window.location.href = REDIRECT_TO;
  }, 900);
}

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  if (!emailOk(loginEmail.value)) {
    setFieldError(loginEmail, 'Email không hợp lệ');
    ok = false;
  }
  if (loginPassword.value.length < 6) {
    setFieldError(loginPassword, 'Mật khẩu tối thiểu 6 ký tự');
    ok = false;
  }
  if (!ok) return;
  submitForm(loginForm, 'login.php', {
    email: loginEmail.value.trim(),
    password: loginPassword.value,
    remember: document.getElementById('remember')?.checked || false,
  }, 'Đăng nhập thành công! Đang chuyển trang…');
});

const registerForm = document.getElementById('register-form');
const regUsername = document.getElementById('register-username');
const regEmail = document.getElementById('register-email');
const regPassword = document.getElementById('register-password');
const regConfirm = document.getElementById('register-confirm');
const termsBox = document.getElementById('terms');

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  if (regUsername.value.trim().length < 2) {
    setFieldError(regUsername, 'Vui lòng nhập tên đăng nhập (tối thiểu 2 ký tự)');
    ok = false;
  }
  if (!emailOk(regEmail.value)) {
    setFieldError(regEmail, 'Email không hợp lệ');
    ok = false;
  }
  if (regPassword.value.length < 6) {
    setFieldError(regPassword, 'Mật khẩu tối thiểu 6 ký tự');
    ok = false;
  }
  if (regConfirm.value !== regPassword.value || !regConfirm.value) {
    setFieldError(regConfirm, 'Mật khẩu không khớp');
    ok = false;
  }
  if (!termsBox.checked) {
    showToast('Vui lòng đồng ý với điều khoản', 'warn');
    return;
  }
  if (!ok) return;
  submitForm(registerForm, 'register.php', {
    username: regUsername.value.trim(),
    email: regEmail.value.trim(),
    password: regPassword.value,
    confirm: regConfirm.value,
  }, 'Tạo tài khoản thành công! Đang chuyển trang…');
});

// ----- Nút social — đang bảo trì -----
document.querySelectorAll('.btn-social').forEach((btn) => {
  btn.addEventListener('click', () => {
    showToast(btn.dataset.provider + ' đang bảo trì, vui lòng thử lại sau!', 'warn');
  });
});

// ----- Đã đăng nhập rồi thì vào thẳng trang chủ -----
checkSession().then((user) => {
  if (user) window.location.replace(REDIRECT_TO);
});