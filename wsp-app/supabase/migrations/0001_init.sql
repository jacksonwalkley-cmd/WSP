-- WSP schema: one row per athlete in most tables, keyed by auth.uid().
-- Run this in the Supabase SQL Editor (or `supabase db push`) after creating a project.

-- ── Profiles ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  height text default '',
  weight text default '',
  photo_url text,
  strengths text[] not null default '{}',
  flaws text[] not null default '{}',
  theme text not null default '#B8AFA0',
  streak int not null default 0,
  current_block int not null default 1,
  current_week int not null default 1,
  snap_day_count int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Snap logs (one row per rep) ─────────────────────────────────────
create table if not exists public.snap_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  stage int not null,
  distance text not null,
  rep int not null,
  spiral text,
  time_seconds numeric,
  video_path text
);

alter table public.snap_logs enable row level security;

create policy "snap_logs_all_own" on public.snap_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists snap_logs_user_idx on public.snap_logs (user_id, logged_at desc);

-- ── Lift logs (append-only history, one row per logged set) ────────
create table if not exists public.lift_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_name text not null,
  lift_name text not null,
  weight text,
  reps text,
  logged_at timestamptz not null default now()
);

alter table public.lift_logs enable row level security;

create policy "lift_logs_all_own" on public.lift_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists lift_logs_user_idx on public.lift_logs (user_id, day_name, lift_name, logged_at desc);

-- ── Recovery check-ins (one per day) ────────────────────────────────
create table if not exists public.recovery_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep int not null,
  soreness int not null,
  energy int not null,
  mood int not null,
  notes text default '',
  logged_at timestamptz not null default now()
);

alter table public.recovery_checkins enable row level security;

create policy "recovery_all_own" on public.recovery_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists recovery_user_idx on public.recovery_checkins (user_id, logged_at desc);

-- ── Coach chat messages ──────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user','ai')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_all_own" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists chat_user_idx on public.chat_messages (user_id, created_at asc);

-- ── Storage bucket for snap videos + profile photos ─────────────────
insert into storage.buckets (id, name, public)
values ('wsp-media', 'wsp-media', false)
on conflict (id) do nothing;

-- Athletes can only read/write inside a folder named after their own user id,
-- e.g. wsp-media/<user_id>/snaps/xyz.mp4
create policy "wsp_media_select_own" on storage.objects
  for select using (bucket_id = 'wsp-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wsp_media_insert_own" on storage.objects
  for insert with check (bucket_id = 'wsp-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wsp_media_update_own" on storage.objects
  for update using (bucket_id = 'wsp-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wsp_media_delete_own" on storage.objects
  for delete using (bucket_id = 'wsp-media' and (storage.foldername(name))[1] = auth.uid()::text);
