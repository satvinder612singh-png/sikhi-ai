-- =============================================================================
-- Migration 002: Kirtan Admin Review Queue + SikhInterest & Vichaar (/sangat)
-- =============================================================================

-- 1. Kirtan & Bani Audio Submission Queue (pending_review / approved / rejected)
create table if not exists public.kirtan_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  gurmukhi_title text default '',
  ragi text not null,
  raag text not null,
  category text not null default 'Puratan Kirtan Masters',
  source_url text not null,
  authenticity_notes text not null default '',
  submitted_by text not null default 'Sangat Member',
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.kirtan_submissions enable row level security;

create policy "Anyone can view kirtan submissions"
  on public.kirtan_submissions for select
  using (true);

create policy "Anyone can submit a kirtan track for review"
  on public.kirtan_submissions for insert
  with check (true);

create policy "Authenticated users can update submission status"
  on public.kirtan_submissions for update
  using (auth.role() = 'authenticated');

-- 2. Customizable Researcher & Sangat Profiles
create table if not exists public.sangat_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Sangat Researcher',
  handle text not null default 'sikh_scholar',
  role_badge text not null default 'Independent Sikh Researcher',
  bio text not null default '',
  avatar_preset text not null default 'khanda-crest',
  custom_avatar_data_url text,
  interests text[] not null default array['Gurbani Research', 'Sikh History'],
  updated_at timestamptz not null default now()
);

alter table public.sangat_profiles enable row level security;

create policy "Public read access to sangat_profiles"
  on public.sangat_profiles for select
  using (true);

create policy "Users can upsert their own sangat_profile"
  on public.sangat_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Substack-Style Research & Vichaar Blogs
create table if not exists public.sangat_blogs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_handle text not null,
  author_role text not null default 'Independent Sikh Researcher',
  author_avatar_preset text not null default 'khanda-crest',
  author_custom_avatar text,
  author_bio text not null default '',
  title text not null,
  subtitle text not null default '',
  gurmukhi_header text not null default '',
  topic_tag text not null default 'Gurbani Research',
  reading_time text not null default '5 min read',
  pull_quote text not null default '',
  paragraphs text[] not null default '{}',
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sangat_blogs enable row level security;

create policy "Anyone can read sangat_blogs"
  on public.sangat_blogs for select
  using (true);

create policy "Authenticated users can publish sangat_blogs"
  on public.sangat_blogs for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update likes on sangat_blogs"
  on public.sangat_blogs for update
  using (auth.role() = 'authenticated');

-- 4. Threaded Blog Comments
create table if not exists public.sangat_blog_comments (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.sangat_blogs(id) on delete cascade,
  parent_comment_id uuid references public.sangat_blog_comments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_handle text not null,
  author_role text not null default 'Sangat Member',
  author_avatar_preset text not null default 'ik-onkar-medallion',
  author_custom_avatar text,
  body text not null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sangat_blog_comments enable row level security;

create policy "Anyone can read sangat_blog_comments"
  on public.sangat_blog_comments for select
  using (true);

create policy "Authenticated users can post sangat_blog_comments"
  on public.sangat_blog_comments for insert
  with check (auth.role() = 'authenticated');

-- 5. SikhInterest Visual Pinboard
create table if not exists public.sangat_pins (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_handle text not null,
  author_role text not null default 'Visual Artist',
  author_avatar_preset text not null default 'lotus-amritsar',
  author_custom_avatar text,
  title text not null,
  description text not null,
  category text not null default 'Sikh Art & Miniature',
  gurmukhi_calligraphy text not null default '',
  visual_theme text not null default 'darbar-gold',
  image_data_url text,
  available_to_coordinate boolean not null default false,
  artist_contact_note text not null default '',
  saves_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sangat_pins enable row level security;

create policy "Anyone can read sangat_pins"
  on public.sangat_pins for select
  using (true);

create policy "Authenticated users can create sangat_pins"
  on public.sangat_pins for insert
  with check (auth.role() = 'authenticated');

-- 6. Dil Di Baat (Heart-to-Heart Sangati Expressions)
create table if not exists public.sangat_dil_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_handle text not null,
  author_role text not null default 'Sangat Member',
  author_avatar_preset text not null default 'darbar-lantern',
  author_custom_avatar text,
  mood_tag text not null default '✨ Sharing Happiness / Gratitude',
  title text not null,
  body text not null,
  shabad_gurmukhi text not null default '',
  shabad_english text not null default '',
  shabad_ang text not null default '',
  ardas_count integer not null default 0,
  replies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sangat_dil_posts enable row level security;

create policy "Anyone can read sangat_dil_posts"
  on public.sangat_dil_posts for select
  using (true);

create policy "Authenticated users can create sangat_dil_posts"
  on public.sangat_dil_posts for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can reply or offer Ardas on sangat_dil_posts"
  on public.sangat_dil_posts for update
  using (auth.role() = 'authenticated');
