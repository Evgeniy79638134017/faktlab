/* ИИщенко LAB — упаковка активов. Скрипты страницы. v1.0 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- граница у липкой шапки + кнопка на телефоне ---- */
  var top = document.querySelector('.top');
  var sticky = document.getElementById('stickyCta');
  var contact = document.getElementById('contact');

  var onScroll = function () {
    top.classList.toggle('is-stuck', window.scrollY > 12);

    if (sticky) {
      // показываем после первого экрана и прячем, когда человек дошёл до контактов
      var atContacts = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      sticky.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.9 && !atContacts);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- мобильное меню ---- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- аккордеон вопросов ---- */
  document.querySelectorAll('.faq__i').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    q.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      document.querySelectorAll('.faq__i.is-open').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- счётчики в hero ---- */
  var counters = document.querySelectorAll('[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (reduce || document.hidden) { el.textContent = target + suffix; return; }
    var start = performance.now();
    var dur = 900;
    var tick = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    var factsObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { factsObs.observe(c); });

    /* ---- появление строк описи, со сдвигом по времени ---- */
    var rvObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // строки описи появляются лесенкой; одиночные блоки — сразу, без задержки
        if (e.target.classList.contains('rv')) {
          var group = [].slice.call(e.target.parentNode.querySelectorAll('.rv'));
          var i = group.indexOf(e.target);
          if (i > 0) e.target.style.transitionDelay = Math.min(i, 6) * 60 + 'ms';
        }
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv, .flow, .parts, .scheme, .graph, .engine__num > div')
      .forEach(function (el) { rvObs.observe(el); });

    /* ---- таймлайн оживает, когда доходит до читателя ---- */
    var liveObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-live');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.tl, .viz').forEach(function (el) { liveObs.observe(el); });
  } else {
    counters.forEach(function (c) { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
    document.querySelectorAll('.rv, .flow, .parts, .scheme, .graph, .engine__num > div')
      .forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.tl, .viz').forEach(function (el) { el.classList.add('is-live'); });
  }

  /* ---- заявка уходит в Telegram через Cloudflare Worker ---- */
  var form = document.getElementById('lead');
  if (form) {
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.querySelector('span') : null;
    var btnLabel = btnText ? btnText.textContent : 'Отправить';

    var say = function (text, kind) {
      if (!status) return;
      status.textContent = text;
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
    };

    /* согласие на обработку данных: без отметки отправка недоступна */
    var agree = document.getElementById('f-agree');
    if (agree && btn) {
      var syncAgree = function () { btn.disabled = !agree.checked; };
      syncAgree();
      agree.addEventListener('change', syncAgree);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var endpoint = (window.SITE_CONFIG || {}).formEndpoint;
      if (!endpoint) {
        say('Форма не подключена. Телефон для связи: +7 914 538-90-45', 'err');
        return;
      }
      if (btn && btn.disabled) return;
      if (agree && !agree.checked) {
        say('Отметьте согласие на обработку персональных данных', 'err');
        return;
      }

      var d = new FormData(form);
      var payload = {
        name: d.get('name') || '',
        contact: d.get('contact') || '',
        type: d.get('type') || '',
        msg: d.get('msg') || '',
        company: d.get('company') || '',   // ловушка для ботов, у людей пустая
        page: location.href,
        agree: agree ? agree.checked : false   // фиксируем факт согласия вместе с заявкой
      };

      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
      if (btnText) btnText.textContent = 'Отправляем…';
      say('');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error((res && res.error) || 'send');
          form.reset();
          say('Заявка отправлена. Ответ — в течение рабочего дня.', 'ok');
        })
        .catch(function () {
          say('Отправить не удалось. Почта 549945@mail.ru, телефон +7 914 538-90-45', 'err');
        })
        .then(function () {
          if (btn) { btn.style.opacity = ''; btn.disabled = agree ? !agree.checked : false; }
          if (btnText) btnText.textContent = btnLabel;
        });
    });
  }

  /* ---- магнитные кнопки: притягиваются к курсору на несколько пикселей ---- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.14).toFixed(1) + 'px,' + (dy * 0.2).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    /* ---- кадастровая сетка в первом экране чуть смещается за курсором ---- */
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        hero.style.setProperty('--grid-shift', 'translate(' + (x * -14).toFixed(1) + 'px,' + (y * -10).toFixed(1) + 'px)');
      });
      hero.addEventListener('mouseleave', function () { hero.style.setProperty('--grid-shift', 'none'); });
    }
  }

  /* ---- обложки кейсов наклоняются к курсору ---- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.cover').forEach(function (fig) {
      var pic = fig.querySelector('picture');
      if (!pic) return;

      fig.addEventListener('mousemove', function (e) {
        var r = fig.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        var y = (e.clientY - r.top) / r.height - 0.5;
        // наклон небольшой: обложка должна ожить, а не кувыркаться
        pic.style.transform = 'rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateZ(0)';
        fig.style.setProperty('--glare-x', ((x + 0.5) * 100).toFixed(1) + '%');
        fig.style.setProperty('--glare-y', ((y + 0.5) * 100).toFixed(1) + '%');
        fig.classList.add('is-tilt');
      });

      fig.addEventListener('mouseleave', function () {
        pic.style.transform = '';
        fig.classList.remove('is-tilt');
      });
    });
  }
})();
