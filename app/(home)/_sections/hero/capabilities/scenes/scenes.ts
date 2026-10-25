import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { scenesConfig } from './config'

type ScenesConfig = typeof scenesConfig

const scenesSelector = '[data-hero-scene]'
const timelineDuration = 1

export function createScenesCapability({ root, config }: { root: HTMLElement; config: ScenesConfig }): HeroCapability {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(scenesSelector))
  const { finalDelay, initialDelay, transitionDuration, verticalOffset } = config
  const timingValues = [initialDelay, finalDelay, transitionDuration, verticalOffset]

  if (!timingValues.every(Number.isFinite) || timingValues.some((value) => value < 0)) {
    throw new Error('Hero scene timing values must be finite and non-negative.')
  }

  if (initialDelay + finalDelay >= timelineDuration) {
    throw new Error('Hero scene delays must leave positive global progress for the narrative.')
  }

  if (scenes.length > 1 && transitionDuration > timelineDuration / scenes.length) {
    throw new Error('Hero scene transitions must not overlap or exceed their equal scene slots.')
  }

  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: transitionDuration, ease: 'power2.inOut' }
  })
  const boundaries = scenes.slice(1).map((_, index) => (index + 1) / scenes.length)

  let previousActiveIndex = -1
  const setActiveScene = (index: number): void => {
    if (index === previousActiveIndex) return
    previousActiveIndex = index
    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === index
      scene.setAttribute('aria-hidden', String(!active))
      scene.toggleAttribute('inert', !active)
    })
  }

  boundaries.forEach((boundary, index) => {
    const transitionStart = boundary - transitionDuration / 2
    const outgoing = scenes[index]
    const incoming = scenes[index + 1]

    timeline.to(outgoing, { autoAlpha: 0, y: -verticalOffset }, transitionStart)
    timeline.fromTo(incoming, { autoAlpha: 0, y: verticalOffset }, { autoAlpha: 1, y: 0 }, transitionStart)
  })

  // Keep local narrative progress normalized to 0..1, including zero/one-scene cases.
  timeline.add(() => undefined, timelineDuration)

  const narrativeStart = initialDelay
  const narrativeEnd = timelineDuration - finalDelay
  const toLocalProgress = gsap.utils.pipe(
    gsap.utils.clamp(narrativeStart, narrativeEnd),
    gsap.utils.mapRange(narrativeStart, narrativeEnd, 0, timelineDuration)
  )

  return {
    onProgress: (progress) => {
      const localProgress = toLocalProgress(progress)
      timeline.progress(localProgress)
      if (scenes.length === 0) return

      const activeIndex = boundaries.reduce((index, boundary) => index + (localProgress >= boundary ? 1 : 0), 0)
      setActiveScene(activeIndex)
    },
    destroy: () => timeline.kill()
  }
}
