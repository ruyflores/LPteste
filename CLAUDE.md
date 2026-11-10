# Avanttá: Landing Page

Leia este arquivo antes de mexer no projeto. Ele vale para todas as sessões.

## Contexto do negócio

- **Desde novembro de 2026** a Avanttá é uma **assessoria para quem vende em Shopee, Mercado Livre, Shein e TikTok Shop** (sellers de marketplace). Antes vendia sites para empresas locais; essa versão está no histórico do Git (commit `d00bbbb` e anteriores).
- **Oferta de entrada:** **raio-X grátis de 2 anúncios**. A Avanttá analisa dois anúncios da loja e mostra a versão melhorada numa **conversa por vídeo de 30 minutos** (Google Meet). Se fizer sentido, a conversa já sai com proposta. Se não fizer, as melhorias ficam com o vendedor.
- **A conta continua do vendedor:** o acesso é dado como colaborador, nunca com senha.
- **Planos por fase da loja:** Loja Pronta (até R$ 10 mil/mês), Anúncio que Vende (projeto único, R$ 10 a 50 mil), Plano Essencial (mensal, R$ 20 a 50 mil), Plano Vitrine (a partir de R$ 50 mil), Plano Dois Canais (a partir de R$ 100 mil, selo "Mais completo"), Plano Escala (acima de R$ 300 mil ou várias lojas). Loja a mais em outro marketplace entra pela metade do valor. **Preços e prazos nunca aparecem na página** (as faixas em R$ são o faturamento do cliente, não o preço).
- **Números definidos pelo dono, que responde por eles:** R$ 1,3M+ faturados com o e-commerce próprio do fundador, 100+ lojas virtuais atendidas, 250+ projetos digitais entregues, no marketing digital desde 2018, 22 estados. Mudar só com a palavra dele.
- **Ofertas com data (somem sozinhas a partir de 21/11/2026, horário de Brasília, pelo atributo `data-ate`):** card "Sprint Black Friday", opção "Preparar a loja para a Black Friday" no formulário, bônus "Implantação grátis nos planos mensais para quem fechar até 20/11" (nos planos e no "Ao agendar, você recebe"). A frase do abatimento do Anúncio que Vende fica (troca de texto via `data-depois`). Para testar: `?hoje=2026-11-21` na URL.
- **Nome da marca:** só **Avanttá** (sem "Sites"). Endereço continua `avanttasites.com.br`. JSON-LD com `alternateName`: Avantta, Avanttasites, avanttasites.com.br. Favicon de 48px em `/favicon.ico` primeiro.
- O público chega pelo **Instagram** (orgânico e anúncios): **o celular é a prioridade absoluta** (testar em 375px e 390px).

## Estrutura da página

Mesma estrutura da versão anterior (baseada na referência "Jack, 3D Creator"), com a identidade nova.

1. **Abertura** (`#hero`): selo "Assessoria para quem vende em Shopee, Mercado Livre, Shein e TikTok Shop", título "Veja seu anúncio **refeito** antes de pagar." (palavra-chave em verde-limão), texto, três selos (30 min por vídeo, raio-X grátis de 2 anúncios, a conta continua sua), botões "Quero meu raio-X grátis" e "Ver os planos". No centro, um celular feito só com CSS mostrando um anúncio de marketplace genérico (sem logo de plataforma, selo "simulação"), com ímã (padding 150, força 3) e balões "Ficha técnica completa", "Nova venda", "Pergunta respondida", "Margem calculada" (no celular só "Nova venda" e "Margem calculada"). Menu em pílulas: logo com anel + palavra "avanttá" em texto (último "á" em verde-limão), Sobre, Planos, Resultados, Dúvidas, botão "Quero meu raio-X".
2. **Faixa que corre** (`#nichos`): "Para quem vende em qualquer categoria", 10 categorias, loop de 34 px/s no celular e 48 no computador, para com o mouse em cima.
3. **Sobre** (`#sobre`, etiqueta "01 · O que a gente faz"): "Seu comprador decide **em segundos.**" e o parágrafo que acende letra por letra (90% a 60% da tela).
4. **Sua situação** (`#situacao`, "02"): sanfona fechada com 3 situações (dinheiro não sobra, anúncio não aparece na busca, dependo só do marketplace).
5. **Planos** (`#planos`, "03"): seção escura com abas por fase (Começando, Crescendo, Escalando, Marca, Grande operação; no celular rolam de lado). Sem JS as abas somem e todas as fases aparecem. Cada botão guarda o plano no campo escondido `servico`. Depois: linha das lojas a mais, card temporário Sprint Black Friday e o bônus.
6. **Nossos números** (`#resultados`, "04"): R$ 1,3M+ em contador de rolo (a vírgula fica parada) e 4 números que contam (o 2018 conta a partir de 2000). Depois, "Ao agendar, você recebe".
7. **Formulário** (`#contato`, "05 · Raio-X grátis") → **8 dúvidas** (`#faq`, "06") → chamada final "Enquanto você pensa, o comprador clica no **concorrente.**" → rodapé com a palavra "avanttá" grande.
8. **Barra fixa no celular** (`#mbar`): "Quero meu raio-X grátis" + WhatsApp, some no formulário, na chamada final e no rodapé (`data-hide-wa`).

