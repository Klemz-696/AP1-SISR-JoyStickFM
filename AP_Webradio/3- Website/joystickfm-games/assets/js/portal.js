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
        initAccountManagement();
        loadArcadeBestDistance();
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

    // ── Déconnexion (sur toutes les vues : compte, hub, header) ──
    function initLogout() {
        const logoutBtns = document.querySelectorAll('#jfm-btn-logout, #jfm-btn-hub-logout, .jfm-btn-logout-trigger');
        if (!logoutBtns.length) return;

        logoutBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                if (!confirm('Voulez-vous vraiment vous déconnecter de votre compte joueur ?')) return;

                btn.disabled = true;
                btn.textContent = 'Déconnexion...';

                const formData = new FormData();
                formData.append('action', 'jfm_logout');

                fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData
                })
                .then(() => {
                    window.location.reload();
                })
                .catch(() => {
                    window.location.reload();
                });
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
    // GESTION DU JOYSTICK GAMES HUB (UNIVERS DÉDIÉ & TCG LOT 2)
    // ══════════════════════════════════════════════════════════
    let tcgCollectionData = [];
    let tcgActiveFilter = 'all';
    let tcgCountdownTimer = null;

    // État du recadreur d'avatar (Canvas Cropper)
    let cropImg = null;
    let cropZoom = 1;
    let cropOffsetX = 0;
    let cropOffsetY = 0;
    let isDraggingCrop = false;
    let dragStartX = 0;
    let dragStartY = 0;

    function initTCG() {
        const hub = document.getElementById('jfm-game-universe');
        if (!hub) return;

        // 1. Navigation entre sous-pages du jeu (Boosters, Collection, Arcade, Profil)
        initGameSubpages();

        // 2. Menu déroulant d'accès au reste de la WebRadio
        initSiteMenuDropdown();

        // 3. Actions d'ouverture de booster et économie
        initBoosterActions();

        // 4. Filtres de l'album de cartes
        initCollectionFilters();

        // 5. Studio d'avatar & outil de recadrage photo
        initAvatarStudio();

        // 6. Déconnexion depuis le hub
        const hubLogoutBtn = document.getElementById('jfm-btn-hub-logout');
        if (hubLogoutBtn) {
            hubLogoutBtn.addEventListener('click', function () {
                if (confirm('Voulez-vous vraiment vous déconnecter du jeu ?')) {
                    const formData = new FormData();
                    formData.append('action', 'jfm_logout');
                    fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        body: formData
                    }).then(() => {
                        window.location.reload();
                    });
                }
            });
        }

        // Chargement automatique de la collection
        loadTCGCollection();
    }

    // ── Gestion des sous-pages du Hub ──
    function initGameSubpages() {
        const navTabs = document.querySelectorAll('.jfm-game-nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const subpage = this.getAttribute('data-subpage');
                switchSubpage(subpage);
            });
        });

        // Clic sur le badge joueur en haut à droite -> ouvre le profil
        const topPill = document.getElementById('jfm-gtb-player-pill');
        if (topPill) {
            topPill.addEventListener('click', function () {
                switchSubpage('profil');
            });
        }

        // Écoute des changements de hash dans l'URL (#boosters, #collection, etc.)
        window.addEventListener('hashchange', checkHashRoute);
        checkHashRoute();
    }

    function checkHashRoute() {
        const hash = (window.location.hash || '').replace('#', '');
        const valid = ['boosters', 'collection', 'arcade', 'profil'];
        if (valid.includes(hash)) {
            switchSubpage(hash, false);
        }
    }

    function switchSubpage(subpage, updateHash = true) {
        const valid = ['boosters', 'collection', 'arcade', 'profil'];
        if (!valid.includes(subpage)) subpage = 'boosters';

        const navTabs = document.querySelectorAll('.jfm-game-nav-tab');
        const subpages = document.querySelectorAll('.jfm-game-subpage');

        navTabs.forEach(t => {
            if (t.getAttribute('data-subpage') === subpage) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        subpages.forEach(p => {
            if (p.id === 'jfm-subpage-' + subpage) {
                p.style.display = 'block';
                p.classList.add('active');
            } else {
                p.style.display = 'none';
                p.classList.remove('active');
            }
        });

        if (updateHash) {
            if (history.replaceState) {
                history.replaceState(null, '', '#' + subpage);
            } else {
                window.location.hash = subpage;
            }
        }

        // Si passage à la collection et vide, rafraîchir
        if (subpage === 'collection' && (!tcgCollectionData || !tcgCollectionData.length)) {
            loadTCGCollection();
        }

        // Faire défiler doucement vers le haut du jeu
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.JFM_GAMES.switchSubpage = switchSubpage;

    // ── Menu déroulant d'accès au reste du site ──
    function initSiteMenuDropdown() {
        const menuBtn = document.getElementById('jfm-btn-site-menu');
        const dropdown = document.getElementById('jfm-site-dropdown');
        if (!menuBtn || !dropdown) return;

        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('active');
            if (isOpen) {
                dropdown.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            } else {
                dropdown.classList.add('active');
                menuBtn.setAttribute('aria-expanded', 'true');
            }
        });

        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target) && e.target !== menuBtn) {
                dropdown.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Actions de Booster & Pioche ──
    function initBoosterActions() {
        // Clic sur le gros bouton d'ouverture
        const openBoosterBtn = document.getElementById('jfm-btn-open-booster');
        if (openBoosterBtn) {
            openBoosterBtn.addEventListener('click', handleOpenBooster);
        }

        // Clic direct sur le booster 3D flottant au centre de l'écran
        const boosterVisual = document.getElementById('jfm-booster-visual');
        if (boosterVisual) {
            boosterVisual.addEventListener('click', handleOpenBooster);
        }

        // Réclamer le booster gratuit
        const claimFreeBtn = document.getElementById('jfm-btn-claim-free');
        if (claimFreeBtn) {
            claimFreeBtn.addEventListener('click', handleClaimFreeBooster);
        }

        // Acheter un booster
        const buyBoosterBtn = document.getElementById('jfm-btn-buy-booster');
        if (buyBoosterBtn) {
            buyBoosterBtn.addEventListener('click', handleBuyBooster);
        }

        // Flip 3D de la carte (sur le conteneur ou le bouton)
        const cardFlipWrap = document.getElementById('jfm-card-flip-wrap');
        if (cardFlipWrap) {
            cardFlipWrap.addEventListener('click', flipCurrentCard);
        }
        const flipBtn = document.getElementById('jfm-btn-flip-card');
        if (flipBtn) {
            flipBtn.addEventListener('click', flipCurrentCard);
        }

        // Carte suivante
        const nextCardBtn = document.getElementById('jfm-btn-next-card');
        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', nextCard);
        }

        // Tout révéler d'un coup
        const revealAllBtn = document.getElementById('jfm-btn-reveal-all');
        if (revealAllBtn) {
            revealAllBtn.addEventListener('click', showRecapStage);
        }

        // Enchaîner avec le booster suivant sans fermer la modale
        const chainNextBtn = document.getElementById('jfm-btn-chain-next-booster');
        if (chainNextBtn) {
            chainNextBtn.addEventListener('click', handleChainNextBooster);
        }

        // Acheter et enchaîner
        const chainBuyBtn = document.getElementById('jfm-btn-chain-buy-booster');
        if (chainBuyBtn) {
            chainBuyBtn.addEventListener('click', handleChainBuyBooster);
        }

        // Ranger dans le classeur
        const closeRevealBtn = document.getElementById('jfm-tcg-btn-close-reveal');
        if (closeRevealBtn) {
            closeRevealBtn.addEventListener('click', function () {
                const modal = document.getElementById('jfm-tcg-reveal-modal');
                if (modal) modal.style.display = 'none';
                loadTCGCollection();
                switchSubpage('collection');
            });
        }
    }

    // ── Filtres de la Collection ──
    function initCollectionFilters() {
        const filterBtns = document.querySelectorAll('.jfm-tcg-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tcgActiveFilter = this.getAttribute('data-filter');
                renderTCGGrid();
            });
        });
    }

    // ── Récupération de la collection de cartes ──
    function loadTCGCollection() {
        if (!config.logged_in) return;

        const grid = document.getElementById('jfm-tcg-collection-grid');
        if (!grid) return;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_get_collection');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                tcgCollectionData = data.data.cards || [];
                updateTCGStats(data.data.stats || {});
                renderTCGGrid();
            } else {
                const msg = data.data?.message || 'Erreur lors du chargement de la collection.';
                grid.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:2.5rem;color:#ff4466;">⚠️ ${escapeHtml(msg)}</div>`;
            }
        })
        .catch(err => {
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2.5rem;color:#ff4466;">Erreur réseau lors du chargement de la collection.</div>';
        });
    }

    // Mise à jour des compteurs et timer
    function updateTCGStats(stats) {
        // Boosters
        const boosterEls = [
            document.getElementById('jfm-tcg-boosters-count'),
            document.getElementById('jfm-top-boosters-val'),
            document.getElementById('jfm-nav-boosters-badge')
        ];
        if (stats.available_boosters !== undefined) {
            boosterEls.forEach(el => {
                if (el) el.textContent = stats.available_boosters;
            });
        }

        // JoyCoins
        const coinEls = [
            document.getElementById('jfm-tcg-coins-count'),
            document.getElementById('jfm-top-coins-val'),
            document.getElementById('jfm-header-coins-val')
        ];
        if (stats.joycoins !== undefined) {
            coinEls.forEach(el => {
                if (el) el.textContent = stats.joycoins;
            });
        }

        // Progression de collection
        const compTextEl = document.getElementById('jfm-tcg-completion-text');
        const progDetailsEl = document.getElementById('jfm-album-prog-details');
        const progBarEl = document.getElementById('jfm-album-prog-bar');
        const holoDetailsEl = document.getElementById('jfm-album-holo-details');
        const navProgBadge = document.getElementById('jfm-nav-prog-badge');

        if (stats.unique_discovered !== undefined) {
            const pct = stats.completion_pct || 0;
            const str = `${stats.unique_discovered} / ${stats.total_catalog} (${pct}%)`;

            if (compTextEl) compTextEl.textContent = str;
            if (progDetailsEl) progDetailsEl.textContent = `${stats.unique_discovered} / ${stats.total_catalog} découvertes (${pct}%)`;
            if (progBarEl) progBarEl.style.width = pct + '%';
            if (navProgBadge) navProgBadge.textContent = `${stats.unique_discovered}/${stats.total_catalog}`;
        }
        if (holoDetailsEl && stats.total_holos !== undefined) {
            holoDetailsEl.textContent = `✨ ${stats.total_holos} Holo${stats.total_holos > 1 ? 's' : ''}`;
        }

        // Timer prochain booster gratuit
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

    // ── Rendu de la grille des 40 cartes dans le Classeur ──
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
                                <div class="tcg-card-actions-row">
                                    <div class="tcg-quantity-tag">
                                        <span>x${totalQty}</span>
                                        ${totalQty > 1 ? `<button type="button" class="tcg-btn-recycle" onclick="window.JFM_TCG_recycle(${c.id}, ${isHolo ? 1 : 0})" title="Recycler un exemplaire doublon">+20 🪙</button>` : ''}
                                    </div>
                                    <button type="button" class="tcg-btn-set-avatar" onclick="window.JFM_TCG_setCardAvatar(${c.id})" title="Définir cette carte comme photo de profil">
                                        ✨ Avatar
                                    </button>
                                </div>
                            ` : '<span class="tcg-locked-badge">VERROUILLÉE</span>'}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    let currentRevealedCards = [];
    let currentRevealIndex = 0;
    let lastAvailableBoosters = 0;
    let lastJoyCoins = 0;

    // ── Ouverture de booster & Cérémonie de Pioche Carte par Carte ──
    function handleOpenBooster() {
        const btn = document.getElementById('jfm-btn-open-booster');
        const boosterVisual = document.getElementById('jfm-booster-visual');

        if (btn) btn.disabled = true;
        if (boosterVisual) boosterVisual.classList.add('jfm-booster-tearing');

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_open_booster');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (btn) btn.disabled = false;
            setTimeout(() => {
                if (boosterVisual) boosterVisual.classList.remove('jfm-booster-tearing');
            }, 400);

            if (data.success && data.data && data.data.cards) {
                lastAvailableBoosters = data.data.available_boosters !== undefined ? data.data.available_boosters : 0;
                lastJoyCoins = data.data.joycoins !== undefined ? data.data.joycoins : 0;

                // Tri strict par rareté croissante pour le suspense (Légendaire en dernier !)
                const rarityRank = { common: 1, rare: 2, epic: 3, legendary: 4 };
                const sortedCards = (data.data.cards || []).slice().sort((a, b) => {
                    const ra = rarityRank[a.rarity] || 1;
                    const rb = rarityRank[b.rarity] || 1;
                    if (ra !== rb) return ra - rb;
                    if (a.is_holo !== b.is_holo) return (a.is_holo ? 1 : 0) - (b.is_holo ? 1 : 0);
                    return a.power - b.power;
                });

                startCardByCardReveal(sortedCards);
                updateTCGStats(data.data);
            } else {
                alert(data.data?.message || 'Erreur lors de l\'ouverture du booster.');
            }
        })
        .catch(() => {
            if (btn) btn.disabled = false;
            if (boosterVisual) boosterVisual.classList.remove('jfm-booster-tearing');
            alert('Erreur réseau. Veuillez réessayer.');
        });
    }

    // Lancement de la cérémonie carte par carte
    function startCardByCardReveal(cards) {
        currentRevealedCards = cards;
        currentRevealIndex = 0;

        const modal = document.getElementById('jfm-tcg-reveal-modal');
        const singleStage = document.getElementById('jfm-single-card-stage');
        const recapStage = document.getElementById('jfm-recap-stage');

        if (singleStage) singleStage.style.display = 'flex';
        if (recapStage) recapStage.style.display = 'none';

        showSingleCard(0);

        if (modal) modal.style.display = 'flex';
    }

    // Affichage de la carte active au centre de l'écran
    function showSingleCard(index) {
        if (index >= currentRevealedCards.length) {
            showRecapStage();
            return;
        }

        currentRevealIndex = index;
        const c = currentRevealedCards[index];

        const idxEl = document.getElementById('jfm-reveal-card-index');
        if (idxEl) idxEl.textContent = index + 1;

        const flipper = document.getElementById('jfm-card-flipper');
        if (flipper) flipper.classList.remove('is-flipped');

        const frontEl = document.getElementById('jfm-card-face-front');
        if (frontEl) {
            const rarityClass = 'rarity-' + c.rarity;
            const holoClass = c.is_holo ? 'jfm-card-holo' : '';

            frontEl.className = `jfm-card-face jfm-card-face-front ${rarityClass} ${holoClass}`;
            frontEl.innerHTML = `
                <div class="tcg-single-card-frame">
                    <div class="tcg-card-top">
                        <span class="tcg-rarity-badge ${rarityClass}">${c.rarity.toUpperCase()}</span>
                        <span class="tcg-power-badge">⚡ ${c.power}</span>
                    </div>
                    <div class="tcg-card-art" style="background:${c.bg_gradient};">
                        <span class="tcg-card-icon">${c.icon}</span>
                        ${c.is_holo ? '<span class="tcg-holo-sparkle">✨ VARIATION HOLO</span>' : ''}
                    </div>
                    <div class="tcg-card-info">
                        <h4 class="tcg-card-title">${escapeHtml(c.name)}</h4>
                        <p class="tcg-card-desc">${escapeHtml(c.description)}</p>
                        ${c.lore ? `<p class="tcg-card-lore">« ${escapeHtml(c.lore)} »</p>` : ''}
                    </div>
                    <div class="tcg-card-footer">
                        <span class="tcg-category-tag">${c.category.toUpperCase()}</span>
                        <span class="tcg-new-badge">CARTE ${index + 1}/5</span>
                    </div>
                </div>
            `;
        }

        const flipBtn = document.getElementById('jfm-btn-flip-card');
        const nextBtn = document.getElementById('jfm-btn-next-card');

        if (flipBtn) flipBtn.style.display = 'inline-flex';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    // Retournement 3D de la carte active
    function flipCurrentCard() {
        const flipper = document.getElementById('jfm-card-flipper');
        if (!flipper || flipper.classList.contains('is-flipped')) return;

        flipper.classList.add('is-flipped');

        const c = currentRevealedCards[currentRevealIndex];
        if (c) {
            triggerCardCelebration(c.rarity, c.is_holo);
        }

        const flipBtn = document.getElementById('jfm-btn-flip-card');
        const nextBtn = document.getElementById('jfm-btn-next-card');

        if (flipBtn) flipBtn.style.display = 'none';
        if (nextBtn) {
            if (currentRevealIndex < currentRevealedCards.length - 1) {
                nextBtn.innerHTML = `CARTE SUIVANTE (${currentRevealIndex + 2}/5) »`;
            } else {
                nextBtn.innerHTML = `✨ VOIR LE RÉCAPITULATIF DU BOOSTER »`;
            }
            nextBtn.style.display = 'inline-flex';
        }
    }

    // Effet d'aura et d'impact visuel selon la rareté
    function triggerCardCelebration(rarity, isHolo) {
        const box = document.querySelector('.jfm-tcg-reveal-box');
        if (!box) return;

        box.classList.remove('jfm-glow-gold', 'jfm-glow-purple', 'jfm-glow-cyan');

        if (rarity === 'legendary') {
            box.classList.add('jfm-glow-gold');
            setTimeout(() => box.classList.remove('jfm-glow-gold'), 1200);
        } else if (rarity === 'epic') {
            box.classList.add('jfm-glow-purple');
            setTimeout(() => box.classList.remove('jfm-glow-purple'), 1000);
        } else if (isHolo || rarity === 'rare') {
            box.classList.add('jfm-glow-cyan');
            setTimeout(() => box.classList.remove('jfm-glow-cyan'), 800);
        }
    }

    // Carte suivante dans la pioche
    function nextCard() {
        if (currentRevealIndex < currentRevealedCards.length - 1) {
            showSingleCard(currentRevealIndex + 1);
        } else {
            showRecapStage();
        }
    }

    // Affichage de l'éventail récapitulatif & enchaînement
    function showRecapStage() {
        const singleStage = document.getElementById('jfm-single-card-stage');
        const recapStage = document.getElementById('jfm-recap-stage');
        const container = document.getElementById('jfm-tcg-revealed-cards');
        const modal = document.getElementById('jfm-tcg-reveal-modal');

        if (singleStage) singleStage.style.display = 'none';
        if (recapStage) recapStage.style.display = 'block';
        if (modal) modal.style.display = 'flex';

        if (container && currentRevealedCards.length) {
            let html = '';
            currentRevealedCards.forEach((c, idx) => {
                let rarityClass = 'rarity-' + c.rarity;
                let holoClass = c.is_holo ? 'jfm-card-holo' : '';

                html += `
                    <div class="jfm-tcg-card ${rarityClass} ${holoClass} is-owned jfm-card-animate" style="animation-delay:${idx * 0.1}s;">
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
                                <span class="tcg-new-badge">OBTENUE !</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        // Configuration des boutons d'enchaînement direct
        const chainNextBtn = document.getElementById('jfm-btn-chain-next-booster');
        const chainBuyBtn = document.getElementById('jfm-btn-chain-buy-booster');
        const chainLeftBadge = document.getElementById('jfm-chain-boosters-left');

        if (lastAvailableBoosters > 0) {
            if (chainLeftBadge) chainLeftBadge.textContent = lastAvailableBoosters;
            if (chainNextBtn) chainNextBtn.style.display = 'inline-flex';
            if (chainBuyBtn) chainBuyBtn.style.display = 'none';
        } else if (lastJoyCoins >= 50) {
            if (chainNextBtn) chainNextBtn.style.display = 'none';
            if (chainBuyBtn) chainBuyBtn.style.display = 'inline-flex';
        } else {
            if (chainNextBtn) chainNextBtn.style.display = 'none';
            if (chainBuyBtn) chainBuyBtn.style.display = 'none';
        }
    }

    // Enchaîner directement l'ouverture du booster suivant
    function handleChainNextBooster() {
        handleOpenBooster();
    }

    // Acheter et enchaîner directement
    function handleChainBuyBooster() {
        const btn = document.getElementById('jfm-btn-chain-buy-booster');
        if (btn) btn.disabled = true;

        const formData = new FormData();
        formData.append('action', 'jfm_tcg_buy_booster');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (btn) btn.disabled = false;
            if (data.success) {
                lastAvailableBoosters = data.data.available_boosters;
                lastJoyCoins = data.data.joycoins;
                updateTCGStats(data.data);
                handleOpenBooster();
            } else {
                alert(data.data?.message || 'Erreur lors de l\'achat du booster.');
            }
        })
        .catch(() => {
            if (btn) btn.disabled = false;
            alert('Erreur réseau.');
        });
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
            credentials: 'same-origin',
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
            credentials: 'same-origin',
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
            credentials: 'same-origin',
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

    // ══════════════════════════════════════════════════════════
    // STUDIO D'AVATAR & OUTIL DE RECADRAGE DE PHOTO
    // ══════════════════════════════════════════════════════════
    function initAvatarStudio() {
        const fileInput = document.getElementById('jfm-avatar-file-input');
        const cropModal = document.getElementById('jfm-avatar-crop-modal');
        const cropCanvas = document.getElementById('jfm-crop-canvas');
        const zoomSlider = document.getElementById('jfm-crop-zoom');
        const cancelBtn = document.getElementById('jfm-btn-cancel-crop');
        const saveBtn = document.getElementById('jfm-btn-save-crop');
        const resetBtn = document.getElementById('jfm-btn-reset-avatar');
        const pickCardBtn = document.getElementById('jfm-btn-pick-card-avatar');
        const cardModal = document.getElementById('jfm-card-avatar-modal');
        const closeCardModalBtn = document.getElementById('jfm-btn-close-card-avatar');

        // A. Chargement d'une image depuis le fichier
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                const file = this.files[0];
                if (!file) return;

                if (!file.type.match('image.*')) {
                    alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    cropImg = new Image();
                    cropImg.onload = function () {
                        // Ouverture de la modale de recadrage
                        cropZoom = 1;
                        cropOffsetX = 0;
                        cropOffsetY = 0;
                        if (zoomSlider) zoomSlider.value = 1;
                        if (cropModal) cropModal.style.display = 'flex';
                        drawCropCanvas();
                    };
                    cropImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        // B. Gestion du glissement tactile & souris sur le Canvas
        if (cropCanvas) {
            const startDrag = (x, y) => {
                isDraggingCrop = true;
                dragStartX = x - cropOffsetX;
                dragStartY = y - cropOffsetY;
            };

            const doDrag = (x, y) => {
                if (!isDraggingCrop) return;
                cropOffsetX = x - dragStartX;
                cropOffsetY = y - dragStartY;
                drawCropCanvas();
            };

            const endDrag = () => {
                isDraggingCrop = false;
            };

            cropCanvas.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
            window.addEventListener('mousemove', e => doDrag(e.clientX, e.clientY));
            window.addEventListener('mouseup', endDrag);

            cropCanvas.addEventListener('touchstart', e => {
                if (e.touches.length === 1) {
                    startDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });

            window.addEventListener('touchmove', e => {
                if (e.touches.length === 1 && isDraggingCrop) {
                    doDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });

            window.addEventListener('touchend', endDrag);
        }

        // C. Curseur de Zoom
        if (zoomSlider) {
            zoomSlider.addEventListener('input', function () {
                cropZoom = parseFloat(this.value);
                drawCropCanvas();
            });
        }

        // D. Annuler le recadrage
        if (cancelBtn && cropModal) {
            cancelBtn.addEventListener('click', function () {
                cropModal.style.display = 'none';
                if (fileInput) fileInput.value = '';
            });
        }

        // E. Valider et Enregistrer la photo recadrée
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                if (!cropImg || !cropCanvas) return;
                saveBtn.disabled = true;
                saveBtn.textContent = 'Enregistrement...';

                // Génération d'une vignette carrée nette 200x200
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = 200;
                exportCanvas.height = 200;
                const exportCtx = exportCanvas.getContext('2d');

                // Recréer le dessin centré
                const w = cropCanvas.width;
                const h = cropCanvas.height;
                const baseScale = Math.max(w / cropImg.width, h / cropImg.height);
                const currentScale = baseScale * cropZoom;
                const drawW = cropImg.width * currentScale;
                const drawH = cropImg.height * currentScale;
                const drawX = (w - drawW) / 2 + cropOffsetX;
                const drawY = (h - drawH) / 2 + cropOffsetY;

                // Transposition vers le canvas d'export 200x200
                const ratio = 200 / w;
                exportCtx.drawImage(cropImg, drawX * ratio, drawY * ratio, drawW * ratio, drawH * ratio);

                const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.85);

                sendAvatarUpdate(dataUrl, function () {
                    saveBtn.disabled = false;
                    saveBtn.textContent = '✂ Valider & Enregistrer l\'avatar';
                    if (cropModal) cropModal.style.display = 'none';
                    if (fileInput) fileInput.value = '';
                    updateAllAvatarVisuals(dataUrl);
                    alert('🎉 Votre photo de profil a été mise à jour avec succès !');
                }, function (err) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = '✂ Valider & Enregistrer l\'avatar';
                    alert('Erreur : ' + err);
                });
            });
        }

        // F. Choisir une carte comme avatar
        if (pickCardBtn && cardModal) {
            pickCardBtn.addEventListener('click', function () {
                openCardAvatarPicker();
            });
        }

        if (closeCardModalBtn && cardModal) {
            closeCardModalBtn.addEventListener('click', function () {
                cardModal.style.display = 'none';
            });
        }

        // G. Réinitialiser l'avatar
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                if (!confirm('Réinitialiser votre photo de profil pour utiliser la silhouette par défaut ?')) return;

                sendAvatarUpdate('', function () {
                    updateAllAvatarVisuals('');
                    alert('Avatar réinitialisé par défaut.');
                }, function (err) {
                    alert('Erreur : ' + err);
                });
            });
        }
    }

    // Dessin sur le Canvas de Recadrage
    function drawCropCanvas() {
        const canvas = document.getElementById('jfm-crop-canvas');
        if (!canvas || !cropImg) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        const baseScale = Math.max(w / cropImg.width, h / cropImg.height);
        const currentScale = baseScale * cropZoom;
        const drawW = cropImg.width * currentScale;
        const drawH = cropImg.height * currentScale;
        const drawX = (w - drawW) / 2 + cropOffsetX;
        const drawY = (h - drawH) / 2 + cropOffsetY;

        ctx.save();
        ctx.drawImage(cropImg, drawX, drawY, drawW, drawH);
        ctx.restore();
    }

    // Ouvrir le sélecteur de cartes pour l'avatar
    function openCardAvatarPicker() {
        const modal = document.getElementById('jfm-card-avatar-modal');
        const grid = document.getElementById('jfm-cards-avatar-grid');
        if (!modal || !grid) return;

        const ownedCards = tcgCollectionData.filter(c => c.is_owned);
        if (!ownedCards.length) {
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:var(--texte-dim);">Vous ne possédez pas encore de cartes. Ouvrez des boosters pour débloquer des avatars exclusifs !</div>';
            modal.style.display = 'flex';
            return;
        }

        let html = '';
        ownedCards.forEach(c => {
            html += `
                <div class="jfm-avatar-card-choice" onclick="window.JFM_TCG_setCardAvatar(${c.id})" title="Choisir ${escapeHtml(c.name)}">
                    <div class="jfm-acc-art" style="background:${c.bg_gradient};">
                        <span>${c.icon}</span>
                    </div>
                    <span class="jfm-acc-name">${escapeHtml(c.name)}</span>
                </div>
            `;
        });

        grid.innerHTML = html;
        modal.style.display = 'flex';
    }

    // Définir une carte comme avatar
    window.JFM_TCG_setCardAvatar = function (cardId) {
        const card = tcgCollectionData.find(c => c.id === cardId);
        if (!card) return;

        const avatarValue = 'card:' + cardId;
        sendAvatarUpdate(avatarValue, function () {
            const cardModal = document.getElementById('jfm-card-avatar-modal');
            if (cardModal) cardModal.style.display = 'none';

            updateAllAvatarVisuals(avatarValue, card);
            alert(`🎉 L'avatar de la carte "${card.name}" est désormais actif !`);
        }, function (err) {
            alert('Erreur : ' + err);
        });
    };

    // Requête AJAX commune de mise à jour d'avatar
    function sendAvatarUpdate(avatarData, onSuccess, onError) {
        const formData = new FormData();
        formData.append('action', 'jfm_update_avatar');
        formData.append('avatar_data', avatarData);
        formData.append('jfm_nonce', config.nonce || '');
        formData.append('security', config.tcg_nonce || '');

        fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (typeof onSuccess === 'function') onSuccess(data.data);
            } else {
                if (typeof onError === 'function') onError(data.data?.message || 'Erreur lors de la mise à jour.');
            }
        })
        .catch(() => {
            if (typeof onError === 'function') onError('Erreur réseau.');
        });
    }

    // Mettre à jour tous les éléments d'affichage de l'avatar dans la page
    function updateAllAvatarVisuals(avatarData, cardObj) {
        const bigFrame = document.getElementById('jfm-avatar-big-frame');
        const gtbAvatarWrap = document.querySelector('.jfm-gtb-avatar-wrap');
        const headerAvatar = document.querySelector('.jfm-header-account-btn .jfm-account-avatar');

        let innerHtmlBig = '';
        let innerHtmlSmall = '';

        if (avatarData && avatarData.startsWith('data:image/')) {
            innerHtmlBig = `<img src="${avatarData}" alt="Mon Avatar" id="jfm-current-avatar-preview" class="jfm-avatar-img-big" />`;
            innerHtmlSmall = `<img src="${avatarData}" alt="Avatar" class="jfm-gtb-avatar-img" />`;
        } else if (avatarData && avatarData.startsWith('card:')) {
            const card = cardObj || tcgCollectionData.find(c => ('card:' + c.id) === avatarData);
            const icon = card ? card.icon : '🃏';
            const bg = card ? card.bg_gradient : 'linear-gradient(135deg,#00f5ff,#b44fff)';

            innerHtmlBig = `<div class="jfm-avatar-card-big" style="background:${bg};font-size:3.5rem;">${icon}</div>`;
            innerHtmlSmall = `<span class="jfm-gtb-avatar-card-icon">${icon}</span>`;
        } else {
            innerHtmlBig = `<span class="jfm-avatar-default-big" id="jfm-current-avatar-preview">👤</span>`;
            innerHtmlSmall = `<span class="jfm-gtb-avatar-default">👤</span>`;
        }

        if (bigFrame) bigFrame.innerHTML = innerHtmlBig;
        if (gtbAvatarWrap) gtbAvatarWrap.innerHTML = innerHtmlSmall;
        if (headerAvatar) headerAvatar.innerHTML = innerHtmlSmall;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ── Gestion Avancée du Compte (Suppression, Avatar Reset, Records) ──
    function initAccountManagement() {
        // Bouton de réinitialisation d'avatar par défaut
        const resetAvatarBtn = document.getElementById('jfm-btn-reset-avatar');
        if (resetAvatarBtn) {
            resetAvatarBtn.addEventListener('click', function () {
                if (!confirm('Rétablir la photo de profil par défaut ?')) return;

                sendAvatarUpdate('', function () {
                    updateAllAvatarVisuals('');
                    alert('Photo de profil par défaut rétablie avec succès.');
                }, function (err) {
                    alert('Erreur : ' + err);
                });
            });
        }

        // Boutons ouvrant la modale de suppression de compte
        const deleteBtns = document.querySelectorAll('#jfm-btn-delete-account, #jfm-btn-delete-account-hub, #jfm-btn-delete-account-page');
        const deleteModal = document.getElementById('jfm-delete-modal');
        const cancelDeleteBtn = document.getElementById('jfm-btn-cancel-delete');
        const confirmDeleteBtn = document.getElementById('jfm-btn-confirm-delete');

        if (deleteBtns.length && deleteModal) {
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    deleteModal.style.display = 'flex';
                });
            });

            if (cancelDeleteBtn) {
                cancelDeleteBtn.addEventListener('click', function () {
                    deleteModal.style.display = 'none';
                });
            }

            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', function () {
                    confirmDeleteBtn.disabled = true;
                    confirmDeleteBtn.textContent = 'Suppression en cours...';

                    const formData = new FormData();
                    formData.append('action', 'jfm_delete_account');
                    formData.append('jfm_nonce', config.nonce || '');
                    formData.append('security', config.tcg_nonce || '');

                    fetch(config.ajax_url || '/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        body: formData
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.data?.message || 'Votre compte a été supprimé.');
                            window.location.href = data.data?.redirect || '/';
                        } else {
                            confirmDeleteBtn.disabled = false;
                            confirmDeleteBtn.textContent = '🗑 Confirmer la suppression';
                            alert(data.data?.message || 'Erreur lors de la suppression.');
                        }
                    })
                    .catch(() => {
                        confirmDeleteBtn.disabled = false;
                        confirmDeleteBtn.textContent = '🗑 Confirmer la suppression';
                        alert('Erreur réseau lors de la suppression du compte.');
                    });
                });
            }
        }
    }

    // ── Chargement du meilleur score Catapulte Arcade depuis localStorage ──
    function loadArcadeBestDistance() {
        const distEl = document.getElementById('jfm-acc-best-dist');
        if (!distEl) return;

        try {
            const raw = localStorage.getItem('jfm_leaderboard_v4');
            if (raw) {
                const parsed = JSON.parse(raw);
                const bestList = parsed.best?.Monthly || parsed.best?.AllTime || [];
                const currentName = config.player?.username?.toLowerCase() || '';

                let maxDist = 0;
                bestList.forEach(entry => {
                    if (entry.name && entry.name.toLowerCase() === currentName) {
                        if (entry.score > maxDist) maxDist = entry.score;
                    }
                });

                if (maxDist > 0) {
                    distEl.innerHTML = `🏆 <strong>${Math.round(maxDist).toLocaleString('fr-FR')} m</strong>`;
                    return;
                }
            }
        } catch (e) {
            // Ignorer si localStorage indisponible
        }

        distEl.innerHTML = `🎯 <em>Aucun vol enregistré</em>`;
    }
})();


