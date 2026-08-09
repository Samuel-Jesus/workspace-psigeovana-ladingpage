import { useMemo, useState, type FormEvent } from 'react'
import type { QuestionnaireDefinition } from '../../questionnaires/types'
import { getStorage } from '../../questionnaires/storage'
import { WheelChart, WHEEL_COLORS } from './WheelChart'

interface QuestionnaireFormProps {
  questionnaire: QuestionnaireDefinition
  cpf: string
  onDone: () => void
}

export function QuestionnaireForm({
  questionnaire,
  cpf,
  onDone,
}: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(questionnaire.questions.map((q) => [q.id, 0])),
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const segments = useMemo(
    () =>
      questionnaire.questions.map((q) => ({
        id: q.id,
        label: q.label.replace(' / ', '/'),
        color: WHEEL_COLORS[q.id] ?? '#8c67ac',
        value: answers[q.id] ?? 0,
      })),
    [questionnaire.questions, answers],
  )

  const answered = useMemo(
    () => Object.values(answers).filter((v) => v > 0).length,
    [answers],
  )

  const setScore = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (answered < questionnaire.questions.length) {
      setError('Clique em todas as áreas da roda para avaliar de 1 a 10.')
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, number | string> = { ...answers }
      if (notes.trim()) payload.observacoes = notes.trim()

      await getStorage().submit({
        questionnaireId: questionnaire.id,
        cpf,
        answers: payload,
      })
      onDone()
    } catch {
      setError('Não foi possível salvar. Tente novamente em instantes.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="q-form" onSubmit={handleSubmit}>
      <header className="q-form__header">
        <span className="tag tag--light">{questionnaire.subtitle}</span>
        <h1 className="q-form__title display">{questionnaire.title}</h1>
        <p className="q-form__desc">{questionnaire.description}</p>
        <p className="q-form__hint">
          Clique na área desejada — quanto mais para fora, maior a nota (1 a 10).
          Clique de novo no mesmo nível para zerar.
        </p>
      </header>

      {questionnaire.layout === 'wheel' && (
        <div className="q-form__wheel">
          <WheelChart segments={segments} onChange={setScore} />
        </div>
      )}

      <ul className="q-legend" aria-label="Resumo das avaliações">
        {segments.map((s) => (
          <li key={s.id} className="q-legend__item">
            <span
              className="q-legend__swatch"
              style={{ background: s.color }}
              aria-hidden="true"
            />
            <span className="q-legend__label">{s.label}</span>
            <span className="q-legend__value">{s.value || '—'}</span>
          </li>
        ))}
      </ul>

      <label className="q-field q-form__notes">
        <span>Observações (opcional)</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Algo que queira registrar sobre este momento..."
        />
      </label>

      {error && (
        <p className="q-unlock__error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="q-btn q-btn--primary"
        disabled={submitting}
      >
        {submitting ? 'Enviando…' : 'Enviar respostas'}
      </button>
    </form>
  )
}
