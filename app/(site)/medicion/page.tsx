import Link from 'next/link'
import { PageIndex } from '../_features/sidebar/_components/PageIndex'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import tessW from './_assets/tessw-label.png'
import tess4C from './_assets/tess4c-label.png'
import bortle from './_assets/bortle.png'
import { SectionHeading } from '@/_components/SectionHeading'
import { Separator } from '@/_components/Separator'
import { Button } from '@/_components/Button'
import { InfoPopover } from '@/_components/InfoPopover'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { SiteSidebar } from '../_features/sidebar/_components/SiteSidebar'
import { LatestNews } from '../_features/sidebar/_components/LatestNews'
import { LatestArticles } from '../_features/sidebar/_components/LatestArticles'

export const metadata: Metadata = {
  title: 'Cómo medimos | IluminAconciencia',
  description:
    'Conoce los instrumentos de la red, cómo se registran las observaciones y qué considerar al interpretar el brillo del cielo nocturno.',
  alternates: { canonical: '/medicion' }
}

const sections = [
  ['observacion', 'Qué observamos'],
  ['instrumentos', 'Instrumentos y nodos'],
  ['datos', 'De la observación al dato'],
  ['interpretacion', 'Cómo leer las mediciones'],
  ['antecedentes', 'Otras formas de observar'],
  ['explorar', 'Consultar la red']
] as const

function MeasurementSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 space-y-6">
      <h2 id={`${id}-title`} className="font-heading text-3xl leading-tight text-foreground">
        {title}
      </h2>
      {children}
      <Separator />
    </section>
  )
}

