# Panel del Vendedor — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el Panel operativo diario del vendedor (`/panel`) con alertas, embudo del período, cartera activa e inventario, que reemplaza `/unidades` como pantalla de inicio al hacer login.

**Architecture:** Página Server Component con cuatro secciones async independientes bajo `<Suspense>`. El selector de período del embudo usa URL search params (`?periodo=dia|semana|mes`) — mismo patrón que los filtros de ventas/trámites existentes. Todas las queries en `lib/actions/panel.ts` usando `createServerClient()`. Sin estado cliente salvo el botón de período.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase JS v2, shadcn/ui (card, badge, table, accordion — todos ya instalados), date-fns, Tailwind CSS / Claude Design tokens.

## Global Constraints

- Todos los comandos se ejecutan desde dentro de `crm-milenium-motos/` (no desde la raíz del repo)
- Idioma UI: español en todos los textos y labels
- Montos: `formatSoles(n)` de `lib/utils/format.ts` → `"S/ 1,234.56"`
- Fechas: siempre `parse(str, 'yyyy-MM-dd', new Date())` de `date-fns`, nunca `new Date('yyyy-MM-dd')` directo (bug de timezone)
- TZ en tests: `TZ=UTC` (ya configurado en `vitest.config.ts`)
- Design tokens: `bg-card`, `bg-accent`, `text-muted-foreground`, `font-mono tabular-nums`, `bg-brand`, `bg-brand-red` — igual que el resto del proyecto
- `PageHeader` de `components/ui/page-header.tsx` para el encabezado de página
- Server Actions como props: solo funcionan Server Component → Client Component; las páginas que los usan no pueden tener `'use client'`
- `lib/supabase/types.ts` es `Database = any` placeholder; los tipos se manejan con type assertions explícitas en las acciones

---

## Mapa de archivos

```
NUEVOS:
lib/utils/panel.ts                          ← calcularRangoPeriodo (función pura, testeable)
lib/utils/__tests__/panel.test.ts           ← tests TDD de calcularRangoPeriodo
lib/actions/panel.ts                        ← todas las queries del panel (8 funciones)
app/(vendedor)/panel/page.tsx               ← página principal (Server Component)
components/panel/alertas-section.tsx        ← async Server Component: 2 alertas
components/panel/periodo-selector.tsx       ← Client Component: botones día/semana/mes
components/panel/embudo-section.tsx         ← async Server Component: 4 métricas
components/panel/cartera-section.tsx        ← async Server Component: 3 sub-tablas
components/panel/inventario-section.tsx     ← async Server Component: disponibles + en camino

MODIFICADOS:
lib/constants.ts                            ← agregar DIAS_LEAD_SIN_CONTACTAR = 2
app/page.tsx                                ← cambiar redirect vendedor /unidades → /panel
middleware.ts                               ← cambiar redirect vendedor /unidades → /panel
components/nav/sidebar.tsx                  ← agregar ítem "Panel" como primer ítem
components/nav/bottom-nav.tsx               ← agregar ítem "Panel" como primer ítem
```

---

## Task 1: Utilidades de período (TDD)

**Files:**
- Create: `lib/utils/panel.ts`
- Create: `lib/utils/__tests__/panel.test.ts`

**Interfaces:**
- Produces: `Periodo` type, `calcularRangoPeriodo(periodo: Periodo): { desde: string; hasta: string }` — usada en Task 2 y Task 5.

- [ ] **Step 1: Escribir el test que falla**

