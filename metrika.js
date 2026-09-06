/* Яндекс.Метрика. Вынесена в отдельный файл, чтобы номер счётчика и список
   целей жили в одном месте, а не в двенадцати копиях по страницам. */
(function (m, e, t, r, i, k, a) {
  m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
  m[i].l = 1 * new Date();
  for (var j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) { return; }
  }
  k = e.createElement(t); a = e.getElementsByTagName(t)[0];
  k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=112321969', 'ym');

var METRIKA_ID = 112321969;

ym(METRIKA_ID, 'init', {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: 'dataLayer',
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true
});

/* Единая точка отправки цели. Инструменты зовут goal('quiz_pdf') и не знают
   ни про номер счётчика, ни про то, доехала ли Метрика: если её заблокировал
   браузер или расширение, вызов просто ничего не делает и ничего не роняет. */
window.goal = function (name) {
  try { if (typeof ym === 'function') { ym(METRIKA_ID, 'reachGoal', name); } }
  catch (e) {}
};
