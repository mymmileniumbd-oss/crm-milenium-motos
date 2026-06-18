// app/(vendedor)/seguimientos/page.tsx
import { obtenerSeguimientosPendientes, marcarSeguimientoHecho } from '@/lib/actions/ventas'
import { calcularDiasTranscurridos } from '@/lib/utils/fechas'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SeguimientosPage() {
  const seguimientos = await obtenerSeguimientosPendientes()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seguimientos post-venta</h1>
      <p className="text-sm text-gray-500">
        Clientes con más de 7 días desde la venta sin seguimiento registrado.
      </p>
      {seguimientos.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-500">No hay seguimientos pendientes</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {seguimientos.map(v => {
            const dias = calcularDiasTranscurridos(new Date(v.fecha_venta))
            // Supabase may return related rows as array or object depending on schema type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cliente = Array.isArray(v.clientes) ? (v.clientes as any[])[0] : v.clientes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const unidad = Array.isArray(v.unidades) ? (v.unidades as any[])[0] : v.unidades
            return (
              <div key={v.id} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{cliente?.nombre_completo}</p>
                  <p className="text-sm text-gray-500">
                    {unidad?.modelo} — Motor: {unidad?.n_motor}
                  </p>
                  <p className="text-sm text-gray-400">
                    Vendido el {v.fecha_venta} · <span className="text-orange-600 font-medium">{dias} días</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/unidades/${v.unidad_id}`} className="text-sm text-blue-600 hover:underline">
                    Ver unidad
                  </Link>
                  <form action={async () => { 'use server'; await marcarSeguimientoHecho(v.id) }}>
                    <Button size="sm" type="submit" variant="outline">Hecho</Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
