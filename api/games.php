<?php
/**
 * GET /api/games.php
 * Danh sách game cho trang chủ. Đọc /data/games.json, nếu chưa có thì tạo seed.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

const GAMES_FILE = DATA_DIR . '/games.json';

/** Dữ liệu mặc định */
function default_games(): array
{
    return [
        [
            'id' => 'sunwin',
            'name' => 'Sunwin',
            'tagline' => 'Cổng game quốc tế',
            'logo' => '/src/image/sunwin.png',
            'accent' => '#FFD600',
            'url' => 'https://sunwin.example.com',
            'badge' => 'HOT',
            'players' => 128400,
        ],
        [
            'id' => 'lc79',
            'name' => 'LC79',
            'tagline' => 'Đổi thưởng đẳng cấp',
            'logo' => '/src/image/lc79.png',
            'accent' => '#7DE2D1',
            'url' => 'https://lc79.example.com',
            'badge' => 'NEW',
            'players' => 76300,
        ],
        [
            'id' => 'hitclub',
            'name' => 'HitClub',
            'tagline' => 'Game bài đỉnh cao',
            'logo' => '/src/image/hitclub.png',
            'accent' => '#FF9DBB',
            'url' => 'https://hitclub.example.com',
            'badge' => '',
            'players' => 51200,
        ],
        [
            'id' => 'b52',
            'name' => 'B52',
            'tagline' => 'Bắn cá & nổ hũ',
            'logo' => '/src/image/b52.png',
            'accent' => '#B79CFF',
            'url' => 'https://b52.example.com',
            'badge' => '',
            'players' => 48900,
        ],
        [
            'id' => '68gb',
            'name' => '68GB',
            'tagline' => 'Kho game khổng lồ',
            'logo' => '/src/image/68gb.png',
            'accent' => '#8CFFB4',
            'url' => 'https://68gb.example.com',
            'badge' => 'TOP',
            'players' => 39500,
        ],
    ];
}

$games = read_json(GAMES_FILE);

if (!$games) {
    $games = default_games();
    write_json(GAMES_FILE, $games);
}

json_out(['ok' => true, 'games' => $games]);
