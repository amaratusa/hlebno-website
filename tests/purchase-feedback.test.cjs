const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const base=path.resolve(__dirname,'..');let passed=0;function check(value,message){assert(value,message);passed++}
class Control{
 constructor(){this.checked=false;this.disabled=false;this.textContent='';this.attrs={};this.handlers={};this.classes=new Set();this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c)}}
 addEventListener(name,fn){this.handlers[name]=fn}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}fire(name){this.handlers[name]?.()}
}
function harness(audioMode='running'){
 let audioCount=0,toneCount=0,suspended=0;const timers=new Map();let timeId=0;const frequencies=[],levels=[];
 class AudioMock{
  constructor(){audioCount++;if(audioMode==='throw')throw Error('Audio blocked');this.state=audioMode;this.currentTime=0;this.destination={};}
  createOscillator(){return {frequency:{setValueAtTime:x=>frequencies.push(x),exponentialRampToValueAtTime:x=>frequencies.push(x)},connect(){},start(){toneCount++},stop(){},disconnect(){}}}
  createGain(){return {gain:{setValueAtTime:x=>levels.push(x),exponentialRampToValueAtTime:x=>levels.push(x)},connect(){},disconnect(){}}}
  resume(){if(audioMode==='rejected')return Promise.reject(Error('blocked'));this.state='running';return Promise.resolve()}
  suspend(){suspended++;return Promise.resolve()}close(){return Promise.resolve()}
 }
 const environment={AudioContext:audioMode==='missing'?undefined:AudioMock,setTimeout:fn=>{timers.set(++timeId,fn);return timeId},clearTimeout:id=>timers.delete(id)};
 const controls={button:new Control(),label:new Control(),soundToggle:new Control(),soundStatus:new Control(),cartButton:new Control()};let settled=0;
 const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(base,'purchase-feedback.js'),'utf8'),context);
 const feedback=context.HlebnoPurchaseFeedback.create({...controls,environment,onSettled:()=>settled++});
 return {...controls,feedback,environment,timers,get audioCount(){return audioCount},get toneCount(){return toneCount},get suspended(){return suspended},get settled(){return settled},levels,flush(){for(const fn of [...timers.values()])fn()}};
}
(async()=>{
 const h=harness();check(!h.soundToggle.checked&&h.audioCount===0,'Sound initially off; no AudioContext');h.button.fire('mouseenter');check(h.toneCount===0,'No hover tone');h.feedback.success();check(h.audioCount===0,'Successful silent purchase does not create audio');check(h.feedback.isBusy()&&h.button.disabled&&h.label.textContent==='Добавлено','Success feedback');check(h.button.classes.has('is-added')&&h.cartButton.classes.has('cart-confirmed'),'Button and counter animation classes');h.flush();check(!h.feedback.isBusy()&&h.label.textContent==='Добавить в корзину'&&h.settled===1,'Reset and recalculate availability');
 h.soundToggle.checked=true;h.soundToggle.fire('change');check(h.audioCount===0,'Enabling sound alone does not play');h.feedback.success();check(h.toneCount===1&&h.audioCount===1,'Tone only on success');check(Math.max(...h.levels)<=.035,'Quiet gain envelope');h.feedback.reset();check(h.timers.size===0&&!h.feedback.isBusy(),'Selection change cancels old confirmation');h.soundToggle.checked=false;h.soundToggle.fire('change');check(h.suspended===1,'Turning sound off suspends audio');h.feedback.success();check(h.toneCount===1,'Muted purchase remains silent');
 const missing=harness('missing');missing.feedback.setSound(true);missing.feedback.success();check(missing.label.textContent==='Добавлено'&&missing.soundStatus.textContent.includes('недоступен'),'Missing audio API does not block purchase');const blocked=harness('throw');blocked.feedback.setSound(true);blocked.feedback.success();check(blocked.label.textContent==='Добавлено','Audio error does not block success');const suspended=harness('suspended');suspended.feedback.setSound(true);suspended.feedback.success();suspended.feedback.setSound(false);await Promise.resolve();check(suspended.toneCount===0,'No delayed tone after user disables sound');
 const html=fs.readFileSync(path.join(base,'karavay-1.html'),'utf8'),css=fs.readFileSync(path.join(base,'bread.css'),'utf8');check(!/id="purchase-sound"[^>]*\bchecked/.test(html),'HTML toggle defaults off');check(html.includes('role="switch"')&&html.includes('aria-live="polite"'),'Accessible controls');check(css.includes('@media(prefers-reduced-motion:reduce)')&&css.includes('.cart-open.cart-confirmed{animation:none}'),'Reduced-motion counter');check(css.includes('@media(hover:hover) and (pointer:fine)'),'Hover only for pointer devices');
 console.log(passed+' purchase-feedback checks passed. Audio graph tested with mocks; device playback not verified.');
})().catch(e=>{console.error(e);process.exit(1)});
