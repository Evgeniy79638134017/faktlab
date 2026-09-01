# -*- coding: utf-8 -*-
"""Переписывает функцию выгрузки в quiz.js: фирменная шапка, вводный абзац,
две цифры вместо одной, приглашение сразу после списка, печать из скрытой
рамки (в колонтитуле остаётся адрес сайта, а не about:blank)."""
import io

p = 'quiz.js'
s = io.open(p, encoding='utf-8').read()

start = s.index('  function printList(qs) {')
end = s.index('  function tail(x) {')

NEW = r'''  function printList(qs) {
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

'''

io.open(p, 'w', encoding='utf-8').write(s[:start] + NEW + s[end:])
print('документ переписан: шапка бренда, вводный абзац, две цифры, приглашение сразу после списка')
