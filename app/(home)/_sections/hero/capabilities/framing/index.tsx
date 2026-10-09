import type { CSSProperties, ReactNode } from 'react'
import { frontalSilhouette, frontalSilhouetteGeometry } from '../landscape/svg-path'

const nearest = frontalSilhouette
const { viewBoxWidth, viewBoxHeight, translateY, contourValleyY } = frontalSilhouetteGeometry
const valleyBottomGap = viewBoxHeight - translateY - contourValleyY
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"><rect width="${viewBoxWidth}" height="${viewBoxHeight}" fill="white"/><path d="${nearest.d}" fill="${nearest.fill}" transform="translate(0 ${translateY})"/></svg>`
const nearestMaskImage = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`

type Props = { children: ReactNode }

export function HeroFrame({ children }: Props) {
  return (
    <div className="relative isolate h-full overflow-x-clip overflow-y-visible">
      <div
        className="absolute inset-x-0 top-0 mx-auto size-full max-w-480 bg-black mask-[var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] mask-add [mask-mode:luminance,alpha] mask-size-[var(--hero-art-width)_var(--hero-art-height),100%_100%] mask-[center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [mask-repeat:no-repeat,no-repeat] [-webkit-mask-composite:source-over] [-webkit-mask-image:var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] [-webkit-mask-position:center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [-webkit-mask-repeat:no-repeat,no-repeat] [-webkit-mask-size:var(--hero-art-width)_var(--hero-art-height),100%_100%]"
        style={
          {
            '--hero-art-width': 'min(120rem, 250vw)',
            '--hero-art-height': 'calc(var(--hero-art-width) * 17 / 24)',
            '--hero-art-offset-y': 'calc(var(--hero-art-width) * 182.5 / 2400)',
            '--hero-nearest-mask-offset-y': `calc(var(--hero-art-width) * ${valleyBottomGap} / ${viewBoxWidth} - 5vh)`,
            '--hero-nearest-mask-image': nearestMaskImage
          } as CSSProperties
        }
      >
        <div className="relative h-full motion-safe:fixed motion-safe:inset-x-0 motion-safe:top-0 motion-safe:mx-auto motion-safe:h-dvh motion-safe:w-full motion-safe:max-w-480">
          {children}
        </div>
      </div>
    </div>
  )
}
