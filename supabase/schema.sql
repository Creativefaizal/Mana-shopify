-- ---------------------------------------------------------------------------
-- Mana :: Supabase schema
-- Run this file in Supabase dashboard -> SQL Editor -> New query -> Run.
-- It is idempotent, so re-running it is safe.
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- --------------------------------------------------------------- categories
create table if not exists public.categories (
  slug       text primary key,
  name       text not null,
  label      text not null,
  icon       text not null default 'Package',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------- products
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  description      text,
  category         text not null references public.categories (slug) on update cascade,
  category_name    text not null,
  price            numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  rating           numeric(2, 1) not null default 5.0 check (rating >= 0 and rating <= 5),
  reviews_count    integer not null default 0 check (reviews_count >= 0),
  image_url        text not null default '/products/phone-holder.svg',
  stock            integer not null default 0 check (stock >= 0),
  is_new           boolean not null default false,
  is_best_seller   boolean not null default false,
  sort_index       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx     on public.products (sort_index);
create index if not exists products_flags_idx    on public.products (is_new, is_best_seller);
create index if not exists products_created_idx  on public.products (created_at desc);

-- ----------------------------------------------------------------- profiles
-- Mirrors auth.users for the subset of fields the storefront needs.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- orders
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,
  user_id         uuid references auth.users (id) on delete set null,
  email           text not null,
  full_name       text not null,
  phone           text,
  address_line1   text not null,
  address_line2   text,
  city            text not null,
  state           text,
  postal_code     text not null,
  country         text not null,
  subtotal        numeric(10, 2) not null default 0,
  shipping_fee    numeric(10, 2) not null default 0,
  tax_total       numeric(10, 2) not null default 0,
  discount_total  numeric(10, 2) not null default 0,
  total           numeric(10, 2) not null default 0,
  status          text not null default 'pending'
                  check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method  text not null default 'bank_transfer'
                  check (payment_method in ('bank_transfer', 'pay_on_delivery')),
  shipping_method text not null default 'standard',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_user_idx  on public.orders (user_id, created_at desc);
create index if not exists orders_email_idx on public.orders (email);

-- -------------------------------------------------------------- order_items
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  image_url    text,
  unit_price   numeric(10, 2) not null,
  quantity     integer not null check (quantity > 0),
  line_total   numeric(10, 2) not null,
  created_at   timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ------------------------------------------------- newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text default 'site',
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- email_log
create table if not exists public.email_log (
  id           uuid primary key default gen_random_uuid(),
  to_email     text not null,
  subject      text not null,
  template     text,
  status       text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  provider_id  text,
  error        text,
  order_number text,
  created_at   timestamptz not null default now()
);

create index if not exists email_log_created_idx on public.email_log (created_at desc);

-- ------------------------------------------------------- updated_at helper
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------- profile row for every new user
-- Google supplies full_name / name / avatar_url in raw_user_meta_data, so the
-- account page has something to render immediately after the first sign in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------- RLS --
-- The catalogue is world readable. Everything that belongs to a customer is
-- readable only by that customer. All writes to orders happen server side with
-- the service-role key, which bypasses RLS by design.
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.profiles               enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.email_log              enable row level security;

drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories
  for select using (true);

drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products
  for select using (true);

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own profile write" on public.profiles;
create policy "own profile write" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "own order items read" on public.order_items;
create policy "own order items read" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;
create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- email_log intentionally has no client policy: it is a server-side audit trail.