A conversa por vídeo dura **30 minutos**. O número aparece na abertura, no formulário, na agenda, no FAQ e no `llms.txt`: se mudar no Cal.com, mude na página também.

**Identidade visual** (variáveis no topo de `style.css`): fundo grafite `#0E0F11` com grade sutil de 54px feita só com CSS; cartões em chumbo `#17191C` com borda `#2A2E33`; texto gelo `#F2F3F0`; apoio `#8A8F98`; destaque verde-limão `#C8FF3E` (palavra-chave dos títulos em `<em>`, números, detalhes); azul `#5B8CFF` só em ilustrações. Sem vermelho e sem degradê nos títulos. Fontes locais: Space Grotesk (variável, 400 a 700) para títulos e texto, JetBrains Mono (400 e 600) para selos, etiquetas de seção ("01 · O QUE A GENTE FAZ") e números. Botão principal `.cbtn` verde-limão com texto grafite; secundário `.lbtn` com borda que fica verde no hover.

**Logo:** arquivos originais (zip enviado pelo dono, nov/2026) não ficam no site; só as versões geradas: `logo.webp` (anel, 96px, para o menu e o rodapé), `logo-512.png` (anel em fundo grafite, para o Google), `favicon.ico`, `favicon-32.png`, `icon-192.png` e `apple-touch-icon.png` (só o A, sem anel, porque abaixo de 48px o anel deixa o A pequeno demais) e `og-image.jpg` (1200x630, logo à esquerda e o título). Não redesenhar o logo nem recriar em SVG.

## Objetivo da página

Uma única conversão: o vendedor preenche o formulário e **agenda a conversa no Cal.com**. O WhatsApp é a saída secundária (e o caminho das lojas pequenas).

Formulário (`#leadForm`, um passo por tela, 3 passos):
1. **Contatos:** nome, WhatsApp (máscara + validação), e-mail, link da loja ou de um anúncio (`link_loja`, obrigatório), onde vende (`marketplaces`, várias escolhas: Shopee, Mercado Livre, Shein, TikTok Shop, Amazon, Magalu, Outro), faturamento por mês nos marketplaces (ainda não vendo, até 10 mil, 10 a 20, 20 a 50, 50 a 100, 100 a 300, mais de 300 mil) e o aceite já marcado. **O contato é salvo aqui** (`etapa: "contatos"`) e o `Lead` dispara.
2. **Investimento por mês fora a verba de anúncios** (até R$ 1.000, 1.000 a 2.000, 2.000 a 4.000, 4.000 ou mais) e **lucro no fim do mês** (`lucro_faixa`: não sei, menos de 5%, 5 a 10%, 10 a 20%, mais de 20%). Com as duas respondidas, avança sozinho.
3. **Prioridade** (`prioridade`: vender mais na plataforma, sobrar mais dinheiro, canal próprio, Black Friday até 20/11) e **para quando**. Com as duas respondidas, segue sozinho. Salva de novo (`etapa: "completo"`, mesmo `lead_id`, `rota` = `agenda` ou `whatsapp`).

Depois do envio, o caminho depende do faturamento (`FAIXAS_WHATSAPP` em `script.js`):
- **Ainda não vendo / Até R$ 10 mil:** sem agenda. Painel `#panelWa` indica a Loja Pronta e o botão do WhatsApp leva a mensagem pronta com a faixa e o link da loja (raio-X gravado em vídeo).
- **De R$ 10 mil para cima:** Cal.com embutido, **já preenchido** (nome, e-mail, WhatsApp, resumo em `notes` com loja, onde vende, faturamento, investimento, lucro, prioridade, prazo e plano, e UTMs).
- No `bookingSuccessful`: "Conversa confirmada", dispara `Schedule` e só então aparece "Chamar no WhatsApp" (`#bookedWa`).
- A origem da visita (UTMs, `gclid`, `fbclid`, página de origem e referrer) é capturada ao entrar e guardada durante a visita.

