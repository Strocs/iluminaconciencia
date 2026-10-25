/* eslint-disable tailwindcss/no-custom-classname */
import Image from 'next/image'
import './styles/index.css'

import accreditationLogo from './assets/cna-5.png'
import universityLogo from './assets/userena.png'

export function NavUSerena() {
  return (
    <div className="nav-userena" data-site-banner>
      <div className="nav-userena__container">
        <div className="nav-userena__row">
          <div className="nav-userena__column">
            <a href="https://www.userena.cl" target="_blank" rel="noopener noreferrer">
              <Image
                className="nav-userena__image nav-userena__image--left"
                src={universityLogo}
                sizes="130px"
                loading="eager"
                alt="Universidad de La Serena"
              />
            </a>
          </div>
          <div className="nav-userena__column">
            <a href="https://www.userena.cl" target="_blank" rel="noopener noreferrer">
              <Image
                className="nav-userena__image nav-userena__image--right"
                src={accreditationLogo}
                sizes="272px"
                loading="eager"
                alt="Universidad de La Serena, acreditada por cinco años por la Comisión Nacional de Acreditación de Chile"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
