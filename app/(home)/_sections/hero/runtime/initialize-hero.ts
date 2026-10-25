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

type DebugFeature = 'night-sky' | 'pollution' | 'backlight' | 'bortle'

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
  const debugEnabled = { 'night-sky': true, pollution: true, backlight: true, bortle: true }
  const debugCapabilities: Record<DebugFeature, HeroCapability[]> = {
    pollution: [
      createLightPollutionCapability({
        root,
        config: { ...lightPollutionConfig, horizon: horizonTiming },
        selector: '[data-hero-light-pollution-horizon]'
      })
    ],
    backlight: [
      createLightPollutionCapability({
        root,
        config: { ...lightPollutionConfig, horizon: horizonTiming },
        selector: '[data-hero-light-pollution-backlight]'
      })
    ],
    bortle: [createBortleCapability({ root, classes: bortleClasses, config: bortleConfig })],
    'night-sky': [...(sky ? [sky] : []), ...(starBadges ? [starBadges] : [])]
  }
  let currentProgress = 0
  let skyActive = false
  let twinkleEnabled = true
  const conditional = (feature: DebugFeature, capability: HeroCapability): HeroCapability => ({
    onProgress: (progress) => {
      currentProgress = progress
      if (debugEnabled[feature]) capability.onProgress(progress)
    },
    destroy: () => capability.destroy()
  })
  const capabilities: readonly HeroCapability[] = [
    createScenesCapability({ root, config: scenesConfig }),
    ...debugCapabilities.pollution.map((capability) => conditional('pollution', capability)),
    ...debugCapabilities.backlight.map((capability) => conditional('backlight', capability)),
    ...debugCapabilities.bortle.map((capability) => conditional('bortle', capability)),
    ...debugCapabilities['night-sky'].map((capability) => conditional('night-sky', capability)),
    createHeroMapTransitionCapability({ root, config: heroMapTransitionConfig })
  ]
  const startSky = (): void => {
    skyActive = true
    if (debugEnabled['night-sky'] && twinkleEnabled) sky?.start()
  }
  const stopSky = (): void => {
    skyActive = false
    sky?.stop()
  }
  const onDebugChange = (event: Event): void => {
    const control = event.target
    if (!(control instanceof HTMLInputElement)) return
    const feature = control.dataset.heroDebug
    if (feature === 'twinkle') {
      twinkleEnabled = control.checked
      if (twinkleEnabled && debugEnabled['night-sky'] && skyActive) sky?.start()
      else sky?.stop()
      return
    }
    if (feature !== 'night-sky' && feature !== 'pollution' && feature !== 'backlight' && feature !== 'bortle') return
    debugEnabled[feature] = control.checked
    root.toggleAttribute(`data-debug-${feature}-disabled`, !control.checked)
    if (control.checked) debugCapabilities[feature].forEach((capability) => capability.onProgress(currentProgress))
    if (feature === 'night-sky') {
      if (control.checked && twinkleEnabled && skyActive) sky?.start()
      else sky?.stop()
    }
  }
  root.addEventListener('change', onDebugChange)
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
      root.removeEventListener('change', onDebugChange)
      matchMedia.revert()
      capabilities.forEach((capability) => capability.destroy())
      for (const feature of Object.keys(debugEnabled)) root.removeAttribute(`data-debug-${feature}-disabled`)
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
