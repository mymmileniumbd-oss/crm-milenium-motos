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
