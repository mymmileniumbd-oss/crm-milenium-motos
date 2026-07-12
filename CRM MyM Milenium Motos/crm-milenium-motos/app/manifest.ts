import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRM Milenium Motos',
    short_name: 'Milenium',
    description: 'Sistema CRM para Milenium Motors',
    start_url: '/',
    display: 'standalone',
    lang: 'es',
    background_color: '#f6f7f9',
    theme_color: '#1F56D6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
