# Panel del Vendedor — Documento de Diseño

**Fecha:** 2026-06-30
**Proyecto:** CRM MyM Milenium Motors
**Alcance:** Dashboard operativo diario para el rol `vendedor` (pantalla de inicio al hacer login)

---

## 1. Contexto y decisiones de alcance

Este documento describe el Panel del Vendedor: una pantalla de inicio operativa que reemplaza `/unidades` como destino de login del vendedor. El panel consolida las alertas, el embudo de ventas, la cartera activa y el inventario en una sola vista.

### Lo que queda FUERA de este diseño

| Descartado | Motivo |
|---|---|
| Historial de movimientos de contactos | No existe tabla `actividad` en el esquema; requiere decisión de arquitectura separada |
| Alerta de separaciones próximas a vencer | No existe campo `fecha_limite_pago` en el esquema |
| Métrica "Cotizaciones enviadas" en el embudo | La etapa `Cotizó` fue eliminada del sistema |
| Comparativas entre vendedores / rankings | Fuera del alcance por requisito explícito |

---

## 2. Ruta y flujo de entrada

**Nueva ruta:** `app/(vendedor)/panel/page.tsx`

**Cambios de redirección:**
- `app/page.tsx`: el redirect del vendedor cambia de `/unidades` → `/panel`
- `middleware.ts`: misma actualización de redirección

**Navegación:**
- `components/nav/sidebar.tsx`: se agrega "Panel" como primer ítem (ícono `LayoutDashboard`)
- `components/nav/bottom-nav.tsx`: misma adición como primer ítem
- El resto de la navegación (`Unidades · Clientes · Prospectos · Seguimientos`) no cambia

---

## 3. Arquitectura de la página

Todos los datos se obtienen en el servidor. El selector de período del embudo usa URL search params, igual que los filtros existentes de ventas/trámites/garantías.

```
app/(vendedor)/panel/page.tsx         ← async Server Component, lee searchParams
├── PageHeader "Panel"
├── <Suspense fallback=<Skeleton>>
│   └── AlertasSection                ← async Server Component
├── <Suspense fallback=<Skeleton>>
│   └── EmbudoSection                 ← async Server Component, recibe periodo
├── <Suspense fallback=<Skeleton>>
│   └── CarteraSection                ← async Server Component
└── <Suspense fallback=<Skeleton>>
    └── InventarioSection             ← async Server Component
```

Las cuatro secciones se inician en paralelo (cada Suspense es independiente). Si una query tarda, las demás ya terminaron y se muestran.

**Archivo de acciones:** `lib/actions/panel.ts` — contiene todas las queries del panel. No reutiliza `lib/actions/dashboard.ts` (ese es del gerente y tiene estructura diferente).

**Componentes nuevos:** `components/panel/` (directorio dedicado, no mezclar con `components/dashboard/` del gerente).

---

## 4. Constantes configurables

Se agregan en `lib/constants.ts`:

```ts
export const DIAS_LEAD_SIN_CONTACTAR = 2   // alerta de leads
// DIAS_SEGUIMIENTO_POSTVENTA = 7 ya existe implícitamente en la lógica de seguimientos
```

---

## 5. Sección 1 — Alertas de acción inmediata

### 5.1 Seguimientos post-venta pendientes

**Condición:** unidades con `fecha_entrega IS NOT NULL AND fecha_entrega <= hoy - 7 días AND ventas.seguimiento_7dias_hecho = false`.

**Query conceptual:**
```sql
SELECT u.id, u.modelo, u.n_motor, u.fecha_entrega,
       c.nombre_completo,
       (CURRENT_DATE - u.fecha_entrega) AS dias_transcurridos
FROM unidades u
JOIN ventas v ON v.unidad_id = u.id
JOIN clientes c ON c.id = u.cliente_id
WHERE u.fecha_entrega IS NOT NULL
  AND u.fecha_entrega <= CURRENT_DATE - INTERVAL '7 days'
  AND v.seguimiento_7dias_hecho = false
ORDER BY u.fecha_entrega ASC
```

