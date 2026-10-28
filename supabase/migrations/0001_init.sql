-- Shine: schema inicial. Rode no Supabase: SQL Editor > New query > colar > Run.

create extension if not exists pgcrypto;

-- ============ PERFIS ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  telefone text,
  cpf text,
  cep text, rua text, numero text, complemento text, bairro text, cidade text, uf text,
  role text not null default 'cliente' check (role in ('cliente','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome, telefone)
  values (new.id, new.email, new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'telefone');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ CATÁLOGO ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  material text,
  sku text,
  category_id uuid references public.categories(id) on delete set null,
  preco numeric(10,2) not null check (preco >= 0),
  preco_promocional numeric(10,2) check (preco_promocional is null or preco_promocional >= 0),
  estoque integer not null default 0 check (estoque >= 0),
  ativo boolean not null default true,
  destaque boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.products (category_id);
create index on public.products (ativo, created_at desc);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  posicao integer not null default 0
);
create index on public.product_images (product_id, posicao);

-- ============ PEDIDOS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento','pago','separando','enviado','entregue','cancelado')),
  subtotal numeric(10,2) not null,
  frete numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  frete_servico text,
  endereco jsonb not null,
  codigo_rastreio text,
  mp_preference_id text,
  mp_payment_id text,
  estoque_baixado boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  nome text not null,
  preco numeric(10,2) not null,
  quantidade integer not null check (quantidade > 0)
);
create index on public.order_items (order_id);

-- Confirma pagamento e baixa estoque, uma única vez (idempotente). Só o service_role executa.
create or replace function public.confirm_order_payment(p_order uuid, p_payment text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then return; end if;
  if not o.estoque_baixado then
    update public.products p
       set estoque = greatest(0, p.estoque - i.quantidade)
      from public.order_items i
     where i.order_id = o.id and i.product_id = p.id;
  end if;
  update public.orders
     set estoque_baixado = true,
         mp_payment_id = p_payment,
         status = case when status = 'aguardando_pagamento' then 'pago' else status end
   where id = o.id;
end $$;
revoke all on function public.confirm_order_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.confirm_order_payment(uuid, text) to service_role;

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "perfil: ver o próprio ou admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "perfil: editar o próprio" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- cliente não pode mudar role/email/id:
revoke update on public.profiles from authenticated, anon;
grant update (nome, telefone, cpf, cep, rua, numero, complemento, bairro, cidade, uf)
  on public.profiles to authenticated;

create policy "categorias: leitura pública" on public.categories for select using (true);
create policy "categorias: admin escreve" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "produtos: ativos públicos, admin vê tudo" on public.products for select
  using (ativo or public.is_admin());
create policy "produtos: admin escreve" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "fotos: leitura pública" on public.product_images for select using (true);
create policy "fotos: admin escreve" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

create policy "pedidos: ver os próprios ou admin" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "pedidos: admin atualiza" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "itens: ver os próprios ou admin" on public.order_items for select
  using (exists (select 1 from public.orders o
                 where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- ============ STORAGE (fotos) ============
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;

create policy "fotos: leitura pública" on storage.objects for select
  using (bucket_id = 'products');
create policy "fotos: admin envia" on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());
create policy "fotos: admin altera" on storage.objects for update
  using (bucket_id = 'products' and public.is_admin());
create policy "fotos: admin apaga" on storage.objects for delete
  using (bucket_id = 'products' and public.is_admin());

-- ============ DADOS INICIAIS ============
insert into public.categories (nome, slug) values
  ('Colares','colares'), ('Brincos','brincos'), ('Pulseiras','pulseiras'),
  ('Anéis','aneis'), ('Pérolas','perolas'), ('Conjuntos','conjuntos')
on conflict do nothing;

-- Depois de criar sua conta no site, torne-se admin (troque o e-mail):
-- update public.profiles set role = 'admin' where email = 'email-da-tia@exemplo.com';
