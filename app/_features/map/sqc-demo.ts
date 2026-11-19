import type { MapMark } from './types'

// Ubicaciones ficticias para explorar la iconografía y el panel del mapa del home.
export const sqcDemoMarks: MapMark[] = [
  { lat: -29.96, lng: -71.34, city: 'Coquimbo' },
  { lat: -29.98, lng: -71.31, city: 'Coquimbo' },
  { lat: -30.01, lng: -71.35, city: 'Coquimbo' },
  { lat: -30.03, lng: -71.3, city: 'Coquimbo' },
  { lat: -30.05, lng: -71.33, city: 'Coquimbo' },
  { lat: -29.87, lng: -71.27, city: 'La Serena' },
  { lat: -29.89, lng: -71.23, city: 'La Serena' },
  { lat: -29.91, lng: -71.26, city: 'La Serena' },
  { lat: -29.92, lng: -71.2, city: 'La Serena' },
  { lat: -29.85, lng: -71.22, city: 'La Serena' }
].map(({ lat, lng, city }, index) => ({
  id: `sqc-demo-${index + 1}`,
  name: `SQC · ${city} · Demostración ${index + 1}`,
  instrumentType: 'SQC',
  position: { lat, lng },
  demoLocation: city as MapMark['demoLocation'],
  bortleLevel: null,
  mag: null,
  dataCount: null,
  dataPercent: null,
  summaryPeriod: null,
  detailUrl: null,
  weather: null
}))
