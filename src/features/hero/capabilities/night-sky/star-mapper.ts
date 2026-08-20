import type { StarCatalogRecord } from './star-catalog'
import { REGION_BBOX } from './sky-crop'

/**
 * Star catalog -> GPU-ready mapper.
 *
 * Pure, deterministic, side-effect free (no DOM, no GL, no I/O). Runs once at
 * startup and turns the static BSC5 `starCatalog` into flat typed arrays that
 * `createWebglStarRenderer` uploads directly as instanced vertex attributes.
 *
 * Coordinate convention: every origin (and constellation-line vertex) lives in
 * normalized 0..1 space where y = 0 is the TOP of the viewport. This matches
 * the shader convention (see webgl-star-renderer.ts) so no transform is needed
 * at draw time.
 */

export interface MappedStarData {
  /** x2 per star, normalized 0..1, y=0 is TOP (matches the shader convention). */
  readonly origins: Float32Array
  /** x4 per star: [phase, sizePx, alpha, speed]; size is already in CSS px. */
  readonly stars: Float32Array
  /** x4 per star: [r, g, b, a=1], each 0..1. */
  readonly colors: Float32Array
}

/** Tangent point of the stereographic projection: the approved window center. */
const PROJECTION = {
  /** RA of the tangent point, in decimal hours (9.75h). */
  raHours: 9.75,
  /** Dec of the tangent point, in decimal degrees (-7.5 deg). */
  decDegrees: -7.5
} as const

const SIZE = {
  /** Minimum star size in CSS px: the faint-end floor, always visible. */
  min: 1.25,
  /** Maximum star size in CSS px: the bright-end ceiling. */
  max: 9,
  /** Rarity exponent over the normalized brightness: 1 = linear, higher = fewer large stars. */
  exponent: 1
} as const

/**
 * Magnitude -> alpha ramp. The faint end of the data range gets the alpha
 * floor (still clearly visible), the bright end gets full opacity.
 */
const ALPHA = {
  /** Alpha at the faint end of the data range. */
  min: 0.4,
  /** Alpha at the bright end of the data range. */
  max: 1
} as const

/** Golden-ratio hash constants reused from the old procedural sky. */
const HASH = {
  /** Phase hash: evenly spreads twinkle phases across [0, 1). */
  phase: 0.61803398875,
  /** Speed hash: produces 0.5 + [0, 1.5) -> [0.5, 2.0). */
  speed: 0.41421356237
} as const

const DEG_TO_RAD = Math.PI / 180

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value))

const fract = (value: number): number => value - Math.floor(value)

/**
 * B–V to sRGB, piecewise-linear approximation of the observed main-sequence
 * color curve (blue stars have negative B–V, red stars positive). Anchors are
 * sampled from the standard B–V -> RGB chart (Mitchell Charity / Tanner Helland
 * style). B–V -0.4..2.0 is normalized to t 0..1 and the segment is interpolated.
 */
const bvToRgb = (bv: number): readonly [number, number, number] => {
  const t = clamp((bv + 0.4) / 2.4, 0, 1)
  const anchors: readonly (readonly [number, number, number, number])[] = [
    [0.0, 0.62, 0.75, 1.0], // B-V -0.4 : blue-white
    [0.25, 0.85, 0.9, 1.0], // B-V  0.2 : white
    [0.5, 1.0, 0.95, 0.85], // B-V  0.8 : yellow-white
    [0.75, 1.0, 0.75, 0.5], // B-V  1.4 : orange
    [1.0, 1.0, 0.45, 0.25] // B-V  2.0 : deep red
  ]
  let segment = 0
  while (segment < anchors.length - 2 && t > anchors[segment + 1][0]) segment += 1
  const from = anchors[segment]
  const to = anchors[segment + 1]
  const fraction = clamp((t - from[0]) / (to[0] - from[0]), 0, 1)
  return [
    from[1] + (to[1] - from[1]) * fraction,
    from[2] + (to[2] - from[2]) * fraction,
    from[3] + (to[3] - from[3]) * fraction
  ]
}

