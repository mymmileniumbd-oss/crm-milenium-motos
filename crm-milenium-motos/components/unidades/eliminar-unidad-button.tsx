'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { eliminarUnidad } from '@/lib/actions/unidades'

export function EliminarUnidadButton({ id, nMotor }: { id: string; nMotor: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const confirmar = window.confirm(`¿Eliminar la unidad ${nMotor}? Esta acción no se puede deshacer.`)
    if (!confirmar) return

    setLoading(true)
    try {
      await eliminarUnidad(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la unidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Eliminar unidad"
    >
      <Trash2 size={15} />
    </button>
  )
}
