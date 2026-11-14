-- Phase 4: Interactive Sikhi Games & Gamified Learning Hub
-- Stores Knowledge Coins / Seva Points, streaks, and unlocked badges per authenticated user.

create table if not exists public.user_game_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins integer not null default 50 check (coins >= 0),
  streak integer not null default 0 check (streak >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  unlocked_badges text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_game_wallets enable row level security;

create policy "Users can view their own game wallet"
  on public.user_game_wallets
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own game wallet"
  on public.user_game_wallets
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own game wallet"
  on public.user_game_wallets
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