Mensagem pronta dos botões de WhatsApp (`WA_MSG`): "Oi, vim pelo site da Avanttá e quero o raio-X grátis dos meus anúncios. Minha loja é:".

## Estrutura

HTML, CSS e JS puro, sem framework e sem build. O `package.json` só existe para gerar o pacote do Motion.

```
index.html              página única (a ordem das seções está nos comentários)
assets/css/style.css    estilos (variáveis de cor no topo) e responsivo
assets/js/script.js     configuração, integrações, interface (abas, datas), formulário, Cal.com, animações
assets/js/reveal.js     componente de entrada suave das seções (classe .reveal)
assets/vendor/motion.min.js  Motion (animate, inView, scroll, stagger) + Lenis (rolagem suave), global window.Motion
tools/motion-entry.js   entrada do pacote acima ("npm install && npm run vendor" gera de novo)
assets/fonts/           Space Grotesk (variável) e JetBrains Mono 400/600 em woff2 (subset latin, Fontsource)
assets/img/             logo.webp, logo-512.png, favicon-32.png, icon-192.png, apple-touch-icon.png e og-image.jpg
favicon.ico             na raiz (16, 32 e 48px), para o Google e navegadores antigos
17262d87fa89d68e2d20201dd552adf4.txt  chave do IndexNow (avisa o Bing quando o site muda; não apagar)
robots.txt, sitemap.xml, llms.txt
```

Constantes no topo de `assets/js/script.js`:
- `WHATSAPP_NUMBER` = `5561995905615`, `WA_MSG` (mensagem pronta), `FAIXAS_WHATSAPP` (faixas que não vão para a agenda).
- `CAL_LINK` = `avantta/avantta` (evento "Raio-X dos seus anúncios", 30 min). `CAL_PHONE_FIELDS` = `['attendeePhoneNumber']`: a agenda pede só nome, e-mail e WhatsApp; o resumo vai em `notes`.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` e `saveLead(dados)`: grava cada etapa como uma linha nova na tabela `leads` (só inserir). Se alguma coluna não existir, reenvia sem ela e guarda o valor como texto na coluna `link` (ninguém se perde). Tabela, segurança e visão `leads_ultimos` em `supabase/leads.sql` (colunas novas: `link_loja`, `marketplaces` text[], `lucro_faixa`, `prioridade`; as antigas ficam para o histórico). **O plano grátis do Supabase pausa o projeto depois de um tempo sem uso:** se os contatos pararem de chegar, confira se o projeto está ativo.
- `supabase/functions/aviso-contato`: e-mail de aviso (Resend) a cada linha nova, com link da loja, marketplaces, faturamento e lucro. Segredos no painel: `RESEND_API_KEY`, `AVISO_PARA`, `AVISO_DE`, `WEBHOOK_SEGREDO`.
- `trackConversion(evento)`: `Lead` e `Schedule`, cada um uma vez por visita. O código manda só o nome do evento; a "correspondência avançada automática" está ligada no painel da Meta, então o próprio Pixel lê e-mail e WhatsApp do formulário e envia embaralhados (hash). Por isso o aceite do formulário avisa que os dados servem para medir os anúncios.
- **Pixel da Meta** (`1083689322498802`): no `<head>` do `index.html`. A fila e o `PageView` ficam prontos na hora; o arquivo da Meta só baixa no primeiro toque ou rolagem, ou 6 s depois de a página abrir (com menos tempo, a nota de Performance caiu para 90). O `<noscript>` fica logo no início do `<body>`.

As seções **Cases** e **Depoimentos** estão comentadas no HTML (conteúdo fictício). Só reative com material real e devolva os links ao menu.

**Endereço oficial:** `https://avanttasites.com.br/` (canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` e `llms.txt`). Publicação: a Vercel publica a branch `claude/avantta-landing-page-ymxayi` (não existe `main`); as mudanças passam antes pela `lp-v2` (prévia).

## Regra de comunicação

O público são vendedores de marketplace (Shopee, Mercado Livre, Shein, TikTok Shop), de quem está começando a lojas grandes. Conhecem a plataforma, mas não são do marketing digital. Palavras do dia a dia deles podem ficar: anúncio, ficha técnica, taxa, frete, margem, kit, campanha, anúncios patrocinados, e-commerce (o dono pediu "e-commerce próprio" nos números; a checagem abaixo acusa, e está liberado ali).

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

