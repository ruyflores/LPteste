/* =========================================================
   AVANTTÁ | Landing Page (JS)
   1. Configuração
   2. Integrações (saveLead, trackConversion)
   3. Interface (header, menu, WhatsApp, cards que viram)
   4. Formulário em etapas + roteamento
   5. Cal.com (carregado só quando o lead chega na agenda)
   6. Animações (GSAP + ScrollTrigger)
   ========================================================= */

/* ---------- 1. Configuração ---------- */
const WHATSAPP_NUMBER = '5561995905615';

const CAL_LINK = 'avantta/avantta';               // evento do Cal.com (usuario/evento)
const CAL_ORIGIN = 'https://cal.com';
const CAL_EMBED_SRC = 'https://app.cal.com/embed/embed.js';
const CAL_NAMESPACE = 'avantta';
// Identificador do campo personalizado de WhatsApp no evento do Cal.com.
// Confira em Cal.com > Event Types > avantta > Advanced > Booking questions.
const CAL_WHATSAPP_FIELD = 'whatsapp';
const BRAND_RED = '#e10600';

// Quem responde "Até R$ 800" vai para o WhatsApp em vez da agenda
const LOW_BUDGET = 'Até R$ 800';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 2. Integrações ----------
   Pontos únicos de saída de dados. Quando o Supabase, o Pixel e o GA
   estiverem prontos, basta completar estas duas funções. */

/**
 * Salva o lead. Hoje só registra no console.
 * Futuro (Supabase):
 *   const { error } = await supabase.from('leads').insert(dados);
 *   if (error) throw error;
 */
async function saveLead(dados) {
  console.info('[Avanttá] Lead recebido:', dados);
  return { ok: true };
}

/**
 * Dispara eventos de conversão.
 *   'Lead'     → formulário enviado
 *   'Schedule' → reunião agendada no Cal.com
 * Futuro:
 *   if (window.fbq) fbq('track', evento, dados);
 *   if (window.gtag) gtag('event', evento === 'Schedule' ? 'schedule_meeting' : 'generate_lead', dados);
 */
function trackConversion(evento, dados = {}) {
  console.info('[Avanttá] Conversão:', evento, dados);
}

/* ---------- 3. Interface ---------- */
const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

// Cada botão diz de qual seção a pessoa clicou
$$('.js-whatsapp').forEach((a) => {
  const secao = a.dataset.section || 'Site';
  a.href = waLink(`Oi, vim pelo site da Avanttá (seção: ${secao}) e quero saber mais sobre a prévia do meu site.`);
  a.target = '_blank';
  a.rel = 'noopener';
});

$('#year').textContent = new Date().getFullYear();

// Header muda ao rolar
const header = $('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Menu mobile
const menuBtn = $('#menuBtn');
const nav = $('#nav');
function toggleMenu(open) {
  const isOpen = open ?? !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', isOpen);
  header.classList.toggle('menu-open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  menuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
menuBtn.addEventListener('click', () => toggleMenu());
$$('a', nav).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
window.addEventListener('keydown', (e) => e.key === 'Escape' && toggleMenu(false));

// WhatsApp flutuante some quando há botões importantes na tela (hero, formulário, chamada final)
const waFloat = $('.wa-float');
if ('IntersectionObserver' in window) {
  const visiveis = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    waFloat.classList.toggle('is-hidden', visiveis.size > 0);
  }, { rootMargin: '0px 0px -15% 0px' });
  $$('[data-hide-wa]').forEach((el) => io.observe(el));
}

// Cards "Qual dessas é a sua situação": viram ao toque (e no hover pelo CSS)
$$('.flip__toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.flip');
    const flipped = card.classList.toggle('is-flipped');
    btn.setAttribute('aria-pressed', String(flipped));
  });
});

/* ---------- 4. Formulário em etapas ---------- */
const form = $('#leadForm');
const steps = $$('.form__step', form);
const TOTAL = steps.length;
const progress = $('.form__progress', form);
const progressBar = $('#progressBar');
const stepLabel = $('#stepLabel');
let current = 1;

