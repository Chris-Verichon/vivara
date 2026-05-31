# Vivàra

> A private, immersive personal-memory app — capture your life through photos, videos, and stories, relive them on an interactive 3D timeline and globe.

![Version](https://img.shields.io/badge/version-1.0.0-rose)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

---

## Features

| Area | Description |
|------|-------------|
| **Memories** | Create, edit, and delete memories with photos, videos, or rich text |
| **Timeline** | Immersive 3D braided constellation — scroll through life chronologically |
| **World** | Interactive nocturnal 3D globe — visited countries highlighted in rose |
| **Gallery** | Masonry grid with live filters (type, year, country) and sort options |
| **Settings** | Personalise display name and avatar |
| **Auth** | Email/password authentication via Supabase |
| **Storage** | Files uploaded directly to Cloudflare R2 via presigned PUT URLs |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (React 19, App Router, Server Components)
- **Language** — TypeScript strict mode
- **Database & Auth** — [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security)
- **File Storage** — [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible, presigned uploads)
- **3D / WebGL** — [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei), [three-globe](https://github.com/vasturiano/three-globe)
- **Animation** — [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com)
- **Styling** — [Tailwind CSS](https://tailwindcss.com)
- **UI primitives** — [Base UI](https://base-ui.com), [shadcn/ui](https://ui.shadcn.com)

---

## Project Structure

```
app/
  (auth)/login/       Login page
  (app)/              Protected shell (header + mobile nav)
    page.tsx          Home — immersive constellation hero
    timeline/         3D braided timeline
    world/            3D globe with visited countries
    gallery/          Masonry memory gallery
    memory/[id]/      Memory detail + edit
    settings/         User settings
actions/              Server Actions (auth, memories, site config)
components/           UI components (cards, lightbox, globe, timeline…)
lib/                  Shared helpers (Supabase clients, R2, types, utils)
supabase/migrations/  SQL migration files
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A [Supabase](https://supabase.com) project
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket with public access enabled

### Environment Variables

Create a `.env.local` file at the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Cloudflare R2
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key-id>
R2_SECRET_ACCESS_KEY=<secret-access-key>
R2_BUCKET_NAME=<bucket-name>
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

Apply migrations in order from `supabase/migrations/`:

```bash
supabase db push
# or apply manually via the Supabase dashboard SQL editor
```

---

## Design System

| Token | Value |
|-------|-------|
| Background (night) | `#0b0a14` |
| Background (deep) | `#060510` |
| Text (cream) | `#fdf6ec` |
| Rose accent | `#F4B8C1` |
| Rose dark | `#C9748A` |
| Heading font | Playfair Display |
| Body font | Inter |
| Border radius | `1rem` |

---

## Git Workflow

```
develop  ←  feature/xxx  (branch per feature, atomic commits)
               ↑
         git checkout -b feature/xxx
```

Commit types: `feat` · `fix` · `refactor` · `chore` · `docs` · `style`

Version bump and changelog are always separate commits before merging.

---

## License

Private — all rights reserved © Chris Verichon
