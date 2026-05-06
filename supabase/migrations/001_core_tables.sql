-- Migration 001 — Core tables: memories, media_files, site_config
-- Run this in the Supabase SQL Editor

-- ============================================================
-- TABLE: memories
-- ============================================================
create table if not exists public.memories (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  description  text,
  memory_date  date not null,
  country_code varchar(2),   -- ISO 3166-1 alpha-2 (ex: FR, IT, MA)
  country_name text,
  tags         text[],
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- ============================================================
-- TABLE: media_files
-- ============================================================
create table if not exists public.media_files (
  id             uuid primary key default gen_random_uuid(),
  memory_id      uuid references public.memories(id) on delete cascade not null,
  storage_path   text not null,
  file_type      text not null check (file_type in ('image', 'video')),
  mime_type      text,
  size_bytes     bigint,
  width          int,
  height         int,
  thumbnail_path text,
  position       int default 0 not null,
  created_at     timestamptz default now() not null
);

-- ============================================================
-- TABLE: site_config
-- ============================================================
create table if not exists public.site_config (
  key        text primary key,
  value      text,
  updated_at timestamptz default now() not null
);

-- Default site config values
insert into public.site_config (key, value) values
  ('welcome_message', 'Welcome'),
  ('owner_name', 'Maman'),
  ('quote_of_day', '')
on conflict (key) do nothing;

-- ============================================================
-- TRIGGER: auto-update updated_at on memories
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger memories_updated_at
  before update on public.memories
  for each row execute function public.handle_updated_at();

create trigger site_config_updated_at
  before update on public.site_config
  for each row execute function public.handle_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists memories_user_id_idx      on public.memories(user_id);
create index if not exists memories_memory_date_idx  on public.memories(memory_date);
create index if not exists memories_country_code_idx on public.memories(country_code);
create index if not exists media_files_memory_id_idx on public.media_files(memory_id);
