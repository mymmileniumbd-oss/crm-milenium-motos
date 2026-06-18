// components/unidades/unidad-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unidadBaseSchema, type UnidadBaseValues } from '@/lib/validations/unidad'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELOS_MOTO, ESTADOS_LOGISTICO } from '@/lib/constants'

export function UnidadForm({ onSubmit }: { onSubmit: (data: UnidadBaseValues) => Promise<void> }) {
  const form = useForm<UnidadBaseValues>({
    resolver: zodResolver(unidadBaseSchema),
    defaultValues: { n_motor: '', n_chasis: '', estado_logistico: 'Pedida', dua_item: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="n_motor" render={({ field }) => (
            <FormItem>
              <FormLabel>N° Motor *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="n_chasis" render={({ field }) => (
            <FormItem>
              <FormLabel>N° Chasis *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="modelo" render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                <SelectContent>
                  {MODELOS_MOTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tipo_ingreso" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de ingreso *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Bajo pedido">Bajo pedido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="estado_logistico" render={({ field }) => (
          <FormItem>
            <FormLabel>Estado logístico inicial *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                {ESTADOS_LOGISTICO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dua_item" render={({ field }) => (
          <FormItem>
            <FormLabel>DUA - ITEM</FormLabel>
            <FormControl><Input {...field} placeholder="N° DUA - ITEM" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registrando...' : 'Registrar unidad'}
        </Button>
      </form>
    </Form>
  )
}
