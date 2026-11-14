# Learn Sikhi — Architecture Overview

**Learn Sikhi** is a Next.js 15 (App Router), React 19, and TypeScript 5 web application styled with Tailwind CSS 3 and Framer Motion, backed by Supabase Authentication (`@supabase/ssr`) and a source-grounded Google Gemini / local Gurbani synthesis engine.

---

## 1. App Router & Middleware (`app/` & `middleware.ts`)

| Path / File | Route / Role | Description |
| :--- | :--- | :--- |
| `app/layout.tsx` | Root Layout (`/*`) | Configures Google Fonts (`Cormorant Garamond`, `Inter`, `Noto Sans Gurmukhi`), global metadata (`Learn Sikhi — Explore the depths of Sikhi.`), dark theme viewport, server-side user verification (`getCurrentUser()`), and `<AuthProvider>`. |
| `app/page.tsx` | Home Page (`/`) | Main landing experience featuring the ceremonial `IntroLoader` curtain, `<Hero />`, and four animated `<ChapterSection>` modules: Chapter I (`BaaniPortal`), Chapter II (`MatriarchsGallery`), Chapter III (`AskPanel`), and Chapter IV (`ScholarlyPortals`). |
| `app/ask/page.tsx` | AI Research Workspace (`/ask`) | Protected interactive Q&A page supporting `?q=` query prefill, preset question chips, multi-paragraph sourced synthesis display, source reference cards, and a live API request logs drawer (`GET /api/ask`). |
| `app/sources/page.tsx` | Scriptural & Historical Sources (`/sources`) | Filterable catalog of indexed primary scriptures, canonical exegesis, historical texts, and Rehat Maryada (`SIKHI_SOURCES`), with deep links into `/ask?q=...`. |
| `app/login/page.tsx` | Authentication (`/login`) | Server component that redirects authenticated visitors to their validated `next` path and renders `<Navbar solid />`, `<LoginForm />`, and `<Footer />` for sign-in / sign-up. |
| `app/auth/callback/route.ts` | OAuth / Email PKCE Callback (`GET /auth/callback`) | Exchanges Supabase auth `code` for a session cookie via `exchangeCodeForSession(code)` and redirects to a validated relative `next` path (or `/login?error=callback`). |
| `app/api/ask/route.ts` | AI Inquiry API (`GET` & `POST /api/ask`) | `GET` returns live in-memory API request logs and `SIKHI_SOURCES`. `POST` validates the user prompt, reads server-only `GEMINI_API_KEY` (or `DEEPSEEK_API_KEY`), runs `generateAnswer()`, and returns structured paragraphs, matched sources, model metadata, and logs. |
| `middleware.ts` | Edge Session & Route Guard | Refreshes Supabase auth cookies on every non-asset request and protects `/ask` (`PROTECTED_PREFIXES`), redirecting unauthenticated users to `/login?next=...`. |

---

## 2. UI Components (`components/`)

