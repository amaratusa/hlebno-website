'use strict';

const fs = require('node:fs');
const catalog = fs.readFileSync('catalog.html', 'utf8');
const header = catalog.slice(catalog.indexOf('<a class="skip"'), catalog.indexOf('<main id="main"'))
  .replace(/ aria-current="page"/g, '');
const footer = catalog.slice(catalog.indexOf('<footer id='));
const pages = {
  'seasonal': 'Сезонное', 'pairs': 'Гастрономические пары', 'gifts': 'Подарки',
  'lab': 'ХЛЕБНО LAB', 'drop': 'Зимний дроп', 'recipes': 'Рецепты', 'recipe': 'Рецепт',
  'about': 'О нас', 'team': 'Команда', 'careers': 'Вакансии', 'vacancy': 'Вакансия',
  'stores': 'Магазины', 'store': 'ХЛЕБНО в Петербурге', 'delivery': 'Доставка и самовывоз',
  'contacts': 'Контакты', 'faq': 'Вопросы и ответы',
  'product': 'Карточка товара', 'cart': 'Корзина', 'checkout': 'Оформление', 'order': 'Заказ принят',
  'search': 'Поиск', 'login': 'Вход', 'register': 'Регистрация', 'recover': 'Восстановление пароля',
  'new-password': 'Новый пароль', 'account': 'Личный кабинет', 'password': 'Смена пароля',
  'orders': 'Мои заказы', 'order-detail': 'Мой заказ', 'favorites': 'Избранное',
  'addresses': 'Адреса доставки', 'address': 'Добавление адреса',
  'privacy': 'Политика конфиденциальности', 'terms': 'Условия и оферта',
  'returns': 'Доставка и возврат', '404': 'Страница не нашлась', '500': 'Не удалось загрузить'
};

function shellHtml(view, title, productId) {
  const scripts = ['ui-icons.js', 'shop-data.js', 'shop.js', 'catalog-data.js', 'mini-cart.js', 'account-session.js', 'front.js', 'section-data.js', 'purchase-feedback.js', 'sections.js'];
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#f7f3eb">
  <title>${title} — ХЛЕБНО</title>
  <link rel="stylesheet" href="front-fonts.css">
  <link rel="stylesheet" href="front.css">
  <link rel="stylesheet" href="mini-cart.css">
  <link rel="stylesheet" href="commerce.css">
  <link rel="stylesheet" href="catalog.css">
  <link rel="stylesheet" href="sections.css">
  <link rel="stylesheet" href="account.css">
  ${scripts.map(script => `<script src="${script}" defer></script>`).join('\n  ')}
</head>
<body class="catalog-page section-page" data-view="${view}"${productId ? ` data-product-id="${productId}"` : ''}>
${header}<main id="main" class="section-main"><noscript>Включите JavaScript, чтобы открыть этот раздел.</noscript></main>
${footer}`;
}

fs.mkdirSync('dist', { recursive: true });
for (const [view, title] of Object.entries(pages)) fs.writeFileSync('dist/' + view + '.html', shellHtml(view, title));
fs.writeFileSync('dist/karavay-1.html', shellHtml('product', 'Каравай № 1', 'karavay-1'));
for (const file of ['index.html', 'bread.html', 'mini-cart.css', 'mini-cart.js', 'commerce.css', 'purchase-feedback.js', 'catalog.html', 'front.css', 'catalog.css', 'sections.css', 'account.css', 'account-session.js', 'ui-icons.js', 'section-data.js', 'sections.js', 'front.js', 'catalog-data.js', 'catalog.js', 'shop.js', 'shop-data.js']) {
  fs.copyFileSync(file, 'dist/' + file);
}
fs.cpSync('assets/editorial', 'dist/assets/editorial', { recursive: true });
