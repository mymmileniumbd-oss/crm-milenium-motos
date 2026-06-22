// app/(gerente)/layout.tsx
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/nav/sidebar'
import { signOut } from '@/app/(auth)/login/actions'

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5">
        <div className="flex items-center gap-3">
          <BrandMark size={34} />
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight">Milenium Motos · CRM</div>
            <div className="text-[11px] font-semibold text-muted-foreground">Dashboard · Gerente</div>
          </div>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <LogOut size={16} /> Salir
          </Button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  )
}
