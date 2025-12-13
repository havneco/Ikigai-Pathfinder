-- 1. Create Analyses Table (Existing Schema)
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  ikigai_data jsonb not null,
  result_data jsonb not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Analyses
alter table public.analyses enable row level security;

-- Policies for Analyses
create policy "Users can insert their own analysis" on public.analyses for insert with check (auth.uid() = user_id);
create policy "Users can view their own analyses" on public.analyses for select using (auth.uid() = user_id);
create policy "Users can update their own analyses" on public.analyses for update using (auth.uid() = user_id);
create policy "Enable read access for all users" on public.analyses for select using (true);


-- 2. Create Tasks Table (Derived from Types)
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'todo', -- 'todo', 'in_progress', 'done'
  priority text default 'medium', -- 'low', 'medium', 'high'
  quadrant text,
  due_date timestamp with time zone,
  ai_generated boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

-- Policies for Tasks
create policy "Users can manage their own tasks" on public.tasks for all using (auth.uid() = user_id);
