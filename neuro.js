/* Живая сеть в секции «Как устроен разбор».
   Узлы медленно дрейфуют и связываются между собой; курсор притягивает ближайшие
   и тянет за собой шлейф связей. Canvas, без библиотек.
   Рисуем только когда секция в кадре и когда вкладка активна. */
(function () {
  'use strict';

  var section = document.getElementById('engine');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // на тач-устройствах курсора нет, а батарею тратить незачем
  if (window.matchMedia('(hover: none)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'neuro';
  canvas.setAttribute('aria-hidden', 'true');
  section.insertBefore(canvas, section.firstChild);

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0;
  var nodes = [];
  var pointer = { x: -9999, y: -9999, active: false };
  var running = false;
  var raf = null;

  var LINK_DIST = 150;      // на каком расстоянии узлы связываются
  var POINTER_DIST = 190;   // радиус влияния курсора
  var TRAIL_MAX = 14;       // длина шлейфа
  var trail = [];

  function build() {
    var rect = section.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // плотность узлов от площади, но с потолком — чтобы не грузить слабые машины
    var count = Math.min(46, Math.round((w * h) / 26000));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: 1.1 + Math.random() * 1.5
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    var i, j, a, b, dx, dy, d;

    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;

      // лёгкое притяжение к курсору
      if (pointer.active) {
        dx = pointer.x - a.x;
        dy = pointer.y - a.y;
        d = Math.hypot(dx, dy);
        if (d < POINTER_DIST && d > 1) {
          a.x += (dx / d) * 0.35;
          a.y += (dy / d) * 0.35;
        }
      }
    }

    // связи между узлами
    ctx.lineWidth = 1;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = 'rgba(154, 166, 184, ' + (0.16 * (1 - d / LINK_DIST)).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // связи от курсора к ближайшим узлам — те самые «нейронные связи» за мышью
    if (pointer.active) {
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        d = Math.hypot(pointer.x - a.x, pointer.y - a.y);
        if (d < POINTER_DIST) {
          var t = 1 - d / POINTER_DIST;
          ctx.strokeStyle = 'rgba(124, 175, 58, ' + (0.5 * t).toFixed(3) + ')';
          ctx.lineWidth = 1 + t;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 1;

      // шлейф — след недавнего движения
      for (i = 1; i < trail.length; i++) {
        var p0 = trail[i - 1], p1 = trail[i];
        var alpha = 0.28 * (i / trail.length);
        ctx.strokeStyle = 'rgba(124, 175, 58, ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 1.6 * (i / trail.length);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    // сами узлы
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      d = pointer.active ? Math.hypot(pointer.x - a.x, pointer.y - a.y) : 9999;
      var near = d < POINTER_DIST;
      ctx.fillStyle = near
        ? 'rgba(156, 212, 106, ' + (0.5 + 0.45 * (1 - d / POINTER_DIST)).toFixed(3) + ')'
        : 'rgba(180, 192, 210, 0.32)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r + (near ? 0.7 : 0), 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  section.addEventListener('mousemove', function (e) {
    var rect = section.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
    trail.push({ x: pointer.x, y: pointer.y });
    if (trail.length > TRAIL_MAX) trail.shift();
  });

  section.addEventListener('mouseleave', function () {
    pointer.active = false;
    trail.length = 0;
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (isVisible) start();
  });

  // размеры секции известны только после раскладки, поэтому строим с задержкой.
  // Через setTimeout, а не requestAnimationFrame: в неактивной вкладке кадры
  // не выдаются, и холст остался бы дефолтным 300×150.
  function rebuild() { setTimeout(build, 0); }

  var isVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
      if (isVisible) { rebuild(); start(); } else { stop(); }
    }, { threshold: 0.05 }).observe(section);
  } else {
    rebuild();
    start();
  }

  // шрифты и картинки меняют высоту секции уже после первого построения
  window.addEventListener('load', rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
})();
