# CRM MyM Milenium Motors — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un CRM web completo para gestión de ventas de motos TVS con Next.js 14 App Router y Supabase, cubriendo unidades, clientes, prospectos, ventas, pagos, garantías, reclamos, trámites, seguimientos y dashboard gerencial.

**Architecture:** Next.js 14 App Router con Server Components para data fetching directo a Supabase y Server Actions para todas las mutaciones. Supabase PostgreSQL + Auth con cookies SSR. shadcn/ui + Tailwind para UI responsiva (móvil + escritorio).

**Tech Stack:** Next.js 14, TypeScript, @supabase/ssr, Tailwind CSS, shadcn/ui, recharts, react-hook-form, zod, date-fns, Vitest, @dnd-kit/core (kanban escritorio)

## Global Constraints

- Idioma de UI: español en todos los textos, labels y mensajes
- Moneda: `S/ 1,234.56` usando `new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)`
- 5 modelos exactos: `Deluxe GS`, `Deluxe GLP`, `Duramax GS`, `Duramax GLP`, `Duramax GNV`
- Roles: `vendedor` (CRUD, sin `/dashboard`) y `gerente` (solo lectura de `/dashboard`)
- `estado_logistico`: `Pedida` | `En fibrero` | `En tienda` — siempre manual
- `estado_comercial`: `Separada` auto (primer Adelanto), `Vendida` auto (suma pagos ≥ precio_venta), `Entregada` manual
- `estado_comercial = null` se muestra como "Disponible" en UI
- DNI: regex `/^\d{8}$/`
- Montos `precio_*`: `>= 0`; `pagos.monto`: `>= 0.01`
- `fecha_entrega` no puede ser anterior a `fecha_venta` de la unidad
- Al marcar Entregada: insertar en `garantias` con `garantia_fibra_vencimiento = fecha_entrega + 1 mes`
- Seguimiento pendiente: `fecha_venta <= hoy - 7 días` y `seguimiento_7dias_hecho = false`
- Trámite se crea (vacío) automáticamente al registrar una venta
- Node.js >= 18, npm como gestor de paquetes
- Despliegue: Vercel. BD: Supabase cloud

---

## Mapa de archivos

```
crm-milenium-motors/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (vendedor)/
│   │   ├── layout.tsx
│   │   ├── unidades/page.tsx
│   │   ├── unidades/nueva/page.tsx
│   │   ├── unidades/[id]/page.tsx
│   │   ├── clientes/page.tsx
│   │   ├── clientes/nuevo/page.tsx
│   │   ├── clientes/[id]/page.tsx
│   │   ├── prospectos/page.tsx
│   │   ├── prospectos/nuevo/page.tsx
│   │   ├── prospectos/[id]/page.tsx
│   │   └── seguimientos/page.tsx
│   ├── (gerente)/
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── middleware.ts
├── components/
│   ├── ui/                          (shadcn auto-generados)
│   ├── nav/sidebar.tsx
│   ├── nav/bottom-nav.tsx
│   ├── clientes/cliente-form.tsx
│   ├── unidades/unidad-form.tsx
│   ├── unidades/unidad-filters.tsx
│   ├── unidades/estado-badges.tsx
│   ├── unidades/marcar-entregada-button.tsx
│   ├── unidades/sections/datos-generales-section.tsx
│   ├── unidades/sections/compra-section.tsx
│   ├── unidades/sections/fibra-section.tsx
│   ├── unidades/sections/tienda-section.tsx
│   ├── unidades/sections/venta-section.tsx
│   ├── unidades/sections/pagos-section.tsx
│   ├── unidades/sections/garantias-section.tsx
│   ├── unidades/sections/reclamos-section.tsx
│   ├── unidades/sections/tramites-section.tsx
│   ├── ventas/venta-form.tsx
│   ├── ventas/pago-form.tsx
│   ├── prospectos/kanban-board.tsx
│   ├── prospectos/kanban-column.tsx
│   ├── prospectos/prospecto-card.tsx
│   ├── prospectos/prospecto-form.tsx
│   ├── prospectos/convertir-venta-flow.tsx
│   ├── reclamos/reclamo-form.tsx
│   └── dashboard/
│       ├── periodo-filter.tsx
│       ├── ventas-chart.tsx
│       ├── compras-chart.tsx
│       ├── utilidad-section.tsx
│       ├── embudo-chart.tsx
│       ├── inventario-cards.tsx
│       └── cuentas-cobrar-table.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/middleware.ts
│   ├── supabase/types.ts            (generado con CLI)
│   ├── actions/auth.ts
│   ├── actions/clientes.ts
│   ├── actions/unidades.ts
│   ├── actions/prospectos.ts
│   ├── actions/ventas.ts
│   ├── actions/pagos.ts
│   ├── actions/reclamos.ts
│   ├── actions/tramites.ts
│   ├── actions/dashboard.ts
│   ├── validations/cliente.ts
│   ├── validations/unidad.ts
│   ├── validations/prospecto.ts
│   ├── validations/venta.ts
│   ├── validations/pago.ts
│   ├── validations/reclamo.ts
│   ├── utils/format.ts
│   ├── utils/estados.ts
│   ├── utils/fechas.ts
│   └── constants.ts
├── supabase/migrations/
│   ├── 001_enums.sql
│   ├── 002_tables.sql
│   ├── 003_indexes.sql
│   └── 004_rls.sql
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `crm-milenium-motors/` (directorio raíz del proyecto)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/constants.ts`
- Create: `.env.local`

**Interfaces:**
- Produces: cliente de Supabase disponible para todos los tasks posteriores; configuración de tests disponible para Task 4

- [ ] **Step 1: Crear proyecto Next.js**

```bash
npx create-next-app@14 crm-milenium-motors \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd crm-milenium-motors
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @supabase/ssr @supabase/supabase-js date-fns recharts react-hook-form @hookform/resolvers zod
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Inicializar shadcn/ui**

```bash
npx shadcn@latest init
```
Elegir: Style → Default, Base color → Slate, CSS variables → Yes.

Luego instalar los componentes necesarios:
```bash
npx shadcn@latest add button input label form select textarea badge card accordion table dialog sheet tabs
```

- [ ] **Step 4: Crear vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
```

- [ ] **Step 5: Crear vitest.setup.ts**

```ts
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Agregar script de test en package.json**

En `package.json`, agregar dentro de `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Crear .env.local**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Obtener estos valores desde: Supabase Dashboard → Project Settings → API.

- [ ] **Step 8: Crear lib/supabase/client.ts**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 9: Crear lib/supabase/server.ts**

```ts
// lib/supabase/server.ts
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createServerClient() {
  const cookieStore = cookies()
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 10: Crear lib/supabase/middleware.ts**

```ts
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from './types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, supabaseResponse, user }
}
```

- [ ] **Step 11: Crear lib/constants.ts**

```ts
// lib/constants.ts
export const MODELOS_MOTO = [
  'Deluxe GS',
  'Deluxe GLP',
  'Duramax GS',
  'Duramax GLP',
  'Duramax GNV',
] as const

export type ModeloMoto = typeof MODELOS_MOTO[number]

export const ESTADOS_LOGISTICO = ['Pedida', 'En fibrero', 'En tienda'] as const
export const ESTADOS_COMERCIAL = ['Separada', 'Vendida', 'Entregada'] as const
export const ETAPAS_PROSPECTO = ['Interesado', 'Cotizó', 'Dio adelanto', 'Vendido', 'Desistió'] as const
export const ORIGENES_PROSPECTO = ['Facebook', 'Referido', 'Visita a tienda', 'Otro'] as const
export const TIPOS_PAGO = ['Adelanto', 'Saldo', 'Contado'] as const
export const TIPOS_VENTA = ['Contado', 'Separación'] as const
export const TIPOS_DOCUMENTO = ['Factura', 'Boleta'] as const
export const TIPOS_RECLAMO = ['Moto', 'Fibra'] as const
export const ESTADOS_RECLAMO = ['Pendiente', 'Resuelto'] as const
export const SUNARP_ESTADOS = ['Ingreso', 'En Calificación', 'Inscrito'] as const
export const AAP_ESTADOS = ['Pago', 'Recojo'] as const
```

- [ ] **Step 12: Crear lib/supabase/types.ts (placeholder)**

```ts
// lib/supabase/types.ts
// Este archivo se reemplaza en Task 2 tras aplicar las migraciones.
// Por ahora permite que el proyecto compile.
export type Database = any
```

- [ ] **Step 13: Verificar que el proyecto compila**

```bash
npm run build
```

Expected: build exitoso sin errores de TypeScript.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 con Supabase, shadcn/ui y Vitest"
```

---

## Task 2: Database Migrations

**Files:**
- Create: `supabase/migrations/001_enums.sql`
- Create: `supabase/migrations/002_tables.sql`
- Create: `supabase/migrations/003_indexes.sql`
- Create: `supabase/migrations/004_rls.sql`
- Update: `lib/supabase/types.ts` (generado por CLI)

**Interfaces:**
- Produces: esquema de BD completo; tipos TypeScript generados usados por todos los tasks posteriores

- [ ] **Step 1: Crear 001_enums.sql**

```sql
-- supabase/migrations/001_enums.sql
CREATE TYPE rol AS ENUM ('vendedor', 'gerente');
CREATE TYPE modelo_moto AS ENUM ('Deluxe GS', 'Deluxe GLP', 'Duramax GS', 'Duramax GLP', 'Duramax GNV');
CREATE TYPE tipo_ingreso AS ENUM ('Bajo pedido', 'Stock');
CREATE TYPE estado_logistico AS ENUM ('Pedida', 'En fibrero', 'En tienda');
CREATE TYPE estado_comercial AS ENUM ('Separada', 'Vendida', 'Entregada');
CREATE TYPE origen_prospecto AS ENUM ('Facebook', 'Referido', 'Visita a tienda', 'Otro');
CREATE TYPE etapa_prospecto AS ENUM ('Interesado', 'Cotizó', 'Dio adelanto', 'Vendido', 'Desistió');
CREATE TYPE tipo_venta AS ENUM ('Contado', 'Separación');
CREATE TYPE documento_tipo AS ENUM ('Factura', 'Boleta');
CREATE TYPE estado_pago AS ENUM ('Pendiente', 'Parcial', 'Pagado');
CREATE TYPE tipo_pago AS ENUM ('Adelanto', 'Saldo', 'Contado');
CREATE TYPE tipo_reclamo AS ENUM ('Moto', 'Fibra');
CREATE TYPE estado_reclamo AS ENUM ('Pendiente', 'Resuelto');
CREATE TYPE sunarp_estado AS ENUM ('Ingreso', 'En Calificación', 'Inscrito');
CREATE TYPE aap_estado AS ENUM ('Pago', 'Recojo');
```

- [ ] **Step 2: Crear 002_tables.sql**

```sql
-- supabase/migrations/002_tables.sql

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol rol NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  dni CHAR(8) NOT NULL,
  direccion TEXT,
  telefono TEXT,
  correo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT clientes_dni_format CHECK (dni ~ '^\d{8}$')
);

CREATE TABLE prospectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  modelo_interes modelo_moto,
  origen origen_prospecto,
  etapa etapa_prospecto NOT NULL DEFAULT 'Interesado',
  notas TEXT,
  vendedor_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  n_motor TEXT NOT NULL UNIQUE,
  n_chasis TEXT NOT NULL UNIQUE,
  modelo modelo_moto NOT NULL,
  tipo_ingreso tipo_ingreso NOT NULL,
  estado_logistico estado_logistico NOT NULL DEFAULT 'Pedida',
  estado_comercial estado_comercial,
  dua_item TEXT,
  cliente_id UUID REFERENCES clientes(id),
  fecha_entrega DATE,
  -- compra
  factura_compra_moto TEXT,
  precio_compra_moto NUMERIC(12,2) CHECK (precio_compra_moto IS NULL OR precio_compra_moto >= 0),
  fecha_compra DATE,
  fecha_pago_compra DATE,
  n_operacion_pago_compra TEXT,
  -- fibra
  proveedor_fibra TEXT,
  fecha_llegada_fibrero DATE,
  fecha_pago_fibra DATE,
  n_operacion_fibra TEXT,
  factura_fibra TEXT,
  precio_fibra NUMERIC(12,2) CHECK (precio_fibra IS NULL OR precio_fibra >= 0),
  -- tienda
  fecha_llegada_tienda DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  tipo_venta tipo_venta NOT NULL,
  fecha_venta DATE NOT NULL,
  precio_venta NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
  documento_tipo documento_tipo,
  documento_numero TEXT,
  estado_pago estado_pago NOT NULL DEFAULT 'Pendiente',
  seguimiento_7dias_hecho BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES ventas(id),
  fecha_pago DATE NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto >= 0.01),
  n_operacion TEXT,
  n_recibo TEXT NOT NULL,
  tipo tipo_pago NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE garantias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id) UNIQUE,
  garantia_moto_km INTEGER NOT NULL DEFAULT 24000,
  garantia_moto_inicio DATE NOT NULL,
  garantia_fibra_inicio DATE NOT NULL,
  garantia_fibra_vencimiento DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reclamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  tipo tipo_reclamo NOT NULL,
  fecha_reclamo DATE NOT NULL,
  descripcion TEXT,
  estado estado_reclamo NOT NULL DEFAULT 'Pendiente',
  taller TEXT,
  precio NUMERIC(12,2) CHECK (precio IS NULL OR precio >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tramites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id) UNIQUE,
  sunarp_estado sunarp_estado,
  sunarp_fecha DATE,
  aap_estado aap_estado,
  aap_fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 3: Crear 003_indexes.sql**

```sql
-- supabase/migrations/003_indexes.sql
CREATE INDEX idx_unidades_modelo ON unidades(modelo);
CREATE INDEX idx_unidades_estado_logistico ON unidades(estado_logistico);
CREATE INDEX idx_unidades_estado_comercial ON unidades(estado_comercial);
CREATE INDEX idx_unidades_cliente_id ON unidades(cliente_id);
CREATE INDEX idx_prospectos_etapa ON prospectos(etapa);
CREATE INDEX idx_prospectos_vendedor_id ON prospectos(vendedor_id);
CREATE INDEX idx_ventas_unidad_id ON ventas(unidad_id);
CREATE INDEX idx_ventas_cliente_id ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX idx_ventas_seguimiento ON ventas(seguimiento_7dias_hecho, fecha_venta);
CREATE INDEX idx_pagos_venta_id ON pagos(venta_id);
CREATE INDEX idx_reclamos_unidad_id ON reclamos(unidad_id);
```

- [ ] **Step 4: Crear 004_rls.sql**

```sql
-- supabase/migrations/004_rls.sql

-- Función helper para obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS rol AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- usuarios: cualquier autenticado puede leer su propio registro
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT TO authenticated USING (true);

