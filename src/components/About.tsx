import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faAtom, faWifi } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { LetterBackdrop } from './LetterBackdrop'
import './About.css'

const ease = [0.22, 1, 0.36, 1] as const

const pillars: { icon: IconDefinition; title: string; text: string }[] = [
  {
    icon: faHeart,
    title: 'Acolhimento genuíno',
    text: 'Um espaço seguro e sem julgamento, onde você pode se expressar livremente.',
  },
  {
    icon: faAtom,
    title: 'Ciência como base',
    text: 'A TCC é a abordagem com maior evidência científica de eficácia no mundo.',
  },
  {
    icon: faWifi,
    title: 'Onde você estiver',
    text: 'Consultas por videochamada, no conforto e privacidade do seu ambiente.',
  },
]

export function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const animate = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.8, ease },
  })

  return (
    <section id="sobre" className="about" ref={ref}>
      <LetterBackdrop variant="about" tone="dark" />
      <div className="about__topline" aria-hidden="true" />

      <div className="about__quote-wrap">
        <motion.blockquote className="about__quote display" {...animate(0)}>
          "O primeiro passo é a coragem de se conhecer."
        </motion.blockquote>
        <motion.div className="about__quote-line" {...animate(0.15)} aria-hidden="true" />
      </div>

      <div className="about__inner">
        <div className="about__layout">
          <motion.figure className="about__photo" {...animate(0.1)}>
            <img
              src="/images/geovana-leitura.png"
              alt="Geovana Almeida lendo um livro"
              width={768}
              height={1024}
              loading="lazy"
            />
          </motion.figure>

          <div className="about__content">
            <motion.div className="about__intro" {...animate(0.18)}>
              <span className="tag tag--dark">Sobre mim</span>
              <h2 className="about__title display">
                Cuidado acolhedor,<br />ético e estruturado
              </h2>
            </motion.div>

            <motion.div className="about__text" {...animate(0.26)}>
              <p>
                Sou psicóloga e atuo de forma{' '}
                <strong>100% on-line</strong>, utilizando a{' '}
                <strong>Terapia Cognitivo-Comportamental (TCC)</strong>, uma
                abordagem baseada em evidências científicas. Atendo{' '}
                <strong>jovens adultas</strong> (+18) que enfrentam questões
                relacionadas à ansiedade, autoestima, relacionamentos e outras
                demandas emocionais.
              </p>
              <a href="#contato" className="about__cta">
                Agendar minha consulta
              </a>
            </motion.div>
          </div>
        </div>

        <div className="about__pillars">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className="about__pillar"
              {...animate(0.32 + i * 0.1)}
            >
              <div className="about__pillar-icon">
                <FontAwesomeIcon icon={p.icon} />
              </div>
              <div className="about__pillar-body">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
