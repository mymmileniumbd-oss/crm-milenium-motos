// components/dashboard/inventario-cards.tsx
export function InventarioCards({
  inventario,
}: {
  inventario: { en_tienda: number; en_fibrero: number; pedidas: number }
}) {
  const items = [
    { label: 'En tienda', count: inventario.en_tienda, color: 'text-blue-600 bg-blue-50' },
    { label: 'En fibrero', count: inventario.en_fibrero, color: 'text-orange-600 bg-orange-50' },
    { label: 'Pedidas', count: inventario.pedidas, color: 'text-yellow-600 bg-yellow-50' },
  ]

  const total = inventario.en_tienda + inventario.en_fibrero + inventario.pedidas

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Inventario disponible</h2>
        <p className="text-sm text-gray-500">{total} unidades</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(i => (
          <div key={i.label} className={`rounded-lg p-3 text-center ${i.color}`}>
            <p className="text-3xl font-bold">{i.count}</p>
            <p className="text-sm mt-1">{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
