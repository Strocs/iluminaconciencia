import type { CSSProperties } from 'react'
import { lightPollutionConfig } from './config'

const { palette, horizon } = lightPollutionConfig

export function LightPollution() {
  return (
    <div
      data-hero-light-pollution-horizon
      className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_150%_125%_at_50%_100%,var(--horizon-color)_0%,color-mix(in_srgb,var(--horizon-color)_75%,transparent)_35%,color-mix(in_srgb,var(--horizon-color)_35%,transparent)_70%,transparent_100%)] sm:bg-[radial-gradient(ellipse_100%_120%_at_50%_96%,var(--horizon-color)_0%,color-mix(in_srgb,var(--horizon-color)_75%,transparent)_35%,color-mix(in_srgb,var(--horizon-color)_35%,transparent)_70%,transparent_100%)]"
      style={{ '--horizon-color': palette.source, opacity: horizon.initialOpacity } as CSSProperties}
      aria-hidden="true"
    />
  )
}
