<?php
/**
 * JOYSTICK FM — stream-proxy.php
 * Proxy PHP pour relayer le flux audio Icecast sans CORS.
 *
 * Le navigateur appelle ce fichier sur la même origine (10.10.10.11),
 * PHP récupère le flux binaire depuis Icecast (10.10.10.12:8000)
 * et le retransmet byte par byte → pas de blocage CORS.
 *
 * Placer dans : joystickfm/assets/php/stream-proxy.php
 */

/* ── Sécurité : aucun output tamponné, exécution longue autorisée ── */
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', false);
set_time_limit(0);
ignore_user_abort(false);

/* ── Configuration ── */
define('ICECAST_STREAM_URL', 'http://10.100.0.50:8000/joystick-fm');
define('CHUNK_SIZE', 8192); // 8 Ko par chunk

/* ── Headers CORS + audio ── */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: audio/mpeg');
header('Cache-Control: no-cache, no-store');
header('X-Accel-Buffering: no'); // Désactive le buffering Nginx si présent
header('Connection: keep-alive');

/* ── Réponse OPTIONS (preflight CORS) ── */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ── Ouverture du flux Icecast ── */
$context = stream_context_create([
    'http' => [
        'method'          => 'GET',
        'timeout'         => 10,
        'ignore_errors'   => true,
        'user_agent'      => 'JoyStickFM-StreamProxy/1.0',
        'header'          => [
            'Icy-MetaData: 0', // Pas de métadonnées ICY dans ce flux proxy
        ],
    ],
]);

$stream = @fopen(ICECAST_STREAM_URL, 'rb', false, $context);

if (!$stream) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Flux Icecast inaccessible', 'url' => ICECAST_STREAM_URL]);
    exit;
}

/* ── Relais du flux en streaming ── */
while (!feof($stream) && !connection_aborted()) {
    $chunk = fread($stream, CHUNK_SIZE);
    if ($chunk === false || $chunk === '') break;
    echo $chunk;
    flush();
    if (function_exists('ob_flush')) {
        @ob_flush();
    }
}

fclose($stream);
