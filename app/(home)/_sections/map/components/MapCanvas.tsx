'use client'

import { Fragment, useRef, useState } from 'react'
import { AttributionControl, Map, Marker, NavigationControl } from 'react-map-gl/maplibre'
import { setWorkerUrl, type Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapGroup } from '../types'
import { GroupFigure } from './GroupFigure'
import { MapMarkButton } from './MapMarkButton'
import { useMapFilters } from '../hooks/useMapFilters'
import { cn } from '@/_utils/cn'
import styles from './MapCanvas.module.css'

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())

interface MapCanvasProps {
  selectedId: string | null
  selectedGroupId: string | null
  panelOpen: boolean
  onSelect: (group: MapGroup, trigger: HTMLElement, memberId?: string) => void
  onClose: () => void
}

const MAP_STYLE_URL = '/maps/openfreemap-dark.json'
const DEFAULT_CENTER = { latitude: -30.02, longitude: -71.27 }
const DEFAULT_ZOOM = 9
const NAVIGATION_POSITION = 'bottom-right'

export function MapCanvas({ selectedId, selectedGroupId, panelOpen, onSelect, onClose }: MapCanvasProps) {
  const groups = useMapFilters((state) => state.filteredGroups)
  const loadedMap = useRef<MapLibreMap | null>(null)
  const [mapGeneration, setMapGeneration] = useState(0)

  return (
    <div
      role="region"
      aria-label="Mapa de puntos de medición"
      className={cn('size-full', styles.map, panelOpen && styles.controlsHidden)}
    >
      <Map
        mapStyle={MAP_STYLE_URL}
        onClick={onClose}
        onLoad={({ target }) => {
          if (loadedMap.current === target) return
          // Activity preserves children while react-map-gl replaces its map instance.
          if (loadedMap.current !== null) setMapGeneration((generation) => generation + 1)
          loadedMap.current = target
        }}
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
        <Fragment key={mapGeneration}>
          <AttributionControl compact position="bottom-left" />
          <NavigationControl key={NAVIGATION_POSITION} showCompass={false} position={NAVIGATION_POSITION} />
          {groups.map((group) => {
            if (group.members.length > 1)
              return (
                <Marker key={group.id} latitude={group.position.lat} longitude={group.position.lng} anchor="center">
                  <GroupFigure
                    group={group}
                    expanded={selectedGroupId === group.id}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                </Marker>
              )
            const mark = group.members[0]
            return (
              <Marker key={group.id} latitude={mark.position.lat} longitude={mark.position.lng} anchor="center">
                <div className="flex size-8 items-center justify-center">
                  <MapMarkButton
                    mark={mark}
                    selected={mark.id === selectedId}
                    groupId={group.id}
                    onSelect={(trigger) => onSelect(group, trigger, mark.id)}
                  />
                </div>
              </Marker>
            )
          })}
        </Fragment>
      </Map>
    </div>
  )
}
