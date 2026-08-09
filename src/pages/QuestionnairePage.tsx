import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getQuestionnaireBySlug } from '../questionnaires/catalog'
import { UnlockGate } from '../components/questionnaire/UnlockGate'
import { QuestionnaireForm } from '../components/questionnaire/QuestionnaireForm'
import { LetterBackdrop } from '../components/LetterBackdrop'
import './Questionnaires.css'

function sessionKey(slug: string) {
  return `psigeovana.q.unlock.${slug}`
}

export function QuestionnairePage() {
  const { slug } = useParams<{ slug: string }>()
  const questionnaire = slug ? getQuestionnaireBySlug(slug) : undefined
  const [cpf, setCpf] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!slug) return
    const saved = sessionStorage.getItem(sessionKey(slug))
    if (saved) setCpf(saved)
  }, [slug])

  const handleUnlock = (digits: string) => {
    if (!slug) return
    sessionStorage.setItem(sessionKey(slug), digits)
    setCpf(digits)
  }

  if (!questionnaire) {
    return (
      <div className="q-page">
        <div className="q-page__inner q-page__inner--narrow">
          <h1 className="q-page__title display">Questionário não encontrado</h1>
          <p className="q-page__lead">
            Verifique o link ou volte à lista de questionários.
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
      <div className="q-page__inner q-page__inner--narrow">
        <Link to="/questionarios" className="q-back">
          ← Questionários
        </Link>

        {!cpf && !done && (
          <UnlockGate
            title={questionnaire.title}
            verifyPassword={(pwd) => pwd === questionnaire.accessPassword}
            onUnlock={handleUnlock}
          />
        )}

        {cpf && !done && (
          <QuestionnaireForm
            questionnaire={questionnaire}
            cpf={cpf}
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
