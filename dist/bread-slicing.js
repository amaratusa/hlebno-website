'use strict';
(function(){
 const range=document.querySelector('#slicing-progress'),button=document.querySelector('#slicing-play');if(!range||!button)return;
 const status=document.querySelector('#slicing-status'),loaf=document.querySelector('#animated-loaf'),knife=document.querySelector('#slicing-knife');
 const slices=['one','two','three'].map(n=>document.querySelector('#slice-'+n));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=null,progress=0;
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;button.innerHTML=progress===100?'Показать целый каравай '+HlebnoIcons.svg('restart'):'Посмотреть нарезку '+HlebnoIcons.svg('arrowUpRight');}
 function draw(value){progress=Math.max(0,Math.min(100,Number(value)||0));range.value=String(Math.round(progress));const t=progress/100;
  loaf.setAttribute('transform',`translate(${-t*28} 0)`);
  slices.forEach((slice,i)=>{const x=Math.max(0,Math.min(1,(t-.25-i*.13)*3));slice.setAttribute('opacity',String(x));slice.setAttribute('transform',`translate(${302+i*48+x*15} ${126+i*14}) rotate(${x*(i+1)*3})`)});
  const cutting=t>0&&t<.82;knife.setAttribute('opacity',cutting?'1':'0');knife.setAttribute('transform',`translate(${t*80} ${Math.sin(t*Math.PI*4)*13})`);
  status.textContent=progress===0?'Проведите ползунок — загляните внутрь.':progress===100?'В нарезке — готов к столу.':'Нарезаем каравай…';
 }
 range.addEventListener('input',()=>{stop();draw(range.value);stop()});
 button.addEventListener('click',()=>{if(frame!==null){stop();return}const target=progress>=100?0:100;if(reduced.matches){draw(target);stop();return}const from=progress;let started;button.textContent='Остановить';function tick(now){started??=now;const t=Math.min(1,(now-started)/1800);draw(from+(target-from)*(t*t*(3-2*t)));if(t<1)frame=requestAnimationFrame(tick);else stop()}frame=requestAnimationFrame(tick)});
 reduced.addEventListener('change',()=>{if(reduced.matches){stop();draw(progress>=50?100:0)}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});draw(0);
})();
