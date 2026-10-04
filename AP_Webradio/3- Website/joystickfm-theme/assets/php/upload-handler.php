<?php
/**
 * JoyStick FM — upload-handler.php
 * Gestion de l'upload des images et GIFs du chat.
 */
defined('ABSPATH') || exit;

add_action('wp_ajax_jfm_chat_upload', 'jfm_chat_upload');
add_action('wp_ajax_nopriv_jfm_chat_upload', 'jfm_chat_upload');

function jfm_chat_upload()
{
    check_ajax_referer('jfm_chat_nonce', 'nonce');

    if (empty($_FILES['chatfile']['tmp_name'])) {
        wp_send_json_error(['message' => 'Aucun fichier reçu.'], 400);
    }

    $file = $_FILES['chatfile'];

    // Vérification des erreurs PHP de base
    if ($file['error'] !== UPLOAD_ERR_OK) {
        wp_send_json_error(['message' => 'Erreur de téléchargement : Code ' . $file['error']], 500);
    }

    $max_size = 4 * 1024 * 1024; // 4 Mo
    if ($file['size'] > $max_size) {
        wp_send_json_error(['message' => 'Fichier trop lourd (max 4 Mo).'], 413);
    }

    // Inclusion des librairies WordPress pour gérer les médias
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    // Format de mimes strictement exigé par WordPress
    $allowed_mimes = [
        'jpg|jpeg|jpe' => 'image/jpeg',
        'gif'          => 'image/gif',
        'png'          => 'image/png',
        'webp'         => 'image/webp'
    ];

    $upload = wp_handle_upload($file, [
        'test_form' => false,
        'mimes'     => $allowed_mimes,
    ]);

    if (isset($upload['error'])) {
        wp_send_json_error(['message' => $upload['error']], 500);
    }

    // --- OPTIMISATION DE L'IMAGE (Sauf pour les GIF animés) ---
    if (in_array($mime, ['image/jpeg', 'image/png', 'image/webp'])) {
        $image = wp_get_image_editor($upload['file']);
        if (!is_wp_error($image)) {
            $image->resize(800, 800, false); // Limite la taille à 800px maximum
            $image->set_quality(80);         // Qualité web optimisée
            $image->save($upload['file']);   // Écrase le fichier lourd d'origine
        }
    }

    wp_send_json_success(['url' => $upload['url']]);
}