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

## Objetivo da página

Uma única conversão: o contato preenche o formulário e **agenda a conversa no Cal.com**. O WhatsApp é a saída secundária.

Formulário (`#leadForm`, um passo por tela):
1. **Contatos:** nome, empresa, WhatsApp (máscara + validação), e-mail (obrigatório, o Cal.com exige) e aceite de contato. **O contato é salvo aqui** (`saveLead` com `etapa: "contatos"`) e o evento `Lead` dispara.
2. Investimento (avança sozinho)
3. Para quando (avança sozinho)
4. O que precisa + site/Instagram opcional. Salva de novo (`etapa: "completo"`, mesmo `lead_id`).

Depois do envio:
- **"Até R$ 800"** → agradecimento + botão de WhatsApp com as respostas.
- **Demais faixas** → Cal.com embutido no lugar do formulário, **já preenchido** (nome, e-mail, telefone, empresa, resumo em `notes` e UTMs). Tem o botão "Prefiro falar pelo WhatsApp". No evento `bookingSuccessful`, mostra "Reunião confirmada" e dispara `Schedule`.
- A origem da visita (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, página de origem e referrer) é capturada ao entrar e guardada durante a visita (`sessionStorage`).

## Estrutura

HTML, CSS e JS puro, sem framework e sem build. O `package.json` só existe para gerar o pacote do Motion.

```
index.html              página única (a ordem das seções está nos comentários)
preto-e-branco.html     atalho para index.html?tema=pb (só para comparação; noindex)
assets/css/style.css    estilos, temas (red / mono) e responsivo
assets/js/script.js     configuração, integrações, interface, formulário, Cal.com, animações
assets/js/reveal.js     componente de entrada suave das seções (classe .reveal)
assets/js/glass-hero.js Glass Headline Hero do 21st.dev, portado de React para JS puro (WebGL2)
assets/vendor/motion.min.js  Motion (motion.dev) só com animate, inView, scroll e stagger
tools/motion-entry.js   entrada do pacote acima ("npm install && npm run vendor" gera de novo)
assets/fonts/           Bebas Neue e Inter em woff2 (subset latin)
assets/img/             favicon.svg e og-image.jpg (1200x630, compartilhamento)
robots.txt, sitemap.xml, llms.txt
```

Constantes no topo de `assets/js/script.js`:
- `WHATSAPP_NUMBER` = `5561995905615`
- `CAL_LINK` = `avantta/avantta`
- `CAL_PHONE_FIELDS` = `['attendeePhoneNumber', 'whatsapp']` e `CAL_COMPANY_FIELD` = `'empresa'`: identificadores das perguntas do evento no Cal.com (**confirmar** e deixar só os certos)
- `saveLead(dados)`: hoje só faz `console.info`. É o ponto único para ligar o Supabase (upsert por `lead_id`).
- `trackConversion(evento)`: `Lead` e `Schedule`, cada um uma vez por visita. É o ponto único para o Pixel da Meta e o GA4.

As seções **Cases** e **Feedbacks** estão comentadas no HTML (conteúdo fictício). Só reative com material real e devolva os links ao menu.

**Endereço provisório:** canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` e `llms.txt` usam `https://lpteste-liard.vercel.app/`. Quando o domínio chegar, trocar em todos.

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
- Respeitar `prefers-reduced-motion`: sem movimento, o conteúdo só aparece (a comparação dos celulares mostra o estado final).
- Conteúdo que troca sozinho precisa de controle: a comparação tem botões de troca e "Repetir", e troca sozinha uma única vez.
- **Hero de vidro:** o texto do hero nunca é animado (LCP). O WebGL liga só depois do `load` + momento livre, e **não liga em renderizador por software** (SwiftShader, llvmpipe), onde trava a página. Com o efeito forçado sem placa de vídeo, a nota de Performance cai para 65. Para testar o efeito: `?glass=force`.
- O script do Cal.com só carrega quando o contato chega à agenda.
- Nada de vídeo em autoplay. Imagens em WebP ou AVIF com `loading="lazy"` e `width`/`height` definidos.
- Fontes em woff2 locais com `font-display: swap` e `preload` só das duas usadas acima da dobra.
- **Zero rolagem lateral no celular** (testar em 375px).
- O WhatsApp flutuante some quando o hero, o formulário ou a chamada final estão na tela (`data-hide-wa`).

Como medir localmente:
```bash
npx lighthouse http://localhost:PORTA/ --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo --view
```
Sirva os arquivos com gzip, como a hospedagem real faz. O `python -m http.server` não comprime e derruba a nota.

## Pendências

- [ ] **Cal.com**: confirmar os identificadores das perguntas (telefone e empresa) e ajustar `CAL_PHONE_FIELDS` / `CAL_COMPANY_FIELD`
- [ ] **Domínio**: trocar o endereço provisório da Vercel em canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt e llms.txt
- [ ] **Depoimentos reais** (destaque "Feedbacks" do Instagram) para reativar a seção Feedbacks
- [ ] **Prints dos cases** (WebP/AVIF, lazy load) para reativar a seção Cases
- [ ] **Logo original** em SVG (hoje é uma aproximação desenhada em código)
- [ ] **Supabase**: implementar `saveLead()` com upsert por `lead_id`
- [ ] **Resend**: e-mail de aviso de novo contato para a equipe
- [ ] **Sentry**: monitorar erros de JS em produção
- [ ] **Pixel da Meta e GA4**: implementar `trackConversion()` (`Lead` e `Schedule`)
