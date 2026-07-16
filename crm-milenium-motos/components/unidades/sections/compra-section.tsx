'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { compraSchema, type CompraValues } from '@/lib/validations/unidad'
import { actualizarSeccionCompra } from '@/lib/actions/unidades'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CompraSection({ unidad }: { unidad: any }) {
  const form = useForm<CompraValues>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      factura_compra_moto: unidad.factura_compra_moto ?? '',
      precio_compra_moto: unidad.precio_compra_moto ?? undefined,
      fecha_compra: unidad.fecha_compra ?? '',
      fecha_pago_compra: unidad.fecha_pago_compra ?? '',
      n_operacion_pago_compra: unidad.n_operacion_pago_compra ?? '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(d => actualizarSeccionCompra(unidad.id, d))}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="factura_compra_moto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° Factura</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precio_compra_moto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio compra (S/)</FormLabel>
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
          <FormField
            control={form.control}
            name="fecha_compra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha compra</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha_pago_compra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha pago</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="n_operacion_pago_compra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° Operación</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar compra'}
        </Button>
      </form>
    </Form>
  )
}
