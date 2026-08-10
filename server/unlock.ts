import { createHmac, timingSafeEqual } from 'node:crypto'

type UnlockPayload = {
  slug: string
  cpf: string
  exp: number
}

function secret() {
  const s = process.env.UNLOCK_SECRET
  if (!s) throw new Error('UNLOCK_SECRET não configurada')
  return s
}

export function createUnlockToken(slug: string, cpf: string, ttlSeconds = 60 * 60 * 2) {
  const payload: UnlockPayload = {
    slug,
    cpf,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyUnlockToken(
  token: string,
  expectedSlug: string,
): { cpf: string } | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = createHmac('sha256', secret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as UnlockPayload
    if (payload.slug !== expectedSlug) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (!/^\d{11}$/.test(payload.cpf)) return null
    return { cpf: payload.cpf }
  } catch {
    return null
  }
}