-- clientes: vendedores CRUD, gerentes solo lectura
CREATE POLICY "clientes_select" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "clientes_insert" ON clientes FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "clientes_update" ON clientes FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- prospectos: vendedores CRUD
CREATE POLICY "prospectos_select" ON prospectos FOR SELECT TO authenticated USING (true);
CREATE POLICY "prospectos_insert" ON prospectos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "prospectos_update" ON prospectos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- unidades: vendedores CRUD, gerentes lectura
CREATE POLICY "unidades_select" ON unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "unidades_insert" ON unidades FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "unidades_update" ON unidades FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- ventas: vendedores CRUD, gerentes lectura
CREATE POLICY "ventas_select" ON ventas FOR SELECT TO authenticated USING (true);
CREATE POLICY "ventas_insert" ON ventas FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "ventas_update" ON ventas FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- pagos: vendedores CRUD, gerentes lectura
CREATE POLICY "pagos_select" ON pagos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pagos_insert" ON pagos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');

-- garantias, reclamos, tramites: misma política
CREATE POLICY "garantias_select" ON garantias FOR SELECT TO authenticated USING (true);
CREATE POLICY "garantias_insert" ON garantias FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "garantias_update" ON garantias FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

CREATE POLICY "reclamos_select" ON reclamos FOR SELECT TO authenticated USING (true);
CREATE POLICY "reclamos_insert" ON reclamos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "reclamos_update" ON reclamos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

CREATE POLICY "tramites_select" ON tramites FOR SELECT TO authenticated USING (true);
CREATE POLICY "tramites_insert" ON tramites FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "tramites_update" ON tramites FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');
```

- [ ] **Step 5: Ejecutar migraciones en Supabase**

En Supabase Dashboard → SQL Editor, ejecutar los 4 archivos en orden:
1. `001_enums.sql`
2. `002_tables.sql`
3. `003_indexes.sql`
4. `004_rls.sql`

Expected: sin errores. Verificar en Table Editor que existen las 9 tablas.

- [ ] **Step 6: Crear los 3 usuarios en Supabase Auth**

En Supabase Dashboard → Authentication → Users → Invite user:
- `vendedor1@milenium.pe` (luego insertar en `usuarios` con rol `vendedor`)
- `vendedor2@milenium.pe` (rol `vendedor`)
- `gerente@milenium.pe` (rol `gerente`)

Insertar en la tabla `usuarios` via SQL Editor:
```sql
-- Reemplazar los UUIDs con los IDs reales de Auth
INSERT INTO usuarios (id, nombre, email, rol) VALUES
  ('UUID_VENDEDOR1', 'Vendedor 1', 'vendedor1@milenium.pe', 'vendedor'),
  ('UUID_VENDEDOR2', 'Vendedor 2', 'vendedor2@milenium.pe', 'vendedor'),
  ('UUID_GERENTE',   'Gerente',    'gerente@milenium.pe',   'gerente');
```

- [ ] **Step 7: Generar tipos TypeScript**

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase gen types typescript --linked > lib/supabase/types.ts
```

