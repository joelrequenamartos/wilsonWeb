-- Eventos mensuales del blog: dos columnas nuevas en las entradas y una regla para que solo una entrada los tenga activos.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.

-- 1) Columnas nuevas ------------------------------------------------------------------------
--    monthly_events: la entrada tiene activa la lista «Eventos mensuales».
--    events: los eventos, como lista JSON: [{ "date": "2026-10-11", "title": "...", "subtitle": "...", "link": "https://..." }]
alter table public.posts add column if not exists monthly_events boolean not null default false;
alter table public.posts add column if not exists events jsonb not null default '[]'::jsonb;

-- 2) Solo una entrada con «Eventos mensuales» activo ------------------------------------------
--    Al activarlo en una entrada, se desactiva solo en la que lo tuviera antes (sus eventos se conservan guardados).
create or replace function public.one_monthly_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.monthly_events then
    update public.posts set monthly_events = false where id <> new.id and monthly_events;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_one_monthly_events on public.posts;
create trigger posts_one_monthly_events
  before insert or update of monthly_events on public.posts
  for each row execute function public.one_monthly_events();
