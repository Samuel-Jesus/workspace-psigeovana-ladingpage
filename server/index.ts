import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import bcrypt from 'bcryptjs'
import { getDb, type PublicQuestionnaire, type QuestionnaireRow } from './db'
import { isValidCpf, onlyDigits } from './cpf'
import { createUnlockToken, verifyUnlockToken } from './unlock'
import { createAdminToken, getAdminPassword, verifyAdminToken } from './admin'

const app = new Hono()

function requireAdmin(c: { req: { header: (name: string) => string | undefined } }) {
  const header = c.req.header('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return verifyAdminToken(token)
}

app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173', 'http://localhost:5199'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))

function toPublic(row: QuestionnaireRow): PublicQuestionnaire {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    layout: row.layout,
    questions: row.questions,
  }
}

app.get('/api/questionnaires', async (c) => {
  const sql = getDb()
  const rows = await sql`
    SELECT id, slug, title, subtitle, description, layout, questions
    FROM questionnaires
    WHERE active = TRUE
    ORDER BY created_at ASC
  `
  return c.json({ items: rows })
})

app.get('/api/questionnaires/:slug', async (c) => {
  const sql = getDb()
  const slug = c.req.param('slug')
  const rows = await sql`
    SELECT id, slug, title, subtitle, description, layout, questions, password_hash, active
    FROM questionnaires
    WHERE slug = ${slug} AND active = TRUE
    LIMIT 1
  `
  const row = rows[0] as QuestionnaireRow | undefined
  if (!row) return c.json({ error: 'Questionário não encontrado' }, 404)
  return c.json({ item: toPublic(row) })
})

app.post('/api/questionnaires/:slug/unlock', async (c) => {
  const sql = getDb()
  const slug = c.req.param('slug')
  const body = await c.req.json<{ cpf?: string; password?: string }>()
  const cpf = onlyDigits(body.cpf ?? '')
  const password = body.password ?? ''

  if (!isValidCpf(cpf)) {
    return c.json({ error: 'Informe um CPF válido.' }, 400)
  }
  if (!password) {
    return c.json({ error: 'Informe a senha do questionário.' }, 400)
  }

  const rows = await sql`
    SELECT id, slug, password_hash, active
    FROM questionnaires
    WHERE slug = ${slug} AND active = TRUE
    LIMIT 1
  `
  const row = rows[0] as Pick<QuestionnaireRow, 'id' | 'slug' | 'password_hash' | 'active'> | undefined
  if (!row) return c.json({ error: 'Questionário não encontrado' }, 404)

  const ok = await bcrypt.compare(password, row.password_hash)
  if (!ok) {
    return c.json({ error: 'Senha incorreta para este questionário.' }, 401)
  }

  const unlockToken = createUnlockToken(slug, cpf)
  return c.json({ ok: true, unlockToken, cpf })
})

app.post('/api/questionnaires/:slug/submit', async (c) => {
  const sql = getDb()
  const slug = c.req.param('slug')
  const body = await c.req.json<{
    unlockToken?: string
    answers?: Record<string, number | string>
  }>()

  const token = body.unlockToken ?? ''
  const unlocked = verifyUnlockToken(token, slug)
  if (!unlocked) {
    return c.json({ error: 'Sessão inválida ou expirada. Desbloqueie novamente.' }, 401)
  }

  if (!body.answers || typeof body.answers !== 'object') {
    return c.json({ error: 'Respostas inválidas.' }, 400)
  }

  const rows = await sql`
    SELECT id, questions
    FROM questionnaires
    WHERE slug = ${slug} AND active = TRUE
    LIMIT 1
  `
  const row = rows[0] as { id: string; questions: { id: string }[] } | undefined
  if (!row) return c.json({ error: 'Questionário não encontrado' }, 404)

  const requiredIds = Array.isArray(row.questions)
    ? row.questions.map((q) => q.id)
    : []

  for (const id of requiredIds) {
    const value = body.answers[id]
    if (typeof value !== 'number' || value < 1 || value > 10) {
      return c.json({ error: `Avalie a área "${id}" de 1 a 10.` }, 400)
    }
  }

  const inserted = await sql`
    INSERT INTO questionnaire_submissions (questionnaire_id, cpf, answers)
    VALUES (${row.id}, ${unlocked.cpf}, ${JSON.stringify(body.answers)})
    RETURNING id, submitted_at
  `

  const submission = inserted[0] as { id: string; submitted_at: string }
  return c.json({
    ok: true,
    id: submission.id,
    submittedAt: submission.submitted_at,
  })
})

