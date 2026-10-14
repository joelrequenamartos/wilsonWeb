-- Ajuste de las imágenes de cada restaurante (zoom y posición del logo y de la foto de comida).
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
alter table public.restaurants add column if not exists img_adjust jsonb;
