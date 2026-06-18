// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milenium Motors</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa con tu cuenta</p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
