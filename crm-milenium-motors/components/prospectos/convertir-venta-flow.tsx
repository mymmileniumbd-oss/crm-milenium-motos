// components/prospectos/convertir-venta-flow.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { convertirEnVenta } from '@/lib/actions/prospectos'
import { ClienteForm } from '@/components/clientes/cliente-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { ClienteFormValues } from '@/lib/validations/cliente'

// Schema para la venta sin cliente_id
const ventaSinClienteSchema = z.object({
  tipo_venta: z.enum(['Contado', 'Separación']),
  fecha_venta: z.string().min(1, 'La fecha de venta es requerida'),
  precio_venta: z.number().min(0, 'El precio no puede ser negativo'),
  documento_tipo: z.enum(['Factura', 'Boleta']).optional().nullable(),
  documento_numero: z.string().optional(),
})

type VentaSinClienteValues = z.infer<typeof ventaSinClienteSchema>

interface Props {
  prospecto: { id: string; nombre: string; telefono: string | null; modelo_interes: string | null }
  unidadesDisponibles: { id: string; n_motor: string; modelo: string; n_chasis: string }[]
}

type Paso = 'cliente' | 'unidad' | 'venta'

export function ConvertirVentaFlow({ prospecto, unidadesDisponibles }: Props) {
  const [paso, setPaso] = useState<Paso>('cliente')
  const [clienteData, setClienteData] = useState<ClienteFormValues | null>(null)
  const [unidadId, setUnidadId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ventaForm = useForm<VentaSinClienteValues>({
    resolver: zodResolver(ventaSinClienteSchema),
    defaultValues: {
      tipo_venta: 'Contado',
      fecha_venta: new Date().toISOString().split('T')[0],
      precio_venta: 0,
    },
  })

  async function handleClienteSubmit(data: ClienteFormValues) {
    setClienteData(data)
    setPaso('unidad')
  }

  async function handleVentaSubmit(data: VentaSinClienteValues) {
    if (!clienteData || !unidadId) return
    setLoading(true)
    setError('')
    try {
      await convertirEnVenta(prospecto.id, clienteData, unidadId, {
        tipo_venta: data.tipo_venta,
        fecha_venta: data.fecha_venta,
        precio_venta: data.precio_venta,
        documento_tipo: data.documento_tipo,
        documento_numero: data.documento_numero,
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        throw e  // Re-throw NEXT_REDIRECT so Next.js can handle the redirect
      }
      setLoading(false)
    }
  }

  const pasos = ['cliente', 'unidad', 'venta'] as const
  const pasosLabels: Record<Paso, string> = { cliente: '1. Cliente', unidad: '2. Unidad', venta: '3. Venta' }

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex gap-4 border-b pb-3">
        {pasos.map(p => (
          <span key={p} className={`text-sm font-medium ${paso === p ? 'text-blue-700 underline' : 'text-gray-400'}`}>
            {pasosLabels[p]}
          </span>
        ))}
      </div>

      {/* Paso 1: Cliente */}
      {paso === 'cliente' && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold mb-4">Datos del cliente</h3>
          <ClienteForm
            defaultValues={{ nombre_completo: prospecto.nombre, telefono: prospecto.telefono ?? '' }}
            onSubmit={handleClienteSubmit}
            submitLabel="Siguiente →"
          />
        </div>
      )}

      {/* Paso 2: Unidad */}
      {paso === 'unidad' && (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Seleccionar unidad disponible</h3>
          {prospecto.modelo_interes && (
            <p className="text-sm text-gray-500">
              Modelo de interés: <strong>{prospecto.modelo_interes}</strong>
            </p>
          )}
          {unidadesDisponibles.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              No hay unidades disponibles{prospecto.modelo_interes ? ` para el modelo ${prospecto.modelo_interes}` : ''}.
            </p>
          ) : (
            <div>
              <Label>Unidad disponible *</Label>
              <Select value={unidadId} onValueChange={setUnidadId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {unidadesDisponibles.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.modelo} — Motor: {u.n_motor} — Chasis: {u.n_chasis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPaso('cliente')}>← Atrás</Button>
            <Button
              onClick={() => unidadId && setPaso('venta')}
              disabled={!unidadId}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Venta */}
      {paso === 'venta' && (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Registrar venta</h3>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">{error}</p>
          )}
          <Form {...ventaForm}>
            <form onSubmit={ventaForm.handleSubmit(handleVentaSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ventaForm.control} name="tipo_venta" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Contado">Contado</SelectItem>
                        <SelectItem value="Separación">Separación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={ventaForm.control} name="fecha_venta" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha venta *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={ventaForm.control} name="precio_venta" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de venta (S/) *</FormLabel>
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
                <FormField control={ventaForm.control} name="documento_tipo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Sin documento" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Factura">Factura</SelectItem>
                        <SelectItem value="Boleta">Boleta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={ventaForm.control} name="documento_numero" render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Documento</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setPaso('unidad')}>← Atrás</Button>
                <Button type="submit" disabled={loading || ventaForm.formState.isSubmitting}>
                  {loading || ventaForm.formState.isSubmitting ? 'Registrando...' : 'Confirmar venta'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}
