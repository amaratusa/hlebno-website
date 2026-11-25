'use strict';

window.HlebnoSections = {
  photos: {
    bread: 'assets/editorial/rye.webp',
    dough: 'assets/editorial/dough.webp',
    toast: 'assets/editorial/tomato-toast.webp',
    bowl: 'assets/editorial/recipe-bowl.webp',
    breakfast: 'assets/front/breakfast.webp',
    tart: 'assets/editorial/tart.webp',
    pistachio: 'assets/editorial/pistachio.webp',
    lab: 'assets/front/lab.webp',
    orange: 'assets/front/letters.webp',
    winter: 'assets/front/winter.webp',
    panorama: 'assets/editorial/catalog-panorama.webp',
    pairs: 'assets/front/pairs.webp',
    gift: 'assets/front/gift.webp',
    croissant: 'assets/front/croissant.webp',
    focaccia: 'assets/catalog/focaccia.webp'
  },
  recipes: [
    { id: 'bruschetta', title: 'Брускетты с томатами и базиликом', photo: 'toast', group: 'Закуски', time: '15 мин', products: ['artisan'], ingredients: ['Хлеб на закваске', 'Рикотта', 'Томаты черри', 'Свежий базилик'], steps: ['Подрумяньте ломтики хлеба на сухой сковороде.', 'Намажьте хлеб рикоттой, добавьте разрезанные томаты и базилик.', 'Перед подачей сбрызните оливковым маслом.'] },
    { id: 'yogurt', title: 'Йогурт с гранолой и ягодами', photo: 'breakfast', group: 'Завтраки', time: '10 мин', products: ['yogurt'], ingredients: ['Густой йогурт', 'Гранола', 'Ягоды', 'Мёд'], steps: ['Выложите йогурт в глубокую тарелку.', 'Добавьте гранолу и ягоды. По вкусу полейте мёдом.'] },
    { id: 'bowl', title: 'Тёплый боул с запечёнными овощами', photo: 'bowl', group: 'Основное', time: '35 мин', products: ['roasted-bowl'], ingredients: ['Тыква или батат', 'Готовый нут', 'Руккола', 'Оливковое масло'], steps: ['Запеките овощи до мягкости и золотистого цвета.', 'Соедините с нутом и рукколой, заправьте маслом.'] },
    { id: 'focaccia', title: 'Фокачча к зимнему столу', photo: 'focaccia', group: 'Закуски', time: '10 мин', products: ['focaccia'], ingredients: ['Фокачча', 'Сливочный сыр', 'Розмарин'], steps: ['Разогрейте фокаччу до хрустящей корочки.', 'Подайте со сливочным сыром и розмарином.'] },
    { id: 'tart', title: 'Ягодный тарт к чаю', photo: 'tart', group: 'Десерты', time: '5 мин', products: ['tart'], ingredients: ['Ягодный тарт', 'Чёрный чай', 'Лимон'], steps: ['Заварите чай и добавьте лимон по вкусу.', 'Подайте тарт охлаждённым.'] },
    { id: 'croissant', title: 'Фисташковый круассан к завтраку', photo: 'pistachio', group: 'Завтраки', time: '5 мин', products: ['pistachio'], ingredients: ['Фисташковый круассан', 'Кофе'], steps: ['Приготовьте кофе и подайте круассан к столу.'] }
  ],
  jobs: [
    { id: 'baker', title: 'Пекарь', group: 'Производство', summary: 'Хлеб на закваске, выпечка и работа с тестом.' },
    { id: 'pastry', title: 'Пекарь-кондитер', group: 'Производство', summary: 'Слоёное тесто, сладкая выпечка и работа с начинками.' },
    { id: 'barista', title: 'Бариста', group: 'Витрина', summary: 'Кофе, напитки и общение с гостями.' },
    { id: 'sales', title: 'Продавец-консультант', group: 'Витрина', summary: 'Работа с витриной и помощь в выборе продуктов.' },
    { id: 'cook', title: 'Повар', group: 'Кухня', summary: 'Готовая еда, сезонные блюда и заготовки.' }
  ]
};
