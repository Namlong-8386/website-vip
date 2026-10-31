<?php
/**
 * POST /api/logout.php
 * Body JSON: { token }
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

require_post();

$in = read_input();
$token = (string)($in['token'] ?? '');

$sessions = load_sessions();
if ($token !== '' && isset($sessions[$token])) {
    unset($sessions[$token]);
    save_sessions($sessions);
    log_activity('LOGOUT', '');
}

json_out(['ok' => true, 'message' => 'Đã đăng xuất']);
