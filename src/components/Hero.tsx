import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBrain,
  faVideo,
  faArrowRight,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'
import './Hero.css'

const ease = [0.22, 1, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.75, ease },
  }
}

const pills = [
  { icon: faCircleCheck, label: 'TCC baseada em evidências' },
  { icon: faVideo, label: 'Consultas 100% online' },
]

export function Hero() {
  return (
    <section id="inicio" className="hero">
      {/* Ruído de fundo suave */}
      <div className="hero__noise" aria-hidden="true" />

      <div className="hero__inner">
        {/* ── Coluna esquerda ── */}
        <div className="hero__content">
          <motion.p className="hero__eyebrow tag tag--light" {...fadeUp(0.05)}>
            Psicóloga · Atendimento online
          </motion.p>

          <motion.h1 className="hero__title display" {...fadeUp(0.15)}>
            Geovana
            <span className="hero__title-italic">Almeida</span>
          </motion.h1>

          <motion.p className="hero__lead" {...fadeUp(0.25)}>
            Terapia Cognitivo-Comportamental conduzida de forma acolhedora,
            ética e estruturada para promover equilíbrio e qualidade de vida.
          </motion.p>

          <motion.div className="hero__pills" {...fadeUp(0.33)}>
            {pills.map((p) => (
              <span key={p.label} className="hero__pill">
                <FontAwesomeIcon icon={p.icon} />
                {p.label}
              </span>
            ))}
          </motion.div>

          <motion.div className="hero__actions" {...fadeUp(0.42)}>
            <a href="#contato" className="hero__btn hero__btn--primary">
              Agendar consulta
              <FontAwesomeIcon icon={faArrowRight} className="hero__btn-arrow" />
            </a>
            <a href="#sobre" className="hero__btn hero__btn--ghost">
              Saiba mais
            </a>
          </motion.div>
        </div>

        {/* ── Coluna direita — visual decorativo ── */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
          aria-hidden="true"
        >
          {/* Orb principal */}
          <div className="hero__orb">
            <FontAwesomeIcon icon={faBrain} className="hero__orb-brain" />
            <div className="hero__orb-ring hero__orb-ring--1" />
            <div className="hero__orb-ring hero__orb-ring--2" />
          </div>

          {/* Pontos flutuantes */}
          <motion.span
            className="hero__dot hero__dot--a"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="hero__dot hero__dot--b"
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="hero__dot hero__dot--c"
            animate={{ y: [-5, 10, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Mini cartão de credencial flutuante */}
          <motion.div
            className="hero__card"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FontAwesomeIcon icon={faBrain} className="hero__card-icon" />
            <div>
              <p className="hero__card-title">TCC</p>
              <p className="hero__card-sub">Evidência científica</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        aria-hidden="true"
      >
        <motion.span
          className="hero__scroll-line"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
