-- =============================================================================
-- Migration 003: Community Chitrakari (painting) contributions
-- Contributions start as pending_review; only approved rows are shown to all.
-- =============================================================================
create table if not exists public.chitrakari_artworks (
  id uuid primary key default gen_random_uuid(),
  artwork_key text not null,
  image_url text not null,
  contributor_name text not null default 'Sangat contributor',
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists chitrakari_artworks_key_idx
  on public.chitrakari_artworks (artwork_key, status, created_at);

alter table public.chitrakari_artworks enable row level security;

create policy "Anyone can read approved chitrakari"
  on public.chitrakari_artworks for select
  using (status = 'approved' or auth.uid() = user_id);

create policy "Signed-in users can contribute chitrakari for review"
  on public.chitrakari_artworks for insert
  with check (auth.role() = 'authenticated' and status = 'pending_review');
