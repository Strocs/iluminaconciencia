import type { Metadata } from 'next'
import { HeaderLayout } from '@/_features/header'
import { getMapData } from '@/_features/map/_dal/getMapData'
import { MapFilterProvider } from '@/_features/map/context/MapFilterContext'
import { MapExplorer } from '@/_features/map/components/MapExplorer'

export const metadata: Metadata = {
  title: 'Explorar el mapa | IluminAconciencia',
  description: 'Explora los instrumentos de medición del cielo nocturno en un mapa ampliado.'
}

export default async function ExplorePage() {
  const { marks, groups } = await getMapData()

  return (
    <HeaderLayout>
      <main data-header-solid-start className="flex h-dvh min-h-0 flex-col overflow-hidden pt-20 text-foreground">
        <h1 className="sr-only">Explorar los puntos de medición</h1>
        <MapFilterProvider marks={marks} groups={groups}>
          <MapExplorer fullscreen />
        </MapFilterProvider>
      </main>
    </HeaderLayout>
  )
}
