/* =========================================================
   Reveal: entrada suave das seções ao rolar a página.
   Equivale a um componente <Reveal> reutilizável, em JS puro.

   Uso no HTML:  <div class="reveal" data-delay="120">...</div>  (atraso em ms, opcional)
   Uso no JS:    window.reveal(elementoOuSeletor, { y, duration, delay })

   - fade + subida de 32px, uma vez só, quando 15% do bloco entra na tela
   - 700ms (mesmo ritmo do hero de referência)
   - sem data-delay, irmãos entram em cascata curta
   - com prefers-reduced-motion: nada se move, o conteúdo só aparece
   - depende de window.Motion (assets/vendor/motion.min.js); sem ele,
     o conteúdo aparece normalmente
   ========================================================= */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = [0.22, 1, 0.36, 1];

  function toList(targets) {
    if (typeof targets === 'string') return [...document.querySelectorAll(targets)];
    if (targets instanceof Element) return [targets];
    return [...targets];
  }

  function reveal(targets, { y = 32, duration = 0.7, delay = 0, stagger = 0.07 } = {}) {
    const M = window.Motion;
    const els = toList(targets);
    if (reduce || !M) return;

    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;

      const stop = M.inView(el, () => {
        stop();
        // irmãos que entram juntos aparecem em cascata curta
        let extra;
        if (el.dataset.delay) {
          extra = (+el.dataset.delay || 0) / 1000;
        } else {
          const siblings = [...el.parentElement.children].filter((s) => s.classList.contains('reveal'));
          extra = Math.min(Math.max(0, siblings.indexOf(el)), 5) * stagger;
        }
        M.animate(el, { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] }, {
          duration,
          delay: delay + extra,
          ease: EASE,
        });
      }, { amount: 0.15 });
    });
  }

  window.reveal = reveal;
})();
