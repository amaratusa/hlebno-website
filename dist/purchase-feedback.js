'use strict';
(function(root){
 // Synthesized confirmation tone only: no audio file, music or external request.
 function createPurchaseFeedback({button,label,soundToggle,soundStatus,cartButton,onSettled=()=>{},environment=root}){
  let busy=false,timer=null,context=null,activeTone=null;
  soundToggle.checked=false;
  const status=message=>{if(soundStatus)soundStatus.textContent=message};
  function stopTone(){if(!activeTone)return;try{activeTone.stop()}catch{}activeTone=null;}
  function reset(){if(timer!==null)environment.clearTimeout(timer);timer=null;busy=false;button.classList.remove('is-added');cartButton?.classList.remove('cart-confirmed');label.textContent='Добавить в корзину';button.removeAttribute('aria-busy');}
  function setSound(enabled){soundToggle.checked=!!enabled;if(!enabled){stopTone();context?.suspend?.().catch(()=>{});}status(enabled?'Звук включён':'Звук выключен');}
  soundToggle.addEventListener('change',()=>setSound(soundToggle.checked));
  function playTone(){
   if(!soundToggle.checked)return;
   try{
    const Audio=environment.AudioContext||environment.webkitAudioContext;
    if(!Audio){status('Звук недоступен в этом браузере');return;}
    if(!context||context.state==='closed')context=new Audio();
    const start=()=>{
     if(!soundToggle.checked)return;
     stopTone();const oscillator=context.createOscillator(),gain=context.createGain();const now=context.currentTime;
     oscillator.type='sine';oscillator.frequency.setValueAtTime(660,now);oscillator.frequency.exponentialRampToValueAtTime(880,now+.09);
     gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.17);
     oscillator.connect(gain);gain.connect(context.destination);activeTone=oscillator;
     oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(activeTone===oscillator)activeTone=null;};
     oscillator.start(now);oscillator.stop(now+.18);
    };
    if(context.state==='suspended'){context.resume().then(start).catch(()=>status('Браузер не разрешил звук'));}else start();
   }catch{status('Звук недоступен. Покупки продолжают работать');}
  }
  function success(){
   reset();busy=true;button.disabled=true;button.classList.add('is-added');label.textContent='Добавлено';cartButton?.classList.add('cart-confirmed');playTone();
   timer=environment.setTimeout(()=>{reset();onSettled()},1400);
  }
  setSound(false);
  return {success,reset,isBusy:()=>busy,setSound,destroy(){reset();stopTone();context?.close?.().catch(()=>{});}};
 }
 root.HlebnoPurchaseFeedback={create:createPurchaseFeedback};
})(globalThis);
