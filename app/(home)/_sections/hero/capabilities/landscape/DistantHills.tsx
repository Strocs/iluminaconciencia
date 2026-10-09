import type { CSSProperties } from 'react'
import { landscapeConfig } from './config'
import { hillPaths } from './svg-path'

const hill = hillPaths.distant

export function DistantHills() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-10"
      style={
        {
          '--hill-scale': 1,
          '--hill-offset-x': '0px',
          '--hill-offset-y': '0px',
          width: 'var(--hero-art-width)',
          height: 'var(--hero-art-height)',
          transform:
            'translate(calc(-50% + var(--hill-offset-x)), calc(var(--hill-offset-y) + var(--hero-art-offset-y))) scale(var(--hill-scale))',
          transformOrigin: 'bottom center'
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 1920 1360" preserveAspectRatio="xMidYMax meet" className="size-full" aria-hidden="true">
        <path
          transform="scale(0.8)"
          data-hero-landscape-distant
          fill={landscapeConfig.initialFill.distant}
          opacity={landscapeConfig.initialOpacity.distant}
          d={hill.d}
        />
      </svg>
    </div>
  )
}
