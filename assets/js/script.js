/* =========================================================
   AVANTTÁ | Landing Page (JS)
   1. Configuração
   2. Integrações (saveLead, trackConversion)
   3. Interface (menu, vídeo do hero, WhatsApp, sanfonado, comparação)
   4. Formulário em etapas + roteamento
   5. Cal.com (carregado só quando o lead chega na agenda)
   6. Animações (Motion + Lenis: assets/vendor/motion.min.js, assets/js/reveal.js)
   A cena de abertura (arte do hero guiada pela rolagem) fica em assets/js/hero-scene.js
   ========================================================= */

/* ---------- 1. Configuração ---------- */
const WHATSAPP_NUMBER = '5561995905615';

const CAL_LINK = 'avantta/avantta';               // evento do Cal.com (usuario/evento)
const CAL_ORIGIN = 'https://cal.com';
const CAL_EMBED_SRC = 'https://app.cal.com/embed/embed.js';
const CAL_NAMESPACE = 'avantta';
// Perguntas do evento no Cal.com que recebem dados já preenchidos.
// A chave é o identificador da pergunta em Cal.com > Event Types > avantta >
// Advanced > Booking Questions. Mandar um identificador que não existe não
// quebra nada: o Cal.com só ignora. Por isso o telefone vai nos dois nomes
// mais comuns até você confirmar qual é o seu.
const CAL_PHONE_FIELDS = ['attendeePhoneNumber', 'whatsapp'];
const CAL_COMPANY_FIELD = 'empresa';
const BRAND_RED = '#e10600';

// Quem responde "Até R$ 800" vai para o WhatsApp em vez da agenda
const LOW_BUDGET = 'Até R$ 800';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = [0.22, 1, 0.36, 1]; // curva padrão das animações

/* ---------- 2. Integrações ----------
   Pontos únicos de saída de dados. Hoje não existe destino externo (nem
   planilha, nem Pixel, nem GA): as duas funções só registram no console.
   Quando o Supabase, o Pixel e o GA estiverem prontos, é só completar aqui. */

/**
 * Salva o contato. É chamada duas vezes com o mesmo lead_id:
 *   etapa "contatos"  → assim que a pessoa passa do passo 1 (ninguém se perde)
 *   etapa "completo"  → ao terminar o formulário
 * Futuro (Supabase): upsert pelo lead_id
 *   await supabase.from('leads').upsert(dados, { onConflict: 'lead_id' });
 */
async function saveLead(dados) {
  console.info('[Avanttá] Lead salvo:', dados);
  return { ok: true };
}

/**
 * Eventos de conversão. Cada um dispara uma vez por visita.
 *   'Lead'     → contatos enviados (fim do passo 1)
 *   'Schedule' → conversa agendada no Cal.com
 * Futuro:
 *   if (window.fbq) fbq('track', evento, dados);
 *   if (window.gtag) gtag('event', evento === 'Schedule' ? 'schedule_meeting' : 'generate_lead', dados);
 */
const tracked = new Set();
function trackConversion(evento, dados = {}) {
  if (tracked.has(evento)) return;
  tracked.add(evento);
  console.info('[Avanttá] Conversão:', evento, dados);
}

/* Origem da visita: capturada ao entrar e guardada durante a visita
   (sessionStorage), para saber de qual anúncio veio cada contato. */
const ORIGEM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
const origem = (() => {
  const KEY = 'avantta_origem';
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { /* sem storage */ }
  const params = new URLSearchParams(location.search);
  const now = {};
  ORIGEM_KEYS.forEach((k) => { if (params.get(k)) now[k] = params.get(k); });
  // mantém a primeira origem da visita; parâmetros novos completam o que faltar
  const data = Object.assign(
    { pagina_origem: location.href.split('#')[0], referrer: document.referrer || '' },
    saved || {},
    saved ? Object.fromEntries(Object.entries(now).filter(([k]) => !saved[k])) : now
  );
  ORIGEM_KEYS.forEach((k) => { if (!(k in data)) data[k] = ''; });
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* sem storage */ }
  return data;
})();

