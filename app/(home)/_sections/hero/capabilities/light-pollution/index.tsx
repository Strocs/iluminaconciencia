import type { CSSProperties } from 'react'
import { lightPollutionConfig } from './config'

const { palette, horizon } = lightPollutionConfig

export function LightPollution() {
  return (
    <div
      data-hero-light-pollution-horizon
      className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[linear-gradient(to_top,var(--horizon-color)_0%,transparent_100%)]"
      style={{ '--horizon-color': palette.source, opacity: horizon.initialOpacity } as CSSProperties}
      aria-hidden="true"
    />
  )
}
