// app/offline/page.tsx
// Fallback estático mostrado por el service worker (public/sw.js) cuando
// una navegación falla por falta de red. Sin Supabase, sin 'use client'.
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-[14px] bg-brand text-white shadow-[0_4px_12px_rgba(31,86,214,0.35)]">
        <WifiOff size={26} />
        <span className="absolute -bottom-[3px] -right-[3px] h-3.5 w-3.5 rounded-[5px] border-2 border-background bg-brand-red" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-extrabold tracking-tight">Sin conexión</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          No se pudo cargar esta página. Verifica tu conexión a internet e inténtalo de nuevo.
        </p>
      </div>

      <Button asChild>
        <a href="/">Reintentar</a>
      </Button>
    </div>
  )
}
