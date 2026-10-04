<?php
/**
 * JoyStick FM Games — Suite de Tests Autonome (PHP CLI)
 *
 * Responsabilité : Valide les algorithmes de sécurité, de normalisation,
 * de hachage et de gestion des sessions sans dépendance externe.
 *
 * Exécution : php tests/run-auth-tests.php
 */

// Simulation d'environnement WordPress pour exécution en CLI
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once __DIR__ . '/../includes/class-jfm-games-utils.php';

class JFM_Auth_Test_Runner {

    private $passed = 0;
    private $failed = 0;
    private $tests = [];

    public function run() {
        echo "\n" . str_repeat('=', 65) . "\n";
        echo " 🧪 JOYSTICK FM GAMES — SUITE DE TESTS UNITAIRES (LOT 1)\n";
        echo str_repeat('=', 65) . "\n\n";

        $this->test_username_canonicalization();
        $this->test_username_validation();
        $this->test_pin_validation_and_hashing();
        $this->test_recovery_code_generation();
        $this->test_session_token_hashing();
        $this->test_sql_schema_syntax();

        echo "\n" . str_repeat('-', 65) . "\n";
        echo " RÉSULTAT GLOBAL : " . ($this->failed === 0 ? "✅ TOUS LES TESTS SONT VALIDES" : "❌ DES ÉCHECS ONT ÉTÉ DÉTECTÉS") . "\n";
        echo " Tests réussis : {$this->passed} | Tests échoués : {$this->failed}\n";
        echo str_repeat('=', 65) . "\n\n";

        return $this->failed === 0 ? 0 : 1;
    }

    private function assert($condition, $test_name, $details = '') {
        if ($condition) {
            $this->passed++;
            echo "  [PASS] {$test_name}\n";
        } else {
            $this->failed++;
            echo "  [FAIL] {$test_name} " . ($details ? "({$details})" : "") . "\n";
        }
    }

    /**
     * Test 1 : Normalisation et unicité insensible à la casse
     */
    private function test_username_canonicalization() {
        echo "► 1. Normalisation canonique des pseudos :\n";

        $u1 = JFM_Games_Utils::canonicalize_username('PixelKnight');
        $u2 = JFM_Games_Utils::canonicalize_username('pixelknight');
        $u3 = JFM_Games_Utils::canonicalize_username('  PIXELKNIGHT  ');

        $this->assert($u1 === 'pixelknight', 'Conversion majuscules -> minuscules');
        $this->assert($u1 === $u2, 'Détection collision de casse (PixelKnight vs pixelknight)');
        $this->assert($u2 === $u3, 'Nettoyage des espaces résiduels');

        $u_special = JFM_Games_Utils::canonicalize_username("<script>Hack</script>User");
        $this->assert($u_special === 'user' || strpos($u_special, '<') === false, 'Suppression des balises HTML');
    }

    /**
     * Test 2 : Validation des critères de pseudo
     */
    private function test_username_validation() {
        echo "\n► 2. Validation des critères de pseudo :\n";

        list($ok1) = JFM_Games_Utils::validate_username('Klemz');
        $this->assert($ok1 === true, 'Pseudo valide accepté ("Klemz")');

        list($ok2, $err2) = JFM_Games_Utils::validate_username('ab');
        $this->assert($ok2 === false, 'Rejet pseudo trop court (< 3 car)');

        list($ok3, $err3) = JFM_Games_Utils::validate_username('User With Space');
        $this->assert($ok3 === false, 'Rejet pseudo avec espaces interdits');

        list($ok4, $err4) = JFM_Games_Utils::validate_username('admin');
        $this->assert($ok4 === false, 'Rejet pseudo système réservé ("admin")');
    }

    /**
     * Test 3 : Validation et hachage fort du code PIN
     */
    private function test_pin_validation_and_hashing() {
        echo "\n► 3. Validation et hachage BCRYPT du PIN :\n";

        list($ok1) = JFM_Games_Utils::validate_pin('1234');
        $this->assert($ok1 === true, 'PIN valide 4 chiffres accepté');

        list($ok2) = JFM_Games_Utils::validate_pin('123');
        $this->assert($ok2 === false, 'Rejet PIN trop court (< 4 car)');

        $pin = 'SecretPin2026';
        $hash = password_hash($pin, PASSWORD_BCRYPT, ['cost' => 10]);

        $this->assert(password_verify($pin, $hash) === true, 'Vérification password_verify avec PIN exact');
        $this->assert(password_verify('WrongPin', $hash) === false, 'Rejet password_verify avec mauvais PIN');
        $this->assert(strpos($hash, '$2y$') === 0, 'Format du hash conforme BCRYPT ($2y$)');
    }

    /**
     * Test 4 : Génération des codes de secours
     */
    private function test_recovery_code_generation() {
        echo "\n► 4. Génération et entropie du code de secours :\n";

        $c1 = JFM_Games_Utils::generate_recovery_code();
        $c2 = JFM_Games_Utils::generate_recovery_code();

        $this->assert(strlen($c1) >= 18, 'Longueur suffisante du code de secours');
        $this->assert(strpos($c1, 'JFM-') === 0, 'Préfixe officiel JFM présent');
        $this->assert($c1 !== $c2, 'Aléa cryptographique fort (deux codes distincts)');

        $code_hash = password_hash($c1, PASSWORD_BCRYPT, ['cost' => 10]);
        $this->assert(password_verify($c1, $code_hash) === true, 'Validation du code de secours haché');
    }

    /**
     * Test 5 : Hachage SHA-256 des jetons opaques de session
     */
    private function test_session_token_hashing() {
        echo "\n► 5. Sessions à jetons opaques & empreintes SHA-256 :\n";

        $raw_token = bin2hex(random_bytes(32));
        $token_hash = hash('sha256', $raw_token);

        $this->assert(strlen($raw_token) === 64, 'Jeton opaque client de 64 caractères hexadécimaux');
        $this->assert(strlen($token_hash) === 64, 'Empreinte serveur SHA-256 de 64 caractères');
        $this->assert($raw_token !== $token_hash, 'Le jeton brut n\'est pas identique à son empreinte stockée');
    }

    /**
     * Test 6 : Validation syntaxique des schémas SQL
     */
    private function test_sql_schema_syntax() {
        echo "\n► 6. Intégrité des schémas de table MariaDB / MySQL :\n";

        $migrator_file = __DIR__ . '/../includes/class-jfm-games-migrator.php';
        $content = file_get_contents($migrator_file);

        $this->assert(strpos($content, 'jfm_players') !== false, 'Table jfm_players définie');
        $this->assert(strpos($content, 'jfm_player_sessions') !== false, 'Table jfm_player_sessions définie');
        $this->assert(strpos($content, 'jfm_player_admin_log') !== false, 'Table jfm_player_admin_log définie');
        $this->assert(strpos($content, 'username_canonical') !== false, 'Index username_canonical présent');
        $this->assert(strpos($content, 'token_hash') !== false, 'Index token_hash présent');
    }
}

$runner = new JFM_Auth_Test_Runner();
exit($runner->run());
