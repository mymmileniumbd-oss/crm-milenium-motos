// app/(vendedor)/seguimientos/page.tsx
import { obtenerSeguimientosPendientes, marcarSeguimientoHecho } from '@/lib/actions/ventas'
import { calcularDiasTranscurridos } from '@/lib/utils/fechas'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SeguimientosPage() {
  const seguimientos = await obtenerSeguimientosPendientes()

  return (
    <div className="space-y-4">
      <h1 className="text-[21px] font-extrabold tracking-tight">Seguimientos post-venta</h1>
      <p className="text-sm text-muted-foreground">
        Clientes con más de 7 días desde la entrega sin seguimiento registrado.
      </p>
      {seguimientos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No hay seguimientos pendientes</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y">
          {seguimientos.map(v => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cliente = Array.isArray(v.clientes) ? (v.clientes as any[])[0] : v.clientes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const unidad = Array.isArray(v.unidades) ? (v.unidades as any[])[0] : v.unidades
            const fechaEntrega = unidad?.fecha_entrega as string
            const dias = calcularDiasTranscurridos(new Date(fechaEntrega + 'T12:00:00'))
            return (
              <div key={v.id} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{cliente?.nombre_completo}</p>
                  <p className="text-sm text-muted-foreground">
                    {unidad?.modelo} — Motor: {unidad?.n_motor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entregado el {fechaEntrega} · <span className="text-orange-600 font-medium">{dias} días</span>
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
