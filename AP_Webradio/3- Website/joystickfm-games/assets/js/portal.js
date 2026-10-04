/**
 * JoyStick FM Games — portal.js
 * Gestion client du portail de jeux, de l'authentification AJAX et des sessions.
 */

'use strict';

(function () {
    const config = window.JFM_GAMES_CONFIG || {};

    // ── Objet global d'état et d'API client ──
    window.JFM_GAMES = {
        isLoggedIn: function () {
            return !!config.logged_in;
        },
        getPlayer: function () {
            return config.player || null;
        },
        requireLogin: function (onAuthorized, customRedirect) {
            if (this.isLoggedIn()) {
                if (typeof onAuthorized === 'function') onAuthorized();
                return true;
            }
            const returnUrl = customRedirect || window.location.href;
            const dest = (config.account_url || '/compte') + '?redirect_to=' + encodeURIComponent(returnUrl);
            window.location.href = dest;
            return false;
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        initTabs();
        initForms();
        initLogout();
    });

    // ── Gestion des onglets (Connexion / Inscription / Récupération) ──
    function initTabs() {
        const tabBtns = document.querySelectorAll('.jfm-tab-btn');
        if (!tabBtns.length) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');

                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                document.querySelectorAll('.jfm-auth-form').forEach(form => {
                    form.classList.remove('active');
                });

                const activeForm = document.getElementById('jfm-form-' + targetTab);
                if (activeForm) {
                    activeForm.classList.add('active');
                }
            });
        });
    }

    // ── Gestion des formulaires AJAX ──
    function initForms() {
        // 1. Formulaire de Connexion
        const loginForm = document.getElementById('jfm-form-login');
        if (loginForm) {
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const msgBox = document.getElementById('jfm-login-msg');
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                showMsg(msgBox, '', '');

                submitBtn.disabled = true;
                submitBtn.textContent = 'CONNEXION EN COURS...';

                const formData = new FormData(loginForm);

                fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SE CONNECTER';

                    if (data.success) {
                        showMsg(msgBox, 'Connexion réussie ! Chargement...', 'success');
                        const redirect = formData.get('redirect_to') || config.games_url || '/jeux';
                        setTimeout(() => { window.location.href = redirect; }, 400);
                    } else {
                        showMsg(msgBox, data.data?.message || 'Erreur lors de la connexion.', 'error');
                    }
                })
                .catch(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SE CONNECTER';
                    showMsg(msgBox, 'Erreur réseau. Veuillez réessayer.', 'error');
                });
            });
        }

        // 2. Formulaire d'Inscription
        const regForm = document.getElementById('jfm-form-register');
        if (regForm) {
            regForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const msgBox = document.getElementById('jfm-reg-msg');
                const submitBtn = regForm.querySelector('button[type="submit"]');
                showMsg(msgBox, '', '');

                submitBtn.disabled = true;
                submitBtn.textContent = 'CRÉATION DU COMPTE...';

                const formData = new FormData(regForm);

                fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'CRÉER MON COMPTE GRATUIT';

                    if (data.success && data.data?.recovery_code) {
                        // Affichage impératif de la modale du code de secours
                        showRecoveryModal(data.data.recovery_code, formData.get('redirect_to') || config.games_url || '/jeux');
                    } else {
                        showMsg(msgBox, data.data?.message || 'Erreur lors de l’inscription.', 'error');
                    }
                })
                .catch(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'CRÉER MON COMPTE GRATUIT';
                    showMsg(msgBox, 'Erreur réseau. Veuillez réessayer.', 'error');
                });
            });
        }

        // 3. Formulaire de Récupération (Code de secours)
        const recForm = document.getElementById('jfm-form-recover');
        if (recForm) {
            recForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const msgBox = document.getElementById('jfm-rec-msg');
                const submitBtn = recForm.querySelector('button[type="submit"]');
                showMsg(msgBox, '', '');

                submitBtn.disabled = true;
                submitBtn.textContent = 'VÉRIFICATION DU CODE...';

                const formData = new FormData(recForm);

                fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'RÉINITIALISER MON CODE PIN';

                    if (data.success) {
                        const newCode = data.data?.new_recovery_code ? ' Nouveau code de secours : ' + data.data.new_recovery_code : '';
                        showMsg(msgBox, (data.data?.message || 'PIN réinitialisé !') + newCode, 'success');
                        recForm.reset();
                        // Basculer sur l'onglet connexion
                        setTimeout(() => {
                            const loginTab = document.querySelector('.jfm-tab-btn[data-tab="login"]');
                            if (loginTab) loginTab.click();
                        }, 2500);
                    } else {
                        showMsg(msgBox, data.data?.message || 'Code de secours invalide.', 'error');
                    }
                })
                .catch(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'RÉINITIALISER MON CODE PIN';
                    showMsg(msgBox, 'Erreur réseau. Veuillez réessayer.', 'error');
                });
            });
        }
    }

    // ── Déconnexion ──
    function initLogout() {
        const btnLogout = document.getElementById('jfm-btn-logout');
        if (!btnLogout) return;

        btnLogout.addEventListener('click', function () {
            if (!confirm('Voulez-vous vraiment vous déconnecter de votre compte joueur ?')) return;

            btnLogout.disabled = true;
            btnLogout.textContent = 'Déconnexion...';

            const formData = new FormData();
            formData.append('action', 'jfm_logout');

            fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData
            })
            .then(() => {
                window.location.reload();
            })
            .catch(() => {
                window.location.reload();
            });
        });
    }

    // ── Affichage de message dans un conteneur ──
    function showMsg(box, text, type) {
        if (!box) return;
        if (!text) {
            box.style.display = 'none';
            box.textContent = '';
            box.className = 'jfm-form-msg';
            return;
        }
        box.textContent = text;
        box.className = 'jfm-form-msg ' + (type || 'info');
        box.style.display = 'block';
    }

    // ── Modale d'affichage unique du code de secours ──
    function showRecoveryModal(code, redirectUrl) {
        const modal = document.getElementById('jfm-recovery-modal');
        const displayBox = document.getElementById('jfm-display-recovery-code');
        const copyBtn = document.getElementById('jfm-btn-copy-code');

        if (!modal || !displayBox) {
            alert('Code de secours à conserver précieusement : ' + code);
            window.location.href = redirectUrl;
            return;
        }

        displayBox.textContent = code;
        modal.style.display = 'flex';

        copyBtn.onclick = function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.textContent = '✅ COPIÉ ! REDIRECTION...';
                    setTimeout(() => { window.location.href = redirectUrl; }, 800);
                }).catch(() => {
                    window.location.href = redirectUrl;
                });
            } else {
                window.location.href = redirectUrl;
            }
        };
    }
})();
