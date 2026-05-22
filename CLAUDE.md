# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build with SSR
npm run serve:ssr:app  # Serve built SSR app
npm test             # Run Vitest unit tests
npm run lint         # Run ESLint
npm run watch        # Watch mode
```

**Environment:** Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `APP_URL`.

**Backend:** The bookly API must be running at `http://localhost:3000` during development. See `~/Work/bookly`.

## Architecture

**BooklyAdmin** is an Angular 21 admin dashboard for managing the [Bookly](../bookly) children's book platform. Integrated with the Bookly backend API at `http://localhost:3000/api` (dev) / `https://bookly.vercel.app/api` (production).

### Key Patterns

- **Standalone components only** — no NgModules. All components use `standalone: true`.
- **Angular Signals** for reactive state (auth, data, UI). Use `inject()` for DI, not constructors.
- **OnPush change detection** on all components.
- **Lazy-loaded routes** for analytics, settings, create-book pages (see `app.routes.ts`).
- **`authGuard`** functional route guard protects all routes except `/login`.

### Core Services (`src/app/`)

| File | Responsibility |
|------|---------------|
| `auth.service.ts` | Auth state via signals + localStorage (`bookly_admin_auth` key), login/logout |
| `api.service.ts` | HTTP wrapper for all backend calls (uses Bearer token via interceptor) |
| `data.service.ts` | Local CRUD state management with Angular signals |
| `auth.interceptor.ts` | Injects `Authorization: Bearer <token>` on all HTTP requests |
| `models.ts` | All TypeScript interfaces (Book, BookTranslation, BookPage, Category, User, etc.) |

### Pages (`src/app/pages/`)

`main-layout.ts` is the shell component with sidebar nav. All authenticated pages are children of this layout route.

| Page | Route | Description |
|------|-------|-------------|
| `dashboard.ts` | `/dashboard` | Overview stats and recent books |
| `books-management.ts` | `/books` | List/delete books and categories (tabs) |
| `create-book.ts` | `/books/new`, `/books/edit/:id` | Create/edit books with multi-language translations and pages |
| `user-management.ts` | `/users` | List and manage users |
| `analytics.ts` | `/analytics` | Analytics (lazy-loaded) |
| `settings.ts` | `/settings` | App settings (lazy-loaded) |

### Data Model (from Bookly backend)

- **Books** — multi-language content (via `BookTranslations`), paginated pages with photos, cover image, duration, status
- **BookTranslations** — per-language: title, description, pages (text + photo per page)
- **Categories** — multi-language names (via `CategoryTranslations`), cover image, status
- **Languages** — id, name, country_code
- **Users** — auth users with linked `Profiles` (child accounts)

### Styling

Tailwind CSS v4 with dark theme by default. Primary color: `#421daa`. Background: `#020617`. Global styles in `src/styles.css`.

### SSR

Angular SSR with Express (`src/server.ts`). Use `isPlatformBrowser()` checks before accessing `localStorage` or browser APIs. Deployed on Vercel (`vercel.json`).
