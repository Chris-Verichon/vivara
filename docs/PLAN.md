# Vivàra — Development Plan

> Branch strategy: `main` (production, deployed on Vercel) ← `develop` (integration) ← `feature/*` branches.
> Each feature branch is merged into `develop` via Pull Request, then `develop` → `main` for releases.
> Status legend: `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Branch Map Overview

```
main
└── develop
    ├── feature/project-setup
    ├── feature/supabase-setup
    ├── feature/auth
    ├── feature/ui-foundation
    ├── feature/home-animation
    ├── feature/timeline-view
    ├── feature/timeline-year
    ├── feature/memory-card
    ├── feature/memory-create
    ├── feature/memory-detail
    ├── feature/memory-edit
    ├── feature/gallery
    ├── feature/world-map
    ├── feature/mobile-nav
    └── feature/site-config
```

---

## Phase 1 — Foundation

### `feature/project-setup`
**Goal:** Bootstrap the Next.js project with all dependencies and base configuration.

**Tasks:**
- [ ] `npx create-next-app@latest vivara --typescript --tailwind --app --eslint`
- [ ] Install UI and animation libraries:
  ```
  npx shadcn@latest init
  npm install @supabase/supabase-js @supabase/ssr
  npm install framer-motion
  npm install @tanstack/react-query
  npm install react-simple-maps
  npm install react-player
  npm install browser-image-compression
  npm install lucide-react
  ```
- [ ] Configure environment variables (`.env.local` template + `.env.example`)
- [ ] Configure `next.config.ts` — image domains (Supabase storage URL)
- [ ] Configure Google Fonts in `app/layout.tsx` — Playfair Display + Inter
- [ ] Set up Tailwind design tokens in `tailwind.config.ts`:
  - Colors: `linen` (#FAF7F2), `ink` (#1A1A1A), `rose-pale` (#F4B8C1), `rose-dark` (#C9748A), `muted` (#888888)
  - Border radius, box-shadow tokens
- [ ] Create base folder structure (see spec section 6)
- [ ] Set up ESLint + Prettier
- [ ] Initialize Git repo, create `develop` branch, push to GitHub
- [ ] Connect repo to Vercel, configure environment variables on Vercel

**Definition of Done:** `npm run dev` runs clean, Vercel preview deploys successfully.

---

### `feature/supabase-setup`
**Goal:** Create the Supabase project, database schema, RLS policies, and storage bucket.

**Tasks:**
- [ ] Create Supabase project
- [ ] Create table `memories`:
  ```sql
  create table memories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    title text not null,
    description text,
    memory_date date not null,
    country_code varchar(2),
    country_name text,
    tags text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  ```
- [ ] Create table `media_files`:
  ```sql
  create table media_files (
    id uuid primary key default gen_random_uuid(),
    memory_id uuid references memories on delete cascade not null,
    storage_path text not null,
    file_type text check (file_type in ('image', 'video')) not null,
    mime_type text,
    size_bytes bigint,
    width int,
    height int,
    thumbnail_path text,
    position int default 0,
    created_at timestamptz default now()
  );
  ```
- [ ] Create table `site_config`:
  ```sql
  create table site_config (
    key text primary key,
    value text,
    updated_at timestamptz default now()
  );
  insert into site_config (key, value) values
    ('welcome_message', 'Welcome'),
    ('owner_name', 'Maman');
  ```
- [ ] Create `updated_at` auto-update trigger (function + trigger on `memories` and `site_config`)
- [ ] Enable RLS on all tables
- [ ] Create RLS policies:
  - `memories` SELECT: `auth.uid() is not null`
  - `memories` INSERT: `auth.uid() = user_id`
  - `memories` UPDATE: `auth.uid() = user_id`
  - `memories` DELETE: `auth.uid() = user_id`
  - `media_files` SELECT: authenticated via join to `memories`
  - `media_files` INSERT/DELETE: authenticated, owner of parent `memory`
  - `site_config` SELECT: authenticated
  - `site_config` UPDATE: authenticated (admin only in Phase 2)
- [ ] Create Storage bucket `memories` (private)
- [ ] Create Storage policy: authenticated users can upload/read their own files
- [ ] Create Supabase client utilities in `lib/supabase/`:
  - `client.ts` — browser client (`createBrowserClient`)
  - `server.ts` — server client (`createServerClient` with cookies)
- [ ] Define TypeScript types in `lib/types.ts` (Memory, MediaFile, SiteConfig)
- [ ] Create the first admin user via Supabase Auth dashboard

**Definition of Done:** Tables exist with correct RLS, a test insert/select works from the Supabase dashboard, TypeScript types are exported.

---

## Phase 2 — Authentication & Layout Shell

### `feature/auth`
**Goal:** Login page, auth middleware, and protected route redirects.

**Tasks:**
- [ ] Create `app/(auth)/login/page.tsx` — centered card with sunflower logo, email + password form
- [ ] Create `actions/auth.ts` — `signIn`, `signOut` server actions (using Supabase SSR)
- [ ] Create `middleware.ts` — protect all `(app)` routes, redirect unauthenticated to `/login`
- [ ] Redirect to `/timeline` after successful login
- [ ] Redirect to `/login` after sign out
- [ ] Handle and display auth errors (invalid credentials)
- [ ] Create `app/(app)/layout.tsx` — main app shell with navbar (desktop) placeholder

**Definition of Done:** Login/logout flow works end-to-end. Unauthenticated access to any `(app)` route redirects to `/login`.

---

### `feature/ui-foundation`
**Goal:** Shared UI components, layout shell, and design system baseline.

**Tasks:**
- [ ] Install shadcn components: `button`, `input`, `textarea`, `dialog`, `drawer`, `badge`, `skeleton`
- [ ] Create `components/ui/` wrappers as needed
- [ ] Create desktop `Navbar` component — logo (sunflower icon, small), nav links (Timeline, World, Gallery)
- [ ] Create `app/(app)/layout.tsx` — renders Navbar + `{children}`
- [ ] Create `lib/utils.ts` — `cn()` utility (already from shadcn), date helpers, country code helpers
- [ ] Create loading skeleton components for memory cards
- [ ] Set up TanStack Query provider in root layout

**Definition of Done:** App shell renders correctly on desktop and mobile. Design tokens apply globally.

---

## Phase 3 — Core Features

### `feature/home-animation`
**Goal:** Home page with full-screen sunflower animation that transitions to the main navigation.

**Tasks:**
- [ ] Create `components/sunflower/SunflowerSVG.tsx` — SVG with individually addressable petals and center
- [ ] Create `components/sunflower/SunflowerAnimation.tsx` — Framer Motion orchestration:
  - Petals stagger open (0.1s each)
  - Center pulse (breathing effect, `repeat: Infinity`)
  - After 2.5s: sunflower scales down and moves to top-left (logo position)
  - Page content fades in (`opacity: 0 → 1`, `y: 20 → 0`)
- [ ] Display owner name or welcome word at the center of the sunflower during animation (read from `site_config`)
- [ ] Create `app/(app)/page.tsx`:
  - Hero section with personalized welcome phrase
  - 3 entry cards: Timeline · World Map · Gallery
  - Last 3 memories added (fetched server-side)
  - Quote / word of the day (from `site_config`)
- [ ] Use `sessionStorage` to skip animation after first visit

**Definition of Done:** Animation plays smoothly on first load, skipped on refresh. Home page displays correct data.

---

### `feature/timeline-view`
**Goal:** Main timeline page — sinuous SVG path with year nodes.

**Tasks:**
- [ ] Fetch distinct years from `memories` (server component)
- [ ] Create `components/timeline/TimelinePath.tsx` — responsive SVG sinuous path:
  - Desktop: horizontal scroll, path goes left to right
  - Mobile: vertical scroll, path goes top to bottom
  - Year nodes: larger + rose-pale colored if memories exist, small grey if empty
- [ ] Create `components/timeline/YearNode.tsx` — circle with year label:
  - Hover: `scale(1.1)` + tooltip (memory count)
  - Click: navigate to `/timeline/[year]`
- [ ] Create `app/(app)/timeline/page.tsx` — renders `TimelinePath` with data
- [ ] Add left/right arrow keyboard navigation between years (desktop)

**Definition of Done:** Timeline renders all years, nodes correctly styled, navigation works on desktop and mobile.

---

### `feature/timeline-year`
**Goal:** Year detail page — masonry grid of memories for a specific year.

**Tasks:**
- [ ] Create `app/(app)/timeline/[year]/page.tsx`:
  - Large year heading (Playfair Display, 80px)
  - Optional editable subtitle (from `site_config` or memory metadata)
  - Fetch all memories for the year (server-side), ordered by `memory_date`
  - Masonry grid using CSS columns or a masonry library
  - "Add a memory" button (visible when authenticated, links to `/memory/new?year=[year]`)
  - "Back to timeline" button
- [ ] Left/right year navigation arrows (previous/next year with content)

**Definition of Done:** Page renders all memories for a year in a masonry grid. Empty years show a friendly empty state with the "Add a memory" CTA.

---

### `feature/memory-card`
**Goal:** Reusable memory card component used across timeline, gallery, and home page.

**Tasks:**
- [ ] Create `components/memory-card/MemoryCard.tsx`:
  - Displays first media file (image or video thumbnail) or a text icon
  - Title, precise date, short description (truncated)
  - Country badge if `country_code` is present
  - Tags badges
  - Hover: subtle scale + shadow lift (Framer Motion)
  - Click: navigates to `/memory/[id]`
- [ ] Handle 3 variants: `photo`, `video` (shows play icon overlay), `text`
- [ ] Create `MemoryCardSkeleton` loading state

**Definition of Done:** Card renders correctly for all 3 media types. Accessible (keyboard navigable).

---

### `feature/memory-create`
**Goal:** Add memory form with media upload.

**Tasks:**
- [ ] Create `app/(app)/memory/new/page.tsx` with form:
  - **Title** — required text input
  - **Date** — date picker (shadcn `Calendar` or native `<input type="date">`)
  - **Description** — textarea (rich text optional in Phase 2)
  - **Country** — combobox with ISO country list autocomplete
  - **Tags** — free input, comma-separated, displayed as badges
  - **Media upload** — drag-and-drop + click zone (`components/upload/DropZone.tsx`):
    - Images: client-side compression via `browser-image-compression` before upload (max 10 MB output)
    - Videos: direct upload to Supabase Storage (max 200 MB)
    - Preview thumbnails after selection
    - For videos: extract first frame via `<canvas>` for thumbnail
    - Reorder uploads via drag handles
- [ ] Create server action `actions/memories.ts` — `createMemory`:
  1. Upload media files to Supabase Storage (`memories/{user_id}/{memory_id}/`)
  2. Insert into `memories`
  3. Insert into `media_files` (with storage paths, dimensions, thumbnail path)
  4. Redirect to `/memory/[id]`
- [ ] Progress indicator during upload (file by file)
- [ ] Pre-fill year from query param `?year=YYYY`

**Definition of Done:** A memory with photos, videos, or text-only can be created end-to-end. Files appear in Supabase Storage. Record appears in `memories` table.

---

### `feature/memory-detail`
**Goal:** Memory detail page and fullscreen lightbox viewer.

**Tasks:**
- [ ] Create `app/(app)/memory/[id]/page.tsx`:
  - Full title, exact date, description, country, tags
  - Media gallery grid (photos + videos)
  - Edit and Delete action buttons (owner only)
- [ ] Create `components/lightbox/Lightbox.tsx`:
  - Full-screen overlay triggered by clicking any media
  - Left/right navigation through all media in the memory
  - Shows description, date, location below the media
  - Close on `Escape` key or backdrop click
  - `react-player` for video playback inside lightbox

**Definition of Done:** Lightbox opens for any media, keyboard navigation works, video plays correctly.

---

### `feature/memory-edit`
**Goal:** Edit and delete an existing memory.

**Tasks:**
- [ ] Create `app/(app)/memory/[id]/edit/page.tsx` — same form as create, pre-populated
- [ ] Server action `updateMemory` — update `memories` record, handle new/removed media files
- [ ] Delete media files from Supabase Storage when removed
- [ ] Server action `deleteMemory` — delete memory + all media files from DB and Storage
- [ ] Confirmation dialog before delete
- [ ] Redirect to `/timeline/[year]` after delete

**Definition of Done:** All fields editable. Media can be added or removed. Delete removes all data cleanly from DB and Storage.

---

## Phase 4 — Discovery Features

### `feature/gallery`
**Goal:** Global gallery — all memories across all years and countries.

**Tasks:**
- [ ] Create `app/(app)/gallery/page.tsx`
- [ ] Fetch all memories with their first media file (server-side, paginated)
- [ ] Masonry grid rendering with `MemoryCard`
- [ ] Filter bar (client-side state):
  - By year (multi-select dropdown)
  - By country (multi-select dropdown)
  - By type: All / Photo / Video / Text
- [ ] Sort options: Chronological / Anti-chronological / Random (client-side shuffle)
- [ ] Lightbox opens on card click (same `Lightbox` component)
- [ ] Infinite scroll or "Load more" pagination

**Definition of Done:** Gallery displays all memories. Filters and sort work correctly. Lightbox opens from gallery.

---

### `feature/world-map`
**Goal:** Interactive world map with memory clusters per country.

**Tasks:**
- [ ] Install `react-simple-maps` + `topojson-client`
- [ ] Create `app/(app)/world/page.tsx`
- [ ] Fetch memory counts grouped by `country_code` (server-side):
  ```sql
  SELECT country_code, country_name, COUNT(*) as count FROM memories
  WHERE user_id = auth.uid() AND country_code IS NOT NULL
  GROUP BY country_code, country_name;
  ```
- [ ] Create `components/world-map/WorldMap.tsx`:
  - Map style: linen background (#FAF7F2), countries in soft grey, oceans in white
  - Countries with memories: highlighted in rose-pale (#F4B8C1)
  - Bubble on each highlighted country showing memory count
  - Hover: deeper rose tint + tooltip (country name + count)
  - Click: opens a side drawer with all memories for that country
- [ ] Create `components/world-map/CountryDrawer.tsx`:
  - List of memories for the selected country
  - Filterable by year
  - Each item links to the memory detail page
- [ ] Mobile: pinch-to-zoom enabled (`projection` scale adjustment)

**Definition of Done:** Map renders with correct highlights. Click on a country shows its memories. Works on mobile with touch.

---

### `feature/mobile-nav`
**Goal:** Bottom navigation bar for mobile devices.

**Tasks:**
- [ ] Create `components/MobileNav.tsx` — fixed bottom bar, 4 items:
  - Timeline (icon: `Clock`)
  - World (icon: `Globe`)
  - Gallery (icon: `Image`)
  - Add Memory (icon: `Plus`, prominent, rose-dark background)
- [ ] Show only on mobile (`md:hidden`)
- [ ] Hide desktop navbar on mobile (`hidden md:flex`)
- [ ] Active state styling based on current route (`usePathname`)

**Definition of Done:** Bottom nav renders correctly on mobile viewport. Does not appear on desktop.

---

### `feature/site-config`
**Goal:** Allow the admin to edit site-wide settings (welcome message, owner name, quote of the day).

**Tasks:**
- [ ] Create `app/(app)/settings/page.tsx` — simple form:
  - Welcome message (home hero)
  - Owner name (displayed in sunflower animation)
  - Quote / word of the day (home page)
- [ ] Server action `updateSiteConfig` — upsert into `site_config`
- [ ] Link to Settings page in desktop navbar (icon: `Settings`, discreet)

**Definition of Done:** Changes to site config reflect immediately on the home page.

---

## Phase 5 — Polish & Production

### Tasks (on `develop`, no dedicated feature branch needed)
- [ ] Audit all pages for mobile responsiveness
- [ ] Add `<meta name="robots" content="noindex">` — this is a private site
- [ ] Add loading states and error boundaries on all pages
- [ ] Add `<title>` and `<meta description>` via Next.js `generateMetadata`
- [ ] Optimize images with `next/image` throughout
- [ ] Lighthouse audit — aim for 90+ on Performance and Accessibility
- [ ] Set up Vercel production environment variables
- [ ] Final end-to-end test of all user flows
- [ ] Merge `develop` → `main`, tag `v1.0.0`

---

## Phase 6 — Future (Phase 2 backlog)

> Not planned yet. To be scoped when Phase 1 is complete.

- [ ] Family sharing — viewer / editor roles
- [ ] Reactions and comments on memories
- [ ] PDF export (year or full archive)
- [ ] Anniversary notifications
- [ ] Full-screen presentation mode
- [ ] Server-side video thumbnail generation (Supabase Edge Function + FFmpeg)
- [ ] Rich text editor for memory descriptions
- [ ] Google Photos / iCloud integration

---

## Progress Tracker

| Branch | Feature | Status |
|---|---|---|
| `feature/project-setup` | Next.js bootstrap, deps, Vercel | `[ ]` |
| `feature/supabase-setup` | DB schema, RLS, Storage | `[ ]` |
| `feature/auth` | Login page, middleware | `[ ]` |
| `feature/ui-foundation` | Layout shell, shared components | `[ ]` |
| `feature/home-animation` | Sunflower animation, home page | `[ ]` |
| `feature/timeline-view` | Sinuous SVG timeline | `[ ]` |
| `feature/timeline-year` | Year detail page | `[ ]` |
| `feature/memory-card` | Reusable memory card | `[ ]` |
| `feature/memory-create` | Add memory form + upload | `[ ]` |
| `feature/memory-detail` | Detail page + lightbox | `[ ]` |
| `feature/memory-edit` | Edit + delete memory | `[ ]` |
| `feature/gallery` | Global gallery + filters | `[ ]` |
| `feature/world-map` | Interactive world map | `[ ]` |
| `feature/mobile-nav` | Mobile bottom nav bar | `[ ]` |
| `feature/site-config` | Admin settings page | `[ ]` |
| Polish & Production | Audit, meta, deploy `v1.0.0` | `[ ]` |
