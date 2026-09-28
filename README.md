# Avanttá — Landing Page

Landing page da **Avanttá** (sites e landing pages) em HTML, CSS e JavaScript puro — sem build, é só abrir o `index.html` no navegador.

## Versões de cor

| Versão | Como abrir |
| --- | --- |
| Preto, vermelho e branco (padrão) | `index.html` ou `index.html?tema=vermelho` |
| Preto e branco | `preto-e-branco.html` ou `index.html?tema=pb` |

Também dá para alternar pelo botão **P&B / Cor** no topo da página (a escolha fica salva no navegador).
As cores ficam todas em variáveis no início de `assets/css/style.css`.

## Estrutura

```
index.html              → página (seções: hero, números, problema, benefícios,
                          serviços, como funciona, cases, depoimentos, formulário, FAQ)
preto-e-branco.html     → atalho para a versão P&B
assets/css/style.css    → estilos + temas + responsivo
assets/js/script.js     → menu mobile, tema, animações, formulário e WhatsApp
assets/img/favicon.svg  → ícone da aba
```

## Antes de publicar (pendências)

- [ ] Colocar o número real em `WHATSAPP_NUMBER` (`assets/js/script.js`)
- [ ] Trocar os **depoimentos de exemplo** por depoimentos reais
- [ ] Trocar os mockups da seção **Cases** por prints de sites entregues
- [ ] Revisar textos do FAQ (prazos, domínio, manutenção) conforme o serviço real
- [ ] (Opcional) Enviar os leads para planilha/CRM — ver comentário no `submit` do formulário

## Como o formulário funciona

É dividido em 2 passos (contato → qualificação) para aumentar a conversão. Ao enviar, abre o WhatsApp da Avanttá com uma mensagem já preenchida com todas as respostas.
