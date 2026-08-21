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
}): HeroCapability & { suspend(): void; resume(): void } {
  const classElements = Array.from(root.querySelectorAll<HTMLElement>('[data-bortle-class]'))
  const indicator = root.querySelector<HTMLElement>('[data-bortle-indicator]')
  const timeline = gsap.timeline({ paused: true })
  let activeLevel = ''
  let suspended = false

  const setLevel = (level: number): void => {
    const nextLevel = String(level)
    if (nextLevel === activeLevel) return

    activeLevel = nextLevel
    classElements.forEach((element) => {
      const active = element.dataset.bortleClass === nextLevel
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
    onProgress: (progress) => {
      if (suspended) return
      timeline.progress(progress)
    },
    suspend() {
      if (suspended) return
      timeline.pause()
      suspended = true
    },
    resume() {
      if (!suspended) return
      // Do NOT call timeline.resume() — the timeline is always externally
      // controlled via onProgress → timeline.progress(p). GSAP resume() would
      // start autonomous playback, advancing levels without scroll input.
      suspended = false
    },
    destroy: () => timeline.kill()
  }
}