const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`);

/* ---------- 3. Interface ---------- */
// Rolagem até um elemento (usa o Lenis quando ele está ligado)
function scrollToEl(el) {
  const offset = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) - 16;
  if (window.lenis) window.lenis.scrollTo(el, { offset, duration: 1.1 });
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

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
// Faixa escura atrás das pílulas depois do topo
const header = $('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Menu em painel (pílula "Menu"), em todas as telas
const menuBtn = $('#menuBtn');
const nav = $('#nav');
function toggleMenu(open) {
  const isOpen = open ?? !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  menuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}
menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
$$('a', nav).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('click', (e) => {
  if (nav.classList.contains('is-open') && !nav.contains(e.target)) toggleMenu(false);
});

// Vídeo do hero: toca sozinho, mudo e em loop, mas só começa a baixar
// depois que a página carregou. Pausa quando sai da tela. Sem vídeo para
// quem pediu movimento reduzido ou está em economia de dados.
(function initHeroVideo() {
  const video = $('#heroVideo');
  if (!video) return;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  if (reducedMotion || saveData) return;
  const start = () => {
    video.src = video.dataset.src;
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    const p = video.play();
    if (p && p.catch) p.catch(() => { /* sem autoplay: fica o fundo em degradê */ });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { const q = video.play(); if (q && q.catch) q.catch(() => {}); }
      else video.pause();
    }).observe(video);
  };
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
})();

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

// "Qual é a sua situação?": sanfonado acessível (uma situação aberta por vez)
const sitButtons = $$('.sit-row__btn');
sitButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const opening = btn.getAttribute('aria-expanded') !== 'true';
    sitButtons.forEach((other) => {
      const body = $(`#${other.getAttribute('aria-controls')}`);
      const open = other === btn && opening;
      other.setAttribute('aria-expanded', String(open));
      if (open && body.hidden) {
        body.hidden = false;
        if (window.Motion && !reducedMotion) {
          window.Motion.animate(body, { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0px)'] }, { duration: 0.45, ease: EASE });
        }
      } else if (!open) {
        body.hidden = true;
      }
    });
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

/* ---------- 4. Formulário em etapas ----------
   Passo 1: contatos (salvos na hora) · 2: investimento · 3: urgência · 4: o que precisa */
const form = $('#leadForm');
const steps = $$('.form__step', form);
const TOTAL = steps.length;
const progress = $('.form__progress', form);
const progressBar = $('#progressBar');
const stepLabel = $('#stepLabel');
const STEP_NAMES = ['Seus contatos', 'Investimento', 'Prazo', 'O que você precisa'];
const leadId = newId();
let current = 1;

function goToStep(n) {
  current = Math.min(Math.max(n, 1), TOTAL);
  steps.forEach((s) => {
    s.classList.toggle('is-active', +s.dataset.step === current);
    s.classList.remove('has-error');
  });
  progressBar.style.transform = `scaleX(${current / TOTAL})`;
  progress.setAttribute('aria-valuenow', String(current));
  stepLabel.textContent = `Passo ${current} de ${TOTAL} · ${STEP_NAMES[current - 1]}`;

  // mantém o topo do formulário visível no celular
  const top = form.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.6) {
    scrollToEl(form);
  }
  // leva o foco para a pergunta nova (teclado e leitor de tela)
  const legend = $('legend', steps[current - 1]);
  if (legend) { legend.tabIndex = -1; legend.focus({ preventScroll: true }); }
}

// Passos 2 e 3: avança sozinho ao escolher uma opção
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

// Botões dos cartões de serviço já deixam o passo 4 marcado
$$('[data-service]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const radio = $(`input[name="servico"][value="${btn.dataset.service}"]`, form);
    if (radio) radio.checked = true;
  })
);

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
  const ok = $$('input[type=radio]', stepEl).some((r) => r.checked);
  stepEl.classList.toggle('has-error', !ok);
  return ok;
}

