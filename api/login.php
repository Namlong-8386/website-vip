<?php
/**
 * POST /api/login.php
 * Body JSON: { email, password, remember }
 * Xác thực với /data/users.json, tạo session trong /data/sessions.json
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

require_post();

$in = read_input();
$email = norm_email((string)($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Email không hợp lệ', 422, 'email');
}
if ($password === '') {
    fail('Vui lòng nhập mật khẩu', 422, 'password');
}

$users = read_json(USERS_FILE);
[$idx, $user] = find_user_by_email($users, $email);

if ($idx < 0 || !password_verify($password, (string)($user['password_hash'] ?? ''))) {
    log_activity('LOGIN_FAIL', $email);
    fail('Email hoặc mật khẩu không đúng', 401, 'email');
}

// Cập nhật thông tin đăng nhập
$users[$idx]['last_login'] = date('c');
$users[$idx]['login_count'] = (int)($user['login_count'] ?? 0) + 1;
write_json(USERS_FILE, $users);

log_activity('LOGIN_OK', $email);

$session = create_session((string)$user['id'], (string)$user['username']);

json_out([
    'ok' => true,
    'message' => 'Đăng nhập thành công',
    'user' => public_user($users[$idx]),
    'token' => $session['token'],
    'expires' => $session['expires'],
]);
