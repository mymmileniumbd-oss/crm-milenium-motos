-- supabase/migrations/004_rls.sql

-- Función helper para obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS rol AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- usuarios: cada usuario solo puede leer su propio registro
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT TO authenticated USING (id = auth.uid());

-- clientes: vendedores CRUD, gerentes solo lectura
CREATE POLICY "clientes_select" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "clientes_insert" ON clientes FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "clientes_update" ON clientes FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- prospectos: vendedores CRUD
CREATE POLICY "prospectos_select" ON prospectos FOR SELECT TO authenticated USING (true);
CREATE POLICY "prospectos_insert" ON prospectos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "prospectos_update" ON prospectos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- unidades: vendedores CRUD, gerentes lectura
CREATE POLICY "unidades_select" ON unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "unidades_insert" ON unidades FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "unidades_update" ON unidades FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- ventas: vendedores CRUD, gerentes lectura
CREATE POLICY "ventas_select" ON ventas FOR SELECT TO authenticated USING (true);
CREATE POLICY "ventas_insert" ON ventas FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "ventas_update" ON ventas FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

-- pagos: vendedores CRUD, gerentes lectura
CREATE POLICY "pagos_select" ON pagos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pagos_insert" ON pagos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');

-- garantias, reclamos, tramites: misma política
CREATE POLICY "garantias_select" ON garantias FOR SELECT TO authenticated USING (true);
CREATE POLICY "garantias_insert" ON garantias FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "garantias_update" ON garantias FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

CREATE POLICY "reclamos_select" ON reclamos FOR SELECT TO authenticated USING (true);
CREATE POLICY "reclamos_insert" ON reclamos FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "reclamos_update" ON reclamos FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');

CREATE POLICY "tramites_select" ON tramites FOR SELECT TO authenticated USING (true);
CREATE POLICY "tramites_insert" ON tramites FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'vendedor');
CREATE POLICY "tramites_update" ON tramites FOR UPDATE TO authenticated USING (get_user_rol() = 'vendedor');
