'use strict';
window.HlebnoProducts = [{
 id:'karavay-1', name:'Каравай № 1', subtitle:'100% ржаной хлеб на живой закваске', accent:'Пять лет истории в каждой буханке',
 url:'karavay-1.html', image:'assets/karavay-whole.png',
 gallery:[{src:'assets/karavay-whole.png',label:'Целый каравай',note:'Созданный визуал по вашему фото. Не документальная фотография товара.'},{src:'assets/karavay-sliced.png',label:'Нарезка',note:'Ранее созданный эскиз нарезки. Рисунок корки отличается; заменим согласованным снимком этого каравая.'},{src:null,label:'Корочка и мякиш',note:'Место для настоящего крупного плана корочки и мякиша. Фото пока не предоставлено.'}],
 variants:[{id:'500',weight:500,price:189,stock:10,available:true,slicingEnabled:true},{id:'900',weight:900,price:279,stock:10,available:true,slicingEnabled:true}],
 description:[
 'У этого хлеба есть своя история. И начинается она с живой ржаной закваски, которую мы бережно поддерживаем и обновляем уже пять лет.',
 'Наш каравай рождается всего из четырёх ингредиентов: ржаной муки, воды, натуральной закваски и соли.',
 'Никаких добавок, улучшителей и консервантов.',
 'Естественная ферментация придаёт хлебу глубокий ржаной аромат, благородную кислинку и насыщенный вкус. Выпечка на каменном поду создаёт выразительную корочку, а внутри скрывается плотный, влажный, ароматный мякиш.',
 'Но даже после выпечки мы не спешим разрезать каравай. Мы даём ему около суток, чтобы мякиш окончательно сформировался, а вкус раскрылся во всей полноте.',
 'Этот хлеб прекрасен сам по себе, с хорошим сливочным маслом, выдержанными сырами, слабосолёной форелью или мясными деликатесами. А слегка поджаренный ломтик открывает новые оттенки его вкуса.',
 'И если на столе останется последняя крошка — поверьте, она тоже заслуживает внимания.'
 ],
 ingredients:'Ржаная мука, вода, натуральная ржаная закваска, соль.',
 allergens:'Рожь (глютен).',
 storage:'Хранить при комнатной температуре, в сухом месте, вдали от источников тепла и повышенной влажности. Не хранить под прямыми солнечными лучами.',
 nutrition:[['Энергетическая ценность','ккал / кДж'],['Белки','г'],['Жиры','г'],['Насыщенные жирные кислоты','г'],['Углеводы','г'],['Сахара','г'],['Пищевые волокна','г'],['Соль','г']]
}];

window.HlebnoDemoProducts = [
  {
    "id": "croissant",
    "name": "Круассан классический",
    "weight": "80 г",
    "price": 220,
    "image": "assets/front/croissant.webp",
    "category": "Выпечка"
  },
  {
    "id": "roll",
    "name": "Синнабон с корицей",
    "weight": "120 г",
    "price": 320,
    "image": "assets/front/roll.webp",
    "category": "Сладкое"
  },
  {
    "id": "cookie-demo",
    "name": "Печенье · демонстрация Hover",
    "weight": "100 г",
    "price": 180,
    "image": "assets/cookie-main.svg",
    "category": "Сладкое",
    "illustration": true,
    "photos": {
      "main": "assets/cookie-main.svg",
      "hover": "assets/cookie-hover.svg"
    }
  },
  {
    "id": "tart",
    "name": "Тарт с сезонными ягодами",
    "weight": "100 г",
    "price": 360,
    "image": "assets/front/tart.webp",
    "category": "Сладкое"
  },
  {
    "id": "focaccia",
    "name": "Фокачча с вялеными томатами",
    "weight": "350 г",
    "price": 340,
    "image": "assets/front/focaccia.webp",
    "category": "Выпечка"
  },
  {
    "id": "pistachio",
    "name": "Фисташковый круассан",
    "weight": "120 г",
    "price": 320,
    "image": "assets/front/pistachio.webp",
    "category": "Выпечка"
  },
  {
    "id": "artisan",
    "name": "Ремесленный хлеб на закваске",
    "price": 290,
    "category": "Хлеб",
    "image": "assets/front/bread.webp"
  }
];

window.HlebnoDemoProducts.push(
  { id: 'bruschetta', name: 'Брускетта с томатами', category: 'Готовая еда', price: 340, weight: '2 шт.', image: 'assets/catalog/bruschetta.webp' },
  { id: 'yogurt', name: 'Йогурт с гранолой и ягодами', category: 'Завтраки', price: 290, weight: '250 г', image: 'assets/front/breakfast.webp' },
  { id: 'roasted-bowl', name: 'Боул с запечёнными овощами', category: 'Готовая еда', price: 450, weight: '320 г', image: 'assets/catalog/bowl.webp' },
  { id: 'cheese-board', name: 'Сырная тарелка «Три сыра»', category: 'Сыры и деликатесы', price: 890, weight: '300 г', image: 'assets/front/cheese.webp' },
  { id: 'bread-gift', name: 'Подарочный набор «Хлебный»', category: 'Подарки', price: 2400, weight: '1 набор', image: 'assets/front/gift.webp' },
  { id: 'orange-tea', name: 'Холодный чай с апельсином', category: 'Напитки', price: 190, weight: '330 мл', image: 'assets/front/drink.webp', available: false }
);