```ts
// lib/utils/__tests__/panel.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calcularRangoPeriodo } from '../panel'

describe('calcularRangoPeriodo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 2026-06-30 es martes (Jun 1 es lunes → Jun 29 es lunes → Jun 30 es martes)
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('dia: retorna hoy como desde y hasta', () => {
    const { desde, hasta } = calcularRangoPeriodo('dia')
    expect(desde).toBe('2026-06-30')
    expect(hasta).toBe('2026-06-30')
  })

  it('semana: retorna lunes a domingo de la semana en curso', () => {
    const { desde, hasta } = calcularRangoPeriodo('semana')
    expect(desde).toBe('2026-06-29') // lunes
    expect(hasta).toBe('2026-07-05') // domingo
  })

  it('mes: retorna primer y último día del mes en curso', () => {
    const { desde, hasta } = calcularRangoPeriodo('mes')
    expect(desde).toBe('2026-06-01')
    expect(hasta).toBe('2026-06-30')
  })

  it('dia a fin de mes: desde y hasta son el último día del mes', () => {
    vi.setSystemTime(new Date('2026-05-31T10:00:00Z'))
    const { desde, hasta } = calcularRangoPeriodo('dia')
    expect(desde).toBe('2026-05-31')
    expect(hasta).toBe('2026-05-31')
  })
})
```

- [ ] **Step 2: Verificar que el test falla**

```bash
npx vitest run lib/utils/__tests__/panel.test.ts
```

Expected: FAIL — `Cannot find module '../panel'`

- [ ] **Step 3: Implementar `lib/utils/panel.ts`**

```ts
// lib/utils/panel.ts
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export type Periodo = 'dia' | 'semana' | 'mes'

export function calcularRangoPeriodo(periodo: Periodo): { desde: string; hasta: string } {
  const hoy = new Date()
  let desde: Date
  let hasta: Date

  switch (periodo) {
    case 'dia':
      desde = startOfDay(hoy)
      hasta = endOfDay(hoy)
      break
    case 'semana':
      desde = startOfWeek(hoy, { weekStartsOn: 1 })
      hasta = endOfWeek(hoy, { weekStartsOn: 1 })
      break
    case 'mes':
      desde = startOfMonth(hoy)
      hasta = endOfMonth(hoy)
      break
  }

  return {
    desde: format(desde, 'yyyy-MM-dd'),
    hasta: format(hasta, 'yyyy-MM-dd'),
  }
}
```

- [ ] **Step 4: Verificar que los tests pasan**

```bash
npx vitest run lib/utils/__tests__/panel.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Verificar que todos los tests del proyecto siguen pasando**

```bash
npm run test
```

Expected: todos los tests PASS (los nuevos más los 17+ existentes)

- [ ] **Step 6: Commit**

```bash
git add lib/utils/panel.ts lib/utils/__tests__/panel.test.ts
git commit -m "feat(panel): agregar utilidad calcularRangoPeriodo con TDD"
```

---

## Task 2: Acciones del panel

**Files:**
- Create: `lib/actions/panel.ts`

**Interfaces:**
- Consumes: `calcularRangoPeriodo` de `lib/utils/panel.ts`, `MODELOS_MOTO` y `DIAS_LEAD_SIN_CONTACTAR` de `lib/constants.ts` (la constante se agrega en Task 3 pero podemos hardcodear `2` aquí y ajustar en Task 3)
- Produces (para Tasks 4–6):
  - `getAlertasSeguimiento(): Promise<AlertaSeguimiento[]>`
  - `getAlertasLeadsSinContactar(dias: number): Promise<AlertaLead[]>`
  - `getEmbudoPeriodo(periodo: Periodo): Promise<EmbudoData>`
  - `getCarteraSeparadas(): Promise<CarteraSeparada[]>`
  - `getCarteraPendientesEntrega(): Promise<CarteraPendienteEntrega[]>`
  - `getCarteraTramitesPendientes(): Promise<CarteraTramitePendiente[]>`
  - `getInventarioDisponible(): Promise<Record<string, number>>`
  - `getInventarioEnCamino(): Promise<Record<string, { pedidas: number; en_fibrero: number }>>`

- [ ] **Step 1: Crear `lib/actions/panel.ts`**

```ts
// lib/actions/panel.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { parse, differenceInDays } from 'date-fns'
import { calcularRangoPeriodo, type Periodo } from '@/lib/utils/panel'
import { MODELOS_MOTO } from '@/lib/constants'

// ─── Tipos exportados ────────────────────────────────────────────────────────

