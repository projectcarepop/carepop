-- MIGRATION: create_menstrual_tracking_tables
-- DESCRIPTION: Sets up tables for tracking menstrual cycles and daily symptoms.

-- 1. menstrual_cycles table
-- Stores the start and end dates of each menstrual cycle for a user.
create table if not exists public.menstrual_cycles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    start_date date not null,
    end_date date null, -- A null end_date indicates the cycle is ongoing.
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

comment on column public.menstrual_cycles.end_date is 'A null end_date indicates the cycle is ongoing.';

-- 2. symptom_logs table
-- Stores daily symptom logs for users, associated with a specific date.
create table if not exists public.symptom_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    log_date date not null,
    symptoms text[] not null, -- Array of symptom identifiers (e.g., ['cramps', 'headache'])
    notes text null,
    created_at timestamp with time zone default now() not null,

    -- Constraint to ensure a user can only have one symptom log entry per day.
    constraint unique_user_log_date unique (user_id, log_date)
);

comment on column public.symptom_logs.symptoms is 'Array of symptom identifiers (e.g., [''cramps'', ''headache''])';
comment on constraint unique_user_log_date on public.symptom_logs is 'Ensures a user can only have one symptom log entry per day.';


-- 3. RLS Policies
-- Enable RLS for the new tables.
alter table public.menstrual_cycles enable row level security;
alter table public.symptom_logs enable row level security;

-- Policy: Users can manage their own menstrual cycles.
create policy "Users can manage their own menstrual cycles"
on public.menstrual_cycles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can manage their own symptom logs.
create policy "Users can manage their own symptom logs"
on public.symptom_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- 4. Indexes for performance
create index if not exists idx_menstrual_cycles_user_id on public.menstrual_cycles(user_id);
create index if not exists idx_symptom_logs_user_id_log_date on public.symptom_logs(user_id, log_date); 