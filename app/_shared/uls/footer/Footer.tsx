/* eslint-disable tailwindcss/no-custom-classname, @next/next/no-img-element */
import './footer.css'

import accreditationLogo from './assets/acreditada_5_copy_.png'
import facebookIcon from './assets/face_icon.png'
import flickrIcon from './assets/flickr_.png'
import instagramIcon from './assets/i.png'
import separator from './assets/guion.png'
import copyrightLogo from './assets/logo_copyright2.png'
import noiseTexture from './assets/noise.png'
import twitterIcon from './assets/t.png'
import universityLogo from './assets/userena-footer.png'
import youtubeIcon from './assets/y.png'

const socialLinks = [
  { href: 'https://twitter.com/userena', image: twitterIcon, label: 'Twitter de la Universidad de La Serena' },
  { href: 'https://www.facebook.com/userenaoficial/', image: facebookIcon, label: 'Facebook de la Universidad de La Serena' },
  { href: 'https://www.youtube.com/channel/UCZA13jsY_CaQh9E9BN5C-tA', image: youtubeIcon, label: 'YouTube de la Universidad de La Serena' },
  { href: 'https://www.flickr.com/photos/144282218@N03/albums', image: flickrIcon, label: 'Flickr de la Universidad de La Serena' },
  { href: 'https://www.instagram.com/userenaoficial/', image: instagramIcon, label: 'Instagram de la Universidad de La Serena' }
]

const partnerLinks = [
  { href: 'http://www.consejoderectores.cl', label: 'CRUCH' },
  { href: 'http://www.uestatales.cl/', label: 'CUECH' },
  { href: 'https://www.auregionales.cl/', label: 'AUR' },
  { href: 'http://www.reuna.cl/', label: 'REUNA' },
  { href: 'http://www.universia.cl/', label: 'UNIVERSIA' },
  { href: 'http://revistas.userena.cl/', label: 'PORTAL DE REVISTAS' }
]

const footerLogos = [
  {
    href: 'http://userena.cl',
    image: universityLogo,
    label: 'Universidad de La Serena'
  },
  {
    href: 'https://www.userena.cl/contactos-uls.html',
    image: copyrightLogo,
    label: 'Contactos de la Universidad de La Serena'
  },
  {
    href: 'https://iluminaconciencia.userena.digital/static/docs/ULS-INST-00053-05-RESD-3.pdf',
    image: accreditationLogo,
    label: 'Acreditación institucional de la Universidad de La Serena por cinco años'
  }
]

export function Footer() {
  return (
    <footer className="ulsFooter" aria-label="Pie de página institucional de la Universidad de La Serena">
      <div className="ulsFooter__socialBand">
        <div className="ulsFooter__socialInner">
          <nav className="ulsFooter__socialLinks" aria-label="Redes sociales">
            {socialLinks.map(({ href, image, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <img src={image.src} width={image.width} height={image.height} alt="" />
              </a>
            ))}
          </nav>
          <nav className="ulsFooter__partners" aria-label="Instituciones asociadas">
            {partnerLinks.map(({ href, label }, index) => (
              <span key={href}>
                {index > 0 ? <span className="ulsFooter__partnerSeparator" aria-hidden="true">|</span> : null}
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="ulsFooter__units" style={{ backgroundImage: `url(${noiseTexture.src})` }}>
        <div className="ulsFooter__unitsInner">
          <section className="ulsFooter__column" aria-label="Información institucional">
            <h2 className="ulsFooter__title">
              <a href="https://equidadygenero.userena.cl/" target="_blank" rel="noopener noreferrer">Departamento de Equidad y Género</a>
            </h2>
            <h2 className="ulsFooter__title">
              <a href="https://userena.cl/comite-de-seguridad-de-la-informacion" target="_blank" rel="noopener noreferrer">Comité de Seguridad de la Información</a>
            </h2>
            <h2 className="ulsFooter__title">
              <a href="https://userena.cl/coronavirus" target="_blank" rel="noopener noreferrer">Coronavirus</a>
            </h2>
            <img className="ulsFooter__separator" src={separator.src} width={separator.width} height={separator.height} alt="" aria-hidden="true" />
            <h2 className="ulsFooter__title">
              <a href="https://www.userena.cl/modelo-de-prevencion-y-deteccion-de-delitos-uls" target="_blank" rel="noopener noreferrer">
                Modelo de Detección y Prevención de Delitos<br /> Funcionarios, Lavado de Activos,<br /> Financiamiento del Terrorismo
              </a>
            </h2>
          </section>

          <section className="ulsFooter__column" aria-label="Servicios y programas">
            <h2 className="ulsFooter__title">
              <a href="http://analisis.userena.cl/uls-en-cifras/" target="_blank" rel="noopener noreferrer">ULS en Cifras</a>
            </h2>
            <h2 className="ulsFooter__title">
              <a href="https://userena.cl/convenios-de-desempeno-mineduc" target="_blank" rel="noopener noreferrer">Convenios de Desempeño</a>
            </h2>
            <img className="ulsFooter__separator" src={separator.src} width={separator.width} height={separator.height} alt="" aria-hidden="true" />
            <h2 className="ulsFooter__title">
              <a href="https://userena.cl/incentivo-al-retiro" target="_blank" rel="noopener noreferrer">Incentivo al Retiro</a>
            </h2>
            <h2 className="ulsFooter__title">
              <a href="https://userena.cl/trabaja-con-nosotros" target="_blank" rel="noopener noreferrer">Trabaja con Nosotros</a>
            </h2>
            <img className="ulsFooter__separator" src={separator.src} width={separator.width} height={separator.height} alt="" aria-hidden="true" />
            <h2 className="ulsFooter__title">
              <a href="https://pace.userena.cl/" target="_blank" rel="noopener noreferrer">PACE ULS</a>
            </h2>
          </section>

          <section className="ulsFooter__column" aria-label="Transparencia e identidad visual">
            <h2 className="ulsFooter__title">Transparencia ULS</h2>
            <ul className="ulsFooter__list">
              <li><a href="http://transparencia.userena.cl/" target="_blank" rel="noopener noreferrer">Transparencia Activa</a></li>
              <li><a href="http://transparencia.userena.cl/transparencia_solicitud.php" target="_blank" rel="noopener noreferrer">Solicitud Ley de Transparencia</a></li>
              <li><a href="https://userena.cl/transparencia-presupuestaria.html" target="_blank" rel="noopener noreferrer">Transparencia Presupuestaria</a></li>
            </ul>
            <img className="ulsFooter__separator" src={separator.src} width={separator.width} height={separator.height} alt="" aria-hidden="true" />
            <h2 className="ulsFooter__title">Identidad Visual</h2>
            <ul className="ulsFooter__list">
              <li><a href="https://userena.cl/logos-uls" target="_blank" rel="noopener noreferrer">Logo ULS</a></li>
              <li><a href="https://userena.cl/manual-identidad-visual" target="_blank" rel="noopener noreferrer">Manual Identidad Visual</a></li>
              <li><a href="https://userena.cl/relato-corporativo" target="_blank" rel="noopener noreferrer">Relato Corporativo</a></li>
              <li><a href="https://userena.cl/brochure-corporativo" target="_blank" rel="noopener noreferrer">Brochure Corporativo (mayo/2022)</a></li>
            </ul>
          </section>
        </div>
      </div>

      <div className="ulsFooter__logoBand">
        <div className="ulsFooter__logoInner">
          {footerLogos.map(({ href, image, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <img src={image.src} width={image.width} height={image.height} alt="" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
