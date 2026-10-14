-- Restaurantes administrables desde /adminrestaurantes: tabla, permisos y los 20 restaurantes actuales.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- (Requiere haber ejecutado antes supabase/schema.sql, que crea is_admin() y set_updated_at().)

-- 1) Tabla -----------------------------------------------------------------------------------
create table if not exists public.restaurants (
  id             text primary key,                  -- identificador, por ejemplo 'napolis-corner'
  name           text not null,
  cuisine        text not null,                     -- grupo del filtro: pizza | mexicana | italiana | americana | asiatica
  cuisine_label  text not null default '',          -- etiqueta que se ve en la tarjeta (Japonesa, China…)
  neighborhood   text not null default '',          -- barrio (se muestra con 📍)
  price          text not null default '$$',        -- $ | $$ | $$$
  note           text not null default '',          -- descripción corta
  logo           text,                              -- dirección de la imagen del logo
  banner         text,                              -- dirección de la foto de comida
  art            text not null default 'art-food1', -- degradado de respaldo cuando no hay foto
  featured_rank  smallint check (featured_rank between 1 and 3),  -- puesto en el banner destacado de la home (1-3)
  published      boolean not null default true,     -- visible en la web
  position       integer,                           -- orden manual (número más bajo = más arriba)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists restaurants_updated_at on public.restaurants;
create trigger restaurants_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();

-- 2) Un restaurante nuevo entra al final de la lista -----------------------------------------
create or replace function public.set_restaurant_position() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.position is null then
    select coalesce(max(position), 0) + 1 into new.position from public.restaurants;
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_set_position on public.restaurants;
create trigger restaurants_set_position before insert on public.restaurants
  for each row execute function public.set_restaurant_position();

-- 3) Cada puesto del banner (1, 2, 3) solo lo tiene un restaurante: al asignarlo, se lo quita al anterior
create or replace function public.one_featured_rank() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.featured_rank is not null then
    update public.restaurants set featured_rank = null where id <> new.id and featured_rank = new.featured_rank;
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_one_featured_rank on public.restaurants;
create trigger restaurants_one_featured_rank before insert or update of featured_rank on public.restaurants
  for each row execute function public.one_featured_rank();

-- 4) Permisos: el público solo lee los visibles; solo el administrador escribe -----------------
-- Ajuste de imágenes (zoom y posición del logo y de la foto)
alter table public.restaurants add column if not exists img_adjust jsonb;

alter table public.restaurants enable row level security;

drop policy if exists "publico lee los visibles" on public.restaurants;
create policy "publico lee los visibles" on public.restaurants
  for select using (published = true);

drop policy if exists "admin lee todos" on public.restaurants;
create policy "admin lee todos" on public.restaurants
  for select to authenticated using (public.is_admin());

drop policy if exists "admin crea restaurantes" on public.restaurants;
create policy "admin crea restaurantes" on public.restaurants
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin edita restaurantes" on public.restaurants;
create policy "admin edita restaurantes" on public.restaurants
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra restaurantes" on public.restaurants;
create policy "admin borra restaurantes" on public.restaurants
  for delete to authenticated using (public.is_admin());

