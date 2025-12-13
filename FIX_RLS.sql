-- Drop potentially conflicting policies first to ensure a clean slate
drop policy if exists "Enable read access for all users" on public.analyses;
drop policy if exists "Users can view their own analyses" on public.analyses;

-- Re-create the specific 'Share' policy (Public Read Access)
create policy "Enable read access for all users"
on public.analyses for select
using (true);

-- Re-create the specific 'Owner' policy (just in case you want explicit owner logic, though the one above covers it for SELECT)
-- Note: You definitely need policies for INSERT/UPDATE/DELETE too, forcing owner check.
create policy "Users can update their own analyses"
on public.analyses for update
using (auth.uid() = user_id);

create policy "Users can insert their own analysis"
on public.analyses for insert
with check (auth.uid() = user_id);
