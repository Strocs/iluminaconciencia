import type { LngLatLike } from 'maplibre-gl'
import type { LatLng } from '@shared/features/instruments'

/**
 * Converts the domain LatLng to the MapLibre/GeoJSON coordinate order.
 * GeoJSON uses [lng, lat]; the domain uses { lat, lng }. This mapping
 * absorbs that footgun here, so no other module ever sees the raw order.
 */
export function toLngLat(position: LatLng): LngLatLike {
  return [position.lng, position.lat]
}