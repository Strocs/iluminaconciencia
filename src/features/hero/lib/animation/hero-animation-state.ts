import type {
  HeroAnimationSnapshot,
  HeroAnimationState,
  HeroSceneState,
  NormalizedProgress
} from '../contracts/hero-runtime'
import { heroMotion } from '../../config/hero-motion'
import { toNormalizedProgress } from '../progress/normalized-progress'

function ease(value: number): number {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped < 0.5 ? 2 * clamped * clamped : 1 - (-2 * clamped + 2) ** 2 / 2
}

function transitionProgress(value: number, start: number): number {
  return (value - start) / heroMotion.scene.fadeDuration
}

function createSceneStates(count: number, progress: number): readonly HeroSceneState[] {
  const { fadeDuration, firstFadeStart, lastVisibleTarget, overlap, verticalOffset } = heroMotion.scene
  const firstFadeInStart = firstFadeStart + fadeDuration - overlap
  const lastFadeInStart = Math.max(firstFadeInStart, lastVisibleTarget - fadeDuration)
  const step = count > 2 ? (lastFadeInStart - firstFadeInStart) / (count - 2) : 0
  const states = Array.from({ length: count }, (_, index): HeroSceneState => {
    if (index === 0) {
      const value = ease(transitionProgress(progress, firstFadeStart))
      return Object.freeze({ opacity: 1 - value, y: -verticalOffset * value })
    }
    if (index === count - 1) {
      const value = ease(transitionProgress(progress, lastFadeInStart))
      return Object.freeze({ opacity: value, y: verticalOffset * (1 - value) })
    }
    const fadeInStart = firstFadeInStart + (index - 1) * step
    const fadeOutStart = firstFadeInStart + index * step - fadeDuration + overlap
    const fadeIn = ease(transitionProgress(progress, fadeInStart))
    const fadeOut = ease(transitionProgress(progress, fadeOutStart))
    return Object.freeze({
      opacity: fadeIn * (1 - fadeOut),
      y: verticalOffset * (1 - fadeIn) - verticalOffset * fadeOut
    })
  })

  return Object.freeze(states)
}

function createSnapshot(progress: NormalizedProgress, scenes: readonly HeroSceneState[]): HeroAnimationSnapshot {
  return Object.freeze({ progress, scenes })
}

export function createHeroAnimationState(sceneCount: number): HeroAnimationState {
  let snapshot = createSnapshot(toNormalizedProgress(0), createSceneStates(sceneCount, 0))

  return {
    getSnapshot: () => snapshot,
    setProgress: (value) => {
      const progress = toNormalizedProgress(value)
      snapshot = createSnapshot(progress, createSceneStates(sceneCount, progress))
      return snapshot
    }
  }
}