function goToStep(n) {
  current = Math.min(Math.max(n, 1), TOTAL);
  steps.forEach((s) => {
    const active = +s.dataset.step === current;
    s.classList.toggle('is-active', active);
    s.classList.remove('has-error');
  });
  progressBar.style.transform = `scaleX(${current / TOTAL})`;
  progress.setAttribute('aria-valuenow', String(current));
  stepLabel.textContent = current === TOTAL ? `Última etapa · ${current} de ${TOTAL}` : `Pergunta ${current} de ${TOTAL}`;

  // mantém o topo do formulário visível no celular
  const top = form.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.6) {
    form.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
  const first = $('input:not([type=hidden])', steps[current - 1]);
  if (first && current === TOTAL && window.matchMedia('(pointer: fine)').matches) first.focus({ preventScroll: true });
}

// Etapas 1 a 3: avança sozinho ao escolher uma opção
$$('[data-auto]', form).forEach((group) => {
  group.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return;
    const step = e.target.closest('.form__step');
    step.classList.remove('has-error');
    const n = +step.dataset.step;
    setTimeout(() => { if (current === n) goToStep(n + 1); }, 280);
  });
});

$$('.js-prev', form).forEach((b) => b.addEventListener('click', () => goToStep(current - 1)));

// Botões dos cards de serviço já deixam a etapa 3 marcada
$$('[data-service]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const radio = $(`input[name="servico"][value="${btn.dataset.service}"]`, form);
    if (radio) radio.checked = true;
  })
);

// Telefone adicional
const outroTel = $('#outroTelefone');
outroTel.addEventListener('change', () => {
  $('#telefoneField').classList.toggle('is-visible', outroTel.checked);
  outroTel.setAttribute('aria-expanded', String(outroTel.checked));
  if (!outroTel.checked) { $('#telefone').value = ''; setError($('#telefone'), false); }
});

// Máscara (00) 00000-0000
const onlyDigits = (v) => v.replace(/\D/g, '');
function maskPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
$$('[data-mask="phone"]').forEach((input) =>
  input.addEventListener('input', () => { input.value = maskPhone(input.value); })
);

// Telefone brasileiro: DDD válido + 8 dígitos (fixo) ou 9 começando com 9 (celular)
function isValidPhone(value) {
  const d = onlyDigits(value);
  if (!/^[1-9][1-9]/.test(d)) return false;
  return d.length === 10 || (d.length === 11 && d[2] === '9');
}
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function setError(input, hasError) {
  const wrap = input.closest('.field');
  if (wrap) wrap.classList.toggle('has-error', hasError);
  input.setAttribute('aria-invalid', String(hasError));
  return !hasError;
}

function validateChoice(stepEl) {
  const radios = $$('input[type=radio]', stepEl);
  const ok = radios.some((r) => r.checked);
  stepEl.classList.toggle('has-error', !ok);
  return ok;
}

function validateContact() {
  const nome = $('#nome');
  const empresa = $('#empresa');
  const whatsapp = $('#whatsapp');
  const telefone = $('#telefone');
  const email = $('#email');
  const lgpd = $('#lgpd');

  const checks = [
    setError(nome, nome.value.trim().length < 2),
    setError(empresa, !empresa.value.trim()),
    setError(whatsapp, !isValidPhone(whatsapp.value)),
    setError(telefone, outroTel.checked && telefone.value.trim() !== '' && !isValidPhone(telefone.value)),
    setError(email, email.value.trim() !== '' && !isValidEmail(email.value.trim())),
    setError(lgpd, !lgpd.checked),
  ];
  const ok = checks.every(Boolean);
  if (!ok) {
    const firstErr = $('.has-error input', steps[TOTAL - 1]);
    if (firstErr) firstErr.focus();
  }
  return ok;
}

// Limpa o erro assim que a pessoa corrige
form.addEventListener('input', (e) => {
  const wrap = e.target.closest('.field');
  if (wrap && wrap.classList.contains('has-error')) { wrap.classList.remove('has-error'); e.target.setAttribute('aria-invalid', 'false'); }
});
form.addEventListener('change', (e) => {
  if (e.target.id === 'lgpd' && e.target.checked) setError(e.target, false);
});

// Enter nos campos de texto não envia antes da hora em etapas anteriores
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'link') { e.preventDefault(); }
});

