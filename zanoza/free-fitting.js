'use strict';
var live={photo:null,preview:null,photoBusy:false,selected:new Set(['jacket']),consent:false,busy:false,epoch:0,results:[],saved:[],error:'',status:'',active:0,demo:false,started:0,stage:'idle',submission:null};
var freeClientPromise=null,fitClock=null;
const FIT_ORIGIN='https://fashn-ai-fashn-vton-1-5.hf.space';
function renderFitting(){
  const selected=product([...live.selected][0]);
  $('content').innerHTML=`<section class="hero live-hero"><div class="hero-copy"><span class="hero-tag">ВАШЕ ФОТО · НАСТОЯЩАЯ AI-ПРИМЕРКА</span><h1>Новый образ.<br>На вашем фото.</h1><p>Выберите вещь ZANOZA. Примерочная перенесёт её на фотографию и покажет результат прямо здесь.</p><a class="hero-link" href="#photo-step">Начать примерку ↓</a></div><img class="hero-art" src="assets/zanoza-jacket.webp" alt="Чёрная зимняя куртка ZANOZA"></section>
  <div class="steps"><span><b>1</b>Ваше фото</span><span><b>2</b>Одежда магазина</span><span><b>3</b>Новый образ</span></div>
  <div class="workspace live-workspace"><div><section class="panel" id="photo-step"><div class="section-heading"><h2>1. Фото ребёнка</h2><span class="live-badge">JPG · PNG · WebP</span></div><p class="muted">Один человек в полный рост, в обычной закрытой одежде. Руки не перекрывают выбранную вещь.</p>
  <label class="live-upload ${live.preview?'has-photo':''}">${live.preview?`<img src="${live.preview}" alt="Выбранное фото"><span>Заменить фотографию</span>`:'<span class="upload-symbol">＋</span><b>Загрузить фотографию</b><span>До 10 МБ</span>'}<input id="live-photo" type="file" aria-label="Загрузить фотографию" accept="image/jpeg,image/png,image/webp" ${live.busy||live.photoBusy?'disabled':''}></label>
  <p class="muted" role="status">${live.photoBusy?'Подготавливаем фото…':live.preview?'Фото подготовлено; метаданные удалены.':'Сначала фото открывается только в вашем браузере.'}</p>
  <button class="secondary block" id="use-demo-person" ${live.busy||live.photoBusy?'disabled':''}>Проверить на демофото</button><p class="muted">Демомодель создана AI. Это не личная фотография ребёнка.</p>
  <label class="check live-consent"><input id="live-consent" type="checkbox" ${live.consent?'checked':''} ${live.busy?'disabled':''}><span>${live.demo?'Разрешаю отправить AI-демофото и выбранную вещь в бесплатное демо FASHN на Hugging Face.':'У меня есть право использовать это фото. Если на нём реальный ребёнок, я его родитель или законный представитель. Разрешаю отправку фото и вещи в бесплатное демо FASHN на Hugging Face.'}</span></label>
  <details class="live-privacy"><summary>Как обрабатывается фото</summary><p>После нажатия «Примерить» фото и изображение одежды передаются на huggingface.co / fashn-ai-fashn-vton-1-5.hf.space. Это внешний сервис; действуют его правила обработки данных. Фото уменьшается, метаданные удаляются.</p><p>ZANOZA не сохраняет фото на своём сервере. Локальные результаты находятся в памяти открытой страницы. Удаление здесь не удаляет уже переданные внешнему сервису файлы. Используйте демофото, если не хотите передавать личный снимок.</p><p>У бесплатного демо есть дневные квоты и общая очередь. Платные API, подписки и автопополнение не используются.</p></details>
  ${live.preview?`<button class="quiet" id="live-remove" ${live.busy?'disabled':''}>Удалить фото и результаты</button>`:''}</section>
  <section class="panel live-selection"><h2>2. Выберите вещь</h2><p class="muted">По одной вещи за запуск. Для шапок и обуви эта модель примерки не подходит.</p><div class="live-products">${products.filter(p=>p.tryon).map(p=>`<label class="live-product ${live.selected.has(p.id)?'selected':''}"><input type="radio" name="fit-product" data-live-product="${p.id}" ${live.selected.has(p.id)?'checked':''} ${live.busy?'disabled':''}><img src="${p.image}" alt="${esc(p.name)}"><span><b>${esc(p.name)}</b><strong>${money(p.price)}</strong><small>Публикация ${p.date}</small></span></label>`).join('')}</div>
  <p class="muted">${selected?.id==='jacket-orange'?'Оранжевая куртка показана на составном фото с аксессуарами. Детали примерки могут быть менее точными.':'Цвет и фасон берутся с фотографии выбранной вещи.'}</p>
  <div class="live-service service-ready">Бесплатная AI-примерка · FASHN VTON 1.5</div><button class="primary" id="live-generate" ${!live.photo||!live.consent||!selected?.tryon||live.busy||live.photoBusy?'disabled':''}>${live.busy?'Примерочная работает…':'Примерить бесплатно'}</button><p class="muted">Обычно потребуется немного подождать. Время зависит от очереди бесплатного сервиса.</p><p id="live-error" class="form-error" role="alert">${esc(live.error)}</p>${live.status&&!live.busy?`<p class="live-status" role="status">${esc(live.status)}</p>`:''}</section></div>
  <section class="panel live-result-panel" id="tryon-panel"><div class="section-heading"><h2>3. Ваш новый образ</h2><span class="live-badge">AI-примерка</span></div>
  ${live.busy?`<div class="free-wait" role="status" aria-live="polite"><div class="fit-spinner" aria-hidden="true"></div><h3>Примерочная работает</h3><p id="fit-stage">${esc(live.status)}</p><div class="fit-time" id="fit-time">0:00</div><p class="muted">Оставьте страницу открытой. Результат появится здесь автоматически.</p><button class="secondary" id="fit-cancel">Отменить ожидание</button></div>`:''}
  ${live.results.length?renderLiveResult():!live.busy?`<div class="live-empty"><div class="empty-frames"><span>${live.preview?`<img src="${live.preview}" alt="Исходный снимок">`:'①'}</span><span>✧</span></div><h3>Здесь появится примерка</h3><p><a href="assets/example-free-tryon.webp" target="_blank" rel="noopener">Посмотреть проверенный пример на AI-демомодели ↗</a></p><p>Загрузите фотографию или используйте демомодель, выберите вещь и нажмите «Примерить бесплатно».</p></div>`:''}
  <p class="note">AI показывает возможный образ. Он может изменить лицо, пропорции и детали одежды. Реальную посадку, размер и наличие подтверждают в магазине.</p></section></div>`;
  $('live-photo').onchange=e=>prepareLivePhoto(e.target.files[0]);
  $('live-consent').onchange=e=>{live.consent=e.target.checked;renderFitting()};
  $('use-demo-person').onclick=useDemoPerson;
  $('live-generate').onclick=startLiveGeneration;
  if($('live-remove'))$('live-remove').onclick=removeLivePhoto;
  if($('fit-cancel'))$('fit-cancel').onclick=cancelLiveGeneration;
  document.querySelectorAll('[data-live-product]').forEach(el=>el.onchange=()=>{live.selected=new Set([el.dataset.liveProduct]);renderFitting()});
  bindLiveResults();paintFitClock();
}
async function prepareLivePhoto(file){
  if(!file||live.busy)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){live.error='Выберите JPG, PNG или WebP до 10 МБ.';renderFitting();return}
  const epoch=++live.epoch;live.photoBusy=true;live.error='';renderFitting();let bitmap;
  try{
    bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
    if(bitmap.width<300||bitmap.height<300||bitmap.width*bitmap.height>48000000)throw Error('Нужно чёткое фото от 300 пикселей по каждой стороне, до 48 мегапикселей.');
    const scale=Math.min(1,1296/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));if(!blob)throw Error('Не удалось подготовить изображение.');
    if(epoch!==live.epoch)return;
    clearFitMedia();live.photo=blob;live.preview=URL.createObjectURL(blob);live.consent=false;live.demo=false;live.status='';live.active=0;
  }catch(e){if(epoch===live.epoch)live.error=e.message||'Не удалось открыть фотографию.'}
  finally{bitmap?.close();if(epoch===live.epoch){live.photoBusy=false;if(view==='fitting')renderFitting()}}
}
function clearFitMedia(){if(live.preview?.startsWith('blob:'))URL.revokeObjectURL(live.preview);for(const r of new Set([...live.results,...live.saved]))if(r.image?.startsWith('blob:'))URL.revokeObjectURL(r.image);live.results=[];live.saved=[]}
function removeLivePhoto(){if(live.busy||live.photoBusy)return;clearFitMedia();live.epoch++;Object.assign(live,{photo:null,preview:null,consent:false,demo:false,error:'',status:'Фото и результаты удалены из этой страницы.'});renderFitting()}
async function useDemoPerson(){if(live.busy||live.photoBusy)return;live.photoBusy=true;live.error='';renderFitting();try{const r=await fetch('assets/tryon-demo.webp');if(!r.ok)throw Error('Не удалось открыть демофото.');const blob=await r.blob();clearFitMedia();Object.assign(live,{photo:blob,preview:URL.createObjectURL(blob),demo:true,selected:new Set(['jacket']),consent:true,status:'Загружена AI-демомодель.'})}catch(e){live.error=e.message}finally{live.photoBusy=false;if(view==='fitting')renderFitting()}}
function paintFitClock(){if($('fit-time')){const seconds=Math.floor((Date.now()-live.started)/1000);$('fit-time').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}if($('fit-stage'))$('fit-stage').textContent=live.status}
function stageFit(text,stage){live.status=text;live.stage=stage;paintFitClock()}
function freeError(error){const m=String(error?.message||error||'');if(/quota|exceeded|daily|GPU quota|ZeroGPU.*limit/i.test(m))return 'Бесплатный лимит сервиса исчерпан. Попробуйте позже. Фото и выбранная вещь остаются здесь; платных списаний нет.';if(/queue.*full|too many|429/i.test(m))return 'В бесплатной примерочной сейчас много посетителей. Попробуйте позже.';if(/abort|cancel/i.test(m))return 'Ожидание отменено.';if(/timeout|timed out/i.test(m))return 'Сервис долго не отвечает. Ожидание остановлено; попробуйте позже.';if(/fetch|network|connection/i.test(m))return 'Не удалось связаться с бесплатной примерочной. Проверьте интернет и попробуйте ещё раз.';return 'Примерка не завершилась. Повторите попытку с чётким фото в полный рост.'}
async function startLiveGeneration(){
  const item=product([...live.selected][0]);if(live.busy||live.photoBusy||!live.photo||!live.consent||!item?.tryon)return;
  const epoch=++live.epoch;live.busy=true;live.error='';live.started=Date.now();live.stage='connecting';live.status='Подключаем бесплатную примерочную…';renderFitting();$('tryon-panel').scrollIntoView({behavior:'smooth',block:'start'});clearInterval(fitClock);fitClock=setInterval(paintFitClock,1000);
  let watchdog,expired=false;
  const assertActive=()=>{if(expired||epoch!==live.epoch)throw Error('cancelled')};
  try{
    const work=async()=>{
      const {Client,handle_file}=await import('./vendor/gradio-client-2.7.1.js');assertActive();
      if(!freeClientPromise)freeClientPromise=Client.connect(FIT_ORIGIN,{events:['data','status']}).catch(e=>{freeClientPromise=null;throw e});
      const client=await freeClientPromise;assertActive();stageFit('Передаём фото и выбранную вещь…','uploading');
      const garmentResponse=await fetch(item.image);if(!garmentResponse.ok)throw Error('garment fetch failed');const garment=await garmentResponse.blob();assertActive();
      const submission=client.submit('/try_on',{person_image:handle_file(live.photo),garment_image:handle_file(garment),category:item.tryonCategory,garment_photo_type:item.photoType,num_timesteps:20,guidance_scale:1.5,seed:42,segmentation_free:true});live.submission=submission;
      let result;
      for await(const event of submission){assertActive();if(event.type==='status'){
        if(event.stage==='error')throw Error(event.message||'generation failed');
        if(event.stage==='pending')stageFit(Number.isFinite(event.position)?`Ожидаем свободную примерочную. Место в очереди: ${event.position+1}.`:'Ожидаем свободную примерочную…','queued');
        if(event.stage==='generating')stageFit('AI примеряет выбранную вещь. Пожалуйста, подождите…','generating');
      }if(event.type==='data')result=event.data?.[0]}
      assertActive();if(!result)throw Error('No result image');
      const raw=typeof result==='string'?result:result.url||(result.path?FIT_ORIGIN+'/gradio_api/file='+result.path:null);if(!raw)throw Error('No result URL');
      const outputURL=new URL(raw,FIT_ORIGIN);if(outputURL.origin!==FIT_ORIGIN)throw Error('Unexpected result origin');
      stageFit('Получаем готовый образ…','downloading');const response=await fetch(outputURL.href);if(!response.ok)throw Error('result fetch failed');const blob=await response.blob();if(!blob.type.startsWith('image/')||blob.size>15*1024*1024)throw Error('Invalid image');
      const decoded=await createImageBitmap(blob);const width=decoded.width,height=decoded.height;decoded.close();assertActive();
      const image=URL.createObjectURL(blob);live.results.push({image,blob,productId:item.id,variant:1,width,height,elapsedMs:Date.now()-live.started,generatedAt:new Date().toISOString()});live.active=live.results.length-1;live.status='Образ готов. Сравните и скачайте понравившийся результат.';live.stage='complete';
    };
    await Promise.race([work(),new Promise((_,reject)=>{watchdog=setTimeout(()=>{if(epoch!==live.epoch){reject(Error('cancelled'));return}expired=true;live.submission?.cancel();reject(Error('timeout'))},240000)})]);
  }catch(e){if(epoch===live.epoch){live.error=freeError(e);live.stage='error';live.status='';console.warn('ZANOZA try-on:',String(e?.message||e))}}
  finally{clearTimeout(watchdog);if(epoch===live.epoch){live.busy=false;live.submission=null;clearInterval(fitClock);if(view==='fitting'){renderFitting();$('tryon-panel').scrollIntoView({behavior:'smooth',block:'start'})}}}
}
function cancelLiveGeneration(){if(!live.busy)return;live.epoch++;live.submission?.cancel();live.submission=null;live.busy=false;live.status='Ожидание отменено. Можно выбрать другую вещь и попробовать снова.';live.stage='cancelled';clearInterval(fitClock);renderFitting()}
function renderLiveResult(){const r=live.results[live.active]||live.results[0];return `<figure class="result-showcase free-result"><img src="${r.image}" alt="AI-примерка: ${esc(product(r.productId).name)}"><figcaption>${esc(product(r.productId).name)} · AI-образ</figcaption></figure><details class="result-compare"><summary>Сравнить до и после</summary><div class="live-comparison"><figure><img src="${live.preview}" alt="Исходное фото"><figcaption>До</figcaption></figure><figure><img src="${r.image}" alt="Фото после AI-примерки"><figcaption>После</figcaption></figure></div></details><div class="live-thumbnails">${live.results.map((x,i)=>`<button data-live-result="${i}" class="${i===live.active?'active':''}" aria-pressed="${i===live.active}"><img src="${x.image}" alt="">${esc(product(x.productId).name)}</button>`).join('')}</div><div class="inline-actions"><button class="secondary" id="live-download">Скачать образ</button><button class="secondary" id="live-save">♡ В мои образы</button><button class="secondary" data-detail="${r.productId}">Размеры и цена</button></div><p class="muted">Скачайте результат до закрытия страницы. Фото и примерки не сохраняются после обновления.</p>`}
function bindLiveResults(){document.querySelectorAll('[data-live-result]').forEach(b=>b.onclick=()=>{live.active=Number(b.dataset.liveResult);renderFitting()});if($('live-download'))$('live-download').onclick=()=>downloadLiveImage(live.results[live.active]);if($('live-save'))$('live-save').onclick=()=>{const r=live.results[live.active];if(!live.saved.includes(r))live.saved.push(r);toast('Образ сохранён в этой сессии')};bindCards()}
function downloadLiveImage(r){const a=document.createElement('a');a.href=r.image;a.download='ZANOZA-'+r.productId+(r.blob.type==='image/webp'?'.webp':r.blob.type==='image/png'?'.png':'.jpg');document.body.appendChild(a);a.click();a.remove()}
function renderLooks(){const saved=products.filter(p=>favs.has(p.id));$('content').innerHTML=`<div class="page-title"><h1>Мои образы</h1><p class="muted">Сохраняются до закрытия или обновления страницы. Скачайте любимые примерки.</p></div><section class="panel"><h2>Примерки по вашему фото</h2><div class="product-grid">${live.saved.length?live.saved.map((r,i)=>`<article><img class="saved-result" src="${r.image}" alt="${esc(product(r.productId).name)}"><h3>${esc(product(r.productId).name)}</h3><button class="secondary" data-live-download="${i}">Скачать</button><button class="quiet" data-live-delete="${i}">Убрать</button></article>`).join(''):'<p class="muted">Нажмите «В мои образы» под готовой примеркой.</p>'}</div></section><h2>Избранные вещи</h2><div class="product-grid">${saved.length?saved.map(card).join(''):'<p class="muted">Нажмите сердечко на карточке товара.</p>'}</div>`;document.querySelectorAll('[data-live-download]').forEach(b=>b.onclick=()=>downloadLiveImage(live.saved[Number(b.dataset.liveDownload)]));document.querySelectorAll('[data-live-delete]').forEach(b=>b.onclick=()=>{live.saved.splice(Number(b.dataset.liveDelete),1);renderLooks()});bindCards()}
