-- Orden manual de las entradas del blog: columna «position» (número más bajo = más arriba).
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.

-- 1) Columna ---------------------------------------------------------------------------------
alter table public.posts add column if not exists position integer;

-- 2) Orden inicial = orden de creación (la última creada, arriba). Solo rellena las que no tienen posición.
with ordenadas as (
  select id, row_number() over (order by created_at desc, published_at desc) as rn
  from public.posts
  where position is null
)
update public.posts p
set position = o.rn
from ordenadas o
where p.id = o.id;

-- 3) Las entradas nuevas entran arriba del todo ------------------------------------------------
create or replace function public.set_post_position() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.position is null then
    select coalesce(min(position), 1) - 1 into new.position from public.posts;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_set_position on public.posts;
create trigger posts_set_position
  before insert on public.posts
  for each row execute function public.set_post_position();
