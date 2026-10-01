# Avanttá: Landing Page

Leia este arquivo antes de mexer no projeto. Ele vale para todas as sessões.

## Contexto do negócio

- A Avanttá cria **sites, páginas de vendas, lojas virtuais (Shopify)** e faz **manutenção** para empresários e prestadores de serviço de todo o Brasil, sem nicho específico.
- **Diferencial principal:** o cliente recebe uma **prévia grátis** do próprio site, apresentada numa conversa por vídeo (**Google Meet**). Se fizer sentido, a conversa já sai com proposta.
- **Todo site sai preparado para aparecer no Google e nas respostas das inteligências artificiais** (ChatGPT, Gemini, Perplexity e outras).
- **+250 sites entregues** (número real, pode ser usado).
- Tickets a partir de R$ 800. **Preços e prazos exatos nunca aparecem na página.**
- **Bônus atual:** 2 meses de manutenção grátis após a entrega do site, por tempo limitado.
- O público chega pelo **Instagram** (orgânico e anúncios): **o celular é a prioridade absoluta** (testar em 375px).

## Estrutura da página (enxuta: só o que qualifica e converte)

A versão atual se baseia na referência "Jack, 3D Creator" (portfólio), adaptada ao preto e vermelho da marca e à realidade da Avanttá (sem fotos de terceiros nem trabalhos de outras empresas).

1. **Hero** (`#hero`): título gigante em degradê com o diferencial ("Veja seu site pronto antes de pagar."), texto curto, três selos de confiança (conversa de 45 min por vídeo, só paga se gostar da prévia, site e endereço no seu nome), a prévia de um site num celular feito só com CSS no centro (segue o mouse, efeito ímã: padding 150, força 3) com balões em volta ("Pronto para o Google", "Venda realizada", "Nova mensagem de cliente", "Novo contato de cliente"; no celular só "Venda realizada" e "Novo contato de cliente", e o aparelho sobe por trás do texto e dos botões ao rolar), e embaixo o texto e os botões. Navegação em pílulas por cima (`.topbar`): logo, pílula "Menu" no celular (abre o painel), links na pílula do meio a partir de 1024px e pílula "Quero minha prévia".
2. **Faixa dos ramos** (`#nichos`): uma fileira com os 10 segmentos atendidos, correndo devagar em loop (34 px/s no celular, 48 no computador) e com um empurrão da rolagem. Assim todos passam inteiros pela tela, do primeiro ao último. Só anima com a seção na tela; com o mouse em cima, para.
3. **Sobre** (`#sobre`): "Quem não é visto não é lembrado." e um parágrafo curto que acende letra por letra com a rolagem (de 90% a 60% da tela, para quem para para ler já ler tudo). Selos decorativos em volta, com profundidade (só no computador).
4. **Sua situação** (`#situacao`, sanfonado com 3 situações). A comparação dos celulares saiu para encurtar a página (repetia o mesmo problema; está no histórico do Git, commit `15e13a7`).
5. **Serviços** (`#servicos`): folha clara com cantos arredondados, a lista parada "Todo site sai com" (Google, IAs, celular, WhatsApp, abre na hora, endereço próprio, medição) e 5 itens numerados (site completo, página de vendas, loja virtual, reforma, manutenção).
6. **Como funciona** (`#processo`): 4 cartões que empilham (28px de degrau, os de baixo encolhem 3% por cartão) + o que você recebe.
7. **Formulário** (`#contato`) → **7 dúvidas** (`#faq`, com as objeções: prévia grátis, "já me arrependi", parcelar, textos e fotos; a de preço saiu) → **chamada final** → rodapé com a marca gigante em degradê.
8. **Barra fixa no celular** (`#mbar`): botão "Quero minha prévia grátis" + WhatsApp. Aparece depois do hero e some no formulário, na chamada final e no rodapé (`data-hide-wa`). No computador continua o WhatsApp flutuante.

A conversa por vídeo dura **45 minutos** (configurado no Cal.com). O número aparece no hero, no "Como funciona", no formulário, na agenda e no FAQ: se mudar no Cal.com, mude na página também.

Sistema visual: fundo `#0C0C0C`, títulos em degradê (`.grad`, cinza para branco; `.grad--red` para o destaque), botão de contato em degradê vermelho com seta num círculo branco (`.cbtn`), botão de contorno (`.lbtn`), selo com filete vermelho (`.badge`), curva [0.16, 1, 0.3, 1] no hero e [0.25, 0.1, 0.25, 1] nas entradas (`.reveal`). Títulos em Bebas Neue, o resto em Inter (a referência usa Kanit; mantivemos a identidade da marca).

