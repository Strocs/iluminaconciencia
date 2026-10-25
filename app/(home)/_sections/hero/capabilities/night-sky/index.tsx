import Image from 'next/image'
import type { CSSProperties } from 'react'
import { cn } from '@/_utils/cn'
import { nightSkyConfig } from './config'
import { nightSkyAssets } from './sky-assets'
import { skyArtworkCssVariables } from './sky-crop'

const skyPlaneClasses = cn(
  'absolute left-0 block aspect-(--sky-reference-aspect) h-auto w-[100cqw] max-w-none',
  'top-[calc((100cqh-var(--sky-wide-height-cqw))/2)]',
  '[@container(max-aspect-ratio:16/9)]:top-0 [@container(max-aspect-ratio:16/9)]:h-[100cqh] [@container(max-aspect-ratio:16/9)]:w-auto',
  '[@container(1<=aspect-ratio<=16/9)]:left-[clamp(calc(100cqw-177.7777777778cqh),calc(50cqw-var(--sky-middle-center-cqh)),0px)]',
  '[@container(aspect-ratio<1)]:left-[clamp(calc(100cqw-177.7777777778cqh),calc(50cqw-var(--sky-reference-center-cqh)),0px)]'
)

// The artwork covers the full viewport height, including on portrait screens.
const skyImageSizes = '(min-aspect-ratio: 16/9) 100vw, 177.78lvh'

export function HeroSky() {
  return (
    <div
      data-hero-sky-host
      className="@container-size pointer-events-none absolute inset-0 isolate overflow-hidden"
      style={skyArtworkCssVariables() as CSSProperties}
    >
      <div
        data-hero-sky-artwork
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: nightSkyConfig.starOpacity.initial }}
        aria-hidden="true"
      >
        <picture
          className={cn(skyPlaneClasses, 'invisible in-data-[hero-sky-photo-error=true]:hidden')}
          data-hero-sky-photo-plane
        >
          <Image
            data-hero-sky-photo
            className="absolute inset-0 block size-full max-w-none"
            src={nightSkyAssets.photo2x}
            sizes={skyImageSizes}
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            placeholder="blur"
          />
        </picture>
        <picture>
          <Image
            data-hero-sky-fallback
            src={nightSkyAssets.fallback2x}
            sizes={skyImageSizes}
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            className={cn(skyPlaneClasses, 'visible data-[hero-sky-fallback-visible=false]:invisible')}
          />
        </picture>
        <canvas
          data-hero-stars
          className="invisible absolute inset-0 size-full opacity-100 data-[hero-sky-ready=true]:visible"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
