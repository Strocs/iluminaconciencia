import type { NormalizedProgress } from '../contracts/hero-runtime'
import { bortleClasses } from '../../data/bortle-classes'

export function mapProgressToBortle(progress: NormalizedProgress): number {
  const index = Math.min(bortleClasses.length - 1, Math.floor(progress * bortleClasses.length))
  return bortleClasses[index].level
}
