/**
 * Base da API.
 * - Local (vazio): `/api/...` via proxy do Vite
 * - Produção (Vercel): `VITE_API_URL` = URL do Render, sem barra no final
 */
export function getApiBase() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
}

export function apiUrl(path: string) {
  const base = getApiBase()
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}/api${suffix}`
}

/** Mensagem para o usuário; detalhes técnicos só no console em desenvolvimento. */
export function apiConnectionError(context: string, cause?: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[api] ${context}`, {
      url: getApiBase() || '(relativo /api)',
      cause,
    })
    return new Error(
      'Não foi possível conectar à API. Rode `npm run dev` ou confira VITE_API_URL / CORS.',
    )
  }
  return new Error(
    'Não foi possível conectar ao servidor. Tente novamente em instantes.',
  )
}

export function apiUnavailableError(context: string, status?: number) {
  if (import.meta.env.DEV) {
    console.error(`[api] ${context}`, { status, url: getApiBase() || '(relativo /api)' })
    return new Error(
      status
        ? `API indisponível (${status}). Confira Render e VITE_API_URL.`
        : 'Resposta inválida da API.',
    )
  }
  return new Error(
    'O serviço está temporariamente indisponível. Tente novamente em instantes.',
  )
}

export function apiRequestError(serverMessage: string | undefined, status: number) {
  if (serverMessage) return new Error(serverMessage)
  if (import.meta.env.DEV) {
    return new Error(`Falha na requisição (${status})`)
  }
  return new Error('Não foi possível concluir a solicitação. Tente novamente.')
}
