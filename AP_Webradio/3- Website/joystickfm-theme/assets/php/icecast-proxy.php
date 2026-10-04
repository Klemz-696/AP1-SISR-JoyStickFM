<?php
/**
 * JOYSTICK FM — icecast-proxy.php
 * Proxy PHP pour contourner le CORS du serveur Icecast.
 * Récupère le statut JSON depuis le serveur Icecast interne
 * et retourne les données au JS du front-end.
 *
 * URL Icecast : http://10.10.10.12:8000/status-json.xsl
 * Appelé toutes les 5 secondes par radio-player.js
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

// ── Configuration ──────────────────────────────────────────────
define('ICECAST_HOST',  '10.100.0.50');
define('ICECAST_PORT',  8000);
define('ICECAST_MOUNT', '/joystick-fm');
define('ICECAST_STATUS_URL',
    'http://' . ICECAST_HOST . ':' . ICECAST_PORT . '/status-json.xsl'
);
define('FETCH_TIMEOUT', 4); // secondes

// ── Réponse de secours si le serveur est inaccessible ──────────
function offline_response(string $reason = ''): void {
    echo json_encode([
        'online'      => false,
        'listeners'   => 0,
        'title'       => '',
        'artist'      => '',
        'server_name' => 'JoyStick FM',
        'bitrate'     => 128,
        'samplerate'  => 44100,
        'error'       => $reason,
    ]);
    exit;
}

// ── Récupération du JSON Icecast ───────────────────────────────
$ctx = stream_context_create([
    'http' => [
        'method'          => 'GET',
        'timeout'         => FETCH_TIMEOUT,
        'ignore_errors'   => true,
        'user_agent'      => 'JoyStickFM-Proxy/1.0',
	'header' => "ngrok-skip-browser-warning: true\r\n"

    ]
]);

$raw = @file_get_contents(ICECAST_STATUS_URL, false, $ctx);

if ($raw === false) {
    offline_response('Icecast unreachable');
}

$data = @json_decode($raw, true);
if (!is_array($data)) {
    offline_response('Invalid JSON from Icecast');
}

// ── Extraction du point de montage ────────────────────────────
// Le JSON Icecast place les sources sous icestats.source
// Peut être un objet unique ou un tableau de sources.
$sources = $data['icestats']['source'] ?? null;

if (empty($sources)) {
    offline_response('No active source');
}

// Normalise en tableau si un seul point de montage
if (isset($sources['listenurl'])) {
    $sources = [$sources];
}

// Cherche le bon mount point
$source = null;
foreach ($sources as $s) {
    $listenUrl = $s['listenurl'] ?? '';
    if (str_contains($listenUrl, ICECAST_MOUNT)) {
        $source = $s;
        break;
    }
}

// Fallback : prend la première source si le mount n'est pas trouvé
if ($source === null) {
    $source = $sources[0] ?? null;
}

if ($source === null) {
    offline_response('Mount point not found');
}

// ── Parsing du titre (format "Artist - Title") ─────────────────
$rawTitle = trim($source['title'] ?? '');
$artist   = trim($source['artist'] ?? '');
$title    = $rawTitle;

if (empty($artist) && str_contains($rawTitle, ' - ')) {
    $parts  = explode(' - ', $rawTitle, 2);
    $artist = trim($parts[0]);
    $title  = trim($parts[1]);
}

// ── Réponse finale ─────────────────────────────────────────────
echo json_encode([
    'online'      => true,
    'listeners'   => (int)($source['listeners'] ?? 0),
    'title'       => $title,
    'artist'      => $artist,
    'server_name' => trim($source['server_name'] ?? 'JoyStick FM'),
    'bitrate'     => (int)($source['bitrate']     ?? 128),
    'samplerate'  => (int)($source['samplerate']  ?? 44100),
    'mount'       => ICECAST_MOUNT,
]);