// Single-page app: countdown (locked) -> card (unlocked) with fortune draw.
//
// Countdown target: Lunar New Year 2026 is on 17/02/2026.
// Use GMT+7 so the unlock moment matches Vietnam time even if viewers are elsewhere.
const target = new Date().getTime() + 10000;
const quotes = [
  'Vạn sự tùy duyên, tâm an thế giới an. Chúc bạn một năm mới thong dong, tự tại, mỗi bước đi đều thấy hoa nở, mỗi nụ cười đều từ tâm.',
  'Gió lộng cờ bay, rồng vươn biển lớn. Chúc bạn năm mới sự nghiệp hanh thông, tài lộc dồi dào, đánh đâu thắng đó, định hướng rõ ràng.',
  'Nhà đầy tiếng cười, bếp luôn đỏ lửa. Chúc bạn và gia đình một năm mới gắn kết yêu thương, sức khỏe dẻo dai, hạnh phúc đong đầy trong từng hơi thở.'
];

const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, '0');

let cardInited = false;

function updateCountdown() {
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return { done: true };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  $('d').textContent = days;
  $('h').textContent = pad2(hours);
  $('m').textContent = pad2(minutes);
  $('s').textContent = pad2(seconds);

  return { done: false };
}

function showUnlockedCard() {
  const body = document.body;
  const countdownView = $('countdownView');
  const cardView = $('cardView');

  // Switch body class so bg.js starts firework bursts on this page
  body.classList.remove('page-countdown');
  body.classList.add('page-intro');
  body.dataset.state = 'unlocked';

  countdownView.hidden = true;
  cardView.hidden = false;

  if (!cardInited) {
    initCardInteractions();
    cardInited = true;
  }

  // Ensure fortune overlay is visible on every fresh load after unlock
  const fortune = $('fortune');
  fortune.classList.remove('hide');
}

function initCardInteractions() {
  const scene = $('scene');
  const btn = $('btn');
  const mail = $('mail');
  const letter = $('letter');
  const closeBtn = $('close');
  const overlay = $('overlay');
  const fortune = $('fortune');
  const drawBtn = $('drawBtn');
  const quoteEl = $('quote');

  function openLetter() {
    letter.classList.add('show');
    overlay.classList.add('show');
  }
  function closeLetter() {
    letter.classList.remove('show');
    overlay.classList.remove('show');
  }

  btn.addEventListener('click', () => {
    const isActive = scene.classList.toggle('active');
    window.dispatchEvent(new CustomEvent('hny:toggle', { detail: { active: isActive } }));
    btn.blur();
  });

  mail.addEventListener('click', openLetter);
  closeBtn.addEventListener('click', closeLetter);
  overlay.addEventListener('click', closeLetter);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLetter();
  });

  drawBtn.addEventListener('click', () => {
    const picked = quotes[(Math.random() * quotes.length) | 0];
    quoteEl.textContent = '“' + picked + '”';

    // Hide fortune overlay then open the letter
    fortune.classList.add('hide');
    setTimeout(() => {
      fortune.style.display = 'none';
      openLetter();
    }, 220);

    // Turn on active mode automatically (more fireworks/confetti)
    if (!scene.classList.contains('active')) {
      scene.classList.add('active');
      window.dispatchEvent(new CustomEvent('hny:toggle', { detail: { active: true } }));
    }
  });

  // If user closes letter and wants to read again, they can click mail icon.
}

document.addEventListener('DOMContentLoaded', () => {
  // If already past target (opened late), unlock immediately.
  const first = updateCountdown();
  if (first.done) {
    showUnlockedCard();
    return;
  }

  // Tick once per second for countdown.
  const timer = setInterval(() => {
    const r = updateCountdown();
    if (r.done) {
      clearInterval(timer);
      showUnlockedCard();
    }
  }, 1000);
});
