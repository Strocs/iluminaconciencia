'use client'

import type { CSSProperties } from 'react'
import { AttributionControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getBortleClass } from '@/_shared/bortle/lookup'
import type { MapMark } from '../types'
import { useMapFilters } from '../hooks/useMapFilters'
import { cn } from '@/_utils/cn'

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())

interface MapCanvasProps {
  selectedId: string | null
  panelOpen: boolean
  onSelect: (mark: MapMark, trigger: HTMLElement) => void
}

const MAP_STYLE_URL = '/maps/openfreemap-dark.json'
const DEFAULT_CENTER = { latitude: -30.02, longitude: -71.27 }
const DEFAULT_ZOOM = 9

export function MapCanvas({ selectedId, panelOpen, onSelect }: MapCanvasProps) {
  const marks = useMapFilters((state) => state.filteredMarks)
  return (
    <div
      role="region"
      aria-label="Mapa de puntos de medición"
      className={`size-full [&_.maplibregl-cooperative-gesture-screen]:text-center [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:m-0! [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:grid [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:gap-1.5 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:bg-transparent [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:shadow-none [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:size-11 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:rounded-md [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:border [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:border-border [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:bg-background [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:focus-visible]:outline-2 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:focus-visible]:outline-primary [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:hover]:border-primary [&_.maplibregl-ctrl-top-left:has(.maplibregl-ctrl-zoom-in)]:top-3! [&_.maplibregl-ctrl-top-left:has(.maplibregl-ctrl-zoom-in)]:right-3! [&_.maplibregl-ctrl-top-left:has(.maplibregl-ctrl-zoom-in)]:left-auto! md:[&_.maplibregl-ctrl-top-left:has(.maplibregl-ctrl-zoom-in)]:right-auto! md:[&_.maplibregl-ctrl-top-left:has(.maplibregl-ctrl-zoom-in)]:left-3! [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:bg-primary [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:bg-none [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20d=%22M12%205v14M5%2012h14%22%20stroke=%22black%22%20stroke-width=%222%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E')] [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-size-[29px_29px] [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-center [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-no-repeat [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:bg-primary [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:bg-none [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20d=%22M5%2012h14%22%20stroke=%22black%22%20stroke-width=%222%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E')] [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-size-[29px_29px] [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-center [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-no-repeat ${panelOpen ? '[&_.maplibregl-ctrl]:hidden! md:[&_.maplibregl-ctrl]:block!' : ''}`}
    >
      <Map
        mapStyle={MAP_STYLE_URL}
        initialViewState={{ ...DEFAULT_CENTER, zoom: DEFAULT_ZOOM }}
        cooperativeGestures
        locale={{
          'CooperativeGesturesHandler.WindowsHelpText': 'Mantén Ctrl y usa la rueda para acercar o alejar el mapa',
          'CooperativeGesturesHandler.MacHelpText': 'Mantén ⌘ y desplázate para acercar o alejar el mapa',
          'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa'
        }}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <AttributionControl compact position="bottom-left" />
        <NavigationControl showCompass={false} position="top-left" />
        {marks.map((mark) => {
          const bortle = getBortleClass(mark.bortleLevel)
          const label = bortle?.label ?? '–'
          const color = bortle?.color ?? 'var(--color-primary)'
          const textColor = bortle?.textTone === 'dark' ? '#111114' : 'var(--color-foreground)'
          const selected = mark.id === selectedId
          return (
            <Marker key={mark.id} latitude={mark.position.lat} longitude={mark.position.lng} anchor="center">
              <button
                type="button"
                aria-label={`Ver detalle de ${mark.name}`}
                aria-pressed={selected}
                className={cn(
                  'flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-(--mark-color) font-bold transition-all hover:bg-(--mark-color) hover:text-(--mark-text) focus-visible:bg-(--mark-color) focus-visible:text-(--mark-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none',
                  selected ? 'bg-(--mark-color) text-(--mark-text)' : 'bg-[#111114] text-foreground'
                )}
                style={
                  {
                    '--mark-color': color,
                    '--mark-text': textColor
                  } as CSSProperties
                }
                onClick={(event) => onSelect(mark, event.currentTarget)}
              >
                {label}
              </button>
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}
