import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { LatestNews } from '../../_features/sidebar/_components/LatestNews'
import { LatestArticles } from '../../_features/sidebar/_components/LatestArticles'
import { ProjectTeam } from './ProjectTeam'
import { LightingComparison } from './LightingComparison'
import teamPhoto from '../_assets/equipo.jpg'
import tessW from '../_assets/tessw.png'
import tess4C from '../_assets/tess4c.png'
import { SectionHeading } from '@/_components/SectionHeading'
import { Separator } from '@/_components/Separator'
import { InfoPopover } from '@/_components/InfoPopover'
import { Button } from '@/_components/Button'
import { Breadcrumbs } from '../../_components/Breadcrumbs'
import { SiteSidebar } from '../../_features/sidebar/_components/SiteSidebar'
import { ProjectNavigation } from './ProjectNavigation'

const sections = [
  ['proposito', 'El proyecto'],
  ['importancia', 'Por qué importa'],
  ['trabajo', 'Qué hacemos'],
  ['contribuir', 'Cómo contribuir'],
  ['equipo', 'Nuestro equipo'],
  ['explorar', 'Seguir explorando']
] as const

function ProjectSection({ name, title, children }: { name: string; title: string; children: ReactNode }) {
  return (
    <section
      data-project-section={name}
      tabIndex={-1}
      aria-label={title}
      className="scroll-mt-28 space-y-6 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary"
    >
      <h2 className="font-heading text-3xl leading-tight text-foreground">{title}</h2>
      {children}
      <Separator />
    </section>
  )
}

