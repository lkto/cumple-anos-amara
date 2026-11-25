// Carrusel de fotos de la historia.
const galleryCarousel = document.querySelector('.gallery-carousel');

if (galleryCarousel) {
  const track = galleryCarousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const dotsContainer = galleryCarousel.querySelector('.carousel-dots');
  const prevButton = galleryCarousel.querySelector('.carousel-btn.prev');
  const nextButton = galleryCarousel.querySelector('.carousel-btn.next');

  let currentIndex = 0;
  let autoPlayId;

  function renderCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex);
    });
  }

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (index === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Ir a la foto ${index + 1}`);
    dot.addEventListener('click', () => {
      currentIndex = index;
      renderCarousel();
      clearInterval(autoPlayId);
      autoPlayId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        renderCarousel();
      }, 4000);
    });
    dotsContainer.appendChild(dot);
  });

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    renderCarousel();
    clearInterval(autoPlayId);
    autoPlayId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      renderCarousel();
    }, 4000);
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    renderCarousel();
    clearInterval(autoPlayId);
    autoPlayId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      renderCarousel();
    }, 4000);
  });

  galleryCarousel.addEventListener('mouseenter', () => clearInterval(autoPlayId));
  galleryCarousel.addEventListener('mouseleave', () => {
    autoPlayId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      renderCarousel();
    }, 4000);
  });

  renderCarousel();
  autoPlayId = setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    renderCarousel();
  }, 4000);
}
