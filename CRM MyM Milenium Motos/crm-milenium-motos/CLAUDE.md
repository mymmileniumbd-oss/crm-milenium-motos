# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from inside `crm-milenium-motos/` (note: **no "r"** — the folder is `crm-milenium-mot**o**s`, not `motors`). Running `npm run dev` from the repo root fails with `ENOENT package.json`; always `cd crm-milenium-motos` first.

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
- `app/(vendedor)/` — vendedor role: **panel** (landing), unidades, clientes, prospectos, ventas, seguimientos, garantias, tramites, reclamos
- `app/(gerente)/` — gerente role: dashboard only (read-only)

**Auth flow:** `middleware.ts` → `lib/supabase/middleware.ts` (session refresh) → role check via `usuarios.rol` → redirect accordingly. A Supabase Auth user with no `usuarios` row is redirected to `/login`. Vendedor lands on `/panel` (not `/unidades`).

**Supabase client pattern:**
- Server Components / Server Actions: `createServerClient()` from `lib/supabase/server.ts`
- Client Components: `createBrowserClient()` from `lib/supabase/client.ts`
- `lib/supabase/types.ts` is currently `export type Database = any` (placeholder until `npx supabase gen types` is run against the linked project)

**Server Actions** live in `lib/actions/` (one file per entity). They always: validate with Zod, call `createServerClient()`, then `revalidatePath()`.

## Critical Patterns

**Server Action serialization (Zod v4 + @hookform/resolvers v5):** `form.handleSubmit(onSubmit)` passes a non-plain object. Always spread: `form.handleSubmit((data) => onSubmit({ ...data }))`.

**Server Actions as props:** Only work Server Component → Client Component. Pages that pass Server Actions to form components must NOT have `'use client'`. Detail pages that need dynamic IDs use inline Server Actions:
```tsx
async function handleUpdate(data: FormValues) {
  'use server'
  await updateAction(params.id, data)
}
```

**Date parsing (timezone):** Never use `new Date('yyyy-MM-dd')` for display — it parses as UTC midnight and shows the previous day in Peru (UTC-5). Always use `parse(str, 'yyyy-MM-dd', new Date())` from `date-fns`.

**Month/year filter pattern:** Pages with month filters use URL search params (`?mes=6&anio=2026`). The reusable client component is `components/tramites/tramites-filtro.tsx`. Pages read `searchParams` props and filter fetched data in JS using `string.startsWith(prefijo)` where `prefijo = 'yyyy-MM'`.

**Panel period selector:** `components/panel/periodo-selector.tsx` (`'use client'`) uses `?periodo=dia|semana|mes` combined with `?mes=6&anio=2026` for the month navigator. When `periodo=mes`, the button becomes a `← Junio 2026 →` navigator. Default period is `dia`; default mes/anio is the current month when not specified.

**Client search filter pattern:** `components/clientes/clientes-busqueda.tsx` — input with 300ms debounce pushes `?q=...` to URL; page filters server-fetched data.

## Business Logic

**Estado comercial state machine** (auto, in `crearPago` / `recalcularEstados`):
- First `Adelanto` pago + `estado_comercial IS NULL` → `'Separada'`
- `SUM(pagos) >= precio_venta` → `'Pagado'` on venta + `'Vendida'` on unidad
- `'Entregada'` is manual only via `marcarEntregada` — never auto-downgraded
- `editarPago` and `eliminarPago` both call `recalcularEstados` to keep states in sync
- `actualizarVenta` (price change) also recalculates `estado_pago` and `estado_comercial`

**Estado logístico** (`Pedida` / `En fibrero` / `En tienda`) is always manual, independent of estado comercial.

**Garantía fibra** = `fecha_entrega + 1 month`. Created automatically in `marcarEntregada`. Both `garantia_moto_inicio` and `garantia_fibra_inicio` are set to `fecha_entrega`.

**Seguimiento 7 días**: only units already delivered (`fecha_entrega IS NOT NULL`) where `fecha_entrega <= today - 7 days AND seguimiento_7dias_hecho = false`. Badge count in sidebar fetched server-side in `app/(vendedor)/layout.tsx`. Also surfaced as an alert in the Panel.

**Panel del Vendedor** (`app/(vendedor)/panel/`): daily operational dashboard. 4 independent `<Suspense>` sections — Alertas, Embudo, Cartera, Inventario. All sections are async Server Components (no `'use client'`). Alerts: seguimientos post-venta vencidos + leads sin contactar (`DIAS_LEAD_SIN_CONTACTAR = 2` in constants). Embudo: leads/adelantos/ventas counts + conversion rate for the selected period. Cartera: 3 accordion sub-tables (Separadas, Pendientes entrega, Trámites pendientes). Inventario: 5 model cards always rendered (opacity-50 when 0) + en-camino table.

**Reclamos**: `fecha_resolucion` is set manually when marking resolved (user picks the date). Requires `ALTER TABLE reclamos ADD COLUMN fecha_resolucion DATE;` in DB.

**Prospecto → Venta conversion** (`convertirEnVenta` in `lib/actions/prospectos.ts`): atomically creates cliente + venta + trámite shell + marks prospecto `'Vendido'`.

**crearVenta** always auto-creates an empty `tramites` row for the unit.

