import { neon } from '@neondatabase/serverless'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL não configurada')
  }
  return neon(url)
}

export type QuestionnaireRow = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  layout: 'wheel' | 'list'
  questions: unknown
  password_hash: string
  active: boolean
}

export type PublicQuestionnaire = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  layout: 'wheel' | 'list'
  questions: unknown
}