## Objetivo da página

Uma única conversão: o contato preenche o formulário e **agenda a conversa no Cal.com**. O WhatsApp é a saída secundária.

Formulário (`#leadForm`, um passo por tela):
1. **Contatos:** nome, empresa, WhatsApp (máscara + validação), e-mail (obrigatório, o Cal.com exige) e aceite de contato. **O contato é salvo aqui** (`saveLead` com `etapa: "contatos"`) e o evento `Lead` dispara.
2. Investimento (avança sozinho): até R$ 800, R$ 800 a 2.000, R$ 2.000 a 4.000, R$ 4.000 ou mais, "Ainda não sei" (vai para a agenda)
3. Para quando (avança sozinho): o quanto antes, este mês, sem pressa
4. O que precisa + site/Instagram opcional. Salva de novo (`etapa: "completo"`, mesmo `lead_id`).

Depois do envio:
- **"Até R$ 800"** → agradecimento + botão de WhatsApp com as respostas.
- **Demais faixas** → Cal.com embutido no lugar do formulário, **já preenchido** (nome, e-mail, WhatsApp, resumo em `notes` e UTMs). Tem o botão "Prefiro falar pelo WhatsApp". No evento `bookingSuccessful`, mostra "Reunião confirmada" e dispara `Schedule`.
- A origem da visita (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, página de origem e referrer) é capturada ao entrar e guardada durante a visita (`sessionStorage`).

## Estrutura

HTML, CSS e JS puro, sem framework e sem build. O `package.json` só existe para gerar o pacote do Motion.

```
index.html              página única (a ordem das seções está nos comentários)
preto-e-branco.html     atalho para index.html?tema=pb (só para comparação; noindex)
assets/css/style.css    estilos, temas (red / mono) e responsivo
assets/js/script.js     configuração, integrações, interface, formulário, Cal.com, animações (ímã, faixa, texto letra a letra, cartões)
assets/js/reveal.js     componente de entrada suave das seções (classe .reveal)
assets/vendor/motion.min.js  Motion (animate, inView, scroll, stagger) + Lenis (rolagem suave), global window.Motion
tools/motion-entry.js   entrada do pacote acima ("npm install && npm run vendor" gera de novo)
assets/fonts/           Bebas Neue e Inter em woff2 (subset latin)
assets/img/             favicon.svg e og-image.jpg (1200x630, compartilhamento)
robots.txt, sitemap.xml, llms.txt
```

Constantes no topo de `assets/js/script.js`:
- `WHATSAPP_NUMBER` = `5561995905615`
- `CAL_LINK` = `avantta/avantta`
- `CAL_PHONE_FIELDS` = `['attendeePhoneNumber']`: o evento do Cal.com pede só nome (`name`), e-mail (`email`) e WhatsApp (`attendeePhoneNumber`), para ter menos atrito. O resumo vai em `notes`.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` e `saveLead(dados)`: grava cada etapa como uma linha nova na tabela `leads` do Supabase (só inserir; o site não lê nem altera nada). Sem a chave, não envia. A tabela, a segurança e a visão `leads_ultimos` (uma linha por contato) estão em `supabase/leads.sql`.
- `supabase/functions/aviso-contato`: e-mail de aviso (Resend) a cada linha nova, chamado por um Database Webhook do Supabase. Segredos no painel: `RESEND_API_KEY`, `AVISO_PARA`, `AVISO_DE`, `WEBHOOK_SEGREDO`.
- `trackConversion(evento)`: `Lead` e `Schedule`, cada um uma vez por visita. É o ponto único para o Pixel da Meta e o GA4.

As seções **Cases** e **Feedbacks** estão comentadas no HTML (conteúdo fictício). Só reative com material real e devolva os links ao menu.

**Endereço oficial:** `https://avanttasites.com.br/` (canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` e `llms.txt`). Publicação: a Vercel publica a branch `claude/avantta-landing-page-ymxayi` (não existe `main`); as mudanças passam antes pela `lp-v2` (prévia).

## Regra de comunicação

O público são donos de pequenas e médias empresas (clínicas, escritórios, estética, construção, comércio, alimentação). Não são do marketing digital.

