-- Create a public profiles table that mirrors auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  subscription_tier text default 'free', -- 'free' or 'pro'
  credits integer default 3,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: Users can update their own profile (e.g. name)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, credits)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 3);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
