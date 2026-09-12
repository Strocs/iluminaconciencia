/**
 * Instruments data domain — shared across features and the future
 * data-access layer (REST, direct connection, or another protocol).
 */

export interface LatLng {
  lat: number
  lng: number
}

export type InstrumentType = string

export interface InstrumentDetails {
  altitude: number
  weather: string
  site: string
}

export interface Instrument {
  id: string
  name: string
  location: string
  type: InstrumentType
  position: LatLng
  /** Bortle scale level (1-9). Null when the instrument has no measurement. */
  bortleLevel: number | null
  /** Mean sky brightness magnitude (mag/arcsec²). Null when unknown. */
  mag: number | null
  /** Number of recorded data points. Null when unknown. */
  dataCount: number | null
  detailUrl?: string
  details: InstrumentDetails
}
