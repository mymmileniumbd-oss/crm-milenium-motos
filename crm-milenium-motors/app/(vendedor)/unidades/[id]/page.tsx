// app/(vendedor)/unidades/[id]/page.tsx
import Link from 'next/link'
import { obtenerUnidad } from '@/lib/actions/unidades'
import { obtenerClientes } from '@/lib/actions/clientes'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { DatosGeneralesSection } from '@/components/unidades/sections/datos-generales-section'
import { CompraSection } from '@/components/unidades/sections/compra-section'
import { FibraSection } from '@/components/unidades/sections/fibra-section'
import { TiendaSection } from '@/components/unidades/sections/tienda-section'
import { VentaSection } from '@/components/unidades/sections/venta-section'
import { PagosSection } from '@/components/unidades/sections/pagos-section'
import { MarcarEntregadaButton } from '@/components/unidades/marcar-entregada-button'
import { GarantiasSection } from '@/components/unidades/sections/garantias-section'
import { ReclamosSection } from '@/components/unidades/sections/reclamos-section'
import { TramitesSection } from '@/components/unidades/sections/tramites-section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default async function UnidadPage({ params }: { params: { id: string } }) {
  const [unidad, clientes] = await Promise.all([
    obtenerUnidad(params.id),
    obtenerClientes(),
  ])

  const fechaVenta = unidad.ventas?.[0]?.fecha_venta ?? ''
  const mostrarEntregada = unidad.estado_comercial === 'Vendida'

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/unidades" className="hover:underline">
          Unidades
        </Link>
        <span>›</span>
        <span className="font-mono">{unidad.n_motor}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {unidad.modelo} — {unidad.n_motor}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <BadgeLogistico estado={unidad.estado_logistico} />
            <BadgeComercial estado={unidad.estado_comercial} />
          </div>
        </div>
        {mostrarEntregada && (
          <MarcarEntregadaButton unidadId={unidad.id} fechaVenta={fechaVenta} />
        )}
      </div>

      {/* Accordion */}
      <Accordion type="multiple" defaultValue={['general']} className="space-y-2">
        <AccordionItem value="general" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Datos generales
          </AccordionTrigger>
          <AccordionContent>
            <DatosGeneralesSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="compra" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Compra de moto
          </AccordionTrigger>
          <AccordionContent>
            <CompraSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fibra" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Fibrero
          </AccordionTrigger>
          <AccordionContent>
            <FibraSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tienda" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Llegada a tienda
          </AccordionTrigger>
          <AccordionContent>
            <TiendaSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="venta" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Venta
          </AccordionTrigger>
          <AccordionContent>
            <VentaSection unidad={unidad} clientes={clientes} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pagos" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Pagos
          </AccordionTrigger>
          <AccordionContent>
            <PagosSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="garantias" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Garantías
          </AccordionTrigger>
          <AccordionContent>
            <GarantiasSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reclamos" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Reclamos
          </AccordionTrigger>
          <AccordionContent>
            <ReclamosSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tramites" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Trámites
          </AccordionTrigger>
          <AccordionContent>
            <TramitesSection unidad={unidad} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