export default function MedicionPage() {
  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Cómo medimos' }]} />
        <SectionHeading
          as="h1"
          eyebrow="CÓMO MEDIMOS"
          title="Observar la noche, comprender nuestros cielos"
          subtitle="Instrumentos, registros y contexto para leer el brillo del cielo nocturno."
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="min-w-0 space-y-12 font-body text-base leading-relaxed text-text [&_p]:max-w-prose [&_p]:font-extralight">
          <MeasurementSection id="observacion" title="Qué nos cuenta el brillo del cielo">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <p>
                Generar una red de observación para recopilar datos sobre cómo se comporta el brillo del cielo nocturno
                en la Región de Coquimbo es uno de los objetivos de IluminAconciencia. Los registros permiten comparar
                lugares rurales y urbanos y observar sus cambios a lo largo del tiempo.
              </p>
              <p>
                Medir el brillo del cielo no equivale a medir únicamente luz artificial. La Luna y las nubes también
                pueden modificar lo que registran los instrumentos: cada observación necesita su contexto.
              </p>
            </div>
          </MeasurementSection>
          <MeasurementSection id="instrumentos" title="Los instrumentos de la red">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <Image
                  src={tessW}
                  alt="Vista superior del fotómetro TESS-W"
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="mx-auto aspect-square w-full max-w-80 object-contain"
                />
                <h3 className="font-heading text-2xl text-foreground">TESS-W</h3>
                <p>
                  Los{' '}
                  <InfoPopover label="Qué es un fotómetro" trigger="fotómetros">
                    <p>
                      Un fotómetro es un instrumento que mide luz. En esta red se utiliza para registrar el brillo del
                      cielo nocturno, no para medir directamente efectos sobre la salud o la biodiversidad.
                    </p>
                  </InfoPopover>{' '}
                  TESS-W monitorean el brillo del cielo nocturno y permiten estimar la presencia de nubes. Su misión es
                  realizar mediciones continuas que, reunidas a lo largo del tiempo, permiten estudiar el entorno
                  nocturno.
                </p>
              </div>
              <div className="space-y-4">
                <Image
                  src={tess4C}
                  alt="Vista superior del fotómetro TESS-4C"
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="mx-auto aspect-square w-full max-w-80 object-contain"
                />
                <h3 className="font-heading text-2xl text-foreground">TESS-4C</h3>
                <p>
                  Los TESS-4C también forman parte de los instrumentos presentes en la red. En la tabla de datos puedes
                  identificar qué puntos utilizan este equipo y consultar sus registros por ubicación.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-heading text-xl text-foreground">Más que un fotómetro</h3>
              <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                <p>
                  Los{' '}
                  <InfoPopover label="Qué es un nodo de medición" trigger="nodos">
                    <p>
                      Un nodo es un punto de la red donde se reúne el equipo que registra las observaciones. El
                      instrumento es parte del nodo, junto con los dispositivos de almacenamiento y transmisión.
                    </p>
                  </InfoPopover>{' '}
                  combinan un fotómetro para medir el brillo del cielo, sensores para monitorear las condiciones
                  meteorológicas y dispositivos que permiten almacenar y transmitir los datos recopilados. Los
                  emplazamientos incluyen establecimientos educacionales y observatorios turísticos.
                </p>
                <p>
                  Para la instalación se han diseñado soportes y anclajes mediante impresión 3D, con materiales
                  adecuados para exteriores y condiciones climáticas exigentes.
                </p>
              </div>
            </div>
          </MeasurementSection>
          <MeasurementSection id="datos" title="De la observación al dato">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <ol className="space-y-8">
                <li className="space-y-2">
                  <h3 className="font-heading text-xl text-foreground">1. Observar en distintos lugares</h3>
                  <p>
                    Los instrumentos registran el brillo del cielo en puntos rurales y urbanos. La distribución de los
                    nodos permite comparar observaciones de distintos entornos.
                  </p>
                </li>
                <li className="space-y-2">
                  <h3 className="font-heading text-xl text-foreground">2. Reunir las observaciones</h3>
                  <p>
                    El almacenamiento de las observaciones se apoya en InfluxDB, una base de datos de{' '}
                    <InfoPopover label="Qué son las series temporales" trigger="series temporales">
                      <p>
                        Son registros asociados a momentos de observación. Ordenarlos en el tiempo permite seguir
                        cambios y comparar períodos, en lugar de trabajar solo con un valor aislado.
                      </p>
                    </InfoPopover>{' '}
                    y código abierto que permite organizar los volúmenes de información generados diariamente.
                  </p>
                </li>
                <li className="space-y-2">
                  <h3 className="font-heading text-xl text-foreground">3. Consultar los registros</h3>
                  <p>
                    La tabla de la red reúne los puntos de medición y sus instrumentos. Cada ficha permite consultar la
                    información disponible del lugar y explorar los registros asociados a ese punto.
                  </p>
                </li>
              </ol>
              <p className="border-l-2 border-primary pl-5">
                La continuidad de las observaciones no significa que todos los puntos dispongan de la misma cantidad de
                registros. Al comparar lugares, considera el período observado y los datos disponibles en cada uno.
              </p>
            </div>
          </MeasurementSection>
          <MeasurementSection id="interpretacion" title="Una lectura necesita contexto">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-heading text-xl text-foreground">La Luna y la nubosidad</h3>
                <p>
                  La Luna y las nubes pueden amplificar o reducir el brillo del cielo. Reunir observaciones de muchas
                  noches sin Luna y con cielos despejados ayuda a estudiar la contribución de la iluminación artificial
                  sin confundirla con otros cambios del entorno.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-heading text-xl text-foreground">La escala Bortle</h3>
                <p>
                  La{' '}
                  <InfoPopover label="Cómo se lee la escala Bortle" trigger="escala Bortle">
                    <p>
                      El nivel 1 corresponde a un cielo excepcionalmente oscuro y el 9 a un centro de ciudad. Los
                      niveles describen condiciones de observación: no son un porcentaje de contaminación lumínica.
                    </p>
                  </InfoPopover>{' '}
                  describe la apariencia del cielo y la visibilidad de estrellas y otros objetos mediante nueve niveles:
                  desde cielos excepcionalmente oscuros hasta centros de ciudad. Es una referencia para comprender el
                  entorno de cada punto, no un sustituto de sus registros instrumentales.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-heading text-xl text-foreground">Qué nos dicen los registros</h3>
              <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                <p>
                  La cantidad de datos indica cuántos registros se reúnen. Para describir un conjunto de observaciones
                  también se utilizan la{' '}
                  <InfoPopover label="Qué significa magnitud media" trigger="magnitud media">
                    <p>
                      Es el promedio de los valores de magnitud de un conjunto de registros. Resume el período
                      considerado, pero puede ocultar diferencias entre noches y no representa cada observación.
                    </p>
                  </InfoPopover>{' '}
                  y la{' '}
                  <InfoPopover label="Qué significa desviación estándar" trigger="desviación estándar">
                    <p>
                      Es una medida de la dispersión de los valores respecto de su media. No equivale por sí sola al
                      error del instrumento ni explica la causa de las variaciones.
                    </p>
                  </InfoPopover>
                  . Un promedio resume el conjunto, pero no muestra por sí solo cómo varía el cielo entre noches.
                </p>
                <p>
                  Para interpretar una medición, considera su ubicación, el período observado y las condiciones del
                  cielo. Un punto publicado no garantiza por sí solo que existan registros recientes.
                </p>
              </div>
            </div>
            <figure className="space-y-3">
              <div
                tabIndex={0}
                role="region"
                aria-label="Comparación visual de cielos en la escala Bortle"
                className="overflow-x-auto rounded-sm border border-border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Image
                  src={bortle}
                  alt="Comparación de la visibilidad de estrellas: desde el cielo urbano de niveles 8 y 9 hasta el cielo oscuro de nivel 1"
                  sizes="(max-width: 1024px) 1024px, 1280px"
                  className="h-auto w-full min-w-5xl"
                />
              </div>
              <figcaption className="max-w-prose text-sm leading-relaxed">
                La visibilidad de las estrellas cambia con las condiciones del cielo. Desplaza la imagen horizontalmente
                para recorrer la comparación completa.
              </figcaption>
            </figure>
          </MeasurementSection>
          <MeasurementSection id="antecedentes" title="Otras formas de observar el cielo">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <p>
                Desde 2019, el Grupo de Protección de los Cielos Nocturnos ULS/NOIRLab ha desarrollado campañas de
                observación con sistemas Sky Quality Camera: cámaras Canon EOS 6D Mark II equipadas con{' '}
                <InfoPopover label="Qué es un lente ojo de pez" trigger="lentes ojo de pez">
                  <p>
                    Son lentes de campo de visión muy amplio que permiten incluir una gran parte del cielo en una
                    imagen. La proyección curva la escena; no corresponde a la vista de un lente convencional.
                  </p>
                </InfoPopover>{' '}
                Sigma de 8 mm.
              </p>
              <p>
                Estas campañas permiten obtener imágenes de{' '}
                <InfoPopover label="Qué es el brillo superficial del cielo" trigger="brillo superficial del cielo">
                  <p>
                    Describe la luz procedente de una porción del cielo por unidad de área angular. Permite caracterizar
                    regiones del cielo, a diferencia del brillo de una estrella individual.
                  </p>
                </InfoPopover>{' '}
                y{' '}
                <InfoPopover label="Qué es la temperatura de color" trigger="temperatura de color">
                  <p>
                    Expresa el aspecto cromático de la luz en kelvin: tonos más cálidos o más fríos. No es la
                    temperatura del aire ni indica por sí sola cuánta luz hay.
                  </p>
                </InfoPopover>
                . La fotografía de cielo completo complementa la observación del entorno nocturno con una técnica
                distinta de la utilizada por la red de fotómetros TESS-W y TESS-4C.
              </p>
            </div>
          </MeasurementSection>
          <MeasurementSection id="explorar" title="Del instrumento al territorio">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div className="space-y-5">
                <p>
                  La tabla reúne los puntos publicados y sus instrumentos. Abre la ficha de un punto para conocer su
                  ubicación y los registros disponibles.
                </p>
                <Button href="/medicion/tabla-de-datos">Consultar la tabla de datos</Button>
              </div>
              <div className="space-y-5">
                <p>
                  Comienza por el mapa para recorrer el territorio y explorar los puntos de medición por su ubicación.
                </p>
                <Button href="/#explorar" variant="neutral">
                  Explorar el mapa
                </Button>
              </div>
            </div>
          </MeasurementSection>
        </article>
        <SiteSidebar>
          <PageIndex items={sections.map(([id, label]) => ({ id, label, href: `#${id}` }))}>
            Para conocer el propósito y las personas detrás de la red, visita <Link href="/proyecto">El proyecto</Link>.
          </PageIndex>
          <Separator />
          <LatestNews />
          <LatestArticles />
        </SiteSidebar>
      </div>
    </div>
  )
}
