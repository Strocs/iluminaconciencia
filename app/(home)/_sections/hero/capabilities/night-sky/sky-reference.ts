import type { StarCatalogRecord } from './star-catalog'

/** Fixed projected region bbox used by the original mapper normalization. */
export const REGION_BBOX = { xMin: -3.2244, xMax: 3.7127, yMin: -2.1081, yMax: 2.6389 } as const
export const MARQUEE_BBOX = { xMin: -1.5954, xMax: 1.3308, yMin: -1.3565, yMax: 1.2747 } as const
export const PORTRAIT_GROUP = { xMin: -0.7921, xMax: 0.4022, gcx: -0.2283 } as const

/** Executable pre-change computeSkyCrop(16/9) composition in projected y-up units. */
export const SKY_REFERENCE = {
  x0: -2.6601222222222223,
  y0: -1.4565,
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

/** Preserve the mapper's original stereographic projection and mirrored x axis. */
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
  return [-x, y]
}
