-- RPC to securely decrement credits
create or replace function public.decrement_credits()
returns integer as $$
declare
  current_credits integer;
  current_tier text;
begin
  -- Get current state
  select credits, subscription_tier into current_credits, current_tier
  from public.profiles
  where id = auth.uid();

  -- If PRO, don't decrement (infinite)
  -- But we return 999 to signify 'plenty'
  if current_tier = 'pro' then
    return 999;
  end if;

  -- If out of credits, error (or return 0)
  if current_credits <= 0 then
    return 0;
  end if;

  -- Decrement
  update public.profiles
  set credits = credits - 1
  where id = auth.uid();

  return current_credits - 1;
end;
$$ language plpgsql security definer;
