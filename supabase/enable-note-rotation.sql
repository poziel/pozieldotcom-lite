-- Existing board upgrade. Preserve all saved content and default existing notes to upright.
begin;
alter table public.visitor_notes add column angle real not null default 0 check (angle between -180 and 180);
drop function public.pin_visitor_note(text, text, text, integer, integer, text);
drop function public.edit_visitor_note(uuid, text, text, text, integer, integer, text);
create function public.pin_visitor_note(note_message text, note_author text, note_color text, note_x integer, note_y integer, owner_hash text, note_angle real default 0)
returns public.visitor_notes
language plpgsql security invoker set search_path = '' as $$
declare result public.visitor_notes;
begin
  if owner_hash is null or owner_hash !~ '^[a-f0-9]{64}$' then raise exception 'NOT_OWNER'; end if;
  -- Serialize quota checks and inserts to prevent concurrent requests bypassing them.
  perform pg_advisory_xact_lock(7131042);
  if (select count(*) from public.visitor_notes) >= 1000 then
    raise exception 'BOARD_FULL';
  end if;
  if (select count(*) from public.visitor_notes where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'RATE_LIMITED';
  end if;
  insert into public.visitor_notes (message, author, color, x, y, creator_hash, angle)
    values (note_message, note_author, note_color, note_x, note_y, owner_hash, note_angle)
    returning * into result;
  return result;
end;
$$;
revoke all on function public.pin_visitor_note(text, text, text, integer, integer, text, real) from public, anon, authenticated;
grant execute on function public.pin_visitor_note(text, text, text, integer, integer, text, real) to service_role;
create function public.edit_visitor_note(note_id uuid, note_message text, note_author text, note_color text, note_x integer, note_y integer, owner_hash text, note_angle real default 0)
returns public.visitor_notes
language plpgsql security invoker set search_path = '' as $$
declare result public.visitor_notes;
begin
  if owner_hash is null or owner_hash !~ '^[a-f0-9]{64}$' then raise exception 'NOT_OWNER'; end if;
  -- Ownership and update happen in one statement. Client flags are never consulted.
  update public.visitor_notes
    set message = note_message, author = note_author, color = note_color,
        x = note_x, y = note_y, angle = note_angle, updated_at = now()
    where id = note_id and creator_hash = owner_hash
    returning * into result;
  if not found then raise exception 'NOT_OWNER'; end if;
  return result;
end;
$$;
revoke all on function public.edit_visitor_note(uuid, text, text, text, integer, integer, text, real) from public, anon, authenticated;
grant execute on function public.edit_visitor_note(uuid, text, text, text, integer, integer, text, real) to service_role;

commit;
