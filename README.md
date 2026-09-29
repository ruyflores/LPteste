# Avanttá: Landing Page

Landing page da **Avanttá** em HTML, CSS e JavaScript puro, sem etapa de build. Para ver, sirva a pasta com qualquer servidor estático ou abra o `index.html` no navegador.

O contexto do projeto, as regras de copy, as regras de performance e as pendências ficam no [`CLAUDE.md`](CLAUDE.md).

## Versões de cor

| Versão | Como abrir |
| --- | --- |
| Preto, vermelho e branco (oficial) | `index.html` |
| Preto e branco (só para comparação) | `preto-e-branco.html` ou `index.html?tema=pb` |

## Conversão

1. O formulário tem 4 etapas: investimento, urgência, serviço e contato.
2. Quem escolhe "Até R$ 800" vai para uma tela de agradecimento com botão de WhatsApp.
3. As demais faixas veem a agenda do Cal.com (`avantta/avantta`) embutida na página.
4. O agendamento confirmado mostra a tela "Reunião confirmada".

Configuração no topo de `assets/js/script.js`: `WHATSAPP_NUMBER`, `CAL_LINK`, `CAL_WHATSAPP_FIELD`, `saveLead()` e `trackConversion()`.
