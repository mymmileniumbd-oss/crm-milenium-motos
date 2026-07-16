<!-- Generated: 2026-07-12 | Files scanned: 7 | Token estimate: ~550 -->

# Data — Supabase Postgres

`supabase/migrations/` (7 files, run in order). RLS enforced on every table;
SELECT/INSERT/UPDATE/DELETE are separate policies.

## Tables (002_tables.sql)
usuarios, clientes, prospectos, unidades, ventas, pagos, garantias, reclamos, tramites

## Enums (001_enums.sql)
rol, modelo_moto, tipo_ingreso, estado_logistico, estado_comercial, origen_prospecto,
etapa_prospecto (still has legacy 'Cotizó' value, unused in UI), tipo_venta,
documento_tipo, estado_pago, tipo_pago, tipo_reclamo, estado_reclamo, sunarp_estado,
aap_estado

## Migration order
001 enums → 002 tables → 003 indexes → 004 RLS → 005 views → 006 view security_invoker
→ 007 delete policies

## Notable schema additions (via ALTER TABLE, not in original migrations)
- `unidades.color TEXT CHECK (color IN ('Rojo','Azul','Verde','Negro','Amarillo'))`
- `reclamos.fecha_resolucion DATE`

## Views
`vista_master` — must keep `security_invoker = true` (006_view_security_invoker.sql),
otherwise it runs with the view owner's privileges and bypasses base-table RLS
(would leak every vendedor's email through the `usuarios` join).

## Client access pattern
- Server Components / Actions: `lib/supabase/server.ts` → `createServerClient()`
- `lib/supabase/types.ts` → `Database` type, currently `any` placeholder
  (run `npx supabase gen types` against the linked project to fill in)

## State machines (enforced in app code, not DB triggers)
- estado_comercial: auto Separada→Vendida via `crearPago`/`recalcularEstados`;
  Entregada is manual-only (`marcarEntregada`)
- estado_pago: `calcularEstadoPago(suma, precio)` in `lib/utils/estados.ts`
- estado_logistico: always manual
