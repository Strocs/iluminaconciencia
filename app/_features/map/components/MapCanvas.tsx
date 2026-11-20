'use client'

import { Fragment, useCallback, useRef, useState, type Ref, type RefObject } from 'react'
import { AttributionControl, Layer, Map, Marker, Source, type MapRef } from 'react-map-gl/maplibre'
import { setWorkerUrl, type Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapGroup } from '../types'
import { GroupFigure } from './GroupFigure'
import { MapMarkButton } from './MapMarkButton'
import { MapNavigationControls } from './MapNavigationControls'
import { useMapFilters } from '../hooks/useMapFilters'
import { cn } from '@/_utils/cn'
import type { ChileRegion } from '../chile-regions'
import { communeBoundaryUrl, registerCommuneBoundaryProtocol } from '../commune-boundary-source'
import { getRegionPadding } from '../map-camera'
import { regionBoundaryUrl, registerRegionBoundaryProtocol } from '../region-boundary-source'
import styles from './MapCanvas.module.css'

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())
registerRegionBoundaryProtocol()
registerCommuneBoundaryProtocol()

interface MapCanvasProps {
  selectedId: string | null
  selectedGroupId: string | null
  mapRef: Ref<MapRef>
  floatingPanelRef: RefObject<HTMLElement | null> | null
  region: ChileRegion
  panelOpen: boolean
  cooperativeGestures?: boolean
  fullscreen?: boolean
  onSelect: (group: MapGroup, trigger: HTMLElement, memberId?: string) => void
  onClose: () => void
}

const MAP_STYLE_URL = '/maps/openfreemap-dark.json'
// The local OpenFreeMap style groups text layers above the basemap geometry.
const FIRST_MAP_LABEL_LAYER = 'water_name'
const COMMUNE_MIN_ZOOM = 6
const REGIONAL_ATTRIBUTION =
  'Límites: <a href="https://www.geoboundaries.org/">BCN / OCHA ROLAC · geoBoundaries</a> · <a href="https://creativecommons.org/licenses/by/3.0/igo/">CC BY 3.0 IGO</a>'

export function MapCanvas({
  selectedId,
  selectedGroupId,
  mapRef,
  floatingPanelRef,
  region,
  panelOpen,
  cooperativeGestures = true,
  fullscreen = false,
  onSelect,
  onClose
}: MapCanvasProps) {
  const groups = useMapFilters((state) => state.filteredGroups)
  const loadedMap = useRef<MapLibreMap | null>(null)
  const [mapGeneration, setMapGeneration] = useState(0)
  const [initialPadding, setInitialPadding] = useState<ReturnType<typeof getRegionPadding>>(null)
  const [showCommunes, setShowCommunes] = useState(false)
  const { code: regionCode, bounds } = region
  const communeData = showCommunes ? communeBoundaryUrl(regionCode) : null
  const measureViewport = useCallback(
    (viewport: HTMLDivElement | null) => {
      if (!viewport) return
      const measure = () => getRegionPadding(viewport, floatingPanelRef?.current ?? null)
      const padding = measure()
      if (padding) {
        setInitialPadding(padding)
        return
      }

      // An Activity can initially hide the viewport; wait for a measurable size.
      const observer = new ResizeObserver(() => {
        const nextPadding = measure()
        if (!nextPadding) return
        observer.disconnect()
        setInitialPadding(nextPadding)
      })
      observer.observe(viewport)
      return () => observer.disconnect()
    },
    [floatingPanelRef]
  )

  if (!initialPadding) return <div ref={measureViewport} className="size-full" />

  return (
    <div
      ref={measureViewport}
      role="region"
      aria-label="Mapa de puntos de medición"
      className={cn('size-full', styles.map, panelOpen && styles.controlsHidden)}
    >
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        onClick={onClose}
        onZoom={({ target }) => setShowCommunes(target.getZoom() >= COMMUNE_MIN_ZOOM)}
        onLoad={({ target }) => {
          setShowCommunes(target.getZoom() >= COMMUNE_MIN_ZOOM)
          if (loadedMap.current === target) return
          target.touchZoomRotate.disableRotation()
          target.keyboard.disableRotation()
          // Activity preserves children while react-map-gl replaces its map instance.
          if (loadedMap.current !== null) setMapGeneration((generation) => generation + 1)
          loadedMap.current = target
        }}
        initialViewState={{ bounds, fitBoundsOptions: { padding: initialPadding }, bearing: 0, pitch: 0 }}
        maxPitch={0}
        dragRotate={false}
        touchPitch={false}
        cooperativeGestures={cooperativeGestures}
        locale={{
          'CooperativeGesturesHandler.WindowsHelpText': 'Mantén Ctrl y usa la rueda para acercar o alejar el mapa',
          'CooperativeGesturesHandler.MacHelpText': 'Mantén ⌘ y desplázate para acercar o alejar el mapa',
          'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa'
        }}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <Fragment key={mapGeneration}>
          {communeData && (
            <Source
              key={'commune-' + regionCode}
              id={'chile-commune-' + regionCode}
              type="geojson"
              data={communeData}
              tolerance={0}
            >
              <Layer
                id={'chile-commune-boundaries-' + regionCode}
                type="line"
                beforeId={FIRST_MAP_LABEL_LAYER}
                minzoom={COMMUNE_MIN_ZOOM}
                paint={{ 'line-color': '#f4bd63', 'line-width': 1, 'line-opacity': 0.65, 'line-dasharray': [3, 3] }}
              />
            </Source>
          )}
          <Source
            key={regionCode}
            id={'chile-region-' + regionCode}
            type="geojson"
            data={regionBoundaryUrl(regionCode)}
            tolerance={0}
            attribution={REGIONAL_ATTRIBUTION}
          >
            <Layer
              id={'chile-region-boundary-' + regionCode}
              type="line"
              beforeId={FIRST_MAP_LABEL_LAYER}
              paint={{ 'line-color': '#f4bd63', 'line-width': 1.5 }}
            />
          </Source>
          <AttributionControl compact position="bottom-left" />
          <MapNavigationControls fullscreen={fullscreen} />
          {groups.map((group) => {
            if (group.members.length > 1)
              return (
                <Marker
                  key={group.id}
                  latitude={group.position.lat}
                  longitude={group.position.lng}
                  anchor="center"
                  style={{ zIndex: 2, pointerEvents: 'none' }}
                >
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
              <Marker
                key={group.id}
                latitude={mark.position.lat}
                longitude={mark.position.lng}
                anchor="center"
                style={{ zIndex: mark.instrumentType === 'SQC' ? 0 : 1, pointerEvents: 'none' }}
              >
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
