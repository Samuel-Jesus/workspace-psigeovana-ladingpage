import type { QuestionOption } from './types'
import { apiUrl } from './apiBase'

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
  } catch {
    throw new Error(
      'Não foi possível conectar à API. No local, rode `npm run dev`. Em produção, confira VITE_API_URL.',
    )
  }

  const text = await res.text()
  let data: T & { error?: string }
  try {
    data = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string })
  } catch {
    throw new Error(
      res.ok
        ? 'Resposta inválida da API.'
        : 'API indisponível. Confira se o serviço no Render está no ar e se VITE_API_URL está correta.',
    )
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Falha na requisição (${res.status})`)
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
