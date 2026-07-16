-- supabase/migrations/006_view_security_invoker.sql
-- Documenta un cambio ya aplicado manualmente en producción: vista_master
-- corre con los permisos de quien consulta (no del dueño de la vista), para
-- que el RLS de las tablas base (clientes, unidades, usuarios, etc.) se
-- respete también al consultar la vista. Sin esto, un vendedor podría ver
-- el email de otros vendedores vía el join con `usuarios`.

ALTER VIEW vista_master SET (security_invoker = true);
