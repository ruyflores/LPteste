/* =========================================================
   Vídeo guiado pela rolagem (adaptado do hero de referência NovaAI).

   Camadas (de baixo para cima): poster → <video> → <canvas> → tinta.
   - A rolagem da cena de abertura (#cena) vira a posição no vídeo:
     progresso = scrollY / (fim da cena − altura da tela), de 0 a 1,
     suavizado a cada quadro: suave += (alvo − suave) * 0.12
   - Caminho principal: um vídeo fora da tela é "fatiado" em quadros
     (ImageBitmap) e o canvas desenha o quadro do progresso atual.
   - Enquanto os quadros não ficam prontos: o <video> visível é
     posicionado no tempo certo (seek), sem tocar sozinho.
   - Identidade Avanttá: os quadros são convertidos para preto e branco
     e a camada .scroll-video__tint aplica o vermelho da marca.

   Economia: começa só depois do carregamento da página; não roda com
   prefers-reduced-motion nem com economia de dados; no celular guarda
   menos quadros e menores (memória).
   ========================================================= */
(function () {
  const root = document.getElementById('scrollVideo');
  const scene = document.getElementById('cena');
  if (!root || !scene) return;

  const src = root.dataset.src;
  const posterSrc = root.dataset.poster;
  const poster = root.querySelector('.scroll-video__poster');
  const video = root.querySelector('.scroll-video__video');
  const canvas = root.querySelector('.scroll-video__canvas');
  const ctx = canvas.getContext('2d');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const small = window.matchMedia('(max-width: 760px)').matches;

  const MAX_FRAMES = small ? 48 : 90;
  const MAX_WIDTH = small ? 640 : 960;
  const GRADE = 'grayscale(1) contrast(1.12) brightness(0.92)';

  if (posterSrc) {
    poster.src = posterSrc;
    poster.hidden = false;
  }
  if (!src || reduce || saveData) return;

  let frames = [];
  let framesReady = false;
  let hasFrame = false;
  let target = 0;
  let smoothed = 0;
  let lastDrawn = -1;
  let raf = 0;
  let inScene = true;

  const progress = () => {
    const end = scene.offsetTop + scene.offsetHeight - window.innerHeight;
    return end > 0 ? Math.min(Math.max(window.scrollY / end, 0), 1) : 0;
  };

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      lastDrawn = -1;
    }
  }

  // object-cover: escala pelo maior lado e centraliza
  function drawCover(img, iw, ih) {
    const cw = canvas.width;
    const ch = canvas.height;
    const s = Math.max(cw / iw, ch / ih);
    const w = iw * s;
    const h = ih * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function setState() {
    root.classList.toggle('has-frame', hasFrame);
    root.classList.toggle('frames-ready', framesReady);
  }

  function tick() {
    raf = 0;
    smoothed += (target - smoothed) * 0.12;
    if (Math.abs(target - smoothed) < 0.0005) smoothed = target;

    if (framesReady) {
      const i = Math.round(smoothed * (frames.length - 1));
      if (i !== lastDrawn) {
        drawCover(frames[i], frames[i].width, frames[i].height);
        lastDrawn = i;
      }
    } else if (hasFrame && isFinite(video.duration) && video.duration > 0) {
      const t = smoothed * (video.duration - 0.05);
      if (Math.abs(video.currentTime - t) > 0.04 && !video.seeking) video.currentTime = t;
    }
    if (smoothed !== target) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && inScene) raf = requestAnimationFrame(tick); };

  function onScroll() {
    target = progress();
    kick();
  }

  const once = (el, ev) => new Promise((res, rej) => {
    const ok = () => { el.removeEventListener('error', bad); res(); };
    const bad = () => { el.removeEventListener(ev, ok); rej(new Error('vídeo indisponível')); };
    el.addEventListener(ev, ok, { once: true });
    el.addEventListener('error', bad, { once: true });
  });
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  // Alguns arquivos não trazem a duração no cabeçalho (Infinity):
  // pula para o fim uma vez para o navegador descobrir.
  async function ensureDuration(v) {
    if (isFinite(v.duration) && v.duration > 0) return;
    v.currentTime = 1e7;
    await new Promise((r) => {
      const done = () => { if (isFinite(v.duration)) { v.removeEventListener('timeupdate', done); r(); } };
      v.addEventListener('timeupdate', done);
      setTimeout(r, 3000);
    });
    v.currentTime = 0;
  }

  // Fatia o vídeo em quadros já recoloridos
  async function buildFrames() {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = src;
    await once(v, 'loadeddata');
    await ensureDuration(v);
    const dur = v.duration;
    if (!isFinite(dur) || dur <= 0) throw new Error('sem duração');
    const n = Math.max(24, Math.min(MAX_FRAMES, Math.floor(dur * 12)));
    const w = Math.min(MAX_WIDTH, v.videoWidth);
    const h = Math.round(w * (v.videoHeight / v.videoWidth));
    const work = document.createElement('canvas');
    work.width = w;
    work.height = h;
    const wctx = work.getContext('2d');
    const out = [];
    for (let i = 0; i < n; i++) {
      v.currentTime = (i / (n - 1)) * Math.max(dur - 0.05, 0);
      await once(v, 'seeked');
      wctx.filter = GRADE;
      wctx.drawImage(v, 0, 0, w, h);
      out.push(await createImageBitmap(work));
      await pause(0); // devolve o controle ao navegador a cada quadro (sem tarefas longas)
    }
    v.removeAttribute('src');
    v.load();
    return out;
  }

  async function start() {
    sizeCanvas();
    window.addEventListener('resize', () => { sizeCanvas(); kick(); }, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    new IntersectionObserver(([e]) => {
      inScene = e.isIntersecting;
      root.classList.toggle('is-off', !inScene);
      if (inScene) onScroll();
    }).observe(scene);

    video.src = src;
    video.preload = 'auto';
    try {
      await once(video, 'loadeddata');
    } catch (e) {
      return; // sem vídeo: fica o fundo em CSS (e o poster, se houver)
    }
    await ensureDuration(video);
    hasFrame = true;
    setState();
    onScroll();

    await pause(300);
    try {
      frames = await buildFrames();
      framesReady = frames.length > 1;
      lastDrawn = -1;
      setState();
      onScroll();
      video.removeAttribute('src');
      video.load();
    } catch (e) {
      // segue com o caminho de reserva (seek no vídeo visível)
    }
  }

  const go = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
    else setTimeout(start, 400);
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
})();
