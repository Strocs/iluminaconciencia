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
        duration: config.endProgress - config.startProgress,
        ease: 'none'
      },
      config.startProgress
    )
    // Keep the timeline duration at 1 so timeline.progress(p) maps p onto the same 0..1 space as the tween.
    timeline.add(() => undefined, 1)
  }

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