function validateContact() {
  const nome = $('#nome');
  const empresa = $('#empresa');
  const whatsapp = $('#whatsapp');
  const email = $('#email');
  const lgpd = $('#lgpd');
  const checks = [
    setError(nome, nome.value.trim().length < 2),
    setError(empresa, !empresa.value.trim()),
    setError(whatsapp, !isValidPhone(whatsapp.value)),
    setError(email, !isValidEmail(email.value.trim())),
    setError(lgpd, !lgpd.checked),
  ];
  const ok = checks.every(Boolean);
  if (!ok) {
    const firstErr = $('.has-error input', steps[0]);
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
  if (e.target.name === 'servico') steps[TOTAL - 1].classList.remove('has-error');
});
// Enter no passo 1 avança; no campo do site/Instagram não envia sem querer
form.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || e.target.type === 'checkbox') return;
  if (current === 1) { e.preventDefault(); $('#toStep2').click(); }
  else if (e.target.id === 'link') e.preventDefault();
});

function collectData(etapa) {
  const fd = new FormData(form);
  const inv = fd.get('investimento') || '';
  return {
    lead_id: leadId,
    etapa,
    nome: (fd.get('nome') || '').trim(),
    empresa: (fd.get('empresa') || '').trim(),
    whatsapp: fd.get('whatsapp') || '',
    email: (fd.get('email') || '').trim(),
    aceite_contato: $('#lgpd').checked,
    investimento: inv,
    urgencia: fd.get('urgencia') || '',
    servico: fd.get('servico') || '',
    link: (fd.get('link') || '').trim(),
    rota: etapa === 'completo' ? (inv === LOW_BUDGET ? 'whatsapp' : 'agenda') : '',
    ...origem,
    criado_em: new Date().toISOString(),
  };
}

function leadSummary(d) {
  return [
    `Empresa: ${d.empresa}`,
    `WhatsApp: ${d.whatsapp}`,
    `Investimento: ${d.investimento}`,
    `Para quando: ${d.urgencia}`,
    `Precisa de: ${d.servico}`,
    d.link && `Site ou Instagram: ${d.link}`,
  ].filter(Boolean);
}

function showPanel(id) {
  form.hidden = true;
  $$('.funnel .panel').forEach((p) => { p.hidden = p.id !== id; });
  const panel = $(`#${id}`);
  panel.focus({ preventScroll: true });
  scrollToEl(panel);
  return panel;
}

