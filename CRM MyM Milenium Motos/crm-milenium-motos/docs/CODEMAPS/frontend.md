<!-- Generated: 2026-07-12 | Files scanned: 60 | Token estimate: ~800 -->

# Frontend — Page tree & components

Next.js 14 App Router. Pages are async Server Components unless noted `'use client'`.
No global client-side state manager — state is server-fetched + URL search params.

## Page tree

```
app/
├─ (auth)/login/page.tsx              login form → actions.ts Server Action
├─ (vendedor)/
│  ├─ layout.tsx                      sidebar + bottom-nav, seguimiento badge count
│  ├─ panel/page.tsx                  landing: 4x <Suspense> sections
│  ├─ unidades/{page,nueva,[id]}      ficha con accordion multiple
│  ├─ clientes/{page,nuevo,[id]}
│  ├─ prospectos/{page,nuevo,[id]}    kanban board (etapas)
│  ├─ ventas/page.tsx
│  ├─ seguimientos/page.tsx
│  ├─ garantias/page.tsx
│  ├─ tramites/page.tsx
│  └─ reclamos/page.tsx
├─ (gerente)/
│  ├─ layout.tsx                      topbar w/ BrandMark
│  └─ dashboard/page.tsx              read-only, recharts
├─ layout.tsx                         fonts (Manrope/IBM Plex Mono), globals.css
├─ manifest.ts / offline/page.tsx     PWA
└─ page.tsx                           root redirect
```

## Panel del Vendedor (`components/panel/`)
alertas-section, embudo-section, cartera-section (3 accordion sub-tables), inventario-section
(5 model cards + en-camino table), periodo-selector (`'use client'`, `?periodo=dia|semana|mes`
+ `?mes/anio` navigator)

## Dashboard (gerente) (`components/dashboard/`)
kpi-cards, ventas-chart, compras-chart, embudo-chart, inventario-cards,
cuentas-cobrar-table, periodo-filter, utilidad-section — all recharts-based

## Feature components
- `components/prospectos/` — kanban-board, kanban-column, prospecto-card,
  prospecto-form, convertir-venta-flow
- `components/unidades/` — unidad-form, unidad-filters, estado-badges
  (EstadoBadge/BadgeLogistico/BadgeComercial/BadgeEstadoPago), sections/* (8 accordion
  sections: datos-generales, compra, tienda, fibra, venta, pagos, garantias,
  tramites, reclamos), inline-edit pattern (pencil icon → form → Server Action)
- `components/ventas/` — venta-form, pago-form
- `components/clientes/` — cliente-form, clientes-busqueda (300ms debounce → `?q=`)
- `components/reclamos/` — reclamo-form
- `components/tramites/tramites-filtro.tsx` — reusable `?mes&anio` filter (ventas,
  tramites, garantias, reclamos)
- `components/nav/` — sidebar (236px, `BrandMark` logo), bottom-nav (mobile)
- `components/pwa/service-worker-register.tsx` — registers `public/sw.js`

## UI primitives (`components/ui/`) — shadcn/ui
accordion, badge, button, card, dialog, form, input, label, page-header, select,
table, tabs, textarea

## Design tokens
`app/globals.css` (HSL vars: --primary #1F56D6, --destructive #E23B3B, --radius 0.75rem),
`tailwind.config.ts` (brand.*, estado.* per-tone bg/fg/dot), fonts via `next/font/google`
(Manrope=--font-sans, IBM Plex Mono=--font-mono for codes/amounts).
