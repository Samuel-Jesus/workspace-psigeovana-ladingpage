import { useMemo, useState, type FormEvent } from 'react'
import type { QuestionnaireDefinition } from '../../questionnaires/types'
import { submitQuestionnaire } from '../../questionnaires/api'
import { WheelChart, WHEEL_COLORS } from './WheelChart'

interface QuestionnaireFormProps {
  questionnaire: QuestionnaireDefinition
  unlockToken: string
  onDone: () => void
}

export function QuestionnaireForm({
  questionnaire,
  unlockToken,
  onDone,
}: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(questionnaire.questions.map((q) => [q.id, 0])),
  )
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'edit' | 'confirm'>('edit')
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

  const average = useMemo(() => {
    const values = Object.values(answers).filter((v) => v > 0)
    if (!values.length) return null
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
  }, [answers])

  const setScore = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleReview = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (answered < questionnaire.questions.length) {
      setError('Clique em todas as áreas da roda para avaliar de 1 a 10.')
      return
    }

    setStep('confirm')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      const payload: Record<string, number | string> = { ...answers }
      if (notes.trim()) payload.observacoes = notes.trim()

      await submitQuestionnaire(questionnaire.slug, unlockToken, payload)
      onDone()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar. Tente novamente em instantes.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="q-form q-confirm">
        <header className="q-form__header">
          <span className="tag tag--light">Confirmação</span>
          <h1 className="q-form__title display">Revise suas notas</h1>
          <p className="q-form__desc">
            Confira o resumo da Roda da Vida antes de enviar. Se algo estiver
            diferente do que deseja, volte e ajuste.
          </p>
          {average != null && (
            <p className="q-confirm__avg">
              Média geral: <strong>{average}</strong>
            </p>
          )}
        </header>

        {questionnaire.layout === 'wheel' && (
          <div className="q-form__wheel">
            <WheelChart segments={segments} readOnly size={560} />
          </div>
        )}

        <ul className="q-confirm__scores" aria-label="Resumo das 10 notas">
          {segments.map((s) => (
            <li key={s.id}>
              <span
                className="q-confirm__swatch"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              <span className="q-confirm__label">{s.label}</span>
              <strong className="q-confirm__value">{s.value}</strong>
            </li>
          ))}
        </ul>

        {notes.trim() && (
          <div className="q-confirm__notes">
            <h2 className="display">Observações</h2>
            <p>{notes.trim()}</p>
          </div>
        )}

        {error && (
          <p className="q-unlock__error" role="alert">
            {error}
          </p>
        )}

        <div className="q-confirm__actions">
          <button
            type="button"
            className="q-btn q-btn--ghost"
            onClick={() => {
              setError('')
              setStep('edit')
            }}
            disabled={submitting}
          >
            Voltar e editar
          </button>
          <button
            type="button"
            className="q-btn q-btn--primary"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Confirmar e enviar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="q-form" onSubmit={handleReview}>
      <header className="q-form__header">
        <span className="tag tag--light">{questionnaire.subtitle}</span>
        <h1 className="q-form__title display">{questionnaire.title}</h1>
        <p className="q-form__desc">{questionnaire.description}</p>
        <p className="q-form__hint">
          Toque ou clique na área — quanto mais perto da borda, maior a nota (1
          a 10). No mesmo nível de novo para zerar.
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

      <button type="submit" className="q-btn q-btn--primary">
        Revisar e enviar
      </button>
    </form>
  )
}
