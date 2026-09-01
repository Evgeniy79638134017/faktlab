/* Фрагмент разбора — лид-магнит.
   Человек оставляет имя и телефон, заявка уходит тем же путём, что и обычная,
   и сразу открывается документ на печать. Содержание фрагмента — методология
   из реальных работ, обезличенная: ни объектов, ни клиентов, ни их цифр. */
(function () {
  var root = document.getElementById('demo');
  if (!root) return;

  root.innerHTML =
    '<form class="dm__form" id="dm-form" novalidate>' +
      '<div class="dm__f">' +
        '<label for="dm-name">Как к вам обращаться <i>обязательно</i></label>' +
        '<input id="dm-name" name="name" type="text" autocomplete="name" required>' +
      '</div>' +
      '<div class="dm__f">' +
        '<label for="dm-phone">Телефон <i>обязательно</i></label>' +
        '<input id="dm-phone" name="contact" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required>' +
      '</div>' +
      '<div class="dm__f">' +
        '<label for="dm-obj">Что у вас за объект <i>одной строкой</i></label>' +
        '<input id="dm-obj" name="msg" type="text" placeholder="Например: производственная база 2 га, продаём восьмой месяц">' +
      '</div>' +
      '<div class="hp" aria-hidden="true"><input id="dm-company" name="company" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<label class="agree" for="dm-agree">' +
        '<input id="dm-agree" name="agree" type="checkbox">' +
        '<span>Согласен на обработку персональных данных на условиях ' +
        '<a href="consent.html" target="_blank" rel="noopener">Согласия</a> и ' +
        '<a href="privacy.html" target="_blank" rel="noopener">Политики</a>.</span>' +
      '</label>' +
      '<button class="btn" type="submit" id="dm-send" disabled><span>Открыть фрагмент</span></button>' +
      '<p class="dm__status" id="dm-status" role="status"></p>' +
    '</form>';

  var form = document.getElementById('dm-form');
  var btn = document.getElementById('dm-send');
  var status = document.getElementById('dm-status');
  var fName = document.getElementById('dm-name');
  var fPhone = document.getElementById('dm-phone');
  var agree = document.getElementById('dm-agree');

  function digits(v) { return (v.match(/\d/g) || []).length; }
  function sync() {
    btn.disabled = !(fName.value.trim() && digits(fPhone.value) >= 10 && agree.checked);
  }
  [fName, fPhone].forEach(function (el) { el.addEventListener('input', sync); });
  agree.addEventListener('change', sync);
  sync();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    var endpoint = (window.SITE_CONFIG || {}).formEndpoint;
    btn.disabled = true;
    status.textContent = 'Открываем…';
    status.className = 'dm__status';

    var payload = {
      name: fName.value.trim(),
      contact: fPhone.value.trim(),
      tg: '',
      type: 'Запрос фрагмента разбора',
      msg: (document.getElementById('dm-obj').value.trim() || 'фрагмент разбора без комментария'),
      company: document.getElementById('dm-company').value,
      page: location.href,
      agree: true
    };

    /* Документ открываем независимо от того, дошла ли заявка: человек
       выполнил свою часть, держать его в заложниках нашей связи нечестно. */
    function give() {
      status.textContent = 'Готово. Если окно печати не открылось — разрешите всплывающие окна и нажмите ещё раз.';
      status.className = 'dm__status is-ok';
      btn.disabled = false;
      openDoc();
    }

    if (!endpoint) return give();
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(give).catch(give);
  });

  function openDoc() {
    var css = [
      '@page{margin:16mm 15mm}',
      'body{font:10.5pt/1.5 Georgia,serif;color:#17202B;margin:0}',
      '.top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1A237E;padding-bottom:3mm;margin-bottom:7mm}',
      '.brand{font:bold 13pt Arial,sans-serif;color:#1A237E}',
      '.brand i{display:block;font:8pt Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#666F7B;font-style:normal;font-weight:400;margin-top:1mm}',
      '.date{font:8.5pt Arial,sans-serif;color:#666F7B;text-align:right}',
      'h1{font-size:19pt;line-height:1.18;margin:0 0 4mm}',
      'h2{font-size:12.5pt;margin:9mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #E3DCD0;page-break-after:avoid}',
      'h3{font-size:11pt;margin:6mm 0 2mm;page-break-after:avoid}',
      'p{margin:0 0 3.5mm}',
      '.note{padding:4mm 5mm;background:#F5F2EC;border-left:3px solid #B4574A;margin:0 0 7mm;font-size:10pt}',
      '.note b{color:#B4574A}',
      'table{width:100%;border-collapse:collapse;margin:3mm 0 5mm;font-size:9.5pt}',
      'th{text-align:left;font:8.5pt Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#666F7B;padding:2mm;border-bottom:1px solid #1A237E}',
      'td{padding:2.2mm;border-bottom:1px solid #EFEAE1;vertical-align:top}',
      'td.n{font:9pt Arial,sans-serif;color:#666F7B;width:12mm}',
      '.tag{display:inline-block;font:8pt Arial,sans-serif;padding:.6mm 2mm;border:1px solid #E3DCD0;color:#666F7B}',
      '.offer{margin-top:9mm;padding:5mm 6mm;background:#F5F2EC;border-left:3px solid #1A237E;page-break-inside:avoid}',
      '.offer h2{margin:0 0 2.5mm;border:0;padding:0;font-size:13pt}',
      '.phone{font:bold 14pt Arial,sans-serif;color:#1A237E}',
      '.foot{margin-top:6mm;font:8.5pt Arial,sans-serif;color:#666F7B;text-align:center;border-top:1px solid #E3DCD0;padding-top:3mm}'
    ].join('');

    var when = new Date().toLocaleDateString('ru-RU');
    var html = [
      '<!doctype html><html lang="ru"><head><meta charset="utf-8">',
      '<title>Фрагмент разбора — ИИщенко LAB</title><style>', css, '</style></head><body>',

      '<div class="top"><div class="brand">ИИщенко LAB<i>аналитика и упаковка активов</i></div>',
      '<div class="date">faktlab.ru<br>', when, '</div></div>',

      '<h1>Как устроен разбор: фрагмент рабочего исследования</h1>',

      '<div class="note"><b>Что это за документ.</b> Здесь показан метод, а не чужой объект. ',
      'Из реальных исследований взяты рассуждения и структура; цифры, названия и любые данные, ',
      'по которым можно узнать заказчика, убраны — работа ведётся под соглашением о неразглашении. ',
      'Полный разбор по одному объекту занимает 100–280 страниц.</div>',

      '<h2>1. Почему разбор начинается с права, а не с цены</h2>',
      '<p>Первое, что выясняется по любому объекту, — на каком основании он принадлежит ',
      'собственнику и что именно можно передать покупателю. Пока это не установлено документами, ',
      'считать цену бессмысленно: может выясниться, что продаётся не то, что собственник думал.</p>',
      '<p>Типичная находка: в договоре аренды есть пункт о свободной переуступке права. ',
      'Собственник о нём знает, но не считает аргументом. Для покупателя это снимает главный ',
      'страх — что после сделки придётся всё переоформлять и что-то может не получиться. ',
      'В материалах такой пункт становится первой строкой, а не сноской на двадцатой странице.</p>',

      '<h2>2. Из чего складывается цена</h2>',
      '<p>Мы считаем двумя независимыми способами и сравниваем результаты. Совпали — цена крепкая. ',
      'Разошлись — разбираемся, и лучше до переговоров, чем во время.</p>',

      '<h3>Способ первый: стоимость воссоздания</h3>',
      '<p>Сколько денег, времени и согласований нужно, чтобы получить такой же объект с нуля. ',
      'Считается по позициям: земля, подведение мощностей, строительство, оформление. ',
      'Отдельной строкой идёт то, что забывают чаще всего, — <b>срок</b>. Если согласование ',
      'занимает от года до трёх, готовый объект экономит покупателю это время, и время имеет цену.</p>',

      '<h3>Способ второй: рыночный коридор</h3>',
      '<p>Что просят за сопоставимые объекты и, что важнее, за сколько их реально покупают. ',
      'Цена в объявлении, которое висит два года, рыночной не является. По одной из работ ',
      'в выборку вошло 465 предложений по пяти регионам; 17 карточек проверены поштучно — ',
      'звонки продавцам, уточнение условий, выяснение, что с объектом не так.</p>',

      '<p>Так выглядит таблица сравнения в рабочем документе (значения обезличены):</p>',
      '<table>',
      '<tr><th>Параметр</th><th>Объект</th><th>Аналог А</th><th>Аналог Б</th><th>Аналог В</th></tr>',
      '<tr><td>Площадь, га</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>',
      '<tr><td>Ж/д путь</td><td>в собственности</td><td>нет</td><td>рядом, чужой</td><td>в собственности</td></tr>',
      '<tr><td>Мощность, кВт</td><td>подтверждена</td><td>нет данных</td><td>заявлена</td><td>подтверждена</td></tr>',
      '<tr><td>Право</td><td>аренда 49 лет</td><td>собственность</td><td>аренда 11 лет</td><td>собственность</td></tr>',
      '<tr><td>Срок в продаже</td><td>—</td><td>26 мес.</td><td>8 мес.</td><td>4 мес.</td></tr>',
      '<tr><td>Цена за га</td><td>расчёт</td><td>вне коридора</td><td>в коридоре</td><td>в коридоре</td></tr>',
      '</table>',
      '<p>Вывод из такой таблицы почти никогда не звучит как «наш объект дороже или дешевле». ',
      'Он звучит так: <b>объект продаётся не рынку вообще, а конкретному покупателю</b>, ',
      'которому нужен именно этот набор свойств. Дальше работа идёт с ним.</p>',

      '<h2>3. Реестр вопросов покупателя</h2>',
      '<p>По каждому объекту ведётся сквозной реестр: вопрос, статус, чем закрыт. ',
      'По промышленной площадке их набралось 85. Ниже — как выглядят записи.</p>',
      '<table>',
      '<tr><th>№</th><th>Вопрос</th><th>Статус</th></tr>',
      '<tr><td class="n">В-01</td><td>Основание владения, срок, условия переуступки</td><td><span class="tag">закрыт документом</span></td></tr>',
      '<tr><td class="n">В-02</td><td>Обременения, аресты, права третьих лиц на объекты внутри периметра</td><td><span class="tag">закрыт выпиской</span></td></tr>',
      '<tr><td class="n">В-07</td><td>Мощность и точка подключения, действующие технические условия</td><td><span class="tag">в работе</span></td></tr>',
      '<tr><td class="n">В-14</td><td>Санитарные зоны и что они запрещают размещать</td><td><span class="tag">закрыт</span></td></tr>',
      '<tr><td class="n">В-23</td><td>Состояние подъездных путей, допустимая нагрузка</td><td><span class="tag">открыт</span></td></tr>',
      '</table>',
      '<p>Смысл реестра не в полноте ради полноты. Каждый открытый пункт — это то, ',
      'что покупатель выяснит сам и переведёт в скидку. Закрытый — то, на что у собственника ',
      'есть ответ с документом на встрече.</p>',

      '<h2>4. Что помечается отдельно</h2>',
      '<p>У каждой оценки в наших документах указано, откуда она взята: из документа, из реестра ',
      'или посчитана косвенно. Там, где точность плюс-минус сорок процентов, так и написано — ',
      'вместе с тем, какие данные нужны, чтобы довести её до десяти.</p>',
      '<p>Это не осторожность, а рабочий инструмент: собственник видит, где под решением твёрдая ',
      'почва, а где допущение, и понимает, что стоит уточнить перед разговором с покупателем.</p>',

      '<div class="offer">',
        '<h2>Полный разбор по вашему объекту</h2>',
        '<p>Занимает две–три недели и включает: диагностику по восьми частям, расчёт цены двумя ',
        'способами, инвестиционный меморандум, финансовую модель, презентацию, каталог адресатов ',
        'с текстами обращений и план выхода по неделям.</p>',
        '<p>Обязательств по заключению сделки не берём: переговоры и условия остаются за вами. ',
        'Работа идёт под соглашением о неразглашении.</p>',
        '<p><b>Первый разговор — 20–30 минут, бесплатно.</b> На нём станет понятно, есть ли здесь ',
        'работа и сколько она стоит. Если готовить к продаже сейчас не нужно, скажем прямо.</p>',
        '<p><span class="phone">+7 914 538-90-45</span><br>549945@mail.ru · faktlab.ru</p>',
      '</div>',

      '<div class="foot">ИИщенко LAB · ИП Ищенко Е. В. · Благовещенск, работаем по всей России</div>',
      '</body></html>'
    ].join('');

    var old = document.getElementById('demo-frame');
    if (old) old.parentNode.removeChild(old);
    var fr = document.createElement('iframe');
    fr.id = 'demo-frame';
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(fr);
    var doc = fr.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(function () {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) {}
    }, 400);
  }
})();
