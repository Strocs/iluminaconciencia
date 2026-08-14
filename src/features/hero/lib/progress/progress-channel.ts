import type { ProgressChannel, ProgressListener } from '../contracts/hero-runtime'
import { toNormalizedProgress } from './normalized-progress'

export function createProgressChannel(): ProgressChannel {
  let progress = toNormalizedProgress(0)
  const listeners = new Set<ProgressListener>()

  return {
    get: () => progress,
    set: (value: number) => {
      const nextProgress = toNormalizedProgress(value)
      if (nextProgress === progress) return

      progress = nextProgress
      listeners.forEach((listener) => listener(progress))
    },
    subscribe: (listener: ProgressListener) => {
      listeners.add(listener)
      listener(progress)
      return () => listeners.delete(listener)
    }
  }
}
