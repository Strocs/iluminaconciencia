import { bortleClasses, type BortleClass } from './bortle-classes'

export function toBortleSegmentLevel(level: number): number {
  return level
}

export function getBortleClass(level: number | null | undefined): BortleClass | undefined {
  if (level === null || level === undefined) return undefined

  const segmentLevel = toBortleSegmentLevel(level)
  return bortleClasses.find((bortleClass) => bortleClass.level === segmentLevel)
}
