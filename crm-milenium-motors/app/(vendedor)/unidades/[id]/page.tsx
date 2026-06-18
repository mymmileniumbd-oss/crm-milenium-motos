// app/(vendedor)/unidades/[id]/page.tsx
import Link from 'next/link'
import { obtenerUnidad } from '@/lib/actions/unidades'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { DatosGeneralesSection } from '@/components/unidades/sections/datos-generales-section'
import { CompraSection } from '@/components/unidades/sections/compra-section'
import { FibraSection } from '@/components/unidades/sections/fibra-section'
import { TiendaSection } from '@/components/unidades/sections/tienda-section'
import { MarcarEntregadaButton } from '@/components/unidades/marcar-entregada-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Las secciones de Venta, Pagos, Garantías, Reclamos y Trámites
// se agregan en Tasks 9 y 12 — se dejan como placeholders por ahora.
export default async function UnidadPage({ params }: { params: { id: string } }) {
  const unidad = await obtenerUnidad(params.id)

  const fechaVenta = unidad.ventas?.[0]?.fecha_venta ?? ''
  const mostrarEntregada = unidad.estado_comercial !== 'Entregada'

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

        {/* Placeholder: Task 9 agregará sección Venta */}
        <AccordionItem value="venta" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Venta
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-400">Sin datos aún</p>
          </AccordionContent>
        </AccordionItem>

        {/* Placeholder: Task 9 agregará sección Pagos */}
        <AccordionItem value="pagos" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Pagos
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-400">Sin datos aún</p>
          </AccordionContent>
        </AccordionItem>

        {/* Placeholder: Task 12 agregará sección Garantía */}
        <AccordionItem value="garantia" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Garantía
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-400">Sin datos aún</p>
          </AccordionContent>
        </AccordionItem>

        {/* Placeholder: Task 12 agregará sección Reclamos */}
        <AccordionItem value="reclamos" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Reclamos
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-400">Sin datos aún</p>
          </AccordionContent>
        </AccordionItem>

        {/* Placeholder: Task 12 agregará sección Trámites */}
        <AccordionItem value="tramites" className="bg-white border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Trámites
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-400">Sin datos aún</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
