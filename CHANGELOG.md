# Changelog

All notable changes to Vivàra are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

---

## [0.16.0] — 2026-05-31
### Added
- `lib/r2.ts` — Cloudflare R2 helpers (server-only): `r2PutPresigned()` generates a presigned PUT URL (5 min TTL) via AWS SDK v3 + S3-compatible R2 endpoint; `r2DeleteObjects()` batch-deletes objects
- `lib/media-url.ts` — shared `getMediaUrl(storagePath)` helper using `NEXT_PUBLIC_R2_PUBLIC_URL` (replaces the repeated Supabase URL pattern across all components)
- `app/api/r2/presign/route.ts` — POST route that verifies Supabase auth, validates `memoryId` (UUID) and `suffix` (filename), enforces allowed MIME types, and returns a `{ url, key }` presigned PUT URL scoped to `{userId}/{memoryId}/{suffix}`
### Changed
- `app/(app)/memory/new/page.tsx` — upload now requests a presigned URL from `/api/r2/presign` then PUTs directly to R2; removed Supabase browser client
- `components/memory-card/EditMemoryForm.tsx` — same presigned upload flow; removed Supabase browser client
- `actions/memories.ts` — `updateMemory` and `deleteMemory` now call `r2DeleteObjects()` instead of `supabase.storage.remove()`
- `components/memory-card/MemoryCard.tsx`, `MemoryStoryRow.tsx`, `MemoryMediaGallery.tsx`, `components/lightbox/Lightbox.tsx` — use shared `getMediaUrl` from `lib/media-url`
- `next.config.ts` — R2 public hostname parsed from `NEXT_PUBLIC_R2_PUBLIC_URL` and added to Next.js Image `remotePatterns` at config time
- `package.json` — added `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
### Migration note
- Files previously uploaded to Supabase Storage remain accessible via their old URLs until manually migrated to R2. New uploads go to R2 exclusively.

---

## [0.15.0] — 2026-05-30
### Added
- **Nocturnal restyle (all pages)** — deep night palette (`#0b0a14`, `#060510`), rose atmosphere, Playfair Display headings; `app/globals.css` extended with night-mode custom properties and a global `night-gradient` class
- `lib/device.ts` — `DeviceTier` type + `useDeviceTier()` hook (WebGL benchmark → `"high" | "low" | "none"`)
- `components/three/SceneCanvas.tsx` — shared `<Canvas>` wrapper (bloom post-processing, tone-mapping, adaptive DPR per tier)
- `components/three/Starfield.tsx` — instanced star field (count driven by tier tuning)
- `components/three/constellation.ts` — shared nocturnal design tokens (`NIGHT_COLORS`) and `getSceneTuning(tier)` helper
- `components/home/` — `ConstellationHome.tsx` (immersive R3F hero replacing `FlowerHero`), `HomeWorld.tsx` wrapper with WebGL detection
- `components/timeline/ConstellationTimeline.tsx` — immersive 3D timeline: `CatmullRomCurve3` braided «fil de vie», `MemoryStar` nodes, `Billboard` year labels, `ScrollControls` camera, `DriftParticles`, `BraidFlow` flowing-light flux (animated emissive spheres along braid strands)
- `components/world-map/Globe3D.tsx` — nocturnal interactive 3D globe (three-globe v2, OrbitControls, auto-rotate); every country rendered via earcut polygon layer (no h3-js, crash-free); countries with memories filled in rose and clickable; WebGL-adaptive DPR
- `components/world-map/GlobeWorld.tsx` — WebGL-detect wrapper: renders Globe3D or falls back to 2D WorldMap; manages `CountryDrawer` for selected country
- `lib/centroids.ts` — ISO alpha-2 → `[lon, lat]` centroid lookup (~150 countries)
- `public/videos/README.txt` — placeholder for ambient video assets
### Changed
- All app pages restyled to nocturnal palette (home, timeline, world, gallery, memory, settings)
- `app/(app)/world/page.tsx` — now renders `GlobeWorld` instead of `WorldMap`; data shape extended with centroid field
- `app/(app)/timeline/page.tsx` + `timeline/[year]/page.tsx` — feed `ConstellationTimeline`
- `app/(app)/page.tsx` — renders `ConstellationHome`
- `app/layout.tsx` — `suppressHydrationWarning` on `<body>` (suppresses browser-extension attribute injection)
- `package.json` — added deps: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three-globe`, `topojson-client`, `topojson-specification`, `@types/geojson`, `@types/topojson-client`, `@types/topojson-specification`
### Fixed
- h3-js `polygonToCells` runtime crash (antimeridian-crossing and pole-wrapping countries such as Antarctica, Fiji, Russia) — replaced three-globe's hex polygon layer entirely with an earcut polygon layer which never crashes

---

## [0.14.0] — 2026-05-30
### Added
- `actions/site-config.ts` — `getSiteConfig` (server) + `updateSiteConfig` (server action) with key-allowlist for `welcome_message`, `owner_name`, `quote`, `birth_year`; upserts into `site_config` table, revalidates `/`, `/settings` and `/timeline`
- `components/settings/SettingsForm.tsx` — client form using `useActionState`; fields for owner name, birth year (1900–current), welcome message and quote; success/error feedback, rose CTA button
- `app/(app)/settings/page.tsx` — settings page (server component) fetching current config and rendering `SettingsForm`
- `supabase/migrations/004_site_config_insert_policy.sql` — INSERT RLS policy for `site_config` table (required for upsert)
- `app/(app)/timeline/page.tsx` — reads `birth_year` from site config to set timeline start year
- **Timeline — Prime Radiant particle system**: 200 drifting network particles (4 colour types: steel blue, lavender, amber, rose), holographic connection lines, 3-layer glow per node, cross sparkle on bright nodes
- **Timeline — mouse interactivity**: particles repel from cursor (160 px field), tendril lines reach toward cursor, pulsing rose orb glow follows mouse
- **Timeline — scrollbar + zoom**: horizontal drag scrollbar; zoom clamped 0.35–3×
- **Timeline — linen background**: site design token `#FAF7F2`; initial view focused on the most recent years

