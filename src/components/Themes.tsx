import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { LetterBackdrop } from './LetterBackdrop'
import './Themes.css'

const ease = [0.22, 1, 0.36, 1] as const

const themes = [
  {
    title: 'Ansiedade',
    text: 'Pensamentos acelerados, preocupação excessiva e dificuldade de relaxar.',
  },
  {
    title: 'Autoestima',
    text: 'Dificuldade de reconhecer as próprias conquistas e sensação de que nunca é suficiente.',
  },
  {
    title: 'Relacionamento',
    text: 'Insegurança, dificuldade de estabelecer limites e medo de desagradar.',
  },
  {
    title: 'Necessidade de controle',
    text: 'Preocupação constante com o que pode acontecer e dificuldade de lidar com a incerteza.',
  },
  {
    title: 'Procrastinação e evitação',
    text: 'Adiar ou evitar situações que geram ansiedade, mesmo quando isso traz consequências depois.',
  },
  {
    title: 'Dificuldade de se posicionar',
    text: 'Medo de desagradar, dizer não ou expressar o que realmente pensa e sente.',
  },
]

export function Themes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const animate = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.75, ease },
  })

  return (
    <section id="temas" className="themes" ref={ref} aria-labelledby="themes-title">
      <LetterBackdrop variant="themes" tone="dark" />

      <div className="themes__inner">
        <motion.header className="themes__header" {...animate(0)}>
          <span className="tag tag--dark">Reconhecimento</span>
          <div className="themes__heading-row">
            <h2 id="themes-title" className="themes__title display">
              Talvez você esteja passando por...
            </h2>
            <div className="themes__title-line" aria-hidden="true" />
          </div>
          <p className="themes__subtitle">
            Situações comuns no consultório — se alguma ecoar em você, a terapia
            pode ajudar a compreender e transformar.
          </p>
        </motion.header>

        <ul className="themes__grid">
          {themes.map((theme, i) => (
            <motion.li
              key={theme.title}
              className="themes__item"
              {...animate(0.08 + i * 0.07)}
            >
              <span className="themes__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="themes__item-title display">{theme.title}</h3>
              <p className="themes__item-text">{theme.text}</p>
            </motion.li>
          ))}
        </ul>

        <motion.div className="themes__footer" {...animate(0.58)}>
          <p className="themes__footer-text">
            Se você se identificou com um ou mais pontos, a terapia pode ser um
            espaço seguro para clareza e fortalecimento.
          </p>
          <a href="#contato" className="themes__cta">
            Agendar minha consulta
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
