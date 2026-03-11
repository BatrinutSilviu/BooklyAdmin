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

## Architecture

**StoryAdmin** is an Angular 21 admin dashboard for managing story/narrative content, integrated with a backend API at `https://story-teller-batrinutsilvius-projects.vercel.app/api`.

### Key Patterns

- **Standalone components only** — no NgModules. All components use `standalone: true`.
- **Angular Signals** for reactive state (auth, data, UI). Use `inject()` for DI, not constructors.
- **OnPush change detection** on all components.
- **Lazy-loaded routes** for analytics, settings, create-story, create-series pages (see `app.routes.ts`).
- **`authGuard`** functional route guard protects all routes except `/login`.

### Core Services (`src/app/`)

| File | Responsibility |
|------|---------------|
| `auth.service.ts` | Auth state via signals + localStorage, login/logout |
| `api.service.ts` | HTTP wrapper for all backend calls (uses Bearer token via interceptor) |
| `data.service.ts` | Local CRUD state management with Angular signals |
| `auth.interceptor.ts` | Injects `Authorization: Bearer <token>` on all HTTP requests |
| `models.ts` | All TypeScript interfaces |

### Pages (`src/app/pages/`)

`main-layout.ts` is the shell component with sidebar nav. All authenticated pages are children of this layout route.

### Styling

Tailwind CSS v4 with dark theme by default. Primary color: `#421daa`. Background: `#020617`. Global styles in `src/styles.css`.

### SSR

Angular SSR with Express (`src/server.ts`). Use `isPlatformBrowser()` checks before accessing `localStorage` or browser APIs. Deployed on Vercel (`vercel.json`).
