// components/clientes/cliente-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clienteSchema, type ClienteFormValues } from '@/lib/validations/cliente'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  defaultValues?: Partial<ClienteFormValues>
  onSubmit: (data: ClienteFormValues) => Promise<void>
  submitLabel?: string
}

export function ClienteForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: Props) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre_completo: '', dni: '', direccion: '', telefono: '', correo: '', ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data }))} className="space-y-4">
        <FormField control={form.control} name="nombre_completo" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo *</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dni" render={({ field }) => (
          <FormItem>
            <FormLabel>DNI *</FormLabel>
            <FormControl><Input {...field} maxLength={8} placeholder="8 dígitos" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="telefono" render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="direccion" render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="correo" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo</FormLabel>
            <FormControl><Input {...field} type="email" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
