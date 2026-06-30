# Panel Vendedor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Panel general" section above the unidades list on `/unidades`, showing 6 KPI cards and a "Contactos recientes" list of the 5 latest prospects.

**Architecture:** Pure Server Components — data fetched via a single `getPanelVendedor()` action using `Promise.all`, rendered before `<PageHeader>` in the unidades page. No client state, no polling.

**Tech Stack:** Next.js 14 App Router, Supabase (PostgREST), date-fns, Tailwind/shadcn, TypeScript.

## Global Constraints

- All commands run from inside `crm-milenium-motos/` — never from the repo root.
- No `'use client'` directives in any new file (pure Server Components).
- Use `createServerClient()` from `@/lib/supabase/server` for all DB access.
- Follow existing styling: `bg-card border border-border rounded-xl` for cards.
- `EstadoBadge` accepts `tone` and `children` (React.ReactNode) — not a `label` prop.
- Verification: `npm run build` (TypeScript + ESLint) is the test gate for each task. The project has no component or DB test infrastructure.

---

## File Map

| Action | File |
|---|---|
| Create | `lib/actions/panel-vendedor.ts` |
| Create | `components/panel-vendedor/panel-kpi-cards.tsx` |
| Create | `components/panel-vendedor/panel-contactos-recientes.tsx` |
| Create | `components/panel-vendedor/panel-vendedor.tsx` |
| Modify | `app/(vendedor)/unidades/page.tsx` |

---

### Task 1: Server Action — `getPanelVendedor`

**Files:**
- Create: `lib/actions/panel-vendedor.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface ContactoReciente {
    id: string
    nombre: string
    etapa: string
    created_at: string
  }
  export interface PanelVendedorData {
    disponiblesEnTienda: number
    separadas: number
    vendidasSinEntregar: number
    reclamosPendientes: number
    seguimientosVencidos: number
    prospectos30dias: number
    prospectosActivos: number
    contactosRecientes: ContactoReciente[]
  }
  export async function getPanelVendedor(): Promise<PanelVendedorData>
  ```

- [ ] **Step 1: Create the action file**

  ```ts
  // lib/actions/panel-vendedor.ts
  'use server'

  import { createServerClient } from '@/lib/supabase/server'

  export interface ContactoReciente {
    id: string
    nombre: string
    etapa: string
    created_at: string
  }

  export interface PanelVendedorData {
    disponiblesEnTienda: number
    separadas: number
    vendidasSinEntregar: number
    reclamosPendientes: number
    seguimientosVencidos: number
    prospectos30dias: number
    prospectosActivos: number
    contactosRecientes: ContactoReciente[]
  }

  export async function getPanelVendedor(): Promise<PanelVendedorData> {
    const supabase = createServerClient()

    const hoy = new Date()
    const hace30dias = new Date(hoy)
    hace30dias.setDate(hoy.getDate() - 30)
    const hace30diasStr = hace30dias.toISOString().split('T')[0]

    const hace7dias = new Date(hoy)
    hace7dias.setDate(hoy.getDate() - 7)
    const hace7diasStr = hace7dias.toISOString().split('T')[0]

    const [
      disponiblesRes,
      separadasRes,
      vendidasRes,
      reclamosRes,
      seguimientosRes,
      prospectos30Res,
      prospectosActivosRes,
      contactosRecientesRes,
    ] = await Promise.all([
      supabase
        .from('unidades')
        .select('id', { count: 'exact', head: true })
        .eq('estado_logistico', 'En tienda')
        .is('estado_comercial', null),
      supabase
        .from('unidades')
        .select('id', { count: 'exact', head: true })
        .eq('estado_comercial', 'Separada'),
      supabase
        .from('unidades')
        .select('id', { count: 'exact', head: true })
        .eq('estado_comercial', 'Vendida'),
      supabase
        .from('reclamos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'Pendiente'),
      // Replicates the sidebar badge logic from app/(vendedor)/layout.tsx
      // Uses fecha_venta as the 7-day cutoff (consistent with existing behavior)
      supabase
        .from('ventas')
        .select('id', { count: 'exact', head: true })
        .eq('seguimiento_7dias_hecho', false)
        .lte('fecha_venta', hace7diasStr),
      supabase
        .from('prospectos')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', hace30diasStr),
      supabase
        .from('prospectos')
        .select('id', { count: 'exact', head: true })
        .in('etapa', ['Interesado', 'Dio adelanto']),
      supabase
        .from('prospectos')
        .select('id, nombre, etapa, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return {
      disponiblesEnTienda: disponiblesRes.count ?? 0,
      separadas: separadasRes.count ?? 0,
      vendidasSinEntregar: vendidasRes.count ?? 0,
      reclamosPendientes: reclamosRes.count ?? 0,
      seguimientosVencidos: seguimientosRes.count ?? 0,
      prospectos30dias: prospectos30Res.count ?? 0,
      prospectosActivos: prospectosActivosRes.count ?? 0,
      contactosRecientes: (contactosRecientesRes.data ?? []).map(p => ({
        id: p.id,
        nombre: p.nombre,
        etapa: p.etapa,
        created_at: p.created_at,
      })),
    }
  }
  ```

