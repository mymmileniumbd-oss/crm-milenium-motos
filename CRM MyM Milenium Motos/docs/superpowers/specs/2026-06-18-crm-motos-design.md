# CRM MyM Milenium Motors — Documento de Diseño

**Fecha:** 2026-06-18  
**Proyecto:** CRM para venta de motos TVS — 1 tienda, Perú  
**Stack:** Next.js 14 (App Router) + Supabase (PostgreSQL + Auth) + Vercel

---

## 1. Contexto del negocio

- Venta de motos TVS a usuarios finales en Perú.
- Todas las motos incluyen un techo/fibra instalado por un proveedor externo ("fibrero").
- 5 modelos: **Deluxe GS**, **Deluxe GLP**, **Duramax GS**, **Duramax GLP**, **Duramax GNV**.
- Moneda: soles peruanos (S/), formato `S/ 1,234.56` usando `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- 1 tienda. 3 usuarios: 2 vendedores + 1 gerente.
- Acceso desde PC y celular (diseño responsivo). Datos compartidos entre los 3 usuarios.

### Dos formas de venta

| Tipo | Descripción |
|------|-------------|
| **Bajo pedido** | El cliente paga o adelanta primero; recién entonces se encarga la moto. Los pagos pueden registrarse en cualquier etapa logística (incluso con la moto en el fibrero). |
| **Stock** | La moto ya está en tienda. El cliente la compra al contado o la separa con un adelanto. |

Una unidad puede existir en el sistema **sin cliente asignado** (caso stock) o **con cliente desde el inicio** (caso bajo pedido).

---

## 2. Arquitectura

```
Next.js 14 (App Router)
├── Server Components   → data fetching directo a Supabase (server client)
├── Server Actions      → mutaciones (crear, editar, cambios de estado)
└── Client Components   → interactividad (forms, filtros, gráficos)

Supabase
├── PostgreSQL          → base de datos
├── Auth                → login email/password, sesión por cookie SSR
└── Row Level Security  → vendedor accede a todo; gerente solo dashboard

