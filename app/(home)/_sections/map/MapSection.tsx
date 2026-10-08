import { MapFilterProvider } from './context/MapFilterContext'
import { MapExplorer } from './components/MapExplorer'
import { loadMapInstruments } from './data/instruments'
import { SectionHeading } from '@/_components/SectionHeading'

export async function MapSection() {
  const instruments = await loadMapInstruments()
  return (
    <section
      id="explorar"
      className="relative z-10 flex min-h-[max(100dvh,768px)] w-full flex-col px-4 pb-4 text-foreground sm:px-5 sm:pb-5"
    >
      <SectionHeading
        eyebrow="02 / EXPLORAR"
        title="Puntos de Medición"
        subtitle={`${instruments.length} ${instruments.length === 1 ? 'punto disponible' : 'puntos disponibles'}`}
      />
      <MapFilterProvider instruments={instruments}>
        <MapExplorer />
      </MapFilterProvider>
    </section>
  )
}

export type { MapInstrument } from './data/types'
