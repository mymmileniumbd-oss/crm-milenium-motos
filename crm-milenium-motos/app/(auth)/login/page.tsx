// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-card">
      {/* Panel de marca */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-[#14367f] p-12 lg:flex">
        <div className="absolute -right-36 -top-32 h-[420px] w-[420px] rounded-full bg-card/[0.06]" />
        <div className="absolute -bottom-16 -left-20 h-[240px] w-[240px] rounded-full bg-brand-red/[0.22]" />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-card">
            <span className="text-xl font-extrabold text-brand">M</span>
            <span className="absolute -bottom-[3px] -right-[3px] h-[13px] w-[13px] rounded-[5px] border-2 border-brand bg-brand-red" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">Milenium Motos</span>
        </div>

        <div className="relative">
          <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-white">
            Tu concesionaria,
            <br />
            en una sola pantalla.
          </h2>
          <p className="mt-3.5 max-w-[340px] text-[15px] leading-relaxed text-white/70">
            Unidades, clientes, ventas y post-venta TVS — gestionados desde cualquier dispositivo.
          </p>
        </div>

        <div className="relative font-mono text-xs text-white/55">
          Distribuidor autorizado · TVS
        </div>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">Iniciar sesión</h1>
          <p className="mb-7 mt-1.5 text-sm text-muted-foreground">
            Ingresa con tu cuenta de vendedor.
          </p>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vendedor@mileniummotos.pe"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="h-12 w-full text-[15px]" disabled={pending}>
              {pending ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 text-center font-mono text-xs text-muted-foreground/70">
            Milenium Motos CRM · v2.0
          </div>
        </div>
      </div>
    </div>
  )
}
