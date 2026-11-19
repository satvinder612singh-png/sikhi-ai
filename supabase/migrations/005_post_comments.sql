-- 005_post_comments.sql
-- Reddit-style threaded comments & helpful upvotes for SikhStacks posts

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

create index if not exists idx_post_comments_parent_id
  on public.post_comments (parent_comment_id);

alter table public.post_comments enable row level security;

drop policy if exists "Public can read post_comments" on public.post_comments;
create policy "Public can read post_comments"
  on public.post_comments for select
  using (true);

drop policy if exists "Anyone can insert post_comments" on public.post_comments;
create policy "Anyone can insert post_comments"
  on public.post_comments for insert
  with check (true);

drop policy if exists "Anyone can upvote post_comments" on public.post_comments;
create policy "Anyone can upvote post_comments"
  on public.post_comments for update
  using (true)
  with check (true);
