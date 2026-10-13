-- Only needed for a board installed before custom colors.
begin;
alter table public.visitor_notes drop constraint visitor_notes_color_check;
alter table public.visitor_notes add constraint visitor_notes_color_check
  check (color in ('butter', 'rose', 'lavender', 'mint', 'sky', 'peach') or color ~ '^#[0-9a-fA-F]{6}$');
commit;