-- 5) Los restaurantes que ya tenía la web (no pisa los que ya existan) ----------------------------
insert into public.restaurants (id, name, cuisine, cuisine_label, neighborhood, price, note, art, featured_rank, published, position) values
  ('napolis-corner', 'Napoli''s Corner', 'pizza', 'Pizza', 'Little Italy', '$$', 'Horno de leña y masa madre de 48 horas. La slice clásica de Nueva York.', 'art-food1', null, true, 1),
  ('ember-and-crust', 'Ember & Crust', 'pizza', 'Pizza', 'Harlem', '$$', 'Pizza al fuego de leña a pasos del Apollo Theater.', 'art-food2', null, true, 2),
  ('bronx-slice-house', 'Bronx Slice House', 'pizza', 'Pizza', 'Bronx', '$', 'La porción gigante de rigor antes de entrar a Yankee Stadium.', 'art-food3', null, true, 3),
  ('tonys-brick-oven', 'Tony''s Brick Oven', 'pizza', 'Pizza', 'Midtown', '$$', 'Pizzería clásica de barrio, en el mismo horno desde 1978.', 'art-food1', null, true, 4),
  ('casa-jalisco', 'Casa Jalisco', 'mexicana', 'Mexicana', 'East Harlem', '$$', 'Tacos al pastor cortados al trompo y mezcal artesanal.', 'art-food2', null, true, 5),
  ('el-fogon-del-bronx', 'El Fogón del Bronx', 'mexicana', 'Mexicana', 'Bronx', '$', 'Tacos de canasta y salsas caseras, receta de familia de Guadalajara.', 'art-food3', null, true, 6),
  ('taqueria-sol', 'Taquería Sol', 'mexicana', 'Mexicana', 'Midtown', '$$', 'Birria y tacos de barbacoa, con consomé para mojar hasta el final.', 'art-food1', null, true, 7),
  ('cantina-roosevelt', 'Cantina Roosevelt', 'mexicana', 'Mexicana', 'Roosevelt Island', '$$', 'Margaritas con vista al East River, perfecto para cerrar el free tour.', 'art-food2', null, true, 8),
  ('trattoria-rosa', 'Trattoria Rosa', 'italiana', 'Italiana', 'Little Italy', '$$$', 'Pasta fresca hecha a mano cada mañana, receta de familia siciliana.', 'art-food3', null, true, 9),
  ('nonnas-table', 'Nonna''s Table', 'italiana', 'Italiana', 'Upper East Side', '$$$', 'La receta de la abuela, sin cambios, desde hace tres generaciones.', 'art-food1', 1, true, 10),
  ('via-roma', 'Via Roma', 'italiana', 'Italiana', 'Chelsea', '$$', 'Risottos de temporada y una carta de vinos 100% italiana.', 'art-food2', null, true, 11),
  ('little-italy-osteria', 'Little Italy Osteria', 'italiana', 'Italiana', 'Little Italy', '$$$', 'El clásico del barrio, con la misma carta desde 1952.', 'art-food3', null, true, 12),
  ('44th-and-vine', '44th & Vine', 'americana', 'Americana', 'Midtown', '$$$', 'El descanso ideal a mitad de la Maratón de Wilson, con vista a la ciudad.', 'art-food1', 3, true, 13),
  ('yankee-clipper-grill', 'Yankee Clipper Grill', 'americana', 'Americana', 'Bronx', '$$', 'Pre y post partido: alitas, pantallas gigantes y ambiente de estadio.', 'art-food2', null, true, 14),
  ('liberty-diner', 'Liberty Diner', 'americana', 'Americana', 'Downtown', '$$', 'Diner clásico abierto 24 horas: hamburguesas, malteadas y neón de verdad.', 'art-food3', null, true, 15),
  ('harlem-soul-kitchen', 'Harlem Soul Kitchen', 'americana', 'Americana', 'Harlem', '$$', 'Costillas y mac and cheese, la parada obligada tras la misa góspel.', 'art-food1', null, true, 16),
  ('golden-dragon', 'Golden Dragon', 'asiatica', 'China', 'Chinatown', '$$', 'Dim sum de fin de semana en carritos: siempre hay fila y siempre vale la pena.', 'art-food2', null, true, 17),
  ('sakura-sushi-bar', 'Sakura Sushi Bar', 'asiatica', 'Japonesa', 'Midtown', '$$$', 'Omakase accesible con pescado fresco traído cada madrugada.', 'art-food3', 2, true, 18),
  ('bangkok-street', 'Bangkok Street', 'asiatica', 'Tailandesa', 'Hell''s Kitchen', '$$', 'Pad thai y curry picante estilo callejero, tan picante como en Bangkok.', 'art-food1', null, true, 19),
  ('seoul-garden', 'Seoul Garden', 'asiatica', 'Coreana', 'Koreatown', '$$', 'BBQ coreano a la mesa con parrilla propia y kimchi fermentado en casa.', 'art-food2', null, true, 20)
on conflict (id) do nothing;

-- Las fotos (logo y foto de comida) se suben desde el panel al almacén «blog-images» que ya existe.
