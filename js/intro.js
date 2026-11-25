// Animación del sobre sorpresa.
const openButton = document.getElementById('openInvitation');
const introScreen = document.getElementById('introScreen');

openButton.addEventListener('click', () => {
  if (introScreen.classList.contains('opening')) return;

  introScreen.classList.add('opening');
  openButton.disabled = true;

  setTimeout(() => {
    document.body.classList.add('invitation-open');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 2550);
});
