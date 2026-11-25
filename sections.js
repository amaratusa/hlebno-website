'use strict';

(() => {
  const main = document.getElementById('main');
  const view = document.body.dataset.view;
  const { photos, recipes, jobs } = window.HlebnoSections;
  const { cart, products, money, notify } = window.HlebnoShop;
  const { svg } = window.HlebnoIcons;
  const params = new URLSearchParams(location.search);
  const states = new Set(['error', 'success', 'empty']);
  const state = states.has(params.get('state')) ? params.get('state') : '';
  const pureLink = (title, href, style = '') => `<a class="pill ${style}" href="${href}">${title}</a>`;
  const path = (page, id) => page + '.html' + (id ? '?id=' + encodeURIComponent(id) : '');
  const picture = (asset, css = '', alt = '') => `<img class="${css}" src="${photos[asset] || asset}" alt="${alt}">`;
  const productLink = item => item.url || path('product', item.id);
  const productPrice = item => item.variants ? 'от ' + money(Math.min(...item.variants.map(v => v.price))) : money(item.price);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const getIdentified = (list, fallback) => list.find(item => item.id === params.get('id')) || fallback;
  const show = (html, title) => {
    main.innerHTML = html;
    if (title) document.title = title + ' — ХЛЕБНО';
  };

  function breadcrumbs(title, parent) {
    return `<nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a> /${parent ? ` <a href="${parent[1]}">${parent[0]}</a> /` : ''} <span>${title}</span></nav>`;
  }

  function heading(title, copy, parent) {
    return `<header class="section-heading">${breadcrumbs(title, parent)}<h1>${title}</h1>${copy ? `<p>${copy}</p>` : ''}</header>`;
  }

  function banner({ title, copy, image, tone = '', kicker = '', actions = '', note = '', headingTag = 'h1' }) {
    return `<section class="section-banner ${tone}">${picture(image, 'section-banner-photo')}<div class="section-banner-content">
      ${kicker ? `<p class="tag">${kicker}</p>` : ''}<${headingTag}>${title}</${headingTag}><p>${copy}</p>${actions ? `<div class="section-actions">${actions}</div>` : ''}
      ${note ? `<span class="section-hand" aria-hidden="true">${note}</span>` : ''}</div><span class="catalog-star" aria-hidden="true"></span></section>`;
  }

  function card(item, showCatalogDetails) {
    if (!item) return '';
    const meta = showCatalogDetails && window.HlebnoCatalog.items.find(entry => entry.id === item.id);
    const status = meta && window.HlebnoBasket.productStatus(item.id);
    const favorite = `<button class="catalog-save" type="button" data-favorite-id="${item.id}" data-favorite-name="${escapeHtml(item.name)}">${svg('heart')}</button>`;
    const add = item.variants || item.available === false
      ? `<a class="catalog-add ${item.available === false ? 'unavailable' : ''}" href="${productLink(item)}" aria-label="Открыть карточку: ${escapeHtml(item.name)}">${svg('arrowRight')}</a>`
      : `<button class="catalog-add" data-add="${item.id}" aria-label="Добавить в корзину: ${escapeHtml(item.name)}">${svg('plus')}</button>`;
    return `<article class="catalog-card">
      <div class="catalog-card-media"><a class="catalog-card-photo" href="${productLink(item)}" aria-label="${escapeHtml(item.name)}">${picture(meta?.image || item.image)}</a>${meta?.badge ? `<span class="catalog-badge" data-tone="${meta.status}">${meta.badge}</span>` : ''}${favorite}</div>
      <div class="catalog-card-copy"><h3><a href="${productLink(item)}">${escapeHtml(item.name)}</a></h3>
      ${meta ? `<p class="catalog-description">${meta.text}</p><p class="catalog-status" data-status="${status.key || ''}">${status.label}</p>` : ''}
      <div class="catalog-card-footer"><div class="catalog-price"><strong>${productPrice(item)}</strong><span>${item.weight || ''}</span></div>${add}</div></div>
    </article>`;
  }

  const cards = (ids, showCatalogDetails = false) => '<div class="section-product-grid">' + ids.map(id => card(products.get(id), showCatalogDetails)).join('') + '</div>';
  const collection = (title, ids, extra = '') => `<section class="section-block"><div class="section-block-head"><h2>${title}</h2>${extra}</div>${cards(ids)}</section>`;
  const editorial = (title, copy, photo, actions = '', extraClass = '') =>
    `<section class="editorial-split ${extraClass}"><div><h2>${title}</h2><p>${copy}</p>${actions}</div>${picture(photo)}</section>`;
  const infoCards = items => `<div class="info-grid">${items.map(([title, copy]) => `<article class="paper-card"><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;
  const byIds = (...ids) => ids.map(id => products.get(id)).filter(Boolean);
  const recommendations = () => '<section class="basket-rec section-block"><h2>Добавить к заказу</h2>' + cards(['pistachio', 'tart', 'roll', 'cheese-board'], true) + '</section>';

  function hydrateFavorites() {
    for (const control of main.querySelectorAll('[data-favorite-id]')) window.refreshHlebnoFavorite(control);
  }
  function addMany(ids) {
    const results = ids.map(id => cart.add(id));
    const count = results.filter(result => result.ok).length;
    notify(count ? 'Добавлено в корзину' : results[0]?.error || 'Товары недоступны');
  }

  function seasonal() {
    show(breadcrumbs('Сезонное') + banner({ title: 'Зимний стол', copy: 'Хлеб на закваске, выдержанные сыры и горячий кофе.', image: 'panorama', tone: 'blue', kicker: 'Сезонная коллекция', actions: pureLink('Смотреть подборку', '#winter-products') }) +
      '<div id="winter-products">' + collection('Зимняя подборка', ['artisan', 'focaccia', 'roasted-bowl', 'bread-gift']) + '</div>' +
      editorial('Гастрономические пары', 'Что подать к свежему хлебу, выдержанному сыру и тёплой выпечке.', 'pairs', pureLink('Смотреть пары', 'pairs.html', 'dark'), 'black') +
      collection('Подарки к столу', ['bread-gift', 'cheese-board', 'tart'], pureLink('Смотреть подарки', 'gifts.html')));
  }

  function pairs() {
    show(breadcrumbs('Гастрономические пары', ['Сезонное', 'seasonal.html']) +
      banner({ title: 'Гастрономические<br>пары', copy: 'Подбираем продукты, которые дополняют друг друга за столом.', image: 'pairs', tone: 'black', kicker: 'Вместе вкуснее' }) +
      collection('Хлеб и выдержанные сыры', ['artisan', 'cheese-board']) +
      collection('Завтрак без спешки', ['croissant', 'yogurt']) +
      collection('К обеду', ['focaccia', 'roasted-bowl']));
  }

  function gifts() {
    const gift = products.get('bread-gift');
    show(breadcrumbs('Подарки', ['Сезонное', 'seasonal.html']) +
      `<div class="detail-columns">${picture('gift', 'detail-cover', 'Подарочная коробка с синей лентой')}<div class="detail-summary"><p class="tag">Подарок к столу</p><h1>${gift.name}</h1>
      <p>Хлеб, джем, масло и открытка для тёплых слов.</p><strong class="big-price">${money(gift.price)}</strong><button class="pill orange" data-add="bread-gift">В корзину</button><p class="muted">Позиция демонстрационной витрины</p></div></div>` +
      '<section class="section-block"><h2>Что внутри</h2>' + infoCards([['Хлеб', 'На закваске.'], ['Джем', 'К хлебу и завтраку.'], ['Масло', 'Для тёплых тостов.'], ['Открытка', 'Для личного пожелания.']]) + '</section>');
  }

  function lab() {
    show(breadcrumbs('ХЛЕБНО LAB') + banner({ title: 'ХЛЕБНО<br>LAB', copy: 'Экспериментируем со вкусами и работаем с локальными производителями.', image: 'lab', tone: 'black', kicker: 'Лаборатория вкуса', actions: pureLink('Смотреть дроп', 'drop.html') }) +
      editorial('Как устроена лаборатория', 'Пробуем рецептуры, собираем небольшие партии и знакомим гостей с новыми сочетаниями.', 'orange') +
      '<section class="section-block">' + infoCards([['Эксперимент', 'Пробуем новое сочетание вкусов.'], ['Лимит', 'Каждый выпуск собираем небольшой партией.'], ['Люди и идеи', 'Приглашаем к работе локальных производителей.']]) + '</section>' +
      collection('Лимитированные новинки', ['focaccia', 'pistachio', 'bruschetta', 'tart']) +
      '<section class="section-band"><h2>Следующие партии</h2>' + infoCards([['Зимняя закваска', 'Хлеб для зимнего стола.'], ['Праздничный стол', 'Сезонная выпечка и гастрономия.'], ['Локальное сотрудничество', 'Анонсы появятся ближе к запуску.']]) + '</section>' +
      editorial('Узнавайте о новых партиях', 'Следите за анонсами ХЛЕБНО LAB на сайте.', 'orange', pureLink('Текущий дроп', 'drop.html', 'dark'), 'orange-band'));
  }

  function drop() {
    show(breadcrumbs('Зимний дроп', ['ХЛЕБНО LAB', 'lab.html']) +
      banner({ title: 'Зимний дроп', copy: 'Сочетания хлеба, выпечки и гастрономии для зимнего стола.', image: 'lab', tone: 'green', kicker: 'ХЛЕБНО LAB', actions: pureLink('Смотреть состав', '#drop-items') }) +
      '<div id="drop-items">' + collection('Что входит в дроп', ['artisan', 'focaccia', 'pistachio', 'cheese-board']) + '</div>' +
      editorial('Небольшие партии', 'Начинаем с нескольких вкусов и делимся тем, что хочется повторить.', 'orange'));
  }

  const recipeCards = list => list.length ? `<div class="recipe-grid">${list.map(item => `<article class="recipe-card"><a href="${path('recipe', item.id)}">${picture(item.photo)}<span class="pill recipe-category">${item.group}</span><div><h2>${item.title}</h2><p>${item.time}</p></div></a></article>`).join('')}</div>` : '<p class="empty-message">По этому запросу рецептов нет.</p>';

  function recipeList() {
    const groups = ['Все', ...new Set(recipes.map(item => item.group))];
    show(breadcrumbs('Рецепты') + banner({ title: 'Рецепты', copy: 'Простые идеи для завтрака, обеда и ужина с продуктами ХЛЕБНО.', image: 'breakfast', kicker: 'Из витрины на стол' }) +
      `<div class="section-tabs" aria-label="Категории рецептов">${groups.map((name, i) => `<button class="pill" data-recipe-group="${i}" aria-pressed="${i === 0}">${name}</button>`).join('')}</div><div id="recipe-cards">${recipeCards(recipes)}</div>`);
    main.querySelector('.section-tabs').addEventListener('click', event => {
      const control = event.target.closest('[data-recipe-group]');
      if (!control) return;
      const at = Number(control.dataset.recipeGroup);
      main.querySelectorAll('[data-recipe-group]').forEach(button => button.setAttribute('aria-pressed', String(control === button)));
      document.getElementById('recipe-cards').innerHTML = recipeCards(at ? recipes.filter(item => item.group === groups[at]) : recipes);
    });
  }

  function recipeDetail() {
    const item = getIdentified(recipes, recipes[0]);
    show(breadcrumbs(item.title, ['Рецепты', 'recipes.html']) +
      `<div class="detail-columns">${picture(item.photo, 'detail-cover', item.title)}<div class="detail-summary">
      <p class="tag">Рецепт из витрины</p><h1>${item.title}</h1><div class="section-tabs"><span class="pill">${item.time}</span><span class="pill">${item.group}</span></div>
      <div class="paper-card black"><h2>Купить всё для рецепта</h2><p>Товары из каталога ХЛЕБНО</p><button class="pill orange" id="recipe-add">В корзину</button></div></div></div>
      <section class="two-col section-block"><article><h2>Ингредиенты</h2><ul>${item.ingredients.map(part => `<li>${part}</li>`).join('')}</ul>${cards(item.products)}</article>
      <article><h2>Шаги</h2><ol class="recipe-steps">${item.steps.map(step => `<li>${step}</li>`).join('')}</ol></article></section>`, item.title);
    document.getElementById('recipe-add').addEventListener('click', () => addMany(item.products));
  }

  function aboutNav(current) {
    return `<nav class="about-nav" aria-label="Раздел о бренде">${[['about','О бренде'],['team','Команда'],['careers','Вакансии']].map(([key, label]) => `<a href="${path(key)}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  }

  function about() {
    show(aboutNav('about') + breadcrumbs('О нас') +
      banner({ title: 'О нас', copy: 'ХЛЕБНО — ремесленная пекарня и гастрономия. Готовимся к открытию в Петербурге.', image: 'lab', tone: 'black', kicker: 'Еда. Люди. Культура.' }) +
      editorial('Делаем жизнь вкуснее', 'Начали с семейной пекарни и хлеба на закваске. Сегодня собираем витрину из выпечки, сыров и гастрономии, с которыми хочется разделить обычный обед или праздничный стол.', 'orange') +
      '<section class="section-block"><h2>На что опираемся</h2>' +
      infoCards([['Настоящий вкус','Печём хлеб и выбираем продукты, про состав и происхождение которых можем рассказать.'],['Люди','Пекари, поставщики и гости делают ХЛЕБНО живым.'],['Сезон и место','Подбираем продукты по сезону и знакомимся с локальными производителями.'],['Честность','Рассказываем, когда новая партия появится на витрине.']]) + '</section>' +
      '<section class="section-band"><h2>ХЛЕБНО сегодня</h2><p>Готовим первую петербургскую витрину и собираем команду.</p></section>' +
      `<section class="section-block"><h2>Где рождается вкус</h2><div class="photo-mosaic">${picture('lab')}${picture('dough')}${picture('bread')}</div><div class="section-block-head"><p>Санкт-Петербург · скоро открытие</p>${pureLink('Найти магазин', 'stores.html')}</div></section>`);
  }

  function team() {
    const people = [['П','Пекари'],['К','Кондитеры'],['Г','Гастрономы'],['КХ','Кухня'],['У','Управление'],['Б','Бариста'],['С','Сборка заказов'],['КМ','Коммуникации']];
    show(aboutNav('team') + breadcrumbs('Команда', ['О нас', 'about.html']) +
      banner({ title: 'Команда', copy: 'Пекари, витрина, кухня и все, кто собирает ХЛЕБНО каждый день.', image: 'dough', note: 'Люди важнее<br>витрины' }) +
      '<section class="section-block"><h2>Кто делает ХЛЕБНО</h2><div class="team-grid">' + people.map(([initials, label]) => `<article class="paper-card"><span aria-hidden="true">${initials}</span><h3>${label}</h3></article>`).join('') + '</div></section>' +
      '<section class="section-band"><h2>Как мы работаем</h2>' + infoCards([['Передаём смену','Делимся деталями о выпечке и витрине.'],['Дегустируем сами','Пробуем новые партии до того, как они появятся на витрине.'],['Учимся в деле','Осваиваем процессы вместе с командой.']]) + pureLink('Смотреть вакансии','careers.html') + '</section>');
  }

  function careers() {
    const groups = ['Все направления', ...new Set(jobs.map(job => job.group))];
    const list = entries => entries.map(job => `<a class="paper-card vacancy-row" href="${path('vacancy', job.id)}"><div><p class="tag">Санкт-Петербург · ${job.group}</p><h2>${job.title}</h2><p>${job.summary}</p></div><span aria-hidden="true">→</span></a>`).join('');
    show(aboutNav('careers') + breadcrumbs('Вакансии', ['О нас', 'about.html']) +
      banner({ title: 'Вакансии', copy: 'Команда для пекарни, витрины и кухни. Готовимся к открытию в Петербурге.', image: 'orange', note: 'Приходите<br>печь с нами' }) +
      `<div class="section-tabs" aria-label="Направления">${groups.map((group, i) => `<button class="pill" data-job-group="${i}" aria-pressed="${i === 0}">${group}</button>`).join('')}</div><div class="section-stack" id="jobs-list">${list(jobs)}</div>`);
    main.querySelector('.section-tabs').addEventListener('click', event => {
      const control = event.target.closest('[data-job-group]');
      if (!control) return;
      const at = Number(control.dataset.jobGroup);
      main.querySelectorAll('[data-job-group]').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
      document.getElementById('jobs-list').innerHTML = list(at ? jobs.filter(job => job.group === groups[at]) : jobs);
    });
  }

  const field = (label, name, type = 'text', required = true, attrs = '') =>
    `<label class="field"><span>${label}${required ? ' *' : ''}</span><input name="${name}" type="${type}" ${required ? 'required' : ''} ${attrs}></label>`;
  const textarea = (label, name, required = false) => `<label class="field"><span>${label}${required ? ' *' : ''}</span><textarea name="${name}" rows="4" ${required ? 'required' : ''}></textarea></label>`;
  const consent = title => `<label class="consent"><input type="checkbox" required><span>${title}</span></label>`;
  const formError = message => `<p class="form-error" role="alert"${state === 'error' ? '' : ' hidden'}>${message}</p>`;
  const formActions = (label, note = 'Проверка формы в закрытой версии сайта.') =>
    `<button class="pill orange" type="submit">${label}</button><small>${note}</small>`;
  const successBox = (title, copy, action) => `<div class="paper-card success-box"><span class="success-icon">${svg('check')}</span><h2>${title}</h2><p>${copy}</p>${action || ''}</div>`;
  function localForm(onSuccess) {
    const form = main.querySelector('[data-local-form]');
    if (!form) return;
    const error = form.querySelector('.form-error');
    form.addEventListener('invalid', () => { if (error) error.hidden = false; }, true);
    form.addEventListener('submit', event => { event.preventDefault(); onSuccess(form); });
  }

  function vacancy() {
    const job = getIdentified(jobs, jobs[0]);
    show(aboutNav('careers') + breadcrumbs(job.title, ['Вакансии', 'careers.html']) + `<div class="two-col section-stack">
      <section class="section-stack"><div class="section-heading"><p class="tag">${job.group} · Санкт-Петербург</p><h1>${job.title}</h1><p>${job.summary}</p></div>
      <div><h2>Задачи</h2><ul><li>${job.summary}</li><li>Соблюдать процессы смены и порядок на рабочем месте.</li><li>Работать вместе с командой пекарни.</li></ul></div>
      <div><h2>Кого ищем</h2><p>Людей, которым интересно ремесло, внимательная работа и вкусная еда.</p></div><div><h2>Условия</h2><p>График, требования и условия уточняются к открытию.</p></div></section>
      ${state === 'success' ? successBox('Отклик проверен', 'Это тестовый сценарий. Резюме и контакты остались в браузере.', pureLink('Смотреть вакансии', 'careers.html')) :
      `<form class="paper-card tall-form" data-local-form><h2>Откликнуться</h2><p class="subtle">На вакансию «${job.title}»</p>${formError('Проверьте поля отклика.')}${field('Имя','name')}${field('Телефон','tel','tel',false)}${field('Электронная почта','email','email',false)}
      ${field('Резюме','resume','file',true,'accept=".pdf,.doc,.docx"')}${consent('Подтверждаю использование тестовых данных.')}${formActions('Проверить отклик')}</form>`}
      </div>`, job.title);
    localForm(form => {
      const fields = form.elements;
      if (!fields.tel.value.trim() && !fields.email.value.trim()) {
        const error = form.querySelector('.form-error');
        error.textContent = 'Введите телефон или электронную почту.';
        error.hidden = false;
        fields.tel.focus();
        return;
      }
      location.href = path('vacancy', job.id) + '&state=success';
    });
  }

  function stores(single = false) {
    const title = single ? 'ХЛЕБНО в Петербурге' : 'Магазины';
    show(heading(title, 'Готовимся к открытию в Санкт-Петербурге.', single ? ['Магазины', 'stores.html'] : null) +
      `<div class="two-col store-layout"><div class="paper-card"><h2>Санкт-Петербург</h2><p class="subtle">Скоро открытие</p><p>Адрес, часы работы и условия самовывоза появятся перед открытием.</p>
      ${single ? pureLink('Контакты', 'contacts.html', 'orange') : pureLink('О петербургской точке', 'store.html', 'orange')}</div>${picture('lab','detail-cover','Гастрономия ХЛЕБНО')}</div>`);
  }

  function delivery() {
    show(heading('Доставка и самовывоз', 'Условия для петербургской пекарни уточняем к открытию.') +
      infoCards([['Самовывоз','Адрес точки и часы выдачи опубликуем перед открытием.'],['Доставка','Зоны, сроки и минимальная сумма заказа появятся здесь после согласования.']]) +
      `<section class="section-block"><h2>Как оформить заказ</h2><p>В закрытой версии можно собрать корзину и пройти тестовое оформление.</p><div class="section-actions">${pureLink('Перейти в каталог','catalog.html','orange')}${pureLink('Вопросы и ответы','faq.html')}</div></section>`);
  }

  function contacts() {
    show(heading('Контакты', 'ХЛЕБНО · Санкт-Петербург') +
      `<div class="two-col section-stack"><section class="paper-card"><h2>Связаться с ХЛЕБНО</h2><p>Адрес, телефон и часы работы сообщим ближе к открытию.</p>${pureLink('Магазины','stores.html')}</section>
      ${state === 'success' ? successBox('Форма проверена','Это тестовое обращение. Данные остались в браузере.',pureLink('Вернуться к контактам','contacts.html')) :
      `<form class="paper-card tall-form" data-local-form><h2>Написать нам</h2>${formError('Проверьте имя, электронную почту и сообщение.')}${field('Имя','name')}${field('Электронная почта','email','email')}${textarea('Сообщение','message',true)}${consent('Подтверждаю использование тестовых данных.')}${formActions('Проверить форму')}</form>`}
      </div>`);
    localForm(() => { location.href = 'contacts.html?state=success'; });
  }

  function faq() {
    const list = [
      ['Где откроется пекарня?','В Санкт-Петербурге. Адрес и часы работы объявим отдельно.'],
      ['Можно ли уже оформить заказ?','Сейчас доступно демонстрационное оформление с тестовыми товарами.'],
      ['Как узнать о доставке и самовывозе?','Условия появятся в разделе «Доставка и самовывоз» ближе к открытию.'],
      ['Где посмотреть состав продуктов?','Откройте нужный товар в каталоге. Подтверждённый состав и сведения об аллергенах появятся перед запуском.'],
      ['Как сохранить понравившийся товар?','Нажмите сердечко на карточке. Избранное сохранится в этом браузере.']
    ];
    show(heading('Вопросы и ответы','О магазине, продуктах и заказах.') + `<div class="two-col section-stack"><section class="paper-card faq-list">${list.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
      <aside class="paper-card black"><h2>Остались вопросы?</h2><p>В разделе контактов можно проверить форму обращения.</p>${pureLink('Контакты','contacts.html','orange')}</aside></div>`);
  }

  function product() {
    const id = document.body.dataset.productId || params.get('id');
    const item = products.get(id);
    if (!item) { failure(false); return; }

    const { productPhoto, productStatus } = window.HlebnoBasket;
    const meta = window.HlebnoCatalog.items.find(candidate => candidate.id === id);
    const category = item.category || 'Хлеб';
    const variants = item.variants || [];
    const gallery = item.gallery?.filter(photo => photo.src) || [
      { src: productPhoto(item), label: 'Основное фото' },
      ...(id === 'focaccia' ? [
        { src:'assets/front/focaccia-sm.webp', label:'Фокачча целиком' },
        { src:'assets/front/focaccia.webp', label:'Крупный план фокаччи' }
      ] : [])
    ];
    const badge = meta?.badge || (meta?.seasonal ? 'Сезон' : '');
    const recommendations = ['cheese-board', 'roasted-bowl', 'pistachio', 'tart', 'croissant'].filter(candidate => candidate !== id).slice(0,4);
    const characteristics = [
      ['Состав', item.ingredients || 'Подтверждённый состав появится перед запуском.'],
      ['Аллергены', item.allergens || 'Сведения об аллергенах уточняются.'],
      ['Хранение', item.storage || 'Условия хранения уточняются.'],
      ['Изготовитель', item.maker || 'Данные изготовителя уточняются.']
    ];
    const nutrition = item.nutrition || [['Калорийность','ккал'],['Белки','г'],['Жиры','г'],['Углеводы','г']];
    const nav = gallery.map((photo, i) => `<button type="button" data-gallery-index="${i}" aria-label="${photo.label}, фото ${i+1}" aria-pressed="${i===0}">${picture(photo.src)}</button>`).join('');
    const dots = gallery.map((_, i) => `<button type="button" data-gallery-index="${i}" aria-label="Показать фото ${i+1}" aria-pressed="${i===0}"></button>`).join('');
    const features = [
      ['store','Самовывоз','Адрес и время выдачи уточняются.'],
      ['truck','Доставка','Зоны и стоимость уточняются к открытию.'],
      ['clock','Свежесть','Условия хранения указаны в разделе о продукте.']
    ];
    const buy = `<form id="product-buy">
      ${variants.length ? `<div class="pdp-choices">
        <label>Вес<select name="variant">${variants.map(variant => `<option value="${variant.id}">${variant.weight} г</option>`).join('')}</select></label>
        <label>Нарезка<select name="slicing"><option value="whole">Без нарезки</option><option value="sliced">В нарезке</option></select></label>
      </div>` : ''}
      <div class="pdp-buy-row">
        <div class="commerce-quantity" aria-label="Количество">
          <button type="button" id="pdp-less" aria-label="Уменьшить количество">${svg('minus')}</button><output id="pdp-quantity" aria-live="polite">1</output><button type="button" id="pdp-more" aria-label="Увеличить количество">${svg('plus')}</button>
        </div>
        <button type="submit" class="pill orange" id="pdp-add"><span id="pdp-add-label">В корзину</span></button>
        <button type="button" class="pdp-favorite" data-favorite-id="${id}" data-favorite-name="${escapeHtml(item.name)}">${svg('heart')}</button>
      </div><p class="pdp-error" id="pdp-purchase-error" role="status"></p>
      ${variants.length ? '<label class="pdp-sound"><input type="checkbox" id="pdp-sound"> Тихий звук при добавлении</label><small id="pdp-sound-status" class="muted"></small>' : ''}
    </form>`;

    show(`<nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a> / <a href="catalog.html">Продукты</a> / <a href="catalog.html?category=${encodeURIComponent(category)}">${category}</a> / <span>${escapeHtml(item.name)}</span></nav>
      <div class="pdp-layout">
        <div class="pdp-gallery${gallery.length < 2 ? ' single-photo' : ''}">
          ${gallery.length > 1 ? `<div class="pdp-gallery-rail" aria-label="Фотографии товара">${nav}</div>` : ''}
          <div class="pdp-photo-wrap">
            ${picture(gallery[0].src, 'pdp-photo', escapeHtml(item.name))}
            ${badge ? `<span class="pdp-badge">${badge}</span>` : ''}
            <button type="button" id="pdp-zoom" aria-label="Увеличить фото">${svg('search')}</button>
            ${gallery.length > 1 ? `<div class="pdp-dots" aria-label="Переключить фото">${dots}</div>` : ''}
          </div>
        </div>
        <div class="pdp-summary">
          <p class="tag">${category}</p><h1>${escapeHtml(item.name)}</h1>
          <p class="pdp-description">${item.subtitle || meta?.text || ''}</p>
          <div class="pdp-price"><strong id="pdp-price"></strong><span id="pdp-weight"></span></div>
          <div class="pdp-stock"><span class="catalog-status" id="pdp-stock"></span><a href="stores.html">Магазины</a></div>
          ${buy}
          <ul class="pdp-fulfillment">${features.map(([icon,label,copy]) => `<li><span>${svg(icon)}</span><div><strong>${label}</strong><p>${copy}</p></div></li>`).join('')}</ul>
        </div>
      </div>
      <section class="pdp-details">
        <div><h2>О продукте</h2>
          ${item.description?.length ? `<details><summary>Описание</summary><div>${item.description.map(text => `<p>${text}</p>`).join('')}</div></details>` : ''}
          ${characteristics.map(([label,text], i) => `<details ${i<2 ? 'open' : ''}><summary>${label}</summary><p>${text}</p></details>`).join('')}
        </div>
        <div class="pdp-nutrition">
          <h3>Пищевая ценность · на 100 г</h3>
          <dl>${nutrition.map(([label,unit,value]) => `<div><dt>${label}</dt><dd>${value == null ? '—' : value + ' ' + unit}</dd></div>`).join('')}</dl>
          <p>Данные уточняются перед запуском.</p>
        </div>
      </section>
      <section class="pdp-related" aria-labelledby="pdp-related-title">
        <article class="pdp-pairing">${picture('pairs','backdrop')}<p class="tag">Идеальные сочетания</p><h2 id="pdp-related-title">С этим<br>берут</h2><p>Дополните покупку продуктами к столу.</p>${pureLink('Смотреть пары →','pairs.html')}</article>
        ${cards(recommendations, true)}
      </section>
      <dialog id="pdp-photo-dialog" aria-label="Фото товара"><button class="close" type="button" aria-label="Закрыть фото">${svg('close')}</button>${picture(gallery[0].src, 'pdp-zoom-photo', escapeHtml(item.name))}</dialog>`, item.name);

    const form = document.getElementById('product-buy');
    const controls = [...main.querySelectorAll('[data-gallery-index]')];
    const full = main.querySelector('.pdp-photo');
    const zoom = document.getElementById('pdp-photo-dialog');
    for (const control of controls) control.addEventListener('click', () => {
      const index = Number(control.dataset.galleryIndex);
      full.src = gallery[index].src;
      for (const button of controls) button.setAttribute('aria-pressed', String(Number(button.dataset.galleryIndex) === index));
    });
    document.getElementById('pdp-zoom').addEventListener('click', () => {
      zoom.querySelector('img').src = full.src;
      zoom.showModal();
    });

    const more = document.getElementById('pdp-more');
    const less = document.getElementById('pdp-less');
    const add = document.getElementById('pdp-add');
    const addLabel = document.getElementById('pdp-add-label');
    const quantity = document.getElementById('pdp-quantity');
    const errorOutput = document.getElementById('pdp-purchase-error');
    const stock = document.getElementById('pdp-stock');
    const variantSelect = form.elements.namedItem('variant');
    const slicingSelect = form.elements.namedItem('slicing');
    let qty = 1;
    let feedback;
    const currentVariant = () => variants.find(variant => variant.id === variantSelect?.value);

    function update() {
      const variant = currentVariant();
      if (slicingSelect) {
        slicingSelect.options[1].disabled = !variant.slicingEnabled;
        if (!variant.slicingEnabled) slicingSelect.value = 'whole';
      }
      const price = variant ? variant.price : item.price;
      const error = cart.reason(item.id, variant?.id, slicingSelect?.value || 'whole', qty);
      const finite = Number.isFinite(price);
      document.getElementById('pdp-price').textContent = finite ? money(price) : 'Цена уточняется';
      const weight = variant ? variant.weight + ' г' : item.weight || '';
      const grams = variant?.weight || Number(weight.match(/^(\d+) г$/)?.[1]);
      document.getElementById('pdp-weight').textContent = weight + (finite && grams > 0 ? ' · ' + money(Math.round(price * 100 / grams)) + ' за 100 г' : '');
      const status = variant && (variant.available !== true || !variant.stock)
        ? { key:'unavailable', label:variant.available === false || variant.stock === 0 ? 'Нет в наличии' : 'Наличие уточняется' }
        : productStatus(id);
      stock.dataset.status = status.key || '';
      stock.textContent = status.label;
      quantity.value = qty;
      less.disabled = qty <= 1 || Boolean(feedback?.isBusy());
      more.disabled = item.available === false || qty >= 99 || Boolean(feedback?.isBusy());
      add.disabled = Boolean(error) || Boolean(feedback?.isBusy());
      if (!feedback?.isBusy()) addLabel.textContent = error && !finite ? 'Цена уточняется' : item.available === false ? 'Нет в наличии' : 'В корзину' + (finite ? ' · ' + money(price * qty) : '');
      errorOutput.textContent = error && (variant || item.available !== false) ? error : '';
    }

    if (variants.length) {
      feedback = window.HlebnoPurchaseFeedback.create({
        button: add, label: addLabel, soundToggle: document.getElementById('pdp-sound'),
        soundStatus: document.getElementById('pdp-sound-status'), cartButton: document.querySelector('.cart-open'), onSettled: update
      });
    }
    less.addEventListener('click', () => { qty--; update(); });
    more.addEventListener('click', () => { qty++; update(); });
    variantSelect?.addEventListener('change', () => { qty = 1; update(); });
    slicingSelect?.addEventListener('change', update);
    window.addEventListener('hlebno-cart-change', update);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (add.disabled) return;
      const variant = currentVariant();
      const result = cart.add(item.id, variant?.id, slicingSelect?.value || 'whole', qty);
      notify(result.ok ? 'Добавлено в корзину' : result.error);
      if (result.ok && feedback) { feedback.success(); update(); }
    });
    update();
  }

  function emptyCart() {
    return breadcrumbs('Корзина') +
      banner({title:'Корзина<br>пока пустая',copy:'Выберите что-нибудь из каталога ХЛЕБНО.',image:'croissant',actions:pureLink('Перейти в каталог','catalog.html','orange'),note:'Всё ещё<br>впереди'}) + recommendations();
  }

  function cartRows(items) {
    const { productPhoto, productStatus } = window.HlebnoBasket;
    return items.map(row => {
      const item = row.product;
      const note = row.variant
        ? row.variant.weight + ' г · ' + (row.slicing === 'sliced' ? 'В нарезке' : 'Целый')
        : item.weight || '';
      const status = productStatus(item.id);
      return `<article class="basket-row">
        <a class="basket-image" href="${productLink(item)}">${picture(productPhoto(item),'basket-photo',escapeHtml(item.name))}</a>
        <div class="basket-item-meta"><a class="basket-title" href="${productLink(item)}">${escapeHtml(item.name)}</a>
          <p>${note ? `${note} · ` : ''}${Number.isFinite(row.price) ? money(row.price) + '/шт. · ' : ''}<span class="catalog-status" data-status="${status.key || ''}">${status.label}</span></p>
          ${row.error ? `<p class="form-error">${row.error}</p>` : ''}
        </div>
        <div class="commerce-quantity basket-quantity">
          <button type="button" data-change="${escapeHtml(row.key)}" data-delta="-1" aria-label="Уменьшить количество" ${row.qty <= 1 ? 'disabled' : ''}>${svg('minus')}</button>
          <span>${row.qty}</span>
          <button type="button" data-change="${escapeHtml(row.key)}" data-delta="1" aria-label="Увеличить количество">${svg('plus')}</button>
        </div>
        <strong class="basket-item-total">${row.error ? '—' : money(row.price * row.qty)}</strong>
        <button type="button" class="basket-remove" data-remove="${escapeHtml(row.key)}" aria-label="Убрать из корзины: ${escapeHtml(item.name)}">${svg('trash')}</button>
      </article>`;
    }).join('');
  }

  function orderSummary(items, checkout = false) {
    const total = money(cart.total());
    return `<aside class="paper-card order-summary${checkout ? '' : ' order-summary-cart'}"><h2>${checkout ? 'Ваш заказ' : 'Итого'}</h2>
      ${checkout ? `<ul>${items.map(row => `<li>${row.product.name} × ${row.qty}<strong>${money(row.qty * row.price)}</strong></li>`).join('')}</ul>` : ''}
      <p>Товары (${items.reduce((count,row) => count + row.qty,0)}) <strong>${total}</strong></p>
      ${checkout ? '<p>Получение <span>Уточняется</span></p>' : '<p>Самовывоз <strong>0 ₽</strong></p><p>Доставка <span>Рассчитаем при оформлении</span></p>'}
      ${checkout ? '' : `<form id="basket-promo" class="basket-promo"><label class="sr" for="promo-input">Промокод</label><input id="promo-input" type="text" placeholder="Промокод" required><button class="pill basket-outline" type="submit">Применить</button><p class="basket-promo-status" role="status"></p></form>`}
      <div class="order-total">К оплате <strong>${total}</strong></div>
      ${checkout ? '<button class="pill orange" type="submit" form="checkout-form">Проверить заказ</button>' :
        cart.total() > 0 ? pureLink('Оформить заказ ' + svg('arrowRight'),'checkout.html','orange basket-checkout') : '<p class="muted">Для оформления нужен доступный товар.</p>'}
      <small>Демонстрационное оформление · без оплаты</small></aside>`;
  }

  function basket() {
    const items = cart.items();
    if (!items.length || state === 'empty') { show(emptyCart()); hydrateFavorites(); return; }
    const { deliveryHint, threshold, countLabel } = window.HlebnoBasket;
    const total = cart.total();
    const progress = Math.min(100,total / threshold * 100);
    show(`<header class="basket-heading">${breadcrumbs('Корзина')}
      <div><h1>Корзина</h1><p>${countLabel(cart.count())}</p><span class="catalog-star" aria-hidden="true"></span></div></header>
      <div class="basket-layout">
        <div class="basket-list">
          <div class="basket-progress"><div class="basket-progress-caption">${svg('truck')} <span>${deliveryHint(total)}</span><small>Демо</small></div>
            <div class="basket-track" role="progressbar" aria-label="Демонстрационный порог бесплатной доставки" aria-valuemin="0" aria-valuemax="${threshold}" aria-valuenow="${Math.min(total,threshold)}"><span style="width:${progress}%"></span></div>
            <div class="basket-track-labels"><span>${money(total)}</span><span>${money(threshold)}</span></div></div>
          ${cartRows(items)}
        </div>${orderSummary(items)}
      </div>` + recommendations());
    document.getElementById('basket-promo').addEventListener('submit', event => {
      event.preventDefault();
      event.currentTarget.querySelector('[role="status"]').textContent = 'Промокоды недоступны в демо-версии.';
    });
    hydrateFavorites();
  }

  function checkout() {
    const items = cart.items().filter(row => !row.error);
    if (!items.length) { show(emptyCart()); return; }
    const block = (title, content) => `<section class="paper-card form-block"><h2>${title}</h2>${content}</section>`;
    show(heading('Оформление','Проверьте тестовый сценарий заказа.', ['Корзина','cart.html']) +
      `<div class="basket-layout"><form id="checkout-form" class="section-stack" data-local-form>
      ${formError('Проверьте контакты и выбранный способ получения.')}
      ${block('Контакты',`<div class="two-col">${field('Имя','name')}${field('Телефон','tel','tel',true,'pattern="[+0-9 ]{7,22}"')}${field('Электронная почта','email','email',false)}</div>`)}
      ${block('Способ получения','<div class="two-col choice-grid"><label><input type="radio" name="receipt" value="pickup" checked> Самовывоз</label><label><input type="radio" name="receipt" value="delivery"> Доставка</label></div>')}
      ${block('Получение заказа', '<p id="checkout-receipt">Самовывоз · Санкт-Петербург. Адрес и график уточняются.</p>')}
      ${block('Комментарий к заказу', textarea('Пожелания','comment'))}
      ${block('Оплата','<p>Тестовое оформление. Оплата в этой версии недоступна.</p>')}
      ${block('Согласия',consent('Подтверждаю, что использую тестовые данные.'))}
      </form>${orderSummary(items,true)}</div>`);
    const form = document.getElementById('checkout-form');
    form.addEventListener('change', () => {
      document.getElementById('checkout-receipt').textContent = form.elements.receipt.value === 'delivery'
        ? 'Доставка · Санкт-Петербург. Зоны и график уточняются.'
        : 'Самовывоз · Санкт-Петербург. Адрес и график уточняются.';
    });
    localForm(() => {
      writeSession('hlebno-demo-order', items.map(row => ({ id:row.productId, qty:row.qty })));
      location.href = 'order.html';
    });
  }

  function order() {
    show(breadcrumbs('Заказ принят', ['Корзина','cart.html']) +
      banner({ title:'Тестовый заказ<br>проверен', copy:'Корзина доступна для дальнейшей проверки. Платёж и отправка заказа не выполнялись.', image:'orange',tone:'green',actions:pureLink('Вернуться к покупкам','catalog.html') }) +
      '<section class="section-block">' + infoCards([['Ваш заказ','Тестовый сценарий оформления завершён.'],['Получение','Условия выдачи уточняются к открытию.']]) + '</section>');
  }

  function search() {
    show(heading('Поиск','Ищите продукты и рецепты ХЛЕБНО.') +
      `<form class="site-search" id="site-search"><label class="sr" for="site-query">Поисковый запрос</label><input id="site-query" type="search" placeholder="Например, круассан"><button class="pill dark" type="submit">Найти</button></form>
      <div class="section-tabs" id="search-tabs"><button class="pill" data-search-type="products" aria-pressed="true">Товары</button><button class="pill" data-search-type="recipes" aria-pressed="false">Рецепты</button></div><div id="search-results"></div>`);
    const input = document.getElementById('site-query');
    const output = document.getElementById('search-results');
    let mode = params.get('type') === 'recipes' ? 'recipes' : 'products';
    input.value = params.get('q') || '';
    const render = () => {
      const query = input.value.trim().toLocaleLowerCase('ru');
      document.querySelectorAll('[data-search-type]').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.searchType === mode)));
      if (mode === 'recipes') output.innerHTML = recipeCards(recipes.filter(recipe => recipe.title.toLocaleLowerCase('ru').includes(query)));
      else {
        const items = window.HlebnoCatalog.items.map(item => products.get(item.id)).filter(item => item.name.toLocaleLowerCase('ru').includes(query));
        output.innerHTML = items.length ? cards(items.map(item => item.id)) : `<section class="paper-card"><h2>По запросу ничего не нашлось</h2><p>Попробуйте другое название или откройте каталог.</p>${pureLink('Смотреть каталог','catalog.html','orange')}</section>` + recommendations();
      }
      hydrateFavorites();
    };
    document.getElementById('site-search').addEventListener('submit', event => { event.preventDefault(); render(); });
    input.addEventListener('input', render);
    document.getElementById('search-tabs').addEventListener('click', event => {
      const control = event.target.closest('[data-search-type]');
      if (control) { mode = control.dataset.searchType; render(); }
    });
    render();
  }

  const demoAccount = window.HlebnoAccount;
  const authSettings = {
    login: ['Вход', 'Свои<br>люди', 'По e-mail и паролю.', 'Войти'],
    register: ['Регистрация', 'Стать<br>своим', 'По e-mail и паролю.', 'Зарегистрироваться'],
    recover: ['Забыли пароль?', 'Вернуть<br>доступ', 'Введите e-mail для проверки сценария восстановления.', 'Продолжить'],
    'new-password': ['Новый пароль', 'Вернуть<br>доступ', 'Задайте тестовый пароль для проверки формы.', 'Сохранить пароль']
  };
  const accountButton = (label, style = 'orange', type = 'submit', extra = '') =>
    `<button class="pill account-button ${style}" type="${type}" ${extra}>${label}</button>`;
  const accountLink = (label, href) => `<a href="${href}" class="pill account-button account-outline">${label}</a>`;

  function accountField(label, name, { type = 'text', required = true, placeholder = '', icon = '', hint = '', value = '', attrs = '' } = {}) {
    const id = 'account-input-' + name;
    return `<div class="account-field">
      <label for="${id}">${label}${required ? ' <b aria-hidden="true">*</b>' : ''}</label>
      <div class="account-input">
        ${icon ? `<span class="account-field-icon">${svg(icon)}</span>` : ''}
        <input id="${id}" name="${name}" type="${type}" placeholder="${placeholder}" value="${escapeHtml(value)}"
          ${required ? 'required' : ''} ${hint ? `aria-describedby="${id}-hint"` : ''} ${attrs}>
        ${type === 'password' ? `<button type="button" class="password-visibility" aria-label="Показать пароль" aria-pressed="false" aria-controls="${id}">${svg('eye')}</button>` : ''}
      </div>
      ${hint ? `<small id="${id}-hint">${hint}</small>` : ''}
    </div>`;
  }

  function passwordField(label, name, placeholder, newPassword = false) {
    return accountField(label, name, {
      type: 'password', icon: 'lock', placeholder,
      attrs: newPassword ? 'minlength="8" autocomplete="new-password"' : 'autocomplete="current-password"'
    });
  }

  function wireVisibility() {
    for (const control of main.querySelectorAll('.password-visibility')) {
      control.addEventListener('click', () => {
        const input = document.getElementById(control.getAttribute('aria-controls'));
        const reveal = input.type === 'password';
        input.type = reveal ? 'text' : 'password';
        control.innerHTML = svg(reveal ? 'eyeOff' : 'eye');
        control.setAttribute('aria-pressed', String(reveal));
        control.setAttribute('aria-label', reveal ? 'Скрыть пароль' : 'Показать пароль');
      });
    }
  }

  const accountPerks = () => `<ul class="account-perks">
    <li><span>${svg('restart')}</span> Повтор заказа в один клик</li>
    <li><span>${svg('clock')}</span> Статусы и история заказов</li>
    <li><span>${svg('pin')}</span> Любимый магазин по умолчанию</li>
  </ul>`;

  function formFeedback(form, text, field) {
    const error = form.querySelector('.form-error');
    error.textContent = text;
    error.hidden = false;
    field?.focus();
  }

  function auth() {
    const [title, promo, copy, label] = authSettings[view];
    const login = view === 'login';
    const enrollment = view === 'register';
    const reset = view === 'new-password';
    const recover = view === 'recover';
    const success = recover && state === 'success';
    const promoArt = `<section class="auth-promo ${login ? 'auth-promo-login' : ''} ${login || enrollment ? '' : 'auth-promo-recover'}">
      ${picture(login || enrollment ? 'orange' : 'lab', 'auth-promo-photo')}
      <div class="auth-promo-copy"><p class="tag">Личный кабинет</p><h2>${promo}</h2><i class="catalog-star" aria-hidden="true"></i></div>
      <div class="auth-promo-perks">${accountPerks()}</div>
      <span class="auth-promo-hand" aria-hidden="true">Вкуснее<br>жить сейчас</span>
    </section>`;
    const options = login ? `<div class="auth-options"><label class="auth-checkbox"><input type="checkbox" name="remember" checked> Запомнить меня</label><a href="recover.html">Забыли пароль?</a></div>` : '';
    const demo = login ? `<section class="demo-login"><div><p class="tag">Демо-вход</p><strong>demo@hlebno.ru / demo</strong><p>Прототип без настоящей базы. Данные вымышлены.</p></div>${accountButton('Войти как Анна','blue','button','id="demo-login"')}</section>
      <div class="auth-divider">или</div>
      ${accountLink('Продолжить без регистрации', cart.count() ? 'checkout.html' : 'catalog.html')}
      <p class="auth-help auth-centered">Оформить заказ можно и без аккаунта, как гость.</p>
      <p class="auth-centered">Нет аккаунта? <a href="register.html">Зарегистрироваться</a></p>` : '';
    show(`<div class="auth-layout account-auth">${promoArt}
      ${success ? `<section class="account-auth-card"><h1>Восстановление доступа</h1>${successBox('Запрос проверен','Письмо не отправлялось.',pureLink('Проверить следующий шаг','new-password.html','orange'))}</section>` :
      `<form class="account-auth-card" data-local-form>
        <div class="auth-form-title"><h1>${title}</h1><p>${copy}</p></div>
        ${formError('Проверьте, что поля заполнены корректно.')}
        ${enrollment ? accountField('Имя','name',{placeholder:'Как к вам обращаться',icon:'user',attrs:'maxlength="40" autocomplete="given-name"'}) : ''}
        ${!reset ? accountField('E-mail','email',{type:'email',placeholder:'name@example.ru',icon:'mail',attrs:'autocomplete="email"'}) : ''}
        ${enrollment ? accountField('Телефон','tel',{type:'tel',required:false,icon:'phone',placeholder:'+7',hint:'Необязательно. Телефон используют для уведомлений о заказе.',attrs:'autocomplete="tel"'}) : ''}
        ${!recover ? passwordField(reset ? 'Новый пароль' : 'Пароль','password','Пароль',!login) : ''}
        ${enrollment || reset ? passwordField('Повторите пароль','repeat','Ещё раз',true) : ''}
        ${options}
        ${enrollment ? `<label class="auth-checkbox auth-consent"><input type="checkbox" required><span>Согласен на обработку тестовых данных для создания демонстрационного профиля. <b aria-hidden="true">*</b></span></label>` : ''}
        ${accountButton(label + (login || enrollment ? ' ' + svg('arrowRight') : ''))}
        ${enrollment ? '<p class="auth-help">Используйте вымышленные данные. Профиль сохранится в этой вкладке.</p>' : ''}
        ${demo}
        ${!login ? `<p class="auth-centered">${enrollment ? 'Уже есть аккаунт? ' : ''}<a href="login.html">${enrollment ? 'Войти' : 'Вернуться ко входу'}</a></p>` : ''}
      </form>`}
      ${login ? '<div class="auth-mobile-perks">' + accountPerks() + '</div>' : ''}
    </div>`, title);
    if (success) return;

    wireVisibility();
    if (login) document.getElementById('demo-login').addEventListener('click', () => {
      demoAccount.signIn(main.querySelector('[name="remember"]').checked);
      location.href = 'account.html';
    });
    localForm(form => {
      const { email, password, repeat, remember, name, tel } = form.elements;
      if (repeat && repeat.value !== password.value) {
        formFeedback(form, 'Пароли должны совпадать.', repeat);
        return;
      }
      if (login) {
        if (email.value.trim().toLowerCase() !== 'demo@hlebno.ru' || password.value !== 'demo') {
          formFeedback(form, 'Используйте demo@hlebno.ru и пароль demo или нажмите «Войти как Анна».', email);
          return;
        }
        demoAccount.signIn(remember.checked);
      }
      if (enrollment) {
        if (!name.value.trim()) {
          formFeedback(form, 'Введите имя.', name);
          return;
        }
        demoAccount.register({ name: name.value.trim(), email: email.value.trim(), tel: tel.value.trim() });
      }
      location.href = recover ? 'recover.html?state=success' : reset ? 'login.html' : 'account.html';
    });
  }

  const accountLinks = [['account','Профиль'], ['orders','Заказы'], ['favorites','Избранное'], ['addresses','Адреса']];

  function favoriteCount() {
    try {
      const list = JSON.parse(localStorage.getItem('hlebno-favorites') || '[]');
      if (Array.isArray(list)) return list.filter(id => products.has(id)).length;
    } catch { /* Empty state covers unavailable storage. */ }
    return 0;
  }

  function accountLayout(title, content, active) {
    const profile = demoAccount.current();
    const displayName = escapeHtml(profile?.name || 'Гость');
    const initial = escapeHtml(Array.from(profile?.name.trim() || 'Г')[0].toUpperCase());
    const counts = { orders: demoAccount.orderCount(), favorites: favoriteCount(), addresses: readSession('hlebno-demo-address','') || profile?.address ? 1 : 0 };
    const links = accountLinks.map(([key, text]) => `<a href="${path(key)}"${active === key ? ' aria-current="page"' : ''}>${text}${counts[key] ? `<span class="account-tab-count">${counts[key]}</span>` : ''}</a>`).join('');
    const exit = profile
      ? `<button type="button" id="account-logout" class="account-exit" aria-label="Выйти из кабинета">${svg('logout')}</button>`
      : `<a href="login.html" class="account-exit" aria-label="Войти">${svg('logout')}</a>`;
    const sectionTitle = active === 'account' ? `<h1 class="sr">${title}</h1>` : `<h1>${title}</h1>`;
    show(`<header class="account-member">
        ${picture('lab','account-member-photo')}
        <span class="account-avatar" aria-hidden="true">${initial}</span>
        <div class="account-member-name"><p class="tag">Личный кабинет</p><h2><span>Здравствуйте, </span>${displayName}</h2></div>
        <span class="account-greeting" aria-hidden="true">Рады видеть!</span>${exit}
      </header>
      <div class="account-layout account-layout-updated">
        <aside class="account-sidebar">
          <nav class="paper-card account-nav" aria-label="Кабинет">${links}</nav>
          <div class="paper-card green"><h2>Ваш магазин</h2><p>Санкт-Петербург</p>${pureLink('Найти магазин','stores.html')}</div>
        </aside>
        <nav class="account-tabs" aria-label="Разделы кабинета">${links}</nav>
        <section class="account-content">${sectionTitle}${content}</section>
      </div>`, title);
    document.getElementById('account-logout')?.addEventListener('click', () => {
      demoAccount.signOut();
      location.href = 'login.html';
    });
  }

  function readSession(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function writeSession(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); }
    catch { /* The demo remains usable when session storage is disabled. */ }
  }

  function notificationControl(name, label, copy, checked) {
    return `<label class="notification-choice"><span><strong>${label}</strong><small>${copy}</small></span><input type="checkbox" name="${name}" role="switch" ${checked ? 'checked' : ''}></label>`;
  }

  function receiptOption(value, label, copy, icon, current) {
    return `<label class="receipt-option"><input type="radio" name="receipt" value="${value}" ${current === value ? 'checked' : ''}><span class="receipt-option-copy"><strong>${svg(icon)} ${label}</strong><small>${copy}</small></span></label>`;
  }

  function account() {
    const profile = demoAccount.current();
    if (!profile) { location.replace('login.html'); return; }
    const form = `<form class="account-profile-form" data-local-form>${formError('Проверьте поля профиля.')}
      <section class="account-panel"><h2>Личные данные</h2><div class="two-col account-form-grid">
        ${accountField('Имя','name',{value:profile.name,attrs:'maxlength="40" autocomplete="given-name"'})}
        ${accountField('Фамилия','surname',{required:false,value:profile.surname,placeholder:'Необязательно',attrs:'autocomplete="family-name"'})}
        ${accountField('Телефон','tel',{type:'tel',value:profile.tel,placeholder:'+7',hint:'Для SMS о статусе заказа',attrs:'autocomplete="tel"'})}
        ${accountField('E-mail','email',{type:'email',value:profile.email,hint:'Для входа и электронных чеков',attrs:'autocomplete="email"'})}
      </div></section>
      <section class="account-panel"><h2>Получение по умолчанию</h2>
        <div class="two-col receipt-options">
          ${receiptOption('pickup','Самовывоз · Санкт-Петербург','Адрес точки сообщим перед открытием','store',profile.receipt)}
          ${receiptOption('delivery','Доставка','Нужен адрес в зоне доставки','truck',profile.receipt)}
        </div>
        ${accountField('Адрес доставки','address',{required:false,value:profile.address,placeholder:'Улица, дом, квартира — необязательно',hint:'Зона доставки уточняется к открытию.'})}
      </section>
      <section class="account-panel"><h2>Уведомления</h2>
        ${notificationControl('sms','SMS о статусе заказа','Принят, готов к выдаче, изменения',profile.sms)}
        ${notificationControl('news','Новости и сезонные дропы','Письма ХЛЕБНО. Можно отказаться в любой момент.',profile.news)}
      </section>
      <div class="account-form-actions">${accountButton('Сохранить изменения')}${accountButton('Отменить','account-outline','reset')}</div>
      <div class="account-profile-links"><a href="password.html">Сменить пароль</a><button type="button" id="demo-delete-open">Удалить аккаунт</button></div>
      <p role="status" id="profile-result" tabindex="-1"></p>
    </form>
    <dialog id="demo-delete-dialog" aria-labelledby="demo-delete-title">
      <div class="dialog-head"><h2 id="demo-delete-title">Удалить демо-профиль?</h2><button type="button" class="close" aria-label="Закрыть">×</button></div>
      <p>Будут удалены внесённые в этот демо-профиль изменения. Чтобы начать заново, снова войдите как Анна.</p>
      <div class="section-actions">${accountButton('Удалить','orange','button','id="demo-delete"')}<button type="button" class="pill close">Отмена</button></div>
    </dialog>`;
    accountLayout('Профиль',form,'account');
    document.getElementById('demo-delete-open').addEventListener('click', () => document.getElementById('demo-delete-dialog').showModal());
    document.getElementById('demo-delete').addEventListener('click', () => { demoAccount.signOut(); location.href = 'login.html'; });
    localForm(form => {
      const fields = form.elements;
      const name = fields.name.value.trim();
      if (!name) {
        formFeedback(form, 'Введите имя.', fields.name);
        return;
      }
      demoAccount.update({
        name, surname: fields.surname.value.trim(), tel: fields.tel.value.trim(), email: fields.email.value.trim(),
        receipt: fields.receipt.value, address: fields.address.value.trim(), sms: fields.sms.checked, news: fields.news.checked
      });
      location.href = 'account.html?state=success';
    });
    if (state === 'success') document.getElementById('profile-result').textContent = 'Демо-профиль сохранён в этой вкладке.';
  }

  function password() {
    if (!demoAccount.current()) { location.replace('login.html'); return; }
    accountLayout('Сменить пароль',`<form class="account-panel account-password-form" data-local-form>
      <header><h2>Сменить пароль</h2><p>Понадобится текущий пароль. После проверки вы останетесь в кабинете.</p></header>
      ${formError('Проверьте пароль.')}
      ${passwordField('Текущий пароль','current','Пароль')}
      ${passwordField('Новый пароль','password','Новый пароль',true)}
      ${passwordField('Повторите новый пароль','repeat','Ещё раз',true)}
      <p class="auth-help">Не короче 8 символов. Это проверка формы в демо-режиме.</p>
      <div class="account-form-actions">${accountButton('Сохранить пароль')}${accountLink('Отменить','account.html')}</div>
      <p id="password-status" role="status"></p>
    </form>`,'account');
    wireVisibility();
    localForm(form => {
      if (form.elements.password.value !== form.elements.repeat.value) {
        formFeedback(form,'Пароли должны совпадать.',form.elements.repeat);
        return;
      }
      form.querySelector('.form-error').hidden = true;
      form.reset();
      for (const control of form.querySelectorAll('.password-visibility[aria-pressed="true"]')) control.click();
      document.getElementById('password-status').textContent = 'Форма проверена. Пароль демо-входа остаётся demo.';
    });
  }

  function orders() {
    const prior = readSession('hlebno-demo-order', []);
    const content = prior.length && !state ? `<article class="paper-card vacancy-row"><div><h3>Тестовый заказ</h3><p>${prior.length} позиций · проверен</p></div>${pureLink('Открыть заказ','order-detail.html','dark')}</article>` :
      `<section class="paper-card ${state === 'error' ? 'black' : ''}"><h3>${state === 'error' ? 'Не удалось загрузить заказы' : 'Заказов пока нет'}</h3>
      <p>${state === 'error' ? 'Обновите список, чтобы повторить попытку.' : 'Выберите продукты и пройдите тестовое оформление.'}</p>
      ${pureLink(state === 'error' ? 'Повторить' : 'Перейти в каталог',state === 'error' ? 'orders.html' : 'catalog.html','orange')}</section>`;
    accountLayout('Мои заказы', content + recommendations(), 'orders');
  }

  function orderDetail() {
    const prior = readSession('hlebno-demo-order', []);
    const orderItems = prior.map(row => ({ ...row, product: products.get(row.id) })).filter(row => row.product);
    accountLayout('Мой заказ', orderItems.length ? '<div class="paper-card"><h3>Тестовый заказ</h3><p>Сценарий оформления проверен.</p><ul>' + orderItems.map(row => `<li>${row.product.name} · ${row.qty} шт.</li>`).join('') + '</ul></div>' : successBox('Заказов пока нет','Тестовые заказы появятся после проверки оформления.',pureLink('Перейти в каталог','catalog.html')), 'orders');
  }

  function favorites() {
    let list = [];
    try {
      const persisted = JSON.parse(localStorage.getItem('hlebno-favorites') || '[]');
      if (Array.isArray(persisted)) list = persisted.filter(id => products.has(id));
    } catch { /* Empty state covers unavailable storage. */ }
    accountLayout('Избранное', list.length && state !== 'empty' ? cards(list) :
      successBox('Пока пусто','Нажмите сердечко на карточке товара, чтобы сохранить его здесь.',pureLink('Смотреть каталог','catalog.html','orange')), 'favorites');
  }

  function addresses() {
    const prior = readSession('hlebno-demo-address', '');
    accountLayout('Адреса доставки', prior && state !== 'empty' ?
      `<article class="paper-card vacancy-row"><div><h3>Тестовый адрес</h3><p>${escapeHtml(prior)}</p></div>${pureLink('Изменить','address.html','dark')}</article>` :
      successBox('Адресов пока нет','Добавьте пример адреса для проверки личного кабинета.',pureLink('Добавить адрес','address.html','orange')), 'addresses');
  }

  function address() {
    accountLayout('Добавление адреса',`<form class="paper-card tall-form" data-local-form>${formError('Укажите улицу и дом.')}<p>Санкт-Петербург</p>${field('Улица','street')}${field('Дом','building')}${field('Квартира','unit','text',false)}${textarea('Комментарий','comment')}${formActions('Сохранить тестовый адрес','Адрес сохранится только в этой вкладке.')}</form>`,'addresses');
    localForm(form => {
      const { street, building, unit } = form.elements;
      writeSession('hlebno-demo-address', [street.value, building.value, unit.value].filter(Boolean).join(', '));
      location.href = 'addresses.html';
    });
  }

  const documentTexts = {
    privacy: ['Политика конфиденциальности', [['Оператор данных','Реквизиты оператора будут опубликованы перед запуском.'],['Данные форм','Формы закрытого прототипа предназначены для тестовых данных.'],['Хранение в браузере','Корзина и избранное используют локальное хранилище.']]],
    terms: ['Условия и оферта', [['Информация о продавце','Реквизиты будут указаны в опубликованных условиях.'],['Ассортимент и цены','Каталог в закрытой версии содержит демонстрационные позиции и цены.'],['Оформление','Сейчас можно проверить только демонстрационный сценарий.']]],
    returns: ['Доставка и возврат', [['Самовывоз','Адрес точки и часы выдачи объявим перед открытием.'],['Доставка','Зоны и стоимость уточняются для Санкт-Петербурга.'],['Возврат','Условия опубликуем вместе с офертой.']]]
  };
  function legal() {
    const [title, entries] = documentTexts[view];
    show(heading(title,'Информация для покупателей ХЛЕБНО.') +
      '<p class="legal-note">Черновик для закрытого просмотра. Итоговый текст появится перед запуском.</p>' +
      '<div class="legal-sections">' + entries.map(([label, copy]) => `<section><h2>${label}</h2><p>${copy}</p></section>`).join('') + '</div>');
  }

  function failure(server) {
    const code = server ? '500' : '404';
    show(banner({title:code,copy:server ? 'Не удалось загрузить страницу. Попробуйте открыть её снова.' : 'Страница не нашлась. Откройте главную или каталог.',image:server ? 'bread' : 'orange',tone:'black',note:server ? 'Скоро<br>вернёмся' : 'Мы уже<br>ищем',actions:pureLink('На главную','index.html','orange') + pureLink('В каталог','catalog.html')}), code);
  }

  const screens = {
    seasonal, pairs, gifts, lab, drop, recipes:recipeList, recipe:recipeDetail,
    about, team, careers, vacancy, stores, store:() => stores(true), delivery, contacts, faq,
    product, cart:basket, checkout, order, search, login:auth, register:auth, recover:auth, 'new-password':auth,
    account, password, orders, 'order-detail':orderDetail, favorites, addresses, address, privacy:legal, terms:legal, returns:legal,
    404:() => failure(false), 500:() => failure(true)
  };

  const sectionKey = {
    product:'catalog', pairs:'seasonal', gifts:'seasonal', drop:'lab', recipe:'recipes',
    team:'about', careers:'about', vacancy:'about'
  }[view] || view;
  for (const link of document.querySelectorAll('.mast nav a, .mobile-menu-links a')) {
    if (link.getAttribute('href') === path(sectionKey)) link.setAttribute('aria-current','page');
  }

  (screens[view] || screens[404])();
  hydrateFavorites();

  if (view === 'cart') {
    window.addEventListener('hlebno-cart-change', basket);
    main.addEventListener('click', event => {
      const control = event.target.closest('[data-change], [data-remove]');
      if (!control) return;
      if (control.dataset.remove) {
        cart.remove(control.dataset.remove);
        main.querySelector('h1')?.setAttribute('tabindex','-1');
        main.querySelector('h1')?.focus();
        return;
      }
      const row = cart.items().find(item => item.key === control.dataset.change);
      if (!row) return;
      const result = cart.set(row.key,row.qty + Number(control.dataset.delta));
      if (!result.ok) notify(result.error);
      else {
        const target = [...main.querySelectorAll('[data-change]')].find(button =>
          button.dataset.change === row.key && button.dataset.delta === control.dataset.delta);
        if (target) target.focus({ preventScroll:true });
        else {
          main.querySelector('h1')?.setAttribute('tabindex','-1');
          main.querySelector('h1')?.focus();
        }
      }
    });
  }
})();
