'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const { cart, products, money, notify } = window.HlebnoShop;
  const featured = [...products.keys()].filter(id => id !== 'cookie-demo');
  const categories = ['Все', 'Хлеб', 'Выпечка', 'Сладкое', 'Завтраки', 'Готовая еда', 'Сыры и деликатесы', 'Напитки', 'Подарки'];
  const notes = {
    about: ['О пекарне', 'ХЛЕБНО готовится к открытию в Санкт-Петербурге. Печём хлеб на закваске, подбираем к нему сыры и гастрономию. За кофе по пути, за хлебом к ужину.'],
    delivery: ['Доставка и самовывоз', 'Условия доставки и самовывоза появятся к открытию петербургской пекарни.'],
    store: ['ХЛЕБНО в Петербурге', 'Готовимся к открытию. Адрес пекарни и часы работы появятся здесь.'],
    contacts: ['Контакты', 'Контакты петербургской пекарни появятся к открытию.'],
    profile: ['Личный кабинет', 'Пока можно собрать тестовую корзину. Она сохранится в этом браузере.'],
    career: ['Команда ХЛЕБНО', 'Готовим пекарню к открытию в Санкт-Петербурге. Здесь появится информация о работе в команде.'],
    winter: ['Зимний стол', 'К ужину — ремесленный хлеб и выдержанный сыр. К утреннему кофе — тёплый круассан.'],
    pairs: ['Гастрономические пары', 'Подсушите ломтик хлеба на закваске, добавьте сливочное масло и слабосолёную форель. А к хлебу с орехами попробуйте выдержанный сыр.'],
    lab: ['ХЛЕБНО LAB', 'Здесь пробуем новые вкусы и работаем с локальными производителями. Истории первых партий появятся к открытию.'],
    subscribe: ['Новости ХЛЕБНО', 'Рассылка запустится к открытию. Это предварительная версия формы. Адрес не сохранён.']
  };
  const favoritesKey = 'hlebno-favorites';
  const favorites = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    if (Array.isArray(saved)) {
      for (const id of saved) if (products.has(id)) favorites.add(id);
    }
  } catch { /* Keep favorites usable in memory when storage is unavailable. */ }
  function refreshFavorite(button) {
    const saved = favorites.has(button.dataset.favoriteId);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', button.dataset.favoriteName ? 'В избранное: ' + button.dataset.favoriteName : 'Сохранить в избранное');
    if (button.classList.contains('save-favorite')) {
      button.textContent = saved ? 'В избранном' : 'В избранное';
    }
  }
  window.refreshHlebnoFavorite = refreshFavorite;

  let selected = 'Все';
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function photo(product, className) {
    const img = element('img', '', className);
    img.alt = '';
    img.src = product.image;
    return img;
  }
  function show(id) {
    if (!byId(id).open) byId(id).showModal();
  }
  function showNote(key) {
    const [title, copy] = notes[key];
    byId('details-title').textContent = title;
    const body = byId('details-body');
    body.replaceChildren(element('p', copy));
    if (key === 'winter') {
      for (const id of ['artisan', 'croissant']) {
        const product = products.get(id);
        const row = element('button', '', 'result');
        row.dataset.product = id;
        row.append(photo(product), element('span', product.name), element('strong', money(product.price)));
        body.append(row);
      }
    }
    show('details');
  }
  function renderResults() {
    const query = byId('query').value.trim().toLocaleLowerCase('ru');
    const allResults = byId('all-search-results');
    if (allResults) allResults.href = 'search.html?q=' + encodeURIComponent(query);
    const matches = featured.map(id => products.get(id)).filter(product =>
      (selected === 'Все' || (product.category || 'Хлеб') === selected) &&
      product.name.toLocaleLowerCase('ru').includes(query));
    byId('filters').querySelectorAll('button').forEach(button =>
      button.setAttribute('aria-pressed', String(button.textContent === selected)));
    const results = byId('results');
    results.replaceChildren();
    for (const product of matches) {
      const row = element('button', '', 'result');
      row.dataset.product = product.id;
      const price = product.variants ? 'от ' + money(Math.min(...product.variants.map(v => v.price))) : money(product.price);
      row.append(photo(product), element('span', product.name), element('strong', price));
      results.append(row);
    }
    if (!matches.length) results.append(element('p', query ? 'По этому запросу ничего не найдено.' : 'Товары этой категории появятся к открытию.'));
  }
  function openBrowse(category, focusSearch) {
    selected = category;
    byId('query').value = '';
    renderResults();
    show('browse');
    if (focusSearch) byId('query').focus();
  }
  for (const category of categories) {
    const button = element('button', category);
    button.addEventListener('click', () => { selected = category; renderResults(); });
    byId('filters').append(button);
  }
  byId('query').addEventListener('input', renderResults);
  const toggle = byId('menu-toggle');
  const mobileMenu = byId('mobile-menu');
  for (const icon of document.querySelectorAll('[data-icon]:empty')) {
    icon.innerHTML = window.HlebnoIcons.svg(icon.dataset.icon);
  }
  toggle.addEventListener('click', () => {
    show('mobile-menu');
    toggle.setAttribute('aria-expanded', 'true');
  });
  mobileMenu.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
  });
  matchMedia('(max-width: 800px)').addEventListener('change', event => {
    if (!event.matches && mobileMenu.open) mobileMenu.close();
  });

  function showFavorites() {
    byId('details-title').textContent = 'Избранное';
    const body = byId('details-body');
    body.replaceChildren();
    if (!favorites.size) {
      body.append(element('p', 'Здесь появятся сохранённые товары. Откройте карточку товара и нажмите «В избранное».'));
    }
    for (const id of favorites) {
      const product = products.get(id);
      const row = element('button', '', 'result');
      row.dataset.product = id;
      const price = product.variants ? 'от ' + money(Math.min(...product.variants.map(v => v.price))) : money(product.price);
      row.append(photo(product), element('span', product.name), element('strong', price));
      body.append(row);
    }
    show('details');
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.closest('.mobile-menu') && !target.classList.contains('close')) mobileMenu.close();
    if (target.classList.contains('close')) target.closest('dialog').close();
    else if (target.hasAttribute('data-favorites')) showFavorites();
    else if (target.dataset.favoriteId) {
      const id = target.dataset.favoriteId;
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      try {
        localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
      } catch { /* Keep the current selection available in this session. */ }
      for (const button of document.querySelectorAll('[data-favorite-id]')) refreshFavorite(button);
    }
    else if (target.hasAttribute('data-cart')) show('cart-dialog');
    else if (target.dataset.note) showNote(target.dataset.note);
    else if (target.dataset.browse) openBrowse(target.dataset.browse, target.hasAttribute('data-search'));
    else if (target.dataset.product) {
      const product = products.get(target.dataset.product);
      if (product) location.href = product.url || 'product.html?id=' + encodeURIComponent(product.id);
    }
    else if (target.dataset.add) {
      const result = cart.add(target.dataset.add);
      if (result.ok && target.closest('#details')) byId('details').close();
      notify(result.ok ? 'Добавлено в корзину' : result.error);
    }
  });
  byId('subscribe')?.addEventListener('submit', event => { event.preventDefault(); showNote('subscribe'); });
  const notice = byId('cookie-notice');
  if (notice) {
    try { notice.hidden = localStorage.getItem('hlebno-browser-notice') === 'read'; }
    catch { notice.hidden = false; }
    byId('cookie-close').addEventListener('click', () => {
      notice.hidden = true;
      try { localStorage.setItem('hlebno-browser-notice', 'read'); }
      catch { /* Dismissal still applies on this page. */ }
    });
  }
  const updateCounter = () => document.querySelector('.count').classList.toggle('zero', cart.count() === 0);
  window.addEventListener('hlebno-cart-change', updateCounter);
  updateCounter();
})();
