import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserCircle,
  faBullhorn,
  faCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './Services.css'

const ease = [0.22, 1, 0.36, 1] as const

interface Service {
  num: string
  icon: IconDefinition
  title: string
  description: string
  features: string[]
  cta?: string
  featured?: boolean
}

const services: Service[] = [
  {
    num: '01',
    icon: faUserCircle,
    title: 'Psicoterapia Individual',
    description:
      'Sessões personalizadas de TCC para compreender seus padrões, desenvolver estratégias de enfrentamento e promover mudanças duradouras na sua vida.',
    features: [
      'Atendimento 100% online',
      'Sessões semanais ou quinzenais',
      'Plano terapêutico individualizado',
      'Ambiente seguro e confidencial',
    ],
    cta: 'Agendar consulta',
    featured: true,
  },
  {
    num: '02',
    icon: faBullhorn,
    title: 'Palestras e parcerias',
    description:
      'Conteúdos sobre saúde mental, bem-estar emocional e TCC para empresas, eventos e parcerias com profissionais e instituições.',
    features: [
      'Palestras corporativas',
      'Workshops sobre saúde mental',
      'Parcerias e divulgação',
    ],
    cta: 'Entrar em contato',
  },
]

export function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const animate = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.8, ease },
  })

  return (
    <section id="servicos" className="services" ref={ref}>
      <div className="services__inner">
        {/* Cabeçalho */}
        <motion.div className="services__header" {...animate(0)}>
          <span className="tag tag--light">Serviços</span>
          <h2 className="services__title display">Como posso te ajudar</h2>
          <p className="services__subtitle">
            Atendimento clínico e projetos para ampliar o acesso à saúde mental.
          </p>
        </motion.div>

        {/* Grid de cartões */}
        <div className="services__grid">
          {services.map((s, i) => (
            <motion.article
              key={s.title}
              className={`services__card${s.featured ? ' services__card--featured' : ''}`}
              {...animate(0.12 + i * 0.14)}
            >
              {/* Número decorativo */}
              <span className="services__card-num" aria-hidden="true">
                {s.num}
              </span>

              {/* Ícone */}
              <div className="services__card-icon-wrap">
                <FontAwesomeIcon icon={s.icon} className="services__card-icon" />
              </div>

              <h3 className="services__card-title display">{s.title}</h3>
              <p className="services__card-desc">{s.description}</p>

              <ul className="services__card-list">
                {s.features.map((f) => (
                  <li key={f}>
                    <FontAwesomeIcon icon={faCheck} />
                    {f}
                  </li>
                ))}
              </ul>

              {s.cta && (
                <a href="#contato" className="services__card-cta">
                  {s.cta}
                  <FontAwesomeIcon icon={faArrowRight} />
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
