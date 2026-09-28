/* =========================================================
   AVANTTÁ — Landing Page (JS)
   ========================================================= */

/* >>> CONFIGURE AQUI o número de WhatsApp da Avanttá <<<
   Formato: 55 + DDD + número, só dígitos. Ex.: "5511999999999" */
const WHATSAPP_NUMBER = '5500000000000';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const waLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

/* ---------- Ano no rodapé ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Links de WhatsApp ---------- */
$$('.js-whatsapp').forEach((a) => {
  a.href = waLink(a.dataset.msg || 'Olá! Vim pelo site da Avanttá.');
  a.target = '_blank';
  a.rel = 'noopener';
});

/* ---------- Tema: vermelho ⇄ preto e branco ---------- */
const root = document.documentElement;
const themeToggle = $('#themeToggle');
const themeLabel = $('.theme-toggle__label');

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeLabel.textContent = theme === 'mono' ? 'Cor' : 'P&B';
  themeToggle.setAttribute(
    'aria-label',
    theme === 'mono' ? 'Ver versão vermelha' : 'Ver versão preto e branco'
  );
  try { localStorage.setItem('avantta-tema', theme); } catch (e) {}
}
setTheme(root.getAttribute('data-theme') || 'red');
themeToggle.addEventListener('click', () =>
  setTheme(root.getAttribute('data-theme') === 'mono' ? 'red' : 'mono')
);

/* ---------- Header ao rolar ---------- */
const header = $('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobile ---------- */
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

/* ---------- Animação de entrada (scroll reveal) ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  // pequeno atraso em cascata para itens irmãos
  $$('.reveal').forEach((el) => {
    const siblings = $$(':scope > .reveal', el.parentElement);
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    io.observe(el);
  });
} else {
  $$('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Contador animado ---------- */
$$('[data-count]').forEach((el) => {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || '';
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  obs.observe(el);
});

/* ---------- Máscara de telefone ---------- */
function maskPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
$$('[data-mask="phone"]').forEach((input) =>
  input.addEventListener('input', () => { input.value = maskPhone(input.value); })
);

/* ---------- Formulário em 2 passos ---------- */
const form = $('#leadForm');
const steps = $$('.form__step', form);
const progressBar = $('#progressBar');
const stepLabel = $('#stepLabel');
const labels = ['Passo 1 de 2 · Seus contatos', 'Passo 2 de 2 · Sobre o seu negócio'];

function goToStep(n) {
  steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
  progressBar.style.width = n === 1 ? '50%' : '100%';
  stepLabel.textContent = labels[n - 1];
  const first = $('input, select', steps[n - 1]);
  if (first && window.matchMedia('(min-width: 961px)').matches) first.focus({ preventScroll: true });
  if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Telefone adicional
$('#outroTelefone').addEventListener('change', (e) =>
  $('#telefoneField').classList.toggle('is-visible', e.target.checked)
);

// Botões "Quero um site / LP / renovar" já marcam o serviço no formulário
$$('[data-service]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const radio = $(`input[name="servico"][value="${btn.dataset.service}"]`, form);
    if (radio) radio.checked = true;
  })
);

function setError(field, hasError) {
  const wrap = field.closest('.field');
  if (wrap) wrap.classList.toggle('has-error', hasError);
  return !hasError;
}

function validateStep(n) {
  const step = steps[n - 1];
  let ok = true;

  $$('input[required]:not([type=radio]):not([type=checkbox]), select[required]', step).forEach((el) => {
    let invalid = !el.value.trim();
    if (el.dataset.mask === 'phone') invalid = el.value.replace(/\D/g, '').length < 10;
    ok = setError(el, invalid) && ok;
  });

  const email = $('#email', step);
  if (email && email.value.trim()) {
    ok = setError(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) && ok;
  } else if (email) setError(email, false);

  const radios = $$('input[type=radio][required]', step);
  if (radios.length) {
    const checked = $$(`input[name="${radios[0].name}"]`, step).some((r) => r.checked);
    ok = setError(radios[0], !checked) && ok;
  }

  const lgpd = $('#lgpd', step);
  if (lgpd) {
    $('#lgpdError').classList.toggle('is-visible', !lgpd.checked);
    ok = lgpd.checked && ok;
  }

  if (!ok) {
    const firstErr = $('.has-error input, .has-error select', step) || (lgpd && !lgpd.checked ? lgpd : null);
    if (firstErr) firstErr.focus();
  }
  return ok;
}

// limpa o erro assim que o usuário corrige
form.addEventListener('input', (e) => {
  const wrap = e.target.closest('.field');
  if (wrap && wrap.classList.contains('has-error')) wrap.classList.remove('has-error');
  if (e.target.id === 'lgpd') $('#lgpdError').classList.remove('is-visible');
});
form.addEventListener('change', (e) => {
  if (e.target.type === 'radio') e.target.closest('.field').classList.remove('has-error');
  if (e.target.id === 'lgpd') $('#lgpdError').classList.remove('is-visible');
});

$('#nextStep').addEventListener('click', () => validateStep(1) && goToStep(2));
$('#prevStep').addEventListener('click', () => goToStep(1));
// Enter no passo 1 avança em vez de enviar
steps[0].addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') {
    e.preventDefault();
    $('#nextStep').click();
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(1)) return goToStep(1);
  if (!validateStep(2)) return;

  const data = Object.fromEntries(new FormData(form));
  const lines = [
    'Olá, Avanttá! Quero receber uma prévia do meu site. 🚀',
    '',
    `*Nome:* ${data.nome}`,
    `*Empresa:* ${data.empresa}`,
    `*WhatsApp:* ${data.whatsapp}`,
    data.telefone && `*Telefone:* ${data.telefone}`,
    data.email && `*E-mail:* ${data.email}`,
    `*Segmento:* ${data.segmento}`,
    `*Faturamento mensal:* ${data.faturamento}`,
    `*Preciso de:* ${data.servico}`,
    data.objetivo && `*Objetivo:* ${data.objetivo}`,
    data.link && `*Site/Instagram atual:* ${data.link}`,
  ].filter(Boolean);

  /* Dica: para salvar os leads numa planilha/CRM, envie `data` para um
     webhook aqui (ex.: fetch('https://...', { method: 'POST', body: JSON.stringify(data) })). */

  const url = waLink(lines.join('\n'));
  $('#successWa').href = url;
  steps.forEach((s) => s.classList.remove('is-active'));
  $('.form__progress', form).hidden = true;
  stepLabel.hidden = true;
  $('#formSuccess').hidden = false;
  window.open(url, '_blank', 'noopener');
});
