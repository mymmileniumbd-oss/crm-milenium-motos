// components/panel/alertas-section.tsx
import { getAlertasSeguimiento, getAlertasLeadsSinContactar } from '@/lib/actions/panel'
import { DIAS_LEAD_SIN_CONTACTAR } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export async function AlertasSection() {
  const [seguimientos, leads] = await Promise.all([
    getAlertasSeguimiento(),
    getAlertasLeadsSinContactar(DIAS_LEAD_SIN_CONTACTAR),
  ])

  if (seguimientos.length === 0 && leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-4 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-sm font-semibold">Todo al día — sin alertas pendientes</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={15} className="text-destructive" />
            Seguimientos post-venta
            <Badge variant="destructive" className="ml-auto text-xs">
              {seguimientos.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {seguimientos.length === 0 ? (
            <p className="flex items-center gap-1.5 px-4 pb-3 text-sm text-muted-foreground">
              <CheckCircle2 size={14} className="text-green-500" />
              Sin seguimientos pendientes
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {seguimientos.map(s => (
                <li key={s.venta_id}>
                  <Link
                    href={`/unidades/${s.unidad_id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.cliente ?? '—'}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {s.modelo} · {s.n_motor}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-3 shrink-0 text-xs">
                      {s.dias_desde_entrega}d
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={15} className="text-orange-500" />
            Leads sin contactar
            <Badge className="ml-auto bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
              {leads.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {leads.length === 0 ? (
            <p className="flex items-center gap-1.5 px-4 pb-3 text-sm text-muted-foreground">
              <CheckCircle2 size={14} className="text-green-500" />
              Sin leads pendientes de contacto
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {leads.map(l => (
                <li key={l.id}>
                  <Link
                    href={`/prospectos/${l.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.etapa}</p>
                    </div>
                    <Badge className="ml-3 shrink-0 bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
                      {l.dias_sin_contactar}d
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
