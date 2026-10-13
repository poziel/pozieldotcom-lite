-- For an existing board only. Existing notes have no recoverable owner and stay read-only.
begin;
alter table public.visitor_notes add column creator_hash text check (creator_hash ~ '^[a-f0-9]{64}$');
alter table public.visitor_notes add column updated_at timestamptz not null default now();
grant update on public.visitor_notes to service_role;
drop function public.pin_visitor_note(text, text, text, integer, integer);
create function public.pin_visitor_note(note_message text, note_author text, note_color text, note_x integer, note_y integer, owner_hash text)
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
  insert into public.visitor_notes (message, author, color, x, y, creator_hash)
    values (note_message, note_author, note_color, note_x, note_y, owner_hash)
    returning * into result;
  return result;
end;
$$;
revoke all on function public.pin_visitor_note(text, text, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.pin_visitor_note(text, text, text, integer, integer, text) to service_role;

create function public.edit_visitor_note(note_id uuid, note_message text, note_author text, note_color text, note_x integer, note_y integer, owner_hash text)
returns public.visitor_notes
language plpgsql security invoker set search_path = '' as $$
declare result public.visitor_notes;
begin
  if owner_hash is null or owner_hash !~ '^[a-f0-9]{64}$' then raise exception 'NOT_OWNER'; end if;
  -- Ownership and update happen in one statement. Client flags are never consulted.
  update public.visitor_notes
    set message = note_message, author = note_author, color = note_color,
        x = note_x, y = note_y, updated_at = now()
    where id = note_id and creator_hash = owner_hash
    returning * into result;
  if not found then raise exception 'NOT_OWNER'; end if;
  return result;
end;
$$;
revoke all on function public.edit_visitor_note(uuid, text, text, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.edit_visitor_note(uuid, text, text, text, integer, integer, text) to service_role;
commit;
