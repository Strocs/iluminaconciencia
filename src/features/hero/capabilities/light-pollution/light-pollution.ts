import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { lightPollutionConfig } from './config'

type LightPollutionConfig = typeof lightPollutionConfig

const lightPollutionSelector = '[data-hero-light-pollution]'

export function createLightPollutionCapability({
  root,
  config
}: {
  root: HTMLElement
  config: LightPollutionConfig
}): HeroCapability {
  const element = root.querySelector<HTMLElement>(lightPollutionSelector)
  const timeline = gsap.timeline({ paused: true })
  if (element) {
    timeline.to(
      element,
      {
        '--cy': config.sinkCenterY,
        opacity: config.finalOpacity,
        duration: 1,
        ease: 'none'
      },
      0
    )
  }

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
