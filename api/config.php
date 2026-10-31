<?php
/**
 * Cấu hình chung cho API.
 * Dữ liệu được lưu dạng JSON trong thư mục /data
 */

declare(strict_types=1);

const DATA_DIR = __DIR__ . '/../data';
const USERS_FILE = DATA_DIR . '/users.json';
const SESSIONS_FILE = DATA_DIR . '/sessions.json';
const LOG_FILE = DATA_DIR . '/activity.log';

/** Trả JSON rồi dừng */
function json_out(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Lỗi chuẩn hoá */
function fail(string $message, int $status = 400, string $field = ''): void
{
    json_out(['ok' => false, 'error' => $message, 'field' => $field], $status);
}

/** Chỉ cho phép POST */
function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        fail('Chỉ hỗ trợ phương thức POST', 405);
    }
}

/** Đọc body JSON hoặc form-urlencoded */
function read_input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = $_POST;
    }
    return is_array($data) ? $data : [];
}

/** Đảm bảo thư mục data tồn tại */
function ensure_data_dir(): void
{
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0775, true);
    }
}

/** Đọc file JSON an toàn -> mảng */
function read_json(string $file): array
{
    ensure_data_dir();
    if (!is_file($file)) {
        return [];
    }
    $raw = @file_get_contents($file);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Ghi file JSON an toàn (lock + ghi tạm rồi rename) */
function write_json(string $file, array $data): bool
{
    ensure_data_dir();
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }
    $tmp = $file . '.tmp';
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
        return false;
    }
    return @rename($tmp, $file);
}

/** Ghi log hoạt động (không chứa mật khẩu) */
function log_activity(string $action, string $detail = ''): void
{
    ensure_data_dir();
    $line = sprintf(
        "[%s] %s %s | %s | %s\n",
        date('Y-m-d H:i:s'),
        $action,
        $detail,
        $_SERVER['REMOTE_ADDR'] ?? '-',
        substr($_SERVER['HTTP_USER_AGENT'] ?? '-', 0, 120)
    );
    @file_put_contents(LOG_FILE, $line, FILE_APPEND | LOCK_EX);
}

/** Chuẩn hoá email */
function norm_email(string $email): string
{
    return mb_strtolower(trim($email));
}

/** Sinh id ngẫu nhiên */
function new_id(): string
{
    return bin2hex(random_bytes(8));
}

/** Tìm user theo email (trả về [index, user]) */
function find_user_by_email(array $users, string $email): array
{
    $email = norm_email($email);
    foreach ($users as $i => $u) {
        if (norm_email((string)($u['email'] ?? '')) === $email) {
            return [$i, $u];
        }
    }
    return [-1, []];
}

/** Bỏ các trường nhạy cảm trước khi trả về client */
function public_user(array $user): array
{
    unset($user['password_hash']);
    return $user;
}

/** Đọc/ghi sessions */
function load_sessions(): array
{
    return read_json(SESSIONS_FILE);
}

function save_sessions(array $sessions): void
{
    write_json(SESSIONS_FILE, $sessions);
}

function new_token(): string
{
    return bin2hex(random_bytes(24));
}

/** Tạo session mới cho user, trả về token */
function create_session(string $userId, string $username): array
{
    $sessions = load_sessions();
    // Dọn session hết hạn
    $now = time();
    foreach ($sessions as $token => $s) {
        if (($s['expires'] ?? 0) < $now) {
            unset($sessions[$token]);
        }
    }
    $token = new_token();
    $sessions[$token] = [
        'user_id' => $userId,
        'username' => $username,
        'created' => $now,
        'expires' => $now + 60 * 60 * 24 * 30,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '-',
    ];
    save_sessions($sessions);
    return ['token' => $token, 'expires' => $sessions[$token]['expires']];
}
