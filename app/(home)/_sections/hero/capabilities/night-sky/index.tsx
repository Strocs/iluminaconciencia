import Image from 'next/image'
import { nightSkyConfig } from './config'

export function HeroSky() {
  return (
    <div data-hero-sky-host className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* The night-sky runtime owns the real artwork URL and fallback visibility. */}
      <Image
        data-hero-sky-fallback
        data-fallback-src={nightSkyConfig.fallbackImagePath}
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3C/svg%3E"
        width={1600}
        height={900}
        unoptimized
        className="absolute inset-0 size-full object-cover"
        alt=""
        aria-hidden="true"
        hidden
      />
      <canvas
        data-hero-stars
        style={{ opacity: nightSkyConfig.starOpacity.initial }}
        className="absolute inset-0 size-full"
        aria-hidden="true"
      />
    </div>
  )
}
