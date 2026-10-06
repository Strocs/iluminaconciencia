import type { CSSProperties } from 'react'
import { hillPaths } from './svg-path'

const hill = hillPaths.middle

export function MiddleHills() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-20"
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
      <svg viewBox="0 0 2400 1700" preserveAspectRatio="xMidYMax meet" className="size-full" aria-hidden="true">
        <path d={hill.d} className="fill-neutral-950" />
      </svg>
    </div>
  )
}
