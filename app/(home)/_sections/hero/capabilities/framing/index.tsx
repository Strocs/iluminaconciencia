import type { CSSProperties, ReactNode } from 'react'
import { frontalSilhouette, frontalSilhouetteGeometry, landscapeStyle } from '../../landscape'

const nearest = frontalSilhouette
const { viewBoxWidth, viewBoxHeight, translateY } = frontalSilhouetteGeometry
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"><rect width="${viewBoxWidth}" height="${viewBoxHeight}" fill="white"/><path d="${nearest.d}" fill="${nearest.fill}" transform="translate(0 ${translateY})"/></svg>`
const nearestMaskImage = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`
const maskClasses =
  'absolute inset-x-0 top-0 mx-auto size-full max-w-480 mask-[var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] mask-add [mask-mode:luminance,alpha] mask-size-[var(--hero-art-width)_var(--hero-art-height),100%_100%] mask-[center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [mask-repeat:no-repeat,no-repeat] [-webkit-mask-composite:source-over] [-webkit-mask-image:var(--hero-nearest-mask-image),linear-gradient(to_bottom,white_0,white_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_max(0px,calc(100%-var(--hero-art-height)+var(--hero-nearest-mask-offset-y)+1px)),transparent_100%)] [-webkit-mask-position:center_calc(100%+var(--hero-nearest-mask-offset-y)),0_0] [-webkit-mask-repeat:no-repeat,no-repeat] [-webkit-mask-size:var(--hero-art-width)_var(--hero-art-height),100%_100%]'
// These are unconditional classes. Do not merge: mask image/position are ambiguous to tailwind-merge.
const backgroundClasses = [maskClasses, 'bg-black'].join(' ')
const contentClasses = [maskClasses, 'z-2'].join(' ')
const maskStyle = { '--hero-nearest-mask-image': nearestMaskImage } as CSSProperties
const viewportClasses =
  'relative h-full group-data-[frame-fixed=true]/hero:motion-safe:fixed group-data-[frame-fixed=true]/hero:motion-safe:inset-x-0 group-data-[frame-fixed=true]/hero:motion-safe:top-0 group-data-[frame-fixed=true]/hero:motion-safe:mx-auto group-data-[frame-fixed=true]/hero:motion-safe:h-lvh group-data-[frame-fixed=true]/hero:motion-safe:w-full group-data-[frame-fixed=true]/hero:motion-safe:max-w-480'

type Props = { children: ReactNode; background?: ReactNode; overlay?: ReactNode; atmosphere?: ReactNode }

export function HeroFrame({ children, background, overlay, atmosphere }: Props) {
  return (
    <div className="relative isolate h-full overflow-x-clip overflow-y-visible" style={landscapeStyle}>
      <div className={backgroundClasses} style={maskStyle}>
        <div className={viewportClasses}>{background}</div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1 mx-auto size-full max-w-480">
        {overlay}
        {/* This plane follows the mask, not the viewport that can become fixed. */}
        <div
          data-hero-terrain-plane
          aria-hidden="true"
          className="invisible absolute -bottom-(--hero-nearest-mask-offset-y) left-1/2 h-(--hero-art-height) w-(--hero-art-width) -translate-x-1/2"
        />
        <div className={viewportClasses}>{atmosphere}</div>
      </div>
      {/* Same mask and fixed positioning as before; text stays above the unmasked rim. */}
      <div className={contentClasses} style={maskStyle}>
        <div className={viewportClasses}>{children}</div>
      </div>
    </div>
  )
}