**Etapas prospecto:** `['Interesado', 'Dio adelanto', 'Vendido', 'Desistió']` — `'Cotizó'` was removed from UI/constants but may still exist in DB enum (harmless).

## DB Schema Notes

- `unidades` has `color TEXT CHECK (color IN ('Rojo','Azul','Verde','Negro','Amarillo'))` — added via `ALTER TABLE`.
- `reclamos` has `fecha_resolucion DATE` — added via `ALTER TABLE`.
- RLS policies required per operation: SELECT, INSERT, UPDATE, DELETE are separate. `pagos` and `unidades` need explicit DELETE policies.
- `vista_master` must keep `security_invoker = true` (006_view_security_invoker.sql) — without it, the view runs with the owner's privileges and bypasses the base tables' RLS (e.g. would leak every vendedor's email through the `usuarios` join).

## Key Files

- `lib/constants.ts` — all enum values (MODELOS_MOTO, ETAPAS_PROSPECTO, COLORES_MOTO, DIAS_LEAD_SIN_CONTACTAR, etc.)
- `lib/utils/estados.ts` — `calcularEstadoPago(suma, precio) → EstadoPago`
- `lib/utils/fechas.ts` — `calcularDiasTranscurridos`, `calcularGarantiaFibraVencimiento`
- `lib/utils/format.ts` — `formatSoles(n)` → `"S/ 1,234.50"`
- `lib/utils/panel.ts` — `calcularRangoPeriodo(periodo, mes?, anio?) → { desde, hasta }` (yyyy-MM-dd strings)
- `lib/actions/pagos.ts` — `recalcularEstados` helper (shared by editarPago + eliminarPago)
- `lib/actions/panel.ts` — all Panel queries: alertas, embudo, cartera (x3), inventario (x2)
- `components/panel/` — Panel sections: `alertas-section`, `embudo-section`, `cartera-section`, `inventario-section`, `periodo-selector`
- `components/tramites/tramites-filtro.tsx` — reusable mes/año URL filter (used in ventas, tramites, garantias, reclamos)
- `supabase/migrations/` — 6 SQL files (001 enums, 002 tables, 003 indexes, 004 RLS, 005 views, 006 view security_invoker)

## Testing

Tests cover utility functions only (no DB, no components). Located in `lib/utils/__tests__/` and `lib/validations/__tests__/`. Vitest with `globals: true` (no need to import `describe`/`it`/`expect`). TZ forced to UTC in `vitest.config.ts` to avoid date-shift issues.

## UI

shadcn/ui (Tailwind v3, HSL CSS variables). Accordion in unidad ficha uses `type="multiple"`. Recharts for dashboard charts. Responsive: sidebar desktop (`hidden md:flex`), bottom nav mobile (`md:hidden`).

Inline edit pattern (pagos, reclamos, venta): pencil icon per row → replaces row content with form pre-filled via `defaultValues`. On save calls Server Action, on cancel clears editing state.

### Design system (Claude Design)

The whole app is themed through the shadcn HSL CSS variables in `app/globals.css`, so **changing a token propagates everywhere** — prefer remapping tokens over hardcoding colors.

- **Palette** (`app/globals.css` `:root`): `--primary` = Azul confianza `#1F56D6`; `--destructive` = Rojo energía `#E23B3B`; `--background` = `#f6f7f9`; `--foreground` = Ink `#1b2230`; `--border`/`--secondary` = line `#eef1f5`; `--accent` = pale blue `#eef3fe` (sidebar active); `--radius` = `0.75rem`. No dark-mode toggle ships, so `bg-card` === white in practice (legacy `bg-white` was migrated to `bg-card`).
- **Fonts** (`app/layout.tsx`, `next/font/google`): **Manrope** → `--font-sans` (UI/text/titles); **IBM Plex Mono** → `--font-mono` (codes: placas, motor, chasis, DUA, fechas, montos). Use `font-mono` + `tabular-nums` for codes/amounts. Replaced Geist.
- **Tailwind tokens** (`tailwind.config.ts`): `brand` (`DEFAULT`/`hover`/`red`) and `estado.*` (green/blue/indigo/orange/amber/red/gray, each `bg`/`fg`/`dot`) for badges that need exact hex outside the HSL scale. `fontFamily.sans/mono` point at `--font-sans`/`--font-mono`.
- **Estado badges** (`components/unidades/estado-badges.tsx`): `EstadoBadge({ tone })` renders a rounded-full pill with a colored dot; `tone` ∈ green/blue/indigo/orange/amber/red/gray. `BadgeLogistico`/`BadgeComercial`/`BadgeEstadoPago` map domain states → tone. Reuse `EstadoBadge` for any new status pill.
- **Shared layout components**: `components/nav/sidebar.tsx` exports `BrandMark` (the M logo with red corner) — reused in the gerente topbar. Sidebar is **236px** (`w-[236px]`, main offset `md:ml-[236px]`); active item = `bg-accent` + left blue bar. `components/ui/page-header.tsx` `PageHeader({ title, description, actions })` is the standard page header (21px extrabold title); use it on every list page.
- **Inline-edit block** (`datos-generales-section.tsx`): the signature highlighted block — left blue bar + "Edición inline" pill with pencil icon, on a `#f3f6fd`/`#cdd9f5` surface.
