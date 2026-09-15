import 'maplibre-gl/dist/maplibre-gl.css'
import type { Instrument } from '@shared/features/instruments'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from './config'
import { toLngLat } from './mapper'
import type { MaplibreViewConfig } from './types'

// MapLibre GL JS v6 ships as ESM and derives its worker URL from `import.meta.url`.
// Inside a bundler (Vite/Astro) that URL never resolves to the real worker file, so
// the map silently renders only the style background and never fetches tiles.
// `?worker&url` routes the worker through Vite's worker pipeline and emits a
// self-contained chunk in dev and production. Do not replace it with plain `?url`:
// the worker imports a sibling shared chunk that would not be emitted, and the map
// stays black. See the "Map provider" section of the README for the full diagnosis.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

/**
 * Lazy-loaded MapLibre GL JS namespace. The library (~900 KB minified) is only
 * needed when the map section actually mounts; importing it dynamically splits
 * it into a separate chunk instead of bloating the initial bundle. `setWorkerUrl`
 * must run before the first `Map` instance is created, so it is called inside the
 * async initializer below.
 */
let maplibrePromise: Promise<typeof import('maplibre-gl')> | null = null

async function loadMaplibre() {
  if (!maplibrePromise) {
    maplibrePromise = import('maplibre-gl').then((mod) => {
      mod.setWorkerUrl(maplibreWorkerUrl)
      return mod
    })
  }
  return maplibrePromise
}

/** Public surface of the MapLibre provider. */
export interface MaplibreView {
  setPins(pins: readonly Instrument[], renderPin: (pin: Instrument) => HTMLElement): void
  onPinClick(callback: (pin: Instrument, element: HTMLElement) => void): void
  resize(): void
  destroy(): void
}

export async function createMaplibreView(config: MaplibreViewConfig): Promise<MaplibreView> {
  const { AttributionControl, Map: MapLibreMap, Marker, NavigationControl } = await loadMaplibre()

  const map = new MapLibreMap({
    container: config.container,
    style: config.styleUrl ?? MAP_STYLE_URL,
    center: toLngLat(config.center ?? DEFAULT_CENTER),
    zoom: config.zoom ?? DEFAULT_ZOOM,
    cooperativeGestures: true,
    attributionControl: false
  })

  map.addControl(new AttributionControl({ compact: true }), 'bottom-left')
  map.addControl(
    new NavigationControl({
      showZoom: true,
      showCompass: false
    }),
    'bottom-right'
  )

  let markers: InstanceType<typeof Marker>[] = []
  let pinClickHandler: ((pin: Instrument, element: HTMLElement) => void) | null = null

  return {
    setPins(pins, renderPin) {
      markers.forEach((marker) => marker.remove())
      markers = pins.map((pin) => {
        const element = renderPin(pin)
        const marker = new Marker({ element })
          .setLngLat(toLngLat(pin.position))
          .addTo(map)
        const markerElement = marker.getElement()
        markerElement.addEventListener('pointerdown', () => pinClickHandler?.(pin, markerElement))
        return marker
      })
    },
    onPinClick(callback) {
      pinClickHandler = callback
    },
    resize() {
      map.resize()
    },
    destroy() {
      markers.forEach((marker) => marker.remove())
      markers = []
      map.remove()
    }
  }
}