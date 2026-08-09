/** Tipos públicos do módulo de questionários (sem senha) */

export type QuestionType = 'scale' | 'text' | 'textarea'

export interface QuestionOption {
  id: string
  label: string
  min?: number
  max?: number
  type: QuestionType
  helper?: string
}

export interface QuestionnaireDefinition {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  questions: QuestionOption[]
  layout?: 'wheel' | 'list'
}

export interface QuestionnaireSubmission {
  id: string
  questionnaireId: string
  cpf: string
  answers: Record<string, number | string>
  submittedAt: string
}
