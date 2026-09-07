import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { BortleClass } from '@shared/features/bortle'
import type { bortleConfig } from './config'

type BortleConfig = typeof bortleConfig

export function createBortleCapability({
  root,
  classes,
  config
}: {
  root: HTMLElement
  classes: readonly BortleClass[]
  config: BortleConfig
}): HeroCapability {
  const classElements = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-bortle-class]'))
  const indicator = root.querySelector<HTMLElement>('[data-hero-bortle-indicator]')
  const timeline = gsap.timeline({ paused: true })
  let activeLevel = ''

  const setLevel = (level: number): void => {
    const nextLevel = String(level)
    if (nextLevel === activeLevel) return

    activeLevel = nextLevel
    classElements.forEach((element) => {
      const active = element.dataset.heroBortleClass === nextLevel
      element.toggleAttribute('aria-current', active)
      element.toggleAttribute('data-active', active)
      if (active && indicator) indicator.style.backgroundColor = element.style.backgroundColor
    })
  }

  // One callback per class, evenly spaced between 0 and config.endProgress —
  // the discrete mapping becomes implicit in the positions.
  classes.forEach((bortleClass, index) => {
    const position = (index / (classes.length - 1)) * config.endProgress
    timeline.add(() => setLevel(bortleClass.level), position)
  })
  // Keep the timeline duration at 1 so timeline.progress(p) maps p onto the same 0..1 space as the positions.
  timeline.add(() => undefined, 1)

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
