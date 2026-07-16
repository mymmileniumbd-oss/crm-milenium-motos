-- supabase/migrations/002_tables.sql

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol rol NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  dni CHAR(8) NOT NULL,
  direccion TEXT,
  telefono TEXT,
  correo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT clientes_dni_format CHECK (dni ~ '^\d{8}$')
);

CREATE TABLE prospectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  modelo_interes modelo_moto,
  origen origen_prospecto,
  etapa etapa_prospecto NOT NULL DEFAULT 'Interesado',
  notas TEXT,
  vendedor_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  n_motor TEXT NOT NULL UNIQUE,
  n_chasis TEXT NOT NULL UNIQUE,
  modelo modelo_moto NOT NULL,
  tipo_ingreso tipo_ingreso NOT NULL,
  estado_logistico estado_logistico NOT NULL DEFAULT 'Pedida',
  estado_comercial estado_comercial,
  dua_item TEXT,
  cliente_id UUID REFERENCES clientes(id),
  fecha_entrega DATE,
  -- compra
  factura_compra_moto TEXT,
  precio_compra_moto NUMERIC(12,2) CHECK (precio_compra_moto IS NULL OR precio_compra_moto >= 0),
  fecha_compra DATE,
  fecha_pago_compra DATE,
  n_operacion_pago_compra TEXT,
  -- fibra
  proveedor_fibra TEXT,
  fecha_llegada_fibrero DATE,
  fecha_pago_fibra DATE,
  n_operacion_fibra TEXT,
  factura_fibra TEXT,
  precio_fibra NUMERIC(12,2) CHECK (precio_fibra IS NULL OR precio_fibra >= 0),
  -- tienda
  fecha_llegada_tienda DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  tipo_venta tipo_venta NOT NULL,
  fecha_venta DATE NOT NULL,
  precio_venta NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
  documento_tipo documento_tipo,
  documento_numero TEXT,
  estado_pago estado_pago NOT NULL DEFAULT 'Pendiente',
  seguimiento_7dias_hecho BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES ventas(id),
  fecha_pago DATE NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto >= 0.01),
  n_operacion TEXT,
  n_recibo TEXT NOT NULL,
  tipo tipo_pago NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE garantias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id) UNIQUE,
  garantia_moto_km INTEGER NOT NULL DEFAULT 24000,
  garantia_moto_inicio DATE NOT NULL,
  garantia_fibra_inicio DATE NOT NULL,
  garantia_fibra_vencimiento DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reclamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  tipo tipo_reclamo NOT NULL,
  fecha_reclamo DATE NOT NULL,
  descripcion TEXT,
  estado estado_reclamo NOT NULL DEFAULT 'Pendiente',
  taller TEXT,
  precio NUMERIC(12,2) CHECK (precio IS NULL OR precio >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tramites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id) UNIQUE,
  sunarp_estado sunarp_estado,
  sunarp_fecha DATE,
  aap_estado aap_estado,
  aap_fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