Despliegue: Vercel
```

### Librerías

| Librería | Uso |
|----------|-----|
| `@supabase/ssr` | Auth con cookies en App Router |
| `shadcn/ui` + Tailwind CSS | Componentes responsivos |
| `recharts` | Gráficos del dashboard |
| `react-hook-form` + `zod` | Formularios y validaciones |
| `date-fns` | Cálculo de vencimiento de garantía y alerta de 7 días |

---

## 3. Roles y permisos

| Rol | Puede hacer |
|-----|------------|
| **Vendedor** | Registra y edita todo: clientes, prospectos, unidades, ventas, pagos, reclamos, trámites. **No ve `/dashboard`**. |
| **Gerente** | Solo lectura del **dashboard**. No ve ni accede a pantallas de registro/edición. |

El middleware de Next.js verifica rol en cada request y redirige si el usuario no tiene acceso.

- Vendedor entra → redirige a `/unidades`
- Gerente entra → redirige a `/dashboard`

---

## 4. Modelo de datos

### `usuarios`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | Supabase Auth UID |
| nombre | text | |
| email | text | |
| rol | enum | `vendedor` \| `gerente` |

---

### `clientes`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre_completo | text NOT NULL | |
| dni | char(8) NOT NULL | Validado: exactamente 8 dígitos numéricos |
| direccion | text | |
| telefono | text | |
| correo | text | |
| created_at | timestamptz | default now() |

---

### `prospectos`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text NOT NULL | |
| telefono | text | |
| modelo_interes | enum | Los 5 modelos |
| origen | enum | `Facebook` \| `Referido` \| `Visita a tienda` \| `Otro` |
| etapa | enum | `Interesado` \| `Cotizó` \| `Dio adelanto` \| `Vendido` \| `Desistió` |
| notas | text | |
| vendedor_id | uuid FK → usuarios | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | actualizado en cada cambio |

---

### `unidades`

Entidad central del sistema. Puede existir sin cliente asignado.

**Datos generales:**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| n_motor | text UNIQUE NOT NULL | |
| n_chasis | text UNIQUE NOT NULL | |
| modelo | enum NOT NULL | Los 5 modelos |
| tipo_ingreso | enum NOT NULL | `Bajo pedido` \| `Stock` |
| estado_logistico | enum NOT NULL | `Pedida` \| `En fibrero` \| `En tienda` — **siempre manual** |
| estado_comercial | enum NULL | `Separada` \| `Vendida` \| `Entregada` — automático/manual (ver reglas) |
| dua_item | text | Formato "N° DUA - ITEM" |
| cliente_id | uuid FK → clientes NULL | Vacío si es stock sin cliente aún |
| fecha_entrega | date NULL | Registrada al marcar `Entregada` manualmente |
| created_at | timestamptz | default now() |

**Datos de compra de la moto:**

| Campo | Tipo |
|-------|------|
| factura_compra_moto | text |
| precio_compra_moto | numeric(12,2) |
| fecha_compra | date |
| fecha_pago_compra | date |
| n_operacion_pago_compra | text |

**Datos de fibra:**

| Campo | Tipo | Notas |
|-------|------|-------|
| proveedor_fibra | text | Nombre del fibrero |
| fecha_llegada_fibrero | date | |
| fecha_pago_fibra | date | |
| n_operacion_fibra | text | |
| factura_fibra | text | |
| precio_fibra | numeric(12,2) | |

**Llegada a tienda:**

| Campo | Tipo |
|-------|------|
| fecha_llegada_tienda | date |

---

### `ventas`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| unidad_id | uuid FK → unidades NOT NULL | |
| cliente_id | uuid FK → clientes NOT NULL | |
| vendedor_id | uuid FK → usuarios NOT NULL | |
| tipo_venta | enum | `Contado` \| `Separación` |
| fecha_venta | date NOT NULL | |
| precio_venta | numeric(12,2) NOT NULL | |
| documento_tipo | enum | `Factura` \| `Boleta` |
| documento_numero | text | |
| estado_pago | enum | `Pendiente` \| `Parcial` \| `Pagado` — calculado automáticamente |
| seguimiento_7dias_hecho | boolean | default false |
| created_at | timestamptz | default now() |

---

### `pagos`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| venta_id | uuid FK → ventas NOT NULL | |
| fecha_pago | date NOT NULL | |
| monto | numeric(12,2) NOT NULL | >= 0.01 |
| n_operacion | text | |
| n_recibo | text NOT NULL | Obligatorio; número del recibo emitido |
| tipo | enum | `Adelanto` \| `Saldo` \| `Contado` |
| created_at | timestamptz | default now() |

---

### `garantias`

Se crea automáticamente al marcar una unidad como `Entregada`.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| unidad_id | uuid FK → unidades NOT NULL | |
| garantia_moto_km | integer | Fijo: 24000 |
| garantia_moto_inicio | date | = `unidad.fecha_entrega` |
| garantia_fibra_inicio | date | = `unidad.fecha_entrega` |
| garantia_fibra_vencimiento | date | = inicio + 1 mes (calculado al insertar) |

---

### `reclamos`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| unidad_id | uuid FK → unidades NOT NULL | |
| tipo | enum | `Moto` \| `Fibra` |
| fecha_reclamo | date NOT NULL | |
| descripcion | text | |
| estado | enum | `Pendiente` \| `Resuelto` |
| taller | text | Nombre del taller y/o fibrero que atiende |
| precio | numeric(12,2) | |
| created_at | timestamptz | default now() |

---

### `tramites`

Un registro por unidad. Se crea automáticamente (con estados vacíos/null) cuando se registra la venta asociada a la unidad. El vendedor actualiza los estados SUNARP y AAP desde la ficha de unidad.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| unidad_id | uuid FK → unidades NOT NULL | |
| sunarp_estado | enum | `Ingreso` \| `En Calificación` \| `Inscrito` |
| sunarp_fecha | date NULL | Fecha del último cambio de estado SUNARP |
| aap_estado | enum | `Pago` \| `Recojo` |
| aap_fecha | date NULL | Fecha del último cambio de estado AAP |
| created_at | timestamptz | default now() |

---

## 5. Máquina de estados de la unidad

```
estado_logistico (siempre manual):
  Pedida → En fibrero → En tienda

estado_comercial:
  null/Disponible
    → Separada    [automático: primer pago tipo Adelanto]
    → Vendida     [automático: suma(pagos.monto) >= venta.precio_venta]
    → Entregada   [manual: vendedor registra fecha_entrega]
