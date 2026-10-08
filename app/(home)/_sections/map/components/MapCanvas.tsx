'use client'

import { AttributionControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getBortleClass } from '@/_shared/bortle/lookup'
import type { MapInstrument } from '../data/types'
import { useMapFilters } from '../hooks/useMapFilters'

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())

interface MapCanvasProps {
  selectedId: string | null
  mapStyle: string
  initialViewState: { latitude: number; longitude: number; zoom: number }
  panelOpen: boolean
  onSelect: (instrument: MapInstrument, trigger: HTMLButtonElement) => void
}

export function MapCanvas({ selectedId, mapStyle, initialViewState, panelOpen, onSelect }: MapCanvasProps) {
  const instruments = useMapFilters((state) => state.filteredInstruments)
  return (
    <div
      role="region"
      aria-label="Mapa de puntos de medición"
      className={`size-full [&_.maplibregl-ctrl-bottom-right:has(>_.maplibregl-ctrl-group>_.maplibregl-ctrl-zoom-in)]:right-3 [&_.maplibregl-ctrl-bottom-right:has(>_.maplibregl-ctrl-group>_.maplibregl-ctrl-zoom-in)]:bottom-3 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:m-0 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:grid [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:gap-1.5 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:bg-transparent [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)]:shadow-none [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:size-11 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:rounded-md [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:border [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:border-border [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button]:bg-background [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:focus-visible]:outline-2 [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:focus-visible]:outline-primary [&_.maplibregl-ctrl-group:has(>_.maplibregl-ctrl-zoom-in)_button:hover]:border-primary [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:bg-primary [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:bg-none [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20d=%22M12%205v14M5%2012h14%22%20stroke=%22black%22%20stroke-width=%222%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E')] [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-size-[29px_29px] [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-center [&_.maplibregl-ctrl-zoom-in_.maplibregl-ctrl-icon]:mask-no-repeat [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:bg-primary [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:bg-none [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20d=%22M5%2012h14%22%20stroke=%22black%22%20stroke-width=%222%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E')] [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-size-[29px_29px] [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-center [&_.maplibregl-ctrl-zoom-out_.maplibregl-ctrl-icon]:mask-no-repeat ${panelOpen ? '[&_.maplibregl-ctrl]:hidden! md:[&_.maplibregl-ctrl]:block!' : ''}`}
    >
      <Map
        mapStyle={mapStyle}
        initialViewState={initialViewState}
        cooperativeGestures
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <AttributionControl compact position="bottom-left" />
        <NavigationControl showCompass={false} position="bottom-right" />
        {instruments.map((instrument) => {
          const bortle = getBortleClass(instrument.bortleLevel)
          const label = bortle?.label ?? '–'
          const color = bortle?.color ?? 'var(--color-primary)'
          const textColor = bortle?.textTone === 'dark' ? '#111114' : '#f5f0f2'
          const selected = instrument.id === selectedId
          return (
            <Marker
              key={instrument.id}
              latitude={instrument.position.lat}
              longitude={instrument.position.lng}
              anchor="center"
            >
              <button
                type="button"
                aria-label={`Ver detalle de ${instrument.name}`}
                aria-pressed={selected}
                title={instrument.name}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
                style={{
                  borderColor: color,
                  backgroundColor: selected ? color : '#111114',
                  color: selected ? textColor : '#f5f0f2'
                }}
                onClick={(event) => onSelect(instrument, event.currentTarget)}
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
