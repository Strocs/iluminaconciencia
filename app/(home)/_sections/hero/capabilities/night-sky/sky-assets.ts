import photo1x from '../../../../../../public/images/hero/sky/labeled-60-r1/background-1x.webp'
import photo2x from '../../../../../../public/images/hero/sky/labeled-60-r1/background-2x.webp'
import fallback1x from '../../../../../../public/images/hero/sky/labeled-60-r1/fallback/composite-1x.webp'
import fallback2x from '../../../../../../public/images/hero/sky/labeled-60-r1/fallback/composite-2x.webp'
import { SKY_REFERENCE } from './sky-reference'

export const nightSkyAssets = {
  photo1x,
  photo2x,
  fallback1x,
  fallback2x,
  bounds: SKY_REFERENCE
} as const
