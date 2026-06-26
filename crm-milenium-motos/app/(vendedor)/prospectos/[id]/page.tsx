// app/(vendedor)/prospectos/[id]/page.tsx
import Link from 'next/link'
import { obtenerProspecto, actualizarProspecto } from '@/lib/actions/prospectos'
import { obtenerUnidades } from '@/lib/actions/unidades'
import { ProspectoForm } from '@/components/prospectos/prospecto-form'
import { ConvertirVentaFlow } from '@/components/prospectos/convertir-venta-flow'
import type { ProspectoFormValues } from '@/lib/validations/prospecto'

interface Props { params: { id: string } }

export default async function ProspectoPage({ params }: Props) {
  const [prospecto, todasUnidades] = await Promise.all([
    obtenerProspecto(params.id),
    obtenerUnidades({ estado_comercial: 'Disponible' }),
  ])

  const yaVendido = prospecto.etapa === 'Vendido'
  const desistio = prospecto.etapa === 'Desistió'

  // Filtrar unidades por modelo de interés si está definido
  const unidadesDisponibles = todasUnidades.filter(u =>
    !prospecto.modelo_interes || u.modelo === prospecto.modelo_interes
  )

  async function handleActualizarProspecto(data: ProspectoFormValues) {
    'use server'
    await actualizarProspecto(params.id, data)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/prospectos" className="hover:underline">Prospectos</Link>
        <span>›</span>
        <span className="text-gray-800">{prospecto.nombre}</span>
      </div>

      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <h1 className="text-[21px] font-extrabold tracking-tight">{prospecto.nombre}</h1>
        <span className={`text-xs px-2 py-1 rounded font-medium ${
          yaVendido
            ? 'bg-green-100 text-green-700'
            : desistio
            ? 'bg-secondary text-muted-foreground'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {prospecto.etapa}
        </span>
      </div>

      {/* Info adicional */}
      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
        {prospecto.telefono && (
          <div><span className="font-medium">Teléfono:</span> {prospecto.telefono}</div>
        )}
        {prospecto.modelo_interes && (
          <div><span className="font-medium">Modelo de interés:</span> {prospecto.modelo_interes}</div>
        )}
        {prospecto.origen && (
          <div><span className="font-medium">Origen:</span> {prospecto.origen}</div>
        )}
        {prospecto.notas && (
          <div className="col-span-2"><span className="font-medium">Notas:</span> {prospecto.notas}</div>
        )}
      </div>

      {/* Estado: Ya vendido */}
      {yaVendido && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Este prospecto ya fue convertido en venta.</p>
          <Link href="/prospectos" className="text-sm text-green-700 underline mt-1 inline-block">
            Volver al kanban
          </Link>
        </div>
      )}

      {/* Editar datos del prospecto (solo si no está vendido) */}
      {!yaVendido && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Editar datos del prospecto</h2>
          <ProspectoForm
            defaultValues={{
              nombre: prospecto.nombre,
              telefono: prospecto.telefono ?? '',
              modelo_interes: prospecto.modelo_interes ?? null,
              origen: prospecto.origen ?? null,
              etapa: prospecto.etapa as ProspectoFormValues['etapa'],
              notas: prospecto.notas ?? '',
            }}
            onSubmit={handleActualizarProspecto}
            submitLabel="Actualizar"
          />
        </div>
      )}

      {/* Flujo de conversión (solo si no está vendido ni desistió) */}
      {!yaVendido && !desistio && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Convertir en venta</h2>
          <ConvertirVentaFlow
            prospecto={{
              id: prospecto.id,
              nombre: prospecto.nombre,
              telefono: prospecto.telefono,
              modelo_interes: prospecto.modelo_interes,
            }}
            unidadesDisponibles={unidadesDisponibles.map(u => ({
              id: u.id,
              n_motor: u.n_motor,
              modelo: u.modelo,
              n_chasis: u.n_chasis,
            }))}
          />
        </div>
      )}
    </div>
  )
}
