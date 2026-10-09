// @ts-expect-error Native Node TypeScript tests require an explicit extension.
import { MARQUEE_BBOX, PORTRAIT_GROUP, REGION_BBOX, SKY_REFERENCE } from './sky-reference.ts'

export { MARQUEE_BBOX, PORTRAIT_GROUP, REGION_BBOX }

/**
 * Cover-crop uniforms in normalized 0..1 space, y = 0 at the TOP. Each crop is
 * an aspect-correct subrectangle of the fixed, safe 16:9 projected reference.
 */
export interface SkyCrop {
  readonly scaleX: number
  readonly scaleY: number
  readonly offsetX: number
  readonly offsetY: number
}

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