function collectData() {
  const fd = new FormData(form);
  const params = new URLSearchParams(location.search);
  return {
    investimento: fd.get('investimento') || '',
    urgencia: fd.get('urgencia') || '',
    servico: fd.get('servico') || '',
    link: (fd.get('link') || '').trim(),
    nome: (fd.get('nome') || '').trim(),
    empresa: (fd.get('empresa') || '').trim(),
    whatsapp: fd.get('whatsapp') || '',
    telefone: outroTel.checked ? (fd.get('telefone') || '') : '',
    email: (fd.get('email') || '').trim(),
    aceite_contato: $('#lgpd').checked,
    rota: fd.get('investimento') === LOW_BUDGET ? 'whatsapp' : 'agenda',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    pagina: location.href.split('#')[0],
    criado_em: new Date().toISOString(),
  };
}

function leadSummary(d) {
  return [
    `Investimento: ${d.investimento}`,
    `Urgência: ${d.urgencia}`,
    `Preciso de: ${d.servico}`,
    d.link && `Site ou Instagram: ${d.link}`,
    `Empresa: ${d.empresa}`,
    `WhatsApp: ${d.whatsapp}`,
    d.telefone && `Outro telefone: ${d.telefone}`,
    d.email && `E-mail: ${d.email}`,
  ].filter(Boolean);
}

function showPanel(id) {
  form.hidden = true;
  $$('.funnel .panel').forEach((p) => { p.hidden = p.id !== id; });
  const panel = $(`#${id}`);
  panel.focus({ preventScroll: true });
  panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  return panel;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // confere todas as etapas; se faltar algo, volta para ela
  for (let n = 1; n < TOTAL; n++) {
    if (!validateChoice(steps[n - 1])) { goToStep(n); steps[n - 1].classList.add('has-error'); return; }
  }
  if (!validateContact()) return;

  const dados = collectData();
  try { await saveLead(dados); } catch (err) { console.warn('[Avanttá] Falha ao salvar o lead:', err); }
  trackConversion('Lead', { servico: dados.servico, investimento: dados.investimento });

  if (dados.investimento === LOW_BUDGET) {
    const msg = [`Oi, sou ${dados.nome} e vim pelo formulário do site da Avanttá.`, '', ...leadSummary(dados)].join('\n');
    $('#thanksWa').href = waLink(msg);
    $$('[data-fill="nome"]').forEach((el) => { el.textContent = dados.nome.split(' ')[0]; });
    showPanel('panelThanks');
  } else {
    showPanel('panelCal');
    loadCal(dados);
  }
});

/* ---------- 5. Cal.com ---------- */
let calLoaded = false;
let booked = false;

function onBookingSuccess(payload) {
  if (booked) return;
  booked = true;
  trackConversion('Schedule', { origem: 'cal.com', detalhe: payload && payload.detail ? payload.detail.data : null });
  showPanel('panelBooked');
}

