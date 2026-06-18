// app/(vendedor)/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/nav/sidebar'
import { BottomNav } from '@/components/nav/bottom-nav'

async function getSeguimientosPendientesCount(): Promise<number> {
  try {
    const supabase = createServerClient()
    const { count } = await supabase
      .from('ventas')
      .select('*', { count: 'exact', head: true })
      .lte('fecha_venta', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .eq('seguimiento_7dias_hecho', false)
    return count ?? 0
  } catch {
    return 0
  }
}

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const count = await getSeguimientosPendientesCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar seguimientosPendientes={count} />
      <main className="md:ml-56 pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </main>
      <BottomNav seguimientosPendientes={count} />
    </div>
  )
}
