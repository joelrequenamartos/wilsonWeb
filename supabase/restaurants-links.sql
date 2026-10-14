-- Enlace propio de cada restaurante y promoción con ventana emergente.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
alter table public.restaurants add column if not exists website text;
alter table public.restaurants add column if not exists has_promo boolean not null default false;
alter table public.restaurants add column if not exists promo_html text;
