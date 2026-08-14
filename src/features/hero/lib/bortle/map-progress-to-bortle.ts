import { bortleClasses } from '../../data/bortle-classes'

export function mapProgressToBortle(progress: number): number {
  const normalizedProgress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  const index = Math.min(bortleClasses.length - 1, Math.floor(normalizedProgress * bortleClasses.length))
  return bortleClasses[index].level
}
