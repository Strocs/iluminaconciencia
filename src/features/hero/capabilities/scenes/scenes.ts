import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { scenesConfig } from './config'

type ScenesConfig = typeof scenesConfig

const scenesSelector = '[data-hero-scene]'

export function createScenesCapability({ root, config }: { root: HTMLElement; config: ScenesConfig }): HeroCapability {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(scenesSelector))
  const timeline = gsap.timeline({ paused: true })

  if (scenes.length > 0) {
    const { fadeDuration, firstFadeStart, lastVisibleTarget, overlap, verticalOffset } = config
    const count = scenes.length
    const firstFadeInStart = firstFadeStart + fadeDuration - overlap
    const lastFadeInStart = Math.max(firstFadeInStart, lastVisibleTarget - fadeDuration)
    const step = count > 2 ? (lastFadeInStart - firstFadeInStart) / (count - 2) : 0

    const setActiveScene = (index: number): void => {
      scenes.forEach((scene, sceneIndex) => {
        const active = sceneIndex === index
        scene.setAttribute('aria-hidden', String(!active))
        scene.toggleAttribute('inert', !active)
      })
    }

    scenes.forEach((scene, index) => {
      if (index === 0) {
        timeline.to(
          scene,
          { autoAlpha: 0, y: -verticalOffset, duration: fadeDuration, ease: 'power2.inOut' },
          firstFadeStart
        )
      } else if (index === count - 1) {
        timeline.add(() => setActiveScene(index), lastFadeInStart)
        timeline.fromTo(
          scene,
          { autoAlpha: 0, y: verticalOffset },
          { autoAlpha: 1, y: 0, duration: fadeDuration, ease: 'power2.inOut' },
          lastFadeInStart
        )
      } else {
        const fadeInStart = firstFadeInStart + (index - 1) * step
        const fadeOutStart = firstFadeInStart + index * step - fadeDuration + overlap
        timeline.add(() => setActiveScene(index), fadeInStart)
        timeline.fromTo(
          scene,
          { autoAlpha: 0, y: verticalOffset },
          { autoAlpha: 1, y: 0, duration: fadeDuration, ease: 'power2.inOut' },
          fadeInStart
        )
        timeline.to(
          scene,
          { autoAlpha: 0, y: -verticalOffset, duration: fadeDuration, ease: 'power2.inOut' },
          fadeOutStart
        )
      }
    })

    // Keep the timeline duration at 1 so timeline.progress(p) maps p onto the same 0..1 space as the config positions.
    timeline.add(() => undefined, 1)
  }

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
