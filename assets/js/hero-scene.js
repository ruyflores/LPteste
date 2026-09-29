/* =========================================================
   Cena de abertura guiada pela rolagem (a "continuação" da arte do hero).

   Linha do tempo presa às posições reais da cena (#cena):
     - topo → "Sua situação" começando a subir: a câmera aproxima do celular
       (e o texto do hero sobe e some no primeiro meio-tela)
     - "Sua situação" subindo: a imagem se divide em faixas que deslizam em
       sentidos alternados (efeito 06 "Faixas que se montam", ao contrário)
     - depois: o fundo some e o resto da página sobe como cortina
   + luz vermelha que segue o mouse no desktop (efeito 12 "Luz que segue o mouse").

   Só transform e opacity. Sem nada disso com prefers-reduced-motion.
   As faixas são criadas só na primeira rolagem, a partir da imagem já
   carregada (o <img> original continua sendo o maior elemento da tela).
   ========================================================= */
(function () {
  const bg = document.getElementById('heroBg');
  const scene = document.getElementById('cena');
  const copy = document.getElementById('heroCopy');
  if (!bg || !scene) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const cam = bg.querySelector('.hero-bg__cam');
  const img = bg.querySelector('.hero-bg__img');
  const stripsBox = bg.querySelector('.hero-bg__strips');
  const light = bg.querySelector('.hero-bg__light');
  const small = window.matchMedia('(max-width: 760px)').matches;
  const N = small ? 5 : 8;

  const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  let strips = [];
  let stripsOn = false;

  // Monta as faixas a partir da imagem que o navegador escolheu (currentSrc).
  // Cada faixa é uma janela sobre a imagem inteira, alinhada em pixels.
  function layoutStrips() {
    const W = stripsBox.clientWidth;
    const w = W / N;
    strips.forEach((s, i) => {
      s.style.left = `${Math.floor(i * w)}px`;
      s.style.width = `${Math.ceil(w) + 1}px`;
      s.firstChild.style.width = `${W}px`;
      s.firstChild.style.left = `${-Math.floor(i * w)}px`;
    });
  }
  function buildStrips() {
    if (strips.length || !img.currentSrc) return;
    const url = `url("${img.currentSrc}")`;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('div');
      s.className = 'hero-bg__strip';
      const inner = document.createElement('div');
      inner.className = 'hero-bg__strip-img';
      inner.style.backgroundImage = url;
      s.appendChild(inner);
      stripsBox.appendChild(s);
      strips.push(s);
    }
    layoutStrips();
  }

  const situ = document.getElementById('situacao');
  // Linha do tempo presa às posições reais (e não a um percentual fixo):
  //   aproximação: do topo até o "Sua situação" começar a subir
  //   faixas: enquanto o "Sua situação" sobe de 100% para 30% da tela
  const progress = () => {
    const vh = window.innerHeight;
    const situTop = situ ? situ.getBoundingClientRect().top : vh;
    const zoomSpan = Math.max(1, (situ ? situ.offsetTop : vh) - vh);
    return {
      zoom: limitar(window.scrollY / zoomSpan, 0, 1),
      copy: limitar(window.scrollY / (vh * 0.55), 0, 1),
      split: limitar((vh - situTop) / (vh * 0.7), 0, 1),
    };
  };

  let target = { zoom: 0, copy: 0, split: 0 };
  let current = { zoom: 0, copy: 0, split: 0 };
  let raf = 0;
  let visible = true;

  function render(p) {
    // câmera: aproxima do celular
    const zoom = easeOut(p.zoom);
    cam.style.transform = `scale(${1 + zoom * (small ? 0.16 : 0.22)}) translate3d(${zoom * (small ? 0 : -3)}%, ${zoom * -2}%, 0)`;

    // texto do hero sobe e some
    if (copy) {
      copy.style.opacity = String(1 - p.copy);
      copy.style.transform = `translate3d(0, ${-p.copy * 60}px, 0)`;
    }

    // faixas: a imagem se abre para o "Sua situação" passar
    const open = p.split > 0.001;
    if (open && !stripsOn) {
      bg.classList.add('is-split'); // mostra o contêiner antes de medir as faixas
      buildStrips();
      layoutStrips();
      if (strips.length) stripsOn = true;
      else bg.classList.remove('is-split');
    } else if (!open && stripsOn) {
      bg.classList.remove('is-split');
      stripsOn = false;
    }
    if (stripsOn) {
      strips.forEach((s, i) => {
        const atraso = i * 0.05;
        const f = easeOut(limitar((p.split - atraso) / (1 - atraso * 1.5), 0, 1));
        const sentido = i % 2 ? 1 : -1;
        s.style.transform = `translate3d(0, ${sentido * f * 110}%, 0)`;
        s.style.opacity = String(1 - f * 0.85);
      });
    }
  }

  function tick() {
    raf = 0;
    let moving = false;
    for (const k in target) {
      current[k] = lerp(current[k], target[k], 0.18);
      if (Math.abs(target[k] - current[k]) < 0.0005) current[k] = target[k];
      else moving = true;
    }
    render(current);
    if (moving) raf = requestAnimationFrame(tick);
  }
  const onScroll = () => {
    target = progress();
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { layoutStrips(); onScroll(); }, { passive: true });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    bg.classList.toggle('is-off', !visible);
    if (visible) onScroll();
  }).observe(scene);
  onScroll();

  // Luz que segue o mouse (só com mouse de verdade; o brilho chega com atraso)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && light) {
    const alvo = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.45 };
    const atual = { x: alvo.x, y: alvo.y };
    let laco = 0;
    const passo = () => {
      atual.x = lerp(atual.x, alvo.x, 0.08);
      atual.y = lerp(atual.y, alvo.y, 0.08);
      light.style.transform = `translate3d(${atual.x - 300}px, ${atual.y - 300}px, 0)`;
      laco = Math.abs(atual.x - alvo.x) + Math.abs(atual.y - alvo.y) > 0.5 && visible ? requestAnimationFrame(passo) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      if (!visible) return;
      alvo.x = e.clientX;
      alvo.y = e.clientY;
      bg.classList.add('has-light');
      if (!laco) laco = requestAnimationFrame(passo);
    }, { passive: true });
  }
})();
