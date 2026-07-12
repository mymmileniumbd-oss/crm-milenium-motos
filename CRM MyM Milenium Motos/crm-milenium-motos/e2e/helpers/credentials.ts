import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {}
  const vars: Record<string, string> = {}
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return vars
}

const fileVars = loadEnvFile(path.resolve(__dirname, '../../.env.e2e.local'))

function requireVar(name: string): string {
  const value = process.env[name] ?? fileVars[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name} para los tests E2E (ver .env.e2e.local)`)
  return value
}

export const VENDEDOR = {
  email: requireVar('E2E_VENDEDOR_EMAIL'),
  password: requireVar('E2E_VENDEDOR_PASSWORD'),
}

export const GERENTE = {
  email: requireVar('E2E_GERENTE_EMAIL'),
  password: requireVar('E2E_GERENTE_PASSWORD'),
}