export interface AlertaSeguimiento {
  venta_id: string
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  dias_desde_entrega: number
}

export interface AlertaLead {
  id: string
  nombre: string
  telefono: string | null
  etapa: string
  dias_sin_contactar: number
}

export interface EmbudoData {
  leadsRecibidos: number
  dieronAdelanto: number
  ventasCerradas: number
  tasaConversion: number | null
}

export interface CarteraSeparada {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  precio_venta: number
  pagado: number
  saldo: number
  dias_desde_venta: number | null
}

export interface CarteraPendienteEntrega {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  fecha_venta: string | null
}

export interface CarteraTramitePendiente {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  sunarp_estado: string | null
  aap_estado: string | null
}

// ─── Alertas ─────────────────────────────────────────────────────────────────

export async function getAlertasSeguimiento(): Promise<AlertaSeguimiento[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('ventas')
    .select(`
      id,
      unidad_id,
      clientes(nombre_completo),
      unidades(id, modelo, n_motor, fecha_entrega)
    `)
    .eq('seguimiento_7dias_hecho', false)

  if (error) throw new Error(error.message)

  const hoy = new Date()

  return (data ?? [])
    .filter(v => {
      const u = v.unidades as { fecha_entrega?: string | null } | null
      if (!u?.fecha_entrega) return false
      const fechaEntrega = parse(u.fecha_entrega, 'yyyy-MM-dd', new Date())
      return differenceInDays(hoy, fechaEntrega) >= 7
    })
    .map(v => {
      const u = v.unidades as { id: string; modelo: string; n_motor: string; fecha_entrega: string }
      const c = v.clientes as { nombre_completo: string } | null
      const fechaEntrega = parse(u.fecha_entrega, 'yyyy-MM-dd', new Date())
      return {
        venta_id: v.id,
        unidad_id: v.unidad_id,
        modelo: u.modelo,
        n_motor: u.n_motor,
        cliente: c?.nombre_completo ?? null,
        dias_desde_entrega: differenceInDays(hoy, fechaEntrega),
      }
    })
    .sort((a, b) => b.dias_desde_entrega - a.dias_desde_entrega)
}

export async function getAlertasLeadsSinContactar(dias: number): Promise<AlertaLead[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('prospectos')
    .select('id, nombre, telefono, etapa, updated_at')
    .neq('etapa', 'Vendido')
    .neq('etapa', 'Desistió')

  if (error) throw new Error(error.message)

  const hoy = new Date()
  const limite = new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000)

  return (data ?? [])
    .filter(p => new Date(p.updated_at) <= limite)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      telefono: p.telefono ?? null,
      etapa: p.etapa,
      dias_sin_contactar: differenceInDays(hoy, new Date(p.updated_at)),
    }))
    .sort((a, b) => b.dias_sin_contactar - a.dias_sin_contactar)
}

// ─── Embudo ───────────────────────────────────────────────────────────────────

export async function getEmbudoPeriodo(periodo: Periodo): Promise<EmbudoData> {
  const supabase = createServerClient()
  const { desde, hasta } = calcularRangoPeriodo(periodo)
  const hastaFin = hasta + 'T23:59:59'

  const [leadsRes, adelantosRes, ventasRes] = await Promise.all([
    supabase
      .from('prospectos')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', desde)
      .lte('created_at', hastaFin),
    supabase
      .from('ventas')
      .select('id', { count: 'exact', head: true })
      .eq('tipo_venta', 'Separación')
      .gte('fecha_venta', desde)
      .lte('fecha_venta', hasta),
    supabase
      .from('ventas')
      .select('id', { count: 'exact', head: true })
      .gte('fecha_venta', desde)
      .lte('fecha_venta', hasta),
  ])

  const leadsRecibidos = leadsRes.count ?? 0
  const dieronAdelanto = adelantosRes.count ?? 0
  const ventasCerradas = ventasRes.count ?? 0

  return {
    leadsRecibidos,
    dieronAdelanto,
    ventasCerradas,
    tasaConversion: leadsRecibidos > 0 ? Math.round((ventasCerradas / leadsRecibidos) * 100) : null,
  }
}

