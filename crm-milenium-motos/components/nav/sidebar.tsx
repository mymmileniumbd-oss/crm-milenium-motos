// components/nav/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Bike,
  Users,
  Columns3,
  Bell,
  ShieldCheck,
  FileText,
  OctagonAlert,
  ReceiptText,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/unidades', label: 'Unidades', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/prospectos', label: 'Prospectos', icon: Columns3 },
  { href: '/ventas', label: 'Ventas', icon: ReceiptText },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
  { href: '/garantias', label: 'Garantías', icon: ShieldCheck },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/reclamos', label: 'Reclamos', icon: OctagonAlert },
]

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-[9px] bg-brand text-white shadow-[0_4px_12px_rgba(31,86,214,0.35)]"
      style={{ width: size, height: size }}
    >
      <span className="font-extrabold leading-none" style={{ fontSize: size * 0.5 }}>
        M
      </span>
      <span className="absolute -bottom-[3px] -right-[3px] h-3 w-3 rounded-[4px] border-2 border-white bg-brand-red" />
    </div>
  )
}

export function Sidebar({ seguimientosPendientes = 0 }: { seguimientosPendientes?: number }) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[236px] flex-col border-r border-border bg-card px-3.5 py-[18px] md:flex">
      <div className="flex items-center gap-2.5 px-2 pb-[18px]">
        <BrandMark />
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight">Milenium</div>
          <div className="text-[11px] font-semibold text-muted-foreground">Motos · TVS</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-accent font-bold text-accent-foreground'
                  : 'font-semibold text-secondary-foreground/70 hover:bg-secondary hover:text-foreground'
              )}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" />
              )}
              <Icon size={18} />
              <span>{label}</span>
              {href === '/seguimientos' && seguimientosPendientes > 0 && (
                <span className="ml-auto rounded-full bg-brand-red px-1.5 py-px text-[11px] font-bold text-white">
                  {seguimientosPendientes}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-2 border-t border-border pt-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-foreground">
            MM
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[13px] font-bold">Vendedor</div>
            <div className="text-[11px] text-muted-foreground">Milenium Motos</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
