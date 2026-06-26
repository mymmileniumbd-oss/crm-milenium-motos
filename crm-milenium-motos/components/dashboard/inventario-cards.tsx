// components/dashboard/inventario-cards.tsx
export function InventarioCards({
  inventario,
}: {
  inventario: { en_tienda: number; en_fibrero: number; pedidas: number }
}) {
  const items = [
    { label: 'En tienda', count: inventario.en_tienda, bg: '#eaf0fe', fg: '#1c52c4' },
    { label: 'En fibrero', count: inventario.en_fibrero, bg: '#fdeede', fg: '#b5560f' },
    { label: 'Pedidas', count: inventario.pedidas, bg: '#fcf3d4', fg: '#8a6310' },
  ]

  const total = inventario.en_tienda + inventario.en_fibrero + inventario.pedidas

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-extrabold">Inventario disponible</h2>
        <p className="text-[13px] font-semibold text-muted-foreground">{total} unidades</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((i) => (
          <div
            key={i.label}
            className="rounded-[10px] p-4 text-center"
            style={{ backgroundColor: i.bg, color: i.fg }}
          >
            <p className="text-[26px] font-extrabold tabular-nums">{i.count}</p>
            <p className="mt-0.5 text-xs font-bold">{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
