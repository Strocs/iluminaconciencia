/**
 * Instruments data domain — shared across features and the future
 * data-access layer (REST, direct connection, or another protocol).
 */

export interface LatLng {
  lat: number
  lng: number
}

/**
 * Open instrument type.
 *
 * The backend owns the domain of values; the UI derives filter options
 * from the data itself, so adding a new instrument type never requires
 * changing this contract.
 */
export type InstrumentType = string

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
  /** Link to the instrument detail view ("ver más"). */
  detailUrl?: string
  /** Additional fields the detail drawer may expose in the future. */
  details?: Record<string, unknown>
}