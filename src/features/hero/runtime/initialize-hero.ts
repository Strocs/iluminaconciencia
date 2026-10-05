import { gsap } from 'gsap'
import type { HeroCapability, HeroLifecycle } from '../core/contracts'
import { createScrollTimeline } from '../core/scroll-timeline'
import { createScenesCapability } from '../capabilities/scenes/scenes'
import { scenesConfig } from '../capabilities/scenes/config'
import { createLightPollutionCapability } from '../capabilities/light-pollution/light-pollution'
import { lightPollutionConfig } from '../capabilities/light-pollution/config'
import { createBortleCapability } from '../capabilities/bortle-scale/bortle'
import { bortleClasses } from '@shared/features/bortle'
import { bortleConfig } from '../capabilities/bortle-scale/config'
import { createNightSkyCapability } from '../capabilities/night-sky/night-sky'
import { nightSkyConfig } from '../capabilities/night-sky/config'
import { createHeroMapTransitionCapability } from '../capabilities/hero-map-transition/hero-map-transition'
import { heroMapTransitionConfig } from '../capabilities/hero-map-transition/config'

const initializedHeroes = new WeakMap<HTMLElement, HeroLifecycle>()

const MOTION_QUERIES = {
  normal: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)'
} as const

function composeHero(root: HTMLElement): HeroLifecycle {
  const scenes = createScenesCapability({ root, config: scenesConfig })
  const lightPollution = createLightPollutionCapability({ root, config: lightPollutionConfig })
  const nightSky = createNightSkyCapability({ root, config: nightSkyConfig })
  const heroMapTransition = createHeroMapTransitionCapability({ root, config: heroMapTransitionConfig })

  const bortleCapability: HeroCapability = createBortleCapability({
    root,
    classes: bortleClasses,
    config: bortleConfig
  })

  const capabilities: readonly HeroCapability[] = nightSky
    ? [scenes, lightPollution, bortleCapability, nightSky, heroMapTransition]
    : [scenes, lightPollution, bortleCapability, heroMapTransition]
  const matchMedia = gsap.matchMedia(root)

  matchMedia.add(MOTION_QUERIES.normal, () => {
    const scrollTimeline = createScrollTimeline({
      root,
      capabilities,
      onEnter: () => nightSky?.start(),
      onEnterBack: () => nightSky?.start(),
      onLeave: () => nightSky?.stop()
    })
    nightSky?.start()
    return () => {
      scrollTimeline.destroy()
      nightSky?.stop()
    }
  })
  matchMedia.add(MOTION_QUERIES.reduced, () => {
    capabilities.forEach((capability) => capability.onProgress(0))
  })

  return {
    destroy: () => {
      matchMedia.revert()
      capabilities.forEach((capability) => capability.destroy())
    }
  }
}

export function initializeHero(root: HTMLElement): HeroLifecycle {
  const existing = initializedHeroes.get(root)
  if (existing) return existing

  const lifecycle = composeHero(root)
  initializedHeroes.set(root, lifecycle)
  return lifecycle
}
