import { frontalSilhouette, frontalSilhouetteGeometry, landscapeStyle } from '../../landscape'
import { starBadgeTargets } from './star-badge-targets'

export function StarBadges() {
  return (
    <div
      data-hero-star-badges
      className="@container-size pointer-events-none fixed top-0 left-0 z-110 overflow-hidden"
      style={{ ...landscapeStyle, opacity: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${frontalSilhouetteGeometry.viewBoxWidth} ${frontalSilhouetteGeometry.viewBoxHeight}`}
        className="invisible absolute bottom-[calc(0px-var(--hero-nearest-mask-offset-y))] left-1/2 h-(--hero-art-height) w-(--hero-art-width) max-w-none -translate-x-1/2"
      >
        <path
          data-star-terrain
          d={frontalSilhouette.d}
          transform={`translate(0 ${frontalSilhouetteGeometry.translateY})`}
        />
      </svg>
      {starBadgeTargets.map(({ id, name }) => (
        <div
          key={id}
          data-hero-star-badge={id}
          className="invisible absolute top-0 left-0 size-0 data-[visible=true]:visible"
        >
          <span
            data-star-ring={id}
            className="absolute top-0 left-0 -translate-1/2 rounded-full border border-primary/60"
          />
          <span
            data-star-name
            className="absolute top-0 left-0 block w-max max-w-[calc(100cqw-1rem)] truncate rounded-full border border-foreground/20 bg-background/65 px-2 py-1 font-body text-xs/4 text-foreground"
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}