- Fale como uma pessoa explicando para um dono de negócio num café, não como agência.
- Use **analogias da vida real**: loja física, vitrine, placa na rua, vendedor, cartão de visita, feira, revisão do carro.
- **Troque todo termo técnico.** Se for inevitável, explique entre parênteses na mesma frase.

| Não usar | Usar |
|---|---|
| Landing page / LP | Página de vendas |
| Site institucional | Site completo da empresa |
| Redesign | Reforma do site |
| Copy | Textos que convencem |
| SEO | Aparecer no Google quando o cliente procura |
| GEO | Aparecer nas respostas das inteligências artificiais |
| Pixel e métricas | Medição de quantas pessoas visitam e quantas viram contato |
| Google Ads e Meta Ads | Anúncios no Google e no Instagram |
| Conversão / converter | Transformar visita em cliente |
| Responsivo / mobile first | Perfeito no celular |
| Domínio | Endereço do site (suaempresa.com.br) |
| Hospedagem | Onde o site fica guardado e funcionando 24h |
| Shopify / e-commerce | Loja virtual |
| CTA | Botão / chamada |
| Tráfego | Visitas |
| Lead | Contato interessado |
| Navegável, diagnóstico, presença digital, reunião | Que você abre e clica, avaliação, presença na internet, conversa por vídeo |

## Regras de copy (valem para todo texto: botões, FAQ, mensagens do formulário e do WhatsApp)

- Tom direto e provocativo: o custo de ficar parado, o cliente que pesquisa e fecha com o concorrente, a vergonha de mandar o link do site atual, o concorrente menor que parece maior na internet. **Provoque sem mentir.**
- Português brasileiro falado, frases curtas, sempre "você".
- Cenas concretas do dia a dia do empresário no lugar de frases genéricas.
- **Proibido:**
  - travessão, em qualquer lugar, inclusive comentários;
  - a estrutura "Não é só X. É Y." e variações ("O problema não é X. É Y.");
  - trios de adjetivos ou de verbos em sequência ("rápido, bonito e moderno", "atrair, converter e fidelizar");
  - as palavras "transforme", "eleve", "potencialize", "jornada", "solução completa", "de verdade", "máquina de", "desbloqueie", "revolucione";
  - emojis no texto;
  - pontos de exclamação em excesso.
- Nunca usar "sem compromisso". Usar "prévia grátis" / "prévia gratuita" e deixar claro que, se fizer sentido, a conversa já sai com proposta.
- Nunca mencionar prazos em dias. Usar "entrega ágil" e "prazo definido na proposta".
- **Nunca inventar** números, resultados, depoimentos ou clientes. Ilustrações (como a comparação dos celulares) levam o selo "simulação".
- O FAQ visível e o `FAQPage` do JSON-LD precisam ter o mesmo texto.
- Antes de cada commit, rodar a checagem abaixo e corrigir tudo o que aparecer:

```bash
python3 - <<'EOF'
import re
s=open('index.html',encoding='utf-8').read()
t=re.sub(r'<!--.*?-->|<script.*?</script>|<style.*?</style>|<!DOCTYPE[^>]*>','',s,flags=re.S)
t=re.sub(r'<[^>]+>',' ',t)
bad=['\u2014','transform','eleve','potencializ','jornada','solução completa','de verdade','máquina de','desbloqu','revolucion','sem compromisso',' dias','!',
     'landing','SEO','copy','pixel','conversão','responsivo','domínio','hospedagem','e-commerce','CTA','tráfego',' lead','navegável','diagnóstico','presença digital','redesign','institucional']
for w in bad:
    for m in re.finditer(re.escape(w),t,flags=re.I): print(w,'|',' '.join(t[max(0,m.start()-40):m.end()+30].split()))
print(re.findall(r'n[ãa]o [ée] s[óo].{0,40}',t,flags=re.I))
EOF
grep -rn $'\u2014' index.html assets/js assets/css preto-e-branco.html llms.txt
```

A checagem não pega trios de verbos e adjetivos: releia as frases novas.

## Regras de performance e animação

