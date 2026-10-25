import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { lightPollutionConfig } from './config'

type LightPollutionConfig = typeof lightPollutionConfig

const pollutionSelector = '[data-hero-light-pollution-horizon], [data-hero-light-pollution-backlight]'

export function createLightPollutionCapability({
  root,
  config,
  selector = pollutionSelector
}: {
  root: HTMLElement
  config: LightPollutionConfig
  selector?: string
}): HeroCapability {
  const layers = root.querySelectorAll<HTMLElement>(selector)
  const timeline = gsap.timeline({ paused: true })

  if (layers.length) {
    timeline.fromTo(
      layers,
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