- [ ] **Step 2: Verify TypeScript compilation**

  Run from `crm-milenium-motos/`:
  ```bash
  npm run build
  ```
  Expected: build completes with no TypeScript errors on the new file.

- [ ] **Step 3: Commit**

  ```bash
  git add lib/actions/panel-vendedor.ts
  git commit -m "feat(panel): agregar server action getPanelVendedor con 8 consultas paralelas"
  ```

---

### Task 2: KPI Cards Component

**Files:**
- Create: `components/panel-vendedor/panel-kpi-cards.tsx`

**Interfaces:**
- Consumes: `PanelVendedorData` from `@/lib/actions/panel-vendedor`
- Produces: `export function PanelKpiCards({ data }: { data: PanelVendedorData }): JSX.Element`

- [ ] **Step 1: Create the component**

  ```tsx
  // components/panel-vendedor/panel-kpi-cards.tsx
  import Link from 'next/link'
  import type { PanelVendedorData } from '@/lib/actions/panel-vendedor'

  interface Props {
    data: PanelVendedorData
  }

  export function PanelKpiCards({ data }: Props) {
    const cards = [
      {
        label: 'Disponibles en tienda',
        value: data.disponiblesEnTienda,
        href: '/unidades?estado_logistico=En+tienda&estado_comercial=Disponible',
      },
      {
        label: 'Separadas',
        value: data.separadas,
        href: '/unidades?estado_comercial=Separada',
      },
      {
        label: 'Vendidas sin entregar',
        value: data.vendidasSinEntregar,
        href: '/unidades?estado_comercial=Vendida',
      },
      {
        label: 'Reclamos pendientes',
        value: data.reclamosPendientes,
        href: '/reclamos',
      },
      {
        label: 'Seguimientos vencidos',
        value: data.seguimientosVencidos,
        href: '/seguimientos',
      },
      {
        label: 'Contactos recientes',
        value: data.prospectos30dias,
        secondary: `${data.prospectosActivos} activos ahora`,
        href: '/prospectos',
      },
    ]

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-tight">{card.label}</p>
            {'secondary' in card && card.secondary && (
              <p className="text-xs text-muted-foreground mt-0.5">{card.secondary}</p>
            )}
          </Link>
        ))}
      </div>
    )
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add components/panel-vendedor/panel-kpi-cards.tsx
  git commit -m "feat(panel): agregar componente PanelKpiCards con 6 tarjetas"
  ```

---

### Task 3: Contactos Recientes Component

**Files:**
- Create: `components/panel-vendedor/panel-contactos-recientes.tsx`

**Interfaces:**
- Consumes: `ContactoReciente[]` from `@/lib/actions/panel-vendedor`
- Produces: `export function PanelContactosRecientes({ contactos }: { contactos: ContactoReciente[] }): JSX.Element`

**Notes:**
- `EstadoBadge` signature: `{ tone: Tone; children: React.ReactNode }` — no `label` prop.
- `formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: es })` renders Spanish relative time server-side (e.g. "hace 2 días"). `created_at` from Supabase is an ISO 8601 string — `new Date()` parses it correctly.

- [ ] **Step 1: Create the component**

  ```tsx
  // components/panel-vendedor/panel-contactos-recientes.tsx
  import Link from 'next/link'
  import { ChevronRight } from 'lucide-react'
  import { formatDistanceToNow } from 'date-fns'
  import { es } from 'date-fns/locale'
  import { EstadoBadge } from '@/components/unidades/estado-badges'
  import type { ContactoReciente } from '@/lib/actions/panel-vendedor'

  type Tone = 'green' | 'amber' | 'red' | 'gray'

  const TONO_ETAPA: Record<string, Tone> = {
    'Interesado': 'gray',
    'Dio adelanto': 'amber',
    'Vendido': 'green',
    'Desistió': 'red',
  }

  interface Props {
    contactos: ContactoReciente[]
  }

  export function PanelContactosRecientes({ contactos }: Props) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-semibold text-base">Contactos recientes</p>
          <Link href="/prospectos" className="text-sm text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        {contactos.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground text-sm">
            Sin contactos recientes
          </p>
        ) : (
          <div className="divide-y divide-border">
            {contactos.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                <EstadoBadge tone={TONO_ETAPA[c.etapa] ?? 'gray'}>
                  {c.etapa}
                </EstadoBadge>
                <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```
  Expected: no errors. If `date-fns/locale` gives a module error, check the date-fns version with `cat package.json | grep date-fns` — in v3 the import is `import { es } from 'date-fns/locale/es'`.

- [ ] **Step 3: Commit**

  ```bash
  git add components/panel-vendedor/panel-contactos-recientes.tsx
  git commit -m "feat(panel): agregar componente PanelContactosRecientes con 5 últimos prospectos"
  ```

