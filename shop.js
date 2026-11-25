'use strict';
(function(root){
const products=new Map([...(root.HlebnoProducts||[]),...(root.HlebnoDemoProducts||[])].map(p=>[p.id,p]));
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const keyOf=(id,variant,slicing)=>[id,variant||'default',slicing||'whole'].join('|');
function createCart(registry,storage){
 let rows=[];try{rows=JSON.parse(storage?.getItem('hlebno-cart-v2')||'[]');if(!Array.isArray(rows))rows=[];rows=rows.filter(r=>r&&typeof r.productId==='string'&&Number.isSafeInteger(r.qty)&&r.qty>0&&['whole','sliced'].includes(r.slicing)&&r.key===keyOf(r.productId,r.variantId,r.slicing))}catch{rows=[]}
 const variantOf=r=>registry.get(r.productId)?.variants?.find(v=>v.id===r.variantId);
 const quantityFor=(id,variant,except)=>rows.reduce((n,r)=>n+(r.productId===id&&r.variantId===variant&&r.key!==except?r.qty:0),0);
 function reason(id,variantId,slicing,qty,except){const p=registry.get(id);if(!p)return 'Товар не найден';if(p.available===false)return 'Нет в наличии';if(!Number.isSafeInteger(qty)||qty<1)return 'Проверьте количество';const v=p.variants?.find(v=>v.id===variantId);if(p.variants&&!v)return 'Выберите вес';if(v&&slicing==='sliced'&&!v.slicingEnabled)return 'Нарезка для этого веса недоступна';if(!['whole','sliced'].includes(slicing))return 'Выберите способ нарезки';const price=v?v.price:p.price;if(!Number.isFinite(price)||price<=0)return 'Цена пока не утверждена';if(v){if(v.available!==true)return v.available===false?'Нет в наличии':'Наличие уточняется';if(!Number.isSafeInteger(v.stock)||v.stock<1)return v.stock===0?'Нет в наличии':'Остаток уточняется';if(qty+quantityFor(id,variantId,except)>v.stock)return 'Недостаточно товара в наличии'}return '';}
 function save(){try{storage?.setItem('hlebno-cart-v2',JSON.stringify(rows))}catch{}root.dispatchEvent?.(new Event('hlebno-cart-change'));}
 function items(){return rows.filter(r=>registry.has(r.productId)).map(r=>{const p=registry.get(r.productId),v=variantOf(r);return {...r,product:p,variant:v,price:v?v.price:p.price,error:reason(r.productId,r.variantId,r.slicing,r.qty,r.key)}})}
 return {register(list){for(const p of list)if(!registry.has(p.id))registry.set(p.id,p)},reason,items,
 add(id,variantId,slicing='whole',qty=1){if(!Number.isSafeInteger(qty)||qty<1)return {ok:false,error:'Проверьте количество'};const key=keyOf(id,variantId,slicing),r=rows.find(r=>r.key===key);const next=(r?.qty||0)+qty;const error=reason(id,variantId,slicing,next,key);if(error)return {ok:false,error};if(r)r.qty=next;else rows.push({key,productId:id,variantId,slicing,qty});save();return {ok:true}},
 set(key,qty){const r=rows.find(r=>r.key===key);if(!r)return {ok:false};if(qty===0){rows=rows.filter(r=>r.key!==key);save();return {ok:true}}const error=reason(r.productId,r.variantId,r.slicing,qty,key);if(error)return {ok:false,error};r.qty=qty;save();return {ok:true}},
 remove(key){rows=rows.filter(r=>r.key!==key);save()},total(){return items().reduce((n,r)=>n+(r.error?0:r.price*r.qty),0)},count(){return items().reduce((n,r)=>n+r.qty,0)}
 };
}
let storage;try{storage=root.localStorage}catch{}
const cart=createCart(products,storage);
root.HlebnoShop={products,cart,money,createCart};
if(typeof document==='undefined')return;
function notify(msg){const el=document.querySelector('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.classList.remove('show'),3000)}
function render(){if(root.HlebnoBasket)return root.HlebnoBasket.renderMiniCart();const area=document.querySelector('#cart-items');if(!area)return;area.replaceChildren();for(const r of cart.items()){
 const row=document.createElement('div');row.className='cart-row';const image=document.createElement('img');image.src=r.product.photos?.main||r.product.image||'';image.alt='';if(!image.src)image.hidden=true;const info=document.createElement('div');const h=document.createElement('h3');h.textContent=r.product.name;info.append(h);
 const detail=document.createElement('p');detail.className='cart-variant';detail.textContent=r.variant?`${r.variant.weight} г · ${r.slicing==='sliced'?'В нарезке':'Без нарезки'}`:'Тестовый товар';info.append(detail);
 const step=document.createElement('div');step.className='stepper';for(const delta of [-1,1]){if(delta===1){const q=document.createElement('span');q.textContent=r.qty;step.append(q)}const b=document.createElement('button');b.innerHTML=root.HlebnoIcons.svg(delta===1?'plus':'minus');b.setAttribute('aria-label',delta===1?'Увеличить количество':'Уменьшить количество');b.addEventListener('click',()=>{const result=cart.set(r.key,r.qty+delta);if(!result.ok)notify(result.error);render()});step.append(b)}info.append(step);
 if(r.error){const warning=document.createElement('p');warning.className='cart-warning';warning.textContent=r.error+' · позиция не включена в сумму';info.append(warning)}
 const sum=document.createElement('strong');sum.textContent=r.error?'—':money(r.price*r.qty);const remove=document.createElement('button');remove.className='remove';remove.innerHTML=root.HlebnoIcons.svg('trash');remove.setAttribute('aria-label','Удалить '+r.product.name);remove.addEventListener('click',()=>cart.remove(r.key));row.append(image,info,sum,remove);area.append(row);
 }if(!cart.items().length)area.textContent='Здесь пока пусто. Выберите что-нибудь вкусное.';document.querySelectorAll('.count').forEach(e=>e.textContent=cart.count());const total=document.querySelector('#total');if(total)total.textContent=money(cart.total());}
root.HlebnoShop.renderCart=render;root.HlebnoShop.notify=notify;
document.addEventListener('DOMContentLoaded',()=>{render();if(document.body.dataset.shopPage){document.querySelector('.cart-open')?.addEventListener('click',()=>document.querySelector('#cart-dialog').showModal());document.querySelector('.mobile-toggle')?.addEventListener('click',event=>{const open=document.querySelector('.header nav').classList.toggle('open');event.currentTarget.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(e.target.closest('.close'))e.target.closest('dialog').close();const info=e.target.closest('[data-info]');if(info)notify(info.dataset.info)});}});
root.addEventListener('hlebno-cart-change',render);
})(globalThis);
