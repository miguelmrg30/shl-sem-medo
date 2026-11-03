'use strict';
// Três relatos originais, com vizinhos visíveis e rotação que pode ser pausada.
const proofCarousel = document.querySelector('.pv-proofcarousel');
if (proofCarousel) {
  const slides = Array.from(proofCarousel.querySelectorAll('[data-proof-slide]'));
  const stage = proofCarousel.querySelector('.pv-proofstage');
  const prev = proofCarousel.querySelector('[data-proof-prev]');
  const next = proofCarousel.querySelector('[data-proof-next]');
  const pause = proofCarousel.querySelector('[data-proof-pause]');
  const count = proofCarousel.querySelector('#pv-proof-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let visible = false;
  let timer;
  let touchStart;

  function measureStage() {
    const height = Math.ceil(Math.max(...slides.map(slide => slide.offsetHeight)) + 28);
    if (height > 28 && stage.style.height !== `${height}px`) stage.style.height = `${height}px`;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (!paused && !hovering && !focused && visible && !document.hidden) {
      timer = window.setTimeout(() => change(1, false), 9000);
    }
  }

  function render(manual = false) {
    slides.forEach((slide, index) => {
      const relative = (index - current + slides.length) % slides.length;
      slide.classList.toggle('is-current', relative === 0);
      slide.style.setProperty('--proof-offset', relative === 1 ? '86%' : '-86%');
    });
    // A rotação automática não interrompe a leitura por leitor de tela.
    count.setAttribute('aria-live', manual ? 'polite' : 'off');
    count.textContent = `${current + 1} de ${slides.length}`;
    pause.textContent = paused ? 'Retomar rotação' : 'Pausar rotação';
    pause.setAttribute('aria-pressed', String(paused));
    measureStage();
    schedule();
  }

  function change(direction, manual = true) {
    current = (current + direction + slides.length) % slides.length;
    render(manual);
  }

  prev.addEventListener('click', () => change(-1));
  next.addEventListener('click', () => change(1));
  pause.addEventListener('click', () => { paused = !paused; render(); });
  slides.forEach((slide, index) => slide.addEventListener('click', () => {
    if (index !== current) { current = index; render(true); }
  }));
  proofCarousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovering = true; schedule(); }
  });
  proofCarousel.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  proofCarousel.addEventListener('focusin', () => { focused = true; schedule(); });
  proofCarousel.addEventListener('focusout', event => {
    focused = proofCarousel.contains(event.relatedTarget);
    schedule();
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      change(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  stage.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
    window.clearTimeout(timer);
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) change(dx < 0 ? 1 : -1);
    else schedule();
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = undefined; schedule(); }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) paused = true; render(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.3 }).observe(stage);
  } else visible = true;
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measureStage);
    slides.forEach(slide => observer.observe(slide));
  } else window.addEventListener('resize', measureStage);
  proofCarousel.querySelectorAll('img').forEach(img => img.addEventListener('load', measureStage));
  render();
}
