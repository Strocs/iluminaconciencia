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
      <p className={cn(styles.credit, 'pointer-events-auto')}>
        Fotografía: <a href="https://www.hq.eso.org/public/images/eso0932a/">ESO/S. Brunier</a>,{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Adaptación: reproyección y reconstrucción inferida selectiva.
      </p>
    </div>
  )
}
