(() => {
  const counterId = 112321969;
  const parameters = new URLSearchParams(window.location.search);

  if (window.location.hostname !== 'faktlab.ru' || parameters.get('analytics') === 'off') return;

  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(tag);

  window.ym(counterId, 'init', {
    clickmap: false,
    webvisor: false,
    trackLinks: true,
    accurateTrackBounce: true,
    referrer: document.referrer,
    url: window.location.href,
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const destination = new URL(link.href, window.location.href);
    if (destination.hostname !== 'club.faktlab.ru') return;

    destination.searchParams.set('utm_source', 'faktlab');
    destination.searchParams.set('utm_medium', 'instruction');
    destination.searchParams.set('utm_campaign', 'multik');
    destination.searchParams.set('utm_content', 'club_cta');
    link.href = destination.href;

    link.addEventListener('click', event => {
      if (event.defaultPrevented) return;
      window.ym(counterId, 'reachGoal', 'multik_club_click');
    });
    link.addEventListener('auxclick', event => {
      if (event.button !== 1 || event.defaultPrevented) return;
      window.ym(counterId, 'reachGoal', 'multik_club_click');
    });
  });
})();
