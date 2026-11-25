'use strict';

window.HlebnoCatalog = {
  categories: [
    ['Хлеб', 'bread'],
    ['Выпечка', 'croissant'],
    ['Сладкое', 'roll'],
    ['Завтраки', 'breakfast'],
    ['Готовая еда', 'bowl'],
    ['Сыры и деликатесы', 'cheese'],
    ['Напитки', 'drink'],
    ['Подарки', 'gift']
  ],
  statuses: {
    available: 'В наличии',
    few: 'Осталось мало',
    preorder: 'Под заказ на завтра',
    unavailable: 'Нет в наличии'
  },
  items: [
    { id: 'focaccia', image: 'assets/catalog/focaccia.webp', badge: 'Новинка', text: 'Оливковое масло и розмарин', status: 'available' },
    { id: 'pistachio', image: 'assets/editorial/pistachio.webp', badge: 'Хит', text: 'Крем и дроблёная фисташка', status: 'available' },
    { id: 'croissant', text: 'Сливочное масло', status: 'few' },
    { id: 'roll', text: 'Сливочный крем-чиз', status: 'available' },
    { id: 'tart', image: 'assets/editorial/tart.webp', text: 'Ванильный крем и ягоды', status: 'available' },
    { id: 'artisan', text: 'Пшеничная закваска', status: 'available', starter: true },
    { id: 'bruschetta', image: 'assets/editorial/tomato-toast.webp', text: 'Рикотта, черри и базилик', status: 'available' },
    { id: 'yogurt', text: 'Мёд, малина и черника', status: 'preorder' },
    { id: 'roasted-bowl', image: 'assets/editorial/recipe-bowl.webp', text: 'Нут, батат и руккола', status: 'available' },
    { id: 'cheese-board', text: 'Выдержанный, голубой и мягкий сыры', status: 'available' },
    { id: 'bread-gift', text: 'Хлеб, джем, масло и открытка', status: 'available', seasonal: true },
    { id: 'orange-tea', text: 'Чёрный чай, апельсин и мёд', status: 'unavailable' },
    { id: 'karavay-1', text: '100% ржаной хлеб на живой закваске', status: 'available', starter: true }
  ]
};
