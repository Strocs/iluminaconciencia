import 'server-only'
import snapshot from './points/instruments.snapshot.jsonn'
import { Point } from '../types'

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

function mapSnapshotStations(stations: SnapshotStation[]): Point[] {
  return stations.map((station) => {
    const instrumentCode = station.homepageSummary.instrumentCode
    const type = instrumentCode === 'W' ? 'TESS-W' : instrumentCode === '4C' ? 'TESS-4C' : null

    if (!type) throw new Error(`Unsupported instrument code: ${instrumentCode}`)

    return {
      id: station.id,
      name: station.name,
      instrumentType: type,
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

export async function getPoints(): Promise<Point[]> {
  return mapSnapshotStations((snapshot as SnapshotDocument).stations)
}
