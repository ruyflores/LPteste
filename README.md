# Avanttá: Landing Page

Landing page da **Avanttá** em HTML, CSS e JavaScript puro, sem etapa de build. Para ver, sirva a pasta com qualquer servidor estático ou abra o `index.html` no navegador.

O contexto do projeto, as regras de copy, as regras de performance e as pendências ficam no [`CLAUDE.md`](CLAUDE.md).

## Versões de cor

| Versão | Como abrir |
| --- | --- |
| Preto, vermelho e branco (oficial) | `index.html` |
| Preto e branco (só para comparação) | `preto-e-branco.html` ou `index.html?tema=pb` |

## Conversão

1. O formulário tem 4 passos: contatos (salvos na hora), investimento, prazo e o que precisa.
2. Quem escolhe "Até R$ 800" vai para uma tela de agradecimento com botão de WhatsApp.
3. As demais faixas veem a agenda do Cal.com (`avantta/avantta`) embutida na página, já preenchida.
4. O agendamento confirmado mostra a tela "Reunião confirmada".

Configuração no topo de `assets/js/script.js`: `WHATSAPP_NUMBER`, `CAL_LINK`, `CAL_PHONE_FIELDS`, `CAL_COMPANY_FIELD`, `saveLead()` e `trackConversion()`.

## Animações

O Motion (motion.dev) e o Lenis (rolagem suave) ficam em `assets/vendor/motion.min.js`. Para gerar de novo depois de atualizar as versões: `npm install && npm run vendor`.

O hero usa um vídeo que avança com a rolagem (`assets/js/scroll-video.js`). Para trocar o vídeo, mude o `data-src` do elemento `#scrollVideo` no `index.html`.