```

Los dos estados son completamente independientes. Ambos se muestran en listado y ficha de unidad. Una unidad puede estar `En fibrero` + `Separada` simultáneamente.

**`estado_comercial = null`** se muestra en pantalla como "Disponible" (badge gris).

---

## 6. Reglas de negocio y triggers (implementados en Server Actions)

### Al insertar o actualizar un pago

```
suma_pagos = SELECT SUM(monto) FROM pagos WHERE venta_id = X

if suma_pagos = 0 or null:
    venta.estado_pago = 'Pendiente'
elif suma_pagos < precio_venta:
    venta.estado_pago = 'Parcial'
else:
    venta.estado_pago = 'Pagado'
    unidad.estado_comercial = 'Vendida'

if pago.tipo = 'Adelanto' AND es el primer pago:
    unidad.estado_comercial = 'Separada'  (solo si aún no es Vendida/Entregada)
```

### Al marcar unidad como Entregada (manual)

```
unidad.estado_comercial = 'Entregada'
unidad.fecha_entrega = fecha ingresada por vendedor
INSERT INTO garantias (
  unidad_id, garantia_moto_km = 24000,
  garantia_moto_inicio = fecha_entrega,
  garantia_fibra_inicio = fecha_entrega,
  garantia_fibra_vencimiento = fecha_entrega + 1 mes
)
```

### Validaciones (Zod + Server Actions)

| Campo | Regla |
|-------|-------|
| `clientes.dni` | Exactamente 8 dígitos numéricos |
| `unidades.n_motor` | Único (UNIQUE constraint en BD) |
| `unidades.n_chasis` | Único (UNIQUE constraint en BD) |
| `pagos.monto` | >= 0.01 |
| `ventas.precio_venta`, `precio_compra_moto`, `precio_fibra` | >= 0 |
| `unidad.fecha_entrega` | No puede ser anterior a `venta.fecha_venta` |
| `pagos.n_recibo` | Obligatorio (NOT NULL + validación en form) |

---

## 7. Alerta de seguimiento post-venta (7 días)

Query para la bandeja `/seguimientos` y el badge del menú del vendedor:

```sql
SELECT v.*, u.modelo, u.n_motor, c.nombre_completo
FROM ventas v
JOIN unidades u ON u.id = v.unidad_id
JOIN clientes c ON c.id = v.cliente_id
WHERE v.fecha_venta <= CURRENT_DATE - INTERVAL '7 days'
  AND v.seguimiento_7dias_hecho = false
ORDER BY v.fecha_venta ASC
```

El badge del menú muestra el conteo. Se actualiza en cada carga de página (sin tiempo real — suficiente para 3 usuarios).

---

## 8. Conversión de prospecto a venta

Flujo en 3 pasos desde `/prospectos/[id]`:

1. **Crear cliente**: formulario pre-rellenado con `prospecto.nombre` → `nombre_completo` y `prospecto.telefono`. Vendedor completa DNI, dirección y correo.
2. **Asignar unidad**: selector filtrado por `modelo = prospecto.modelo_interes` y `estado_comercial IS NULL` (disponibles). El vendedor puede cambiar el modelo manualmente.
3. **Registrar venta**: tipo, precio, documento.

Al guardar: se crea el cliente, se crea la venta, y `prospecto.etapa` se actualiza automáticamente a `Vendido`.

---

## 9. Pantallas y rutas

### Rutas

```
/login                     → pública
/                          → redirige según rol

— Vendedor —
/unidades                  → listado de unidades
/unidades/nueva            → registrar unidad
/unidades/[id]             → ficha completa
/clientes                  → listado de clientes
/clientes/nuevo            → registrar cliente
/clientes/[id]             → ficha de cliente (datos + unidades/ventas asociadas)
/prospectos                → tablero kanban por etapa
/prospectos/nuevo          → registrar prospecto
/prospectos/[id]           → editar / convertir en venta
/seguimientos              → bandeja de seguimientos post-venta

