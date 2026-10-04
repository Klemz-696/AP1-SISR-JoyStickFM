(function () {
  'use strict';

  function canPlay() {
    return typeof JFM_PLAYER_AUTH !== 'undefined' && !!JFM_PLAYER_AUTH.logged_in;
  }

  function redirectToLogin() {
    if (typeof JFM_PLAYER_AUTH !== 'undefined' && JFM_PLAYER_AUTH.login_url) {
      window.location.href = JFM_PLAYER_AUTH.login_url;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('jfm-open-catapult');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (!canPlay()) {
        redirectToLogin();
        return;
      }

      if (window.JFM_GAME && typeof window.JFM_GAME.openGameOverlay === 'function') {
        window.JFM_GAME.openGameOverlay();
      }
    });
  });
})();
