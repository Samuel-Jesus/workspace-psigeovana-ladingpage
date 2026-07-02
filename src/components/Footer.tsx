import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain } from '@fortawesome/free-solid-svg-icons'
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <FontAwesomeIcon icon={faBrain} />
          <span>Geovana Almeida</span>
        </div>

        <p className="footer__tagline">
          Psicóloga · TCC · Atendimento online
        </p>

        <div className="footer__social">
          <a
            href="https://instagram.com/psicogeovanalmeida"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="https://wa.me/5571999999999"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </div>

        <p className="footer__copy">
          &copy; {year} Geovana Almeida. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
