-- Actividades (entradas, excursiones, experiencias) de la página /actividades.
-- Silver Tours NY solo informa y redirige: cada actividad lleva el enlace a la web donde se reserva.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- (Requiere haber ejecutado antes supabase/schema.sql, que crea is_admin(), set_updated_at() y el bucket «blog-images».)

-- 1) Tabla ------------------------------------------------------------------------------------
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 140),
  description  text not null default '' check (char_length(description) <= 500),
  image        text,                                   -- foto principal
  tag          text not null default '' check (char_length(tag) <= 40),        -- etiqueta, p. ej. «Entradas»
  highlight    text not null default '' check (char_length(highlight) <= 60),  -- texto en verde, p. ej. «Cancelación gratuita»
  free         boolean not null default false,         -- «Gratis» en vez de precio
  price        numeric(10,2) check (price is null or price >= 0),
  old_price    numeric(10,2) check (old_price is null or old_price >= 0),     -- precio anterior tachado (opcional)
  price_from   boolean not null default true,          -- muestra «desde» encima del precio
  currency     text not null default '$' check (currency in ('$', '€')),
  link         text not null default '' check (char_length(link) <= 600),     -- web a la que lleva la tarjeta
  published    boolean not null default false,         -- false = borrador (no se ve en la web)
  position     integer,                                -- orden manual (número más bajo = más arriba)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists activities_updated_at on public.activities;
create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- Las nuevas entran arriba del todo
create or replace function public.set_activity_position() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.position is null then
    select coalesce(min(position), 1) - 1 into new.position from public.activities;
  end if;
  return new;
end;
$$;

drop trigger if exists activities_set_position on public.activities;
create trigger activities_set_position
  before insert on public.activities
  for each row execute function public.set_activity_position();

-- Fotos extra del carrusel de la ventana (la portada va aparte, en «image»). Si la tabla ya existía, se añade aquí.
alter table public.activities add column if not exists gallery jsonb not null default '[]'::jsonb;

-- 2) Permisos ---------------------------------------------------------------------------------
alter table public.activities enable row level security;

drop policy if exists "publico lee actividades publicadas" on public.activities;
create policy "publico lee actividades publicadas" on public.activities
  for select using (published);

drop policy if exists "admin lee actividades" on public.activities;
create policy "admin lee actividades" on public.activities
  for select to authenticated using (public.is_admin());

drop policy if exists "admin crea actividades" on public.activities;
create policy "admin crea actividades" on public.activities
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin edita actividades" on public.activities;
create policy "admin edita actividades" on public.activities
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra actividades" on public.activities;
create policy "admin borra actividades" on public.activities
  for delete to authenticated using (public.is_admin());
