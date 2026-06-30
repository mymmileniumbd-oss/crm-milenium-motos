// components/panel/cartera-section.tsx
import {
  getCarteraSeparadas,
  getCarteraPendientesEntrega,
  getCarteraTramitesPendientes,
} from '@/lib/actions/panel'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatSoles } from '@/lib/utils/format'

export async function CarteraSection() {
  const [separadas, pendientesEntrega, tramitesPendientes] = await Promise.all([
    getCarteraSeparadas(),
    getCarteraPendientesEntrega(),
    getCarteraTramitesPendientes(),
  ])

  return (
    <div className="space-y-3">
      <h2 className="text-[15px] font-extrabold tracking-tight">Cartera en proceso</h2>
      <Accordion type="multiple" defaultValue={['separadas', 'entrega', 'tramites']} className="space-y-2">

        {/* Separadas */}
        <AccordionItem value="separadas" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Unidades separadas
              <Badge variant="secondary">{separadas.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {separadas.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin unidades separadas</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {separadas.map(s => (
                      <TableRow key={s.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${s.unidad_id}`} className="block font-medium">
                            {s.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{s.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{s.n_motor}</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatSoles(s.precio_venta)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatSoles(s.pagado)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold tabular-nums text-destructive">
                          {formatSoles(s.saldo)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.dias_desde_venta !== null ? `${s.dias_desde_venta}d` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Pendientes de entrega */}
        <AccordionItem value="entrega" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Pendientes de entrega
              <Badge variant="secondary">{pendientesEntrega.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {pendientesEntrega.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin ventas pendientes de entrega</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead>Fecha venta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendientesEntrega.map(u => (
                      <TableRow key={u.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${u.unidad_id}`} className="block font-medium">
                            {u.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{u.n_motor}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {u.fecha_venta ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Trámites pendientes */}
        <AccordionItem value="tramites" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              Trámites pendientes (SUNARP / AAP)
              <Badge variant="secondary">{tramitesPendientes.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {tramitesPendientes.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Sin trámites pendientes</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N° Motor</TableHead>
                      <TableHead>SUNARP</TableHead>
                      <TableHead>AAP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tramitesPendientes.map(u => (
                      <TableRow key={u.unidad_id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <Link href={`/unidades/${u.unidad_id}`} className="block font-medium">
                            {u.cliente ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.modelo}</TableCell>
                        <TableCell className="font-mono text-xs">{u.n_motor}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.sunarp_estado === 'Inscrito' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {u.sunarp_estado ?? 'Sin iniciar'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.aap_estado === 'Recojo' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {u.aap_estado ?? 'Sin iniciar'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}
