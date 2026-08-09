import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  adminLogin,
  clearAdminToken,
  getAdminSubmission,
  getAdminToken,
  listAdminSubmissions,
  type AdminSubmissionDetail,
  type AdminSubmissionSummary,
} from '../questionnaires/adminApi'
import { formatCpf, onlyDigits } from '../questionnaires/cpf'
import { WheelChart, WHEEL_COLORS } from '../components/questionnaire/WheelChart'
import { LetterBackdrop } from '../components/LetterBackdrop'
import './Questionnaires.css'
import './AdminPanel.css'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function averageScores(answers: Record<string, number | string>) {
  const nums = Object.values(answers).filter((v): v is number => typeof v === 'number')
  if (!nums.length) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

export function AdminPanelPage() {
  const { submissionId } = useParams<{ submissionId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [items, setItems] = useState<AdminSubmissionSummary[]>([])
  const [detail, setDetail] = useState<AdminSubmissionDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const slugFilter = searchParams.get('slug') ?? 'roda-da-vida'
  const cpfFilter = searchParams.get('cpf') ?? ''

  const loadList = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminSubmissions({
        slug: slugFilter || undefined,
        cpf: cpfFilter ? onlyDigits(cpfFilter) : undefined,
      })
      setItems(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar'
      setError(msg)
      if (msg.toLowerCase().includes('autorizado')) {
        clearAdminToken()
        setAuthed(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authed) return
    if (submissionId) {
      setLoading(true)
      setError('')
      getAdminSubmission(submissionId)
        .then(setDetail)
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar'
          setError(msg)
          setDetail(null)
          if (msg.toLowerCase().includes('autorizado')) {
            clearAdminToken()
            setAuthed(false)
          }
        })
        .finally(() => setLoading(false))
      return
    }
    void loadList()
  }, [authed, submissionId, slugFilter, cpfFilter])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoggingIn(true)
    try {
      await adminLogin(password)
      setAuthed(true)
      setPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoggingIn(false)
    }
  }

  const segments = useMemo(() => {
    if (!detail) return []
    const questions = Array.isArray(detail.questions) ? detail.questions : []
    return questions.map((q) => ({
      id: q.id,
      label: q.label.replace(' / ', '/'),
      color: WHEEL_COLORS[q.id] ?? '#8c67ac',
      value: typeof detail.answers[q.id] === 'number' ? (detail.answers[q.id] as number) : 0,
    }))
  }, [detail])

  if (!authed) {
    return (
      <div className="admin-page">
        <LetterBackdrop variant="services" tone="light" />
        <div className="admin-page__inner admin-page__inner--narrow">
          <span className="tag tag--light">Painel</span>
          <h1 className="admin-page__title display">Área da psicóloga</h1>
          <p className="admin-page__lead">
            Acesse com a senha do painel para ver quem respondeu e o histórico
            da Roda da Vida.
          </p>
          <form className="admin-login" onSubmit={handleLogin}>
            <label className="q-field">
              <span>Senha do painel</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError && (
              <p className="q-unlock__error" role="alert">
                {loginError}
              </p>
            )}
            <button type="submit" className="q-btn q-btn--primary" disabled={loggingIn}>
              {loggingIn ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (submissionId) {
    return (
      <div className="admin-page">
        <LetterBackdrop variant="hero" tone="light" />
        <div className="admin-page__inner">
          <div className="admin-toolbar">
            <Link to="/painel" className="q-back">
              ← Voltar ao histórico
            </Link>
            <button
              type="button"
              className="admin-logout"
              onClick={() => {
                clearAdminToken()
                setAuthed(false)
                navigate('/painel')
              }}
            >
              Sair
            </button>
          </div>

          {loading && <p className="admin-page__lead">Carregando…</p>}
          {error && (
            <p className="q-unlock__error" role="alert">
              {error}
            </p>
          )}

          {detail && !loading && (
            <article className="admin-detail">
              <header className="admin-detail__header">
                <span className="tag tag--light">{detail.title}</span>
                <h1 className="admin-page__title display">
                  CPF {formatCpf(detail.cpf)}
                </h1>
                <p className="admin-page__lead">
                  Enviado em {formatDate(detail.submitted_at)}
                  {averageScores(detail.answers) != null &&
                    ` · média ${averageScores(detail.answers)}`}
                </p>
              </header>

              {detail.layout === 'wheel' && segments.length > 0 && (
                <div className="admin-detail__wheel">
                  <WheelChart segments={segments} readOnly size={380} />
                </div>
              )}

              <ul className="admin-scores">
                {segments.map((s) => (
                  <li key={s.id}>
                    <span
                      className="admin-scores__swatch"
                      style={{ background: s.color }}
                    />
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                  </li>
                ))}
              </ul>

              {typeof detail.answers.observacoes === 'string' &&
                detail.answers.observacoes && (
                  <div className="admin-notes">
                    <h2 className="display">Observações</h2>
                    <p>{detail.answers.observacoes}</p>
                  </div>
                )}

              <section className="admin-history">
                <h2 className="display">Outras respostas deste CPF</h2>
                <HistoryForCpf
                  cpf={detail.cpf}
                  slug={detail.slug}
                  currentId={detail.id}
                />
              </section>
            </article>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <LetterBackdrop variant="services" tone="light" />
      <div className="admin-page__inner">
        <div className="admin-toolbar">
          <div>
            <span className="tag tag--light">Painel</span>
            <h1 className="admin-page__title display">Histórico de respostas</h1>
          </div>
          <button
            type="button"
            className="admin-logout"
            onClick={() => {
              clearAdminToken()
              setAuthed(false)
            }}
          >
            Sair
          </button>
        </div>

        <form
          className="admin-filters"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const next = new URLSearchParams()
            const slug = String(fd.get('slug') ?? '')
            const cpf = String(fd.get('cpf') ?? '')
            if (slug) next.set('slug', slug)
            if (cpf) next.set('cpf', cpf)
            setSearchParams(next)
          }}
        >
          <label className="q-field">
            <span>Questionário</span>
            <select name="slug" defaultValue={slugFilter}>
              <option value="">Todos</option>
              <option value="roda-da-vida">Roda da Vida</option>
            </select>
          </label>
          <label className="q-field">
            <span>CPF</span>
            <input
              name="cpf"
              defaultValue={cpfFilter}
              placeholder="Filtrar por CPF"
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="q-btn q-btn--primary">
            Filtrar
          </button>
        </form>

        {loading && <p className="admin-page__lead">Carregando…</p>}
        {error && (
          <p className="q-unlock__error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="admin-page__lead">Nenhuma resposta encontrada.</p>
        )}

        <ul className="admin-list">
          {items.map((item) => {
            const avg = averageScores(item.answers)
            return (
              <li key={item.id}>
                <Link to={`/painel/${item.id}`} className="admin-list__card">
                  <div>
                    <span className="admin-list__eyebrow">{item.title}</span>
                    <h2 className="display">CPF {formatCpf(item.cpf)}</h2>
                    <p>{formatDate(item.submitted_at)}</p>
                  </div>
                  <div className="admin-list__meta">
                    {avg != null && <span className="admin-list__avg">média {avg}</span>}
                    <span>Ver detalhes →</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function HistoryForCpf({
  cpf,
  slug,
  currentId,
}: {
  cpf: string
  slug: string
  currentId: string
}) {
  const [items, setItems] = useState<AdminSubmissionSummary[]>([])

  useEffect(() => {
    listAdminSubmissions({ cpf, slug })
      .then((data) => setItems(data.filter((i) => i.id !== currentId)))
      .catch(() => setItems([]))
  }, [cpf, slug, currentId])

  if (!items.length) {
    return <p className="admin-page__lead">Não há envios anteriores deste CPF.</p>
  }

  return (
    <ul className="admin-list admin-list--compact">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={`/painel/${item.id}`} className="admin-list__card">
            <div>
              <h2 className="display">{formatDate(item.submitted_at)}</h2>
              <p>
                média {averageScores(item.answers) ?? '—'}
              </p>
            </div>
            <span>Abrir →</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
