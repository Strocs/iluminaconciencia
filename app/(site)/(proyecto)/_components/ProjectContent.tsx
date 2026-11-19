import Link from 'next/link'
import { PageIndex } from '../../_features/sidebar/_components/PageIndex'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { LatestNews } from '../../_features/sidebar/_components/LatestNews'
import { LatestArticles } from '../../_features/sidebar/_components/LatestArticles'
import { ProjectTeam } from './ProjectTeam'
import teamPhoto from '../_assets/equipo.jpg'
import tessW from '../../_assets/instruments/tessw.png'
import tess4C from '../../_assets/instruments/tess4c.png'
import { SectionHeading } from '@/_components/SectionHeading'
import { Separator } from '@/_components/Separator'
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
        <div className="contents 2xl:order-last 2xl:block 2xl:[&>aside]:max-h-[calc(100dvh-7rem)] 2xl:[&>aside]:overflow-y-auto 2xl:[&>aside]:overscroll-contain 2xl:[&>aside]:pr-3">
          <SiteSidebar>
            <PageIndex
              items={sections.map(([id, label]) => ({ id, label, attributes: { 'data-project-target': id } }))}
            >
              ¿Quieres profundizar en los instrumentos y los datos? <Link href="/medicion">Conoce cómo medimos.</Link>
            </PageIndex>
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
                  Ilumina a Conciencia es un proyecto financiado por el Gobierno Regional que busca generar un impacto
                  positivo en la toma de conciencia frente a la problemática de la contaminación lumínica y cómo
                  cuidamos nuestro cielo y nuestra salud.
                </p>
                <p>
                  El proyecto contempla la implementación de una red de monitoreo de la contaminación lumínica de una
                  serie de nodos de medición que serán instalados en distintos puntos de la Región de Coquimbo.
                </p>
                <p>
                  La ejecución del proyecto está a cargo de un equipo multidisciplinario formado por científicos,
                  ingenieros informáticos, periodistas, diseñadores y comunicadores.
                </p>
              </div>
              <figure className="space-y-3">
                <Image
                  src={teamPhoto}
                  alt="Integrantes de IluminAconciencia reunidos al aire libre"
                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 608px"
                  className="h-auto w-full rounded-sm"
                />
                <figcaption className="text-base font-extralight italic">
                  Equipo multidisciplinario de IluminAconciencia.
                </figcaption>
              </figure>
            </div>
          </ProjectSection>
          <ProjectSection name="importancia" title="Por qué importa la oscuridad">
            <div className="grid gap-8 md:grid-cols-2">
              <p>
                La contaminación lumínica es un fenómeno provocado por el exceso de iluminación artificial en el entorno
                nocturno, que tiene consecuencias negativas tanto para los seres humanos como para el medio ambiente. Se
                produce cuando la luz artificial se dispersa, se refleja y se emite innecesariamente hacia el cielo y
                los espacios exteriores, en lugar de iluminar únicamente los lugares necesarios.
              </p>
              <div className="contents">
                <div>
                  <h3 className="font-heading text-xl text-foreground">Un cielo que podemos observar</h3>
                  <p>
                    La contaminación lumínica tiene efectos perjudiciales en la observación astronómica, al dificultar
                    la visibilidad de las estrellas y otros cuerpos celestes.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-xl text-foreground">Un entorno con ciclos naturales</h3>
                  <p>
                    La contaminación lumínica afecta directamente a los ecosistemas y la fauna, perturbando los ciclos
                    naturales de sueño y reproducción de los animales, así como la migración de aves y la supervivencia
                    de insectos polinizadores.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-xl text-foreground">Luz con un propósito</h3>
                  <p>
                    La contaminación lumínica representa un desperdicio energético significativo, ya que se consume
                    electricidad innecesaria para iluminar áreas donde no se requiere.
                  </p>
                </div>
              </div>
            </div>
          </ProjectSection>
          <ProjectSection name="trabajo" title="Observar, comprender y compartir">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-heading text-xl text-foreground">Monitoreamos el cielo</h3>
                <p>
                  El proyecto IluminAConCiencia tiene contemplada la instalación de más de 20 nodos de medición de la
                  contaminación lumínica en distintos establecimientos educacionales y observatorios turísticos de la
                  Región de Coquimbo.
                </p>
                <p className="mt-4">
                  Estos nodos están conformados por un fotómetro diseñado para la medición del brillo del cielo,
                  sensores para el monitoreo de las condiciones meteorológicas y otros dispositivos que permiten el
                  almacenamiento y transmisión de los datos recopilados en tiempo real.
                </p>
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
                    className="size-24 rounded-sm object-contain"
                  />
                  <Image
                    src={tess4C}
                    alt="Ilustración de un fotómetro TESS-4C"
                    className="size-24 rounded-sm object-contain"
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
          <ProjectSection name="contribuir" title="Cómo contribuir a mitigar la contaminación lumínica">
            <div className="space-y-6">
              <p>
                Existen diversas acciones que podemos tomar a nivel individual y colectivo para contribuir a la
                mitigación de la contaminación lumínica y promover una iluminación más responsable.
              </p>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong className="text-foreground">Uso eficiente de la iluminación:</strong> apagar las luces cuando
                  no se estén ocupando, y utilizar sensores de movimiento o temporizadores para activarlas solo cuando
                  sea requerido.
                </li>
                <li>
                  <strong className="text-foreground">Uso de iluminación direccionada:</strong> dirigir la luz hacia
                  donde se necesita y evitar la dispersión innecesaria. Utilizar iluminación focalizada y apuntar las
                  luces hacia abajo para evitar el deslumbramiento y la emisión de luz hacia el cielo.
                </li>
                <li>
                  <strong className="text-foreground">Regulación de la intensidad luminosa:</strong> utilizar
                  reguladores de intensidad o atenuadores para ajustar el brillo de las luces según las necesidades
                  específicas de cada situación.
                </li>
                <li>
                  <strong className="text-foreground">Concientización y educación:</strong> informarse y difundir el
                  tema de la contaminación lumínica para generar conciencia en la comunidad.
                </li>
              </ul>
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
              <Button href="/explorar" variant="neutral">
                Explorar el mapa
              </Button>
            </div>
          </ProjectSection>
        </article>
      </ProjectNavigation>
    </div>
  )
}
