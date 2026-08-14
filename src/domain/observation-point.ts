export const OBSERVATION_STATUS = {
  AVAILABLE: 'available',
  OUTDATED: 'outdated',
  NO_DATA: 'no-data'
} as const

export type ObservationStatus = (typeof OBSERVATION_STATUS)[keyof typeof OBSERVATION_STATUS]

export interface Coordinates {
  latitude: number
  longitude: number
}
export interface ObservationPoint {
  id: string
  name: string
  region: string
  coordinates: Coordinates
  status: ObservationStatus
  updatedAt: string | null
  everydayMeaning: string
  context: string
  indicators: ReadonlyArray<{ label: string; value: string; meaning: string }>
}

export interface MapNetwork {
  points: ReadonlyArray<ObservationPoint>
  selectedPointId?: string
}
