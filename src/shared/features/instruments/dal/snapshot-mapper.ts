import type { Instrument } from '../types'

interface SnapshotStation {
  id: string
  modelRoute: string
  name: string
  locality: string
  municipality: string | null
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

export function mapSnapshotStations(stations: SnapshotStation[]): Instrument[] {
  return stations.map((station) => {
    const instrumentCode = station.homepageSummary.instrumentCode
    const type = instrumentCode === 'W'
      ? 'TESS-W'
      : instrumentCode === '4C'
        ? 'TESS-4C'
        : null

    if (!type) throw new Error(`Unsupported instrument code: ${instrumentCode}`)

    return {
      id: station.id,
      name: station.name,
      location: station.locality,
      type,
      position: { lat: station.location.latitude, lng: station.location.longitude },
      bortleLevel: station.homepageSummary.bortleLevel,
      mag: station.homepageSummary.meanMagnitude,
      dataCount: station.homepageSummary.dataCount,
      dataPercent: station.homepageSummary.dataPercent,
      summaryPeriod: station.homepageSummary.period,
      detailUrl: station.sourceUrl,
      details: {
        altitude: null,
        weather: null,
        site: station.municipality && station.municipality !== station.locality ? station.municipality : null
      }
    }
  })
}
