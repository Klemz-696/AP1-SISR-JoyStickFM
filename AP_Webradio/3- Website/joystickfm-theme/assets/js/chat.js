/**
 * JoyStick FM - chat.js v4.0
 * Chat persistant cross-page (SessionStorage)
 * Anti-doublons, Drag and Drop, Smart Scroll, Moderation Admin
 * Notifications : popup toast, badge non lus, animation suck-in
 */
jQuery(document).ready(function ($) {
    'use strict';

    if (typeof JFM_CHAT === 'undefined') return;

    /* ================================
       PERSISTANCE D ETAT
    ================================ */
    var chatState = JSON.parse(sessionStorage.getItem('jfm_chat_state')) || {
        isOpen: false, dock: null, left: '', top: '', width: '', height: ''
    };

    function saveChatState() {
        sessionStorage.setItem('jfm_chat_state', JSON.stringify(chatState));
    }

    var lastId = 0;
    var pendingFile = null;
    var polling = null;
    var isDragging = false;
    var dragOffX = 0;
    var dragOffY = 0;
    var isOpen = false;
    var isSubmitting = false;
    var appendedMessageIds = new Set();
    var messageCache = [];  /* Cache des messages polles pour re-rendu */

    /* ================================
       TRACKING DES MESSAGES NON LUS
    ================================ */
    function getLastReadId() {
        try { return parseInt(localStorage.getItem('jfm_chat_last_read_id')) || 0; }
        catch (e) { return 0; }
    }
    function setLastReadId(id) {
        try { localStorage.setItem('jfm_chat_last_read_id', String(id)); }
        catch (e) { }
    }
    var lastReadId = getLastReadId();
    var toastCooldown = false;
    var activeToast = null;

    /* ================================
       ELEMENTS DOM
    ================================ */
    var toggle = document.getElementById('jfm-chat-toggle');
    var popup = document.getElementById('jfm-chat-popup');
    var overlay = document.getElementById('jfm-chat-overlay');
    var messagesEl = document.getElementById('jfm-chat-messages');
    var form = document.getElementById('jfm-chat-form');
    var usernameEl = document.getElementById('jfm-chat-username');
    var messageEl = document.getElementById('jfm-chat-message');
    var fileInput = document.getElementById('jfm-chat-file');
    var preview = document.getElementById('jfm-chat-preview');
    var previewImg = document.getElementById('jfm-chat-preview-img');
    var removeBtn = document.getElementById('jfm-chat-preview-remove');
    var closeBtn = document.getElementById('jfm-chat-close');
    var dockLeft = document.getElementById('jfm-chat-dock-left');
    var dockRight = document.getElementById('jfm-chat-dock-right');
    var badge = document.getElementById('jfm-chat-badge');
    var header = document.getElementById('jfm-chat-header');

    if (!toggle || !popup) return;

    /* --- NOTIFICATEUR SMART SCROLL --- */
    var scrollNotifier = document.createElement('div');
    scrollNotifier.className = 'jfm-chat-scroll-notifier';
    scrollNotifier.textContent = 'Nouveaux messages';
    scrollNotifier.style.display = 'none';
    popup.appendChild(scrollNotifier);

    scrollNotifier.addEventListener('click', function () {
        scrollToBottom();
        this.style.display = 'none';
    });

    if (messagesEl) {
        messagesEl.addEventListener('scroll', function () {
            var isAtBottom = (messagesEl.scrollHeight - messagesEl.scrollTop <= messagesEl.clientHeight + 50);
            if (isAtBottom) scrollNotifier.style.display = 'none';
        });
    }

    /* -----------------------------------------
       INITIALISATION
    ----------------------------------------- */
    if (JFM_CHAT.logged_in && usernameEl) {
        usernameEl.value = JFM_CHAT.player_name || 'Joueur';
        usernameEl.setAttribute('readonly', 'readonly');
        usernameEl.setAttribute('aria-readonly', 'true');
        usernameEl.title = 'Pseudo vérifié par la session serveur';
    } else {
        try {
            var savedPseudo = localStorage.getItem('jfm_chat_pseudo');
            if (savedPseudo && usernameEl) usernameEl.value = savedPseudo;
        } catch (e) { }

        if (usernameEl) {
            usernameEl.addEventListener('blur', function () {
                try { localStorage.setItem('jfm_chat_pseudo', usernameEl.value); } catch (e) { }
            });
        }
    }

    if (chatState.dock) {
        popup.classList.add('jfm-docked-' + chatState.dock);
    } else {
        if (chatState.left) popup.style.left = chatState.left;
        if (chatState.top) popup.style.top = chatState.top;
        if (chatState.width) popup.style.width = chatState.width;
        if (chatState.height) popup.style.height = chatState.height;
    }

    if (chatState.isOpen) openChat(true);

    if (window.ResizeObserver) {
        new ResizeObserver(function () {
            if (isOpen && !chatState.dock) {
                chatState.width = popup.style.width;
                chatState.height = popup.style.height;
                saveChatState();
            }
        }).observe(popup);
    }

    /* Badge initial et polling permanent */
    updateBadge();
    startPolling();

    /* Sauvegarder lastReadId avant navigation */
    window.addEventListener('beforeunload', function () {
        markAllRead();
    });

    /* -----------------------------------------
       OUVRIR / FERMER
    ----------------------------------------- */
    function updateToggleButton(open) {
        var icon = toggle.querySelector('.jfm-chat-label-icon');
        if (open) {
            if (icon) icon.textContent = '\u2715';
            toggle.classList.add('chat-open');
        } else {
            if (icon) icon.textContent = '\uD83D\uDCAC';
            toggle.classList.remove('chat-open');
        }
    }

    toggle.addEventListener('click', function () {
        isOpen ? closeChat() : openChat(false);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    function openChat(isRestore) {
        isOpen = true;
        chatState.isOpen = true;
        saveChatState();

        popup.removeAttribute('hidden');
        popup.classList.remove('closing');

        if (overlay && !chatState.dock) overlay.classList.add('visible');

        toggle.setAttribute('aria-expanded', 'true');
        updateToggleButton(true);

        /* Rendre les messages caches dans le DOM */
        renderCachedMessages();

        markAllRead();

        if (!isRestore) {
            setTimeout(function () {
                if (messageEl) messageEl.focus();
                scrollToBottom();
            }, 80);
        } else {
            scrollToBottom();
        }
    }

    function closeChat() {
        /* Marquer tout comme lu AVANT de fermer */
        markAllRead();

        isOpen = false;
        chatState.isOpen = false;
        saveChatState();

        popup.classList.add('closing');
        if (overlay) overlay.classList.remove('visible');

        toggle.setAttribute('aria-expanded', 'false');
        updateToggleButton(false);

        setTimeout(function () {
            popup.setAttribute('hidden', '');
            popup.classList.remove('closing');
        }, 240);
    }

    function markAllRead() {
        var maxId = lastReadId;
        appendedMessageIds.forEach(function (id) {
            if (id > maxId) maxId = id;
        });
        if (maxId > lastReadId) {
            lastReadId = maxId;
            setLastReadId(lastReadId);
        }
        if (badge) { badge.setAttribute('hidden', ''); badge.textContent = '0'; }
    }

    function updateBadge() {
        var unreadCount = 0;
        appendedMessageIds.forEach(function (id) {
            if (id > lastReadId) unreadCount++;
        });
        if (badge) {
            if (unreadCount > 0 && !isOpen) {
                badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
                badge.removeAttribute('hidden');
            } else {
                badge.setAttribute('hidden', '');
                badge.textContent = '0';
            }
        }
    }

    /* -----------------------------------------
       DRAG AND DROP
    ----------------------------------------- */
    if (header) {
        header.style.cursor = 'grab';
        header.addEventListener('mousedown', function (e) {
            if (e.target.tagName === 'BUTTON') return;

            var rect = popup.getBoundingClientRect();
            dragOffX = e.clientX - rect.left;
            dragOffY = e.clientY - rect.top;

            if (chatState.dock) {
                chatState.dock = null;
                popup.classList.remove('jfm-docked-left', 'jfm-docked-right');
                if (overlay) overlay.classList.add('visible');
                popup.style.width = '340px';
                popup.style.height = '480px';
                dragOffX = 170;
                dragOffY = 20;
            }

            popup.style.cssText =
                'position:fixed;left:' + (e.clientX - dragOffX) + 'px;top:' + (e.clientY - dragOffY) + 'px;' +
                'right:auto;bottom:auto;width:' + (popup.style.width || '340px') + ';height:' + (popup.style.height || '480px') + ';';

            isDragging = true;
            header.style.cursor = 'grabbing';
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - popup.offsetWidth));
        var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - popup.offsetHeight));
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        if (header) header.style.cursor = 'grab';
        chatState.left = popup.style.left;
        chatState.top = popup.style.top;
        saveChatState();
    });

    /* -----------------------------------------
       ANCRAGE
    ----------------------------------------- */
    function applyDock(side) {
        chatState.dock = side;
        popup.classList.remove('jfm-docked-left', 'jfm-docked-right');
        popup.classList.add('jfm-docked-' + side);
        popup.style.cssText = '';
        chatState.left = chatState.top = chatState.width = chatState.height = '';
        saveChatState();
        if (overlay) overlay.classList.remove('visible');
    }

    if (dockLeft)  dockLeft.addEventListener('click', function () { applyDock('left'); });
    if (dockRight) dockRight.addEventListener('click', function () { applyDock('right'); });

    /* -----------------------------------------
       PIECES JOINTES
    ----------------------------------------- */
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            var file = this.files[0];
            if (!file) return;
            var maxSizeMo = (JFM_CHAT.upload_size || 4) * 1024 * 1024;
            if (file.size > maxSizeMo) {
                alert('Fichier trop lourd (max ' + JFM_CHAT.upload_size + ' Mo).');
                this.value = '';
                return;
            }
            pendingFile = file;
            var reader = new FileReader();
            reader.onload = function (ev) {
                if (previewImg) previewImg.src = ev.target.result;
                if (preview) preview.removeAttribute('hidden');
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', function () {
            pendingFile = null;
            if (fileInput) fileInput.value = '';
            if (previewImg) previewImg.src = '';
            if (preview) preview.setAttribute('hidden', '');
        });
    }

    /* -----------------------------------------
       ENVOI DE MESSAGE
    ----------------------------------------- */
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (isSubmitting) return;

            var msg = messageEl ? messageEl.value.trim() : '';
            var name = JFM_CHAT.logged_in
                ? (JFM_CHAT.player_name || 'Joueur')
                : ((usernameEl && usernameEl.value.trim()) ? usernameEl.value.trim() : 'Anonyme');
            var btn = form.querySelector('button[type="submit"]');

            function disableSubmit(b) { isSubmitting = true; if (b) { b.disabled = true; b.textContent = '\u2026'; } }
            function enableSubmit(b) { isSubmitting = false; if (b) { b.disabled = false; b.textContent = '\u25B6'; } }

            if (pendingFile) {
                disableSubmit(btn);
                var fd = new FormData();
                fd.append('chatfile', pendingFile);
                fd.append('action', 'jfm_chat_upload');
                fd.append('nonce', JFM_CHAT.nonce);
                fetch(JFM_CHAT.ajax_url, { method: 'POST', body: fd })
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                        if (res.success) { sendMessage(name, msg, res.data.url, btn); }
                        else { alert('Erreur upload : ' + (res.data ? res.data.message : '?')); enableSubmit(btn); }
                    })
                    .catch(function () { alert('Erreur reseau upload.'); enableSubmit(btn); });
            } else if (msg) {
                disableSubmit(btn);
                sendMessage(name, msg, '', btn);
            }
        });
    }

    function sendMessage(name, msg, fileUrl, btn) {
        var fd = new FormData();
        fd.append('action', 'jfm_chat_post');
        fd.append('nonce', JFM_CHAT.nonce);
        fd.append('username', name);
        fd.append('message', msg);
        fd.append('file_url', fileUrl || '');
        fetch(JFM_CHAT.ajax_url, { method: 'POST', body: fd })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    if (messageEl) messageEl.value = '';
                    pendingFile = null;
                    if (fileInput) fileInput.value = '';
                    if (previewImg) previewImg.src = '';
                    if (preview) preview.setAttribute('hidden', '');
                    fetchMessages();
                } else {
                    alert(res.data && res.data.message ? res.data.message : 'Erreur envoi.');
                }
                isSubmitting = false;
                if (btn) { btn.disabled = false; btn.textContent = '\u25B6'; }
            })
            .catch(function () {
                alert('Erreur reseau.');
                isSubmitting = false;
                if (btn) { btn.disabled = false; btn.textContent = '\u25B6'; }
            });
    }

    /* -----------------------------------------
       POLLING ET AFFICHAGE
    ----------------------------------------- */
    function startPolling() {
        fetchMessages();
        if (!polling) polling = setInterval(fetchMessages, 2500);
    }

    function stopPolling() {
        if (polling) { clearInterval(polling); polling = null; }
    }

    function fetchMessages() {
        fetch(JFM_CHAT.ajax_url + '?action=jfm_chat_get&nonce=' + encodeURIComponent(JFM_CHAT.nonce) + '&since=' + lastId)
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res.success || !res.data) return;
                var msgs = res.data;
                var newCount = 0;

                msgs.forEach(function (m) {
                    if (appendedMessageIds.has(m.id)) return;
                    appendedMessageIds.add(m.id);
                    messageCache.push(m);
                    if (m.id > lastId) lastId = m.id;
                    newCount++;

                    /* Toujours rendre dans le DOM */
                    appendMessage(m);

                    /* Notification si le chat est ferme et le message est non lu */
                    if (!isOpen && m.id > lastReadId) {
                        showToastNotification(m);
                    }
                });

                if (isOpen && newCount > 0) {
                    var isAtBottom = messagesEl && (messagesEl.scrollHeight - messagesEl.scrollTop <= messagesEl.clientHeight + 80);
                    if (isAtBottom) {
                        scrollToBottom();
                    } else {
                        scrollNotifier.style.display = '';
                    }
                    markAllRead();
                }

                updateBadge();
            })
            .catch(function () { });
    }

    /* Re-rendre les messages caches qui ne sont pas dans le DOM */
    function renderCachedMessages() {
        if (!messagesEl) return;
        messageCache.forEach(function (m) {
            if (!document.getElementById('jfm-msg-' + m.id)) {
                appendMessage(m);
            }
        });
    }

    function appendMessage(m) {
        if (!messagesEl) return;
        /* Eviter les doublons dans le DOM */
        if (document.getElementById('jfm-msg-' + m.id)) return;

        var div = document.createElement('div');
        div.className = 'jfm-chat-msg';
        div.id = 'jfm-msg-' + m.id;
        div.setAttribute('data-msg-id', m.id);

        var time = '';
        if (m.created_at) {
            try {
                var d = new Date(m.created_at.replace(' ', 'T'));
                time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
            } catch (e) { time = ''; }
        }

        var mediaHtml = '';
        if (m.file_url) {
            mediaHtml = '<img class="jfm-chat-media" src="' + escHtml(m.file_url) + '" alt="Media" loading="lazy">';
        }

        var adminHtml = '';
        if (JFM_CHAT.is_admin) {
            adminHtml = '<button class="jfm-chat-del-btn" data-id="' + m.id + '" title="Supprimer" style="font-size:0.7rem; opacity:0.5; margin-left:auto;">\uD83D\uDDD1\uFE0F</button>';
        }

        var badgeHtml = m.is_verified ? ' <span title=\"Compte vérifié\">✅</span>' : ' <span title=\"Invité\">👤</span>';
        div.innerHTML =
            '<div class="jfm-chat-meta" style="display:flex; width:100%; align-items:center;">'
            + '<span class="jfm-chat-name">' + escHtml(m.username) + badgeHtml + '</span>'
            + '<span class="jfm-chat-time" style="margin-left:6px;">' + time + '</span>'
            + adminHtml
            + '</div>'
            + mediaHtml
            + (m.message ? '<p class="jfm-chat-text">' + escHtml(m.message) + '</p>' : '');

        messagesEl.appendChild(div);
    }

    function scrollToBottom() {
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function escHtml(str) {
        var txt = document.createElement('textarea');
        txt.innerHTML = String(str || '');
        var decoded = txt.value;
        return decoded
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ================================
       NOTIFICATIONS TOAST
    ================================ */
    function showToastNotification(m) {
        if (toastCooldown || activeToast) return;
        toastCooldown = true;
        setTimeout(function () { toastCooldown = false; }, 2000);

        var toast = document.createElement('div');
        toast.className = 'jfm-chat-toast';
        toast.setAttribute('data-msg-id', m.id);

        var previewText = m.message || '';
        if (previewText.length > 80) previewText = previewText.substring(0, 77) + '\u2026';

        var bodyContent = '';
        if (m.file_url) bodyContent += '<span class="jfm-toast-media">\uD83D\uDCCE </span>';
        bodyContent += '<span class="jfm-toast-text">' + escHtml(previewText || (m.file_url ? 'Image envoyee' : '')) + '</span>';

        toast.innerHTML =
            '<div class="jfm-toast-header">'
            + '<span class="jfm-toast-icon">\uD83D\uDCAC</span>'
            + '<span class="jfm-toast-name">' + escHtml(m.username) + '</span>'
            + '<span class="jfm-toast-close" title="Fermer">\u2715</span>'
            + '</div>'
            + '<div class="jfm-toast-body">' + bodyContent + '</div>'
            + '<div class="jfm-toast-timer"><div class="jfm-toast-timer-bar"></div></div>';

        document.body.appendChild(toast);
        activeToast = toast;

        requestAnimationFrame(function () {
            toast.classList.add('jfm-toast-visible');
        });

        /* Clic = ouvrir le chat et scroller au message */
        toast.addEventListener('click', function (e) {
            if (e.target.classList.contains('jfm-toast-close')) {
                removeToast(toast, false);
                return;
            }
            removeToast(toast, false);
            /* Marquer ce message comme lu immediatement */
            if (m.id > lastReadId) {
                lastReadId = m.id;
                setLastReadId(lastReadId);
            }
            openChat(false);
            setTimeout(function () {
                renderCachedMessages();
                var msgEl = document.getElementById('jfm-msg-' + m.id);
                if (msgEl) {
                    msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    msgEl.style.transition = 'border-color 0.3s, box-shadow 0.3s';
                    msgEl.style.borderColor = 'rgba(180, 79, 255, 0.7)';
                    msgEl.style.boxShadow = '0 0 12px rgba(180, 79, 255, 0.3)';
                    setTimeout(function () {
                        msgEl.style.borderColor = '';
                        msgEl.style.boxShadow = '';
                    }, 2500);
                } else {
                    scrollToBottom();
                }
            }, 400);
        });

        /* Auto-dismiss apres 6s avec animation suck-in */
        var toastTimer = setTimeout(function () {
            removeToast(toast, true);
        }, 6000);

        toast._timer = toastTimer;
    }

    function removeToast(toast, doSuckIn) {
        if (!toast || !toast.parentNode) return;
        if (toast._timer) clearTimeout(toast._timer);

        if (doSuckIn && toggle) {
            var toastRect = toast.getBoundingClientRect();
            var toggleRect = toggle.getBoundingClientRect();

            var deltaX = toggleRect.left + toggleRect.width / 2 - (toastRect.left + toastRect.width / 2);
            var deltaY = toggleRect.top + toggleRect.height / 2 - (toastRect.top + toastRect.height / 2);

            toast.style.setProperty('--suck-x', deltaX + 'px');
            toast.style.setProperty('--suck-y', deltaY + 'px');
            toast.classList.add('jfm-toast-suckin');

            setTimeout(function () {
                if (toast.parentNode) toast.remove();
                activeToast = null;
                updateBadge();
                toggle.classList.add('jfm-chat-pulse');
                setTimeout(function () { toggle.classList.remove('jfm-chat-pulse'); }, 600);
            }, 500);
        } else {
            toast.classList.remove('jfm-toast-visible');
            toast.classList.add('jfm-toast-out');
            setTimeout(function () {
                if (toast.parentNode) toast.remove();
                activeToast = null;
            }, 300);
        }
    }

    /* ================================
       OUTILS D ADMINISTRATION
    ================================ */
    if (JFM_CHAT.is_admin) {
        var controlsDiv = header ? header.querySelector('.jfm-chat-controls') : null;
        if (header && !controlsDiv) {
            controlsDiv = document.createElement('div');
            controlsDiv.className = 'jfm-chat-controls';
            header.appendChild(controlsDiv);
        }

        if (controlsDiv) {
            controlsDiv.insertAdjacentHTML('afterbegin',
                '<button id="jfm-chat-archive-btn" title="Archiver et vider (Admin)">\uD83D\uDCE6</button>' +
                '<button id="jfm-chat-clear-btn" title="Purger sans archiver (Admin)">\uD83E\uDDF9</button>'
            );
        }

        var clearBtn = document.getElementById('jfm-chat-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!confirm("ATTENTION : Voulez-vous supprimer definitivement tous les messages SANS creer d'archive ZIP ?")) return;
                var fd = new FormData();
                fd.append('action', 'jfm_chat_clear');
                fd.append('nonce', JFM_CHAT.nonce);
                fetch(JFM_CHAT.ajax_url, { method: 'POST', body: fd })
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                        if (res.success) {
                            if (messagesEl) messagesEl.innerHTML = '';
                            lastId = 0;
                            appendedMessageIds.clear();
                        }
                    });
            });
        }

        var archiveBtn = document.getElementById('jfm-chat-archive-btn');
        if (archiveBtn) {
            archiveBtn.addEventListener('click', function () {
                if (!confirm("Voulez-vous creer une archive ZIP de la conversation et vider le chat ?")) return;
                var fd = new FormData();
                fd.append('action', 'jfm_chat_archive_manual');
                fd.append('nonce', JFM_CHAT.nonce);
                fetch(JFM_CHAT.ajax_url, { method: 'POST', body: fd })
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                        if (res.success) {
                            alert(res.data && res.data.message ? res.data.message : 'Chat archive et vide avec succes.');
                            if (messagesEl) messagesEl.innerHTML = '';
                            lastId = 0;
                            appendedMessageIds.clear();
                        }
                    });
            });
        }

        if (messagesEl) {
            messagesEl.addEventListener('click', function (e) {
                var btn = e.target.closest('.jfm-chat-del-btn');
                if (!btn) return;
                var id = btn.getAttribute('data-id');
                if (!confirm("Supprimer ce message ?")) return;
                var fd = new FormData();
                fd.append('action', 'jfm_chat_delete');
                fd.append('nonce', JFM_CHAT.nonce);
                fd.append('msg_id', id);
                fetch(JFM_CHAT.ajax_url, { method: 'POST', body: fd })
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                        if (res.success) {
                            var msgDiv = document.getElementById('jfm-msg-' + id);
                            if (msgDiv) msgDiv.remove();
                        }
                    });
            });
        }
    }

});