// ─── Cartera ──────────────────────────────────────────────────────────────────

export async function getCarteraSeparadas(): Promise<CarteraSeparada[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      ventas(id, precio_venta, fecha_venta, pagos(monto))
    `)
    .eq('estado_comercial', 'Separada')

  if (error) throw new Error(error.message)

  const hoy = new Date()

  return (data ?? []).map(u => {
    const ventasArr = u.ventas as { precio_venta: number; fecha_venta: string | null; pagos: { monto: number }[] }[] | null
    const venta = ventasArr?.[0]
    const pagosArr = (venta?.pagos ?? []) as { monto: number | string }[]
    const pagado = pagosArr.reduce((acc, p) => acc + Number(p.monto), 0)
    const precioVenta = Number(venta?.precio_venta ?? 0)
    const fechaVenta = venta?.fecha_venta
      ? parse(venta.fecha_venta, 'yyyy-MM-dd', new Date())
      : null

    return {
      unidad_id: u.id,
      modelo: u.modelo,
      n_motor: u.n_motor,
      cliente: (u.clientes as { nombre_completo: string } | null)?.nombre_completo ?? null,
      precio_venta: precioVenta,
      pagado,
      saldo: precioVenta - pagado,
      dias_desde_venta: fechaVenta ? differenceInDays(hoy, fechaVenta) : null,
    }
  })
}

export async function getCarteraPendientesEntrega(): Promise<CarteraPendienteEntrega[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      ventas(fecha_venta)
    `)
    .eq('estado_comercial', 'Vendida')

  if (error) throw new Error(error.message)

  return (data ?? []).map(u => {
    const ventasArr = u.ventas as { fecha_venta: string | null }[] | null
    return {
      unidad_id: u.id,
      modelo: u.modelo,
      n_motor: u.n_motor,
      cliente: (u.clientes as { nombre_completo: string } | null)?.nombre_completo ?? null,
      fecha_venta: ventasArr?.[0]?.fecha_venta ?? null,
    }
  })
}

