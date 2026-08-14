import type { NightSkyScene, NormalizedProgress } from '../contracts/hero-runtime'
import { toNormalizedProgress } from '../progress/normalized-progress'

export function createNightSkyScene(
  progress: NormalizedProgress,
  reducedMotion: boolean,
  animationTime: number
): NightSkyScene {
  const staticProgress = reducedMotion ? toNormalizedProgress(0) : progress

  return {
    progress: staticProgress,
    starVisibility: 1,
    lightPollution: 1 - staticProgress,
    animationTime: reducedMotion ? 0 : animationTime
  }
}
