import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import { heroMapTransitionConfig } from './config'

type HeroMapTransitionConfig = typeof heroMapTransitionConfig

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function clampHeroProgress(progress: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0))
}

export function createHeroMapTransitionCapability({
  root,
  config = heroMapTransitionConfig
}: {
  root: HTMLElement
  config?: HeroMapTransitionConfig
}): HeroCapability {
  const layer = root.querySelector<HTMLElement>('[data-hero-map-transition]')
  if (!layer) {
    return {
      onProgress: () => undefined,
      destroy: () => undefined
    }
  }

  const reducedMotion = window.matchMedia(reducedMotionQuery).matches
  const timeline = gsap.timeline({ paused: true })

  gsap.set(layer, { yPercent: config.movementStart })
  timeline.fromTo(
    layer,
    { yPercent: config.movementStart },
    {
      yPercent: config.movementEnd,
      duration: config.endProgress - config.startProgress,
      ease: 'none'
    },
    config.startProgress
  )
  timeline.add(() => undefined, config.endProgress)

  return {
    onProgress: (progress) => {
      const normalizedProgress = clampHeroProgress(progress)
      if (reducedMotion) {
        gsap.set(layer, {
          yPercent: normalizedProgress >= config.startProgress ? config.movementEnd : config.movementStart
        })
        return
      }
      timeline.progress(normalizedProgress)
    },
    destroy: () => {
      timeline.kill()
      gsap.set(layer, { clearProps: 'transform' })
    }
  }
}
