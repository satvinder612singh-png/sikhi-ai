-- =============================================================================
-- Migration 004: Articles, Substack Studio, Approved Sikh Sources & Site Media
-- Run this in Supabase SQL Editor to initialize the clean editorial platform.
-- =============================================================================

-- 1. Articles table for In-Page Reader (/articles/[slug]) & Studio (/studio)
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary_short text not null,
  content_markdown text not null,
  cover_image_url text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Learn Sikhi Contributor',
  source_name text not null default 'Learn Sikhi Original',
  source_url text,
  category text not null default 'Gurbani Research',
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_created_idx
  on public.articles (status, created_at desc);

create index if not exists articles_slug_idx
  on public.articles (slug);

alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles for select
  using (status = 'published' or auth.uid() = author_id or auth.role() = 'authenticated');

drop policy if exists "Authenticated writers can insert articles" on public.articles;
create policy "Authenticated writers can insert articles"
  on public.articles for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "Authors and admins can update articles" on public.articles;
create policy "Authors and admins can update articles"
  on public.articles for update
  using (auth.uid() = author_id or auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "Authors and admins can delete articles" on public.articles;
create policy "Authors and admins can delete articles"
  on public.articles for delete
  using (auth.uid() = author_id or auth.role() = 'authenticated' or auth.role() = 'service_role');

-- 2. Clear existing seeded/scraped rows so the platform starts completely clean
truncate table public.articles;

do $$
begin
  if to_regclass('public.news') is not null then
    execute 'truncate table public.news';
  end if;
  if to_regclass('public.feed') is not null then
    execute 'truncate table public.feed';
  end if;
  if to_regclass('public.sangat_blogs') is not null then
    execute 'truncate table public.sangat_blogs cascade';
  end if;
end $$;

-- 3. Curated Sikh Educational Source Whitelist (No generic mainstream news)
create table if not exists public.approved_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  domain text not null unique,
  url text not null,
  rss_url text,
  description text not null default '',
  category text not null default 'Sikh Scholarship',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.approved_sources enable row level security;

drop policy if exists "Public can read active approved_sources" on public.approved_sources;
create policy "Public can read active approved_sources"
  on public.approved_sources for select
  using (is_active = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can manage approved_sources" on public.approved_sources;
create policy "Authenticated admins can manage approved_sources"
  on public.approved_sources for all
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

insert into public.approved_sources (name, domain, url, rss_url, description, category, is_active)
values
  (
    'Bunga Azaadi',
    'bungaazaadi.com',
    'https://bungaazaadi.com',
    'https://bungaazaadi.com/feed',
    'In-depth Sikh political philosophy, sovereignty, colonial history, and Panthic discourse.',
    'Sikh Philosophy & Sovereignty',
    true
  ),
  (
    'Manglacharan',
    'manglacharan.com',
    'https://www.manglacharan.com',
    'https://www.manglacharan.com/feeds/posts/default?alt=rss',
    'Translations and scholarly commentary on classical Braj and Gurmukhi Sikh Granths.',
    'Classical Granth Translations',
    true
  ),
  (
    'Study Sikhi',
    'studysikhi.com',
    'https://studysikhi.com',
    null,
    'Structured Gurmat study guides, Sikh history timelines, and educational curricula.',
    'Sikhi Education',
    true
  ),
  (
    'Sikh Education Council',
    'sikheducationcouncil.org',
    'https://sikheducationcouncil.org',
    null,
    'Dedicated academic and educational initiatives advancing authentic Sikh learning.',
    'Academic Education',
    true
  ),
  (
    'Discover Sikhi',
    'discoversikhi.com',
    'https://www.discoversikhi.com',
    'https://www.discoversikhi.com/feed',
    'Accessible, well-researched resources introducing Gurbani, Gurdwara heritage, and Sikh history.',
    'Foundational & Heritage Study',
    true
  ),
  (
    'World Sikh Organization (WSO)',
    'worldsikh.org',
    'https://www.worldsikh.org',
    null,
    'Human rights, Sikh civic advocacy, community education, and global Sangat initiatives.',
    'Global Sangat & Advocacy',
    true
  )
on conflict (domain) do update set
  name = excluded.name,
  url = excluded.url,
  rss_url = excluded.rss_url,
  description = excluded.description,
  category = excluded.category,
  is_active = true;

-- 4. Public Supabase Storage Bucket for Reliable Site Images & Article Covers
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

drop policy if exists "Public read access for site-media" on storage.objects;
create policy "Public read access for site-media"
  on storage.objects for select
  using (bucket_id = 'site-media');

drop policy if exists "Authenticated insert for site-media" on storage.objects;
create policy "Authenticated insert for site-media"
  on storage.objects for insert
  with check (bucket_id = 'site-media' and (auth.role() = 'authenticated' or auth.role() = 'service_role'));

drop policy if exists "Authenticated update for site-media" on storage.objects;
create policy "Authenticated update for site-media"
  on storage.objects for update
  using (bucket_id = 'site-media' and (auth.role() = 'authenticated' or auth.role() = 'service_role'));

drop policy if exists "Authenticated delete for site-media" on storage.objects;
create policy "Authenticated delete for site-media"
  on storage.objects for delete
  using (bucket_id = 'site-media' and (auth.role() = 'authenticated' or auth.role() = 'service_role'));
