import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import { landscapeConfig } from './config'

const distantSelector = '[data-hero-landscape-distant]'
const middleSelector = '[data-hero-landscape-middle]'

interface LandscapeTiming {
  startProgress: number
  endProgress: number
}

export function createLandscapeCapability({
  root,
  timing
}: {
  root: HTMLElement
  timing: LandscapeTiming
}): HeroCapability {
  const timeline = gsap.timeline({ paused: true })
  const hills = root.querySelectorAll<SVGPathElement>(`${distantSelector}, ${middleSelector}`)

  hills.forEach((hill) => {
    const endFill = hill.matches(distantSelector) ? landscapeConfig.endFill.distant : landscapeConfig.endFill.middle

    timeline.to(
      hill,
      {
        attr: { fill: endFill, opacity: 1 },
        duration: timing.endProgress - timing.startProgress,
        ease: 'none'
      },
      timing.startProgress
    )
  })

  // Keep timeline.progress(p) aligned with the shared normalized 0..1 hero progress.
  timeline.add(() => undefined, 1)
  timeline.progress(0)

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
