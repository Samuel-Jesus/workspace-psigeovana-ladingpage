/** Tipos do módulo de questionários */

export type QuestionType = 'scale' | 'text' | 'textarea'

export interface QuestionOption {
  id: string
  label: string
  /** Para escala 0–10, etc. */
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
  /** Senha de acesso — depois virá do banco */
  accessPassword: string
  questions: QuestionOption[]
  /** Layout especial: roda visual */
  layout?: 'wheel' | 'list'
}

export interface QuestionnaireSubmission {
  id: string
  questionnaireId: string
  cpf: string
  answers: Record<string, number | string>
  submittedAt: string
}

export interface QuestionnaireStorage {
  submit(data: Omit<QuestionnaireSubmission, 'id' | 'submittedAt'>): Promise<QuestionnaireSubmission>
  listByQuestionnaire?(questionnaireId: string): Promise<QuestionnaireSubmission[]>
}
