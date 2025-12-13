-- Create table for storing Ikigai Analyses
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  ikigai_data jsonb not null,
  result_data jsonb not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analyses enable row level security;

-- Policy: Users can insert their own analysis
create policy "Users can insert their own analysis"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- Policy: Users can view their own analyses
create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own analyses
create policy "Users can update their own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

-- Policy: Allow public read access to analyses (for sharing logic to work)
-- NOTE: In a real production app, you might want to scope this, 
-- but for "Share Link" functionality where ID is the key, public select is often used.
create policy "Enable read access for all users"
  on public.analyses for select
  using (true);
