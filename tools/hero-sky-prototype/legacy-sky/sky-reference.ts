import type { StarCatalogRecord } from './star-catalog'

/** Projected bounds in the north-facing orientation from Coquimbo (180° from the original). */
export const REGION_BBOX = { xMin: -3.7127, xMax: 3.2244, yMin: -2.6389, yMax: 2.1081 } as const
export const MARQUEE_BBOX = { xMin: -1.3308, xMax: 1.5954, yMin: -1.2747, yMax: 1.3565 } as const
export const PORTRAIT_GROUP = { xMin: -0.4022, xMax: 0.7921, gcx: 0.2283 } as const

/** Same 16:9 artwork and portrait star group, expressed in the rotated projected frame. */
export const SKY_REFERENCE = {
  x0: -2.7829,
  y0: -1.6052,
  width: 5.443022222222221,
  height: 3.0617,
  aspect: 16 / 9
} as const

/** Original catalog calibration; deliberately independent of the reduced sample. */
export const STAR_MAGNITUDE_RANGE = { min: -1.46, max: 6.5 } as const
export const PROJECTION_TANGENT = { raHours: 9.75, decDegrees: -7.5 } as const

const DEG_TO_RAD = Math.PI / 180
const RA0 = PROJECTION_TANGENT.raHours * 15 * DEG_TO_RAD
const DEC0 = PROJECTION_TANGENT.decDegrees * DEG_TO_RAD
const SIN_DEC0 = Math.sin(DEC0)
const COS_DEC0 = Math.cos(DEC0)

/** Stereographic projection oriented to match the north-facing photograph and raster fallback. */
export function projectStar(record: StarCatalogRecord): readonly [number, number] {
  const ra = record.ra * 15 * DEG_TO_RAD
  const dec = record.dec * DEG_TO_RAD
  const sinDec = Math.sin(dec)
  const cosDec = Math.cos(dec)
  const deltaRa = ra - RA0
  const cosC = SIN_DEC0 * sinDec + COS_DEC0 * cosDec * Math.cos(deltaRa)
  const scale = 2 / (1 + cosC)
  const x = scale * cosDec * Math.sin(deltaRa)
  const y = scale * (COS_DEC0 * sinDec - SIN_DEC0 * cosDec * Math.cos(deltaRa))
  return [x, -y]
}
