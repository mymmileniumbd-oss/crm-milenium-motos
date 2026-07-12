// components/pwa/service-worker-register.tsx
'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registro falló (navegador sin soporte, entorno no seguro, etc.).
      // No es crítico para el funcionamiento de la app: se ignora en silencio.
    })
  }, [])

  return null
}