- Tom direto e provocativo: a venda que vai para o concorrente com anúncio mais claro, a loja cheia que fecha o mês sem sobrar dinheiro, a dependência de uma plataforma que muda as regras. **Provoque sem mentir.**
- Português brasileiro falado, frases curtas, sempre "você".
- Cenas concretas do dia a dia do empresário no lugar de frases genéricas.
- **Proibido:**
  - travessão, em qualquer lugar, inclusive comentários;
  - a estrutura "Não é só X. É Y." e variações ("O problema não é X. É Y.");
  - trios de adjetivos ou de verbos em sequência ("rápido, bonito e moderno", "atrair, converter e fidelizar");
  - as palavras "transforme", "eleve", "potencialize", "jornada", "solução completa", "de verdade", "máquina de", "desbloqueie", "revolucione";
  - emojis no texto;
  - pontos de exclamação em excesso.
- Nunca usar "sem compromisso". Usar "raio-X grátis" e deixar claro que, se fizer sentido, a conversa já sai com proposta.
- Nunca mencionar prazos em dias. Usar "entrega ágil" e "prazo definido na proposta".
- **Nunca inventar** números, resultados, depoimentos ou clientes (os números da seção "Nossos números" foram definidos pelo dono, que responde por eles; mudar só com a palavra dele). Ilustrações (como o anúncio no celular da abertura) levam o selo "simulação".
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
- Transição entre seções sem bordas nem quebras: fundos em degradê que emendam, e a barra fina de progresso de leitura no menu. Todas as seções ficam no grafite com a grade de fundo; os cartões em chumbo dão o contraste.
- **Efeitos guiados pela rolagem** (título da abertura, texto letra a letra e selos do "Sobre") passam por uma central única em `script.js` (`criarRolagem`): um `requestAnimationFrame` por quadro, medidas só quando a página muda de tamanho e cada efeito só roda com a seção na tela.
- **O hero não depende de JS nem de opacidade para aparecer:** o título e o parágrafo só deslizam. Texto em degradê (`color: transparent`) não conta como maior elemento para o Lighthouse, e texto com opacidade zero também não: quando isso aconteceu, a nota de Performance zerou (NO_LCP). O parágrafo do hero é quem segura essa medida.
- **Texto que acende letra por letra:** as letras só são separadas quando a seção chega perto da tela; o leitor de tela lê uma cópia inteira (`.sr-only`).
- **Tentativas anteriores no hero** (no histórico do Git): vídeo em loop do CloudFront de outra empresa (`467504d`), vídeo guiado pela rolagem com cortina (`fd6634e`; não aparecia no celular) e arte do celular abrindo em faixas (`7e60a9b`).
- **Efeitos do Não Codei em uso:** 10 inércia (feito pelo Lenis na página inteira) e 12 luz que segue o mouse (cartões `.luz`). **Fora de propósito:** 09 cursor personalizado (atrapalha quem quer clicar e contratar), 23 painéis que expandem e 21 galeria com filtro (animam largura, não transform), 08 cubo e 02 galeria horizontal (alongam a página e não ajudam a vender), 05 máscara (anima `clip-path`). O 06 faixas e o 01 cartões que empilham já foram usados e saíram (histórico do Git).
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
- [ ] **Depoimentos reais** de sellers para reativar a seção Depoimentos
- [ ] **Cal.com**: renomear o evento para "Raio-X dos seus anúncios" e mudar a duração para 30 min (no painel do Cal.com)
- [ ] **Prints dos cases** (antes e depois de anúncios, WebP/AVIF, lazy load) para reativar a seção Cases
- [x] **Logo original**: imagem oficial em `assets/img` (gerada a partir do arquivo enviado; se vier em SVG, trocar `logo.webp`)
- [x] **Supabase**: código pronto; tabela criada e chave anon no código (conferir o primeiro contato real em leads_ultimos)
- [ ] **Resend**: função pronta (`supabase/functions/aviso-contato`); falta criar a conta, a função e o webhook no painel
- [x] **Busca**: Google Search Console e Bing Webmaster Tools com sitemap; Perfil da Empresa no Google criado e ligado no `sameAs` do JSON-LD (`https://share.google/1A1ICpwCt5qCnmUPw`; se o perfil ganhar endereço do Maps fixo, trocar por ele); IndexNow: depois de publicar mudanças, abrir `https://api.indexnow.org/indexnow?url=https://avanttasites.com.br/&key=17262d87fa89d68e2d20201dd552adf4`
- [ ] **Sentry**: monitorar erros de JS em produção
- [x] **Pixel da Meta**: instalado (`PageView`, `Lead`, `Schedule`); conferir no Gerenciador de Eventos > Testar eventos
- [ ] **GA4**: falta o ID (G-XXXXXXX) para ligar em `trackConversion()`
