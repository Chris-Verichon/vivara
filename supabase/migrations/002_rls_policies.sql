-- Migration 002 — Row Level Security policies
-- Run this AFTER 001_core_tables.sql

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.memories    enable row level security;
alter table public.media_files enable row level security;
alter table public.site_config enable row level security;

-- ============================================================
-- POLICIES: memories
-- ============================================================

-- Any authenticated user can read memories
create policy "Authenticated users can read memories"
  on public.memories for select
  to authenticated
  using (true);

-- Users can only insert their own memories
create policy "Users can insert their own memories"
  on public.memories for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can only update their own memories
create policy "Users can update their own memories"
  on public.memories for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only delete their own memories
create policy "Users can delete their own memories"
  on public.memories for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- POLICIES: media_files
-- ============================================================

-- Authenticated users can read media_files (via their memory ownership)
create policy "Authenticated users can read media_files"
  on public.media_files for select
  to authenticated
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id
    )
  );

-- Users can insert media_files for their own memories
create policy "Users can insert media_files for own memories"
  on public.media_files for insert
  to authenticated
  with check (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and m.user_id = auth.uid()
    )
  );

-- Users can delete media_files for their own memories
create policy "Users can delete media_files for own memories"
  on public.media_files for delete
  to authenticated
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and m.user_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: site_config
-- ============================================================

-- Any authenticated user can read site config
create policy "Authenticated users can read site_config"
  on public.site_config for select
  to authenticated
  using (true);

-- Any authenticated user can update site config (admin-only in Phase 2)
create policy "Authenticated users can update site_config"
  on public.site_config for update
  to authenticated
  using (true)
  with check (true);
