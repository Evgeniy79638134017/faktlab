/* Счёт потерь от неподготовленной продажи.
   Считаем только то, что считается честно: деньги, замороженные в объекте,
   его содержание и типичную уступку при торге без обоснования. Цену самого
   объекта не оцениваем — её называет собственник. */
(function () {
  var root = document.getElementById('calc');
  if (!root) return;

  /* Ставка — доходность денег, вынутых из объекта. Берём консервативно:
     ключевая ставка минус запас, а не доходность бизнеса. */
  var RATE = 0.14;
  /* Доля уступки при торге, когда обоснования цены нет. Нижняя граница
     того, что мы видели в работах и в разборе сопоставимых сделок. */
  var DISCOUNT = 0.12;

  var f = {
    price: null, months: null, upkeep: null, kind: 'land'
  };

  var KIND = {
    land:     { t: 'Земля или площадка', upkeep: 0.004 },
    building: { t: 'Здание, помещение',  upkeep: 0.006 },
    business: { t: 'Действующий бизнес', upkeep: 0.010 },
    share:    { t: 'Доля в компании',    upkeep: 0.002 }
  };

  function money(v) {
    if (!isFinite(v)) return '—';
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + ' млн ₽';
    if (v >= 1e3) return Math.round(v / 1e3) + ' тыс. ₽';
    return Math.round(v) + ' ₽';
  }

  function build() {
    root.innerHTML =
      '<div class="calc__form">' +
        '<div class="calc__f">' +
          '<label for="c-kind">Что продаёте</label>' +
          '<select id="c-kind">' +
            Object.keys(KIND).map(function (k) {
              return '<option value="' + k + '">' + KIND[k].t + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="calc__f">' +
          '<label for="c-price">Цена, которую рассчитываете получить</label>' +
          '<div class="calc__inp"><input id="c-price" type="text" inputmode="numeric" placeholder="25"><span>млн ₽</span></div>' +
          '<span class="calc__fix" id="c-price-fix"></span>' +
        '</div>' +
        '<div class="calc__f">' +
          '<label for="c-months">Сколько месяцев объект уже в продаже</label>' +
          '<div class="calc__inp"><input id="c-months" type="text" inputmode="numeric" placeholder="8"><span>мес.</span></div>' +
        '</div>' +
        '<div class="calc__f">' +
          '<label for="c-upkeep">Содержание в месяц <i>если не знаете — оставьте пустым, посчитаем по типу объекта</i></label>' +
          '<div class="calc__inp"><input id="c-upkeep" type="text" inputmode="numeric" placeholder="—"><span>тыс. ₽</span></div>' +
          '<span class="calc__fix" id="c-upkeep-fix"></span>' +
        '</div>' +
      '</div>' +
      '<div class="calc__out" id="calc-out"></div>';

    ['c-kind', 'c-price', 'c-months', 'c-upkeep'].forEach(function (id) {
      var n = document.getElementById(id);
      n.addEventListener('input', read);
      n.addEventListener('change', read);
    });
    read();
  }

  /* Поля подписаны «млн ₽» и «тыс. ₽», но человек часто вписывает всю сумму
     рублями: «25 000 000» вместо «25». Буквальный счёт такого ввода даёт
     бессмыслицу в миллионы раз больше — поэтому слишком крупное число
     трактуем как рубли, пересчитываем и пишем под полем, как поняли. */
  function num(id, guard, div) {
    var v = (document.getElementById(id).value || '').replace(/[^\d.,]/g, '').replace(',', '.');
    var n = parseFloat(v);
    if (!isFinite(n)) { note(id, null, div); return null; }
    var fixed = null;
    if (guard && n >= guard) { n = n / div; fixed = n; }
    note(id, fixed, div);
    return n;
  }

  function note(id, val, div) {
    var box = document.getElementById(id + '-fix');
    if (!box) return;
    box.className = 'calc__fix' + (val == null ? '' : ' is-on');
    box.innerHTML = val == null ? '' :
      'Похоже, сумма введена рублями — считаем как <b>' + money(val * div) + '</b>.';
  }

  function read() {
    f.kind = document.getElementById('c-kind').value;
    f.price = num('c-price', 1e4, 1e6);
    f.months = num('c-months');
    f.upkeep = num('c-upkeep', 1e4, 1e3);
    render();
  }

  function render() {
    var out = document.getElementById('calc-out');
    if (!f.price || !f.months) {
      out.innerHTML = '<p class="calc__hint">Укажите цену и срок — посчитаем, во сколько обошёлся простой.</p>';
      out.classList.remove('is-on');
      return;
    }
    var price = f.price * 1e6;
    var upkeepM = f.upkeep != null ? f.upkeep * 1e3 : price * KIND[f.kind].upkeep;
    var frozen = price * RATE / 12 * f.months;   // деньги, которые могли работать
    var keep = upkeepM * f.months;               // содержание за срок продажи
    var lost = frozen + keep;
    var disc = price * DISCOUNT;
    var perMonth = price * RATE / 12 + upkeepM;

    out.classList.add('is-on');
    out.innerHTML =
      '<div class="calc__lead">За ' + f.months + ' мес. простоя объект уже стоил вам</div>' +
      '<div class="calc__big">' + money(lost) + '</div>' +
      '<div class="calc__split">' +
        row('Деньги заморожены в объекте', money(frozen),
            'Цена × ' + Math.round(RATE * 100) + '&thinsp;% годовых ÷ 12 × ' + f.months +
            ' мес. Ставка взята консервативно — как доходность вклада, а не бизнеса.') +
        row('Содержание за этот срок', money(keep),
            f.upkeep != null
              ? 'По вашей цифре: ' + money(upkeepM) + ' в месяц.'
              : 'Оценка по типу объекта: ' + money(upkeepM) + ' в месяц. Подставьте свою — расчёт изменится.') +
      '</div>' +
      '<div class="calc__next">' +
        '<div class="calc__nextT">И это до самой сделки</div>' +
        '<p>Когда покупатель придёт, он будет считать риск деньгами. Каждый вопрос без ' +
        'документа — повод для уступки. Без обоснованной цены торг обычно съедает около ' +
        Math.round(DISCOUNT * 100) + '&thinsp;% — это ещё <b>' + money(disc) + '</b>.</p>' +
        '<p class="calc__month">Пока объект не подготовлен, счётчик идёт дальше: ' +
        '<b>' + money(perMonth) + '</b> в месяц.</p>' +
      '</div>' +
      '<p class="calc__disc">Мы не оцениваем ваш объект и не обещаем цену — её называете вы. ' +
      'Здесь посчитано только то, что считается честно: стоимость времени и типичная ' +
      'уступка при торге без аргументов.</p>';
  }

  function row(t, v, note) {
    return '<div class="calc__row"><div class="calc__rowT">' + t +
           '<span>' + note + '</span></div><b>' + v + '</b></div>';
  }

  build();
})();
