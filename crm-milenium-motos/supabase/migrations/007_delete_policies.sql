-- supabase/migrations/007_delete_policies.sql
-- Faltaban políticas RLS de DELETE para unidades y pagos, las únicas dos
-- tablas con acciones de borrado (eliminarUnidad, eliminarPago). Sin esto,
-- Postgres deniega el borrado por defecto y ambos botones de "eliminar"
-- fallan en producción.

CREATE POLICY "unidades_delete" ON unidades FOR DELETE TO authenticated USING (get_user_rol() = 'vendedor');
CREATE POLICY "pagos_delete" ON pagos FOR DELETE TO authenticated USING (get_user_rol() = 'vendedor');
