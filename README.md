# Sikhi AI

Next.js (App Router) + Tailwind + Supabase Auth + Deep seek

## Setup

1. `npm install`
2. `cp .env.local.example .env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase > Project Settings > API)
   - `GEMINI_API_KEY` (Google AI Studio). Server only: never prefix with `NEXT_PUBLIC_`.
3. In Supabase > Authentication > URL Configuration, add `http://localhost:3000/auth/callback`

   (and your production URL) to the redirect allow-list. Email confirmation links need it.
4. `npm run dev`

## How it fits together

- `middleware.ts` refreshes the Supabase session cookie on every request and redirects
signed-out visitors from `/ask` to `/login?next=...`.
- `app/layout.tsx` verifies the user on the server and passes it to `AuthProvider`, so the
first client render matches the server HTML (no hydration mismatch) and auth persists
across routes.
- `components/ask-panel.tsx` POSTs `JSON.stringify({ prompt: text })` to `/api/ask` and
handles loading, errors (401, 429, network, bad JSON) and the answer.
- `app/api/ask/route.ts` checks the session, validates and rate-limits the prompt, calls
Gemini with a grounding system instruction and a JSON schema, then re-validates the output.

## Notes

- TypeScript is pinned to 5.x. TypeScript 7 broke Next 15's `@/` path-alias resolution.
- The rate limiter is in-memory (per instance). Use a shared store for hard limits.
- Optional hero photo: set `HERO_IMAGE` in `components/hero.tsx`.
