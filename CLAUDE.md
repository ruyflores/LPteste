# Avanttá: Landing Page

Leia este arquivo antes de mexer no projeto. Ele vale para todas as sessões.

## Contexto do negócio

- A Avanttá cria **sites, landing pages, lojas Shopify** e faz **manutenção** para empresários e prestadores de serviço de todo o Brasil, sem nicho específico.
- **Diferencial principal:** o cliente recebe uma **prévia navegável gratuita** do próprio site, apresentada numa reunião pelo **Google Meet**. Se fizer sentido, a reunião já sai com proposta.
- **+250 sites entregues** (número real, pode ser usado).
- Tickets a partir de R$ 800. **Preços e prazos exatos nunca aparecem na página.**
- **Bônus atual:** 2 meses de manutenção grátis após a entrega do site, por tempo limitado.
- O público chega pelo **Instagram** (orgânico e anúncios): **o celular é a prioridade absoluta**.

## Objetivo da página

Uma única conversão: o lead preenche o formulário e **agenda a reunião no Cal.com**. O WhatsApp é a saída secundária.

Fluxo do formulário (`#leadForm`, uma pergunta por tela):
1. Quanto quer investir (auto-avança)
2. Urgência (auto-avança)
3. O que precisa + site/Instagram opcional (auto-avança)
4. Contato: nome, empresa, WhatsApp (máscara + validação), outro telefone opcional, e-mail opcional, aceite LGPD

Roteamento após o envio:
- **"Até R$ 800"** → tela de agradecimento + botão de WhatsApp com as respostas.
- **Demais faixas** → agenda do Cal.com embutida (inline) no lugar do formulário. No evento `bookingSuccessful`, mostra "Reunião confirmada".

## Estrutura

```
index.html              página única (a ordem das seções está nos comentários)
preto-e-branco.html     atalho para index.html?tema=pb (só para comparação; noindex)
assets/css/style.css    estilos, temas (red / mono) e responsivo
assets/js/script.js     configuração, integrações, formulário, Cal.com, animações
assets/vendor/          gsap.min.js e ScrollTrigger.min.js (GSAP 3.15, hospedado localmente)
assets/fonts/           Bebas Neue e Inter em woff2 (subset latin)
assets/img/             favicon.svg e og-image.jpg (1200x630, compartilhamento)
robots.txt
```

Constantes no topo de `assets/js/script.js`:
- `WHATSAPP_NUMBER` = `5561995905615`
- `CAL_LINK` = `avantta/avantta` (evento do Cal.com)
- `CAL_WHATSAPP_FIELD`: identificador do campo de WhatsApp no evento do Cal.com (**confirmar**)
- `saveLead(dados)`: hoje só faz `console.info`. É o ponto único para ligar o Supabase.
- `trackConversion(evento)`: `Lead` e `Schedule`. É o ponto único para o Pixel da Meta e o GA4.

As seções **Cases** e **Feedbacks** estão comentadas no HTML (conteúdo fictício). Só reative com material real e devolva os links ao menu.

## Regras de copy (valem para todo texto: botões, FAQ, mensagens do formulário e do WhatsApp)

- Tom direto e provocativo: o custo de ficar parado, o cliente que pesquisa e fecha com o concorrente, a vergonha de mandar o link do site atual, o concorrente menor que parece maior na internet. **Provoque sem mentir.**
- Português brasileiro falado, frases curtas, sempre "você".
- Cenas concretas do dia a dia do empresário no lugar de frases genéricas.
- **Proibido:**
  - travessão (—), em qualquer lugar, inclusive comentários;
  - a estrutura "Não é só X. É Y." e variações ("O problema não é X. É Y.");
  - trios de adjetivos ou de verbos em sequência ("rápido, bonito e moderno", "atrair, converter e fidelizar");
  - as palavras "transforme", "eleve", "potencialize", "jornada", "solução completa", "de verdade", "máquina de", "desbloqueie", "revolucione";
  - emojis no texto;
  - pontos de exclamação em excesso.
