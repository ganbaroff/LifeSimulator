-- Stack City — daily leaderboard (Sprint 4 + AUDIT H1/H2 migration).
--
-- ONE-TIME SETUP: open the Volaura Supabase project → SQL Editor → paste + run.
-- (Project: dwdgzfusjsobnixgyzjk. The MCP write path is blocked in the build
--  sandbox, so this is applied by hand.)
--
-- Run the whole file each time — every statement is idempotent. If the table
-- already exists from the original Sprint 4, only the ALTER/CREATE OR REPLACE
-- statements will change anything.

-- ── Initial table (idempotent) ────────────────────────────────────────────────
create table if not exists public.stack_scores (
  id          uuid primary key default gen_random_uuid(),
  seed        bigint      not null,           -- daily seed (YYYYMMDD)
  name        text        not null default '',
  score       integer     not null,
  height      integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ── AUDIT H2: stable per-user identity ───────────────────────────────────────
-- Add tg_user_id column if it doesn't exist yet (safe on first or subsequent runs).
alter table public.stack_scores
  add column if not exists tg_user_id bigint;   -- nullable: non-TG users omit it

-- Unique constraint for upsert: one row per (seed, tg_user_id). Only applies
-- when tg_user_id is supplied — anonymous rows still multi-insert freely.
-- Use a partial index so NULL tg_user_id doesn't conflict with itself.
create unique index if not exists stack_scores_seed_tguser_uidx
  on public.stack_scores (seed, tg_user_id)
  where tg_user_id is not null;

-- ── AUDIT H2: dedup view for reads ────────────────────────────────────────────
-- Returns the best score per (seed, tg_user_id). Anonymous rows (tg_user_id IS
-- NULL) are all included (can't dedup without an id). sdLbTop queries this view.
create or replace view public.stack_scores_top as
  select distinct on (seed, tg_user_id) *
  from public.stack_scores
  order by seed, tg_user_id, score desc;

create index if not exists stack_scores_seed_score_idx
  on public.stack_scores (seed, score desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.stack_scores enable row level security;

drop policy if exists "stack_scores public read" on public.stack_scores;
create policy "stack_scores public read"
  on public.stack_scores for select using (true);

-- AUDIT H1: tighter score cap (5000 ≈ 100 blocks × 50 pts, well above any real
-- run) + reasonable height cap. Still client-checked only, but raises the bar.
drop policy if exists "stack_scores sane insert" on public.stack_scores;
create policy "stack_scores sane insert"
  on public.stack_scores for insert
  with check (
    score   >= 0   and score  < 5000  and
    height  >= 0   and height < 300   and
    char_length(name) <= 24
  );
