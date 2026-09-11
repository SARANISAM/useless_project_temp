-- =====================================================================
-- സമയമുണ്ട് (samayamundu) — Supabase schema
-- Paste this entire file into: Supabase Dashboard > SQL Editor > New query
-- Then click "Run".
-- =====================================================================

-- Needed for gen_random_uuid(). Supabase projects almost always have this
-- available already, but this is safe to run even if it already exists.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Table: tasks
-- ---------------------------------------------------------------------
create table if not exists public.tasks (
  id                   uuid primary key default gen_random_uuid(),

  task_name            text not null check (char_length(trim(task_name)) > 0),
  description          text,

  -- Stored separately for display purposes, but deadline_timestamp
  -- (below) is the ONLY value the backend trusts for calculations.
  deadline_date        date not null,
  deadline_time        time not null,
  deadline_timestamp   timestamptz not null,

  chapters             integer check (chapters is null or chapters >= 0),
  estimated_minutes    integer check (estimated_minutes is null or estimated_minutes >= 0),

  created_at           timestamptz not null default now(),

  -- Set when the user explicitly hits "START TASK" in the UI. This is what
  -- makes an honest "procrastination time" statistic possible (see Phase 3
  -- history endpoint) instead of inventing a number we can't actually know.
  started_at           timestamptz,

  completed            boolean not null default false,
  completed_at         timestamptz
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
-- Sorting/filtering active tasks by how soon they're due (View Tasks page,
-- emergency mode's "closest active deadline" lookup).
create index if not exists idx_tasks_deadline_timestamp
  on public.tasks (deadline_timestamp);

-- Splitting active vs completed tasks is done on almost every request.
create index if not exists idx_tasks_completed
  on public.tasks (completed);

-- Composite index for the common "active tasks ordered by deadline" query.
create index if not exists idx_tasks_completed_deadline
  on public.tasks (completed, deadline_timestamp);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- This project has no end-user login system — every task is global to the
-- app, and the only thing that ever talks to Supabase is our trusted
-- Express backend (never the browser). So:
--
--   1. RLS is enabled below as a safety net.
--   2. NO policies are created for the anon/authenticated roles, which
--      means the public anon key gets ZERO access to this table even if
--      it ever leaked.
--   3. The backend instead uses the SERVICE ROLE key, which bypasses RLS
--      entirely by design in Supabase/Postgres. That key must NEVER be
--      sent to the frontend — see backend/.env and Section on Supabase
--      setup below for exactly where it goes.
--
-- If you later add real user accounts, you'd add a user_id column plus
-- policies like "auth.uid() = user_id" and switch the backend (or parts
-- of it) to the anon key. Not needed for this project.
alter table public.tasks enable row level security;
