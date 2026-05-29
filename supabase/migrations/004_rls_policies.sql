-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.operations enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_usage enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- insert is handled by the handle_new_user trigger (security definer),
-- so no direct insert policy is needed for authenticated users.

-- ─── operations ──────────────────────────────────────────────────────────────

create policy "Users can view their own operations"
  on public.operations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own operations"
  on public.operations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own operations"
  on public.operations for delete
  using (auth.uid() = user_id);

-- ─── api_keys ────────────────────────────────────────────────────────────────

create policy "Users can view their own API keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can insert their own API keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own API keys"
  on public.api_keys for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own API keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);

-- ─── api_usage ───────────────────────────────────────────────────────────────

create policy "Users can view usage for their own API keys"
  on public.api_usage for select
  using (
    exists (
      select 1 from public.api_keys
      where api_keys.id = api_usage.api_key_id
        and api_keys.user_id = auth.uid()
    )
  );

create policy "Users can insert usage for their own API keys"
  on public.api_usage for insert
  with check (
    exists (
      select 1 from public.api_keys
      where api_keys.id = api_usage.api_key_id
        and api_keys.user_id = auth.uid()
    )
  );
