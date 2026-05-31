<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:vivara-dev-rules -->
# Vivàra — Agent Rules

## Git Workflow (mandatory)
Every feature follows this exact cycle:
1. `git checkout -b feature/xxx` from `develop`
2. Atomic commits — one responsibility per commit
3. Commit types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`
4. Always a separate commit for version bump: `chore: bump version to X.X.X`
5. Always a separate commit for changelog: `docs: update CHANGELOG for vX.X.X`
6. `git push -u origin feature/xxx` BEFORE merging
7. Merge into `develop`, tag `vX.X.X`, push `develop` and the tag

## Code Rules
- All code, comments, variable names in **English**
- TypeScript strict — no `any`
- Server Components by default — `"use client"` only when required
- Server Actions for all mutations (`"use server"` at top of action files)
- Supabase browser client (`lib/supabase/client.ts`) → Client Components only
- Supabase server client (`lib/supabase/server.ts`) → Server Components and Actions
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client

## Design Tokens
- Background: `#FAF7F2` (linen) | Text: `#1A1A1A` | Rose accent: `#F4B8C1` | Rose dark: `#C9748A`
- Border-radius: `1rem` | Shadow: `0 4px 24px rgba(0,0,0,0.06)`
- Headings: `var(--font-playfair)` | Body: `var(--font-inter)`

## Next.js 16 Breaking Changes
- `proxy.ts` replaces `middleware.ts` — export function must be named `proxy()`
<!-- END:vivara-dev-rules -->
