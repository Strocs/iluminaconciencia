// @ts-expect-error Native Node TypeScript tests require an explicit extension.
import { MARQUEE_BBOX, PORTRAIT_GROUP, REGION_BBOX, SKY_REFERENCE } from './sky-reference.ts'
import type { nightSkyAssets } from './sky-assets'

export { MARQUEE_BBOX, PORTRAIT_GROUP, REGION_BBOX }

export interface SkyCrop {
  readonly scaleX: number
  readonly scaleY: number
  readonly offsetX: number
  readonly offsetY: number
}

export interface SkyArtworkPlacement {
  readonly crop: SkyCrop
  readonly width: number
  readonly height: number
  readonly left: number
  readonly top: number
}

type SkyBounds = typeof nightSkyAssets.bounds

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value))

export function computeSkyCrop(aspect: number): SkyCrop {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
  }

  let x0: number
  let y0: number
  let width: number
  let height: number
  if (aspect <= SKY_REFERENCE.aspect) {
    height = SKY_REFERENCE.height
    width = height * aspect
    const referenceCenterX = SKY_REFERENCE.x0 + SKY_REFERENCE.width / 2
    const desiredCenterX = aspect < 1 ? PORTRAIT_GROUP.gcx : referenceCenterX
    const centerX = clamp(
      desiredCenterX,
      SKY_REFERENCE.x0 + width / 2,
      SKY_REFERENCE.x0 + SKY_REFERENCE.width - width / 2
    )
    x0 = centerX - width / 2
    y0 = SKY_REFERENCE.y0
  } else {
    width = SKY_REFERENCE.width
    height = width / aspect
    x0 = SKY_REFERENCE.x0
    y0 = SKY_REFERENCE.y0 + (SKY_REFERENCE.height - height) / 2
  }

  const regionWidth = REGION_BBOX.xMax - REGION_BBOX.xMin
  const regionHeight = REGION_BBOX.yMax - REGION_BBOX.yMin
  const scaleX = regionWidth / width
  const scaleY = regionHeight / height
  const offsetX = ((x0 - REGION_BBOX.xMin) / regionWidth) * scaleX
  const offsetY = (1 - (y0 + height - REGION_BBOX.yMin) / regionHeight) * scaleY
  return { scaleX, scaleY, offsetX, offsetY }
}

export function computeSkyArtworkPlacement(width: number, height: number, bounds: SkyBounds): SkyArtworkPlacement {
  if (!(width > 0) || !(height > 0)) throw new Error('Hero sky placement requires non-zero host dimensions')
  const crop = computeSkyCrop(width / height)
  const regionWidth = REGION_BBOX.xMax - REGION_BBOX.xMin
  const regionHeight = REGION_BBOX.yMax - REGION_BBOX.yMin
  const visibleLeft = REGION_BBOX.xMin + (crop.offsetX / crop.scaleX) * regionWidth
  const visibleTop = REGION_BBOX.yMax - (crop.offsetY / crop.scaleY) * regionHeight
  const visibleWidth = regionWidth / crop.scaleX
  const visibleHeight = regionHeight / crop.scaleY
  const u = (visibleLeft - bounds.x0) / bounds.width
  const v = (bounds.y0 + bounds.height - visibleTop) / bounds.height
  const spanU = visibleWidth / bounds.width
  const spanV = visibleHeight / bounds.height
  const planeWidth = width / spanU
  const planeHeight = height / spanV
  return {
    crop,
    width: planeWidth,
    height: planeHeight,
    left: -u * planeWidth,
    top: -v * planeHeight
  }
}

export function skyArtworkCssVariables(): Record<`--${string}`, string> {
  const portraitCenter = (PORTRAIT_GROUP.gcx - SKY_REFERENCE.x0) / SKY_REFERENCE.width
  const referenceCenter = (SKY_REFERENCE.x0 + SKY_REFERENCE.width / 2 - SKY_REFERENCE.x0) / SKY_REFERENCE.width
  return {
    '--sky-reference-aspect': `${SKY_REFERENCE.aspect} / 1`,
    '--sky-reference-center-cqh': `${portraitCenter * SKY_REFERENCE.aspect * 100}cqh`,
    '--sky-middle-center-cqh': `${referenceCenter * SKY_REFERENCE.aspect * 100}cqh`,
    '--sky-wide-height-cqw': `${(100 / SKY_REFERENCE.aspect)}cqw`
  }
}