export async function getCarteraTramitesPendientes(): Promise<CarteraTramitePendiente[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      tramites(sunarp_estado, aap_estado)
    `)
    .eq('estado_comercial', 'Entregada')

  if (error) throw new Error(error.message)

  return (data ?? [])
    .filter(u => {
      const t = (u.tramites as { sunarp_estado: string | null; aap_estado: string | null }[] | null)?.[0]
      if (!t) return true
      return t.sunarp_estado !== 'Inscrito' || t.aap_estado !== 'Recojo'
    })
    .map(u => {
      const t = (u.tramites as { sunarp_estado: string | null; aap_estado: string | null }[] | null)?.[0]
      return {
        unidad_id: u.id,
        modelo: u.modelo,
        n_motor: u.n_motor,
        cliente: (u.clientes as { nombre_completo: string } | null)?.nombre_completo ?? null,
        sunarp_estado: t?.sunarp_estado ?? null,
        aap_estado: t?.aap_estado ?? null,
      }
    })
}

// ─── Inventario ───────────────────────────────────────────────────────────────

export async function getInventarioDisponible(): Promise<Record<string, number>> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select('modelo')
    .is('estado_comercial', null)
    .eq('estado_logistico', 'En tienda')

  if (error) throw new Error(error.message)

  const conteo: Record<string, number> = {}
  MODELOS_MOTO.forEach(m => { conteo[m] = 0 })
  ;(data ?? []).forEach(u => { conteo[u.modelo] = (conteo[u.modelo] ?? 0) + 1 })

  return conteo
}

export async function getInventarioEnCamino(): Promise<Record<string, { pedidas: number; en_fibrero: number }>> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select('modelo, estado_logistico')
    .in('estado_logistico', ['Pedida', 'En fibrero'])

  if (error) throw new Error(error.message)

  const conteo: Record<string, { pedidas: number; en_fibrero: number }> = {}

  ;(data ?? []).forEach(u => {
    if (!conteo[u.modelo]) conteo[u.modelo] = { pedidas: 0, en_fibrero: 0 }
    if (u.estado_logistico === 'Pedida') conteo[u.modelo].pedidas++
    else conteo[u.modelo].en_fibrero++
  })

  return conteo
}
```

- [ ] **Step 2: Verificar que el proyecto compila sin errores**

```bash
npm run build
```

Expected: build exitoso. Si hay errores de tipo, corrígelos antes de continuar.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/panel.ts
git commit -m "feat(panel): agregar acciones del panel (queries Supabase)"
```

---

## Task 3: Constante + Redirección + Navegación

**Files:**
- Modify: `lib/constants.ts`
- Modify: `app/page.tsx`
- Modify: `middleware.ts`
- Modify: `components/nav/sidebar.tsx`
- Modify: `components/nav/bottom-nav.tsx`

**Interfaces:**
- Consumes: nada nuevo
- Produces: `DIAS_LEAD_SIN_CONTACTAR` exportado de `lib/constants.ts` — usado en Task 4

- [ ] **Step 1: Agregar constante en `lib/constants.ts`**

Al final del archivo, agregar:

```ts
export const DIAS_LEAD_SIN_CONTACTAR = 2
```

- [ ] **Step 2: Cambiar redirect del vendedor en `app/page.tsx`**

Cambiar la última línea de `app/page.tsx`:

```ts
// Antes:
redirect('/unidades')

// Después:
redirect('/panel')
```

- [ ] **Step 3: Cambiar redirect del vendedor en `middleware.ts`**

Cambiar la línea del redirect de vendedor que intenta acceder a `/dashboard`:

```ts
// Antes:
if (rol === 'vendedor' && pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/unidades', request.url))
}

// Después:
if (rol === 'vendedor' && pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/panel', request.url))
}
```

- [ ] **Step 4: Agregar ítem "Panel" en `components/nav/sidebar.tsx`**

Agregar `LayoutDashboard` al import de lucide-react y "Panel" como primer ítem del array:

```ts
// Cambiar import de lucide-react — agregar LayoutDashboard:
import {
  LayoutDashboard,
  Bike,
  Users,
  Columns3,
  Bell,
  ShieldCheck,
  FileText,
  OctagonAlert,
  ReceiptText,
  LogOut,
} from 'lucide-react'

// Cambiar navItems — agregar Panel al inicio:
const navItems = [
  { href: '/panel', label: 'Panel', icon: LayoutDashboard },
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: Columns3 },
  { href: '/ventas', label: 'Ventas', icon: ReceiptText },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
  { href: '/garantias', label: 'Garantías', icon: ShieldCheck },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/reclamos', label: 'Reclamos', icon: OctagonAlert },
]
```

- [ ] **Step 5: Agregar ítem "Panel" en `components/nav/bottom-nav.tsx`**

Agregar `LayoutDashboard` al import y "Panel" como primer ítem (reemplaza uno existente dado que el bottom-nav tiene espacio limitado — quita "Ventas" ya que tiene ruta propia en sidebar):

```ts
// Cambiar import:
import { LayoutDashboard, Bike, Users, Columns3, ReceiptText } from 'lucide-react'

// Cambiar navItems — Panel primero, mantener 4 ítems:
const navItems = [
  { href: '/panel', label: 'Panel', icon: LayoutDashboard },
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: Columns3 },
]
```

- [ ] **Step 6: Verificar compilación**

```bash
npm run build
```

Expected: build exitoso sin errores de TypeScript.

- [ ] **Step 7: Verificar redirección manualmente**

```bash
npm run dev
```

Abrir `http://localhost:3000` → confirmar que redirige a `/panel` (que aún no existe, por lo que dará 404 — es esperado). El 404 confirma que la redirección funciona.

- [ ] **Step 8: Commit**

```bash
git add lib/constants.ts app/page.tsx middleware.ts components/nav/sidebar.tsx components/nav/bottom-nav.tsx
git commit -m "feat(panel): redirigir vendedor a /panel y agregar ítem de navegación"
```

