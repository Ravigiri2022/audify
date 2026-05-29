create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_used_at timestamptz,
  is_active bool not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.api_usage (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references public.api_keys(id) on delete cascade not null,
  endpoint text not null,
  status_code int,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_user_id_idx on public.api_keys(user_id);
create index if not exists api_usage_key_id_idx on public.api_usage(api_key_id);
