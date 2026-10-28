'use strict';
(function(){
 const D=window.CAREER_DATA, el=document.getElementById('app');
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state={step:0,coins:Object.fromEntries(D.domains.map(d=>[d.id,0])),activities:[],values:[],episodes:['',''],episodeSkip:false,interestSkip:false,activitySkip:false,place:'',device:'',education:'',region:'113',skills:[],preferred:''};
 const labels=['','Интересы','Занятия','Твои примеры','Приоритеты','Условия','Твоя карта'];
 const placeLabels={local:'Рядом с домом',remote:'Удалённо из России',move:'Готов рассмотреть переезд',unknown:'Пока не решил'};
 const deviceLabels={phone:'Пока только телефон',computer:'Есть доступ к компьютеру',unknown:'Нужно найти доступ к технике'};
 const educationLabels={college:'Рассматриваю колледж',university:'Рассматриваю вуз',unknown:'Хочу сравнить варианты'};
 let pdfUrl=null,pdfBytes=null;
 function used(){return Object.values(state.coins).reduce((a,b)=>a+b,0)}
 function domain(id){return D.domains.find(d=>d.id===id)}
 function activity(id){return D.activities.find(a=>a.id===id)}
 function value(id){return D.values.find(v=>v.id===id)}
 function qs(s){return el.querySelector(s)}
 function qsa(s){return [...el.querySelectorAll(s)]}
 function btn(text,id,secondary){return '<button class="btn'+(secondary?' secondary':'')+'" id="'+id+'">'+text+'</button>'}
 function header(n,title,lead){return '<div class="step-head"><span>Шаг '+n+' из 6 · '+labels[n]+'</span><span>7–10 минут на всё</span></div><div class="progress-line"><span style="width:'+Math.round(n/6*100)+'%"></span></div><section class="step-intro"><div class="eyebrow">'+labels[n]+'</div><h2 id="step-title" tabindex="-1">'+title+'</h2><p class="lead">'+lead+'</p></section>'}
 function footer(nextText){return '<p id="error" class="error" role="alert"></p><div class="step-actions">'+btn('Назад','back',true)+btn(nextText||'Дальше','next')+'</div>'}
 function error(s){const e=qs('#error');e.textContent=s;e.scrollIntoView({behavior:'smooth',block:'center'})}
 function setStep(n){state.step=n;render();window.scrollTo(0,0);const h=qs('#step-title');if(h)h.focus({preventScroll:true})}
 function bindNext(){qs('#back').onclick=()=>setStep(state.step-1);qs('#next').onclick=next}
 function next(){
  if(state.step===1&&used()!==12&&!state.interestSkip)return error('Распредели все 12 фишек. Или выбери «Пока не могу определиться».');
  if(state.step===2&&state.activities.length!==3&&!state.activitySkip)return error('Выбери три занятия. Можно выбрать незнакомое, которое интересно попробовать.');
  if(state.step===3&&!state.episodeSkip&&(state.episodes[0].trim().length<20||state.episodes[1].trim().length<20))return error('Напиши по одному-двум предложениям о каждом примере. Если пока трудно вспомнить, можно продолжить без примеров.');
  if(state.step===4&&state.values.length!==3)return error('Выбери три приоритета. Здесь нет правильных ответов.');
  if(state.step===5&&(!state.place||!state.device||!state.education))return error('Отметь формат работы, доступ к технике и образовательный маршрут. Везде можно выбрать «пока не знаю».');
  setStep(state.step+1);
 }
 function landing(){
 el.innerHTML='<section class="hero"><div><div class="eyebrow">Профнавигатор · 16+ · первые пробы</div><h1>Примерь<br>своё будущее.</h1><p>Что тебе интересно делать? В какой работе это может пригодиться? Собери свою карту и выбери первую пробу.</p><div class="actions">'+btn('Собрать мою карту →','start')+'</div><p class="fine">7–10 минут · 6 шагов · личный PDF без регистрации</p></div><div class="hero-illustration"><img src="assets/hero-professions.png" width="1122" height="1402" fetchpriority="high" alt="Яркая иллюстрация разных направлений: техника, обучение, дизайн, цифровые проекты и помощь людям"></div></section><section class="feature-strip"><div><b>Подвигай фишки</b><p>Распредели интерес между разными занятиями.</p></div><div><b>Добавь свой опыт</b><p>Вспомни, что тебе уже хотелось делать самому.</p></div><div><b>Унеси свою карту</b><p>PDF останется на твоём телефоне. Вернись к нему после первой пробы.</p></div></section>';
 qs('#start').onclick=()=>setStep(1);
 }
 function interests(){
 const rem=12-used();
 el.innerHTML=header(1,'На что потратить<br>свой интерес?','У тебя 12 фишек. Раздай их занятиям, к которым тянет больше. Можно распределить поровну или сделать явный выбор. Это не оценка того, что ты уже умеешь.')+
 '<div class="token-bank"><div><b id="remaining">Осталось '+rem+'</b><div class="fine">Перетащи фишку на карточку<br>или нажимай + и −</div></div><div class="coins" aria-hidden="true">'+Array.from({length:12},(_,i)=>'<span class="coin'+(i>=rem?' used':'')+'" data-coin="'+i+'"></span>').join('')+'</div></div>'+
 '<div class="grid">'+D.domains.map(d=>'<article class="domain-card" data-domain="'+d.id+'" style="--accent:'+d.color+'"><h3>'+d.name+'</h3><p class="verb">'+d.verb+'</p><p>'+d.example+'</p><div class="counter"><button type="button" data-minus="'+d.id+'" aria-label="Убрать фишку: '+d.name+'" '+(!state.coins[d.id]?'disabled':'')+'>−</button><output id="count-'+d.id+'" aria-live="polite">'+state.coins[d.id]+'</output><button type="button" data-plus="'+d.id+'" aria-label="Добавить фишку: '+d.name+'" '+(!rem?'disabled':'')+'>+</button></div></article>').join('')+'</div><button class="skip" id="skip-interest">Пока не могу определиться — посмотрю конкретные занятия</button>'+footer();
 qsa('[data-plus]').forEach(b=>bindCounter(b,()=>addCoin(b.dataset.plus)));
 qsa('[data-minus]').forEach(b=>bindCounter(b,()=>{if(state.coins[b.dataset.minus]>0){state.coins[b.dataset.minus]--;state.interestSkip=false;updateInterestCounters()}}));
 qs('#skip-interest').onclick=()=>{state.interestSkip=true;Object.keys(state.coins).forEach(k=>state.coins[k]=0);setStep(2)};
 const bank=qs('.coins');
 bank.onpointerdown=e=>{
  const coin=e.target.closest('.coin');if(!coin||coin.classList.contains('used'))return;
  if(e.pointerType!=='touch')e.preventDefault();
  const ghost=document.createElement('span');ghost.className='drag-ghost';document.body.appendChild(ghost);
  const move=v=>{ghost.style.display='block';ghost.style.left=(v.clientX-18)+'px';ghost.style.top=(v.clientY-18)+'px'};
  move(e);
  const up=v=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);ghost.remove();const target=document.elementFromPoint(v.clientX,v.clientY);const card=target&&target.closest('[data-domain]');if(card)addCoin(card.dataset.domain)};
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});
 };
 bindNext();
 }
 function bindCounter(button,action){
  let touchAt=-Infinity;
  button.onpointerup=e=>{if(e.pointerType!=='touch'||button.disabled)return;const r=button.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;touchAt=performance.now();action()};
  button.onclick=e=>{if(e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents||(e.detail!==0&&performance.now()-touchAt<800))return;action()};
 }
 function updateInterestCounters(){
  const rem=12-used();
  qs('#remaining').textContent='Осталось '+rem;
  qsa('[data-coin]').forEach(coin=>coin.classList.toggle('used',+coin.dataset.coin>=rem));
  D.domains.forEach(d=>{qs('#count-'+d.id).textContent=state.coins[d.id]});
  qsa('[data-plus]').forEach(b=>{b.disabled=!rem});
  qsa('[data-minus]').forEach(b=>{b.disabled=!state.coins[b.dataset.minus]});
 }
 // Сохраняем touch-target и клавиатурный фокус: меняем значения, а не весь экран.
 function addCoin(id){if(used()<12){state.coins[id]++;state.interestSkip=false;updateInterestCounters()}}
 function activities(){
 el.innerHTML=header(2,'Что хочется<br>попробовать?','Выбери три занятия. Не обязательно уже уметь: интересно ли тебе пройти весь путь, включая ошибки и переделки?')+
 '<p class="subtle" id="selected-count">Выбрано '+state.activities.length+' из 3</p><div class="choices">'+D.activities.map(a=>'<button type="button" class="choice '+(state.activities.includes(a.id)?'selected':'')+'" data-activity="'+a.id+'" aria-pressed="'+state.activities.includes(a.id)+'"><span class="check">✓</span><span>'+a.text+'</span></button>').join('')+'</div><button class="skip" id="skip-activities">Пока не знаю — хочу сначала познакомиться с разными задачами</button>'+footer();
 qsa('[data-activity]').forEach(b=>b.onclick=()=>{const id=b.dataset.activity;if(state.activities.includes(id))state.activities=state.activities.filter(x=>x!==id);else if(state.activities.length<3)state.activities.push(id);else return error('Можно выбрать три занятия. Сначала сними одно, чтобы заменить его.');state.activitySkip=false;activities()});
 qs('#skip-activities').onclick=()=>{state.activitySkip=true;state.activities=[];setStep(3)};
 bindNext();
 }
 function episodes(){
 el.innerHTML=header(3,'Что ты уже<br>заметил о себе?','Это личные заметки для твоей карты. Они не меняют автоматический подбор: смысл свободного текста здесь не анализируется. Можно записать пример или пропустить шаг.')+
 '<div class="field"><label for="ep0">Дело, к которому ты вернулся сам</label><p class="fine">Что ты делал? Что хотелось продолжить? Одно-два предложения.</p><textarea id="ep0" maxlength="480" placeholder="Например: делал… Мне понравилось…">'+esc(state.episodes[0])+'</textarea></div>'+
 '<div class="field"><label for="ep1">Результат, который тебя порадовал</label><p class="fine">Какой другой пример вспомнишь? Что сделал сам, с чем помогли?</p><textarea id="ep1" maxlength="480" placeholder="У меня получилось… Я сам решил…">'+esc(state.episodes[1])+'</textarea></div>'+
 '<p class="form-note">Твои слова войдут в PDF. Не пиши фамилию, контакты и другие личные сведения.</p><button class="skip" id="skip-episodes">Пока трудно вспомнить — добавлю примеры после пробы</button>'+footer();
 [0,1].forEach(i=>qs('#ep'+i).oninput=e=>{state.episodes[i]=e.target.value;state.episodeSkip=false});
 qs('#skip-episodes').onclick=()=>{state.episodeSkip=true;setStep(4)};
 bindNext();
 }
 function values(){
 el.innerHTML=header(4,'Что важно<br>в будущей работе?','Выбери три приоритета. Затем поставь самый важный первым. Доход, интерес и условия можно обсуждать вместе — здесь нет правильного набора.')+
 '<div class="choices">'+D.values.map(v=>'<button type="button" class="choice '+(state.values.includes(v.id)?'selected':'')+'" data-value="'+v.id+'" aria-pressed="'+state.values.includes(v.id)+'"><span class="check">✓</span><span>'+v.text+'<small>'+v.hint+'</small></span></button>').join('')+'</div><div class="rank-list" aria-label="Порядок приоритетов">'+state.values.map((id,i)=>'<div class="rank-item"><span><b>'+(i+1)+'.</b> '+value(id).text+'</span><div><button data-up="'+i+'" '+(i===0?'disabled':'')+' aria-label="Поднять приоритет '+value(id).text+'">↑</button><button data-down="'+i+'" '+(i===state.values.length-1?'disabled':'')+' aria-label="Опустить приоритет '+value(id).text+'">↓</button></div></div>').join('')+'</div>'+footer();
 qsa('[data-value]').forEach(b=>b.onclick=()=>{const id=b.dataset.value;if(state.values.includes(id))state.values=state.values.filter(x=>x!==id);else if(state.values.length<3)state.values.push(id);else return error('Оставь три главных приоритета. Остальные можно учитывать позже.');values()});
 qsa('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[state.values[i-1],state.values[i]]=[state.values[i],state.values[i-1]];values()});
 qsa('[data-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.down;[state.values[i+1],state.values[i]]=[state.values[i],state.values[i+1]];values()});
 bindNext();
 }
 function radios(key,legend,items){return '<fieldset><legend>'+legend+'</legend><div class="radios">'+Object.entries(items).map(([id,t])=>'<label class="radio"><input type="radio" name="'+key+'" value="'+id+'" '+(state[key]===id?'checked':'')+'><span>'+t+'</span></label>').join('')+'</div></fieldset>'}
 function conditions(){
 el.innerHTML=header(5,'Какой путь<br>тебе удобнее?','Интерес и условия — разные вещи. Отметь, что нужно учесть сейчас. Ответ «пока не знаю» тоже полезен.')+
 radios('place','Где хочется работать?',placeLabels)+radios('device','Что доступно для первой пробы?',deviceLabels)+radios('education','Какой учебный маршрут рассматриваешь?',educationLabels)+
 '<div class="field"><label for="region">Где смотреть примеры вакансий?</label><select id="region"><option value="113">Россия</option><option value="12">Благовещенск</option><option value="1932">Амурская область</option></select><p class="fine">Ссылки — для исследования работы, а не обещание, что на неё можно устроиться прямо сейчас.</p></div>'+footer('Получить мою карту →');
 qs('#region').value=state.region;
 qs('#region').onchange=e=>state.region=e.target.value;
 qsa('input[type=radio]').forEach(i=>i.onchange=()=>state[i.name]=i.value);
 bindNext();
 }
 function compute(s){
  const counts=D.domains.map((d,index)=>{const selected=s.activities.map(activity).filter(a=>a.domain===d.id);return {id:d.id,score:s.coins[d.id]+selected.length*2,coins:s.coins[d.id],activities:selected,index}});
  counts.sort((a,b)=>b.score-a.score||b.activities.length-a.activities.length||a.index-b.index);
  const noEvidence=counts[0].score===0;
  const broad=counts[0].score-counts[3].score<=1;
  return {top:counts.slice(0,3),all:counts,noEvidence,broad};
 }
 function why(item){
  const bits=[];
  if(item.coins)bits.push('Ты отдал этому виду занятий '+item.coins+' '+(item.coins===1?'фишку':item.coins<5?'фишки':'фишек')+'.');
  if(item.activities.length)bits.push('Выбрано: '+item.activities.map(a=>'«'+a.text+'»').join('; ')+'.');
  if(!bits.length)bits.push('Это дополнительный вариант для сравнения: прямого интереса в ответах пока недостаточно. Проверь его короткой пробой, а не принимай как вывод о себе.');
  return bits.join(' ');
 }
 function hhLink(d,remote){const query=remote&&d.id==='R'?'инженер конструктор CAD':d.query;return 'https://hh.ru/search/vacancy?area='+encodeURIComponent(remote?'113':state.region)+'&text='+encodeURIComponent(query)+(remote?'&schedule=remote':'')}
 function resultCard(item,n){
  const d=domain(item.id),remote=state.place==='remote',roles=remote?d.remoteRoles:d.roles;
  return '<article class="result-card" style="--accent:'+d.color+'"><div class="kicker">Гипотеза '+n+' · для первой пробы</div><h3>'+d.title+'</h3><p>'+esc(why(item))+'</p><div class="result-columns"><div><h4>Какие роли посмотреть</h4><ul>'+roles.map(x=>'<li>'+x+'</li>').join('')+'</ul><h4 style="margin-top:18px">Что освоить</h4><ul>'+d.base.map(x=>'<li>'+x+'</li>').join('')+'</ul></div><div><h4>Маленькая проба</h4><p>'+d.probe+'</p><p><b>Результат:</b> '+d.result+'</p><p><b>Вопрос после:</b> '+d.check+'</p></div></div><details><summary>Образование и формат работы</summary><p>'+d.route+'</p><p>'+d.remoteNote+'</p></details><div class="actions"><a class="btn secondary" target="_blank" rel="noopener" href="'+hhLink(d,remote)+'">Посмотреть задачи в вакансиях ↗</a><a target="_blank" rel="noopener" href="https://proektoria.online/catalog">Каталог профессий ↗</a></div><p class="fine">Это примеры направлений, не список подходящих тебе вакансий. В объявлении проверь образование, опыт, место работы и требования.</p></article>';
 }
 function result(){
  const r=compute(state);
  if(state.preferred&&!r.top.some(x=>x.id===state.preferred))state.preferred='';
  el.innerHTML=header(6,'Твоя карта<br>первых проб.',r.noEvidence?'Пока интересы не определились — это нормально. Ниже три разных направления для знакомства. Карта станет точнее после реальных проб.':r.broad?'Интересы распределились широко. Ниже несколько вариантов для сравнения, без назначения одной профессии.':'В твоих ответах заметны несколько направлений. Считай их рабочими гипотезами и проверь на небольшой задаче.')+
  '<div class="result-banner"><div><h3>Забери карту с собой</h3><p>Твои ответы, три направления, ссылки и план на неделю.</p><div id="pdf-status" class="pdf-status" role="status"></div><div id="pdf-ready"></div></div>'+btn('Скачать мой PDF ↓','download',false)+'</div>'+
  '<section><h3>Твои приоритеты</h3><div class="tag-row">'+state.values.map((id,i)=>'<span class="tag">'+(i+1)+'. '+value(id).text+'</span>').join('')+'</div><p class="fine">'+esc(placeLabels[state.place]||'Формат пока не выбран')+' · '+esc(educationLabels[state.education]||'Маршрут пока не выбран')+'. Это условия поиска, а не оценка способностей.</p></section>'+
  (state.place==='remote'?'<p class="form-note">Удалённые вакансии ищем по всей России. В карточке отдельно проверь страну проживания, часовой пояс и необходимость выездов.</p>':'')+r.top.map((it,i)=>resultCard(it,i+1)).join('')+
  '<section><h3>Что ты уже заметил о себе</h3>'+state.episodes.filter(x=>x.trim()).map(x=>'<div class="quote">'+esc(x)+'</div>').join('')+(!state.episodes.some(x=>x.trim())?'<p>Конкретные эпизоды пока не названы. После первой пробы запиши, что делал, что получилось и что захотелось продолжить.</p>':'')+'</section>'+
  '<section><h3>План на семь дней</h3><ol class="week">'+weekPlan().map((x,i)=>'<li><b>День '+(i+1)+'</b>'+x+'</li>').join('')+'</ol></section>'+
  '<section><h3>Как сравнить зарплаты</h3><p>Смотри вакансии одного города и уровня опыта. Отмечай: сумма за месяц или за проект, на руки или до налогов, полный день или часть дня. Высокая зарплата опытного специалиста не описывает старт после курса.</p><p><a target="_blank" rel="noopener" href="https://career.habr.com/salaries">Зарплаты цифровых специалистов — Хабр Карьера ↗</a></p><p class="fine">Один источник и одна сумма не определяют будущее дохода. Вопрос о работе на иностранную компанию начинается с проверки, нанимает ли она сотрудников, живущих в России.</p></section>'+
  '<section class="form-note">Эта карта не измеряет способности, не определяет единственное призвание и не гарантирует поступление или доход. Обсуди варианты с человеком, который знает интересующую работу, и возвращайся к выводам после каждой пробы.</section>'+
  '<div class="actions">'+btn('Изменить ответы','edit',true)+btn('Начать заново','restart',true)+'</div><div id="restart-confirm"></div><p class="fine">Правила карты '+D.version+'. <button id="method-bottom" class="quiet-btn">Методика и приватность</button></p>';
  qsa('.result-card').forEach((card,i)=>{const id=r.top[i].id;card.querySelector('h3').insertAdjacentHTML('afterend','<button type="button" class="btn secondary" data-prefer="'+id+'" aria-pressed="'+(state.preferred===id)+'">'+(state.preferred===id?'✓ Моя первая проба':'Начну с этой пробы')+'</button>')});
  function updatePreference(){qsa('[data-prefer]').forEach(b=>{const on=b.dataset.prefer===state.preferred;b.setAttribute('aria-pressed',String(on));b.textContent=on?'✓ Моя первая проба':'Начну с этой пробы'});qs('#pdf-status').textContent=state.preferred?'Первая проба: '+domain(state.preferred).title:'Выбери ниже одну первую пробу — она станет главным действием в твоём PDF.'}
  qsa('[data-prefer]').forEach(b=>b.onclick=()=>{state.preferred=b.dataset.prefer;updatePreference()});
  updatePreference();
  qs('#download').onclick=downloadPdf;
  qs('#edit').onclick=()=>setStep(1);
  qs('#restart').onclick=()=>{qs('#restart-confirm').innerHTML='<p>Начать новую карту? Ответы в этой вкладке сотрутся. Скачанный PDF останется.</p>'+btn('Да, новая карта','confirm-restart',true);qs('#confirm-restart').onclick=()=>location.reload()};
  qs('#method-bottom').onclick=showAbout;
 }
 function weekPlan(){return [
 'Выбери одно направление из карты и сформулируй, какую задачу хочешь попробовать.',
 'Прочитай три вакансии одной роли в одном регионе. Выпиши повторяющиеся задачи, навыки и требования к образованию.',
 'Сделай первую версию маленькой учебной работы. ИИ может помогать объяснять и создавать; свои решения и вопросы отмечай отдельно.',
 'Покажи результат другому человеку. Попроси назвать одно понятное и одно непонятное место.',
 'Внеси одну правку и проверь, что стало лучше. Сохрани обе версии.',
 'Запиши: что понравилось в самой работе, что было трудно, что хочется повторить. Трудность первого раза ещё не означает, что направление тебе не подходит.',
 'Выбери следующий опыт: повторить задачу, попробовать соседнюю роль или поговорить со специалистом. Обнови свою карту.'
 ]}
 function showAbout(){document.getElementById('about').showModal()}
 function render(){({0:landing,1:interests,2:activities,3:episodes,4:values,5:conditions,6:result}[state.step])()}
 const loadCache={};
 function loadScript(src){return loadCache[src]||(loadCache[src]=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{delete loadCache[src];s.remove();reject(Error('Не удалось загрузить модуль PDF. Проверь соединение и попробуй ещё раз.'))};document.head.appendChild(s)}))}
 async function downloadPdf(){
  const b=qs('#download'),status=qs('#pdf-status');b.disabled=true;b.textContent='Собираю PDF…';status.textContent='Обычно это занимает несколько секунд. Ответы никуда не отправляются.';
  if(!state.preferred){b.disabled=false;b.textContent='Скачать мой PDF ↓';status.textContent='Сначала выбери одну из трёх проб кнопкой «Начну с этой пробы».';qs('.result-card').scrollIntoView({behavior:'smooth',block:'start'});return}
  try{
   await Promise.all([loadScript('assets/pdf-lib.min.js'),loadScript('assets/fontkit.min.js')]);
   if(!window.CareerPdf)await loadScript('pdf.js?v=20261029b');
   pdfBytes=await window.CareerPdf.build({state:JSON.parse(JSON.stringify(state)),result:compute(state),data:D,week:weekPlan(),why,hhLink});
   if(pdfUrl)URL.revokeObjectURL(pdfUrl);
   pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
   const name='Моя_карта_профессий_ScienceOn.pdf';
   const a=document.createElement('a');a.href=pdfUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();
   status.textContent='PDF готов. Сохрани его на телефон.';
   qs('#pdf-ready').innerHTML='<a class="download-ready" href="'+pdfUrl+'" download="'+name+'">Скачать ещё раз / открыть PDF</a><p class="fine" style="color:#c7dfd1">Если открылся просмотр: используй «Поделиться» или меню браузера → «Сохранить в файлы».</p>';
   b.textContent='Скачать PDF ещё раз ↓';
  }catch(e){status.textContent=e.message||'PDF пока не создан. Попробуй ещё раз; ответы сохранены в открытой вкладке.';b.textContent='Повторить создание PDF'}
  finally{b.disabled=false}
 }
 document.getElementById('about-btn').onclick=showAbout;
 document.getElementById('close-about').onclick=()=>document.getElementById('about').close();
 document.getElementById('method-links').innerHTML=D.sources.map(s=>'<p><a target="_blank" rel="noopener" href="'+esc(s.url)+'">'+esc(s.title)+'</a></p>').join('');
 window.CareerApp={state,compute,render,setStep,weekPlan,why,hhLink,esc};
 render();
})();

