import { bortleClasses, type BortleClass } from './bortle-classes'

export function getBortleClass(level: number | null | undefined): BortleClass | undefined {
  if (level === null || level === undefined) return undefined

  return bortleClasses.find((bortleClass) => bortleClass.level === level)
}
