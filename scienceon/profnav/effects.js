'use strict';
/* Только оформление: без чтения ответов, изменения состояния опроса и сетевых запросов. */
(function(){
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const surfaces='.hero,.domain-card,.choice,.result-card,.token-bank';
  const buttons='.btn,.counter button';
  let activeSurface=null,activeButton=null,frame=0,point=null;
  const enabled=()=>fine.matches&&!reduced.matches;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function clearSurface(node){if(node){node.style.removeProperty('--pointer-alpha');node.style.removeProperty('--pointer-x');node.style.removeProperty('--pointer-y');}}
  function clearButton(node){if(node){node.style.removeProperty('--magnet-x');node.style.removeProperty('--magnet-y');}}
  function reset(){if(frame)cancelAnimationFrame(frame);frame=0;point=null;clearSurface(activeSurface);clearButton(activeButton);activeSurface=null;activeButton=null;}
  function paint(){
    frame=0;if(!point||!enabled())return reset();
    const {x,y,surface,button}=point;
    if(activeSurface!==surface){clearSurface(activeSurface);activeSurface=surface;}
    if(activeButton!==button){clearButton(activeButton);activeButton=button;}
    if(surface&&surface.isConnected){const r=surface.getBoundingClientRect();surface.style.setProperty('--pointer-x',Math.round(x-r.left)+'px');surface.style.setProperty('--pointer-y',Math.round(y-r.top)+'px');surface.style.setProperty('--pointer-alpha',surface.classList.contains('hero')?'.035':'.048');}
    if(button&&button.isConnected&&!button.disabled){
      const r=button.getBoundingClientRect();
      // Каждый компонент <=1px. Вместе с CSS-lift полный сдвиг остаётся меньше 2px.
      const dx=clamp((x-(r.left+r.width/2))/(r.width/2||1),-1,1),dy=clamp((y-(r.top+r.height/2))/(r.height/2||1),-1,1);
      button.style.setProperty('--magnet-x',dx.toFixed(2)+'px');button.style.setProperty('--magnet-y',dy.toFixed(2)+'px');
    }
  }
  function move(event){
    if(!enabled()||event.pointerType==='touch'||event.buttons)return reset();
    const target=event.target instanceof Element?event.target:null,surface=target&&target.closest(surfaces),button=target&&target.closest(buttons);
    point={x:event.clientX,y:event.clientY,surface,button:button&&!button.disabled?button:null};if(!frame)frame=requestAnimationFrame(paint);
  }
  document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',reset,{passive:true});document.addEventListener('pointerdown',reset,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});window.addEventListener('blur',reset,{passive:true});
  [fine,reduced].forEach(q=>{if(q.addEventListener)q.addEventListener('change',reset);else if(q.addListener)q.addListener(reset);});
  const app=document.getElementById('app');
  const observer=app?new MutationObserver(()=>{if((activeSurface&&!activeSurface.isConnected)||(activeButton&&!activeButton.isConnected))reset();}):null;
  if(observer)observer.observe(app,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>{reset();if(observer)observer.disconnect();},{once:true});
  window.ProfnavEffects=Object.freeze({version:'2026-10-29.reference.1',enabled,reset,maxButtonShiftPx:2});
})();