---

## Task 4: Sección de Alertas

**Files:**
- Create: `components/panel/alertas-section.tsx`

**Interfaces:**
- Consumes: `getAlertasSeguimiento`, `getAlertasLeadsSinContactar` de `lib/actions/panel.ts`; `DIAS_LEAD_SIN_CONTACTAR` de `lib/constants.ts`
- Produces: `AlertasSection` componente async exportado — usado en Task 6

- [ ] **Step 1: Crear `components/panel/alertas-section.tsx`**

```tsx
// components/panel/alertas-section.tsx
import { getAlertasSeguimiento, getAlertasLeadsSinContactar } from '@/lib/actions/panel'
import { DIAS_LEAD_SIN_CONTACTAR } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export async function AlertasSection() {
  const [seguimientos, leads] = await Promise.all([
    getAlertasSeguimiento(),
    getAlertasLeadsSinContactar(DIAS_LEAD_SIN_CONTACTAR),
  ])

  if (seguimientos.length === 0 && leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-4 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-sm font-semibold">Todo al día — sin alertas pendientes</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={15} className="text-destructive" />
            Seguimientos post-venta
            <Badge variant="destructive" className="ml-auto text-xs">
              {seguimientos.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {seguimientos.length === 0 ? (
            <p className="flex items-center gap-1.5 px-4 pb-3 text-sm text-muted-foreground">
              <CheckCircle2 size={14} className="text-green-500" />
              Sin seguimientos pendientes
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {seguimientos.map(s => (
                <li key={s.venta_id}>
                  <Link
                    href={`/unidades/${s.unidad_id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.cliente ?? '—'}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {s.modelo} · {s.n_motor}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-3 shrink-0 text-xs">
                      {s.dias_desde_entrega}d
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={15} className="text-orange-500" />
            Leads sin contactar
            <Badge className="ml-auto bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
              {leads.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {leads.length === 0 ? (
            <p className="flex items-center gap-1.5 px-4 pb-3 text-sm text-muted-foreground">
              <CheckCircle2 size={14} className="text-green-500" />
              Sin leads pendientes de contacto
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {leads.map(l => (
                <li key={l.id}>
                  <Link
                    href={`/prospectos/${l.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.etapa}</p>
                    </div>
                    <Badge className="ml-3 shrink-0 bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
                      {l.dias_sin_contactar}d
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/panel/alertas-section.tsx
git commit -m "feat(panel): agregar sección de alertas de acción inmediata"
```

---

## Task 5: Sección Embudo

**Files:**
- Create: `components/panel/periodo-selector.tsx`
- Create: `components/panel/embudo-section.tsx`

**Interfaces:**
- Consumes: `getEmbudoPeriodo` de `lib/actions/panel.ts`; `Periodo` de `lib/utils/panel.ts`
- Produces: `EmbudoSection` componente async exportado — usado en Task 6; `PeriodoSelector` Client Component

- [ ] **Step 1: Crear `components/panel/periodo-selector.tsx`**

```tsx
// components/panel/periodo-selector.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Periodo } from '@/lib/utils/panel'

const opciones: { value: Periodo; label: string }[] = [
  { value: 'dia', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
]

export function PeriodoSelector({ periodo }: { periodo: Periodo }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function cambiar(p: Periodo) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodo', p)
    router.push(`/panel?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 rounded-lg bg-secondary p-1">
      {opciones.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => cambiar(value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
            periodo === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Crear `components/panel/embudo-section.tsx`**

```tsx
// components/panel/embudo-section.tsx
import { getEmbudoPeriodo } from '@/lib/actions/panel'
import { PeriodoSelector } from './periodo-selector'
import { Card, CardContent } from '@/components/ui/card'
import type { Periodo } from '@/lib/utils/panel'

export async function EmbudoSection({ periodo }: { periodo: Periodo }) {
  const embudo = await getEmbudoPeriodo(periodo)

  const metricas = [
    { label: 'Leads recibidos', valor: embudo.leadsRecibidos },
    { label: 'Dieron adelanto', valor: embudo.dieronAdelanto },
    { label: 'Ventas cerradas', valor: embudo.ventasCerradas },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-extrabold tracking-tight">Embudo del período</h2>
        <PeriodoSelector periodo={periodo} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metricas.map(({ label, valor }) => (
          <Card key={label}>
            <CardContent className="pb-3 pt-4">
              <p className="font-mono text-2xl font-bold tabular-nums">{valor}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-brand/20 bg-brand/5">
          <CardContent className="pb-3 pt-4">
            <p className="font-mono text-2xl font-bold tabular-nums text-brand">
              {embudo.tasaConversion !== null ? `${embudo.tasaConversion}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tasa de conversión</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/panel/periodo-selector.tsx components/panel/embudo-section.tsx
git commit -m "feat(panel): agregar sección de embudo del período con selector"
```

---

## Task 6: Sección Cartera + Inventario + Página principal

**Files:**
- Create: `components/panel/cartera-section.tsx`
- Create: `components/panel/inventario-section.tsx`
- Create: `app/(vendedor)/panel/page.tsx`

**Interfaces:**
- Consumes: todas las acciones de `lib/actions/panel.ts`; `AlertasSection`, `EmbudoSection`; `MODELOS_MOTO` de `lib/constants.ts`; `PageHeader` de `components/ui/page-header.tsx`
- Produces: el panel completo en `/panel`

- [ ] **Step 1: Crear `components/panel/cartera-section.tsx`**

```tsx
// components/panel/cartera-section.tsx
import {
  getCarteraSeparadas,
  getCarteraPendientesEntrega,
  getCarteraTramitesPendientes,
} from '@/lib/actions/panel'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatSoles } from '@/lib/utils/format'

export async function CarteraSection() {
  const [separadas, pendientesEntrega, tramitesPendientes] = await Promise.all([
    getCarteraSeparadas(),
    getCarteraPendientesEntrega(),
    getCarteraTramitesPendientes(),
  ])

  return (
    <div className="space-y-3">
      <h2 className="text-[15px] font-extrabold tracking-tight">Cartera en proceso</h2>
      <Accordion type="multiple" defaultValue={['separadas', 'entrega', 'tramites']} className="space-y-2">

        {/* Separadas */}
        <AccordionItem value="separadas" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Unidades separadas
              <Badge variant="secondary">{separadas.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {separadas.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin unidades separadas</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {separadas.map(s => (
                      <TableRow key={s.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${s.unidad_id}`} className="block font-medium">
                            {s.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{s.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{s.n_motor}</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatSoles(s.precio_venta)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatSoles(s.pagado)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold tabular-nums text-destructive">
                          {formatSoles(s.saldo)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.dias_desde_venta !== null ? `${s.dias_desde_venta}d` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Pendientes de entrega */}
        <AccordionItem value="entrega" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Pendientes de entrega
              <Badge variant="secondary">{pendientesEntrega.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {pendientesEntrega.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin ventas pendientes de entrega</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead>Fecha venta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendientesEntrega.map(u => (
                      <TableRow key={u.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${u.unidad_id}`} className="block font-medium">
                            {u.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{u.n_motor}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {u.fecha_venta ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Trámites pendientes */}
        <AccordionItem value="tramites" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Trámites pendientes (SUNARP / AAP)
              <Badge variant="secondary">{tramitesPendientes.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {tramitesPendientes.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin trámites pendientes</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead>SUNARP</TableHead>
                      <TableHead>AAP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tramitesPendientes.map(u => (
                      <TableRow key={u.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${u.unidad_id}`} className="block font-medium">
                            {u.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{u.n_motor}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.sunarp_estado === 'Inscrito' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {u.sunarp_estado ?? 'Sin iniciar'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.aap_estado === 'Recojo' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {u.aap_estado ?? 'Sin iniciar'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}
```

- [ ] **Step 2: Crear `components/panel/inventario-section.tsx`**

```tsx
// components/panel/inventario-section.tsx
import { getInventarioDisponible, getInventarioEnCamino } from '@/lib/actions/panel'
import { Card, CardContent } from '@/components/ui/card'
import { MODELOS_MOTO } from '@/lib/constants'

export async function InventarioSection() {
  const [disponible, enCamino] = await Promise.all([
    getInventarioDisponible(),
    getInventarioEnCamino(),
  ])

  const hayEnCamino = Object.keys(enCamino).length > 0

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-extrabold tracking-tight">Disponibilidad de inventario</h2>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          En tienda — disponibles
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {MODELOS_MOTO.map(modelo => (
            <Card key={modelo} className={disponible[modelo] === 0 ? 'opacity-50' : ''}>
              <CardContent className="pb-2 pt-3 text-center">
                <p className="font-mono text-xl font-bold tabular-nums">{disponible[modelo] ?? 0}</p>
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{modelo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          En camino
        </p>
        {!hayEnCamino ? (
          <p className="text-sm text-muted-foreground">Sin unidades en camino</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(enCamino).map(([modelo, counts]) => (
              <Card key={modelo}>
                <CardContent className="pb-2 pt-3">
                  <p className="text-sm font-semibold">{modelo}</p>
                  <div className="mt-1 flex gap-4">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-foreground">{counts.pedidas}</span>{' '}
                      pedidas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-foreground">{counts.en_fibrero}</span>{' '}
                      en fibrero
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `app/(vendedor)/panel/page.tsx`**

```tsx
// app/(vendedor)/panel/page.tsx
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { AlertasSection } from '@/components/panel/alertas-section'
import { EmbudoSection } from '@/components/panel/embudo-section'
import { CarteraSection } from '@/components/panel/cartera-section'
import { InventarioSection } from '@/components/panel/inventario-section'
import type { Periodo } from '@/lib/utils/panel'

function SectionSkeleton({ height = 'h-32' }: { height?: string }) {
  return <div className={`${height} animate-pulse rounded-lg bg-secondary`} />
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: { periodo?: string }
}) {
  const periodo = (['dia', 'semana', 'mes'].includes(searchParams.periodo ?? '')
    ? searchParams.periodo
    : 'dia') as Periodo

  return (
    <div className="space-y-6">
      <PageHeader title="Panel" description="Vista operativa del día" />

      <Suspense fallback={<SectionSkeleton height="h-40" />}>
        <AlertasSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-36" />}>
        <EmbudoSection periodo={periodo} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-56" />}>
        <CarteraSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-44" />}>
        <InventarioSection />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 4: Verificar compilación**

```bash
npm run build
```

Expected: build exitoso sin errores.

- [ ] **Step 5: Verificar el panel en el browser**

```bash
npm run dev
```

1. Ir a `http://localhost:3000` → debe redirigir a `/panel`
2. El panel carga con las 4 secciones
3. Verificar estado vacío de alertas (si no hay datos): aparece el chip verde "Todo al día"
4. Cambiar el período en el embudo (Hoy / Esta semana / Este mes) → los counts cambian sin recargar la página entera
5. Verificar que las alertas de seguimiento tienen link clickeable a `/unidades/[id]`
6. Verificar que los leads sin contactar tienen link a `/prospectos/[id]`
7. Verificar que las filas de la cartera tienen link a `/unidades/[id]`
8. Verificar que "Panel" aparece como primer ítem activo en el sidebar al estar en `/panel`
9. En móvil (DevTools responsive): verificar que el bottom nav muestra Panel, Unidades, Clientes, Prospectos
10. Verificar que el accordion de la cartera abre/cierra correctamente

- [ ] **Step 6: Verificar todos los tests del proyecto**

```bash
npm run test
```

Expected: todos los tests PASS (incluidos los 4 nuevos de `panel.test.ts`)

- [ ] **Step 7: Commit final**

```bash
git add components/panel/cartera-section.tsx components/panel/inventario-section.tsx app/(vendedor)/panel/page.tsx
git commit -m "feat(panel): implementar Panel del Vendedor completo con alertas, embudo, cartera e inventario"
```
