import Image from 'next/image'
import coreLogo from './assets/core-consejo-regional.png'
import esoLogo from './assets/eso-user-selected.jpg'
import goreLogo from './assets/gore-trimmed.svg'
import mincienciaLogo from './assets/minciencia-user-selected.png'
import minrelLogo from './assets/minrel-user-selected.png'
import projectLogo from '../../_assets/images/logo.png'
import sochiasLogo from './assets/sochias-user-selected.png'
import { TextLink } from '@/_components/TextLink'
import { Separator } from '@/_components/Separator'
import { navigationItems } from '../navigation/navigation'

const institutionalLogos = [
  { src: goreLogo, alt: 'Gobierno Regional de Coquimbo (GORE)' },
  { src: coreLogo, alt: 'Consejo Regional de Coquimbo (CORE)' },
  { src: minrelLogo, alt: 'Ministerio de Relaciones Exteriores de Chile' },
  { src: mincienciaLogo, alt: 'Ministerio de Ciencia, Tecnología, Conocimiento e Innovación de Chile' },
  { src: esoLogo, alt: 'Observatorio Europeo Austral (ESO)' },
  { src: sochiasLogo, alt: 'Sociedad Chilena de Astronomía (SOCHIAS)' }
]

const socialLinks = [
  { href: 'https://www.facebook.com/iluminaconciencia', label: 'Facebook' },
  { href: 'https://www.instagram.com/iluminaconciencia/', label: 'Instagram' },
  { href: 'https://www.youtube.com/@iluminaconciencia', label: 'YouTube' }
]

export function ProjectFooter() {
  return (
    <section className="container mx-auto space-y-12 px-4 py-12 sm:px-6">
      <div className="flex items-center justify-around">
        <div className="flex items-center">
          <Image
            className="mx-auto h-auto w-42 sm:w-68"
            src={projectLogo}
            width={projectLogo.width}
            height={projectLogo.height}
            alt="IluminAconciencia"
          />
          <p className="max-w-xs text-sm font-extralight text-text/80">
            IluminAconciencia es un proyecto de la Región de Coquimbo que monitorea la contaminación lumínica y promueve
            el cuidado del cielo y la salud.
          </p>
        </div>
        <section className="flex gap-12">
          <div className="space-y-2">
            <h4 className="text-primary uppercase underline underline-offset-4">Redes Sociales</h4>
            <ul>
              {socialLinks.map(({ href, label }) => (
                <li key={label}>
                  <TextLink
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    className="text-xs font-extralight tracking-wider text-text/90 uppercase hover:accent-primary"
                  >
                    {label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-primary uppercase underline underline-offset-4">Navegar</h4>
            <ul>
              {navigationItems.map(({ href, label, section }) => (
                <li key={label}>
                  <TextLink
                    href={section ? href + '#' + section : href}
                    size="sm"
                    className="text-xs font-extralight tracking-wider text-text/90 uppercase hover:accent-primary"
                  >
                    {label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <Separator />
      <div className="flex flex-col items-center gap-8">
        <ul
          className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-12"
          aria-label="Instituciones colaboradoras"
        >
          {institutionalLogos.map(({ src, alt }) => (
            <li key={alt} className="shrink-0">
              <Image className="h-20 w-fit object-contain" src={src} width={src.width} height={src.height} alt={alt} />
            </li>
          ))}
        </ul>
        <p className="max-w-3xl text-center font-body text-sm leading-relaxed font-light text-text sm:text-base">
          Proyecto financiado por el Gobierno Regional de Coquimbo, a través del Fondo de Innovación para la
          Competitividad Regional FIC-R.
        </p>
      </div>
    </section>
  )
}
