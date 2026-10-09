export interface Point {
  id: string
  name: string
  instrumentType: string
  position: {
    lat: number
    lng: number
  }
  bortleLevel: number | null
  mag: number | null
  dataCount: number | null
  dataPercent: number | null
  summaryPeriod: string | null
  detailUrl: string | null
  weather: string | null
}
