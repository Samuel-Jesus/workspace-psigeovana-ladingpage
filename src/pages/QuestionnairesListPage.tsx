import { Link } from 'react-router-dom'
import { listQuestionnaires } from '../questionnaires/catalog'
import { LetterBackdrop } from '../components/LetterBackdrop'
import './Questionnaires.css'

export function QuestionnairesListPage() {
  const items = listQuestionnaires()

  return (
    <div className="q-page">
      <LetterBackdrop variant="services" tone="light" />
      <div className="q-page__inner">
        <header className="q-page__header">
          <span className="tag tag--light">Questionários</span>
          <h1 className="q-page__title display">Avaliações disponíveis</h1>
          <p className="q-page__lead">
            Selecione um questionário. Você precisará do CPF e da senha
            fornecida pela psicóloga para responder.
          </p>
        </header>

        <ul className="q-list">
          {items.map((q) => (
            <li key={q.id}>
              <Link to={`/questionarios/${q.slug}`} className="q-list__card">
                <span className="q-list__eyebrow">{q.subtitle}</span>
                <h2 className="q-list__title display">{q.title}</h2>
                <p className="q-list__desc">{q.description}</p>
                <span className="q-list__cta">Abrir questionário →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
