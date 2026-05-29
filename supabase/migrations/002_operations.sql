create table if not exists public.operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  tool text not null,
  input_filename text not null,
  output_filename text,
  input_size_bytes bigint,
  output_size_bytes bigint,
  processing_ms int,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  storage_path text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists operations_user_id_idx on public.operations(user_id);
create index if not exists operations_created_at_idx on public.operations(created_at desc);
