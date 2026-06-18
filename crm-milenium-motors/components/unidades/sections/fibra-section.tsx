'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fibraSchema, type FibraValues } from '@/lib/validations/unidad'
import { actualizarSeccionFibra } from '@/lib/actions/unidades'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { calcularGarantiaFibraVencimientoStr } from '@/lib/utils/fechas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FibraSection({ unidad }: { unidad: any }) {
  const form = useForm<FibraValues>({
    resolver: zodResolver(fibraSchema),
    defaultValues: {
      proveedor_fibra: unidad.proveedor_fibra ?? '',
      fecha_llegada_fibrero: unidad.fecha_llegada_fibrero ?? '',
      fecha_pago_fibra: unidad.fecha_pago_fibra ?? '',
      n_operacion_fibra: unidad.n_operacion_fibra ?? '',
      factura_fibra: unidad.factura_fibra ?? '',
      precio_fibra: unidad.precio_fibra ?? undefined,
    },
  })

  // Calcular garantía fibra vencimiento si hay fecha de entrega
  const garantiaFibraVencimiento = unidad.fecha_entrega
    ? calcularGarantiaFibraVencimientoStr(unidad.fecha_entrega)
    : null

  return (
    <div className="space-y-4">
      {garantiaFibraVencimiento && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
          <span className="text-amber-700 font-medium">Garantía fibra vence:</span>{' '}
          <span className="font-mono">{garantiaFibraVencimiento}</span>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(d => actualizarSeccionFibra(unidad.id, d))}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="proveedor_fibra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor (fibrero)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_llegada_fibrero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Llegada al fibrero</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_pago_fibra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha pago fibra</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="n_operacion_fibra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Operación</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="factura_fibra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Factura fibra</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio_fibra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio fibra (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar fibra'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
