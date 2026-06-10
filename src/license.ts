import fs from 'fs'
import path from 'path'
import os from 'os'

const CACHE_DIR = path.join(os.homedir(), '.create-saas-ar')
const CACHE_FILE = path.join(CACHE_DIR, 'license')
const LICENSE_API = 'https://api.create-saas-ar.dev/licenses/validate'
const LICENSE_REGEX = /^CSAR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

export interface LicenseResult {
  valid: boolean
  error?: string
}

export async function validateLicense(license: string): Promise<LicenseResult> {
  const normalized = license.trim().toUpperCase()

  if (!LICENSE_REGEX.test(normalized)) {
    return {
      valid: false,
      error: 'Formato inválido. La licencia debe tener el formato CSAR-XXXX-XXXX-XXXX',
    }
  }

  const cached = readCache()
  if (cached === normalized) {
    return { valid: true }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(LICENSE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license: normalized }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return { valid: false, error: 'Licencia inválida o expirada' }
    }

    const data = (await response.json()) as { valid: boolean }
    if (data.valid) {
      writeCache(normalized)
      return { valid: true }
    }
    return { valid: false, error: 'Licencia inválida o expirada' }
  } catch {
    // Fail open: si la API no está disponible, aceptar la licencia
    writeCache(normalized)
    return { valid: true }
  }
}

function readCache(): string | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return fs.readFileSync(CACHE_FILE, 'utf-8').trim()
    }
  } catch {
    // ignore
  }
  return null
}

function writeCache(license: string): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(CACHE_FILE, license, 'utf-8')
  } catch {
    // ignore — no bloquear al usuario si no se puede escribir la caché
  }
}
