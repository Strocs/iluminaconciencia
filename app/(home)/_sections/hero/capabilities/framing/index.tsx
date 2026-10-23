import type { CSSProperties, ReactNode } from 'react'
import { frontalSilhouette, frontalSilhouetteGeometry, landscapeStyle } from '../../landscape'

const nearest = frontalSilhouette
const { viewBoxWidth, viewBoxHeight, translateY } = frontalSilhouetteGeometry
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"><rect width="${viewBoxWidth}" height="${viewBoxHeight}" fill="white"/><path d="${nearest.d}" fill="${nearest.fill}" transform="translate(0 ${translateY})"/></svg>`
const nearestMaskImage = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`

type Props = { children: ReactNode; overlay?: ReactNode }

export function HeroFrame({ children, overlay }: Props) {
  return (
    <div className="relative isolate h-full overflow-x-clip overflow-y-visible" style={landscapeStyle}>
      <div
        className="absolute inset-x-0 top-0 mx-auto size-full max-w-480 bg-black mask-[var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] mask-add [mask-mode:luminance,alpha] mask-size-[var(--hero-art-width)_var(--hero-art-height),100%_100%] mask-[center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [mask-repeat:no-repeat,no-repeat] [-webkit-mask-composite:source-over] [-webkit-mask-image:var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] [-webkit-mask-position:center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [-webkit-mask-repeat:no-repeat,no-repeat] [-webkit-mask-size:var(--hero-art-width)_var(--hero-art-height),100%_100%]"
        style={
          {
            '--hero-nearest-mask-image': nearestMaskImage
          } as CSSProperties
        }
      >
        <div className="relative h-full group-data-[frame-fixed=true]/hero:motion-safe:fixed group-data-[frame-fixed=true]/hero:motion-safe:inset-x-0 group-data-[frame-fixed=true]/hero:motion-safe:top-0 group-data-[frame-fixed=true]/hero:motion-safe:mx-auto group-data-[frame-fixed=true]/hero:motion-safe:h-lvh group-data-[frame-fixed=true]/hero:motion-safe:w-full group-data-[frame-fixed=true]/hero:motion-safe:max-w-480">
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1 mx-auto size-full max-w-480">
        {overlay}
      </div>
    </div>
  )
}
