// components/panel/inventario-section.tsx
import { getInventarioDisponible, getInventarioEnCamino } from '@/lib/actions/panel'
import { Card, CardContent } from '@/components/ui/card'
import { MODELOS_MOTO } from '@/lib/constants'

export async function InventarioSection() {
  const [disponible, enCamino] = await Promise.all([
    getInventarioDisponible(),
    getInventarioEnCamino(),
  ])

  const hayEnCamino = Object.keys(enCamino).length > 0

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-extrabold tracking-tight">Disponibilidad de inventario</h2>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          En tienda — disponibles
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {MODELOS_MOTO.map(modelo => (
            <Card key={modelo} className={disponible[modelo] === 0 ? 'opacity-50' : ''}>
              <CardContent className="pb-2 pt-3 text-center">
                <p className="font-mono text-xl font-bold tabular-nums">{disponible[modelo] ?? 0}</p>
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{modelo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          En camino
        </p>
        {!hayEnCamino ? (
          <p className="text-sm text-muted-foreground">Sin unidades en camino</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(enCamino).map(([modelo, counts]) => (
              <Card key={modelo}>
                <CardContent className="pb-2 pt-3">
                  <p className="text-sm font-semibold">{modelo}</p>
                  <div className="mt-1 flex gap-4">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-foreground">{counts.pedidas}</span>{' '}
                      pedidas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-foreground">{counts.en_fibrero}</span>{' '}
                      en fibrero
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
