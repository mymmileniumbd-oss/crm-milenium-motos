<!-- Generated: 2026-07-12 | Files scanned: 17 | Token estimate: ~850 -->

# Backend — Server Actions

No API routes. All server logic is Server Actions in `lib/actions/*.ts`, each: validate
(Zod) → `createServerClient()` → mutate/query → `revalidatePath()` on writes.

## lib/actions/clientes.ts
crearCliente, obtenerClientes, obtenerCliente, actualizarCliente

## lib/actions/unidades.ts
obtenerUnidades(filters), obtenerUnidad, crearUnidad, actualizarEstadoLogistico,
actualizarSeccionCompra, actualizarSeccionFibra, actualizarFechaLlegadaTienda,
asignarCliente*, eliminarUnidad, marcarEntregada (auto-creates garantía fibra)

## lib/actions/ventas.ts
crearVenta (auto-creates empty tramites row), actualizarVenta (recalculates
estado_pago/estado_comercial), obtenerVentas, obtenerVenta*, obtenerSeguimientosPendientes,
marcarSeguimientoHecho

## lib/actions/pagos.ts
crearPago, editarPago, eliminarPago (both call shared `recalcularEstados`),
obtenerPagosByVenta*

## lib/actions/prospectos.ts
obtenerProspectos, obtenerProspecto, crearProspecto, actualizarEtapaProspecto,
actualizarProspecto, convertirEnVenta (atomic: cliente + venta + tramite shell + etapa='Vendido')

## lib/actions/tramites.ts
actualizarTramite, obtenerTramites

## lib/actions/garantias.ts
obtenerGarantias, actualizarGarantia*

## lib/actions/reclamos.ts
crearReclamo, editarReclamo, actualizarEstadoReclamo (sets fecha_resolucion manually),
obtenerReclamos

## lib/actions/dashboard.ts (gerente, read-only)
getDatosVentas, getDatosCompras, getUtilidadPorUnidad, getProspectosPorEtapa,
getInventario, getKPIs, getCuentasPorCobrar

## lib/actions/panel.ts (vendedor daily dashboard)
getAlertasSeguimiento, getAlertasLeadsSinContactar(dias), getEmbudoPeriodo,
getCarteraSeparadas, getCarteraPendientesEntrega, getCarteraTramitesPendientes,
getInventarioDisponible, getInventarioEnCamino

`*` = exported but currently has no caller in the codebase (kept — looks like an
in-progress/scaffolded feature, not confirmed dead code; re-check before deleting).

## Business rules (see project CLAUDE.md for full detail)

- Estado comercial state machine (Separada → Vendida → Entregada) auto-computed in
  `crearPago`/`recalcularEstados`; `Entregada` is manual-only, never auto-downgraded
- Estado logístico (Pedida/En fibrero/En tienda) always manual
- Garantía fibra = fecha_entrega + 1 month, created in `marcarEntregada`
- Seguimiento 7 días: fecha_entrega ≤ today-7 AND seguimiento_7dias_hecho = false

## Auth helper

`lib/supabase/auth.ts` — `requireRol(rol)` guards Server Actions by role.
`lib/supabase/server.ts` / `middleware.ts` — Supabase server clients.
`lib/supabase/types.ts` — `Database` type, currently `any` (placeholder pending
`npx supabase gen types`).
