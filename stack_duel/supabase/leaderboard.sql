-- Stack City — daily leaderboard table (Sprint 4).
--
-- ONE-TIME SETUP: open the Volaura Supabase project →  SQL Editor → paste + run.
-- (Project: dwdgzfusjsobnixgyzjk. The MCP write path is blocked in the build
--  sandbox, so this is applied by hand.)
--
-- Public read + sanity-checked public insert; security is via RLS, and the
-- client uses the PUBLIC publishable key (safe to ship).

create table if not exists public.stack_scores (
  id          uuid primary key default gen_random_uuid(),
  seed        bigint      not null,           -- the daily seed (YYYYMMDD)
  name        text        not null default '',
  score       integer     not null,
  height      integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists stack_scores_seed_score_idx
  on public.stack_scores (seed, score desc);

alter table public.stack_scores enable row level security;

drop policy if exists "stack_scores public read" on public.stack_scores;
create policy "stack_scores public read"
  on public.stack_scores for select using (true);

drop policy if exists "stack_scores sane insert" on public.stack_scores;
create policy "stack_scores sane insert"
  on public.stack_scores for insert
  with check (score >= 0 and score < 100000 and height >= 0 and char_length(name) <= 24);
