-- supabase/migrations/008_pagos_update_policy.sql
-- Faltaba la política RLS de UPDATE para pagos (004_rls.sql definió select/insert
-- para pagos pero no update, a diferencia de todas las demás tablas). Sin esto,
-- Postgres deniega el UPDATE por defecto SIN lanzar error y con 0 filas afectadas,
-- por lo que editarPago() reportaba éxito al vendedor sin que el pago cambiara.

CREATE POLICY "pagos_update" ON pagos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');
