-- 1. ADD COLUMNS to your EXISTING table
-- We use 'if not exists' so it won't crash if you run it twice
alter table public.profiles 
add column if not exists subscription_tier text default 'free',
add column if not exists credits integer default 3;

-- 2. UPDATE the "New User" Automation definition
-- This ensures future signups get the credits
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, subscription_tier, credits)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'free',
    3
  )
  -- If they already exist in profiles (rare race condition), update them
  on conflict (id) do update set
    subscription_tier = excluded.subscription_tier,
    credits = excluded.credits;
    
  return new;
end;
$$ language plpgsql security definer;

-- 3. BACKFILL existing users
-- Give everyone 3 credits for now!
update public.profiles 
set 
  subscription_tier = coalesce(subscription_tier, 'free'),
  credits = coalesce(credits, 3);
