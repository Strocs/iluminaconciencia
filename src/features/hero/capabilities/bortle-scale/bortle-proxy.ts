import type { HeroCapability } from '../../core/contracts'
import { getBortleBarController } from '@shared/features/bortle/bar-controller'

export function createBortleProxy(): HeroCapability {
  let destroyed = false

  return {
    onProgress: (progress: number) => {
      if (destroyed) return
      getBortleBarController().updateHeroProgress(progress)
    },
    destroy: () => {
      destroyed = true
      // The controller owns the hero behavior lifecycle.
      // The proxy only stops forwarding; it does not destroy the hero behavior.
    }
  }
}
