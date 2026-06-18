// app/(gerente)/layout.tsx
import { LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/login/actions'

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <LayoutDashboard size={20} />
          Milenium Motors — Dashboard
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <LogOut size={16} /> Salir
          </Button>
        </form>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
