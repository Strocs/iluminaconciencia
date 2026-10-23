'use client'

import type { CSSProperties } from 'react'
import { AttributionControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getBortleClass } from '@/_features/bortle/lookup'
import type { MapMark } from '../types'
import { useMapFilters } from '../hooks/useMapFilters'
import { cn } from '@/_utils/cn'
import styles from './MapCanvas.module.css'

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
      className={cn('size-full', styles.map, panelOpen && styles.controlsHidden)}
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
