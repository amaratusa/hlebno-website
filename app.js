'use strict';
const products=[
{id:'karavay-1',name:'Каравай № 1',weight:'500 / 900 г',price:189,image:'karavay-whole',category:'Хлеб',url:'karavay-1.html',photos:{main:'assets/karavay-whole.png'}},
{id:'croissant',name:'Круассан классический',weight:'80 г',price:220,image:'croissant',category:'Выпечка'},
{id:'roll',name:'Синнабон с корицей',weight:'120 г',price:320,image:'sweet',category:'Сладкое'},
{id:'cookie-demo',name:'Печенье · демонстрация Hover',weight:'100 г',price:180,image:'cookie-main',category:'Сладкое',illustration:true,photos:{main:'assets/cookie-main.svg',hover:'assets/cookie-hover.svg'}},
{id:'tart',name:'Тарт с сезонными ягодами',weight:'100 г',price:360,image:'sweet',category:'Сладкое'},
{id:'focaccia',name:'Фокачча с вялеными томатами',weight:'350 г',price:320,image:'bread',category:'Выпечка'},
{id:'pistachio',name:'Фисташковый круассан',weight:'120 г',price:390,image:'croissant',category:'Выпечка'}];
for(const p of products)p.homepagePhotos=window.HlebnoHomePhotos?.[p.id];
const categories=[['Хлеб','bread'],['Выпечка','croissant'],['Сладкое','sweet'],['Закуски','tomato'],['Готовая еда','baking'],['Сыры и деликатесы','cheese'],['Напитки','tomato'],['Подарки','cheese']];
HlebnoShop.cart.register(products.map(p=>({...p,image:p.photos?.main||`assets/${p.image}.jpg`})));
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const grid=document.querySelector('.product-grid');
let currentProducts;
const imagePath=p=>p.homepagePhotos?.main||p.photos?.main||`assets/${p.image}.jpg`;
function productMedia(p){
 const alternate=p.homepagePhotos?p.homepagePhotos.hover:p.photos?.hover;
 return `<button type="button" class="product-media" aria-label="${alternate?'Посмотреть второе изображение: ':'Изображение: '}${p.name}" aria-pressed="false" ${alternate?'':'disabled'}><img class="product-photo primary-photo" src="${imagePath(p)}" alt="${p.illustration?'Демонстрационная иллюстрация':'Временная иллюстрация'}: ${p.name}" loading="lazy">${alternate?`<img class="product-photo alternate-photo" src="${alternate}" alt="" aria-hidden="true"><span class="photo-dots" aria-hidden="true"><i></i><i></i></span>`:''}${p.homepagePhotos?.label?`<span class="illustration-label">${p.homepagePhotos.label}</span>`:p.illustration?'<span class="illustration-label">ИЛЛЮСТРАЦИЯ · ДЕМО</span>':''}</button>`;
}
function renderProducts(list=products.slice(0,4)){
 currentProducts=list;grid.replaceChildren();
 for(const p of list){
  const el=document.createElement('article');el.className='product';el.dataset.productId=p.id;
  if(p.id==='cookie-demo')el.id='cookie-demo';
  el.innerHTML=`${productMedia(p)}<button class="favorite" aria-label="В избранное: ${p.name}" aria-pressed="false">${HlebnoIcons.svg('heart')}</button><div class="product-body"><h3>${p.url?`<a href="${p.url}">${p.name}</a>`:p.name}</h3><small>${p.weight} · тестовый товар</small><div class="product-price"><strong>${p.price===null?"Цена уточняется":money(p.price)}</strong>${p.url?`<a class="add product-detail-link" href="${p.url}" aria-label="Выбрать ${p.name}">${HlebnoIcons.svg('arrowRight')}</a>`:`<button class="add" data-add="${p.id}" aria-label="Добавить ${p.name}">${HlebnoIcons.svg('plus')}</button>`}</div></div>`;
  grid.append(el);
  const media=el.querySelector('.product-media');const second=media.querySelector('.alternate-photo');
  if(second){second.decode().then(()=>el.classList.add('photo-ready')).catch(()=>{second.remove();media.disabled=true;media.querySelector('.photo-dots')?.remove()});}
  media.addEventListener('click',()=>{if(!el.classList.contains('photo-ready'))return;const on=el.classList.toggle('photo-selected');media.setAttribute('aria-pressed',String(on));});
 }
 document.querySelector('.empty-search').hidden=list.length>0;
}

