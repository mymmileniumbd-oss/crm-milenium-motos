// components/nav/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Bike, Users, Columns3 } from 'lucide-react'

const navItems = [
  { href: '/panel', label: 'Panel', icon: LayoutDashboard },
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: Columns3 },
]

export function BottomNav({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex px-1.5 pb-3 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-1 text-[10px] transition-colors',
                active ? 'font-bold text-brand' : 'font-semibold text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon size={21} />
                {href === '/seguimientos' && seguimientosPendientes > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
                    {seguimientosPendientes}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
