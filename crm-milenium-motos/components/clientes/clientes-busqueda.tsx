'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export function ClientesBusqueda() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [valor, setValor] = useState(params.get('q') ?? '')

  useEffect(() => {
    const delay = setTimeout(() => {
      startTransition(() => {
        router.push(valor ? `?q=${encodeURIComponent(valor)}` : '?')
      })
    }, 300)
    return () => clearTimeout(delay)
  }, [valor, router])

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar por nombre o DNI..."
        value={valor}
        onChange={e => setValor(e.target.value)}
        className="pl-8 pr-3 py-1.5 border rounded-md text-sm bg-card focus:outline-none focus:ring-1 focus:ring-gray-300 w-64"
      />
    </div>
  )
}
