import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './Contact.css'

const ease = [0.22, 1, 0.36, 1] as const

interface ContactItem {
  icon: IconDefinition
  label: string
  value: string
  href: string
  external?: boolean
}

const contacts: ContactItem[] = [
  {
    icon: faWhatsapp,
    label: 'WhatsApp',
    value: '(71) 99999-9999',
    href: 'https://wa.me/5571999999999',
    external: true,
  },
  {
    icon: faEnvelope,
    label: 'E-mail',
    value: 'psigeovanalmeida@gmail.com',
    href: 'mailto:psigeovanalmeida@gmail.com',
  },
  {
    icon: faInstagram,
    label: 'Instagram',
    value: '@psicogeovanalmeida',
    href: 'https://instagram.com/psicogeovanalmeida',
    external: true,
  },
]

export function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const animate = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.8, ease },
  })

  return (
    <section id="contato" className="contact" ref={ref}>
      {/* Decoração de fundo */}
      <div className="contact__glow" aria-hidden="true" />

      <div className="contact__inner">
        {/* Cabeçalho */}
        <motion.div className="contact__header" {...animate(0)}>
          <span className="tag tag--dark contact__tag">Contato</span>
          <h2 className="contact__title display">
            Pronto para dar<br />
            <em>o primeiro passo?</em>
          </h2>
          <p className="contact__subtitle">
            Entre em contato para agendar sua consulta ou tirar dúvidas
            sobre o atendimento. Responderei com carinho.
          </p>
        </motion.div>

        {/* CTA principal */}
        <motion.a
          href="https://wa.me/5571999999999"
          className="contact__cta-main"
          target="_blank"
          rel="noopener noreferrer"
          {...animate(0.12)}
        >
          <FontAwesomeIcon icon={faWhatsapp} className="contact__cta-main-icon" />
          <span>
            <strong>Agendar pelo WhatsApp</strong>
            <small>(71) 99999-9999</small>
          </span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="contact__cta-main-ext" />
        </motion.a>

        {/* Separador */}
        <motion.p className="contact__or" {...animate(0.2)}>
          ou entre em contato por
        </motion.p>

        {/* Links de contato */}
        <div className="contact__links">
          {contacts.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="contact__link"
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              {...animate(0.26 + i * 0.08)}
            >
              <div className="contact__link-icon">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="contact__link-body">
                <span className="contact__link-label">{item.label}</span>
                <span className="contact__link-value">{item.value}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
