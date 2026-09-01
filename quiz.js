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
    qs.slice().sort(function (a, b) {
      return a.b === b.b ? b.w - a.w : 0;
    }).forEach(function (q) {
      n++;
      var id = 'q' + n;
      var closed = !!state.closed[id];
      if (closed) done++;
      if (q.b !== lastBlock) {
        rows += '<tr class="b"><td colspan="4">' + q.b + '</td></tr>';
        lastBlock = q.b;
      }
      rows += '<tr' + (closed ? ' class="c"' : '') + '>' +
        '<td class="chk">' + (closed ? '✓' : '') + '</td>' +
        '<td class="num">В-' + String(n).padStart(2, '0') + '</td>' +
        '<td>' + q.t + '</td>' +
        '<td class="w">' + WEIGHT[q.w].label + '</td></tr>';
    });

    var pct = Math.round(done / qs.length * 100);
    var when = new Date().toLocaleDateString('ru-RU');
    var w = window.open('', '_blank');
    if (!w) { alert('Разрешите всплывающие окна, чтобы сохранить список.'); return; }

    w.document.write(
      '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
      '<title>Вопросы покупателя — ' + d.title + '</title><style>' +
      '@page{margin:18mm 16mm}' +
      'body{font:11pt/1.45 Georgia,serif;color:#17202B;margin:0}' +
      'h1{font-size:19pt;line-height:1.2;margin:0 0 4mm}' +
      '.sub{color:#666F7B;font-size:10pt;margin:0 0 8mm}' +
      '.score{border:1px solid #E3DCD0;border-left:3px solid #1A237E;padding:4mm 5mm;margin:0 0 8mm}' +
      '.score b{font-size:16pt}' +
      'table{width:100%;border-collapse:collapse}' +
      'td{padding:2.4mm 2mm;border-bottom:1px solid #EFEAE1;vertical-align:top}' +
      'tr.b td{padding-top:6mm;border:0;font:9pt/1 Arial,sans-serif;letter-spacing:.12em;' +
      'text-transform:uppercase;color:#1A237E}' +
      'tr.c td{color:#9AA0A8;text-decoration:line-through}' +
      '.chk{width:6mm;color:#7CAF3A;font-weight:700;text-decoration:none}' +
      '.num{width:14mm;font:9.5pt Arial,sans-serif;color:#666F7B}' +
      '.w{width:26mm;font:8.5pt Arial,sans-serif;color:#666F7B;text-align:right}' +
      '.foot{margin-top:9mm;padding-top:4mm;border-top:1px solid #E3DCD0;font-size:9.5pt;color:#666F7B}' +
      '.foot b{color:#17202B}' +
      '</style></head><body>' +
      '<h1>Что спросит покупатель: ' + d.title.toLowerCase() + '</h1>' +
      '<p class="sub">Список собран ' + when + ' на faktlab.ru — по реестрам реальных работ ИИщенко LAB</p>' +
      '<div class="score"><b>' + pct + '&thinsp;%</b> готовности · закрыто ' + done +
      ' из ' + qs.length + ' позиций</div>' +
      '<table>' + rows + '</table>' +
      '<div class="foot"><b>Что делать дальше.</b> Всё неотмеченное покупатель выяснит сам, ' +
      'и каждый такой пункт станет поводом для скидки. Ответы собираются за две–три недели ' +
      'и превращаются в материалы, которые покупатель читает до встречи.<br><br>' +
      'ИИщенко LAB · faktlab.ru · +7 914 538-90-45</div>' +
      '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 400);
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
