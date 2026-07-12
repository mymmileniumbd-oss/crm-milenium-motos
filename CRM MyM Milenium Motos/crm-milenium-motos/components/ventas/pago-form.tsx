// components/ventas/pago-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pagoSchema, type PagoFormValues } from '@/lib/validations/pago'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PagoFormProps {
  onSubmit: (data: PagoFormValues) => Promise<void>
  defaultValues?: Partial<PagoFormValues>
  submitLabel?: string
  onCancel?: () => void
}

export function PagoForm({ onSubmit, defaultValues, submitLabel = 'Registrar pago', onCancel }: PagoFormProps) {
  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      fecha_pago: new Date().toISOString().split('T')[0],
      monto: 0,
      n_operacion: '',
      n_recibo: '',
      tipo: 'Adelanto',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (d) => { await onSubmit(d); form.reset() })}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="tipo" render={({ field }) => (
            <FormItem><FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Adelanto">Adelanto</SelectItem>
                  <SelectItem value="Saldo">Saldo</SelectItem>
                  <SelectItem value="Contado">Contado</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_pago" render={({ field }) => (
            <FormItem><FormLabel>Fecha *</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="monto" render={({ field }) => (
          <FormItem><FormLabel>Monto (S/) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                {...field}
                onChange={e => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="n_recibo" render={({ field }) => (
            <FormItem><FormLabel>N° Recibo *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="n_operacion" render={({ field }) => (
            <FormItem><FormLabel>N° Operación</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
