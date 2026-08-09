import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('Defina DATABASE_URL no .env (connection string do Neon).')
  process.exit(1)
}

const sql = neon(databaseUrl)

const rodaQuestions = [
  { id: 'saude', label: 'Saúde', type: 'scale', min: 0, max: 10 },
  { id: 'trabalho-financas', label: 'Trabalho / Finanças', type: 'scale', min: 0, max: 10 },
  { id: 'familia', label: 'Família', type: 'scale', min: 0, max: 10 },
  { id: 'amigos', label: 'Amigos', type: 'scale', min: 0, max: 10 },
  {
    id: 'relacionamento-amoroso',
    label: 'Relacionamento amoroso',
    type: 'scale',
    min: 0,
    max: 10,
  },
  { id: 'lazer', label: 'Lazer', type: 'scale', min: 0, max: 10 },
  { id: 'autocuidado', label: 'Autocuidado', type: 'scale', min: 0, max: 10 },
  { id: 'emocoes', label: 'Emoções', type: 'scale', min: 0, max: 10 },
  { id: 'sono', label: 'Sono', type: 'scale', min: 0, max: 10 },
  { id: 'futuro', label: 'Futuro', type: 'scale', min: 0, max: 10 },
]

async function main() {
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`

  await sql`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug          TEXT NOT NULL UNIQUE,
      title         TEXT NOT NULL,
      subtitle      TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL DEFAULT '',
      layout        TEXT NOT NULL DEFAULT 'list',
      questions     JSONB NOT NULL DEFAULT '[]'::jsonb,
      password_hash TEXT NOT NULL,
      active        BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS questionnaire_submissions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      questionnaire_id  UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      cpf               CHAR(11) NOT NULL,
      answers           JSONB NOT NULL,
      submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_questionnaire
      ON questionnaire_submissions (questionnaire_id)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_cpf
      ON questionnaire_submissions (cpf)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
      ON questionnaire_submissions (submitted_at DESC)
  `

  const password = process.env.Q_RODA_PASSWORD ?? 'roda2026'
  const passwordHash = await bcrypt.hash(password, 12)

  await sql`
    INSERT INTO questionnaires (
      slug, title, subtitle, description, layout, questions, password_hash, active
    ) VALUES (
      'roda-da-vida',
      'Roda da Vida',
      'Autoconhecimento',
      'Avalie cada área da sua vida de 0 a 10. O resultado ajuda a visualizar equilíbrio e prioridades no processo terapêutico.',
      'wheel',
      ${JSON.stringify(rodaQuestions)},
      ${passwordHash},
      TRUE
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      layout = EXCLUDED.layout,
      questions = EXCLUDED.questions::jsonb,
      password_hash = EXCLUDED.password_hash,
      active = TRUE,
      updated_at = NOW()
  `

  console.log('Schema aplicado e Roda da Vida seeded.')
  console.log(`Senha atual do questionário: ${password}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
