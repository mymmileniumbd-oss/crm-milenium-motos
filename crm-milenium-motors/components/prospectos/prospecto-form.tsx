// components/prospectos/prospecto-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prospectoSchema, type ProspectoFormValues } from '@/lib/validations/prospecto'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MODELOS_MOTO, ORIGENES_PROSPECTO, ETAPAS_PROSPECTO } from '@/lib/constants'

interface Props {
  defaultValues?: Partial<ProspectoFormValues>
  onSubmit: (data: ProspectoFormValues) => Promise<void>
  submitLabel?: string
}

export function ProspectoForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: Props) {
  const form = useForm<ProspectoFormValues>({
    resolver: zodResolver(prospectoSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      etapa: 'Interesado',
      notas: '',
      modelo_interes: null,
      origen: null,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl><Input {...field} placeholder="Nombre completo" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl><Input {...field} placeholder="Número de teléfono" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="modelo_interes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo de interés</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin definir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODELOS_MOTO.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin definir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORIGENES_PROSPECTO.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="etapa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etapa</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ETAPAS_PROSPECTO.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="Observaciones sobre el prospecto" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
