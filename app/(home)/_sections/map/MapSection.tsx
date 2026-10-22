import { MapFilterProvider } from './context/MapFilterContext'
import { MapExplorer } from './components/MapExplorer'
import { getPoints } from '@/_dal/points/getPoints'
import { SectionHeading } from '@/_components/SectionHeading'

export async function MapSection() {
  const marks = await getPoints()

  return (
    <section
      id="explorar"
      data-header-solid-start
      tabIndex={-1}
      className="relative z-10 -mt-12 flex h-dvh w-full scroll-mt-20 flex-col px-4 text-foreground outline-none sm:px-5 lg:max-h-220"
    >
      <SectionHeading
        eyebrow="02 / EXPLORAR"
        title="Puntos de Medición"
        subtitle={`${marks.length} ${marks.length === 1 ? 'punto disponible' : 'puntos disponibles'}`}
      />
      <MapFilterProvider marks={marks}>
        <MapExplorer />
      </MapFilterProvider>
    </section>
  )
}