// Passo 1 → salva os contatos e dispara o Lead (uma vez)
$('#toStep2').addEventListener('click', async () => {
  if (!validateContact()) return;
  const dados = collectData('contatos');
  goToStep(2);
  try { await saveLead(dados); } catch (err) { console.warn('[Avanttá] Falha ao salvar o contato:', err); }
  trackConversion('Lead', { etapa: 'contatos' });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateContact()) return goToStep(1);
  for (let n = 2; n <= TOTAL; n++) {
    if (!validateChoice(steps[n - 1])) { goToStep(n); steps[n - 1].classList.add('has-error'); return; }
  }
  const dados = collectData('completo');
  try { await saveLead(dados); } catch (err) { console.warn('[Avanttá] Falha ao salvar o contato:', err); }
  trackConversion('Lead', { etapa: 'completo' }); // não duplica: já disparou no passo 1

  const primeiroNome = dados.nome.split(' ')[0];
  if (dados.investimento === LOW_BUDGET) {
    const msg = [`Oi, sou ${dados.nome}, da ${dados.empresa}. Vim pelo formulário do site da Avanttá.`, '', ...leadSummary(dados)].join('\n');
    $('#thanksWa').href = waLink(msg);
    $$('[data-fill="nome"]').forEach((el) => { el.textContent = primeiroNome; });
    showPanel('panelThanks');
  } else {
    $('#calWa').href = waLink(`Oi, sou ${dados.nome}, da ${dados.empresa}. Preenchi o formulário do site da Avanttá e prefiro falar por aqui.`);
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

// Mesmos dados para o embed e para o link alternativo
function calPrefill(dados) {
  const phone = `+55${onlyDigits(dados.whatsapp)}`;
  const fields = {
    name: dados.nome,
    email: dados.email,
    notes: leadSummary(dados).join(' | '),
    [CAL_COMPANY_FIELD]: dados.empresa,
  };
  CAL_PHONE_FIELDS.forEach((f) => { fields[f] = phone; });
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { if (dados[k]) fields[k] = dados[k]; });
  return fields;
}

function loadCal(dados) {
  const fields = calPrefill(dados);

  // Link alternativo: a página do Cal.com com os mesmos dados na URL
  const fallback = new URL(`${CAL_ORIGIN}/${CAL_LINK}`);
  Object.entries(fields).forEach(([k, v]) => { if (v) fallback.searchParams.set(k, v); });
  $('#calFallback').href = fallback.toString();

  if (calLoaded) return;
  calLoaded = true;

  /* Snippet oficial do embed do Cal.com (cal.com/docs, "Embed > Inline") */
  (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, CAL_EMBED_SRC, 'init');

  const Cal = window.Cal;
  Cal('init', CAL_NAMESPACE, { origin: CAL_ORIGIN });
  const cal = Cal.ns[CAL_NAMESPACE];

  cal('inline', { elementOrSelector: '#calEmbed', calLink: CAL_LINK, config: { layout: 'month_view', theme: 'dark', ...fields } });
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
// Luz que segue o mouse (efeito 12): o JS só escreve a posição em --x/--y,
// o brilho é um degradê do CSS (.luz::before). Só com mouse de verdade.
function initLight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.luz').forEach((el) => {
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${ev.clientX - r.left}px`);
      el.style.setProperty('--y', `${ev.clientY - r.top}px`);
    });
  });
}

// Cartões que empilham (efeito 01) no "Como funciona".
// Cada passo gruda no topo; os que ficam por baixo encolhem e escurecem.
function initStack() {
  const list = $('#steps');
  if (!list) return;
  const cards = $$('.step', list);
  const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
  let naturais = [];
  let topo = 0;

  // Pegadinha do sticky: a posição natural é medida com o sticky desligado
  const medir = () => {
    topo = parseFloat(getComputedStyle(cards[0]).top) || 0;
    naturais = cards.map((c) => {
      const antes = c.style.position;
      c.style.position = 'static';
      const y = c.getBoundingClientRect().top + window.scrollY;
      c.style.position = antes;
      return y;
    });
  };

  let raf = 0;
  let ativo = false;
  const passo = () => {
    raf = 0;
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return; // o último não fica por baixo de ninguém
      const vao = c.offsetHeight + 18;
      // quanto o próximo cartão já subiu por cima deste
      const coberto = limitar((window.scrollY + topo - naturais[i + 1] + vao) / vao, 0, 1);
      c.style.transform = `scale(${1 - coberto * 0.08})`;
      c.style.setProperty('--dim', (coberto * 0.55).toFixed(3));
    });
  };
  const pedir = () => { if (ativo && !raf) raf = requestAnimationFrame(passo); };

  medir();
  window.addEventListener('resize', () => { medir(); pedir(); }, { passive: true });
  window.addEventListener('scroll', pedir, { passive: true });
  // só trabalha enquanto a lista está na tela
  new IntersectionObserver(([e]) => { ativo = e.isIntersecting; pedir(); }, { rootMargin: '200px 0px' }).observe(list);
  if (document.fonts) document.fonts.ready.then(() => { medir(); pedir(); });
}

// devolve o controle ao navegador entre fases (evita tarefas longas no carregamento)
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

async function initAnimations() {
  const M = window.Motion;
  if (reducedMotion) return;
  if (!M) { document.documentElement.classList.add('no-motion'); return; }

  // Rolagem suave (Lenis): a página desliza como um fluxo contínuo.
  // No toque do celular a rolagem continua nativa (mais natural).
  if (M.Lenis) {
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    window.lenis = new M.Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -(headerH + 16) } });
  }

  await yieldToMain();

  // Seções entram ao rolar (componente reutilizável em assets/js/reveal.js)
  window.reveal('.reveal');

  await yieldToMain();

  // Barra fina de progresso de leitura, embaixo do menu
  const bar = $('.scroll-progress');
  if (bar) M.scroll(M.animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { ease: 'linear' }));

  initStack();

  initLight();
}

initAnimations();
