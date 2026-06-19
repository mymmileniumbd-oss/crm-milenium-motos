# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from inside `crm-milenium-motors/`.

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (also runs ESLint)
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode
npm run lint         # ESLint only
```

Run a single test file:
```bash
npx vitest run lib/utils/__tests__/estados.test.ts
```

## Architecture

Next.js 14 App Router. All data fetching in Server Components, all mutations via Server Actions (`'use server'`). No API routes.

**Route groups:**
- `app/(auth)/` — public (login)
- `app/(vendedor)/` — vendedor role: unidades, clientes, prospectos, ventas, seguimientos, garantias, tramites, reclamos
- `app/(gerente)/` — gerente role: dashboard only (read-only)

**Auth flow:** `middleware.ts` → `lib/supabase/middleware.ts` (session refresh) → role check via `usuarios.rol` → redirect accordingly. A Supabase Auth user with no `usuarios` row is redirected to `/login`.

**Supabase client pattern:**
- Server Components / Server Actions: `createServerClient()` from `lib/supabase/server.ts`
- Client Components: `createBrowserClient()` from `lib/supabase/client.ts`
- `lib/supabase/types.ts` is currently `export type Database = any` (placeholder until `npx supabase gen types` is run against the linked project)

**Server Actions** live in `lib/actions/` (one file per entity). They always: validate with Zod, call `createServerClient()`, then `revalidatePath()`.

## Business Logic

**Estado comercial state machine** (auto, in `crearPago`):
- First `Adelanto` pago + `estado_comercial IS NULL` → `'Separada'`
- `SUM(pagos) >= precio_venta` → `'Pagado'` on venta + `'Vendida'` on unidad
- `'Entregada'` is manual only via `marcarEntregada` action — never auto-downgraded

**Estado logístico** (`Pedida` / `En fibrero` / `En tienda`) is always manual, independent of estado comercial.

**Garantía fibra** = `fecha_entrega + 1 month` (via `calcularGarantiaFibraVencimiento` in `lib/utils/fechas.ts`).

**Seguimiento 7 días**: ventas where `fecha_venta <= today - 7 days AND seguimiento_7dias_hecho = false`. Badge count shown in sidebar/bottom nav, fetched server-side in `app/(vendedor)/layout.tsx`.

**Prospecto → Venta conversion** (`convertirEnVenta` in `lib/actions/prospectos.ts`): atomically creates cliente + venta + trámite shell + marks prospecto `'Vendido'`.

**crearVenta** always auto-creates an empty `tramites` row for the unit.

## Key Files

- `lib/constants.ts` — all enum values (MODELOS_MOTO, ETAPAS_PROSPECTO, etc.)
- `lib/utils/estados.ts` — `calcularEstadoPago(suma, precio) → EstadoPago`
- `lib/utils/fechas.ts` — `esSeguimientoPendiente(fecha, hecho)`, `calcularGarantiaFibraVencimiento`
- `lib/utils/format.ts` — `formatSoles(n)` → `"S/ 1,234.50"`
- `supabase/migrations/` — 4 SQL files (001 enums, 002 tables, 003 indexes, 004 RLS)

## Testing

Tests cover utility functions only (no DB, no components). Located in `lib/utils/__tests__/` and `lib/validations/__tests__/`. Vitest with `globals: true` (no need to import `describe`/`it`/`expect`). TZ forced to UTC in `vitest.config.ts` to avoid date-shift issues.

## UI

shadcn/ui (Tailwind v3, HSL CSS variables, `style: default`, `baseColor: slate`). Accordion in unidad ficha uses `type="multiple"`. Recharts for dashboard charts. Responsive: sidebar desktop (`hidden md:flex`), bottom nav mobile (`md:hidden`).
