-- supabase/migrations/005_views.sql
-- Vista maestra: una fila por unidad con todos los datos relacionados aplanados.
-- Úsala en el Query Editor de Supabase o desde cualquier cliente PostgreSQL.

CREATE OR REPLACE VIEW vista_master AS
SELECT
  -- ── UNIDAD ─────────────────────────────────────────────────────────────────
  u.id                        AS unidad_id,
  u.n_motor,
  u.n_chasis,
  u.modelo,
  u.tipo_ingreso,
  u.estado_logistico,
  u.estado_comercial,
  u.dua_item,
  u.fecha_entrega,
  u.created_at                AS unidad_created_at,

  -- costos
  u.factura_compra_moto,
  u.precio_compra_moto,
  u.fecha_compra,
  u.fecha_pago_compra,
  u.n_operacion_pago_compra,
  u.proveedor_fibra,
  u.fecha_llegada_fibrero,
  u.fecha_pago_fibra,
  u.n_operacion_fibra,
  u.factura_fibra,
  u.precio_fibra,
  u.fecha_llegada_tienda,
  COALESCE(u.precio_compra_moto, 0) + COALESCE(u.precio_fibra, 0)
                              AS costo_total_unidad,

  -- ── CLIENTE ────────────────────────────────────────────────────────────────
  c.id                        AS cliente_id,
  c.nombre_completo           AS cliente_nombre,
  c.dni                       AS cliente_dni,
  c.telefono                  AS cliente_telefono,
  c.correo                    AS cliente_correo,
  c.direccion                 AS cliente_direccion,

  -- ── VENTA ──────────────────────────────────────────────────────────────────
  v.id                        AS venta_id,
  v.tipo_venta,
  v.fecha_venta,
  v.precio_venta,
  v.documento_tipo,
  v.documento_numero,
  v.estado_pago,
  v.seguimiento_7dias_hecho,

  -- ── VENDEDOR ───────────────────────────────────────────────────────────────
  usr.id                      AS vendedor_id,
  usr.nombre                  AS vendedor_nombre,
  usr.email                   AS vendedor_email,

  -- ── PAGOS (agregados) ──────────────────────────────────────────────────────
  COALESCE(pag.total_pagado,    0)  AS total_pagado,
  COALESCE(pag.cantidad_pagos,  0)  AS cantidad_pagos,
  COALESCE(v.precio_venta, 0) - COALESCE(pag.total_pagado, 0)
                                    AS saldo_pendiente,

  -- ── MARGEN ─────────────────────────────────────────────────────────────────
  COALESCE(v.precio_venta, 0)
    - COALESCE(u.precio_compra_moto, 0)
    - COALESCE(u.precio_fibra, 0)   AS margen_bruto,

  -- ── GARANTÍA ───────────────────────────────────────────────────────────────
  g.garantia_moto_km,
  g.garantia_moto_inicio,
  g.garantia_fibra_inicio,
  g.garantia_fibra_vencimiento,

  -- ── TRÁMITES ───────────────────────────────────────────────────────────────
  t.sunarp_estado,
  t.sunarp_fecha,
  t.aap_estado,
  t.aap_fecha,

  -- ── RECLAMOS (agregados) ───────────────────────────────────────────────────
  COALESCE(rec.total_reclamos,      0)  AS total_reclamos,
  COALESCE(rec.reclamos_pendientes, 0)  AS reclamos_pendientes,
  COALESCE(rec.reclamos_resueltos,  0)  AS reclamos_resueltos

FROM unidades u

LEFT JOIN clientes c
  ON c.id = u.cliente_id

LEFT JOIN LATERAL (
  SELECT * FROM ventas
  WHERE unidad_id = u.id
  ORDER BY created_at DESC
  LIMIT 1
) v ON TRUE

LEFT JOIN usuarios usr
  ON usr.id = v.vendedor_id

LEFT JOIN (
  SELECT
    venta_id,
    SUM(monto)   AS total_pagado,
    COUNT(*)     AS cantidad_pagos
  FROM pagos
  GROUP BY venta_id
) pag ON pag.venta_id = v.id

LEFT JOIN garantias g
  ON g.unidad_id = u.id

LEFT JOIN tramites t
  ON t.unidad_id = u.id

LEFT JOIN (
  SELECT
    unidad_id,
    COUNT(*)                                              AS total_reclamos,
    COUNT(*) FILTER (WHERE estado = 'Pendiente')          AS reclamos_pendientes,
    COUNT(*) FILTER (WHERE estado = 'Resuelto')           AS reclamos_resueltos
  FROM reclamos
  GROUP BY unidad_id
) rec ON rec.unidad_id = u.id;


-- ── QUERIES DE EJEMPLO ─────────────────────────────────────────────────────

-- 1. Todo el inventario master
-- SELECT * FROM vista_master ORDER BY unidad_created_at DESC;

-- 2. Solo unidades vendidas con saldo pendiente
-- SELECT unidad_id, n_motor, modelo, cliente_nombre, precio_venta, total_pagado, saldo_pendiente
-- FROM vista_master
-- WHERE estado_pago IN ('Pendiente', 'Parcial')
-- ORDER BY fecha_venta;

-- 3. Margen bruto por modelo
-- SELECT modelo, COUNT(*) AS ventas, SUM(margen_bruto) AS margen_total, AVG(margen_bruto) AS margen_promedio
-- FROM vista_master
-- WHERE venta_id IS NOT NULL
-- GROUP BY modelo ORDER BY margen_total DESC;

-- 4. Unidades con reclamos pendientes
-- SELECT unidad_id, n_motor, modelo, cliente_nombre, reclamos_pendientes
-- FROM vista_master
-- WHERE reclamos_pendientes > 0;

-- 5. Estado de trámites pendientes
-- SELECT unidad_id, n_chasis, modelo, cliente_nombre, sunarp_estado, aap_estado
-- FROM vista_master
-- WHERE venta_id IS NOT NULL AND (sunarp_estado IS NULL OR aap_estado IS NULL);

-- 6. Unidades sin venta (stock disponible)
-- SELECT unidad_id, n_motor, n_chasis, modelo, estado_logistico, unidad_created_at
-- FROM vista_master
-- WHERE venta_id IS NULL
-- ORDER BY unidad_created_at;