function loadCal(dados) {
  const phoneE164 = `+55${onlyDigits(dados.whatsapp)}`;
  const notes = leadSummary(dados).join(' | ');

  // Link alternativo (abre a página do Cal.com com os mesmos dados)
  const fallback = new URL(`${CAL_ORIGIN}/${CAL_LINK}`);
  fallback.searchParams.set('name', dados.nome);
  if (dados.email) fallback.searchParams.set('email', dados.email);
  fallback.searchParams.set(CAL_WHATSAPP_FIELD, phoneE164);
  fallback.searchParams.set('notes', notes);
  $('#calFallback').href = fallback.toString();

  if (calLoaded) return;
  calLoaded = true;

  /* Snippet oficial do embed do Cal.com (cal.com/docs, "Embed > Inline") */
  (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, CAL_EMBED_SRC, 'init');

  const Cal = window.Cal;
  Cal('init', CAL_NAMESPACE, { origin: CAL_ORIGIN });
  const cal = Cal.ns[CAL_NAMESPACE];

  const config = { layout: 'month_view', theme: 'dark', name: dados.nome, notes, [CAL_WHATSAPP_FIELD]: phoneE164 };
  if (dados.email) config.email = dados.email;

  cal('inline', { elementOrSelector: '#calEmbed', calLink: CAL_LINK, config });
  cal('ui', {
    theme: 'dark',
    cssVarsPerTheme: { light: { 'cal-brand': BRAND_RED }, dark: { 'cal-brand': BRAND_RED } },
    hideEventTypeDetails: false,
    layout: 'month_view',
  });

  // Evento pedido: bookingSuccessful. Versões novas do embed também emitem bookingSuccessfulV2.
  cal('on', { action: 'bookingSuccessful', callback: onBookingSuccess });
  cal('on', { action: 'bookingSuccessfulV2', callback: onBookingSuccess });

  // Se a agenda não carregar, destaca o link alternativo
  let ready = false;
  cal('on', { action: 'linkReady', callback: () => { ready = true; const l = $('.cal-embed__loading'); if (l) l.remove(); } });
  const script = $(`script[src="${CAL_EMBED_SRC}"]`);
  const showFallback = () => {
    if (ready) return;
    $('#calEmbed').innerHTML = '<p class="cal-embed__loading">Não conseguimos abrir a agenda aqui. Use o link abaixo para escolher o seu horário.</p>';
  };
  if (script) script.addEventListener('error', showFallback);
  setTimeout(showFallback, 15000);
}

/* ---------- 6. Animações ---------- */
function splitWords(el) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
          words.push(span);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  return words;
}

function animateCounter(el) {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || '';
  const obj = { v: 0 };
  el.textContent = `${prefix}0`;
  window.gsap.to(obj, {
    v: target, duration: 1.6, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => { el.textContent = prefix + Math.round(obj.v); },
  });
}

function initTilt(gsap) {
  $$('.tilt').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.45, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 900 });
    const tiltTo = (x, y) => {
      const r = el.getBoundingClientRect();
      const px = (x - r.left) / r.width - 0.5;
      const py = (y - r.top) / r.height - 0.5;
      ry(px * 8);
      rx(-py * 8);
    };
    const reset = () => { rx(0); ry(0); };
    el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') tiltTo(e.clientX, e.clientY); });
    el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') tiltTo(e.clientX, e.clientY); });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, reset));
  });
}

// devolve o controle ao navegador entre fases (evita tarefas longas no carregamento)
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

async function initAnimations() {
  const { gsap, ScrollTrigger } = window;
  if (reducedMotion) return;
  if (!gsap || !ScrollTrigger) {
    document.documentElement.classList.add('no-gsap');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Fase 1: hero, o mockup "se monta" em camadas
  const layers = $$('.hero__visual .layer');
  const floats = $$('.hero__visual .float-card');
  gsap.set(layers, { y: 18 });
  gsap.timeline({ delay: 0.2, scrollTrigger: { trigger: '.hero__visual', start: 'top 90%', once: true } })
    .to(layers, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 })
    .add(() => {
      floats.forEach((f, i) => gsap.to(f, { y: -8, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
  gsap.to('.mock-wrap', {
    yPercent: -6, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  await yieldToMain();

  // Fase 2: blocos que entram ao rolar
  const reveals = $$('.reveal');
  gsap.set(reveals, { opacity: 0, y: 26 });
  ScrollTrigger.batch(reveals, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });

  await yieldToMain();

  // Fase 3: títulos revelados palavra por palavra.
  // Cada título só é quebrado em palavras quando chega perto da tela.
  const prepareTitle = (el) => {
    const words = splitWords(el);
    gsap.set(words, { opacity: 0, yPercent: 45 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { opacity: 1, yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.045 }),
    });
  };
  const titles = $$('.split');
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        near.unobserve(e.target);
        prepareTitle(e.target);
      });
    }, { rootMargin: '0px 0px 400px 0px' });
    titles.forEach((el) => near.observe(el));
  }

  await yieldToMain();

  // Fase 4: linha vermelha entre os passos, contador e inclinação dos cards
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    gsap.fromTo('.steps__line', { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
    });
  });
  mm.add('(max-width: 640px)', () => {
    gsap.fromTo('.steps__line', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
    });
  });

  $$('[data-count]').forEach(animateCounter);
  initTilt(gsap);
}

initAnimations();
