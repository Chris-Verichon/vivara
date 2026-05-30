-- Migration 004 — Fix site_config RLS: add missing INSERT policy
-- The upsert in updateSiteConfig() requires both INSERT and UPDATE policies.
-- Run this in the Supabase SQL editor.

create policy "Authenticated users can insert site_config"
  on public.site_config for insert
  to authenticated
  with check (true);
