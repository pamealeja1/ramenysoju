'use strict';

(function (window) {
  const PWD_KEY = 'anime_manga_admin_pwd';
  const SESSION_KEY = 'anime_manga_session';

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function hasPassword() {
    return !!localStorage.getItem(PWD_KEY);
  }

  function setPassword(pwd) {
    localStorage.setItem(PWD_KEY, pwd);
  }

  function login(pwd) {
    if (!hasPassword()) {
      setPassword(pwd);
      sessionStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    if (localStorage.getItem(PWD_KEY) === pwd) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function showLoginOverlay(onSuccess) {
    const isFirstTime = !hasPassword();
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(7,7,32,0.98);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="width:100%;max-width:360px;text-align:center;">
        <div style="margin-bottom:24px;">
          <img src="img/logo.png" alt="Logo" style="max-width:120px;margin:0 auto;" onerror="this.style.display='none'">
          <h2 style="color:#fff;font-family:'Oswald',sans-serif;text-transform:uppercase;margin:16px 0 8px;">${isFirstTime ? 'Crear Contraseña' : 'Acceso Admin'}</h2>
          <p style="color:#8a8aa0;font-size:13px;">${isFirstTime ? 'Crea una contraseña para gestionar tus mangas' : 'Ingresa tu contraseña para continuar'}</p>
        </div>
        <input type="password" id="auth-pwd" placeholder="Contraseña" style="width:100%;background:#0e0f30;border:1px solid #2a2b50;border-radius:6px;padding:12px 16px;color:#fff;font-size:14px;margin-bottom:16px;box-sizing:border-box;">
        <button id="auth-submit" style="width:100%;background:#e53637;color:#fff;border:none;border-radius:6px;padding:12px;font-weight:700;font-size:14px;text-transform:uppercase;cursor:pointer;font-family:'Oswald',sans-serif;letter-spacing:2px;">${isFirstTime ? 'Crear' : 'Ingresar'}</button>
        <a href="./manga.html" style="display:inline-block;margin-top:16px;color:#555;font-size:13px;text-decoration:none;">Volver a la biblioteca</a>
      </div>
    `;
    document.body.appendChild(overlay);

    function tryLogin() {
      const pwd = document.getElementById('auth-pwd').value;
      if (!pwd) return;
      if (login(pwd)) {
        overlay.remove();
        onSuccess();
      } else {
        document.getElementById('auth-pwd').value = '';
        document.getElementById('auth-pwd').style.borderColor = '#e53637';
        document.getElementById('auth-pwd').setAttribute('placeholder', 'Contraseña incorrecta');
      }
    }

    document.getElementById('auth-submit').addEventListener('click', tryLogin);
    document.getElementById('auth-pwd').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryLogin();
    });
  }

  function requireAuth(onSuccess) {
    if (isLoggedIn()) {
      onSuccess();
    } else {
      showLoginOverlay(onSuccess);
    }
  }

  window.MangaAuth = { isLoggedIn, hasPassword, login, logout, requireAuth, showLoginOverlay };
})(window);
