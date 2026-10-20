import type { CSSProperties } from 'react'
import { cn } from '@/_utils/cn'
import styles from './sky-artwork.module.css'
import { nightSkyAssets } from './sky-assets'
import { skyArtworkCssVariables } from './sky-crop'

export function HeroSky() {
  return (
    <div data-hero-sky-host className={cn(styles.host, 'pointer-events-none absolute inset-0')} style={skyArtworkCssVariables() as CSSProperties}>
      <div data-hero-sky-artwork className={styles.artwork} aria-hidden="true">
        <picture className={styles.photoPlane} data-hero-sky-photo-plane>
          <source media="(min-resolution: 1.01dppx)" srcSet={nightSkyAssets.photo2x} />
          <img
            data-hero-sky-photo
            src={nightSkyAssets.photo1x}
            width={nightSkyAssets.width}
            height={nightSkyAssets.height}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <img
          data-hero-sky-fallback
          src={nightSkyAssets.catalogStars}
          width={nightSkyAssets.width}
          height={nightSkyAssets.height}
          alt=""
          aria-hidden="true"
          className={styles.catalogStars}
        />
        <canvas data-hero-stars className={styles.canvas} aria-hidden="true" />
      </div>
    </div>
  )
}
