(() => {
  'use strict';
  const data = window.SCIENCEON;
  if (!data || !Array.isArray(data.events) || !Array.isArray(data.speakers)) {
    const list = document.querySelector('#program-list');
    list.innerHTML = '<div class="empty-state"><h3>Программа временно недоступна</h3><p>Откройте актуальный каталог организатора.</p><a class="button button-blue" href="https://fond-podderzhki-tal-org.timepad.ru/events/" target="_blank" rel="noopener noreferrer">Программа на Timepad ↗</a></div>';
    document.querySelector('#result-count').textContent = 'Проверьте программу у организатора';
    return;
  }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value, location.href); return ['http:','https:','file:'].includes(u.protocol) ? esc(value) : '#'; } catch { return '#'; } };
  const personById = new Map(data.speakers.map(p => [p.id, p]));
  const eventById = new Map(data.events.map(e => [String(e.id), e]));
  const events = [...data.events].sort((a,b) => Number(a.day)-Number(b.day) || String(a.time).localeCompare(String(b.time)));
  const days = {27:'вторник',28:'среда',29:'четверг',30:'пятница'};
  const topics = {study:'Учёба',career:'Карьера',content:'Контент',code:'Код',business:'Работа и бизнес',safety:'Осознанный ИИ',life:'Для жизни',fun:'Общение и игра'};
  const eventUrl = e => `https://fond-podderzhki-tal-org.timepad.ru/event/${e.id}/`;
  const bookmarkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16l-5-3-5 3z"/></svg>';
  const storage = {get(key, fallback) {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}};
  const rawSaved = storage.get('scienceon-route-v1', []);
  const saved = new Set((Array.isArray(rawSaved)?rawSaved:[]).filter(id=>eventById.has(String(id))).map(String));
  let selectedDay = 'all', selectedTopic = 'all', onlySaved = false, toastTimer, lastFocus, modalMode = '';
  const dialog = $('#detail-dialog');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let explicitReduced = storage.get('scienceon-less-motion', false) === true;
  let reduced = reducedQuery.matches || explicitReduced;

  function initials(p) { return p.name.split(/\s+/).map(v=>v[0]||'').slice(0,2).join(''); }
  function photo(p, cls = '', lazy = true) {
    const scale = Math.max(1, Math.min(4, Number(p.photoScale) || 1));
    if (p.photo && p.photoCrop) return `<span class="photo-crop ${cls}" role="img" aria-label="${esc(p.name)}" style="background-image:url('${safeUrl(p.photo)}');background-size:${esc(p.photoCrop.size)};background-position:${esc(p.photoCrop.position)}"></span>`;
    if (p.photo) return `<img class="${cls}" src="${safeUrl(p.photo)}" alt="${esc(p.name)}" ${lazy?'loading="lazy"':''} style="object-position:${esc(p.photoPosition||'center')};--photo-scale:${scale};--photo-hover-scale:${scale*1.045};transform-origin:right center">`;
    return `<span class="photo-placeholder ${cls}" role="img" aria-label="Фотография ${esc(p.name)} уточняется"><b>${esc(initials(p))}</b><span>Фото уточняется</span></span>`;
  }
  function avatar(p) {return p.photo?`<span class="avatar avatar-image-wrap">${photo(p,'avatar-image')}</span>`:`<span class="avatar avatar-fallback" aria-hidden="true">${esc(initials(p))}</span>`;}
  function topicList(e) {
    if (Array.isArray(e.topics) && e.topics.length) return e.topics;
    const t = e.title.toLowerCase();
    if (/учиться/.test(t)) return ['study'];
    if (/карьер/.test(t)) return ['career','study'];
    if (/контент|нейрокадр|дизайнер/.test(t)) return ['content'];
    if (/вайб|кодинг/.test(t)) return ['code','business'];
    if (/монет/.test(t)) return ['business'];
    if (/фейки|угрозы/.test(t)) return ['safety'];
    if (/помощник|врач/.test(t)) return ['life','safety'];
    if (/квиз|квартирник|баттл/.test(t)) return ['fun'];
    return ['safety'];
  }
  function speakerNames(e) {return (e.speakers||[]).map(id=>personById.get(id)).filter(Boolean);}
  function saveButton(e) {const active=saved.has(String(e.id));return `<button type="button" class="save-button" data-save="${esc(e.id)}" aria-pressed="${active}" aria-label="${active?'Убрать из маршрута':'В маршрут'}: ${esc(e.title)}" title="${active?'Убрать из маршрута':'Добавить в маршрут'}">${bookmarkIcon}</button>`;}
  function eventCard(e) {
    const people=speakerNames(e);
    const peopleMarkup=people.length?`<div class="event-speaker-line"><div class="avatar-stack">${people.slice(0,3).map(avatar).join('')}</div><div class="event-names">${people.map(p=>`<button type="button" data-person="${esc(p.id)}">${esc(p.name)}</button>`).join('')}</div></div>`:'<div class="unknown-speaker">Ведущий уточняется</div>';
    return `<article class="event-card ${saved.has(String(e.id))?'is-saved':''}" id="event-${esc(e.id)}"><div><div class="event-time">${esc(e.time)}<small>${e.day} октября</small></div><span class="event-age">${esc(e.age)}</span></div><div><h3 class="event-title"><button type="button" data-event="${esc(e.id)}">${esc(e.title)}</button></h3><p class="event-result"><strong>Ожидаемая польза:</strong> ${esc(e.result)}</p><div class="event-format">${esc(e.format)}</div>${e.warning?'<span class="event-notice">Есть уточнение по времени ↗</span>':''}</div><div class="event-aside">${peopleMarkup}<div class="event-action-row"><button class="event-detail-button" type="button" data-event="${esc(e.id)}">Подробнее <span aria-hidden="true">↗</span></button>${saveButton(e)}</div></div></article>`;
  }
  function matches(e) {
    const q=$('#event-search').value.toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
    const text=[e.title,e.for,e.learn,e.result,...speakerNames(e).map(p=>p.name)].join(' ').toLocaleLowerCase('ru').replace(/ё/g,'е');
    return (selectedDay==='all'||String(e.day)===selectedDay) && (selectedTopic==='all'||topicList(e).includes(selectedTopic)) && (!q||q.split(/\s+/).every(word=>text.includes(word))) && (!onlySaved||saved.has(String(e.id)));
  }
  function renderEvents() {
    const dayEvents=events.filter(e=>selectedDay==='all'||String(e.day)===selectedDay);
    const filtered=events.filter(matches);
    let previousDay;
    $('#program-list').innerHTML=filtered.map(e=>{let label='';if(selectedDay==='all'&&previousDay!==e.day){label=`<div class="program-day-label">${e.day} октября · ${days[e.day]}</div>`;previousDay=e.day;}return label+eventCard(e);}).join('');
    $('#empty-state').hidden=filtered.length>0;
    const scope=selectedDay==='all'?'Все дни':selectedDay+' октября · '+days[selectedDay];
    const query=$('#event-search').value.trim();
    $('#result-count').textContent = `${scope} · показано ${filtered.length} из ${dayEvents.length} ${plural(dayEvents.length,'встречи','встреч','встреч')}`;
    $$('.day-tabs button').forEach(b=>{const total=events.filter(e=>b.dataset.day==='all'||String(e.day)===b.dataset.day).length;b.querySelector('.day-total').textContent=total;b.setAttribute('aria-label',`${b.dataset.day==='all'?'Все дни':b.dataset.day+' октября'}: ${total} ${plural(total,'встреча','встречи','встреч')}. Показать всю программу ${b.dataset.day==='all'?'за четыре дня':'этого дня'}`);b.classList.toggle('active',b.dataset.day===selectedDay);b.setAttribute('aria-pressed',String(b.dataset.day===selectedDay));});
    $$('.topic-filters button').forEach(b=>{const count=dayEvents.filter(e=>b.dataset.topic==='all'||topicList(e).includes(b.dataset.topic)).length;const label=b.dataset.topic==='all'?'Все темы':topics[b.dataset.topic];b.innerHTML=`${esc(label)} <span class="topic-count">${count}</span>`;b.disabled=count===0;b.setAttribute('aria-label',`${label}: ${count} ${plural(count,'встреча','встречи','встреч')} ${selectedDay==='all'?'за все дни':'в этот день'}`);b.classList.toggle('active',b.dataset.topic===selectedTopic);b.setAttribute('aria-pressed',String(b.dataset.topic===selectedTopic));});
    $('#filter-saved').setAttribute('aria-pressed',String(onlySaved));
    const chips=[];
    if(selectedTopic!=='all')chips.push({key:'topic',label:`Тема: ${topics[selectedTopic]}`});
    if(query)chips.push({key:'query',label:`Поиск: «${query}»`});
    if(onlySaved)chips.push({key:'saved',label:'Только выбранные'});
    $('#active-filters').innerHTML=chips.map(chip=>`<button type="button" class="filter-chip" data-clear-filter="${chip.key}" aria-label="Убрать фильтр: ${esc(chip.label)}">${esc(chip.label)} <span aria-hidden="true">×</span></button>`).join('');
    $('#active-filters').hidden=chips.length===0;
    const totalText=selectedDay==='all'?`В полной программе — ${dayEvents.length} ${plural(dayEvents.length,'встреча','встречи','встреч')}.`:`На ${selectedDay} октября в программе — ${dayEvents.length} ${plural(dayEvents.length,'встреча','встречи','встреч')}.`;
    let emptyText='Измените условия поиска или очистите фильтры — выбранный день сохранится.';
    if(onlySaved&&!saved.size)emptyText='В вашем маршруте пока нет сохранённых встреч. Очистите фильтры и добавьте интересные события значком закладки.';
    else if(onlySaved&&!dayEvents.some(e=>saved.has(String(e.id))))emptyText='На этот день в вашем маршруте пока нет сохранённых встреч. Очистите фильтры, чтобы выбрать их из программы дня.';
    else if(onlySaved)emptyText='Сохранённые встречи есть, но они не подходят под выбранные тему или поиск. Очистите фильтры, чтобы увидеть программу.';
    $('#empty-description').textContent=`${totalText} ${emptyText}`;
    updateCount();
  }
  function plural(n,a,b,c){return n%10===1&&n%100!==11?a:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?b:c;}
  function resetFilters() {selectedTopic='all';onlySaved=false;$('#event-search').value='';renderEvents();}
  function updateCount(){$('#saved-count').textContent=saved.size;$('#saved-count').setAttribute('aria-label',`Выбрано ${saved.size} ${plural(saved.size,'встреча','встречи','встреч')}`);}
  function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
  function toggleSave(id) {
    id=String(id);if(!eventById.has(id))return;
    const added=!saved.has(id);added?saved.add(id):saved.delete(id);storage.set('scienceon-route-v1',[...saved]);renderEvents();
    if(dialog.open&&modalMode==='route')renderRoute();
    else if(dialog.open&&modalMode===`event:${id}`)renderEvent(eventById.get(id));
    toast(added?'Добавлено в маршрут. Не забудьте зарегистрироваться.':'Встреча убрана из маршрута.');
  }
  function openDialog(mode,kicker){lastFocus=dialog.open?lastFocus:document.activeElement;modalMode=mode;dialog.removeAttribute('aria-label');$('#dialog-kicker').textContent=kicker;if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}}
  function closeDialog(){dialog.close();document.body.classList.remove('modal-open');modalMode='';lastFocus?.focus?.({preventScroll:true});}
  function sourceLinks(p){return [...(p.links||[]),...(p.extra||[])].filter((x,i,a)=>x?.url&&a.findIndex(y=>y.url===x.url)===i);}
  function normalizeWarning(e){if(String(e.id)==='4258547')return 'Начало — в 11:00. В материалах указаны два времени окончания: 12:30 и 13:00. Точное окончание уточните у организатора.';return e.warning;}
  function renderEvent(e){
    const people=speakerNames(e);
    $('#dialog-body').innerHTML=`<div class="dialog-content"><div class="dialog-meta"><span>${e.day} октября · ${days[e.day]}</span><span>${esc(e.time)}–${esc(e.end)} по Timepad</span><span>${esc(e.age)}</span><span>${esc(e.format)}</span></div><h2 id="dialog-title">${esc(e.title)}</h2><div class="dialog-result"><b>Ожидаемая польза по программе</b><p>${esc(e.result)}</p></div><h3>Для кого</h3><p>${esc(e.for)}</p>${e.ageNote?`<p class="age-note">${esc(e.ageNote)}</p>`:''}<h3>Что разберём</h3><p>${esc(e.learn)}</p><h3>Как проходит встреча</h3><p>${esc(e.practice)}</p>${e.warning?`<div class="dialog-warning"><b>Уточнение по расписанию.</b> ${esc(normalizeWarning(e))}</div>`:''}<h3>${people.length?'Кто ведёт':'Ведущий уточняется'}</h3>${people.length?`<div class="dialog-speaker-list">${people.map(p=>`<button class="dialog-speaker-row" type="button" data-person="${esc(p.id)}">${avatar(p)}<span><b>${esc(p.name)}</b><small>${esc(p.role)}</small></span><span aria-hidden="true">↗</span></button>`).join('')}</div>`:'<p>Имя и профессиональные сведения ведущего пока не опубликованы в карточке организатора. Уточните их перед регистрацией, если это важно для вашего выбора.</p>'}<div class="dialog-actions"><a class="button button-blue" href="${eventUrl(e)}" target="_blank" rel="noopener noreferrer">Бесплатная регистрация <span aria-hidden="true">↗</span></a><button class="button button-outline" type="button" data-save="${esc(e.id)}">${saved.has(String(e.id))?'Убрать из маршрута':'Добавить в маршрут'} ${bookmarkIcon}</button></div><div class="dialog-sources">Источник содержания: <a href="${eventUrl(e)}" target="_blank" rel="noopener noreferrer">карточка организатора на Timepad</a>. Время местное, Благовещенск. Описан ожидаемый результат анонса; программа может уточняться. Сохранение в маршрут не заменяет регистрацию.</div></div>`;
    dialog.setAttribute('aria-labelledby','dialog-title');
    dialog.scrollTop=0;
  }
  function showEvent(id){const e=eventById.get(String(id));if(!e)return;openDialog(`event:${id}`,'ПРОГРАММА / SCIENCEON');renderEvent(e);}
  function showPerson(id){
    const p=personById.get(id);if(!p)return;openDialog(`person:${id}`,'ЛЮДИ / SCIENCEON');
    const appearances=events.filter(e=>(e.speakers||[]).includes(id));
    const facts=Array.isArray(p.facts)?p.facts:Array.isArray(p.facts_root)?p.facts_root:[];
    const links=sourceLinks(p);
    const namedSources=(p.sources||[]).map(source=>typeof source==='object'?source:{label:'Карточка встречи',url:`https://fond-podderzhki-tal-org.timepad.ru/event/${source}/`});
    $('#dialog-body').innerHTML=`<div class="dialog-content"><div class="profile-dialog-head"><div class="profile-dialog-photo" style="--photo-position:${esc(p.photoPosition||'center')}">${photo(p,'',false)}</div><div><h2 id="dialog-title">${esc(p.name)}</h2><p class="dialog-role">${esc(p.role)}</p><p class="dialog-city">${esc(p.city)}</p></div></div><h3>Знакомство со спикером</h3><p>${esc(p.bio)}</p>${facts.length?`<ul class="profile-facts">${facts.map(f=>`<li>${esc(typeof f==='string'?f:f.text||f.label||'')}</li>`).join('')}</ul>`:''}<h3>Почему эта тема</h3><p>${esc(p.relevance)}</p>${links.length?`<h3>Проекты и профессиональные страницы</h3><div class="profile-links">${links.map(l=>`<a href="${safeUrl(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`:''}<h3>Когда можно послушать</h3><div class="profile-events">${appearances.map(e=>`<button class="profile-event" type="button" data-event="${esc(e.id)}"><small>${e.day} октября · ${esc(e.time)}</small><span>${esc(e.title)} ↗</span></button>`).join('')}</div><details class="dialog-sources"><summary>Источники и уточнения</summary>${p.evidence?`<p>${esc(p.evidence)}</p>`:''}${p.limits?`<p>${esc(p.limits)}</p>`:''}<p>${namedSources.map((l,i)=>`<a href="${safeUrl(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}${namedSources.length>1?' '+(i+1):''}</a>`).join(' · ')}</p>${p.photoSource?`<p>Фотография: <a href="${safeUrl(typeof p.photoSource==='string'?p.photoSource:p.photoSource.url)}" target="_blank" rel="noopener noreferrer">${esc(typeof p.photoSource==='string'?'источник изображения':p.photoSource.label||'источник изображения')}</a>.</p>`:''}</details></div>`;
    dialog.setAttribute('aria-labelledby','dialog-title');
    dialog.scrollTop=0;
  }
  function renderRoute(){
    const chosen=events.filter(e=>saved.has(String(e.id)));
    $('#dialog-body').innerHTML=`<div class="dialog-content"><h2 id="dialog-title">Мой маршрут</h2>${chosen.length?`<p class="route-intro">${chosen.length} ${plural(chosen.length,'встреча','встречи','встреч')} в вашем списке. Теперь зарегистрируйтесь на каждую: выбор хранится только в этом браузере.</p>${chosen.map((e,i)=>{const earlier=chosen.slice(0,i).find(x=>x.day===e.day&&x.time<=e.time&&x.end>e.time);return `<article class="route-item"><div class="route-item-top"><div><small>${e.day} октября · ${esc(e.time)}</small><h3>${esc(e.title)}</h3></div><button type="button" class="icon-button" data-save="${esc(e.id)}" aria-label="Убрать из маршрута: ${esc(e.title)}">×</button></div><a href="${eventUrl(e)}" target="_blank" rel="noopener noreferrer">Открыть регистрацию ↗</a>${earlier?'<p class="route-overlap">Встречи пересекаются по времени в опубликованной программе. Уточните расписание или выберите одну.</p>':''}</article>`;}).join('')}<div class="dialog-actions"><button class="button button-blue" type="button" id="copy-route">Скопировать мой маршрут ↗</button><button class="button button-outline" type="button" id="continue-route">Вернуться к программе</button></div><p class="route-end-note">Часть времени окончания требует уточнения. Все часы — местные, Благовещенск, UTC+9.</p>`:'<div class="route-empty"><span aria-hidden="true">↗</span><h3>Начните с одной встречи</h3><p>Нажмите закладку рядом с событием. Здесь появится ваш список с датами, временем и ссылками на регистрацию.</p><button class="button button-blue" id="continue-route" type="button">Выбрать встречу</button></div>'}</div>`;
    dialog.setAttribute('aria-labelledby','dialog-title');
    dialog.scrollTop=0;
  }
  function showRoute(){openDialog('route','МОЙ ВЫБОР / SCIENCEON');renderRoute();}
  function showPoster(src,title){openDialog('poster','АФИШИ / SCIENCEON');$('#dialog-body').innerHTML=`<div class="poster-dialog"><img src="${safeUrl(src)}" alt="${esc(title)}"><p><a href="${safeUrl(src)}" target="_blank" rel="noopener noreferrer">Открыть оригинал ↗</a></p></div>`;dialog.removeAttribute('aria-labelledby');dialog.setAttribute('aria-label',title);dialog.scrollTop=0;}
  function renderPeople(){
    $('#speakers-grid').innerHTML=data.speakers.map(p=>{const appearances=events.filter(e=>(e.speakers||[]).includes(p.id));const dates=[...new Set(appearances.map(e=>e.day))];return `<article class="speaker-card reveal" id="speaker-${esc(p.id)}"><button type="button" data-person="${esc(p.id)}" aria-label="Открыть профиль: ${esc(p.name)}"><div class="speaker-photo" style="--photo-position:${esc(p.photoPosition||'center')}">${photo(p)}</div><h3>${esc(p.name)}</h3><p class="speaker-role">${esc(p.role)}</p><p class="speaker-events">${dates.join(', ')} октября · ${appearances.length} ${plural(appearances.length,'встреча','встречи','встреч')} ↗</p></button></article>`;}).join('');
  }
  function renderHero(){
    const candidates=['burmanov','ishchenko','bobkov'].map(id=>personById.get(id)).filter(p=>p&&p.photo).slice(0,3);
    $('#hero-portraits').innerHTML=candidates.map((p,i)=>`<div class="hero-photo ${['hero-primary','hero-secondary','hero-third'][i]}">${photo(p,'',false)}<span class="hero-photo-label">${esc(p.name)}<small>${p.id==='ishchenko'?'ИИщенко LAB':esc(p.role.split(',')[0])}</small></span></div>`).join('');
    if(!candidates.length)$('#hero-portraits').innerHTML='<div class="hero-photo hero-primary"><img src="assets/evgeniy-ishchenko.jpg" alt="Евгений Ищенко"><span class="hero-photo-label">Евгений Ищенко<small>ИИщенко LAB</small></span></div>';
  }
  function motionState(){reduced=reducedQuery.matches||explicitReduced;document.documentElement.classList.toggle('reduce-motion',reduced);$('#motion-toggle').setAttribute('aria-pressed',String(reduced));$('#motion-toggle').textContent=reduced?'Меньше движения: включено':'Меньше движения';if(reduced){document.body.classList.remove('motion-ready');$('.hero-visual').style.removeProperty('--hero-shift');$$('.reveal').forEach(x=>x.classList.add('visible'));}else{document.body.classList.add('motion-ready');}}
  function setupMotion(){
    $$('.interest-card,.speaker-card,.posters-grid,.route-story-inner,.visit-grid').forEach(el=>el.classList.add('reveal'));
    motionState();
    if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -15px 0px'});$$('.reveal').forEach(el=>observer.observe(el));}else{$$('.reveal').forEach(el=>el.classList.add('visible'));}
    $('.hero-visual').dataset.motion='hero-parallax';$('.steps').dataset.motion='scroll-steps';$('#read-progress').dataset.motion='reading-progress';
    let pending=false;
    const onScroll=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const max=document.documentElement.scrollHeight-innerHeight;$('#read-progress').style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';$$('.steps li').forEach(step=>step.classList.toggle('step-active',step.getBoundingClientRect().top<innerHeight*.78));if(!reduced){const hero=$('.hero-visual');const heroRect=$('.hero').getBoundingClientRect();if(innerWidth>650&&heroRect.bottom>0)hero.style.setProperty('--hero-shift',Math.min(20,scrollY*.035)+'px');else hero.style.removeProperty('--hero-shift');const steps=$('.steps');const rect=steps.getBoundingClientRect();steps.style.setProperty('--steps-progress',Math.max(.1,Math.min(1,(innerHeight-rect.top)/(rect.height+innerHeight*.2))));}});};
    addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});onScroll();
    if(matchMedia('(pointer:fine)').matches)$$('.spotlight').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced)return;const r=el.getBoundingClientRect();el.style.setProperty('--spot-x',(e.clientX-r.left)+'px');el.style.setProperty('--spot-y',(e.clientY-r.top)+'px');});el.addEventListener('pointerleave',()=>{el.style.setProperty('--spot-x','-300px');el.style.setProperty('--spot-y','-300px');});});
    $('#motion-toggle').addEventListener('click',()=>{explicitReduced=!explicitReduced;storage.set('scienceon-less-motion',explicitReduced);motionState();});
    reducedQuery.addEventListener?.('change',motionState);
  }
  async function copyRoute(){const chosen=events.filter(e=>saved.has(String(e.id)));const text='Мой маршрут ScienceOn · Благовещенск\nГорького, 129, офис 131. Время местное, UTC+9.\n\n'+chosen.map(e=>`${e.day} октября · ${e.time}\n${e.title}\n${eventUrl(e)}`).join('\n\n')+'\n\nВход бесплатный. Требуется отдельная регистрация на встречи.';try{await navigator.clipboard.writeText(text);toast('Маршрут скопирован.');}catch{const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','Маршрут для копирования');area.style.cssText='width:100%;height:220px;font:14px/1.5 Segoe UI;margin-top:12px';$('#dialog-body .dialog-content').append(area);area.focus();area.select();toast('Выделен текст маршрута — скопируйте его.');}}
  document.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.dataset.event){showEvent(target.dataset.event);return;}
    if(target.dataset.person){showPerson(target.dataset.person);return;}
    if(target.dataset.save){toggleSave(target.dataset.save);return;}
    if(target.dataset.day){selectedDay=target.dataset.day;resetFilters();return;}
    if(target.dataset.topic){selectedTopic=target.dataset.topic;renderEvents();return;}
    if(target.dataset.clearFilter){if(target.dataset.clearFilter==='topic')selectedTopic='all';if(target.dataset.clearFilter==='query')$('#event-search').value='';if(target.dataset.clearFilter==='saved')onlySaved=false;renderEvents();return;}
    if(target.dataset.interest){selectedDay='all';selectedTopic=target.dataset.interest;onlySaved=false;$('#event-search').value='';renderEvents();$('#program').scrollIntoView({behavior:reduced?'auto':'smooth'});return;}
    if(target.dataset.poster){showPoster(target.dataset.poster,target.dataset.posterTitle);return;}
    if(target.classList.contains('dialog-close')){closeDialog();return;}
    if(['open-route','story-route'].includes(target.id)){showRoute();return;}
    if(target.id==='filter-saved'){onlySaved=!onlySaved;renderEvents();return;}
    if(['reset-filters','empty-reset'].includes(target.id)){resetFilters();return;}
    if(target.id==='continue-route'){closeDialog();$('#program').scrollIntoView({behavior:reduced?'auto':'smooth'});return;}
    if(target.id==='copy-route')copyRoute();
  });
  $('#event-search').addEventListener('input',renderEvents);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');});
  renderHero();renderPeople();renderEvents();setupMotion();
  document.addEventListener('error',e=>{if(e.target.tagName!=='IMG')return;const img=e.target;img.alt=img.alt||'Изображение временно недоступно';img.style.opacity='.25';},{capture:true});
  if(location.hash.startsWith('#speaker-')){const id=location.hash.slice(9);if(personById.has(id))showPerson(id);}
  if(location.hash.startsWith('#event-')){const id=location.hash.slice(7);if(eventById.has(id))showEvent(id);}
})();
