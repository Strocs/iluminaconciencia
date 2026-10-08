import 'server-only'

import mockInstruments from './instruments.mock.json'
import type { MapInstrument } from './types'

interface InstrumentRecord {
  id: string
  name: string
  type: string
  position: { lat: number; lng: number }
  bortleLevel: number | null
  mag: number | null
  dataCount: number | null
  dataPercent?: number | null
  summaryPeriod?: string | null
  detailUrl?: string
  details?: { weather?: string | null }
}

/**
 * The route-local development snapshot keeps provenance plus only fields read here;
 * station dashboard charts and other unused source payload are intentionally omitted.
 */
interface SnapshotStation {
  id: string
  name: string
  sourceUrl: string
  homepageSummary: {
    instrumentCode: string
    bortleLevel: number | null
    meanMagnitude: number | null
    dataCount: number | null
    dataPercent: number | null
    period: string | null
  }
  location: { latitude: number; longitude: number }
}

interface SnapshotDocument {
  stations: SnapshotStation[]
}

function projectInstrument(instrument: InstrumentRecord): MapInstrument {
  return {
    id: instrument.id,
    name: instrument.name,
    type: instrument.type,
    position: instrument.position,
    bortleLevel: instrument.bortleLevel,
    mag: instrument.mag,
    dataCount: instrument.dataCount,
    dataPercent: instrument.dataPercent ?? null,
    summaryPeriod: instrument.summaryPeriod ?? null,
    detailUrl: instrument.detailUrl ?? null,
    weather: instrument.details?.weather ?? null
  }
}

function mapSnapshotStations(stations: SnapshotStation[]): MapInstrument[] {
  return stations.map((station) => {
    const instrumentCode = station.homepageSummary.instrumentCode
    const type = instrumentCode === 'W' ? 'TESS-W' : instrumentCode === '4C' ? 'TESS-4C' : null

    if (!type) throw new Error(`Unsupported instrument code: ${instrumentCode}`)

    return {
      id: station.id,
      name: station.name,
      type,
      position: { lat: station.location.latitude, lng: station.location.longitude },
      bortleLevel: station.homepageSummary.bortleLevel,
      mag: station.homepageSummary.meanMagnitude,
      dataCount: station.homepageSummary.dataCount,
      dataPercent: station.homepageSummary.dataPercent,
      summaryPeriod: station.homepageSummary.period,
      detailUrl: station.sourceUrl,
      weather: null
    }
  })
}

export async function loadMapInstruments(): Promise<MapInstrument[]> {
  if (process.env.NODE_ENV === 'development') {
    const { default: snapshot } = await import('./instruments.snapshot.json')
    return mapSnapshotStations((snapshot as SnapshotDocument).stations)
  }

  return (mockInstruments as InstrumentRecord[]).map(projectInstrument)
}
