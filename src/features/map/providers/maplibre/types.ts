import type { LatLng } from '@shared/features/instruments'

/** Configuration required to create the MapLibre view. */
export interface MaplibreViewConfig {
  container: HTMLElement
  /** Vector style URL (MapLibre style spec). Defaults to OpenFreeMap positron. */
  styleUrl?: string
  center?: LatLng
  zoom?: number
}