renderProducts();
const categoryImages={'Хлеб':'rye.webp','Выпечка':'croissant.webp','Сладкое':'roll.webp','Закуски':'cheese.webp','Готовая еда':'trout.webp','Сыры и деликатесы':'cheese.webp','Напитки':'drinks.svg','Подарки':'gift.svg'};
for(const [name,image] of categories){const b=document.createElement('button');b.className='category';b.innerHTML=`<img src="assets/home/${categoryImages[name]}" alt="" loading="lazy"><span>${name}</span>`;b.addEventListener('click',()=>{if(name==='Хлеб'){location.href='bread.html';return;}renderProducts(products.filter(p=>p.category===name));document.querySelector('#products').scrollIntoView();if(!products.some(p=>p.category===name))toast('В этой категории пока нет тестовых товаров')});document.querySelector('.categories').append(b)}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function renderCart(){HlebnoShop.renderCart()}
renderCart();
document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){const result=HlebnoShop.cart.add(add.dataset.add,undefined,'whole',1);toast(result.ok?'Добавлено в тестовую корзину':result.error)}const favorite=e.target.closest('.favorite');if(favorite){const on=favorite.getAttribute('aria-pressed')!=='true';favorite.setAttribute('aria-pressed',on);favorite.innerHTML=HlebnoIcons.svg('heart')}const info=e.target.closest('[data-info]');if(info){document.querySelector('#info-text').textContent=info.dataset.info;document.querySelector('#info-dialog').showModal()}if(e.target.closest('.close'))e.target.closest('dialog').close()});
document.querySelector('.cart-open').addEventListener('click',()=>document.querySelector('#cart-dialog').showModal());
document.querySelector('#search-open').addEventListener('click',()=>document.querySelector('#search-dialog').showModal());
document.querySelector('#search-form').addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#search').value.trim().toLocaleLowerCase('ru');renderProducts(products.filter(p=>p.name.toLocaleLowerCase('ru').includes(q)));document.querySelector('#search-dialog').close();document.querySelector('#products').scrollIntoView()});
document.querySelector('#all-products').addEventListener('click',()=>renderProducts(products));
const menu=document.querySelector('.header nav'),toggle=document.querySelector('.mobile-toggle');function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.querySelector('#subscribe-form').addEventListener('submit',e=>{e.preventDefault();toast('Тестовая форма: e-mail не отправлен и не сохранён');e.target.reset()});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));

const svgIcon=name=>HlebnoIcons.svg(name);
document.querySelector('#search-open').innerHTML=svgIcon('search');document.querySelector('.profile').innerHTML=svgIcon('user');document.querySelector('.cart-open').innerHTML=svgIcon('bag')+'<span class="count">0</span>';renderCart();

// Local image preview only. No upload, storage or third-party requests.
let productionPreviewUrl;
document.querySelector('#production-upload').addEventListener('change',event=>{
  const file=event.target.files[0];if(!file)return;
  const status=document.querySelector('#production-status');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Выберите фотографию JPG, PNG или WebP.';event.target.value='';return;}
  if(file.size>20*1024*1024){status.textContent='Выберите фотографию размером до 20 МБ.';event.target.value='';return;}
  const photo=document.querySelector('#production-photo');
  if(productionPreviewUrl)URL.revokeObjectURL(productionPreviewUrl);
  productionPreviewUrl=URL.createObjectURL(file);
  photo.onload=()=>{photo.hidden=false;document.querySelector('#production-placeholder').hidden=true;document.querySelector('#production-placeholder').style.display='none';status.textContent='Фото показано только в вашей вкладке. Для постоянного размещения передайте оригинал в чат.';};
  photo.onerror=()=>{status.textContent='Не удалось открыть снимок. Выберите другой файл.';};
  photo.src=productionPreviewUrl;
});

// Two independent original image files per product; local preview, no upload to a server.
const photoEditor=document.querySelector('#product-photo-dialog');
const photoProduct=document.querySelector('#photo-product');
for(const p of products){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;photoProduct.append(o);}
photoProduct.value='cookie-demo';
document.querySelector('#edit-product-photos').addEventListener('click',()=>photoEditor.showModal());
const productPhotoUrls=new Set();
document.querySelector('#product-photo-form').addEventListener('submit',async event=>{
 event.preventDefault();const status=document.querySelector('#product-photo-status');
 const main=document.querySelector('#photo-main').files[0],hover=document.querySelector('#photo-hover').files[0];
 if(!main){status.textContent='Выберите основное фото для главной.';return;}
 const urls=[];
 try{
  for(const file of [main,hover].filter(Boolean)){
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Подойдут JPG, PNG или WebP до 20 МБ каждый.');
   const url=URL.createObjectURL(file);urls.push(url);const img=new Image();img.src=url;await img.decode();
  }
  const product=products.find(p=>p.id===photoProduct.value);
  for(const old of Object.values(product.homepagePhotos||{})){if(productPhotoUrls.has(old)){URL.revokeObjectURL(old);productPhotoUrls.delete(old);}}
  product.homepagePhotos={main:urls[0],hover:urls[1]||null,label:'ФОТО · ПРЕДПРОСМОТР',placeholder:false};urls.forEach(url=>productPhotoUrls.add(url));
  renderProducts(currentProducts.some(p=>p.id===product.id)?currentProducts:products.filter(p=>p.id===product.id));renderCart();photoEditor.close();event.target.reset();status.textContent='';toast('Фото для главной применены только в этой вкладке');document.querySelector('#products').scrollIntoView();
 }catch(error){urls.forEach(url=>URL.revokeObjectURL(url));status.textContent=error.message||'Не удалось открыть фотографии.';}
});
window.addEventListener('pagehide',()=>productPhotoUrls.forEach(url=>URL.revokeObjectURL(url)));
