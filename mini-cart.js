'use strict';

(() => {
  const dialog = document.getElementById('cart-dialog');
  if (!dialog) return;
  const { cart, money, products } = window.HlebnoShop;
  const { svg } = window.HlebnoIcons;
  const threshold = 1500;
  const plural = new Intl.PluralRules('ru');

  function countLabel(count) {
    const units = { one: 'товар', few: 'товара', many: 'товаров' };
    return count + ' ' + (units[plural.select(count)] || 'товаров');
  }

  function catalogEntry(productId) {
    return window.HlebnoCatalog?.items.find(item => item.id === productId);
  }

  function productPhoto(product) {
    return catalogEntry(product.id)?.image || product.photos?.main || product.image;
  }

  function deliveryHint(total) {
    const rest = Math.max(0, threshold - total);
    return rest ? 'До бесплатной доставки <strong>' + money(rest) + '</strong>' : 'Бесплатная доставка';
  }

  function productStatus(productId) {
    const entry = catalogEntry(productId);
    const product = products.get(productId);
    const key = product?.available === false ? 'unavailable' : entry?.status;
    return { key, label: window.HlebnoCatalog?.statuses[key] || 'Наличие уточняется' };
  }

  dialog.classList.add('mini-cart');
  dialog.setAttribute('aria-labelledby', 'cart-title');
  dialog.innerHTML = `<div class="mini-cart-handle" aria-hidden="true"></div>
    <div class="mini-cart-header"><h2 id="cart-title">Корзина</h2><span id="mini-count" aria-live="polite"></span>
      <button class="close" type="button" aria-label="Закрыть корзину" autofocus>${svg('close')}</button></div>
    <div class="mini-cart-scroll"><div id="cart-items"></div><p class="mini-delivery" id="mini-delivery"></p></div>
    <div class="mini-cart-footer">
      <div class="mini-total"><span>К оплате</span><strong id="total"></strong></div>
      <a class="mini-cart-cta" id="mini-checkout" href="checkout.html">Оформить заказ ${svg('arrowRight')}</a>
      <a class="mini-cart-cta mini-cart-outline" href="cart.html">Перейти в корзину</a>
    </div>`;

  const area = dialog.querySelector('#cart-items');
  let swipe;
  let swipedContent;

  function renderMiniCart() {
    swipe = null;
    swipedContent = null;
    const items = cart.items();
    const count = cart.count();
    const total = cart.total();
    const rows = items.map(item => {
      const row = document.createElement('article');
      row.className = 'mini-item';
      const content = document.createElement('div');
      content.className = 'mini-item-content';
      const image = document.createElement('img');
      image.src = productPhoto(item.product);
      image.alt = '';
      image.draggable = false;
      const copy = document.createElement('div');
      const title = document.createElement('a');
      title.href = item.product.url || 'product.html?id=' + encodeURIComponent(item.productId);
      title.textContent = item.product.name;
      title.draggable = false;
      const price = document.createElement('p');
      const variant = item.variant ? ' · ' + item.variant.weight + ' г · ' + (item.slicing === 'sliced' ? 'В нарезке' : 'Целый') : '';
      price.textContent = item.error || item.qty + ' × ' + money(item.price) + variant;
      copy.append(title, price);
      const sum = document.createElement('strong');
      sum.textContent = item.error ? '—' : money(item.price * item.qty);
      content.append(image, copy, sum);
      const remove = document.createElement('button');
      remove.className = 'mini-item-remove';
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Удалить из корзины: ' + item.product.name + variant);
      remove.innerHTML = svg('trash');
      remove.addEventListener('click', () => {
        const nextRow = row.nextElementSibling || row.previousElementSibling;
        const nextKey = nextRow?.dataset.key;
        cart.remove(item.key);
        const nextLink = [...area.children].find(candidate => candidate.dataset.key === nextKey)?.querySelector('a');
        (nextLink || dialog.querySelector('.mini-cart-header .close')).focus({ preventScroll: true });
      });
      row.dataset.key = item.key;
      row.append(content, remove);
      return row;
    });
    area.replaceChildren(...rows);
    if (!items.length) area.textContent = 'В корзине пока пусто.';
    document.getElementById('mini-count').textContent = countLabel(count);
    const delivery = document.getElementById('mini-delivery');
    delivery.hidden = total <= 0;
    delivery.innerHTML = svg('truck') + '<span>' + deliveryHint(total) + '</span><small>Демо</small>';
    document.getElementById('mini-checkout').hidden = total <= 0;
    document.getElementById('total').textContent = money(total);
    for (const badge of document.querySelectorAll('.count')) badge.textContent = count;
  }

  window.HlebnoBasket = { renderMiniCart, countLabel, deliveryHint, threshold, productPhoto, productStatus };
  renderMiniCart();

  dialog.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    swipe = null;
    swipedContent = null;
    const row = event.target.closest('.mini-item');
    const revealed = area.querySelector('.mini-item[data-revealed]');
    if (revealed !== row) revealed?.removeAttribute('data-revealed');
    const content = event.target.closest('.mini-item-content');
    if (!content) return;
    const actionWidth = row.querySelector('.mini-item-remove').offsetWidth;
    swipe = { row, content, actionWidth, pointerId: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
  });

  area.addEventListener('pointermove', event => {
    if (swipe?.pointerId !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dx) <= Math.abs(dy)) { swipe = null; return; }
      swipe.dragging = true;
      swipe.content.setPointerCapture(event.pointerId);
      swipe.row.setAttribute('data-dragging', '');
    }
    const start = swipe.row.hasAttribute('data-revealed') ? -swipe.actionWidth : 0;
    const offset = Math.min(0, Math.max(-swipe.actionWidth, start + dx));
    swipe.row.style.setProperty('--mini-drag-offset', `${offset}px`);
  });

  function finishSwipe(event) {
    if (swipe?.pointerId !== event.pointerId) return;
    const { row, content, x, dragging } = swipe;
    swipe = null;
    if (!dragging) return;
    row.removeAttribute('data-dragging');
    row.style.removeProperty('--mini-drag-offset');
    if (event.type !== 'pointerup') return;
    const dx = event.clientX - x;
    if (Math.abs(dx) >= 30) row.toggleAttribute('data-revealed', dx < 0);
    swipedContent = content;
  }

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) area.addEventListener(type, finishSwipe);
  area.addEventListener('click', event => {
    if (!swipedContent?.contains(event.target) || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    swipedContent = null;
  }, true);

  dialog.addEventListener('close', () => {
    swipe = null;
    const dragging = area.querySelector('.mini-item[data-dragging]');
    dragging?.removeAttribute('data-dragging');
    dragging?.style.removeProperty('--mini-drag-offset');
    area.querySelector('.mini-item[data-revealed]')?.removeAttribute('data-revealed');
  });

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();
