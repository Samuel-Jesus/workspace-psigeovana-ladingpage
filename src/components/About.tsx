import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faAtom, faWifi } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
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
      {/* Linha luminosa no topo */}
      <div className="about__topline" aria-hidden="true" />

      {/* Pull-quote de abertura */}
      <div className="about__quote-wrap">
        <motion.blockquote className="about__quote display" {...animate(0)}>
          "O primeiro passo é a coragem de se conhecer."
        </motion.blockquote>
        <motion.div className="about__quote-line" {...animate(0.15)} aria-hidden="true" />
      </div>

      {/* Conteúdo principal */}
      <div className="about__inner">
        <div className="about__layout">
          {/* Esquerda: label + título */}
          <motion.div className="about__intro" {...animate(0.1)}>
            <span className="tag tag--dark">Sobre mim</span>
            <h2 className="about__title display">
              Cuidado acolhedor,<br />ético e estruturado
            </h2>
          </motion.div>

          {/* Direita: textos */}
          <motion.div className="about__text" {...animate(0.2)}>
            <p>
              Sou psicóloga e utilizo a{' '}
              <strong>Terapia Cognitivo-Comportamental (TCC)</strong> como
              abordagem terapêutica - um método baseado em evidências
              científicas, reconhecido mundialmente por sua eficácia.
            </p>
            <p>
              Atendo pela minha <strong>clínica online</strong>, onde realizo
              consultas por videochamada em um ambiente seguro e confidencial.
            </p>
            <p>
              Meu trabalho auxilia você a compreender seus padrões de
              pensamento e comportamento, desenvolver estratégias de
              enfrentamento e construir mudanças que promovam mais equilíbrio
              e qualidade de vida.
            </p>
            <a href="#contato" className="about__cta">
              Agendar minha consulta
            </a>
          </motion.div>
        </div>

        {/* Pilares */}
        <div className="about__pillars">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className="about__pillar"
              {...animate(0.28 + i * 0.1)}
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
