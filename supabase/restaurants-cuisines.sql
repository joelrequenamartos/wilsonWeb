-- Lista de cocinas (las pestañas del filtro de restaurantes) editable desde el panel.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- (Requiere haber ejecutado antes supabase/schema.sql y supabase/restaurants.sql.)
create table if not exists public.cuisines (
  id         text primary key,            -- clave interna (la usan los restaurantes), p. ej. 'pizza'
  label      text not null,               -- texto de la pestaña, p. ej. 'Pizza'
  position   integer,                     -- orden de las pestañas
  created_at timestamptz not null default now()
);

alter table public.cuisines enable row level security;

drop policy if exists "publico lee las cocinas" on public.cuisines;
create policy "publico lee las cocinas" on public.cuisines for select using (true);

drop policy if exists "admin crea cocinas" on public.cuisines;
create policy "admin crea cocinas" on public.cuisines for insert to authenticated with check (public.is_admin());

drop policy if exists "admin edita cocinas" on public.cuisines;
create policy "admin edita cocinas" on public.cuisines for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra cocinas" on public.cuisines;
create policy "admin borra cocinas" on public.cuisines for delete to authenticated using (public.is_admin());

insert into public.cuisines (id, label, position) values
  ('pizza',    'Pizza',     1),
  ('mexicana', 'Mexicana',  2),
  ('italiana', 'Italiana',  3),
  ('americana','Americana', 4),
  ('asiatica', 'Asiática',  5)
on conflict (id) do nothing;
