import { namedStars } from './named-stars'

/** One label may highlight several independently rendered catalogue records. */
export const starBadgeTargets = [
  ...namedStars.map(({ sourceIndex, name }) => ({ id: String(sourceIndex), name, sourceIndices: [sourceIndex] })),
  {
    id: 'pleiades',
    name: 'Pléyades',
    // Eight named bright members, 18 Tauri and HD 23753; not unrelated nearby stars.
    sourceIndices: [293, 295, 297, 299, 302, 308, 311, 317, 323, 324]
  }
] as const
