import { nightSkyConfig } from './config'

export function HeroSky() {
  return (
    <div data-hero-sky-host className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        data-hero-sky-fallback
        data-fallback-src={nightSkyConfig.fallbackImagePath}
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