---

### Task 4: Composition + Page Integration

**Files:**
- Create: `components/panel-vendedor/panel-vendedor.tsx`
- Modify: `app/(vendedor)/unidades/page.tsx`

**Interfaces:**
- Consumes: `PanelVendedorData` from Task 1, `PanelKpiCards` from Task 2, `PanelContactosRecientes` from Task 3
- Produces: `export function PanelVendedor({ data }: { data: PanelVendedorData }): JSX.Element`

- [ ] **Step 1: Create the composition component**

  ```tsx
  // components/panel-vendedor/panel-vendedor.tsx
  import { PanelKpiCards } from './panel-kpi-cards'
  import { PanelContactosRecientes } from './panel-contactos-recientes'
  import type { PanelVendedorData } from '@/lib/actions/panel-vendedor'

  interface Props {
    data: PanelVendedorData
  }

  export function PanelVendedor({ data }: Props) {
    return (
      <div className="space-y-4">
        <PanelKpiCards data={data} />
        <PanelContactosRecientes contactos={data.contactosRecientes} />
      </div>
    )
  }
  ```

- [ ] **Step 2: Modify `app/(vendedor)/unidades/page.tsx`**

  Replace the entire file content with:

  ```tsx
  // app/(vendedor)/unidades/page.tsx
  import { Suspense } from 'react'
  import Link from 'next/link'
  import { obtenerUnidades } from '@/lib/actions/unidades'
  import { getPanelVendedor } from '@/lib/actions/panel-vendedor'
  import { PanelVendedor } from '@/components/panel-vendedor/panel-vendedor'
  import { UnidadFilters } from '@/components/unidades/unidad-filters'
  import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
  import { Button } from '@/components/ui/button'
  import { PageHeader } from '@/components/ui/page-header'
  import { EliminarUnidadButton } from '@/components/unidades/eliminar-unidad-button'
  import { Plus, ChevronRight } from 'lucide-react'

  interface Props {
    searchParams: { modelo?: string; estado_logistico?: string; estado_comercial?: string; tipo_ingreso?: string }
  }

  export default async function UnidadesPage({ searchParams }: Props) {
    const [unidades, panelData] = await Promise.all([
      obtenerUnidades(searchParams),
      getPanelVendedor(),
    ])

    return (
      <div className="space-y-4">
        <PanelVendedor data={panelData} />
        <PageHeader
          title="Unidades"
          description={`${unidades.length} unidad${unidades.length !== 1 ? 'es' : ''} en inventario`}
          actions={
            <Button asChild>
              <Link href="/unidades/nueva"><Plus size={16} /> Nueva unidad</Link>
            </Button>
          }
        />
        <Suspense fallback={<div className="flex flex-wrap gap-2 h-9" />}>
          <UnidadFilters />
        </Suspense>
        <div className="rounded-xl border border-border bg-card divide-y">
          {unidades.length === 0 && (
            <p className="p-6 text-muted-foreground text-center">No se encontraron unidades</p>
          )}
          {unidades.map(u => (
            <div key={u.id} className="flex items-center gap-2 pr-2 hover:bg-secondary/50 transition-colors">
              <Link
                href={`/unidades/${u.id}`}
                className="flex items-center gap-3 p-4 flex-1 min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-medium text-sm truncate">{u.n_motor}</p>
                  <p className="text-sm text-muted-foreground">{u.modelo} · {u.tipo_ingreso}</p>
                  {u.clientes && (
                    <p className="text-xs text-muted-foreground">{u.clientes.nombre_completo}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <BadgeLogistico estado={u.estado_logistico} />
                  <BadgeComercial estado={u.estado_comercial} />
                </div>
                <ChevronRight size={17} className="text-muted-foreground/40 shrink-0" />
              </Link>
              <EliminarUnidadButton id={u.id} nMotor={u.n_motor} />
            </div>
          ))}
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Run final build**

  ```bash
  npm run build
  ```
  Expected: clean build, no TypeScript or ESLint errors.

- [ ] **Step 4: Visual verification**

  ```bash
  npm run dev
  ```
  Open `http://localhost:3000/unidades` (logged in as vendedor) and verify:
  - 6 KPI cards render in a row (2-col on mobile, 3-col on tablet, 6-col on desktop)
  - Each card is clickable and navigates to the correct route
  - "Contactos recientes" section shows up to 5 prospects with name, etapa badge, and relative time
  - "Ver todos →" link navigates to `/prospectos`
  - Empty state ("Sin contactos recientes") renders when there are no prospects
  - The "Unidades" PageHeader + filters + list appear below unchanged

- [ ] **Step 5: Commit**

  ```bash
  git add components/panel-vendedor/panel-vendedor.tsx app/(vendedor)/unidades/page.tsx
  git commit -m "feat(panel): integrar PanelVendedor en página de unidades"
  ```
