// components/unidades/estado-badges.tsx
// Badges de estado — pill redondeado con punto de color (Claude Design).

type Tone = 'green' | 'blue' | 'indigo' | 'orange' | 'amber' | 'red' | 'gray'

const tones: Record<Tone, { bg: string; fg: string; dot: string }> = {
  green: { bg: '#e3f5ec', fg: '#157a4d', dot: '#1faa6a' },
  blue: { bg: '#eaf0fe', fg: '#1c52c4', dot: '#2c6bdc' },
  indigo: { bg: '#e6edff', fg: '#2348b8', dot: '#3a64d8' },
  orange: { bg: '#fdeede', fg: '#b5560f', dot: '#e07f2f' },
  amber: { bg: '#fcf3d4', fg: '#8a6310', dot: '#d8a72b' },
  red: { bg: '#fdeaea', fg: '#c2342f', dot: '#e23b3b' },
  gray: { bg: '#f1f3f7', fg: '#5b6472', dot: '#8a93a3' },
}

export function EstadoBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = tones[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: t.dot }} />
      {children}
    </span>
  )
}

const logisticoTone: Record<string, Tone> = {
  'Pedida': 'amber',
  'En fibrero': 'orange',
  'En tienda': 'blue',
  'Disponible': 'green',
}

const comercialTone: Record<string, Tone> = {
  'Disponible': 'green',
  'Separada': 'amber',
  'Vendida': 'green',
  'Entregada': 'indigo',
}

const pagoTone: Record<string, Tone> = {
  'Pendiente': 'red',
  'Parcial': 'amber',
  'Pagado': 'green',
}

export function BadgeLogistico({ estado }: { estado: string }) {
  return <EstadoBadge tone={logisticoTone[estado] ?? 'gray'}>{estado}</EstadoBadge>
}

export function BadgeComercial({ estado }: { estado: string | null }) {
  const label = estado ?? 'Disponible'
  return <EstadoBadge tone={comercialTone[label] ?? 'gray'}>{label}</EstadoBadge>
}

export function BadgeEstadoPago({ estado }: { estado: string }) {
  return <EstadoBadge tone={pagoTone[estado] ?? 'gray'}>{estado}</EstadoBadge>
}
