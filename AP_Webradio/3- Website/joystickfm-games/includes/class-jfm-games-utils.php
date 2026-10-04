<?php
if (!defined('ABSPATH')) {
    exit;
}

final class JFM_Games_Utils
{
    public const USERNAME_MAX = 30;
    public const PIN_MIN = 4;
    public const PIN_MAX = 12;

    public static function normalize_username(string $username): string
    {
        $value = trim(wp_strip_all_tags($username));
        $value = preg_replace('/\s+/u', ' ', $value ?? '');
        $value = mb_substr($value ?? '', 0, self::USERNAME_MAX);
        return mb_strtolower($value, 'UTF-8');
    }

    public static function clean_username_display(string $username): string
    {
        $value = trim(sanitize_text_field($username));
        $value = preg_replace('/\s+/u', ' ', $value ?? '');
        $value = mb_substr($value ?? '', 0, self::USERNAME_MAX);
        return $value;
    }

    public static function is_valid_pin(string $pin): bool
    {
        $len = strlen($pin);
        if ($len < self::PIN_MIN || $len > self::PIN_MAX) {
            return false;
        }
        return preg_match('/^[0-9]+$/', $pin) === 1;
    }

    public static function validate_local_return_to(?string $returnTo): string
    {
        $returnTo = trim((string) $returnTo);
        if ($returnTo === '') {
            return home_url('/jeux/');
        }

        if (preg_match('#^https?://#i', $returnTo)) {
            $validated = wp_validate_redirect($returnTo, '');
            if ($validated === '') {
                return home_url('/jeux/');
            }
            $homeHost = parse_url(home_url('/'), PHP_URL_HOST);
            $destHost = parse_url($validated, PHP_URL_HOST);
            if (!$homeHost || !$destHost || strtolower($homeHost) !== strtolower($destHost)) {
                return home_url('/jeux/');
            }
            return $validated;
        }

        if ($returnTo[0] !== '/') {
            $returnTo = '/' . ltrim($returnTo, '/');
        }

        if (strpos($returnTo, '//') === 0) {
            return home_url('/jeux/');
        }

        return home_url($returnTo);
    }

    public static function mask_recovery_code(string $code): string
    {
        if (strlen($code) <= 8) {
            return str_repeat('*', strlen($code));
        }

        return substr($code, 0, 4) . str_repeat('*', max(0, strlen($code) - 8)) . substr($code, -4);
    }

    public static function random_recovery_code(): string
    {
        $raw = rtrim(strtr(base64_encode(random_bytes(18)), '+/', 'AB'), '=');
        return strtoupper(implode('-', str_split(substr($raw, 0, 24), 6)));
    }

    public static function is_same_origin_request(): bool
    {
        $homeHost = parse_url(home_url('/'), PHP_URL_HOST);
        if (!$homeHost) {
            return false;
        }

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '') {
            $originHost = parse_url($origin, PHP_URL_HOST);
            return is_string($originHost) && strtolower($originHost) === strtolower($homeHost);
        }

        $referer = wp_get_referer();
        if (!$referer) {
            return false;
        }

        $refererHost = parse_url($referer, PHP_URL_HOST);
        return is_string($refererHost) && strtolower($refererHost) === strtolower($homeHost);
    }
}
