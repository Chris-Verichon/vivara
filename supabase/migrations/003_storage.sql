-- Migration 003 — Storage bucket and policies
-- Run this AFTER 002_rls_policies.sql

-- ============================================================
-- Storage bucket: memories (private)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  false,        -- private bucket — access via signed URLs only
  209715200,    -- 200 MB max file size
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS policies
-- ============================================================

-- Authenticated users can upload to their own folder
create policy "Authenticated users can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read files in the bucket
create policy "Authenticated users can read memory files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'memories');

-- Users can delete only their own files
create policy "Users can delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
