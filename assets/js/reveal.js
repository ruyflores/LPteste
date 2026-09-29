/* =========================================================
   Reveal: entrada suave das seções ao rolar a página.
   Equivale a um componente <Reveal> reutilizável, em JS puro.

   Uso no HTML:  <div class="reveal">...</div>
   Uso no JS:    window.reveal(elementoOuSeletor, { y, duration, delay })

   - fade + leve subida, uma vez só (quando entra na tela)
   - 600ms por padrão (faixa combinada: 400 a 700ms)
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

  function reveal(targets, { y = 16, duration = 0.6, delay = 0, stagger = 0.07 } = {}) {
    const M = window.Motion;
    const els = toList(targets);
    if (reduce || !M) return;

    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;

      const stop = M.inView(el, () => {
        stop();
        // irmãos que entram juntos aparecem em cascata curta
        const siblings = [...el.parentElement.children].filter((s) => s.classList.contains('reveal'));
        const i = Math.max(0, siblings.indexOf(el));
        M.animate(el, { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] }, {
          duration,
          delay: delay + Math.min(i, 5) * stagger,
          ease: EASE,
        });
      }, { amount: 0.15 });
    });
  }

  window.reveal = reveal;
})();
