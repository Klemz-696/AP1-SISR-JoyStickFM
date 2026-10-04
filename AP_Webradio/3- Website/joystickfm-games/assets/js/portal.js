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
        initTCG();
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

    // ══════════════════════════════════════════════════════════
    // GESTION DU JOYSTICK TCG (LOT 2)
    // ══════════════════════════════════════════════════════════
    let tcgCollectionData = [];
    let tcgActiveFilter = 'all';
    let tcgCountdownTimer = null;

    function initTCG() {
        // 1. Sélecteur entre Catapulte et TCG
        const gameTabBtns = document.querySelectorAll('.jfm-game-tab-btn');
        if (gameTabBtns.length) {
            gameTabBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const game = this.getAttribute('data-game');
                    gameTabBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    document.querySelectorAll('.jfm-game-view').forEach(v => {
                        v.style.display = 'none';
                        v.classList.remove('active');
                    });

                    const targetView = document.getElementById('jfm-game-view-' + game);
                    if (targetView) {
                        targetView.style.display = 'block';
                        targetView.classList.add('active');
                    }

                    if (game === 'tcg' && !tcgCollectionData.length) {
                        loadTCGCollection();
                    }
                });
            });
        }

        const arena = document.getElementById('jfm-game-view-tcg');
        if (!arena) return;

        // 2. Boutons d'actions TCG
        const openBoosterBtn = document.getElementById('jfm-btn-open-booster');
        if (openBoosterBtn) {
            openBoosterBtn.addEventListener('click', handleOpenBooster);
        }

        const claimFreeBtn = document.getElementById('jfm-btn-claim-free');
        if (claimFreeBtn) {
            claimFreeBtn.addEventListener('click', handleClaimFreeBooster);
        }

        const buyBoosterBtn = document.getElementById('jfm-btn-buy-booster');
        if (buyBoosterBtn) {
            buyBoosterBtn.addEventListener('click', handleBuyBooster);
        }

        const closeRevealBtn = document.getElementById('jfm-tcg-btn-close-reveal');
        if (closeRevealBtn) {
            closeRevealBtn.addEventListener('click', function () {
                const modal = document.getElementById('jfm-tcg-reveal-modal');
                if (modal) modal.style.display = 'none';
                loadTCGCollection();
            });
        }

        // 3. Filtres de l'album de cartes
        const filterBtns = document.querySelectorAll('.jfm-tcg-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tcgActiveFilter = this.getAttribute('data-filter');
                renderTCGGrid();
            });
        });

        // Chargement immédiat si l'arène est déjà dans le DOM
        loadTCGCollection();
    }

    // Récupération de la collection de cartes
    function loadTCGCollection() {
        if (!config.logged_in) return;

        const grid = document.getElementById('jfm-tcg-collection-grid');
        if (!grid) return;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_get_collection');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                tcgCollectionData = data.data.cards || [];
                updateTCGStats(data.data.stats || {});
                renderTCGGrid();
            } else {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:#ff4466;">Erreur chargement collection.</div>';
            }
        })
        .catch(() => {
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:#ff4466;">Erreur réseau lors du chargement de la collection.</div>';
        });
    }

    // Mise à jour des compteurs et timer
    function updateTCGStats(stats) {
        const boosterCountEl = document.getElementById('jfm-tcg-boosters-count');
        const coinsCountEl   = document.getElementById('jfm-tcg-coins-count');
        const compTextEl     = document.getElementById('jfm-tcg-completion-text');

        if (boosterCountEl && stats.available_boosters !== undefined) {
            boosterCountEl.textContent = stats.available_boosters;
        }
        if (coinsCountEl && stats.joycoins !== undefined) {
            coinsCountEl.textContent = stats.joycoins;
        }
        if (compTextEl && stats.unique_discovered !== undefined) {
            compTextEl.textContent = stats.unique_discovered + ' / ' + stats.total_catalog + ' (' + stats.completion_pct + '%)';
        }

        // Gestion du timer pour le booster gratuit
        const timerWrap = document.getElementById('jfm-tcg-timer-wrap');
        const timerText = document.getElementById('jfm-tcg-timer-text');
        const claimBtn  = document.getElementById('jfm-btn-claim-free');

        if (tcgCountdownTimer) {
            clearInterval(tcgCountdownTimer);
            tcgCountdownTimer = null;
        }

        if (stats.can_claim_free) {
            if (timerWrap) timerWrap.style.display = 'none';
            if (claimBtn)  claimBtn.style.display = 'inline-flex';
        } else {
            if (claimBtn)  claimBtn.style.display = 'none';
            if (timerWrap) timerWrap.style.display = 'inline-flex';

            let remaining = stats.seconds_remaining || 600;
            updateTimerDisplay(timerText, remaining);

            tcgCountdownTimer = setInterval(function () {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(tcgCountdownTimer);
                    if (timerWrap) timerWrap.style.display = 'none';
                    if (claimBtn)  claimBtn.style.display = 'inline-flex';
                } else {
                    updateTimerDisplay(timerText, remaining);
                }
            }, 1000);
        }
    }

    function updateTimerDisplay(el, seconds) {
        if (!el) return;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    // Rendu dynamique de la grille des 40 cartes
    function renderTCGGrid() {
        const grid = document.getElementById('jfm-tcg-collection-grid');
        if (!grid) return;

        let filtered = tcgCollectionData.slice();

        if (tcgActiveFilter === 'hardware' || tcgActiveFilter === 'hero' || tcgActiveFilter === 'legend' || tcgActiveFilter === 'item') {
            filtered = filtered.filter(c => c.category === tcgActiveFilter);
        } else if (tcgActiveFilter === 'owned') {
            filtered = filtered.filter(c => c.is_owned);
        } else if (tcgActiveFilter === 'holo') {
            filtered = filtered.filter(c => c.qty_holo > 0);
        }

        if (!filtered.length) {
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:3rem;color:var(--texte-dim);">Aucune carte ne correspond à ce filtre.</div>';
            return;
        }

        let html = '';
        filtered.forEach(c => {
            const isOwned = c.is_owned;
            const isHolo  = (c.qty_holo > 0);
            const totalQty = c.qty_normal + c.qty_holo;

            let rarityClass = 'rarity-' + c.rarity;
            let holoClass = isHolo ? 'jfm-card-holo' : '';
            let ownedClass = isOwned ? 'is-owned' : 'is-locked';

            html += `
                <div class="jfm-tcg-card ${rarityClass} ${holoClass} ${ownedClass}" data-id="${c.id}">
                    <div class="jfm-tcg-card-frame">
                        <div class="tcg-card-top">
                            <span class="tcg-rarity-badge ${rarityClass}">${c.rarity.toUpperCase()}</span>
                            <span class="tcg-power-badge">⚡ ${c.power}</span>
                        </div>
                        <div class="tcg-card-art" style="background:${c.bg_gradient};">
                            <span class="tcg-card-icon">${isOwned ? c.icon : '🔒'}</span>
                            ${isHolo ? '<span class="tcg-holo-sparkle">✨ HOLO</span>' : ''}
                        </div>
                        <div class="tcg-card-info">
                            <h4 class="tcg-card-title">${isOwned ? escapeHtml(c.name) : '??? NON DÉCOUVERTE'}</h4>
                            <p class="tcg-card-desc">${isOwned ? escapeHtml(c.description) : 'Ouvrez des boosters pour révéler cette carte légendaire.'}</p>
                            ${isOwned && c.lore ? `<p class="tcg-card-lore">« ${escapeHtml(c.lore)} »</p>` : ''}
                        </div>
                        <div class="tcg-card-footer">
                            <span class="tcg-category-tag">${c.category.toUpperCase()}</span>
                            ${isOwned ? `
                                <div class="tcg-quantity-tag">
                                    <span>x${totalQty}</span>
                                    ${totalQty > 1 ? `<button type="button" class="tcg-btn-recycle" onclick="window.JFM_TCG_recycle(${c.id}, ${isHolo ? 1 : 0})" title="Recycler un exemplaire">+20 🪙</button>` : ''}
                                </div>
                            ` : '<span class="tcg-locked-badge">VERROUILLÉE</span>'}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    // Ouverture de booster
    function handleOpenBooster() {
        const btn = document.getElementById('jfm-btn-open-booster');
        if (btn) btn.disabled = true;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_open_booster');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (btn) btn.disabled = false;

            if (data.success && data.data && data.data.cards) {
                showBoosterReveal(data.data.cards);
                updateTCGStats(data.data);
            } else {
                alert(data.data?.message || 'Erreur lors de l\'ouverture du booster.');
            }
        })
        .catch(() => {
            if (btn) btn.disabled = false;
            alert('Erreur réseau. Veuillez réessayer.');
        });
    }

    // Affichage des 5 cartes révélées
    function showBoosterReveal(cards) {
        const modal = document.getElementById('jfm-tcg-reveal-modal');
        const container = document.getElementById('jfm-tcg-revealed-cards');
        if (!modal || !container) return;

        let html = '';
        cards.forEach((c, idx) => {
            let rarityClass = 'rarity-' + c.rarity;
            let holoClass = c.is_holo ? 'jfm-card-holo' : '';

            html += `
                <div class="jfm-tcg-card ${rarityClass} ${holoClass} is-owned jfm-card-animate" style="animation-delay:${idx * 0.15}s;">
                    <div class="jfm-tcg-card-frame">
                        <div class="tcg-card-top">
                            <span class="tcg-rarity-badge ${rarityClass}">${c.rarity.toUpperCase()}</span>
                            <span class="tcg-power-badge">⚡ ${c.power}</span>
                        </div>
                        <div class="tcg-card-art" style="background:${c.bg_gradient};">
                            <span class="tcg-card-icon">${c.icon}</span>
                            ${c.is_holo ? '<span class="tcg-holo-sparkle">✨ HOLO</span>' : ''}
                        </div>
                        <div class="tcg-card-info">
                            <h4 class="tcg-card-title">${escapeHtml(c.name)}</h4>
                            <p class="tcg-card-desc">${escapeHtml(c.description)}</p>
                        </div>
                        <div class="tcg-card-footer">
                            <span class="tcg-category-tag">${c.category.toUpperCase()}</span>
                            <span class="tcg-new-badge">NOUVEAU !</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        modal.style.display = 'flex';
    }

    // Réclamer booster gratuit
    function handleClaimFreeBooster() {
        const btn = document.getElementById('jfm-btn-claim-free');
        if (btn) btn.disabled = true;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_claim_free_booster');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (btn) btn.disabled = false;
            if (data.success) {
                alert(data.data.message || 'Booster réclamé !');
                loadTCGCollection();
            } else {
                alert(data.data?.message || 'Erreur lors de la réclamation.');
            }
        })
        .catch(() => {
            if (btn) btn.disabled = false;
            alert('Erreur réseau.');
        });
    }

    // Acheter un booster
    function handleBuyBooster() {
        if (!confirm('Acheter 1 booster JoyStick TCG pour 50 JoyCoins ?')) return;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_buy_booster');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.data.message || 'Booster acheté !');
                loadTCGCollection();
            } else {
                alert(data.data?.message || 'Erreur lors de l\'achat.');
            }
        })
        .catch(() => {
            alert('Erreur réseau.');
        });
    }

    // Recyclage d'une carte doublon
    window.JFM_TCG_recycle = function (cardId, isHolo) {
        if (!confirm('Recycler cet exemplaire en JoyCoins ?')) return;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_recycle_card');
        formData.append('security', config.tcg_nonce || '');
        formData.append('card_id', cardId);
        formData.append('is_holo', isHolo);

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.data.message || 'Carte recyclée !');
                loadTCGCollection();
            } else {
                alert(data.data?.message || 'Erreur lors du recyclage.');
            }
        })
        .catch(() => {
            alert('Erreur réseau.');
        });
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
