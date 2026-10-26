import { gsap } from 'gsap'
import { bortleClasses } from '@/_features/bortle/bortle-classes'
import { createBortleCapability } from '../capabilities/bortle-scale/bortle'
import { bortleConfig } from '../capabilities/bortle-scale/config'
import { createHeroMapTransitionCapability } from '../capabilities/hero-map-transition/hero-map-transition'
import { heroMapTransitionConfig } from '../capabilities/hero-map-transition/config'
import { createLightPollutionCapability } from '../capabilities/light-pollution/light-pollution'
import { lightPollutionConfig } from '../capabilities/light-pollution/config'
import { createStarBadgesCapability } from '../capabilities/night-sky/star-badges'
import { createScenesCapability } from '../capabilities/scenes/scenes'
import { scenesConfig } from '../capabilities/scenes/config'
import type { HeroCapability, HeroLifecycle } from '../core/contracts'
import type { HeroSkyCapability } from '../capabilities/night-sky/contracts'
import { createScrollTimeline } from '../core/scroll-timeline'

const MOTION_QUERIES = {
  normal: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)'
} as const

function composeHero(root: HTMLElement, sky?: HeroSkyCapability | null): HeroLifecycle {
  const sceneAttributes = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-scene]'), (scene) => ({
    scene,
    ariaHidden: scene.getAttribute('aria-hidden'),
    inert: scene.hasAttribute('inert')
  }))
  const horizonTiming = lightPollutionConfig.horizon
  const starBadges = createStarBadgesCapability(root)
  const capabilities: readonly HeroCapability[] = [
    createScenesCapability({ root, config: scenesConfig }),
    createLightPollutionCapability({
      root,
      config: { ...lightPollutionConfig, horizon: horizonTiming },
      selector: '[data-hero-light-pollution-horizon]'
    }),
    createLightPollutionCapability({
      root,
      config: { ...lightPollutionConfig, horizon: horizonTiming },
      selector: '[data-hero-light-pollution-backlight]'
    }),
    createBortleCapability({ root, classes: bortleClasses, config: bortleConfig }),
    ...(sky ? [sky] : []),
    ...(starBadges ? [starBadges] : []),
    createHeroMapTransitionCapability({ root, config: heroMapTransitionConfig })
  ]
  const startSky = (): void => {
    sky?.start()
  }
  const stopSky = (): void => {
    sky?.stop()
  }
  const matchMedia = gsap.matchMedia(root)

  matchMedia.add(MOTION_QUERIES.normal, () => {
    const scrollTimeline = createScrollTimeline({
      root,
      capabilities,
      onEnter: startSky,
      onEnterBack: startSky,
      onLeave: stopSky,
      onLeaveBack: stopSky
    })
    startSky()
    return () => {
      scrollTimeline.destroy()
      stopSky()
    }
  })
  matchMedia.add(MOTION_QUERIES.reduced, () => {
    capabilities.forEach((capability) => capability.onProgress(0))
  })

  let destroyed = false
  return {
    destroy: () => {
      if (destroyed) return
      destroyed = true
      matchMedia.revert()
      capabilities.forEach((capability) => capability.destroy())
      sceneAttributes.forEach(({ scene, ariaHidden, inert }) => {
        if (ariaHidden === null) scene.removeAttribute('aria-hidden')
        else scene.setAttribute('aria-hidden', ariaHidden)
        scene.toggleAttribute('inert', inert)
      })
    }
  }
}

export function initializeHero(root: HTMLElement, sky?: HeroSkyCapability | null): HeroLifecycle {
  return composeHero(root, sky)
}
