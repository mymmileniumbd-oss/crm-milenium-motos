// components/unidades/estado-badges.tsx

const colorLogistico: Record<string, string> = {
  'Pedida': 'bg-yellow-100 text-yellow-800',
  'En fibrero': 'bg-orange-100 text-orange-800',
  'En tienda': 'bg-blue-100 text-blue-800',
}

const colorComercial: Record<string, string> = {
  'Disponible': 'bg-gray-100 text-gray-600',
  'Separada': 'bg-purple-100 text-purple-800',
  'Vendida': 'bg-green-100 text-green-800',
  'Entregada': 'bg-emerald-100 text-emerald-800',
}

export function BadgeLogistico({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorLogistico[estado] ?? 'bg-gray-100 text-gray-600'}`}>
      {estado}
    </span>
  )
}

export function BadgeComercial({ estado }: { estado: string | null }) {
  const label = estado ?? 'Disponible'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorComercial[label] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  )
}

export function BadgeEstadoPago({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    'Pendiente': 'bg-red-100 text-red-700',
    'Parcial': 'bg-yellow-100 text-yellow-700',
    'Pagado': 'bg-green-100 text-green-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[estado] ?? ''}`}>
      {estado}
    </span>
  )
}
