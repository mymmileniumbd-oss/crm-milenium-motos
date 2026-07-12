// lib/utils/format.ts
const formatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

export function formatSoles(amount: number): string {
  // Replace non-breaking space (U+00A0) with regular space for consistent output
  return formatter.format(amount).replace(/ /g, ' ')
}
