'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const { products, money } = window.HlebnoShop;
  const { svg } = window.HlebnoIcons;
  const { categories, items, statuses } = window.HlebnoCatalog;
  const rows = items.map(item => {
    const product = products.get(item.id);
    return {
      ...product,
      ...item,
      price: product.variants ? Math.min(...product.variants.map(variant => variant.price)) : product.price,
      category: product.category || 'Хлеб'
    };
  });
  const sort = byId('catalog-sort');
  const filterForm = byId('filter-form');
  const sheet = byId('filter-sheet');
  const mobile = matchMedia('(max-width: 800px)');
  const parameters = new URLSearchParams(location.search);
  const initialCategory = parameters.get('category');
  let category = categories.some(([name]) => name === initialCategory) ? initialCategory : '';
  let previewState = parameters.get('state');
  let page = 1;
  let extraPages = 0;

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(text, className) {
    const element = node('button', text, className);
    element.type = 'button';
    return element;
  }

  function selectCategory(name) {
    category = name;
    previewState = '';
    const url = new URL(location.href);
    if (name) url.searchParams.set('category', name);
    else url.searchParams.delete('category');
    url.searchParams.delete('state');
    history.replaceState(null, '', url);
    resetPage();
  }

  for (const [name, photo] of [['', ''], ...categories]) {
    const control = button('', 'catalog-category');
    control.dataset.category = name;
    if (photo) {
      const icon = node('img', '', 'category-picture');
      icon.src = 'assets/front/' + photo + '.webp';
      icon.alt = '';
      icon.width = 104;
      icon.height = 104;
      control.append(icon);
    } else {
      control.append(node('span', 'Все', 'category-picture category-all'));
      control.firstChild.setAttribute('aria-hidden', 'true');
    }
    if (name) {
      control.append(node('span', name));
    } else {
      control.append(node('span', 'Все товары', 'category-all-label'), node('span', 'Все', 'category-all-mobile'));
      control.setAttribute('aria-label', 'Все товары');
    }
    control.addEventListener('click', () => selectCategory(name));
    byId('catalog-categories').append(control);
  }

  function statusMatches(row, status) {
    return status === 'in-stock' ? ['available', 'few'].includes(row.status) : row.status === status;
  }

  function activeFilters() {
    return [...filterForm.querySelectorAll('input')].filter(input =>
      input.type === 'checkbox' ? input.checked : input.valueAsNumber >= 0);
  }

  function productCard(row) {
    const card = node('article', '', 'catalog-card');
    const image = node('img');
    image.src = row.image;
    image.alt = '';
    image.width = 320;
    image.height = 320;
    image.loading = 'lazy';

    const media = node('div', '', 'catalog-card-media');
    const photo = button('', 'catalog-card-photo');
    photo.dataset.product = row.id;
    photo.setAttribute('aria-label', row.name);
    photo.append(image);
    media.append(photo);

    if (row.badge || row.seasonal || row.status === 'unavailable') {
      const badge = node('span', row.badge || (row.seasonal ? 'Сезон' : statuses.unavailable), 'catalog-badge');
      badge.dataset.tone = row.seasonal ? 'seasonal' : row.status;
      media.append(badge);
    }

    const save = button('', 'catalog-save');
    save.dataset.favoriteId = row.id;
    save.dataset.favoriteName = row.name;
    save.innerHTML = svg('heart');
    window.refreshHlebnoFavorite(save);
    media.append(save);
    card.append(media);

    const copy = node('div', '', 'catalog-card-copy');
    const title = node('h3');
    const name = button(row.name, 'catalog-card-title');
    name.dataset.product = row.id;
    title.append(name);
    const status = node('p', statuses[row.status], 'catalog-status');
    status.dataset.status = row.status;
    copy.append(title, node('p', row.text, 'catalog-description'), status);

    const footer = node('div', '', 'catalog-card-footer');
    const price = node('div', '', 'catalog-price');
    price.append(node('strong', (row.variants ? 'от ' : '') + money(row.price)));
    if (row.weight) price.append(node('span', row.weight));
    const add = button('', 'catalog-add');
    const unavailable = row.status === 'unavailable';
    if (row.variants || unavailable) add.dataset.product = row.id;
    else add.dataset.add = row.id;
    add.setAttribute('aria-label', (unavailable ? 'Посмотреть товар: ' : row.variants ? 'Выбрать вес: ' : 'Добавить в корзину: ') + row.name);
    add.innerHTML = svg(unavailable ? 'arrowRight' : 'plus');
    if (unavailable) add.classList.add('unavailable');
    footer.append(price, add);
    copy.append(footer);
    card.append(copy);
    return card;
  }

  function renderFilters(base, active) {
    const facets = {
      'in-stock': base.filter(row => statusMatches(row, 'in-stock')).length,
      preorder: base.filter(row => row.status === 'preorder').length,
      unavailable: base.filter(row => row.status === 'unavailable').length,
      starter: base.filter(row => row.starter).length,
      seasonal: base.filter(row => row.seasonal).length
    };
    for (const element of filterForm.querySelectorAll('[data-facet]')) {
      element.textContent = facets[element.dataset.facet];
    }

    byId('filter-count').textContent = active.length;
    byId('filter-count').hidden = !active.length;
    byId('filter-chips').replaceChildren(...active.map(input => {
      const label = {
        'in-stock': 'В наличии сегодня',
        preorder: 'Под заказ на завтра',
        unavailable: 'Нет в наличии',
        starter: 'На закваске',
        seasonal: 'Сезонное',
        min: 'От ' + money(input.valueAsNumber),
        max: 'До ' + money(input.valueAsNumber)
      }[input.name === 'status' ? input.value : input.name];
      const chip = button(label + ' ×');
      chip.setAttribute('aria-label', 'Убрать фильтр «' + label + '»');
      chip.addEventListener('click', () => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
        resetPage();
        (mobile.matches ? byId('filter-open') : input).focus();
      });
      return chip;
    }));
  }

  function renderPagination(total) {
    const pages = byId('catalog-pages');
    pages.replaceChildren();
    if (mobile.matches || total < 2) return;

    for (let number = 1; number <= total; number++) {
      const control = button(String(number));
      control.setAttribute('aria-label', 'Страница ' + number);
      if (number === page) control.setAttribute('aria-current', 'page');
      control.addEventListener('click', () => {
        page = number;
        extraPages = 0;
        render();
        byId('catalog-grid').scrollIntoView({ block: 'start' });
        pages.querySelector('[aria-current]')?.focus({ preventScroll: true });
      });
      pages.append(control);
    }
  }

  function render() {
    const base = rows.filter(row => !category || row.category === category);
    const active = activeFilters();
    const stock = active.filter(input => input.name === 'status');
    const min = active.find(input => input.name === 'min')?.valueAsNumber;
    const max = active.find(input => input.name === 'max')?.valueAsNumber;
    const list = base.filter(row =>
      (!stock.length || stock.some(input => statusMatches(row, input.value))) &&
      (!filterForm.elements.starter.checked || row.starter) &&
      (!filterForm.elements.seasonal.checked || row.seasonal) &&
      (!Number.isFinite(min) || row.price >= min) &&
      (!Number.isFinite(max) || row.price <= max));

    const comparators = {
      'price-up': (a, b) => a.price - b.price,
      'price-down': (a, b) => b.price - a.price,
      new: (a, b) => Number(b.badge === 'Новинка') - Number(a.badge === 'Новинка')
    };
    if (comparators[sort.value]) list.sort(comparators[sort.value]);

    const pageSize = mobile.matches ? 10 : 12;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize + extraPages * 12, list.length);
    const visible = list.slice(start, end);
    const preview = byId('catalog-preview-state');
    preview.hidden = !['loading', 'error'].includes(previewState);
    preview.replaceChildren();
    if (previewState === 'error') {
      preview.append(node('h2', 'Не удалось загрузить товары'), node('p', 'Повторите попытку, чтобы открыть витрину.'));
      const retry = button('Попробовать снова', 'pill orange');
      retry.addEventListener('click', () => selectCategory(category));
      preview.append(retry);
    } else if (previewState === 'loading') {
      const placeholder = node('div', '', 'catalog-skeleton');
      for (let index = 0; index < 8; index++) placeholder.append(node('span'));
      preview.append(node('p', 'Загружаем товары'), placeholder);
    }
    const placeholderVisible = !preview.hidden;
    byId('catalog-grid').hidden = placeholderVisible || previewState === 'empty';
    for (const control of byId('catalog-categories').children) {
      control.setAttribute('aria-pressed', String(category === control.dataset.category));
    }
    for (const control of byId('sort-buttons').querySelectorAll('button')) {
      control.setAttribute('aria-pressed', String(control.dataset.sort === sort.value));
    }
    const plural = new Intl.PluralRules('ru').select(list.length);
    const noun = { one: 'товар', few: 'товара', many: 'товаров' }[plural] || 'товаров';
    byId('result-count').textContent = placeholderVisible ? '' : previewState === 'empty' ? 'Найдено 0 товаров' : 'Найдено ' + list.length + ' ' + noun;
    byId('catalog-empty').hidden = placeholderVisible || (previewState !== 'empty' && !!list.length);
    byId('catalog-grid').replaceChildren(...visible.map(productCard));
    const more = byId('load-more');
    more.hidden = placeholderVisible || previewState === 'empty' || end === list.length;
    more.firstChild.nodeValue = 'Показать ещё ' + Math.min(12, list.length - end) + ' ';
    byId('shown-count').textContent = !placeholderVisible && previewState !== 'empty' && list.length ? 'Показано ' + visible.length + ' из ' + list.length : '';
    renderFilters(base, active);
    renderPagination(placeholderVisible || previewState === 'empty' ? 0 : Math.ceil(list.length / pageSize));
  }

  function resetPage() {
    page = 1;
    extraPages = 0;
    render();
  }

  for (const option of sort.options) {
    const control = button(option.textContent);
    control.dataset.sort = option.value;
    control.addEventListener('click', () => { sort.value = option.value; resetPage(); });
    byId('sort-buttons').append(control);
  }

  filterForm.addEventListener('input', resetPage);
  filterForm.addEventListener('reset', () => queueMicrotask(resetPage));
  sort.addEventListener('change', resetPage);
  byId('catalog-clear').addEventListener('click', () => {
    selectCategory('');
    filterForm.reset();
    byId('catalog-categories').firstElementChild.focus();
  });
  byId('filter-open').addEventListener('click', () => sheet.showModal());
  byId('load-more').addEventListener('click', () => {
    const next = byId('catalog-grid').childElementCount;
    extraPages++;
    render();
    byId('catalog-grid').children[next]?.querySelector('button').focus({ preventScroll: true });
  });

  function positionFilters() {
    if (!mobile.matches && sheet.open) sheet.close();
    byId(mobile.matches ? 'mobile-filter-slot' : 'desktop-filter-slot').append(byId('catalog-filters'));
    resetPage();
  }

  mobile.addEventListener('change', positionFilters);
  positionFilters();
})();
