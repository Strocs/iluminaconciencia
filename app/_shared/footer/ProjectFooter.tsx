import Image from 'next/image'
import coreLogo from './assets/core-consejo-regional.png'
import esoLogo from './assets/eso-user-selected.jpg'
import goreLogo from './assets/gore-trimmed.svg'
import mincienciaLogo from './assets/minciencia-user-selected.png'
import minrelLogo from './assets/minrel-user-selected.png'
import projectLogo from '../../_assets/images/logo.png'
import sochiasLogo from './assets/sochias-user-selected.png'

const institutionalLogos = [
  { src: goreLogo, alt: 'Gobierno Regional de Coquimbo (GORE)' },
  { src: coreLogo, alt: 'Consejo Regional de Coquimbo (CORE)' },
  { src: minrelLogo, alt: 'Ministerio de Relaciones Exteriores de Chile' },
  { src: mincienciaLogo, alt: 'Ministerio de Ciencia, Tecnología, Conocimiento e Innovación de Chile' },
  { src: esoLogo, alt: 'Observatorio Europeo Austral (ESO)' },
  { src: sochiasLogo, alt: 'Sociedad Chilena de Astronomía (SOCHIAS)' }
]

export function ProjectFooter() {
  return (
    <section className="space-y-12 px-4 pt-12 text-center sm:px-6 md:pt-24">
      <Image
        className="mx-auto h-auto w-56 max-w-full sm:w-72"
        src={projectLogo}
        width={projectLogo.width}
        height={projectLogo.height}
        alt="IluminAconciencia"
      />
      <ul
        className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-12"
        aria-label="Instituciones colaboradoras"
      >
        {institutionalLogos.map(({ src, alt }) => (
          <li key={alt} className="shrink-0">
            <Image className="h-28 w-fit object-contain" src={src} width={src.width} height={src.height} alt={alt} />
          </li>
        ))}
      </ul>
      <p className="mx-auto max-w-3xl font-body text-sm leading-relaxed text-text sm:text-base">
        Proyecto financiado por el Gobierno Regional de Coquimbo, a través del Fondo de Innovación para la
        Competitividad Regional FIC-R.
      </p>
    </section>
  )
}
