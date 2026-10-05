import type { Instrument } from '@shared/features/instruments'
import { toBortleSegmentLevel } from '@shared/features/bortle'

/**
 * Keeps only the instruments whose type is in the given set.
 * The set comes from the data itself (open InstrumentType), so
 * new instrument types appear as filter options automatically.
 */
export function filterByType(
  instruments: readonly Instrument[],
  types: ReadonlySet<string>
): Instrument[] {
  return instruments.filter((instrument) => types.has(instrument.type))
}

/**
 * Keeps only the instruments whose Bortle level is in the given set.
 * Instruments without a measurement (bortleLevel null) never match.
 * An empty set yields no instruments.
 */
export function filterByBortle(
  instruments: readonly Instrument[],
  levels: ReadonlySet<number>
): Instrument[] {
  return instruments.filter(
    (instrument) =>
      instrument.bortleLevel !== null && levels.has(toBortleSegmentLevel(instrument.bortleLevel))
  )
}