| Component File | Exports | Responsibility |
| :--- | :--- | :--- |
| `components/navbar.tsx` | `Navbar` | Top navigation bar displaying the `ੴ` emblem, **Learn Sikhi** brand link, navigation links (`/#sources`, `/#explore`), auth state actions (`Ask a question` / `Sign out` vs. `Sign in`), and responsive mobile drawer. |
| `components/hero.tsx` | `Hero` | Landing hero section combining `<Navbar />`, `<TempleSilhouette />`, Gurmukhi header (`ਸਿੱਖੀ · ਗੁਰਬਾਣੀ · ਇਤਿਹਾਸ`), headline, **Learn Sikhi** introductory copy, `<SearchBar />`, and `<SuggestionChips />`. |
| `components/intro-loader.tsx` | `IntroLoader` (default) | Full-screen ceremonial opening curtain with animated SVG Gurmukhi archway, `ੴ` emblem, and **LEARN SIKHI** title. Stores `sikhi_ai_intro_seen` in `sessionStorage` so it plays once per session. |
| `components/baani-portal.tsx` | `BaaniPortal` (default) | Two-part Gurbani sanctuary: (1) pre-curated foundational hymns (*Japji Sahib*, *Asa Di Vaar*, *Ramkali Ki Vaar*, *Anand Sahib*) with historical/philosophical commentary, and (2) live BaniDB (`api.banidb.com/v2/search`) & SikhiToTheMax Shabad lookup. |
| `components/matriarchs-gallery.tsx` | `MatriarchsGallery` (default) | Interactive oil-canvas exhibition profiling Bebe Nanaki Ji, Mata Khivi Ji, Mata Sundari Ji, and Mai Bhago Ji across three tabs: *Her Life & Sovereignty*, *Why Men Talk Less About Her*, and *Primary Historical Record*. |
| `components/scholarly-portals.tsx` | `ScholarlyPortals` (default) | Grid of external Panthic and scholarly archives (*Manglacharan*, *Never Forget 1984*, *Bunga Azaadi*, *SikhiToTheMax / BaniDB*). |
| `components/ask-panel.tsx` | `AskPanel` | Client-side inquiry widget used on the home page; manages abortable `POST /api/ask` requests, loading skeleton, error recovery (including 401 sign-in prompt), and accessibility focus. |
| `components/answer-view.tsx` | `AnswerSkeleton`, `AnswerView` | Renders loading placeholders, structured answer paragraphs, numbered source citation badges, and the **Learn Sikhi** study-aid verification disclaimer. |
| `components/search-bar.tsx` | `SearchBar`, `SuggestionChips`, `SUGGESTIONS` | Controlled search input enforcing `MIN_PROMPT` (3) to `MAX_PROMPT` (500) character bounds and clickable preset question chips. |
| `components/sections.tsx` | `SourcesSection`, `FeatureGrid`, `GoldDivider` | Overview cards describing source grounding (*Gurbani*, *Historical references*, *Credible scholarship*) and core learning pillars. |
| `components/login-form.tsx` | `LoginForm` | Dual-mode (`signin` / `signup`) email & password authentication form powered by the Supabase browser client. |
| `components/auth-provider.tsx` | `AuthProvider`, `useAuth`, `AuthUser` | Hydrates client auth context from the server-verified `initialUser` without hydration mismatch and subscribes to `supabase.auth.onAuthStateChange`. |
| `components/footer.tsx` | `Footer` | Site footer with **Learn Sikhi** branding, grouped navigation links, copyright notice, and study-aid disclaimer. |
| `components/icons.tsx` | `Icon`, `IconName` | Fixed-dimension inline SVG icon set (`book`, `scroll`, `scholar`, `lotus`, `hands`, `star`, `spark`, `search`, `menu`, `close`, `alert`, `refresh`). |
| `components/temple-silhouette.tsx` | `TempleSilhouette` | Illustrative SVG backdrop of Sri Harmandir Sahib and the Amrit Sarovar reflection. |

---

## 3. Library Utilities & AI Handlers (`lib/`)

| File | Exports | Description |
| :--- | :--- | :--- |
| `lib/deepseek.ts` | `SIKHI_SOURCES`, `matchSourcesForQuestion`, `generateAnswer`, `getApiLogs`, `addApiLog`, `classify`, `FRIENDLY`, `DeepSeekError`, `createDeepSeek` | Core AI & grounding engine. Matches questions against `SIKHI_SOURCES` via keyword/title scoring, discovers candidate Gemini models, races the top 2 models in parallel (`Promise.any`) with an 8.5s timeout, falls back sequentially to backup models, and provides a zero-downtime local scholarly synthesis fallback (`buildLocalScholarlySynthesis`) if cloud APIs are unreachable. Maintains a 30-entry in-memory log buffer. |
| `lib/answer.ts` | `Answer`, `Citation`, `CitationType`, `MIN_PROMPT`, `MAX_PROMPT` | Shared TypeScript interfaces for answers/citations and prompt validation constants (`3`–`500` chars). |
| `lib/rate-limit.ts` | `rateLimit` | Per-instance in-memory sliding-window rate limiter (`limit = 8` requests per `60_000` ms window with opportunistic cleanup). |
| `lib/safe-redirect.ts` | `safeNextPath` | Sanitizes `next` redirect targets to same-site relative paths starting with `/`, preventing open-redirect vulnerabilities. |
| `lib/supabase/config.ts` | `supabaseUrl`, `supabaseAnonKey`, `isSupabaseConfigured` | Centralizes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` access and boolean readiness check. |
| `lib/supabase/client.ts` | `getSupabaseBrowserClient` | Singleton browser client created via `@supabase/ssr` `createBrowserClient` (returns `null` when env vars are unset). |
| `lib/supabase/server.ts` | `getSupabaseServerClient`, `getCurrentUser` | Server-side Supabase client wired to Next.js `cookies()` and helper that verifies the current user token via `supabase.auth.getUser()`. |

---

## 4. Supabase Tables, Authentication & Policies

- **Current Database State**: There is no standalone `supabase/` SQL migrations directory or custom public schema tables in the repository yet.
- **Authentication (`auth.users`)**:
  - Managed via Supabase Auth (`@supabase/ssr` cookie-based sessions).
  - Supports email/password sign-in (`signInWithPassword`), account registration (`signUp` with PKCE email confirmation callback at `/auth/callback`), server-side token validation (`supabase.auth.getUser()`), and route-level gating in `middleware.ts` for `/ask`.
- **Row-Level Security (RLS) & Policies**:
  - Currently relies on Supabase's built-in `auth` schema policies. Custom public tables (such as user profiles, saved Shabads, or study history) and their `auth.uid()` RLS policies are reserved for subsequent roadmap phases.
