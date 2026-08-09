import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import bcrypt from 'bcryptjs'
import { getDb, type PublicQuestionnaire, type QuestionnaireRow } from './db'
import { isValidCpf, onlyDigits } from './cpf'
import { createUnlockToken, verifyUnlockToken } from './unlock'

const app = new Hono()

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

const port = Number(process.env.API_PORT ?? 8787)
console.log(`API questionários em http://localhost:${port}`)
serve({ fetch: app.fetch, port })
