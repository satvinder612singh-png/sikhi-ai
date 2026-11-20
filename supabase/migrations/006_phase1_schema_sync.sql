-- 006_phase1_schema_sync.sql
-- Idempotent Phase 1 schema sync for Learn Sikhi.
-- Ensures all dedicated tables (articles, sikhinterest_posts, post_comments,
-- post_likes, profiles, reshares, site_state) and required columns exist.

-- 1. Site State (strictly for lightweight UI/frame positioning settings)
create table if not exists public.site_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. SikhStacks Articles
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary_short text not null default '',
  content_markdown text not null default '',
  cover_image_url text,
  author_id text,
  author_name text not null default 'Sangat Contributor',
  source_name text not null default 'SikhStacks Original',
  source_url text,
  category text not null default 'Research & Essay',
  tags text[] not null default '{}',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles add column if not exists summary_short text not null default '';
alter table public.articles add column if not exists content_markdown text not null default '';
alter table public.articles add column if not exists cover_image_url text;
alter table public.articles add column if not exists author_id text;
alter table public.articles add column if not exists author_name text not null default 'Sangat Contributor';
alter table public.articles add column if not exists source_name text not null default 'SikhStacks Original';
alter table public.articles add column if not exists source_url text;
alter table public.articles add column if not exists category text not null default 'Research & Essay';
alter table public.articles add column if not exists tags text[] not null default '{}';
alter table public.articles add column if not exists status text not null default 'published';

-- 3. SikhInterest Artworks / Visual Posts
create table if not exists public.sikhinterest_posts (
  id uuid primary key default gen_random_uuid(),
  author_id text,
  author_name text not null default 'Sangat Artist',
  author_handle text,
  title text not null,
  description text not null default '',
  category text not null default 'Sikh Art & Miniature',
  gurmukhi_calligraphy text,
  image_url text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Threaded Post Comments
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  author_id text,
  author_name text not null default 'Sangat Member',
  body text not null,
  upvotes integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_id_created
  on public.post_comments (post_id, created_at asc);

-- 5. Post Likes
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- 6. User Profiles with Social Links
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

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_name text not null default 'Sangat Member';
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists instagram_url text;
alter table public.profiles add column if not exists linkedin_url text;
alter table public.profiles add column if not exists x_url text;
alter table public.profiles add column if not exists substack_url text;
alter table public.profiles add column if not exists website_url text;

create index if not exists idx_profiles_username on public.profiles (username);

-- 7. Reshares with Comment
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

-- Enable RLS & Public Read Policies (mutations are performed server-side via SUPABASE_SERVICE_ROLE_KEY)
alter table public.site_state enable row level security;
alter table public.articles enable row level security;
alter table public.sikhinterest_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.profiles enable row level security;
alter table public.reshares enable row level security;

drop policy if exists "Public can read site_state" on public.site_state;
create policy "Public can read site_state" on public.site_state for select using (true);

drop policy if exists "Public can read articles" on public.articles;
create policy "Public can read articles" on public.articles for select using (true);

drop policy if exists "Public can read sikhinterest_posts" on public.sikhinterest_posts;
create policy "Public can read sikhinterest_posts" on public.sikhinterest_posts for select using (true);

drop policy if exists "Public can read post_comments" on public.post_comments;
create policy "Public can read post_comments" on public.post_comments for select using (true);

drop policy if exists "Public can read post_likes" on public.post_likes;
create policy "Public can read post_likes" on public.post_likes for select using (true);

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles" on public.profiles for select using (true);

drop policy if exists "Public can read reshares" on public.reshares;
create policy "Public can read reshares" on public.reshares for select using (true);
