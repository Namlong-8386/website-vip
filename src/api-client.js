// ===== Lumina — API client + session =====
const TOKEN_KEY = 'lumina_token';
const USER_KEY = 'lumina_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Gọi API, trả về { ok, data } */
export async function api(path, payload) {
  try {
    const res = await fetch('/api/' + path, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? { 'Content-Type': 'application/json' } : {},
      body: payload ? JSON.stringify(payload) : undefined,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: 'Máy chủ trả về dữ liệu không hợp lệ' };
    }
    return { ok: res.ok && data.ok !== false, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { ok: false, error: 'Không kết nối được máy chủ API (PHP)' },
    };
  }
}

/** Kiểm tra phiên đăng nhập, trả về user hoặc null */
export async function checkSession() {
  const token = getToken();
  if (!token) return null;
  const { ok, data } = await api('me.php?token=' + encodeURIComponent(token));
  if (ok && data.user) {
    saveSession(token, data.user);
    return data.user;
  }
  clearSession();
  return null;
}

export async function logout() {
  const token = getToken();
  if (token) await api('logout.php', { token });
  clearSession();
}
