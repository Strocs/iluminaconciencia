import type { StarCatalogRecord } from './star-catalog'
// @ts-expect-error Native Node TypeScript consumers require an explicit extension.
import { projectStar, REGION_BBOX, STAR_MAGNITUDE_RANGE } from './sky-reference.ts'

/** Historical offline profiles only: deterministic, no DOM, GL or I/O. */
export interface MappedStarData {
  readonly origins: Float32Array
  readonly stars: Float32Array
  readonly colors: Float32Array
}

const SIZE = { min: 1.25, max: 9, exponent: 1 } as const
const ALPHA = { min: 0.4, max: 1 } as const
const HASH = { phase: 0.61803398875, speed: 0.41421356237 } as const

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value))
const fract = (value: number): number => value - Math.floor(value)

const bvToRgb = (bv: number): readonly [number, number, number] => {
  const t = clamp((bv + 0.4) / 2.4, 0, 1)
  const anchors: readonly (readonly [number, number, number, number])[] = [
    [0.0, 0.62, 0.75, 1.0],
    [0.25, 0.85, 0.9, 1.0],
    [0.5, 1.0, 0.95, 0.85],
    [0.75, 1.0, 0.75, 0.5],
    [1.0, 1.0, 0.45, 0.25]
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

export function mapStarCatalog(
  records: readonly StarCatalogRecord[],
  originalIndices?: readonly number[]
): MappedStarData {
  const count = records.length
  const origins = new Float32Array(count * 2)
  const stars = new Float32Array(count * 4)
  const colors = new Float32Array(count * 4)

  const magSpan = STAR_MAGNITUDE_RANGE.max - STAR_MAGNITUDE_RANGE.min
  const projectedX = new Float64Array(count)
  const projectedY = new Float64Array(count)
  for (let index = 0; index < count; index += 1) {
    const [x, y] = projectStar(records[index])
    projectedX[index] = x
    projectedY[index] = y
  }

  const normalizedX = new Float32Array(count)
  const normalizedY = new Float32Array(count)
  const regionSpanX = REGION_BBOX.xMax - REGION_BBOX.xMin
  const regionSpanY = REGION_BBOX.yMax - REGION_BBOX.yMin
  for (let index = 0; index < count; index += 1) {
    normalizedX[index] = (projectedX[index] - REGION_BBOX.xMin) / regionSpanX
    normalizedY[index] = 1 - (projectedY[index] - REGION_BBOX.yMin) / regionSpanY
  }

  for (let index = 0; index < count; index += 1) {
    const record = records[index]
    const originTarget = index * 2
    origins[originTarget] = normalizedX[index]
    origins[originTarget + 1] = normalizedY[index]

    const brightness = clamp((STAR_MAGNITUDE_RANGE.max - record.mag) / magSpan, 0, 1)
    const sizePx = SIZE.min + Math.pow(brightness, SIZE.exponent) * (SIZE.max - SIZE.min)
    const alpha = ALPHA.min + brightness * (ALPHA.max - ALPHA.min)
    const profileIndex = originalIndices?.[index] ?? index
    const phase = fract(profileIndex * HASH.phase)
    const speed = 0.5 + fract(profileIndex * HASH.speed) * 1.5

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
