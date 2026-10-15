-- Solicitudes de restaurantes enviadas desde la página pública /registro-restaurante.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- (Requiere haber ejecutado antes supabase/schema.sql, que crea la función is_admin() y el bucket «blog-images».)

-- 1) Tabla ------------------------------------------------------------------------------------
create table if not exists public.restaurant_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  status         text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'descartada')),
  name           text not null check (char_length(name) between 1 and 120),
  cuisine        text not null default '' check (char_length(cuisine) <= 80),
  neighborhood   text not null default '' check (char_length(neighborhood) <= 80),
  price          text not null default '$$' check (price in ('$', '$$', '$$$')),
  note           text not null default '' check (char_length(note) <= 600),
  website        text not null default '' check (char_length(website) <= 300),
  logo           text check (logo is null or char_length(logo) <= 500),
  photo          text check (photo is null or char_length(photo) <= 500),
  contact_name   text not null default '' check (char_length(contact_name) <= 120),
  contact_email  text not null default '' check (char_length(contact_email) <= 200),
  contact_phone  text not null default '' check (char_length(contact_phone) <= 60),
  restaurant_id  text                                    -- restaurante creado a partir de esta solicitud
);

alter table public.restaurant_requests enable row level security;

-- Cualquiera puede enviar una solicitud (siempre «pendiente»), pero solo el administrador puede verlas.
drop policy if exists "cualquiera envia solicitudes" on public.restaurant_requests;
create policy "cualquiera envia solicitudes" on public.restaurant_requests
  for insert to anon, authenticated
  with check (status = 'pendiente' and restaurant_id is null);

drop policy if exists "admin lee solicitudes" on public.restaurant_requests;
create policy "admin lee solicitudes" on public.restaurant_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "admin edita solicitudes" on public.restaurant_requests;
create policy "admin edita solicitudes" on public.restaurant_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra solicitudes" on public.restaurant_requests;
create policy "admin borra solicitudes" on public.restaurant_requests
  for delete to authenticated using (public.is_admin());

-- 2) Imágenes: los restaurantes pueden subir su logo y su foto SOLO a la carpeta «solicitudes/» ------
drop policy if exists "solicitudes suben imagenes" on storage.objects;
create policy "solicitudes suben imagenes" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'blog-images' and (storage.foldername(name))[1] = 'solicitudes');
