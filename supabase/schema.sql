-- Blog de Silver Tours NY: tablas, permisos y almacén de imágenes.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
--
-- ANTES DE EJECUTAR: cambia 'CAMBIA-ESTE-CORREO@gmail.com' (última sección) por el correo del usuario admin
-- que creaste en Authentication → Users. Solo ese correo podrá crear, editar y borrar entradas.

-- 1) Entradas del blog ----------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text not null default '',
  content       text not null default '',
  author        text not null default 'Wilson Silver',
  image         text,
  featured      boolean not null default false,
  published     boolean not null default false,
  published_at  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- 2) Quién es administrador ---------------------------------------------------------------
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security; -- sin políticas: nadie puede leerla desde la web

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3) Permisos de las entradas ---------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "publico lee las publicadas" on public.posts;
create policy "publico lee las publicadas" on public.posts
  for select using (published = true);

drop policy if exists "admin lee todo" on public.posts;
create policy "admin lee todo" on public.posts
  for select to authenticated using (public.is_admin());

drop policy if exists "admin crea" on public.posts;
create policy "admin crea" on public.posts
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin edita" on public.posts;
create policy "admin edita" on public.posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra" on public.posts;
create policy "admin borra" on public.posts
  for delete to authenticated using (public.is_admin());

-- 4) Almacén de imágenes (público para leer; solo el admin sube) -----------------------------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "imagenes del blog: lectura publica" on storage.objects;
create policy "imagenes del blog: lectura publica" on storage.objects
  for select using (bucket_id = 'blog-images');

drop policy if exists "imagenes del blog: admin sube" on storage.objects;
create policy "imagenes del blog: admin sube" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "imagenes del blog: admin edita" on storage.objects;
create policy "imagenes del blog: admin edita" on storage.objects
  for update to authenticated using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "imagenes del blog: admin borra" on storage.objects;
create policy "imagenes del blog: admin borra" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images' and public.is_admin());

-- 5) Tu correo de administrador (CÁMBIALO) ---------------------------------------------------
insert into public.admin_emails (email) values ('admin@silvertours.com')
on conflict do nothing;
