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
-- User Ownership & Authentication Support
-- ---------------------------------------------------------------------
alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_tasks_user_id
  on public.tasks (user_id);

-- Composite index for user active tasks ordered by deadline
create index if not exists idx_tasks_user_completed_deadline
  on public.tasks (user_id, completed, deadline_timestamp);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.tasks enable row level security;

-- Drop previous policies if re-running
drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

-- RLS policies scoped to authenticated user
create policy "Users can view their own tasks"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);
