-- Estado de publicación de la web: cuenta los cambios guardados que aún no se han publicado.
-- Con esto, el panel NO reconstruye la web al guardar: solo cuando se pulsa «Actualizar web».
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- (Requiere haber ejecutado antes supabase/schema.sql, que crea la función is_admin().)

-- 1) Tabla de una sola fila -------------------------------------------------------------------
create table if not exists public.site_state (
  id                 boolean primary key default true check (id),  -- solo puede existir una fila
  pending            integer not null default 0,                   -- cambios guardados sin publicar
  last_change_at     timestamptz,
  last_published_at  timestamptz
);

insert into public.site_state (id) values (true) on conflict (id) do nothing;

alter table public.site_state enable row level security;

drop policy if exists "admin lee el estado" on public.site_state;
create policy "admin lee el estado" on public.site_state
  for select to authenticated using (public.is_admin());

-- 2) Funciones: sumar un cambio / marcar como publicado -----------------------------------------
create or replace function public.mark_site_dirty() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not admin';
  end if;
  update public.site_state set pending = pending + 1, last_change_at = now() where id;
end;
$$;

create or replace function public.mark_site_published() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not admin';
  end if;
  update public.site_state set pending = 0, last_published_at = now() where id;
end;
$$;

revoke all on function public.mark_site_dirty() from public, anon;
revoke all on function public.mark_site_published() from public, anon;
grant execute on function public.mark_site_dirty() to authenticated;
grant execute on function public.mark_site_published() to authenticated;
