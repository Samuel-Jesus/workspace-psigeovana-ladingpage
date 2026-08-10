import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getQuestionnaireBySlug,
  unlockQuestionnaire,
  type PublicQuestionnaire,
} from '../questionnaires/api'
import { UnlockGate } from '../components/questionnaire/UnlockGate'
import { QuestionnaireForm } from '../components/questionnaire/QuestionnaireForm'
import { LetterBackdrop } from '../components/LetterBackdrop'
import './Questionnaires.css'

function sessionKey(slug: string) {
  return `psigeovana.q.unlock.${slug}`
}

type Session = { cpf: string; unlockToken: string }

export function QuestionnairePage() {
  const { slug } = useParams<{ slug: string }>()
  const [questionnaire, setQuestionnaire] = useState<PublicQuestionnaire | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    setLoading(true)
    setLoadError('')
    getQuestionnaireBySlug(slug)
      .then((item) => {
        if (!cancelled) setQuestionnaire(item)
      })
      .catch((err) => {
        if (!cancelled) {
          setQuestionnaire(null)
          setLoadError(err instanceof Error ? err.message : 'Erro ao carregar')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const saved = sessionStorage.getItem(sessionKey(slug))
    if (saved) {
      try {
        setSession(JSON.parse(saved) as Session)
      } catch {
        sessionStorage.removeItem(sessionKey(slug))
      }
    }

    return () => {
      cancelled = true
    }
  }, [slug])

  const handleUnlock = async (cpf: string, password: string) => {
    if (!slug) return
    const result = await unlockQuestionnaire(slug, cpf, password)
    const next = { cpf: result.cpf, unlockToken: result.unlockToken }
    sessionStorage.setItem(sessionKey(slug), JSON.stringify(next))
    setSession(next)
  }

  if (loading) {
    return (
      <div className="q-page">
        <div className="q-page__inner q-page__inner--narrow">
          <p className="q-page__lead">Carregando questionário…</p>
        </div>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="q-page">
        <div className="q-page__inner q-page__inner--narrow">
          <h1 className="q-page__title display">Questionário não encontrado</h1>
          <p className="q-page__lead">
            {loadError || 'Verifique o link ou volte à lista de questionários.'}
          </p>
          <Link to="/questionarios" className="q-btn q-btn--ghost">
            Ver questionários
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="q-page">
      <LetterBackdrop variant="hero" tone="light" />
      <div
        className={`q-page__inner${session && !done ? ' q-page__inner--wheel' : ' q-page__inner--narrow'}`}
      >
        <Link to="/questionarios" className="q-back">
          ← Questionários
        </Link>

        {!session && !done && (
          <UnlockGate title={questionnaire.title} onUnlock={handleUnlock} />
        )}

        {session && !done && (
          <QuestionnaireForm
            questionnaire={questionnaire}
            unlockToken={session.unlockToken}
            onDone={() => {
              if (slug) sessionStorage.removeItem(sessionKey(slug))
              setDone(true)
            }}
          />
        )}

        {done && (
          <div className="q-done">
            <span className="tag tag--light">Enviado</span>
            <h1 className="q-page__title display">Obrigada por responder</h1>
            <p className="q-page__lead">
              Suas respostas foram registradas e vinculadas ao CPF informado.
              A psicóloga poderá consultá-las no acompanhamento.
            </p>
            <Link to="/questionarios" className="q-btn q-btn--primary">
              Voltar à lista
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
