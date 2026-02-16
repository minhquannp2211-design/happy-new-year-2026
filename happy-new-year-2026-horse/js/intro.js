const scene = document.getElementById('scene');
const btn = document.getElementById('btn');
const mail = document.getElementById('mail');
const letter = document.getElementById('letter');
const closeBtn = document.getElementById('close');
const overlay = document.getElementById('overlay');

btn.addEventListener('click', () => {
  const isActive = scene.classList.toggle('active');
  // Mirror the original mini-app approach: one button toggles "active" to trigger animations.
  // Background canvas listens to this event to increase fireworks intensity.
  window.dispatchEvent(new CustomEvent('hny:toggle', { detail: { active: isActive } }));
  btn.blur();
});

function openLetter() {
  letter.classList.add('show');
  overlay.classList.add('show');
}
function closeLetter() {
  letter.classList.remove('show');
  overlay.classList.remove('show');
}

mail.addEventListener('click', openLetter);
closeBtn.addEventListener('click', closeLetter);
overlay.addEventListener('click', closeLetter);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLetter();
});