---

## [0.13.0] — 2026-05-10
### Added
- `components/nav/MobileNav.tsx` — mobile bottom tab bar (fixed, `md:hidden`) with 4 items: Timeline, Monde, Galerie, + Ajouter (prominent rose CTA); active route highlighting via `usePathname`
- Footer hidden on mobile (visible only `md:` and above)
- `main` gets `pb-20 md:pb-0` to clear the bottom nav on mobile

---

## [0.12.0] — 2026-05-10
### Added
- `public/world-110m.json` — Natural Earth 110m TopoJSON world atlas
- `lib/iso-countries.ts` — ISO 3166-1 alpha-2 → numeric lookup table (for react-simple-maps)
- `types/react-simple-maps.d.ts` — TypeScript declarations for react-simple-maps v3
- `components/world-map/WorldMap.tsx` — interactive world map (react-simple-maps), highlighted countries with memory bubbles, zoom controls, hover tooltips, click to open drawer
- `components/world-map/CountryDrawer.tsx` — side drawer listing memories for a selected country, filterable by year
- `app/(app)/world/page.tsx` — world map page with server-side data fetch grouped by country

---

## [0.11.0] — 2026-05-10
### Added
- `app/(app)/gallery/page.tsx` — server component fetching all memories with media, derives year + country filter options
- `components/gallery/GalleryClient.tsx` — client component with filter bar (type, year, country), sort (recent/oldest/random), masonry grid and "Load more" pagination (12 per page)

---

## [0.10.0] — 2026-05-10
### Added
- `actions/memories.ts` — `updateMemory` server action (updates record, removes deleted media from Storage + DB, inserts new media_files)
- `actions/memories.ts` — `deleteMemory` server action (removes all media from Storage, cascades DB delete, redirects to year page)
- `components/memory-card/EditMemoryForm.tsx` — pre-populated edit form with existing media management and new upload support
- `components/memory-card/DeleteMemoryButton.tsx` — client component with confirmation dialog
- `app/(app)/memory/[id]/edit/page.tsx` — edit page (server wrapper + EditMemoryForm)
- `components/memory-card/MemoryStoryRow.tsx` — alternating story layout (zigzag media/text) with scroll animations
### Changed
- `app/(app)/memory/[id]/page.tsx` — added Delete button alongside Edit link
- `app/(app)/timeline/[year]/page.tsx` — replaced masonry grid with MemoryStoryRow story layout (zigzag, animated on scroll)

---
## [0.9.0] — 2026-05-07
### Added
- `components/lightbox/Lightbox.tsx` — fullscreen overlay with keyboard navigation (←/→/Escape), backdrop close, react-player for video
- `components/memory-card/MemoryMediaGallery.tsx` — client-side media grid with lightbox trigger
- `app/(app)/memory/[id]/page.tsx` — memory detail page with title, date, country, tags, description, media gallery, edit link
### Fixed
- `lib/types.ts` — converted `Memory`, `MediaFile`, `SiteConfig` from `interface` to `type` so they satisfy Supabase SDK `GenericSchema` constraint (fixes `never[]` insert type errors)
- `app/(app)/timeline/[year]/page.tsx` and `app/(app)/memory/[id]/page.tsx` — use `as unknown as MemoryWithMedia` for Supabase join cast

---
## [0.8.0] — 2026-05-07

### Added
- `components/upload/DropZone.tsx` — drag-and-drop + click file picker; client-side image compression (`browser-image-compression`, max 10 MB), video size guard (max 200 MB), first-frame video thumbnail via `<canvas>`, drag-to-reorder previews, cover badge on first file
- `actions/memories.ts` — `createMemory` server action: inserts `memories` row + `media_files` rows, redirects to `/memory/[id]`
- `app/(app)/memory/new/page.tsx` — create memory form: title, date, description, country autocomplete (ISO 3166-1), tags, media upload with per-file progress; pre-fills date from `?year=YYYY` query param

### Changed
- `package.json` version bumped to `0.8.0`

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