export function mapStarCatalog(records: readonly StarCatalogRecord[]): MappedStarData {
  const count = records.length
  const origins = new Float32Array(count * 2)
  const stars = new Float32Array(count * 4)
  const colors = new Float32Array(count * 4)

  // Data-relative magnitude normalization: the catalog's actual magnitude range
  // maps to t 0..1 (brightest = 1), the same principle as the projection
  // normalization. The faintest stars still land on the size/alpha floor, so
  // the sky reads dense instead of being dominated by sub-pixel dots.
  let magMin = Number.POSITIVE_INFINITY
  let magMax = Number.NEGATIVE_INFINITY
  for (const record of records) {
    if (record.mag < magMin) magMin = record.mag
    if (record.mag > magMax) magMax = record.mag
  }
  const magSpan = Math.max(magMax - magMin, Number.EPSILON)

  // Stereographic (conformal) projection onto the tangent plane at the window
  // center, then each axis normalized to [0, 1] against the fixed window D
  // region bbox and y inverted so 0 = top.
  const ra0 = PROJECTION.raHours * 15 * DEG_TO_RAD
  const dec0 = PROJECTION.decDegrees * DEG_TO_RAD
  const sinDec0 = Math.sin(dec0)
  const cosDec0 = Math.cos(dec0)
  const projectedX = new Float64Array(count)
  const projectedY = new Float64Array(count)

  for (let index = 0; index < count; index += 1) {
    const record = records[index]
    const ra = record.ra * 15 * DEG_TO_RAD
    const dec = record.dec * DEG_TO_RAD
    const sinDec = Math.sin(dec)
    const cosDec = Math.cos(dec)
    const deltaRa = ra - ra0
    const cosC = sinDec0 * sinDec + cosDec0 * cosDec * Math.cos(deltaRa)
    // k = 2 / (1 + cos c) is the stereographic scale factor; the tangent point
    // itself (cosC == 1) projects to (0, 0), well inside the fixed region bbox.
    const scale = 2 / (1 + cosC)
    projectedX[index] = scale * cosDec * Math.sin(deltaRa)
    projectedY[index] = scale * (cosDec0 * sinDec - sinDec0 * cosDec * Math.cos(deltaRa))
  }

  // Mirror the projected x-axis so east appears on the left of the viewport.
  for (let index = 0; index < count; index += 1) {
    projectedX[index] = -projectedX[index]
  }

  const normalizedX = new Float32Array(count)
  const normalizedY = new Float32Array(count)
  const regionSpanX = REGION_BBOX.xMax - REGION_BBOX.xMin
  const regionSpanY = REGION_BBOX.yMax - REGION_BBOX.yMin
  for (let index = 0; index < count; index += 1) {
    normalizedX[index] = (projectedX[index] - REGION_BBOX.xMin) / regionSpanX
    normalizedY[index] = 1 - (projectedY[index] - REGION_BBOX.yMin) / regionSpanY // invert: y = 0 is the top
  }

  for (let index = 0; index < count; index += 1) {
    const record = records[index]
    const originTarget = index * 2
    origins[originTarget] = normalizedX[index]
    origins[originTarget + 1] = normalizedY[index]

    // Data-relative magnitude -> size (CSS px, final): brightness t 0..1 raised
    // to the rarity exponent, scaled between the visible floor and ceiling.
    const brightness = clamp((magMax - record.mag) / magSpan, 0, 1)
    const sizePx = SIZE.min + Math.pow(brightness, SIZE.exponent) * (SIZE.max - SIZE.min)

    // Magnitude -> alpha along the same normalized scale.
    const alpha = ALPHA.min + brightness * (ALPHA.max - ALPHA.min)

    // Deterministic golden-ratio hash from the catalog index (same family as
    // the old procedural sky), driving the twinkle phase and speed.
    const phase = fract(index * HASH.phase)
    const speed = 0.5 + fract(index * HASH.speed) * 1.5

    const starTarget = index * 4
    stars[starTarget] = phase
    stars[starTarget + 1] = sizePx
    stars[starTarget + 2] = alpha
    stars[starTarget + 3] = speed

    const rgb = bvToRgb(record.bv)
    const colorTarget = index * 4
    colors[colorTarget] = rgb[0]
    colors[colorTarget + 1] = rgb[1]
    colors[colorTarget + 2] = rgb[2]
    colors[colorTarget + 3] = 1
  }

  return { origins, stars, colors }
}
