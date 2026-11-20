document.documentElement.classList.add('js');

const status = document.querySelector('#copy-status');
let statusTimer;

function revealPrompt(hash) {
  const prompt = document.getElementById(hash.slice(1));
  if (prompt instanceof HTMLDetailsElement) prompt.open = true;
}

document.querySelectorAll('[data-reveal]').forEach(link => {
  link.addEventListener('click', () => revealPrompt(link.hash));
});
revealPrompt(location.hash);

function selectPrompt(node) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

document.querySelectorAll('[data-copy]').forEach(button => {
  let resetTimer;
  button.addEventListener('click', async () => {
    const node = document.getElementById(button.dataset.copy);
    let result;
    try {
      await navigator.clipboard.writeText(node.textContent.trim());
      result = 'Скопировано';
    } catch {
      const selection = selectPrompt(node);
      try {
        if (!document.execCommand('copy')) throw new Error();
        selection.removeAllRanges();
        result = 'Скопировано';
      } catch {
        result = 'Текст выделен';
      }
    }
    button.textContent = result;
    status.textContent = result === 'Скопировано' ? 'Промпт скопирован' : 'Промпт выделен. Скопируйте его вручную.';
    button.dataset.result = result === 'Скопировано' ? 'done' : 'selected';
    clearTimeout(resetTimer);
    clearTimeout(statusTimer);
    resetTimer = setTimeout(() => {
      button.textContent = 'Скопировать';
      delete button.dataset.result;
    }, 2200);
    statusTimer = setTimeout(() => { status.textContent = ''; }, 2200);
  });
});

const play = document.querySelector('#play-styles');
const playLabel = document.querySelector('#play-label');
const videoStatus = document.querySelector('#video-status');
const clipNote = document.querySelector('#clip-note');
const videos = [...document.querySelectorAll('#coffee-reels video')];

function setPlaying(playing, label) {
  play.dataset.playing = String(playing);
  playLabel.textContent = label;
}

play.addEventListener('click', async () => {
  if (play.dataset.playing === 'true') {
    videos.forEach(video => video.pause());
    setPlaying(false, 'Продолжить');
    videoStatus.textContent = 'Видео на паузе';
    return;
  }
  play.disabled = true;
  setPlaying(false, 'Загрузка…');
  clipNote.textContent = 'Один фрагмент в трёх версиях. 6 секунд, без звука.';
  const positions = videos.map(video => video.currentTime);
  const from = videos.some(video => video.ended) ? 0 : Math.min(...positions);
  try {
    await Promise.all(videos.map(video => {
      video.muted = true;
      if (video.readyState >= 1) video.currentTime = from;
      return video.play();
    }));
    const first = Math.min(...videos.map(video => video.currentTime));
    videos.forEach(video => { if (video.currentTime - first > 0.09) video.currentTime = first; });
    setPlaying(true, 'Пауза');
    videoStatus.textContent = 'Три версии воспроизводятся без звука';
  } catch {
    videos.forEach(video => video.pause());
    setPlaying(false, 'Повторить');
    clipNote.textContent = 'Видео не загрузилось. Попробуйте ещё раз.';
    videoStatus.textContent = clipNote.textContent;
  } finally {
    play.disabled = false;
  }
});

videos.forEach(video => video.addEventListener('ended', () => {
  if (videos.every(item => item.ended)) {
    setPlaying(false, 'Ещё раз');
    videoStatus.textContent = 'Сравнение завершилось';
  }
}));

const office = document.querySelector('#club-office-video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const starterPreview = document.querySelector('.starter-play');

if (starterPreview) {
  const starterClip = starterPreview.querySelector('video');
  starterPreview.addEventListener('toggle', () => {
    if (!starterPreview.open) starterClip.pause();
  });
}

if (office && !reducedMotion.matches && 'IntersectionObserver' in window) {
  let hasStarted = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
      office.pause();
      return;
    }
    if (hasStarted) return;
    hasStarted = true;
    office.play().catch(() => {
      // The browser controls remain available if autoplay is blocked.
    });
  }, { threshold: [0, 0.5] });
  observer.observe(office);
}
