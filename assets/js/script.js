/* =========================================================
   AVANTTÁ | Landing Page (JS)
   1. Configuração
   2. Integrações (saveLead, trackConversion)
   3. Interface (header, menu, WhatsApp, cards que viram)
   4. Formulário em etapas + roteamento
   5. Cal.com (carregado só quando o lead chega na agenda)
   6. Animações (Motion: assets/vendor/motion.min.js + assets/js/reveal.js)
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
const EASE = [0.22, 1, 0.36, 1]; // curva padrão das animações

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

// "Qual é a sua situação?": abas acessíveis (setas do teclado + clique)
const sitTabs = $$('.sit__tab');
function selectSituation(tab, focus = false) {
  sitTabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = $(`#${t.getAttribute('aria-controls')}`);
    if (on && panel.hidden) {
      panel.hidden = false;
      if (window.Motion && !reducedMotion) {
        window.Motion.animate(panel, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
      }
    } else if (!on) {
      panel.hidden = true;
    }
  });
  if (focus) tab.focus();
}
sitTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectSituation(tab));
  tab.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) {
      e.preventDefault();
      selectSituation(sitTabs[(i + keys[e.key] + sitTabs.length) % sitTabs.length], true);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      selectSituation(sitTabs[e.key === 'Home' ? 0 : sitTabs.length - 1], true);
    }
  });
});

// Comparação animada "site comum x site Avanttá"
// Cada etapa entra a cada 0,6s; no fim, o contador sobe. No celular aparece
// um aparelho por vez: o comum toca primeiro e troca uma vez para o da Avanttá.
(function initRace() {
  const race = $('#comparacao');
  if (!race) return;
  const stage = $('.race__stage', race);
  const phones = { comum: $('[data-phone="comum"]', race), avantta: $('[data-phone="avantta"]', race) };
  const switches = $$('.race__sw', race);
  const mobile = window.matchMedia('(max-width: 760px)');
  const STEP = 0.6;
  let timers = [];
  let controls = [];

  const stopAll = () => {
    timers.forEach(clearTimeout);
    timers = [];
    controls.forEach((c) => c && c.stop && c.stop());
    controls = [];
  };
  const show = (which) => {
    stage.dataset.active = which;
    switches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.show === which)));
  };
  const finalState = (phone) => {
    $$('.pstep', phone).forEach((s) => { s.style.opacity = ''; s.style.transform = ''; });
    const count = $('.phone__count', phone);
    count.style.opacity = '';
    const num = $('strong', count);
    num.textContent = num.dataset.to;
  };
  // devolve quanto tempo (s) a sequência deste aparelho leva
  const playPhone = (phone) => {
    const M = window.Motion;
    const steps = $$('.pstep', phone);
    const count = $('.phone__count', phone);
    const num = $('strong', count);
    steps.forEach((s) => { s.style.opacity = '0'; s.style.transform = 'translateY(10px)'; });
    count.style.opacity = '0';
    num.textContent = '0';
    steps.forEach((s, i) => {
      controls.push(M.animate(s, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.45, delay: 0.2 + i * STEP, ease: EASE }));
    });
    const end = 0.2 + steps.length * STEP;
    controls.push(M.animate(count, { opacity: [0, 1] }, { duration: 0.4, delay: end }));
    timers.push(setTimeout(() => {
      controls.push(M.animate(0, +num.dataset.to, { duration: 1.2, ease: EASE, onUpdate: (v) => { num.textContent = Math.round(v); } }));
    }, end * 1000));
    return end + 1.2;
  };
  const canAnimate = () => window.Motion && !reducedMotion;

  const play = () => {
    stopAll();
    if (!canAnimate()) { finalState(phones.comum); finalState(phones.avantta); return; }
    if (mobile.matches) {
      show('comum');
      finalState(phones.avantta);
      const dur = playPhone(phones.comum);
      timers.push(setTimeout(() => { show('avantta'); playPhone(phones.avantta); }, (dur + 1) * 1000));
    } else {
      playPhone(phones.comum);
      playPhone(phones.avantta);
    }
  };

  // troca manual (celular): mostra o escolhido e toca só ele
  switches.forEach((b) => b.addEventListener('click', () => {
    stopAll();
    finalState(phones.comum);
    finalState(phones.avantta);
    show(b.dataset.show);
    if (canAnimate()) playPhone(phones[b.dataset.show]);
  }));
  $('#raceReplay').addEventListener('click', play);

  if (canAnimate()) {
    // esconde antes de entrar na tela e toca uma vez quando aparece
    $$('.pstep, .phone__count', race).forEach((el) => { el.style.opacity = '0'; });
    const stop = window.Motion.inView(stage, () => { stop(); play(); }, { amount: 0.3 });
  }
})();

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

/* ---------- 6. Animações ----------
   Motion (motion.dev) em JS puro. Regras: só transform e opacity,
   400 a 700ms, e nada para quem pediu movimento reduzido. */
function animateCounter(M, el) {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || '';
  el.textContent = `${prefix}0`;
  const stop = M.inView(el, () => {
    stop();
    M.animate(0, target, { duration: 1.4, ease: EASE, onUpdate: (v) => { el.textContent = prefix + Math.round(v); } });
  }, { amount: 0.6 });
}

// Inclinação leve dos cards (mouse e toque), via CSS: transição curta no transform
function initTilt() {
  $$('.tilt').forEach((el) => {
    const tiltTo = (x, y) => {
      const r = el.getBoundingClientRect();
      const px = (x - r.left) / r.width - 0.5;
      const py = (y - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') tiltTo(e.clientX, e.clientY); });
    el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') tiltTo(e.clientX, e.clientY); });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, reset));
  });
}

// devolve o controle ao navegador entre fases (evita tarefas longas no carregamento)
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

async function initAnimations() {
  const M = window.Motion;
  if (reducedMotion) return;
  if (!M) { document.documentElement.classList.add('no-motion'); return; }

  await yieldToMain();

  // Seções entram ao rolar (componente reutilizável em assets/js/reveal.js)
  window.reveal('.reveal');

  await yieldToMain();

  // Linha vermelha que se desenha entre os passos, ligada à rolagem
  const line = $('.steps__line');
  const stepsEl = $('.steps');
  if (line && stepsEl) {
    const desktop = window.matchMedia('(min-width: 961px)').matches;
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    if (desktop || mobile) {
      const prop = desktop ? 'scaleX' : 'scaleY';
      M.scroll(M.animate(line, { transform: [`${prop}(0)`, `${prop}(1)`] }, { ease: 'linear' }), {
        target: stepsEl,
        offset: desktop ? ['start 80%', 'end 55%'] : ['start 75%', 'end 60%'],
      });
    }
  }

  $$('[data-count]').forEach((el) => animateCounter(M, el));
  initTilt();
}

initAnimations();
