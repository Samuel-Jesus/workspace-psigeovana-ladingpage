import './LetterBackdrop.css'

type Variant = 'hero' | 'about' | 'themes' | 'services' | 'contact'

/* Glifos recortados do nome "geovana almeida" — cada seção usa um par
   diferente para variar as curvas conforme a página é percorrida. */
const compositions: Record<Variant, [string, string]> = {
  hero: ['g', 'a'],
  about: ['o', 'v'],
  themes: ['e', 'a'],
  services: ['v', 'g'],
  contact: ['g', 'd'],
}

interface LetterBackdropProps {
  variant: Variant
  tone?: 'light' | 'dark'
}

export function LetterBackdrop({ variant, tone = 'light' }: LetterBackdropProps) {
  const [first, second] = compositions[variant]

  return (
    <div
      className={`letter-backdrop letter-backdrop--${tone} letter-backdrop--${variant}`}
      aria-hidden="true"
    >
      <span className="letter-backdrop__glyph letter-backdrop__glyph--1">
        {first}
      </span>
      <span className="letter-backdrop__glyph letter-backdrop__glyph--2">
        {second}
      </span>
    </div>
  )
}