— Gerente —
/dashboard                 → indicadores y gráficos (solo lectura)
```

### Navegación

- **Móvil**: barra de navegación inferior con íconos (máximo 5 items).
- **Escritorio**: sidebar izquierdo colapsable.
- Menú vendedor: Unidades · Clientes · Prospectos · Seguimientos (badge con conteo).
- Menú gerente: solo Dashboard.

---

### Detalle de pantallas clave

#### `/unidades` — Listado

- Tabla/tarjetas responsivas.
- Filtros: modelo (5 opciones), estado_logistico, estado_comercial, tipo_ingreso.
- Columnas: n_motor, modelo, tipo_ingreso, estado_logistico (badge), estado_comercial (badge color), cliente asignado.
- Botón "Nueva unidad".

#### `/unidades/[id]` — Ficha de unidad

Organizada en secciones colapsables:

1. **Datos generales**: n_motor, n_chasis, modelo, tipo_ingreso, DUA, cliente (con link)
2. **Estados**: estado_logistico (selector manual) + estado_comercial (automático, con botón "Marcar Entregada" cuando aplica)
3. **Compra de moto**: factura, precio, fechas, operación
4. **Fibra**: proveedor, fechas, factura, precio
5. **Llegada a tienda**: fecha
6. **Venta**: tipo, fecha, precio, documento, estado de pago (calculado)
7. **Pagos**: tabla de pagos + saldo pendiente calculado + botón "Registrar pago"
8. **Garantías**: moto (24,000 km, desde fecha entrega) + fibra (vencimiento calculado)
9. **Reclamos**: lista + botón "Nuevo reclamo"
10. **Trámites**: SUNARP (selector + fecha) + AAP (selector + fecha)

#### `/prospectos` — Tablero Kanban

- 5 columnas: Interesado · Cotizó · Dio adelanto · Vendido · Desistió.
- Tarjetas: nombre, modelo de interés, teléfono.
- Columna "Vendido": botón "Convertir en venta".
- **Escritorio**: drag-and-drop entre columnas para cambiar etapa.
- **Móvil**: tabs horizontales (una por etapa); cambio de etapa mediante selector dentro de la tarjeta del prospecto.

#### `/seguimientos` — Bandeja post-venta

- Lista de ventas con 7+ días sin seguimiento.
- Columnas: cliente, modelo, n_motor, fecha_venta, días transcurridos.
- Botón "Marcar como hecho" por fila.

#### `/dashboard` — Gerente (solo lectura)

**Filtro de periodo** (superior, afecta todos los gráficos):
- Accesos rápidos: "Mes actual" / "Mes anterior"
- Selector: mes + año
- Rango personalizado: fecha inicio – fecha fin

**Secciones:**
1. **Ventas**: cantidad y monto por modelo (barras agrupadas)
2. **Compras**: costo motos + costo fibra por periodo (barras apiladas)
3. **Utilidad**: `precio_venta − (precio_compra_moto + precio_fibra)` por unidad (tabla) y total del periodo (número destacado)
4. **Embudo de prospectos**: cantidad por etapa (barras horizontales)
5. **Inventario**: 3 contadores (En tienda / En fibrero / Pedidas)
6. **Cuentas por cobrar**: tabla de ventas tipo Separación con saldo > 0 (cliente, modelo, monto pendiente)

---

## 10. Estructura de archivos del proyecto

```
/
├── app/
│   ├── (auth)/login/           → página de login
│   ├── (vendedor)/
│   │   ├── unidades/
│   │   ├── clientes/
│   │   ├── prospectos/
│   │   └── seguimientos/
│   ├── (gerente)/
│   │   └── dashboard/
│   ├── layout.tsx              → layout raíz con proveedor de sesión
│   └── middleware.ts           → guards de rol
├── components/
│   ├── ui/                     → shadcn/ui components
│   ├── unidades/               → componentes específicos de unidades
│   ├── prospectos/             → kanban y tarjetas
│   └── dashboard/              → gráficos y cards
├── lib/
│   ├── supabase/               → clients (server, browser, middleware)
│   ├── actions/                → Server Actions por dominio
│   ├── validations/            → schemas Zod
│   └── utils/                  → formatSoles, calcularEstadoPago, etc.
└── supabase/
    └── migrations/             → SQL de creación de tablas y enums
```

---

## 11. Decisiones de diseño UX

- Interfaz completamente en español.
- Todos los montos en S/ con formato peruano.
- `estado_comercial = null` se muestra como badge "Disponible" (gris).
- Badges de color para estados: logístico (azul) y comercial (verde/naranja/rojo).
- Formularios con validación en línea (error inmediato bajo el campo).
- En móvil, la ficha de unidad usa acordeón (secciones colapsables) para no sobrecargar la pantalla.
- El kanban de prospectos en móvil muestra una columna a la vez con navegación por tabs.
