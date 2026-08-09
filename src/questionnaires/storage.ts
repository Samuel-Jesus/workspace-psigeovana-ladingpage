import type { QuestionnaireStorage, QuestionnaireSubmission } from './types'

const STORAGE_KEY = 'psigeovana.questionnaire.submissions'

/**
 * Storage temporário em localStorage.
 * Quando o banco estiver pronto, troque a implementação em `getStorage()`
 * por um cliente HTTP / Supabase / etc. sem alterar as páginas.
 */
const localStorageAdapter: QuestionnaireStorage = {
  async submit(data) {
    const entry: QuestionnaireSubmission = {
      ...data,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    const list: QuestionnaireSubmission[] = raw ? JSON.parse(raw) : []
    list.push(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))

    // TODO: POST /api/questionnaires/submissions quando o backend existir
    return entry
  },

  async listByQuestionnaire(questionnaireId) {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: QuestionnaireSubmission[] = raw ? JSON.parse(raw) : []
    return list.filter((s) => s.questionnaireId === questionnaireId)
  },
}

export function getStorage(): QuestionnaireStorage {
  return localStorageAdapter
}
