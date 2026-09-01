/* Подбор вопросов покупателя.
   Оформлен как рабочий реестр — тот самый документ, который мы ведём в проектах:
   сквозная нумерация В-01…, вес позиции, отметка «ответ есть». Человек отмечает,
   что может подтвердить документом, и сразу видит свою готовность в процентах.
   Ответы никуда не уходят: всё считается в браузере. */
(function () {
  var root = document.getElementById('quiz');
  if (!root || !window.BUYER_QUESTIONS) return;

  var DB = window.BUYER_QUESTIONS;
  var state = { type: null, answers: {}, step: 0, closed: {} };

  var WEIGHT = {
    3: { label: 'стоп-фактор', cls: 'q--hot' },
    2: { label: 'торг', cls: 'q--warm' },
    1: { label: 'уточнение', cls: 'q--cool' }
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function progress(active) {
    var bar = el('div', 'qz__bar');
    ['Объект', 'Уточнения', 'Реестр'].forEach(function (t, i) {
      var s = el('span', 'qz__barI' + (i < active ? ' is-done' : i === active ? ' is-now' : ''));
      s.innerHTML = '<i>' + (i + 1) + '</i>' + t;
      bar.appendChild(s);
    });
    return bar;
  }

  /* ---------- шаг 1: тип объекта, строками реестра ---------- */
  function renderTypes() {
    root.innerHTML = '';
    root.appendChild(progress(0));
    root.appendChild(el('h3', 'qz__q', 'С чем вы приходите?'));

    var list = el('div', 'qz__rows');
    Object.keys(DB).forEach(function (key, i) {
      var d = DB[key];
      var b = el('button', 'qz__row');
      b.type = 'button';
      b.innerHTML = '<span class="qz__num">' + String(i + 1).padStart(2, '0') + '</span>' +
                    '<span class="qz__body"><b>' + d.title + '</b>' +
                    '<span>' + d.hint + '</span></span>' +
                    '<span class="qz__go" aria-hidden="true">→</span>';
      b.addEventListener('click', function () {
        state.type = key; state.answers = {}; state.step = 0; state.closed = {};
        renderStep();
      });
      list.appendChild(b);
    });
    root.appendChild(list);
  }

  /* ---------- шаг 2: уточнения ---------- */
  function renderStep() {
    var d = DB[state.type], steps = d.steps;
    if (state.step >= steps.length) return renderResult();
    var s = steps[state.step];

    root.innerHTML = '';
    root.appendChild(progress(1));

    var meta = el('div', 'qz__meta');
    meta.innerHTML = '<span>' + d.title + '</span><span>' +
                     (state.step + 1) + ' / ' + steps.length + '</span>';
    root.appendChild(meta);
    root.appendChild(el('h3', 'qz__q', s.q));

    var list = el('div', 'qz__opts');
    s.opts.forEach(function (o) {
      var b = el('button', 'qz__opt', '<span>' + o[1] + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        state.answers[s.id] = o[0]; state.step++; renderStep();
      });
      list.appendChild(b);
    });
    root.appendChild(list);

    var back = el('button', 'qz__back', '← назад');
    back.type = 'button';
    back.addEventListener('click', function () {
      if (state.step === 0) return renderTypes();
      state.step--; renderStep();
    });
    root.appendChild(back);
  }

  function pick() {
    return DB[state.type].questions.filter(function (q) {
      if (!q.when) return true;
      return Object.keys(q.when).every(function (k) {
        return q.when[k].indexOf(state.answers[k]) >= 0;
      });
    });
  }

  /* ---------- шаг 3: реестр ---------- */
  function renderResult() {
    var qs = pick();
    var hot = qs.filter(function (q) { return q.w === 3; }).length;

    root.innerHTML = '';
    root.appendChild(progress(2));

    var head = el('div', 'qz__resHead');
    head.innerHTML =
      '<div class="qz__count"><b>' + qs.length + '</b><span>вопрос' + tail(qs.length) +
      ' зададут вам на переговорах</span></div>' +
      '<div class="qz__count qz__count--hot"><b>' + hot + '</b><span>из них стоп-факторы: ' +
      'без ответа разговор не идёт дальше</span></div>';
    root.appendChild(head);

    root.appendChild(el('p', 'qz__lead',
      'Отмечайте те, на которые у вас есть ответ <em>с документом на руках</em>, а не по памяти. ' +
      'Счётчик внизу покажет, насколько объект готов к разговору.'));

    var blocks = {}, order = [];
    qs.forEach(function (q) {
      if (!blocks[q.b]) { blocks[q.b] = []; order.push(q.b); }
      blocks[q.b].push(q);
    });

    var n = 0;
    var table = el('div', 'qz__reg');
    order.forEach(function (b) {
      var sec = el('section', 'qreg');
      sec.appendChild(el('h4', 'qreg__t', b));
      var ul = el('ul', 'qreg__l');
      blocks[b].sort(function (a, c) { return c.w - a.w; }).forEach(function (q) {
        n++;
        var id = 'q' + n;
        var li = el('li', 'qi ' + WEIGHT[q.w].cls);
        li.innerHTML =
          '<input type="checkbox" id="' + id + '">' +
          '<label for="' + id + '">' +
          '<span class="qi__n">В-' + String(n).padStart(2, '0') + '</span>' +
          '<span class="qi__t">' + q.t + '</span>' +
          '<span class="qi__w">' + WEIGHT[q.w].label + '</span>' +
          '</label>';
        li.querySelector('input').addEventListener('change', function () {
          state.closed[id] = this.checked;
          li.classList.toggle('is-closed', this.checked);
          updateScore(qs.length);
        });
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      table.appendChild(sec);
    });
    root.appendChild(table);

    var score = el('div', 'qz__score');
    score.id = 'qz-score';
    root.appendChild(score);
    updateScore(qs.length);

    var foot = el('div', 'qz__foot');
    foot.appendChild(el('p', null,
      'Всё, что осталось неотмеченным, покупатель выяснит сам — и каждый такой вопрос ' +
      'станет поводом для скидки. Ответы собираются за две–три недели и превращаются ' +
      'в материалы, которые он читает до встречи.'));
    var cta = el('div', 'qz__cta');
    cta.innerHTML =
      '<button class="btn" type="button" id="qz-pdf"><span>Скачать список в PDF</span></button>' +
      '<a class="btn btn--ghost" href="index.html#contact"><span>Обсудить свой объект</span></a>' +
      '<button class="btn btn--ghost" type="button" id="qz-restart"><span>Другой объект</span></button>';
    foot.appendChild(cta);
    root.appendChild(foot);

    document.getElementById('qz-restart').addEventListener('click', renderTypes);
    document.getElementById('qz-pdf').addEventListener('click', function () {
      printList(qs);
    });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateScore(total) {
    var box = document.getElementById('qz-score');
    if (!box) return;
    var done = Object.keys(state.closed).filter(function (k) { return state.closed[k]; }).length;
    var pct = Math.round(done / total * 100);
    var verdict =
      pct === 0   ? 'Отметьте то, что можете подтвердить документом' :
      pct < 35    ? 'Обычный старт: у большинства собственников закрыта примерно треть' :
      pct < 70    ? 'Половина пути пройдена — остальное как раз и добирается подготовкой' :
      pct < 100   ? 'Сильная позиция: осталось закрыть немного' :
                    'Такое встречается редко — похоже, объект уже подготовлен';
    box.innerHTML =
      '<div class="qz__scoreTop"><span>Готовность к разговору</span><b>' + pct + '&thinsp;%</b></div>' +
      '<div class="qz__track"><i style="width:' + pct + '%"></i></div>' +
      '<p>' + done + ' из ' + total + '. ' + verdict + '.</p>';
    box.classList.toggle('is-strong', pct >= 70);
  }


  /* Выгрузка: собираем чистый документ и отдаём его на печать — браузер
     сам предлагает «Сохранить как PDF». Так не нужна внешняя библиотека,
     и политика безопасности страницы остаётся строгой. */
  function printList(qs) {
    var d = DB[state.type];
    var done = 0;
    var rows = '', n = 0, lastBlock = '';
    qs.slice().forEach(function (q) {
      n++;
      var id = 'q' + n;
      var closed = !!state.closed[id];
      if (closed) done++;
      if (q.b !== lastBlock) {
        rows += '<tr class="b"><td colspan="4">' + q.b + '</td></tr>';
        lastBlock = q.b;
      }
      rows += '<tr' + (closed ? ' class="c"' : '') + '>' +
        '<td class="chk">' + (closed ? '&#10003;' : '') + '</td>' +
        '<td class="num">В-' + String(n).padStart(2, '0') + '</td>' +
        '<td>' + q.t + '</td>' +
        '<td class="w">' + WEIGHT[q.w].label + '</td></tr>';
    });

    var pct = Math.round(done / qs.length * 100);
    var open = qs.length - done;
    var when = new Date().toLocaleDateString('ru-RU');

    var css = [
      '@page{margin:16mm 14mm}',
      'body{font:10.5pt/1.45 Georgia,serif;color:#17202B;margin:0}',
      '.top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1A237E;padding-bottom:3mm;margin-bottom:6mm}',
      '.brand{font:bold 13pt Arial,sans-serif;color:#1A237E}',
      '.brand i{display:block;font:8pt Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#666F7B;font-style:normal;font-weight:400;margin-top:1mm}',
      '.top .date{font:8.5pt Arial,sans-serif;color:#666F7B;text-align:right}',
      'h1{font-size:18pt;line-height:1.2;margin:0 0 3mm}',
      '.intro{font-size:10.5pt;color:#3D4753;margin:0 0 6mm;max-width:150mm}',
      '.score{display:flex;gap:8mm;border:1px solid #E3DCD0;border-left:3px solid #1A237E;padding:4mm 5mm;margin:0 0 7mm}',
      '.score div{flex:1}',
      '.score b{display:block;font-size:19pt;line-height:1;margin-bottom:1.5mm}',
      '.score em{font:8.5pt Arial,sans-serif;color:#666F7B;font-style:normal}',
      '.score .hot b{color:#B4574A}',
      'table{width:100%;border-collapse:collapse}',
      'td{padding:2.2mm 2mm;border-bottom:1px solid #EFEAE1;vertical-align:top}',
      'tr.b td{padding-top:5mm;border:0;font:8.5pt/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#1A237E}',
      'tr.c td{color:#9AA0A8}',
      'tr.c td:nth-child(3){text-decoration:line-through}',
      '.chk{width:6mm;color:#7CAF3A;font-weight:700}',
      '.num{width:13mm;font:9pt Arial,sans-serif;color:#666F7B}',
      '.w{width:24mm;font:8pt Arial,sans-serif;color:#666F7B;text-align:right}',
      '.offer{margin-top:8mm;padding:5mm 6mm;background:#F5F2EC;border-left:3px solid #1A237E;page-break-inside:avoid}',
      '.offer h2{margin:0 0 2.5mm;font-size:13pt;line-height:1.25}',
      '.offer p{margin:0 0 3mm;color:#3D4753;font-size:10pt}',
      '.offer ul{margin:0 0 4mm;padding-left:5mm;font-size:10pt}',
      '.offer li{margin-bottom:1.5mm}',
      '.cta{margin-top:4mm;padding-top:3.5mm;border-top:1px solid #E0D9CC}',
      '.cta b{font-size:12pt}',
      '.phone{font:bold 14pt Arial,sans-serif;color:#1A237E}',
      '.foot{margin-top:6mm;font:8.5pt Arial,sans-serif;color:#666F7B;text-align:center;border-top:1px solid #E3DCD0;padding-top:3mm}'
    ].join('');

    var html = [
      '<!doctype html><html lang="ru"><head><meta charset="utf-8">',
      '<title>Вопросы покупателя — ', d.title, '</title><style>', css, '</style></head><body>',

      '<div class="top">',
        '<div class="brand">ИИщенко LAB<i>аналитика и упаковка активов</i></div>',
        '<div class="date">faktlab.ru<br>', when, '</div>',
      '</div>',

      '<h1>Что спросит покупатель: ', d.title.toLowerCase(), '</h1>',
      '<p class="intro">Мы готовим активы и бизнес к продаже и ведём по каждому объекту ',
      'реестр вопросов, которые задаёт покупатель. По одной промышленной площадке их ',
      'набралось восемьдесят пять. Этот список собран из тех же реестров под ваш случай. ',
      'Отмеченные позиции — те, на которые у вас уже есть ответ.</p>',

      '<div class="score">',
        '<div><b>', pct, '&thinsp;%</b><em>готовность к разговору: закрыто ',
        done, ' из ', qs.length, '</em></div>',
        '<div class="hot"><b>', open, '</b><em>вопросов пока без ответа — ',
        'каждый станет поводом сбить цену</em></div>',
      '</div>',

      '<table>', rows, '</table>',

      '<div class="offer">',
        '<h2>Соберём эти ответы за вас</h2>',
        '<p>Всё, что осталось неотмеченным, покупатель выяснит сам — и на каждом пункте ',
        'попросит скидку. Мы закрываем такие вопросы за две–три недели и складываем ответы ',
        'в материалы, которые покупатель читает до встречи:</p>',
        '<ul>',
          '<li>разбор объекта по восьми частям: право, состав, экономика, покупатели</li>',
          '<li>цена, посчитанная двумя независимыми способами, с обоснованием</li>',
          '<li>пакет для покупателя: меморандум, презентация, финансовая модель</li>',
          '<li>каталог адресатов и готовые тексты обращений</li>',
        '</ul>',
        '<p>Обязательств по сделке не берём: переговоры и условия остаются за вами. ',
        'Работа идёт под соглашением о неразглашении — ваши данные в публичные примеры ',
        'не попадают.</p>',
        '<div class="cta">',
          '<b>Первый разговор — 20–30 минут, бесплатно.</b><br>',
          'На нём станет понятно, есть ли здесь работа и сколько она стоит. ',
          'Если готовить к продаже сейчас не нужно, скажем об этом прямо.<br><br>',
          '<span class="phone">+7 914 538-90-45</span><br>',
          '549945@mail.ru · faktlab.ru',
        '</div>',
      '</div>',

      '<div class="foot">ИИщенко LAB · ИП Ищенко Е. В. · Благовещенск, работаем по всей России</div>',
      '</body></html>'
    ].join('');

    /* Печать из скрытой рамки, а не из нового окна: в колонтитуле остаётся
       адрес сайта вместо about:blank, и всплывающие окна не блокируются. */
    var old = document.getElementById('print-frame');
    if (old) old.parentNode.removeChild(old);
    var fr = document.createElement('iframe');
    fr.id = 'print-frame';
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(fr);
    var doc = fr.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(function () {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) {}
    }, 400);
  }

  function tail(x) {
    var d = x % 10, dd = x % 100;
    if (dd > 10 && dd < 20) return 'ов';
    if (d === 1) return '';
    if (d >= 2 && d <= 4) return 'а';
    return 'ов';
  }

  renderTypes();
})();
