<?php
/**
 * GET /api/me.php?token=...
 * Kiểm tra session còn hiệu lực, trả về user hiện tại
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

$token = (string)($_GET['token'] ?? ($_SERVER['HTTP_X_AUTH_TOKEN'] ?? ''));
if ($token === '') {
    fail('Thiếu token', 401);
}

$sessions = load_sessions();
$session = $sessions[$token] ?? null;

if (!$session || ($session['expires'] ?? 0) < time()) {
    if ($session) {
        unset($sessions[$token]);
        save_sessions($sessions);
    }
    fail('Phiên đăng nhập đã hết hạn', 401);
}

$users = read_json(USERS_FILE);
foreach ($users as $u) {
    if (($u['id'] ?? '') === $session['user_id']) {
        json_out([
            'ok' => true,
            'user' => public_user($u),
            'expires' => $session['expires'],
        ]);
    }
}

fail('Không tìm thấy tài khoản', 404);
