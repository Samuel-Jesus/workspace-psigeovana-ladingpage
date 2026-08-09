import { motion } from 'framer-motion'
import { LetterBackdrop } from './LetterBackdrop'
import './Hero.css'

const ease = [0.22, 1, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.75, ease },
  }
}

export function Hero() {
  return (
    <section id="inicio" className="hero">
      <LetterBackdrop variant="hero" tone="light" />
      <div className="hero__noise" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__content">
          <motion.p className="hero__greeting display" {...fadeUp(0.05)}>
            Muito prazer!
            <span className="hero__greeting-line">eu sou a</span>
          </motion.p>

          <motion.h1 className="hero__title display" {...fadeUp(0.15)}>
            geovana
            <span className="hero__title-italic">almeida</span>
          </motion.h1>

          <motion.p className="hero__creds" {...fadeUp(0.28)}>
            <span className="hero__role">psicóloga clínica</span>
            <span className="hero__crp">CRP 03/36315</span>
          </motion.p>
        </div>

        <motion.figure
          className="hero__photo"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        >
          <img
            src="/images/geovana-portrait.png"
            alt="Geovana Almeida, psicóloga clínica"
            width={768}
            height={1024}
            fetchPriority="high"
          />
        </motion.figure>
      </div>

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
