-- supabase/migrations/008_pagos_update_policy.sql
-- 004_rls.sql definió select/insert para pagos pero nunca update, a diferencia
-- de todas las demás tablas. En un despliegue fresco desde 001-007 eso deja a
-- Postgres denegando el UPDATE por defecto SIN lanzar error y con 0 filas
-- afectadas, por lo que editarPago() reportaría éxito al vendedor sin que el
-- pago cambiara. En el proyecto Supabase real la policy ya existía (creada
-- manualmente en el Dashboard en algún momento, sin quedar registrada como
-- migración) — este archivo documenta esa policy y la deja reproducible para
-- cualquier entorno nuevo. Idempotente: no falla si la policy ya existe.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pagos' AND policyname = 'pagos_update'
  ) THEN
    CREATE POLICY "pagos_update" ON pagos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');
  END IF;
END $$;
