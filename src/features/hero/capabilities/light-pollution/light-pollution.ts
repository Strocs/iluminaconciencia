import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { lightPollutionConfig } from './config'

type LightPollutionConfig = typeof lightPollutionConfig

const horizonSelector = '[data-hero-light-pollution-horizon]'

export function createLightPollutionCapability({
  root,
  config
}: {
  root: HTMLElement
  config: LightPollutionConfig
}): HeroCapability {
  const horizon = root.querySelector<HTMLElement>(horizonSelector)
  const timeline = gsap.timeline({ paused: true })

  if (horizon) {
    timeline.fromTo(
      horizon,
      { opacity: config.horizon.initialOpacity },
      {
        opacity: 0,
        duration: config.horizon.endProgress - config.horizon.startProgress,
        ease: 'none',
        immediateRender: false
      },
      config.horizon.startProgress
    )
  }

  // Keep timeline.progress(p) aligned with the shared normalized 0..1 hero progress.
  timeline.add(() => undefined, 1)

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
