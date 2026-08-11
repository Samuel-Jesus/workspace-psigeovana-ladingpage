import type { QuestionOption } from './types'
import {
  apiConnectionError,
  apiRequestError,
  apiUnavailableError,
  apiUrl,
} from './apiBase'

export type PublicQuestionnaire = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  layout: 'wheel' | 'list'
  questions: QuestionOption[]
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch (cause) {
    throw apiConnectionError(`fetch ${path}`, cause)
  }

  const text = await res.text()
  let data: T & { error?: string }
  try {
    data = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string })
  } catch {
    throw apiUnavailableError(`parse ${path}`, res.status)
  }

  if (!res.ok) {
    throw apiRequestError(data.error, res.status)
  }
  return data
}

export function listQuestionnaires() {
  return api<{ items: PublicQuestionnaire[] }>('/questionnaires').then((r) => r.items)
}

export function getQuestionnaireBySlug(slug: string) {
  return api<{ item: PublicQuestionnaire }>(`/questionnaires/${slug}`).then((r) => r.item)
}

export function unlockQuestionnaire(slug: string, cpf: string, password: string) {
  return api<{ ok: true; unlockToken: string; cpf: string }>(
    `/questionnaires/${slug}/unlock`,
    {
      method: 'POST',
      body: JSON.stringify({ cpf, password }),
    },
  )
}

export function submitQuestionnaire(
  slug: string,
  unlockToken: string,
  answers: Record<string, number | string>,
) {
  return api<{ ok: true; id: string; submittedAt: string }>(
    `/questionnaires/${slug}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ unlockToken, answers }),
    },
  )
}
