import type { LatLng } from '@shared/features/instruments'

/** OpenFreeMap positron vector style — free, no API key, no registration. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

/** Región de Coquimbo default view (matches the production site). */
export const DEFAULT_CENTER: LatLng = { lat: -30.5, lng: -71.7 }
export const DEFAULT_ZOOM = 8