- Nunca usar "sem compromisso". Usar "prévia gratuita" e deixar claro que, se fizer sentido, a reunião já sai com proposta.
- Nunca mencionar prazos em dias. Usar "entrega ágil" e "prazo definido na proposta".
- **Nunca inventar** números, resultados, depoimentos ou clientes.
- Antes de cada commit, rodar a checagem abaixo e corrigir tudo o que aparecer:

```bash
python3 - <<'EOF'
import re
s=open('index.html',encoding='utf-8').read()
t=re.sub(r'<!--.*?-->|<script.*?</script>|<style.*?</style>|<!DOCTYPE[^>]*>','',s,flags=re.S)
t=re.sub(r'<[^>]+>',' ',t)
bad=['—','transform','eleve','potencializ','jornada','solução completa','de verdade','máquina de','desbloqu','revolucion','sem compromisso',' dias','!']
for w in bad:
    for m in re.finditer(re.escape(w),t,flags=re.I): print(w,'|',t[max(0,m.start()-40):m.end()+30])
print(re.findall(r'n[ãa]o [ée] s[óo].{0,40}',t,flags=re.I))
EOF
grep -rn "—" index.html assets/js assets/css preto-e-branco.html
```

A checagem não pega trios de verbos e adjetivos: releia as frases novas.

## Regras de performance e animação

- Meta: **90+ no PageSpeed mobile** em Performance, Acessibilidade, Boas práticas e SEO. Se uma animação derrubar a nota, simplifique a animação, nunca a meta.
- GSAP + ScrollTrigger carregados com `defer` a partir de `assets/vendor/`.
- Animar **apenas `transform` e `opacity`**. Nada de animar `box-shadow`, `filter`, `width` ou `top`, e nada de `filter: blur` em elementos grandes.
- Respeitar `prefers-reduced-motion`: sem animação para quem desativou. A classe `.anim` no `<html>` só é aplicada quando o movimento é permitido.
- O texto do hero (h1, subtítulo, botões) **não é animado**, para não atrasar o LCP.
- A inicialização das animações é dividida em fases (`yieldToMain`), e os títulos só são quebrados em palavras quando chegam perto da tela. Mantenha isso para não criar tarefas longas.
- O script do Cal.com só carrega quando o lead chega à agenda.
- Nada de vídeo em autoplay. Imagens em WebP ou AVIF com `loading="lazy"` e `width`/`height` definidos.
- Fontes em woff2 locais com `font-display: swap` e `preload` só das duas usadas acima da dobra.
- **Zero rolagem lateral no celular** (testar em 390px). O comparativo vira cards abaixo de 640px.
- O WhatsApp flutuante some quando o hero, o formulário ou a chamada final estão na tela (`data-hide-wa`).

Como medir localmente:
```bash
npx lighthouse http://localhost:PORTA/ --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo --view
```
Sirva os arquivos com gzip, como a hospedagem real faz. O `python -m http.server` não comprime e derruba a nota.

## Pendências

- [ ] **Depoimentos reais** (destaque "Feedbacks" do Instagram) para reativar a seção Feedbacks
- [ ] **Prints dos cases** (WebP/AVIF, lazy load) para reativar a seção Cases
- [ ] **Logo original** em SVG (hoje é uma aproximação desenhada em código)
- [ ] **Domínio**: tornar absolutos `og:image` e `og:url`, adicionar `<link rel="canonical">` e `sitemap.xml`
- [ ] **Cal.com**: confirmar o identificador do campo de WhatsApp (`CAL_WHATSAPP_FIELD`)
- [ ] **Supabase**: implementar `saveLead()` (tabela de leads)
- [ ] **Resend**: e-mail de aviso de novo lead para a equipe
- [ ] **Sentry**: monitorar erros de JS em produção
- [ ] **Pixel da Meta e GA4**: implementar `trackConversion()` (`Lead` e `Schedule`)
