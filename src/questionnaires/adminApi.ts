import type { QuestionOption } from './types'
import type { PublicQuestionnaire } from './api'
import {
  apiConnectionError,
  apiRequestError,
  apiUnavailableError,
  apiUrl,
} from './apiBase'

export type AdminSubmissionSummary = {
  id: string
  cpf: string
  answers: Record<string, number | string>
  submitted_at: string
  slug: string
  title: string
  layout: 'wheel' | 'list'
}

export type AdminSubmissionDetail = AdminSubmissionSummary & {
  questionnaire_id: string
  subtitle: string
  questions: QuestionOption[]
}

const ADMIN_TOKEN_KEY = 'psigeovana.admin.token'

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken()
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    })
  } catch (cause) {
    throw apiConnectionError(`admin fetch ${path}`, cause)
  }

  const text = await res.text()
  let data: T & { error?: string }
  try {
    data = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string })
  } catch {
    throw apiUnavailableError(`admin parse ${path}`, res.status)
  }

  if (!res.ok) {
    throw apiRequestError(data.error, res.status)
  }
  return data
}

export function adminLogin(password: string) {
  return adminApi<{ ok: true; token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }).then((r) => {
    setAdminToken(r.token)
    return r
  })
}

export function listAdminSubmissions(params?: { slug?: string; cpf?: string }) {
  const q = new URLSearchParams()
  if (params?.slug) q.set('slug', params.slug)
  if (params?.cpf) q.set('cpf', params.cpf)
  const qs = q.toString()
  return adminApi<{ items: AdminSubmissionSummary[] }>(
    `/admin/submissions${qs ? `?${qs}` : ''}`,
  ).then((r) => r.items)
}

export function getAdminSubmission(id: string) {
  return adminApi<{ item: AdminSubmissionDetail }>(`/admin/submissions/${id}`).then(
    (r) => r.item,
  )
}

export type { PublicQuestionnaire }
