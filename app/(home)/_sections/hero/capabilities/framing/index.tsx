import type { CSSProperties, ReactNode } from 'react'
import { hillPaths } from '../landscape/svg-path'

const nearest = hillPaths.nearest
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1700" viewBox="0 0 2400 1700"><rect width="2400" height="1700" fill="white"/><path d="${nearest.d}" fill="black"/></svg>`
const nearestMaskImage = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`

type Props = { children: ReactNode }

export function HeroFrame({ children }: Props) {
  return (
    <div className="relative isolate h-full overflow-x-clip overflow-y-visible">
      <div
        className="absolute inset-x-0 top-0 mx-auto w-full max-w-480 bg-black mask-[var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+1px)),transparent_100%)] mask-add [mask-mode:luminance,alpha] mask-size-[var(--hero-art-width)_var(--hero-art-height),100%_100%] mask-position-[center_100%,0_0] [mask-repeat:no-repeat,no-repeat] [-webkit-mask-composite:source-over] [-webkit-mask-image:var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+1px)),transparent_100%)] [-webkit-mask-position:center_100%,0_0] [-webkit-mask-repeat:no-repeat,no-repeat] [-webkit-mask-size:var(--hero-art-width)_var(--hero-art-height),100%_100%]"
        style={
          {
            '--hero-art-width': 'min(120rem, 250vw)',
            '--hero-art-height': 'calc(var(--hero-art-width) * 17 / 24)',
            '--hero-art-offset-y': 'calc(var(--hero-art-width) * 182.5 / 2400)',
            '--hero-nearest-mask-image': nearestMaskImage,
            height: 'calc(100% + var(--hero-art-offset-y))'
          } as CSSProperties
        }
      >
        <div className="relative" style={{ height: 'calc(100% - var(--hero-art-offset-y))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
