import { useState } from 'react'

export function CopyLinkField({ url, label }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('textarea')
      input.value = url
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="copy-link">
      {label && <span className="copy-link__label">{label}</span>}
      <div className="copy-link__row">
        <input
          className="copy-link__input"
          value={url}
          readOnly
          aria-label="Link do questionário"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button type="button" className="q-btn q-btn--ghost copy-link__btn" onClick={() => void copy()}>
          {copied ? 'Link copiado' : 'Copiar link'}
        </button>
      </div>
    </div>
  )
}
