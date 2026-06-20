// components/ventas/venta-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ventaSchema, type VentaFormValues } from '@/lib/validations/venta'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  clientes: { id: string; nombre_completo: string; dni: string }[]
  clienteIdInicial?: string
  onSubmit: (data: VentaFormValues) => Promise<void>
}

export function VentaForm({ clientes, clienteIdInicial, onSubmit }: Props) {
  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      tipo_venta: 'Contado',
      fecha_venta: new Date().toISOString().split('T')[0],
      precio_venta: 0,
      cliente_id: clienteIdInicial ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data }))} className="space-y-4">
        <FormField control={form.control} name="cliente_id" render={({ field }) => (
          <FormItem><FormLabel>Cliente *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger></FormControl>
              <SelectContent>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre_completo} — DNI {c.dni}</SelectItem>
                ))}
              </SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="tipo_venta" render={({ field }) => (
            <FormItem><FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Contado">Contado</SelectItem>
                  <SelectItem value="Separación">Separación</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fecha_venta" render={({ field }) => (
            <FormItem><FormLabel>Fecha venta *</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="precio_venta" render={({ field }) => (
          <FormItem><FormLabel>Precio de venta (S/) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...field}
                onChange={e => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="documento_tipo" render={({ field }) => (
            <FormItem><FormLabel>Tipo documento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Sin documento" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Factura">Factura</SelectItem>
                  <SelectItem value="Boleta">Boleta</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="documento_numero" render={({ field }) => (
            <FormItem><FormLabel>N° Documento</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registrando...' : 'Registrar venta'}
        </Button>
      </form>
    </Form>
  )
}
