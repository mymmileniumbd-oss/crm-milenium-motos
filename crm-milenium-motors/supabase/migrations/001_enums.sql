-- supabase/migrations/001_enums.sql
CREATE TYPE rol AS ENUM ('vendedor', 'gerente');
CREATE TYPE modelo_moto AS ENUM ('Deluxe GS', 'Deluxe GLP', 'Duramax GS', 'Duramax GLP', 'Duramax GNV');
CREATE TYPE tipo_ingreso AS ENUM ('Bajo pedido', 'Stock');
CREATE TYPE estado_logistico AS ENUM ('Pedida', 'En fibrero', 'En tienda');
CREATE TYPE estado_comercial AS ENUM ('Separada', 'Vendida', 'Entregada');
CREATE TYPE origen_prospecto AS ENUM ('Facebook', 'Referido', 'Visita a tienda', 'Otro');
CREATE TYPE etapa_prospecto AS ENUM ('Interesado', 'Cotizó', 'Dio adelanto', 'Vendido', 'Desistió');
CREATE TYPE tipo_venta AS ENUM ('Contado', 'Separación');
CREATE TYPE documento_tipo AS ENUM ('Factura', 'Boleta');
CREATE TYPE estado_pago AS ENUM ('Pendiente', 'Parcial', 'Pagado');
CREATE TYPE tipo_pago AS ENUM ('Adelanto', 'Saldo', 'Contado');
CREATE TYPE tipo_reclamo AS ENUM ('Moto', 'Fibra');
CREATE TYPE estado_reclamo AS ENUM ('Pendiente', 'Resuelto');
CREATE TYPE sunarp_estado AS ENUM ('Ingreso', 'En Calificación', 'Inscrito');
CREATE TYPE aap_estado AS ENUM ('Pago', 'Recojo');
