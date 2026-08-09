import { useState, type FormEvent } from 'react'
import { formatCpf, isValidCpf, onlyDigits } from '../../questionnaires/cpf'

interface UnlockGateProps {
  title: string
  onUnlock: (cpf: string) => void
  verifyPassword: (password: string) => boolean
}

export function UnlockGate({ title, onUnlock, verifyPassword }: UnlockGateProps) {
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidCpf(cpf)) {
      setError('Informe um CPF válido.')
      return
    }
    if (!verifyPassword(password)) {
      setError('Senha incorreta para este questionário.')
      return
    }

    onUnlock(onlyDigits(cpf))
  }

  return (
    <div className="q-unlock">
      <div className="q-unlock__card">
        <span className="tag tag--light">Acesso</span>
        <h1 className="q-unlock__title display">{title}</h1>
        <p className="q-unlock__text">
          Para responder, informe seu CPF e a senha fornecida pela psicóloga.
          Não é necessário criar conta.
        </p>

        <form className="q-unlock__form" onSubmit={handleSubmit} noValidate>
          <label className="q-field">
            <span>CPF</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              required
            />
          </label>

          <label className="q-field">
            <span>Senha do questionário</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="Senha recebida"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="q-unlock__error" role="alert">{error}</p>}

          <button type="submit" className="q-btn q-btn--primary">
            Continuar
          </button>
        </form>
      </div>
    </div>
  )
}