app.post('/api/admin/login', async (c) => {
  const body = await c.req.json<{ password?: string }>()
  const expected = getAdminPassword()
  if (!expected) {
    return c.json({ error: 'ADMIN_PASSWORD não configurada no servidor.' }, 500)
  }
  if (!body.password || body.password !== expected) {
    return c.json({ error: 'Senha do painel incorreta.' }, 401)
  }
  return c.json({ ok: true, token: createAdminToken() })
})

app.get('/api/admin/submissions', async (c) => {
  if (!requireAdmin(c)) {
    return c.json({ error: 'Não autorizado.' }, 401)
  }

  const sql = getDb()
  const slug = c.req.query('slug') ?? ''
  const cpfRaw = c.req.query('cpf') ?? ''
  const cpf = onlyDigits(cpfRaw)

  const rows = slug
    ? cpf
      ? await sql`
          SELECT
            s.id,
            s.cpf,
            s.answers,
            s.submitted_at,
            q.slug,
            q.title,
            q.layout
          FROM questionnaire_submissions s
          JOIN questionnaires q ON q.id = s.questionnaire_id
          WHERE q.slug = ${slug} AND s.cpf = ${cpf}
          ORDER BY s.submitted_at DESC
          LIMIT 200
        `
      : await sql`
          SELECT
            s.id,
            s.cpf,
            s.answers,
            s.submitted_at,
            q.slug,
            q.title,
            q.layout
          FROM questionnaire_submissions s
          JOIN questionnaires q ON q.id = s.questionnaire_id
          WHERE q.slug = ${slug}
          ORDER BY s.submitted_at DESC
          LIMIT 200
        `
    : cpf
      ? await sql`
          SELECT
            s.id,
            s.cpf,
            s.answers,
            s.submitted_at,
            q.slug,
            q.title,
            q.layout
          FROM questionnaire_submissions s
          JOIN questionnaires q ON q.id = s.questionnaire_id
          WHERE s.cpf = ${cpf}
          ORDER BY s.submitted_at DESC
          LIMIT 200
        `
      : await sql`
          SELECT
            s.id,
            s.cpf,
            s.answers,
            s.submitted_at,
            q.slug,
            q.title,
            q.layout
          FROM questionnaire_submissions s
          JOIN questionnaires q ON q.id = s.questionnaire_id
          ORDER BY s.submitted_at DESC
          LIMIT 200
        `

  return c.json({ items: rows })
})

app.get('/api/admin/submissions/:id', async (c) => {
  if (!requireAdmin(c)) {
    return c.json({ error: 'Não autorizado.' }, 401)
  }

  const sql = getDb()
  const id = c.req.param('id')
  const rows = await sql`
    SELECT
      s.id,
      s.cpf,
      s.answers,
      s.submitted_at,
      q.id AS questionnaire_id,
      q.slug,
      q.title,
      q.subtitle,
      q.layout,
      q.questions
    FROM questionnaire_submissions s
    JOIN questionnaires q ON q.id = s.questionnaire_id
    WHERE s.id = ${id}
    LIMIT 1
  `

  const item = rows[0]
  if (!item) return c.json({ error: 'Resposta não encontrada.' }, 404)
  return c.json({ item })
})

const port = Number(process.env.API_PORT ?? 8787)
console.log(`API questionários em http://localhost:${port}`)
serve({ fetch: app.fetch, port })