Expected: `lib/supabase/types.ts` contiene la interfaz `Database` con todas las tablas.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: migraciones SQL completas y tipos Supabase generados"
```

---

## Task 3: Auth + Middleware

**Files:**
- Create: `middleware.ts`
- Create: `app/page.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/login/actions.ts`
- Create: `app/layout.tsx`

**Interfaces:**
- Consumes: `lib/supabase/middleware.ts` (Task 1), tabla `usuarios` (Task 2)
- Produces: sesión autenticada disponible en todos los Server Components y Actions; redirección por rol

- [ ] **Step 1: Crear middleware.ts**

```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Ruta pública: login
  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // Sin sesión → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Obtener rol del usuario
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  const rol = usuario?.rol

  // Gerente solo puede acceder a /dashboard
  if (rol === 'gerente' && !pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Vendedor no puede acceder a /dashboard
  if (rol === 'vendedor' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/unidades', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: Crear app/page.tsx (redirige por rol)**

```ts
// app/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (usuario?.rol === 'gerente') redirect('/dashboard')
  redirect('/unidades')
}
```

- [ ] **Step 3: Crear app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM Milenium Motors',
  description: 'Sistema de gestión de ventas de motos TVS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Crear app/(auth)/login/actions.ts**

```ts
// app/(auth)/login/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciales incorrectas. Intente de nuevo.' }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 5: Crear app/(auth)/login/page.tsx**

```tsx
// app/(auth)/login/page.tsx
import { signIn } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milenium Motors</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa con tu cuenta</p>
        </div>
        <form action={signIn} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full">Ingresar</Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verificar flujo de login manualmente**

```bash
npm run dev
```

1. Abrir `http://localhost:3000` → debe redirigir a `/login`
2. Ingresar con `vendedor1@milenium.pe` → debe redirigir a `/unidades` (404 por ahora, OK)
3. Ingresar con `gerente@milenium.pe` → debe redirigir a `/dashboard` (404 por ahora, OK)
4. Intentar acceder a `/dashboard` como vendedor → debe redirigir a `/unidades`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: auth con Supabase SSR, login y middleware de roles"
```

---

## Task 4: Utilidades y Validaciones (TDD)

**Files:**
- Create: `lib/utils/format.ts` + `lib/utils/__tests__/format.test.ts`
- Create: `lib/utils/estados.ts` + `lib/utils/__tests__/estados.test.ts`
- Create: `lib/utils/fechas.ts` + `lib/utils/__tests__/fechas.test.ts`
- Create: `lib/validations/cliente.ts` + `lib/validations/__tests__/cliente.test.ts`
- Create: `lib/validations/unidad.ts`
- Create: `lib/validations/prospecto.ts`
- Create: `lib/validations/venta.ts`
- Create: `lib/validations/pago.ts`
- Create: `lib/validations/reclamo.ts`

**Interfaces:**
- Produces: `formatSoles(n)`, `calcularEstadoPago(suma, precio)`, `calcularGarantiaFibraVencimiento(fecha)`, `esSeguimientoPendiente(fecha)`, schemas Zod exportados por nombre

- [ ] **Step 1: Escribir tests de format.ts**

```ts
// lib/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatSoles } from '../format'

describe('formatSoles', () => {
  it('formatea entero sin decimales como S/ X,XXX.00', () => {
    expect(formatSoles(1000)).toBe('S/ 1,000.00')
  })
  it('formatea decimal con dos lugares', () => {
    expect(formatSoles(1234.56)).toBe('S/ 1,234.56')
  })
  it('formatea cero', () => {
    expect(formatSoles(0)).toBe('S/ 0.00')
  })
  it('formatea número grande con separador de miles', () => {
    expect(formatSoles(10000)).toBe('S/ 10,000.00')
  })
})
```

- [ ] **Step 2: Verificar que el test falla**

```bash
npm test -- lib/utils/__tests__/format.test.ts
```

Expected: FAIL — `Cannot find module '../format'`

- [ ] **Step 3: Implementar lib/utils/format.ts**

```ts
// lib/utils/format.ts
const formatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

export function formatSoles(amount: number): string {
  return formatter.format(amount)
}
```

- [ ] **Step 4: Verificar que pasan los tests de format**

```bash
npm test -- lib/utils/__tests__/format.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Escribir tests de estados.ts**

```ts
// lib/utils/__tests__/estados.test.ts
import { describe, it, expect } from 'vitest'
import { calcularEstadoPago } from '../estados'

describe('calcularEstadoPago', () => {
  it('retorna Pendiente cuando suma es 0', () => {
    expect(calcularEstadoPago(0, 5000)).toBe('Pendiente')
  })
  it('retorna Pendiente cuando suma es null/undefined (pasado como 0)', () => {
    expect(calcularEstadoPago(0, 5000)).toBe('Pendiente')
  })
  it('retorna Parcial cuando la suma es mayor a 0 y menor al precio', () => {
    expect(calcularEstadoPago(2000, 5000)).toBe('Parcial')
  })
  it('retorna Pagado cuando la suma iguala al precio', () => {
    expect(calcularEstadoPago(5000, 5000)).toBe('Pagado')
  })
  it('retorna Pagado cuando la suma supera al precio', () => {
    expect(calcularEstadoPago(5001, 5000)).toBe('Pagado')
  })
  it('retorna Pagado con decimales exactos', () => {
    expect(calcularEstadoPago(1234.56, 1234.56)).toBe('Pagado')
  })
})
```

- [ ] **Step 6: Verificar que el test falla**

```bash
npm test -- lib/utils/__tests__/estados.test.ts
```

Expected: FAIL — `Cannot find module '../estados'`

- [ ] **Step 7: Implementar lib/utils/estados.ts**

```ts
// lib/utils/estados.ts
export type EstadoPago = 'Pendiente' | 'Parcial' | 'Pagado'
export type EstadoComercial = 'Separada' | 'Vendida' | 'Entregada'

export function calcularEstadoPago(sumaPagos: number, precioVenta: number): EstadoPago {
  if (sumaPagos <= 0) return 'Pendiente'
  if (sumaPagos >= precioVenta) return 'Pagado'
  return 'Parcial'
}
```

- [ ] **Step 8: Verificar que pasan los tests de estados**

```bash
npm test -- lib/utils/__tests__/estados.test.ts
```

Expected: 6 tests PASS

- [ ] **Step 9: Escribir tests de fechas.ts**

```ts
// lib/utils/__tests__/fechas.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calcularGarantiaFibraVencimiento, esSeguimientoPendiente, calcularDiasTranscurridos } from '../fechas'

describe('calcularGarantiaFibraVencimiento', () => {
  it('agrega 1 mes a fecha normal', () => {
    const inicio = new Date('2026-01-15')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-02-15')).toBe(true)
  })
  it('maneja fin de mes correctamente (ene 31 → feb 28)', () => {
    const inicio = new Date('2026-01-31')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-02-28')).toBe(true)
  })
  it('maneja cambio de año (dic → ene)', () => {
    const inicio = new Date('2025-12-10')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-01-10')).toBe(true)
  })
})

describe('esSeguimientoPendiente', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('retorna true cuando fechaVenta fue hace exactamente 7 días', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-11'))).toBe(true)
  })
  it('retorna true cuando fechaVenta fue hace más de 7 días', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-01'))).toBe(true)
  })
  it('retorna false cuando fechaVenta fue hace menos de 7 días', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-15'))).toBe(false)
  })
  it('retorna false cuando fechaVenta es hoy', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-18'))).toBe(false)
  })
})

describe('calcularDiasTranscurridos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('retorna 7 para fecha de hace 7 días', () => {
    expect(calcularDiasTranscurridos(new Date('2026-06-11'))).toBe(7)
  })
})
```

- [ ] **Step 10: Verificar que los tests fallan**

```bash
npm test -- lib/utils/__tests__/fechas.test.ts
```

Expected: FAIL — `Cannot find module '../fechas'`

- [ ] **Step 11: Implementar lib/utils/fechas.ts**

```ts
// lib/utils/fechas.ts
import { addMonths, differenceInDays } from 'date-fns'
import { format } from 'date-fns'

export function calcularGarantiaFibraVencimiento(fechaInicio: Date): Date {
  return addMonths(fechaInicio, 1)
}

export function calcularGarantiaFibraVencimientoStr(fechaInicioStr: string): string {
  const fecha = new Date(fechaInicioStr)
  return format(addMonths(fecha, 1), 'yyyy-MM-dd')
}

export function esSeguimientoPendiente(fechaVenta: Date): boolean {
  return differenceInDays(new Date(), fechaVenta) >= 7
}

export function calcularDiasTranscurridos(fechaVenta: Date): number {
  return differenceInDays(new Date(), fechaVenta)
}
```

- [ ] **Step 12: Verificar que pasan todos los tests de fechas**

```bash
npm test -- lib/utils/__tests__/fechas.test.ts
```

Expected: 7 tests PASS

- [ ] **Step 13: Escribir tests del schema de cliente**

```ts
// lib/validations/__tests__/cliente.test.ts
import { describe, it, expect } from 'vitest'
import { clienteSchema } from '../cliente'

describe('clienteSchema', () => {
  const valido = { nombre_completo: 'Juan Pérez', dni: '12345678', direccion: 'Lima', telefono: '999888777', correo: 'juan@email.com' }

  it('acepta datos válidos', () => {
    expect(() => clienteSchema.parse(valido)).not.toThrow()
  })
  it('rechaza DNI de 7 dígitos', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '1234567' })).toThrow()
  })
  it('rechaza DNI de 9 dígitos', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '123456789' })).toThrow()
  })
  it('rechaza DNI con letras', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '1234567A' })).toThrow()
  })
  it('rechaza nombre vacío', () => {
    expect(() => clienteSchema.parse({ ...valido, nombre_completo: '' })).toThrow()
  })
  it('acepta correo vacío (campo opcional)', () => {
    expect(() => clienteSchema.parse({ ...valido, correo: '' })).not.toThrow()
  })
  it('rechaza correo con formato inválido (si se provee)', () => {
    expect(() => clienteSchema.parse({ ...valido, correo: 'no-es-email' })).toThrow()
  })
})
```

- [ ] **Step 14: Implementar schemas Zod**

```ts
// lib/validations/cliente.ts
import { z } from 'zod'

export const clienteSchema = z.object({
  nombre_completo: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.union([
    z.string().email('Correo inválido'),
    z.literal(''),
  ]).optional(),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
```

```ts
// lib/validations/unidad.ts
import { z } from 'zod'
import { MODELOS_MOTO } from '@/lib/constants'

export const unidadBaseSchema = z.object({
  n_motor: z.string().min(1, 'N° de motor requerido'),
  n_chasis: z.string().min(1, 'N° de chasis requerido'),
  modelo: z.enum(MODELOS_MOTO, { required_error: 'Selecciona un modelo' }),
  tipo_ingreso: z.enum(['Bajo pedido', 'Stock']),
  estado_logistico: z.enum(['Pedida', 'En fibrero', 'En tienda']),
  dua_item: z.string().optional(),
  cliente_id: z.string().uuid().optional().nullable(),
})

export const compraSchema = z.object({
  factura_compra_moto: z.string().optional(),
  precio_compra_moto: z.number().min(0).optional().nullable(),
  fecha_compra: z.string().optional().nullable(),
  fecha_pago_compra: z.string().optional().nullable(),
  n_operacion_pago_compra: z.string().optional(),
})

export const fibraSchema = z.object({
  proveedor_fibra: z.string().optional(),
  fecha_llegada_fibrero: z.string().optional().nullable(),
  fecha_pago_fibra: z.string().optional().nullable(),
  n_operacion_fibra: z.string().optional(),
  factura_fibra: z.string().optional(),
  precio_fibra: z.number().min(0).optional().nullable(),
})

export type UnidadBaseValues = z.infer<typeof unidadBaseSchema>
export type CompraValues = z.infer<typeof compraSchema>
export type FibraValues = z.infer<typeof fibraSchema>
```

```ts
// lib/validations/prospecto.ts
import { z } from 'zod'
import { MODELOS_MOTO, ORIGENES_PROSPECTO, ETAPAS_PROSPECTO } from '@/lib/constants'

export const prospectoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().optional(),
  modelo_interes: z.enum(MODELOS_MOTO).optional().nullable(),
  origen: z.enum(ORIGENES_PROSPECTO).optional().nullable(),
  etapa: z.enum(ETAPAS_PROSPECTO),
  notas: z.string().optional(),
  vendedor_id: z.string().uuid().optional().nullable(),
})

export type ProspectoFormValues = z.infer<typeof prospectoSchema>
```

```ts
// lib/validations/venta.ts
import { z } from 'zod'

export const ventaSchema = z.object({
  tipo_venta: z.enum(['Contado', 'Separación']),
  fecha_venta: z.string().min(1, 'La fecha de venta es requerida'),
  precio_venta: z.number().min(0, 'El precio no puede ser negativo'),
  documento_tipo: z.enum(['Factura', 'Boleta']).optional().nullable(),
  documento_numero: z.string().optional(),
  cliente_id: z.string().uuid('Selecciona un cliente'),
})

export type VentaFormValues = z.infer<typeof ventaSchema>
```

```ts
// lib/validations/pago.ts
import { z } from 'zod'

export const pagoSchema = z.object({
  fecha_pago: z.string().min(1, 'La fecha de pago es requerida'),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  n_operacion: z.string().optional(),
  n_recibo: z.string().min(1, 'El número de recibo es requerido'),
  tipo: z.enum(['Adelanto', 'Saldo', 'Contado']),
})

export type PagoFormValues = z.infer<typeof pagoSchema>
```

```ts
// lib/validations/reclamo.ts
import { z } from 'zod'

export const reclamoSchema = z.object({
  tipo: z.enum(['Moto', 'Fibra']),
  fecha_reclamo: z.string().min(1, 'La fecha es requerida'),
  descripcion: z.string().optional(),
  estado: z.enum(['Pendiente', 'Resuelto']),
  taller: z.string().optional(),
  precio: z.number().min(0).optional().nullable(),
})

export type ReclamoFormValues = z.infer<typeof reclamoSchema>
```

- [ ] **Step 15: Verificar todos los tests**

```bash
npm test
```

Expected: todos los tests PASS (format: 4, estados: 6, fechas: 7, cliente: 7 = 24 total)

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: utilidades (format, estados, fechas) con TDD y schemas Zod"
```

---

## Task 5: Layout y Navegación

**Files:**
- Create: `app/(vendedor)/layout.tsx`
- Create: `app/(gerente)/layout.tsx`
- Create: `components/nav/sidebar.tsx`
- Create: `components/nav/bottom-nav.tsx`

**Interfaces:**
- Consumes: `lib/actions/auth.ts` (signOut), `lib/supabase/server.ts`
- Produces: layouts con navegación usados por todos los tasks de UI

- [ ] **Step 1: Crear components/nav/sidebar.tsx**

```tsx
// components/nav/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bike, Users, BarChart3, Bell, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: BarChart3 },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
]

export function Sidebar({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col h-screen border-r bg-white fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg text-gray-900">Milenium Motors</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
            {href === '/seguimientos' && seguimientosPendientes > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {seguimientosPendientes}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600">
            <LogOut size={16} /> Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Crear components/nav/bottom-nav.tsx**

```tsx
// components/nav/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bike, Users, BarChart3, Bell } from 'lucide-react'

const navItems = [
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: BarChart3 },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
]

export function BottomNav({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              pathname.startsWith(href) ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            <div className="relative">
              <Icon size={20} />
              {href === '/seguimientos' && seguimientosPendientes > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {seguimientosPendientes}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Crear app/(vendedor)/layout.tsx**

```tsx
// app/(vendedor)/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/nav/sidebar'
import { BottomNav } from '@/components/nav/bottom-nav'

async function getSeguimientosPendientesCount() {
  const supabase = createServerClient()
  const { count } = await supabase
    .from('ventas')
    .select('*', { count: 'exact', head: true })
    .lte('fecha_venta', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .eq('seguimiento_7dias_hecho', false)
  return count ?? 0
}

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const count = await getSeguimientosPendientesCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar seguimientosPendientes={count} />
      <main className="md:ml-56 pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </main>
      <BottomNav seguimientosPendientes={count} />
    </div>
  )
}
```

- [ ] **Step 4: Crear app/(gerente)/layout.tsx**

```tsx
// app/(gerente)/layout.tsx
import { LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/login/actions'

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <LayoutDashboard size={20} />
          Milenium Motors — Dashboard
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <LogOut size={16} /> Salir
          </Button>
        </form>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar navegación en browser**

```bash
npm run dev
```

Login como vendedor → verificar sidebar en desktop y bottom nav en móvil (responsive DevTools).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: layouts de vendedor y gerente con navegación responsiva"
```

---

## Task 6: Clientes

**Files:**
- Create: `lib/actions/clientes.ts`
- Create: `components/clientes/cliente-form.tsx`
- Create: `app/(vendedor)/clientes/page.tsx`
- Create: `app/(vendedor)/clientes/nuevo/page.tsx`
- Create: `app/(vendedor)/clientes/[id]/page.tsx`

**Interfaces:**
- Consumes: `clienteSchema` (Task 4), `createServerClient` (Task 1)
- Produces: `crearCliente`, `obtenerClientes`, `obtenerCliente`, `actualizarCliente` disponibles para Task 11

- [ ] **Step 1: Crear lib/actions/clientes.ts**

```ts
// lib/actions/clientes.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { clienteSchema, type ClienteFormValues } from '@/lib/validations/cliente'

export async function crearCliente(data: ClienteFormValues) {
  const supabase = createServerClient()
  const validated = clienteSchema.parse(data)
  const payload = { ...validated, correo: validated.correo || null }

  const { data: cliente, error } = await supabase
    .from('clientes').insert(payload).select('id').single()

  if (error) {
    if (error.code === '23505') throw new Error('El DNI ya está registrado')
    throw new Error(error.message)
  }

  revalidatePath('/clientes')
  redirect(`/clientes/${cliente.id}`)
}

export async function obtenerClientes(search?: string) {
  const supabase = createServerClient()
  let query = supabase.from('clientes').select('*').order('created_at', { ascending: false })
  if (search) query = query.or(`nombre_completo.ilike.%${search}%,dni.ilike.%${search}%`)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerCliente(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clientes')
    .select(`*, unidades(id, n_motor, modelo, estado_logistico, estado_comercial), ventas(id, fecha_venta, precio_venta, estado_pago)`)
    .eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarCliente(id: string, data: ClienteFormValues) {
  const supabase = createServerClient()
  const validated = clienteSchema.parse(data)
  const payload = { ...validated, correo: validated.correo || null }
  const { error } = await supabase.from('clientes').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
}
```

- [ ] **Step 2: Crear components/clientes/cliente-form.tsx**

```tsx
// components/clientes/cliente-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clienteSchema, type ClienteFormValues } from '@/lib/validations/cliente'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  defaultValues?: Partial<ClienteFormValues>
  onSubmit: (data: ClienteFormValues) => Promise<void>
  submitLabel?: string
}

export function ClienteForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: Props) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre_completo: '', dni: '', direccion: '', telefono: '', correo: '', ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nombre_completo" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo *</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dni" render={({ field }) => (
          <FormItem>
            <FormLabel>DNI *</FormLabel>
            <FormControl><Input {...field} maxLength={8} placeholder="8 dígitos" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="telefono" render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="direccion" render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="correo" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo</FormLabel>
            <FormControl><Input {...field} type="email" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 3: Crear app/(vendedor)/clientes/page.tsx**

```tsx
// app/(vendedor)/clientes/page.tsx
import Link from 'next/link'
import { obtenerClientes } from '@/lib/actions/clientes'
import { Button } from '@/components/ui/button'

export default async function ClientesPage() {
  const clientes = await obtenerClientes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button asChild><Link href="/clientes/nuevo">+ Nuevo cliente</Link></Button>
      </div>
      <div className="bg-white rounded-lg border divide-y">
        {clientes.length === 0 && (
          <p className="p-6 text-gray-500 text-center">No hay clientes registrados</p>
        )}
        {clientes.map(c => (
          <Link key={c.id} href={`/clientes/${c.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium">{c.nombre_completo}</p>
              <p className="text-sm text-gray-500">DNI: {c.dni} · {c.telefono}</p>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear app/(vendedor)/clientes/nuevo/page.tsx**

```tsx
// app/(vendedor)/clientes/nuevo/page.tsx
'use client'

import { ClienteForm } from '@/components/clientes/cliente-form'
import { crearCliente } from '@/lib/actions/clientes'

export default function NuevoClientePage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nuevo cliente</h1>
      <div className="bg-white rounded-lg border p-6">
        <ClienteForm onSubmit={crearCliente} submitLabel="Registrar cliente" />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Crear app/(vendedor)/clientes/[id]/page.tsx**

```tsx
// app/(vendedor)/clientes/[id]/page.tsx
'use client'

import { use } from 'react'
import { obtenerCliente, actualizarCliente } from '@/lib/actions/clientes'
import { ClienteForm } from '@/components/clientes/cliente-form'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // Note: en producción usar un Server Component con async. Aquí simplificado.
  return <ClientePageContent id={id} />
}

async function ClientePageContent({ id }: { id: string }) {
  const cliente = await obtenerCliente(id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{cliente.nombre_completo}</h1>
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Datos del cliente</h2>
        <ClienteForm
          defaultValues={{ nombre_completo: cliente.nombre_completo, dni: cliente.dni, direccion: cliente.direccion ?? '', telefono: cliente.telefono ?? '', correo: cliente.correo ?? '' }}
          onSubmit={(data) => actualizarCliente(id, data)}
          submitLabel="Actualizar"
        />
      </div>
      {cliente.unidades && cliente.unidades.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Unidades</h2>
          <div className="divide-y">
            {cliente.unidades.map((u: any) => (
              <Link key={u.id} href={`/unidades/${u.id}`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded">
                <span className="font-mono text-sm">{u.n_motor}</span>
                <Badge>{u.modelo}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verificar CRUD de clientes en browser**

```bash
npm run dev
```

1. Ir a `/clientes/nuevo` → crear cliente con DNI de 8 dígitos → verificar que aparece en `/clientes`
2. Intentar DNI de 7 dígitos → verificar mensaje de error en el campo
3. Entrar a la ficha del cliente → editar teléfono → guardar → verificar persistencia

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: CRUD completo de clientes con validación de DNI"
```

---

## Task 7: Unidades — Listado y Registro

**Files:**
- Create: `lib/actions/unidades.ts`
- Create: `components/unidades/unidad-form.tsx`
- Create: `components/unidades/unidad-filters.tsx`
- Create: `components/unidades/estado-badges.tsx`
- Create: `app/(vendedor)/unidades/page.tsx`
- Create: `app/(vendedor)/unidades/nueva/page.tsx`

**Interfaces:**
- Consumes: `unidadBaseSchema` (Task 4), `MODELOS_MOTO`, `ESTADOS_LOGISTICO` (Task 1)
- Produces: `crearUnidad`, `obtenerUnidades`, `obtenerUnidad` usados por Tasks 8, 9, 11

- [ ] **Step 1: Crear lib/actions/unidades.ts (funciones base)**

```ts
// lib/actions/unidades.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { unidadBaseSchema, compraSchema, fibraSchema, type UnidadBaseValues, type CompraValues, type FibraValues } from '@/lib/validations/unidad'

export interface UnidadFilters {
  modelo?: string
  estado_logistico?: string
  estado_comercial?: string
  tipo_ingreso?: string
}

export async function obtenerUnidades(filters: UnidadFilters = {}) {
  const supabase = createServerClient()
  let query = supabase
    .from('unidades')
    .select('*, clientes(nombre_completo)')
    .order('created_at', { ascending: false })

  if (filters.modelo) query = query.eq('modelo', filters.modelo)
  if (filters.estado_logistico) query = query.eq('estado_logistico', filters.estado_logistico)
  if (filters.estado_comercial === 'Disponible') {
    query = query.is('estado_comercial', null)
  } else if (filters.estado_comercial) {
    query = query.eq('estado_comercial', filters.estado_comercial)
  }
  if (filters.tipo_ingreso) query = query.eq('tipo_ingreso', filters.tipo_ingreso)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerUnidad(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('unidades')
    .select(`
      *,
      clientes(id, nombre_completo, dni, telefono),
      ventas(id, tipo_venta, fecha_venta, precio_venta, estado_pago, documento_tipo, documento_numero, seguimiento_7dias_hecho,
        pagos(id, fecha_pago, monto, n_operacion, n_recibo, tipo)
      ),
      garantias(id, garantia_moto_km, garantia_moto_inicio, garantia_fibra_inicio, garantia_fibra_vencimiento),
      reclamos(id, tipo, fecha_reclamo, descripcion, estado, taller, precio),
      tramites(id, sunarp_estado, sunarp_fecha, aap_estado, aap_fecha)
    `)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function crearUnidad(data: UnidadBaseValues) {
  const supabase = createServerClient()
  const validated = unidadBaseSchema.parse(data)

  const { data: unidad, error } = await supabase
    .from('unidades').insert(validated).select('id').single()

  if (error) {
    if (error.code === '23505') throw new Error('El N° de motor o chasis ya existe')
    throw new Error(error.message)
  }

  revalidatePath('/unidades')
  redirect(`/unidades/${unidad.id}`)
}

export async function actualizarEstadoLogistico(id: string, estado: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ estado_logistico: estado }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarSeccionCompra(id: string, data: CompraValues) {
  const supabase = createServerClient()
  const validated = compraSchema.parse(data)
  const { error } = await supabase.from('unidades').update(validated).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarSeccionFibra(id: string, data: FibraValues) {
  const supabase = createServerClient()
  const validated = fibraSchema.parse(data)
  const { error } = await supabase.from('unidades').update(validated).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarFechaLlegadaTienda(id: string, fecha: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ fecha_llegada_tienda: fecha }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function asignarCliente(unidadId: string, clienteId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ cliente_id: clienteId }).eq('id', unidadId)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
}
```

- [ ] **Step 2: Crear components/unidades/estado-badges.tsx**

```tsx
// components/unidades/estado-badges.tsx
import { Badge } from '@/components/ui/badge'

const colorLogistico: Record<string, string> = {
  'Pedida': 'bg-yellow-100 text-yellow-800',
  'En fibrero': 'bg-orange-100 text-orange-800',
  'En tienda': 'bg-blue-100 text-blue-800',
}

const colorComercial: Record<string, string> = {
  'Disponible': 'bg-gray-100 text-gray-600',
  'Separada': 'bg-purple-100 text-purple-800',
  'Vendida': 'bg-green-100 text-green-800',
  'Entregada': 'bg-emerald-100 text-emerald-800',
}

export function BadgeLogistico({ estado }: { estado: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorLogistico[estado] ?? 'bg-gray-100 text-gray-600'}`}>{estado}</span>
}

export function BadgeComercial({ estado }: { estado: string | null }) {
  const label = estado ?? 'Disponible'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorComercial[label] ?? 'bg-gray-100 text-gray-600'}`}>{label}</span>
}

export function BadgeEstadoPago({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    'Pendiente': 'bg-red-100 text-red-700',
    'Parcial': 'bg-yellow-100 text-yellow-700',
    'Pagado': 'bg-green-100 text-green-700',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[estado] ?? ''}`}>{estado}</span>
}
```

- [ ] **Step 3: Crear components/unidades/unidad-filters.tsx**

```tsx
// components/unidades/unidad-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELOS_MOTO, ESTADOS_LOGISTICO } from '@/lib/constants'

export function UnidadFilters() {
  const router = useRouter()
  const params = useSearchParams()

  function setFilter(key: string, value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value === 'todos') sp.delete(key)
    else sp.set(key, value)
    router.push(`/unidades?${sp.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={params.get('modelo') ?? 'todos'} onValueChange={v => setFilter('modelo', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Modelo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los modelos</SelectItem>
          {MODELOS_MOTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('estado_logistico') ?? 'todos'} onValueChange={v => setFilter('estado_logistico', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Logístico" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {ESTADOS_LOGISTICO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('estado_comercial') ?? 'todos'} onValueChange={v => setFilter('estado_comercial', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Comercial" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {['Disponible', 'Separada', 'Vendida', 'Entregada'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('tipo_ingreso') ?? 'todos'} onValueChange={v => setFilter('tipo_ingreso', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="Stock">Stock</SelectItem>
          <SelectItem value="Bajo pedido">Bajo pedido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 4: Crear components/unidades/unidad-form.tsx**

```tsx
// components/unidades/unidad-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unidadBaseSchema, type UnidadBaseValues } from '@/lib/validations/unidad'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELOS_MOTO, ESTADOS_LOGISTICO } from '@/lib/constants'

export function UnidadForm({ onSubmit }: { onSubmit: (data: UnidadBaseValues) => Promise<void> }) {
  const form = useForm<UnidadBaseValues>({
    resolver: zodResolver(unidadBaseSchema),
    defaultValues: { n_motor: '', n_chasis: '', estado_logistico: 'Pedida', dua_item: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="n_motor" render={({ field }) => (
            <FormItem><FormLabel>N° Motor *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="n_chasis" render={({ field }) => (
            <FormItem><FormLabel>N° Chasis *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="modelo" render={({ field }) => (
            <FormItem><FormLabel>Modelo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                <SelectContent>{MODELOS_MOTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tipo_ingreso" render={({ field }) => (
            <FormItem><FormLabel>Tipo de ingreso *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Bajo pedido">Bajo pedido</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="estado_logistico" render={({ field }) => (
          <FormItem><FormLabel>Estado logístico inicial *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{ESTADOS_LOGISTICO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dua_item" render={({ field }) => (
          <FormItem><FormLabel>DUA - ITEM</FormLabel><FormControl><Input {...field} placeholder="N° DUA - ITEM" /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registrando...' : 'Registrar unidad'}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 5: Crear app/(vendedor)/unidades/page.tsx**

```tsx
// app/(vendedor)/unidades/page.tsx
import Link from 'next/link'
import { obtenerUnidades } from '@/lib/actions/unidades'
import { UnidadFilters } from '@/components/unidades/unidad-filters'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { Button } from '@/components/ui/button'

interface Props { searchParams: { modelo?: string; estado_logistico?: string; estado_comercial?: string; tipo_ingreso?: string } }

export default async function UnidadesPage({ searchParams }: Props) {
  const unidades = await obtenerUnidades(searchParams)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unidades</h1>
        <Button asChild><Link href="/unidades/nueva">+ Nueva unidad</Link></Button>
      </div>
      <UnidadFilters />
      <div className="bg-white rounded-lg border divide-y">
        {unidades.length === 0 && <p className="p-6 text-gray-500 text-center">No se encontraron unidades</p>}
        {unidades.map(u => (
          <Link key={u.id} href={`/unidades/${u.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-mono font-medium text-sm truncate">{u.n_motor}</p>
              <p className="text-sm text-gray-500">{u.modelo} · {u.tipo_ingreso}</p>
              {(u as any).clientes && <p className="text-xs text-gray-400">{(u as any).clientes.nombre_completo}</p>}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <BadgeLogistico estado={u.estado_logistico} />
              <BadgeComercial estado={u.estado_comercial} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Crear app/(vendedor)/unidades/nueva/page.tsx**

```tsx
// app/(vendedor)/unidades/nueva/page.tsx
'use client'

import { UnidadForm } from '@/components/unidades/unidad-form'
import { crearUnidad } from '@/lib/actions/unidades'

export default function NuevaUnidadPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nueva unidad</h1>
      <div className="bg-white rounded-lg border p-6">
        <UnidadForm onSubmit={crearUnidad} />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verificar listado y registro de unidades**

```bash
npm run dev
```

1. Crear una unidad con modelo Duramax GS, tipo Stock, estado Pedida
2. Verificar que aparece en el listado con badges correctos
3. Probar filtros por modelo y estado
4. Intentar crear otra unidad con el mismo n_motor → verificar mensaje de error

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: listado y registro de unidades con filtros y badges de estado"
```

---

## Task 8: Unidades — Ficha Completa

**Files:**
- Create: `app/(vendedor)/unidades/[id]/page.tsx`
- Create: `components/unidades/sections/datos-generales-section.tsx`
- Create: `components/unidades/sections/compra-section.tsx`
- Create: `components/unidades/sections/fibra-section.tsx`
- Create: `components/unidades/sections/tienda-section.tsx`
- Create: `components/unidades/marcar-entregada-button.tsx`

**Interfaces:**
- Consumes: `obtenerUnidad` (Task 7), `actualizarSeccionCompra`, `actualizarSeccionFibra`, `actualizarEstadoLogistico` (Task 7)
- Produces: ficha de unidad con acordeón que Tasks 9, 12 amplían con más secciones

- [ ] **Step 1: Crear components/unidades/sections/datos-generales-section.tsx**

```tsx
// components/unidades/sections/datos-generales-section.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unidadBaseSchema, type UnidadBaseValues } from '@/lib/validations/unidad'
import { actualizarEstadoLogistico, asignarCliente } from '@/lib/actions/unidades'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { ESTADOS_LOGISTICO } from '@/lib/constants'

interface Props {
  unidad: any
  onEstadoLogisticoChange: (estado: string) => void
}

export function DatosGeneralesSection({ unidad }: { unidad: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-500">N° Motor:</span><p className="font-mono font-medium">{unidad.n_motor}</p></div>
        <div><span className="text-gray-500">N° Chasis:</span><p className="font-mono font-medium">{unidad.n_chasis}</p></div>
        <div><span className="text-gray-500">Modelo:</span><p>{unidad.modelo}</p></div>
        <div><span className="text-gray-500">Tipo:</span><p>{unidad.tipo_ingreso}</p></div>
        <div><span className="text-gray-500">DUA - ITEM:</span><p>{unidad.dua_item ?? '—'}</p></div>
        <div><span className="text-gray-500">Cliente:</span>
          <p>{unidad.clientes ? unidad.clientes.nombre_completo : <span className="text-gray-400">Sin cliente</span>}</p>
        </div>
      </div>
      <div className="flex gap-4 pt-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">Estado logístico</p>
          <EstadoLogisticoSelector unidadId={unidad.id} estadoActual={unidad.estado_logistico} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Estado comercial</p>
          <BadgeComercial estado={unidad.estado_comercial} />
        </div>
      </div>
    </div>
  )
}

function EstadoLogisticoSelector({ unidadId, estadoActual }: { unidadId: string; estadoActual: string }) {
  const [loading, setLoading] = useState(false)

  async function onChange(value: string) {
    setLoading(true)
    try { await actualizarEstadoLogistico(unidadId, value) }
    finally { setLoading(false) }
  }

  return (
    <Select value={estadoActual} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-36 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS_LOGISTICO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 2: Crear components/unidades/sections/compra-section.tsx**

```tsx
// components/unidades/sections/compra-section.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { compraSchema, type CompraValues } from '@/lib/validations/unidad'
import { actualizarSeccionCompra } from '@/lib/actions/unidades'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

export function CompraSection({ unidad }: { unidad: any }) {
  const form = useForm<CompraValues>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      factura_compra_moto: unidad.factura_compra_moto ?? '',
      precio_compra_moto: unidad.precio_compra_moto ?? undefined,
      fecha_compra: unidad.fecha_compra ?? '',
      fecha_pago_compra: unidad.fecha_pago_compra ?? '',
      n_operacion_pago_compra: unidad.n_operacion_pago_compra ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => actualizarSeccionCompra(unidad.id, d))} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField control={form.control} name="factura_compra_moto" render={({ field }) => (
            <FormItem><FormLabel>N° Factura</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="precio_compra_moto" render={({ field }) => (
            <FormItem><FormLabel>Precio compra (S/)</FormLabel>
              <FormControl><Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_compra" render={({ field }) => (
            <FormItem><FormLabel>Fecha compra</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fecha_pago_compra" render={({ field }) => (
            <FormItem><FormLabel>Fecha pago</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="n_operacion_pago_compra" render={({ field }) => (
            <FormItem><FormLabel>N° Operación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>Guardar compra</Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 3: Crear components/unidades/sections/fibra-section.tsx**

Misma estructura que `compra-section.tsx` pero con campos de fibra:

```tsx
// components/unidades/sections/fibra-section.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fibraSchema, type FibraValues } from '@/lib/validations/unidad'
import { actualizarSeccionFibra } from '@/lib/actions/unidades'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function FibraSection({ unidad }: { unidad: any }) {
  const form = useForm<FibraValues>({
    resolver: zodResolver(fibraSchema),
    defaultValues: {
      proveedor_fibra: unidad.proveedor_fibra ?? '',
      fecha_llegada_fibrero: unidad.fecha_llegada_fibrero ?? '',
      fecha_pago_fibra: unidad.fecha_pago_fibra ?? '',
      n_operacion_fibra: unidad.n_operacion_fibra ?? '',
      factura_fibra: unidad.factura_fibra ?? '',
      precio_fibra: unidad.precio_fibra ?? undefined,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => actualizarSeccionFibra(unidad.id, d))} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField control={form.control} name="proveedor_fibra" render={({ field }) => (
            <FormItem><FormLabel>Proveedor (fibrero)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fecha_llegada_fibrero" render={({ field }) => (
            <FormItem><FormLabel>Llegada al fibrero</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fecha_pago_fibra" render={({ field }) => (
            <FormItem><FormLabel>Fecha pago fibra</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="n_operacion_fibra" render={({ field }) => (
            <FormItem><FormLabel>N° Operación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="factura_fibra" render={({ field }) => (
            <FormItem><FormLabel>N° Factura fibra</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="precio_fibra" render={({ field }) => (
            <FormItem><FormLabel>Precio fibra (S/)</FormLabel>
              <FormControl><Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>Guardar fibra</Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 4: Crear components/unidades/sections/tienda-section.tsx**

```tsx
// components/unidades/sections/tienda-section.tsx
'use client'

import { useState } from 'react'
import { actualizarFechaLlegadaTienda } from '@/lib/actions/unidades'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function TiendaSection({ unidad }: { unidad: any }) {
  const [fecha, setFecha] = useState(unidad.fecha_llegada_tienda ?? '')
  const [loading, setLoading] = useState(false)

  async function handleGuardar() {
    if (!fecha) return
    setLoading(true)
    try { await actualizarFechaLlegadaTienda(unidad.id, fecha) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <div className="max-w-xs">
        <Label>Fecha llegada a tienda</Label>
        <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1" />
      </div>
      <Button size="sm" onClick={handleGuardar} disabled={loading || !fecha}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Crear components/unidades/marcar-entregada-button.tsx**

```tsx
// components/unidades/marcar-entregada-button.tsx
'use client'

import { useState } from 'react'
import { marcarEntregada } from '@/lib/actions/unidades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function MarcarEntregadaButton({ unidadId, fechaVenta }: { unidadId: string; fechaVenta: string }) {
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmar() {
    if (!fecha) return
    if (new Date(fecha) < new Date(fechaVenta)) {
      setError('La fecha de entrega no puede ser anterior a la fecha de venta')
      return
    }
    setLoading(true)
    setError('')
    try { await marcarEntregada(unidadId, fecha, fechaVenta) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Marcar como Entregada</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirmar entrega</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Fecha de entrega física *</Label>
            <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={fechaVenta} className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleConfirmar} disabled={loading || !fecha} className="w-full">
            {loading ? 'Guardando...' : 'Confirmar entrega'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 6: Agregar marcarEntregada a lib/actions/unidades.ts**

Añadir al final de `lib/actions/unidades.ts`:

```ts
import { addMonths } from 'date-fns'
import { format } from 'date-fns'

export async function marcarEntregada(unidadId: string, fechaEntrega: string, fechaVenta: string) {
  if (new Date(fechaEntrega) < new Date(fechaVenta)) {
    throw new Error('La fecha de entrega no puede ser anterior a la fecha de venta')
  }
  const supabase = createServerClient()

  const { error: unidadError } = await supabase
    .from('unidades')
    .update({ estado_comercial: 'Entregada', fecha_entrega: fechaEntrega })
    .eq('id', unidadId)
  if (unidadError) throw new Error(unidadError.message)

  const vencimiento = format(addMonths(new Date(fechaEntrega), 1), 'yyyy-MM-dd')
  const { error: garantiaError } = await supabase
    .from('garantias')
    .upsert({
      unidad_id: unidadId,
      garantia_moto_km: 24000,
      garantia_moto_inicio: fechaEntrega,
      garantia_fibra_inicio: fechaEntrega,
      garantia_fibra_vencimiento: vencimiento,
    }, { onConflict: 'unidad_id' })
  if (garantiaError) throw new Error(garantiaError.message)

  revalidatePath(`/unidades/${unidadId}`)
}
```

- [ ] **Step 7: Crear app/(vendedor)/unidades/[id]/page.tsx**

```tsx
// app/(vendedor)/unidades/[id]/page.tsx
import { obtenerUnidad } from '@/lib/actions/unidades'
import { DatosGeneralesSection } from '@/components/unidades/sections/datos-generales-section'
import { CompraSection } from '@/components/unidades/sections/compra-section'
import { FibraSection } from '@/components/unidades/sections/fibra-section'
import { TiendaSection } from '@/components/unidades/sections/tienda-section'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

// Las secciones de Venta, Pagos, Garantías, Reclamos y Trámites
// se agregan en Tasks 9 y 12 — se dejan como placeholders por ahora
export default async function UnidadPage({ params }: { params: { id: string } }) {
  const unidad = await obtenerUnidad(params.id)

  const sections = [
    { id: 'general', title: 'Datos generales', content: <DatosGeneralesSection unidad={unidad} /> },
    { id: 'compra', title: 'Compra de moto', content: <CompraSection unidad={unidad} /> },
    { id: 'fibra', title: 'Fibra', content: <FibraSection unidad={unidad} /> },
    { id: 'tienda', title: 'Llegada a tienda', content: <TiendaSection unidad={unidad} /> },
    // Venta y Pagos: Task 9
    // Garantías, Reclamos, Trámites: Task 12
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/unidades" className="hover:underline">Unidades</Link>
        <span>›</span>
        <span className="font-mono">{unidad.n_motor}</span>
      </div>
      <h1 className="text-2xl font-bold">{unidad.modelo} — {unidad.n_motor}</h1>
      <Accordion type="multiple" defaultValue={['general']} className="space-y-2">
        {sections.map(({ id, title, content }) => (
          <AccordionItem key={id} value={id} className="bg-white border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">{title}</AccordionTrigger>
            <AccordionContent className="pb-4">{content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
```

- [ ] **Step 8: Verificar ficha de unidad en browser**

```bash
npm run dev
```

1. Abrir ficha de una unidad → verificar que el acordeón funciona
2. Editar sección Compra → guardar → recargar → verificar que persisten los datos
3. Cambiar estado logístico → verificar que el badge cambia inmediatamente
4. Con una unidad que tenga venta (del Task 9), probar botón Marcar Entregada

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: ficha de unidad con secciones colapsables y estado logístico manual"
```

---

## Task 9: Ventas y Pagos

**Files:**
- Create: `lib/actions/ventas.ts`
- Create: `lib/actions/pagos.ts`
- Create: `components/ventas/venta-form.tsx`
- Create: `components/ventas/pago-form.tsx`
- Create: `components/unidades/sections/venta-section.tsx`
- Create: `components/unidades/sections/pagos-section.tsx`
- Modify: `app/(vendedor)/unidades/[id]/page.tsx` (agregar secciones Venta y Pagos)

**Interfaces:**
- Consumes: `ventaSchema`, `pagoSchema` (Task 4), `calcularEstadoPago` (Task 4), `obtenerClientes` (Task 6)
- Produces: `crearVenta`, `crearPago` con actualización automática de `estado_pago` y `estado_comercial`

- [ ] **Step 1: Crear lib/actions/ventas.ts**

```ts
// lib/actions/ventas.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { ventaSchema, type VentaFormValues } from '@/lib/validations/venta'

export async function crearVenta(unidadId: string, data: VentaFormValues) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const validated = ventaSchema.parse(data)

  // Verificar que la unidad no tiene ya una venta
  const { data: ventaExistente } = await supabase
    .from('ventas').select('id').eq('unidad_id', unidadId).single()
  if (ventaExistente) throw new Error('Esta unidad ya tiene una venta registrada')

  const { data: venta, error } = await supabase
    .from('ventas')
    .insert({
      unidad_id: unidadId,
      cliente_id: validated.cliente_id,
      vendedor_id: user!.id,
      tipo_venta: validated.tipo_venta,
      fecha_venta: validated.fecha_venta,
      precio_venta: validated.precio_venta,
      documento_tipo: validated.documento_tipo ?? null,
      documento_numero: validated.documento_numero ?? null,
      estado_pago: 'Pendiente',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Asignar cliente a la unidad si no lo tenía
  await supabase.from('unidades')
    .update({ cliente_id: validated.cliente_id })
    .eq('id', unidadId).is('cliente_id', null)

  // Crear trámite vacío automáticamente
  await supabase.from('tramites').upsert({ unidad_id: unidadId }, { onConflict: 'unidad_id' })

  revalidatePath(`/unidades/${unidadId}`)
  return venta
}

export async function obtenerSeguimientosPendientes() {
  const supabase = createServerClient()
  const fechaLimite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('ventas')
    .select('*, unidades(n_motor, modelo), clientes(nombre_completo)')
    .lte('fecha_venta', fechaLimite)
    .eq('seguimiento_7dias_hecho', false)
    .order('fecha_venta', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function marcarSeguimientoHecho(ventaId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('ventas').update({ seguimiento_7dias_hecho: true }).eq('id', ventaId)
  if (error) throw new Error(error.message)
  revalidatePath('/seguimientos')
  revalidatePath('/unidades')
}
```

- [ ] **Step 2: Crear lib/actions/pagos.ts**

```ts
// lib/actions/pagos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { pagoSchema, type PagoFormValues } from '@/lib/validations/pago'
import { calcularEstadoPago } from '@/lib/utils/estados'

export async function crearPago(ventaId: string, unidadId: string, data: PagoFormValues) {
  const supabase = createServerClient()
  const validated = pagoSchema.parse(data)

  // 1. Obtener venta y estado_comercial actual de la unidad
  const [{ data: venta, error: ventaErr }, { data: unidad, error: unidadErr }] = await Promise.all([
    supabase.from('ventas').select('precio_venta').eq('id', ventaId).single(),
    supabase.from('unidades').select('estado_comercial').eq('id', unidadId).single(),
  ])
  if (ventaErr || !venta) throw new Error('Venta no encontrada')
  if (unidadErr) throw new Error(unidadErr.message)

  // 2. Insertar pago
  const { error: pagoError } = await supabase
    .from('pagos').insert({ ...validated, venta_id: ventaId })
  if (pagoError) throw new Error(pagoError.message)

  // 3. Recalcular suma de pagos
  const { data: pagos, error: pagosErr } = await supabase
    .from('pagos').select('monto, tipo').eq('venta_id', ventaId)
  if (pagosErr) throw new Error(pagosErr.message)

  const sumaPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const nuevoEstadoPago = calcularEstadoPago(sumaPagos, Number(venta.precio_venta))

  // 4. Actualizar estado_pago en venta
  await supabase.from('ventas').update({ estado_pago: nuevoEstadoPago }).eq('id', ventaId)

  // 5. Actualizar estado_comercial en unidad (sin degradar desde Entregada)
  const estadoComercialActual = unidad?.estado_comercial
  if (estadoComercialActual !== 'Entregada') {
    if (nuevoEstadoPago === 'Pagado') {
      await supabase.from('unidades').update({ estado_comercial: 'Vendida' }).eq('id', unidadId)
    } else if (validated.tipo === 'Adelanto' && !estadoComercialActual) {
      const esFirstAdelanto = pagos.filter(p => p.tipo === 'Adelanto').length === 1
      if (esFirstAdelanto) {
        await supabase.from('unidades').update({ estado_comercial: 'Separada' }).eq('id', unidadId)
      }
    }
  }

  revalidatePath(`/unidades/${unidadId}`)
}
```

- [ ] **Step 3: Crear components/ventas/venta-form.tsx**

```tsx
// components/ventas/venta-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ventaSchema, type VentaFormValues } from '@/lib/validations/venta'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  clientes: { id: string; nombre_completo: string; dni: string }[]
  clienteIdInicial?: string
  onSubmit: (data: VentaFormValues) => Promise<void>
}

export function VentaForm({ clientes, clienteIdInicial, onSubmit }: Props) {
  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      tipo_venta: 'Contado',
      fecha_venta: new Date().toISOString().split('T')[0],
      precio_venta: 0,
      cliente_id: clienteIdInicial ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="cliente_id" render={({ field }) => (
          <FormItem><FormLabel>Cliente *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger></FormControl>
              <SelectContent>
                {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre_completo} — DNI {c.dni}</SelectItem>)}
              </SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="tipo_venta" render={({ field }) => (
            <FormItem><FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Contado">Contado</SelectItem>
                  <SelectItem value="Separación">Separación</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_venta" render={({ field }) => (
            <FormItem><FormLabel>Fecha venta *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="precio_venta" render={({ field }) => (
          <FormItem><FormLabel>Precio de venta (S/) *</FormLabel>
            <FormControl><Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="documento_tipo" render={({ field }) => (
            <FormItem><FormLabel>Tipo documento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Sin documento" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Factura">Factura</SelectItem>
                  <SelectItem value="Boleta">Boleta</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="documento_numero" render={({ field }) => (
            <FormItem><FormLabel>N° Documento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registrando...' : 'Registrar venta'}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 4: Crear components/ventas/pago-form.tsx**

```tsx
// components/ventas/pago-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pagoSchema, type PagoFormValues } from '@/lib/validations/pago'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PagoForm({ onSubmit }: { onSubmit: (data: PagoFormValues) => Promise<void> }) {
  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { fecha_pago: new Date().toISOString().split('T')[0], monto: 0, n_operacion: '', n_recibo: '', tipo: 'Adelanto' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (d) => { await onSubmit(d); form.reset() })} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="tipo" render={({ field }) => (
            <FormItem><FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Adelanto">Adelanto</SelectItem>
                  <SelectItem value="Saldo">Saldo</SelectItem>
                  <SelectItem value="Contado">Contado</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_pago" render={({ field }) => (
            <FormItem><FormLabel>Fecha *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="monto" render={({ field }) => (
          <FormItem><FormLabel>Monto (S/) *</FormLabel>
            <FormControl><Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="n_recibo" render={({ field }) => (
            <FormItem><FormLabel>N° Recibo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="n_operacion" render={({ field }) => (
            <FormItem><FormLabel>N° Operación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registrando...' : 'Registrar pago'}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 5: Crear components/unidades/sections/venta-section.tsx**

```tsx
// components/unidades/sections/venta-section.tsx
'use client'

import { useState } from 'react'
import { crearVenta } from '@/lib/actions/ventas'
import { VentaForm } from '@/components/ventas/venta-form'
import { BadgeEstadoPago } from '@/components/unidades/estado-badges'
import { MarcarEntregadaButton } from '@/components/unidades/marcar-entregada-button'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

interface Props {
  unidad: any
  clientes: { id: string; nombre_completo: string; dni: string }[]
}

export function VentaSection({ unidad, clientes }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const venta = unidad.ventas?.[0]

  if (!venta && !mostrarForm) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">No hay venta registrada para esta unidad</p>
        <Button size="sm" onClick={() => setMostrarForm(true)}>Registrar venta</Button>
      </div>
    )
  }

  if (!venta && mostrarForm) {
    return (
      <VentaForm
        clientes={clientes}
        clienteIdInicial={unidad.cliente_id ?? undefined}
        onSubmit={async (data) => { await crearVenta(unidad.id, data); setMostrarForm(false) }}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-gray-500">Tipo:</span><p>{venta.tipo_venta}</p></div>
        <div><span className="text-gray-500">Fecha:</span><p>{venta.fecha_venta}</p></div>
        <div><span className="text-gray-500">Precio:</span><p className="font-medium">{formatSoles(Number(venta.precio_venta))}</p></div>
        <div><span className="text-gray-500">Estado pago:</span><p><BadgeEstadoPago estado={venta.estado_pago} /></p></div>
        <div><span className="text-gray-500">Documento:</span><p>{venta.documento_tipo} {venta.documento_numero}</p></div>
      </div>
      {unidad.estado_comercial === 'Vendida' && (
        <MarcarEntregadaButton unidadId={unidad.id} fechaVenta={venta.fecha_venta} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Crear components/unidades/sections/pagos-section.tsx**

```tsx
// components/unidades/sections/pagos-section.tsx
'use client'

import { useState } from 'react'
import { crearPago } from '@/lib/actions/pagos'
import { PagoForm } from '@/components/ventas/pago-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

export function PagosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const venta = unidad.ventas?.[0]
  if (!venta) return <p className="text-sm text-gray-500">Registra primero la venta</p>

  const pagos = venta.pagos ?? []
  const sumaPagos = pagos.reduce((acc: number, p: any) => acc + Number(p.monto), 0)
  const saldoPendiente = Number(venta.precio_venta) - sumaPagos

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Saldo pendiente: </span>
          <span className={`font-semibold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatSoles(saldoPendiente)}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setMostrarForm(f => !f)}>
          {mostrarForm ? 'Cancelar' : '+ Registrar pago'}
        </Button>
      </div>
      {mostrarForm && (
        <PagoForm onSubmit={async (data) => { await crearPago(venta.id, unidad.id, data); setMostrarForm(false) }} />
      )}
      {pagos.length === 0 ? (
        <p className="text-sm text-gray-500">Sin pagos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr><th className="text-left py-1">Fecha</th><th className="text-left">Tipo</th><th className="text-right">Monto</th><th className="text-left">Recibo</th><th className="text-left">Operación</th></tr>
            </thead>
            <tbody className="divide-y">
              {pagos.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-2">{p.fecha_pago}</td>
                  <td>{p.tipo}</td>
                  <td className="text-right font-medium">{formatSoles(Number(p.monto))}</td>
                  <td className="font-mono">{p.n_recibo}</td>
                  <td className="text-gray-500">{p.n_operacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Agregar secciones Venta y Pagos a la ficha de unidad**

En `app/(vendedor)/unidades/[id]/page.tsx`, agregar imports y secciones:

```tsx
import { VentaSection } from '@/components/unidades/sections/venta-section'
import { PagosSection } from '@/components/unidades/sections/pagos-section'
import { obtenerClientes } from '@/lib/actions/clientes'

// En la función del componente, agregar:
const clientes = await obtenerClientes()

// En el array sections, agregar después de 'tienda':
{ id: 'venta', title: 'Venta', content: <VentaSection unidad={unidad} clientes={clientes} /> },
{ id: 'pagos', title: 'Pagos', content: <PagosSection unidad={unidad} /> },
```

- [ ] **Step 8: Verificar flujo completo de venta y pagos**

```bash
npm run dev
```

1. Ficha de una unidad sin venta → registrar venta Contado por S/ 5,000
2. Sección Pagos → verificar saldo pendiente = S/ 5,000
3. Registrar pago Adelanto S/ 2,000 → verificar estado_pago = Parcial, estado_comercial = Separada
4. Registrar pago Saldo S/ 3,000 → verificar estado_pago = Pagado, estado_comercial = Vendida
5. Verificar botón "Marcar como Entregada" aparece en sección Venta

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: ventas y pagos con lógica automática de estado_pago y estado_comercial"
```

---

## Task 10: Prospectos — Kanban

**Files:**
- Create: `lib/actions/prospectos.ts`
- Create: `components/prospectos/kanban-board.tsx`
- Create: `components/prospectos/kanban-column.tsx`
- Create: `components/prospectos/prospecto-card.tsx`
- Create: `components/prospectos/prospecto-form.tsx`
- Create: `app/(vendedor)/prospectos/page.tsx`
- Create: `app/(vendedor)/prospectos/nuevo/page.tsx`

**Interfaces:**
- Consumes: `prospectoSchema` (Task 4), `ETAPAS_PROSPECTO`, `MODELOS_MOTO` (Task 1)
- Produces: `crearProspecto`, `actualizarEtapaProspecto`, `obtenerProspectos` usados por Task 11

- [ ] **Step 1: Crear lib/actions/prospectos.ts**

```ts
// lib/actions/prospectos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { prospectoSchema, type ProspectoFormValues } from '@/lib/validations/prospecto'

export async function obtenerProspectos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('prospectos')
    .select('*, usuarios(nombre)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerProspecto(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('prospectos').select('*, usuarios(nombre)').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function crearProspecto(data: ProspectoFormValues) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const validated = prospectoSchema.parse(data)

  const { data: prospecto, error } = await supabase
    .from('prospectos')
    .insert({ ...validated, vendedor_id: user!.id })
    .select('id').single()
  if (error) throw new Error(error.message)

  revalidatePath('/prospectos')
  redirect(`/prospectos/${prospecto.id}`)
}

export async function actualizarEtapaProspecto(id: string, etapa: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('prospectos')
    .update({ etapa, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/prospectos')
}

export async function actualizarProspecto(id: string, data: ProspectoFormValues) {
  const supabase = createServerClient()
  const validated = prospectoSchema.parse(data)
  const { error } = await supabase
    .from('prospectos')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/prospectos/${id}`)
  revalidatePath('/prospectos')
}
```

- [ ] **Step 2: Crear components/prospectos/prospecto-card.tsx**

```tsx
// components/prospectos/prospecto-card.tsx
'use client'

import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { actualizarEtapaProspecto } from '@/lib/actions/prospectos'
import { ETAPAS_PROSPECTO } from '@/lib/constants'
import { Phone } from 'lucide-react'

interface Prospecto {
  id: string
  nombre: string
  telefono: string | null
  modelo_interes: string | null
  etapa: string
}

export function ProspectoCard({ prospecto, showEtapaSelector = false }: { prospecto: Prospecto; showEtapaSelector?: boolean }) {
  async function handleEtapaChange(etapa: string) {
    await actualizarEtapaProspecto(prospecto.id, etapa)
  }

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm space-y-2">
      <Link href={`/prospectos/${prospecto.id}`} className="block">
        <p className="font-medium text-sm hover:underline">{prospecto.nombre}</p>
        {prospecto.modelo_interes && <p className="text-xs text-gray-500">{prospecto.modelo_interes}</p>}
        {prospecto.telefono && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Phone size={10} /> {prospecto.telefono}
          </p>
        )}
      </Link>
      {showEtapaSelector && (
        <Select value={prospecto.etapa} onValueChange={handleEtapaChange}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ETAPAS_PROSPECTO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crear components/prospectos/kanban-column.tsx**

```tsx
// components/prospectos/kanban-column.tsx
import Link from 'next/link'
import { ProspectoCard } from './prospecto-card'

interface Props {
  etapa: string
  prospectos: any[]
  color: string
}

export function KanbanColumn({ etapa, prospectos, color }: Props) {
  return (
    <div className="flex-1 min-w-56 max-w-72">
      <div className={`text-xs font-semibold px-2 py-1 rounded-t ${color} flex items-center justify-between`}>
        <span>{etapa}</span>
        <span className="bg-white/50 rounded-full px-1.5">{prospectos.length}</span>
      </div>
      <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 min-h-32">
        {prospectos.map(p => (
          <ProspectoCard key={p.id} prospecto={p} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear components/prospectos/kanban-board.tsx**

```tsx
// components/prospectos/kanban-board.tsx
import { KanbanColumn } from './kanban-column'
import { ProspectoCard } from './prospecto-card'
import { ETAPAS_PROSPECTO } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const COLORES_ETAPA: Record<string, string> = {
  'Interesado': 'bg-blue-100 text-blue-700',
  'Cotizó': 'bg-yellow-100 text-yellow-700',
  'Dio adelanto': 'bg-orange-100 text-orange-700',
  'Vendido': 'bg-green-100 text-green-700',
  'Desistió': 'bg-gray-100 text-gray-600',
}

export function KanbanBoard({ prospectos }: { prospectos: any[] }) {
  const porEtapa = Object.fromEntries(
    ETAPAS_PROSPECTO.map(e => [e, prospectos.filter(p => p.etapa === e)])
  )

  return (
    <>
      {/* Desktop: columnas side by side */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
        {ETAPAS_PROSPECTO.map(etapa => (
          <KanbanColumn
            key={etapa}
            etapa={etapa}
            prospectos={porEtapa[etapa]}
            color={COLORES_ETAPA[etapa]}
          />
        ))}
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue={ETAPAS_PROSPECTO[0]}>
          <TabsList className="w-full overflow-x-auto flex-wrap h-auto gap-1">
            {ETAPAS_PROSPECTO.map(e => (
              <TabsTrigger key={e} value={e} className="text-xs">
                {e} ({porEtapa[e].length})
              </TabsTrigger>
            ))}
          </TabsList>
          {ETAPAS_PROSPECTO.map(etapa => (
            <TabsContent key={etapa} value={etapa} className="space-y-2 mt-3">
              {porEtapa[etapa].length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Sin prospectos en esta etapa</p>
              )}
              {porEtapa[etapa].map(p => (
                <ProspectoCard key={p.id} prospecto={p} showEtapaSelector />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Crear components/prospectos/prospecto-form.tsx**

```tsx
// components/prospectos/prospecto-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prospectoSchema, type ProspectoFormValues } from '@/lib/validations/prospecto'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MODELOS_MOTO, ORIGENES_PROSPECTO, ETAPAS_PROSPECTO } from '@/lib/constants'

interface Props {
  defaultValues?: Partial<ProspectoFormValues>
  onSubmit: (data: ProspectoFormValues) => Promise<void>
  submitLabel?: string
}

export function ProspectoForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: Props) {
  const form = useForm<ProspectoFormValues>({
    resolver: zodResolver(prospectoSchema),
    defaultValues: { nombre: '', telefono: '', etapa: 'Interesado', notas: '', ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nombre" render={({ field }) => (
          <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="telefono" render={({ field }) => (
          <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="modelo_interes" render={({ field }) => (
            <FormItem><FormLabel>Modelo de interés</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Sin definir" /></SelectTrigger></FormControl>
                <SelectContent>{MODELOS_MOTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="origen" render={({ field }) => (
            <FormItem><FormLabel>Origen</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Sin definir" /></SelectTrigger></FormControl>
                <SelectContent>{ORIGENES_PROSPECTO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="etapa" render={({ field }) => (
          <FormItem><FormLabel>Etapa</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{ETAPAS_PROSPECTO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notas" render={({ field }) => (
          <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 6: Crear app/(vendedor)/prospectos/page.tsx**

```tsx
// app/(vendedor)/prospectos/page.tsx
import Link from 'next/link'
import { obtenerProspectos } from '@/lib/actions/prospectos'
import { KanbanBoard } from '@/components/prospectos/kanban-board'
import { Button } from '@/components/ui/button'

export default async function ProspectosPage() {
  const prospectos = await obtenerProspectos()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prospectos</h1>
        <Button asChild><Link href="/prospectos/nuevo">+ Nuevo</Link></Button>
      </div>
      <KanbanBoard prospectos={prospectos} />
    </div>
  )
}
```

- [ ] **Step 7: Crear app/(vendedor)/prospectos/nuevo/page.tsx**

```tsx
// app/(vendedor)/prospectos/nuevo/page.tsx
'use client'

import { ProspectoForm } from '@/components/prospectos/prospecto-form'
import { crearProspecto } from '@/lib/actions/prospectos'

export default function NuevoProspectoPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nuevo prospecto</h1>
      <div className="bg-white rounded-lg border p-6">
        <ProspectoForm onSubmit={crearProspecto} submitLabel="Registrar prospecto" />
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Verificar kanban en browser**

```bash
npm run dev
```

1. Crear 3 prospectos con diferentes etapas
2. Desktop: verificar columnas kanban
3. Mobile (DevTools): verificar tabs por etapa con selector de cambio de etapa
4. Cambiar etapa desde el selector mobile → verificar que cambia en el servidor

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: kanban de prospectos con columnas en desktop y tabs en móvil"
```

---

## Task 11: Conversión Prospecto → Venta

**Files:**
- Create: `app/(vendedor)/prospectos/[id]/page.tsx`
- Create: `components/prospectos/convertir-venta-flow.tsx`
- Modify: `lib/actions/prospectos.ts` (agregar `convertirEnVenta`)

**Interfaces:**
- Consumes: `obtenerProspecto` (Task 10), `crearCliente` (Task 6), `crearVenta` (Task 9), `obtenerClientes` (Task 6), `obtenerUnidades` (Task 7)
- Produces: flujo de conversión atómico que crea cliente, asigna unidad y registra venta

- [ ] **Step 1: Agregar convertirEnVenta a lib/actions/prospectos.ts**

```ts
// Agregar al final de lib/actions/prospectos.ts
import { clienteSchema } from '@/lib/validations/cliente'
import { ventaSchema } from '@/lib/validations/venta'

export async function convertirEnVenta(
  prospectoId: string,
  clienteData: { nombre_completo: string; dni: string; direccion?: string; telefono?: string; correo?: string },
  unidadId: string,
  ventaData: { tipo_venta: 'Contado' | 'Separación'; fecha_venta: string; precio_venta: number; documento_tipo?: 'Factura' | 'Boleta' | null; documento_numero?: string }
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Crear cliente
  const clienteValidated = clienteSchema.parse(clienteData)
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert({ ...clienteValidated, correo: clienteValidated.correo || null })
    .select('id').single()
  if (clienteError) {
    if (clienteError.code === '23505') throw new Error('El DNI ya está registrado')
    throw new Error(clienteError.message)
  }

  // 2. Crear venta
  const { error: ventaError } = await supabase.from('ventas').insert({
    unidad_id: unidadId,
    cliente_id: cliente.id,
    vendedor_id: user!.id,
    tipo_venta: ventaData.tipo_venta,
    fecha_venta: ventaData.fecha_venta,
    precio_venta: ventaData.precio_venta,
    documento_tipo: ventaData.documento_tipo ?? null,
    documento_numero: ventaData.documento_numero ?? null,
    estado_pago: 'Pendiente',
  })
  if (ventaError) throw new Error(ventaError.message)

  // 3. Asignar cliente a la unidad
  await supabase.from('unidades').update({ cliente_id: cliente.id }).eq('id', unidadId)

  // 4. Crear trámite vacío
  await supabase.from('tramites').upsert({ unidad_id: unidadId }, { onConflict: 'unidad_id' })

  // 5. Marcar prospecto como Vendido
  await supabase.from('prospectos')
    .update({ etapa: 'Vendido', updated_at: new Date().toISOString() })
    .eq('id', prospectoId)

  revalidatePath('/prospectos')
  revalidatePath('/unidades')
  redirect(`/unidades/${unidadId}`)
}
```

- [ ] **Step 2: Crear components/prospectos/convertir-venta-flow.tsx**

```tsx
// components/prospectos/convertir-venta-flow.tsx
'use client'

import { useState } from 'react'
import { convertirEnVenta } from '@/lib/actions/prospectos'
import { ClienteForm } from '@/components/clientes/cliente-form'
import { VentaForm } from '@/components/ventas/venta-form'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatSoles } from '@/lib/utils/format'
import type { ClienteFormValues } from '@/lib/validations/cliente'
import type { VentaFormValues } from '@/lib/validations/venta'

interface Props {
  prospecto: { id: string; nombre: string; telefono: string | null; modelo_interes: string | null }
  unidadesDisponibles: { id: string; n_motor: string; modelo: string; n_chasis: string }[]
}

type Paso = 'cliente' | 'unidad' | 'venta'

export function ConvertirVentaFlow({ prospecto, unidadesDisponibles }: Props) {
  const [paso, setPaso] = useState<Paso>('cliente')
  const [clienteData, setClienteData] = useState<ClienteFormValues | null>(null)
  const [unidadId, setUnidadId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClienteSubmit(data: ClienteFormValues) {
    setClienteData(data)
    setPaso('unidad')
  }

  async function handleVentaSubmit(data: VentaFormValues) {
    if (!clienteData || !unidadId) return
    setLoading(true)
    setError('')
    try {
      await convertirEnVenta(prospecto.id, clienteData, unidadId, {
        tipo_venta: data.tipo_venta,
        fecha_venta: data.fecha_venta,
        precio_venta: data.precio_venta,
        documento_tipo: data.documento_tipo,
        documento_numero: data.documento_numero,
      })
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const pasos = ['cliente', 'unidad', 'venta'] as const
  const pasosLabels = { cliente: '1. Cliente', unidad: '2. Unidad', venta: '3. Venta' }

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex gap-4">
        {pasos.map(p => (
          <span key={p} className={`text-sm font-medium ${paso === p ? 'text-gray-900 underline' : 'text-gray-400'}`}>
            {pasosLabels[p]}
          </span>
        ))}
      </div>

      {/* Paso 1: Cliente */}
      {paso === 'cliente' && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold mb-4">Datos del cliente</h3>
          <ClienteForm
            defaultValues={{ nombre_completo: prospecto.nombre, telefono: prospecto.telefono ?? '' }}
            onSubmit={handleClienteSubmit}
            submitLabel="Siguiente →"
          />
        </div>
      )}

      {/* Paso 2: Unidad */}
      {paso === 'unidad' && (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Seleccionar unidad</h3>
          {prospecto.modelo_interes && (
            <p className="text-sm text-gray-500">Modelo de interés: <strong>{prospecto.modelo_interes}</strong></p>
          )}
          <div>
            <Label>Unidad disponible *</Label>
            <Select value={unidadId} onValueChange={setUnidadId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar unidad" />
              </SelectTrigger>
              <SelectContent>
                {unidadesDisponibles.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.modelo} — Motor: {u.n_motor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPaso('cliente')}>← Atrás</Button>
            <Button onClick={() => unidadId && setPaso('venta')} disabled={!unidadId}>Siguiente →</Button>
          </div>
        </div>
      )}

      {/* Paso 3: Venta */}
      {paso === 'venta' && (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Registrar venta</h3>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <VentaForm
            clientes={clienteData ? [{ id: 'nuevo', nombre_completo: clienteData.nombre_completo, dni: clienteData.dni }] : []}
            clienteIdInicial="nuevo"
            onSubmit={handleVentaSubmit}
          />
          <Button variant="outline" onClick={() => setPaso('unidad')}>← Atrás</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crear app/(vendedor)/prospectos/[id]/page.tsx**

```tsx
// app/(vendedor)/prospectos/[id]/page.tsx
import { obtenerProspecto, actualizarProspecto } from '@/lib/actions/prospectos'
import { obtenerUnidades } from '@/lib/actions/unidades'
import { ProspectoForm } from '@/components/prospectos/prospecto-form'
import { ConvertirVentaFlow } from '@/components/prospectos/convertir-venta-flow'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props { params: { id: string } }

export default async function ProspectoPage({ params }: Props) {
  const [prospecto, unidadesDisponibles] = await Promise.all([
    obtenerProspecto(params.id),
    obtenerUnidades({ estado_comercial: 'Disponible' }),
  ])

  const yaVendido = prospecto.etapa === 'Vendido'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/prospectos" className="hover:underline">Prospectos</Link>
        <span>›</span>
        <span>{prospecto.nombre}</span>
      </div>
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">{prospecto.nombre}</h1>
        {!yaVendido && prospecto.etapa !== 'Desistió' && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{prospecto.etapa}</span>
        )}
      </div>

      {/* Editar datos del prospecto */}
      {!yaVendido && (
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Datos del prospecto</h2>
          <ProspectoForm
            defaultValues={{
              nombre: prospecto.nombre,
              telefono: prospecto.telefono ?? '',
              modelo_interes: prospecto.modelo_interes ?? undefined,
              origen: prospecto.origen ?? undefined,
              etapa: prospecto.etapa as any,
              notas: prospecto.notas ?? '',
            }}
            onSubmit={(data) => actualizarProspecto(params.id, data)}
            submitLabel="Actualizar"
          />
        </div>
      )}

      {/* Flujo de conversión */}
      {!yaVendido && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Convertir en venta</h2>
          <ConvertirVentaFlow
            prospecto={prospecto}
            unidadesDisponibles={unidadesDisponibles.filter(u =>
              !prospecto.modelo_interes || u.modelo === prospecto.modelo_interes
            )}
          />
        </div>
      )}

      {yaVendido && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Este prospecto ya fue convertido en venta.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verificar flujo de conversión en browser**

```bash
npm run dev
```

1. Abrir un prospecto → ver formulario de edición
2. Clic en "Convertir en venta"
3. Paso 1: llenar datos del cliente (nombre pre-rellenado) → Siguiente
4. Paso 2: seleccionar unidad disponible (filtrada por modelo de interés) → Siguiente
5. Paso 3: registrar venta → Guardar
6. Verificar redirección a ficha de unidad con venta registrada
7. Verificar que el prospecto aparece como "Vendido" en el kanban

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: flujo de conversión prospecto → cliente + venta en 3 pasos"
```

---

## Task 12: Garantías, Reclamos y Trámites

**Files:**
- Create: `lib/actions/reclamos.ts`
- Create: `lib/actions/tramites.ts`
- Create: `components/unidades/sections/garantias-section.tsx`
- Create: `components/unidades/sections/reclamos-section.tsx`
- Create: `components/unidades/sections/tramites-section.tsx`
- Create: `components/reclamos/reclamo-form.tsx`
- Modify: `app/(vendedor)/unidades/[id]/page.tsx` (agregar 3 secciones)

**Interfaces:**
- Consumes: `reclamoSchema` (Task 4), `SUNARP_ESTADOS`, `AAP_ESTADOS` (Task 1), `calcularGarantiaFibraVencimientoStr` (Task 4)
- Produces: secciones completas de post-venta en la ficha de unidad

- [ ] **Step 1: Crear lib/actions/reclamos.ts**

```ts
// lib/actions/reclamos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { reclamoSchema, type ReclamoFormValues } from '@/lib/validations/reclamo'

export async function crearReclamo(unidadId: string, data: ReclamoFormValues) {
  const supabase = createServerClient()
  const validated = reclamoSchema.parse(data)
  const { error } = await supabase.from('reclamos').insert({ ...validated, unidad_id: unidadId })
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
}

export async function actualizarEstadoReclamo(reclamoId: string, unidadId: string, estado: 'Pendiente' | 'Resuelto') {
  const supabase = createServerClient()
  const { error } = await supabase.from('reclamos').update({ estado }).eq('id', reclamoId)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
}
```

- [ ] **Step 2: Crear lib/actions/tramites.ts**

```ts
// lib/actions/tramites.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function actualizarTramite(
  unidadId: string,
  data: {
    sunarp_estado?: string | null
    sunarp_fecha?: string | null
    aap_estado?: string | null
    aap_fecha?: string | null
  }
) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('tramites')
    .upsert({ unidad_id: unidadId, ...data }, { onConflict: 'unidad_id' })
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
}
```

- [ ] **Step 3: Crear components/unidades/sections/garantias-section.tsx**

```tsx
// components/unidades/sections/garantias-section.tsx
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function GarantiasSection({ unidad }: { unidad: any }) {
  const garantia = unidad.garantias

  if (!garantia) {
    return (
      <p className="text-sm text-gray-500">
        Las garantías se registran automáticamente al marcar la unidad como Entregada.
      </p>
    )
  }

  const inicioMoto = new Date(garantia.garantia_moto_inicio)
  const inicioFibra = new Date(garantia.garantia_fibra_inicio)
  const vencFibra = new Date(garantia.garantia_fibra_vencimiento)

  return (
    <div className="space-y-4 text-sm">
      <div className="border rounded-lg p-4 space-y-1">
        <p className="font-semibold">Garantía de moto</p>
        <p className="text-gray-600">{garantia.garantia_moto_km.toLocaleString('es-PE')} km</p>
        <p className="text-gray-500">Inicio: {format(inicioMoto, 'dd/MM/yyyy', { locale: es })}</p>
      </div>
      <div className="border rounded-lg p-4 space-y-1">
        <p className="font-semibold">Garantía de fibra</p>
        <p className="text-gray-500">Inicio: {format(inicioFibra, 'dd/MM/yyyy', { locale: es })}</p>
        <p className={`font-medium ${vencFibra < new Date() ? 'text-red-600' : 'text-green-600'}`}>
          Vencimiento: {format(vencFibra, 'dd/MM/yyyy', { locale: es })}
          {vencFibra < new Date() ? ' (vencida)' : ''}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear components/reclamos/reclamo-form.tsx**

```tsx
// components/reclamos/reclamo-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reclamoSchema, type ReclamoFormValues } from '@/lib/validations/reclamo'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function ReclamoForm({ onSubmit }: { onSubmit: (data: ReclamoFormValues) => Promise<void> }) {
  const form = useForm<ReclamoFormValues>({
    resolver: zodResolver(reclamoSchema),
    defaultValues: { tipo: 'Moto', fecha_reclamo: new Date().toISOString().split('T')[0], estado: 'Pendiente', descripcion: '', taller: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async d => { await onSubmit(d); form.reset() })} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="tipo" render={({ field }) => (
            <FormItem><FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Moto">Moto</SelectItem>
                  <SelectItem value="Fibra">Fibra</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_reclamo" render={({ field }) => (
            <FormItem><FormLabel>Fecha *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="descripcion" render={({ field }) => (
          <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="taller" render={({ field }) => (
          <FormItem><FormLabel>Taller / Fibrero</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="precio" render={({ field }) => (
          <FormItem><FormLabel>Precio (S/)</FormLabel>
            <FormControl><Input type="number" step="0.01" min="0" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? e.target.valueAsNumber : null)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>Registrar reclamo</Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 5: Crear components/unidades/sections/reclamos-section.tsx**

```tsx
// components/unidades/sections/reclamos-section.tsx
'use client'

import { useState } from 'react'
import { crearReclamo, actualizarEstadoReclamo } from '@/lib/actions/reclamos'
import { ReclamoForm } from '@/components/reclamos/reclamo-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

export function ReclamosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const reclamos: any[] = unidad.reclamos ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setMostrarForm(f => !f)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo reclamo'}
        </Button>
      </div>
      {mostrarForm && (
        <ReclamoForm onSubmit={async d => { await crearReclamo(unidad.id, d); setMostrarForm(false) }} />
      )}
      {reclamos.length === 0 && !mostrarForm && (
        <p className="text-sm text-gray-500">Sin reclamos registrados</p>
      )}
      <div className="space-y-3">
        {reclamos.map((r: any) => (
          <div key={r.id} className="border rounded-lg p-3 text-sm space-y-1">
            <div className="flex items-start justify-between">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${r.tipo === 'Moto' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{r.tipo}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${r.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.estado}</span>
            </div>
            <p>{r.descripcion}</p>
            {r.taller && <p className="text-gray-500">Taller: {r.taller}</p>}
            {r.precio && <p className="text-gray-500">Costo: {formatSoles(Number(r.precio))}</p>}
            <p className="text-gray-400">{r.fecha_reclamo}</p>
            {r.estado === 'Pendiente' && (
              <Button size="sm" variant="outline" className="h-6 text-xs"
                onClick={() => actualizarEstadoReclamo(r.id, unidad.id, 'Resuelto')}>
                Marcar resuelto
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Crear components/unidades/sections/tramites-section.tsx**

```tsx
// components/unidades/sections/tramites-section.tsx
'use client'

import { useState } from 'react'
import { actualizarTramite } from '@/lib/actions/tramites'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SUNARP_ESTADOS, AAP_ESTADOS } from '@/lib/constants'

export function TramitesSection({ unidad }: { unidad: any }) {
  const tramite = unidad.tramites
  const [sunarp, setSunarp] = useState(tramite?.sunarp_estado ?? '')
  const [sunarpFecha, setSunarpFecha] = useState(tramite?.sunarp_fecha ?? '')
  const [aap, setAap] = useState(tramite?.aap_estado ?? '')
  const [aapFecha, setAapFecha] = useState(tramite?.aap_fecha ?? '')
  const [loading, setLoading] = useState(false)

  async function handleGuardar() {
    setLoading(true)
    try {
      await actualizarTramite(unidad.id, {
        sunarp_estado: sunarp || null,
        sunarp_fecha: sunarpFecha || null,
        aap_estado: aap || null,
        aap_fecha: aapFecha || null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">SUNARP</p>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={sunarp} onValueChange={setSunarp}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Sin estado" /></SelectTrigger>
              <SelectContent>
                {SUNARP_ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input type="date" value={sunarpFecha} onChange={e => setSunarpFecha(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">AAP</p>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={aap} onValueChange={setAap}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Sin estado" /></SelectTrigger>
              <SelectContent>
                {AAP_ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input type="date" value={aapFecha} onChange={e => setAapFecha(e.target.value)} className="mt-1" />
          </div>
        </div>
      </div>
      <Button size="sm" onClick={handleGuardar} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar trámites'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Agregar secciones a la ficha de unidad**

En `app/(vendedor)/unidades/[id]/page.tsx`, añadir al array `sections`:

```tsx
import { GarantiasSection } from '@/components/unidades/sections/garantias-section'
import { ReclamosSection } from '@/components/unidades/sections/reclamos-section'
import { TramitesSection } from '@/components/unidades/sections/tramites-section'

// Agregar después de la sección 'pagos':
{ id: 'garantias', title: 'Garantías', content: <GarantiasSection unidad={unidad} /> },
{ id: 'reclamos', title: 'Reclamos', content: <ReclamosSection unidad={unidad} /> },
{ id: 'tramites', title: 'Trámites', content: <TramitesSection unidad={unidad} /> },
```

- [ ] **Step 8: Verificar en browser**

```bash
npm run dev
```

1. Unidad Entregada → sección Garantías muestra km y fechas
2. Garantía de fibra vencida → aparece texto "(vencida)" en rojo
3. Crear reclamo tipo Fibra → aparece en lista → marcar resuelto
4. Actualizar SUNARP a "En Calificación" con fecha → guardar → recargar → persistido

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: garantías, reclamos y trámites en ficha de unidad"
```

---

## Task 13: Seguimientos Post-Venta

**Files:**
- Create: `app/(vendedor)/seguimientos/page.tsx`

**Interfaces:**
- Consumes: `obtenerSeguimientosPendientes`, `marcarSeguimientoHecho` (Task 9), `calcularDiasTranscurridos` (Task 4)

- [ ] **Step 1: Crear app/(vendedor)/seguimientos/page.tsx**

```tsx
// app/(vendedor)/seguimientos/page.tsx
import { obtenerSeguimientosPendientes, marcarSeguimientoHecho } from '@/lib/actions/ventas'
import { calcularDiasTranscurridos } from '@/lib/utils/fechas'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SeguimientosPage() {
  const seguimientos = await obtenerSeguimientosPendientes()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seguimientos post-venta</h1>
      <p className="text-sm text-gray-500">
        Clientes con más de 7 días desde la venta sin seguimiento registrado.
      </p>
      {seguimientos.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-500">Sin seguimientos pendientes</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {seguimientos.map(v => {
            const dias = calcularDiasTranscurridos(new Date(v.fecha_venta))
            return (
              <div key={v.id} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{(v as any).clientes?.nombre_completo}</p>
                  <p className="text-sm text-gray-500">
                    {(v as any).unidades?.modelo} — Motor: {(v as any).unidades?.n_motor}
                  </p>
                  <p className="text-sm text-gray-400">
                    Vendido el {v.fecha_venta} · <span className="text-orange-600 font-medium">{dias} días</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/unidades/${v.unidad_id}`} className="text-sm text-blue-600 hover:underline">
                    Ver unidad
                  </Link>
                  <form action={async () => { 'use server'; await marcarSeguimientoHecho(v.id) }}>
                    <Button size="sm" type="submit" variant="outline">Hecho</Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar página de seguimientos**

```bash
npm run dev
```

1. Verificar que el badge del menú muestra el conteo de pendientes
2. Crear una venta con `fecha_venta = 8 días atrás` en Supabase directamente vía SQL:
   ```sql
   UPDATE ventas SET fecha_venta = CURRENT_DATE - INTERVAL '8 days' WHERE id = 'TU_ID'
   ```
3. Ir a `/seguimientos` → verificar que aparece la venta con "8 días"
4. Clic "Hecho" → verificar que desaparece de la lista y el badge baja a 0

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bandeja de seguimientos post-venta con badge en navegación"
```

---

## Task 14: Dashboard del Gerente

**Files:**
- Create: `lib/actions/dashboard.ts`
- Create: `components/dashboard/periodo-filter.tsx`
- Create: `components/dashboard/ventas-chart.tsx`
- Create: `components/dashboard/compras-chart.tsx`
- Create: `components/dashboard/utilidad-section.tsx`
- Create: `components/dashboard/embudo-chart.tsx`
- Create: `components/dashboard/inventario-cards.tsx`
- Create: `components/dashboard/cuentas-cobrar-table.tsx`
- Create: `app/(gerente)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `formatSoles` (Task 4), tablas `ventas`, `unidades`, `pagos`, `prospectos` via queries
- Produces: dashboard completo de solo lectura para el gerente

- [ ] **Step 1: Crear lib/actions/dashboard.ts**

```ts
// lib/actions/dashboard.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'

export interface PeriodoFilter {
  desde: string  // 'YYYY-MM-DD'
  hasta: string  // 'YYYY-MM-DD'
}

export async function getDatosVentas(periodo: PeriodoFilter) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select('precio_venta, unidades(modelo, precio_compra_moto, precio_fibra)')
    .gte('fecha_venta', periodo.desde)
    .lte('fecha_venta', periodo.hasta)
  if (error) throw new Error(error.message)
  return data
}

export async function getDatosCompras(periodo: PeriodoFilter) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('unidades')
    .select('modelo, precio_compra_moto, precio_fibra, fecha_compra')
    .gte('fecha_compra', periodo.desde)
    .lte('fecha_compra', periodo.hasta)
    .not('fecha_compra', 'is', null)
  if (error) throw new Error(error.message)
  return data
}

export async function getUtilidadPorUnidad(periodo: PeriodoFilter) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select('precio_venta, fecha_venta, clientes(nombre_completo), unidades(n_motor, modelo, precio_compra_moto, precio_fibra)')
    .gte('fecha_venta', periodo.desde)
    .lte('fecha_venta', periodo.hasta)
  if (error) throw new Error(error.message)

  return (data ?? []).map(v => {
    const costoMoto = Number((v as any).unidades?.precio_compra_moto ?? 0)
    const costoFibra = Number((v as any).unidades?.precio_fibra ?? 0)
    const utilidad = Number(v.precio_venta) - costoMoto - costoFibra
    return {
      n_motor: (v as any).unidades?.n_motor,
      modelo: (v as any).unidades?.modelo,
      cliente: (v as any).clientes?.nombre_completo,
      fecha_venta: v.fecha_venta,
      precio_venta: Number(v.precio_venta),
      costo_total: costoMoto + costoFibra,
      utilidad,
    }
  })
}

export async function getProspectosPorEtapa() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('prospectos').select('etapa')
  if (error) throw new Error(error.message)
  const conteo: Record<string, number> = {}
  ;(data ?? []).forEach(p => { conteo[p.etapa] = (conteo[p.etapa] ?? 0) + 1 })
  return conteo
}

export async function getInventario() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('unidades').select('estado_logistico, estado_comercial')
  if (error) throw new Error(error.message)
  const disponibles = (data ?? []).filter(u => !u.estado_comercial || u.estado_comercial === null)
  return {
    en_tienda: disponibles.filter(u => u.estado_logistico === 'En tienda').length,
    en_fibrero: disponibles.filter(u => u.estado_logistico === 'En fibrero').length,
    pedidas: disponibles.filter(u => u.estado_logistico === 'Pedida').length,
  }
}

export async function getCuentasPorCobrar() {
  const supabase = createServerClient()
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('id, precio_venta, estado_pago, clientes(nombre_completo), unidades(n_motor, modelo), pagos(monto)')
    .eq('tipo_venta', 'Separación')
    .neq('estado_pago', 'Pagado')
  if (error) throw new Error(error.message)

  return (ventas ?? []).map(v => {
    const pagado = ((v as any).pagos ?? []).reduce((acc: number, p: any) => acc + Number(p.monto), 0)
    return {
      id: v.id,
      cliente: (v as any).clientes?.nombre_completo,
      modelo: (v as any).unidades?.modelo,
      n_motor: (v as any).unidades?.n_motor,
      precio_venta: Number(v.precio_venta),
      pagado,
      saldo_pendiente: Number(v.precio_venta) - pagado,
    }
  })
}
```

- [ ] **Step 2: Crear components/dashboard/periodo-filter.tsx**

```tsx
// components/dashboard/periodo-filter.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

function getMesActual() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
  return { desde, hasta }
}

function getMesAnterior() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]
  return { desde, hasta }
}

export function PeriodoFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const [desde, setDesde] = useState(params.get('desde') ?? getMesActual().desde)
  const [hasta, setHasta] = useState(params.get('hasta') ?? getMesActual().hasta)

  function aplicar(d: string, h: string) {
    router.push(`/dashboard?desde=${d}&hasta=${h}`)
  }

  return (
    <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-end">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { const m = getMesActual(); setDesde(m.desde); setHasta(m.hasta); aplicar(m.desde, m.hasta) }}>
          Mes actual
        </Button>
        <Button size="sm" variant="outline" onClick={() => { const m = getMesAnterior(); setDesde(m.desde); setHasta(m.hasta); aplicar(m.desde, m.hasta) }}>
          Mes anterior
        </Button>
      </div>
      <div className="flex items-end gap-2">
        <div>
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="mt-1 w-36" />
        </div>
        <div>
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="mt-1 w-36" />
        </div>
        <Button size="sm" onClick={() => aplicar(desde, hasta)}>Aplicar</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear components/dashboard/ventas-chart.tsx**

```tsx
// components/dashboard/ventas-chart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MODELOS_MOTO } from '@/lib/constants'
import { formatSoles } from '@/lib/utils/format'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function VentasChart({ ventas }: { ventas: any[] }) {
  const data = MODELOS_MOTO.map(modelo => {
    const ventasModelo = ventas.filter((v: any) => v.unidades?.modelo === modelo)
    return {
      modelo: modelo.replace(' ', '\n'),
      cantidad: ventasModelo.length,
      monto: ventasModelo.reduce((acc: number, v: any) => acc + Number(v.precio_venta), 0),
    }
  }).filter(d => d.cantidad > 0)

  const totalCantidad = ventas.length
  const totalMonto = ventas.reduce((acc: number, v: any) => acc + Number(v.precio_venta), 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Ventas del periodo</h2>
        <div className="text-right text-sm">
          <p className="text-gray-500">{totalCantidad} unidades · {formatSoles(totalMonto)}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="modelo" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: any, name: string) => name === 'monto' ? formatSoles(v) : v} />
          <Legend />
          <Bar yAxisId="left" dataKey="cantidad" name="Cantidad" fill="#3b82f6" />
          <Bar yAxisId="right" dataKey="monto" name="Monto (S/)" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 4: Crear components/dashboard/compras-chart.tsx**

```tsx
// components/dashboard/compras-chart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatSoles } from '@/lib/utils/format'
import { MODELOS_MOTO } from '@/lib/constants'

export function ComprasChart({ compras }: { compras: any[] }) {
  const data = MODELOS_MOTO.map(modelo => {
    const items = compras.filter(c => c.modelo === modelo)
    return {
      modelo,
      motos: items.reduce((acc, c) => acc + Number(c.precio_compra_moto ?? 0), 0),
      fibra: items.reduce((acc, c) => acc + Number(c.precio_fibra ?? 0), 0),
    }
  }).filter(d => d.motos > 0 || d.fibra > 0)

  const totalMotos = compras.reduce((acc, c) => acc + Number(c.precio_compra_moto ?? 0), 0)
  const totalFibra = compras.reduce((acc, c) => acc + Number(c.precio_fibra ?? 0), 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Compras del periodo</h2>
        <p className="text-sm text-gray-500">{formatSoles(totalMotos + totalFibra)} total</p>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-gray-500">Motos: <strong>{formatSoles(totalMotos)}</strong></span>
        <span className="text-gray-500">Fibra: <strong>{formatSoles(totalFibra)}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="modelo" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: any) => formatSoles(v)} />
          <Legend />
          <Bar dataKey="motos" name="Motos" stackId="a" fill="#3b82f6" />
          <Bar dataKey="fibra" name="Fibra" stackId="a" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 5: Crear components/dashboard/utilidad-section.tsx**

```tsx
// components/dashboard/utilidad-section.tsx
import { formatSoles } from '@/lib/utils/format'

export function UtilidadSection({ utilidades }: { utilidades: any[] }) {
  const totalUtilidad = utilidades.reduce((acc, u) => acc + u.utilidad, 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Utilidad del periodo</h2>
        <p className={`text-xl font-bold ${totalUtilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatSoles(totalUtilidad)}
        </p>
      </div>
      {utilidades.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-1">Motor</th>
                <th className="text-left">Modelo</th>
                <th className="text-left">Cliente</th>
                <th className="text-right">Venta</th>
                <th className="text-right">Costo</th>
                <th className="text-right">Utilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {utilidades.map(u => (
                <tr key={u.n_motor}>
                  <td className="py-2 font-mono text-xs">{u.n_motor}</td>
                  <td className="text-xs">{u.modelo}</td>
                  <td className="text-xs">{u.cliente}</td>
                  <td className="text-right">{formatSoles(u.precio_venta)}</td>
                  <td className="text-right text-gray-500">{formatSoles(u.costo_total)}</td>
                  <td className={`text-right font-medium ${u.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatSoles(u.utilidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Crear components/dashboard/embudo-chart.tsx**

```tsx
// components/dashboard/embudo-chart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ETAPAS_PROSPECTO } from '@/lib/constants'

const COLORS_ETAPA: Record<string, string> = {
  'Interesado': '#3b82f6',
  'Cotizó': '#f59e0b',
  'Dio adelanto': '#f97316',
  'Vendido': '#10b981',
  'Desistió': '#6b7280',
}

export function EmbudoChart({ prospectosPorEtapa }: { prospectosPorEtapa: Record<string, number> }) {
  const data = ETAPAS_PROSPECTO.map(e => ({ etapa: e, cantidad: prospectosPorEtapa[e] ?? 0 }))

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold">Embudo de prospectos</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="etapa" tick={{ fontSize: 11 }} width={90} />
          <Tooltip />
          <Bar dataKey="cantidad" name="Prospectos">
            {data.map((entry) => (
              <Cell key={entry.etapa} fill={COLORS_ETAPA[entry.etapa] ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 7: Crear components/dashboard/inventario-cards.tsx**

```tsx
// components/dashboard/inventario-cards.tsx
export function InventarioCards({ inventario }: { inventario: { en_tienda: number; en_fibrero: number; pedidas: number } }) {
  const items = [
    { label: 'En tienda', count: inventario.en_tienda, color: 'text-blue-600 bg-blue-50' },
    { label: 'En fibrero', count: inventario.en_fibrero, color: 'text-orange-600 bg-orange-50' },
    { label: 'Pedidas', count: inventario.pedidas, color: 'text-yellow-600 bg-yellow-50' },
  ]

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold">Inventario disponible</h2>
      <div className="grid grid-cols-3 gap-3">
        {items.map(i => (
          <div key={i.label} className={`rounded-lg p-3 text-center ${i.color}`}>
            <p className="text-3xl font-bold">{i.count}</p>
            <p className="text-sm mt-1">{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Crear components/dashboard/cuentas-cobrar-table.tsx**

```tsx
// components/dashboard/cuentas-cobrar-table.tsx
import { formatSoles } from '@/lib/utils/format'

export function CuentasCobrarTable({ cuentas }: { cuentas: any[] }) {
  const totalPendiente = cuentas.reduce((acc, c) => acc + c.saldo_pendiente, 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Cuentas por cobrar</h2>
        <p className="text-sm font-medium text-red-600">{formatSoles(totalPendiente)} pendiente</p>
      </div>
      {cuentas.length === 0 ? (
        <p className="text-sm text-gray-500">Sin cuentas por cobrar</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-1">Cliente</th>
                <th className="text-left">Modelo</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Pagado</th>
                <th className="text-right font-medium text-red-600">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cuentas.map(c => (
                <tr key={c.id}>
                  <td className="py-2">{c.cliente}</td>
                  <td className="text-xs text-gray-500">{c.modelo}</td>
                  <td className="text-right">{formatSoles(c.precio_venta)}</td>
                  <td className="text-right text-green-600">{formatSoles(c.pagado)}</td>
                  <td className="text-right font-medium text-red-600">{formatSoles(c.saldo_pendiente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 9: Crear app/(gerente)/dashboard/page.tsx**

```tsx
// app/(gerente)/dashboard/page.tsx
import { getDatosVentas, getDatosCompras, getUtilidadPorUnidad, getProspectosPorEtapa, getInventario, getCuentasPorCobrar } from '@/lib/actions/dashboard'
import { PeriodoFilter } from '@/components/dashboard/periodo-filter'
import { VentasChart } from '@/components/dashboard/ventas-chart'
import { ComprasChart } from '@/components/dashboard/compras-chart'
import { UtilidadSection } from '@/components/dashboard/utilidad-section'
import { EmbudoChart } from '@/components/dashboard/embudo-chart'
import { InventarioCards } from '@/components/dashboard/inventario-cards'
import { CuentasCobrarTable } from '@/components/dashboard/cuentas-cobrar-table'

interface Props { searchParams: { desde?: string; hasta?: string } }

function getPeriodoPorDefecto() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
  return { desde, hasta }
}

export default async function DashboardPage({ searchParams }: Props) {
  const defecto = getPeriodoPorDefecto()
  const periodo = { desde: searchParams.desde ?? defecto.desde, hasta: searchParams.hasta ?? defecto.hasta }

  const [ventas, compras, utilidades, prospectos, inventario, cuentas] = await Promise.all([
    getDatosVentas(periodo),
    getDatosCompras(periodo),
    getUtilidadPorUnidad(periodo),
    getProspectosPorEtapa(),
    getInventario(),
    getCuentasPorCobrar(),
  ])

  return (
    <div className="space-y-6">
      <PeriodoFilter />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VentasChart ventas={ventas} />
        <ComprasChart compras={compras} />
      </div>
      <UtilidadSection utilidades={utilidades} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmbudoChart prospectosPorEtapa={prospectos} />
        <InventarioCards inventario={inventario} />
      </div>
      <CuentasCobrarTable cuentas={cuentas} />
    </div>
  )
}
```

- [ ] **Step 10: Verificar dashboard completo en browser**

```bash
npm run dev
```

Login como `gerente@milenium.pe`:
1. Verificar redirección automática a `/dashboard`
2. Verificar que los 6 bloques del dashboard se renderizan sin errores
3. Cambiar periodo a "Mes anterior" → verificar que las cifras cambian
4. Aplicar rango personalizado de fechas → verificar que filtra correctamente
5. Intentar acceder a `/unidades` como gerente → verificar redirección a `/dashboard`

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: dashboard gerente con gráficos, utilidad, inventario y cuentas por cobrar"
```

---

## Autorrevisar

Revisión final del plan contra el spec:

| Requisito del spec | Task |
|--------------------|------|
| Login email/password con roles | Task 3 |
| 5 modelos de moto | Task 1 (constants.ts) |
| DNI 8 dígitos | Task 4 (Zod schema) |
| n_motor y n_chasis únicos | Task 2 (UNIQUE constraint) + Task 7 (error handling) |
| tipo_ingreso: Stock / Bajo pedido | Task 7 (unidad-form) |
| estado_logistico manual (3 estados) | Task 7 + Task 8 |
| estado_comercial automático Separada | Task 9 (pagos.ts) |
| estado_comercial automático Vendida | Task 9 (pagos.ts) |
| estado_comercial manual Entregada | Task 8 (marcar-entregada-button) |
| fecha_entrega no anterior a fecha_venta | Task 8 (marcarEntregada action) |
| Pagos con n_recibo obligatorio | Task 4 (pagoSchema) + Task 9 (pago-form) |
| Saldo calculado automáticamente | Task 9 (pagos-section) |
| Garantía moto 24,000 km | Task 8 (marcarEntregada) |
| Garantía fibra vence +1 mes | Task 4 (calcularGarantiaFibraVencimiento) + Task 8 |
| Reclamos con taller | Task 12 |
| Trámites SUNARP + AAP | Task 12 |
| Trámite creado automáticamente al vender | Task 9 (crearVenta action) |
| Alerta 7 días seguimiento | Task 9 (ventas.ts) + Task 13 |
| Badge de seguimientos en nav | Task 5 (layout.tsx) |
| Kanban prospectos (5 etapas) | Task 10 |
| Kanban desktop columnas / mobile tabs | Task 10 (kanban-board.tsx) |
| Conversión prospecto → venta (3 pasos) | Task 11 |
| Pre-fill nombre y teléfono en conversión | Task 11 (convertir-venta-flow.tsx) |
| Filtro unidades por modelo en conversión | Task 11 |
| Prospecto marcado Vendido automáticamente | Task 11 (convertirEnVenta) |
| Dashboard gerente: ventas + modelo | Task 14 |
| Dashboard: compras (motos + fibra) | Task 14 |
| Dashboard: utilidad por unidad y total | Task 14 |
| Dashboard: embudo prospectos | Task 14 |
| Dashboard: inventario (3 contadores) | Task 14 |
| Dashboard: cuentas por cobrar | Task 14 |
| Filtro período con accesos rápidos | Task 14 (periodo-filter) |
| Gerente solo ve dashboard | Task 3 (middleware) |
| Vendedor no ve dashboard | Task 3 (middleware) |
| Formato S/ peruano | Task 4 (formatSoles) + constants |
| Responsivo móvil y escritorio | Tasks 5, 7, 10 |
| Acordeón en ficha de unidad mobile | Task 8 (Accordion de shadcn) |
