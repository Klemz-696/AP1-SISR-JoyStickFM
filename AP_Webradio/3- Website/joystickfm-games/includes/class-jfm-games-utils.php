<?php
/**
 * JoyStick FM Games — Utilitaires, Sécurité & Sanitisation
 *
 * Responsabilité : Normalisation des pseudos, validation des PINs,
 * génération des secrets de secours, limitation de débit et contrôles CSRF.
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_Utils {

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 900; // 15 minutes en secondes

    /**
     * Normalise un pseudo pour l'unicité canonique
     *
     * @param string $username
     * @return string
     */
    public static function canonicalize_username($username) {
        $clean = trim((string)$username);
        $clean = strip_tags($clean);
        $clean = preg_replace('/[\x00-\x1F\x7F]/u', '', $clean);
        if (function_exists('mb_strtolower')) {
            return mb_strtolower($clean, 'UTF-8');
        }
        return strtolower($clean);
    }

    /**
     * Valide le format d'un pseudo (affichage et canonique)
     *
     * @param string $username
     * @return array [bool $valid, string $error]
     */
    public static function validate_username($username) {
        $canonical = self::canonicalize_username($username);
        $len = function_exists('mb_strlen') ? mb_strlen($canonical, 'UTF-8') : strlen($canonical);

        if ($len < 3) {
            return [false, 'Le pseudo doit comporter au moins 3 caractères.'];
        }
        if ($len > 30) {
            return [false, 'Le pseudo ne peut pas dépasser 30 caractères.'];
        }
        if (!preg_match('/^[a-z0-9_.\-]+$/u', $canonical)) {
            return [false, 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et points.'];
        }
        // Interdiction des pseudos réservés
        $reserved = ['admin', 'administrator', 'root', 'moderateur', 'invite', 'anonyme', 'systeme'];
        if (in_array($canonical, $reserved, true)) {
            return [false, 'Ce pseudo est réservé au système.'];
        }

        return [true, ''];
    }

    /**
     * Valide la robustesse d'un PIN joueur
     *
     * @param string $pin
     * @return array [bool $valid, string $error]
     */
    public static function validate_pin($pin) {
        $pin = trim((string)$pin);
        $len = strlen($pin);

        if ($len < 4) {
            return [false, 'Le code PIN doit comporter au moins 4 caractères ou chiffres.'];
        }
        if ($len > 16) {
            return [false, 'Le code PIN ne peut pas dépasser 16 caractères.'];
        }

        return [true, ''];
    }

    /**
     * Génère un code de secours fort et lisible (ex: JFM-A8K2-9XP4-M7Q1)
     *
     * @return string
     */
    public static function generate_recovery_code() {
        $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sans caractères ambigus (0, O, 1, I)
        $code = 'JFM';
        for ($group = 0; $group < 3; $group++) {
            $chunk = '';
            for ($i = 0; $i < 4; $i++) {
                $idx = random_int(0, strlen($chars) - 1);
                $chunk .= $chars[$idx];
            }
            $code .= '-' . $chunk;
        }
        return $code;
    }

    /**
     * Détecte l'adresse IP cliente de manière sécurisée
     *
     * @return string
     */
    public static function get_client_ip() {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        if (!empty($_SERVER['REMOTE_ADDR']) && filter_var($_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP)) {
            return $_SERVER['REMOTE_ADDR'];
        }
        return '127.0.0.1';
    }

    /**
     * Contrôle et incrémente la limitation de débit (anti force-brute)
     *
     * @param string $action Ex: 'login'
     * @param string $identifier IP ou Pseudo
     * @return bool True si autorisé, False si bloqué
     */
    public static function check_rate_limit($action, $identifier) {
        $key = 'jfm_rl_' . $action . '_' . md5($identifier);
        $attempts = (int)get_transient($key);

        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            return false;
        }

        set_transient($key, $attempts + 1, self::LOCKOUT_DURATION);
        return true;
    }

    /**
     * Réinitialise le compteur de limitation de débit après succès
     *
     * @param string $action
     * @param string $identifier
     */
    public static function clear_rate_limit($action, $identifier) {
        $key = 'jfm_rl_' . $action . '_' . md5($identifier);
        delete_transient($key);
    }

    /**
     * Vérifie si la connexion actuelle est sécurisée (HTTPS ou dérogation autorisée)
     *
     * @return bool
     */
    public static function is_ssl_secure() {
        if (is_ssl()) {
            return true;
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
            return true;
        }
        return false;
    }
}
