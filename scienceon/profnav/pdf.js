'use strict';
(function (scope) {
  const currentScript = typeof document !== 'undefined' && document.currentScript && document.currentScript.src;
  const baseUrl = currentScript ? new URL('.', currentScript).href : new URL('.', document.baseURI).href;
  let fontsPromise;
  const asText = value => value == null ? '' : String(value);
  const short = (value, limit) => {
    const clean = asText(value).replace(/\s+/g, ' ').trim();
    return clean.length <= limit ? clean : clean.slice(0, limit - 1).trimEnd() + '…';
  };
  const names = {
    R: 'Техника и устройства', I: 'Данные и программы', A: 'Дизайн, текст и видео',
    S: 'Обучение и поддержка', E: 'Проекты и организация', C: 'Порядок и автоматизация'
  };
  const trials = {
    R: {
      do: 'Выбери безопасный бытовой предмет. Найди инструкцию производителя и нарисуй схему его частей. Не разбирай прибор под напряжением.',
      show: 'По схеме объясни знакомому, как работает предмет. Попроси назвать одно непонятное место.',
      improve: 'Сверь ответ с инструкцией. Добавь недостающее объяснение и покажи схему ещё раз.',
      output: 'Понятная схема устройства и короткое объяснение его работы.',
      checks: ['Есть инструкция производителя', 'Другой человек понял принцип работы', 'Непонятное место исправлено'],
      neighbor: 'Нарисуй схему знакомого устройства.'
    },
    I: {
      do: 'Выбери простой вопрос и собери 15 наблюдений без личных данных. Запиши их в таблицу.',
      show: 'Сравни две группы или два объяснения. Покажи таблицу знакомому и попроси проверить вывод.',
      improve: 'Найди пример, который не вписывается в вывод. Уточни объяснение и запиши, что ещё неизвестно.',
      output: 'Таблица, один проверенный вывод и вопрос для следующей проверки.',
      checks: ['В таблице есть 15 наблюдений', 'Наблюдение отделено от догадки', 'Проверено другое объяснение'],
      neighbor: 'Собери таблицу из 15 наблюдений.'
    },
    A: {
      do: 'Сделай анонс вымышленного студенческого события: что будет, когда, где и что нужно сделать участнику.',
      show: 'Покажи анонс двум людям. Попроси своими словами пересказать, что и где будет.',
      improve: 'Исправь то, что поняли неверно. Сохрани первый и второй варианты и сравни их.',
      output: 'Два варианта анонса и два коротких отзыва.',
      checks: ['Понятно, что, где и когда будет', 'Получены два отзыва', 'Одна правка сделала анонс яснее'],
      neighbor: 'Сделай анонс и получи два отзыва.'
    },
    S: {
      do: 'Выбери тему, которую знаешь. Подготовь объяснение на пять минут и одно новое задание для проверки.',
      show: 'Объясни тему знакомому. Попроси выполнить новое задание без твоих подсказок.',
      improve: 'По ошибкам измени объяснение или пример. Снова проверь, стало ли понятнее.',
      output: 'Понятное объяснение, проверочное задание и одна полезная правка.',
      checks: ['Есть конкретная тема', 'Понимание проверено новым заданием', 'Объяснение улучшено по ошибкам'],
      neighbor: 'Объясни тему и проверь новое задание.'
    },
    E: {
      do: 'Придумай маленький полезный проект для группы. Запиши, кому он нужен и какой первый результат получится.',
      show: 'Обсуди идею с тремя людьми. Узнай, нужна ли она и что они предложили бы изменить.',
      improve: 'Уточни идею по ответам. Выполни один шаг без денег и обещаний, затем запиши результат.',
      output: 'Описание идеи, три мнения и результат первого шага.',
      checks: ['Назван тот, кому полезна идея', 'Получены три мнения', 'Один шаг действительно выполнен'],
      neighbor: 'Обсуди идею проекта с тремя людьми.'
    },
    C: {
      do: 'Возьми учебный процесс без личных данных: например, возврат книг. Нарисуй его шаги и собери таблицу.',
      show: 'Проверь три ситуации, когда таблица может ошибиться: пропуск, повтор, неверная дата. Покажи их знакомому.',
      improve: 'Исправь одну найденную ошибку. Повтори проверку и запиши, что теперь происходит.',
      output: 'Рабочая таблица, три проверки и одна исправленная ошибка.',
      checks: ['Понятны шаги процесса', 'Проверены три возможных сбоя', 'После правки проверка повторена'],
      neighbor: 'Проверь таблицу на три возможных сбоя.'
    }
  };
  const regions = { '113': 'Россия', '12': 'Благовещенск', '1932': 'Амурская область' };
  const routeBrief = {
    R: 'Оборудование и технические системы: сравни колледжи. Для инженерных ролей посмотри профильные вузы.',
    I: 'Программирование, прикладная математика, анализ данных: сравни колледжи и вузы.',
    A: 'Дизайн, медиа и коммуникации: сравни программы и учебные проекты.',
    S: 'Обучение и медицина требуют предметной подготовки. Для поддержки клиентов изучают продукт и общение.',
    E: 'Управление, экономика и отрасль проекта: начни с координации небольших задач.',
    C: 'Информационные системы, прикладная информатика, контроль качества: сравни практику.'
  };
  const education = { college: 'Колледж', university: 'Вуз', unknown: 'Сравнить колледж и вуз' };
  async function fonts() {
    if (!fontsPromise) fontsPromise = Promise.all(['NotoSans-Regular.ttf', 'NotoSans-Bold.ttf'].map(async name => {
      const response = await fetch(new URL('assets/' + name, baseUrl).href);
      if (!response.ok) throw Error('Не удалось загрузить локальный шрифт PDF. Попробуй ещё раз.');
      return new Uint8Array(await response.arrayBuffer());
    })).catch(error => { fontsPromise = null; throw error; });
    return fontsPromise;
  }
  function safeLink(value) {
    try {
      const url = new URL(asText(value));
      return url.protocol === 'https:' && ['hh.ru', 'proektoria.online'].includes(url.hostname) ? url.href : '';
    } catch (_) { return ''; }
  }

  async function build({ state, result, data, week, why, hhLink }) {
    if (!scope.PDFLib || !scope.fontkit) throw Error('Модули PDF пока не загрузились. Попробуй ещё раз.');
    if (!state || !data || !Array.isArray(data.domains)) throw Error('Не удалось прочитать ответы для карты.');
    const P = scope.PDFLib, doc = await P.PDFDocument.create();
    const [normalBytes, strongBytes] = await fonts();
    doc.registerFontkit(scope.fontkit);
    const normal = await doc.embedFont(normalBytes, { subset: true });
    const strong = await doc.embedFont(strongBytes, { subset: true });
    const supported = new Set(normal.getCharacterSet());
    const clean = value => Array.from(asText(value)).map(char => {
      return ['\r', '\n', '\t'].includes(char) || supported.has(char.codePointAt(0)) ? char : '[символ]';
    }).join('');
    doc.setTitle('Моя карта первых проб — план действий');
    doc.setAuthor('ИИщенко LAB · Профнавигатор');
    doc.setSubject('Три направления, первая учебная проба и следующий шаг');
    doc.setLanguage('ru-RU');
    const rgb = hex => P.rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
    const C = { cream: rgb('#fffdf2'), teal: rgb('#117c8b'), blue: rgb('#285a9b'), orange: rgb('#ef8354'), ink: rgb('#213b42'), muted: rgb('#516c70'), white: P.rgb(1, 1, 1), line: rgb('#dbdfd3') };
    const W = 595.28, H = 841.89, L = 42, WIDTH = W - L * 2, BOTTOM = 92;
    const BODY = 12.5, LEAD = 17.5, pages = [];
    let page, y, section = '';
    function width(value, size, font) { return (font || normal).widthOfTextAtSize(clean(value), size); }
    function lines(value, maxWidth, size, font) {
      const out = [], f = font || normal;
      clean(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').forEach(paragraph => {
        if (!paragraph) { out.push(''); return; }
        let line = '';
        for (const word of paragraph.replace(/\t/g, '    ').split(/\s+/)) {
          const candidate = line ? line + ' ' + word : word;
          if (width(candidate, size, f) <= maxWidth) { line = candidate; continue; }
          if (line) { out.push(line); line = ''; }
          if (width(word, size, f) <= maxWidth) line = word;
          else {
            let part = '';
            for (const char of Array.from(word)) {
              if (part && width(part + char, size, f) > maxWidth) { out.push(part); part = char; }
              else part += char;
            }
            line = part;
          }
        }
        if (line) out.push(line);
      });
      return out;
    }
    function newPage(label) {
      section = label || section;
      page = doc.addPage([W, H]); pages.push(page);
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.cream });
      page.drawRectangle({ x: 0, y: H - 9, width: W / 3, height: 9, color: C.teal });
      page.drawRectangle({ x: W / 3, y: H - 9, width: W / 3, height: 9, color: C.blue });
      page.drawRectangle({ x: W * 2 / 3, y: H - 9, width: W / 3, height: 9, color: C.orange });
      y = H - 70;
    }
    function need(height) { if (y - height < BOTTOM) newPage(section); }
    function drawLine(value, x, top, size, font, color) {
      page.drawText(clean(value), { x, y: top - size, size, font: font || normal, color: color || C.ink });
    }
    function paragraph(value, options) {
      const o = options || {}, size = o.size || BODY, leading = o.leading || LEAD, font = o.font || normal;
      const content = lines(value, o.width || WIDTH, size, font);
      content.forEach(line => { need(leading); drawLine(line, o.x || L, y, size, font, o.color); y -= leading; });
      y -= o.after == null ? 7 : o.after;
    }
    function h(value) { need(41); paragraph(value, { size: 14.5, leading: 21, font: strong, after: 6 }); }
    function title(kicker, value, lead) {
      paragraph(kicker, { size: 12, leading: 17, color: C.teal, font: strong, after: 6 });
      paragraph(value, { size: 26, leading: 32, font: strong, after: 8 });
      if (lead) paragraph(lead, { size: 13, leading: 18.5, color: C.muted, after: 13 });
    }
    function rect(top, height, color, border) {
      page.drawRectangle({ x: L, y: top - height, width: WIDTH, height, color, borderColor: border || color, borderWidth: border ? 1.2 : 0 });
    }
    function link(label, value) {
      const url = safeLink(value); if (!url) return;
      const labelLines = lines(label, WIDTH, 12.5, strong);
      need(labelLines.length * 18 + 5);
      labelLines.forEach(line => {
        drawLine(line, L, y, 12.5, strong, C.blue);
        const bottom = y - 15;
        page.drawLine({ start: { x: L, y: bottom }, end: { x: L + width(line, 12.5, strong), y: bottom }, thickness: 0.5, color: C.blue });
        const ref = doc.context.register(doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [L, bottom - 2, L + width(line, 12.5, strong), y + 2], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: P.PDFString.of(url) } }));
        page.node.addAnnot(ref); y -= 18;
      }); y -= 5;
    }
    const recommended = ((result && result.top) || []).slice(0, 3).map(item => ({ item, profile: data.domains.find(d => d.id === item.id) })).filter(x => x.profile);
    if (!recommended.length) throw Error('Сначала собери карту направлений.');
    const explicitChoice = recommended.find(x => x.profile.id === state.preferred);
    const first = explicitChoice || recommended[0], profile = first.profile, task = trials[profile.id] || trials.I;
    const remote = state.place === 'remote', searchPlace = remote ? 'Россия · удалённо' : (regions[asText(state.region)] || 'Выбранный регион');
    const roles = d => (remote ? d.remoteRoles : d.roles) || [];
    const hh = d => typeof hhLink === 'function' ? hhLink(d, remote) : '';
    const shortWhy = item => {
      const coins = Number(item.coins || 0), count = (item.activities || []).length;
      if (!coins && !count) return 'Пока нет прямых примеров — вариант для знакомства.';
      const bits = [];
      if (coins) bits.push(coins + ' ' + (coins === 1 ? 'фишка интереса' : coins < 5 ? 'фишки интереса' : 'фишек интереса'));
      if (count) bits.push(count + ' ' + (count === 1 ? 'выбранное занятие' : 'выбранных занятия'));
      return 'В твоих ответах: ' + bits.join(' и ') + '.';
    };

    newPage('Три варианта для пробы');
    title('ТВОЙ ВЫБОР МОЖЕТ МЕНЯТЬСЯ', 'Моя карта первых проб', 'Вот три варианта, с которых можно начать. Выбор проверяется делом.');
    const panelColors = [C.teal, C.blue, C.orange];
    recommended.forEach(({ item, profile: d }, index) => {
      const color = panelColors[index], ink = index === 2 ? C.ink : C.white;
      const roleLines = roles(d).slice(0, 2).flatMap(role => lines('• ' + role.replace(/\bCAD\b/g, 'специальных программах'), WIDTH - 36, 12.5, normal));
      const reasonLines = lines(shortWhy(item), WIDTH - 36, 12.5, normal);
      const height = 67 + reasonLines.length * 17 + roleLines.length * 17;
      need(height + 11); const top = y;
      rect(top, height, color);
      drawLine((index + 1) + '. ' + (names[d.id] || d.title), L + 18, top - 12, 19, strong, ink);
      let at = top - 41;
      reasonLines.forEach(line => { drawLine(line, L + 18, at, 12.5, normal, ink); at -= 17; });
      at -= 7;
      roleLines.forEach(line => { drawLine(line, L + 18, at, 12.5, normal, ink); at -= 17; });
      y = top - height - 11;
    });
    h('Что важно тебе — в твоём порядке');
    let tagX = L, tagY = y;
    (state.values || []).slice(0, 3).forEach((id, index) => {
      const value = (data.values || []).find(v => v.id === id);
      if (!value) return;
      const label = (index + 1) + ' · ' + value.text, tagWidth = Math.min(WIDTH, width(label, 12, strong) + 20);
      if (tagX + tagWidth > L + WIDTH) { tagX = L; tagY -= 30; }
      page.drawRectangle({ x: tagX, y: tagY - 25, width: tagWidth, height: 25, color: C.white, borderColor: C.line, borderWidth: 0.8 });
      drawLine(label, tagX + 10, tagY - 5, 12, strong, C.ink); tagX += tagWidth + 7;
    });
    y = tagY - 38;
    need(76); const calloutTop = y;
    rect(calloutTop, 76, C.white, C.teal);
    drawLine('Выбери одну из трёх и попробуй задачу.', L + 16, calloutTop - 12, 15, strong, C.teal);
    const firstLabel = explicitChoice ? 'Ты выбрал: ' : 'Первый вариант для сравнения: ';
    drawLine(firstLabel + (names[profile.id] || profile.title), L + 16, calloutTop - 39, 12.5, strong, C.ink);
    y -= 88;
    if (result && result.noEvidence) paragraph('Ты пока не определился. Эти варианты нужны для знакомства — после первой пробы карту можно собрать заново.', { color: C.muted });

    newPage('Первая проба');
    title(explicitChoice ? 'ТЫ ВЫБРАЛ ЭТУ ПРОБУ' : 'ПЕРВЫЙ ВАРИАНТ ДЛЯ СРАВНЕНИЯ', 'Первая проба:\n' + (names[profile.id] || profile.title), state.device === 'phone' ? 'Пока только телефон? Начни с текста, схемы или объяснения. Для программ найди доступ к компьютеру.' : 'Не нужно сразу решать, кем стать. Проверь, интересно ли тебе делать саму работу.');
    [{ word: 'СДЕЛАЙ', detail: task.do, color: C.teal }, { word: 'ПОКАЖИ', detail: task.show, color: C.blue }, { word: 'УЛУЧШИ', detail: task.improve, color: C.orange }].forEach((step, index) => {
      const textLines = lines(step.detail, WIDTH - 72, 13, normal), height = 31 + textLines.length * 18;
      need(height + 12); const top = y;
      page.drawCircle({ x: L + 15, y: top - 16, size: 15, color: step.color });
      const number = asText(index + 1), numberColor = index === 2 ? C.ink : C.white;
      drawLine(number, L + 15 - width(number, 15, strong) / 2, top - 5, 15, strong, numberColor);
      drawLine(step.word, L + 43, top - 1, 14.5, strong, step.color === C.orange ? C.ink : step.color);
      let at = top - 24;
      textLines.forEach(line => { drawLine(line, L + 43, at, 13, normal, C.ink); at -= 18; });
      y = top - height - 12;
    });
    const outputLines = lines(task.output, WIDTH - 30, 14, strong), resultHeight = 36 + outputLines.length * 19;
    need(resultHeight + 9); const outputTop = y; rect(outputTop, resultHeight, C.white, C.teal);
    drawLine('У ТЕБЯ НА РУКАХ', L + 15, outputTop - 9, 12, strong, C.teal);
    let outputY = outputTop - 30;
    outputLines.forEach(line => { drawLine(line, L + 15, outputY, 14, strong, C.ink); outputY -= 19; });
    y = outputTop - resultHeight - 13;
    h('Три галочки: проба готова, если…');
    task.checks.forEach(check => {
      need(22); page.drawRectangle({ x: L + 1, y: y - 12, width: 10, height: 10, borderColor: C.teal, borderWidth: 1 });
      paragraph(check, { x: L + 20, width: WIDTH - 20, size: 12.5, leading: 18, after: 3 });
    });
    y -= 7; h('Ещё две короткие пробы для сравнения');
    recommended.filter(x => x.profile.id !== profile.id).forEach(({ profile: d }) => {
      paragraph((names[d.id] || d.title) + ': ' + (trials[d.id] || trials.I).neighbor, { size: 12.5, leading: 17.5, after: 5 });
    });
    link('Посмотреть такую работу · ' + searchPlace, hh(profile));

    newPage('Мой следующий шаг');
    title('СОХРАНИ И ВЕРНИСЬ К КАРТЕ', 'Мой следующий шаг', remote ? 'Удалённые вакансии: Россия. Локальный ориентир: ' + (regions[asText(state.region)] || 'выбранный регион') + '.' : 'Локальный поиск работы: ' + searchPlace + '.');
    [
      ['Сегодня', 'Выбери одну пробу со страницы 2. Подготовь материалы и реши, кому покажешь результат.'],
      ['На выходных', 'Сделай, покажи, улучши. Сохрани первую и вторую версии своей работы.'],
      ['Через неделю', 'Спроси себя: что понравилось делать? Что хочется повторить? Продолжи эту пробу или возьми соседнюю.']
    ].forEach(([label, detail], index) => {
      need(62); const color = panelColors[index];
      paragraph(label, { size: 15, leading: 21, font: strong, color: color === C.orange ? C.ink : color, after: 3 });
      paragraph(detail, { size: 12.5, leading: 17.5, after: 9 });
    });
    h('Куда смотреть дальше');
    recommended.forEach(({ profile: d }) => link((names[d.id] || d.title) + ' · ' + searchPlace, hh(d)));
    link('Проектория · чем занимаются люди этих профессий', 'https://proektoria.online/catalog');
    h('Образование: что узнать');
    paragraph((education[state.education] || 'Сравни образовательные маршруты') + '. ' + (routeBrief[profile.id] || short(profile.route, 120)), { size: 12.5, leading: 17.5, after: 7 });
    paragraph('Найди в программе практику и учебные проекты. Уточни требования к поступлению и к самой профессии.', { size: 12.5, leading: 17.5, after: 8 });
    h('Фрагменты твоих ответов');
    const episodes = (state.episodes || []).map(value => asText(value)).filter(value => value.trim());
    if (episodes.length) {
      episodes.slice(0, 2).forEach(answer => paragraph('«' + short(answer, 145) + '»', { size: 12.5, leading: 17.5, color: C.muted, after: 7 }));
      paragraph('Полные ответы сохранены во вложении «Мои_ответы.json» внутри PDF.', { size: 12, leading: 16, color: C.muted, after: 5 });
    } else paragraph('Пока нет примеров. После пробы запиши, что ты сделал сам и что захотелось продолжить.', { size: 12.5, leading: 17.5, color: C.muted });

    await doc.attach(new TextEncoder().encode(JSON.stringify({ version: data.version, answers: state }, null, 2)), 'Мои_ответы.json', {
      mimeType: 'application/json', description: 'Точные исходные ответы; сохранены локально в браузере.', creationDate: new Date(), modificationDate: new Date()
    });
    pages.forEach((sheet, index) => {
      const brand = 'ПРОФНАВИГАТОР', suffix = 'КАРТА ДЕЙСТВИЙ';
      sheet.drawText(brand, { x: L, y: H - 39, size: 12, font: strong, color: C.muted });
      sheet.drawText(suffix, { x: W - L - width(suffix, 12, strong), y: H - 39, size: 12, font: strong, color: C.muted });
      if (index === pages.length - 1) {
        const note = 'Это направления для проб, не приговор и не прогноз дохода.';
        sheet.drawText(note, { x: L, y: 60, size: 12, font: normal, color: C.muted });
      }
      sheet.drawLine({ start: { x: L, y: 46 }, end: { x: W - L, y: 46 }, thickness: 0.6, color: C.line });
      const number = asText(index + 1);
      sheet.drawText(number, { x: (W - width(number, 12, normal)) / 2, y: 25, size: 12, font: normal, color: C.muted });
    });
    return await doc.save();
  }
  scope.CareerPdf = { build };
})(window);