**UI:** lista de filas, cada una con:
- Nombre del cliente
- Modelo + N° motor
- Badge rojo con "X días" desde entrega
- Fila completa clickeable → `/unidades/[id]`

**Estado vacío:** chip verde con texto "Sin seguimientos pendientes".

### 5.2 Leads sin contactar

**Condición:** `prospectos WHERE etapa NOT IN ('Vendido', 'Desistió') AND updated_at <= hoy - DIAS_LEAD_SIN_CONTACTAR`.

**Query conceptual:**
```sql
SELECT p.id, p.nombre, p.telefono, p.etapa, p.updated_at,
       (CURRENT_DATE - p.updated_at::date) AS dias_sin_contactar
FROM prospectos p
WHERE p.etapa NOT IN ('Vendido', 'Desistió')
  AND p.updated_at <= NOW() - INTERVAL '2 days'
ORDER BY p.updated_at ASC
```

**UI:** lista de filas, cada una con:
- Nombre del prospecto
- Etapa actual (badge)
- Badge naranja con "X días sin actualizar"
- Fila completa clickeable → `/prospectos/[id]`

**Estado vacío:** chip verde con texto "Sin leads pendientes de contacto".

### 5.3 Contenedor de alertas

Si **ambas** listas están vacías: se muestra una sola card verde "Todo al día — sin alertas pendientes".

Si hay alertas: cada tipo en su propia card con título y lista interior.

---

## 6. Sección 2 — Embudo del período

### 6.1 Selector de período

Cliente Component (`components/panel/periodo-selector.tsx`) que empuja `?periodo=dia|semana|mes` a la URL via `router.push`. Default: `dia`.

Definición de rangos (calculados en el servidor):
- `dia` → hoy (00:00 a 23:59:59)
- `semana` → lunes al domingo de la semana calendario en curso
- `mes` → primer al último día del mes en curso

### 6.2 Métricas

| Métrica | Query | Campo fecha |
|---|---|---|
| Leads recibidos | `COUNT(prospectos)` en período | `prospectos.created_at` |
| Dieron adelanto | `COUNT(ventas WHERE tipo_venta = 'Separación')` en período | `ventas.fecha_venta` |
| Ventas cerradas | `COUNT(ventas)` en período | `ventas.fecha_venta` |
| Tasa de conversión | `ventas_cerradas / leads_recibidos * 100` | — |

Si `leads_recibidos = 0`, la tasa muestra `—` (sin división por cero).

### 6.3 UI

Cuatro `Card` de shadcn/ui en fila (responsivo: 2×2 en móvil, 4×1 en desktop):
- Número grande en `font-mono tabular-nums`
- Etiqueta debajo en texto secundario
- La tasa de conversión usa color diferenciado (azul primario)

---

## 7. Sección 3 — Cartera de clientes en proceso

Tres sub-tablas en acordeón colapsable (shadcn `Accordion type="multiple"`), abiertas por defecto. En móvil el acordeón evita el scroll excesivo.

### 7.1 Unidades separadas

**Query:** `unidades WHERE estado_comercial = 'Separada'` + clientes + ventas + pagos.

**Cálculo de saldo:** `precio_venta - SUM(pagos.monto)` por unidad (en el servidor).

| Columna | Fuente |
|---|---|
| Cliente | `clientes.nombre_completo` |
| Modelo | `unidades.modelo` |
| N° motor | `unidades.n_motor` |
| Precio venta | `ventas.precio_venta` |
| Pagado | `SUM(pagos.monto)` |
| Saldo pendiente | calculado |
| Días desde venta | `CURRENT_DATE - ventas.fecha_venta` |
| Link | → `/unidades/[id]` |

Los montos usan `formatSoles()`. Días desde venta es numérico.

**Estado vacío:** "Sin unidades separadas".

### 7.2 Ventas pendientes de entrega

**Query:** `unidades WHERE estado_comercial = 'Vendida'` + clientes.

Por definición del esquema: si `estado_comercial = 'Vendida'` entonces `fecha_entrega IS NULL`.

