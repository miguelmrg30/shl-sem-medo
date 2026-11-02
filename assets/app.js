'use strict';
// Navegação e FAQ usam recursos nativos; este código controla só as provas.
const proofSlides = Array.from(document.querySelectorAll('[data-proof-slide]'));
const proofPrev = document.querySelector('[data-proof-prev]');
const proofNext = document.querySelector('[data-proof-next]');
const proofCount = document.getElementById('pv-proof-count');
if (proofSlides.length && proofPrev && proofNext && proofCount) {
  let currentProof = 0;
  function renderProof() {
    proofSlides.forEach((slide, index) => { slide.hidden = index !== currentProof; });
    proofPrev.disabled = currentProof === 0;
    proofNext.disabled = currentProof === proofSlides.length - 1;
    proofCount.textContent = `${currentProof + 1} de ${proofSlides.length}`;
  }
  proofPrev.addEventListener('click', () => {
    if (currentProof > 0) { currentProof -= 1; renderProof(); }
  });
  proofNext.addEventListener('click', () => {
    if (currentProof < proofSlides.length - 1) { currentProof += 1; renderProof(); }
  });
  renderProof();
}
