// components/nav/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bike, Users, BarChart3, Bell } from 'lucide-react'

const navItems = [
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: BarChart3 },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
]

export function BottomNav({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              pathname.startsWith(href) ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            <div className="relative">
              <Icon size={20} />
              {href === '/seguimientos' && seguimientosPendientes > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {seguimientosPendientes}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
