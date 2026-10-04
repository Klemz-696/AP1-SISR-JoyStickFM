<?php
// Tests unitaires légers sans bootstrap WordPress complet.

define('ABSPATH', __DIR__ . '/');

if (!function_exists('wp_strip_all_tags')) {
    function wp_strip_all_tags($text) { return strip_tags((string) $text); }
}
if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($text) { return trim(strip_tags((string) $text)); }
}
if (!function_exists('home_url')) {
    function home_url($path = '/') { return 'https://joystickfm.local' . $path; }
}
if (!function_exists('wp_validate_redirect')) {
    function wp_validate_redirect($location, $default = '') {
        $host = parse_url($location, PHP_URL_HOST);
        if ($host === 'joystickfm.local') return $location;
        return $default;
    }
}
if (!function_exists('wp_get_referer')) {
    function wp_get_referer() { return $GLOBALS['__test_referer'] ?? ''; }
}

require_once dirname(__DIR__) . '/includes/class-jfm-games-utils.php';

$failures = [];

$normA = JFM_Games_Utils::normalize_username('  JoueurX  ');
$normB = JFM_Games_Utils::normalize_username('joueurx');
if ($normA !== $normB) {
    $failures[] = 'normalisation casse pseudo';
}

if (!JFM_Games_Utils::is_valid_pin('1234') || JFM_Games_Utils::is_valid_pin('12ab')) {
    $failures[] = 'validation PIN';
}

$safeLocal = JFM_Games_Utils::validate_local_return_to('/jeux/?x=1');
if ($safeLocal !== 'https://joystickfm.local/jeux/?x=1') {
    $failures[] = 'return_to local';
}

$safeExternal = JFM_Games_Utils::validate_local_return_to('https://evil.example/phish');
if ($safeExternal !== 'https://joystickfm.local/jeux/') {
    $failures[] = 'return_to externe refusé';
}

$code = JFM_Games_Utils::random_recovery_code();
if (!preg_match('/^[A-Z0-9]{6}(?:-[A-Z0-9]{6}){3}$/', $code)) {
    $failures[] = 'format code récupération';
}

$_SERVER['HTTP_ORIGIN'] = 'https://joystickfm.local';
if (!JFM_Games_Utils::is_same_origin_request()) {
    $failures[] = 'same-origin origin';
}

unset($_SERVER['HTTP_ORIGIN']);
$GLOBALS['__test_referer'] = 'https://joystickfm.local/compte/';
if (!JFM_Games_Utils::is_same_origin_request()) {
    $failures[] = 'same-origin referer';
}

$GLOBALS['__test_referer'] = 'https://evil.example/x';
if (JFM_Games_Utils::is_same_origin_request()) {
    $failures[] = 'same-origin bloque externe';
}

if ($failures) {
    fwrite(STDERR, "ECHEC TESTS:\n - " . implode("\n - ", $failures) . "\n");
    exit(1);
}

echo "OK: tests auth utilitaires passés\n";
