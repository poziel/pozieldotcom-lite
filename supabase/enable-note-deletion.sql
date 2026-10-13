begin;
create function public.delete_visitor_note(note_id uuid, owner_hash text)
returns uuid
language plpgsql security invoker set search_path = '' as $$
declare deleted_id uuid;
begin
  if owner_hash is null or owner_hash !~ '^[a-f0-9]{64}$' then raise exception 'NOT_OWNER'; end if;
  delete from public.visitor_notes where id = note_id and creator_hash = owner_hash returning id into deleted_id;
  if not found then raise exception 'NOT_OWNER'; end if;
  return deleted_id;
end;
$$;
revoke all on function public.delete_visitor_note(uuid, text) from public, anon, authenticated;
grant execute on function public.delete_visitor_note(uuid, text) to service_role;
commit;