| Columna | Fuente |
|---|---|
| Cliente | `clientes.nombre_completo` |
| Modelo | `unidades.modelo` |
| N° motor | `unidades.n_motor` |
| Fecha venta | `ventas.fecha_venta` |
| Link | → `/unidades/[id]` |

**Estado vacío:** "Sin ventas pendientes de entrega".

### 7.3 Entregadas con trámite pendiente

**Query:** `unidades WHERE estado_comercial = 'Entregada'` + tramites WHERE `sunarp_estado IS DISTINCT FROM 'Inscrito' OR aap_estado IS DISTINCT FROM 'Recojo'`. Incluye unidades cuyo trámite tiene estados NULL (= no iniciado).

| Columna | Fuente |
|---|---|
| Cliente | `clientes.nombre_completo` |
| Modelo | `unidades.modelo` |
| N° motor | `unidades.n_motor` |
| SUNARP | `tramites.sunarp_estado` como badge (NULL → "Sin iniciar") |
| AAP | `tramites.aap_estado` como badge (NULL → "Sin iniciar") |
| Link | → `/unidades/[id]` |

Reutiliza `EstadoBadge` de `components/unidades/estado-badges.tsx`.

**Estado vacío:** "Sin trámites pendientes".

---

## 8. Sección 4 — Disponibilidad de inventario

### 8.1 Unidades disponibles

**Query:** `unidades WHERE estado_comercial IS NULL AND estado_logistico = 'En tienda'` GROUP BY `modelo`.

Muestra los **5 modelos siempre**, incluso con count = 0.

UI: fila de 5 chips/badges (uno por modelo) con el conteo. En móvil: lista vertical.

### 8.2 Unidades en camino

**Query:** `unidades WHERE estado_logistico IN ('Pedida', 'En fibrero')` GROUP BY `modelo`, `estado_logistico`.

Solo muestra modelos con al menos 1 unidad en alguno de los dos estados.

UI: tabla con columnas Modelo · Pedidas · En fibrero.

**Estado vacío (todo el grupo):** "Sin unidades en camino".

---

## 9. Mapa de archivos

```
app/(vendedor)/panel/
└── page.tsx                            ← página principal (nuevo)

components/panel/
├── alertas-section.tsx                 ← async Server Component (nuevo)
├── periodo-selector.tsx                ← Client Component, botones día/semana/mes (nuevo)
├── embudo-section.tsx                  ← async Server Component (nuevo)
├── cartera-section.tsx                 ← async Server Component (nuevo)
└── inventario-section.tsx             ← async Server Component (nuevo)

lib/actions/
└── panel.ts                            ← todas las queries del panel (nuevo)

lib/constants.ts                        ← agregar DIAS_LEAD_SIN_CONTACTAR = 2

app/page.tsx                            ← cambiar redirect vendedor → /panel
middleware.ts                           ← cambiar redirect vendedor → /panel
components/nav/sidebar.tsx              ← agregar ítem "Panel" al inicio
components/nav/bottom-nav.tsx           ← agregar ítem "Panel" al inicio
```

---

## 10. Estados de carga y error

- Cada sección bajo `<Suspense>` muestra un skeleton de altura fija mientras carga.
- Si una query falla: la sección muestra un mensaje de error inline (no colapsa toda la página).
- Datos vacíos: cada sub-sección tiene su propio estado vacío explícito (nunca tabla vacía sin mensaje).

---

## 11. Restricciones de implementación

- Todos los datos vienen de Supabase via Server Actions / Server Components. Sin datos hardcodeados.
- No se crean tablas nuevas en la base de datos.
- Montos: `formatSoles()` de `lib/utils/format.ts`.
- Fechas: `parse(str, 'yyyy-MM-dd', new Date())` de `date-fns` (nunca `new Date('yyyy-MM-dd')` directo — timezone bug).
- Badges de estado: reutilizar `EstadoBadge` de `components/unidades/estado-badges.tsx`.
- Design system: seguir tokens del sistema Claude Design (`bg-card`, `font-mono tabular-nums`, `PageHeader`, etc.) documentados en `CLAUDE.md`.
