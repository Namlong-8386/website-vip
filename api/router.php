<?php
/**
 * Router cho PHP built-in server.
 * Chạy: php -S 127.0.0.1:8080 -t . api/router.php
 * - /api/*.php  -> chạy PHP
 * - /data/*     -> chặn (dữ liệu nội bộ)
 * - còn lại     -> trả file tĩnh (Vite dev server hoặc dist)
 */

declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// Chặn truy cập trực tiếp thư mục dữ liệu
if (preg_match('#^/data(/|$)#', $uri)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Forbidden'], JSON_UNESCAPED_UNICODE);
    return true;
}

// API
if (preg_match('#^/api/([A-Za-z0-9_\-]+\.php)$#', $uri, $m)) {
    $file = __DIR__ . '/' . $m[1];
    if (is_file($file)) {
        require $file;
        return true;
    }
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'API không tồn tại'], JSON_UNESCAPED_UNICODE);
    return true;
}

// File tĩnh
$root = dirname(__DIR__);
$path = $root . $uri;
if ($uri !== '/' && is_file($path)) {
    return false; // để built-in server tự phục vụ
}

return false;
