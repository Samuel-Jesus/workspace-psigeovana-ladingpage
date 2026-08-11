import { useEffect, useState } from 'react'
import { listQuestionnaires, type PublicQuestionnaire } from '../questionnaires/api'
import { LetterBackdrop } from '../components/LetterBackdrop'
import { CopyLinkField } from '../components/questionnaire/CopyLinkField'
import './Questionnaires.css'

export function QuestionnairesListPage() {
  const [items, setItems] = useState<PublicQuestionnaire[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listQuestionnaires()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="q-page">
      <LetterBackdrop variant="services" tone="light" />
      <div className="q-page__inner">
        <header className="q-page__header">
          <span className="tag tag--light">Questionários</span>
          <h1 className="q-page__title display">Avaliações disponíveis</h1>
          <p className="q-page__lead">
            Copie o link do questionário e envie para a pessoa responder. Ela
            precisará do CPF e da senha fornecida por você.
          </p>
        </header>

        {loading && <p className="q-page__lead">Carregando…</p>}
        {error && (
          <p className="q-unlock__error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <ul className="q-list">
            {items.map((q) => {
              const url = `${origin}/questionarios/${q.slug}`
              return (
                <li key={q.id}>
                  <article className="q-list__card q-list__card--static">
                    <span className="q-list__eyebrow">{q.subtitle}</span>
                    <h2 className="q-list__title display">{q.title}</h2>
                    <p className="q-list__desc">{q.description}</p>
                    <CopyLinkField url={url} label="Link para responder" />
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

