-- Avanttá: tabela dos contatos do formulário do site.
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.

create table if not exists public.leads (
  id              bigint generated always as identity primary key,
  recebido_em     timestamptz not null default now(),
  lead_id         text not null,
  etapa           text not null check (etapa in ('contatos', 'completo')),
  nome            text,
  empresa         text,
  whatsapp        text,
  email           text,
  faturamento     text,
  aceite_contato  boolean,
  investimento    text,
  urgencia        text,
  servico         text,
  link            text,
  rota            text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  gclid           text,
  fbclid          text,
  pagina_origem   text,
  referrer        text,
  criado_em       timestamptz
);

create index if not exists leads_lead_id_idx on public.leads (lead_id);

-- Segurança: o site (chave anon) só consegue INSERIR. Ninguém lê nem altera pelo site.
alter table public.leads enable row level security;
drop policy if exists "site insere contatos" on public.leads;
create policy "site insere contatos" on public.leads
  for insert to anon
  with check (
    char_length(coalesce(nome, '')) <= 200
    and char_length(coalesce(empresa, '')) <= 200
    and char_length(coalesce(email, '')) <= 200
    and char_length(coalesce(link, '')) <= 500
  );
grant insert on public.leads to anon;

-- Visão para o dia a dia: uma linha por contato, com a etapa mais completa.
create or replace view public.leads_ultimos
with (security_invoker = true) as
select distinct on (lead_id) *
from public.leads
order by lead_id, (etapa = 'completo') desc, recebido_em desc;

-- Atualização (formulário com faturamento): se a tabela já existia, rode só esta linha.
alter table public.leads add column if not exists faturamento text;
