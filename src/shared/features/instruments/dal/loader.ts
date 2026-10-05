import mockRaw from './instruments.mock.json?raw'
import type { Instrument } from '../types'
import { mapSnapshotStations } from './snapshot-mapper'

/**
 * Loads compact development snapshot data locally and retains the bundled mock elsewhere.
 */
export async function loadInstruments(): Promise<Instrument[]> {
  if (import.meta.env.DEV) {
    const { default: snapshot } = await import('../../../../../tmp/mocks/iluminaconciencia-snapshot.json')
    return mapSnapshotStations(snapshot.stations)
  }

  return JSON.parse(mockRaw) as Instrument[]
}
