import type { ReactNode } from 'react'
import Link from 'next/link'
import { SectionHeading } from '@/_components/SectionHeading'
import { InfoPopover } from '@/_components/InfoPopover'
import { LinkButton } from '@/_components/LinkButton'
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

const team = [
  ['Marcelo Jaque', 'Astrónomo · Dirección del proyecto'],
  ['Abel Aracena', 'Ingeniero en Computación · Almacenamiento y visualización de datos'],
  ['Emilio Castro', 'Periodista · Comunicaciones y realización audiovisual'],
  ['Karina Nuñez', 'Ingeniera Comercial · Operación y gestión'],
  ['Felipe Ramos', 'Astrónomo · Astronomía del proyecto'],
  ['Sergio Muñoz', 'Periodista · Vinculación con el territorio'],
  ['Fabián Vásquez', 'Diseñador · Diseño de interfaces'],
  ['Daniel Ortiz', 'Ingeniero en Computación · Gestión de fotómetros y desarrollo'],
  ['Guillermo Damke', 'Astrónomo, NOIRLab · Colaboración'],
  ['Rodolfo Angeloni', 'Astrónomo, NOIRLab · Colaboración'],
  ['Juan Pablo Uchima', 'Ingeniero Físico · Colaboración']
] as const

function ProjectSection({ name, title, children }: { name: string; title: string; children: ReactNode }) {
  return (
    <section
      data-project-section={name}
      tabIndex={-1}
      aria-label={title}
      className="scroll-mt-28 space-y-6 border-b border-border/40 pb-12 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary"
    >
      <h2 className="font-heading text-3xl leading-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function ProjectContent({ teamEntry = false }: { teamEntry?: boolean }) {
  return (
    <div className="space-y-10">
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
        <div className="order-first 2xl:order-last">
          <SiteSidebar>
            <nav aria-label="En esta página" className="space-y-4">
              <h2 className="font-heading text-xl">En esta página</h2>
              <ol className="grid gap-3 font-body text-sm sm:grid-cols-2 2xl:grid-cols-1">
                {sections.map(([name, label]) => (
                  <li key={name}>
                    <button
                      type="button"
                      data-project-target={name}
                      className="cursor-pointer text-left text-text underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="font-body text-sm leading-relaxed text-text">
              ¿Quieres profundizar en los instrumentos y los datos?{' '}
              <Link href="/medicion" className="text-primary underline underline-offset-4">
                Conoce cómo medimos.
              </Link>
            </p>
          </SiteSidebar>
        </div>
        <article className="mx-auto w-full max-w-3xl min-w-0 space-y-12 font-body text-base leading-relaxed text-text 2xl:col-start-1 2xl:row-start-1">
          <ProjectSection name="proposito" title="Un proyecto para comprender y cuidar la noche">
            <p>
              IluminAconciencia es un proyecto de la Universidad de La Serena que combina el monitoreo del cielo
              nocturno con la divulgación sobre la contaminación lumínica en la Región de Coquimbo.
            </p>
            <p>
              Medir permite conocer el territorio; compartir ese conocimiento ayuda a comprender por qué la oscuridad
              natural también merece cuidado. El proyecto conecta ciencia, tecnología y comunidad para acercar esa
              conversación a las personas.
            </p>
            <p className="border-l-2 border-primary pl-5 font-heading text-2xl leading-snug text-foreground">
              No se trata de dejar de iluminar, sino de iluminar mejor.
            </p>
          </ProjectSection>
          <ProjectSection name="importancia" title="Por qué importa la oscuridad">
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
            <div className="space-y-5">
              <div>
                <h3 className="font-heading text-xl text-foreground">Un cielo que podemos observar</h3>
                <p>
                  El resplandor artificial dificulta distinguir las estrellas y observar objetos tenues. Cuidar el cielo
                  nocturno protege una oportunidad de observación, aprendizaje y encuentro con nuestro territorio.
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
          </ProjectSection>
          <ProjectSection name="trabajo" title="Observar, comprender y compartir">
            <div className="space-y-5">
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
            </div>
            <LinkButton href="/medicion" size="sm">
              Cómo medimos
            </LinkButton>
          </ProjectSection>
          <ProjectSection name="contribuir" title="Pequeñas decisiones, una iluminación más responsable">
            <p>
              Antes de añadir más luz, conviene preguntarse qué necesita iluminarse, en qué momento y con qué
              intensidad.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <figure className="rounded-lg border border-border/40 p-5">
                <svg viewBox="0 0 200 110" className="h-28 w-full text-text" aria-hidden="true">
                  <path d="M100 100V35h35" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path
                    d="m135 35-35-20m35 20 35-20m-35 20 45 25m-45-25-30 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M20 100h160" stroke="currentColor" />
                </svg>
                <figcaption>
                  <strong className="text-foreground">Luz dispersa</strong>
                  <p className="mt-2 text-sm">
                    Parte de la luz se dirige al cielo o fuera de la superficie que se quiere iluminar.
                  </p>
                </figcaption>
              </figure>
              <figure className="rounded-lg border border-border p-5">
                <svg viewBox="0 0 200 110" className="h-28 w-full text-primary" aria-hidden="true">
                  <path d="M100 100V35h35l-12 10h24l-12-10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="m125 50-15 40m25-40v40m10-40 15 40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 100h160" stroke="currentColor" />
                </svg>
                <figcaption>
                  <strong className="text-foreground">Luz dirigida</strong>
                  <p className="mt-2 text-sm">
                    La iluminación se concentra hacia abajo, sobre el área donde resulta útil.
                  </p>
                </figcaption>
              </figure>
            </div>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                <strong className="text-foreground">Dirige:</strong> orienta la luz hacia la superficie que necesitas
                iluminar.
              </li>
              <li>
                <strong className="text-foreground">Ajusta:</strong> utiliza la intensidad necesaria para la actividad,
                evitando excesos.
              </li>
              <li>
                <strong className="text-foreground">Programa:</strong> apaga las luces cuando no sean necesarias y
                considera temporizadores o sensores cuando corresponda.
              </li>
            </ul>
          </ProjectSection>
          <ProjectSection name="equipo" title="Las personas detrás del proyecto">
            <p>
              Un equipo multidisciplinario reúne distintas especialidades para observar el cielo y compartir lo
              aprendido. Estos son los integrantes y colaboradores que presenta el sitio institucional del proyecto.
            </p>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {team.map(([name, role]) => (
                <div key={name} className="border-t border-border/40 pt-4">
                  <dt className="font-heading text-xl text-foreground">{name}</dt>
                  <dd className="mt-1 text-sm">{role}</dd>
                </div>
              ))}
            </dl>
            <p>
              El proyecto es impulsado por la <strong className="text-foreground">Universidad de La Serena</strong>, con
              financiamiento del <strong className="text-foreground">Gobierno Regional de Coquimbo</strong> a través del
              Fondo de Innovación para la Competitividad Regional.
            </p>
            <a
              href="https://iluminaconciencia.userena.digital/team"
              className="text-sm text-primary underline underline-offset-4"
            >
              Consultar la presentación institucional del equipo
            </a>
          </ProjectSection>
          <ProjectSection name="explorar" title="Del propósito a la evidencia">
            <p>
              Puedes profundizar en cómo se obtiene la información o comenzar por un lugar del territorio. Son dos
              formas de seguir conociendo nuestros cielos.
            </p>
            <div className="flex flex-wrap gap-4">
              <LinkButton href="/medicion">Cómo medimos</LinkButton>
              <LinkButton href="/#explorar" variant="neutral">
                Explorar el mapa
              </LinkButton>
            </div>
            <p className="text-sm">
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