export function ProjectContent({ teamEntry = false }: { teamEntry?: boolean }) {
  return (
    <div className="space-y-10 [&_p]:font-extralight">
      <div>
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Proyecto' }]} />
        <SectionHeading
          as="h1"
          eyebrow="PROYECTO"
          title="Conocer para proteger nuestros cielos"
          subtitle="Ciencia, territorio y comunidad frente a la contaminación lumínica."
        />
      </div>
      <ProjectNavigation teamEntry={teamEntry}>
        <div className="order-first 2xl:order-last 2xl:[&>aside]:max-h-[calc(100dvh-7rem)] 2xl:[&>aside]:overflow-y-auto 2xl:[&>aside]:overscroll-contain 2xl:[&>aside]:pr-3">
          <SiteSidebar>
            <nav aria-label="En esta página" className="space-y-4">
              <h2 className="font-heading text-xl">En esta página</h2>
              <ol className="space-y-1 font-body text-sm">
                {sections.map(([name, label]) => (
                  <li key={name}>
                    <button
                      type="button"
                      data-project-target={name}
                      className="flex min-w-0 cursor-pointer items-center gap-2 rounded-sm py-1 text-left text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
                    >
                      <BrandStarIcon className="shrink-0 text-primary" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="font-body text-sm leading-relaxed text-text">
                ¿Quieres profundizar en los instrumentos y los datos?{' '}
                <Link href="/medicion" className="text-primary underline underline-offset-4">
                  Conoce cómo medimos.
                </Link>
              </p>
            </nav>
            <Separator />
            <LatestNews />
            <LatestArticles />
          </SiteSidebar>
        </div>
        <article className="mx-auto w-full min-w-0 space-y-12 font-body text-base leading-relaxed text-text 2xl:col-start-1 2xl:row-start-1">
          <ProjectSection name="proposito" title="Un proyecto para comprender y cuidar la noche">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <p>
                  IluminAconciencia es un proyecto de la Universidad de La Serena que combina el monitoreo del cielo
                  nocturno con la divulgación sobre la contaminación lumínica en la Región de Coquimbo.
                </p>
                <p>
                  Conectamos ciencia, tecnología y comunidad para que la información del cielo nocturno sea accesible y
                  ayude a comprender por qué la oscuridad natural también merece cuidado.
                </p>
                <blockquote className="border-l-2 border-primary pl-5 text-base font-extralight text-foreground italic">
                  No se trata de dejar de iluminar, sino de iluminar mejor.
                </blockquote>
              </div>
              <figure className="space-y-3">
                <Image
                  src={teamPhoto}
                  alt="Integrantes de IluminAconciencia reunidos al aire libre"
                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 608px"
                  className="h-auto w-full rounded-sm"
                />
                <figcaption className="text-base font-extralight italic">
                  Ciencia, comunicación y tecnología al servicio de un mismo territorio.
                </figcaption>
              </figure>
            </div>
          </ProjectSection>
          <ProjectSection name="importancia" title="Por qué importa la oscuridad">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <p>
                  La luz artificial resulta útil cuando ilumina donde y cuando se necesita. Cuando se dispersa hacia el
                  cielo o invade espacios que no requieren iluminación, modifica el entorno nocturno.
                </p>
                <InfoPopover label="Qué es la contaminación lumínica" size="sm">
                  <p>
                    Es la alteración de la oscuridad natural por luz artificial innecesaria o mal dirigida. No depende
                    únicamente de cuántas luces hay, sino también de su dirección, intensidad y horario de uso.
                  </p>
                </InfoPopover>
              </div>
              <div className="contents">
                <div>
                  <h3 className="font-heading text-xl text-foreground">Un cielo que podemos observar</h3>
                  <p>
                    El resplandor artificial dificulta distinguir las estrellas y observar objetos tenues. Cuidar el
                    cielo nocturno protege una oportunidad de observación, aprendizaje y encuentro con nuestro
                    territorio.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-xl text-foreground">Un entorno con ciclos naturales</h3>
                  <p>
                    La alternancia entre luz y oscuridad forma parte del ambiente de los seres vivos. La contaminación
                    lumínica invita a considerar cómo nuestras decisiones de iluminación se relacionan con la
                    biodiversidad y los espacios de descanso.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-xl text-foreground">Luz con un propósito</h3>
                  <p>
                    Iluminar superficies que no lo necesitan utiliza energía sin aportar a la tarea prevista. Revisar
                    dirección, intensidad y horarios permite aprovechar mejor la iluminación.
                  </p>
                </div>
              </div>
            </div>
          </ProjectSection>
          <ProjectSection name="trabajo" title="Observar, comprender y compartir">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-heading text-xl text-foreground">Monitoreamos el cielo</h3>
                <div className="flex items-start gap-2">
                  <p>
                    La red reúne observaciones del brillo del cielo en distintos puntos. Estos registros permiten
                    explorar cómo se comporta el entorno nocturno y consultar información de cada lugar.
                  </p>
                  <InfoPopover label="Qué mide un fotómetro" size="sm">
                    <p>
                      Un fotómetro es un instrumento que mide luz. Los utilizados para observar el brillo del cielo
                      registran una magnitud que debe interpretarse junto con las condiciones y características de la
                      medición. No miden directamente efectos sobre la salud o la biodiversidad.
                    </p>
                  </InfoPopover>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-xl text-foreground">Acercamos el conocimiento</h3>
                <p>
                  El proyecto ha desarrollado actividades de divulgación, talleres y propuestas como el concurso de
                  fotografía del cielo nocturno: distintas maneras de reconocer el problema y conversar sobre su
                  cuidado.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl text-foreground">Vinculamos disciplinas y territorio</h3>
                <p>
                  La astronomía, la informática, la comunicación, el diseño y la gestión aportan perspectivas
                  complementarias para transformar observaciones en información accesible.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex shrink-0 gap-3">
                  <Image
                    src={tessW}
                    alt="Ilustración de un fotómetro TESS-W"
                    className="h-24 w-24 rounded-sm object-contain"
                  />
                  <Image
                    src={tess4C}
                    alt="Ilustración de un fotómetro TESS-4C"
                    className="h-24 w-24 rounded-sm object-contain"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm">
                    Instrumentos para observar el brillo del cielo. Descubre qué registran y cómo se interpreta la
                    información.
                  </p>
                  <Button href="/medicion" size="sm">
                    Cómo medimos
                  </Button>
                </div>
              </div>
            </div>
          </ProjectSection>
          <ProjectSection name="contribuir" title="Pequeñas decisiones, una iluminación más responsable">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <p>
                  Antes de añadir más luz, conviene preguntarse qué necesita iluminarse, en qué momento y con qué
                  intensidad.
                </p>
                <ul className="list-disc space-y-3 pl-5">
                  <li>
                    <strong className="text-foreground">Dirige:</strong> orienta la luz hacia la superficie que
                    necesitas iluminar.
                  </li>
                  <li>
                    <strong className="text-foreground">Ajusta:</strong> utiliza la intensidad necesaria para la
                    actividad, evitando excesos.
                  </li>
                  <li>
                    <strong className="text-foreground">Programa:</strong> apaga las luces cuando no sean necesarias y
                    considera temporizadores o sensores cuando corresponda.
                  </li>
                </ul>
              </div>
              <LightingComparison />
            </div>
          </ProjectSection>
          <ProjectSection name="equipo" title="Las personas detrás del proyecto">
            <p>
              Astronomía, tecnología, comunicación y gestión: distintas especialidades que trabajan juntas para observar
              el cielo y compartir lo aprendido.
            </p>
            <ProjectTeam />
            <p>
              El proyecto es impulsado por la <strong className="text-foreground">Universidad de La Serena</strong>, con
              financiamiento del <strong className="text-foreground">Gobierno Regional de Coquimbo</strong> a través del
              Fondo de Innovación para la Competitividad Regional.
            </p>
          </ProjectSection>
          <ProjectSection name="explorar" title="Del propósito a la evidencia">
            <p>
              Puedes profundizar en cómo se obtiene la información o comenzar por un lugar del territorio. Son dos
              formas de seguir conociendo nuestros cielos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/medicion">Cómo medimos</Button>
              <Button href="/#explorar" variant="neutral">
                Explorar el mapa
              </Button>
            </div>
            <p className="text-base italic">
              Fuentes del proyecto:{' '}
              <a
                className="text-primary underline underline-offset-4"
                href="https://iluminaconciencia.userena.digital/"
              >
                presentación y recomendaciones
              </a>
              ,{' '}
              <a
                className="text-primary underline underline-offset-4"
                href="https://iluminaconciencia.userena.digital/news_item/20/"
              >
                actividades de divulgación
              </a>{' '}
              y{' '}
              <a
                className="text-primary underline underline-offset-4"
                href="https://iluminaconciencia.userena.digital/news_item/33/"
              >
                antecedentes institucionales
              </a>
              .
            </p>
          </ProjectSection>
        </article>
      </ProjectNavigation>
    </div>
  )
}
