<!-- Generated: 2026-07-12 | Files scanned: 90 | Token estimate: ~550 -->

# Architecture — CRM MyM Milenium Motos

Next.js 14 App Router, single app, no separate backend. Server Components fetch data
directly; mutations go through Server Actions (`'use server'`). No API routes exist.

## System diagram

```
Browser
  │
  ▼
middleware.ts ──▶ lib/supabase/middleware.ts (session refresh)
  │                       │
  │                       ▼
  │              usuarios.rol lookup ──▶ redirect vendedor→/panel | gerente→/dashboard | none→/login
  ▼
app/(auth)/login          app/(vendedor)/*                 app/(gerente)/*
  Server Action login        Server Components + Server        dashboard (read-only)
                              Actions (lib/actions/*.ts)
                                     │
                                     ▼
                          lib/supabase/server.ts (createServerClient)
                                     │
                                     ▼
                              Supabase Postgres (RLS enforced)
                                     │
                                     ▼
                          supabase/migrations/*.sql (schema, enums, RLS, views)
```

## Route groups

- `app/(auth)/` — public: `/login`
- `app/(vendedor)/` — vendedor role: panel (landing), unidades, clientes, prospectos,
  ventas, seguimientos, garantias, tramites, reclamos
- `app/(gerente)/` — gerente role: `/dashboard` only, read-only

## Auth flow

`middleware.ts` → `lib/supabase/middleware.ts` (refresh session) → role check via
`usuarios.rol` → redirect accordingly. Auth user with no `usuarios` row → `/login`.
Vendedor lands on `/panel` (not `/unidades`).

## Data flow pattern

1. Page (Server Component) calls a function from `lib/actions/*.ts`
2. Action validates input with Zod (`lib/validations/*.ts`), calls `createServerClient()`
3. Mutations call `revalidatePath()` after writing
4. Client-only interactivity (forms, filters, kanban) lives in `'use client'` components
   under `components/`, which invoke Server Actions passed down as props

## Cross-cutting concerns

- No dark mode; theme is HSL CSS vars in `app/globals.css`
- PWA: `app/manifest.ts` + `public/sw.js`, registered by
  `components/pwa/service-worker-register.tsx`, offline fallback at `app/offline/page.tsx`
- See `frontend.md`, `backend.md`, `data.md`, `dependencies.md` for detail
