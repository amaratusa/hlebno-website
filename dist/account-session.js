'use strict';

(() => {
  const sessionKey = 'hlebno-demo-account';
  const rememberKey = 'hlebno-remember-anna';
  const demo = {
    name: 'Анна',
    surname: '',
    email: 'demo@hlebno.ru',
    tel: '+7 (916) 123-45-67',
    receipt: 'pickup',
    address: '',
    sms: true,
    news: false
  };
  let profile = null;

  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    if (saved && typeof saved.name === 'string' && saved.name.trim()) profile = saved;
    else if (localStorage.getItem(rememberKey) === 'yes') profile = { ...demo };
  } catch {
    // Storage can be disabled in private embeds.
  }

  function save(next) {
    profile = next;
    try {
      if (profile) sessionStorage.setItem(sessionKey, JSON.stringify(profile));
      else sessionStorage.removeItem(sessionKey);
    } catch { /* No cross-page persistence without browser storage. */ }
  }

  function remember(enabled) {
    try {
      if (enabled) localStorage.setItem(rememberKey, 'yes');
      else localStorage.removeItem(rememberKey);
    } catch { /* Session storage remains the default. */ }
  }

  function localOrderCount() {
    try {
      const lines = JSON.parse(sessionStorage.getItem('hlebno-demo-order') || '[]');
      return Array.isArray(lines) && lines.length ? 1 : 0;
    } catch { return 0; }
  }

  window.HlebnoAccount = {
    current: () => profile,
    signIn(keep) { save({ ...demo }); remember(keep); },
    register(details) { save({ ...demo, ...details, sms: false }); remember(false); },
    update(details) { if (profile) save({ ...profile, ...details }); },
    signOut() { save(null); remember(false); },
    orderCount: localOrderCount
  };

  if (!profile) return;
  const initial = Array.from(profile.name.trim())[0].toUpperCase();
  for (const link of document.querySelectorAll('.profile[href="login.html"], .account-mobile-link[href="login.html"], [data-account-menu]')) {
    link.href = 'account.html';
    link.setAttribute('aria-label', 'Личный кабинет · ' + profile.name);
    if (!link.hasAttribute('data-account-menu')) continue;
    const avatar = document.createElement('span');
    avatar.className = 'mobile-account-avatar';
    avatar.textContent = initial;
    avatar.setAttribute('aria-hidden', 'true');
    link.querySelector('[data-icon="user"]').replaceWith(avatar);
    link.querySelector('[data-account-label]').textContent = 'Личный кабинет · ' + profile.name;
    const count = localOrderCount();
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'mobile-account-badge';
      badge.textContent = count;
      badge.setAttribute('aria-hidden', 'true');
      link.append(badge);
    }
    link.classList.add('mobile-menu-signed-in');
  }
  for (const link of document.querySelectorAll('.mobile-menu-shortcut[href="favorites.html"]')) {
    link.hidden = true;
  }
})();
