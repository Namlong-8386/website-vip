<?php
/**
 * POST /api/register.php
 * Body JSON: { username, email, password, confirm }
 * Lưu user vào /data/users.json
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

require_post();

$in = read_input();
$username = trim((string)($in['username'] ?? ''));
$email = norm_email((string)($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');
$confirm = (string)($in['confirm'] ?? '');

// ---- Validate ----
if (mb_strlen($username) < 2) {
    fail('Tên đăng nhập tối thiểu 2 ký tự', 422, 'username');
}
if (mb_strlen($username) > 24) {
    fail('Tên đăng nhập tối đa 24 ký tự', 422, 'username');
}
if (!preg_match('/^[\p{L}\p{N}_.\- ]+$/u', $username)) {
    fail('Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới', 422, 'username');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Email không hợp lệ', 422, 'email');
}
if (mb_strlen($password) < 6) {
    fail('Mật khẩu tối thiểu 6 ký tự', 422, 'password');
}
if ($password !== $confirm) {
    fail('Mật khẩu xác nhận không khớp', 422, 'confirm');
}

// ---- Kiểm tra trùng ----
$users = read_json(USERS_FILE);

[$idx, $existing] = find_user_by_email($users, $email);
if ($idx >= 0) {
    fail('Email này đã được đăng ký', 409, 'email');
}
foreach ($users as $u) {
    if (mb_strtolower((string)($u['username'] ?? '')) === mb_strtolower($username)) {
        fail('Tên đăng nhập đã tồn tại', 409, 'username');
    }
}

// ---- Tạo user ----
$user = [
    'id' => new_id(),
    'username' => $username,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'role' => 'user',
    'created_at' => date('c'),
    'updated_at' => date('c'),
    'last_login' => null,
    'login_count' => 0,
];

$users[] = $user;
if (!write_json(USERS_FILE, $users)) {
    fail('Không ghi được dữ liệu, thử lại sau', 500);
}

log_activity('REGISTER', $email);

// Tự đăng nhập sau khi đăng ký
$session = create_session($user['id'], $user['username']);

json_out([
    'ok' => true,
    'message' => 'Tạo tài khoản thành công',
    'user' => public_user($user),
    'token' => $session['token'],
    'expires' => $session['expires'],
], 201);
