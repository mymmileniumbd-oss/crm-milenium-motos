# Panel Vendedor — Design Spec

**Date:** 2026-06-30
**Scope:** Vendedor role only — `/unidades` page

---

## Overview

Add a "Panel general" section at the top of the vendedor's `/unidades` page, above the existing `PageHeader` + list. The panel gives the vendedor an at-a-glance view of stock status, pending actions, and recent prospects without leaving the main inventory screen.

---

## Architecture

- **Pattern:** Server Components only — no client state, no polling. Consistent with existing app patterns.
- **Data fetching:** New server action `getPanelVendedor()` in `lib/actions/panel-vendedor.ts`. All queries run in parallel via `Promise.all`.
- **Placement:** `app/(vendedor)/unidades/page.tsx` — the panel renders before `<PageHeader>` and the unit list.

---

## Layout

```
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │  ← 6 cards, 1 row
└──────┴──────┴──────┴──────┴──────┴──────┘

┌─────────────────────────────────────────┐
│  Contactos recientes                    │
│  rows × 5 + "Ver todos →"              │
└─────────────────────────────────────────┘
```

On mobile (`< md`), KPI cards wrap into a 2-column grid. The contacts section stacks full-width below.

---

## KPI Cards (6)

Each card: `bg-card border border-border rounded-xl p-4`. Number in `text-2xl font-bold`. Label in `text-sm text-muted-foreground`. Clicking a card navigates to the relevant page.

| # | Label | Query | Link |
|---|---|---|---|
| 1 | Disponibles en tienda | `unidades WHERE estado_logistico = 'En tienda' AND estado_comercial IS NULL` | `/unidades?estado_logistico=En+tienda&estado_comercial=Disponible` |
| 2 | Separadas | `unidades WHERE estado_comercial = 'Separada'` | `/unidades?estado_comercial=Separada` |
| 3 | Vendidas sin entregar | `unidades WHERE estado_comercial = 'Vendida'` | `/unidades?estado_comercial=Vendida` |
| 4 | Reclamos pendientes | `reclamos WHERE estado = 'Pendiente'` | `/reclamos` |
| 5 | Seguimientos vencidos | `ventas JOIN unidades WHERE seguimiento_7dias_hecho = false AND unidades.fecha_entrega <= hoy - 7 días AND unidades.fecha_entrega IS NOT NULL` | `/seguimientos` |
| 6 | Contactos recientes | Main number: prospectos `created_at >= hoy - 30 días`. Secondary line: "X activos" where etapa IN ('Interesado', 'Dio adelanto') | `/prospectos` |

Card 6 renders the main count in `text-2xl font-bold` and the "X activos" in `text-xs text-muted-foreground` below the label.

---

## Contactos Recientes Section

A card (`bg-card border border-border rounded-xl`) below the KPI row showing the 5 most recently created prospectos (ordered by `created_at DESC LIMIT 5`).

**Header:** "Contactos recientes" (`font-semibold`) + "Ver todos →" link to `/prospectos` aligned right.

**Each row:**
- Prospect name (`font-medium text-sm`)
- Etapa badge using existing `EstadoBadge` tone mapping: `Interesado` → gray, `Dio adelanto` → amber, `Vendido` → green, `Desistió` → red
- Relative time ("hace 2 días") derived from `created_at` using `date-fns` `formatDistanceToNow`
- Chevron icon linking to `/prospectos` (no individual prospect detail page currently exists, so link goes to list)

Rows are separated by `divide-y divide-border`. If no prospectos exist, show a centered `text-muted-foreground` empty state.

---

## Data Fetching

`lib/actions/panel-vendedor.ts` exports a single function:

```ts
export interface PanelVendedorData {
  disponiblesEnTienda: number
  separadas: number
  vendidasSinEntregar: number
  reclamosPendientes: number
  seguimientosVencidos: number
  prospectos30dias: number
  prospectosActivos: number
  contactosRecientes: {
    id: string
    nombre: string
    etapa: string
    created_at: string
  }[]
}

export async function getPanelVendedor(): Promise<PanelVendedorData>
```

All 6 sub-queries execute in a single `Promise.all`. The seguimientos query replicates the existing logic from `app/(vendedor)/layout.tsx` (which already fetches the badge count for the sidebar).

---

## Component Structure

```
components/panel-vendedor/
  panel-vendedor.tsx          — composition root, accepts PanelVendedorData
  panel-kpi-cards.tsx         — 6-card responsive grid
  panel-contactos-recientes.tsx — section with 5-row list + "Ver todos"
```

`app/(vendedor)/unidades/page.tsx` calls `getPanelVendedor()` in parallel with `obtenerUnidades()` via `Promise.all`, then renders `<PanelVendedor data={panelData} />` before `<PageHeader>`.

---

## Styling

Follows the existing Claude Design system:
- Cards: `bg-card border border-border rounded-xl`
- KPI number: `text-2xl font-bold font-sans`
- Labels: `text-sm text-muted-foreground`
- Section header: `text-base font-semibold`
- "Ver todos" link: `text-sm text-primary hover:underline`
- Etapa badges: reuse `EstadoBadge` component with appropriate tone

---

## Error Handling

`getPanelVendedor()` throws on Supabase error (consistent with all other actions). The page-level error boundary in Next.js handles it. No partial-failure fallback needed — the panel is informational and a full page error is acceptable.

---

## Out of Scope

- Real-time updates / polling
- Alertas activas section (removed per user decision)
- Unidades más tiempo en tienda section (removed per user decision)
- Distribución por estado section (removed per user decision)
- Gerente role (panel is vendedor-only)
