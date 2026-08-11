/**
 * Base da API.
 * - Local (vazio): `/api/...` via proxy do Vite
 * - Produção (Vercel): `VITE_API_URL` = URL do Render, sem barra no final
 *   ex.: https://workspace-psigeovana-service.onrender.com
 */
export function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}/api${suffix}`
}
