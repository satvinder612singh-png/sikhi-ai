-- 006_profiles_and_reshares.sql
-- User profiles with social links & Reshare-with-Comment records

create table if not exists public.profiles (
  id text primary key,
  username text unique,
  display_name text not null default 'Sangat Member',
  bio text not null default '',
  instagram_url text,
  linkedin_url text,
  x_url text,
  substack_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_username
  on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (true)
  with check (true);

create table if not exists public.reshares (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_name text not null default 'Sangat Member',
  target_type text not null check (target_type in ('sikhstacks', 'sikhinterest')),
  target_id text not null,
  target_title text not null,
  target_summary text,
  target_image_url text,
  target_author_name text,
  target_author_id text,
  target_category text,
  comment text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_reshares_user_id_created
  on public.reshares (user_id, created_at desc);

alter table public.reshares enable row level security;

drop policy if exists "Public can read reshares" on public.reshares;
create policy "Public can read reshares"
  on public.reshares for select
  using (true);

drop policy if exists "Authenticated can insert reshares" on public.reshares;
create policy "Authenticated can insert reshares"
  on public.reshares for insert
  with check (true);

drop policy if exists "Owners can delete reshares" on public.reshares;
create policy "Owners can delete reshares"
  on public.reshares for delete
  using (true);