- Meta: **90+ no PageSpeed mobile** em Performance, Acessibilidade, Boas práticas e SEO. Se uma animação derrubar a nota, simplifique a animação, nunca a meta.
- Animações com **Motion** (`assets/vendor/motion.min.js`, carregado com `defer`). Não usar GSAP.
- Entrada das seções: classe `.reveal` (fade + leve subida, 600ms, uma vez). Movimento discreto: 400 a 700ms, nada que atrase a leitura.
- Animar **apenas `transform` e `opacity`**. Nada de animar `box-shadow`, `filter`, `width` ou `top`, e nada de `filter: blur` em elementos grandes.
- Respeitar `prefers-reduced-motion`: sem movimento, o conteúdo só aparece (a faixa vira uma lista que rola de lado).
- Conteúdo que se mexe sozinho precisa de controle: a faixa dos ramos para com o mouse em cima e não anima com movimento reduzido.
- **Menos é mais:** animação que ajuda a entender fica; animação que só enfeita sai primeiro. No celular, no máximo 2 balões no hero e 1 fileira na faixa.
- Transição entre seções sem bordas nem quebras: fundos em degradê que emendam, e a barra fina de progresso de leitura no menu. A exceção proposital é a folha clara dos serviços, que entra com cantos arredondados e é coberta pelo "Como funciona" (sobre ela, a faixa escura atrás do menu some).
- **Efeitos guiados pela rolagem** (título do hero, texto letra a letra, selos do "Sobre" e cartões) passam por uma central única em `script.js` (`criarRolagem`): um `requestAnimationFrame` por quadro, medidas só quando a página muda de tamanho e cada efeito só roda com a seção na tela.
- **O hero não depende de JS nem de opacidade para aparecer:** o título e o parágrafo só deslizam. Texto em degradê (`color: transparent`) não conta como maior elemento para o Lighthouse, e texto com opacidade zero também não: quando isso aconteceu, a nota de Performance zerou (NO_LCP). O parágrafo do hero é quem segura essa medida.
- **Texto que acende letra por letra:** as letras só são separadas quando a seção chega perto da tela; o leitor de tela lê uma cópia inteira (`.sr-only`).
- **Tentativas anteriores no hero** (no histórico do Git): vídeo em loop do CloudFront de outra empresa (`467504d`), vídeo guiado pela rolagem com cortina (`fd6634e`; não aparecia no celular) e arte do celular abrindo em faixas (`7e60a9b`).
- **Efeitos do Não Codei em uso:** 01 cartões que empilham ("Como funciona"; o escurecimento é uma camada com `opacity`, não `filter`), 10 inércia (feito pelo Lenis na página inteira) e 12 luz que segue o mouse (cartões `.luz`). **Fora de propósito:** 09 cursor personalizado (atrapalha quem quer clicar e contratar), 23 painéis que expandem e 21 galeria com filtro (animam largura, não transform), 08 cubo e 02 galeria horizontal (alongam a página e não ajudam a vender), 05 máscara (anima `clip-path`). O 06 faixas chegou a ser usado com uma arte estática no hero, mas voltamos ao vídeo com a transição em cortina.
- **Rolagem suave (Lenis)** dá a sensação de site contínuo; é desligada com `prefers-reduced-motion`. Para rolar por código, use `scrollToEl()` (funciona com e sem Lenis).
- O script do Cal.com só carrega quando o contato chega à agenda.
- Nada de vídeo em autoplay. Imagens em WebP ou AVIF com `loading="lazy"` e `width`/`height` definidos.
- Fontes em woff2 locais com `font-display: swap` e `preload` só das duas usadas acima da dobra.
- **Zero rolagem lateral no celular** (testar em 375px).
- O WhatsApp flutuante (computador) e a barra fixa (celular) somem quando o hero, o formulário, a chamada final ou o rodapé estão na tela (`data-hide-wa`).

Como medir localmente:
```bash
npx lighthouse http://localhost:PORTA/ --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo --view
```
Sirva os arquivos com gzip, como a hospedagem real faz. O `python -m http.server` não comprime e derruba a nota.

## Pendências

- [x] **Cal.com**: identificadores confirmados (name, email, attendeePhoneNumber)
- [x] **Domínio**: avanttasites.com.br
- [ ] **Depoimentos reais** (destaque "Feedbacks" do Instagram) para reativar a seção Feedbacks
- [ ] **Prints dos cases** (WebP/AVIF, lazy load) para reativar a seção Cases
- [ ] **Logo original** em SVG (hoje é uma aproximação desenhada em código)
- [x] **Supabase**: código pronto; tabela criada e chave anon no código (conferir o primeiro contato real em leads_ultimos)
- [ ] **Resend**: função pronta (`supabase/functions/aviso-contato`); falta criar a conta, a função e o webhook no painel
- [ ] **Sentry**: monitorar erros de JS em produção
- [ ] **Pixel da Meta e GA4**: implementar `trackConversion()` (`Lead` e `Schedule`)
