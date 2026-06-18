// components/nav/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bike, Users, BarChart3, Bell, ShieldCheck, FileText, FileWarning, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: BarChart3 },
  { href: '/ventas', label: 'Ventas', icon: LayoutDashboard },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
  { href: '/garantias', label: 'Garantías', icon: ShieldCheck },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/reclamos', label: 'Reclamos', icon: FileWarning },
]

export function Sidebar({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col h-screen border-r bg-white fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg text-gray-900">Milenium Motors</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
            {href === '/seguimientos' && seguimientosPendientes > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {seguimientosPendientes}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600">
            <LogOut size={16} /> Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
