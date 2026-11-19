import { MapFilterProvider } from '@/_features/map/context/MapFilterContext'
import { MapExplorer } from '@/_features/map/components/MapExplorer'
import { getMapData } from '@/_features/map/_dal/getMapData'
import { SectionHeading } from '@/_components/SectionHeading'

export async function MapSection() {
  const { marks, groups } = await getMapData()

  return (
    <section
      id="explorar"
      data-header-solid-start
      tabIndex={-1}
      className="relative z-10 -mt-12 flex h-lvh w-full scroll-mt-20 flex-col px-4 text-foreground outline-none sm:px-5 lg:max-h-220"
    >
      <SectionHeading
        eyebrow="02 / EXPLORAR"
        title="Puntos de Medición"
        subtitle={`${marks.length} puntos de medición`}
      />
      <MapFilterProvider marks={marks} groups={groups}>
        <MapExplorer />
      </MapFilterProvider>
    </section>
  )
}
