# Changelog

All notable changes to Vivàra are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/)

> **Roadmap**
> `0.1.0` Project setup → `0.2.0` Supabase → `0.3.0` Auth & UI shell → `0.4.0` Home animation → `0.5.0` Timeline → `0.6.0` Memory CRUD → `0.7.0` Gallery → `0.8.0` World map → `0.9.0` Mobile & config → **`1.0.0` Production release**

---

## [Unreleased]

---
## [0.7.0] — 2026-05-07

### Added
- `components/memory-card/MemoryCard.tsx` — reusable memory card with 3 variants (photo, video, text), Framer Motion hover animation, country badge, tag badges, date in French
- `components/memory-card/MemoryCardSkeleton.tsx` — skeleton card and `MemoryCardSkeletonGrid` for loading states

### Changed
- `app/(app)/timeline/[year]/page.tsx` — replaced custom card grid with `MemoryCard` in a CSS masonry layout; query now fetches `media_files` for each memory
- `package.json` version bumped to `0.7.0`

---
## [0.6.0] — 2026-05-07

### Added
- `components/timeline/RopeTimeline.tsx` — canvas-based animated timeline with Foundation/dystopian aesthetic: continuous gold rope (trunk + 4 helical filaments), knots rendered as a rotating entangled ball of filaments (24 crossing lines) with asymmetric outer burst rays, zoom/pan/hover/click interactions, freeze zone on hover
- `app/(app)/timeline/page.tsx` — timeline page rewritten to use `RopeTimeline`; fetches `memories.memory_date` + `site_config` (`birth_year` key) to build year nodes
- `app/(app)/timeline/[year]/page.tsx` — year detail page listing memories for a given year

### Removed
- `components/timeline/TimelinePath.tsx` — old SVG timeline replaced by `RopeTimeline`

### Changed
- `package.json` version bumped to `0.6.0`

---
## [0.5.0] — 2026-05-07

### Added
- `components/hero/FlowerHero.tsx` — full-viewport video hero with intro → loop seamless switch (VP9/WebM + H.264/MP4 for Safari), scroll-driven rotation (-7° → 0° via Framer Motion spring)
- `components/nav/MobileNav.tsx` — mobile burger menu with top drawer (replaces bottom navigation bar)
- `public/videos/` — `flower-intro.webm/mp4` + `flower-loop.webm/mp4` (converted from `.mov` with transparent background via ffmpeg VP9 alpha)

### Changed
- `app/(app)/page.tsx` — home page restructured: `FlowerHero` full-screen hero above fold, welcome section + entry cards + last 3 memories below fold
- `app/(app)/layout.tsx` — navbar now visible on all screen sizes; mobile bottom nav removed; burger menu added; topbar/footer separator changed from rose to `black/10`; footer now visible on all screen sizes
- `app/globals.css` — `--background` changed from linen (`oklch(0.979 0.008 76)`) to pure white (`oklch(1 0 0)`) to match topbar
- `package.json` version bumped to `0.5.0`

---
## [0.4.0] — 2026-05-06

### Added
- `components/providers/QueryProvider.tsx` — TanStack Query client provider (staleTime 60s, no refetch on window focus)
- `components/memory-card/MemoryCardSkeleton.tsx` — skeleton loading placeholder for memory cards (`MemoryCardSkeleton` + `MemoryCardSkeletonGrid`)
- `lib/utils.ts` — `formatMemoryDate()` (fr-FR locale), `getYear()`, `countryCodeToName()` (fr-FR), `truncate()` helpers

### Changed
- `app/layout.tsx` — root layout now wraps children with `QueryProvider`
- `package.json` version bumped to `0.4.0`

---
## [0.3.0] — 2026-05-06

### Added
- `app/(auth)/login/page.tsx` — login page with sunflower logo, email/password form, error display
- `actions/auth.ts` — `signIn` and `signOut` server actions (Supabase SSR)
- `app/(app)/layout.tsx` — main app shell with desktop navbar and mobile bottom navigation
- `app/(app)/page.tsx` — home page placeholder (inside `(app)` route group, gets navbar layout)
- `app/(app)/timeline/page.tsx` — timeline placeholder (redirect target after login)

### Changed
- `middleware.ts` renamed to `proxy.ts`, exported function renamed `middleware` → `proxy` (Next.js 16 breaking change)
- `package.json` version bumped to `0.3.0`

### Fixed
- `app/page.tsx` (outside `(app)` group, no layout) removed — replaced by `app/(app)/page.tsx` to correctly inherit navbar layout

---
## [0.3.0] — 2026-05-06

### Added
- `app/(auth)/login/page.tsx` — login page with sunflower logo, email/password form, error display
- `actions/auth.ts` — `signIn` and `signOut` server actions (Supabase SSR)
- `app/(app)/layout.tsx` — main app shell with desktop navbar and mobile bottom navigation
- `app/(app)/timeline/page.tsx` — placeholder page (redirect target after login)

### Changed
- `middleware.ts` renamed to `proxy.ts`, exported function renamed `middleware` → `proxy` (Next.js 16 breaking change)

---

## [0.2.0] — 2026-05-06

### Added
- SQL migration `001_core_tables.sql` — tables `memories`, `media_files`, `site_config` with indexes and `updated_at` auto-trigger
- SQL migration `002_rls_policies.sql` — Row Level Security enabled on all tables with fine-grained policies
- SQL migration `003_storage.sql` — private Storage bucket `memories` (200 MB limit) with per-user folder policies
- Supabase project created, first admin user created via Auth dashboard

---

## [0.1.0] — 2026-05-06

### Added
- Next.js (latest, App Router, TypeScript, Tailwind v4) bootstrapped
- shadcn/ui initialized with components: `button`, `input`, `textarea`, `dialog`, `drawer`, `badge`, `skeleton`
- Dependencies: Framer Motion, TanStack Query, react-simple-maps, react-player, browser-image-compression, lucide-react, @supabase/supabase-js, @supabase/ssr
- Google Fonts: Playfair Display (headings) + Inter (body)
- Vivàra design tokens: `--linen` `--ink` `--rose-pale` `--rose-dark` `--muted-text`
- Tailwind `border-radius: 1rem`, `line-height: 1.7` base styles
- Full project folder structure: `app/`, `components/`, `lib/`, `actions/`
- Supabase client utilities: `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (SSR)
- TypeScript types: `Memory`, `MediaFile`, `SiteConfig`, `MemoryWithMedia` in `lib/types.ts`
- Auth middleware (`middleware.ts`) — protects all `(app)` routes, redirects to `/login`
- `next.config.ts` — Supabase Storage image domain configured
- `.env.example` template
- Prettier + `prettier-plugin-tailwindcss` configured
- `.npmrc` with `legacy-peer-deps=true`
- Git repo initialized, `master` + `develop` branches pushed to GitHub

[Unreleased]: https://github.com/Chris-Verichon/vivara/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/Chris-Verichon/vivara/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Chris-Verichon/vivara/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Chris-Verichon/vivara/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Chris-Verichon/vivara/releases/tag/v0.1.0
