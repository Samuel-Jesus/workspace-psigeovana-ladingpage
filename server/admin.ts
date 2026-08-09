import { createHmac, timingSafeEqual } from 'node:crypto'

type AdminPayload = {
  role: 'admin'
  exp: number
}

function secret() {
  const s = process.env.UNLOCK_SECRET
  if (!s) throw new Error('UNLOCK_SECRET não configurada')
  return s
}

export function createAdminToken(ttlSeconds = 60 * 60 * 12) {
  const payload: AdminPayload = {
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret()).update(`admin:${body}`).digest('base64url')
  return `${body}.${sig}`
}

export function verifyAdminToken(token: string): boolean {
  const [body, sig] = token.split('.')
  if (!body || !sig) return false

  const expected = createHmac('sha256', secret()).update(`admin:${body}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminPayload
    if (payload.role !== 'admin') return false
    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? ''
}
