import 'server-only'
import type { MapMark } from './types'

export const groupPreviewMarks: MapMark[] = [
  {
    id: 'map-preview-tess-4c',
    name: 'Estación Sureste · TESS-4C',
    instrumentType: 'TESS-4C',
    position: { lat: -30.29, lng: -70.39 },
    bortleLevel: 4,
    mag: 21.1,
    dataCount: 8500,
    dataPercent: 94.44,
    summaryPeriod: 'Aug 2026',
    detailUrl: null,
    detailHref: null,
    weather: 'Cielo despejado'
  },
  {
    id: 'map-preview-tess-w',
    name: 'Estación Sureste · TESS-W',
    instrumentType: 'TESS-W',
    position: { lat: -30.29, lng: -70.39 },
    bortleLevel: 3,
    mag: 21.4,
    dataCount: 8700,
    dataPercent: 96.67,
    summaryPeriod: 'Aug 2026',
    detailUrl: null,
    detailHref: null,
    weather: 'Cielo despejado'
  },
  {
    id: 'map-preview-sqc',
    name: 'Estación Sureste · SQC',
    instrumentType: 'SQC',
    position: { lat: -30.29, lng: -70.39 },
    bortleLevel: null,
    mag: null,
    dataCount: null,
    dataPercent: null,
    summaryPeriod: null,
    detailUrl: null,
    detailHref: null,
    weather: null
  }
]
