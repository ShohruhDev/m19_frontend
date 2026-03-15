# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

M19 Barbershop — a Vue 3 + TypeScript SPA for a barbershop in Tashkent. The frontend communicates with a separate Node.js backend deployed on Vercel (`m19backend` at `/Users/macbookpro/WebstormProjects/m19backend`). The backend uses Supabase as the database and storage layer, and proxies requests to the Altegio (Alteg) booking API.

## Commands

```bash
npm run dev          # Start dev server on port 5173 (proxies /api → localhost:3002)
npm run build        # Type-check + Vite production build
npm run type-check   # Run vue-tsc without emitting (type validation only)
npm run preview      # Preview production build locally
```

There are no tests in this project.

## Architecture

### Frontend → Backend Communication

All API calls go through `VITE_API_BASE_URL` (default: `https://m19-backend.vercel.app/api`). In dev, Vite proxies `/api` to `localhost:3002` so the backend can run locally.

Two separate HTTP layers exist:
- **`httpClient`** (`src/services/http-client.ts`) — Axios instance with exponential backoff retry (3 retries, 5xx + network errors). Used for Altegio, products, orders, reviews.
- **`galleryService`** (`src/services/gallery.service.ts`) — plain `fetch` calls. Used for the gallery feature with presigned Supabase Storage uploads.

There is also a second Supabase client at `src/lib/supabase.ts` (simple, no options) alongside the full-featured one at `src/lib/supabaseClient.ts`. The gallery service does NOT use the Supabase client directly — it goes through the backend API.

### State Management (Pinia)

All stores are exported from `src/stores/index.ts`. Key stores:

- **`useAppStore`** — global UI state: mobile menu, booking modal open/close, cart drawer open/close. All modal open/close methods manipulate `document.body.style.overflow`.
- **`useBookingStore`** — multi-step booking flow state (service → staff → time → confirmation). Calls `altegService` directly.
- **`useCartStore`** — persisted to `localStorage` under key `m19_cart`. Watches items with deep watcher.
- **`useProductsStore`**, **`useOrdersStore`**, **`useReviewsStore`** — standard CRUD stores backed by the backend API.

### Booking Flow

The booking system is multi-step: `service → staff → time → confirmation`. The `BookingFlowCustom.vue` component orchestrates the steps. All Altegio API calls go through the backend proxy at `/api/alteg/*` — the frontend never calls Altegio directly (no token exposure).

### Gallery Feature

- **`GalleryPage.vue`** — public gallery with masonry grid (CSS Grid with span classes), category filters, lightbox with keyboard nav, deep-link via `?item=<id>` query param, paginated load.
- **`AdminPage.vue`** — password-protected (session storage, `VITE_ADMIN_PASSWORD`). Upload via presigned URL flow: frontend calls `/api/gallery/presign` → gets signed S3 URL → XHR PUT directly to Supabase Storage → saves metadata via POST `/api/gallery`.
- **`gallery.service.ts`** — all gallery API calls. Uses `VITE_API_BASE_URL + '/gallery'`.

### Routing

Routes are defined in `src/router/index.ts`:
- `/` — HomePage
- `/products` — ProductsPage (cosmetics shop)
- `/booking` — BookingPage
- `/gallery` — GalleryPage
- `/admin` — AdminPage (password-protected client-side)

### Component Organization

- `src/components/ui/` — base UI primitives. Two layers exist: Reka UI-based components (Dialog, Sheet, Select, Popover, Calendar, etc.) and custom ones (`BaseButton`, `BaseInput`, `SkeletonLoader`, `ToastContainer`).
- `src/components/common/` — `AppHeader.vue` (fixed header with scroll detection and mobile menu).
- `src/components/sections/` — page sections: `HeroSection`, `ContactSection`, `ReviewsSection`.
- `src/components/booking/` — booking wizard steps: `ServiceSelection`, `StaffSelection`, `DateSelection`, `TimeSelection`, `BookingConfirmation`.

### Path Aliases

`@` maps to `src/`. Additional aliases: `@components`, `@pages`, `@layouts`, `@composables`, `@services`, `@stores`, `@types`, `@utils`, `@assets`, `@styles`.

## Environment Variables

Required in `.env`:
```
VITE_API_BASE_URL=https://m19-backend.vercel.app/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PASSWORD=...   # Client-side admin panel password (not secure, by design)
```

## Backend (m19backend)

Located at `/Users/macbookpro/WebstormProjects/m19backend`. Vercel serverless functions under `api/`:
- `api/gallery/[...route].ts` — full gallery CRUD. Routes parsed from `req.url` (NOT `req.query.route` — unreliable in Vercel catch-all).
- `api/alteg/` — Altegio booking API proxy.
- `api/products/`, `api/orders/` — cosmetics store.

Deploy: `vercel --prod` from the backend directory. The `vercel.json` rewrites `/api/gallery` → `/api/gallery/index_route` because Vercel catch-all routes don't match the base path.

Supabase schema is in `supabase/schema.sql`. The `gallery_items` table and `gallery` storage bucket (public) must be created before the gallery feature works.
