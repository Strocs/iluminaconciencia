import type { HeroCapability } from '../../core/contracts'

export interface HeroSkyCapability extends HeroCapability {
  start(): void
  stop(): void
}
