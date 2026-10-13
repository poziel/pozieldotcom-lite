-- Only needed if the original finite-board schema was already installed.
begin;
alter table public.visitor_notes drop constraint visitor_notes_x_check;
alter table public.visitor_notes drop constraint visitor_notes_y_check;
alter table public.visitor_notes add constraint visitor_notes_x_check check (x between -1000000 and 1000000);
alter table public.visitor_notes add constraint visitor_notes_y_check check (y between -1000000 and 1000000);
commit;
